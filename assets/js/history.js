function cleanHistory() {
	store.set('traversion', []);
	store.set('traversion_abs', []);
	store.set('travers_current', -1);
}
//cleanHistory();

checkContinue();

/*var isorigin = new RegExp(origin);
var href;
$("div#content.markdown-body a").click(function(e){
	href = $(this).attr('href');
	if (isorigin.test(href)) {
		e.preventDefault();
		updateHistory(href)
		window.location.href = href;
	} else {
		if (href.indexOf('http://') === 0 || href.indexOf('https://') === 0) {
			// Go jim morrison, GO!
		} else {
			e.preventDefault();
			updateHistory(href)
			window.location.href = href;
		}
	}
});*/

function updateHistory(href) {
	var abs = absolutePath(href);
	var next = pageFromHref(href);
	var t = store.get('traversion');
	var a = store.get('traversion_abs');
	var c = store.get('travers_current');
	t = t.slice(0, c+1);
	var n = c+1;
	t[n] = next;
	a = a.slice(0, c+1);
	var n = c+1;
	a[n] = abs;
	store.set('traversion', t)
	store.set('traversion_abs', a)
	store.set('travers_current', a.lastIndexOf(abs))
	console.log(t)
}

function pageFromHref(href) {
	var s = href.split("/")
	s = s[s.length-1]
	if (s == "") {
		s = "Index";
	}
	s = s.split("?")[0];
	return decodeURI(s);
}

function checkContinue() {
	var t = store.get('traversion');
	var a = store.get('traversion_abs');
	var c = store.get('travers_current');
	console.log(t, a, c)
	if (t != undefined) {
		var current = window.location.href;//pageFromHref(loc);
		if (a.indexOf(current) == -1) {
			/*cleanHistory();
			t = [];
			c = -1;*/
			updateHistory(current)
		} else {
			store.set('travers_current', a.lastIndexOf(current))
			c = a.lastIndexOf(current);
		}
	} else {
		cleanHistory();
		t = [];
		c = -1;
		updateHistory(window.location.href)
	}

	var t = store.get('traversion');
	var a = store.get('traversion_abs');
	var c = store.get('travers_current');
	console.log("new", t, c)
	var html = ""
	for (var i = 0; i < t.length; i++) {
		if (i == c) {
			html += "<b>"+t[i]+"</b>";
		} else {
			html += "<a href='"+a[i]+"'>"+t[i]+"</a>";
		}
		if (i != t.length-1) {
			html += " > ";
		}
	}
	document.getElementById("history").innerHTML = html;
	//$("#history").html(html);
}

function absolutePath(href) {
    var link = document.createElement("a");
    link.href = href;
    return (link.protocol+"//"+link.host+link.pathname+link.search+link.hash);
}