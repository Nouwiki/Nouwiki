var path = require('path');
var fs = require('fs-extra');
var parse = require('./parse');
var dirTree = require('directory-tree');
var toml = require('toml');

var git = require('./git');

var appDir = path.dirname(require.main.filename);
var defaultTemplateDir = path.join(appDir, "/node_modules", "/nouwiki-default-template");

var config;

function buildWiki(wiki_abs_dir, target) {
	var config_src = path.join(wiki_abs_dir, "/config.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
	config = toml.parse(config_src_string);
	target = target || config.target;

	readyTemplate(wiki_abs_dir);

	var markup_dir = path.join(wiki_abs_dir, "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		var markup_file = path.join(markup_dir, markup_files[x]);
		buildMarkupFile(wiki_abs_dir, markup_file, config, target);
	}

	// Add and commit pages
	var pages = [];
	for (var x in markup_files) {
		pages.push(path.basename(markup_files[x], ".md"))
	}
	var files = [];
	for (var page in pages) {
		files.push(path.join(wiki_abs_dir, "markup", pages[page]+".md"));
		files.push(path.join(wiki_abs_dir, pages[page]+".html"));
	}
	git.addAndCommitFiles(wiki_abs_dir, files, "pages build");
}

function buildMarkupFile(wiki_abs_dir, markup_file, config, target) {
	var markup = fs.readFileSync(markup_file, 'utf8');

	var template_markup;
	if (target == "static") {
		var template_path = path.join(wiki_abs_dir, "/templates/current/static/", "page.dot.jst");
		template_markup = fs.readFileSync(template_path, 'utf8');
	} else if (target == "dynamic") {
		var template_path = path.join(wiki_abs_dir, "/templates/current/dynamic/", "page.dot.jst");
		template_markup = fs.readFileSync(template_path, 'utf8');
	} else { // Default to dynamic if no target is specified
		var template_path = path.join(wiki_abs_dir, "/templates/current/dynamic/", "page.dot.jst");
		template_markup = fs.readFileSync(template_path, 'utf8');
	}
	var title = path.basename(markup_file, '.md');
	var html = parse.parse(title, markup, config, template_markup);
	var file_name = path.basename(markup_file, '.md') + ".html";
	var build_path = path.join(wiki_abs_dir, file_name);
	fs.writeFileSync(build_path, html);
}

// Finds the configured template and copies it to /templates/current , it copies it rather then symalinks so it works for github pages
function readyTemplate(wiki_abs_dir) {
	var temp = path.join(wiki_abs_dir, "/templates/"+config.template);
	var current = path.join(wiki_abs_dir, "/templates/current");

	try {
		var stats = fs.lstatSync(current);
		if (stats.isDirectory()) {
			fs.removeSync(current);
		}
	} catch(e) {
		console.log(e);
	}

	fs.copySync(temp, current);
}

exports.buildWiki = buildWiki;
exports.buildMarkupFile = buildMarkupFile;
