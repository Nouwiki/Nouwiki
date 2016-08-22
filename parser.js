var matter = require('gray-matter');
var doT = require('dot');
doT.templateSettings.strip = false;

var md, front_matter_line_count;

function init(parser_options, preview) {
  md = require('markdown-it')(parser_options);
  if (preview) {
    md.renderer.rules.paragraph_open = md.renderer.rules.heading_open = injectLineNumbers;
    md.renderer.rules.link_open = editLink;
  }
}

function loadPlugins(plugins) {
  var plugins = plugins || [];
  for (var plugin in plugins) {
    if (plugins[plugin][1] != undefined) {
      md.use(plugins[plugin][0], plugins[plugin][1]);
    } else {
      md.use(plugins[plugin][0]);
    }
  }
}

function parse(nouwiki, page_title, markup, template_markup, global) {
  var local = matter(markup, { lang: 'toml', delims: ['+++', '+++']}); // split content from front-matter
  markup_nofront = local.content; // markup only
  front_matter_line_count = markup.split(/\r\n|\r|\n/).length - markup_nofront.split(/\r\n|\r|\n/).length // the line count of front matter (needed for correct sync scrolling in preview)
  fragment = md.render(markup_nofront); // render fragment from markup using markdown-it

  // Create output object (contains fragment (the result from markdown-it markdown to html parsing) and page (the result from doT.js templating))
  var output = {};
  output.fragment = fragment;
  if (template_markup != undefined) {
    var template_data = {
      nouwiki: nouwiki, // nouwiki.toml
      title: page_title, // the name of the page (/wiki/-->God<--)
      global: global, // global.toml "front matter"
      local: local.data, // local page front matter
      fragment: fragment
    }
    // Generate the page value of the object using doT.js (templating)
    var temp = doT.template(template_markup);
    output.page = temp(template_data);
  }

	return output;
}


/* Preview helpers */

// Line numbers in preview for sync-scolling in edit mode
function injectLineNumbers(tokens, idx, options, env, slf) {
  var line;
  if (tokens[idx].map && tokens[idx].level === 0) {
    line = tokens[idx].map[0]+front_matter_line_count;
    tokens[idx].attrJoin('class', 'line');
    tokens[idx].attrSet('data-line', String(line));
  }
  return slf.renderToken(tokens, idx, options, env, slf);
}

// When clicking wikilinks in preview in edit mode that page should open up in edit mode
function editLink(tokens, idx, options, env, self) {
  var hrefIndex = tokens[idx].attrIndex('href');
  var href = tokens[idx].attrs[hrefIndex][1];

  if (hrefIndex >= 0 && href.indexOf("/wiki/") == 0) { // if markdown link doesn't contain a url use the text as url (wikilink)
    tokens[idx].attrs[hrefIndex][1] = tokens[idx].attrs[hrefIndex][1]+"?mode=edit";
  }
  return self.renderToken(tokens, idx, options, env, self);
}


exports.init = init;
exports.loadPlugins = loadPlugins;
exports.parse = parse;
try { // Need to "try" since this will only work in browser, not in Node
  nouwiki_global.parser = exports;
  console.log(nouwiki_global.parser)
} catch(e) {
  //console.log(e);
}
