var path = require('path');
var doT = require('dot');
var fs = require('fs-extra');
var parse = require('./parse');
var dirTree = require('directory-tree');
var toml = require('toml');

var appDir = path.dirname(require.main.filename);

var config;

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

function buildWiki(wiki_abs_dir, assets) {
	var config_src = path.join(wiki_abs_dir, "/config.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
	config = toml.parse(config_src_string);

	var site = path.join(wiki_abs_dir, "/"); // /site
	removeAndCreateSiteDir(site);

	var markup_dir = path.join(wiki_abs_dir, "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		var markup_file = path.join(markup_dir, markup_files[x]);
		buildMarkupFile(wiki_abs_dir, markup_file, config.target);
	}

	buildTemplateAssets(site);

	if (assets) {
		generateAssetPages(wiki_abs_dir);
	}
}

function removeAndCreateSiteDir(site) {
	var template_assets = path.join(site, "/template_assets");
	fs.removeSync(template_assets);
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

function buildTemplateAssets(site) {
	var template_assets = path.join(site, "/template_assets");

	var stat_src = path.join(appDir, "/templates/default/static");
	var stat_dest = path.join(template_assets, "/static");
	fs.copySync(stat_src, stat_dest);

	if (config.target == "dynamic") {
		var dynamic_src = path.join(appDir, "/templates/default/dynamic");
		var dynamic_dest = path.join(template_assets, "/dynamic");
		fs.copySync(dynamic_src, dynamic_dest);
	}
}

function generateAssetPages(root) {
	var assets_abs = path.join(root, "/assets");
	var tree = dirTree.directoryTree(assets_abs);
	if (tree != null) {
		markup = addMarkup("", tree.children, "", 0);
		data = '+++\ntitle = "User Assets"\n+++\n\n'+markup
		parseAndWriteMarkup(root, data, "__assets.html", config.target);
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
exports.buildMarkupFile = buildMarkupFile;
