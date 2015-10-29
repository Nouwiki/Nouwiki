#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var build = require('./build');
var program = require('commander');

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
	try {
		createNewWikiDirStructure(path_abs);
		console.log("foldure structure created");
	} catch(e) {
		if ( e.code == 'EEXIST' ) {
			console.log("ERROR: Directory already exists!")
		}
	}
	var markup = path.join(path_abs, "/markup");
	var index = path.join(markup, "/index.md");
	var index_markup = "---\ntitle = '"+wiki_name+"'\n---\n\n Welcome to your new wiki!";
	fs.writeFileSync(index, index_markup);
	buildWiki(path_abs);
}

function createNewWikiDirStructure(path_abs) {
	var root = path_abs;
	fs.mkdirSync(root);

	var markup = path.join(path_abs, "/markup");
	var site = path.join(path_abs, "/site");
	fs.mkdirSync(markup);
	fs.mkdirSync(site);

	var assets = path.join(site, "/assets");
	fs.mkdirSync(assets);
	var audio = path.join(assets, "/audio");
	var css = path.join(assets, "/css");
	var font = path.join(assets, "/font");
	var img = path.join(assets, "/img");
	var js = path.join(assets, "/js");
	var text = path.join(assets, "/text");
	var video = path.join(assets, "/video");
	fs.mkdirSync(audio);
	fs.mkdirSync(css);
	fs.mkdirSync(font);
	fs.mkdirSync(img);
	fs.mkdirSync(js);
	fs.mkdirSync(text);
	fs.mkdirSync(video);

	var build = path.join(site, "/build");
	fs.mkdirSync(build);
	var dynamic = path.join(build, "/dynamic");
	var fragment = path.join(build, "/fragment");
	var md_html = path.join(build, "/md.html");
	var stat = path.join(build, "/static");
	fs.mkdirSync(dynamic);
	fs.mkdirSync(fragment);
	fs.mkdirSync(md_html);
	fs.mkdirSync(stat);
}

function buildWiki(path_abs) {
	var markup_dir = path.join(path_abs, "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		var markup_file = path.join(markup_dir, markup_files[x]);
		buildMarkupFile(markup_file);
	}
}

function buildMarkupFile(markup_file) {
	var html = build.build(markup_file);
	console.log(html);
}