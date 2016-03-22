//endsWith Polyfill
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

var origin = window.location.origin;
var loc = decodeURI(window.location.href);

var page = loc.split("/");
page = page[page.length-1].split("?")[0];
page = page || "index";

var root = loc;
if (loc[loc.length-1] != "/") {
  if (loc.endsWith("/wiki/"+page)) {
    root = loc.replace("/wiki/"+page, "/");
  } else {
    root = loc.replace("/"+page, "/");
  }
  root = root.split("?")[0];
}

var git = root.split("/");
git_user = git[2].split(".")[0];
git_repo = git[3];
git_repo_url = "https://github.com/"+git_user+"/"+git_repo+"/";
git_clone_url = "https://github.com/"+git_user+"/"+git_repo+".git";

//var wiki = loc.split("/");
//wiki = wiki[wiki.length-3];

var markup_page = page;
var markup_loc = root+"wiki/markup/" + markup_page + ".md";

window.nouwiki.origin = {
  markup_loc: markup_loc,
  page: page,
  root: root
}
