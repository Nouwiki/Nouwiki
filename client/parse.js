var matter = require('gray-matter');
var doT = require('dot');

// Initialize markdown-it
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
}).use(require('markdown-it-wikilink'))

function parse(title, markup, config, template_markup) {
  var content = matter(markup, { lang: 'toml', delims: ['+++', '+++']});
  markup = content.content;
  html = md.render(markup);

	var output;
	if (template_markup != undefined) {
    var template_data = {
      html: html,
      title: title,
      local: content.data,
      global: config
    }
		var temp = doT.template(template_markup);
		output = temp(template_data);
	} else {
		output = html;
	}
  console.log(title);
	return output;
}

exports.parse = parse;
