var path = require('path');
var doT = require('dot');
var fs = require('fs-extra');
var dirTree = require('directory-tree');
var toml = require('toml');
var build = require('./build');
var portfinder = require('portfinder');

var koa = require('koa');
var serveStatic = require('koa-static');
var mount = require('koa-mount');
var router = require('koa-router')();
var cobody = require('co-body');
var send = require('koa-send');
var app = koa();

var parse = require('./parse');
var git = require('./git');

var appDir = path.dirname(require.main.filename);

var wikis;
var configs = [];

function *modify() {
	if ('PUT' != this.method) return yield next;

	var markup_file, html_file, wiki_abs_dir, config;

	try {
		var data = yield cobody.text(this, {
			limit: '1000kb'
		});

		var page = getPage(this.request.header.referer);
		var md = page+".md";
		if (wikis.length > 1) {
			var wiki = this.request.header.referer.split("/")
			wiki_url = wiki[wiki.length-2];
			var i = getWikiIndex(wiki_url);
			wiki_abs_dir = wikis[i];
			config = configs[i];
			markup_file = path.join(wikis[i], "markup", md);
			html_file = path.join(wikis[i], page+".html");
		} else {
			wiki_abs_dir = wikis[0];
			config = configs[0];
			markup_file = path.join(wikis[0], "markup", md);
			html_file = path.join(wikis[0], page+".html");
		}

		fs.writeFileSync(markup_file, data);
		build.buildMarkupFile(wiki_abs_dir, markup_file, config, config.target);

		git.addAndCommitFiles(wiki_abs_dir, [markup_file, html_file], "page update");
		this.body = "Done";
	} catch(e) {
		this.throw(405, "Unable to update.");
	}
};

