var toml = require('toml');

// Helpers
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

function newRequest(file, f, attach) {
  var oReq = new XMLHttpRequest();
  oReq.onload = f;
  if (attach != undefined) {
    oReq.attach = attach;
  }
  oReq.open('GET', root+file + '?' + new Date().getTime(), true);
  oReq.send();
}

// http://stackoverflow.com/questions/16839698/jquery-getscript-alternative-in-native-javascript
function getScript(source, callback) {
    var script = document.createElement('script');
    var prior = document.getElementsByTagName('script')[0];
    script.async = 1;
    prior.parentNode.insertBefore(script, prior);

    script.onload = script.onreadystatechange = function( _, isAbort ) {
        if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if(!isAbort) { if(callback) callback(); }
        }
    };

    script.src = source;
}

function getTemplate(json) {
  nouwiki_global.nouwiki.template = json.template;
}
window.getTemplate = getTemplate;


// Init
nouwiki_global.nouwiki = nouwiki_global.nouwiki || {};
nouwiki_global.nouwiki.origin = require("./js/origin.js").origin;
nouwiki_global.nouwiki.nouwiki = {};
nouwiki_global.nouwiki.plugins = [];
nouwiki_global.nouwiki.ready = function() {
  nouwiki_global.nouwiki.ready = true;
}
//nouwiki_global.nouwiki.parse = require("../../parse.js");
//var parse = require("../../../parse.js");
//window.nouwiki.parse = {};
//window.nouwiki.parse.init = parse.init;
//window.nouwiki.parse.loadPlugins = parse.loadPlugins;
//window.nouwiki.parse.parse = parse.parse;

var root = QueryString.root || nouwiki_global.nouwiki.origin.root;
var content_root = QueryString.content || root;
// CORS proxy
if (QueryString.proxy != undefined) {
  root = QueryString.proxy+root;
  content_root = QueryString.proxy+content_root;
}

var loc = decodeURI(window.location.href);

var title = loc.split("/");
title = title[title.length-1].split("?")[0];
nouwiki_global.nouwiki.title = title || "index";

// Get nouwiki.toml, global.toml, and parser.toml
var top_n = 0;

var file = "nouwiki.toml";
var f = function (e) {
  nouwiki_global.nouwiki.nouwiki = toml.parse(e.target.response);
  getScript(nouwiki_global.nouwiki.nouwiki.parser, function() {
    top_n += 1;
    console.log(top_n)
    if (top_n == 3) {
      topReady();
    }
  });
};
newRequest(file, f)
var file = "global.toml";
var f = function (e) {
  nouwiki_global.nouwiki.global = toml.parse(e.target.response);
  top_n += 1;
  console.log(top_n)
  if (top_n == 3) {
    topReady();
  }
};
newRequest(file, f)
var file = "parser.toml";
var f = function (e) {
  nouwiki_global.nouwiki.parser = toml.parse(e.target.response);
  getPluginOptions();
};
newRequest(file, f)

var plugin_n = 0;
function getPluginOptions() {
  console.log(nouwiki_global.nouwiki.parser.plugins)
  if (nouwiki_global.nouwiki.parser.plugins.length > 0) {
    nouwiki_global.nouwiki.parser.options = {};
    for (var plugin in nouwiki_global.nouwiki.parser.plugins) {
      var file = "plugins/"+nouwiki_global.nouwiki.parser.plugins[plugin].split(".")[0]+".toml";
      var f = function (e) {
        nouwiki_global.nouwiki.parser.options[this.attach] = toml.parse(e.target.response).options;
        plugin_n += 1;
        if (plugin_n == nouwiki_global.nouwiki.parser.plugins.length) {
          top_n += 1
          console.log(top_n)
          if (top_n == 3) {
            topReady();
          }
        }
      };
      var attach = nouwiki_global.nouwiki.parser.plugins[plugin];
      newRequest(file, f, attach)
    }
  } else {
    top_n += 1
    console.log(top_n)
    if (top_n == 3) {
      topReady();
    }
  }
}



var bottom_n = 0;
var bottom_num = 1;
function topReady() {
  console.log("READY")
  if (nouwiki_global.target == "dynamic") {
    bottom_num += 2;
    getPageData();
  }
  loadPlugins();
}

