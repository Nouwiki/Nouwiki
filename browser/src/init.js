var toml = require('toml');

var QueryString = function () {
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}();

window.nouwiki = {};
window.nouwiki.config = "";
window.nouwiki.plugins = [];
window.nouwiki.ready = function() {
  window.nouwiki.ready = true;
}
window.nouwiki.parse = require("../../parse.js");
//var parse = require("../../../parse.js");
//window.nouwiki.parse = {};
//window.nouwiki.parse.init = parse.init;
//window.nouwiki.parse.loadPlugins = parse.loadPlugins;
//window.nouwiki.parse.parse = parse.parse;
require("./js/origin.js");

var root = QueryString.root || window.nouwiki.origin.root;
var content_root = QueryString.content || root;
// CORS proxy
if (QueryString.proxy != undefined) {
  root = QueryString.proxy+root;
  content_root = QueryString.proxy+content_root;
}

// Get Config & Load markdown-it Plugins
var oReq = new XMLHttpRequest();
oReq.onload = function (e) {
  window.nouwiki.config = toml.parse(e.target.response);
  if (window.target == "dynamic_read") {
    getPageData();
    getPlugins(false);
  } else {
    getPlugins(true);
  }
};
oReq.open('GET', root+"nouwiki.toml" + '?' + new Date().getTime(), true);
//oReq.responseType = 'json';
oReq.send();

var loc = decodeURI(window.location.href);

var title = loc.split("/");
title = title[title.length-1].split("?")[0];
window.nouwiki.title = title || "index";

var n = 3;
function getPageData() {
  window.nouwiki.title = QueryString.title || "index";
  var markup = content_root+"content/markup/"+window.nouwiki.title+".md";
  var template = root+"nouwiki/templates/"+window.nouwiki.config.template+"/template/dynamic_read/dynamic.dot.jst";

  var oReq = new XMLHttpRequest();
  oReq.onload = function (e) {
    window.nouwiki.markup = e.target.response;
    n--;
    if (n == 0) {
      window.nouwiki.ready();
    }
  };
  oReq.open('GET', markup + '?' + new Date().getTime(), true);
  oReq.send();

  var oReq = new XMLHttpRequest();
  oReq.onload = function (e) {
    window.nouwiki.template = e.target.response;
    n--;
    if (n == 0) {
      window.nouwiki.ready();
    }
  };
  oReq.open('GET', template + '?' + new Date().getTime(), true);
  oReq.send();
}

function getPlugins(ready) {
  var plugins = window.nouwiki.config.plugins.parser;
  var def = window.nouwiki.config.index_default;
  var files = [];
  for (var plugin in plugins) {
    files.push(root+"nouwiki/plugins/parser/"+plugins[plugin].name);
  }
  requirejs(files, function() {
    var options;
    for (var a in arguments) {
      options = plugins[a].options[def];
      // This should be a plugin
      if (window.target == "dynamic_read") {
        for (var s in QueryString) {
          if (s != "title") {
            options.tail += "&"+s+"="+QueryString[s];
          }
        }
      }
      if (title == "index" && plugins[a].options[def+"_index"] != undefined) {
        options = plugins[a].options[def+"_index"];
      }
      window.nouwiki.plugins.push([arguments[a], options])
    }
    window.nouwiki.parse.init();
    window.nouwiki.parse.loadPlugins(window.nouwiki.plugins);
    if (ready) {
      window.nouwiki.ready();
    } else {
      n--;
      if (n == 0) {
        window.nouwiki.ready();
      }
    }
  });
}
