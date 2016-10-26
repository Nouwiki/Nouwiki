var content = require('./content');
var nou = require('./nou');
var koa = require('koa');
var portfinder = require('portfinder');
var app = koa();
var port;

function* nouServe(toml_path, p) {
	port = p;
	yield nou.serve(app, toml_path);
	listen();
}

function* contentServe(toml_paths, p) {
  port = p;
	yield content.serve(app, {"nou": {"content": toml_paths}});
	listen();
}

function listen() {
  if (port == undefined) {
    portfinder.basePort = 8080;
    portfinder.getPort(function (err, pf) {
      if (err) { throw err; }
      console.log("NouWiki is serving on port: "+(process.env.PORT || pf));
      app.listen(process.env.PORT || pf);
    });
  } else {
    console.log("NouWiki is serving on port: "+(process.env.PORT || port));
    app.listen(process.env.PORT || port);
  }
}

exports.nou = nouServe;
exports.content = contentServe;