var path = require('path');
var doT = require('dot');
var fs = require('fs-extra');
var toml = require('toml');
var portfinder = require('portfinder');
var koa = require('koa');
var serveStatic = require('koa-static');
var mount = require('koa-mount');
var router = require('koa-router')();
var cobody = require('co-body');
var send = require('koa-send');
var app = koa();

var build = require('./build');
var git = require('./git');
var parse = require('../parse');

var appDir = path.dirname(require.main.filename);

var wikis;
var pubs = [];
var configs = [];

function serve(w, port) {
	wikis = w;
	for (var wiki in wikis) {
		pubs.push(wikis[wiki]);
	}
	for (var wiki in wikis) {
		configs.push(getWikiConfig(wikis[wiki]))
	}

	// API
	router.put('/api/modify', modify);
	router.post('/api/create', create);
	router.post('/api/remove', remove);
	router.post('/api/search_pages', search_pages);

	// Serve wiki folder
	if (wikis.length > 1) {
		/*for (var wiki in wikis) {
			var wiki_path = wikis[wiki];
			var pub_path = pubs[wiki];
			var config = path.join(wiki_path, "/nouwiki.toml");
			var templates = path.join(wiki_path, "/templates");
			var wiki = path.basename(wiki_path);
			app.use(mount("/"+wiki+"/nouwiki.toml", serveStatic(config)));
			app.use(mount("/"+wiki+"/templates/", serveStatic(templates)));
			app.use(mount("/"+wiki+"/", serveStatic(pub_path)));
			// If you enter the wiki without a trailing slash, add the slash and redirect
			router.get('/'+wiki, function *(next) {
				this.redirect(this.request.url+'/');
			  this.status = 301;
		  });
		}*/
	} else {
		var pub_path = pubs[0];
		app.use(serveStatic(pub_path));
		/*app.use(mount("/nouwiki.toml", function *(){
			return this.body = fs.readFileSync(config);
			yield send(this, this.path);
		}));*/
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

	var markup_file;
	var wiki_abs_dir, config, pub;
	var page;

	try {
		var data = yield cobody.text(this, {
			limit: '1000kb'
		});

		page = getPage(this.request.header.referer) || "index";
		wiki_abs_dir = wikis[0];
		pub = wiki_abs_dir;
		config = configs[0];
		markup_file = path.join(pub, "markup", page+".md");

		fs.writeFileSync(markup_file, data);
		build.buildMarkupFile(wiki_abs_dir, markup_file, config, config.targets);

		git.addAndCommitFiles(pub+"/markup/", [page+".md"], "page update");
		this.body = "Done";
	} catch(e) {
		console.log(e)
		this.throw(405, "Unable to update.");
	}
};

function *create() {
	if ('POST' != this.method) return yield next;

	var markup_file;
	var wiki_abs_dir, config, pub;
	var page;

	try {
		page = yield cobody.text(this, {
			limit: '500kb'
		});
		page = decodeURI(page);
		wiki_abs_dir = wikis[0];
		pub = wiki_abs_dir;//path.join(wiki_abs_dir, "/public");
		config = configs[0];
		markup_file = path.join(pub, "markup", page+".md");

		//markup_file = path.join(pub, "markup", page+".md");
		fs.writeFileSync(markup_file, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nEmpty page.\n");
		build.buildMarkupFile(wiki_abs_dir, markup_file, config, config.targets);

		git.addAndCommitFiles(pub+"/markup/", [page+".md"], "page created");
    this.body = "Done";
	} catch(e) {
		this.throw(405, "Unable to create page.");
	}
};


/*function *get_page() {
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
			pub = wiki_abs_dir;//path.join(wiki_abs_dir, "/public");
			config = configs[i];
			markup_file = path.join(pub, md);
		} else {
			wiki_abs_dir = wikis[0];
			pub = wiki_abs_dir;//path.join(wiki_abs_dir, "/public");
			config = configs[0];
			markup_file = path.join(pub, "markup", md);
		}

		var html = fs.readFileSync(path.join(pub, page+".html"), 'utf8');
		this.body = html;
	} catch(e) {
		this.throw(405, "Unable to get page.");
	}
};*/

function *remove() {
	if ('POST' != this.method) return yield next;

	var markup_file;
	var wiki_abs_dir, config, pub;
	var page;

	try {
		page = yield cobody.text(this, {
			limit: '500kb'
		});
		page = decodeURI(page);
		wiki_abs_dir = wikis[0];
		pub = wiki_abs_dir;
		config = configs[0];
		markup_file = path.join("markup", page+".md");
		html_file_wiki = path.join("wiki/", page+".html");
		html_file_dynamic = path.join("builds/", "dynamic/", page+".html");
		html_file_static = path.join("builds/", "static/", page+".html");
		html_file_file = path.join("builds/", "file/", page+".html");

		git.removeAndCommitFiles(pub+"/markup/", [page+".md", html_file_wiki, html_file_dynamic, html_file_static, html_file_file], "page removed")
    this.body = "Done";
	} catch(e) {
		this.throw(405, "Unable to remove page.");
	}
};

function *search_pages() {
	if ('POST' != this.method) return yield next;

	var i = 0;

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

	var wiki_abs_dir, config, pub;
	var page = getPage(this.path) || "index";
	var root = this.path;
	if (this.path[this.path.length-1] != "/") {
	  root = this.path.replace("/"+page, "/");
	}
	var n = root.split("/").length;

	wiki_abs_dir = wikis[0];
	pub = wiki_abs_dir;
	config = configs[0];

	var middle;
	if (page != "index") {
		middle = root.split("/");
		middle = middle.slice(1, middle.length-1);
		middle = "/"+middle.join("/")+"/";

		var new_file1, new_file2;
		new_file1 = path.join(pub, middle, decodeURI(page));
		new_file2 = path.join(pub, middle, decodeURI(page)+".html");

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
			var template_path = path.join(wiki_abs_dir, "/templates/nouwiki-default-template/template/dynamic/", "create.dot.jst");
			template = fs.readFileSync(template_path, 'utf8');

			this.status = 200;
			this.type = 'html';
			this.body = parse.parse(page, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nThis page has not been created yet.\n", config, template).html;
		}
	} else {
		var template;
		var template_path = path.join(wiki_abs_dir, "/templates/nouwiki-default-template/template/dynamic/", "create.dot.jst");
		template = fs.readFileSync(template_path, 'utf8');

		this.status = 200;
		this.type = 'html';
		this.body = parse.parse(page, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nThis page has not been created yet.\n", config, template).html;
	}
}

function getPage(url) {
	var page = decodeURI(url).split("/");
	page = page[page.length-1].split("?")[0];
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
	var config_src = path.join(wiki_path, "/nouwiki.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
	return toml.parse(config_src_string);
}

exports.serve = serve;
