#!/usr/bin/env node


var fs = require('fs-extra');
var path = require('path');
var program = require('commander');
var co = require('co');


var forge = require('./backend/forge');
var build = require('./backend/build');
var serve = require('./backend/serve');
//var content = require('./backend/content');
//var nou = require('./backend/nou');
//var update = require('./backend/update');


program
  .version('0.0.1')


// Create new wiki(s)
program
  .command('forge [paths...]')
  .action(function (paths) {
  	for (var x = 0; x < paths.length; x++) {
  		forge.forge(path.resolve(paths[x]))
  	}
  });


// Build wiki(s) to static targets: fragment, static, dynamic
program
  .option('-t, --targets [targets...]', 'Overwrite toml target settings')
  .option('-T, --template [template]', 'Overwrite toml template settings')
  .command('build [paths...]')
  .action(function (paths) {
    var root;
    if (paths.length != 0) {
      for (var x = 0; x < paths.length; x++) {
        root = path.resolve(paths[x]);
        build.build(root, program.targets, program.template);
      }
    } else {
      root = path.resolve("./");
      build.build(root, program.targets, program.template);
    }
  });


// Update all files in wiki that are not wiki-specific
/*program
  .command('update [paths...]')
  .action(function (paths) {
    var wiki_abs_dir;
    if (paths.length != 0) {
      for (var x = 0; x < paths.length; x++) {
        wiki_abs_dir = path.resolve(paths[x]);
        update.update(wiki_abs_dir);
      }
    } else {
      wiki_abs_dir = path.resolve("./");
      update.update(wiki_abs_dir);
    }
  });*/


// Serve wiki
program
  .option('-p, --port [port]', 'HTTP Port')
  .command('nou <path>') // shouldn't this be [paths...]
  .action(function (p) {
    var toml;
    if (p) {
      toml = path.resolve(p);
    } else {
      toml = path.resolve("./");
    }
    var check = fs.lstatSync(toml);
    if (check.isDirectory()) {
      toml = path.join(toml, "/nou.toml");
      check = fs.lstatSync(toml);
      if (check.isFile()) {
        co(serve.nou(toml, program.port));
      }
    } else if (check.isFile()) {
      co(serve.nou(toml, program.port));
    }
  });

program
  .option('-p, --port [port]', 'HTTP Port')
  .command('content <path>') // shouldn't this be [paths...]
  .action(function (p) {
  var toml;
  if (p) {
    toml = path.resolve(p);
  } else {
    toml = path.resolve("./");
  }
  var check = fs.lstatSync(toml);
  if (check.isDirectory()) {
    toml = path.join(toml, "/content.toml");
    check = fs.lstatSync(toml);
    if (check.isFile()) {
      co(serve.content(toml, program.port));
    }
  } else if (check.isFile()) {
    co(serve.content(toml, program.port));
  }
  });

program.parse(process.argv);
