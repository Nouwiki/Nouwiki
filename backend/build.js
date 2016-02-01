var path = require('path');
var fs = require('fs-extra');
var parse = require('./parse');
var dirTree = require('directory-tree');
var toml = require('toml');

var git = require('./git');

var appDir = path.dirname(require.main.filename);
//var defaultTemplateDir = path.join(appDir, "/node_modules", "/nouwiki-default-template");

var config;

function buildWiki(wiki_abs_dir, target) {
	var config_src = path.join(wiki_abs_dir, "/config.toml");
	var config_src_string = fs.readFileSync(config_src, 'utf8');
	config = toml.parse(config_src_string);
	target = target || config.target;

	var pub = path.join(wiki_abs_dir, "/public");

	var markup_dir = path.join(pub, "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		if (markup_files[x] != ".git") {
			var markup_file = path.join(markup_dir, markup_files[x]);
			buildMarkupFile(wiki_abs_dir, markup_file, config, target);	
		}
	}

	copyTemplateAssets(wiki_abs_dir);

	// Add and commit pages
	/*var pages = [];
	for (var x in markup_files) {
		pages.push(path.basename(markup_files[x], ".md"))
	}
	var files = ["/css/template.ui.css", "/js/template.ui.js"];
	for (var page in pages) {
		files.push(path.join("markup", pages[page]+".md"));
		files.push(path.join(pages[page]+".html"));
	}
	git.addAndCommitFiles(pub, files, "pages build");*/
}

function buildMarkupFile(wiki_abs_dir, markup_file, config, target) {
	console.log(markup_file)
	var markup = fs.readFileSync(markup_file, 'utf8');

	var pub = path.join(wiki_abs_dir, "/public");
	var template_markup;
	if (target == "static") {
		var template_path = path.join(wiki_abs_dir, "/templates/"+config.template+"/backend/static/template/", "page.dot.jst");
		template_markup = fs.readFileSync(template_path, 'utf8');
	} else if (target == "dynamic") {
		var template_path = path.join(wiki_abs_dir, "/templates/"+config.template+"/backend/dynamic/template/", "page.dot.jst");
		template_markup = fs.readFileSync(template_path, 'utf8');
	} else { // Default to dynamic if no target is specified
		var template_path = path.join(wiki_abs_dir, "/templates/"+config.template+"/backend/dynamic/template/", "page.dot.jst");
		template_markup = fs.readFileSync(template_path, 'utf8');
	}
	var title = path.basename(markup_file, '.md');
	var html = parse.parse(title, markup, config, template_markup);
	var file_name = path.basename(markup_file, '.md') + ".html";
	var build_path = path.join(pub, file_name);
	fs.writeFileSync(build_path, html);
}

function copyTemplateAssets(wiki_abs_dir) {
	var pub = path.join(wiki_abs_dir, "/public");
	var temp = path.join(wiki_abs_dir, "/templates/"+config.template);

	var template_ui_css_src = path.join(temp, "/frontend/"+config.target+"/assets/css/template.ui.css");
	var template_ui_css_dest = path.join(pub, "/css/template.ui.css");
	fs.copySync(template_ui_css_src, template_ui_css_dest);

	var template_ui_js_src = path.join(temp, "/frontend/"+config.target+"/assets/js/template.ui.js");
	var template_ui_js_dest = path.join(pub, "/js/template.ui.js");
	fs.copySync(template_ui_js_src, template_ui_js_dest);
}

exports.buildWiki = buildWiki;
exports.buildMarkupFile = buildMarkupFile;
