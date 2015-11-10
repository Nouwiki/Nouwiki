#!/usr/bin/env node

var path = require('path');
var program = require('commander');

var create = require('./create');
var build = require('./build');

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
  .option('-c, --copy', 'Copy user assets instead of symbolically linking them, useful for github hosting for example')
  .command('build <target> [paths...]')
  .action(function (target, paths) {
    var path_abs;
    if (targets.indexOf(target) > -1) {
      if (paths.length != 0) {
        for (var x = 0; x < paths.length; x++) {
          path_abs = path.resolve(paths[x]);
          build.buildWiki(path_abs, target, program.assets, program.copy);
        }
      } else {
        path_abs = path.resolve("./");
        build.buildWiki(path_abs, target, program.assets, program.copy);
      }
    }
  });

program.parse(process.argv);
