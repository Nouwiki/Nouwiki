var matter = require('gray-matter');
var doT = require('dot');

// Initialize markdown-it
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
});

function parse(title, markup, config, template_markup) {
  md.use(require('nouwiki-markdown-it-wikilink'));
  console.log(title);
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
      global: config
    }
		var temp = doT.template(template_markup);
		html = temp(template_data);
	}

  output.text = fragment.replace(/<(?:.|\n)*?>/gm, '');
  output.fragment = fragment;
  output.html = html;

	return output;
}

exports.parse = parse;
