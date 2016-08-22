var toml = require('toml');
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
nouwiki_global.config = {};
nouwiki_global.ready = function() {
  nouwiki_global.ready = true;
}

var root = helpers.QueryString.root || nouwiki_global.origin.root;
var content_root = helpers.QueryString.content || root;
// CORS proxy
if (helpers.QueryString.proxy != undefined) {
  root = helpers.QueryString.proxy+root;
  content_root = helpers.QueryString.proxy+content_root;
}

var loc = decodeURI(window.location.href);

var title = loc.split("/");
title = title[title.length-1].split("?")[0];
nouwiki_global.title = title || "index";
nouwiki_global.mode = helpers.QueryString.mode || "view";


// Get nouwiki.toml, global.toml, and parser.toml(+parser plugins)
var top_n = 0;

var file = "nouwiki.toml";
var f = function (e) {
  nouwiki_global.config.nouwiki = toml.parse(e.target.response);
  helpers.getScript(nouwiki_global.config.nouwiki.parser, function() {
    top_n += 1;
    if (top_n == 3) {
      topReady();
    }
  });
};
helpers.newRequest(root, file, f)
var file = "global.toml";
var f = function (e) {
  nouwiki_global.config.global = toml.parse(e.target.response);
  top_n += 1;
  if (top_n == 3) {
    topReady();
  }
};
helpers.newRequest(root, file, f)
var file = "parser.toml";
var f = function (e) {
  nouwiki_global.config.parser = toml.parse(e.target.response);
  getPluginOptions();
};
helpers.newRequest(root, file, f)


var plugin_n = 0;
function getPluginOptions() {
  if (nouwiki_global.config.parser.plugins.length > 0) {
    nouwiki_global.config.parser.options = {};
    for (var plugin in nouwiki_global.config.parser.plugins) {
      var file = "plugins/"+nouwiki_global.config.parser.plugins[plugin].split(".")[0]+".toml";
      var f = function (e) {
        if (e.target.status == 200) {
          nouwiki_global.config.parser.options[this.attach] = toml.parse(e.target.response).options;
        }
        plugin_n += 1;
        if (plugin_n == nouwiki_global.config.parser.plugins.length) {
          top_n += 1
          if (top_n == 3) {
            topReady();
          }
        }
      };
      var attach = nouwiki_global.config.parser.plugins[plugin];
      helpers.newRequest(root, file, f, attach);
    }
  } else {
    top_n += 1
    if (top_n == 3) {
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
  var t = nouwiki_global.config.nouwiki.template+"/template/dynamic/dynamic.json";
  if (t.indexOf("/") == t.indexOf("//") && t.indexOf("://") > -1) { // a url
    template = t;
  } else { // not a url
    if (t.indexOf("/") == 0) {
      t = t.substr(1);
    }
    template = root+t;
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
  var plugins = nouwiki_global.config.parser.plugins;
  if (plugins.length > 0) {
    var def = nouwiki_global.target;
    var files = [];
    for (var plugin in plugins) {
      files.push(root+"plugins/"+plugins[plugin]);
    }
    requirejs(files, function() {
      var options;
      for (var a in arguments) {
        if (nouwiki_global.config.parser.options[plugins[a]] != undefined) {
          options = nouwiki_global.config.parser.options[plugins[a]][def];
          if (nouwiki_global.config.parser.options[plugins[a]][def+"_"+title] != undefined) {
            options = nouwiki_global.config.parser.options[plugins[a]][def+"_"+title];
          }
        }
        var plugin = [];
        plugin.push(arguments[a]);
        if (options != undefined) {
          plugin.push(options);
        }
        nouwiki_global.plugins.push(plugin);
      }
      nouwiki_global.parser.init(nouwiki_global.config.parser.parser_options, true); // true = is for preview
      nouwiki_global.parser.loadPlugins(nouwiki_global.plugins);

      bottom_n += 1;
      if (bottom_n == bottom_num) {
        nouwiki_global.ready();
      }
    });
  } else {
    nouwiki_global.parser.init();

    bottom_n += 1;
    if (bottom_n == bottom_num) {
      nouwiki_global.ready();
    }
  }
}
