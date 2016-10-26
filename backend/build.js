var path = require('path');
var fs = require('fs-extra');
var toml = require('toml');
var request = require('request');
var url = require('url');
var co = require('co');

var matter = require('gray-matter');
var markdownit = require('markdown-it');
var doT = require('dot');

//var git = require('./git');
var helpers = require('./helpers');

var parser;
var appDir = path.dirname(require.main.filename);
var root, plugins_path;
var conf;
var markup_dir, markup_files;
var templatePathsAndType;
var targets = ["fragment", "static", "dynamic"];
var overwritesDone = {};
for (var x in targets) {
	overwritesDone[targets[x]] = [];
}
var list = {};

function build(r, ta, te) {
	root = r;
	co(buildWiki(ta, te));
}

/*function gitAdd() {
  	console.log("ADD!1")
	git.addAndCommitFiles(root, ["*"], "add all after build");
}*/

function* buildWiki(ta, te) {
	conf = yield helpers.loadContentConfigs(root);
	conf.template = template || conf.template;
	helpers.resolveRelative(root, conf.nouwiki);
	helpers.browserPaths(isFS, conf.nouwiki);
	
	plugins_path = path.join(root, "/plugins");
	markup_dir = path.join(root, "/markup");
  	var fsreaddir = Promise.promisify(fs.readdir);
	markup_files = yield fsreaddir(markup_dir);
	templatePathsAndType = getTemplatePaths();
	parser = yield helpers.loadParser(root, conf.nouwiki.parser_BACKEND);

	for (var t in targets) {
		if (templatePathsAndType.type == "fs") {
			buildOverwriteFS(targets[t]);
			buildNormal();
		} else if (templatePathsAndType.type == "url") {
			buildOverwriteURL(targets[t]); // build normal is called within
		}
	}
}

function getTemplatePaths() {
	var t = {};

	if (helpers.isHTTP(conf.nouwiki.template_BACKEND)) {
		t.type = "url";
	} else {
		t.type = "fs";
	}

	for (var x in targets) {
		t[targets[x]] = {}
		if (t.type == "url") {
			t[targets[x]].pages_overwrite = url.resolve(conf.nouwiki.template_BACKEND+"/", "template/"+targets[x]+"/pages/");
			t[targets[x]].normal = url.resolve(conf.nouwiki.template_BACKEND+"/", "template/"+targets[x]+"/normal/page.dot.js");
		} else if (t.type == "fs") {
			t[targets[x]].pages_overwrite = path.join(root, conf.nouwiki.template_BACKEND, "/template/"+targets[x]+"/pages/");
			t[targets[x]].normal = path.join(root, conf.nouwiki.template_BACKEND, "/template/"+targets[x]+"/normal/page.dot.js");
		}
	}
	return t;
}

function buildNormal() {
	for (var t in targets) {
		if (templatePathsAndType.type == "fs") {
			buildNormalFS(targets[t]);
			//gitAdd();
		} else if (templatePathsAndType.type == "url") {
			buildNormalURL(targets[t]);
		}
	}
}

function buildOverwriteFS(target) {
	var overwrite_titles = conf.settings.pages_overwrite;
	for (var x = 0; x < overwrite_titles.length; x++) {
		var title = overwrite_titles[x]//.replace(/\.[^/.]+$/, ""); // remove extension
		var i = markup_files.indexOf(title+".md");
		if (i > -1) {
			overwritesDone[target].push(title+".md");
			try {
				var markup_file = path.join(markup_dir, markup_files[i]);
				var markup = fs.readFileSync(markup_file, 'utf8');
				var template_file = path.join(templatePathsAndType[target].pages_overwrite, overwrite_titles[x]);
				var template = fs.readFileSync(template_file, 'utf8');
				parseAndWriteFile(title, markup, template, target)
			} catch (e) {
				console.log(e);
			}
		}
	}
}

