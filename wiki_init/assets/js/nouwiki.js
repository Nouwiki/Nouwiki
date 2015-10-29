//White.init();

var doread = true; // Save must set to read mode before reloading, this makes sure the read mode only shows after the reload
var markup_data;
var last_save;
var last_input;
var line = 0;
var line_ele;
var scroll = 0;

var editor;
function initEditor() {
  editor = ace.edit("editor");
  editor.setTheme("ace/theme/github_light"); // chrome clouds crimson_editor dawn eclipse iplastic katzenmilch xcode
  editor.getSession().setMode("ace/mode/markdown");
  editor.getSession().setUseWrapMode(true);
  editor.resize();
  editor.setFontSize(16);
  editor.$blockScrolling = Infinity;
  editor.on('input', function() {
    checkSave();
    last_input = editor.getValue();
  });
  editor.setOption("showPrintMargin", false)
}
initEditor();
//getMarkupData();

var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
    return query_string;
}();

function checkSave() {
  if (editor.getValue() == last_save) {
    $("#save").prop('disabled', true);
  } else {
    $("#save").prop('disabled', false);
  }
}

function checkState() {
    var State = History.getState(); // Note: We are using History.getState() instead of event.state
    if (State.data.state == undefined) {
      if (QueryString.action == "edit") {
        edit();
      } else if (QueryString.action == "preview") {
        preview();
      } else {
        read();
      }
    } else if (State.data.state == 0) {
      read();
    }  else if (State.data.state == 1) {
      edit();
    } else if (State.data.state == 2) {
      //read();
      //viewAndRelode();
    } else if (State.data.state == 3) {
      discard();
    } else if (State.data.state == 4) {
      preview();
    }
}

History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
  checkState();
});
checkState();

function read() {
  if (doread) {
    $("#root").show();
    $("#home").show();
    $("#edit").show();
    $("#discard").hide();
    $("#view").hide();
    $("#save").hide();

    $("#editor_container").css('visibility', 'hidden');
    editor.setOption("showPrintMargin", false)
    $("#preview").hide();
    $("#content").show();
    $("#categories").show();
    //window.location.href = location.protocol + '//' + location.host + location.pathname;
  }
}

function discard() {
  last_input = undefined;
  last_save = undefined;
  markup_data = undefined;

  editor.setValue("");
  $("#root").show();
  $("#home").show();
  $("#edit").show();
  $("#discard").hide();
  $("#view").hide();
  $("#save").hide();

  $("#editor_container").css('visibility', 'hidden');
  editor.setOption("showPrintMargin", false)
  $("#preview").hide();
  $("#content").show();
  $("#categories").show();

  //var anchor = line_ele || $("body");
  $('html, body').animate({
      scrollTop: scroll
  }, 0);   
}

function preview() {
  if (markup_data == undefined) {
    getMarkupData(preview);
  } else {
    $("#preview").text(markup_data);

    $("#root").show();
    $("#home").show();
    $("#edit").show();
    $("#discard").show();
    $("#view").hide();
    $("#save").show();

    $("#content").hide();
    $("#categories").hide();
    $("#editor_container").css('visibility', 'hidden');
    editor.setOption("showPrintMargin", false)
    $("#preview").show();
  }
}

function edit() {
  if (markup_data == undefined) {
    getMarkupData(edit);
  } else {
    if (editor.getValue() != last_input) {
      editor.setValue(last_input);
      editor.focus();
      checkSave();
    }

    editor.gotoLine(parseInt(line));

    $("#root").show();
    $("#home").show();
    $("#edit").hide();
    $("#discard").show();
    $("#view").show();
    $("#save").show();

    $("#content").hide();
    $("#categories").hide();
    $("#editor_container").css('visibility', 'visible');
    editor.setOption("showPrintMargin", true)
    $("#preview").hide();
  }
}

function save() {
  var text = editor.getValue();
  $.ajax(origin+"/"+wiki+"/api/save", {
    data : JSON.stringify({"text": text}),
    contentType : 'application/json',
    type : 'POST',
    success: function() {
      doread = false;
      if (page == "") {
        History.replaceState({state:0}, null, "../wiki/");
      } else {
        History.replaceState({state:0}, null, origin + "/" + wiki + "/wiki/" + page);
      }
      location.reload();
  }});
}

function getMarkupData(f) {
  $.ajax(markup_loc, {
    dataType : 'text',
    type : 'GET',
    cache: false,
    success: function(data) {
      last_input = data;
      last_save = data;
      markup_data = data;
      editor.setValue(last_input);
      if (f) {
        f();
      }
  }});
}

/*$("#root").click(function() {
  window.location = origin + "/";
})

$("#home").click(function() {
  window.location = origin + "/" + wiki + "/wiki/";
})*/

$("#edit").click(function() {
  History.replaceState({state:1}, null, origin + "/" + wiki + "/wiki/" + page+"?action=edit");
});

$("#discard").click(function() {
  History.replaceState({state:3}, null, origin + "/" + wiki + "/wiki/" + page);
});

$("#view").click(function() {
  History.replaceState({state:4}, null, origin + "/" + wiki + "/wiki/" + page+"?action=preview");
});

$("#save").click(function() {
  save();
});

$("#content .line").dblclick(function() {

})

var haveEvent = [];

function nextEvent(next, i) {
  next.next().each(function() {
    if (!$(this).hasClass("line") && haveEvent.indexOf($(this)[0]) == -1) {
      $(this).dblclick(function() {
        editLine(i)
      })
      haveEvent.push($(this)[0])
      nextEvent($(this), i)
    }
  })
}

$("#content .line").each(function() {
  $(this).dblclick(function() {
      var i = $(this);
      editLine(i)
  })
  haveEvent.push($(this)[0])
  nextEvent($(this), $(this));
});

function editLine(i) {
  line_ele = i;
  line = i.data("line")+3;
  scroll = $(document).scrollTop();
  History.replaceState({state:1}, null, origin + "/" + wiki + "/wiki/" + page+"?action=edit");
}

/*$("#content .line").hover(function() {
  $(this).append("<span class='nouwiki_edit_icon'>🖉</span>")
}, function() {
  $(this).children("span.nouwiki_edit_icon").remove();
})*/

$("ul img").each(function() {
  $(this).css("height", "0px");
  var s = getLineHeight($(this).parent()[0]);
  $(this).css("height", (s-12)+"px");
  $(this).css("width", "auto");
})

function getLineHeight(element) {
   var temp = document.createElement(element.nodeName);
   temp.setAttribute("style","margin:0px;padding:0px;font-family:"+element.style.fontFamily+";font-size:"+element.style.fontSize);
   temp.innerHTML = "test";
   temp = element.parentNode.appendChild(temp);
   var ret = temp.clientHeight;
   temp.parentNode.removeChild(temp);
   return ret;
}