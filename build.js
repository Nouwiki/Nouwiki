var path = require('path');
var doT = require('dot');
var fs = require('fs');
var parse = require('./parse');

function buildWiki(path_abs) {
	var markup_dir = path.join(path_abs, "/markup");
	var markup_files = fs.readdirSync(markup_dir);
	for (var x = 0; x < markup_files.length; x++) {
		var markup_file = path.join(markup_dir, markup_files[x]);
		buildMarkupFile(path_abs, markup_file);
	}
}

function buildMarkupFile(root, markup_file) {
	var wiki = path.basename(root);
	var file_name = path.basename(markup_file, '.md') + ".html";
  var data = fs.readFileSync(markup_file, 'utf8');
	data = parse.parse(data);
	//var html = data.html;
	//var title = data.title;

  buildFragment(root, file_name, data);
  buildStatic(root, file_name, data, wiki);
  buildDynamic(root, file_name, data, wiki);
}

function buildFragment(root, file_name, data) {
  var fragment_path = path.join(root, "/fragment", file_name);
  var fragment = data.html;
  fs.writeFileSync(fragment_path, fragment);
}

function buildStatic(root, file_name, data, wiki) {
  var stat_path = path.join(root, "/static", file_name);
  var template_path = path.join(root, "/templates", "static.html");
  var template_string = fs.readFileSync(template_path, 'utf8');
  var stat_template = doT.template(template_string);
  var stat = stat_template({wiki: wiki, title: data.title, content: data.html});
  fs.writeFileSync(stat_path, stat);
}

function buildDynamic(root, file_name, data, wiki) {
  var dynamic_path = path.join(root, "/dynamic", file_name);
  var template_path = path.join(root, "/templates", "dynamic.html");
  var template_string = fs.readFileSync(template_path, 'utf8');
  var dynamic_template = doT.template(template_string);
  var dynamic = dynamic_template({wiki: wiki, title: data.title, content: data.html});
  fs.writeFileSync(dynamic_path, dynamic);
}

exports.buildWiki = buildWiki;
