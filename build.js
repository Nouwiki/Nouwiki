var path = require('path');
var fs = require('fs-extra');
var parse = require('./parse');
var dirTree = require('directory-tree');
var toml = require('toml');

var parse = require('./parse');

var appDir = path.dirname(require.main.filename);

var config;

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
		buildMarkupFile(markup_file, config, wiki_abs_dir);
	}

	buildTemplateAssets(site);

	if (assets) {
		generateAssetPages(wiki_abs_dir);
	}
}

function buildMarkupFile(markup_file, config, wiki_abs_dir) {
	var wiki = path.basename(wiki_abs_dir);
	var markup = fs.readFileSync(markup_file, 'utf8');
	var template;
	if (config.target == "static") {
		var template_path = path.join(appDir, "/templates/default/static/", "static.dot.jst");
		template = fs.readFileSync(template_path, 'utf8');
	} else if (config.target == "dynamic") {
		var template_path = path.join(appDir, "/templates/default/dynamic/", "dynamic.dot.jst");
		template = fs.readFileSync(template_path, 'utf8');
	}
	var html = parse.parse(markup, config, template, wiki);
	var file_name = path.basename(markup_file, '.md') + ".html";
	var build_path = path.join(wiki_abs_dir, file_name);
	fs.writeFileSync(build_path, html);
}

function removeAndCreateSiteDir(site) {
	var template_assets = path.join(site, "/template_assets");
	fs.removeSync(template_assets);
}

function buildTemplateAssets(site) {
	var template_assets = path.join(site, "/template_assets");

	var stat_src = path.join(appDir, "/templates/default");
	var stat_dest = template_assets;
	fs.copySync(stat_src, stat_dest);
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
