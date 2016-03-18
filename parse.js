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

function parse(title, markup, config, template_markup) {
  var output = {};

  var content = matter(markup, { lang: 'toml', delims: ['+++', '+++']});
  markup = content.content;
  fragment = md.render(markup);

  output.text = fragment.replace(/<(?:.|\n)*?>/gm, '');
  output.fragment = fragment;

  if (template_markup != undefined) {
    var template_data = {
      fragment: fragment,
      title: title,
      wiki: config.wiki,
      local: content.data,
      global: config.global
    }
    var temp = doT.template(template_markup);
    output.page = temp(template_data);
  }

	return output;
}

exports.init = init;
exports.loadPlugins = loadPlugins;
exports.parse = parse;
