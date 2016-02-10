var path = require('path');
var fs = require('fs-extra');

var git = require('./git');

var appDir = path.dirname(require.main.filename);
var defaultTemplateDir = path.join(appDir, "/node_modules", "/nouwiki-default-template");
var defaultPlugins = [];
defaultPlugins.push([path.join(appDir, "/node_modules", "/markdown-it-nouwiki-wikilink", "/dist", "/markdown-it-nouwiki-wikilink.min.js"), "markdown-it-nouwiki-wikilink.min.js"]);

function createWiki(p) {
	var wiki_abs_dir = path.resolve(p);
	var wiki_name = path.basename(wiki_abs_dir);

	createNewWikiDirStructure(wiki_abs_dir);

	var pub = wiki_abs_dir;
	var markup_path = path.join(pub, "/markup");
	var index_path = path.join(markup_path, "/index.md");
	var index_markup = "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+wiki_name+"\n\nWelcome to your new wiki!\n";
	fs.writeFileSync(index_path, index_markup);

	createConfigFile(wiki_abs_dir, wiki_name);
	copyDefaultTemplate(wiki_abs_dir);
	copyDefaultPlugins(wiki_abs_dir);
	copyUiFiles(wiki_abs_dir);

	git.initRepo(pub+"/markup/");
}

function createNewWikiDirStructure(wiki_abs_dir) {
	try {
		fs.mkdirSync(wiki_abs_dir);
	} catch(e) {
		if ( e.code != 'EEXIST' ) throw e;
	}

	createPublicDir(wiki_abs_dir);
}

function createPublicDir(wiki_abs_dir) {
	var pub = wiki_abs_dir;
	var markup = path.join(pub, "/markup");
	var templates = path.join(pub, "/templates");

	var wiki = path.join(pub, "/wiki");
	var w_dynamic = path.join(wiki, "/dynamic");
	var w_stat = path.join(wiki, "/static");
	var w_file = path.join(wiki, "/filesystem");

	var fragment = path.join(pub, "/fragments");
	var f_dynamic = path.join(fragment, "/dynamic");
	var f_stat = path.join(fragment, "/static");
	var f_file = path.join(fragment, "/filesystem");

	var plugins = path.join(pub, "/plugins");
	var parser_plugins = path.join(plugins, "/parser");

	// Asset Dirs
	var nouwiki_assets = path.join(pub, "/nouwiki_assets");
	var css = path.join(nouwiki_assets, "/css");
	var js = path.join(nouwiki_assets, "/js");

	//fs.mkdirSync(pub);
	fs.mkdirSync(wiki);
	fs.mkdirSync(w_dynamic);
	fs.mkdirSync(w_stat);
	fs.mkdirSync(w_file);
	fs.mkdirSync(markup);
	fs.mkdirSync(templates);
	fs.mkdirSync(fragment);
	fs.mkdirSync(f_dynamic);
	fs.mkdirSync(f_stat);
	fs.mkdirSync(f_file);
	fs.mkdirSync(plugins);
	fs.mkdirSync(parser_plugins);
	fs.mkdirSync(nouwiki_assets);
	fs.mkdirSync(css);
	fs.mkdirSync(js);

	createUniversalDir(wiki_abs_dir);
}

function createUniversalDir(wiki_abs_dir) {
	var pub = wiki_abs_dir;
	var universal_assets = path.join(pub, "/universal_assets")
	var audio = path.join(universal_assets, "/audio");
	var font = path.join(universal_assets, "/font");
	var html = path.join(universal_assets, "/html");
	var img = path.join(universal_assets, "/img");
	var js = path.join(universal_assets, "/js");
	var pdf = path.join(universal_assets, "/pdf");
	var style = path.join(universal_assets, "/style");
	var text = path.join(universal_assets, "/text");
	var video = path.join(universal_assets, "/video");
	fs.mkdirSync(universal_assets);
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
	var config_dest = path.join(wiki_abs_dir, "/nouwiki.toml");
	var config_string = `wiki = "`+wiki_name+`"
template = "nouwiki-default-template"

[targets]
default = "dynamic"
dynamic = true
static = true
filesystem = true

[include]
import = []
css = []
js = []

[extras]
fragments = true

[[plugins.parser]]
	name = "markdown-it-nouwiki-wikilink.min.js"
		[plugins.parser.options.dynamic]
		head = "/wiki/dynamic/"
		tail = ""
		[plugins.parser.options.static]
		head = "/wiki/static/"
		tail = ""
		[plugins.parser.options.filesystem]
		head = ""
		tail = ".html"
		[plugins.parser.options.filesystem_index]
		head = "wiki/filesystem/"
		tail = ".html"
`
	fs.writeFileSync(config_dest, config_string);
}

function copyDefaultTemplate(wiki_abs_dir) {
	var dest = path.join(wiki_abs_dir, "/templates/nouwiki-default-template");
	var assets_src = path.join(defaultTemplateDir, "/assets");
	var temp_src = path.join(defaultTemplateDir, "/template");
	var assets_dest = path.join(dest, "/assets");
	var temp_dest = path.join(dest, "/template");

	//fs.rmdirSync(dest);
	fs.mkdirSync(dest);

	fs.copySync(assets_src, assets_dest);
	fs.copySync(temp_src, temp_dest);
}

function copyDefaultPlugins(wiki_abs_dir) {
	for (var plugin in defaultPlugins) {
		var plugin_dest = path.join(wiki_abs_dir, "/plugins", "/parser", defaultPlugins[plugin][1]);
		fs.copySync(defaultPlugins[plugin][0], plugin_dest);
	}
}

function copyUiFiles(wiki_abs_dir) {
	var pub = wiki_abs_dir;

	var nouwiki_ui_css_src = path.join(appDir, "/browser/css/nouwiki.ui.css");
	var nouwiki_ui_css_dest = path.join(pub, "/nouwiki_assets", "/css/nouwiki.ui.css");
	fs.copySync(nouwiki_ui_css_src, nouwiki_ui_css_dest);

	var nouwiki_ui_js_src = path.join(appDir, "/browser/js/nouwiki.ui.js");
	var nouwiki_ui_js_dest = path.join(pub, "/nouwiki_assets", "/js/nouwiki.ui.js");
	fs.copySync(nouwiki_ui_js_src, nouwiki_ui_js_dest);

	var require_js_src = path.join(appDir, "/browser/js/require.js");
	var require_js_dest = path.join(pub, "/nouwiki_assets", "/js/require.js");
	fs.copySync(require_js_src, require_js_dest);

	var init_js_src = path.join(appDir, "/browser/js/nouwiki.init.js");
	var init_js_dest = path.join(pub, "/nouwiki_assets", "/js/nouwiki.init.js");
	fs.copySync(init_js_src, init_js_dest);
}

exports.createWiki = createWiki;
