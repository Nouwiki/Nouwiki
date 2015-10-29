var origin = window.location.origin;
var loc = decodeURI(window.location.href);

var markup_loc;
if (loc.indexOf("/wiki/") > -1) {
  markup_loc = loc.split("#")[0].split("?")[0].replace("/wiki/", "/markup/")
} else if (loc.indexOf("/static/") > -1)
  markup_loc = loc.split("#")[0].split("?")[0].replace("/static/", "/markup/")
if (markup_loc[markup_loc.length-1] == "/") {
  markup_loc += "index.md";
} else {
  markup_loc += ".md";
}

var page = loc.split("/");
page = page[page.length-1].split("?")[0];

var wiki = loc.split("/");
wiki = wiki[wiki.length-3];