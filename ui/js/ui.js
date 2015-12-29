var origin = require("./origin.js");
var toml = require('toml');
var parse = require("../../parse.js");
var $ = require("jquery");
require('codemirror/lib/codemirror.css');
var CodeMirror = require("codemirror");
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');

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
  document.write(parse.parse(markup, config, template_markup));
  document.close();
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
        $.ajax({
            url: '/api/get_page',
            type: 'POST',
            data: origin.page,
            contentType: "text/plain",
            success: function(html) {
              document.write(html);
              document.close();
            }
        });
      }
  });
}