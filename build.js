var fs = require('fs');
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
}).use(require('markdown-it-wikilink')).use(require('markdown-it-attrs'));

/* --- */

function build(markup_file) {
	var data = fs.readFileSync(markup_file, 'utf8');
	var content = matter(data, { lang: 'toml', delims: ['+++', '+++']});
	markData = content.content;
	console.log(content)
	if (content.data.title != undefined) {
		markData = "# "+content.data.title+"\n\n"+markData
	}
	html = md.render(markData);
	return html;
}

exports.build = build;