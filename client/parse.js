var matter = require('gray-matter');
var doT = require('dot');
/*var hljs = require('highlight.js') // https://highlightjs.org/
hljs.configure({classPrefix: ''});
hljs.initHighlightingOnLoad();*/

// Initialize markdown-it
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
  /*highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (__) {}

    return ''; // use external default escaping
  }*/
}).use(require('markdown-it-wikilink'))//.use(require('markdown-it-attrs'));

function fragment(data) {
	var content = matter(data, { lang: 'toml', delims: ['+++', '+++']});
	markData = content.content;
	html = md.render(markData);
	return { html: html, content: content.data };
}

function parse(title, markup, config, template_markup) {
  console.log(title);
	var data = fragment(markup); // .html .content.*

	template_data = {
		html: data.html,
		title: title,
		local_js: data.content.js,
		local_css: data.content.css,
    local_import: data.content.import,
		wiki: config.wiki,
    global_js: config.js,
		global_css: config.css,
    global_import: config.import
	}

	var output;
	if (template_markup != undefined) {
		var temp = doT.template(template_markup);
		output = temp(template_data);
	} else {
		output = template_data.html;
	}
	return output;
}

exports.parse = parse;
