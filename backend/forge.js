var fs = require('fs-extra');
var path = require('path');
var toml = require('toml');
var tomlify = require('tomlify-j0.4');

//var git = require('./git');
var build = require('./build');

var appDir = path.dirname(require.main.filename);
var defaultTemplateDir = path.join(appDir, "/node_modules", "/nouwiki-default-template");
var defaultPlugins = [];
defaultPlugins.push([path.join(appDir, "/files", "/plugins", "/markdown-it-nouwiki-wikilink.js"), "markdown-it-nouwiki-wikilink.js"]);
defaultPlugins.push([path.join(appDir, "/files", "/plugins", "/markdown-it-attrs.js"), "markdown-it-attrs.js"]);
//defaultPlugins.push([path.join(appDir, "/files", "/plugins", "/markdown-it-mathjax.js"), "markdown-it-mathjax.js"]);
//defaultPlugins.push([path.join(appDir, "/node_modules", "/markdown-it-nouwiki-locallink", "/dist", "/markdown-it-nouwiki-locallink.js"), "markdown-it-nouwiki-locallink.js"]);

var plugin_configs = {
	"markdown-it-nouwiki-wikilink.js": `[options.fragment_index]
head = "fragment/"
tail = ".html"
[options.fragment]
head = ""
tail = ".html"

[options.static_index]
head = "static/"
tail = ".html"
[options.static]
head = ""
tail = ".html"

[options.dynamic]
head = "?title="
tail = ""

[options.nouwiki_index]
head = "wiki/"
tail = ""
[options.nouwiki]
head = "../wiki/"
tail = ""
`
}

function forge(root) {
	var wiki_title = path.basename(root);

	createDirectories(root);
	createExampleFiles(root, wiki_title)
	createConfigFiles(root, wiki_title);
	copyComponents(root);
}

function createDirectories(root) {
	try {
		fs.mkdirSync(root);
	} catch(e) {
		if ( e.code != 'EEXIST' ) throw e;
	}

	var components = path.join(root, "/components");
	var stat = path.join(root, "/static");
	var fragment = path.join(root, "/fragment");
	var text = path.join(root, "/text");
	var markup = path.join(root, "/markup");
	var plugins = path.join(root, "/plugins");
	var files = path.join(root, "/files");

	var components_template = path.join(components, "/template");
	//var components_markup_body = path.join(components, "/markup-body");
	//var components_parsers = path.join(components, "/parsers");
	var components_nouwiki = path.join(components, "/nouwiki");
	var components_nouwiki_js = path.join(components_nouwiki, "/js");
	var components_nouwiki_css = path.join(components_nouwiki, "/css");

	var files_assets = path.join(files, "/assets"); // files that fit in import, script, or link tags
	var files_media = path.join(files, "/media"); // files that fit in img, video, or audio tags
	var files_objects = path.join(files, "/objects"); // files that fit in object and embed html tags
	var files_data = path.join(files, "/data"); // structured data (json, csv, toml, etc)
	var files_binary = path.join(files, "/binary"); // binary files
	var files_fonts = path.join(files, "/fonts"); // font files
	var files_mixed = path.join(files, "/mixed"); // when it's easier to define your own dir structure

	var files_assets_html = path.join(files_assets, "/import");
	var files_assets_js = path.join(files_assets, "/script");
	var files_assets_css = path.join(files_assets, "/link");

	var files_media_audio = path.join(files_media, "/audio");
	var files_media_video = path.join(files_media, "/video");
	var files_media_img = path.join(files_media, "/img");

	fs.mkdirSync(components);
	fs.mkdirSync(components_template);
	//fs.mkdirSync(components_markup_body);
	//fs.mkdirSync(components_parsers);
	fs.mkdirSync(components_nouwiki);
	fs.mkdirSync(components_nouwiki_js);
	fs.mkdirSync(components_nouwiki_css);
	fs.mkdirSync(stat);
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
	fs.mkdirSync(files_fonts);
	fs.mkdirSync(files_mixed);
	fs.mkdirSync(files_assets_html);
	fs.mkdirSync(files_assets_js);
	fs.mkdirSync(files_assets_css);
	fs.mkdirSync(files_media_audio);
	fs.mkdirSync(files_media_video);
	fs.mkdirSync(files_media_img);

	var example_img_src = path.join(appDir, "/files/examples/assets/example.jpg");
	var example_img_dest = path.join(files_media_img, "example.jpg");
	fs.copySync(example_img_src, example_img_dest);

	var global_css_src = path.join(appDir, "/files/global/global.css");
	var global_css_dest = path.join(files_assets_css, "global.css");
	fs.copySync(global_css_src, global_css_dest);

	var global_js_src = path.join(appDir, "/files/global/global.js");
	var global_js_dest = path.join(files_assets_js, "global.js");
	fs.copySync(global_js_src, global_js_dest);
}

