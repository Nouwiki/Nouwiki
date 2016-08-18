var path = require('path');
var fs = require('fs-extra');
var toml = require('toml');
var portfinder = require('portfinder');
var koa = require('koa');
var cors = require('koa-cors');
var serveStatic = require('koa-static');
var mount = require('koa-mount');
var router = require('koa-router')();
var cobody = require('co-body');
var send = require('koa-send');
var app = koa();

var build = require('./build');
var git = require('./git');
var parse = require('../parser');
var helpers = require('./helpers');

var appDir = path.dirname(require.main.filename);

//endsWith Polyfill
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

var wiki;
var config;
var template;
var template_data_page;
var template_data_create;

function serve(w, port, templ) {
	// Root
	wiki = w[0];
	config = getWikiConfig(wiki);
	template = templ || config.nouwiki.template;

  if (config.nouwiki.CORS.enabled == true) {
		app.use(cors());
	}

	// API
	router.put('/api/modify', modify);
	router.post('/api/create', create);
	router.post('/api/remove', remove);
	router.post('/api/rename', rename);
	router.post('/api/search_pages', search_pages);

	// Root
	var template_path;
	template_path = path.join(wiki, template+"/template/nouwiki/", "page.json");
	template_data_page = fs.readFileSync(template_path, 'utf8').split("`")[1];
	template_path = path.join(wiki, template+"/template/nouwiki/", "create.json");
	template_data_create = fs.readFileSync(template_path, 'utf8').split("`")[1];
	router.get('/', serveIndex);
	router.get('/wiki/:page', servePage);

	app
		.use(router.routes())
		.use(router.allowedMethods());
	app.use(serveStatic(wiki));
	app.use(pageNotFound); // Option to create page if not found

	if (port == undefined) {
		portfinder.basePort = 8080;
		portfinder.getPort(function (err, pf) {
			if (err) { throw err; }
			console.log("Nouwiki is serving on port: "+(process.env.PORT || pf));
			app.listen(process.env.PORT || pf);
		});
	} else {
		console.log("Nouwiki is serving on port: "+(process.env.PORT || port));
		app.listen(process.env.PORT || port);
	}
}

