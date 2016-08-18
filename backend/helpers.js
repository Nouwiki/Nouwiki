var path = require('path');
var fs = require('fs-extra');
var toml = require('toml');

function getPlugins(title, plugins_dir, plugins, target) {
	var rplugins = [];
	var options;
	for (var plugin in plugins) {
		if (plugins[plugin].options != undefined) {
			options = plugins[plugin].options[target];
			if (plugins[plugin].options[target+"_"+title] != undefined) {
				options = plugins[plugin].options[target+"_"+title];
			}
		} else {
			options = {};
		}
		var pa = path.join(plugins_dir, plugins[plugin].file);
		var plugin = [require(pa), options];
		rplugins.push(plugin);
	}
	return rplugins;
}

function getPluginJSON(wiki_parser_plugins_path, plugins) {
	var pluginJSON = {};
	for (var plugin in plugins) {
		try {
			var src = path.join(wiki_parser_plugins_path, "/"+plugins[plugin].split(".")[0]+".toml");
			var src_string = fs.readFileSync(src, 'utf8');
			pluginJSON[plugins[plugin]] = toml.parse(src_string);
			pluginJSON[plugins[plugin]].file = pluginJSON[plugins[plugin]].file || plugins[plugin];
		} catch(e) {
			pluginJSON[plugins[plugin]] = {};
			pluginJSON[plugins[plugin]].file = pluginJSON[plugins[plugin]].file || plugins[plugin];
		}
	}
	return pluginJSON;
}

exports.getPlugins = getPlugins;
exports.getPluginJSON = getPluginJSON;
