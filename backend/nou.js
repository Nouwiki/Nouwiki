var path = require('path');
var Promise = require('bluebird');
var fs = require('fs-extra');
fs.readFile = Promise.promisify(fs.readFile);
var toml = require('toml');
var koa = require('koa');
var cors = require('koa-cors');
var staticDir = require('koa-static');
var mount = require('koa-mount');
var router = require('koa-router')();
var forwardRequest = require('koa-forward-request');
var app;
var NouApp = koa();

var request = require('request-promise');

var markdownit = require('markdown-it');
var matter = require('gray-matter');
var doT = require('dot');
doT.templateSettings.strip = false;

var helpers = require('./helpers');
var content = require('./content.js');

var root;
var conf;
var api = {};
var parser;
var nouTOMLPath;

function* serve(a, toml_path) {
	app = a;
  nouTOMLPath = toml_path;
  yield loadTOML(toml_path);
  yield loadParsers();
  yield loadTemplates();
  yield nou();
}

function* loadTOML(toml_path) {
  var toml_string = yield helpers.getFile(toml_path);
  var rootConf = toml.parse(toml_string);
  root = toml_path.substring(0, toml_path.lastIndexOf("/"));

  var isFS = {};
  isFS.parser = !helpers.isHTTP(rootConf.parser);
  isFS.markupBody = !helpers.isHTTP(rootConf.markupBody);
  isFS.nouwiki = !helpers.isHTTP(rootConf.nouwiki);
  isFS.template = !helpers.isHTTP(rootConf.template);
  conf = conf || {};
  conf.nou = rootConf;
  conf.nou.root = root;
  conf.nou.isFS = isFS;
  helpers.resolveComponentPaths(conf.nou);
}

function* loadParsers() {
  if (conf.nou.isFS.parser) {
    conf.nou.PARSER = require(conf.nou.backend.parser);
  } else {
    var str = yield helpers.getFile(conf.nou.backend.parser);
    conf.nou.PARSER = helpers.requireFromString(str, "parser.js");
  }
}

function* loadTemplates() {
  conf.nou.TEMPLATE = conf.nou.TEMPLATE || {};
  conf.nou.TEMPLATE.special = conf.nou.TEMPLATE.special || {};
  var t_page_path = helpers.pathResolve(conf.nou.backend.template, "/template/nouwiki/normal/", "/page.dot.js");
  conf.nou.TEMPLATE.page = yield helpers.getFile(t_page_path);
  for (var page in conf.nou.template_special) {
    var name = conf.nou.template_special[page];
	  var t_special_path = helpers.pathResolve(conf.nou.backend.template, "/template/nouwiki/pages/", "/"+name+".dot.js");
	  conf.nou.TEMPLATE.special[name] = yield helpers.getFile(t_special_path);
  }
}

function mountPaths(key, send, forward, redirect) {
  var method;
  if (conf.nou.isFS[key]) {
    method = send;
  } else if (conf.nou.network[key] == "forward") {
    method = forward;
  } else if (conf.nou.network[key] == "redirect") {
    method = redirect;
  } else {
    return
  }
  NouApp.use(mount(conf.nou.frontend[key], method));
}

function* nou() {
  yield content.serve(app, conf);

  forwardRequest(NouApp);
  if (conf.nou.cors) {
    NouApp.use(cors());
  }

  mountPaths("parser", sendParser, forwardParser, redirectParser);
  mountPaths("markupBody", sendMarkupBody, forwardMarkupBody, redirectMarkupBody);
  mountPaths("nouwiki", sendNouwiki(), forwardNouwiki, redirectNouwiki);
  mountPaths("template", sendTemplate(), forwardTemplate, redirectTemplate);
  NouApp.use(mount("/nou.toml", sendNou));

  getApiURI();

  var keys = Object.keys(conf.nou.content);
  if (keys.length > 1) {
    router.get('/', serveWorld);
    router.get('/:wiki_title/', serveIndex);
    router.get('/:wiki_title/wiki/:page_title', servePage);
    if (conf.nou.merge_search) {
      router.get('/api/search/:string', search);
    }
  } else {
    router.get('/', serveIndex);
    router.get('/wiki/:page_title', servePage);
  }

  NouApp
  .use(router.routes())
  .use(router.allowedMethods());

  app.use(mount('/', NouApp));
}

