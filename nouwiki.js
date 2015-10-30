#!/usr/bin/env node

var path = require('path');
var fs = require('fs-extra');
var doT = require('dot');
var program = require('commander');

var appDir = path.dirname(require.main.filename);

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

program
  .command('build [paths...]')
  .action(function (paths) {
    var path_abs;
    if (paths.length != 0) {
	    for (var x = 0; x < paths.length; x++) {
	    	path_abs = path.resolve(paths[x]);
			buildWiki(path_abs)
		}
    } else {
    	path_abs = path.resolve("./");
		buildWiki(path_abs)
    }
  });

program.parse(process.argv);

function createWiki(p) {
	var path_abs = path.resolve(p);
	var wiki_name = path.basename(path_abs);
	createNewWikiDirStructure(path_abs);
	var markup_path = path.join(path_abs, "/markup");
	var index_path = path.join(markup_path, "/index.md");
	var index_markup = "+++\ntitle = \""+wiki_name+"\"\n+++\n\n Welcome to your new wiki!";
	fs.writeFileSync(index_path, index_markup);
	buildWiki(path_abs);
}

function createNewWikiDirStructure(path_abs) {
	try {
		fs.mkdirSync(path_abs);
	} catch(e) {
		if ( e.code != 'EEXIST' ) throw e;
	}

	var wiki_init = path.join(appDir, "/wiki_init");
	var assets_init = path.join(wiki_init, "/assets");
	var templates_init = path.join(wiki_init, "/templates");
	var assets_dest = path.join(path_abs, "/assets");
	var templates_dest = path.join(path_abs, "/templates");
	fs.copySync(assets_init, assets_dest);
	fs.copySync(templates_init, templates_dest);

	var index_init = path.join(wiki_init, "index.html");
	var index_dest = path.join(path_abs, "index.html");
	fs.copySync(index_init, index_dest);

	createEmptyDirs(path_abs);
}

function createEmptyDirs(path_abs) {
	var assets = path.join(path_abs, "/assets");
	var audio = path.join(assets, "/audio");
	//var css = path.join(assets, "/css");
	var font = path.join(assets, "/font");
	var img = path.join(assets, "/img");
	//var js = path.join(assets, "/js");
	var text = path.join(assets, "/text");
	var video = path.join(assets, "/video");
	fs.mkdirSync(audio);
	//fs.mkdirSync(css);
	fs.mkdirSync(font);
	fs.mkdirSync(img);
	//fs.mkdirSync(js);
	fs.mkdirSync(text);
	fs.mkdirSync(video);

	var dynamic = path.join(path_abs, "/dynamic");
	var fragment = path.join(path_abs, "/fragment");
	var markup = path.join(path_abs, "/markup");
	var md_html = path.join(path_abs, "/md.html");
	var stat = path.join(path_abs, "/static");
	fs.mkdirSync(dynamic);
	fs.mkdirSync(fragment);
	fs.mkdirSync(markup);
	fs.mkdirSync(md_html);
	fs.mkdirSync(stat);

	//var templates = path.join(path_abs, "/templates");
	//fs.mkdirSync(templates);
}

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
	var file_name = path.basename(markup_file, '.md') + ".html";
	var data = build.build(markup_file);
	var html = data.html;
	var title = data.title;

	var fragment_path = path.join(root, "/fragment", file_name);
	var fragment = html;
	fs.writeFileSync(fragment_path, fragment);

	var stat_path = path.join(root, "/static", file_name);
	var template_path = path.join(root, "/templates", "static.html");
	var template_string = fs.readFileSync(template_path, 'utf8');
	var stat_template = doT.template(template_string);
	var stat = stat_template({wiki: wiki, title: title, content: html});
	fs.writeFileSync(stat_path, stat);
}