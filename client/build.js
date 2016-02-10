var path = require('path');
var fs = require('fs-extra');
var toml = require('toml');

var parse = require('../parse');
var git = require('./git');

var appDir = path.dirname(require.main.filename);
var config;

function buildWiki(wiki_abs_dir, targets) {
	var config_src = path.join(wiki_abs_dir, "/nouwiki.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
	config = toml.parse(config_src_string);
	targets = targets || config.targets;

	var pub = wiki_abs_dir;

	var markup_dir = path.join(pub, "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		if (markup_files[x] != ".git") {
			var markup_file = path.join(markup_dir, markup_files[x]);
			buildMarkupFile(wiki_abs_dir, markup_file, config, targets);
		}
	}
}

function getPlugins(title, head, plugins, target) {
	var rplugins = [];
	var options;
	for (var plugin in plugins) {
		options = plugins[plugin].options[target];
		if (title == "index" && plugins[plugin].options[target+"_index"] != undefined) {
			options = plugins[plugin].options[target+"_index"];
		}
		var pa = path.join(head, plugins[plugin].name);
		rplugins.push([require(pa), options]);
	}
	return rplugins;
}

function buildMarkupFile(wiki_abs_dir, markup_file, config, targets) {
	var markup = fs.readFileSync(markup_file, 'utf8');
	var title = path.basename(markup_file, '.md');
	var wiki_parser_plugins_path = path.join(wiki_abs_dir, "/plugins", "/parser/");

	var pub = wiki_abs_dir;
	var target;
	var template_path;
	if (targets.dynamic) {
		target = "dynamic";
	}
	if (targets.static) {
		target = "static";
	}
	if (targets.filesystem) {
		target = "filesystem";
	}
	if (title == "index") {
		try {
			template_path = path.join(wiki_abs_dir, "/templates/"+config.template+"/template/"+target+"/", "index.dot.jst");
			fs.accessSync(template_path, fs.F_OK);
		} catch (e) {
			template_path = path.join(wiki_abs_dir, "/templates/"+config.template+"/template/"+target+"/", "page.dot.jst");
		}
	} else {
		template_path = path.join(wiki_abs_dir, "/templates/"+config.template+"/template/"+target+"/", "page.dot.jst");
	}
	var template_markup = fs.readFileSync(template_path, 'utf8');
	parseAndWriteFile(pub, wiki_parser_plugins_path, config, target, title, markup, template_markup, false, targets.default)
}

function parseAndWriteFile(pub, wiki_parser_plugins_path, config, target, title, markup, template_markup, def, def_val) {
	var plugins = getPlugins(title, wiki_parser_plugins_path, config.plugins.parser, target);
	var data = parse.parse(title, markup, config, template_markup, plugins, true);
	var html_file, wiki_def;
	if (title == "index" && def_val == target) {
		html_file = path.join(pub, title+".html");
		fs.writeFileSync(html_file, data.html);
	} else if (title != "index") {
		html_file = path.join(pub, "/wiki", "/"+target, title+".html");

		//fs.writeFileSync(text_file, data.text);
		if (config.extras.fragments) {
			var fragment_file = path.join(pub, "/fragments", "/"+target, title+".html");
			fs.writeFileSync(fragment_file, data.fragment);
		}
		if (config.targets[target]) {
			fs.writeFileSync(html_file, data.html);
		}
	}
}

exports.buildWiki = buildWiki;
exports.buildMarkupFile = buildMarkupFile;
