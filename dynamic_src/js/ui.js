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
})
var editor_showing = false;
function edit() {
  if (editor_showing) {
    $("#editor").hide();
    $("#content").show();
  } else {
    $("#editor").show();
    $("#content").hide();
    getMarkupText();
  }
  editor_showing = !editor_showing;
}