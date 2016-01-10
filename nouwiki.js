#!/usr/bin/env node

var path = require('path');
var program = require('commander');

var forge = require('./client/forge');
var build = require('./client/build');
var serve = require('./client/serve');

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
  .option('-a, --assets', 'Generate pages for user assets')
  //.option('-t, --template', 'Build template as well (in case it has been updated or changed)')
  .option('-t, --target [target]', 'Overwrite config.toml target settings (static, dynamic)')
  .command('build [paths...]')
  .action(function (paths) {
    var wiki_abs_dir;
    if (paths.length != 0) {
      for (var x = 0; x < paths.length; x++) {
        wiki_abs_dir = path.resolve(paths[x]);
        build.buildWiki(wiki_abs_dir, program.assets, program.target);
      }
    } else {
      wiki_abs_dir = path.resolve("./");
      build.buildWiki(wiki_abs_dir, program.assets, program.target);
    }
  });

  program
    .option('-p, --port [port]', 'HTTP Port')
    .command('serve [paths...]')
    .action(function (paths) {
      var wiki_abs_dir;
      if (paths.length != 0) {
        for (var x = 0; x < paths.length; x++) {
          wiki_abs_dir = path.resolve(paths[x]);
          paths[x] = wiki_abs_dir;
        }
      } else {
        wiki_abs_dir = path.resolve("./");
        paths.push(wiki_abs_dir);
      }

      serve.serve(paths, program.port);
    });

program.parse(process.argv);
