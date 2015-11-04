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
  .command('build <target> [paths...]')
  .action(function (target, paths) {
    var path_abs;
    if (targets.indexOf(target) > -1) {
      if (paths.length != 0) {
        for (var x = 0; x < paths.length; x++) {
          path_abs = path.resolve(paths[x]);
          build.buildWiki(path_abs, target);
        }
      } else {
        path_abs = path.resolve("./");
        build.buildWiki(path_abs, target);
      }
    }
  });

program.parse(process.argv);
