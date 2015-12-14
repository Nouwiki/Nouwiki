var path = require('path');
var fs = require('fs-extra');

var git = require('./git');

var appDir = path.dirname(require.main.filename);

function createWiki(p) {
	var wiki_abs_dir = path.resolve(p);
	var wiki_name = path.basename(wiki_abs_dir);
	createNewWikiDirStructure(wiki_abs_dir);
	var markup_path = path.join(wiki_abs_dir, "/markup");
	var index_path = path.join(markup_path, "/index.md");
	var index_markup = "+++\ntitle = \""+wiki_name+"\"\n+++\n\nWelcome to your new wiki!";
	fs.writeFileSync(index_path, index_markup);
	//buildWiki(wiki_abs_dir);
	createConfigFile(wiki_abs_dir, wiki_name);
	git.initRepo(wiki_abs_dir);
	//git.addAndCommitAll(wiki_abs_dir, "initial commit");
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

	var markup = path.join(wiki_abs_dir, "/markup");
	fs.mkdirSync(markup);

	var templates = path.join(wiki_abs_dir, "/templates");
	fs.mkdirSync(templates);
}

function createConfigFile(wiki_abs_dir, wiki_name) {
	var config_dest = path.join(wiki_abs_dir, "/config.toml");
	var config_string = 'title = "'+wiki_name+'"\njs = []\ncss = []\ntarget = "dynamic"';
	fs.writeFileSync(config_dest, config_string);
}

exports.createWiki = createWiki;
