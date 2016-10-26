var path = require('path');
var Promise = require('bluebird');
var fs = require('fs-extra');
fs.readFile = Promise.promisify(fs.readFile);
var helpers = require('./helpers');
var cobody = require('co-body');
var route = require('koa-router');
var koa = require('koa');
var staticDir = require('koa-static');
var mount = require('koa-mount');
var toml = require('toml');
var cors = require('koa-cors');
var forwardRequest = require('koa-forward-request');

var app;
var conf;
var SingleContent;

function* serve(a, c) {
	app = a;
	conf = c;
	yield loadContent(conf.nou.content);
	yield loadParsers();
	yield loadTemplates();
	content();
}

function* loadContent(toml_paths) {
  for (var i in toml_paths) {
    var pa = toml_paths[i];
    if (!helpers.isHTTP(pa) && pa[0] != "/") {
      pa = helpers.pathResolve(conf.nou.root, pa);
    }
    yield loadContentTOML(pa, i);
  }
  var keys = Object.keys(conf.content);
  if (keys.length == 1) {
    SingleContent = keys[0];
  }
}
function* loadContentTOML(toml_path, i) {
  var toml_string = yield helpers.getFile(toml_path);
  rootConf = toml.parse(toml_string);
  root = toml_path.substring(0, toml_path.lastIndexOf("/"));

  var isFS = {};
  isFS.parser = !helpers.isHTTP(rootConf.parser);
  isFS.markupBody = !helpers.isHTTP(rootConf.markupBody);
  isFS.nouwiki = !helpers.isHTTP(rootConf.nouwiki);
  isFS.template = !helpers.isHTTP(rootConf.template);
  conf = conf || {};
  conf.content = conf.content || {};
  conf.content[rootConf.wiki_title] = rootConf;
  conf.content[rootConf.wiki_title].isFS = isFS;
  conf.content[rootConf.wiki_title].root = root;
  conf.content[rootConf.wiki_title].title = rootConf.wiki_title;
  helpers.resolveComponentPaths(conf.content[rootConf.wiki_title]); // it already has root, why pass?
  helpers.resolveContentPaths(conf.content[rootConf.wiki_title], conf.nou.content.length > 1);

  conf.content[rootConf.wiki_title].TOML = yield helpers.loadContentConfigs(root);
  conf.contentIndexToTitle = conf.contentIndexToTitle || {};
  conf.contentIndexToTitle[i] = rootConf.wiki_title;
  conf.contentTitleToIndex = conf.contentTitleToIndex || {};
  conf.contentTitleToIndex[rootConf.wiki_title] = i;
}

function* loadParsers() {
  for (var c in conf.content) {
    if (conf.content[c].isFS.parser) {
      conf.content[c].PARSER  = require(conf.content[c].backend.parser);
    } else {
      var str = yield helpers.getFile(conf.content[c].backend.parser);
      conf.content[c].PARSER  = helpers.requireFromString(str, "parser.js");
    }
  }
}

function* loadTemplates() {
  for (var c in conf.content) {
    conf.content[c].TEMPLATE = conf.content[c].TEMPLATE || {};
    conf.content[c].TEMPLATE.special = conf.content[c].TEMPLATE.special || {};
    var t_page_path = helpers.pathResolve(conf.content[c].backend.template, "/template/nouwiki/normal/", "/page.dot.js");
    conf.content[c].TEMPLATE.page = yield helpers.getFile(t_page_path);
    for (var page in conf.content[c].template_special) {
      var name = conf.content[c].template_special[page];
      var t_special_path = helpers.pathResolve(conf.content[c].backend.template, "/template/nouwiki/pages/", "/"+name+".dot.js");
      conf.content[c].TEMPLATE.special[name] = yield helpers.getFile(t_special_path);
    }
  }
}

function content() {
	for (var c in conf.content) {
		var r = "/";
		var keys = Object.keys(conf.content);
		if (keys.length > 1) {
			r = "/"+c+"/";
		}

		// ContentStatic
		var ContentStatic = koa();
		if (conf.content[c].static_cors == true) {
			ContentStatic.use(cors());
		}
		
		var static_mount = mount("/", staticDir(conf.content[c].backend.path));
		ContentStatic.use(static_mount);

		// ContentAPI
		var ContentAPI = koa();
		forwardRequest(ContentAPI);
		var router = route();

		if (conf.content[c].api_cors == true) {
			router.use(cors());
		}
		router.get(r+'api/ping', ping);
		router.get(r+'api/get_page/:title', getPage);
		router.get(r+'api/search/:string', search);
		router.get(r+'api/remove/:title', remove);
		router.get(r+'api/rename/:title', rename);
		router.put(r+'api/modify', modify);

		ContentAPI
		.use(router.routes())
		.use(router.allowedMethods());

		app.use(mount(r, ContentStatic));
		app.use(mount('/', ContentAPI));
	}
}

function getWikiTitle(that) {
	if (SingleContent != undefined) {
		return SingleContent;
	} else {
		return that.request.href.split("/")[3];
	}
}

