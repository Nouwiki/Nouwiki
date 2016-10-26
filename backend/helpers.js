var Promise = require('bluebird');
var path = require('path');
var fs = require('fs-extra');
var toml = require('toml');
var url = require('url');
var request = require('request-promise');
var urljoin = require('url-join');

function resolveComponentPaths(obj) {
	obj.backend = obj.backend || {};
	obj.frontend = obj.frontend || {};
	var keys = ["parser", "markupBody", "nouwiki", "template"];
	for (var k in keys) {
		var v = obj[keys[k]];
		if (!isHTTP(v) && v[0] != "/") {
			v = path.join(obj.root, v);
      		v = path.resolve(v);
      		obj.backend[keys[k]] = v;
		} else {
			obj.backend[keys[k]] = obj[keys[k]];
		}
	}
	if (obj.isFS.parser) {
		obj.frontend["parser"] = '/components/parser.js';
	} else {
		obj.frontend["parser"] = obj.parser;
	}
	if (obj.isFS.markupBody) {
		obj.frontend["markupBody"] = '/components/markup-body.css';
	} else {
		obj.frontend["markupBody"] = obj.markupBody;
	}
	if (obj.isFS.nouwiki) {
		obj.frontend["nouwiki"] = '/components/nouwiki/';
	} else {
		obj.frontend["nouwiki"] = obj.nouwiki;
	}
	if (obj.isFS.template) {
		obj.frontend["template"] = '/components/template/';
	} else {
		obj.frontend["template"] = obj.template;
	}
}

function resolveContentPaths(obj, many) {
	obj.backend = obj.backend || {};
	obj.frontend = obj.frontend || {};
	var v = obj.root;
	obj.backend.path = v;
	if (!isHTTP(v)) {
		if (many) {
			obj.frontend.path = "/"+obj.wiki_title+"/";
		} else {
			obj.frontend.path = "/";
		}
	} else {
		obj.frontend.path = v;
	}
}

function* loadContentConfigs(content) {
	var settings_toml = pathResolve(content, "/build.toml");
	var parser_toml = pathResolve(content, "/parser.toml");
	var global_toml = pathResolve(content, "/global.toml");

	var conf = {};
	conf.settings = toml.parse(yield getFile(settings_toml));
	conf.parser = toml.parse(yield getFile(parser_toml));
	conf.global = toml.parse(yield getFile(global_toml));
	return conf;
}

function* getPlugins(title, plugins_dir, plugins, target) {
	var rplugins = [];
	var options;
	for (var plugin in plugins) {
		if (plugins[plugin].options != undefined) {
			if (plugins[plugin].options[target+"_"+title] != undefined) {
				options = plugins[plugin].options[target+"_"+title];
			} else {
				options = plugins[plugin].options[target];
			}
		} else {
			options = {};
		}
		var pa = pathResolve(plugins_dir, plugins[plugin].file);
		var plugin;
		if (isHTTP(pa)) {
			var pa_str = yield getFile(pa);
			plugin = [requireFromString(pa_str, plugins[plugin].file), options];
		} else {
			plugin = [require(pa), options];
		}
		rplugins.push(plugin);
	}
	return rplugins;
}

function* getPluginJSON(content_path, plugins) {
	var pluginJSON = {};
	for (var plugin in plugins) {
		try {
			var src = pathResolve(content_path, "/plugins", "/"+plugins[plugin].split(".")[0]+".options.toml");
			var src_string = yield getFile(src);
			pluginJSON[plugins[plugin]] = toml.parse(src_string);
			pluginJSON[plugins[plugin]].file = pluginJSON[plugins[plugin]].file || plugins[plugin];
		} catch(e) {
			console.log(e)
			pluginJSON[plugins[plugin]] = {};
			pluginJSON[plugins[plugin]].file = pluginJSON[plugins[plugin]].file || plugins[plugin];
		}
	}
	return pluginJSON;
}

// Handles getting files that we don't know beforehand are on the filesystem or a http(s) URI
function* getFile(file_path) {
	if (isHTTP(file_path) && (yield urlExists(file_path))) {
		return yield getHTTPFile(file_path);
	} else if (/*isPath(file_path) && */(yield fileExists(file_path))) {
		return yield getFSFile(file_path);
	} else {
		return "";
	}
}
function getHTTPFile(url) {
	return request.get(url);
}
function getFSFile(file_path) {
	try {
		file_path = path.resolve(file_path);
		var fsreadFile = Promise.promisify(fs.readFile);
		return fsreadFile(file_path, 'utf8');
	} catch(e) {
		return false;
	}
}

// http:localhost:8080/wiki/page
// ! http:localhost:8080/wiki/ (index)
// ! http:localhost:8080/t1/ (index)
// http:localhost:8080/wiki/wiki/page
function getPage(url) {
	var i = url.indexOf("/wiki/");
	var isIndex = i == -1 || i == url.length-"/wiki/".length;
	if (isIndex) {
		return "index";
	} else {
		var page = decodeURI(url).split("/");
		page = page[page.length-1].split("?")[0];
		return page;
	}
}

function requireFromString(src, filename) {
  var Module = module.constructor;
  var m = new Module();
  m._compile(src, filename);
  return m.exports;
}

function pathResolve() {
	if (isHTTP(arguments[0])) {
		return urljoin(arguments);
	} else {
		return path.join.apply(null, arguments);
	}
}

function isHTTP(url) {
	return isProtocol(url) && url.indexOf("http") == 0; // also works for https
}
function isProtocol(url) {
	var hasProtocol = url.indexOf("://") > -1;
	var doubleSlashIsFirstSlash = url.indexOf("//") == url.indexOf("/");
	var protocolIsFirstDoubleSlash = url.indexOf("://") == url.indexOf("//") - 1;
	return hasProtocol && doubleSlashIsFirstSlash && protocolIsFirstDoubleSlash;
}

// https://github.com/boblauer/url-exists/blob/master/index.js
function urlExists(url) {
  return request({ url: url, method: 'HEAD' }).then(urlCheck).catch(function(err) { return false; });
}
function urlCheck(res) {
  return /4\d\d/.test(res.statusCode) === false;
}

// http://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js
function* fileExists(file_path) {
	try {
		var fsaccess = Promise.promisify(fs.access);
	  	yield fsaccess(file_path, fs.F_OK);
		return true;
	} catch(e) {
		return false;
	}
}

exports.getPlugins = getPlugins;
exports.getPluginJSON = getPluginJSON;
exports.isHTTP = isHTTP;
exports.loadContentConfigs = loadContentConfigs;
exports.getFile = getFile;
exports.pathResolve = pathResolve;
exports.requireFromString = requireFromString;
exports.getPage = getPage;
exports.empty = "+++\nimport = []\ncss = []\njs = []\n+++\n\n# PAGE_TITLE\n\nEmpty page.\n";
exports.fileExists = fileExists;
exports.resolveComponentPaths = resolveComponentPaths;
exports.resolveContentPaths = resolveContentPaths;