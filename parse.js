var matter = require('gray-matter');
var doT = require('dot');

// Initialize markdown-it
var md = require('markdown-it')({
  html: true,
  linkify: false,
  typographer: false
});

/*
- browser needs to load in plugins once
- backend needs to load new plugins on each call
*/

function parse(title, markup, config, template_markup, plugins, reset) {
  if (reset) {
    md = require('markdown-it')({
      html: true,
      linkify: false,
      typographer: false
    });
  }
  var plugins = plugins || [];
  for (var plugin in plugins) {
    md.use(plugins[plugin][0], plugins[plugin][1]);
  }
  var output = {};

  var content = matter(markup, { lang: 'toml', delims: ['+++', '+++']});
  markup = content.content;
  fragment = md.render(markup);

  var html = "";
	if (template_markup != undefined) {
    var template_data = {
      fragment: fragment,
      title: title,
      local: content.data,
      global: config.include
    }
		var temp = doT.template(template_markup);
		html = temp(template_data);
	}

  //output.text = fragment.replace(/<(?:.|\n)*?>/gm, '');
  output.fragment = fragment;
  output.html = html;

  console.log(title);
	return output;
}

exports.parse = parse;