function getPageData() {
  nouwiki_global.nouwiki.title = QueryString.title || "index";
  var markup = content_root+"markup/"+nouwiki_global.nouwiki.title+".md";
  var template;
  var t = nouwiki_global.nouwiki.nouwiki.template+"/template/dynamic/dynamic.json";
  if (t.indexOf("/") == t.indexOf("//") && t.indexOf("://") > -1) { // a url
    template = t;
  } else {
    if (t.indexOf("/") == 0) {
      t = t.substr(1);
    }
    template = root+t;
  }
  console.log(template)

  var oReq = new XMLHttpRequest();
  oReq.onload = function (e) {
    nouwiki_global.nouwiki.markup = e.target.response;
    bottom_n += 1;
    if (bottom_n == bottom_num) {
      nouwiki_global.nouwiki.ready();
    }
  };
  oReq.open('GET', markup + '?' + new Date().getTime(), true);
  oReq.send();

  getScript(template + '?' + new Date().getTime(), function() {
    bottom_n += 1;
    if (bottom_n == bottom_num) {
      nouwiki_global.nouwiki.ready();
    }
  });

  /*var oReq = new XMLHttpRequest();
  oReq.onload = function (e) {
    console.log(e)
    nouwiki_global.nouwiki.template = e.target.response;
    bottom_n += 1;
    if (bottom_n == bottom_num) {
      nouwiki_global.nouwiki.ready();
    }
  };
  oReq.open('GET', template + '?' + new Date().getTime(), true);
  oReq.send();*/
}

function loadPlugins(ready) {
  var plugins = nouwiki_global.nouwiki.parser.plugins;
  console.log(plugins)
  if (plugins.length > 0) {
    var def = nouwiki_global.target;
    var files = [];
    for (var plugin in plugins) {
      files.push(root+"plugins/"+plugins[plugin]);
    }
    requirejs(files, function() {
      var options;
      for (var a in arguments) {
        console.log(nouwiki_global.nouwiki.parser.options,plugins[a],def)
        options = nouwiki_global.nouwiki.parser.options[plugins[a]][def];
        // This should be a plugin
        /*if (def == "dynamic") {
          for (var s in QueryString) {
            if (s != "title" && s != "") {
              options.tail += "&"+s+"="+QueryString[s];
            }
          }
        }*/
        if (nouwiki_global.nouwiki.parser.options[plugins[a]][def+"_"+title] != undefined) {
          options = nouwiki_global.nouwiki.parser.options[plugins[a]][def+"_"+title];
        }
        console.log(options)
        nouwiki_global.nouwiki.plugins.push([arguments[a], options]);
      }
      nouwiki_global.parser.init(nouwiki_global.nouwiki.parser.parser_options, true); // is for preview
      nouwiki_global.parser.loadPlugins(nouwiki_global.nouwiki.plugins);

      bottom_n += 1;
      if (bottom_n == bottom_num) {
        nouwiki_global.nouwiki.ready();
      }
    });
  } else {
    nouwiki_global.parser.init();

    bottom_n += 1;
    if (bottom_n == bottom_num) {
      nouwiki_global.nouwiki.ready();
    }
  }
}




/*
// ---

// Get Config & Load markdown-it Plugins
var oReq = new XMLHttpRequest();
oReq.onload = function (e) {
  window.nouwiki.config = toml.parse(e.target.response);
  if (window.target == "dynamic") {
    getPageData();
    getPlugins(false);
  } else {
    getPlugins(true);
  }
};
oReq.open('GET', root+"nouwiki.toml" + '?' + new Date().getTime(), true);
//oReq.responseType = 'json';
oReq.send();

var n = 3;
function getPageData() {
  window.nouwiki.title = QueryString.title || "index";
  var markup = content_root+"markup/"+window.nouwiki.title+".md";
  var template = root+window.nouwiki.config.template+"/template/dynamic/dynamic.dot.jst";

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
  var oReq = new XMLHttpRequest();
  oReq.onload = function (e) {
    window.nouwiki.parser = e.target.response;
    loadPlugins(ready);
  };
  oReq.open('GET', root+"parser.toml" + '?' + new Date().getTime(), true);
  oReq.send();
}

function loadPlugins(ready) {
  var plugins = window.nouwiki.parser.plugins;
  //var def = window.nouwiki.config.index_default;
  var def = window.target;
  var files = [];
  for (var plugin in plugins) {
    files.push(root+"plugins/"+plugins[plugin]);
  }
  requirejs(files, function() {
    var options;
    for (var a in arguments) {
      options = plugins[a].options[def];
      // This should be a plugin
      if (def == "dynamic") {
        for (var s in QueryString) {
          if (s != "title" && s != "") {
            options.tail += "&"+s+"="+QueryString[s];
          }
        }
      }
      if (window.nouwiki.title == "index" && plugins[a].options[def+"_index"] != undefined) {
        options = plugins[a].options[def+"_index"];
      }
      window.nouwiki.plugins.push([arguments[a], options])
    }
    window.nouwiki.parse.init(window.nouwiki.config.parser_options);
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
*/
