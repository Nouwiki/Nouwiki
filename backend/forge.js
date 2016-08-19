var path = require('path');
var fs = require('fs-extra');
var toml = require('toml');
var tomlify = require('tomlify-j0.4');

var git = require('./git');
var build = require('./build');

var appDir = path.dirname(require.main.filename);
var defaultTemplateDir = path.join(appDir, "/node_modules", "/nouwiki-default-template");
var defaultPlugins = [];
defaultPlugins.push([path.join(appDir, "/files", "/plugins", "/markdown-it-nouwiki-wikilink.js"), "markdown-it-nouwiki-wikilink.js"]);
defaultPlugins.push([path.join(appDir, "/files", "/plugins", "/markdown-it-attrs.js"), "markdown-it-attrs.js"]);
//defaultPlugins.push([path.join(appDir, "/node_modules", "/markdown-it-nouwiki-locallink", "/dist", "/markdown-it-nouwiki-locallink.js"), "markdown-it-nouwiki-locallink.js"]);

var plugin_configs = {
	"markdown-it-nouwiki-wikilink.js": `[options.fragment_index]
head = "fragment/"
tail = ".html"
[options.fragment]
head = ""
tail = ".html"

[options.static_index]
head = "wiki/"
tail = ".html"
[options.static]
head = ""
tail = ".html"

[options.dynamic]
head = "?title="
tail = ""

[options.nouwiki]
head = "/wiki/"
tail = ""
`
}

