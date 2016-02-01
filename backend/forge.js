var path = require('path');
var fs = require('fs-extra');

var git = require('./git');

var appDir = path.dirname(require.main.filename);
var defaultTemplateDir = path.join(appDir, "/node_modules", "/nouwiki-default-template");

function createWiki(p) {
	var wiki_abs_dir = path.resolve(p);
	var wiki_name = path.basename(wiki_abs_dir);

	createNewWikiDirStructure(wiki_abs_dir);

	var pub = path.join(wiki_abs_dir, "/public");
	var markup_path = path.join(pub, "/markup");
	var index_path = path.join(markup_path, "/index.md");
	var index_markup = "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+wiki_name+"\n\nWelcome to your new wiki!";
	fs.writeFileSync(index_path, index_markup);

	createConfigFile(wiki_abs_dir, wiki_name);
	copyDefaultTemplate(wiki_abs_dir);
	copyUiFiles(wiki_abs_dir);

	console.log(wiki_abs_dir)
	git.initRepo(pub+"/markup/");
}

function createNewWikiDirStructure(wiki_abs_dir) {
	try {
		fs.mkdirSync(wiki_abs_dir);
	} catch(e) {
		if ( e.code != 'EEXIST' ) throw e;
	}

	var templates = path.join(wiki_abs_dir, "/templates");
	fs.mkdirSync(templates);
	createPublicDir(wiki_abs_dir);
	createAssetsDir(wiki_abs_dir);
}

function createPublicDir(wiki_abs_dir) {
	var pub = path.join(wiki_abs_dir, "/public");
	var markup = path.join(pub, "/markup");
	var fragment = path.join(pub, "/fragment");
	var text = path.join(pub, "/texts");
	var css = path.join(pub, "/css");
	var js = path.join(pub, "/js");

	fs.mkdirSync(pub);
	fs.mkdirSync(markup);
	fs.mkdirSync(fragment);
	fs.mkdirSync(text);
	fs.mkdirSync(css);
	fs.mkdirSync(js);
}

function createAssetsDir(wiki_abs_dir) {
	var pub = path.join(wiki_abs_dir, "/public");
	var assets = path.join(pub, "/assets");
	var audio = path.join(assets, "/audio");
	var font = path.join(assets, "/font");
	var html = path.join(assets, "/html");
	var img = path.join(assets, "/img");
	var js = path.join(assets, "/js");
	var pdf = path.join(assets, "/pdf");
	var style = path.join(assets, "/style");
	var text = path.join(assets, "/text");
	var video = path.join(assets, "/video");
	fs.mkdirSync(assets);
	fs.mkdirSync(audio);
	fs.mkdirSync(font);
	fs.mkdirSync(html);
	fs.mkdirSync(img);
	fs.mkdirSync(js);
	fs.mkdirSync(pdf);
	fs.mkdirSync(style);
	fs.mkdirSync(text);
	fs.mkdirSync(video);
}

function createConfigFile(wiki_abs_dir, wiki_name) {
	var config_dest = path.join(wiki_abs_dir, "/config.toml");
	var config_string = 'wiki = "'+wiki_name+'"\nimport = []\ncss = []\njs = []\ntarget = "dynamic"\ntemplate = "nouwiki-default-template"\nfragment = true\ntext = true';
	fs.writeFileSync(config_dest, config_string);
}

function copyDefaultTemplate(wiki_abs_dir) {
	var temp_dest = path.join(wiki_abs_dir, "/templates/nouwiki-default-template");
	fs.copySync(defaultTemplateDir, temp_dest);
}

function copyUiFiles(wiki_abs_dir) {
	var pub = path.join(wiki_abs_dir, "/public");
	var temp = path.join(wiki_abs_dir, "/templates/nouwiki-default-template");

	var nouwiki_ui_css_src = path.join(appDir, "/frontend/css/nouwiki.ui.css");
	var nouwiki_ui_css_dest = path.join(pub, "/css/nouwiki.ui.css");
	fs.copySync(nouwiki_ui_css_src, nouwiki_ui_css_dest);

	var nouwiki_ui_js_src = path.join(appDir, "/frontend/js/nouwiki.ui.js");
	var nouwiki_ui_js_dest = path.join(pub, "/js/nouwiki.ui.js");
	fs.copySync(nouwiki_ui_js_src, nouwiki_ui_js_dest);
}

exports.createWiki = createWiki;