function buildOverwriteURL(target) {
	var overwrite_titles = conf.settings.pages_overwrite;
	for (var x = 0; x < overwrite_titles.length; x++) {
		var title = overwrite_titles[x]//.replace(/\.[^/.]+$/, ""); // remove extension
		var url = templatePathsAndType[target].pages_overwrite+title+".dot.js";
		var data = {
			"title": title,
			"target": target
		}
		helpers.getFile(url, data, subBuildOverwriteURL);
	}
}
function subBuildOverwriteURL(body, data) {
	if (body != false) {
		var template = body;
		try {
			var markup_file = path.join(markup_dir, data.title+".md");
			var markup = fs.readFileSync(markup_file, 'utf8');
			parseAndWriteFile(data.title, markup, template, data.target);
			overwritesDone[data.target].push(data.title+".md");
		} catch (e) {
			console.log(e);
		}
	}
	num -= 1;
	if (num == 0) {
		buildNormal();
	}
}

function buildNormalFS(target) {
	try {
		var template = fs.readFileSync(templatePathsAndType[target].normal, 'utf8');
		for (var x = 0; x < markup_files.length; x++) {
			if (markup_files[x] != ".git" && overwritesDone[target].indexOf(markup_files[x]) == -1) {
				try {
					var title = markup_files[x].replace(/\.[^/.]+$/, ""); // remove extension
					var markup_file = path.join(markup_dir, markup_files[x]);
					var markup = fs.readFileSync(markup_file, 'utf8');
					parseAndWriteFile(title, markup, template, target)
				} catch (e) {
					console.log(e);
				}
			}
		}
	} catch(e) {
		console.log(e);
	}
}

function buildNormalURL(target) {
	var url = templatePathsAndType[target].normal;
	helpers.getFile(url, {}, subBuildNormalURL);
}
function subBuildNormalURL(body, data) {
	var template = body;
	for (var x = 0; x < markup_files.length; x++) {
		if (markup_files[x] != ".git" && overwritesDone[target].indexOf(markup_files[x]) == -1) {
			var title = markup_files[x].replace(/\.[^/.]+$/, ""); // remove extension
			try {
				var markup_file = path.join(markup_dir, markup_files[x]);
				var markup = fs.readFileSync(markup_file, 'utf8');
				parseAndWriteFile(title, markup, template, target);
			} catch (e) {
				console.log(e);
			}
		}
	}
	//gitAdd();
}

function parseAndWriteFile(title, markup, template, target) {
	var plugins = helpers.getPlugins(title, plugins_path, helpers.getPluginJSON(plugins_path, conf.parser.plugins), target);
  	parser.init(markdownit, conf.parser.options, false, matter, doT)
	parser.loadPlugins(plugins);
	var data = parser.parse(conf, title, markup, template);
	var html_file;
	if (title == "index" && conf.settings.default_index == target) { // default index
		html_file = path.join(root, "index.html");
		fs.writeFileSync(html_file, data.page);
	}
	if (title == "index") { // target index
		html_file = path.join(root, target+".html");
		fs.writeFileSync(html_file, data.page);

		// Text is always based on fragment
		if (target == "fragment") {
			txt_file = path.join(root, "index.txt");
			fs.writeFileSync(txt_file, data.page.replace(/<(?:.|\n)*?>/gm, ''));
		}
	} else if (title != "index") { // page file
		if (target == "static") {
			html_file = path.join(root, "/static", title+".html");
			fs.writeFileSync(html_file, data.page);
		} else if (target == "fragment") {
			html_file = path.join(root, "/fragment", title+".html");
			fs.writeFileSync(html_file, data.page);
		}

		// Text is always based on fragment
		if (target == "fragment") { // text and fragment
			txt_file = path.join(root, "/text", title+".txt");
			fs.writeFileSync(txt_file, data.page.replace(/<(?:.|\n)*?>/gm, ''));
		}
	}
}

exports.build = build;