function *serveIndex() {
	if ('GET' != this.method) return yield next;
	console.log("Here")
	try {
		var page = "index";
		var wiki_path = wiki;
		var markup = getMarkup(wiki_path, page);
    console.log("there")

		var wiki_parser_plugins_path = path.join(wiki_path, "/plugins");
    var plugins = helpers.getPlugins(page, wiki_parser_plugins_path, helpers.getPluginJSON(wiki_parser_plugins_path, config.parser.plugins), "nouwiki");
		parse.init(config.parser.parser_options);
		parse.loadPlugins(plugins);

		this.status = 200;
		this.type = 'html';
    console.log("HERE")
		this.body = parse.parse(config.nouwiki, page, markup, template_data_page, config.global).page;
  } catch(e) {
		console.log("#%#%#$%#$%#", e);
		var page = "index";
		parse.init(config.parser.parser_options);

		this.status = 200;
		this.type = 'html';
		this.body = parse.parse(config.nouwiki, page, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nThis page has not been created yet.\n", template_data_create, config.global).page;
	}
}

function *servePage() {
	if ('GET' != this.method) return yield next;
	if (this.path[this.path.length-1] != "/") {
		var wiki_path = wiki;
		try {
			//var page = getPage(this.path);
			var markup = getMarkup(wiki_path, this.params.page);

			var wiki_parser_plugins_path = path.join(wiki_path,"/plugins");
      var plugins = helpers.getPlugins(page, wiki_parser_plugins_path, helpers.getPluginJSON(wiki_parser_plugins_path, config.parser.plugins), "nouwiki");
			parse.init(config.parser.parser_options);
			parse.loadPlugins(plugins);

			this.status = 200;
			this.type = 'html';
			var p = parse.parse(config.nouwiki, page, markup, template_data_page, config.global).page;
			this.body = p;
		} catch(e) {
			var page = this.params.page || "index";
			var p = path.join(wiki_path, decodeURIComponent(this.path));
			try {
        console.log(p)
				var stat = fs.statSync(p);
				if (!stat.isDirectory()) {
					this.status = 200;
					this.type = 'html';
					this.body = fs.readFileSync(p);
				}
			} catch(e) {
				try {
          console.log(p+".html")
					var stat = fs.statSync(p+".html");
					if (!stat.isDirectory()) {
						this.status = 200;
						this.type = 'html';
						this.body = fs.readFileSync(p);
					}
				} catch(e) {
          console.log("NONE")
					var page = this.params.page;
					parse.init(config.parser.parser_options);

					this.status = 200;
					this.type = 'html';
					this.body = parse.parse(config.nouwiki, page, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nThis page has not been created yet.\n", template_data_create, config.global).page;
				}
			}
		}
	}
}

function *modify() {
	if ('PUT' != this.method) return yield next;

	try {
		var data = yield cobody.text(this, {
			limit: '1000kb'
		});

		var page = getPage(this.request.header.referer) || "index";
		var wiki_path = wiki;
		var markup_file = path.join(wiki_path, "markup", page+".md");

		fs.writeFileSync(markup_file, data);

		git.addAndCommitFiles(wiki_path, ["markup/"+page+".md"], "page update");
		this.body = "Done";
	} catch(e) {
		console.log(e)
		this.throw(405, "Unable to update.");
	}
};

function *create() {
	if ('POST' != this.method) return yield next;

	try {
		var page = yield cobody.text(this, {
			limit: '500kb'
		});
		page = decodeURI(page);
		var wiki_path = wiki;
		var markup_file = path.join(wiki_path, "markup", page+".md");

		fs.writeFileSync(markup_file, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nEmpty page.\n");

		git.addAndCommitFiles(wiki_path, ["markup/"+page+".md"], "page created");
    this.body = "Done";
	} catch(e) {
		console.log(e);
		this.throw(405, "Unable to create page.");
	}
}

function *remove() {
	if ('POST' != this.method) return yield next;

	try {
		var page = yield cobody.text(this, {
			limit: '500kb'
		});
		page = decodeURI(page);
    if (page != "index") {
      var wiki_path = wiki;

      var files = [];
      files.push("markup/"+page+".md");
      files.push("wiki/"+page+".html");
      files.push("text/"+page+".txt");
      files.push("fragment/"+page+".html");
      for (var x in files) {
        fs.removeSync(path.join(wiki_path, files[x]))
      }

      git.removeAndCommitFiles(wiki_path, files, "page removed", this)
    }
    this.body = "Done";
	} catch(e) {
		console.log(e);
		this.throw(405, "Unable to remove page.");
	}
}

function *rename() {
	if ('POST' != this.method) return yield next;

	try {
		var page = yield cobody.json(this, {
			limit: '500kb'
		});
    page.old = decodeURI(page.old);
    page.new = decodeURI(page.new);
    if (page.old != "index") {
      var wiki_path = wiki;

      var old_files = [];
      old_files.push("markup/"+page.old+".md");
      old_files.push("wiki/"+page.old+".html");
      old_files.push("text/"+page.old+".txt");
      old_files.push("fragment/"+page.old+".html");

      var new_files = [];
      new_files.push("markup/"+page.new+".md");
      new_files.push("wiki/"+page.new+".html");
      new_files.push("text/"+page.new+".txt");
      new_files.push("fragment/"+page.new+".html");

      for (var x in old_files) {
        fs.copySync(path.join(wiki_path, old_files[x]), path.join(wiki_path, new_files[x]));
        fs.removeSync(path.join(wiki_path, old_files[x]));
      }

      git.removeAndCommitFiles(wiki_path, old_files, "page removed").then(function() {
        git.addAndCommitFiles(wiki_path, new_files, "page added")
      })
    }
    this.body = "Done";
	} catch(e) {
		console.log(e);
		this.throw(405, "Unable to rename page.");
	}
}

function *search_pages() {
	if ('POST' != this.method) return yield next;

	var result = [];
	try {
		var text = yield cobody.text(this, {
			limit: '500kb'
		});
		text = text.toLowerCase();

		var page = getPage(this.request.header.referer) || "index";
		var wiki_path = wiki;

		var markup = path.join(wiki_path, "markup");
		var pages = fs.readdirSync(markup);
    var lowerPages = [];
		for (var p in pages) { // Remove extension
			pages[p] = pages[p].replace(/\.[^/.]+$/, "");
      lowerPages.push(pages[p].toLowerCase());
		}
		for (var p in lowerPages) { // Matches beginning of string
			if (lowerPages[p].substring(0, text.length) == text) {
				if (lowerPages[p] != "index") {
					result.push(pages[p]);
				}
			}
		}
		for (var p in lowerPages) { // Matches anywhere in the string
			if (lowerPages[p].indexOf(text) > -1 && result.indexOf(pages[p]) == -1) {
				if (lowerPages[p] != "index") {
					result.push(pages[p]);
				}
			}
		}

		this.status = 200;
		this.type = 'json';
		this.body = {"matches": result};
	} catch(e) {
		console.log(e)
		this.status = 500;
	}
}

function *pageNotFound(next) {
	yield next;
	if (404 != this.status) return;

	var page = getPage(this.path) || "index";
	var wiki_path = wiki;
	var p = path.join(wiki_path, this.path)+".html";
  console.log("111", p)
	try {
		var stat = fs.statSync(p);
		if (!stat.isDirectory()) {
			this.status = 200;
			this.type = 'html';
			this.body = fs.readFileSync(p);
		}
	} catch(e) {
		var si = this.path.indexOf("/wiki/");
		if (si == -1) {
			return;
		}
		var template;
		var template_path = path.join(wiki_path, template, "nouwiki-default-template/template/nouwiki/", "create.json");
		template = fs.readFileSync(template_path, 'utf8').split("`")[1];

		this.status = 200;
		this.type = 'html';
		parse.init(config.parser.parser_options);
		this.body = parse.parse(config.nouwiki, page, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nThis page has not been created yet.\n", template, config.global).page;
	}
}

function getPage(url) {
	if (url.indexOf("/wiki/") == -1) {
		return "index";
	} else {
		var page = decodeURI(url).split("/");
		page = page[page.length-1].split("?")[0];
		return page;
	}
}

  function getMarkup(wiki_path, page) {
	var markup_src = path.join(wiki_path, "markup", page+".md");
	var markup = fs.readFileSync(markup_src, 'utf8');
	return markup;
}

function getWikiConfig(wiki_path) {
  var obj = {};

  var config_src = path.join(wiki_path, "/nouwiki.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
  obj.nouwiki = toml.parse(config_src_string);

  var config_src = path.join(wiki_path, "/global.toml");
  var config_src_string = fs.readFileSync(config_src, 'utf8');
  obj.global = toml.parse(config_src_string);

  var config_src = path.join(wiki_path, "/parser.toml");
  var config_src_string = fs.readFileSync(config_src, 'utf8');
  obj.parser = toml.parse(config_src_string);

	return obj;
}

exports.serve = serve;