function getApiURI() {
  for (var c in conf.nou.content) {
    var url = conf.nou.content[c];
    var title = conf.contentIndexToTitle[c];
    if (helpers.isHTTP(url)) {
      api[title] = api[title] || {};
      api[title].ping = helpers.pathResolve(url, "/api/ping");
      api[title].get_page = helpers.pathResolve(url, "/api/get_page");
      api[title].search = helpers.pathResolve(url, "/api/search");
      api[title].create = helpers.pathResolve(url, "/api/create");
      api[title].modify = helpers.pathResolve(url, "/api/modify");
      api[title].remove = helpers.pathResolve(url, "/api/remove");
      api[title].rename = helpers.pathResolve(url, "/api/rename");
    }
  }
}

function *search() {
  if ('GET' != this.method) return yield next;
  try {
    var text = this.params.string;
    var result = yield searchFS(text);
    this.status = 200;
    this.type = 'json';
    this.body = {"matches": result};
  } catch(e) {
    console.log(e)
    this.throw(500, "Unable to search pages.");
  }
}
function* searchFS(text) {
  var result = {};
  for (var c in conf.content) {
    result[c] = yield content.search(text, c);
  }
  return result;
}

function *serveWorld() {
  if ('GET' != this.method) return yield next;
  this.status = 200;
  this.type = 'html';
  var html = "<ul>"
  for (var c in conf.content) {
    html += "<li><a href='/"+c+"/'>"+c+"</a></li>"
  }
  html += "</ul>"
  this.body = html;
}

function *serveIndex() {
  if ('GET' != this.method) return yield next;
  console.log(this.request.url)
  if (this.request.url[this.request.url.length-1] != "/") {
    this.status = 301;
    this.redirect(this.request.url+"/");
  } else {
    var c = this.params.wiki_title || Object.keys(conf.content)[0];
    var i = conf.contentTitleToIndex[c];
    var content_path = conf.content[c].root;
    try {
      var title = "index";
      var markup = yield loadMarkup(content_path, c, title);
      yield loadParser(content_path, c, title);

      this.status = 200;
      this.type = 'html';
      var p = parser.parse(conf.nou, conf.content[c], title, markup, conf.nou.TEMPLATE.special[title]||conf.nou.TEMPLATE.page).page;
      this.body = p;
    } catch(e) {
      console.log(e)
      /*var title = "index";
      parser.init(markdownit, conf.content[c].TOML.parser.options, false, matter, doT);

      this.status = 200;
      this.type = 'html';
      var p = parser.parse(conf.nou, conf.content[c], title, helpers.empty.replace("PAGE_TITLE", title), template_data_create).page;
      this.body = p;*/
    }
  }
}

function *servePage() {
  if ('GET' != this.method) return yield next;
  if (this.path[this.path.length-1] != "/") {
    var c = this.params.wiki_title || Object.keys(conf.content)[0];
    var i = conf.contentTitleToIndex[c];
    var content_path = conf.content[c].root;
    try {
        var title = this.params.page_title;
        var markup = yield loadMarkup(content_path, c, title);
        yield loadParser(content_path, c, title);

        this.status = 200;
        this.type = 'html';
        this.body = parser.parse(conf.nou, conf.content[c], title, markup, conf.nou.TEMPLATE.special[title]||conf.nou.TEMPLATE.page).page;
      } catch(e) {
        console.log(e)
        var title = this.params.page_title;
        //var markup = yield loadMarkup(content_path, c, title);
        yield loadParser(content_path, c, title);

        this.status = 200;
        this.type = 'html';
        var p = parser.parse(conf.nou, conf.content[c], title, helpers.empty.replace("PAGE_TITLE", title), conf.nou.TEMPLATE.special[title]||conf.nou.TEMPLATE.page).page;
        this.body = p;
    }
  }
}

