var toml = require('toml');
var markdownit = require('markdown-it');
var matter = require('gray-matter');
var doT = require('dot');
doT.templateSettings.strip = false;
var helpers = require('./helpers');


// Called on loading JSONP templates
function getTemplate(json) {
  nouwiki_global.template = json.template;
}
window.getTemplate = getTemplate;


// Init
nouwiki_global = nouwiki_global || {};
nouwiki_global.origin = require("./js/origin.js").origin;
//nouwiki_global.nouwiki = {};
nouwiki_global.plugins = [];
nouwiki_global.conf = nouwiki_global.conf || {};
nouwiki_global.ready = function() {
  nouwiki_global.ready = true;
}

/*var root = helpers.QueryString.root || nouwiki_global.origin.root;
var content_root = helpers.QueryString.content || root;
// CORS proxy
if (helpers.QueryString.proxy != undefined) {
  root = helpers.QueryString.proxy+root;
  content_root = helpers.QueryString.proxy+content_root;
}*/

//var root = nouwiki_global.conf.content.frontend.path;
//var content_root = root;

var nou_root = nouwiki_global.paths.nou;
var content_root = nouwiki_global.paths.content;

var loc = decodeURI(window.location.href);

var title = loc.split("/");
title = title[title.length-1].split("?")[0];
nouwiki_global.title = title || "index";
nouwiki_global.mode = helpers.QueryString.mode || "view";


// Get nouwiki.toml, global.toml, and parser.toml(+parser plugins)
var top_n = 0;

var file = "nou.toml";
var f = function (e) {
  nouwiki_global.conf.nou = toml.parse(e.target.response);
  top_n += 1;
  if (top_n == 4) {
    topReady();
  }
};
helpers.newRequest(nou_root, file, f)
var file = "content.toml";
var f = function (e) {
  nouwiki_global.conf.content = toml.parse(e.target.response);
  top_n += 1;
  if (top_n == 4) {
    topReady();
  }
};
helpers.newRequest(content_root, file, f)
var file = "global.toml";
var f = function (e) {
  nouwiki_global.conf.global = toml.parse(e.target.response);
  top_n += 1;
  if (top_n == 4) {
    topReady();
  }
};
helpers.newRequest(content_root, file, f)
var file = "parser.toml";
var f = function (e) {
  nouwiki_global.conf.parser = toml.parse(e.target.response);
  getPluginOptions();
};
helpers.newRequest(content_root, file, f)


var plugin_n = 0;
function getPluginOptions() {
  if (nouwiki_global.conf.parser.plugins.length > 0) {
    nouwiki_global.conf.parser.plugin_options = {};
    for (var plugin in nouwiki_global.conf.parser.plugins) {
      var file = "plugins/"+nouwiki_global.conf.parser.plugins[plugin].split(".")[0]+".options.toml";
      var f = function (e) {
        if (e.target.status == 200) {
          nouwiki_global.conf.parser.plugin_options[this.attach] = toml.parse(e.target.response).options;
        }
        plugin_n += 1;
        if (plugin_n == nouwiki_global.conf.parser.plugins.length) {
          top_n += 1
          if (top_n == 4) {
            topReady();
          }
        }
      };
      var attach = nouwiki_global.conf.parser.plugins[plugin];
      helpers.newRequest(content_root, file, f, attach);
    }
  } else {
    top_n += 1
    if (top_n == 4) {
      topReady();
    }
  }
}


/* Get plugins, and templates if we're in dynamic target mode */
var bottom_n = 0;
var bottom_num = 1;
function topReady() {
  if (nouwiki_global.target == "dynamic") {
    bottom_num += 2;
    getPageData(); // Get markup and template
  }
  loadPlugins(); // Load plugins into the parser
}

function getPageData() {
  nouwiki_global.title = helpers.QueryString.title || "index";
  var markup = "markup/"+nouwiki_global.title+".md";
  var template;
  var t = nouwiki_global.conf.nouwiki.template_FRONTEND+"/template/dynamic/dynamic.json";
  if (t.indexOf("/") == t.indexOf("//") && t.indexOf("://") > -1) { // a url
    template = t;
  } else { // not a url
    if (t.indexOf("/") == 0) {
      t = t.substr(1);
    }
    template = nou_root+t;
  }

  // Get markup
  var f = function (e) {
    nouwiki_global.markup = e.target.response;
    bottom_n += 1;
    if (bottom_n == bottom_num) {
      nouwiki_global.ready();
    }
  };
  helpers.newRequest(content_root, markup, f);

  // Get template
  helpers.getScript(template + '?' + new Date().getTime(), function() {
    bottom_n += 1;
    if (bottom_n == bottom_num) {
      nouwiki_global.ready();
    }
  });
}

function loadPlugins() {
  var plugins = nouwiki_global.conf.parser.plugins;
  if (plugins.length > 0) {
    var def = nouwiki_global.target;
    var files = [];
    for (var plugin in plugins) {
      files.push(content_root+"plugins/"+plugins[plugin]);
    }
    requirejs(files, function() {
      var options;
      for (var a in arguments) {
        if (nouwiki_global.conf.parser.plugin_options[plugins[a]] != undefined) {
          options = nouwiki_global.conf.parser.plugin_options[plugins[a]][def];
          if (nouwiki_global.conf.parser.plugin_options[plugins[a]][def+"_"+title] != undefined) {
            options = nouwiki_global.conf.parser.plugin_options[plugins[a]][def+"_"+title];
          }
        }
        var plugin = [];
        plugin.push(arguments[a]);
        if (options != undefined) {
          plugin.push(options);
        }
        nouwiki_global.plugins.push(plugin);
      }
      nouwiki_global.parser.init(markdownit, nouwiki_global.conf.parser.options, true, matter, doT);
      nouwiki_global.parser.loadPlugins(nouwiki_global.plugins);

      bottom_n += 1;
      if (bottom_n == bottom_num) {
        nouwiki_global.ready();
      }
    });
  } else {
    nouwiki_global.parser.init(markdownit, nouwiki_global.conf.parser.options, true, matter, doT);

    bottom_n += 1;
    if (bottom_n == bottom_num) {
      nouwiki_global.ready();
    }
  }
}
