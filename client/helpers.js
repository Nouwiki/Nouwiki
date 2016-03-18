var path = require('path');

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

exports.getPlugins = getPlugins;
