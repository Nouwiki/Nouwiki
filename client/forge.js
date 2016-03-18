var path = require('path');
var fs = require('fs-extra');

var git = require('./git');

var appDir = path.dirname(require.main.filename);
var defaultTemplateDir = path.join(appDir, "/node_modules", "/nouwiki-default-template");
var defaultPlugins = [];
defaultPlugins.push([path.join(appDir, "/node_modules", "/markdown-it-nouwiki-wikilink", "/dist", "/markdown-it-nouwiki-wikilink.min.js"), "markdown-it-nouwiki-wikilink.min.js"]);
defaultPlugins.push([path.join(appDir, "/node_modules", "/markdown-it-nouwiki-locallink", "/dist", "/markdown-it-nouwiki-locallink.min.js"), "markdown-it-nouwiki-locallink.min.js"]);

function createWiki(wiki) {
	var wiki_abs_dir = path.resolve(wiki);
	var wiki_name = path.basename(wiki_abs_dir);

	createNewWikiDirStructure(wiki_abs_dir);

	var pub = wiki_abs_dir;
	var markup_path = path.join(pub, "/content", "/markup");
	var index_path = path.join(markup_path, "/index.md");
	var index_markup = "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+wiki_name+"\n\nWelcome to your new wiki!\n";
	fs.writeFileSync(index_path, index_markup);

	createConfigFile(wiki_abs_dir, wiki_name);
	copyDefaultTemplate(wiki_abs_dir);
	copyDefaultPlugins(wiki_abs_dir);
	copyUiFiles(wiki_abs_dir);

	git.initRepo(pub+"/content/");
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
	var content = path.join(wiki_abs_dir, "/content");
	var markup = path.join(content, "/markup");
	//var text = path.join(content, "/text");
	//var fragment = path.join(content, "/fragment");

	var nouwiki = path.join(wiki_abs_dir, "/nouwiki");
	var templates = path.join(nouwiki, "/templates");
	var plugins = path.join(nouwiki, "/plugins");
	var parser_plugins = path.join(plugins, "/parser");
	var assets = path.join(nouwiki, "/assets");
	var css = path.join(assets, "/css");
	var js = path.join(assets, "/js");

	var wiki_dir = path.join(wiki_abs_dir, "/wiki");
	//var w_frag = path.join(wiki_dir, "/fragment");

	//fs.mkdirSync(pub);
	fs.mkdirSync(content);
	fs.mkdirSync(markup);
	//fs.mkdirSync(text);
	//fs.mkdirSync(fragment);

	fs.mkdirSync(nouwiki);
	fs.mkdirSync(templates);
	fs.mkdirSync(plugins);
	fs.mkdirSync(parser_plugins);
	fs.mkdirSync(assets);
	fs.mkdirSync(css);
	fs.mkdirSync(js);

	fs.mkdirSync(wiki_dir);
	//fs.mkdirSync(w_frag);

	createUniversalDir(wiki_abs_dir);
}

function createUniversalDir(wiki_abs_dir) {
	var pub = wiki_abs_dir;
	var universal_assets = path.join(pub, "/content/universal_assets");
	var audio = path.join(universal_assets, "/audio");
	var font = path.join(universal_assets, "/font");
	var html = path.join(universal_assets, "/html");
	var img = path.join(universal_assets, "/img");
	var js = path.join(universal_assets, "/js");
	var json = path.join(universal_assets, "/json");
	var pdf = path.join(universal_assets, "/pdf");
	var style = path.join(universal_assets, "/style");
	var text = path.join(universal_assets, "/text");
	var video = path.join(universal_assets, "/video");
	var files = path.join(universal_assets, "/files");
	fs.mkdirSync(universal_assets);
	fs.mkdirSync(audio);
	fs.mkdirSync(font);
	fs.mkdirSync(html);
	fs.mkdirSync(img);
	fs.mkdirSync(js);
	fs.mkdirSync(json);
	fs.mkdirSync(pdf);
	fs.mkdirSync(style);
	fs.mkdirSync(text);
	fs.mkdirSync(video);
	fs.mkdirSync(files);
}

function createConfigFile(wiki_abs_dir, wiki_name) {
	var config_dest = path.join(wiki_abs_dir, "/nouwiki.toml");
	var config_string = `wiki = "`+wiki_name+`"
template = "nouwiki-default-template"

index_default = "dynamic_read" # dynamic_git, dynamic_read, static

[global]
import = []
css = []
js = []

[parser_options]
html = true
linkify = false
typographer = false

[CORS]
enabled = true

[[plugins.parser]]
	name = "markdown-it-nouwiki-wikilink.min.js"
		[plugins.parser.options.static_index]
		head = "wiki/"
		tail = ".html"
		[plugins.parser.options.static]
		head = ""
		tail = ".html"

		[plugins.parser.options.dynamic_read]
		head = "?title="
		tail = ""

		[plugins.parser.options.nouwiki]
		head = "/wiki/"
		tail = ""
[[plugins.parser]]
	name = "markdown-it-nouwiki-locallink.min.js"
		[plugins.parser.options.static_index]
		head = "."
		tail = ""
		[plugins.parser.options.static]
		head = "../.."
		tail = ""

		[plugins.parser.options.dynamic_read]
		head = "."
		tail = ""
`
	fs.writeFileSync(config_dest, config_string);
}

function copyDefaultTemplate(wiki_abs_dir) {
	var dest = path.join(wiki_abs_dir, "/nouwiki/templates/nouwiki-default-template");
	var assets_src = path.join(defaultTemplateDir, "/assets");
	var temp_src = path.join(defaultTemplateDir, "/template");
	var assets_dest = path.join(dest, "/assets");
	var temp_dest = path.join(dest, "/template");

	fs.mkdirSync(dest);

	fs.copySync(assets_src, assets_dest);
	fs.copySync(temp_src, temp_dest);
}

function copyDefaultPlugins(wiki_abs_dir) {
	for (var plugin in defaultPlugins) {
		var plugin_dest = path.join(wiki_abs_dir, "/nouwiki", "/plugins", "/parser", defaultPlugins[plugin][1]);
		fs.copySync(defaultPlugins[plugin][0], plugin_dest);
	}
}

function copyUiFiles(wiki_abs_dir) {
	var pub = wiki_abs_dir;

	var nouwiki_ui_css_src = path.join(appDir, "/browser/css/nouwiki.ui.css");
	var nouwiki_ui_css_dest = path.join(pub, "/nouwiki/assets", "/css/nouwiki.ui.css");
	fs.copySync(nouwiki_ui_css_src, nouwiki_ui_css_dest);

	var nouwiki_ui_js_src = path.join(appDir, "/browser/js/nouwiki.ui.js");
	var nouwiki_ui_js_dest = path.join(pub, "/nouwiki/assets", "/js/nouwiki.ui.js");
	fs.copySync(nouwiki_ui_js_src, nouwiki_ui_js_dest);

	var require_js_src = path.join(appDir, "/browser/js/require.js");
	var require_js_dest = path.join(pub, "/nouwiki/assets", "/js/require.js");
	fs.copySync(require_js_src, require_js_dest);

	var init_js_src = path.join(appDir, "/browser/js/nouwiki.init.js");
	var init_js_dest = path.join(pub, "/nouwiki/assets", "/js/nouwiki.init.js");
	fs.copySync(init_js_src, init_js_dest);
}

exports.createWiki = createWiki;