function* loadParser(content_path, c, title) {
  parser = conf.nou.PARSER || conf.content[c].PARSER;
  var content_plugins_path = helpers.pathResolve(content_path, "/plugins");
  var pjson = yield helpers.getPluginJSON(content_path, conf.content[c].TOML.parser.plugins);
  var plugins = yield helpers.getPlugins(title, content_plugins_path, pjson, "nouwiki");
  parser.init(markdownit, conf.content[c].TOML.parser.options, false, matter, doT);
  parser.loadPlugins(plugins);
}

function* loadMarkup(content_path, c, title) {
  var markup;
  if (!helpers.isHTTP(content_path)) {
    markup = yield content.get_page(title, c);
  } else {
    var api_url = helpers.pathResolve(api[c].get_page, "/"+title);
    markup = yield request.get(api_url);
  }
  return markup;
}

  // API
  /*
    So, Content API vs NouWiki... it must be possible to:
    - Serve just as Content API
    - Serve as Nou+Content API
    - Serve as Nou using an external Content API(s)
    - 3rd Party programs can then be developed for Content API's for example
    - And I'm starting to think Files should be a seperate node under a Content-API, usable across many other wiki, journal, etc, nodes.
    - Wiki, Journal, Notes, Articles, ->Files<- (but what if someone creates a Img node type, how can we make sure it's easy to use with the other nodes by default?)
    - Easy to do Nou+n x Content API's
    - Content API's: fs, http(s), fs-CAPI, http(s)-CAPI, fs-git, http(s)-git, git-git, github
    - first: http, fsCAPI, httpCAPI, http-mediawiki
  */

function *sendNou(next){
  //yield next;
  this.type = 'text/plain';
  this.body = yield helpers.getFile(nouTOMLPath);
}

function *sendParser(next){
  yield next;
  this.type = 'text/plain';
  this.body = yield helpers.getFile(conf.nou.backend.parser);
}
function *forwardParser(next){
  yield next;
  this.forward(conf.nou.backend.parser);
}
function *redirectParser(next){
  yield next;
  this.status = 301;
  this.redirect(conf.nou.backend.parser);
}

function *sendMarkupBody(next){
  yield next;
  this.type = 'text/css';
  this.body = yield helpers.getFile(conf.nou.backend.markupBody);
}
function *forwardMarkupBody(next){
  yield next;
  this.forward(conf.nou.backend.markupBody);
}
function *redirectMarkupBody(next){
  yield next;
  this.status = 301;
  this.redirect(conf.nou.backend.markupBody);
}

function sendNouwiki() {
  return staticDir(conf.nou.backend.nouwiki);
}
function *forwardNouwiki(next){
  yield next;
  var url = this.request.url.replace(conf.nou.frontend.nouwiki, conf.nou.backend.nouwiki);
  this.forward(url);
}
function *redirectNouwiki(next){
  yield next;
  var url = this.request.url.replace(conf.nou.frontend.nouwiki, conf.nou.backend.nouwiki);
  this.status = 301;
  this.redirect(url);
}

function sendTemplate() {
  return staticDir(conf.nou.backend.template);
}
function *forwardTemplate(next){
  yield next;
  var url = this.request.url.replace(conf.nou.frontend.template, conf.nou.backend.template);
  this.forward(url);
}
function *redirectTemplate(next){
  yield next;
  var url = this.request.url.replace(conf.nou.frontend.template, conf.nou.backend.template);
  this.status = 301;
  this.redirect(url);
}

function *forwardContentAPI(next){
  yield next;
  var url = this.request.url.replace(conf.nou.frontend.content, conf.nou.backend.content);
  this.forward(url);
}
function *redirectContentAPI(next){
  yield next;
  var url = this.request.url.replace(conf.nou.frontend.content, conf.nou.backend.content);
  this.status = 301;
  this.redirect(url);
}

function *forwardContent(next){
  yield next;
  var url = this.request.url.replace(conf.nou.frontend.content, conf.nou.backend.content);
  this.forward(url);
}
function *redirectContent(next){
  yield next;
  var url = this.request.url.replace(conf.nou.frontend.content, conf.nou.backend.content);
  this.status = 301;
  this.redirect(url);
}

exports.serve = serve;