function createWiki(wiki) {
	var wiki_abs_dir = path.resolve(wiki);
	var wiki_name = path.basename(wiki_abs_dir);

	createNewWikiDirStructure(wiki_abs_dir);

	var pub = wiki_abs_dir;
	var markup_path = path.join(pub, "/markup");
	var index_path = path.join(markup_path, "/index.md");
	var index_markup = "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+wiki_name+"\n\nWelcome to the front page of your new wiki!\n\nSee also [Example: Nouwiki|the example page]() and the examples pages imported from other projects:\n\n- [Example: StackEdit|StackEdit]()\n- [Example: Markdown Here|Markdown Here]()\n- [Example: Rippledoc|Rippledoc]()\n- [Example: The PHP League|The PHP League]()\n";
	fs.writeFileSync(index_path, index_markup);

	var example_src = path.join(appDir, "/files", "/examples", "/pages", "Example: Markdown Here.md");
	var example_src_str = fs.readFileSync(example_src, 'utf8');
	var example_path = path.join(markup_path, "/Example: Markdown Here.md");
	fs.writeFileSync(example_path, example_src_str);

	var example_src = path.join(appDir, "/files", "/examples", "/pages", "Example: Rippledoc.md");
	var example_src_str = fs.readFileSync(example_src, 'utf8');
	var example_path = path.join(markup_path, "/Example: Rippledoc.md");
	fs.writeFileSync(example_path, example_src_str);

	var example_src = path.join(appDir, "/files", "/examples", "/pages", "Example: StackEdit.md");
	var example_src_str = fs.readFileSync(example_src, 'utf8');
	var example_path = path.join(markup_path, "/Example: StackEdit.md");
	fs.writeFileSync(example_path, example_src_str);

	var example_src = path.join(appDir, "/files", "/examples", "/pages", "Example: The PHP League.md");
	var example_src_str = fs.readFileSync(example_src, 'utf8');
	var example_path = path.join(markup_path, "/Example: The PHP League.md");
	fs.writeFileSync(example_path, example_src_str);

	var example_src = path.join(appDir, "/files", "/examples", "/pages", "Example: Nouwiki.md");
	var example_src_str = fs.readFileSync(example_src, 'utf8');
	var example_path = path.join(markup_path, "/Example: Nouwiki.md");
	fs.writeFileSync(example_path, example_src_str);

	createConfigFiles(wiki_abs_dir, wiki_name);
	copyDefaultTemplate(wiki_abs_dir);
	copyDefaultPlugins(wiki_abs_dir);
	copyUiFiles(wiki_abs_dir);

	git.initRepo(pub);
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
	var components = path.join(wiki_abs_dir, "/components");
	var wiki = path.join(wiki_abs_dir, "/wiki");
	var fragment = path.join(wiki_abs_dir, "/fragment");
	var text = path.join(wiki_abs_dir, "/text");
	var markup = path.join(wiki_abs_dir, "/markup");
	var plugins = path.join(wiki_abs_dir, "/plugins");
	var files = path.join(wiki_abs_dir, "/files");

	var components_templates = path.join(components, "/templates");
	var components_markup_body = path.join(components, "/markup-body");
	var components_parsers = path.join(components, "/parsers");
	var components_nouwiki = path.join(components, "/nouwiki");
	var components_nouwiki_js = path.join(components_nouwiki, "/js");
	var components_nouwiki_css = path.join(components_nouwiki, "/css");

	var files_assets = path.join(files, "/assets");
	var files_media = path.join(files, "/media");
	var files_objects = path.join(files, "/objects");
	var files_data = path.join(files, "/data");
	var files_binary = path.join(files, "/binary");

	var files_assets_html = path.join(files_assets, "/import");
	var files_assets_js = path.join(files_assets, "/script");
	var files_assets_css = path.join(files_assets, "/link");
	var files_assets_fonts = path.join(files_assets, "/fonts");

	var files_media_audio = path.join(files_media, "/audio");
	var files_media_video = path.join(files_media, "/video");
	var files_media_img = path.join(files_media, "/img");

	fs.mkdirSync(components);
	fs.mkdirSync(components_templates);
	fs.mkdirSync(components_markup_body);
	fs.mkdirSync(components_parsers);
	fs.mkdirSync(components_nouwiki);
	fs.mkdirSync(components_nouwiki_js);
	fs.mkdirSync(components_nouwiki_css);
	fs.mkdirSync(wiki);
	fs.mkdirSync(fragment);
	fs.mkdirSync(text);
	fs.mkdirSync(markup);
	fs.mkdirSync(plugins);
	fs.mkdirSync(files);
	fs.mkdirSync(files_assets);
	fs.mkdirSync(files_media);
	fs.mkdirSync(files_objects);
	fs.mkdirSync(files_data);
	fs.mkdirSync(files_binary);
	fs.mkdirSync(files_assets_html);
	fs.mkdirSync(files_assets_js);
	fs.mkdirSync(files_assets_css);
	fs.mkdirSync(files_assets_fonts);
	fs.mkdirSync(files_media_audio);
	fs.mkdirSync(files_media_video);
	fs.mkdirSync(files_media_img);

	// Example Files
	var example_img_src = path.join(appDir, "/files/examples/assets/example.jpg");
	var example_img_dest = path.join(files_media_img, "example.jpg");
	fs.copySync(example_img_src, example_img_dest);

	// ...
	var global_css_src = path.join(appDir, "/files/global/global.css");
	var global_css_dest = path.join(files_assets_css, "global.css");
	fs.copySync(global_css_src, global_css_dest);

	var global_js_src = path.join(appDir, "/files/global/global.js");
	var global_js_dest = path.join(files_assets_js, "global.js");
	fs.copySync(global_js_src, global_js_dest);

	var white_js_src = path.join(appDir, "/files/global/white.min.js");
	var white_js_dest = path.join(files_assets_js, "white.min.js");
	fs.copySync(white_js_src, white_js_dest);
}

