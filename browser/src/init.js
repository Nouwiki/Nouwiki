var toml = require('toml');

window.nouwiki = {};
window.nouwiki.config = "";
window.nouwiki.plugins = [];
window.nouwiki.ready = function() {
  window.nouwiki.ready = true;
}

// Get Config & Load markdown-it Plugins
var oReq = new XMLHttpRequest();
oReq.onload = function (e) {
  window.nouwiki.config = toml.parse(e.target.response);
  getPlugins(window.nouwiki.config.plugins.parser, window.nouwiki.config.targets.default);
};
oReq.open('GET', "/nouwiki.toml" + '?' + new Date().getTime(), true);
//oReq.responseType = 'json';
oReq.send();

var loc = decodeURI(window.location.href);

var title = loc.split("/");
title = title[title.length-1].split("?")[0];
title = title || "index";

function getPlugins(plugins, def) {
  var files = [];
  for (var plugin in plugins) {
    files.push("/plugins/parser/"+plugins[plugin].name);
  }
  requirejs(files, function() {
    var options;
    for (var a in arguments) {
      options = plugins[a].options[def];
      if (title == "index" && plugins[a].options[def+"_index"] != undefined) {
        options = plugins[a].options[def+"_index"];
      }
      window.nouwiki.plugins.push([arguments[a], options])
    }
    window.nouwiki.ready();
  });
}
