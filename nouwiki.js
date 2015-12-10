#!/usr/bin/env node

var path = require('path');
var program = require('commander');

var create = require('./create');
var build = require('./build');
var serve = require('./serve');

program
  .version('0.0.1')

program
  .command('new <type> [paths...]')
  .action(function (type, paths) {
    if (type == "wiki") {
    	for (var x = 0; x < paths.length; x++) {
    		create.createWiki(paths[x])
    	}
    } else if (type == "page") {

    }
  });

var targets = ["all", "fragment", "static", "dynamic"];

program
  .option('-a, --assets', 'Generate pages for user assets')
  .command('build [paths...]')
  .action(function (paths) {
    var wiki_abs_dir;
    if (paths.length != 0) {
      for (var x = 0; x < paths.length; x++) {
        wiki_abs_dir = path.resolve(paths[x]);
        build.buildWiki(wiki_abs_dir, program.assets);
      }
    } else {
      wiki_abs_dir = path.resolve("./");
      build.buildWiki(wiki_abs_dir, program.assets);
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
