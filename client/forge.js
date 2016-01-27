var path = require('path');
var fs = require('fs-extra');

var git = require('./git');

var appDir = path.dirname(require.main.filename);
var defaultTemplateDir = path.join(appDir, "/node_modules", "/nouwiki-default-template");

function createWiki(p) {
	var wiki_abs_dir = path.resolve(p);
	var wiki_name = path.basename(wiki_abs_dir);

	createNewWikiDirStructure(wiki_abs_dir);

	var markup_path = path.join(wiki_abs_dir, "/markup");
	var index_path = path.join(markup_path, "/index.md");
	var index_markup = "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+wiki_name+"\n\nWelcome to your new wiki!";
	fs.writeFileSync(index_path, index_markup);

	createConfigFile(wiki_abs_dir, wiki_name);
	copyDefaultTemplate(wiki_abs_dir);
	copyUiFiles(wiki_abs_dir);

	console.log(wiki_abs_dir)
	git.initRepo(wiki_abs_dir+"/");
}

function createNewWikiDirStructure(wiki_abs_dir) {
	try {
		fs.mkdirSync(wiki_abs_dir);
	} catch(e) {
		if ( e.code != 'EEXIST' ) throw e;
	}
	createEmptyDirs(wiki_abs_dir);
}

function createEmptyDirs(wiki_abs_dir) {
	var assets = path.join(wiki_abs_dir, "/assets");
	var audio = path.join(assets, "/audio");
	var font = path.join(assets, "/font");
	var html = path.join(assets, "/html");
	var img = path.join(assets, "/img");
	var js = path.join(assets, "/js");
	var style = path.join(assets, "/style");
	var text = path.join(assets, "/text");
	var video = path.join(assets, "/video");
	fs.mkdirSync(assets);
	fs.mkdirSync(audio);
	fs.mkdirSync(font);
	fs.mkdirSync(html);
	fs.mkdirSync(img);
	fs.mkdirSync(js);
	fs.mkdirSync(style);
	fs.mkdirSync(text);
	fs.mkdirSync(video);

	var markup = path.join(wiki_abs_dir, "/markup");
	fs.mkdirSync(markup);

	var templates = path.join(wiki_abs_dir, "/templates");
	fs.mkdirSync(templates);
}

function createConfigFile(wiki_abs_dir, wiki_name) {
	var config_dest = path.join(wiki_abs_dir, "/config.toml");
	var config_string = 'wiki = "'+wiki_name+'"\nimport = []\ncss = []\njs = []\ntarget = "dynamic"\ntemplate = "default"';
	fs.writeFileSync(config_dest, config_string);
}

function copyDefaultTemplate(wiki_abs_dir) {
	var temp_dest = path.join(wiki_abs_dir, "/templates/default");
	fs.copySync(defaultTemplateDir, temp_dest);
}

function copyUiFiles(wiki_abs_dir) {
	var temp = path.join(wiki_abs_dir, "/templates");

	var nouwiki_ui_css_src = path.join(appDir, "/ui/css/nouwiki_ui.css");
	var nouwiki_ui_css_dest = path.join(temp, "/nouwiki_ui.css");
	fs.copySync(nouwiki_ui_css_src, nouwiki_ui_css_dest);

	var nouwiki_ui_js_src = path.join(appDir, "/ui/js/nouwiki_ui.js");
	var nouwiki_ui_js_dest = path.join(temp, "/nouwiki_ui.js");
	fs.copySync(nouwiki_ui_js_src, nouwiki_ui_js_dest);
}

exports.createWiki = createWiki;
