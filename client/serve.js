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
var parse = require('../parse');
var helpers = require('./helpers');

var appDir = path.dirname(require.main.filename);

var wiki;
var config;
var template_data_page;
var template_data_create;

function serve(w, port, target, template) {
	wiki = w[0];
	console.log(wiki, target)
	config = getWikiConfig(wiki);
	var template = template || config.template;

	if (config.CORS.enabled == true) {
		app.use(cors());
	}

	// API
	router.put('/api/modify', modify);
	router.post('/api/create', create);
	router.post('/api/remove', remove);
	router.post('/api/search_pages', search_pages);

	if (target != undefined) { // If serve target specified
		build.buildWiki(wiki, [target], template, target);
		app
			.use(router.routes())
			.use(router.allowedMethods());
		app.use(serveStatic(wiki));
	} else { // Else nouwiki
		var template_path;
		template_path = path.join(wiki, "/nouwiki/templates/"+template+"/template/nouwiki/", "page.dot.jst");
		template_data_page = fs.readFileSync(template_path, 'utf8');
		template_path = path.join(wiki, "/nouwiki/templates/"+template+"/template/nouwiki/", "create.dot.jst");
		template_data_create = fs.readFileSync(template_path, 'utf8');
		router.get('/', serveIndex);
		router.get('/wiki/:page', servePage);
		app
			.use(router.routes())
			.use(router.allowedMethods());
		app.use(serveStatic(wiki));
	}

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
	try {
		var page = "index";
		var markup = getMarkup(page);

		var wiki_parser_plugins_path = path.join(wiki, "/nouwiki", "/plugins", "/parser/");
		var plugins = helpers.getPlugins(page, wiki_parser_plugins_path, config.plugins.parser, "nouwiki");
		parse.init();
		parse.loadPlugins(plugins);

		this.status = 200;
		this.type = 'html';
		this.body = parse.parse(page, markup, config, template_data_page).page;
	} catch(e) {
		console.log(e)
		var page = "index";
		parse.init();

		this.status = 200;
		this.type = 'html';
		this.body = parse.parse(page, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nThis page has not been created yet.\n", config, template_data_create).page;
	}
}

function *servePage() {
	if ('GET' != this.method) return yield next;
	if (this.path[this.path.length-1] != "/") {
		try {
			var page = getPage(this.path);
			var markup = getMarkup(page);

			var wiki_parser_plugins_path = path.join(wiki, "/nouwiki", "/plugins", "/parser/");
			var plugins = helpers.getPlugins(page, wiki_parser_plugins_path, config.plugins.parser, "nouwiki");
			parse.init();
			parse.loadPlugins(plugins);

			this.status = 200;
			this.type = 'html';
			var p = parse.parse(page, markup, config, template_data_page).page;
			this.body = p;
		} catch(e) {
			var page = getPage(this.path);
			parse.init();

			this.status = 200;
			this.type = 'html';
			this.body = parse.parse(page, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nThis page has not been created yet.\n", config, template_data_create).page;
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
		var markup_file = path.join(wiki, "content", "markup", page+".md");

		fs.writeFileSync(markup_file, data);

		git.addAndCommitFiles(wiki+"/content/", ["markup/"+page+".md"], "page update");
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
		var markup_file = path.join(wiki, "content", "markup", page+".md");

		fs.writeFileSync(markup_file, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nEmpty page.\n");

		git.addAndCommitFiles(wiki+"/content/", ["markup/"+page+".md"], "page created");
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

		git.removeAndCommitFiles(wiki+"/content/", ["markup/"+page+".md"], "page removed")
    this.body = "Done";
	} catch(e) {
		console.log(e);
		this.throw(405, "Unable to remove page.");
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
		var markup = path.join(pubs[i], "content", "markup");
		var pages = fs.readdirSync(markup);
		for (var p in pages) { // Remove extension
			pages[p] = pages[p].replace(/\.[^/.]+$/, "");
		}
		for (var p in pages) { // Matches beginning of string
			if (pages[p].substring(0, text.length).toLowerCase() == text) {
				if (pages[p] != "index") {
					result.push(pages[p]);
				}
			}
		}
		for (var p in pages) { // Matches anywhere in the string
			if (pages[p].indexOf(text) > -1 && result.indexOf(pages[p]) == -1) {
				if (pages[p] != "index") {
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
	var p = path.join(wiki, this.path)+".html";
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
		var template_path = path.join(wiki_abs_dir, "/nouwiki/templates/nouwiki-default-template/template/nouwiki/", "create.dot.jst");
		template = fs.readFileSync(template_path, 'utf8');

		this.status = 200;
		this.type = 'html';
		parse.init();
		this.body = parse.parse(page, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nThis page has not been created yet.\n", config, template).page;
	}
}

function getPage(url) {
	var page = decodeURI(url).split("/");
	page = page[page.length-1].split("?")[0];
	return page;
}

function getMarkup(page) {
	var markup_src = path.join(wiki, "content", "markup", page+".md");
	var markup = fs.readFileSync(markup_src, 'utf8');
	return markup;
}

function getWikiConfig(wiki_path) {
	var config_src = path.join(wiki_path, "/nouwiki.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
	return toml.parse(config_src_string);
}

exports.serve = serve;
