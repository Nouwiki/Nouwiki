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

nouwiki_global.nouwiki = nouwiki_global.nouwiki || {};

var origin = window.location.origin;
var loc = decodeURI(window.location.href);

var page = loc.split("/wiki/");
if (page.length == 1) {
  page = "index";
} else {
  page = page[page.length-1];
}

var sub = getSub(loc, page);

var sub_root;
var root = loc;
if (root[root.length-1] != "/") {
  if (root.endsWith("/wiki/"+page)) {
    root = root.replace("/wiki/"+page, "/");
  } else {
    root = root.replace("/"+page, "/");
  }
  root = root.split("?")[0];
}
sub_root = root;
if (sub != false) {
  if (root.indexOf("/"+sub+"/") != -1) {
    root = root.replace("/"+sub+"/", "/");
  } else {
    root = root.replace("/"+sub, "/");
  }
} else {
  sub_root = false;
}
if (root[root.length-1] != "/") {
  root = root+"/";
}
if (sub_root != false && sub_root[sub_root.length-1] != "/") {
  sub_root = sub_root+"/";
}

var git = root.split("/");
git_user = git[2].split(".")[0];
git_repo = git[3];
git_repo_url = "https://github.com/"+git_user+"/"+git_repo+"/";
git_clone_url = "https://github.com/"+git_user+"/"+git_repo+".git";

//var wiki = loc.split("/");
//wiki = wiki[wiki.length-3];

var markup_page = page;
var markup_loc;
if (sub_root == false) {
  markup_loc = root+"markup/" + markup_page + ".md";
} else {
  markup_loc = sub_root+"markup/" + markup_page + ".md";
}

function getSub(p, page) {
	var root = p;
	if (root[root.length-1] != "/") {
		if (root.endsWith("/wiki/"+page)) {
			root = root.replace("/wiki/"+page, "/");
		}
		root = root.split("?")[0];
	}
	if (root[root.length-1] != "/") {
		root = root + "/";
	}
	var split = root.split("/");
	if (split.length == 5) {
		return split[split.length-2];
	} else {
		return false;
	}
}

exports.origin = {
  markup_loc: markup_loc,
  page: page,
  root: root,
  sub_root: sub_root
}
