#!/usr/bin/env node

var path = require('path');
var program = require('commander');

var forge = require('./backend/forge');
var build = require('./backend/build');
var serve = require('./backend/serve');
//var update = require('./backend/update');

program
  .version('0.0.1')

// Create new wiki(s)
program
  .command('forge [paths...]')
  .action(function (paths) {
  	for (var x = 0; x < paths.length; x++) {
  		forge.createWiki(paths[x])
  	}
  });

// Build a static target of wiki (current targets are `static` and `filesystem`)
program
  .option('-t, --targets [targets...]', 'Overwrite config.toml target settings (dymamic, static, filesystem)')
  .option('-T, --template [template]', 'Specify a template to use (overwrites config.toml).')
  .command('build [paths...]')
  .action(function (paths) {
    var wiki_abs_dir;
    if (paths.length != 0) {
      for (var x = 0; x < paths.length; x++) {
        wiki_abs_dir = path.resolve(paths[x]);
        build.buildWiki(wiki_abs_dir, program.targets, program.template);
      }
    } else {
      wiki_abs_dir = path.resolve("./");
      build.buildWiki(wiki_abs_dir, program.targets, program.template);
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
  .option('-g, --git', 'Git only backend')
  //.option('-t, --target [target]', 'In case you want to serve static or filesystem instead of dynamic, using the nouwiki server.')
  .option('-T, --template [template]', 'Specify a template to use (overwrites config.toml).')
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

    serve.serve(wikis, program.port, program.template);
  });

program.parse(process.argv);
