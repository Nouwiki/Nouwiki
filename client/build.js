var path = require('path');
var fs = require('fs-extra');
var toml = require('toml');

var parse = require('../parser');
var git = require('./git');
var helpers = require('./helpers');

var appDir = path.dirname(require.main.filename);
var config;
var parser;
var global;

function buildWiki(wiki_abs_dir, targets, template, default_index) {
	var config_src = path.join(wiki_abs_dir, "/nouwiki.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
	config = toml.parse(config_src_string);
	var template = template || config.template;
	var default_index = default_index || config.default_index;
	var parser_src = path.join(wiki_abs_dir, "/parser.toml");
	var parser_src_string = fs.readFileSync(parser_src, 'utf8');
	parser = toml.parse(parser_src_string);
	var global_src = path.join(wiki_abs_dir, "/global.toml");
	var global_src_string = fs.readFileSync(global_src, 'utf8');
	global = toml.parse(global_src_string);

	var pub = wiki_abs_dir;

	var markup_dir = path.join(pub, "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		if (markup_files[x] != ".git") {
			var markup_file = path.join(markup_dir, markup_files[x]);
			buildMarkupFile(wiki_abs_dir, markup_file, config, default_index);
		}
	}
}

function buildMarkupFile(wiki_abs_dir, markup_file, config, default_index) {
	var markup = fs.readFileSync(markup_file, 'utf8');
	var title = path.basename(markup_file, '.md');
	var wiki_parser_plugins_path = path.join(wiki_abs_dir, "/plugins");

	var pub = wiki_abs_dir;
	var template_path;
	var targets = ["fragment", "static", "dynamic"];

	for (var t in targets) {
		var special_path = path.join(wiki_abs_dir, config.template, "/template/"+targets[t]+"/page/", title+".dot.jst");
		var normal_path = path.join(wiki_abs_dir, config.template, "/template/"+targets[t]+"/", "page.dot.jst");
		var template_path;
		try {
		    fs.accessSync(special_path, fs.F_OK);
		    template_path = special_path;
		} catch (e) {
		    template_path = normal_path;
		}
		try {
			var template_markup = fs.readFileSync(template_path, 'utf8');
			parseAndWriteFile(pub, wiki_parser_plugins_path, config, title, markup, template_markup, false, default_index, targets[t])
		} catch(e) {
			console.log("build error: ", e);
		}
	}
}

function parseAndWriteFile(pub, wiki_parser_plugins_path, config, title, markup, template_markup, def, default_index, target) {
	var plugins = helpers.getPlugins(title, wiki_parser_plugins_path, helpers.getPluginJSON(wiki_parser_plugins_path, parser.plugins), target);
	parse.init(parser.parser_options);
	parse.loadPlugins(plugins);
	var data = parse.parse(title, config.wiki_name, markup, template_markup, global);
	var html_file;
	if (title == "index" && default_index == target) { // default index
		html_file = path.join(pub, "index.html");
		fs.writeFileSync(html_file, data.page);
	}
	if (title == "index") { // target index
		html_file = path.join(pub, target+".html");
		fs.writeFileSync(html_file, data.page);

		// Text is always based on fragment
		if (target == "fragment") {
			txt_file = path.join(pub, "index.txt");
			fs.writeFileSync(txt_file, data.page.replace(/<(?:.|\n)*?>/gm, ''));
		}
	} else if (title != "index") { // page file
		if (target == "static") {
			html_file = path.join(pub, "/wiki", title+".html");
			fs.writeFileSync(html_file, data.page);
		} else if (target == "fragment") {
			html_file = path.join(pub, "/fragment", title+".html");
			fs.writeFileSync(html_file, data.page);
		}

		// Text is always based on fragment
		if (target == "fragment") { // text and fragment
			txt_file = path.join(pub, "/text", title+".txt");
			fs.writeFileSync(txt_file, data.page.replace(/<(?:.|\n)*?>/gm, ''));
		}
	}
}

exports.buildWiki = buildWiki;
exports.buildMarkupFile = buildMarkupFile;