function createConfigFiles(wiki_abs_dir, wiki_name) {
	var config_dest = path.join(wiki_abs_dir, "/nouwiki.toml");
	var config_string = `wikiName = "`+wiki_name+`"

# Absolute or relative URLs
#nouwiki_backend = ""
#git_backend = ""
template = "/components/templates/nouwiki-default-template"
markupBody = "/components/markup-body/nouwiki-default-markup-body.css"
parser = "/components/parsers/parser.min.js"
nouwiki = "/components/nouwiki"

default_index = "static" # nouwiki, git, dynamic, static

[CORS]
enabled = true
`
	fs.writeFileSync(config_dest, config_string);

	var config_dest = path.join(wiki_abs_dir, "/global.toml");
	var config_string = `import = []
css = ["/files/assets/link/global.css"]
js = ["/files/assets/script/white.min.js", "/files/assets/script/global.js"]
`
	fs.writeFileSync(config_dest, config_string);

	var config_dest = path.join(wiki_abs_dir, "/parser.toml");
	var config_string = `plugins = [
		"markdown-it-nouwiki-wikilink.js",
		"markdown-it-attrs.js"
	]

[parser_options]
html = true
#xhtmlOut = false
#breaks = false
#langPrefix = 'language-'
#linkify = false
#typographer = false
#quotes = '“”‘’'
`
	fs.writeFileSync(config_dest, config_string);

	var config_dest = path.join(wiki_abs_dir, "/.gitignore");
	var config_string = `node_modules`
	fs.writeFileSync(config_dest, config_string);
}

function copyDefaultTemplate(wiki_abs_dir) {
	var dest = path.join(wiki_abs_dir, "/components/templates/nouwiki-default-template");
	var assets_src = path.join(defaultTemplateDir, "/assets");
	var temp_src = path.join(defaultTemplateDir, "/template");
	var assets_dest = path.join(dest, "/assets");
	var temp_dest = path.join(dest, "/template");

	fs.mkdirSync(dest);

	fs.copySync(assets_src, assets_dest);
	fs.copySync(temp_src, temp_dest);
}

function copyDefaultPlugins(wiki_abs_dir) {
	var plugins_dir = path.join(wiki_abs_dir, "/plugins");
	for (var plugin in defaultPlugins) {
		var plugin_dest = path.join(plugins_dir, defaultPlugins[plugin][1]);
		fs.copySync(defaultPlugins[plugin][0], plugin_dest);

		try {
			var name = defaultPlugins[plugin][1].split(".")[0];
			var config_dest = path.join(plugins_dir, "/"+name+".toml");
			var config_string = plugin_configs[defaultPlugins[plugin][1]];
			if (config_string != undefined) {
				fs.writeFileSync(config_dest, config_string);
			}
		} catch(e) {

		}
	}
}

function copyUiFiles(wiki_abs_dir) {
	var pub = wiki_abs_dir;

	var nouwiki_ui_css_src = path.join(appDir, "/frontend/css/nouwiki.ui.css");
	var nouwiki_ui_css_dest = path.join(pub, "/components/nouwiki", "/css/nouwiki.ui.css");
	fs.copySync(nouwiki_ui_css_src, nouwiki_ui_css_dest);

	/*var nouwiki_ui_js_src = path.join(appDir, "/frontend/js/nouwiki.ui.js");
	var nouwiki_ui_js_dest = path.join(pub, "/components/nouwiki", "/js/nouwiki.ui.js");
	fs.copySync(nouwiki_ui_js_src, nouwiki_ui_js_dest);*/

	var require_js_src = path.join(appDir, "/frontend/js/require.js");
	var require_js_dest = path.join(pub, "/components/nouwiki", "/js/require.js");
	fs.copySync(require_js_src, require_js_dest);

	var init_js_src = path.join(appDir, "/frontend/js/nouwiki.init.min.js");
	var init_js_dest = path.join(pub, "/components/nouwiki", "/js/nouwiki.init.min.js");
	fs.copySync(init_js_src, init_js_dest);

	var init_js_src = path.join(appDir, "/parser.min.js");
	var init_js_dest = path.join(pub, "/components/parsers/", "parser.min.js");
	fs.copySync(init_js_src, init_js_dest);

	var init_js_src = path.join(appDir, "/frontend/css", "nouwiki-default-markup-body.css");
	var dest = path.join(pub, "/components/markup-body/");
	var init_js_dest = path.join(dest, "nouwiki-default-markup-body.css");
	fs.copySync(init_js_src, init_js_dest);
}

exports.createWiki = createWiki;