function *ping() {
	if ('GET' != this.method) return yield next;
	var c = getWikiTitle(this);
	this.body = pingFS(c);
}
function pingFS(c) {
	return c+" ping";
}

function *getPage() {
	if ('GET' != this.method) return yield next;
	var c = getWikiTitle(this);
	this.body = (yield getPageFS(this.params.title, c)) || helpers.empty.replace("PAGE_TITLE", this.params.title);
}
function* getPageFS(title, c) {
	page_path = path.join(conf.content[c].backend.path, "/markup", "/"+title+".md");
	var ex = yield helpers.fileExists(page_path);
	if (ex) {
		return fs.readFile(page_path, 'utf8');
	} else {
		return false;
	}
	
}

function *search() {
	if ('GET' != this.method) return yield next;
	try {
		var c = getWikiTitle(this);
		var text = this.params.string;
		var result = yield searchFS(text, c);
		actualResult = {}
		actualResult[c] = result;
		this.status = 200;
		this.type = 'json';
		this.body = {"matches": actualResult};
	} catch(e) {
		console.log(e)
		this.throw(500, "Unable to search pages.");
	}
}
function* searchFS(text, c) {
	console.log(text, c)
	var result = [];
	text = text.toLowerCase();

	var markup = path.join(conf.content[c].backend.path, "/markup");
	var fsreaddir = Promise.promisify(fs.readdir);
	var pages = yield fsreaddir(markup);
	var lowerPages = [];
	for (var p in pages) { // Remove extension
		pages[p] = pages[p].replace(/\.[^/.]+$/, "");
		if (pages[p] != "index") {
			lowerPages.push(pages[p].toLowerCase());
		}
	}

	for (var p in lowerPages) { // Matches beginning of string
		if (lowerPages[p][0] == text[0] && lowerPages[p].substring(0, text.length) == text) {
			result.push(pages[p]);
		}
	}
	for (var p in lowerPages) { // Matches anywhere in the string
		if (lowerPages[p].indexOf(text) > -1 && result.indexOf(pages[p]) == -1) {
			result.push(pages[p]);
		}
	}
	return result;
}

function *modify() {
	if ('PUT' != this.method) return yield next;
	try {
		var c = getWikiTitle(this);
		var data = yield cobody.text(this, {
			limit: '5000kb'
		});
		var title = helpers.getPage(this.request.header.referer) || "index";
		yield modifyFS(title, data, c);
		this.body = "done";
	} catch(e) {
		this.throw(500, "Unable to modify page.");
	}
};
function modifyFS(title, data, c) {
	var markup_file = path.join(conf.content[c].backend.path, "/markup", "/"+title+".md");
	fswriteFile = Promise.promisify(fs.writeFile);
	return fswriteFile(markup_file, data);
	//git.addAndCommitFiles(wiki_path, ["markup/"+page+".md"], "page update");
}

function *remove() {
	if ('GET' != this.method) return yield next;
	try {
		var c = getWikiTitle(this);
		var title = this.params.title;
		title = decodeURI(title);
		yield removeFS(title, c);
		this.body = "done";
	} catch(e) {
		this.throw(500, "Unable to remove page.");
	}
}
function* removeFS(title, c) {
	var files = [];
	files.push("markup/"+title+".md");
	files.push("static/"+title+".html");
	files.push("text/"+title+".txt");
	files.push("fragment/"+title+".html");
	for (var x in files) {
		fsremove = Promise.promisify(fs.remove);
		yield fsremove(path.join(conf.content[c].backend.path, files[x]));
	}
	//git.removeAndCommitFiles(wiki_path, files, "page removed", this)
}

function *rename() {
	if ('GET' != this.method) return yield next;
	try {
		var c = getWikiTitle(this);
		var page = {};
	    page.old = decodeURI(this.params.title);
	    page.new = decodeURI(this.request.query.to);
		yield renameFS(page, c);
	    this.body = "Done";
	} catch(e) {
		console.log(e);
		this.throw(500, "Unable to rename page.");
	}
}
function* renameFS(page, c) {
	var old_files = [];
	old_files.push("/markup/"+page.old+".md");
	old_files.push("/static/"+page.old+".html");
	old_files.push("/text/"+page.old+".txt");
	old_files.push("/fragment/"+page.old+".html");

	var new_files = [];
	new_files.push("/markup/"+page.new+".md");
	new_files.push("/static/"+page.new+".html");
	new_files.push("/text/"+page.new+".txt");
	new_files.push("/fragment/"+page.new+".html");

	var fsmove = Promise.promisify(fs.move);
	for (var x in old_files) {
		try {
			yield fsmove(path.join(conf.content[c].backend.path, old_files[x]), path.join(conf.content[c].backend.path, new_files[x]));
		} catch(e) {
			console.log(e);
		}
		
	}
}

exports.serve = serve;
exports.ping = pingFS;
exports.get_page = getPageFS;
exports.search = searchFS;
exports.modify = modifyFS;
exports.remove = removeFS;
exports.rename = renameFS;
