var matter = require('gray-matter');
var hljs = require('highlight.js') // https://highlightjs.org/
//hljs.configure({classPrefix: ''});
//hljs.initHighlightingOnLoad();

var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
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
  }
}).use(require('markdown-it-wikilink'))//.use(require('markdown-it-attrs'));

/* --- */

function parse(data) {
	var content = matter(data, { lang: 'toml', delims: ['+++', '+++']});
  console.log(content.data.title)
	markData = content.content;
	if (content.data.title != undefined) {
		markData = "# "+content.data.title+"\n\n"+markData
	}
	html = md.render(markData);
	return { html: html, title: content.data.title };
}

exports.parse = parse;
