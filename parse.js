var matter = require('gray-matter');
var doT = require('dot');
//var hljs = require('highlight.js') // https://highlightjs.org/
//hljs.configure({classPrefix: ''});
//hljs.initHighlightingOnLoad();

var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true/*,
  highlight: function (str, lang) {
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

/* --- */

function fragment(data) {
	var content = matter(data, { lang: 'toml', delims: ['+++', '+++']});
  console.log(content.data.title)
	markData = content.content;
	if (content.data.title != undefined) {
		markData = "# "+content.data.title+"\n\n"+markData
	}
	html = md.render(markData);
	return { html: html, content: content.data };
}

function parse(markup, config, template) {
	var data = fragment(markup); // .html .content.*

	template_data = {
		html: data.html,
		title: data.content.title,
		local_js: data.content.js,
		local_css: data.content.css,
		title: config.title,
    global_js: config.js,
		global_css: config.css
	}

	var output;
	if (template != undefined) {
		var temp = doT.template(template);
		output = temp(template_data);
	} else {
		output = template_data.html;
	}
	return output;
}

exports.parse = parse;
