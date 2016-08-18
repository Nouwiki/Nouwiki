var path = require('path');
var fs = require('fs-extra');
var toml = require('toml');

var p = require('../parser');
var git = require('./git');
var helpers = require('./helpers');

var request = require('request');
var url = require('url');

var appDir = path.dirname(require.main.filename);
var pub, plugins_path;
var nouwiki, parser, global;
var markup_dir, markup_files;
var temp;
var targets = ["fragment", "static", "dynamic"];
var special = {};
for (var x in targets) {
	special[targets[x]] = [];
}

function buildWiki(wiki_abs_dir, targets, template, default_index) {
	pub = wiki_abs_dir;
	loadConfigs(template);

	plugins_path = path.join(pub, "/plugins");
	markup_dir = path.join(pub, "/markup");
	markup_files = fs.readdirSync(markup_dir);
	temp = getTemplatePaths()

	build();
	git.addAndCommitFiles(pub, ["*"], "add all after build");
}

function loadConfigs(template) {
	var nouwiki_src = path.join(pub, "/nouwiki.toml");
	var nouwiki_src_string = fs.readFileSync(nouwiki_src, 'utf8');
	nouwiki = toml.parse(nouwiki_src_string);
	nouwiki.template = template || nouwiki.template; // ?

	var parser_src = path.join(pub, "/parser.toml");
	var parser_src_string = fs.readFileSync(parser_src, 'utf8');
	parser = toml.parse(parser_src_string);

	var global_src = path.join(pub, "/global.toml");
	var global_src_string = fs.readFileSync(global_src, 'utf8');
	global = toml.parse(global_src_string);
}

function build() {
	for (var t in targets) {
		if (temp.type == "fs") {
			buildSpecialFS(targets[t]);
			buildNormal();
		} else if (temp.type == "url") {
			buildSpecialURL(targets[t]); // build normal is called within
		}
	}
}

function buildNormal() {
	for (var t in targets) {
		if (temp.type == "fs") {
			buildNormalFS(targets[t])
		} else if (temp.type == "url") {
			buildNormalURL(targets[t]);
		}
	}
}

function buildSpecialFS(target) {
	var special_files = fs.readdirSync(temp[target].special);
	for (var x = 0; x < special_files.length; x++) {
		var title = special_files[x].replace(/\.[^/.]+$/, ""); // remove extension
		var i = markup_files.indexOf(title+".md");
		if (i > -1) {
			special[target].push(title+".md");
			try {
				var markup_file = path.join(markup_dir, markup_files[i]);
				var markup = fs.readFileSync(markup_file, 'utf8');
				var template_file = path.join(temp[target].special, special_files[x]);
				var template = fs.readFileSync(template_file, 'utf8').split("`")[1];
				parseAndWriteFile(title, markup, template, target)
			} catch (e) {
				console.log(e);
			}
		}
	}
}

// This is really slow on large wiki's, don't recommend using it.
function buildSpecialURL(target) {
	var num = markup_files.length;
	for (var x = 0; x < markup_files.length; x++) {
		var title = markup_files[x].replace(/\.[^/.]+$/, ""); // remove extension
		var url = temp[target].special+title+".json";
		var data = {
			"title": title,
			"markup_file": markup_files[x],
			"target": target
		}
		urlExists(url, data, function(err, exists, url, data) {
			num -= 1;
			if (num == 0) {
				buildNormal();
			}
			if (exists) {
				special[data.target].push(data.title+".md");
				request.get(url, function (error, response, body) {
						if (!error && response.statusCode == 200) {
							try {
								var markup_file = path.join(markup_dir, data.markup_file);
								var markup = fs.readFileSync(markup_file, 'utf8');
								var template = body.split("`")[1];
								parseAndWriteFile(data.title, markup, template, data.target);
							} catch (e) {
								console.log(e);
							}
						}
				});
			}
		});
	}
}

function buildNormalFS(target) {
	for (var x = 0; x < markup_files.length; x++) {
		if (markup_files[x] != ".git" && special[target].indexOf(markup_files[x]) == -1) {
			try {
				var title = markup_files[x].replace(/\.[^/.]+$/, ""); // remove extension
				var markup_file = path.join(markup_dir, markup_files[x]);
				var markup = fs.readFileSync(markup_file, 'utf8');
				var template = fs.readFileSync(temp[target].normal, 'utf8').split("`")[1];
				parseAndWriteFile(title, markup, template, target)
			} catch (e) {
				console.log(e);
			}
		}
	}
}

function buildNormalURL(target) {
	for (var x = 0; x < markup_files.length; x++) {
		if (markup_files[x] != ".git" && special[target].indexOf(markup_files[x]) == -1) {
			var title = markup_files[x].replace(/\.[^/.]+$/, ""); // remove extension
			var url = temp[target].normal;
			var data = {
				"title": title,
				"markup_file": markup_files[x],
				"target": target
			}
			urlExists(url, data, function(err, exists, url, data) {
				if (exists) {
					request.get(url, function (error, response, body) {
							if (!error && response.statusCode == 200) {
								try {
									var markup_file = path.join(markup_dir, data.markup_file);
									var markup = fs.readFileSync(markup_file, 'utf8');
									var template = body.split("`")[1];
									parseAndWriteFile(data.title, markup, template, data.target);
								} catch (e) {
									console.log(e);
								}
							}
					});
				}
			});
		}
	}
}

function getTemplatePaths() {
	var t = {};

	if (nouwiki.template.indexOf("/") == nouwiki.template.indexOf("//") && nouwiki.template.indexOf("://") > -1) {
		t.type = "url";
	} else {
		t.type = "fs";
	}

	for (var x in targets) {
		t[targets[x]] = {}
		if (t.type == "url") {
			t[targets[x]].special = url.resolve(nouwiki.template+"/", "template/"+targets[x]+"/page/");
			t[targets[x]].normal = url.resolve(nouwiki.template+"/", "template/"+targets[x]+"/page.json");
		} else if (t.type == "fs") {
			t[targets[x]].special = path.join(pub, nouwiki.template, "/template/"+targets[x]+"/page/");
			t[targets[x]].normal = path.join(pub, nouwiki.template, "/template/"+targets[x]+"/page.json");
		}
	}
	return t;
}

function parseAndWriteFile(title, markup, template, target) {
	var plugins = helpers.getPlugins(title, plugins_path, helpers.getPluginJSON(plugins_path, parser.plugins), target);
	p.init(parser.parser_options);
	p.loadPlugins(plugins);
	var data = p.parse(nouwiki, title, markup, template, global);
	var html_file;
	if (title == "index" && nouwiki.default_index == target) { // default index
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

function urlExists(url, data, cb) {
  request({ url: url, method: 'HEAD' }, function(err, res) {
    if (err) return cb(null, false, url, data);
    cb(null, /4\d\d/.test(res.statusCode) === false, url, data);
  });
}

exports.buildWiki = buildWiki;
