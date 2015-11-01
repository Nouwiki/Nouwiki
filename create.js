var path = require('path');
var fs = require('fs-extra');

var appDir = path.dirname(require.main.filename);

function createWiki(p) {
	var path_abs = path.resolve(p);
	var wiki_name = path.basename(path_abs);
	createNewWikiDirStructure(path_abs);
	var markup_path = path.join(path_abs, "/markup");
	var index_path = path.join(markup_path, "/index.md");
	var index_markup = "+++\ntitle = \""+wiki_name+"\"\n+++\n\n Welcome to your new wiki!";
	fs.writeFileSync(index_path, index_markup);
	//buildWiki(path_abs);
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

exports.createWiki = createWiki;