function createExampleFiles(root, wiki_title) {
	var markup_path = path.join(root, "/markup");
	var index_path = path.join(markup_path, "/index.md");
	var index_markup = "+++\nimport = []\ncss = []\njs = []\n+++\n\n# "+wiki_title+"\n\nWelcome to the front page of your new wiki!\n\nSee also [Example: Nouwiki|the example page]() and the examples pages imported from other projects:\n\n- [Example: StackEdit|StackEdit]()\n- [Example: Rippledoc|Rippledoc]()\n";
	fs.writeFileSync(index_path, index_markup);

	var example_src = path.join(appDir, "/files", "/examples", "/pages", "Example: Rippledoc.md");
	var example_src_str = fs.readFileSync(example_src, 'utf8');
	var example_path = path.join(markup_path, "/Example: Rippledoc.md");
	fs.writeFileSync(example_path, example_src_str);

	var example_src = path.join(appDir, "/files", "/examples", "/pages", "Example: StackEdit.md");
	var example_src_str = fs.readFileSync(example_src, 'utf8');
	var example_path = path.join(markup_path, "/Example: StackEdit.md");
	fs.writeFileSync(example_path, example_src_str);

	var example_src = path.join(appDir, "/files", "/examples", "/pages", "Example: Nouwiki.md");
	var example_src_str = fs.readFileSync(example_src, 'utf8');
	var example_path = path.join(markup_path, "/Example: Nouwiki.md");
	fs.writeFileSync(example_path, example_src_str);
}

function createConfigFiles(root, wiki_title) {
	var toml_dir = path.join(appDir, "/files", "/toml");

	var config_src = path.join(toml_dir, "/content.toml");
	var config_dest = path.join(root, "/content.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8').replace("WIKI_TITLE", wiki_title);
	fs.writeFileSync(config_dest, config_src_string);

	var config_src = path.join(toml_dir, "/nou.toml");
	var config_dest = path.join(root, "/nou.toml");
	fs.copySync(config_src, config_dest);

	var config_src = path.join(toml_dir, "/build.toml");
	var config_dest = path.join(root, "/build.toml");
	fs.copySync(config_src, config_dest);

	var config_src = path.join(toml_dir, "/global.toml");
	var config_dest = path.join(root, "/global.toml");
	fs.copySync(config_src, config_dest);

	var config_src = path.join(toml_dir, "/parser.toml");
	var config_dest = path.join(root, "/parser.toml");
	fs.copySync(config_src, config_dest);

	/*var config_dest = path.join(root, "/.gitignore");
	var config_string = `node_modules`;
	fs.writeFileSync(config_dest, config_string);*/
}

function copyComponents(root) {
	// Template
	var dest = path.join(root, "/components/template");
	var assets_src = path.join(defaultTemplateDir, "/assets");
	var temp_src = path.join(defaultTemplateDir, "/template");
	var assets_dest = path.join(dest, "/assets");
	var temp_dest = path.join(dest, "/template");
	fs.copySync(assets_src, assets_dest);
	fs.copySync(temp_src, temp_dest);


	// Parser
	var parser_src = path.join(appDir, "/parser.js");
	var parser_dest = path.join(root, "/components/", "parser.js");
	fs.copySync(parser_src, parser_dest);


	// Plugins
	var plugins_dir = path.join(root, "/plugins");
	for (var plugin in defaultPlugins) {
		var plugin_dest = path.join(plugins_dir, defaultPlugins[plugin][1]);
		fs.copySync(defaultPlugins[plugin][0], plugin_dest);

		try {
			var name = defaultPlugins[plugin][1].split(".")[0];
			var config_dest = path.join(plugins_dir, "/"+name+".options.toml");
			var config_string = plugin_configs[defaultPlugins[plugin][1]];
			if (config_string != undefined) {
				fs.writeFileSync(config_dest, config_string);
			}
		} catch(e) {

		}
	}


	// Markup Body CSS
	var mb_src = path.join(appDir, "/frontend/css", "github-css.css");
	var mb_dest = path.join(root, "/components/", "markup-body.css");
	fs.copySync(mb_src, mb_dest);


	// Nouwiki Files
	var nouwiki_ui_css_src = path.join(appDir, "/frontend/css/nouwiki.ui.css");
	var nouwiki_ui_css_dest = path.join(root, "/components/nouwiki", "/css/nouwiki.ui.css");
	fs.copySync(nouwiki_ui_css_src, nouwiki_ui_css_dest);

	/*var nouwiki_ui_js_src = path.join(appDir, "/frontend/js/nouwiki.ui.js");
	var nouwiki_ui_js_dest = path.join(root, "/components/nouwiki", "/js/nouwiki.ui.js");
	fs.copySync(nouwiki_ui_js_src, nouwiki_ui_js_dest);*/

	var require_js_src = path.join(appDir, "/frontend/js/require.js");
	var require_js_dest = path.join(root, "/components/nouwiki", "/js/require.js");
	fs.copySync(require_js_src, require_js_dest);

	var init_js_src = path.join(appDir, "/frontend/js/nouwiki.init.min.js");
	var init_js_dest = path.join(root, "/components/nouwiki", "/js/nouwiki.init.min.js");
	fs.copySync(init_js_src, init_js_dest);
}

exports.forge = forge;
