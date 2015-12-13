var origin = window.location.origin;
var loc = decodeURI(window.location.href);

var page = loc.split("/");
page = page[page.length-1].split("?")[0];
page = page || "index";

var root = loc;
if (loc[loc.length-1] != "/") {
  root = loc.replace("/"+page, "/");
}

var git = root.split("/")
git_user = git[2].split(".")[0];
git_repo = git[3];
git_repo_url = "https://github.com/"+git_user+"/"+git_repo+"/";
git_clone_url = "https://github.com/"+git_user+"/"+git_repo+".git";

//var wiki = loc.split("/");
//wiki = wiki[wiki.length-3];

var markup_page = page
var markup_loc = root + "markup/" + markup_page + ".md";

exports.markup_loc = markup_loc;
exports.page = page;
