#!/usr/bin/env node

var path = require('path');
var fs = require('fs-extra');
var doT = require('dot');
var program = require('commander');

var build = require('./build');

program
  .version('0.0.1')

program
  .command('new <type> [paths...]')
  .action(function (type, paths) {
    if (type == "wiki") {
    	for (var x = 0; x < paths.length; x++) {
    		createWiki(paths[x])
    	}
    } else if (type == "page") {

    }
  });

program.parse(process.argv);

function createWiki(p) {
	var path_abs = path.resolve(p);
	var wiki_name = path.basename(path_abs);
	createNewWikiDirStructure(path_abs);
	//createNewWikiFiles(path_abs);
	var markup_path = path.join(path_abs, "/markup");
	var index_path = path.join(markup_path, "/index.md");
	var index_markup = "+++\ntitle: \""+wiki_name+"\"\n+++\n\n Welcome to your new wiki!";
	fs.writeFileSync(index_path, index_markup);
	buildWiki(path_abs);
}

function createNewWikiDirStructure(path_abs) {
	var lib = path.resolve("./");
	var wiki_init = path.join(lib, "/wiki_init");
	fs.copySync(wiki_init, path_abs);
}

/*function createNewWikiFiles(path_abs) {
	var assets = path.join(path_abs, "/assets");

	var audio = path.join(assets, "/audio");
	var css = path.join(assets, "/css");
	var font = path.join(assets, "/font");
	var img = path.join(assets, "/img");
	var js = path.join(assets, "/js");
	var text = path.join(assets, "/text");
	var video = path.join(assets, "/video");


	var lib = path.resolve("./");

	var	lib_assets = path.join(lib, "/assets");

	var lib_audio = path.join(lib_assets, "/audio");
	var lib_css = path.join(lib_assets, "/css");
	var lib_font = path.join(lib_assets, "/font");
	var lib_img = path.join(lib_assets, "/img");
	var lib_js = path.join(lib_assets, "/js");
	var lib_text = path.join(lib_assets, "/text");
	var lib_video = path.join(lib_assets, "/video");

	var style_css_destination = path.join(css, "/style.css");
	var style_css_path = path.join(lib_css, "/style.css");
	fs.symlinkSync(style_css_path, style_css_destination);

	var ui_css_destination = path.join(css, "/ui.css");
	var ui_css_path = path.join(lib_css, "/ui.css");
	fs.symlinkSync(ui_css_path, ui_css_destination);

	var normalize_css_destination = path.join(css, "/normalize.css");
	var normalize_css_path = path.join(lib_css, "/normalize.css");
	fs.symlinkSync(normalize_css_path, normalize_css_destination);

	var content_css_destination = path.join(css, "/content.css");
	var content_css_path = path.join(lib_css, "/content.css");
	fs.symlinkSync(content_css_path, content_css_destination);
}*/

function buildWiki(path_abs) {
	var markup_dir = path.join(path_abs, "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		var markup_file = path.join(markup_dir, markup_files[x]);
		buildMarkupFile(path_abs, markup_file);
	}
}

function buildMarkupFile(root, markup_file) {
	var wiki = path.basename(root);
	var title = path.basename(markup_file, '.md');
	var file = title;
	if (file == "index") {
		file += ".html";
	}
	var html = build.build(markup_file);

	var fragment_path = path.join(root, "/fragment", file);
	var fragment = html;
	fs.writeFileSync(fragment_path, fragment);

	var stat_path = path.join(root, "/static", file);
	var template_path = path.join(root, "/templates", "page.html");
	var template_string = fs.readFileSync(template_path, 'utf8');
	var stat_template = doT.template(template_string);
	var stat = stat_template({wiki: wiki, title: title, content: html});
	fs.writeFileSync(stat_path, stat);
}