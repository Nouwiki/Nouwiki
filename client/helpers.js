var path = require('path');
var fs = require('fs-extra');
var toml = require('toml');

function getPlugins(title, plugins_dir, plugins, target) {
	var rplugins = [];
	var options;
	for (var plugin in plugins) {
		options = plugins[plugin].options[target];
		if (plugins[plugin].options[target+"_"+title] != undefined) {
			options = plugins[plugin].options[target+"_"+title];
		}
		var pa = path.join(plugins_dir, plugins[plugin].file);
		rplugins.push([require(pa), options]);
	}
	return rplugins;
}

function getPluginJSON(wiki_parser_plugins_path, plugins) {
	var pluginJSON = {};
	for (var plugin in plugins) {
		var src = path.join(wiki_parser_plugins_path, "/"+plugins[plugin].split(".")[0]+".toml");
		var src_string = fs.readFileSync(src, 'utf8');
		pluginJSON[plugins[plugin]] = toml.parse(src_string);
		pluginJSON[plugins[plugin]].file = pluginJSON[plugins[plugin]].file || plugins[plugin];
	}
	return pluginJSON;
}

exports.getPlugins = getPlugins;
exports.getPluginJSON = getPluginJSON;
