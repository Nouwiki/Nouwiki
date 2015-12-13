var origin = require("./origin.js");

var parse = require("../../parse.js");
var $ = require("jquery");
require('codemirror/lib/codemirror.css');
var CodeMirror = require("codemirror");
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');

console.log("NEW");
var config;
var template;
var ready = 2;
$.get( "/config.toml", function( c ) {
  config = c;
  ready -= 1;
  if (ready == 0) {
    $("#controles").removeClass("disabled");
  }
});
$.get( "/template_assets/dynamic/page.dot.jst", function( t ) {
  template = t;
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
      myCodeMirror.setValue(text)
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
  discard();
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
  $.ajax({
      url: '/api/modify',
      type: 'PUT',
      data: markup,
      contentType: "text/plain",
      success: function(result) {
        console.log(result)
      }
  });
  document.write(parse.parse(markup, config, template, wiki));
  document.close();
}
