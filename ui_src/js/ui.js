var parse = require("../../parse.js");

var editor_showing = false;
$("#edit").click(function() {
  if (editor_showing) {
    $("#editor").hide();
  } else {
    $("#editor").show();
  }
  editor_showing = !editor_showing;
})

// To use the node parser we need to use webpack *on the wiki instance side*
var customMarkdownParser = function(markup) {
  return parse.parse(markup).html;
}
var simplemde = new SimpleMDE({
  previewRender: function(markup) {
      return customMarkdownParser(markup); // Returns HTML from a custom parser
  }
});
