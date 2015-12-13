var path = require('path');
var doT = require('dot');
var fs = require('fs-extra');
var dirTree = require('directory-tree');
var toml = require('toml');
var build = require('./build');

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

	var file_path, path_abs, config;

	var page = this.request.header.referer.split("/");
	page = page[page.length-1].split("?")[0];
	page = page || "index";

	var md = page+".md";
	var wiki = this.request.header.referer.split("/")
	wiki_url = wiki[wiki.length-2];
	if (roots.length > 1) {
		for (var p in roots) {
			var wiki = path.basename(roots[p]);
			if (wiki_url == wiki) {
				path_abs = roots[p];
				config = configs[p];
				file_path = path.join(roots[p], md);
				break;
			}
		}
	} else {
		path_abs = roots[0];
		config = configs[0];
		file_path = path.join(roots[0], "markup", md);
	}

	var updated = false;
	try {
		var data = yield cobody.text(this, {
	    limit: '1000kb'
	  });
		fs.writeFileSync(file_path, data);
		//build.buildMarkupFile(path_abs, file_path, config.target, true);
		build.buildMarkupFile(file_path, config, path_abs);
		updated = true;
	} catch (e) {
		console.log(e)
	}

	console.log(updated)
	if (!updated) {
    this.throw(405, "Unable to update.");
  } else {
		git.addAndCommitPage(path_abs, page, "page update");
    this.body = "Done";
  }
};

function *create() {
	if ('POST' != this.method) return yield next;

	var file_path, path_abs, config;

	var page = this.request.header.referer.split("/");
	page = page[page.length-1].split("?")[0];
	page = page || "index";

	var md = page+".md";
	var wiki = this.request.header.referer.split("/")
	wiki_url = wiki[wiki.length-2];
	if (roots.length > 1) {
		for (var p in roots) {
			var wiki = path.basename(roots[p]);
			if (wiki_url == wiki) {
				path_abs = roots[p];
				config = configs[p];
				file_path = path.join(roots[p], md);
				break;
			}
		}
	} else {
		path_abs = roots[0];
		config = configs[0];
		file_path = path.join(roots[0], "markup", md);
	}

	var created = false;
	var data;
	try {
		data = yield cobody.text(this, {
	    limit: '500kb'
	  });
		file_path = path.join(path_abs, "markup", data+".md");
		fs.writeFileSync(file_path, "+++\ntitle = \""+data+"\"\n+++\n\nEmpty page.\n");
		//build.buildMarkupFile(path_abs, file_path, config.target, true);
		build.buildMarkupFile(file_path, config, path_abs);
		created = true;
	} catch (e) {
		console.log(e)
	}

	console.log(created)
	if (!created) {
    this.throw(405, "Unable to create page.");
  } else {
		git.addAndCommitPage(path_abs, data, "page created");
    this.body = "Done";
  }
};


function *get_page() {
	if ('POST' != this.method) return yield next;

	var file_path, path_abs, config;

	var page = this.request.header.referer.split("/");
	page = page[page.length-1].split("?")[0];
	page = page || "index";

	var md = page+".md";
	var wiki = this.request.header.referer.split("/")
	wiki_url = wiki[wiki.length-2];
	if (roots.length > 1) {
		for (var p in roots) {
			var wiki = path.basename(roots[p]);
			if (wiki_url == wiki) {
				path_abs = roots[p];
				config = configs[p];
				file_path = path.join(roots[p], md);
				break;
			}
		}
	} else {
		path_abs = roots[0];
		config = configs[0];
		file_path = path.join(roots[0], "markup", md);
	}

	var gotten = false;
	var data, html;
	try {
		data = yield cobody.text(this, {
	    limit: '500kb'
	  });
		html = fs.readFileSync(path.join(path_abs, data+".html"), 'utf8');
		gotten = true;
	} catch (e) {
		console.log(e)
	}

	console.log(gotten)
	if (!gotten) {
    this.throw(405, "Unable to get page.");
  } else {
    this.body = html;
  }
};


function *pageNotFound(next){
	yield next;

	if (404 != this.status) return;

	var path_abs, config;

	var page = this.path.split("/");
	page = page[page.length-1].split("?")[0];
	page = page || "index";
	var root = this.path;
	if (this.path[this.path.length-1] != "/") {
	  root = this.path.replace("/"+page, "/");
	}
	var n = root.split("/").length;
	if (roots.length == 1 && n == 2 || roots.length > 1 && n == 3) { // If the URL really is a page URL
		var new_file;
		if (roots.length > 1) {
			var page = path.basename(this.path);
			var wiki_url = this.path.split("/")[1];
			for (var p in roots) {
				var wiki = path.basename(roots[p]);
				if (wiki_url == wiki) {
					path_abs = roots[p];
					config = configs[p];
					new_file = path.join(roots[p], page+".html");
					break;
				}
			}
		} else {
			path_abs = roots[0];
			config = configs[0];
			new_file = path.join(roots[0], this.path+".html");
		}
		try {
			var f = fs.statSync(new_file).isFile();
			if (f) {
				this.status = 200;
				this.type = 'html';
				this.body = fs.readFileSync(new_file);
			} else {
				console.log("not a file")
				this.status = 404;
			}
		} catch(e) {
			var template;
			var template_path = path.join(appDir, "/templates/default/dynamic/", "create.dot.jst");
			template = fs.readFileSync(template_path, 'utf8');

			this.status = 200;
			this.type = 'html';
			this.body = parse.parse("+++\ntitle = \""+page+"\"\n+++\n\nThis page has not been created yet.\n", config, template);
		}
	} else {
		console.log("not a page URL")
		this.status = 404;
	}
}

function serve(paths, port) {
	roots = paths;
	for (var p in roots) {
		var config_src = path.join(roots[p], "/config.toml");
		var config_src_string = fs.readFileSync(config_src, 'utf8');
		configs.push(toml.parse(config_src_string));
	}

	router.put('/api/modify', modify);
	router.post('/api/create', create);
	router.post('/api/get_page', get_page);

	// Serve wiki folder
	if (paths.length > 1) {
		for (var pa in paths) {
			var p = paths[pa];
			var wiki = path.basename(p);
			app.use(mount("/"+wiki+"/", serveStatic(p)));
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

	if (port == undefined) {
		port = 8080;
	}

	app
	  .use(router.routes())
	  .use(router.allowedMethods());
	app.listen(port);
}

exports.serve = serve;
