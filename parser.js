// http://stackoverflow.com/questions/3225251/how-can-i-share-code-between-node-js-and-the-browser
(function(exports){

  var matter;
  var doT;
  var md, front_matter_line_count;

  function init(markdownit, options, preview, m, d) {
    md = markdownit(options);
    if (preview) {
      md.renderer.rules.paragraph_open = md.renderer.rules.heading_open = injectLineNumbers;
      //md.renderer.rules.link_open = editLink;
    }
    matter = m;
    doT = d;
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

  function parse(nou, content, page_title, markup, template_markup) {
    var local = matter(markup, { lang: 'toml', delims: ['+++', '+++']}); // split content from front-matter
    markup_nofront = local.content; // markup only
    front_matter_line_count = markup.split(/\r\n|\r|\n/).length - markup_nofront.split(/\r\n|\r|\n/).length // the line count of front matter (needed for correct sync scrolling in preview)
    fragment = md.render(markup_nofront); // html render fragment from markup using markdown-it

    // Create output object (contains fragment (the result from markdown-it markdown to html parsing) and page (the result from doT.js templating))
    var output = {};
    output.fragment = fragment;
    if (template_markup != undefined) {
      var template_data = {};
      //...
      template_data.nou = nou;
      template_data.content = content;
      template_data.wiki_title = content.wiki_title; // the name of the page (/wiki/-->God<--)
      template_data.page_title = page_title; // the name of the page (/wiki/-->God<--)
      //...
      template_data.global = content.TOML.global; // global front matter
      template_data.local = local.data; // local page front matter
      template_data.fragment = fragment; // markdown to html fragment
      // Use nou paths if present, else use content paths (resolve it here, not in the template)
      template_data.paths = {};
      template_data.paths.nou = "/";
      template_data.paths.content = content.frontend.path;
      if (template_data.nou.merge_search) {
        template_data.paths.search = template_data.paths.nou;
      } else {
        template_data.paths.search = template_data.paths.content;
      }
      template_data.paths.markupBody = nou.frontend.markupBody || content.frontend.markupBody;
      template_data.paths.template = nou.frontend.template || content.frontend.template;
      template_data.paths.parser = nou.frontend.parser || content.frontend.parser;
      template_data.paths.nouwiki = nou.frontend.nouwiki || content.frontend.nouwiki;

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
  /*function editLink(tokens, idx, options, env, self) {
    var hrefIndex = tokens[idx].attrIndex('href');
    var href = tokens[idx].attrs[hrefIndex][1];

    if (hrefIndex >= 0 && href.indexOf("/wiki/") == 0) { // if markdown link doesn't contain a url use the text as url (wikilink)
      tokens[idx].attrs[hrefIndex][1] = tokens[idx].attrs[hrefIndex][1]+"?mode=edit";
    }
    return self.renderToken(tokens, idx, options, env, self);
  }*/

  exports.init = init;
  exports.loadPlugins = loadPlugins;
  exports.parse = parse;
  try { // Need to "try" since this will only work in browser, not in Node
    nouwiki_global.parser = exports;
  } catch(e) {
    //console.log(e);
  }

})(typeof exports === 'undefined'? this['parser']={}: exports);
