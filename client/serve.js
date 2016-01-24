var path = require('path');
var doT = require('dot');
var fs = require('fs-extra');
var dirTree = require('directory-tree');
var toml = require('toml');
var build = require('./build');
var portfinder = require('portfinder');

var parse = require('./parse');
var git = require('./git');

var appDir = path.dirname(require.main.filename);

var koa = require('koa');
var serveStatic = require('koa-static');
var mount = require('koa-mount');
var router = require('koa-router')();
var cobody = require('co-body');
var send = require('koa-send');
var app = koa();

var roots;
var configs = [];

function *modify() {
	if ('PUT' != this.method) return yield next;

	var file_path, html_path, path_abs, config;

	try {
		var data = yield cobody.text(this, {
			limit: '1000kb'
		});

		var page = getPage(this.request.header.referer);
		var md = page+".md";
		if (roots.length > 1) {
			var wiki = this.request.header.referer.split("/")
			wiki_url = wiki[wiki.length-2];
			var i = getWikiIndex(wiki_url);
			path_abs = roots[i];
			config = configs[i];
			file_path = path.join(roots[i], "markup", md);
			html_path = path.join(roots[i], page+".html");
		} else {
			path_abs = roots[0];
			config = configs[0];
			file_path = path.join(roots[0], "markup", md);
			html_path = path.join(roots[0], page+".html");
		}

		fs.writeFileSync(file_path, data);
		build.buildMarkupFile(path_abs, file_path, config, path_abs);

		git.addAndCommitFiles(path_abs, [file_path, html_path], "page update");
		this.body = "Done";
	} catch(e) {
		this.throw(405, "Unable to update.");
	}
};

function *create() {
	if ('POST' != this.method) return yield next;

	var file_path, html_path, path_abs, config;

	try {
		var page = yield cobody.text(this, {
			limit: '500kb'
		});
		page = decodeURI(page);
		var md = page+".md";
		if (roots.length > 1) {
			var wiki = this.request.header.referer.split("/");
			var wiki_url = wiki[wiki.length-2];
			var i = getWikiIndex(wiki_url);
			path_abs = roots[i];
			config = configs[i];
			file_path = path.join(roots[i], "markup", md);
			html_path = path.join(roots[i], page+".html");
		} else {
			path_abs = roots[0];
			config = configs[0];
			file_path = path.join(roots[0], "markup", md);
			html_path = path.join(roots[0], page+".html");
		}

		file_path = path.join(path_abs, "markup", page+".md");
		fs.writeFileSync(file_path, "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+page+"\n\nEmpty page.\n");
		build.buildMarkupFile(path_abs, file_path, config, path_abs);

		git.addAndCommitFiles(path_abs, [file_path, html_path], "page created");
    this.body = "Done";
	} catch(e) {
		this.throw(405, "Unable to create page.");
	}
};


function *get_page() {
	if ('POST' != this.method) return yield next;

	var file_path, path_abs, config;
	try {
		var page = yield cobody.text(this, {
	    limit: '500kb'
	  });

		var md = decodeURI(page+".md");
		if (roots.length > 1) {
			var wiki = this.request.header.referer.split("/")
			var wiki_url = wiki[wiki.length-2];
			var i = getWikiIndex(wiki_url);
			path_abs = roots[i];
			config = configs[i];
			file_path = path.join(roots[i], md);
		} else {
			path_abs = roots[0];
			config = configs[0];
			file_path = path.join(roots[0], "markup", md);
		}

		var html = fs.readFileSync(path.join(path_abs, page+".html"), 'utf8');
		this.body = html;
	} catch(e) {
		this.throw(405, "Unable to get page.");
	}
};

function *remove() {
	if ('POST' != this.method) return yield next;

	var file_path, html_path, path_abs, config;

	try {
		var page = yield cobody.text(this, {
			limit: '500kb'
		});
		page = decodeURI(page);
		var md = page+".md";
		if (roots.length > 1) {
			var wiki = this.request.header.referer.split("/");
			var wiki_url = wiki[wiki.length-2];
			var i = getWikiIndex(wiki_url);
			path_abs = roots[i];
			config = configs[i];
			file_path = path.join(roots[i], "markup", md);
			html_path = path.join(roots[i], page+".html");
		} else {
			path_abs = roots[0];
			config = configs[0];
			file_path = path.join(roots[0], "markup", md);
			html_path = path.join(roots[0], page+".html");
		}

		git.removeAndCommitFiles(path_abs, [file_path, html_path], "page removed");
		fs.removeSync(file_path);
		fs.removeSync(html_path);
    this.body = "Done";
	} catch(e) {
		this.throw(405, "Unable to remove page.");
	}
};

function *pageNotFound(next){
	yield next;

	if (404 != this.status) return;

	var path_abs, config;

	var page = getPage(this.path);
	var root = this.path;
	if (this.path[this.path.length-1] != "/") {
	  root = this.path.replace("/"+page, "/");
	}
	var n = root.split("/").length;
	if (roots.length == 1 && n == 2 || roots.length > 1 && n == 3) { // If the URL really is a page URL: if we're serving 1 wiki thr / split should be 2, else 3.
		var new_file1, new_file2;
		if (roots.length > 1) {
			var wiki_url = this.path.split("/")[1];
			var i = getWikiIndex(wiki_url);
			path_abs = roots[i];
			config = configs[i];
			new_file1 = path.join(roots[i], decodeURI(page));
			new_file2 = path.join(roots[i], decodeURI(page)+".html");
		} else {
			path_abs = roots[0];
			config = configs[0];
			new_file1 = path.join(roots[0], decodeURI(this.path));
			new_file2 = path.join(roots[0], decodeURI(this.path)+".html");
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
			var template_path = path.join(path_abs, "/templates/default/dynamic/", "create.dot.jst");
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

function *grep_pages() {
	if ('POST' != this.method) return yield next;

	var result = [];
	try {
		var text = yield cobody.text(this, {
			limit: '500kb'
		});
		text = text.toLowerCase();
		var markup = path.join(roots[0], "markup");
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


function serve(paths, port) {
	roots = paths;
	for (var p in roots) {
		var config_src = path.join(roots[p], "/config.toml");
		var config_src_string = fs.readFileSync(config_src, 'utf8');
		configs.push(toml.parse(config_src_string));
	}

	// API
	router.put('/api/modify', modify);
	router.post('/api/create', create);
	router.post('/api/get_page', get_page);
	router.post('/api/delete', remove);
	router.post('/api/grep_pages', grep_pages);

	// Serve wiki folder
	if (paths.length > 1) {
		for (var pa in paths) {
			var p = paths[pa];
			var wiki = path.basename(p);
			app.use(mount("/"+wiki+"/", serveStatic(p)));
			// If you enter the wiki without a trailing slash, add the slash and redirect
			router.get('/'+wiki, function *(next) {
				this.redirect(this.request.url+'/');
			  this.status = 301;
		  });
		}
	} else {
		var p = paths[0];
		app.use(serveStatic(p));
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
	for (var i in roots) {
		var wiki = path.basename(roots[i]);
		if (wiki_url == wiki) {
			return i;
		}
	}
	return -1;
}

exports.serve = serve;
