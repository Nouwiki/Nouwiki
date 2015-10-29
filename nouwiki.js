#!/usr/bin/env node

var program = require('commander');

program
  .version('0.0.1')

program
  .command('new <type> [path...]')
  .action(function (type, path) {
    if (type == "wiki") {
    	for (var x = 0; x < path.length; x++) {
    		createWiki(path[x])
    	}
    } else if (type == "page") {

    }
  });

program.parse(process.argv);

function createWiki(path) {
	console.log(path);
}