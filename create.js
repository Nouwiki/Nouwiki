var path = require('path');
var fs = require('fs-extra');

var appDir = path.dirname(require.main.filename);

function createWiki(p) {
	var path_abs = path.resolve(p);
	var wiki_name = path.basename(path_abs);
	createNewWikiDirStructure(path_abs);
	var markup_path = path.join(path_abs, "/markup");
	var index_path = path.join(markup_path, "/index.md");
	var index_markup = "+++\ntitle = \""+wiki_name+"\"\n+++\n\nWelcome to your new wiki!";
	fs.writeFileSync(index_path, index_markup);
	//buildWiki(path_abs);
	createConfigFile(path_abs, wiki_name);
}

function createNewWikiDirStructure(path_abs) {
	try {
		fs.mkdirSync(path_abs);
	} catch(e) {
		if ( e.code != 'EEXIST' ) throw e;
	}

	//var wiki_init = path.join(appDir, "/wiki_init");
	//var assets_init = path.join(wiki_init, "/assets");
	//var templates_init = path.join(wiki_init, "/templates");
	//var assets_dest = path.join(path_abs, "/assets");
	//var templates_dest = path.join(path_abs, "/templates");
	//fs.copySync(assets_init, assets_dest);
	//fs.copySync(templates_init, templates_dest);

	//var index_init = path.join(wiki_init, "index.html");
	//var index_dest = path.join(path_abs, "index.html");
	//fs.copySync(index_init, index_dest);

	createEmptyDirs(path_abs);

	//var app_assets_src = path.join(appDir, "/assets");
	//var app_assets_dest = path.join(path_abs, "/assets/core");
	//fs.symlinkSync(app_assets_src, app_assets_dest);

	//var templates_src = path.join(appDir, "/templates/default");
	//var templates_dest = path.join(path_abs, "/templates/default");
	//fs.symlinkSync(templates_src, templates_dest);
}

function createEmptyDirs(path_abs) {
	var assets = path.join(path_abs, "/assets");
	var audio = path.join(assets, "/audio");
	var style = path.join(assets, "/style");
	var font = path.join(assets, "/font");
	var img = path.join(assets, "/img");
	var js = path.join(assets, "/js");
	var text = path.join(assets, "/text");
	var video = path.join(assets, "/video");
	fs.mkdirSync(assets);
	fs.mkdirSync(audio);
	fs.mkdirSync(style);
	fs.mkdirSync(font);
	fs.mkdirSync(img);
	fs.mkdirSync(js);
	fs.mkdirSync(text);
	fs.mkdirSync(video);

	//var assets = path.join(path_abs, "/assets");
	//fs.mkdirSync(assets);

	//var dynamic = path.join(path_abs, "/dynamic");
	//var fragment = path.join(path_abs, "/fragment");
	var markup = path.join(path_abs, "/markup");
	//var md_html = path.join(path_abs, "/md.html");
	//var stat = path.join(path_abs, "/static");
	//fs.mkdirSync(dynamic);
	//fs.mkdirSync(fragment);
	fs.mkdirSync(markup);
	//fs.mkdirSync(md_html);
	//fs.mkdirSync(stat);

	var templates = path.join(path_abs, "/templates");
	fs.mkdirSync(templates);

	/*var site = path.join(path_abs, "/site");
	fs.mkdirSync(site);*/

	//var core = path.join(path_abs, "/.core");
	//fs.mkdirSync(core);
}

function createConfigFile(path_abs, wiki_name) {
	var config_dest = path.join(path_abs, "/config.toml");
	var config_string = 'title = "'+wiki_name+'"\njs = []\ncss = []';
	fs.writeFileSync(config_dest, config_string);
}

exports.createWiki = createWiki;
