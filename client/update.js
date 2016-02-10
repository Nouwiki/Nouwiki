var path = require('path');
var fs = require('fs-extra');
var toml = require('toml');

var appDir = path.dirname(require.main.filename);
var defaultTemplateDir = path.join(appDir, "/node_modules", "/nouwiki-default-template");
var defaultPlugins = [];
defaultPlugins.push([path.join(appDir, "/node_modules", "/markdown-it-nouwiki-wikilink", "/dist", "/markdown-it-nouwiki-wikilink.min.js"), "markdown-it-nouwiki-wikilink.min.js"]);

function update(wiki_abs_dir) {
	copyDefaultTemplate(wiki_abs_dir);
	copyDefaultPlugins(wiki_abs_dir);
	copyUiFiles(wiki_abs_dir);
}

function copyDefaultTemplate(wiki_abs_dir) {
	var dest = path.join(wiki_abs_dir, "/templates/nouwiki-default-template");
	var assets_src = path.join(defaultTemplateDir, "/assets");
	var temp_src = path.join(defaultTemplateDir, "/template");
	var assets_dest = path.join(dest, "/assets");
	var temp_dest = path.join(dest, "/template");

	fs.removeSync(dest);
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

exports.update = update;
