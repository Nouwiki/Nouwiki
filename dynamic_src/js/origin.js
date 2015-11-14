var origin = window.location.origin;
var loc = decodeURI(window.location.href);

var page = loc.split("/");
page = page[page.length-1].split("?")[0];

var wiki = loc.split("/");
wiki = wiki[wiki.length-3];

var markup_page = page || "index";
var markup_loc = origin + "/markup/" + markup_page + ".md";

exports.markup_loc = markup_loc;