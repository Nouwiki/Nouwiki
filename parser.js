var matter = require('gray-matter');
var doT = require('dot');

doT.templateSettings.strip = false;

var md;

function init(parser_options) {
  md = require('markdown-it')(parser_options);
}

function loadPlugins(plugins) {
  var plugins = plugins || [];
  for (var plugin in plugins) {
    md.use(plugins[plugin][0], plugins[plugin][1]);
  }
}

function parse(page_title, wiki_title, markup, template_markup, global) {
  var output = {};

  var local = matter(markup, { lang: 'toml', delims: ['+++', '+++']});
  markup_nofront = local.content;
  fragment = md.render(markup_nofront);

  //output.text = fragment.replace(/<(?:.|\n)*?>/gm, '');
  output.fragment = fragment;

  if (template_markup != undefined) {
    var template_data = {
      wiki: wiki_title,
      title: page_title,
      global: global, // global.toml "front matter"
      local: local.data, // local page front matter
      fragment: fragment
    }
    var temp = doT.template(template_markup);
    output.page = temp(template_data);
  }

	return output;
}

exports.init = init;
exports.loadPlugins = loadPlugins;
exports.parse = parse;
try {
  nouwiki_global.parser = exports;
} catch(e) {
  //console.log(e);
}
