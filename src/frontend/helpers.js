var QueryString = function () {
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}();

function newRequest(head, file, f, attach) {
  var oReq = new XMLHttpRequest();
  oReq.onload = f;
  if (attach != undefined) {
    oReq.attach = attach;
  }
  console.log(head+file + '?' + new Date().getTime())
  oReq.open('GET', head+file + '?' + new Date().getTime(), true);
  oReq.send();
}

// http://stackoverflow.com/questions/16839698/jquery-getscript-alternative-in-native-javascript
function getScript(source, callback) {
    var script = document.createElement('script');
    var prior = document.getElementsByTagName('script')[0];
    script.async = 1;
    prior.parentNode.insertBefore(script, prior);

    script.onload = script.onreadystatechange = function( _, isAbort ) {
        if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if(!isAbort) { if(callback) callback(); }
        }
    };

    script.src = source;
}

exports.QueryString = QueryString;
exports.newRequest = newRequest;
exports.getScript = getScript;
