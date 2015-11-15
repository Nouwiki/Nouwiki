var path = require('path');
var doT = require('dot');
var fs = require('fs-extra');
var parse = require('./parse');
var dirTree = require('directory-tree');
var toml = require('toml');

var appDir = path.dirname(require.main.filename);

function buildWiki(path_abs, target, assets, copy) {
	var site = path.join(path_abs, "/"); // /site
	removeAndCreateSiteDir(site, target);

	if (target == "all") {
		/*var template = path.join(appDir, "/templates/default");
		var index_src = path.join(template, "index.html");
		var index_dest = path.join(site, "index.html");
		fs.copySync(index_src, index_dest);*/
	}

	var markup_dir = path.join(path_abs, "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		var markup_file = path.join(markup_dir, markup_files[x]);
		buildMarkupFile(path_abs, markup_file, target);
	}

	buildTemplateAssets(site, target);
	/*if (copy) {
		copyAssets(path_abs);
		copyMarkup(path_abs);
	} else {
		linkAssets(path_abs);
		linkMarkup(path_abs);
	}*/

	if (assets) {
		generateAssetPages(path_abs, target);
	}
}

function removeAndCreateSiteDir(site, target) {
	var template_assets = path.join(site, "/assets/template_assets");
	fs.removeSync(template_assets);
	//fs.mkdirSync(site);

	if (target == "all") {
		/*var fragment = path.join(site, "/fragment");
		var stat = path.join(site, "/static");
		var dynamic = path.join(site, "/dynamic");
		fs.mkdirSync(fragment);
		fs.mkdirSync(stat);
		fs.mkdirSync(dynamic);*/
	}
}

function buildMarkupFile(root, markup_file, target) {
	var file_name = path.basename(markup_file, '.md') + ".html";
	var data = fs.readFileSync(markup_file, 'utf8');
	parseAndWriteMarkup(root, data, file_name, target);
}

function parseAndWriteMarkup(root, data, file_name, target) {
	var wiki = path.basename(root);
	data = parse.parse(data); // .html .content.*

	var config_src = path.join(root, "/config.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
	var global_data = toml.parse(config_src_string);

	template_data = {
		wiki: wiki,
		html: data.html,
		title: data.content.title,
		local_js: data.content.js,
		local_css: data.content.css,
		global_js: global_data.js,
		global_css: global_data.css
	}

	var site = path.join(root, "/"); // /site
	if (target == "all") {
		//buildAll(site, file_name, template_data);
	} else {
		var build_path = path.join(site, file_name);
		if (target == "fragment") {
				buildFragment(template_data, build_path);
		}
		if (target == "static") {
				buildStatic(template_data, build_path);
		}
		if (target == "dynamic") {
				buildDynamic(template_data, build_path);
		}
	}
}

function buildAll(site, file_name, template_data) {
	/*var fragment_path = path.join(site, "/fragment", file_name);
	buildFragment(template_data, fragment_path);
	var stat_path = path.join(site, "/static", file_name);
	buildStatic(template_data, stat_path);
	var dynamic_path = path.join(site, "/dynamic", file_name);
	buildDynamic(template_data, dynamic_path);*/
}

function buildFragment(template_data, build_path) {
  var fragment_path = build_path;
  var fragment = template_data.html;
  fs.writeFileSync(fragment_path, fragment);
}

function buildStatic(template_data, build_path) {
  var stat_path = build_path;
  var template_path = path.join(appDir, "/templates/default/", "static.html");
  var template_string = fs.readFileSync(template_path, 'utf8');
  var stat_template = doT.template(template_string);
  var stat = stat_template(template_data);
  fs.writeFileSync(stat_path, stat);
}

function buildDynamic(template_data, build_path) {
  var dynamic_path = build_path;
  var template_path = path.join(appDir, "/templates/default/", "dynamic.html");
  var template_string = fs.readFileSync(template_path, 'utf8');
  var dynamic_template = doT.template(template_string);
  var dynamic = dynamic_template(template_data);
  fs.writeFileSync(dynamic_path, dynamic);
}

function buildTemplateAssets(site, target) {
	var template_assets = path.join(site, "/assets/template_assets");

	var stat_src = path.join(appDir, "/templates/default/static");
	var stat_dest = path.join(template_assets, "/static");
	fs.copySync(stat_src, stat_dest);

	if (/*target == "all" || */target == "dynamic") {
		var dynamic_src = path.join(appDir, "/templates/default/dynamic");
		var dynamic_dest = path.join(template_assets, "/dynamic");
		fs.copySync(dynamic_src, dynamic_dest);
	}
}

/*function linkAssets(root) {
	var assets_abs = path.join(root, "/assets");
	var site = path.join(root, "/site");
	var assets_dest = path.join(site, "/assets");
	var assets_src = path.relative(site, assets_abs);
	fs.symlinkSync(assets_src, assets_dest);
}

function copyAssets(root) {
	var assets_abs = path.join(root, "/assets");
	var site = path.join(root, "/site");
	var assets_dest = path.join(site, "/assets");
	fs.copySync(assets_abs, assets_dest);
}

function linkMarkup(root) {
	var markup_abs = path.join(root, "/markup");
	var site = path.join(root, "/site");
	var markup_dest = path.join(site, "/markup");
	var markup_src = path.relative(site, markup_abs);
	fs.symlinkSync(markup_src, markup_dest);
}

function copyMarkup(root) {
	var markup_abs = path.join(root, "/markup");
	var site = path.join(root, "/site");
	var markup_dest = path.join(site, "/markup");
	fs.copySync(markup_abs, markup_dest);
}*/

function generateAssetPages(root, target) {
	var assets_abs = path.join(root, "/assets");
	var tree = dirTree.directoryTree(assets_abs);
	if (tree != null) {
		markup = addMarkup("", tree.children, "", 0);
		data = '+++\ntitle = "User Assets"\n+++\n\n'+markup
		parseAndWriteMarkup(root, data, "__assets.html", target);
	}
}

function addMarkup(markup, a, tab, level) {
	for (var p in a) {
		if (a[p].type == "file") {
			var file_name = path.basename(a[p].name);
			var href = path.join("assets/assets/", a[p].path);
			markup += tab+"- ["+file_name+"](<"+href+">)\n";
		} else {
			if (level == 0) {
				markup += "## "+a[p].name+"\n";
			} else if (level == 1) {
				markup += "### "+a[p].name+"\n";
			} else {
				markup += tab+"- "+a[p].name+"\n";
			}
		}
		if (a[p].children != undefined && a[p].children.length > 0) {
			var new_tab = tab;
			if (level > 1) {
				new_tab += "    ";
			}
			markup = addMarkup(markup, a[p].children, new_tab, level+1);
		}
	}
	return markup;
}

exports.buildWiki = buildWiki;
