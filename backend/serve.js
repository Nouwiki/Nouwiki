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
var pubs = [];
var configs = [];

function serve(w, port) {
	wikis = w;
	for (var wiki in wikis) {
		pubs.push(path.join(wikis[wiki], "/public"))
	}
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
			var pub_path = pubs[wiki];
			var config = path.join(wiki_path, "/config.toml");
			var templates = path.join(wiki_path, "/templates");
			var wiki = path.basename(wiki_path);
			app.use(mount("/"+wiki+"/config.toml", serveStatic(config)));
			app.use(mount("/"+wiki+"/templates/", serveStatic(templates)));
			app.use(mount("/"+wiki+"/", serveStatic(pub_path)));
			// If you enter the wiki without a trailing slash, add the slash and redirect
			router.get('/'+wiki, function *(next) {
				this.redirect(this.request.url+'/');
			  this.status = 301;
		  });
		}
	} else {
		var wiki_path = wikis[0];
		var pub_path = pubs[0];
		var config = path.join(wiki_path, "/config.toml");
		app.use(serveStatic(pub_path));
		app.use(mount("/config.toml", function *(){
			return this.body = fs.readFileSync(config);
			yield send(this, this.path);
		}));
	}


	app
		.use(router.routes())
		.use(router.allowedMethods());
	app.use(pageNotFound);
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

function *modify() {
	if ('PUT' != this.method) return yield next;

	var markup_file, html_file, wiki_abs_dir, config, pub;

	console.log("here")
	try {
		console.log("mere")
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
			pub = path.join(wiki_abs_dir, "/public");
			config = configs[i];
			markup_file = path.join(pub, "markup", md);
			html_file = path.join(pub, page+".html");
		} else {
			wiki_abs_dir = wikis[0];
			pub = path.join(wiki_abs_dir, "/public");
			config = configs[0];
			markup_file = path.join(pub, "markup", md);
			html_file = path.join(pub, page+".html");
		}

		fs.writeFileSync(markup_file, data);
		build.buildMarkupFile(wiki_abs_dir, markup_file, config, config.target);

		git.addAndCommitFiles(pub+"/markup/", [md/*, html_file*/], "page update");
		this.body = "Done";
	} catch(e) {
		console.log("there")
		this.throw(405, "Unable to update.");
	}
};

function *create() {
	if ('POST' != this.method) return yield next;

	var markup_file, html_file, wiki_abs_dir, config, pub;

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
			pub = path.join(wiki_abs_dir, "/public");
			config = configs[i];
			markup_file = path.join(pub, "markup", md);
			html_file = path.join(pub, page+".html");
		} else {
			wiki_abs_dir = wikis[0];
			pub = path.join(wiki_abs_dir, "/public");
			config = configs[0];
			markup_file = path.join(pub, "markup", md);
			html_file = path.join(pub, page+".html");
		}

		//markup_file = path.join(pub, "markup", page+".md");
		fs.writeFileSync(markup_file, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nEmpty page.\n");
		build.buildMarkupFile(wiki_abs_dir, markup_file, config, config.target);

		git.addAndCommitFiles(pub+"/markup/", [md/*, html_file*/], "page created");
    this.body = "Done";
	} catch(e) {
		this.throw(405, "Unable to create page.");
	}
};


function *get_page() {
	if ('POST' != this.method) return yield next;

	var markup_file, wiki_abs_dir, config, pub;
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
			pub = path.join(wiki_abs_dir, "/public");
			config = configs[i];
			markup_file = path.join(pub, md);
		} else {
			wiki_abs_dir = wikis[0];
			pub = path.join(wiki_abs_dir, "/public");
			config = configs[0];
			markup_file = path.join(pub, "markup", md);
		}

		var html = fs.readFileSync(path.join(pub, page+".html"), 'utf8');
		this.body = html;
	} catch(e) {
		this.throw(405, "Unable to get page.");
	}
};

function *remove() {
	if ('POST' != this.method) return yield next;

	var markup_file, html_file, wiki_abs_dir, config, pub;

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
			pub = path.join(wiki_abs_dir, "/public");
			config = configs[i];
			markup_file = path.join(/*pub, */"markup", md);
			html_file = path.join(/*pub, */page+".html");
		} else {
			wiki_abs_dir = wikis[0];
			pub = path.join(wiki_abs_dir, "/public");
			config = configs[0];
			markup_file = path.join(/*pub, */"markup", md);
			html_file = path.join(/*pub, */page+".html");
		}

		//fs.removeSync(markup_file);
		//fs.removeSync(html_file);
		//fs.unlinkSync(markup_file);
		//fs.unlinkSync(html_file);
		git.removeAndCommitFiles(pub+"/markup/", [md/*, html_file*/], "page removed")
    this.body = "Done";
	} catch(e) {
		this.throw(405, "Unable to remove page.");
	}
};

function *search_pages() {
	if ('POST' != this.method) return yield next;

	var i = 0;
	if (wikis.length > 1) {
		var wiki = this.request.header.referer.split("/");
		var wiki_url = wiki[wiki.length-2];
		i = getWikiIndex(wiki_url);
	}

	var result = [];
	try {
		var text = yield cobody.text(this, {
			limit: '500kb'
		});
		text = text.toLowerCase();
		var markup = path.join(pubs[i], "markup");
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
};

function *pageNotFound(next){
	yield next;
	if (404 != this.status) return;

	console.log("path:", this.path)
	var wiki_abs_dir, config, pub;
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
			pub = path.join(wiki_abs_dir, "/public");
			config = configs[i];
			new_file1 = path.join(pub, decodeURI(page));
			new_file2 = path.join(pub, decodeURI(page)+".html");
		} else {
			wiki_abs_dir = wikis[0];
			pub = path.join(wiki_abs_dir, "/public");
			config = configs[0];
			new_file1 = path.join(pub, decodeURI(page));
			new_file2 = path.join(pub, decodeURI(page)+".html");
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
			var template_path = path.join(wiki_abs_dir, "/templates/nouwiki-default-template/backend/dynamic/template/", "create.dot.jst");
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
