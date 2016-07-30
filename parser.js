var matter = require('gray-matter');
var doT = require('dot');

doT.templateSettings.strip = false;

//
// Inject line numbers for sync scroll. Notes:
//
// - We track only headings and paragraphs on first level. That's enough.
// - Footnotes content causes jumps. Level limit filter it automatically.
function injectLineNumbers(tokens, idx, options, env, slf) {
  var line;
  if (tokens[idx].map && tokens[idx].level === 0) {
    console.log(tokens[idx].tag);
    line = tokens[idx].map[0];
    tokens[idx].attrJoin('class', 'line');
    tokens[idx].attrSet('data-line', String(line));
  }
  return slf.renderToken(tokens, idx, options, env, slf);
}

var md;

function init(parser_options, preview) {
  md = require('markdown-it')(parser_options);
  if (preview) {
    md.renderer.rules.paragraph_open = md.renderer.rules.heading_open = injectLineNumbers;
  }
}

function loadPlugins(plugins) {
  var plugins = plugins || [];
  for (var plugin in plugins) {
    md.use(plugins[plugin][0], plugins[plugin][1]);
  }
}

function parse(nouwiki, page_title, markup, template_markup, global) {
  console.log(nouwiki)
  var output = {};

  var local = matter(markup, { lang: 'toml', delims: ['+++', '+++']});
  markup_nofront = local.content;
  fragment = md.render(markup_nofront);

  //output.text = fragment.replace(/<(?:.|\n)*?>/gm, '');
  output.fragment = fragment;

  if (template_markup != undefined) {
    var template_data = {
      nouwiki: nouwiki,
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
