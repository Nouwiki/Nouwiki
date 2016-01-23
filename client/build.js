var path = require('path');
var fs = require('fs-extra');
var parse = require('./parse');
var dirTree = require('directory-tree');
var toml = require('toml');

var git = require('./git');

var appDir = path.dirname(require.main.filename);

var config;

function buildWiki(wiki_abs_dir, assets, target) {
	var config_src = path.join(wiki_abs_dir, "/config.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
	config = toml.parse(config_src_string);
	var t = target || config.target;

	var site = path.join(wiki_abs_dir, "/"); // /site

	var markup_dir = path.join(wiki_abs_dir, "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		var markup_file = path.join(markup_dir, markup_files[x]);
		buildMarkupFile(markup_file, config, wiki_abs_dir, t);
		//git.addAndCommitPage(wiki_abs_dir, path.basename(markup_files[x], ".md"), "page build");
	}
	var pages = [];
	for (var x in markup_files) {
		pages.push(path.basename(markup_files[x], ".md"))
	}
	var files = [];
	for (var page in pages) {
		files.push(path.join(wiki_abs_dir, "markup", pages[page]+".md"));
		files.push(path.join(wiki_abs_dir, pages[page]+".html"));
	}
	console.log(files)
	git.addAndCommitFiles(wiki_abs_dir, files, "pages build");

	// This needs to be a seperate command: nouwiki update ./wiki_dir
	//updateDefaultTemplate(site);
	//updateUiFiles(site);
	readyTemplate(site);

	if (assets) {
		generateAssetPages(wiki_abs_dir);
	}
}

function buildMarkupFile(markup_file, config, wiki_abs_dir, target) {
	var markup = fs.readFileSync(markup_file, 'utf8');
	var template_markup;
	if (target == "static") {
		var template_path = path.join(appDir, "/templates/default/static/", "page.dot.jst");
		template_markup = fs.readFileSync(template_path, 'utf8');
	} else if (target == "dynamic") {
		var template_path = path.join(appDir, "/templates/default/dynamic/", "page.dot.jst");
		template_markup = fs.readFileSync(template_path, 'utf8');
	} else { // Default to dynamic if no target is specified
		var template_path = path.join(appDir, "/templates/default/dynamic/", "page.dot.jst");
		template_markup = fs.readFileSync(template_path, 'utf8');
	}
	var html = parse.parse(path.basename(markup_file, '.md'), markup, config, template_markup);
	var file_name = path.basename(markup_file, '.md') + ".html";
	var build_path = path.join(wiki_abs_dir, file_name);
	fs.writeFileSync(build_path, html);
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

function updateDefaultTemplate(site) {
	var temp_src = path.join(appDir, "/templates/default");
	var temp_dest = path.join(site, "/templates/default");

	try {
		var stats = fs.lstatSync(temp_dest);
		if (stats.isDirectory()) {
			fs.removeSync(temp_dest)
		}
	} catch(e) {
		console.log(e);
	}

	fs.copySync(temp_src, temp_dest);
}

function readyTemplate(site) {
	var temp = path.join(site, "/templates/"+config.template);
	var current = path.join(site, "/templates/current");

	try {
		var stats = fs.lstatSync(current);
		if (stats.isDirectory()) {
			fs.removeSync(current);
		}
	} catch(e) {
		console.log(e);
	}

	fs.copySync(temp, current);
}

function updateUiFiles(site) {
	var temp = path.join(site, "/templates");

	var nouwiki_ui_css_src = path.join(appDir, "/ui/css/nouwiki_ui.css");
	var nouwiki_ui_css_dest = path.join(temp, "/nouwiki_ui.css");
	fs.copySync(nouwiki_ui_css_src, nouwiki_ui_css_dest);

	var nouwiki_ui_js_src = path.join(appDir, "/ui/js/nouwiki_ui.js");
	var nouwiki_ui_js_dest = path.join(temp, "/nouwiki_ui.js");
	fs.copySync(nouwiki_ui_js_src, nouwiki_ui_js_dest);
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
