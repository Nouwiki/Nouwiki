var path = require('path');
var doT = require('dot');
var fs = require('fs-extra');
var parse = require('./parse');

var appDir = path.dirname(require.main.filename);

function buildWiki(path_abs, target) {
	var site = path.join(path_abs, "/site");
	removeAndCreateSiteDir(site, target);

	if (target == "all") {
		var template = path.join(appDir, "/templates/default");
		var index_src = path.join(template, "index.html");
		var index_dest = path.join(site, "index.html");
		fs.copySync(index_src, index_dest);
	}

	var markup_dir = path.join(path_abs, "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		var markup_file = path.join(markup_dir, markup_files[x]);
		buildMarkupFile(path_abs, markup_file, target);
	}
	buildAssets(site, target);
}

function removeAndCreateSiteDir(site, target) {
	fs.removeSync(site);
	fs.mkdirSync(site);

	if (target == "all") {
		var fragment = path.join(site, "/fragment");
		var stat = path.join(site, "/static");
		var dynamic = path.join(site, "/dynamic");
		fs.mkdirSync(fragment);
		fs.mkdirSync(stat);
		fs.mkdirSync(dynamic);
	}
}

function buildMarkupFile(root, markup_file, target) {
	var wiki = path.basename(root);
	var file_name = path.basename(markup_file, '.md') + ".html";
  var data = fs.readFileSync(markup_file, 'utf8');
	data = parse.parse(data);
	//var html = data.html;
	//var title = data.title;

	var site = path.join(root, "/site");
	if (target == "all") {
		buildAll(site, file_name, data)
	} else {
		var build_path = path.join(site, file_name);
		if (target == "fragment") {
				buildFragment(data, build_path);
		}
		if (target == "static") {
				buildStatic(data, wiki, build_path);
		}
		if (target == "dynamic") {
				buildDynamic(data, wiki, build_path);
		}
	}
}

function buildAll(site, file_name, data) {
	var fragment_path = path.join(site, "/fragment", file_name);
	buildFragment(file_name, data, fragment_path);
	var stat_path = path.join(site, "/static", file_name);
	buildStatic(file_name, data, wiki, stat_path);
	var dynamic_path = path.join(site, "/dynamic", file_name);
	buildDynamic(file_name, data, wiki, dynamic_path);
}

function buildFragment(data, build_path) {
  var fragment_path = build_path;
  var fragment = data.html;
  fs.writeFileSync(fragment_path, fragment);
}

function buildStatic(data, wiki, build_path) {
  var stat_path = build_path;
  var template_path = path.join(appDir, "/templates/default/", "static.html");
  var template_string = fs.readFileSync(template_path, 'utf8');
  var stat_template = doT.template(template_string);
  var stat = stat_template({wiki: wiki, title: data.title, content: data.html});
  fs.writeFileSync(stat_path, stat);
}

function buildDynamic(data, wiki, build_path) {
  var dynamic_path = build_path;
  var template_path = path.join(appDir, "/templates/default/", "dynamic.html");
  var template_string = fs.readFileSync(template_path, 'utf8');
  var dynamic_template = doT.template(template_string);
  var dynamic = dynamic_template({wiki: wiki, title: data.title, content: data.html});
  fs.writeFileSync(dynamic_path, dynamic);
}

function buildAssets(site, target) {
	var assets = path.join(site, "/assets");
	var stat_src = path.join(appDir, "/templates/default/static");
	var stat_dest = path.join(assets, "/static");
	fs.copySync(stat_src, stat_dest);

	if (target == "all" || target == "dynamic") {
		var dynamic_src = path.join(appDir, "/templates/default/dynamic");
		var dynamic_dest = path.join(assets, "/dynamic");
		fs.copySync(dynamic_src, dynamic_dest);	

		var ui_src = path.join(appDir, "/ui");
		var ui_dest = path.join(assets, "/ui");
		fs.copySync(ui_src, ui_dest);
	}
}

exports.buildWiki = buildWiki;
