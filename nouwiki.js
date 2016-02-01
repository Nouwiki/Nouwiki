#!/usr/bin/env node

var path = require('path');
var program = require('commander');

var forge = require('./backend/forge');
var build = require('./backend/build');
var serve = require('./backend/serve');

program
  .version('0.0.1')

program
  .command('forge [paths...]')
  .action(function (paths) {
  	for (var x = 0; x < paths.length; x++) {
  		forge.createWiki(paths[x])
  	}
  });

var targets = ["all", "fragment", "static", "dynamic"];

program
  .option('-t, --target [target]', 'Overwrite config.toml target settings (static, dynamic)')
  .command('build [paths...]')
  .action(function (paths) {
    var wiki_abs_dir;
    if (paths.length != 0) {
      for (var x = 0; x < paths.length; x++) {
        wiki_abs_dir = path.resolve(paths[x]);
        build.buildWiki(wiki_abs_dir, program.target);
      }
    } else {
      wiki_abs_dir = path.resolve("./");
      build.buildWiki(wiki_abs_dir, program.target);
    }
  });

program
  .option('-p, --port [port]', 'HTTP Port')
  .command('serve [paths...]')
  .action(function (paths) {
    var wiki_abs_dir;
    var wikis = [];
    if (paths.length != 0) {
      for (var x = 0; x < paths.length; x++) {
        wiki_abs_dir = path.resolve(paths[x]);
        wikis.push(wiki_abs_dir);
      }
    } else {
      wiki_abs_dir = path.resolve("./");
      wikis.push(wiki_abs_dir);
    }

    serve.serve(wikis, program.port);
  });

program.parse(process.argv);
