var path = require('path');
var fs = require('fs-extra');
var toml = require('toml');

var parse = require('../parse');
var git = require('./git');
var helpers = require('./helpers');

var appDir = path.dirname(require.main.filename);
var config;

function buildWiki(wiki_abs_dir, targets, template, index_default) {
	var config_src = path.join(wiki_abs_dir, "/nouwiki.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
	config = toml.parse(config_src_string);
	var template = template || config.template;
	var index_default = index_default || config.index_default

	var pub = wiki_abs_dir;

	var markup_dir = path.join(pub, "/content", "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		if (markup_files[x] != ".git") {
			var markup_file = path.join(markup_dir, markup_files[x]);
			buildMarkupFile(wiki_abs_dir, markup_file, config, template, index_default);
		}
	}
}

function buildMarkupFile(wiki_abs_dir, markup_file, config, template, index_default) {
	var markup = fs.readFileSync(markup_file, 'utf8');
	var title = path.basename(markup_file, '.md');
	var wiki_parser_plugins_path = path.join(wiki_abs_dir, "/nouwiki", "/plugins", "/parser/");

	var pub = wiki_abs_dir;
	var template_path;
	var target;

	target = "static";
	if (title == "index") {
		try {
			template_path = path.join(wiki_abs_dir, "/nouwiki/templates/"+template+"/template/"+target+"/page/", "index.dot.jst");
			fs.accessSync(template_path, fs.F_OK);
		} catch (e) {
			console.log(e)
			template_path = path.join(wiki_abs_dir, "/nouwiki/templates/"+template+"/template/"+target+"/", "page.dot.jst");
		}
	} else {
		template_path = path.join(wiki_abs_dir, "/nouwiki/templates/"+template+"/template/"+target+"/", "page.dot.jst");
	}
	try {
		var template_markup = fs.readFileSync(template_path, 'utf8');
		parseAndWriteFile(pub, wiki_parser_plugins_path, config, title, markup, template_markup, false, index_default, target)
	} catch(e) {
		console.log("build", e);
	}

	target = "dynamic_read";
	if (title == "index") {
		try {
			template_path = path.join(wiki_abs_dir, "/nouwiki/templates/"+template+"/template/"+target+"/page/", "index.dot.jst");
			fs.accessSync(template_path, fs.F_OK);
		} catch (e) {
			console.log(e)
			template_path = path.join(wiki_abs_dir, "/nouwiki/templates/"+template+"/template/"+target+"/", "page.dot.jst");
		}
	} else {
		template_path = path.join(wiki_abs_dir, "/nouwiki/templates/"+template+"/template/"+target+"/", "page.dot.jst");
	}
	try {
		var template_markup = fs.readFileSync(template_path, 'utf8');
		parseAndWriteFile(pub, wiki_parser_plugins_path, config, title, markup, template_markup, false, index_default, target)
	} catch(e) {
		console.log("build", e);
	}
}

function parseAndWriteFile(pub, wiki_parser_plugins_path, config, title, markup, template_markup, def, index_default, target) {
	var plugins = helpers.getPlugins(title, wiki_parser_plugins_path, config.plugins.parser, target);
	parse.init(config.parser_options);
	parse.loadPlugins(plugins);
	var data = parse.parse(title, markup, config, template_markup);
	var html_file;
	if (title == "index" && index_default == target) {
		html_file = path.join(pub, title+".html");
		fs.writeFileSync(html_file, data.page);
		html_file = path.join(pub, title+"_"+target+".html");
		fs.writeFileSync(html_file, data.page);
	} else if (title == "index") {
		html_file = path.join(pub, title+"_"+target+".html");
		fs.writeFileSync(html_file, data.page);
	} else if (title != "index") {
		html_file = path.join(pub, "/wiki", title+".html");
		fs.writeFileSync(html_file, data.page);
	}
}

exports.buildWiki = buildWiki;
exports.buildMarkupFile = buildMarkupFile;
