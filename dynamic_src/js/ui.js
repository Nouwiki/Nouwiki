var origin = require("./origin.js");

var parse = require("../../parse.js");
var $ = require("jquery");
require('codemirror/lib/codemirror.css');
var CodeMirror = require("codemirror");
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');

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
  edit();
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
  console.log(parse.parse(myCodeMirror.getValue()).html);
}