function *create() {
	if ('POST' != this.method) return yield next;

	var markup_file, html_file, wiki_abs_dir, config;

	try {
		var page = yield cobody.text(this, {
			limit: '500kb'
		});
		page = decodeURI(page);
		var md = page+".md";
		if (wikis.length > 1) {
			var wiki = this.request.header.referer.split("/");
			var wiki_url = wiki[wiki.length-2];
			var i = getWikiIndex(wiki_url);
			wiki_abs_dir = wikis[i];
			config = configs[i];
			markup_file = path.join(wikis[i], "markup", md);
			html_file = path.join(wikis[i], page+".html");
		} else {
			wiki_abs_dir = wikis[0];
			config = configs[0];
			markup_file = path.join(wikis[0], "markup", md);
			html_file = path.join(wikis[0], page+".html");
		}

		markup_file = path.join(wiki_abs_dir, "markup", page+".md");
		fs.writeFileSync(markup_file, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nEmpty page.\n");
		build.buildMarkupFile(wiki_abs_dir, markup_file, config, config.target);

		git.addAndCommitFiles(wiki_abs_dir, [markup_file, html_file], "page created");
    this.body = "Done";
	} catch(e) {
		this.throw(405, "Unable to create page.");
	}
};


function *get_page() {
	if ('POST' != this.method) return yield next;

	var markup_file, wiki_abs_dir, config;
	try {
		var page = yield cobody.text(this, {
	    limit: '500kb'
	  });

		var md = decodeURI(page+".md");
		if (wikis.length > 1) {
			var wiki = this.request.header.referer.split("/")
			var wiki_url = wiki[wiki.length-2];
			var i = getWikiIndex(wiki_url);
			wiki_abs_dir = wikis[i];
			config = configs[i];
			markup_file = path.join(wikis[i], md);
		} else {
			wiki_abs_dir = wikis[0];
			config = configs[0];
			markup_file = path.join(wikis[0], "markup", md);
		}

		var html = fs.readFileSync(path.join(wiki_abs_dir, page+".html"), 'utf8');
		this.body = html;
	} catch(e) {
		this.throw(405, "Unable to get page.");
	}
};

function *remove() {
	if ('POST' != this.method) return yield next;

	var markup_file, html_file, wiki_abs_dir, config;

	try {
		var page = yield cobody.text(this, {
			limit: '500kb'
		});
		page = decodeURI(page);
		var md = page+".md";
		if (wikis.length > 1) {
			var wiki = this.request.header.referer.split("/");
			var wiki_url = wiki[wiki.length-2];
			var i = getWikiIndex(wiki_url);
			wiki_abs_dir = wikis[i];
			config = configs[i];
			markup_file = path.join(wikis[i], "markup", md);
			html_file = path.join(wikis[i], page+".html");
		} else {
			wiki_abs_dir = wikis[0];
			config = configs[0];
			markup_file = path.join(wikis[0], "markup", md);
			html_file = path.join(wikis[0], page+".html");
		}

		git.removeAndCommitFiles(wiki_abs_dir, [markup_file, html_file], "page removed");
		fs.removeSync(markup_file);
		fs.removeSync(html_file);
    this.body = "Done";
	} catch(e) {
		this.throw(405, "Unable to remove page.");
	}
};

function *search_pages() {
	if ('POST' != this.method) return yield next;

	var wiki = this.request.header.referer.split("/");
	var wiki_url = wiki[wiki.length-2];
	var i = getWikiIndex(wiki_url);

	var result = [];
	try {
		var text = yield cobody.text(this, {
			limit: '500kb'
		});
		text = text.toLowerCase();
		var markup = path.join(wikis[i], "markup");
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
		console.log("something went wrong")
		this.status = 500;
	}
};

function *pageNotFound(next){
	yield next;
	if (404 != this.status) return;

	var wiki_abs_dir, config;
	var page = getPage(this.path);
	var root = this.path;
	if (this.path[this.path.length-1] != "/") {
	  root = this.path.replace("/"+page, "/");
	}
	var n = root.split("/").length;
	if (wikis.length == 1 && n == 2 || wikis.length > 1 && n == 3) { // If the URL really is a page URL: if we're serving 1 wiki the '/' split should be 2, else 3.
		var new_file1, new_file2;
		if (wikis.length > 1) {
			var wiki_url = this.path.split("/")[1];
			var i = getWikiIndex(wiki_url);
			wiki_abs_dir = wikis[i];
			config = configs[i];
			new_file1 = path.join(wikis[i], decodeURI(page));
			new_file2 = path.join(wikis[i], decodeURI(page)+".html");
		} else {
			wiki_abs_dir = wikis[0];
			config = configs[0];
			new_file1 = path.join(wikis[0], decodeURI(page));
			new_file2 = path.join(wikis[0], decodeURI(page)+".html");
		}

		var f, file;
		try {
			f = fs.statSync(new_file1).isFile();
			file = new_file1;
		} catch(e) {
			try {
				f = fs.statSync(new_file2).isFile();
				file = new_file2;
			} catch(e) {
				f = false;
			}
		}

		if (f) {
			this.status = 200;
			this.type = 'html';
			this.body = fs.readFileSync(file);
		} else {
			var template;
			var template_path = path.join(wiki_abs_dir, "/templates/default/dynamic/", "create.dot.jst");
			template = fs.readFileSync(template_path, 'utf8');

			this.status = 200;
			this.type = 'html';
			this.body = parse.parse(page, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nThis page has not been created yet.\n", config, template);
		}
	} else {
		console.log("not a page URL")
		this.status = 404;
	}
}

function serve(w, port) {
	wikis = w;
	for (var wiki in wikis) {
		configs.push(getWikiConfig(wikis[wiki]))
	}

	// API
	router.put('/api/modify', modify);
	router.post('/api/create', create);
	router.post('/api/get_page', get_page);
	router.post('/api/remove', remove);
	router.post('/api/search_pages', search_pages);

	// Serve wiki folder
	if (wikis.length > 1) {
		for (var wiki in wikis) {
			var wiki_path = wikis[wiki];
			var wiki = path.basename(wiki_path);
			app.use(mount("/"+wiki+"/", serveStatic(wiki_path)));
			// If you enter the wiki without a trailing slash, add the slash and redirect
			router.get('/'+wiki, function *(next) {
				this.redirect(this.request.url+'/');
			  this.status = 301;
		  });
		}
	} else {
		var wiki_path = wikis[0];
		app.use(serveStatic(wiki_path));
	}

	// Support viewing .html files without writing the .html extension in the browser
	app.use(pageNotFound);


	app
		.use(router.routes())
		.use(router.allowedMethods());
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

function getPage(url) {
	var page = decodeURI(url).split("/");
	page = page[page.length-1].split("?")[0];
	page = page || "index";
	return page;
}

function getWikiIndex(wiki_url) {
	wiki_url = decodeURI(wiki_url);
	for (var i in wikis) {
		var wiki = path.basename(wikis[i]);
		if (wiki_url == wiki) {
			return i;
		}
	}
	return -1;
}

function getWikiConfig(wiki_path) {
	var config_src = path.join(wiki_path, "/config.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
	return toml.parse(config_src_string);
}

exports.serve = serve;
