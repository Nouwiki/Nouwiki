var origin = require("./origin.js");
var toml = require('toml');
var parse = require("../../client/parse.js");
var $ = require("jquery");
require('codemirror/lib/codemirror.css');
var CodeMirror = require("codemirror");
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');

var markupText = "";
var confirmOnPageExit = function (e)
{
  if (markupText != myCodeMirror.getValue()) {
    // If we haven't been passed the event get the window.event
    e = e || window.event;

    var message = 'Document has not been saved';

    // For IE6-8 and Firefox prior to version 4
    if (e)
    {
        e.returnValue = message;
    }

    // For Chrome, Safari, IE8+ and Opera 12+
    return message;
  }
};
// Turn it on - assign the function that returns the string
window.onbeforeunload = confirmOnPageExit;
// Turn it off - remove the function entirely
//window.onbeforeunload = null;

var config;
var template_markup;
var ready = 2;
$.get( "config.toml", function( c ) {
  config = toml.parse(c);
  ready -= 1;
  if (ready == 0) {
    $("#controles").removeClass("disabled");
  }
});
$.get( "templates/current/dynamic/page.dot.jst", function( t ) {
  template_markup = t;
  ready -= 1;
  if (ready == 0) {
    $("#controles").removeClass("disabled");
  }
});

// parse.parse(markup).html

var myCodeMirror = CodeMirror.fromTextArea($("#editor textarea")[0], {
  lineWrapping: true,
  theme: 'prose-bright',
  mode: "markdown"
});

function getMarkupText() {
  $.ajax(origin.markup_loc, {
    dataType : 'text',
    type : 'GET',
    cache: false,
    success: function(text) {
      markupText = text;
      myCodeMirror.setValue(text);
      myCodeMirror.clearHistory();
  }});
}
$("#edit").click(function() {
  if (ready == 0) {
    edit();
  }
});
//var editing = false;
function edit() {
  $("#edit").hide();
  $("#discard").show();
  $("#save").show();

  $("#editor").show();
  $("#content").hide();
  getMarkupText();

  //editing = !editor_showing;
}

$("#discard").click(function() {
  var result = true;
  if (markupText != myCodeMirror.getValue()) {
    result = confirm("Are you sure you want to discard?");
  }
  if (result) {
    var empty = "";
    markupText = empty;
    myCodeMirror.setValue(empty)
    myCodeMirror.clearHistory();
    discard();
  }
});
function discard() {
  $("#edit").show();
  $("#discard").hide();
  $("#save").hide();

  $("#editor").hide();
  $("#content").show();
}

$("#save").click(function() {
  save();
});
function save() {
  $("#edit").show();
  $("#discard").hide();
  $("#save").hide();

  $("#editor").hide();
  $("#content").show();
  var markup = myCodeMirror.getValue();
  markupText = markup;
  $.ajax({
      url: '/api/modify',
      type: 'PUT',
      data: markup,
      contentType: "text/plain",
      success: function(result) {
        document.location.reload(true);
      }
  });
  /*document.write(parse.parse(markup, config, template_markup));
  document.close();*/
}

$("#create").click(function() {
  create();
});
function create() {
  $.ajax({
      url: '/api/create',
      type: 'POST',
      data: origin.page,
      contentType: "text/plain",
      success: function(result) {
        document.location.reload(true);
        /*$.ajax({
            url: '/api/get_page',
            type: 'POST',
            data: origin.page,
            contentType: "text/plain",
            success: function(html) {
              document.write(html);
              document.close();
            }
        });*/
      }
  });
}
