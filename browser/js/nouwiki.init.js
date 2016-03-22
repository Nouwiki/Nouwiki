/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var toml = __webpack_require__(2);

	var QueryString = function () {
	  var query_string = {};
	  var query = window.location.search.substring(1);
	  var vars = query.split("&");
	  for (var i = 0; i < vars.length; i++) {
	    var pair = vars[i].split("=");
	    if (typeof query_string[pair[0]] === "undefined") {
	      query_string[pair[0]] = decodeURIComponent(pair[1]);
	    } else if (typeof query_string[pair[0]] === "string") {
	      var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
	      query_string[pair[0]] = arr;
	    } else {
	      query_string[pair[0]].push(decodeURIComponent(pair[1]));
	    }
	  }
	  return query_string;
	}();

	window.nouwiki = {};
	window.nouwiki.config = "";
	window.nouwiki.plugins = [];
	window.nouwiki.ready = function () {
	  window.nouwiki.ready = true;
	};
	window.nouwiki.parse = __webpack_require__(5);
	//var parse = require("../../../parse.js");
	//window.nouwiki.parse = {};
	//window.nouwiki.parse.init = parse.init;
	//window.nouwiki.parse.loadPlugins = parse.loadPlugins;
	//window.nouwiki.parse.parse = parse.parse;
	__webpack_require__(116);

	var root = QueryString.root || window.nouwiki.origin.root;
	var content_root = QueryString.content || root;
	// CORS proxy
	if (QueryString.proxy != undefined) {
	  root = QueryString.proxy + root;
	  content_root = QueryString.proxy + content_root;
	}

	// Get Config & Load markdown-it Plugins
	var oReq = new XMLHttpRequest();
	oReq.onload = function (e) {
	  window.nouwiki.config = toml.parse(e.target.response);
	  if (window.target == "dynamic") {
	    getPageData();
	    getPlugins(false);
	  } else {
	    getPlugins(true);
	  }
	};
	oReq.open('GET', root + "nouwiki.toml" + '?' + new Date().getTime(), true);
	//oReq.responseType = 'json';
	oReq.send();

	var loc = decodeURI(window.location.href);

	var title = loc.split("/");
	title = title[title.length - 1].split("?")[0];
	window.nouwiki.title = title || "index";

	var n = 3;
	function getPageData() {
	  window.nouwiki.title = QueryString.title || "index";
	  var markup = content_root + "wiki/markup/" + window.nouwiki.title + ".md";
	  var template = root + "nouwiki/templates/" + window.nouwiki.config.template + "/template/dynamic/dynamic.dot.jst";

	  var oReq = new XMLHttpRequest();
	  oReq.onload = function (e) {
	    window.nouwiki.markup = e.target.response;
	    n--;
	    if (n == 0) {
	      window.nouwiki.ready();
	    }
	  };
	  oReq.open('GET', markup + '?' + new Date().getTime(), true);
	  oReq.send();

	  var oReq = new XMLHttpRequest();
	  oReq.onload = function (e) {
	    window.nouwiki.template = e.target.response;
	    n--;
	    if (n == 0) {
	      window.nouwiki.ready();
	    }
	  };
	  oReq.open('GET', template + '?' + new Date().getTime(), true);
	  oReq.send();
	}

	function getPlugins(ready) {
	  var plugins = window.nouwiki.config.plugins.parser;
	  //var def = window.nouwiki.config.index_default;
	  var def = window.target;
	  var files = [];
	  for (var plugin in plugins) {
	    files.push(root + "nouwiki/plugins/parser/" + plugins[plugin].name);
	  }
	  requirejs(files, function () {
	    var options;
	    for (var a in arguments) {
	      options = plugins[a].options[def];
	      // This should be a plugin
	      if (def == "dynamic") {
	        for (var s in QueryString) {
	          if (s != "title" && s != "") {
	            options.tail += "&" + s + "=" + QueryString[s];
	          }
	        }
	      }
	      if (window.nouwiki.title == "index" && plugins[a].options[def + "_index"] != undefined) {
	        options = plugins[a].options[def + "_index"];
	      }
	      window.nouwiki.plugins.push([arguments[a], options]);
	    }
	    window.nouwiki.parse.init(window.nouwiki.config.parser_options);
	    window.nouwiki.parse.loadPlugins(window.nouwiki.plugins);
	    if (ready) {
	      window.nouwiki.ready();
	    } else {
	      n--;
	      if (n == 0) {
	        window.nouwiki.ready();
	      }
	    }
	  });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var parser = __webpack_require__(3);
	var compiler = __webpack_require__(4);

	module.exports = {
	  parse: function (input) {
	    var nodes = parser.parse(input.toString());
	    return compiler.compile(nodes);
	  }
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports=function(){ /*
	   * Generated by PEG.js 0.8.0.
	   *
	   * http://pegjs.majda.cz/
	   */function peg$subclass(child,parent){function ctor(){this.constructor=child;}ctor.prototype=parent.prototype;child.prototype=new ctor();}function SyntaxError(message,expected,found,offset,line,column){this.message=message;this.expected=expected;this.found=found;this.offset=offset;this.line=line;this.column=column;this.name="SyntaxError";}peg$subclass(SyntaxError,Error);function parse(input){var options=arguments.length>1?arguments[1]:{},peg$FAILED={},peg$startRuleFunctions={start:peg$parsestart},peg$startRuleFunction=peg$parsestart,peg$c0=[],peg$c1=function(){return nodes;},peg$c2=peg$FAILED,peg$c3="#",peg$c4={type:"literal",value:"#",description:"\"#\""},peg$c5=void 0,peg$c6={type:"any",description:"any character"},peg$c7="[",peg$c8={type:"literal",value:"[",description:"\"[\""},peg$c9="]",peg$c10={type:"literal",value:"]",description:"\"]\""},peg$c11=function(name){addNode(node('ObjectPath',name,line,column));},peg$c12=function(name){addNode(node('ArrayPath',name,line,column));},peg$c13=function(parts,name){return parts.concat(name);},peg$c14=function(name){return [name];},peg$c15=function(name){return name;},peg$c16=".",peg$c17={type:"literal",value:".",description:"\".\""},peg$c18="=",peg$c19={type:"literal",value:"=",description:"\"=\""},peg$c20=function(key,value){addNode(node('Assign',value,line,column,key));},peg$c21=function(chars){return chars.join('');},peg$c22="\"",peg$c23={type:"literal",value:"\"",description:"\"\\\"\""},peg$c24=function(char){return char;},peg$c25="\"\"\"",peg$c26={type:"literal",value:"\"\"\"",description:"\"\\\"\\\"\\\"\""},peg$c27=null,peg$c28=function(chars){return node('String',chars.join(''),line,column);},peg$c29="'''",peg$c30={type:"literal",value:"'''",description:"\"'''\""},peg$c31="'",peg$c32={type:"literal",value:"'",description:"\"'\""},peg$c33="\\",peg$c34={type:"literal",value:"\\",description:"\"\\\\\""},peg$c35=function(char){return char;},peg$c36=function(){return '';},peg$c37="e",peg$c38={type:"literal",value:"e",description:"\"e\""},peg$c39="E",peg$c40={type:"literal",value:"E",description:"\"E\""},peg$c41=function(left,right){return node('Float',parseFloat(left+'e'+right),line,column);},peg$c42=function(text){return node('Float',parseFloat(text),line,column);},peg$c43="+",peg$c44={type:"literal",value:"+",description:"\"+\""},peg$c45=function(digits){return digits.join('');},peg$c46="-",peg$c47={type:"literal",value:"-",description:"\"-\""},peg$c48=function(digits){return '-'+digits.join('');},peg$c49=function(text){return node('Integer',parseInt(text,10),line,column);},peg$c50="true",peg$c51={type:"literal",value:"true",description:"\"true\""},peg$c52=function(){return node('Boolean',true,line,column);},peg$c53="false",peg$c54={type:"literal",value:"false",description:"\"false\""},peg$c55=function(){return node('Boolean',false,line,column);},peg$c56=function(){return node('Array',[],line,column);},peg$c57=function(value){return node('Array',value?[value]:[],line,column);},peg$c58=function(values){return node('Array',values,line,column);},peg$c59=function(values,value){return node('Array',values.concat(value),line,column);},peg$c60=function(value){return value;},peg$c61=",",peg$c62={type:"literal",value:",",description:"\",\""},peg$c63="{",peg$c64={type:"literal",value:"{",description:"\"{\""},peg$c65="}",peg$c66={type:"literal",value:"}",description:"\"}\""},peg$c67=function(values){return node('InlineTable',values,line,column);},peg$c68=function(key,value){return node('InlineTableValue',value,line,column,key);},peg$c69=function(digits){return "."+digits;},peg$c70=function(date){return date.join('');},peg$c71=":",peg$c72={type:"literal",value:":",description:"\":\""},peg$c73=function(time){return time.join('');},peg$c74="T",peg$c75={type:"literal",value:"T",description:"\"T\""},peg$c76="Z",peg$c77={type:"literal",value:"Z",description:"\"Z\""},peg$c78=function(date,time){return node('Date',new Date(date+"T"+time+"Z"),line,column);},peg$c79=function(date,time){return node('Date',new Date(date+"T"+time),line,column);},peg$c80=/^[ \t]/,peg$c81={type:"class",value:"[ \\t]",description:"[ \\t]"},peg$c82="\n",peg$c83={type:"literal",value:"\n",description:"\"\\n\""},peg$c84="\r",peg$c85={type:"literal",value:"\r",description:"\"\\r\""},peg$c86=/^[0-9a-f]/i,peg$c87={type:"class",value:"[0-9a-f]i",description:"[0-9a-f]i"},peg$c88=/^[0-9]/,peg$c89={type:"class",value:"[0-9]",description:"[0-9]"},peg$c90="_",peg$c91={type:"literal",value:"_",description:"\"_\""},peg$c92=function(){return "";},peg$c93=/^[A-Za-z0-9_\-]/,peg$c94={type:"class",value:"[A-Za-z0-9_\\-]",description:"[A-Za-z0-9_\\-]"},peg$c95=function(d){return d.join('');},peg$c96="\\\"",peg$c97={type:"literal",value:"\\\"",description:"\"\\\\\\\"\""},peg$c98=function(){return '"';},peg$c99="\\\\",peg$c100={type:"literal",value:"\\\\",description:"\"\\\\\\\\\""},peg$c101=function(){return '\\';},peg$c102="\\b",peg$c103={type:"literal",value:"\\b",description:"\"\\\\b\""},peg$c104=function(){return '\b';},peg$c105="\\t",peg$c106={type:"literal",value:"\\t",description:"\"\\\\t\""},peg$c107=function(){return '\t';},peg$c108="\\n",peg$c109={type:"literal",value:"\\n",description:"\"\\\\n\""},peg$c110=function(){return '\n';},peg$c111="\\f",peg$c112={type:"literal",value:"\\f",description:"\"\\\\f\""},peg$c113=function(){return '\f';},peg$c114="\\r",peg$c115={type:"literal",value:"\\r",description:"\"\\\\r\""},peg$c116=function(){return '\r';},peg$c117="\\U",peg$c118={type:"literal",value:"\\U",description:"\"\\\\U\""},peg$c119=function(digits){return convertCodePoint(digits.join(''));},peg$c120="\\u",peg$c121={type:"literal",value:"\\u",description:"\"\\\\u\""},peg$currPos=0,peg$reportedPos=0,peg$cachedPos=0,peg$cachedPosDetails={line:1,column:1,seenCR:false},peg$maxFailPos=0,peg$maxFailExpected=[],peg$silentFails=0,peg$cache={},peg$result;if("startRule" in options){if(!(options.startRule in peg$startRuleFunctions)){throw new Error("Can't start parsing from rule \""+options.startRule+"\".");}peg$startRuleFunction=peg$startRuleFunctions[options.startRule];}function text(){return input.substring(peg$reportedPos,peg$currPos);}function offset(){return peg$reportedPos;}function line(){return peg$computePosDetails(peg$reportedPos).line;}function column(){return peg$computePosDetails(peg$reportedPos).column;}function expected(description){throw peg$buildException(null,[{type:"other",description:description}],peg$reportedPos);}function error(message){throw peg$buildException(message,null,peg$reportedPos);}function peg$computePosDetails(pos){function advance(details,startPos,endPos){var p,ch;for(p=startPos;p<endPos;p++){ch=input.charAt(p);if(ch==="\n"){if(!details.seenCR){details.line++;}details.column=1;details.seenCR=false;}else if(ch==="\r"||ch==="\u2028"||ch==="\u2029"){details.line++;details.column=1;details.seenCR=true;}else {details.column++;details.seenCR=false;}}}if(peg$cachedPos!==pos){if(peg$cachedPos>pos){peg$cachedPos=0;peg$cachedPosDetails={line:1,column:1,seenCR:false};}advance(peg$cachedPosDetails,peg$cachedPos,pos);peg$cachedPos=pos;}return peg$cachedPosDetails;}function peg$fail(expected){if(peg$currPos<peg$maxFailPos){return;}if(peg$currPos>peg$maxFailPos){peg$maxFailPos=peg$currPos;peg$maxFailExpected=[];}peg$maxFailExpected.push(expected);}function peg$buildException(message,expected,pos){function cleanupExpected(expected){var i=1;expected.sort(function(a,b){if(a.description<b.description){return -1;}else if(a.description>b.description){return 1;}else {return 0;}});while(i<expected.length){if(expected[i-1]===expected[i]){expected.splice(i,1);}else {i++;}}}function buildMessage(expected,found){function stringEscape(s){function hex(ch){return ch.charCodeAt(0).toString(16).toUpperCase();}return s.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\x08/g,'\\b').replace(/\t/g,'\\t').replace(/\n/g,'\\n').replace(/\f/g,'\\f').replace(/\r/g,'\\r').replace(/[\x00-\x07\x0B\x0E\x0F]/g,function(ch){return '\\x0'+hex(ch);}).replace(/[\x10-\x1F\x80-\xFF]/g,function(ch){return '\\x'+hex(ch);}).replace(/[\u0180-\u0FFF]/g,function(ch){return '\\u0'+hex(ch);}).replace(/[\u1080-\uFFFF]/g,function(ch){return '\\u'+hex(ch);});}var expectedDescs=new Array(expected.length),expectedDesc,foundDesc,i;for(i=0;i<expected.length;i++){expectedDescs[i]=expected[i].description;}expectedDesc=expected.length>1?expectedDescs.slice(0,-1).join(", ")+" or "+expectedDescs[expected.length-1]:expectedDescs[0];foundDesc=found?"\""+stringEscape(found)+"\"":"end of input";return "Expected "+expectedDesc+" but "+foundDesc+" found.";}var posDetails=peg$computePosDetails(pos),found=pos<input.length?input.charAt(pos):null;if(expected!==null){cleanupExpected(expected);}return new SyntaxError(message!==null?message:buildMessage(expected,found),expected,found,pos,posDetails.line,posDetails.column);}function peg$parsestart(){var s0,s1,s2;var key=peg$currPos*45+0,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=[];s2=peg$parseline();while(s2!==peg$FAILED){s1.push(s2);s2=peg$parseline();}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c1();}s0=s1;peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseline(){var s0,s1,s2,s3,s4,s5,s6;var key=peg$currPos*45+1,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=[];s2=peg$parseS();while(s2!==peg$FAILED){s1.push(s2);s2=peg$parseS();}if(s1!==peg$FAILED){s2=peg$parseexpression();if(s2!==peg$FAILED){s3=[];s4=peg$parseS();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parseS();}if(s3!==peg$FAILED){s4=[];s5=peg$parsecomment();while(s5!==peg$FAILED){s4.push(s5);s5=peg$parsecomment();}if(s4!==peg$FAILED){s5=[];s6=peg$parseNL();if(s6!==peg$FAILED){while(s6!==peg$FAILED){s5.push(s6);s6=peg$parseNL();}}else {s5=peg$c2;}if(s5===peg$FAILED){s5=peg$parseEOF();}if(s5!==peg$FAILED){s1=[s1,s2,s3,s4,s5];s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;s1=[];s2=peg$parseS();if(s2!==peg$FAILED){while(s2!==peg$FAILED){s1.push(s2);s2=peg$parseS();}}else {s1=peg$c2;}if(s1!==peg$FAILED){s2=[];s3=peg$parseNL();if(s3!==peg$FAILED){while(s3!==peg$FAILED){s2.push(s3);s3=peg$parseNL();}}else {s2=peg$c2;}if(s2===peg$FAILED){s2=peg$parseEOF();}if(s2!==peg$FAILED){s1=[s1,s2];s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$parseNL();}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseexpression(){var s0;var key=peg$currPos*45+2,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$parsecomment();if(s0===peg$FAILED){s0=peg$parsepath();if(s0===peg$FAILED){s0=peg$parsetablearray();if(s0===peg$FAILED){s0=peg$parseassignment();}}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsecomment(){var s0,s1,s2,s3,s4,s5;var key=peg$currPos*45+3,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.charCodeAt(peg$currPos)===35){s1=peg$c3;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c4);}}if(s1!==peg$FAILED){s2=[];s3=peg$currPos;s4=peg$currPos;peg$silentFails++;s5=peg$parseNL();if(s5===peg$FAILED){s5=peg$parseEOF();}peg$silentFails--;if(s5===peg$FAILED){s4=peg$c5;}else {peg$currPos=s4;s4=peg$c2;}if(s4!==peg$FAILED){if(input.length>peg$currPos){s5=input.charAt(peg$currPos);peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c6);}}if(s5!==peg$FAILED){s4=[s4,s5];s3=s4;}else {peg$currPos=s3;s3=peg$c2;}}else {peg$currPos=s3;s3=peg$c2;}while(s3!==peg$FAILED){s2.push(s3);s3=peg$currPos;s4=peg$currPos;peg$silentFails++;s5=peg$parseNL();if(s5===peg$FAILED){s5=peg$parseEOF();}peg$silentFails--;if(s5===peg$FAILED){s4=peg$c5;}else {peg$currPos=s4;s4=peg$c2;}if(s4!==peg$FAILED){if(input.length>peg$currPos){s5=input.charAt(peg$currPos);peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c6);}}if(s5!==peg$FAILED){s4=[s4,s5];s3=s4;}else {peg$currPos=s3;s3=peg$c2;}}else {peg$currPos=s3;s3=peg$c2;}}if(s2!==peg$FAILED){s1=[s1,s2];s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsepath(){var s0,s1,s2,s3,s4,s5;var key=peg$currPos*45+4,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.charCodeAt(peg$currPos)===91){s1=peg$c7;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c8);}}if(s1!==peg$FAILED){s2=[];s3=peg$parseS();while(s3!==peg$FAILED){s2.push(s3);s3=peg$parseS();}if(s2!==peg$FAILED){s3=peg$parsetable_key();if(s3!==peg$FAILED){s4=[];s5=peg$parseS();while(s5!==peg$FAILED){s4.push(s5);s5=peg$parseS();}if(s4!==peg$FAILED){if(input.charCodeAt(peg$currPos)===93){s5=peg$c9;peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c10);}}if(s5!==peg$FAILED){peg$reportedPos=s0;s1=peg$c11(s3);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsetablearray(){var s0,s1,s2,s3,s4,s5,s6,s7;var key=peg$currPos*45+5,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.charCodeAt(peg$currPos)===91){s1=peg$c7;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c8);}}if(s1!==peg$FAILED){if(input.charCodeAt(peg$currPos)===91){s2=peg$c7;peg$currPos++;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c8);}}if(s2!==peg$FAILED){s3=[];s4=peg$parseS();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parseS();}if(s3!==peg$FAILED){s4=peg$parsetable_key();if(s4!==peg$FAILED){s5=[];s6=peg$parseS();while(s6!==peg$FAILED){s5.push(s6);s6=peg$parseS();}if(s5!==peg$FAILED){if(input.charCodeAt(peg$currPos)===93){s6=peg$c9;peg$currPos++;}else {s6=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c10);}}if(s6!==peg$FAILED){if(input.charCodeAt(peg$currPos)===93){s7=peg$c9;peg$currPos++;}else {s7=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c10);}}if(s7!==peg$FAILED){peg$reportedPos=s0;s1=peg$c12(s4);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsetable_key(){var s0,s1,s2;var key=peg$currPos*45+6,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=[];s2=peg$parsedot_ended_table_key_part();if(s2!==peg$FAILED){while(s2!==peg$FAILED){s1.push(s2);s2=peg$parsedot_ended_table_key_part();}}else {s1=peg$c2;}if(s1!==peg$FAILED){s2=peg$parsetable_key_part();if(s2!==peg$FAILED){peg$reportedPos=s0;s1=peg$c13(s1,s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;s1=peg$parsetable_key_part();if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c14(s1);}s0=s1;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsetable_key_part(){var s0,s1,s2,s3,s4;var key=peg$currPos*45+7,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=[];s2=peg$parseS();while(s2!==peg$FAILED){s1.push(s2);s2=peg$parseS();}if(s1!==peg$FAILED){s2=peg$parsekey();if(s2!==peg$FAILED){s3=[];s4=peg$parseS();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parseS();}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c15(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;s1=[];s2=peg$parseS();while(s2!==peg$FAILED){s1.push(s2);s2=peg$parseS();}if(s1!==peg$FAILED){s2=peg$parsequoted_key();if(s2!==peg$FAILED){s3=[];s4=peg$parseS();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parseS();}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c15(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsedot_ended_table_key_part(){var s0,s1,s2,s3,s4,s5,s6;var key=peg$currPos*45+8,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=[];s2=peg$parseS();while(s2!==peg$FAILED){s1.push(s2);s2=peg$parseS();}if(s1!==peg$FAILED){s2=peg$parsekey();if(s2!==peg$FAILED){s3=[];s4=peg$parseS();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parseS();}if(s3!==peg$FAILED){if(input.charCodeAt(peg$currPos)===46){s4=peg$c16;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c17);}}if(s4!==peg$FAILED){s5=[];s6=peg$parseS();while(s6!==peg$FAILED){s5.push(s6);s6=peg$parseS();}if(s5!==peg$FAILED){peg$reportedPos=s0;s1=peg$c15(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;s1=[];s2=peg$parseS();while(s2!==peg$FAILED){s1.push(s2);s2=peg$parseS();}if(s1!==peg$FAILED){s2=peg$parsequoted_key();if(s2!==peg$FAILED){s3=[];s4=peg$parseS();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parseS();}if(s3!==peg$FAILED){if(input.charCodeAt(peg$currPos)===46){s4=peg$c16;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c17);}}if(s4!==peg$FAILED){s5=[];s6=peg$parseS();while(s6!==peg$FAILED){s5.push(s6);s6=peg$parseS();}if(s5!==peg$FAILED){peg$reportedPos=s0;s1=peg$c15(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseassignment(){var s0,s1,s2,s3,s4,s5;var key=peg$currPos*45+9,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=peg$parsekey();if(s1!==peg$FAILED){s2=[];s3=peg$parseS();while(s3!==peg$FAILED){s2.push(s3);s3=peg$parseS();}if(s2!==peg$FAILED){if(input.charCodeAt(peg$currPos)===61){s3=peg$c18;peg$currPos++;}else {s3=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c19);}}if(s3!==peg$FAILED){s4=[];s5=peg$parseS();while(s5!==peg$FAILED){s4.push(s5);s5=peg$parseS();}if(s4!==peg$FAILED){s5=peg$parsevalue();if(s5!==peg$FAILED){peg$reportedPos=s0;s1=peg$c20(s1,s5);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;s1=peg$parsequoted_key();if(s1!==peg$FAILED){s2=[];s3=peg$parseS();while(s3!==peg$FAILED){s2.push(s3);s3=peg$parseS();}if(s2!==peg$FAILED){if(input.charCodeAt(peg$currPos)===61){s3=peg$c18;peg$currPos++;}else {s3=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c19);}}if(s3!==peg$FAILED){s4=[];s5=peg$parseS();while(s5!==peg$FAILED){s4.push(s5);s5=peg$parseS();}if(s4!==peg$FAILED){s5=peg$parsevalue();if(s5!==peg$FAILED){peg$reportedPos=s0;s1=peg$c20(s1,s5);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsekey(){var s0,s1,s2;var key=peg$currPos*45+10,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=[];s2=peg$parseASCII_BASIC();if(s2!==peg$FAILED){while(s2!==peg$FAILED){s1.push(s2);s2=peg$parseASCII_BASIC();}}else {s1=peg$c2;}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c21(s1);}s0=s1;peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsequoted_key(){var s0,s1,s2,s3,s4,s5;var key=peg$currPos*45+11,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.charCodeAt(peg$currPos)===34){s1=peg$c22;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c23);}}if(s1!==peg$FAILED){s2=[];s3=peg$currPos;s4=peg$currPos;peg$silentFails++;s5=peg$parseNL();if(s5===peg$FAILED){if(input.charCodeAt(peg$currPos)===91){s5=peg$c7;peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c8);}}if(s5===peg$FAILED){if(input.charCodeAt(peg$currPos)===93){s5=peg$c9;peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c10);}}if(s5===peg$FAILED){if(input.charCodeAt(peg$currPos)===61){s5=peg$c18;peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c19);}}if(s5===peg$FAILED){if(input.charCodeAt(peg$currPos)===34){s5=peg$c22;peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c23);}}}}}}peg$silentFails--;if(s5===peg$FAILED){s4=peg$c5;}else {peg$currPos=s4;s4=peg$c2;}if(s4!==peg$FAILED){s5=peg$parseESCAPED();if(s5===peg$FAILED){if(input.length>peg$currPos){s5=input.charAt(peg$currPos);peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c6);}}}if(s5!==peg$FAILED){peg$reportedPos=s3;s4=peg$c24(s5);s3=s4;}else {peg$currPos=s3;s3=peg$c2;}}else {peg$currPos=s3;s3=peg$c2;}if(s3!==peg$FAILED){while(s3!==peg$FAILED){s2.push(s3);s3=peg$currPos;s4=peg$currPos;peg$silentFails++;s5=peg$parseNL();if(s5===peg$FAILED){if(input.charCodeAt(peg$currPos)===91){s5=peg$c7;peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c8);}}if(s5===peg$FAILED){if(input.charCodeAt(peg$currPos)===93){s5=peg$c9;peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c10);}}if(s5===peg$FAILED){if(input.charCodeAt(peg$currPos)===61){s5=peg$c18;peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c19);}}if(s5===peg$FAILED){if(input.charCodeAt(peg$currPos)===34){s5=peg$c22;peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c23);}}}}}}peg$silentFails--;if(s5===peg$FAILED){s4=peg$c5;}else {peg$currPos=s4;s4=peg$c2;}if(s4!==peg$FAILED){s5=peg$parseESCAPED();if(s5===peg$FAILED){if(input.length>peg$currPos){s5=input.charAt(peg$currPos);peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c6);}}}if(s5!==peg$FAILED){peg$reportedPos=s3;s4=peg$c24(s5);s3=s4;}else {peg$currPos=s3;s3=peg$c2;}}else {peg$currPos=s3;s3=peg$c2;}}}else {s2=peg$c2;}if(s2!==peg$FAILED){if(input.charCodeAt(peg$currPos)===34){s3=peg$c22;peg$currPos++;}else {s3=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c23);}}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c21(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsevalue(){var s0;var key=peg$currPos*45+12,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$parsestring();if(s0===peg$FAILED){s0=peg$parsedatetime();if(s0===peg$FAILED){s0=peg$parsefloat();if(s0===peg$FAILED){s0=peg$parseinteger();if(s0===peg$FAILED){s0=peg$parseboolean();if(s0===peg$FAILED){s0=peg$parsearray();if(s0===peg$FAILED){s0=peg$parseinline_table();}}}}}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsestring(){var s0,s1,s2,s3,s4;var key=peg$currPos*45+13,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.substr(peg$currPos,3)===peg$c25){s1=peg$c25;peg$currPos+=3;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c26);}}if(s1!==peg$FAILED){s2=peg$parseNL();if(s2===peg$FAILED){s2=peg$c27;}if(s2!==peg$FAILED){s3=[];s4=peg$parsemultiline_string_char();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parsemultiline_string_char();}if(s3!==peg$FAILED){if(input.substr(peg$currPos,3)===peg$c25){s4=peg$c25;peg$currPos+=3;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c26);}}if(s4!==peg$FAILED){peg$reportedPos=s0;s1=peg$c28(s3);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;if(input.charCodeAt(peg$currPos)===34){s1=peg$c22;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c23);}}if(s1!==peg$FAILED){s2=[];s3=peg$parsestring_char();while(s3!==peg$FAILED){s2.push(s3);s3=peg$parsestring_char();}if(s2!==peg$FAILED){if(input.charCodeAt(peg$currPos)===34){s3=peg$c22;peg$currPos++;}else {s3=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c23);}}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c28(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;if(input.substr(peg$currPos,3)===peg$c29){s1=peg$c29;peg$currPos+=3;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c30);}}if(s1!==peg$FAILED){s2=peg$parseNL();if(s2===peg$FAILED){s2=peg$c27;}if(s2!==peg$FAILED){s3=[];s4=peg$parsemultiline_literal_char();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parsemultiline_literal_char();}if(s3!==peg$FAILED){if(input.substr(peg$currPos,3)===peg$c29){s4=peg$c29;peg$currPos+=3;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c30);}}if(s4!==peg$FAILED){peg$reportedPos=s0;s1=peg$c28(s3);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;if(input.charCodeAt(peg$currPos)===39){s1=peg$c31;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c32);}}if(s1!==peg$FAILED){s2=[];s3=peg$parseliteral_char();while(s3!==peg$FAILED){s2.push(s3);s3=peg$parseliteral_char();}if(s2!==peg$FAILED){if(input.charCodeAt(peg$currPos)===39){s3=peg$c31;peg$currPos++;}else {s3=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c32);}}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c28(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsestring_char(){var s0,s1,s2,s3;var key=peg$currPos*45+14,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$parseESCAPED();if(s0===peg$FAILED){s0=peg$currPos;s1=peg$currPos;peg$silentFails++;if(input.charCodeAt(peg$currPos)===34){s2=peg$c22;peg$currPos++;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c23);}}peg$silentFails--;if(s2===peg$FAILED){s1=peg$c5;}else {peg$currPos=s1;s1=peg$c2;}if(s1!==peg$FAILED){s2=peg$currPos;peg$silentFails++;if(input.charCodeAt(peg$currPos)===92){s3=peg$c33;peg$currPos++;}else {s3=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c34);}}peg$silentFails--;if(s3===peg$FAILED){s2=peg$c5;}else {peg$currPos=s2;s2=peg$c2;}if(s2!==peg$FAILED){if(input.length>peg$currPos){s3=input.charAt(peg$currPos);peg$currPos++;}else {s3=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c6);}}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c24(s3);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseliteral_char(){var s0,s1,s2;var key=peg$currPos*45+15,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=peg$currPos;peg$silentFails++;if(input.charCodeAt(peg$currPos)===39){s2=peg$c31;peg$currPos++;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c32);}}peg$silentFails--;if(s2===peg$FAILED){s1=peg$c5;}else {peg$currPos=s1;s1=peg$c2;}if(s1!==peg$FAILED){if(input.length>peg$currPos){s2=input.charAt(peg$currPos);peg$currPos++;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c6);}}if(s2!==peg$FAILED){peg$reportedPos=s0;s1=peg$c24(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsemultiline_string_char(){var s0,s1,s2;var key=peg$currPos*45+16,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$parseESCAPED();if(s0===peg$FAILED){s0=peg$parsemultiline_string_delim();if(s0===peg$FAILED){s0=peg$currPos;s1=peg$currPos;peg$silentFails++;if(input.substr(peg$currPos,3)===peg$c25){s2=peg$c25;peg$currPos+=3;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c26);}}peg$silentFails--;if(s2===peg$FAILED){s1=peg$c5;}else {peg$currPos=s1;s1=peg$c2;}if(s1!==peg$FAILED){if(input.length>peg$currPos){s2=input.charAt(peg$currPos);peg$currPos++;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c6);}}if(s2!==peg$FAILED){peg$reportedPos=s0;s1=peg$c35(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsemultiline_string_delim(){var s0,s1,s2,s3,s4;var key=peg$currPos*45+17,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.charCodeAt(peg$currPos)===92){s1=peg$c33;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c34);}}if(s1!==peg$FAILED){s2=peg$parseNL();if(s2!==peg$FAILED){s3=[];s4=peg$parseNLS();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parseNLS();}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c36();s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsemultiline_literal_char(){var s0,s1,s2;var key=peg$currPos*45+18,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=peg$currPos;peg$silentFails++;if(input.substr(peg$currPos,3)===peg$c29){s2=peg$c29;peg$currPos+=3;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c30);}}peg$silentFails--;if(s2===peg$FAILED){s1=peg$c5;}else {peg$currPos=s1;s1=peg$c2;}if(s1!==peg$FAILED){if(input.length>peg$currPos){s2=input.charAt(peg$currPos);peg$currPos++;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c6);}}if(s2!==peg$FAILED){peg$reportedPos=s0;s1=peg$c24(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsefloat(){var s0,s1,s2,s3;var key=peg$currPos*45+19,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=peg$parsefloat_text();if(s1===peg$FAILED){s1=peg$parseinteger_text();}if(s1!==peg$FAILED){if(input.charCodeAt(peg$currPos)===101){s2=peg$c37;peg$currPos++;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c38);}}if(s2===peg$FAILED){if(input.charCodeAt(peg$currPos)===69){s2=peg$c39;peg$currPos++;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c40);}}}if(s2!==peg$FAILED){s3=peg$parseinteger_text();if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c41(s1,s3);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;s1=peg$parsefloat_text();if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c42(s1);}s0=s1;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsefloat_text(){var s0,s1,s2,s3,s4,s5;var key=peg$currPos*45+20,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.charCodeAt(peg$currPos)===43){s1=peg$c43;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c44);}}if(s1===peg$FAILED){s1=peg$c27;}if(s1!==peg$FAILED){s2=peg$currPos;s3=peg$parseDIGITS();if(s3!==peg$FAILED){if(input.charCodeAt(peg$currPos)===46){s4=peg$c16;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c17);}}if(s4!==peg$FAILED){s5=peg$parseDIGITS();if(s5!==peg$FAILED){s3=[s3,s4,s5];s2=s3;}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}if(s2!==peg$FAILED){peg$reportedPos=s0;s1=peg$c45(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;if(input.charCodeAt(peg$currPos)===45){s1=peg$c46;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c47);}}if(s1!==peg$FAILED){s2=peg$currPos;s3=peg$parseDIGITS();if(s3!==peg$FAILED){if(input.charCodeAt(peg$currPos)===46){s4=peg$c16;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c17);}}if(s4!==peg$FAILED){s5=peg$parseDIGITS();if(s5!==peg$FAILED){s3=[s3,s4,s5];s2=s3;}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}if(s2!==peg$FAILED){peg$reportedPos=s0;s1=peg$c48(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseinteger(){var s0,s1;var key=peg$currPos*45+21,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=peg$parseinteger_text();if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c49(s1);}s0=s1;peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseinteger_text(){var s0,s1,s2,s3,s4;var key=peg$currPos*45+22,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.charCodeAt(peg$currPos)===43){s1=peg$c43;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c44);}}if(s1===peg$FAILED){s1=peg$c27;}if(s1!==peg$FAILED){s2=[];s3=peg$parseDIGIT_OR_UNDER();if(s3!==peg$FAILED){while(s3!==peg$FAILED){s2.push(s3);s3=peg$parseDIGIT_OR_UNDER();}}else {s2=peg$c2;}if(s2!==peg$FAILED){s3=peg$currPos;peg$silentFails++;if(input.charCodeAt(peg$currPos)===46){s4=peg$c16;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c17);}}peg$silentFails--;if(s4===peg$FAILED){s3=peg$c5;}else {peg$currPos=s3;s3=peg$c2;}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c45(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;if(input.charCodeAt(peg$currPos)===45){s1=peg$c46;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c47);}}if(s1!==peg$FAILED){s2=[];s3=peg$parseDIGIT_OR_UNDER();if(s3!==peg$FAILED){while(s3!==peg$FAILED){s2.push(s3);s3=peg$parseDIGIT_OR_UNDER();}}else {s2=peg$c2;}if(s2!==peg$FAILED){s3=peg$currPos;peg$silentFails++;if(input.charCodeAt(peg$currPos)===46){s4=peg$c16;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c17);}}peg$silentFails--;if(s4===peg$FAILED){s3=peg$c5;}else {peg$currPos=s3;s3=peg$c2;}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c48(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseboolean(){var s0,s1;var key=peg$currPos*45+23,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.substr(peg$currPos,4)===peg$c50){s1=peg$c50;peg$currPos+=4;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c51);}}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c52();}s0=s1;if(s0===peg$FAILED){s0=peg$currPos;if(input.substr(peg$currPos,5)===peg$c53){s1=peg$c53;peg$currPos+=5;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c54);}}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c55();}s0=s1;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsearray(){var s0,s1,s2,s3,s4;var key=peg$currPos*45+24,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.charCodeAt(peg$currPos)===91){s1=peg$c7;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c8);}}if(s1!==peg$FAILED){s2=[];s3=peg$parsearray_sep();while(s3!==peg$FAILED){s2.push(s3);s3=peg$parsearray_sep();}if(s2!==peg$FAILED){if(input.charCodeAt(peg$currPos)===93){s3=peg$c9;peg$currPos++;}else {s3=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c10);}}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c56();s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;if(input.charCodeAt(peg$currPos)===91){s1=peg$c7;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c8);}}if(s1!==peg$FAILED){s2=peg$parsearray_value();if(s2===peg$FAILED){s2=peg$c27;}if(s2!==peg$FAILED){if(input.charCodeAt(peg$currPos)===93){s3=peg$c9;peg$currPos++;}else {s3=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c10);}}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c57(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;if(input.charCodeAt(peg$currPos)===91){s1=peg$c7;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c8);}}if(s1!==peg$FAILED){s2=[];s3=peg$parsearray_value_list();if(s3!==peg$FAILED){while(s3!==peg$FAILED){s2.push(s3);s3=peg$parsearray_value_list();}}else {s2=peg$c2;}if(s2!==peg$FAILED){if(input.charCodeAt(peg$currPos)===93){s3=peg$c9;peg$currPos++;}else {s3=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c10);}}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c58(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;if(input.charCodeAt(peg$currPos)===91){s1=peg$c7;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c8);}}if(s1!==peg$FAILED){s2=[];s3=peg$parsearray_value_list();if(s3!==peg$FAILED){while(s3!==peg$FAILED){s2.push(s3);s3=peg$parsearray_value_list();}}else {s2=peg$c2;}if(s2!==peg$FAILED){s3=peg$parsearray_value();if(s3!==peg$FAILED){if(input.charCodeAt(peg$currPos)===93){s4=peg$c9;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c10);}}if(s4!==peg$FAILED){peg$reportedPos=s0;s1=peg$c59(s2,s3);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsearray_value(){var s0,s1,s2,s3,s4;var key=peg$currPos*45+25,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=[];s2=peg$parsearray_sep();while(s2!==peg$FAILED){s1.push(s2);s2=peg$parsearray_sep();}if(s1!==peg$FAILED){s2=peg$parsevalue();if(s2!==peg$FAILED){s3=[];s4=peg$parsearray_sep();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parsearray_sep();}if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c60(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsearray_value_list(){var s0,s1,s2,s3,s4,s5,s6;var key=peg$currPos*45+26,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=[];s2=peg$parsearray_sep();while(s2!==peg$FAILED){s1.push(s2);s2=peg$parsearray_sep();}if(s1!==peg$FAILED){s2=peg$parsevalue();if(s2!==peg$FAILED){s3=[];s4=peg$parsearray_sep();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parsearray_sep();}if(s3!==peg$FAILED){if(input.charCodeAt(peg$currPos)===44){s4=peg$c61;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c62);}}if(s4!==peg$FAILED){s5=[];s6=peg$parsearray_sep();while(s6!==peg$FAILED){s5.push(s6);s6=peg$parsearray_sep();}if(s5!==peg$FAILED){peg$reportedPos=s0;s1=peg$c60(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsearray_sep(){var s0;var key=peg$currPos*45+27,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$parseS();if(s0===peg$FAILED){s0=peg$parseNL();if(s0===peg$FAILED){s0=peg$parsecomment();}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseinline_table(){var s0,s1,s2,s3,s4,s5;var key=peg$currPos*45+28,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.charCodeAt(peg$currPos)===123){s1=peg$c63;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c64);}}if(s1!==peg$FAILED){s2=[];s3=peg$parseS();while(s3!==peg$FAILED){s2.push(s3);s3=peg$parseS();}if(s2!==peg$FAILED){s3=[];s4=peg$parseinline_table_assignment();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parseinline_table_assignment();}if(s3!==peg$FAILED){s4=[];s5=peg$parseS();while(s5!==peg$FAILED){s4.push(s5);s5=peg$parseS();}if(s4!==peg$FAILED){if(input.charCodeAt(peg$currPos)===125){s5=peg$c65;peg$currPos++;}else {s5=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c66);}}if(s5!==peg$FAILED){peg$reportedPos=s0;s1=peg$c67(s3);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseinline_table_assignment(){var s0,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10;var key=peg$currPos*45+29,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=[];s2=peg$parseS();while(s2!==peg$FAILED){s1.push(s2);s2=peg$parseS();}if(s1!==peg$FAILED){s2=peg$parsekey();if(s2!==peg$FAILED){s3=[];s4=peg$parseS();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parseS();}if(s3!==peg$FAILED){if(input.charCodeAt(peg$currPos)===61){s4=peg$c18;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c19);}}if(s4!==peg$FAILED){s5=[];s6=peg$parseS();while(s6!==peg$FAILED){s5.push(s6);s6=peg$parseS();}if(s5!==peg$FAILED){s6=peg$parsevalue();if(s6!==peg$FAILED){s7=[];s8=peg$parseS();while(s8!==peg$FAILED){s7.push(s8);s8=peg$parseS();}if(s7!==peg$FAILED){if(input.charCodeAt(peg$currPos)===44){s8=peg$c61;peg$currPos++;}else {s8=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c62);}}if(s8!==peg$FAILED){s9=[];s10=peg$parseS();while(s10!==peg$FAILED){s9.push(s10);s10=peg$parseS();}if(s9!==peg$FAILED){peg$reportedPos=s0;s1=peg$c68(s2,s6);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;s1=[];s2=peg$parseS();while(s2!==peg$FAILED){s1.push(s2);s2=peg$parseS();}if(s1!==peg$FAILED){s2=peg$parsekey();if(s2!==peg$FAILED){s3=[];s4=peg$parseS();while(s4!==peg$FAILED){s3.push(s4);s4=peg$parseS();}if(s3!==peg$FAILED){if(input.charCodeAt(peg$currPos)===61){s4=peg$c18;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c19);}}if(s4!==peg$FAILED){s5=[];s6=peg$parseS();while(s6!==peg$FAILED){s5.push(s6);s6=peg$parseS();}if(s5!==peg$FAILED){s6=peg$parsevalue();if(s6!==peg$FAILED){peg$reportedPos=s0;s1=peg$c68(s2,s6);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsesecfragment(){var s0,s1,s2;var key=peg$currPos*45+30,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.charCodeAt(peg$currPos)===46){s1=peg$c16;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c17);}}if(s1!==peg$FAILED){s2=peg$parseDIGITS();if(s2!==peg$FAILED){peg$reportedPos=s0;s1=peg$c69(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsedate(){var s0,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10,s11;var key=peg$currPos*45+31,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=peg$currPos;s2=peg$parseDIGIT_OR_UNDER();if(s2!==peg$FAILED){s3=peg$parseDIGIT_OR_UNDER();if(s3!==peg$FAILED){s4=peg$parseDIGIT_OR_UNDER();if(s4!==peg$FAILED){s5=peg$parseDIGIT_OR_UNDER();if(s5!==peg$FAILED){if(input.charCodeAt(peg$currPos)===45){s6=peg$c46;peg$currPos++;}else {s6=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c47);}}if(s6!==peg$FAILED){s7=peg$parseDIGIT_OR_UNDER();if(s7!==peg$FAILED){s8=peg$parseDIGIT_OR_UNDER();if(s8!==peg$FAILED){if(input.charCodeAt(peg$currPos)===45){s9=peg$c46;peg$currPos++;}else {s9=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c47);}}if(s9!==peg$FAILED){s10=peg$parseDIGIT_OR_UNDER();if(s10!==peg$FAILED){s11=peg$parseDIGIT_OR_UNDER();if(s11!==peg$FAILED){s2=[s2,s3,s4,s5,s6,s7,s8,s9,s10,s11];s1=s2;}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c70(s1);}s0=s1;peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsetime(){var s0,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10;var key=peg$currPos*45+32,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=peg$currPos;s2=peg$parseDIGIT_OR_UNDER();if(s2!==peg$FAILED){s3=peg$parseDIGIT_OR_UNDER();if(s3!==peg$FAILED){if(input.charCodeAt(peg$currPos)===58){s4=peg$c71;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c72);}}if(s4!==peg$FAILED){s5=peg$parseDIGIT_OR_UNDER();if(s5!==peg$FAILED){s6=peg$parseDIGIT_OR_UNDER();if(s6!==peg$FAILED){if(input.charCodeAt(peg$currPos)===58){s7=peg$c71;peg$currPos++;}else {s7=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c72);}}if(s7!==peg$FAILED){s8=peg$parseDIGIT_OR_UNDER();if(s8!==peg$FAILED){s9=peg$parseDIGIT_OR_UNDER();if(s9!==peg$FAILED){s10=peg$parsesecfragment();if(s10===peg$FAILED){s10=peg$c27;}if(s10!==peg$FAILED){s2=[s2,s3,s4,s5,s6,s7,s8,s9,s10];s1=s2;}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c73(s1);}s0=s1;peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsetime_with_offset(){var s0,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10,s11,s12,s13,s14,s15,s16;var key=peg$currPos*45+33,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=peg$currPos;s2=peg$parseDIGIT_OR_UNDER();if(s2!==peg$FAILED){s3=peg$parseDIGIT_OR_UNDER();if(s3!==peg$FAILED){if(input.charCodeAt(peg$currPos)===58){s4=peg$c71;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c72);}}if(s4!==peg$FAILED){s5=peg$parseDIGIT_OR_UNDER();if(s5!==peg$FAILED){s6=peg$parseDIGIT_OR_UNDER();if(s6!==peg$FAILED){if(input.charCodeAt(peg$currPos)===58){s7=peg$c71;peg$currPos++;}else {s7=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c72);}}if(s7!==peg$FAILED){s8=peg$parseDIGIT_OR_UNDER();if(s8!==peg$FAILED){s9=peg$parseDIGIT_OR_UNDER();if(s9!==peg$FAILED){s10=peg$parsesecfragment();if(s10===peg$FAILED){s10=peg$c27;}if(s10!==peg$FAILED){if(input.charCodeAt(peg$currPos)===45){s11=peg$c46;peg$currPos++;}else {s11=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c47);}}if(s11===peg$FAILED){if(input.charCodeAt(peg$currPos)===43){s11=peg$c43;peg$currPos++;}else {s11=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c44);}}}if(s11!==peg$FAILED){s12=peg$parseDIGIT_OR_UNDER();if(s12!==peg$FAILED){s13=peg$parseDIGIT_OR_UNDER();if(s13!==peg$FAILED){if(input.charCodeAt(peg$currPos)===58){s14=peg$c71;peg$currPos++;}else {s14=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c72);}}if(s14!==peg$FAILED){s15=peg$parseDIGIT_OR_UNDER();if(s15!==peg$FAILED){s16=peg$parseDIGIT_OR_UNDER();if(s16!==peg$FAILED){s2=[s2,s3,s4,s5,s6,s7,s8,s9,s10,s11,s12,s13,s14,s15,s16];s1=s2;}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}}else {peg$currPos=s1;s1=peg$c2;}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c73(s1);}s0=s1;peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parsedatetime(){var s0,s1,s2,s3,s4;var key=peg$currPos*45+34,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=peg$parsedate();if(s1!==peg$FAILED){if(input.charCodeAt(peg$currPos)===84){s2=peg$c74;peg$currPos++;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c75);}}if(s2!==peg$FAILED){s3=peg$parsetime();if(s3!==peg$FAILED){if(input.charCodeAt(peg$currPos)===90){s4=peg$c76;peg$currPos++;}else {s4=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c77);}}if(s4!==peg$FAILED){peg$reportedPos=s0;s1=peg$c78(s1,s3);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;s1=peg$parsedate();if(s1!==peg$FAILED){if(input.charCodeAt(peg$currPos)===84){s2=peg$c74;peg$currPos++;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c75);}}if(s2!==peg$FAILED){s3=peg$parsetime_with_offset();if(s3!==peg$FAILED){peg$reportedPos=s0;s1=peg$c79(s1,s3);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseS(){var s0;var key=peg$currPos*45+35,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}if(peg$c80.test(input.charAt(peg$currPos))){s0=input.charAt(peg$currPos);peg$currPos++;}else {s0=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c81);}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseNL(){var s0,s1,s2;var key=peg$currPos*45+36,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}if(input.charCodeAt(peg$currPos)===10){s0=peg$c82;peg$currPos++;}else {s0=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c83);}}if(s0===peg$FAILED){s0=peg$currPos;if(input.charCodeAt(peg$currPos)===13){s1=peg$c84;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c85);}}if(s1!==peg$FAILED){if(input.charCodeAt(peg$currPos)===10){s2=peg$c82;peg$currPos++;}else {s2=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c83);}}if(s2!==peg$FAILED){s1=[s1,s2];s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseNLS(){var s0;var key=peg$currPos*45+37,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$parseNL();if(s0===peg$FAILED){s0=peg$parseS();}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseEOF(){var s0,s1;var key=peg$currPos*45+38,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;peg$silentFails++;if(input.length>peg$currPos){s1=input.charAt(peg$currPos);peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c6);}}peg$silentFails--;if(s1===peg$FAILED){s0=peg$c5;}else {peg$currPos=s0;s0=peg$c2;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseHEX(){var s0;var key=peg$currPos*45+39,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}if(peg$c86.test(input.charAt(peg$currPos))){s0=input.charAt(peg$currPos);peg$currPos++;}else {s0=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c87);}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseDIGIT_OR_UNDER(){var s0,s1;var key=peg$currPos*45+40,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}if(peg$c88.test(input.charAt(peg$currPos))){s0=input.charAt(peg$currPos);peg$currPos++;}else {s0=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c89);}}if(s0===peg$FAILED){s0=peg$currPos;if(input.charCodeAt(peg$currPos)===95){s1=peg$c90;peg$currPos++;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c91);}}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c92();}s0=s1;}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseASCII_BASIC(){var s0;var key=peg$currPos*45+41,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}if(peg$c93.test(input.charAt(peg$currPos))){s0=input.charAt(peg$currPos);peg$currPos++;}else {s0=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c94);}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseDIGITS(){var s0,s1,s2;var key=peg$currPos*45+42,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;s1=[];s2=peg$parseDIGIT_OR_UNDER();if(s2!==peg$FAILED){while(s2!==peg$FAILED){s1.push(s2);s2=peg$parseDIGIT_OR_UNDER();}}else {s1=peg$c2;}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c95(s1);}s0=s1;peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseESCAPED(){var s0,s1;var key=peg$currPos*45+43,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.substr(peg$currPos,2)===peg$c96){s1=peg$c96;peg$currPos+=2;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c97);}}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c98();}s0=s1;if(s0===peg$FAILED){s0=peg$currPos;if(input.substr(peg$currPos,2)===peg$c99){s1=peg$c99;peg$currPos+=2;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c100);}}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c101();}s0=s1;if(s0===peg$FAILED){s0=peg$currPos;if(input.substr(peg$currPos,2)===peg$c102){s1=peg$c102;peg$currPos+=2;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c103);}}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c104();}s0=s1;if(s0===peg$FAILED){s0=peg$currPos;if(input.substr(peg$currPos,2)===peg$c105){s1=peg$c105;peg$currPos+=2;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c106);}}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c107();}s0=s1;if(s0===peg$FAILED){s0=peg$currPos;if(input.substr(peg$currPos,2)===peg$c108){s1=peg$c108;peg$currPos+=2;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c109);}}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c110();}s0=s1;if(s0===peg$FAILED){s0=peg$currPos;if(input.substr(peg$currPos,2)===peg$c111){s1=peg$c111;peg$currPos+=2;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c112);}}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c113();}s0=s1;if(s0===peg$FAILED){s0=peg$currPos;if(input.substr(peg$currPos,2)===peg$c114){s1=peg$c114;peg$currPos+=2;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c115);}}if(s1!==peg$FAILED){peg$reportedPos=s0;s1=peg$c116();}s0=s1;if(s0===peg$FAILED){s0=peg$parseESCAPED_UNICODE();}}}}}}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}function peg$parseESCAPED_UNICODE(){var s0,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10;var key=peg$currPos*45+44,cached=peg$cache[key];if(cached){peg$currPos=cached.nextPos;return cached.result;}s0=peg$currPos;if(input.substr(peg$currPos,2)===peg$c117){s1=peg$c117;peg$currPos+=2;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c118);}}if(s1!==peg$FAILED){s2=peg$currPos;s3=peg$parseHEX();if(s3!==peg$FAILED){s4=peg$parseHEX();if(s4!==peg$FAILED){s5=peg$parseHEX();if(s5!==peg$FAILED){s6=peg$parseHEX();if(s6!==peg$FAILED){s7=peg$parseHEX();if(s7!==peg$FAILED){s8=peg$parseHEX();if(s8!==peg$FAILED){s9=peg$parseHEX();if(s9!==peg$FAILED){s10=peg$parseHEX();if(s10!==peg$FAILED){s3=[s3,s4,s5,s6,s7,s8,s9,s10];s2=s3;}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}if(s2!==peg$FAILED){peg$reportedPos=s0;s1=peg$c119(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}if(s0===peg$FAILED){s0=peg$currPos;if(input.substr(peg$currPos,2)===peg$c120){s1=peg$c120;peg$currPos+=2;}else {s1=peg$FAILED;if(peg$silentFails===0){peg$fail(peg$c121);}}if(s1!==peg$FAILED){s2=peg$currPos;s3=peg$parseHEX();if(s3!==peg$FAILED){s4=peg$parseHEX();if(s4!==peg$FAILED){s5=peg$parseHEX();if(s5!==peg$FAILED){s6=peg$parseHEX();if(s6!==peg$FAILED){s3=[s3,s4,s5,s6];s2=s3;}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}}else {peg$currPos=s2;s2=peg$c2;}if(s2!==peg$FAILED){peg$reportedPos=s0;s1=peg$c119(s2);s0=s1;}else {peg$currPos=s0;s0=peg$c2;}}else {peg$currPos=s0;s0=peg$c2;}}peg$cache[key]={nextPos:peg$currPos,result:s0};return s0;}var nodes=[];function genError(err,line,col){var ex=new Error(err);ex.line=line;ex.column=col;throw ex;}function addNode(node){nodes.push(node);}function node(type,value,line,column,key){var obj={type:type,value:value,line:line(),column:column()};if(key)obj.key=key;return obj;}function convertCodePoint(str,line,col){var num=parseInt("0x"+str);if(!isFinite(num)||Math.floor(num)!=num||num<0||num>0x10FFFF||num>0xD7FF&&num<0xE000){genError("Invalid Unicode escape code: "+str,line,col);}else {return fromCodePoint(num);}}function fromCodePoint(){var MAX_SIZE=0x4000;var codeUnits=[];var highSurrogate;var lowSurrogate;var index=-1;var length=arguments.length;if(!length){return '';}var result='';while(++index<length){var codePoint=Number(arguments[index]);if(codePoint<=0xFFFF){ // BMP code point
	codeUnits.push(codePoint);}else { // Astral code point; split in surrogate halves
	// http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
	codePoint-=0x10000;highSurrogate=(codePoint>>10)+0xD800;lowSurrogate=codePoint%0x400+0xDC00;codeUnits.push(highSurrogate,lowSurrogate);}if(index+1==length||codeUnits.length>MAX_SIZE){result+=String.fromCharCode.apply(null,codeUnits);codeUnits.length=0;}}return result;}peg$result=peg$startRuleFunction();if(peg$result!==peg$FAILED&&peg$currPos===input.length){return peg$result;}else {if(peg$result!==peg$FAILED&&peg$currPos<input.length){peg$fail({type:"end",description:"end of input"});}throw peg$buildException(null,peg$maxFailExpected,peg$maxFailPos);}}return {SyntaxError:SyntaxError,parse:parse};}();

/***/ },
/* 4 */
/***/ function(module, exports) {

	function compile(nodes) {
	  "use strict";

	  var assignedPaths = [];
	  var valueAssignments = [];
	  var currentPath = "";
	  var data = {};
	  var context = data;
	  var arrayMode = false;

	  return reduce(nodes);

	  function reduce(nodes) {
	    var node;
	    for (var i in nodes) {
	      node = nodes[i];
	      switch (node.type) {
	        case "Assign":
	          assign(node);
	          break;
	        case "ObjectPath":
	          setPath(node);
	          break;
	        case "ArrayPath":
	          addTableArray(node);
	          break;
	      }
	    }

	    return data;
	  }

	  function genError(err, line, col) {
	    var ex = new Error(err);
	    ex.line = line;
	    ex.column = col;
	    throw ex;
	  }

	  function assign(node) {
	    var key = node.key;
	    var value = node.value;
	    var line = node.line;
	    var column = node.column;

	    var fullPath;
	    if (currentPath) {
	      fullPath = currentPath + "." + key;
	    } else {
	      fullPath = key;
	    }
	    if (typeof context[key] !== "undefined") {
	      genError("Cannot redefine existing key '" + fullPath + "'.", line, column);
	    }

	    context[key] = reduceValueNode(value);

	    if (!pathAssigned(fullPath)) {
	      assignedPaths.push(fullPath);
	      valueAssignments.push(fullPath);
	    }
	  }

	  function pathAssigned(path) {
	    return assignedPaths.indexOf(path) !== -1;
	  }

	  function reduceValueNode(node) {
	    if (node.type === "Array") {
	      return reduceArrayWithTypeChecking(node.value);
	    } else if (node.type === "InlineTable") {
	      return reduceInlineTableNode(node.value);
	    } else {
	      return node.value;
	    }
	  }

	  function reduceInlineTableNode(values) {
	    var obj = {};
	    for (var i = 0; i < values.length; i++) {
	      var val = values[i];
	      if (val.value.type === "InlineTable") {
	        obj[val.key] = reduceInlineTableNode(val.value.value);
	      } else if (val.type === "InlineTableValue") {
	        obj[val.key] = reduceValueNode(val.value);
	      }
	    }

	    return obj;
	  }

	  function setPath(node) {
	    var path = node.value;
	    var quotedPath = path.map(quoteDottedString).join(".");
	    var line = node.line;
	    var column = node.column;

	    if (pathAssigned(quotedPath)) {
	      genError("Cannot redefine existing key '" + path + "'.", line, column);
	    }
	    assignedPaths.push(quotedPath);
	    context = deepRef(data, path, {}, line, column);
	    currentPath = path;
	  }

	  function addTableArray(node) {
	    var path = node.value;
	    var quotedPath = path.map(quoteDottedString).join(".");
	    var line = node.line;
	    var column = node.column;

	    if (!pathAssigned(quotedPath)) {
	      assignedPaths.push(quotedPath);
	    }
	    assignedPaths = assignedPaths.filter(function (p) {
	      return p.indexOf(quotedPath) !== 0;
	    });
	    assignedPaths.push(quotedPath);
	    context = deepRef(data, path, [], line, column);
	    currentPath = quotedPath;

	    if (context instanceof Array) {
	      var newObj = {};
	      context.push(newObj);
	      context = newObj;
	    } else {
	      genError("Cannot redefine existing key '" + path + "'.", line, column);
	    }
	  }

	  // Given a path 'a.b.c', create (as necessary) `start.a`,
	  // `start.a.b`, and `start.a.b.c`, assigning `value` to `start.a.b.c`.
	  // If `a` or `b` are arrays and have items in them, the last item in the
	  // array is used as the context for the next sub-path.
	  function deepRef(start, keys, value, line, column) {
	    var key;
	    var traversed = [];
	    var traversedPath = "";
	    var path = keys.join(".");
	    var ctx = start;
	    var keysLen = keys.length;

	    for (var i in keys) {
	      key = keys[i];
	      traversed.push(key);
	      traversedPath = traversed.join(".");
	      if (typeof ctx[key] === "undefined") {
	        if (i === String(keysLen - 1)) {
	          ctx[key] = value;
	        } else {
	          ctx[key] = {};
	        }
	      } else if (i !== keysLen - 1 && valueAssignments.indexOf(traversedPath) > -1) {
	        // already a non-object value at key, can't be used as part of a new path
	        genError("Cannot redefine existing key '" + traversedPath + "'.", line, column);
	      }

	      ctx = ctx[key];
	      if (ctx instanceof Array && ctx.length && i < keys.length - 1) {
	        ctx = ctx[ctx.length - 1];
	      }
	    }

	    return ctx;
	  }

	  function reduceArrayWithTypeChecking(array) {
	    // Ensure that all items in the array are of the same type
	    var firstType = null;
	    for (var i in array) {
	      var node = array[i];
	      if (firstType === null) {
	        firstType = node.type;
	      } else {
	        if (node.type !== firstType) {
	          genError("Cannot add value of type " + node.type + " to array of type " + firstType + ".", node.line, node.column);
	        }
	      }
	    }

	    // Recursively reduce array of nodes into array of the nodes' values
	    return array.map(reduceValueNode);
	  }

	  function quoteDottedString(str) {
	    if (str.indexOf(".") > -1) {
	      return "\"" + str + "\"";
	    } else {
	      return str;
	    }
	  }
	}

	module.exports = {
	  compile: compile
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var matter = __webpack_require__(6);
	var doT = __webpack_require__(45);

	doT.templateSettings.strip = false;

	var md;

	function init(parser_options) {
	  md = __webpack_require__(47)(parser_options);
	}

	function loadPlugins(plugins) {
	  var plugins = plugins || [];
	  for (var plugin in plugins) {
	    md.use(plugins[plugin][0], plugins[plugin][1]);
	  }
	}

	function parse(title, markup, config, template_markup) {
	  var output = {};

	  var content = matter(markup, { lang: 'toml', delims: ['+++', '+++'] });
	  markup = content.content;
	  fragment = md.render(markup);

	  output.text = fragment.replace(/<(?:.|\n)*?>/gm, '');
	  output.fragment = fragment;

	  if (template_markup != undefined) {
	    var template_data = {
	      fragment: fragment,
	      title: title,
	      wiki: config.wiki,
	      local: content.data,
	      global: config.global
	    };
	    var temp = doT.template(template_markup);
	    output.page = temp(template_data);
	  }

	  return output;
	}

	exports.init = init;
	exports.loadPlugins = loadPlugins;
	exports.parse = parse;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var fs = __webpack_require__(7);
	var extend = __webpack_require__(8);
	var parsers = __webpack_require__(10);

	/**
	 * Expose `matter()`
	 */

	module.exports = matter;

	/**
	 * Parses a `string` of front-matter with the given `options`,
	 * and returns an object.
	 *
	 * ```js
	 * matter('---\ntitle: foo\n---\nbar');
	 * //=> {data: {title: 'foo'}, content: 'bar', orig: '---\ntitle: foo\n---\nbar'}
	 * ```
	 *
	 * @param {String} `string` The string to parse.
	 * @param {Object} `options`
	 *   @option {Array} [options] `delims` Custom delimiters formatted as an array. The default is `['---', '---']`.
	 *   @option {Function} [options] `parser` Parser function to use. [js-yaml] is the default.
	 * @return {Object} Valid JSON
	 * @api public
	 */

	function matter(str, options) {
	  if (typeof str !== 'string') {
	    throw new Error('gray-matter expects a string');
	  }

	  // default results to build up
	  var res = { orig: str, data: {}, content: str };
	  if (str === '') {
	    return res;
	  }

	  // delimiters
	  var delims = arrayify(options && options.delims || '---');
	  var a = delims[0];

	  // strip byte order marks
	  str = stripBom(str);

	  // if the first delim isn't the first thing, return
	  if (!isFirst(str, a)) {
	    return res;
	  }

	  var b = '\n' + (delims[1] || delims[0]);
	  var alen = a.length;

	  // if the next character after the first delim
	  // is a character in the first delim, then just
	  // return the default object. it's either a bad
	  // delim or not a delimiter at all.
	  if (a.indexOf(str.charAt(alen + 1)) !== -1) {
	    return res;
	  }

	  var len = str.length;

	  // find the index of the next delimiter before
	  // going any further. If not found, return.
	  var end = str.indexOf(b, alen + 1);
	  if (end === -1) {
	    end = len;
	  }

	  // detect a language, if defined
	  var lang = str.slice(alen, str.indexOf('\n'));
	  // measure the lang before trimming whitespace
	  var start = alen + lang.length;

	  var opts = options || {};
	  opts.lang = opts.lang || 'yaml';
	  lang = lang && lang.trim() || opts.lang;

	  // get the front matter (data) string
	  var data = str.slice(start, end).trim();
	  if (data) {
	    // if data exists, see if we have a matching parser
	    var fn = opts.parser || parsers[lang];
	    if (typeof fn === 'function') {
	      // run the parser on the data string
	      res.data = fn(data, opts);
	    } else {
	      throw new Error('gray-matter cannot find a parser for: ' + str);
	    }
	  }

	  // grab the content from the string, stripping
	  // an optional new line after the second delim
	  var con = str.substr(end + b.length);
	  if (con.charAt(0) === '\n') {
	    con = con.substr(1);
	  }

	  res.content = con;
	  return res;
	}

	/**
	 * Expose `parsers`
	 *
	 * @type {Object}
	 */

	matter.parsers = parsers;

	/**
	 * Requires cache
	 */

	var YAML = matter.parsers.requires.yaml || (matter.parsers.requires.yaml = __webpack_require__(13));

	/**
	 * Read a file and parse front matter. Returns the same object
	 * as `matter()`.
	 *
	 * ```js
	 * matter.read('home.md');
	 * ```
	 *
	 * @param {String} `fp` file path of the file to read.
	 * @param {Object} `options` Options to pass to gray-matter.
	 * @return {Object}
	 * @api public
	 */

	matter.read = function (fp, options) {
	  var str = fs.readFileSync(fp, 'utf8');
	  var obj = matter(str, options);
	  return extend(obj, {
	    path: fp
	  });
	};

	/**
	 * Stringify an object to front-matter-formatted YAML, and
	 * concatenate it to the given string.
	 *
	 * ```js
	 * matter.stringify('foo bar baz', {title: 'Home'});
	 * ```
	 * Results in:
	 *
	 * ```yaml
	 * ---
	 * title: Home
	 * ---
	 * foo bar baz
	 * ```
	 *
	 * @param {String} `str` The content string to append to stringified front-matter.
	 * @param {Object} `data` Front matter to stringify.
	 * @param {Object} `options` Options to pass to js-yaml
	 * @return {String}
	 * @api public
	 */

	matter.stringify = function (str, data, options) {
	  var delims = arrayify(options && options.delims || '---');
	  var res = '';
	  res += delims[0] + '\n';
	  res += YAML.safeDump(data, options);
	  res += (delims[1] || delims[0]) + '\n';
	  res += str + '\n';
	  return res;
	};

	/**
	 * Return true if the given `string` has front matter.
	 *
	 * @param  {String} `string`
	 * @param  {Object} `options`
	 * @return {Boolean} True if front matter exists.
	 */

	matter.test = function (str, options) {
	  var delims = arrayify(options && options.delims || '---');
	  return isFirst(str, delims[0]);
	};

	/**
	 * Return true if the given `ch` the first
	 * thing in the string.
	 */

	function isFirst(str, ch) {
	  return str.substr(0, ch.length) === ch;
	}

	/**
	 * Utility to strip byte order marks
	 */

	function stripBom(str) {
	  return str.charAt(0) === '\uFEFF' ? str.slice(1) : str;
	}

	/**
	 * Typecast `val` to an array.
	 */

	function arrayify(val) {
	  return !Array.isArray(val) ? [val] : val;
	}

/***/ },
/* 7 */
/***/ function(module, exports) {

	

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isObject = __webpack_require__(9);

	module.exports = function extend(o /*, objects*/) {
	  if (!isObject(o)) {
	    o = {};
	  }

	  var len = arguments.length;
	  for (var i = 1; i < len; i++) {
	    var obj = arguments[i];

	    if (isObject(obj)) {
	      assign(o, obj);
	    }
	  }
	  return o;
	};

	function assign(a, b) {
	  for (var key in b) {
	    if (hasOwn(b, key)) {
	      a[key] = b[key];
	    }
	  }
	}

	/**
	 * Returns true if the given `key` is an own property of `obj`.
	 */

	function hasOwn(obj, key) {
	  return Object.prototype.hasOwnProperty.call(obj, key);
	}

/***/ },
/* 9 */
/***/ function(module, exports) {

	/*!
	 * is-extendable <https://github.com/jonschlinkert/is-extendable>
	 *
	 * Copyright (c) 2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */

	'use strict';

	module.exports = function isExtendable(val) {
	  return typeof val !== 'undefined' && val !== null && (typeof val === 'object' || typeof val === 'function');
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * gray-matter <https://github.com/jonschlinkert/gray-matter.git>
	 *
	 * Copyright (c) 2014-2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */

	'use strict';

	/**
	 * Module dependencies
	 */

	var extend = __webpack_require__(8);
	var red = __webpack_require__(11);

	/**
	 * Expose `parser` module
	 */

	var parser = module.exports;

	/**
	 * Requires cache.
	 */

	parser.requires = {};

	/**
	 * Parse YAML front matter
	 *
	 * @param  {String} `str` The string to parse.
	 * @param  {Object} `options` Options to pass to [js-yaml].
	 * @return {Object} Parsed object of data.
	 * @api public
	 */

	parser.yaml = function (str, options) {
	  var opts = extend({ strict: false, safeLoad: false }, options);
	  try {
	    var YAML = parser.requires.yaml || (parser.requires.yaml = __webpack_require__(13));
	    return opts.safeLoad ? YAML.safeLoad(str, options) : YAML.load(str, options);
	  } catch (err) {
	    if (opts.strict) {
	      throw new SyntaxError(msg('js-yaml', err));
	    } else {
	      return {};
	    }
	  }
	};

	/**
	 * Parse JSON front matter
	 *
	 * @param  {String} `str` The string to parse.
	 * @return {Object} Parsed object of data.
	 * @api public
	 */

	parser.json = function (str, options) {
	  var opts = extend({ strict: false }, options);
	  try {
	    return JSON.parse(str);
	  } catch (err) {
	    if (opts.strict) {
	      throw new SyntaxError(msg('JSON', err));
	    } else {
	      return {};
	    }
	  }
	};

	/**
	 * Parse JavaScript front matter. To use javascript front-matter, you must
	 * set `options.eval` to `true`.
	 *
	 * By default, javascript code is wrapped in a function that is immediately
	 * executed when the parser is called. Thus, to be returned as a useful object,
	 * code should be written as object properties.
	 *
	 * **Example:**
	 *
	 * ```markdown
	 * ---js
	 * title: 'autodetect-javascript',
	 * // this function won't be invoked when the parser is called
	 * fn: {
	 *   reverse: function(str) {
	 *     return str.split('').reverse().join('');
	 *   }
	 * }
	 * ---
	 * ```
	 *
	 * @param  {String} `str` The string to parse.
	 * @param  {Object} `options` Set `options.wrapped` to `false` to enable writing raw, un-wrapped javascript.
	 * @return {Object} Parsed object of data.
	 * @api public
	 */

	parser.javascript = function (str, options) {
	  var opts = extend({ wrapped: true, eval: false, strict: false }, options);
	  if (opts.eval) {
	    if (opts.wrapped) {
	      str = 'function data() {return {' + str + '}; } data();';
	    }
	    try {
	      return eval(str);
	    } catch (err) {
	      throw new SyntaxError(msg('javascript', err));
	    }
	    return {};
	  } else {

	    // if `eval` isn't set
	    if (opts.strict) {
	      throw new Error(evalError('javascript'));
	    } else {
	      console.error(evalError('javascript', true));
	    }
	  }
	};

	/**
	 * Alias for `parse.javascript()`.
	 *
	 * @api public
	 */

	parser.js = parser.javascript;

	/**
	 * Parse Coffee-Script front matter. To use coffee front-matter, you must
	 * set `options.eval` to `true`.
	 *
	 * @param  {String} `str` The string to parse.
	 * @param  {Object} `options` Options to pass to [coffee-script].
	 * @return {Object} Parsed object of data.
	 * @api public
	 */

	parser.coffee = function (str, options) {
	  var opts = extend({ eval: false, strict: false }, options);
	  if (opts.eval) {
	    try {
	      var coffee = parser.requires.coffee || (parser.requires.coffee = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"coffee-script\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
	      return coffee['eval'](str, options);
	    } catch (err) {
	      throw new SyntaxError(msg('coffee-script', err));
	    }
	  } else {

	    // if `eval` isn't set
	    if (opts.strict) {
	      throw new Error(evalError('coffee'));
	    } else {
	      console.error(evalError('coffee', true));
	    }
	  }
	};

	/**
	 * Alias for `parse.coffee()`.
	 *
	 * @api public
	 */

	parser.cson = parser.coffee;

	/**
	 * Parse TOML front matter.
	 *
	 * @param  {String} `str` The string to parse.
	 * @param  {Object} `options` Options to pass to [toml-node].
	 * @return {Object} Parsed object of data.
	 * @api public
	 */

	parser.toml = function (str, opts) {
	  try {
	    var toml = parser.requires.toml || (parser.requires.toml = __webpack_require__(2));
	    return toml.parse(str);
	  } catch (err) {
	    if (opts.strict) {
	      throw new SyntaxError(msg('TOML', err));
	    } else {
	      return {};
	    }
	  }
	};

	/**
	 * Normalize error messages
	 */

	function msg(lang, err) {
	  return 'gray-matter parser [' + lang + ']: ' + err;
	}

	function evalError(lang, color) {
	  var msg = '[gray-matter]: to parse ' + lang + ' set `options.eval` to `true`';
	  return color ? red(msg) : msg;
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * ansi-red <https://github.com/jonschlinkert/ansi-red>
	 *
	 * Copyright (c) 2015, Jon Schlinkert.
	 * Licensed under the MIT License.
	 */

	'use strict';

	var wrap = __webpack_require__(12);

	module.exports = function red(message) {
	  return wrap(31, 39, message);
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (a, b, msg) {
	  return '\u001b[' + a + 'm' + msg + '\u001b[' + b + 'm';
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var yaml = __webpack_require__(14);

	module.exports = yaml;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var loader = __webpack_require__(15);
	var dumper = __webpack_require__(44);

	function deprecated(name) {
	  return function () {
	    throw new Error('Function ' + name + ' is deprecated and cannot be used.');
	  };
	}

	module.exports.Type = __webpack_require__(21);
	module.exports.Schema = __webpack_require__(20);
	module.exports.FAILSAFE_SCHEMA = __webpack_require__(24);
	module.exports.JSON_SCHEMA = __webpack_require__(23);
	module.exports.CORE_SCHEMA = __webpack_require__(22);
	module.exports.DEFAULT_SAFE_SCHEMA = __webpack_require__(19);
	module.exports.DEFAULT_FULL_SCHEMA = __webpack_require__(39);
	module.exports.load = loader.load;
	module.exports.loadAll = loader.loadAll;
	module.exports.safeLoad = loader.safeLoad;
	module.exports.safeLoadAll = loader.safeLoadAll;
	module.exports.dump = dumper.dump;
	module.exports.safeDump = dumper.safeDump;
	module.exports.YAMLException = __webpack_require__(17);

	// Deprecated schema names from JS-YAML 2.0.x
	module.exports.MINIMAL_SCHEMA = __webpack_require__(24);
	module.exports.SAFE_SCHEMA = __webpack_require__(19);
	module.exports.DEFAULT_SCHEMA = __webpack_require__(39);

	// Deprecated functions from JS-YAML 1.x.x
	module.exports.scan = deprecated('scan');
	module.exports.parse = deprecated('parse');
	module.exports.compose = deprecated('compose');
	module.exports.addConstructor = deprecated('addConstructor');

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/*eslint-disable max-len,no-use-before-define*/

	var common = __webpack_require__(16);
	var YAMLException = __webpack_require__(17);
	var Mark = __webpack_require__(18);
	var DEFAULT_SAFE_SCHEMA = __webpack_require__(19);
	var DEFAULT_FULL_SCHEMA = __webpack_require__(39);

	var _hasOwnProperty = Object.prototype.hasOwnProperty;

	var CONTEXT_FLOW_IN = 1;
	var CONTEXT_FLOW_OUT = 2;
	var CONTEXT_BLOCK_IN = 3;
	var CONTEXT_BLOCK_OUT = 4;

	var CHOMPING_CLIP = 1;
	var CHOMPING_STRIP = 2;
	var CHOMPING_KEEP = 3;

	var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
	var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
	var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
	var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
	var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;

	function is_EOL(c) {
	  return c === 0x0A /* LF */ || c === 0x0D /* CR */;
	}

	function is_WHITE_SPACE(c) {
	  return c === 0x09 /* Tab */ || c === 0x20 /* Space */;
	}

	function is_WS_OR_EOL(c) {
	  return c === 0x09 /* Tab */ || c === 0x20 /* Space */ || c === 0x0A /* LF */ || c === 0x0D /* CR */;
	}

	function is_FLOW_INDICATOR(c) {
	  return c === 0x2C /* , */ || c === 0x5B /* [ */ || c === 0x5D /* ] */ || c === 0x7B /* { */ || c === 0x7D /* } */;
	}

	function fromHexCode(c) {
	  var lc;

	  if (0x30 /* 0 */ <= c && c <= 0x39 /* 9 */) {
	      return c - 0x30;
	    }

	  /*eslint-disable no-bitwise*/
	  lc = c | 0x20;

	  if (0x61 /* a */ <= lc && lc <= 0x66 /* f */) {
	      return lc - 0x61 + 10;
	    }

	  return -1;
	}

	function escapedHexLen(c) {
	  if (c === 0x78 /* x */) {
	      return 2;
	    }
	  if (c === 0x75 /* u */) {
	      return 4;
	    }
	  if (c === 0x55 /* U */) {
	      return 8;
	    }
	  return 0;
	}

	function fromDecimalCode(c) {
	  if (0x30 /* 0 */ <= c && c <= 0x39 /* 9 */) {
	      return c - 0x30;
	    }

	  return -1;
	}

	function simpleEscapeSequence(c) {
	  return c === 0x30 /* 0 */ ? '\x00' : c === 0x61 /* a */ ? '\x07' : c === 0x62 /* b */ ? '\x08' : c === 0x74 /* t */ ? '\x09' : c === 0x09 /* Tab */ ? '\x09' : c === 0x6E /* n */ ? '\x0A' : c === 0x76 /* v */ ? '\x0B' : c === 0x66 /* f */ ? '\x0C' : c === 0x72 /* r */ ? '\x0D' : c === 0x65 /* e */ ? '\x1B' : c === 0x20 /* Space */ ? ' ' : c === 0x22 /* " */ ? '\x22' : c === 0x2F /* / */ ? '/' : c === 0x5C /* \ */ ? '\x5C' : c === 0x4E /* N */ ? '\x85' : c === 0x5F /* _ */ ? '\xA0' : c === 0x4C /* L */ ? '\u2028' : c === 0x50 /* P */ ? '\u2029' : '';
	}

	function charFromCodepoint(c) {
	  if (c <= 0xFFFF) {
	    return String.fromCharCode(c);
	  }
	  // Encode UTF-16 surrogate pair
	  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
	  return String.fromCharCode((c - 0x010000 >> 10) + 0xD800, (c - 0x010000 & 0x03FF) + 0xDC00);
	}

	var simpleEscapeCheck = new Array(256); // integer, for fast access
	var simpleEscapeMap = new Array(256);
	for (var i = 0; i < 256; i++) {
	  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
	  simpleEscapeMap[i] = simpleEscapeSequence(i);
	}

	function State(input, options) {
	  this.input = input;

	  this.filename = options['filename'] || null;
	  this.schema = options['schema'] || DEFAULT_FULL_SCHEMA;
	  this.onWarning = options['onWarning'] || null;
	  this.legacy = options['legacy'] || false;
	  this.json = options['json'] || false;
	  this.listener = options['listener'] || null;

	  this.implicitTypes = this.schema.compiledImplicit;
	  this.typeMap = this.schema.compiledTypeMap;

	  this.length = input.length;
	  this.position = 0;
	  this.line = 0;
	  this.lineStart = 0;
	  this.lineIndent = 0;

	  this.documents = [];

	  /*
	  this.version;
	  this.checkLineBreaks;
	  this.tagMap;
	  this.anchorMap;
	  this.tag;
	  this.anchor;
	  this.kind;
	  this.result;*/
	}

	function generateError(state, message) {
	  return new YAMLException(message, new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart));
	}

	function throwError(state, message) {
	  throw generateError(state, message);
	}

	function throwWarning(state, message) {
	  if (state.onWarning) {
	    state.onWarning.call(null, generateError(state, message));
	  }
	}

	var directiveHandlers = {

	  YAML: function handleYamlDirective(state, name, args) {

	    var match, major, minor;

	    if (state.version !== null) {
	      throwError(state, 'duplication of %YAML directive');
	    }

	    if (args.length !== 1) {
	      throwError(state, 'YAML directive accepts exactly one argument');
	    }

	    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

	    if (match === null) {
	      throwError(state, 'ill-formed argument of the YAML directive');
	    }

	    major = parseInt(match[1], 10);
	    minor = parseInt(match[2], 10);

	    if (major !== 1) {
	      throwError(state, 'unacceptable YAML version of the document');
	    }

	    state.version = args[0];
	    state.checkLineBreaks = minor < 2;

	    if (minor !== 1 && minor !== 2) {
	      throwWarning(state, 'unsupported YAML version of the document');
	    }
	  },

	  TAG: function handleTagDirective(state, name, args) {

	    var handle, prefix;

	    if (args.length !== 2) {
	      throwError(state, 'TAG directive accepts exactly two arguments');
	    }

	    handle = args[0];
	    prefix = args[1];

	    if (!PATTERN_TAG_HANDLE.test(handle)) {
	      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
	    }

	    if (_hasOwnProperty.call(state.tagMap, handle)) {
	      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
	    }

	    if (!PATTERN_TAG_URI.test(prefix)) {
	      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
	    }

	    state.tagMap[handle] = prefix;
	  }
	};

	function captureSegment(state, start, end, checkJson) {
	  var _position, _length, _character, _result;

	  if (start < end) {
	    _result = state.input.slice(start, end);

	    if (checkJson) {
	      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
	        _character = _result.charCodeAt(_position);
	        if (!(_character === 0x09 || 0x20 <= _character && _character <= 0x10FFFF)) {
	          throwError(state, 'expected valid JSON character');
	        }
	      }
	    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
	      throwError(state, 'the stream contains non-printable characters');
	    }

	    state.result += _result;
	  }
	}

	function mergeMappings(state, destination, source, overridableKeys) {
	  var sourceKeys, key, index, quantity;

	  if (!common.isObject(source)) {
	    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
	  }

	  sourceKeys = Object.keys(source);

	  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
	    key = sourceKeys[index];

	    if (!_hasOwnProperty.call(destination, key)) {
	      destination[key] = source[key];
	      overridableKeys[key] = true;
	    }
	  }
	}

	function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode) {
	  var index, quantity;

	  keyNode = String(keyNode);

	  if (_result === null) {
	    _result = {};
	  }

	  if (keyTag === 'tag:yaml.org,2002:merge') {
	    if (Array.isArray(valueNode)) {
	      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
	        mergeMappings(state, _result, valueNode[index], overridableKeys);
	      }
	    } else {
	      mergeMappings(state, _result, valueNode, overridableKeys);
	    }
	  } else {
	    if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
	      throwError(state, 'duplicated mapping key');
	    }
	    _result[keyNode] = valueNode;
	    delete overridableKeys[keyNode];
	  }

	  return _result;
	}

	function readLineBreak(state) {
	  var ch;

	  ch = state.input.charCodeAt(state.position);

	  if (ch === 0x0A /* LF */) {
	      state.position++;
	    } else if (ch === 0x0D /* CR */) {
	      state.position++;
	      if (state.input.charCodeAt(state.position) === 0x0A /* LF */) {
	          state.position++;
	        }
	    } else {
	    throwError(state, 'a line break is expected');
	  }

	  state.line += 1;
	  state.lineStart = state.position;
	}

	function skipSeparationSpace(state, allowComments, checkIndent) {
	  var lineBreaks = 0,
	      ch = state.input.charCodeAt(state.position);

	  while (ch !== 0) {
	    while (is_WHITE_SPACE(ch)) {
	      ch = state.input.charCodeAt(++state.position);
	    }

	    if (allowComments && ch === 0x23 /* # */) {
	        do {
	          ch = state.input.charCodeAt(++state.position);
	        } while (ch !== 0x0A /* LF */ && ch !== 0x0D /* CR */ && ch !== 0);
	      }

	    if (is_EOL(ch)) {
	      readLineBreak(state);

	      ch = state.input.charCodeAt(state.position);
	      lineBreaks++;
	      state.lineIndent = 0;

	      while (ch === 0x20 /* Space */) {
	        state.lineIndent++;
	        ch = state.input.charCodeAt(++state.position);
	      }
	    } else {
	      break;
	    }
	  }

	  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
	    throwWarning(state, 'deficient indentation');
	  }

	  return lineBreaks;
	}

	function testDocumentSeparator(state) {
	  var _position = state.position,
	      ch;

	  ch = state.input.charCodeAt(_position);

	  // Condition state.position === state.lineStart is tested
	  // in parent on each call, for efficiency. No needs to test here again.
	  if ((ch === 0x2D /* - */ || ch === 0x2E /* . */) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {

	    _position += 3;

	    ch = state.input.charCodeAt(_position);

	    if (ch === 0 || is_WS_OR_EOL(ch)) {
	      return true;
	    }
	  }

	  return false;
	}

	function writeFoldedLines(state, count) {
	  if (count === 1) {
	    state.result += ' ';
	  } else if (count > 1) {
	    state.result += common.repeat('\n', count - 1);
	  }
	}

	function readPlainScalar(state, nodeIndent, withinFlowCollection) {
	  var preceding,
	      following,
	      captureStart,
	      captureEnd,
	      hasPendingContent,
	      _line,
	      _lineStart,
	      _lineIndent,
	      _kind = state.kind,
	      _result = state.result,
	      ch;

	  ch = state.input.charCodeAt(state.position);

	  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 0x23 /* # */ || ch === 0x26 /* & */ || ch === 0x2A /* * */ || ch === 0x21 /* ! */ || ch === 0x7C /* | */ || ch === 0x3E /* > */ || ch === 0x27 /* ' */ || ch === 0x22 /* " */ || ch === 0x25 /* % */ || ch === 0x40 /* @ */ || ch === 0x60 /* ` */) {
	      return false;
	    }

	  if (ch === 0x3F /* ? */ || ch === 0x2D /* - */) {
	      following = state.input.charCodeAt(state.position + 1);

	      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
	        return false;
	      }
	    }

	  state.kind = 'scalar';
	  state.result = '';
	  captureStart = captureEnd = state.position;
	  hasPendingContent = false;

	  while (ch !== 0) {
	    if (ch === 0x3A /* : */) {
	        following = state.input.charCodeAt(state.position + 1);

	        if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
	          break;
	        }
	      } else if (ch === 0x23 /* # */) {
	        preceding = state.input.charCodeAt(state.position - 1);

	        if (is_WS_OR_EOL(preceding)) {
	          break;
	        }
	      } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
	      break;
	    } else if (is_EOL(ch)) {
	      _line = state.line;
	      _lineStart = state.lineStart;
	      _lineIndent = state.lineIndent;
	      skipSeparationSpace(state, false, -1);

	      if (state.lineIndent >= nodeIndent) {
	        hasPendingContent = true;
	        ch = state.input.charCodeAt(state.position);
	        continue;
	      } else {
	        state.position = captureEnd;
	        state.line = _line;
	        state.lineStart = _lineStart;
	        state.lineIndent = _lineIndent;
	        break;
	      }
	    }

	    if (hasPendingContent) {
	      captureSegment(state, captureStart, captureEnd, false);
	      writeFoldedLines(state, state.line - _line);
	      captureStart = captureEnd = state.position;
	      hasPendingContent = false;
	    }

	    if (!is_WHITE_SPACE(ch)) {
	      captureEnd = state.position + 1;
	    }

	    ch = state.input.charCodeAt(++state.position);
	  }

	  captureSegment(state, captureStart, captureEnd, false);

	  if (state.result) {
	    return true;
	  }

	  state.kind = _kind;
	  state.result = _result;
	  return false;
	}

	function readSingleQuotedScalar(state, nodeIndent) {
	  var ch, captureStart, captureEnd;

	  ch = state.input.charCodeAt(state.position);

	  if (ch !== 0x27 /* ' */) {
	      return false;
	    }

	  state.kind = 'scalar';
	  state.result = '';
	  state.position++;
	  captureStart = captureEnd = state.position;

	  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
	    if (ch === 0x27 /* ' */) {
	        captureSegment(state, captureStart, state.position, true);
	        ch = state.input.charCodeAt(++state.position);

	        if (ch === 0x27 /* ' */) {
	            captureStart = captureEnd = state.position;
	            state.position++;
	          } else {
	          return true;
	        }
	      } else if (is_EOL(ch)) {
	      captureSegment(state, captureStart, captureEnd, true);
	      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
	      captureStart = captureEnd = state.position;
	    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
	      throwError(state, 'unexpected end of the document within a single quoted scalar');
	    } else {
	      state.position++;
	      captureEnd = state.position;
	    }
	  }

	  throwError(state, 'unexpected end of the stream within a single quoted scalar');
	}

	function readDoubleQuotedScalar(state, nodeIndent) {
	  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;

	  ch = state.input.charCodeAt(state.position);

	  if (ch !== 0x22 /* " */) {
	      return false;
	    }

	  state.kind = 'scalar';
	  state.result = '';
	  state.position++;
	  captureStart = captureEnd = state.position;

	  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
	    if (ch === 0x22 /* " */) {
	        captureSegment(state, captureStart, state.position, true);
	        state.position++;
	        return true;
	      } else if (ch === 0x5C /* \ */) {
	        captureSegment(state, captureStart, state.position, true);
	        ch = state.input.charCodeAt(++state.position);

	        if (is_EOL(ch)) {
	          skipSeparationSpace(state, false, nodeIndent);

	          // TODO: rework to inline fn with no type cast?
	        } else if (ch < 256 && simpleEscapeCheck[ch]) {
	            state.result += simpleEscapeMap[ch];
	            state.position++;
	          } else if ((tmp = escapedHexLen(ch)) > 0) {
	            hexLength = tmp;
	            hexResult = 0;

	            for (; hexLength > 0; hexLength--) {
	              ch = state.input.charCodeAt(++state.position);

	              if ((tmp = fromHexCode(ch)) >= 0) {
	                hexResult = (hexResult << 4) + tmp;
	              } else {
	                throwError(state, 'expected hexadecimal character');
	              }
	            }

	            state.result += charFromCodepoint(hexResult);

	            state.position++;
	          } else {
	            throwError(state, 'unknown escape sequence');
	          }

	        captureStart = captureEnd = state.position;
	      } else if (is_EOL(ch)) {
	      captureSegment(state, captureStart, captureEnd, true);
	      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
	      captureStart = captureEnd = state.position;
	    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
	      throwError(state, 'unexpected end of the document within a double quoted scalar');
	    } else {
	      state.position++;
	      captureEnd = state.position;
	    }
	  }

	  throwError(state, 'unexpected end of the stream within a double quoted scalar');
	}

	function readFlowCollection(state, nodeIndent) {
	  var readNext = true,
	      _line,
	      _tag = state.tag,
	      _result,
	      _anchor = state.anchor,
	      following,
	      terminator,
	      isPair,
	      isExplicitPair,
	      isMapping,
	      overridableKeys = {},
	      keyNode,
	      keyTag,
	      valueNode,
	      ch;

	  ch = state.input.charCodeAt(state.position);

	  if (ch === 0x5B /* [ */) {
	      terminator = 0x5D; /* ] */
	      isMapping = false;
	      _result = [];
	    } else if (ch === 0x7B /* { */) {
	      terminator = 0x7D; /* } */
	      isMapping = true;
	      _result = {};
	    } else {
	    return false;
	  }

	  if (state.anchor !== null) {
	    state.anchorMap[state.anchor] = _result;
	  }

	  ch = state.input.charCodeAt(++state.position);

	  while (ch !== 0) {
	    skipSeparationSpace(state, true, nodeIndent);

	    ch = state.input.charCodeAt(state.position);

	    if (ch === terminator) {
	      state.position++;
	      state.tag = _tag;
	      state.anchor = _anchor;
	      state.kind = isMapping ? 'mapping' : 'sequence';
	      state.result = _result;
	      return true;
	    } else if (!readNext) {
	      throwError(state, 'missed comma between flow collection entries');
	    }

	    keyTag = keyNode = valueNode = null;
	    isPair = isExplicitPair = false;

	    if (ch === 0x3F /* ? */) {
	        following = state.input.charCodeAt(state.position + 1);

	        if (is_WS_OR_EOL(following)) {
	          isPair = isExplicitPair = true;
	          state.position++;
	          skipSeparationSpace(state, true, nodeIndent);
	        }
	      }

	    _line = state.line;
	    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
	    keyTag = state.tag;
	    keyNode = state.result;
	    skipSeparationSpace(state, true, nodeIndent);

	    ch = state.input.charCodeAt(state.position);

	    if ((isExplicitPair || state.line === _line) && ch === 0x3A /* : */) {
	        isPair = true;
	        ch = state.input.charCodeAt(++state.position);
	        skipSeparationSpace(state, true, nodeIndent);
	        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
	        valueNode = state.result;
	      }

	    if (isMapping) {
	      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
	    } else if (isPair) {
	      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
	    } else {
	      _result.push(keyNode);
	    }

	    skipSeparationSpace(state, true, nodeIndent);

	    ch = state.input.charCodeAt(state.position);

	    if (ch === 0x2C /* , */) {
	        readNext = true;
	        ch = state.input.charCodeAt(++state.position);
	      } else {
	      readNext = false;
	    }
	  }

	  throwError(state, 'unexpected end of the stream within a flow collection');
	}

	function readBlockScalar(state, nodeIndent) {
	  var captureStart,
	      folding,
	      chomping = CHOMPING_CLIP,
	      detectedIndent = false,
	      textIndent = nodeIndent,
	      emptyLines = 0,
	      atMoreIndented = false,
	      tmp,
	      ch;

	  ch = state.input.charCodeAt(state.position);

	  if (ch === 0x7C /* | */) {
	      folding = false;
	    } else if (ch === 0x3E /* > */) {
	      folding = true;
	    } else {
	    return false;
	  }

	  state.kind = 'scalar';
	  state.result = '';

	  while (ch !== 0) {
	    ch = state.input.charCodeAt(++state.position);

	    if (ch === 0x2B /* + */ || ch === 0x2D /* - */) {
	        if (CHOMPING_CLIP === chomping) {
	          chomping = ch === 0x2B /* + */ ? CHOMPING_KEEP : CHOMPING_STRIP;
	        } else {
	          throwError(state, 'repeat of a chomping mode identifier');
	        }
	      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
	      if (tmp === 0) {
	        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
	      } else if (!detectedIndent) {
	        textIndent = nodeIndent + tmp - 1;
	        detectedIndent = true;
	      } else {
	        throwError(state, 'repeat of an indentation width identifier');
	      }
	    } else {
	      break;
	    }
	  }

	  if (is_WHITE_SPACE(ch)) {
	    do {
	      ch = state.input.charCodeAt(++state.position);
	    } while (is_WHITE_SPACE(ch));

	    if (ch === 0x23 /* # */) {
	        do {
	          ch = state.input.charCodeAt(++state.position);
	        } while (!is_EOL(ch) && ch !== 0);
	      }
	  }

	  while (ch !== 0) {
	    readLineBreak(state);
	    state.lineIndent = 0;

	    ch = state.input.charCodeAt(state.position);

	    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 0x20 /* Space */) {
	      state.lineIndent++;
	      ch = state.input.charCodeAt(++state.position);
	    }

	    if (!detectedIndent && state.lineIndent > textIndent) {
	      textIndent = state.lineIndent;
	    }

	    if (is_EOL(ch)) {
	      emptyLines++;
	      continue;
	    }

	    // End of the scalar.
	    if (state.lineIndent < textIndent) {

	      // Perform the chomping.
	      if (chomping === CHOMPING_KEEP) {
	        state.result += common.repeat('\n', emptyLines);
	      } else if (chomping === CHOMPING_CLIP) {
	        if (detectedIndent) {
	          // i.e. only if the scalar is not empty.
	          state.result += '\n';
	        }
	      }

	      // Break this `while` cycle and go to the funciton's epilogue.
	      break;
	    }

	    // Folded style: use fancy rules to handle line breaks.
	    if (folding) {

	      // Lines starting with white space characters (more-indented lines) are not folded.
	      if (is_WHITE_SPACE(ch)) {
	        atMoreIndented = true;
	        state.result += common.repeat('\n', emptyLines + 1);

	        // End of more-indented block.
	      } else if (atMoreIndented) {
	          atMoreIndented = false;
	          state.result += common.repeat('\n', emptyLines + 1);

	          // Just one line break - perceive as the same line.
	        } else if (emptyLines === 0) {
	            if (detectedIndent) {
	              // i.e. only if we have already read some scalar content.
	              state.result += ' ';
	            }

	            // Several line breaks - perceive as different lines.
	          } else {
	              state.result += common.repeat('\n', emptyLines);
	            }

	      // Literal style: just add exact number of line breaks between content lines.
	    } else if (detectedIndent) {
	        // If current line isn't the first one - count line break from the last content line.
	        state.result += common.repeat('\n', emptyLines + 1);
	      } else {
	        // In case of the first content line - count only empty lines.
	        state.result += common.repeat('\n', emptyLines);
	      }

	    detectedIndent = true;
	    emptyLines = 0;
	    captureStart = state.position;

	    while (!is_EOL(ch) && ch !== 0) {
	      ch = state.input.charCodeAt(++state.position);
	    }

	    captureSegment(state, captureStart, state.position, false);
	  }

	  return true;
	}

	function readBlockSequence(state, nodeIndent) {
	  var _line,
	      _tag = state.tag,
	      _anchor = state.anchor,
	      _result = [],
	      following,
	      detected = false,
	      ch;

	  if (state.anchor !== null) {
	    state.anchorMap[state.anchor] = _result;
	  }

	  ch = state.input.charCodeAt(state.position);

	  while (ch !== 0) {

	    if (ch !== 0x2D /* - */) {
	        break;
	      }

	    following = state.input.charCodeAt(state.position + 1);

	    if (!is_WS_OR_EOL(following)) {
	      break;
	    }

	    detected = true;
	    state.position++;

	    if (skipSeparationSpace(state, true, -1)) {
	      if (state.lineIndent <= nodeIndent) {
	        _result.push(null);
	        ch = state.input.charCodeAt(state.position);
	        continue;
	      }
	    }

	    _line = state.line;
	    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
	    _result.push(state.result);
	    skipSeparationSpace(state, true, -1);

	    ch = state.input.charCodeAt(state.position);

	    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
	      throwError(state, 'bad indentation of a sequence entry');
	    } else if (state.lineIndent < nodeIndent) {
	      break;
	    }
	  }

	  if (detected) {
	    state.tag = _tag;
	    state.anchor = _anchor;
	    state.kind = 'sequence';
	    state.result = _result;
	    return true;
	  }
	  return false;
	}

	function readBlockMapping(state, nodeIndent, flowIndent) {
	  var following,
	      allowCompact,
	      _line,
	      _tag = state.tag,
	      _anchor = state.anchor,
	      _result = {},
	      overridableKeys = {},
	      keyTag = null,
	      keyNode = null,
	      valueNode = null,
	      atExplicitKey = false,
	      detected = false,
	      ch;

	  if (state.anchor !== null) {
	    state.anchorMap[state.anchor] = _result;
	  }

	  ch = state.input.charCodeAt(state.position);

	  while (ch !== 0) {
	    following = state.input.charCodeAt(state.position + 1);
	    _line = state.line; // Save the current line.

	    //
	    // Explicit notation case. There are two separate blocks:
	    // first for the key (denoted by "?") and second for the value (denoted by ":")
	    //
	    if ((ch === 0x3F /* ? */ || ch === 0x3A /* : */) && is_WS_OR_EOL(following)) {

	      if (ch === 0x3F /* ? */) {
	          if (atExplicitKey) {
	            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
	            keyTag = keyNode = valueNode = null;
	          }

	          detected = true;
	          atExplicitKey = true;
	          allowCompact = true;
	        } else if (atExplicitKey) {
	        // i.e. 0x3A/* : */ === character after the explicit key.
	        atExplicitKey = false;
	        allowCompact = true;
	      } else {
	        throwError(state, 'incomplete explicit mapping pair; a key node is missed');
	      }

	      state.position += 1;
	      ch = following;

	      //
	      // Implicit notation case. Flow-style node as the key first, then ":", and the value.
	      //
	    } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {

	        if (state.line === _line) {
	          ch = state.input.charCodeAt(state.position);

	          while (is_WHITE_SPACE(ch)) {
	            ch = state.input.charCodeAt(++state.position);
	          }

	          if (ch === 0x3A /* : */) {
	              ch = state.input.charCodeAt(++state.position);

	              if (!is_WS_OR_EOL(ch)) {
	                throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
	              }

	              if (atExplicitKey) {
	                storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
	                keyTag = keyNode = valueNode = null;
	              }

	              detected = true;
	              atExplicitKey = false;
	              allowCompact = false;
	              keyTag = state.tag;
	              keyNode = state.result;
	            } else if (detected) {
	            throwError(state, 'can not read an implicit mapping pair; a colon is missed');
	          } else {
	            state.tag = _tag;
	            state.anchor = _anchor;
	            return true; // Keep the result of `composeNode`.
	          }
	        } else if (detected) {
	            throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');
	          } else {
	            state.tag = _tag;
	            state.anchor = _anchor;
	            return true; // Keep the result of `composeNode`.
	          }
	      } else {
	          break; // Reading is done. Go to the epilogue.
	        }

	    //
	    // Common reading code for both explicit and implicit notations.
	    //
	    if (state.line === _line || state.lineIndent > nodeIndent) {
	      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
	        if (atExplicitKey) {
	          keyNode = state.result;
	        } else {
	          valueNode = state.result;
	        }
	      }

	      if (!atExplicitKey) {
	        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
	        keyTag = keyNode = valueNode = null;
	      }

	      skipSeparationSpace(state, true, -1);
	      ch = state.input.charCodeAt(state.position);
	    }

	    if (state.lineIndent > nodeIndent && ch !== 0) {
	      throwError(state, 'bad indentation of a mapping entry');
	    } else if (state.lineIndent < nodeIndent) {
	      break;
	    }
	  }

	  //
	  // Epilogue.
	  //

	  // Special case: last mapping's node contains only the key in explicit notation.
	  if (atExplicitKey) {
	    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
	  }

	  // Expose the resulting mapping.
	  if (detected) {
	    state.tag = _tag;
	    state.anchor = _anchor;
	    state.kind = 'mapping';
	    state.result = _result;
	  }

	  return detected;
	}

	function readTagProperty(state) {
	  var _position,
	      isVerbatim = false,
	      isNamed = false,
	      tagHandle,
	      tagName,
	      ch;

	  ch = state.input.charCodeAt(state.position);

	  if (ch !== 0x21 /* ! */) return false;

	  if (state.tag !== null) {
	    throwError(state, 'duplication of a tag property');
	  }

	  ch = state.input.charCodeAt(++state.position);

	  if (ch === 0x3C /* < */) {
	      isVerbatim = true;
	      ch = state.input.charCodeAt(++state.position);
	    } else if (ch === 0x21 /* ! */) {
	      isNamed = true;
	      tagHandle = '!!';
	      ch = state.input.charCodeAt(++state.position);
	    } else {
	    tagHandle = '!';
	  }

	  _position = state.position;

	  if (isVerbatim) {
	    do {
	      ch = state.input.charCodeAt(++state.position);
	    } while (ch !== 0 && ch !== 0x3E /* > */);

	    if (state.position < state.length) {
	      tagName = state.input.slice(_position, state.position);
	      ch = state.input.charCodeAt(++state.position);
	    } else {
	      throwError(state, 'unexpected end of the stream within a verbatim tag');
	    }
	  } else {
	    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

	      if (ch === 0x21 /* ! */) {
	          if (!isNamed) {
	            tagHandle = state.input.slice(_position - 1, state.position + 1);

	            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
	              throwError(state, 'named tag handle cannot contain such characters');
	            }

	            isNamed = true;
	            _position = state.position + 1;
	          } else {
	            throwError(state, 'tag suffix cannot contain exclamation marks');
	          }
	        }

	      ch = state.input.charCodeAt(++state.position);
	    }

	    tagName = state.input.slice(_position, state.position);

	    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
	      throwError(state, 'tag suffix cannot contain flow indicator characters');
	    }
	  }

	  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
	    throwError(state, 'tag name cannot contain such characters: ' + tagName);
	  }

	  if (isVerbatim) {
	    state.tag = tagName;
	  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
	    state.tag = state.tagMap[tagHandle] + tagName;
	  } else if (tagHandle === '!') {
	    state.tag = '!' + tagName;
	  } else if (tagHandle === '!!') {
	    state.tag = 'tag:yaml.org,2002:' + tagName;
	  } else {
	    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
	  }

	  return true;
	}

	function readAnchorProperty(state) {
	  var _position, ch;

	  ch = state.input.charCodeAt(state.position);

	  if (ch !== 0x26 /* & */) return false;

	  if (state.anchor !== null) {
	    throwError(state, 'duplication of an anchor property');
	  }

	  ch = state.input.charCodeAt(++state.position);
	  _position = state.position;

	  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
	    ch = state.input.charCodeAt(++state.position);
	  }

	  if (state.position === _position) {
	    throwError(state, 'name of an anchor node must contain at least one character');
	  }

	  state.anchor = state.input.slice(_position, state.position);
	  return true;
	}

	function readAlias(state) {
	  var _position, alias, ch;

	  ch = state.input.charCodeAt(state.position);

	  if (ch !== 0x2A /* * */) return false;

	  ch = state.input.charCodeAt(++state.position);
	  _position = state.position;

	  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
	    ch = state.input.charCodeAt(++state.position);
	  }

	  if (state.position === _position) {
	    throwError(state, 'name of an alias node must contain at least one character');
	  }

	  alias = state.input.slice(_position, state.position);

	  if (!state.anchorMap.hasOwnProperty(alias)) {
	    throwError(state, 'unidentified alias "' + alias + '"');
	  }

	  state.result = state.anchorMap[alias];
	  skipSeparationSpace(state, true, -1);
	  return true;
	}

	function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
	  var allowBlockStyles,
	      allowBlockScalars,
	      allowBlockCollections,
	      indentStatus = 1,
	      // 1: this>parent, 0: this=parent, -1: this<parent
	  atNewLine = false,
	      hasContent = false,
	      typeIndex,
	      typeQuantity,
	      type,
	      flowIndent,
	      blockIndent;

	  if (state.listener !== null) {
	    state.listener('open', state);
	  }

	  state.tag = null;
	  state.anchor = null;
	  state.kind = null;
	  state.result = null;

	  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;

	  if (allowToSeek) {
	    if (skipSeparationSpace(state, true, -1)) {
	      atNewLine = true;

	      if (state.lineIndent > parentIndent) {
	        indentStatus = 1;
	      } else if (state.lineIndent === parentIndent) {
	        indentStatus = 0;
	      } else if (state.lineIndent < parentIndent) {
	        indentStatus = -1;
	      }
	    }
	  }

	  if (indentStatus === 1) {
	    while (readTagProperty(state) || readAnchorProperty(state)) {
	      if (skipSeparationSpace(state, true, -1)) {
	        atNewLine = true;
	        allowBlockCollections = allowBlockStyles;

	        if (state.lineIndent > parentIndent) {
	          indentStatus = 1;
	        } else if (state.lineIndent === parentIndent) {
	          indentStatus = 0;
	        } else if (state.lineIndent < parentIndent) {
	          indentStatus = -1;
	        }
	      } else {
	        allowBlockCollections = false;
	      }
	    }
	  }

	  if (allowBlockCollections) {
	    allowBlockCollections = atNewLine || allowCompact;
	  }

	  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
	    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
	      flowIndent = parentIndent;
	    } else {
	      flowIndent = parentIndent + 1;
	    }

	    blockIndent = state.position - state.lineStart;

	    if (indentStatus === 1) {
	      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
	        hasContent = true;
	      } else {
	        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
	          hasContent = true;
	        } else if (readAlias(state)) {
	          hasContent = true;

	          if (state.tag !== null || state.anchor !== null) {
	            throwError(state, 'alias node should not have any properties');
	          }
	        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
	          hasContent = true;

	          if (state.tag === null) {
	            state.tag = '?';
	          }
	        }

	        if (state.anchor !== null) {
	          state.anchorMap[state.anchor] = state.result;
	        }
	      }
	    } else if (indentStatus === 0) {
	      // Special case: block sequences are allowed to have same indentation level as the parent.
	      // http://www.yaml.org/spec/1.2/spec.html#id2799784
	      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
	    }
	  }

	  if (state.tag !== null && state.tag !== '!') {
	    if (state.tag === '?') {
	      for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
	        type = state.implicitTypes[typeIndex];

	        // Implicit resolving is not allowed for non-scalar types, and '?'
	        // non-specific tag is only assigned to plain scalars. So, it isn't
	        // needed to check for 'kind' conformity.

	        if (type.resolve(state.result)) {
	          // `state.result` updated in resolver if matched
	          state.result = type.construct(state.result);
	          state.tag = type.tag;
	          if (state.anchor !== null) {
	            state.anchorMap[state.anchor] = state.result;
	          }
	          break;
	        }
	      }
	    } else if (_hasOwnProperty.call(state.typeMap, state.tag)) {
	      type = state.typeMap[state.tag];

	      if (state.result !== null && type.kind !== state.kind) {
	        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
	      }

	      if (!type.resolve(state.result)) {
	        // `state.result` updated in resolver if matched
	        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
	      } else {
	        state.result = type.construct(state.result);
	        if (state.anchor !== null) {
	          state.anchorMap[state.anchor] = state.result;
	        }
	      }
	    } else {
	      throwError(state, 'unknown tag !<' + state.tag + '>');
	    }
	  }

	  if (state.listener !== null) {
	    state.listener('close', state);
	  }
	  return state.tag !== null || state.anchor !== null || hasContent;
	}

	function readDocument(state) {
	  var documentStart = state.position,
	      _position,
	      directiveName,
	      directiveArgs,
	      hasDirectives = false,
	      ch;

	  state.version = null;
	  state.checkLineBreaks = state.legacy;
	  state.tagMap = {};
	  state.anchorMap = {};

	  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
	    skipSeparationSpace(state, true, -1);

	    ch = state.input.charCodeAt(state.position);

	    if (state.lineIndent > 0 || ch !== 0x25 /* % */) {
	        break;
	      }

	    hasDirectives = true;
	    ch = state.input.charCodeAt(++state.position);
	    _position = state.position;

	    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
	      ch = state.input.charCodeAt(++state.position);
	    }

	    directiveName = state.input.slice(_position, state.position);
	    directiveArgs = [];

	    if (directiveName.length < 1) {
	      throwError(state, 'directive name must not be less than one character in length');
	    }

	    while (ch !== 0) {
	      while (is_WHITE_SPACE(ch)) {
	        ch = state.input.charCodeAt(++state.position);
	      }

	      if (ch === 0x23 /* # */) {
	          do {
	            ch = state.input.charCodeAt(++state.position);
	          } while (ch !== 0 && !is_EOL(ch));
	          break;
	        }

	      if (is_EOL(ch)) break;

	      _position = state.position;

	      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
	        ch = state.input.charCodeAt(++state.position);
	      }

	      directiveArgs.push(state.input.slice(_position, state.position));
	    }

	    if (ch !== 0) readLineBreak(state);

	    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
	      directiveHandlers[directiveName](state, directiveName, directiveArgs);
	    } else {
	      throwWarning(state, 'unknown document directive "' + directiveName + '"');
	    }
	  }

	  skipSeparationSpace(state, true, -1);

	  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 0x2D /* - */ && state.input.charCodeAt(state.position + 1) === 0x2D /* - */ && state.input.charCodeAt(state.position + 2) === 0x2D /* - */) {
	      state.position += 3;
	      skipSeparationSpace(state, true, -1);
	    } else if (hasDirectives) {
	    throwError(state, 'directives end mark is expected');
	  }

	  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
	  skipSeparationSpace(state, true, -1);

	  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
	    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
	  }

	  state.documents.push(state.result);

	  if (state.position === state.lineStart && testDocumentSeparator(state)) {

	    if (state.input.charCodeAt(state.position) === 0x2E /* . */) {
	        state.position += 3;
	        skipSeparationSpace(state, true, -1);
	      }
	    return;
	  }

	  if (state.position < state.length - 1) {
	    throwError(state, 'end of the stream or a document separator is expected');
	  } else {
	    return;
	  }
	}

	function loadDocuments(input, options) {
	  input = String(input);
	  options = options || {};

	  if (input.length !== 0) {

	    // Add tailing `\n` if not exists
	    if (input.charCodeAt(input.length - 1) !== 0x0A /* LF */ && input.charCodeAt(input.length - 1) !== 0x0D /* CR */) {
	        input += '\n';
	      }

	    // Strip BOM
	    if (input.charCodeAt(0) === 0xFEFF) {
	      input = input.slice(1);
	    }
	  }

	  var state = new State(input, options);

	  // Use 0 as string terminator. That significantly simplifies bounds check.
	  state.input += '\0';

	  while (state.input.charCodeAt(state.position) === 0x20 /* Space */) {
	    state.lineIndent += 1;
	    state.position += 1;
	  }

	  while (state.position < state.length - 1) {
	    readDocument(state);
	  }

	  return state.documents;
	}

	function loadAll(input, iterator, options) {
	  var documents = loadDocuments(input, options),
	      index,
	      length;

	  for (index = 0, length = documents.length; index < length; index += 1) {
	    iterator(documents[index]);
	  }
	}

	function load(input, options) {
	  var documents = loadDocuments(input, options);

	  if (documents.length === 0) {
	    /*eslint-disable no-undefined*/
	    return undefined;
	  } else if (documents.length === 1) {
	    return documents[0];
	  }
	  throw new YAMLException('expected a single document in the stream, but found more');
	}

	function safeLoadAll(input, output, options) {
	  loadAll(input, output, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
	}

	function safeLoad(input, options) {
	  return load(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
	}

	module.exports.loadAll = loadAll;
	module.exports.load = load;
	module.exports.safeLoadAll = safeLoadAll;
	module.exports.safeLoad = safeLoad;

/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	function isNothing(subject) {
	  return typeof subject === 'undefined' || subject === null;
	}

	function isObject(subject) {
	  return typeof subject === 'object' && subject !== null;
	}

	function toArray(sequence) {
	  if (Array.isArray(sequence)) return sequence;else if (isNothing(sequence)) return [];

	  return [sequence];
	}

	function extend(target, source) {
	  var index, length, key, sourceKeys;

	  if (source) {
	    sourceKeys = Object.keys(source);

	    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
	      key = sourceKeys[index];
	      target[key] = source[key];
	    }
	  }

	  return target;
	}

	function repeat(string, count) {
	  var result = '',
	      cycle;

	  for (cycle = 0; cycle < count; cycle += 1) {
	    result += string;
	  }

	  return result;
	}

	function isNegativeZero(number) {
	  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
	}

	module.exports.isNothing = isNothing;
	module.exports.isObject = isObject;
	module.exports.toArray = toArray;
	module.exports.repeat = repeat;
	module.exports.isNegativeZero = isNegativeZero;
	module.exports.extend = extend;

/***/ },
/* 17 */
/***/ function(module, exports) {

	// YAML error class. http://stackoverflow.com/questions/8458984
	//
	'use strict';

	function YAMLException(reason, mark) {
	  // Super constructor
	  Error.call(this);

	  // Include stack trace in error object
	  if (Error.captureStackTrace) {
	    // Chrome and NodeJS
	    Error.captureStackTrace(this, this.constructor);
	  } else {
	    // FF, IE 10+ and Safari 6+. Fallback for others
	    this.stack = new Error().stack || '';
	  }

	  this.name = 'YAMLException';
	  this.reason = reason;
	  this.mark = mark;
	  this.message = (this.reason || '(unknown reason)') + (this.mark ? ' ' + this.mark.toString() : '');
	}

	// Inherit from Error
	YAMLException.prototype = Object.create(Error.prototype);
	YAMLException.prototype.constructor = YAMLException;

	YAMLException.prototype.toString = function toString(compact) {
	  var result = this.name + ': ';

	  result += this.reason || '(unknown reason)';

	  if (!compact && this.mark) {
	    result += ' ' + this.mark.toString();
	  }

	  return result;
	};

	module.exports = YAMLException;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var common = __webpack_require__(16);

	function Mark(name, buffer, position, line, column) {
	  this.name = name;
	  this.buffer = buffer;
	  this.position = position;
	  this.line = line;
	  this.column = column;
	}

	Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
	  var head, start, tail, end, snippet;

	  if (!this.buffer) return null;

	  indent = indent || 4;
	  maxLength = maxLength || 75;

	  head = '';
	  start = this.position;

	  while (start > 0 && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(start - 1)) === -1) {
	    start -= 1;
	    if (this.position - start > maxLength / 2 - 1) {
	      head = ' ... ';
	      start += 5;
	      break;
	    }
	  }

	  tail = '';
	  end = this.position;

	  while (end < this.buffer.length && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(end)) === -1) {
	    end += 1;
	    if (end - this.position > maxLength / 2 - 1) {
	      tail = ' ... ';
	      end -= 5;
	      break;
	    }
	  }

	  snippet = this.buffer.slice(start, end);

	  return common.repeat(' ', indent) + head + snippet + tail + '\n' + common.repeat(' ', indent + this.position - start + head.length) + '^';
	};

	Mark.prototype.toString = function toString(compact) {
	  var snippet,
	      where = '';

	  if (this.name) {
	    where += 'in "' + this.name + '" ';
	  }

	  where += 'at line ' + (this.line + 1) + ', column ' + (this.column + 1);

	  if (!compact) {
	    snippet = this.getSnippet();

	    if (snippet) {
	      where += ':\n' + snippet;
	    }
	  }

	  return where;
	};

	module.exports = Mark;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// JS-YAML's default schema for `safeLoad` function.
	// It is not described in the YAML specification.
	//
	// This schema is based on standard YAML's Core schema and includes most of
	// extra types described at YAML tag repository. (http://yaml.org/type/)

	'use strict';

	var Schema = __webpack_require__(20);

	module.exports = new Schema({
	  include: [__webpack_require__(22)],
	  implicit: [__webpack_require__(32), __webpack_require__(33)],
	  explicit: [__webpack_require__(34), __webpack_require__(36), __webpack_require__(37), __webpack_require__(38)]
	});

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/*eslint-disable max-len*/

	var common = __webpack_require__(16);
	var YAMLException = __webpack_require__(17);
	var Type = __webpack_require__(21);

	function compileList(schema, name, result) {
	  var exclude = [];

	  schema.include.forEach(function (includedSchema) {
	    result = compileList(includedSchema, name, result);
	  });

	  schema[name].forEach(function (currentType) {
	    result.forEach(function (previousType, previousIndex) {
	      if (previousType.tag === currentType.tag) {
	        exclude.push(previousIndex);
	      }
	    });

	    result.push(currentType);
	  });

	  return result.filter(function (type, index) {
	    return exclude.indexOf(index) === -1;
	  });
	}

	function compileMap() /* lists... */{
	  var result = {},
	      index,
	      length;

	  function collectType(type) {
	    result[type.tag] = type;
	  }

	  for (index = 0, length = arguments.length; index < length; index += 1) {
	    arguments[index].forEach(collectType);
	  }

	  return result;
	}

	function Schema(definition) {
	  this.include = definition.include || [];
	  this.implicit = definition.implicit || [];
	  this.explicit = definition.explicit || [];

	  this.implicit.forEach(function (type) {
	    if (type.loadKind && type.loadKind !== 'scalar') {
	      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
	    }
	  });

	  this.compiledImplicit = compileList(this, 'implicit', []);
	  this.compiledExplicit = compileList(this, 'explicit', []);
	  this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
	}

	Schema.DEFAULT = null;

	Schema.create = function createSchema() {
	  var schemas, types;

	  switch (arguments.length) {
	    case 1:
	      schemas = Schema.DEFAULT;
	      types = arguments[0];
	      break;

	    case 2:
	      schemas = arguments[0];
	      types = arguments[1];
	      break;

	    default:
	      throw new YAMLException('Wrong number of arguments for Schema.create function');
	  }

	  schemas = common.toArray(schemas);
	  types = common.toArray(types);

	  if (!schemas.every(function (schema) {
	    return schema instanceof Schema;
	  })) {
	    throw new YAMLException('Specified list of super schemas (or a single Schema object) contains a non-Schema object.');
	  }

	  if (!types.every(function (type) {
	    return type instanceof Type;
	  })) {
	    throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
	  }

	  return new Schema({
	    include: schemas,
	    explicit: types
	  });
	};

	module.exports = Schema;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var YAMLException = __webpack_require__(17);

	var TYPE_CONSTRUCTOR_OPTIONS = ['kind', 'resolve', 'construct', 'instanceOf', 'predicate', 'represent', 'defaultStyle', 'styleAliases'];

	var YAML_NODE_KINDS = ['scalar', 'sequence', 'mapping'];

	function compileStyleAliases(map) {
	  var result = {};

	  if (map !== null) {
	    Object.keys(map).forEach(function (style) {
	      map[style].forEach(function (alias) {
	        result[String(alias)] = style;
	      });
	    });
	  }

	  return result;
	}

	function Type(tag, options) {
	  options = options || {};

	  Object.keys(options).forEach(function (name) {
	    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
	      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
	    }
	  });

	  // TODO: Add tag format check.
	  this.tag = tag;
	  this.kind = options['kind'] || null;
	  this.resolve = options['resolve'] || function () {
	    return true;
	  };
	  this.construct = options['construct'] || function (data) {
	    return data;
	  };
	  this.instanceOf = options['instanceOf'] || null;
	  this.predicate = options['predicate'] || null;
	  this.represent = options['represent'] || null;
	  this.defaultStyle = options['defaultStyle'] || null;
	  this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

	  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
	    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
	  }
	}

	module.exports = Type;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// Standard YAML's Core schema.
	// http://www.yaml.org/spec/1.2/spec.html#id2804923
	//
	// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
	// So, Core schema has no distinctions from JSON schema is JS-YAML.

	'use strict';

	var Schema = __webpack_require__(20);

	module.exports = new Schema({
	  include: [__webpack_require__(23)]
	});

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	// Standard YAML's JSON schema.
	// http://www.yaml.org/spec/1.2/spec.html#id2803231
	//
	// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
	// So, this schema is not such strict as defined in the YAML specification.
	// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.

	'use strict';

	var Schema = __webpack_require__(20);

	module.exports = new Schema({
	  include: [__webpack_require__(24)],
	  implicit: [__webpack_require__(28), __webpack_require__(29), __webpack_require__(30), __webpack_require__(31)]
	});

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	// Standard YAML's Failsafe schema.
	// http://www.yaml.org/spec/1.2/spec.html#id2802346

	'use strict';

	var Schema = __webpack_require__(20);

	module.exports = new Schema({
	  explicit: [__webpack_require__(25), __webpack_require__(26), __webpack_require__(27)]
	});

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	module.exports = new Type('tag:yaml.org,2002:str', {
	  kind: 'scalar',
	  construct: function (data) {
	    return data !== null ? data : '';
	  }
	});

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	module.exports = new Type('tag:yaml.org,2002:seq', {
	  kind: 'sequence',
	  construct: function (data) {
	    return data !== null ? data : [];
	  }
	});

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	module.exports = new Type('tag:yaml.org,2002:map', {
	  kind: 'mapping',
	  construct: function (data) {
	    return data !== null ? data : {};
	  }
	});

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	function resolveYamlNull(data) {
	  if (data === null) return true;

	  var max = data.length;

	  return max === 1 && data === '~' || max === 4 && (data === 'null' || data === 'Null' || data === 'NULL');
	}

	function constructYamlNull() {
	  return null;
	}

	function isNull(object) {
	  return object === null;
	}

	module.exports = new Type('tag:yaml.org,2002:null', {
	  kind: 'scalar',
	  resolve: resolveYamlNull,
	  construct: constructYamlNull,
	  predicate: isNull,
	  represent: {
	    canonical: function () {
	      return '~';
	    },
	    lowercase: function () {
	      return 'null';
	    },
	    uppercase: function () {
	      return 'NULL';
	    },
	    camelcase: function () {
	      return 'Null';
	    }
	  },
	  defaultStyle: 'lowercase'
	});

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	function resolveYamlBoolean(data) {
	  if (data === null) return false;

	  var max = data.length;

	  return max === 4 && (data === 'true' || data === 'True' || data === 'TRUE') || max === 5 && (data === 'false' || data === 'False' || data === 'FALSE');
	}

	function constructYamlBoolean(data) {
	  return data === 'true' || data === 'True' || data === 'TRUE';
	}

	function isBoolean(object) {
	  return Object.prototype.toString.call(object) === '[object Boolean]';
	}

	module.exports = new Type('tag:yaml.org,2002:bool', {
	  kind: 'scalar',
	  resolve: resolveYamlBoolean,
	  construct: constructYamlBoolean,
	  predicate: isBoolean,
	  represent: {
	    lowercase: function (object) {
	      return object ? 'true' : 'false';
	    },
	    uppercase: function (object) {
	      return object ? 'TRUE' : 'FALSE';
	    },
	    camelcase: function (object) {
	      return object ? 'True' : 'False';
	    }
	  },
	  defaultStyle: 'lowercase'
	});

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var common = __webpack_require__(16);
	var Type = __webpack_require__(21);

	function isHexCode(c) {
	  return 0x30 /* 0 */ <= c && c <= 0x39 /* 9 */ || 0x41 /* A */ <= c && c <= 0x46 /* F */ || 0x61 /* a */ <= c && c <= 0x66 /* f */;
	}

	function isOctCode(c) {
	  return 0x30 /* 0 */ <= c && c <= 0x37 /* 7 */;
	}

	function isDecCode(c) {
	  return 0x30 /* 0 */ <= c && c <= 0x39 /* 9 */;
	}

	function resolveYamlInteger(data) {
	  if (data === null) return false;

	  var max = data.length,
	      index = 0,
	      hasDigits = false,
	      ch;

	  if (!max) return false;

	  ch = data[index];

	  // sign
	  if (ch === '-' || ch === '+') {
	    ch = data[++index];
	  }

	  if (ch === '0') {
	    // 0
	    if (index + 1 === max) return true;
	    ch = data[++index];

	    // base 2, base 8, base 16

	    if (ch === 'b') {
	      // base 2
	      index++;

	      for (; index < max; index++) {
	        ch = data[index];
	        if (ch === '_') continue;
	        if (ch !== '0' && ch !== '1') return false;
	        hasDigits = true;
	      }
	      return hasDigits;
	    }

	    if (ch === 'x') {
	      // base 16
	      index++;

	      for (; index < max; index++) {
	        ch = data[index];
	        if (ch === '_') continue;
	        if (!isHexCode(data.charCodeAt(index))) return false;
	        hasDigits = true;
	      }
	      return hasDigits;
	    }

	    // base 8
	    for (; index < max; index++) {
	      ch = data[index];
	      if (ch === '_') continue;
	      if (!isOctCode(data.charCodeAt(index))) return false;
	      hasDigits = true;
	    }
	    return hasDigits;
	  }

	  // base 10 (except 0) or base 60

	  for (; index < max; index++) {
	    ch = data[index];
	    if (ch === '_') continue;
	    if (ch === ':') break;
	    if (!isDecCode(data.charCodeAt(index))) {
	      return false;
	    }
	    hasDigits = true;
	  }

	  if (!hasDigits) return false;

	  // if !base60 - done;
	  if (ch !== ':') return true;

	  // base60 almost not used, no needs to optimize
	  return (/^(:[0-5]?[0-9])+$/.test(data.slice(index))
	  );
	}

	function constructYamlInteger(data) {
	  var value = data,
	      sign = 1,
	      ch,
	      base,
	      digits = [];

	  if (value.indexOf('_') !== -1) {
	    value = value.replace(/_/g, '');
	  }

	  ch = value[0];

	  if (ch === '-' || ch === '+') {
	    if (ch === '-') sign = -1;
	    value = value.slice(1);
	    ch = value[0];
	  }

	  if (value === '0') return 0;

	  if (ch === '0') {
	    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
	    if (value[1] === 'x') return sign * parseInt(value, 16);
	    return sign * parseInt(value, 8);
	  }

	  if (value.indexOf(':') !== -1) {
	    value.split(':').forEach(function (v) {
	      digits.unshift(parseInt(v, 10));
	    });

	    value = 0;
	    base = 1;

	    digits.forEach(function (d) {
	      value += d * base;
	      base *= 60;
	    });

	    return sign * value;
	  }

	  return sign * parseInt(value, 10);
	}

	function isInteger(object) {
	  return Object.prototype.toString.call(object) === '[object Number]' && object % 1 === 0 && !common.isNegativeZero(object);
	}

	module.exports = new Type('tag:yaml.org,2002:int', {
	  kind: 'scalar',
	  resolve: resolveYamlInteger,
	  construct: constructYamlInteger,
	  predicate: isInteger,
	  represent: {
	    binary: function (object) {
	      return '0b' + object.toString(2);
	    },
	    octal: function (object) {
	      return '0' + object.toString(8);
	    },
	    decimal: function (object) {
	      return object.toString(10);
	    },
	    hexadecimal: function (object) {
	      return '0x' + object.toString(16).toUpperCase();
	    }
	  },
	  defaultStyle: 'decimal',
	  styleAliases: {
	    binary: [2, 'bin'],
	    octal: [8, 'oct'],
	    decimal: [10, 'dec'],
	    hexadecimal: [16, 'hex']
	  }
	});

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var common = __webpack_require__(16);
	var Type = __webpack_require__(21);

	var YAML_FLOAT_PATTERN = new RegExp('^(?:[-+]?(?:[0-9][0-9_]*)\\.[0-9_]*(?:[eE][-+][0-9]+)?' + '|\\.[0-9_]+(?:[eE][-+][0-9]+)?' + '|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*' + '|[-+]?\\.(?:inf|Inf|INF)' + '|\\.(?:nan|NaN|NAN))$');

	function resolveYamlFloat(data) {
	  if (data === null) return false;

	  if (!YAML_FLOAT_PATTERN.test(data)) return false;

	  return true;
	}

	function constructYamlFloat(data) {
	  var value, sign, base, digits;

	  value = data.replace(/_/g, '').toLowerCase();
	  sign = value[0] === '-' ? -1 : 1;
	  digits = [];

	  if ('+-'.indexOf(value[0]) >= 0) {
	    value = value.slice(1);
	  }

	  if (value === '.inf') {
	    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
	  } else if (value === '.nan') {
	    return NaN;
	  } else if (value.indexOf(':') >= 0) {
	    value.split(':').forEach(function (v) {
	      digits.unshift(parseFloat(v, 10));
	    });

	    value = 0.0;
	    base = 1;

	    digits.forEach(function (d) {
	      value += d * base;
	      base *= 60;
	    });

	    return sign * value;
	  }
	  return sign * parseFloat(value, 10);
	}

	var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

	function representYamlFloat(object, style) {
	  var res;

	  if (isNaN(object)) {
	    switch (style) {
	      case 'lowercase':
	        return '.nan';
	      case 'uppercase':
	        return '.NAN';
	      case 'camelcase':
	        return '.NaN';
	    }
	  } else if (Number.POSITIVE_INFINITY === object) {
	    switch (style) {
	      case 'lowercase':
	        return '.inf';
	      case 'uppercase':
	        return '.INF';
	      case 'camelcase':
	        return '.Inf';
	    }
	  } else if (Number.NEGATIVE_INFINITY === object) {
	    switch (style) {
	      case 'lowercase':
	        return '-.inf';
	      case 'uppercase':
	        return '-.INF';
	      case 'camelcase':
	        return '-.Inf';
	    }
	  } else if (common.isNegativeZero(object)) {
	    return '-0.0';
	  }

	  res = object.toString(10);

	  // JS stringifier can build scientific format without dots: 5e-100,
	  // while YAML requres dot: 5.e-100. Fix it with simple hack

	  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
	}

	function isFloat(object) {
	  return Object.prototype.toString.call(object) === '[object Number]' && (object % 1 !== 0 || common.isNegativeZero(object));
	}

	module.exports = new Type('tag:yaml.org,2002:float', {
	  kind: 'scalar',
	  resolve: resolveYamlFloat,
	  construct: constructYamlFloat,
	  predicate: isFloat,
	  represent: representYamlFloat,
	  defaultStyle: 'lowercase'
	});

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	var YAML_DATE_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + // [1] year
	'-([0-9][0-9])' + // [2] month
	'-([0-9][0-9])$'); // [3] day

	var YAML_TIMESTAMP_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + // [1] year
	'-([0-9][0-9]?)' + // [2] month
	'-([0-9][0-9]?)' + // [3] day
	'(?:[Tt]|[ \\t]+)' + // ...
	'([0-9][0-9]?)' + // [4] hour
	':([0-9][0-9])' + // [5] minute
	':([0-9][0-9])' + // [6] second
	'(?:\\.([0-9]*))?' + // [7] fraction
	'(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
	'(?::([0-9][0-9]))?))?$'); // [11] tz_minute

	function resolveYamlTimestamp(data) {
	  if (data === null) return false;
	  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
	  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
	  return false;
	}

	function constructYamlTimestamp(data) {
	  var match,
	      year,
	      month,
	      day,
	      hour,
	      minute,
	      second,
	      fraction = 0,
	      delta = null,
	      tz_hour,
	      tz_minute,
	      date;

	  match = YAML_DATE_REGEXP.exec(data);
	  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

	  if (match === null) throw new Error('Date resolve error');

	  // match: [1] year [2] month [3] day

	  year = +match[1];
	  month = +match[2] - 1; // JS month starts with 0
	  day = +match[3];

	  if (!match[4]) {
	    // no hour
	    return new Date(Date.UTC(year, month, day));
	  }

	  // match: [4] hour [5] minute [6] second [7] fraction

	  hour = +match[4];
	  minute = +match[5];
	  second = +match[6];

	  if (match[7]) {
	    fraction = match[7].slice(0, 3);
	    while (fraction.length < 3) {
	      // milli-seconds
	      fraction += '0';
	    }
	    fraction = +fraction;
	  }

	  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

	  if (match[9]) {
	    tz_hour = +match[10];
	    tz_minute = +(match[11] || 0);
	    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
	    if (match[9] === '-') delta = -delta;
	  }

	  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

	  if (delta) date.setTime(date.getTime() - delta);

	  return date;
	}

	function representYamlTimestamp(object /*, style*/) {
	  return object.toISOString();
	}

	module.exports = new Type('tag:yaml.org,2002:timestamp', {
	  kind: 'scalar',
	  resolve: resolveYamlTimestamp,
	  construct: constructYamlTimestamp,
	  instanceOf: Date,
	  represent: representYamlTimestamp
	});

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	function resolveYamlMerge(data) {
	  return data === '<<' || data === null;
	}

	module.exports = new Type('tag:yaml.org,2002:merge', {
	  kind: 'scalar',
	  resolve: resolveYamlMerge
	});

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/*eslint-disable no-bitwise*/

	// A trick for browserified version.
	// Since we make browserifier to ignore `buffer` module, NodeBuffer will be undefined

	var NodeBuffer = __webpack_require__(35).Buffer;
	var Type = __webpack_require__(21);

	// [ 64, 65, 66 ] -> [ padding, CR, LF ]
	var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';

	function resolveYamlBinary(data) {
	  if (data === null) return false;

	  var code,
	      idx,
	      bitlen = 0,
	      max = data.length,
	      map = BASE64_MAP;

	  // Convert one by one.
	  for (idx = 0; idx < max; idx++) {
	    code = map.indexOf(data.charAt(idx));

	    // Skip CR/LF
	    if (code > 64) continue;

	    // Fail on illegal characters
	    if (code < 0) return false;

	    bitlen += 6;
	  }

	  // If there are any bits left, source was corrupted
	  return bitlen % 8 === 0;
	}

	function constructYamlBinary(data) {
	  var idx,
	      tailbits,
	      input = data.replace(/[\r\n=]/g, ''),
	      // remove CR/LF & padding to simplify scan
	  max = input.length,
	      map = BASE64_MAP,
	      bits = 0,
	      result = [];

	  // Collect by 6*4 bits (3 bytes)

	  for (idx = 0; idx < max; idx++) {
	    if (idx % 4 === 0 && idx) {
	      result.push(bits >> 16 & 0xFF);
	      result.push(bits >> 8 & 0xFF);
	      result.push(bits & 0xFF);
	    }

	    bits = bits << 6 | map.indexOf(input.charAt(idx));
	  }

	  // Dump tail

	  tailbits = max % 4 * 6;

	  if (tailbits === 0) {
	    result.push(bits >> 16 & 0xFF);
	    result.push(bits >> 8 & 0xFF);
	    result.push(bits & 0xFF);
	  } else if (tailbits === 18) {
	    result.push(bits >> 10 & 0xFF);
	    result.push(bits >> 2 & 0xFF);
	  } else if (tailbits === 12) {
	    result.push(bits >> 4 & 0xFF);
	  }

	  // Wrap into Buffer for NodeJS and leave Array for browser
	  if (NodeBuffer) return new NodeBuffer(result);

	  return result;
	}

	function representYamlBinary(object /*, style*/) {
	  var result = '',
	      bits = 0,
	      idx,
	      tail,
	      max = object.length,
	      map = BASE64_MAP;

	  // Convert every three bytes to 4 ASCII characters.

	  for (idx = 0; idx < max; idx++) {
	    if (idx % 3 === 0 && idx) {
	      result += map[bits >> 18 & 0x3F];
	      result += map[bits >> 12 & 0x3F];
	      result += map[bits >> 6 & 0x3F];
	      result += map[bits & 0x3F];
	    }

	    bits = (bits << 8) + object[idx];
	  }

	  // Dump tail

	  tail = max % 3;

	  if (tail === 0) {
	    result += map[bits >> 18 & 0x3F];
	    result += map[bits >> 12 & 0x3F];
	    result += map[bits >> 6 & 0x3F];
	    result += map[bits & 0x3F];
	  } else if (tail === 2) {
	    result += map[bits >> 10 & 0x3F];
	    result += map[bits >> 4 & 0x3F];
	    result += map[bits << 2 & 0x3F];
	    result += map[64];
	  } else if (tail === 1) {
	    result += map[bits >> 2 & 0x3F];
	    result += map[bits << 4 & 0x3F];
	    result += map[64];
	    result += map[64];
	  }

	  return result;
	}

	function isBinary(object) {
	  return NodeBuffer && NodeBuffer.isBuffer(object);
	}

	module.exports = new Type('tag:yaml.org,2002:binary', {
	  kind: 'scalar',
	  resolve: resolveYamlBinary,
	  construct: constructYamlBinary,
	  predicate: isBinary,
	  represent: representYamlBinary
	});

/***/ },
/* 35 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	var _hasOwnProperty = Object.prototype.hasOwnProperty;
	var _toString = Object.prototype.toString;

	function resolveYamlOmap(data) {
	  if (data === null) return true;

	  var objectKeys = [],
	      index,
	      length,
	      pair,
	      pairKey,
	      pairHasKey,
	      object = data;

	  for (index = 0, length = object.length; index < length; index += 1) {
	    pair = object[index];
	    pairHasKey = false;

	    if (_toString.call(pair) !== '[object Object]') return false;

	    for (pairKey in pair) {
	      if (_hasOwnProperty.call(pair, pairKey)) {
	        if (!pairHasKey) pairHasKey = true;else return false;
	      }
	    }

	    if (!pairHasKey) return false;

	    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);else return false;
	  }

	  return true;
	}

	function constructYamlOmap(data) {
	  return data !== null ? data : [];
	}

	module.exports = new Type('tag:yaml.org,2002:omap', {
	  kind: 'sequence',
	  resolve: resolveYamlOmap,
	  construct: constructYamlOmap
	});

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	var _toString = Object.prototype.toString;

	function resolveYamlPairs(data) {
	  if (data === null) return true;

	  var index,
	      length,
	      pair,
	      keys,
	      result,
	      object = data;

	  result = new Array(object.length);

	  for (index = 0, length = object.length; index < length; index += 1) {
	    pair = object[index];

	    if (_toString.call(pair) !== '[object Object]') return false;

	    keys = Object.keys(pair);

	    if (keys.length !== 1) return false;

	    result[index] = [keys[0], pair[keys[0]]];
	  }

	  return true;
	}

	function constructYamlPairs(data) {
	  if (data === null) return [];

	  var index,
	      length,
	      pair,
	      keys,
	      result,
	      object = data;

	  result = new Array(object.length);

	  for (index = 0, length = object.length; index < length; index += 1) {
	    pair = object[index];

	    keys = Object.keys(pair);

	    result[index] = [keys[0], pair[keys[0]]];
	  }

	  return result;
	}

	module.exports = new Type('tag:yaml.org,2002:pairs', {
	  kind: 'sequence',
	  resolve: resolveYamlPairs,
	  construct: constructYamlPairs
	});

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	var _hasOwnProperty = Object.prototype.hasOwnProperty;

	function resolveYamlSet(data) {
	  if (data === null) return true;

	  var key,
	      object = data;

	  for (key in object) {
	    if (_hasOwnProperty.call(object, key)) {
	      if (object[key] !== null) return false;
	    }
	  }

	  return true;
	}

	function constructYamlSet(data) {
	  return data !== null ? data : {};
	}

	module.exports = new Type('tag:yaml.org,2002:set', {
	  kind: 'mapping',
	  resolve: resolveYamlSet,
	  construct: constructYamlSet
	});

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	// JS-YAML's default schema for `load` function.
	// It is not described in the YAML specification.
	//
	// This schema is based on JS-YAML's default safe schema and includes
	// JavaScript-specific types: !!js/undefined, !!js/regexp and !!js/function.
	//
	// Also this schema is used as default base schema at `Schema.create` function.

	'use strict';

	var Schema = __webpack_require__(20);

	module.exports = Schema.DEFAULT = new Schema({
	  include: [__webpack_require__(19)],
	  explicit: [__webpack_require__(40), __webpack_require__(41), __webpack_require__(42)]
	});

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	function resolveJavascriptUndefined() {
	  return true;
	}

	function constructJavascriptUndefined() {
	  /*eslint-disable no-undefined*/
	  return undefined;
	}

	function representJavascriptUndefined() {
	  return '';
	}

	function isUndefined(object) {
	  return typeof object === 'undefined';
	}

	module.exports = new Type('tag:yaml.org,2002:js/undefined', {
	  kind: 'scalar',
	  resolve: resolveJavascriptUndefined,
	  construct: constructJavascriptUndefined,
	  predicate: isUndefined,
	  represent: representJavascriptUndefined
	});

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Type = __webpack_require__(21);

	function resolveJavascriptRegExp(data) {
	  if (data === null) return false;
	  if (data.length === 0) return false;

	  var regexp = data,
	      tail = /\/([gim]*)$/.exec(data),
	      modifiers = '';

	  // if regexp starts with '/' it can have modifiers and must be properly closed
	  // `/foo/gim` - modifiers tail can be maximum 3 chars
	  if (regexp[0] === '/') {
	    if (tail) modifiers = tail[1];

	    if (modifiers.length > 3) return false;
	    // if expression starts with /, is should be properly terminated
	    if (regexp[regexp.length - modifiers.length - 1] !== '/') return false;
	  }

	  return true;
	}

	function constructJavascriptRegExp(data) {
	  var regexp = data,
	      tail = /\/([gim]*)$/.exec(data),
	      modifiers = '';

	  // `/foo/gim` - tail can be maximum 4 chars
	  if (regexp[0] === '/') {
	    if (tail) modifiers = tail[1];
	    regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
	  }

	  return new RegExp(regexp, modifiers);
	}

	function representJavascriptRegExp(object /*, style*/) {
	  var result = '/' + object.source + '/';

	  if (object.global) result += 'g';
	  if (object.multiline) result += 'm';
	  if (object.ignoreCase) result += 'i';

	  return result;
	}

	function isRegExp(object) {
	  return Object.prototype.toString.call(object) === '[object RegExp]';
	}

	module.exports = new Type('tag:yaml.org,2002:js/regexp', {
	  kind: 'scalar',
	  resolve: resolveJavascriptRegExp,
	  construct: constructJavascriptRegExp,
	  predicate: isRegExp,
	  represent: representJavascriptRegExp
	});

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var require;'use strict';

	var esprima;

	// Browserified version does not have esprima
	//
	// 1. For node.js just require module as deps
	// 2. For browser try to require mudule via external AMD system.
	//    If not found - try to fallback to window.esprima. If not
	//    found too - then fail to parse.
	//
	try {
	  // workaround to exclude package from browserify list.
	  var _require = require;
	  esprima = __webpack_require__(43);
	} catch (_) {
	  /*global window */
	  if (typeof window !== 'undefined') esprima = window.esprima;
	}

	var Type = __webpack_require__(21);

	function resolveJavascriptFunction(data) {
	  if (data === null) return false;

	  try {
	    var source = '(' + data + ')',
	        ast = esprima.parse(source, { range: true });

	    if (ast.type !== 'Program' || ast.body.length !== 1 || ast.body[0].type !== 'ExpressionStatement' || ast.body[0].expression.type !== 'FunctionExpression') {
	      return false;
	    }

	    return true;
	  } catch (err) {
	    return false;
	  }
	}

	function constructJavascriptFunction(data) {
	  /*jslint evil:true*/

	  var source = '(' + data + ')',
	      ast = esprima.parse(source, { range: true }),
	      params = [],
	      body;

	  if (ast.type !== 'Program' || ast.body.length !== 1 || ast.body[0].type !== 'ExpressionStatement' || ast.body[0].expression.type !== 'FunctionExpression') {
	    throw new Error('Failed to resolve function');
	  }

	  ast.body[0].expression.params.forEach(function (param) {
	    params.push(param.name);
	  });

	  body = ast.body[0].expression.body.range;

	  // Esprima's ranges include the first '{' and the last '}' characters on
	  // function expressions. So cut them out.
	  /*eslint-disable no-new-func*/
	  return new Function(params, source.slice(body[0] + 1, body[1] - 1));
	}

	function representJavascriptFunction(object /*, style*/) {
	  return object.toString();
	}

	function isFunction(object) {
	  return Object.prototype.toString.call(object) === '[object Function]';
	}

	module.exports = new Type('tag:yaml.org,2002:js/function', {
	  kind: 'scalar',
	  resolve: resolveJavascriptFunction,
	  construct: constructJavascriptFunction,
	  predicate: isFunction,
	  represent: representJavascriptFunction
	});

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	  Copyright (c) jQuery Foundation, Inc. and Contributors, All Rights Reserved.

	  Redistribution and use in source and binary forms, with or without
	  modification, are permitted provided that the following conditions are met:

	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.

	  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
	  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/(function(root,factory){'use strict'; // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
	// Rhino, and plain browser loading.
	/* istanbul ignore next */if(true){!(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));}else if(typeof exports!=='undefined'){factory(exports);}else {factory(root.esprima={});}})(this,function(exports){'use strict';var Token,TokenName,FnExprTokens,Syntax,PlaceHolders,Messages,Regex,source,strict,index,lineNumber,lineStart,hasLineTerminator,lastIndex,lastLineNumber,lastLineStart,startIndex,startLineNumber,startLineStart,scanning,length,lookahead,state,extra,isBindingElement,isAssignmentTarget,firstCoverInitializedNameError;Token={BooleanLiteral:1,EOF:2,Identifier:3,Keyword:4,NullLiteral:5,NumericLiteral:6,Punctuator:7,StringLiteral:8,RegularExpression:9,Template:10};TokenName={};TokenName[Token.BooleanLiteral]='Boolean';TokenName[Token.EOF]='<end>';TokenName[Token.Identifier]='Identifier';TokenName[Token.Keyword]='Keyword';TokenName[Token.NullLiteral]='Null';TokenName[Token.NumericLiteral]='Numeric';TokenName[Token.Punctuator]='Punctuator';TokenName[Token.StringLiteral]='String';TokenName[Token.RegularExpression]='RegularExpression';TokenName[Token.Template]='Template'; // A function following one of those tokens is an expression.
	FnExprTokens=['(','{','[','in','typeof','instanceof','new','return','case','delete','throw','void', // assignment operators
	'=','+=','-=','*=','/=','%=','<<=','>>=','>>>=','&=','|=','^=',',', // binary/unary operators
	'+','-','*','/','%','++','--','<<','>>','>>>','&','|','^','!','~','&&','||','?',':','===','==','>=','<=','<','>','!=','!=='];Syntax={AssignmentExpression:'AssignmentExpression',AssignmentPattern:'AssignmentPattern',ArrayExpression:'ArrayExpression',ArrayPattern:'ArrayPattern',ArrowFunctionExpression:'ArrowFunctionExpression',BlockStatement:'BlockStatement',BinaryExpression:'BinaryExpression',BreakStatement:'BreakStatement',CallExpression:'CallExpression',CatchClause:'CatchClause',ClassBody:'ClassBody',ClassDeclaration:'ClassDeclaration',ClassExpression:'ClassExpression',ConditionalExpression:'ConditionalExpression',ContinueStatement:'ContinueStatement',DoWhileStatement:'DoWhileStatement',DebuggerStatement:'DebuggerStatement',EmptyStatement:'EmptyStatement',ExportAllDeclaration:'ExportAllDeclaration',ExportDefaultDeclaration:'ExportDefaultDeclaration',ExportNamedDeclaration:'ExportNamedDeclaration',ExportSpecifier:'ExportSpecifier',ExpressionStatement:'ExpressionStatement',ForStatement:'ForStatement',ForOfStatement:'ForOfStatement',ForInStatement:'ForInStatement',FunctionDeclaration:'FunctionDeclaration',FunctionExpression:'FunctionExpression',Identifier:'Identifier',IfStatement:'IfStatement',ImportDeclaration:'ImportDeclaration',ImportDefaultSpecifier:'ImportDefaultSpecifier',ImportNamespaceSpecifier:'ImportNamespaceSpecifier',ImportSpecifier:'ImportSpecifier',Literal:'Literal',LabeledStatement:'LabeledStatement',LogicalExpression:'LogicalExpression',MemberExpression:'MemberExpression',MetaProperty:'MetaProperty',MethodDefinition:'MethodDefinition',NewExpression:'NewExpression',ObjectExpression:'ObjectExpression',ObjectPattern:'ObjectPattern',Program:'Program',Property:'Property',RestElement:'RestElement',ReturnStatement:'ReturnStatement',SequenceExpression:'SequenceExpression',SpreadElement:'SpreadElement',Super:'Super',SwitchCase:'SwitchCase',SwitchStatement:'SwitchStatement',TaggedTemplateExpression:'TaggedTemplateExpression',TemplateElement:'TemplateElement',TemplateLiteral:'TemplateLiteral',ThisExpression:'ThisExpression',ThrowStatement:'ThrowStatement',TryStatement:'TryStatement',UnaryExpression:'UnaryExpression',UpdateExpression:'UpdateExpression',VariableDeclaration:'VariableDeclaration',VariableDeclarator:'VariableDeclarator',WhileStatement:'WhileStatement',WithStatement:'WithStatement',YieldExpression:'YieldExpression'};PlaceHolders={ArrowParameterPlaceHolder:'ArrowParameterPlaceHolder'}; // Error messages should be identical to V8.
	Messages={UnexpectedToken:'Unexpected token %0',UnexpectedNumber:'Unexpected number',UnexpectedString:'Unexpected string',UnexpectedIdentifier:'Unexpected identifier',UnexpectedReserved:'Unexpected reserved word',UnexpectedTemplate:'Unexpected quasi %0',UnexpectedEOS:'Unexpected end of input',NewlineAfterThrow:'Illegal newline after throw',InvalidRegExp:'Invalid regular expression',UnterminatedRegExp:'Invalid regular expression: missing /',InvalidLHSInAssignment:'Invalid left-hand side in assignment',InvalidLHSInForIn:'Invalid left-hand side in for-in',InvalidLHSInForLoop:'Invalid left-hand side in for-loop',MultipleDefaultsInSwitch:'More than one default clause in switch statement',NoCatchOrFinally:'Missing catch or finally after try',UnknownLabel:'Undefined label \'%0\'',Redeclaration:'%0 \'%1\' has already been declared',IllegalContinue:'Illegal continue statement',IllegalBreak:'Illegal break statement',IllegalReturn:'Illegal return statement',StrictModeWith:'Strict mode code may not include a with statement',StrictCatchVariable:'Catch variable may not be eval or arguments in strict mode',StrictVarName:'Variable name may not be eval or arguments in strict mode',StrictParamName:'Parameter name eval or arguments is not allowed in strict mode',StrictParamDupe:'Strict mode function may not have duplicate parameter names',StrictFunctionName:'Function name may not be eval or arguments in strict mode',StrictOctalLiteral:'Octal literals are not allowed in strict mode.',StrictDelete:'Delete of an unqualified identifier in strict mode.',StrictLHSAssignment:'Assignment to eval or arguments is not allowed in strict mode',StrictLHSPostfix:'Postfix increment/decrement may not have eval or arguments operand in strict mode',StrictLHSPrefix:'Prefix increment/decrement may not have eval or arguments operand in strict mode',StrictReservedWord:'Use of future reserved word in strict mode',TemplateOctalLiteral:'Octal literals are not allowed in template strings.',ParameterAfterRestParameter:'Rest parameter must be last formal parameter',DefaultRestParameter:'Unexpected token =',ObjectPatternAsRestParameter:'Unexpected token {',DuplicateProtoProperty:'Duplicate __proto__ fields are not allowed in object literals',ConstructorSpecialMethod:'Class constructor may not be an accessor',DuplicateConstructor:'A class may only have one constructor',StaticPrototype:'Classes may not have static property named prototype',MissingFromClause:'Unexpected token',NoAsAfterImportNamespace:'Unexpected token',InvalidModuleSpecifier:'Unexpected token',IllegalImportDeclaration:'Unexpected token',IllegalExportDeclaration:'Unexpected token',DuplicateBinding:'Duplicate binding %0'}; // See also tools/generate-unicode-regex.js.
	Regex={ // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierStart:
	NonAsciiIdentifierStart:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDE00-\uDE11\uDE13-\uDE2B\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDE00-\uDE2F\uDE44\uDE80-\uDEAA]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/, // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierPart:
	NonAsciiIdentifierPart:/[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDD0-\uDDDA\uDE00-\uDE11\uDE13-\uDE37\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF01-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/}; // Ensure the condition is true, otherwise throw an error.
	// This is only to have a better contract semantic, i.e. another safety net
	// to catch a logic error. The condition shall be fulfilled in normal case.
	// Do NOT use this to enforce a certain condition on any user input.
	function assert(condition,message){ /* istanbul ignore if */if(!condition){throw new Error('ASSERT: '+message);}}function isDecimalDigit(ch){return ch>=0x30&&ch<=0x39; // 0..9
	}function isHexDigit(ch){return '0123456789abcdefABCDEF'.indexOf(ch)>=0;}function isOctalDigit(ch){return '01234567'.indexOf(ch)>=0;}function octalToDecimal(ch){ // \0 is not octal escape sequence
	var octal=ch!=='0',code='01234567'.indexOf(ch);if(index<length&&isOctalDigit(source[index])){octal=true;code=code*8+'01234567'.indexOf(source[index++]); // 3 digits are only allowed when string starts
	// with 0, 1, 2, 3
	if('0123'.indexOf(ch)>=0&&index<length&&isOctalDigit(source[index])){code=code*8+'01234567'.indexOf(source[index++]);}}return {code:code,octal:octal};} // ECMA-262 11.2 White Space
	function isWhiteSpace(ch){return ch===0x20||ch===0x09||ch===0x0B||ch===0x0C||ch===0xA0||ch>=0x1680&&[0x1680,0x180E,0x2000,0x2001,0x2002,0x2003,0x2004,0x2005,0x2006,0x2007,0x2008,0x2009,0x200A,0x202F,0x205F,0x3000,0xFEFF].indexOf(ch)>=0;} // ECMA-262 11.3 Line Terminators
	function isLineTerminator(ch){return ch===0x0A||ch===0x0D||ch===0x2028||ch===0x2029;} // ECMA-262 11.6 Identifier Names and Identifiers
	function fromCodePoint(cp){return cp<0x10000?String.fromCharCode(cp):String.fromCharCode(0xD800+(cp-0x10000>>10))+String.fromCharCode(0xDC00+(cp-0x10000&1023));}function isIdentifierStart(ch){return ch===0x24||ch===0x5F|| // $ (dollar) and _ (underscore)
	ch>=0x41&&ch<=0x5A|| // A..Z
	ch>=0x61&&ch<=0x7A|| // a..z
	ch===0x5C|| // \ (backslash)
	ch>=0x80&&Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));}function isIdentifierPart(ch){return ch===0x24||ch===0x5F|| // $ (dollar) and _ (underscore)
	ch>=0x41&&ch<=0x5A|| // A..Z
	ch>=0x61&&ch<=0x7A|| // a..z
	ch>=0x30&&ch<=0x39|| // 0..9
	ch===0x5C|| // \ (backslash)
	ch>=0x80&&Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));} // ECMA-262 11.6.2.2 Future Reserved Words
	function isFutureReservedWord(id){switch(id){case 'enum':case 'export':case 'import':case 'super':return true;default:return false;}}function isStrictModeReservedWord(id){switch(id){case 'implements':case 'interface':case 'package':case 'private':case 'protected':case 'public':case 'static':case 'yield':case 'let':return true;default:return false;}}function isRestrictedWord(id){return id==='eval'||id==='arguments';} // ECMA-262 11.6.2.1 Keywords
	function isKeyword(id){switch(id.length){case 2:return id==='if'||id==='in'||id==='do';case 3:return id==='var'||id==='for'||id==='new'||id==='try'||id==='let';case 4:return id==='this'||id==='else'||id==='case'||id==='void'||id==='with'||id==='enum';case 5:return id==='while'||id==='break'||id==='catch'||id==='throw'||id==='const'||id==='yield'||id==='class'||id==='super';case 6:return id==='return'||id==='typeof'||id==='delete'||id==='switch'||id==='export'||id==='import';case 7:return id==='default'||id==='finally'||id==='extends';case 8:return id==='function'||id==='continue'||id==='debugger';case 10:return id==='instanceof';default:return false;}} // ECMA-262 11.4 Comments
	function addComment(type,value,start,end,loc){var comment;assert(typeof start==='number','Comment must have valid position');state.lastCommentStart=start;comment={type:type,value:value};if(extra.range){comment.range=[start,end];}if(extra.loc){comment.loc=loc;}extra.comments.push(comment);if(extra.attachComment){extra.leadingComments.push(comment);extra.trailingComments.push(comment);}if(extra.tokenize){comment.type=comment.type+'Comment';if(extra.delegate){comment=extra.delegate(comment);}extra.tokens.push(comment);}}function skipSingleLineComment(offset){var start,loc,ch,comment;start=index-offset;loc={start:{line:lineNumber,column:index-lineStart-offset}};while(index<length){ch=source.charCodeAt(index);++index;if(isLineTerminator(ch)){hasLineTerminator=true;if(extra.comments){comment=source.slice(start+offset,index-1);loc.end={line:lineNumber,column:index-lineStart-1};addComment('Line',comment,start,index-1,loc);}if(ch===13&&source.charCodeAt(index)===10){++index;}++lineNumber;lineStart=index;return;}}if(extra.comments){comment=source.slice(start+offset,index);loc.end={line:lineNumber,column:index-lineStart};addComment('Line',comment,start,index,loc);}}function skipMultiLineComment(){var start,loc,ch,comment;if(extra.comments){start=index-2;loc={start:{line:lineNumber,column:index-lineStart-2}};}while(index<length){ch=source.charCodeAt(index);if(isLineTerminator(ch)){if(ch===0x0D&&source.charCodeAt(index+1)===0x0A){++index;}hasLineTerminator=true;++lineNumber;++index;lineStart=index;}else if(ch===0x2A){ // Block comment ends with '*/'.
	if(source.charCodeAt(index+1)===0x2F){++index;++index;if(extra.comments){comment=source.slice(start+2,index-2);loc.end={line:lineNumber,column:index-lineStart};addComment('Block',comment,start,index,loc);}return;}++index;}else {++index;}} // Ran off the end of the file - the whole thing is a comment
	if(extra.comments){loc.end={line:lineNumber,column:index-lineStart};comment=source.slice(start+2,index);addComment('Block',comment,start,index,loc);}tolerateUnexpectedToken();}function skipComment(){var ch,start;hasLineTerminator=false;start=index===0;while(index<length){ch=source.charCodeAt(index);if(isWhiteSpace(ch)){++index;}else if(isLineTerminator(ch)){hasLineTerminator=true;++index;if(ch===0x0D&&source.charCodeAt(index)===0x0A){++index;}++lineNumber;lineStart=index;start=true;}else if(ch===0x2F){ // U+002F is '/'
	ch=source.charCodeAt(index+1);if(ch===0x2F){++index;++index;skipSingleLineComment(2);start=true;}else if(ch===0x2A){ // U+002A is '*'
	++index;++index;skipMultiLineComment();}else {break;}}else if(start&&ch===0x2D){ // U+002D is '-'
	// U+003E is '>'
	if(source.charCodeAt(index+1)===0x2D&&source.charCodeAt(index+2)===0x3E){ // '-->' is a single-line comment
	index+=3;skipSingleLineComment(3);}else {break;}}else if(ch===0x3C){ // U+003C is '<'
	if(source.slice(index+1,index+4)==='!--'){++index; // `<`
	++index; // `!`
	++index; // `-`
	++index; // `-`
	skipSingleLineComment(4);}else {break;}}else {break;}}}function scanHexEscape(prefix){var i,len,ch,code=0;len=prefix==='u'?4:2;for(i=0;i<len;++i){if(index<length&&isHexDigit(source[index])){ch=source[index++];code=code*16+'0123456789abcdef'.indexOf(ch.toLowerCase());}else {return '';}}return String.fromCharCode(code);}function scanUnicodeCodePointEscape(){var ch,code;ch=source[index];code=0; // At least, one hex digit is required.
	if(ch==='}'){throwUnexpectedToken();}while(index<length){ch=source[index++];if(!isHexDigit(ch)){break;}code=code*16+'0123456789abcdef'.indexOf(ch.toLowerCase());}if(code>0x10FFFF||ch!=='}'){throwUnexpectedToken();}return fromCodePoint(code);}function codePointAt(i){var cp,first,second;cp=source.charCodeAt(i);if(cp>=0xD800&&cp<=0xDBFF){second=source.charCodeAt(i+1);if(second>=0xDC00&&second<=0xDFFF){first=cp;cp=(first-0xD800)*0x400+second-0xDC00+0x10000;}}return cp;}function getComplexIdentifier(){var cp,ch,id;cp=codePointAt(index);id=fromCodePoint(cp);index+=id.length; // '\u' (U+005C, U+0075) denotes an escaped character.
	if(cp===0x5C){if(source.charCodeAt(index)!==0x75){throwUnexpectedToken();}++index;if(source[index]==='{'){++index;ch=scanUnicodeCodePointEscape();}else {ch=scanHexEscape('u');cp=ch.charCodeAt(0);if(!ch||ch==='\\'||!isIdentifierStart(cp)){throwUnexpectedToken();}}id=ch;}while(index<length){cp=codePointAt(index);if(!isIdentifierPart(cp)){break;}ch=fromCodePoint(cp);id+=ch;index+=ch.length; // '\u' (U+005C, U+0075) denotes an escaped character.
	if(cp===0x5C){id=id.substr(0,id.length-1);if(source.charCodeAt(index)!==0x75){throwUnexpectedToken();}++index;if(source[index]==='{'){++index;ch=scanUnicodeCodePointEscape();}else {ch=scanHexEscape('u');cp=ch.charCodeAt(0);if(!ch||ch==='\\'||!isIdentifierPart(cp)){throwUnexpectedToken();}}id+=ch;}}return id;}function getIdentifier(){var start,ch;start=index++;while(index<length){ch=source.charCodeAt(index);if(ch===0x5C){ // Blackslash (U+005C) marks Unicode escape sequence.
	index=start;return getComplexIdentifier();}else if(ch>=0xD800&&ch<0xDFFF){ // Need to handle surrogate pairs.
	index=start;return getComplexIdentifier();}if(isIdentifierPart(ch)){++index;}else {break;}}return source.slice(start,index);}function scanIdentifier(){var start,id,type;start=index; // Backslash (U+005C) starts an escaped character.
	id=source.charCodeAt(index)===0x5C?getComplexIdentifier():getIdentifier(); // There is no keyword or literal with only one character.
	// Thus, it must be an identifier.
	if(id.length===1){type=Token.Identifier;}else if(isKeyword(id)){type=Token.Keyword;}else if(id==='null'){type=Token.NullLiteral;}else if(id==='true'||id==='false'){type=Token.BooleanLiteral;}else {type=Token.Identifier;}return {type:type,value:id,lineNumber:lineNumber,lineStart:lineStart,start:start,end:index};} // ECMA-262 11.7 Punctuators
	function scanPunctuator(){var token,str;token={type:Token.Punctuator,value:'',lineNumber:lineNumber,lineStart:lineStart,start:index,end:index}; // Check for most common single-character punctuators.
	str=source[index];switch(str){case '(':if(extra.tokenize){extra.openParenToken=extra.tokenValues.length;}++index;break;case '{':if(extra.tokenize){extra.openCurlyToken=extra.tokenValues.length;}state.curlyStack.push('{');++index;break;case '.':++index;if(source[index]==='.'&&source[index+1]==='.'){ // Spread operator: ...
	index+=2;str='...';}break;case '}':++index;state.curlyStack.pop();break;case ')':case ';':case ',':case '[':case ']':case ':':case '?':case '~':++index;break;default: // 4-character punctuator.
	str=source.substr(index,4);if(str==='>>>='){index+=4;}else { // 3-character punctuators.
	str=str.substr(0,3);if(str==='==='||str==='!=='||str==='>>>'||str==='<<='||str==='>>='){index+=3;}else { // 2-character punctuators.
	str=str.substr(0,2);if(str==='&&'||str==='||'||str==='=='||str==='!='||str==='+='||str==='-='||str==='*='||str==='/='||str==='++'||str==='--'||str==='<<'||str==='>>'||str==='&='||str==='|='||str==='^='||str==='%='||str==='<='||str==='>='||str==='=>'){index+=2;}else { // 1-character punctuators.
	str=source[index];if('<>=!+-*%&|^/'.indexOf(str)>=0){++index;}}}}}if(index===token.start){throwUnexpectedToken();}token.end=index;token.value=str;return token;} // ECMA-262 11.8.3 Numeric Literals
	function scanHexLiteral(start){var number='';while(index<length){if(!isHexDigit(source[index])){break;}number+=source[index++];}if(number.length===0){throwUnexpectedToken();}if(isIdentifierStart(source.charCodeAt(index))){throwUnexpectedToken();}return {type:Token.NumericLiteral,value:parseInt('0x'+number,16),lineNumber:lineNumber,lineStart:lineStart,start:start,end:index};}function scanBinaryLiteral(start){var ch,number;number='';while(index<length){ch=source[index];if(ch!=='0'&&ch!=='1'){break;}number+=source[index++];}if(number.length===0){ // only 0b or 0B
	throwUnexpectedToken();}if(index<length){ch=source.charCodeAt(index); /* istanbul ignore else */if(isIdentifierStart(ch)||isDecimalDigit(ch)){throwUnexpectedToken();}}return {type:Token.NumericLiteral,value:parseInt(number,2),lineNumber:lineNumber,lineStart:lineStart,start:start,end:index};}function scanOctalLiteral(prefix,start){var number,octal;if(isOctalDigit(prefix)){octal=true;number='0'+source[index++];}else {octal=false;++index;number='';}while(index<length){if(!isOctalDigit(source[index])){break;}number+=source[index++];}if(!octal&&number.length===0){ // only 0o or 0O
	throwUnexpectedToken();}if(isIdentifierStart(source.charCodeAt(index))||isDecimalDigit(source.charCodeAt(index))){throwUnexpectedToken();}return {type:Token.NumericLiteral,value:parseInt(number,8),octal:octal,lineNumber:lineNumber,lineStart:lineStart,start:start,end:index};}function isImplicitOctalLiteral(){var i,ch; // Implicit octal, unless there is a non-octal digit.
	// (Annex B.1.1 on Numeric Literals)
	for(i=index+1;i<length;++i){ch=source[i];if(ch==='8'||ch==='9'){return false;}if(!isOctalDigit(ch)){return true;}}return true;}function scanNumericLiteral(){var number,start,ch;ch=source[index];assert(isDecimalDigit(ch.charCodeAt(0))||ch==='.','Numeric literal must start with a decimal digit or a decimal point');start=index;number='';if(ch!=='.'){number=source[index++];ch=source[index]; // Hex number starts with '0x'.
	// Octal number starts with '0'.
	// Octal number in ES6 starts with '0o'.
	// Binary number in ES6 starts with '0b'.
	if(number==='0'){if(ch==='x'||ch==='X'){++index;return scanHexLiteral(start);}if(ch==='b'||ch==='B'){++index;return scanBinaryLiteral(start);}if(ch==='o'||ch==='O'){return scanOctalLiteral(ch,start);}if(isOctalDigit(ch)){if(isImplicitOctalLiteral()){return scanOctalLiteral(ch,start);}}}while(isDecimalDigit(source.charCodeAt(index))){number+=source[index++];}ch=source[index];}if(ch==='.'){number+=source[index++];while(isDecimalDigit(source.charCodeAt(index))){number+=source[index++];}ch=source[index];}if(ch==='e'||ch==='E'){number+=source[index++];ch=source[index];if(ch==='+'||ch==='-'){number+=source[index++];}if(isDecimalDigit(source.charCodeAt(index))){while(isDecimalDigit(source.charCodeAt(index))){number+=source[index++];}}else {throwUnexpectedToken();}}if(isIdentifierStart(source.charCodeAt(index))){throwUnexpectedToken();}return {type:Token.NumericLiteral,value:parseFloat(number),lineNumber:lineNumber,lineStart:lineStart,start:start,end:index};} // ECMA-262 11.8.4 String Literals
	function scanStringLiteral(){var str='',quote,start,ch,unescaped,octToDec,octal=false;quote=source[index];assert(quote==='\''||quote==='"','String literal must starts with a quote');start=index;++index;while(index<length){ch=source[index++];if(ch===quote){quote='';break;}else if(ch==='\\'){ch=source[index++];if(!ch||!isLineTerminator(ch.charCodeAt(0))){switch(ch){case 'u':case 'x':if(source[index]==='{'){++index;str+=scanUnicodeCodePointEscape();}else {unescaped=scanHexEscape(ch);if(!unescaped){throw throwUnexpectedToken();}str+=unescaped;}break;case 'n':str+='\n';break;case 'r':str+='\r';break;case 't':str+='\t';break;case 'b':str+='\b';break;case 'f':str+='\f';break;case 'v':str+='\x0B';break;case '8':case '9':str+=ch;tolerateUnexpectedToken();break;default:if(isOctalDigit(ch)){octToDec=octalToDecimal(ch);octal=octToDec.octal||octal;str+=String.fromCharCode(octToDec.code);}else {str+=ch;}break;}}else {++lineNumber;if(ch==='\r'&&source[index]==='\n'){++index;}lineStart=index;}}else if(isLineTerminator(ch.charCodeAt(0))){break;}else {str+=ch;}}if(quote!==''){index=start;throwUnexpectedToken();}return {type:Token.StringLiteral,value:str,octal:octal,lineNumber:startLineNumber,lineStart:startLineStart,start:start,end:index};} // ECMA-262 11.8.6 Template Literal Lexical Components
	function scanTemplate(){var cooked='',ch,start,rawOffset,terminated,head,tail,restore,unescaped;terminated=false;tail=false;start=index;head=source[index]==='`';rawOffset=2;++index;while(index<length){ch=source[index++];if(ch==='`'){rawOffset=1;tail=true;terminated=true;break;}else if(ch==='$'){if(source[index]==='{'){state.curlyStack.push('${');++index;terminated=true;break;}cooked+=ch;}else if(ch==='\\'){ch=source[index++];if(!isLineTerminator(ch.charCodeAt(0))){switch(ch){case 'n':cooked+='\n';break;case 'r':cooked+='\r';break;case 't':cooked+='\t';break;case 'u':case 'x':if(source[index]==='{'){++index;cooked+=scanUnicodeCodePointEscape();}else {restore=index;unescaped=scanHexEscape(ch);if(unescaped){cooked+=unescaped;}else {index=restore;cooked+=ch;}}break;case 'b':cooked+='\b';break;case 'f':cooked+='\f';break;case 'v':cooked+='\v';break;default:if(ch==='0'){if(isDecimalDigit(source.charCodeAt(index))){ // Illegal: \01 \02 and so on
	throwError(Messages.TemplateOctalLiteral);}cooked+='\0';}else if(isOctalDigit(ch)){ // Illegal: \1 \2
	throwError(Messages.TemplateOctalLiteral);}else {cooked+=ch;}break;}}else {++lineNumber;if(ch==='\r'&&source[index]==='\n'){++index;}lineStart=index;}}else if(isLineTerminator(ch.charCodeAt(0))){++lineNumber;if(ch==='\r'&&source[index]==='\n'){++index;}lineStart=index;cooked+='\n';}else {cooked+=ch;}}if(!terminated){throwUnexpectedToken();}if(!head){state.curlyStack.pop();}return {type:Token.Template,value:{cooked:cooked,raw:source.slice(start+1,index-rawOffset)},head:head,tail:tail,lineNumber:lineNumber,lineStart:lineStart,start:start,end:index};} // ECMA-262 11.8.5 Regular Expression Literals
	function testRegExp(pattern,flags){ // The BMP character to use as a replacement for astral symbols when
	// translating an ES6 "u"-flagged pattern to an ES5-compatible
	// approximation.
	// Note: replacing with '\uFFFF' enables false positives in unlikely
	// scenarios. For example, `[\u{1044f}-\u{10440}]` is an invalid
	// pattern that would not be detected by this substitution.
	var astralSubstitute='\uFFFF',tmp=pattern;if(flags.indexOf('u')>=0){tmp=tmp // Replace every Unicode escape sequence with the equivalent
	// BMP character or a constant ASCII code point in the case of
	// astral symbols. (See the above note on `astralSubstitute`
	// for more information.)
	.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g,function($0,$1,$2){var codePoint=parseInt($1||$2,16);if(codePoint>0x10FFFF){throwUnexpectedToken(null,Messages.InvalidRegExp);}if(codePoint<=0xFFFF){return String.fromCharCode(codePoint);}return astralSubstitute;}) // Replace each paired surrogate with a single ASCII symbol to
	// avoid throwing on regular expressions that are only valid in
	// combination with the "u" flag.
	.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,astralSubstitute);} // First, detect invalid regular expressions.
	try{RegExp(tmp);}catch(e){throwUnexpectedToken(null,Messages.InvalidRegExp);} // Return a regular expression object for this pattern-flag pair, or
	// `null` in case the current environment doesn't support the flags it
	// uses.
	try{return new RegExp(pattern,flags);}catch(exception){return null;}}function scanRegExpBody(){var ch,str,classMarker,terminated,body;ch=source[index];assert(ch==='/','Regular expression literal must start with a slash');str=source[index++];classMarker=false;terminated=false;while(index<length){ch=source[index++];str+=ch;if(ch==='\\'){ch=source[index++]; // ECMA-262 7.8.5
	if(isLineTerminator(ch.charCodeAt(0))){throwUnexpectedToken(null,Messages.UnterminatedRegExp);}str+=ch;}else if(isLineTerminator(ch.charCodeAt(0))){throwUnexpectedToken(null,Messages.UnterminatedRegExp);}else if(classMarker){if(ch===']'){classMarker=false;}}else {if(ch==='/'){terminated=true;break;}else if(ch==='['){classMarker=true;}}}if(!terminated){throwUnexpectedToken(null,Messages.UnterminatedRegExp);} // Exclude leading and trailing slash.
	body=str.substr(1,str.length-2);return {value:body,literal:str};}function scanRegExpFlags(){var ch,str,flags,restore;str='';flags='';while(index<length){ch=source[index];if(!isIdentifierPart(ch.charCodeAt(0))){break;}++index;if(ch==='\\'&&index<length){ch=source[index];if(ch==='u'){++index;restore=index;ch=scanHexEscape('u');if(ch){flags+=ch;for(str+='\\u';restore<index;++restore){str+=source[restore];}}else {index=restore;flags+='u';str+='\\u';}tolerateUnexpectedToken();}else {str+='\\';tolerateUnexpectedToken();}}else {flags+=ch;str+=ch;}}return {value:flags,literal:str};}function scanRegExp(){var start,body,flags,value;scanning=true;lookahead=null;skipComment();start=index;body=scanRegExpBody();flags=scanRegExpFlags();value=testRegExp(body.value,flags.value);scanning=false;if(extra.tokenize){return {type:Token.RegularExpression,value:value,regex:{pattern:body.value,flags:flags.value},lineNumber:lineNumber,lineStart:lineStart,start:start,end:index};}return {literal:body.literal+flags.literal,value:value,regex:{pattern:body.value,flags:flags.value},start:start,end:index};}function collectRegex(){var pos,loc,regex,token;skipComment();pos=index;loc={start:{line:lineNumber,column:index-lineStart}};regex=scanRegExp();loc.end={line:lineNumber,column:index-lineStart}; /* istanbul ignore next */if(!extra.tokenize){ // Pop the previous token, which is likely '/' or '/='
	if(extra.tokens.length>0){token=extra.tokens[extra.tokens.length-1];if(token.range[0]===pos&&token.type==='Punctuator'){if(token.value==='/'||token.value==='/='){extra.tokens.pop();}}}extra.tokens.push({type:'RegularExpression',value:regex.literal,regex:regex.regex,range:[pos,index],loc:loc});}return regex;}function isIdentifierName(token){return token.type===Token.Identifier||token.type===Token.Keyword||token.type===Token.BooleanLiteral||token.type===Token.NullLiteral;} // Using the following algorithm:
	// https://github.com/mozilla/sweet.js/wiki/design
	function advanceSlash(){var regex,previous,check;function testKeyword(value){return value&&value.length>1&&value[0]>='a'&&value[0]<='z';}previous=extra.tokenValues[extra.tokens.length-1];regex=previous!==null;switch(previous){case 'this':case ']':regex=false;break;case ')':check=extra.tokenValues[extra.openParenToken-1];regex=check==='if'||check==='while'||check==='for'||check==='with';break;case '}': // Dividing a function by anything makes little sense,
	// but we have to check for that.
	regex=false;if(testKeyword(extra.tokenValues[extra.openCurlyToken-3])){ // Anonymous function, e.g. function(){} /42
	check=extra.tokenValues[extra.openCurlyToken-4];regex=check?FnExprTokens.indexOf(check)<0:false;}else if(testKeyword(extra.tokenValues[extra.openCurlyToken-4])){ // Named function, e.g. function f(){} /42/
	check=extra.tokenValues[extra.openCurlyToken-5];regex=check?FnExprTokens.indexOf(check)<0:true;}}return regex?collectRegex():scanPunctuator();}function advance(){var cp,token;if(index>=length){return {type:Token.EOF,lineNumber:lineNumber,lineStart:lineStart,start:index,end:index};}cp=source.charCodeAt(index);if(isIdentifierStart(cp)){token=scanIdentifier();if(strict&&isStrictModeReservedWord(token.value)){token.type=Token.Keyword;}return token;} // Very common: ( and ) and ;
	if(cp===0x28||cp===0x29||cp===0x3B){return scanPunctuator();} // String literal starts with single quote (U+0027) or double quote (U+0022).
	if(cp===0x27||cp===0x22){return scanStringLiteral();} // Dot (.) U+002E can also start a floating-point number, hence the need
	// to check the next character.
	if(cp===0x2E){if(isDecimalDigit(source.charCodeAt(index+1))){return scanNumericLiteral();}return scanPunctuator();}if(isDecimalDigit(cp)){return scanNumericLiteral();} // Slash (/) U+002F can also start a regex.
	if(extra.tokenize&&cp===0x2F){return advanceSlash();} // Template literals start with ` (U+0060) for template head
	// or } (U+007D) for template middle or template tail.
	if(cp===0x60||cp===0x7D&&state.curlyStack[state.curlyStack.length-1]==='${'){return scanTemplate();} // Possible identifier start in a surrogate pair.
	if(cp>=0xD800&&cp<0xDFFF){cp=codePointAt(index);if(isIdentifierStart(cp)){return scanIdentifier();}}return scanPunctuator();}function collectToken(){var loc,token,value,entry;loc={start:{line:lineNumber,column:index-lineStart}};token=advance();loc.end={line:lineNumber,column:index-lineStart};if(token.type!==Token.EOF){value=source.slice(token.start,token.end);entry={type:TokenName[token.type],value:value,range:[token.start,token.end],loc:loc};if(token.regex){entry.regex={pattern:token.regex.pattern,flags:token.regex.flags};}if(extra.tokenValues){extra.tokenValues.push(entry.type==='Punctuator'||entry.type==='Keyword'?entry.value:null);}if(extra.tokenize){if(!extra.range){delete entry.range;}if(!extra.loc){delete entry.loc;}if(extra.delegate){entry=extra.delegate(entry);}}extra.tokens.push(entry);}return token;}function lex(){var token;scanning=true;lastIndex=index;lastLineNumber=lineNumber;lastLineStart=lineStart;skipComment();token=lookahead;startIndex=index;startLineNumber=lineNumber;startLineStart=lineStart;lookahead=typeof extra.tokens!=='undefined'?collectToken():advance();scanning=false;return token;}function peek(){scanning=true;skipComment();lastIndex=index;lastLineNumber=lineNumber;lastLineStart=lineStart;startIndex=index;startLineNumber=lineNumber;startLineStart=lineStart;lookahead=typeof extra.tokens!=='undefined'?collectToken():advance();scanning=false;}function Position(){this.line=startLineNumber;this.column=startIndex-startLineStart;}function SourceLocation(){this.start=new Position();this.end=null;}function WrappingSourceLocation(startToken){this.start={line:startToken.lineNumber,column:startToken.start-startToken.lineStart};this.end=null;}function Node(){if(extra.range){this.range=[startIndex,0];}if(extra.loc){this.loc=new SourceLocation();}}function WrappingNode(startToken){if(extra.range){this.range=[startToken.start,0];}if(extra.loc){this.loc=new WrappingSourceLocation(startToken);}}WrappingNode.prototype=Node.prototype={processComment:function(){var lastChild,innerComments,leadingComments,trailingComments,bottomRight=extra.bottomRightStack,i,comment,last=bottomRight[bottomRight.length-1];if(this.type===Syntax.Program){if(this.body.length>0){return;}} /**
	             * patch innnerComments for properties empty block
	             * `function a() {/** comments **\/}`
	             */if(this.type===Syntax.BlockStatement&&this.body.length===0){innerComments=[];for(i=extra.leadingComments.length-1;i>=0;--i){comment=extra.leadingComments[i];if(this.range[1]>=comment.range[1]){innerComments.unshift(comment);extra.leadingComments.splice(i,1);extra.trailingComments.splice(i,1);}}if(innerComments.length){this.innerComments=innerComments; //bottomRight.push(this);
	return;}}if(extra.trailingComments.length>0){trailingComments=[];for(i=extra.trailingComments.length-1;i>=0;--i){comment=extra.trailingComments[i];if(comment.range[0]>=this.range[1]){trailingComments.unshift(comment);extra.trailingComments.splice(i,1);}}extra.trailingComments=[];}else {if(last&&last.trailingComments&&last.trailingComments[0].range[0]>=this.range[1]){trailingComments=last.trailingComments;delete last.trailingComments;}} // Eating the stack.
	while(last&&last.range[0]>=this.range[0]){lastChild=bottomRight.pop();last=bottomRight[bottomRight.length-1];}if(lastChild){if(lastChild.leadingComments){leadingComments=[];for(i=lastChild.leadingComments.length-1;i>=0;--i){comment=lastChild.leadingComments[i];if(comment.range[1]<=this.range[0]){leadingComments.unshift(comment);lastChild.leadingComments.splice(i,1);}}if(!lastChild.leadingComments.length){lastChild.leadingComments=undefined;}}}else if(extra.leadingComments.length>0){leadingComments=[];for(i=extra.leadingComments.length-1;i>=0;--i){comment=extra.leadingComments[i];if(comment.range[1]<=this.range[0]){leadingComments.unshift(comment);extra.leadingComments.splice(i,1);}}}if(leadingComments&&leadingComments.length>0){this.leadingComments=leadingComments;}if(trailingComments&&trailingComments.length>0){this.trailingComments=trailingComments;}bottomRight.push(this);},finish:function(){if(extra.range){this.range[1]=lastIndex;}if(extra.loc){this.loc.end={line:lastLineNumber,column:lastIndex-lastLineStart};if(extra.source){this.loc.source=extra.source;}}if(extra.attachComment){this.processComment();}},finishArrayExpression:function(elements){this.type=Syntax.ArrayExpression;this.elements=elements;this.finish();return this;},finishArrayPattern:function(elements){this.type=Syntax.ArrayPattern;this.elements=elements;this.finish();return this;},finishArrowFunctionExpression:function(params,defaults,body,expression){this.type=Syntax.ArrowFunctionExpression;this.id=null;this.params=params;this.defaults=defaults;this.body=body;this.generator=false;this.expression=expression;this.finish();return this;},finishAssignmentExpression:function(operator,left,right){this.type=Syntax.AssignmentExpression;this.operator=operator;this.left=left;this.right=right;this.finish();return this;},finishAssignmentPattern:function(left,right){this.type=Syntax.AssignmentPattern;this.left=left;this.right=right;this.finish();return this;},finishBinaryExpression:function(operator,left,right){this.type=operator==='||'||operator==='&&'?Syntax.LogicalExpression:Syntax.BinaryExpression;this.operator=operator;this.left=left;this.right=right;this.finish();return this;},finishBlockStatement:function(body){this.type=Syntax.BlockStatement;this.body=body;this.finish();return this;},finishBreakStatement:function(label){this.type=Syntax.BreakStatement;this.label=label;this.finish();return this;},finishCallExpression:function(callee,args){this.type=Syntax.CallExpression;this.callee=callee;this.arguments=args;this.finish();return this;},finishCatchClause:function(param,body){this.type=Syntax.CatchClause;this.param=param;this.body=body;this.finish();return this;},finishClassBody:function(body){this.type=Syntax.ClassBody;this.body=body;this.finish();return this;},finishClassDeclaration:function(id,superClass,body){this.type=Syntax.ClassDeclaration;this.id=id;this.superClass=superClass;this.body=body;this.finish();return this;},finishClassExpression:function(id,superClass,body){this.type=Syntax.ClassExpression;this.id=id;this.superClass=superClass;this.body=body;this.finish();return this;},finishConditionalExpression:function(test,consequent,alternate){this.type=Syntax.ConditionalExpression;this.test=test;this.consequent=consequent;this.alternate=alternate;this.finish();return this;},finishContinueStatement:function(label){this.type=Syntax.ContinueStatement;this.label=label;this.finish();return this;},finishDebuggerStatement:function(){this.type=Syntax.DebuggerStatement;this.finish();return this;},finishDoWhileStatement:function(body,test){this.type=Syntax.DoWhileStatement;this.body=body;this.test=test;this.finish();return this;},finishEmptyStatement:function(){this.type=Syntax.EmptyStatement;this.finish();return this;},finishExpressionStatement:function(expression){this.type=Syntax.ExpressionStatement;this.expression=expression;this.finish();return this;},finishForStatement:function(init,test,update,body){this.type=Syntax.ForStatement;this.init=init;this.test=test;this.update=update;this.body=body;this.finish();return this;},finishForOfStatement:function(left,right,body){this.type=Syntax.ForOfStatement;this.left=left;this.right=right;this.body=body;this.finish();return this;},finishForInStatement:function(left,right,body){this.type=Syntax.ForInStatement;this.left=left;this.right=right;this.body=body;this.each=false;this.finish();return this;},finishFunctionDeclaration:function(id,params,defaults,body,generator){this.type=Syntax.FunctionDeclaration;this.id=id;this.params=params;this.defaults=defaults;this.body=body;this.generator=generator;this.expression=false;this.finish();return this;},finishFunctionExpression:function(id,params,defaults,body,generator){this.type=Syntax.FunctionExpression;this.id=id;this.params=params;this.defaults=defaults;this.body=body;this.generator=generator;this.expression=false;this.finish();return this;},finishIdentifier:function(name){this.type=Syntax.Identifier;this.name=name;this.finish();return this;},finishIfStatement:function(test,consequent,alternate){this.type=Syntax.IfStatement;this.test=test;this.consequent=consequent;this.alternate=alternate;this.finish();return this;},finishLabeledStatement:function(label,body){this.type=Syntax.LabeledStatement;this.label=label;this.body=body;this.finish();return this;},finishLiteral:function(token){this.type=Syntax.Literal;this.value=token.value;this.raw=source.slice(token.start,token.end);if(token.regex){this.regex=token.regex;}this.finish();return this;},finishMemberExpression:function(accessor,object,property){this.type=Syntax.MemberExpression;this.computed=accessor==='[';this.object=object;this.property=property;this.finish();return this;},finishMetaProperty:function(meta,property){this.type=Syntax.MetaProperty;this.meta=meta;this.property=property;this.finish();return this;},finishNewExpression:function(callee,args){this.type=Syntax.NewExpression;this.callee=callee;this.arguments=args;this.finish();return this;},finishObjectExpression:function(properties){this.type=Syntax.ObjectExpression;this.properties=properties;this.finish();return this;},finishObjectPattern:function(properties){this.type=Syntax.ObjectPattern;this.properties=properties;this.finish();return this;},finishPostfixExpression:function(operator,argument){this.type=Syntax.UpdateExpression;this.operator=operator;this.argument=argument;this.prefix=false;this.finish();return this;},finishProgram:function(body,sourceType){this.type=Syntax.Program;this.body=body;this.sourceType=sourceType;this.finish();return this;},finishProperty:function(kind,key,computed,value,method,shorthand){this.type=Syntax.Property;this.key=key;this.computed=computed;this.value=value;this.kind=kind;this.method=method;this.shorthand=shorthand;this.finish();return this;},finishRestElement:function(argument){this.type=Syntax.RestElement;this.argument=argument;this.finish();return this;},finishReturnStatement:function(argument){this.type=Syntax.ReturnStatement;this.argument=argument;this.finish();return this;},finishSequenceExpression:function(expressions){this.type=Syntax.SequenceExpression;this.expressions=expressions;this.finish();return this;},finishSpreadElement:function(argument){this.type=Syntax.SpreadElement;this.argument=argument;this.finish();return this;},finishSwitchCase:function(test,consequent){this.type=Syntax.SwitchCase;this.test=test;this.consequent=consequent;this.finish();return this;},finishSuper:function(){this.type=Syntax.Super;this.finish();return this;},finishSwitchStatement:function(discriminant,cases){this.type=Syntax.SwitchStatement;this.discriminant=discriminant;this.cases=cases;this.finish();return this;},finishTaggedTemplateExpression:function(tag,quasi){this.type=Syntax.TaggedTemplateExpression;this.tag=tag;this.quasi=quasi;this.finish();return this;},finishTemplateElement:function(value,tail){this.type=Syntax.TemplateElement;this.value=value;this.tail=tail;this.finish();return this;},finishTemplateLiteral:function(quasis,expressions){this.type=Syntax.TemplateLiteral;this.quasis=quasis;this.expressions=expressions;this.finish();return this;},finishThisExpression:function(){this.type=Syntax.ThisExpression;this.finish();return this;},finishThrowStatement:function(argument){this.type=Syntax.ThrowStatement;this.argument=argument;this.finish();return this;},finishTryStatement:function(block,handler,finalizer){this.type=Syntax.TryStatement;this.block=block;this.guardedHandlers=[];this.handlers=handler?[handler]:[];this.handler=handler;this.finalizer=finalizer;this.finish();return this;},finishUnaryExpression:function(operator,argument){this.type=operator==='++'||operator==='--'?Syntax.UpdateExpression:Syntax.UnaryExpression;this.operator=operator;this.argument=argument;this.prefix=true;this.finish();return this;},finishVariableDeclaration:function(declarations){this.type=Syntax.VariableDeclaration;this.declarations=declarations;this.kind='var';this.finish();return this;},finishLexicalDeclaration:function(declarations,kind){this.type=Syntax.VariableDeclaration;this.declarations=declarations;this.kind=kind;this.finish();return this;},finishVariableDeclarator:function(id,init){this.type=Syntax.VariableDeclarator;this.id=id;this.init=init;this.finish();return this;},finishWhileStatement:function(test,body){this.type=Syntax.WhileStatement;this.test=test;this.body=body;this.finish();return this;},finishWithStatement:function(object,body){this.type=Syntax.WithStatement;this.object=object;this.body=body;this.finish();return this;},finishExportSpecifier:function(local,exported){this.type=Syntax.ExportSpecifier;this.exported=exported||local;this.local=local;this.finish();return this;},finishImportDefaultSpecifier:function(local){this.type=Syntax.ImportDefaultSpecifier;this.local=local;this.finish();return this;},finishImportNamespaceSpecifier:function(local){this.type=Syntax.ImportNamespaceSpecifier;this.local=local;this.finish();return this;},finishExportNamedDeclaration:function(declaration,specifiers,src){this.type=Syntax.ExportNamedDeclaration;this.declaration=declaration;this.specifiers=specifiers;this.source=src;this.finish();return this;},finishExportDefaultDeclaration:function(declaration){this.type=Syntax.ExportDefaultDeclaration;this.declaration=declaration;this.finish();return this;},finishExportAllDeclaration:function(src){this.type=Syntax.ExportAllDeclaration;this.source=src;this.finish();return this;},finishImportSpecifier:function(local,imported){this.type=Syntax.ImportSpecifier;this.local=local||imported;this.imported=imported;this.finish();return this;},finishImportDeclaration:function(specifiers,src){this.type=Syntax.ImportDeclaration;this.specifiers=specifiers;this.source=src;this.finish();return this;},finishYieldExpression:function(argument,delegate){this.type=Syntax.YieldExpression;this.argument=argument;this.delegate=delegate;this.finish();return this;}};function recordError(error){var e,existing;for(e=0;e<extra.errors.length;e++){existing=extra.errors[e]; // Prevent duplicated error.
	/* istanbul ignore next */if(existing.index===error.index&&existing.message===error.message){return;}}extra.errors.push(error);}function constructError(msg,column){var error=new Error(msg);try{throw error;}catch(base){ /* istanbul ignore else */if(Object.create&&Object.defineProperty){error=Object.create(base);Object.defineProperty(error,'column',{value:column});}}finally {return error;}}function createError(line,pos,description){var msg,column,error;msg='Line '+line+': '+description;column=pos-(scanning?lineStart:lastLineStart)+1;error=constructError(msg,column);error.lineNumber=line;error.description=description;error.index=pos;return error;} // Throw an exception
	function throwError(messageFormat){var args,msg;args=Array.prototype.slice.call(arguments,1);msg=messageFormat.replace(/%(\d)/g,function(whole,idx){assert(idx<args.length,'Message reference must be in range');return args[idx];});throw createError(lastLineNumber,lastIndex,msg);}function tolerateError(messageFormat){var args,msg,error;args=Array.prototype.slice.call(arguments,1); /* istanbul ignore next */msg=messageFormat.replace(/%(\d)/g,function(whole,idx){assert(idx<args.length,'Message reference must be in range');return args[idx];});error=createError(lineNumber,lastIndex,msg);if(extra.errors){recordError(error);}else {throw error;}} // Throw an exception because of the token.
	function unexpectedTokenError(token,message){var value,msg=message||Messages.UnexpectedToken;if(token){if(!message){msg=token.type===Token.EOF?Messages.UnexpectedEOS:token.type===Token.Identifier?Messages.UnexpectedIdentifier:token.type===Token.NumericLiteral?Messages.UnexpectedNumber:token.type===Token.StringLiteral?Messages.UnexpectedString:token.type===Token.Template?Messages.UnexpectedTemplate:Messages.UnexpectedToken;if(token.type===Token.Keyword){if(isFutureReservedWord(token.value)){msg=Messages.UnexpectedReserved;}else if(strict&&isStrictModeReservedWord(token.value)){msg=Messages.StrictReservedWord;}}}value=token.type===Token.Template?token.value.raw:token.value;}else {value='ILLEGAL';}msg=msg.replace('%0',value);return token&&typeof token.lineNumber==='number'?createError(token.lineNumber,token.start,msg):createError(scanning?lineNumber:lastLineNumber,scanning?index:lastIndex,msg);}function throwUnexpectedToken(token,message){throw unexpectedTokenError(token,message);}function tolerateUnexpectedToken(token,message){var error=unexpectedTokenError(token,message);if(extra.errors){recordError(error);}else {throw error;}} // Expect the next token to match the specified punctuator.
	// If not, an exception will be thrown.
	function expect(value){var token=lex();if(token.type!==Token.Punctuator||token.value!==value){throwUnexpectedToken(token);}} /**
	     * @name expectCommaSeparator
	     * @description Quietly expect a comma when in tolerant mode, otherwise delegates
	     * to <code>expect(value)</code>
	     * @since 2.0
	     */function expectCommaSeparator(){var token;if(extra.errors){token=lookahead;if(token.type===Token.Punctuator&&token.value===','){lex();}else if(token.type===Token.Punctuator&&token.value===';'){lex();tolerateUnexpectedToken(token);}else {tolerateUnexpectedToken(token,Messages.UnexpectedToken);}}else {expect(',');}} // Expect the next token to match the specified keyword.
	// If not, an exception will be thrown.
	function expectKeyword(keyword){var token=lex();if(token.type!==Token.Keyword||token.value!==keyword){throwUnexpectedToken(token);}} // Return true if the next token matches the specified punctuator.
	function match(value){return lookahead.type===Token.Punctuator&&lookahead.value===value;} // Return true if the next token matches the specified keyword
	function matchKeyword(keyword){return lookahead.type===Token.Keyword&&lookahead.value===keyword;} // Return true if the next token matches the specified contextual keyword
	// (where an identifier is sometimes a keyword depending on the context)
	function matchContextualKeyword(keyword){return lookahead.type===Token.Identifier&&lookahead.value===keyword;} // Return true if the next token is an assignment operator
	function matchAssign(){var op;if(lookahead.type!==Token.Punctuator){return false;}op=lookahead.value;return op==='='||op==='*='||op==='/='||op==='%='||op==='+='||op==='-='||op==='<<='||op==='>>='||op==='>>>='||op==='&='||op==='^='||op==='|=';}function consumeSemicolon(){ // Catch the very common case first: immediately a semicolon (U+003B).
	if(source.charCodeAt(startIndex)===0x3B||match(';')){lex();return;}if(hasLineTerminator){return;} // FIXME(ikarienator): this is seemingly an issue in the previous location info convention.
	lastIndex=startIndex;lastLineNumber=startLineNumber;lastLineStart=startLineStart;if(lookahead.type!==Token.EOF&&!match('}')){throwUnexpectedToken(lookahead);}} // Cover grammar support.
	//
	// When an assignment expression position starts with an left parenthesis, the determination of the type
	// of the syntax is to be deferred arbitrarily long until the end of the parentheses pair (plus a lookahead)
	// or the first comma. This situation also defers the determination of all the expressions nested in the pair.
	//
	// There are three productions that can be parsed in a parentheses pair that needs to be determined
	// after the outermost pair is closed. They are:
	//
	//   1. AssignmentExpression
	//   2. BindingElements
	//   3. AssignmentTargets
	//
	// In order to avoid exponential backtracking, we use two flags to denote if the production can be
	// binding element or assignment target.
	//
	// The three productions have the relationship:
	//
	//   BindingElements ⊆ AssignmentTargets ⊆ AssignmentExpression
	//
	// with a single exception that CoverInitializedName when used directly in an Expression, generates
	// an early error. Therefore, we need the third state, firstCoverInitializedNameError, to track the
	// first usage of CoverInitializedName and report it when we reached the end of the parentheses pair.
	//
	// isolateCoverGrammar function runs the given parser function with a new cover grammar context, and it does not
	// effect the current flags. This means the production the parser parses is only used as an expression. Therefore
	// the CoverInitializedName check is conducted.
	//
	// inheritCoverGrammar function runs the given parse function with a new cover grammar context, and it propagates
	// the flags outside of the parser. This means the production the parser parses is used as a part of a potential
	// pattern. The CoverInitializedName check is deferred.
	function isolateCoverGrammar(parser){var oldIsBindingElement=isBindingElement,oldIsAssignmentTarget=isAssignmentTarget,oldFirstCoverInitializedNameError=firstCoverInitializedNameError,result;isBindingElement=true;isAssignmentTarget=true;firstCoverInitializedNameError=null;result=parser();if(firstCoverInitializedNameError!==null){throwUnexpectedToken(firstCoverInitializedNameError);}isBindingElement=oldIsBindingElement;isAssignmentTarget=oldIsAssignmentTarget;firstCoverInitializedNameError=oldFirstCoverInitializedNameError;return result;}function inheritCoverGrammar(parser){var oldIsBindingElement=isBindingElement,oldIsAssignmentTarget=isAssignmentTarget,oldFirstCoverInitializedNameError=firstCoverInitializedNameError,result;isBindingElement=true;isAssignmentTarget=true;firstCoverInitializedNameError=null;result=parser();isBindingElement=isBindingElement&&oldIsBindingElement;isAssignmentTarget=isAssignmentTarget&&oldIsAssignmentTarget;firstCoverInitializedNameError=oldFirstCoverInitializedNameError||firstCoverInitializedNameError;return result;} // ECMA-262 13.3.3 Destructuring Binding Patterns
	function parseArrayPattern(params,kind){var node=new Node(),elements=[],rest,restNode;expect('[');while(!match(']')){if(match(',')){lex();elements.push(null);}else {if(match('...')){restNode=new Node();lex();params.push(lookahead);rest=parseVariableIdentifier(kind);elements.push(restNode.finishRestElement(rest));break;}else {elements.push(parsePatternWithDefault(params,kind));}if(!match(']')){expect(',');}}}expect(']');return node.finishArrayPattern(elements);}function parsePropertyPattern(params,kind){var node=new Node(),key,keyToken,computed=match('['),init;if(lookahead.type===Token.Identifier){keyToken=lookahead;key=parseVariableIdentifier();if(match('=')){params.push(keyToken);lex();init=parseAssignmentExpression();return node.finishProperty('init',key,false,new WrappingNode(keyToken).finishAssignmentPattern(key,init),false,true);}else if(!match(':')){params.push(keyToken);return node.finishProperty('init',key,false,key,false,true);}}else {key=parseObjectPropertyKey();}expect(':');init=parsePatternWithDefault(params,kind);return node.finishProperty('init',key,computed,init,false,false);}function parseObjectPattern(params,kind){var node=new Node(),properties=[];expect('{');while(!match('}')){properties.push(parsePropertyPattern(params,kind));if(!match('}')){expect(',');}}lex();return node.finishObjectPattern(properties);}function parsePattern(params,kind){if(match('[')){return parseArrayPattern(params,kind);}else if(match('{')){return parseObjectPattern(params,kind);}else if(matchKeyword('let')){if(kind==='const'||kind==='let'){tolerateUnexpectedToken(lookahead,Messages.UnexpectedToken);}}params.push(lookahead);return parseVariableIdentifier(kind);}function parsePatternWithDefault(params,kind){var startToken=lookahead,pattern,previousAllowYield,right;pattern=parsePattern(params,kind);if(match('=')){lex();previousAllowYield=state.allowYield;state.allowYield=true;right=isolateCoverGrammar(parseAssignmentExpression);state.allowYield=previousAllowYield;pattern=new WrappingNode(startToken).finishAssignmentPattern(pattern,right);}return pattern;} // ECMA-262 12.2.5 Array Initializer
	function parseArrayInitializer(){var elements=[],node=new Node(),restSpread;expect('[');while(!match(']')){if(match(',')){lex();elements.push(null);}else if(match('...')){restSpread=new Node();lex();restSpread.finishSpreadElement(inheritCoverGrammar(parseAssignmentExpression));if(!match(']')){isAssignmentTarget=isBindingElement=false;expect(',');}elements.push(restSpread);}else {elements.push(inheritCoverGrammar(parseAssignmentExpression));if(!match(']')){expect(',');}}}lex();return node.finishArrayExpression(elements);} // ECMA-262 12.2.6 Object Initializer
	function parsePropertyFunction(node,paramInfo,isGenerator){var previousStrict,body;isAssignmentTarget=isBindingElement=false;previousStrict=strict;body=isolateCoverGrammar(parseFunctionSourceElements);if(strict&&paramInfo.firstRestricted){tolerateUnexpectedToken(paramInfo.firstRestricted,paramInfo.message);}if(strict&&paramInfo.stricted){tolerateUnexpectedToken(paramInfo.stricted,paramInfo.message);}strict=previousStrict;return node.finishFunctionExpression(null,paramInfo.params,paramInfo.defaults,body,isGenerator);}function parsePropertyMethodFunction(){var params,method,node=new Node(),previousAllowYield=state.allowYield;state.allowYield=false;params=parseParams();state.allowYield=previousAllowYield;state.allowYield=false;method=parsePropertyFunction(node,params,false);state.allowYield=previousAllowYield;return method;}function parseObjectPropertyKey(){var token,node=new Node(),expr;token=lex(); // Note: This function is called only from parseObjectProperty(), where
	// EOF and Punctuator tokens are already filtered out.
	switch(token.type){case Token.StringLiteral:case Token.NumericLiteral:if(strict&&token.octal){tolerateUnexpectedToken(token,Messages.StrictOctalLiteral);}return node.finishLiteral(token);case Token.Identifier:case Token.BooleanLiteral:case Token.NullLiteral:case Token.Keyword:return node.finishIdentifier(token.value);case Token.Punctuator:if(token.value==='['){expr=isolateCoverGrammar(parseAssignmentExpression);expect(']');return expr;}break;}throwUnexpectedToken(token);}function lookaheadPropertyName(){switch(lookahead.type){case Token.Identifier:case Token.StringLiteral:case Token.BooleanLiteral:case Token.NullLiteral:case Token.NumericLiteral:case Token.Keyword:return true;case Token.Punctuator:return lookahead.value==='[';}return false;} // This function is to try to parse a MethodDefinition as defined in 14.3. But in the case of object literals,
	// it might be called at a position where there is in fact a short hand identifier pattern or a data property.
	// This can only be determined after we consumed up to the left parentheses.
	//
	// In order to avoid back tracking, it returns `null` if the position is not a MethodDefinition and the caller
	// is responsible to visit other options.
	function tryParseMethodDefinition(token,key,computed,node){var value,options,methodNode,params,previousAllowYield=state.allowYield;if(token.type===Token.Identifier){ // check for `get` and `set`;
	if(token.value==='get'&&lookaheadPropertyName()){computed=match('[');key=parseObjectPropertyKey();methodNode=new Node();expect('(');expect(')');state.allowYield=false;value=parsePropertyFunction(methodNode,{params:[],defaults:[],stricted:null,firstRestricted:null,message:null},false);state.allowYield=previousAllowYield;return node.finishProperty('get',key,computed,value,false,false);}else if(token.value==='set'&&lookaheadPropertyName()){computed=match('[');key=parseObjectPropertyKey();methodNode=new Node();expect('(');options={params:[],defaultCount:0,defaults:[],firstRestricted:null,paramSet:{}};if(match(')')){tolerateUnexpectedToken(lookahead);}else {state.allowYield=false;parseParam(options);state.allowYield=previousAllowYield;if(options.defaultCount===0){options.defaults=[];}}expect(')');state.allowYield=false;value=parsePropertyFunction(methodNode,options,false);state.allowYield=previousAllowYield;return node.finishProperty('set',key,computed,value,false,false);}}else if(token.type===Token.Punctuator&&token.value==='*'&&lookaheadPropertyName()){computed=match('[');key=parseObjectPropertyKey();methodNode=new Node();state.allowYield=true;params=parseParams();state.allowYield=previousAllowYield;state.allowYield=false;value=parsePropertyFunction(methodNode,params,true);state.allowYield=previousAllowYield;return node.finishProperty('init',key,computed,value,true,false);}if(key&&match('(')){value=parsePropertyMethodFunction();return node.finishProperty('init',key,computed,value,true,false);} // Not a MethodDefinition.
	return null;}function parseObjectProperty(hasProto){var token=lookahead,node=new Node(),computed,key,maybeMethod,proto,value;computed=match('[');if(match('*')){lex();}else {key=parseObjectPropertyKey();}maybeMethod=tryParseMethodDefinition(token,key,computed,node);if(maybeMethod){return maybeMethod;}if(!key){throwUnexpectedToken(lookahead);} // Check for duplicated __proto__
	if(!computed){proto=key.type===Syntax.Identifier&&key.name==='__proto__'||key.type===Syntax.Literal&&key.value==='__proto__';if(hasProto.value&&proto){tolerateError(Messages.DuplicateProtoProperty);}hasProto.value|=proto;}if(match(':')){lex();value=inheritCoverGrammar(parseAssignmentExpression);return node.finishProperty('init',key,computed,value,false,false);}if(token.type===Token.Identifier){if(match('=')){firstCoverInitializedNameError=lookahead;lex();value=isolateCoverGrammar(parseAssignmentExpression);return node.finishProperty('init',key,computed,new WrappingNode(token).finishAssignmentPattern(key,value),false,true);}return node.finishProperty('init',key,computed,key,false,true);}throwUnexpectedToken(lookahead);}function parseObjectInitializer(){var properties=[],hasProto={value:false},node=new Node();expect('{');while(!match('}')){properties.push(parseObjectProperty(hasProto));if(!match('}')){expectCommaSeparator();}}expect('}');return node.finishObjectExpression(properties);}function reinterpretExpressionAsPattern(expr){var i;switch(expr.type){case Syntax.Identifier:case Syntax.MemberExpression:case Syntax.RestElement:case Syntax.AssignmentPattern:break;case Syntax.SpreadElement:expr.type=Syntax.RestElement;reinterpretExpressionAsPattern(expr.argument);break;case Syntax.ArrayExpression:expr.type=Syntax.ArrayPattern;for(i=0;i<expr.elements.length;i++){if(expr.elements[i]!==null){reinterpretExpressionAsPattern(expr.elements[i]);}}break;case Syntax.ObjectExpression:expr.type=Syntax.ObjectPattern;for(i=0;i<expr.properties.length;i++){reinterpretExpressionAsPattern(expr.properties[i].value);}break;case Syntax.AssignmentExpression:expr.type=Syntax.AssignmentPattern;reinterpretExpressionAsPattern(expr.left);break;default: // Allow other node type for tolerant parsing.
	break;}} // ECMA-262 12.2.9 Template Literals
	function parseTemplateElement(option){var node,token;if(lookahead.type!==Token.Template||option.head&&!lookahead.head){throwUnexpectedToken();}node=new Node();token=lex();return node.finishTemplateElement({raw:token.value.raw,cooked:token.value.cooked},token.tail);}function parseTemplateLiteral(){var quasi,quasis,expressions,node=new Node();quasi=parseTemplateElement({head:true});quasis=[quasi];expressions=[];while(!quasi.tail){expressions.push(parseExpression());quasi=parseTemplateElement({head:false});quasis.push(quasi);}return node.finishTemplateLiteral(quasis,expressions);} // ECMA-262 12.2.10 The Grouping Operator
	function parseGroupExpression(){var expr,expressions,startToken,i,params=[];expect('(');if(match(')')){lex();if(!match('=>')){expect('=>');}return {type:PlaceHolders.ArrowParameterPlaceHolder,params:[],rawParams:[]};}startToken=lookahead;if(match('...')){expr=parseRestElement(params);expect(')');if(!match('=>')){expect('=>');}return {type:PlaceHolders.ArrowParameterPlaceHolder,params:[expr]};}isBindingElement=true;expr=inheritCoverGrammar(parseAssignmentExpression);if(match(',')){isAssignmentTarget=false;expressions=[expr];while(startIndex<length){if(!match(',')){break;}lex();if(match('...')){if(!isBindingElement){throwUnexpectedToken(lookahead);}expressions.push(parseRestElement(params));expect(')');if(!match('=>')){expect('=>');}isBindingElement=false;for(i=0;i<expressions.length;i++){reinterpretExpressionAsPattern(expressions[i]);}return {type:PlaceHolders.ArrowParameterPlaceHolder,params:expressions};}expressions.push(inheritCoverGrammar(parseAssignmentExpression));}expr=new WrappingNode(startToken).finishSequenceExpression(expressions);}expect(')');if(match('=>')){if(expr.type===Syntax.Identifier&&expr.name==='yield'){return {type:PlaceHolders.ArrowParameterPlaceHolder,params:[expr]};}if(!isBindingElement){throwUnexpectedToken(lookahead);}if(expr.type===Syntax.SequenceExpression){for(i=0;i<expr.expressions.length;i++){reinterpretExpressionAsPattern(expr.expressions[i]);}}else {reinterpretExpressionAsPattern(expr);}expr={type:PlaceHolders.ArrowParameterPlaceHolder,params:expr.type===Syntax.SequenceExpression?expr.expressions:[expr]};}isBindingElement=false;return expr;} // ECMA-262 12.2 Primary Expressions
	function parsePrimaryExpression(){var type,token,expr,node;if(match('(')){isBindingElement=false;return inheritCoverGrammar(parseGroupExpression);}if(match('[')){return inheritCoverGrammar(parseArrayInitializer);}if(match('{')){return inheritCoverGrammar(parseObjectInitializer);}type=lookahead.type;node=new Node();if(type===Token.Identifier){if(state.sourceType==='module'&&lookahead.value==='await'){tolerateUnexpectedToken(lookahead);}expr=node.finishIdentifier(lex().value);}else if(type===Token.StringLiteral||type===Token.NumericLiteral){isAssignmentTarget=isBindingElement=false;if(strict&&lookahead.octal){tolerateUnexpectedToken(lookahead,Messages.StrictOctalLiteral);}expr=node.finishLiteral(lex());}else if(type===Token.Keyword){if(!strict&&state.allowYield&&matchKeyword('yield')){return parseNonComputedProperty();}if(!strict&&matchKeyword('let')){return node.finishIdentifier(lex().value);}isAssignmentTarget=isBindingElement=false;if(matchKeyword('function')){return parseFunctionExpression();}if(matchKeyword('this')){lex();return node.finishThisExpression();}if(matchKeyword('class')){return parseClassExpression();}throwUnexpectedToken(lex());}else if(type===Token.BooleanLiteral){isAssignmentTarget=isBindingElement=false;token=lex();token.value=token.value==='true';expr=node.finishLiteral(token);}else if(type===Token.NullLiteral){isAssignmentTarget=isBindingElement=false;token=lex();token.value=null;expr=node.finishLiteral(token);}else if(match('/')||match('/=')){isAssignmentTarget=isBindingElement=false;index=startIndex;if(typeof extra.tokens!=='undefined'){token=collectRegex();}else {token=scanRegExp();}lex();expr=node.finishLiteral(token);}else if(type===Token.Template){expr=parseTemplateLiteral();}else {throwUnexpectedToken(lex());}return expr;} // ECMA-262 12.3 Left-Hand-Side Expressions
	function parseArguments(){var args=[],expr;expect('(');if(!match(')')){while(startIndex<length){if(match('...')){expr=new Node();lex();expr.finishSpreadElement(isolateCoverGrammar(parseAssignmentExpression));}else {expr=isolateCoverGrammar(parseAssignmentExpression);}args.push(expr);if(match(')')){break;}expectCommaSeparator();}}expect(')');return args;}function parseNonComputedProperty(){var token,node=new Node();token=lex();if(!isIdentifierName(token)){throwUnexpectedToken(token);}return node.finishIdentifier(token.value);}function parseNonComputedMember(){expect('.');return parseNonComputedProperty();}function parseComputedMember(){var expr;expect('[');expr=isolateCoverGrammar(parseExpression);expect(']');return expr;} // ECMA-262 12.3.3 The new Operator
	function parseNewExpression(){var callee,args,node=new Node();expectKeyword('new');if(match('.')){lex();if(lookahead.type===Token.Identifier&&lookahead.value==='target'){if(state.inFunctionBody){lex();return node.finishMetaProperty('new','target');}}throwUnexpectedToken(lookahead);}callee=isolateCoverGrammar(parseLeftHandSideExpression);args=match('(')?parseArguments():[];isAssignmentTarget=isBindingElement=false;return node.finishNewExpression(callee,args);} // ECMA-262 12.3.4 Function Calls
	function parseLeftHandSideExpressionAllowCall(){var quasi,expr,args,property,startToken,previousAllowIn=state.allowIn;startToken=lookahead;state.allowIn=true;if(matchKeyword('super')&&state.inFunctionBody){expr=new Node();lex();expr=expr.finishSuper();if(!match('(')&&!match('.')&&!match('[')){throwUnexpectedToken(lookahead);}}else {expr=inheritCoverGrammar(matchKeyword('new')?parseNewExpression:parsePrimaryExpression);}for(;;){if(match('.')){isBindingElement=false;isAssignmentTarget=true;property=parseNonComputedMember();expr=new WrappingNode(startToken).finishMemberExpression('.',expr,property);}else if(match('(')){isBindingElement=false;isAssignmentTarget=false;args=parseArguments();expr=new WrappingNode(startToken).finishCallExpression(expr,args);}else if(match('[')){isBindingElement=false;isAssignmentTarget=true;property=parseComputedMember();expr=new WrappingNode(startToken).finishMemberExpression('[',expr,property);}else if(lookahead.type===Token.Template&&lookahead.head){quasi=parseTemplateLiteral();expr=new WrappingNode(startToken).finishTaggedTemplateExpression(expr,quasi);}else {break;}}state.allowIn=previousAllowIn;return expr;} // ECMA-262 12.3 Left-Hand-Side Expressions
	function parseLeftHandSideExpression(){var quasi,expr,property,startToken;assert(state.allowIn,'callee of new expression always allow in keyword.');startToken=lookahead;if(matchKeyword('super')&&state.inFunctionBody){expr=new Node();lex();expr=expr.finishSuper();if(!match('[')&&!match('.')){throwUnexpectedToken(lookahead);}}else {expr=inheritCoverGrammar(matchKeyword('new')?parseNewExpression:parsePrimaryExpression);}for(;;){if(match('[')){isBindingElement=false;isAssignmentTarget=true;property=parseComputedMember();expr=new WrappingNode(startToken).finishMemberExpression('[',expr,property);}else if(match('.')){isBindingElement=false;isAssignmentTarget=true;property=parseNonComputedMember();expr=new WrappingNode(startToken).finishMemberExpression('.',expr,property);}else if(lookahead.type===Token.Template&&lookahead.head){quasi=parseTemplateLiteral();expr=new WrappingNode(startToken).finishTaggedTemplateExpression(expr,quasi);}else {break;}}return expr;} // ECMA-262 12.4 Postfix Expressions
	function parsePostfixExpression(){var expr,token,startToken=lookahead;expr=inheritCoverGrammar(parseLeftHandSideExpressionAllowCall);if(!hasLineTerminator&&lookahead.type===Token.Punctuator){if(match('++')||match('--')){ // ECMA-262 11.3.1, 11.3.2
	if(strict&&expr.type===Syntax.Identifier&&isRestrictedWord(expr.name)){tolerateError(Messages.StrictLHSPostfix);}if(!isAssignmentTarget){tolerateError(Messages.InvalidLHSInAssignment);}isAssignmentTarget=isBindingElement=false;token=lex();expr=new WrappingNode(startToken).finishPostfixExpression(token.value,expr);}}return expr;} // ECMA-262 12.5 Unary Operators
	function parseUnaryExpression(){var token,expr,startToken;if(lookahead.type!==Token.Punctuator&&lookahead.type!==Token.Keyword){expr=parsePostfixExpression();}else if(match('++')||match('--')){startToken=lookahead;token=lex();expr=inheritCoverGrammar(parseUnaryExpression); // ECMA-262 11.4.4, 11.4.5
	if(strict&&expr.type===Syntax.Identifier&&isRestrictedWord(expr.name)){tolerateError(Messages.StrictLHSPrefix);}if(!isAssignmentTarget){tolerateError(Messages.InvalidLHSInAssignment);}expr=new WrappingNode(startToken).finishUnaryExpression(token.value,expr);isAssignmentTarget=isBindingElement=false;}else if(match('+')||match('-')||match('~')||match('!')){startToken=lookahead;token=lex();expr=inheritCoverGrammar(parseUnaryExpression);expr=new WrappingNode(startToken).finishUnaryExpression(token.value,expr);isAssignmentTarget=isBindingElement=false;}else if(matchKeyword('delete')||matchKeyword('void')||matchKeyword('typeof')){startToken=lookahead;token=lex();expr=inheritCoverGrammar(parseUnaryExpression);expr=new WrappingNode(startToken).finishUnaryExpression(token.value,expr);if(strict&&expr.operator==='delete'&&expr.argument.type===Syntax.Identifier){tolerateError(Messages.StrictDelete);}isAssignmentTarget=isBindingElement=false;}else {expr=parsePostfixExpression();}return expr;}function binaryPrecedence(token,allowIn){var prec=0;if(token.type!==Token.Punctuator&&token.type!==Token.Keyword){return 0;}switch(token.value){case '||':prec=1;break;case '&&':prec=2;break;case '|':prec=3;break;case '^':prec=4;break;case '&':prec=5;break;case '==':case '!=':case '===':case '!==':prec=6;break;case '<':case '>':case '<=':case '>=':case 'instanceof':prec=7;break;case 'in':prec=allowIn?7:0;break;case '<<':case '>>':case '>>>':prec=8;break;case '+':case '-':prec=9;break;case '*':case '/':case '%':prec=11;break;default:break;}return prec;} // ECMA-262 12.6 Multiplicative Operators
	// ECMA-262 12.7 Additive Operators
	// ECMA-262 12.8 Bitwise Shift Operators
	// ECMA-262 12.9 Relational Operators
	// ECMA-262 12.10 Equality Operators
	// ECMA-262 12.11 Binary Bitwise Operators
	// ECMA-262 12.12 Binary Logical Operators
	function parseBinaryExpression(){var marker,markers,expr,token,prec,stack,right,operator,left,i;marker=lookahead;left=inheritCoverGrammar(parseUnaryExpression);token=lookahead;prec=binaryPrecedence(token,state.allowIn);if(prec===0){return left;}isAssignmentTarget=isBindingElement=false;token.prec=prec;lex();markers=[marker,lookahead];right=isolateCoverGrammar(parseUnaryExpression);stack=[left,token,right];while((prec=binaryPrecedence(lookahead,state.allowIn))>0){ // Reduce: make a binary expression from the three topmost entries.
	while(stack.length>2&&prec<=stack[stack.length-2].prec){right=stack.pop();operator=stack.pop().value;left=stack.pop();markers.pop();expr=new WrappingNode(markers[markers.length-1]).finishBinaryExpression(operator,left,right);stack.push(expr);} // Shift.
	token=lex();token.prec=prec;stack.push(token);markers.push(lookahead);expr=isolateCoverGrammar(parseUnaryExpression);stack.push(expr);} // Final reduce to clean-up the stack.
	i=stack.length-1;expr=stack[i];markers.pop();while(i>1){expr=new WrappingNode(markers.pop()).finishBinaryExpression(stack[i-1].value,stack[i-2],expr);i-=2;}return expr;} // ECMA-262 12.13 Conditional Operator
	function parseConditionalExpression(){var expr,previousAllowIn,consequent,alternate,startToken;startToken=lookahead;expr=inheritCoverGrammar(parseBinaryExpression);if(match('?')){lex();previousAllowIn=state.allowIn;state.allowIn=true;consequent=isolateCoverGrammar(parseAssignmentExpression);state.allowIn=previousAllowIn;expect(':');alternate=isolateCoverGrammar(parseAssignmentExpression);expr=new WrappingNode(startToken).finishConditionalExpression(expr,consequent,alternate);isAssignmentTarget=isBindingElement=false;}return expr;} // ECMA-262 14.2 Arrow Function Definitions
	function parseConciseBody(){if(match('{')){return parseFunctionSourceElements();}return isolateCoverGrammar(parseAssignmentExpression);}function checkPatternParam(options,param){var i;switch(param.type){case Syntax.Identifier:validateParam(options,param,param.name);break;case Syntax.RestElement:checkPatternParam(options,param.argument);break;case Syntax.AssignmentPattern:checkPatternParam(options,param.left);break;case Syntax.ArrayPattern:for(i=0;i<param.elements.length;i++){if(param.elements[i]!==null){checkPatternParam(options,param.elements[i]);}}break;case Syntax.YieldExpression:break;default:assert(param.type===Syntax.ObjectPattern,'Invalid type');for(i=0;i<param.properties.length;i++){checkPatternParam(options,param.properties[i].value);}break;}}function reinterpretAsCoverFormalsList(expr){var i,len,param,params,defaults,defaultCount,options,token;defaults=[];defaultCount=0;params=[expr];switch(expr.type){case Syntax.Identifier:break;case PlaceHolders.ArrowParameterPlaceHolder:params=expr.params;break;default:return null;}options={paramSet:{}};for(i=0,len=params.length;i<len;i+=1){param=params[i];switch(param.type){case Syntax.AssignmentPattern:params[i]=param.left;if(param.right.type===Syntax.YieldExpression){if(param.right.argument){throwUnexpectedToken(lookahead);}param.right.type=Syntax.Identifier;param.right.name='yield';delete param.right.argument;delete param.right.delegate;}defaults.push(param.right);++defaultCount;checkPatternParam(options,param.left);break;default:checkPatternParam(options,param);params[i]=param;defaults.push(null);break;}}if(strict||!state.allowYield){for(i=0,len=params.length;i<len;i+=1){param=params[i];if(param.type===Syntax.YieldExpression){throwUnexpectedToken(lookahead);}}}if(options.message===Messages.StrictParamDupe){token=strict?options.stricted:options.firstRestricted;throwUnexpectedToken(token,options.message);}if(defaultCount===0){defaults=[];}return {params:params,defaults:defaults,stricted:options.stricted,firstRestricted:options.firstRestricted,message:options.message};}function parseArrowFunctionExpression(options,node){var previousStrict,previousAllowYield,body;if(hasLineTerminator){tolerateUnexpectedToken(lookahead);}expect('=>');previousStrict=strict;previousAllowYield=state.allowYield;state.allowYield=true;body=parseConciseBody();if(strict&&options.firstRestricted){throwUnexpectedToken(options.firstRestricted,options.message);}if(strict&&options.stricted){tolerateUnexpectedToken(options.stricted,options.message);}strict=previousStrict;state.allowYield=previousAllowYield;return node.finishArrowFunctionExpression(options.params,options.defaults,body,body.type!==Syntax.BlockStatement);} // ECMA-262 14.4 Yield expression
	function parseYieldExpression(){var argument,expr,delegate,previousAllowYield;argument=null;expr=new Node();delegate=false;expectKeyword('yield');if(!hasLineTerminator){previousAllowYield=state.allowYield;state.allowYield=false;delegate=match('*');if(delegate){lex();argument=parseAssignmentExpression();}else {if(!match(';')&&!match('}')&&!match(')')&&lookahead.type!==Token.EOF){argument=parseAssignmentExpression();}}state.allowYield=previousAllowYield;}return expr.finishYieldExpression(argument,delegate);} // ECMA-262 12.14 Assignment Operators
	function parseAssignmentExpression(){var token,expr,right,list,startToken;startToken=lookahead;token=lookahead;if(!state.allowYield&&matchKeyword('yield')){return parseYieldExpression();}expr=parseConditionalExpression();if(expr.type===PlaceHolders.ArrowParameterPlaceHolder||match('=>')){isAssignmentTarget=isBindingElement=false;list=reinterpretAsCoverFormalsList(expr);if(list){firstCoverInitializedNameError=null;return parseArrowFunctionExpression(list,new WrappingNode(startToken));}return expr;}if(matchAssign()){if(!isAssignmentTarget){tolerateError(Messages.InvalidLHSInAssignment);} // ECMA-262 12.1.1
	if(strict&&expr.type===Syntax.Identifier){if(isRestrictedWord(expr.name)){tolerateUnexpectedToken(token,Messages.StrictLHSAssignment);}if(isStrictModeReservedWord(expr.name)){tolerateUnexpectedToken(token,Messages.StrictReservedWord);}}if(!match('=')){isAssignmentTarget=isBindingElement=false;}else {reinterpretExpressionAsPattern(expr);}token=lex();right=isolateCoverGrammar(parseAssignmentExpression);expr=new WrappingNode(startToken).finishAssignmentExpression(token.value,expr,right);firstCoverInitializedNameError=null;}return expr;} // ECMA-262 12.15 Comma Operator
	function parseExpression(){var expr,startToken=lookahead,expressions;expr=isolateCoverGrammar(parseAssignmentExpression);if(match(',')){expressions=[expr];while(startIndex<length){if(!match(',')){break;}lex();expressions.push(isolateCoverGrammar(parseAssignmentExpression));}expr=new WrappingNode(startToken).finishSequenceExpression(expressions);}return expr;} // ECMA-262 13.2 Block
	function parseStatementListItem(){if(lookahead.type===Token.Keyword){switch(lookahead.value){case 'export':if(state.sourceType!=='module'){tolerateUnexpectedToken(lookahead,Messages.IllegalExportDeclaration);}return parseExportDeclaration();case 'import':if(state.sourceType!=='module'){tolerateUnexpectedToken(lookahead,Messages.IllegalImportDeclaration);}return parseImportDeclaration();case 'const':return parseLexicalDeclaration({inFor:false});case 'function':return parseFunctionDeclaration(new Node());case 'class':return parseClassDeclaration();}}if(matchKeyword('let')&&isLexicalDeclaration()){return parseLexicalDeclaration({inFor:false});}return parseStatement();}function parseStatementList(){var list=[];while(startIndex<length){if(match('}')){break;}list.push(parseStatementListItem());}return list;}function parseBlock(){var block,node=new Node();expect('{');block=parseStatementList();expect('}');return node.finishBlockStatement(block);} // ECMA-262 13.3.2 Variable Statement
	function parseVariableIdentifier(kind){var token,node=new Node();token=lex();if(token.type===Token.Keyword&&token.value==='yield'){if(strict){tolerateUnexpectedToken(token,Messages.StrictReservedWord);}if(!state.allowYield){throwUnexpectedToken(token);}}else if(token.type!==Token.Identifier){if(strict&&token.type===Token.Keyword&&isStrictModeReservedWord(token.value)){tolerateUnexpectedToken(token,Messages.StrictReservedWord);}else {if(strict||token.value!=='let'||kind!=='var'){throwUnexpectedToken(token);}}}else if(state.sourceType==='module'&&token.type===Token.Identifier&&token.value==='await'){tolerateUnexpectedToken(token);}return node.finishIdentifier(token.value);}function parseVariableDeclaration(options){var init=null,id,node=new Node(),params=[];id=parsePattern(params,'var'); // ECMA-262 12.2.1
	if(strict&&isRestrictedWord(id.name)){tolerateError(Messages.StrictVarName);}if(match('=')){lex();init=isolateCoverGrammar(parseAssignmentExpression);}else if(id.type!==Syntax.Identifier&&!options.inFor){expect('=');}return node.finishVariableDeclarator(id,init);}function parseVariableDeclarationList(options){var opt,list;opt={inFor:options.inFor};list=[parseVariableDeclaration(opt)];while(match(',')){lex();list.push(parseVariableDeclaration(opt));}return list;}function parseVariableStatement(node){var declarations;expectKeyword('var');declarations=parseVariableDeclarationList({inFor:false});consumeSemicolon();return node.finishVariableDeclaration(declarations);} // ECMA-262 13.3.1 Let and Const Declarations
	function parseLexicalBinding(kind,options){var init=null,id,node=new Node(),params=[];id=parsePattern(params,kind); // ECMA-262 12.2.1
	if(strict&&id.type===Syntax.Identifier&&isRestrictedWord(id.name)){tolerateError(Messages.StrictVarName);}if(kind==='const'){if(!matchKeyword('in')&&!matchContextualKeyword('of')){expect('=');init=isolateCoverGrammar(parseAssignmentExpression);}}else if(!options.inFor&&id.type!==Syntax.Identifier||match('=')){expect('=');init=isolateCoverGrammar(parseAssignmentExpression);}return node.finishVariableDeclarator(id,init);}function parseBindingList(kind,options){var list=[parseLexicalBinding(kind,options)];while(match(',')){lex();list.push(parseLexicalBinding(kind,options));}return list;}function tokenizerState(){return {index:index,lineNumber:lineNumber,lineStart:lineStart,hasLineTerminator:hasLineTerminator,lastIndex:lastIndex,lastLineNumber:lastLineNumber,lastLineStart:lastLineStart,startIndex:startIndex,startLineNumber:startLineNumber,startLineStart:startLineStart,lookahead:lookahead,tokenCount:extra.tokens?extra.tokens.length:0};}function resetTokenizerState(ts){index=ts.index;lineNumber=ts.lineNumber;lineStart=ts.lineStart;hasLineTerminator=ts.hasLineTerminator;lastIndex=ts.lastIndex;lastLineNumber=ts.lastLineNumber;lastLineStart=ts.lastLineStart;startIndex=ts.startIndex;startLineNumber=ts.startLineNumber;startLineStart=ts.startLineStart;lookahead=ts.lookahead;if(extra.tokens){extra.tokens.splice(ts.tokenCount,extra.tokens.length);}}function isLexicalDeclaration(){var lexical,ts;ts=tokenizerState();lex();lexical=lookahead.type===Token.Identifier||match('[')||match('{')||matchKeyword('let')||matchKeyword('yield');resetTokenizerState(ts);return lexical;}function parseLexicalDeclaration(options){var kind,declarations,node=new Node();kind=lex().value;assert(kind==='let'||kind==='const','Lexical declaration must be either let or const');declarations=parseBindingList(kind,options);consumeSemicolon();return node.finishLexicalDeclaration(declarations,kind);}function parseRestElement(params){var param,node=new Node();lex();if(match('{')){throwError(Messages.ObjectPatternAsRestParameter);}params.push(lookahead);param=parseVariableIdentifier();if(match('=')){throwError(Messages.DefaultRestParameter);}if(!match(')')){throwError(Messages.ParameterAfterRestParameter);}return node.finishRestElement(param);} // ECMA-262 13.4 Empty Statement
	function parseEmptyStatement(node){expect(';');return node.finishEmptyStatement();} // ECMA-262 12.4 Expression Statement
	function parseExpressionStatement(node){var expr=parseExpression();consumeSemicolon();return node.finishExpressionStatement(expr);} // ECMA-262 13.6 If statement
	function parseIfStatement(node){var test,consequent,alternate;expectKeyword('if');expect('(');test=parseExpression();expect(')');consequent=parseStatement();if(matchKeyword('else')){lex();alternate=parseStatement();}else {alternate=null;}return node.finishIfStatement(test,consequent,alternate);} // ECMA-262 13.7 Iteration Statements
	function parseDoWhileStatement(node){var body,test,oldInIteration;expectKeyword('do');oldInIteration=state.inIteration;state.inIteration=true;body=parseStatement();state.inIteration=oldInIteration;expectKeyword('while');expect('(');test=parseExpression();expect(')');if(match(';')){lex();}return node.finishDoWhileStatement(body,test);}function parseWhileStatement(node){var test,body,oldInIteration;expectKeyword('while');expect('(');test=parseExpression();expect(')');oldInIteration=state.inIteration;state.inIteration=true;body=parseStatement();state.inIteration=oldInIteration;return node.finishWhileStatement(test,body);}function parseForStatement(node){var init,forIn,initSeq,initStartToken,test,update,left,right,kind,declarations,body,oldInIteration,previousAllowIn=state.allowIn;init=test=update=null;forIn=true;expectKeyword('for');expect('(');if(match(';')){lex();}else {if(matchKeyword('var')){init=new Node();lex();state.allowIn=false;declarations=parseVariableDeclarationList({inFor:true});state.allowIn=previousAllowIn;if(declarations.length===1&&matchKeyword('in')){init=init.finishVariableDeclaration(declarations);lex();left=init;right=parseExpression();init=null;}else if(declarations.length===1&&declarations[0].init===null&&matchContextualKeyword('of')){init=init.finishVariableDeclaration(declarations);lex();left=init;right=parseAssignmentExpression();init=null;forIn=false;}else {init=init.finishVariableDeclaration(declarations);expect(';');}}else if(matchKeyword('const')||matchKeyword('let')){init=new Node();kind=lex().value;if(!strict&&lookahead.value==='in'){init=init.finishIdentifier(kind);lex();left=init;right=parseExpression();init=null;}else {state.allowIn=false;declarations=parseBindingList(kind,{inFor:true});state.allowIn=previousAllowIn;if(declarations.length===1&&declarations[0].init===null&&matchKeyword('in')){init=init.finishLexicalDeclaration(declarations,kind);lex();left=init;right=parseExpression();init=null;}else if(declarations.length===1&&declarations[0].init===null&&matchContextualKeyword('of')){init=init.finishLexicalDeclaration(declarations,kind);lex();left=init;right=parseAssignmentExpression();init=null;forIn=false;}else {consumeSemicolon();init=init.finishLexicalDeclaration(declarations,kind);}}}else {initStartToken=lookahead;state.allowIn=false;init=inheritCoverGrammar(parseAssignmentExpression);state.allowIn=previousAllowIn;if(matchKeyword('in')){if(!isAssignmentTarget){tolerateError(Messages.InvalidLHSInForIn);}lex();reinterpretExpressionAsPattern(init);left=init;right=parseExpression();init=null;}else if(matchContextualKeyword('of')){if(!isAssignmentTarget){tolerateError(Messages.InvalidLHSInForLoop);}lex();reinterpretExpressionAsPattern(init);left=init;right=parseAssignmentExpression();init=null;forIn=false;}else {if(match(',')){initSeq=[init];while(match(',')){lex();initSeq.push(isolateCoverGrammar(parseAssignmentExpression));}init=new WrappingNode(initStartToken).finishSequenceExpression(initSeq);}expect(';');}}}if(typeof left==='undefined'){if(!match(';')){test=parseExpression();}expect(';');if(!match(')')){update=parseExpression();}}expect(')');oldInIteration=state.inIteration;state.inIteration=true;body=isolateCoverGrammar(parseStatement);state.inIteration=oldInIteration;return typeof left==='undefined'?node.finishForStatement(init,test,update,body):forIn?node.finishForInStatement(left,right,body):node.finishForOfStatement(left,right,body);} // ECMA-262 13.8 The continue statement
	function parseContinueStatement(node){var label=null,key;expectKeyword('continue'); // Optimize the most common form: 'continue;'.
	if(source.charCodeAt(startIndex)===0x3B){lex();if(!state.inIteration){throwError(Messages.IllegalContinue);}return node.finishContinueStatement(null);}if(hasLineTerminator){if(!state.inIteration){throwError(Messages.IllegalContinue);}return node.finishContinueStatement(null);}if(lookahead.type===Token.Identifier){label=parseVariableIdentifier();key='$'+label.name;if(!Object.prototype.hasOwnProperty.call(state.labelSet,key)){throwError(Messages.UnknownLabel,label.name);}}consumeSemicolon();if(label===null&&!state.inIteration){throwError(Messages.IllegalContinue);}return node.finishContinueStatement(label);} // ECMA-262 13.9 The break statement
	function parseBreakStatement(node){var label=null,key;expectKeyword('break'); // Catch the very common case first: immediately a semicolon (U+003B).
	if(source.charCodeAt(lastIndex)===0x3B){lex();if(!(state.inIteration||state.inSwitch)){throwError(Messages.IllegalBreak);}return node.finishBreakStatement(null);}if(hasLineTerminator){if(!(state.inIteration||state.inSwitch)){throwError(Messages.IllegalBreak);}}else if(lookahead.type===Token.Identifier){label=parseVariableIdentifier();key='$'+label.name;if(!Object.prototype.hasOwnProperty.call(state.labelSet,key)){throwError(Messages.UnknownLabel,label.name);}}consumeSemicolon();if(label===null&&!(state.inIteration||state.inSwitch)){throwError(Messages.IllegalBreak);}return node.finishBreakStatement(label);} // ECMA-262 13.10 The return statement
	function parseReturnStatement(node){var argument=null;expectKeyword('return');if(!state.inFunctionBody){tolerateError(Messages.IllegalReturn);} // 'return' followed by a space and an identifier is very common.
	if(source.charCodeAt(lastIndex)===0x20){if(isIdentifierStart(source.charCodeAt(lastIndex+1))){argument=parseExpression();consumeSemicolon();return node.finishReturnStatement(argument);}}if(hasLineTerminator){ // HACK
	return node.finishReturnStatement(null);}if(!match(';')){if(!match('}')&&lookahead.type!==Token.EOF){argument=parseExpression();}}consumeSemicolon();return node.finishReturnStatement(argument);} // ECMA-262 13.11 The with statement
	function parseWithStatement(node){var object,body;if(strict){tolerateError(Messages.StrictModeWith);}expectKeyword('with');expect('(');object=parseExpression();expect(')');body=parseStatement();return node.finishWithStatement(object,body);} // ECMA-262 13.12 The switch statement
	function parseSwitchCase(){var test,consequent=[],statement,node=new Node();if(matchKeyword('default')){lex();test=null;}else {expectKeyword('case');test=parseExpression();}expect(':');while(startIndex<length){if(match('}')||matchKeyword('default')||matchKeyword('case')){break;}statement=parseStatementListItem();consequent.push(statement);}return node.finishSwitchCase(test,consequent);}function parseSwitchStatement(node){var discriminant,cases,clause,oldInSwitch,defaultFound;expectKeyword('switch');expect('(');discriminant=parseExpression();expect(')');expect('{');cases=[];if(match('}')){lex();return node.finishSwitchStatement(discriminant,cases);}oldInSwitch=state.inSwitch;state.inSwitch=true;defaultFound=false;while(startIndex<length){if(match('}')){break;}clause=parseSwitchCase();if(clause.test===null){if(defaultFound){throwError(Messages.MultipleDefaultsInSwitch);}defaultFound=true;}cases.push(clause);}state.inSwitch=oldInSwitch;expect('}');return node.finishSwitchStatement(discriminant,cases);} // ECMA-262 13.14 The throw statement
	function parseThrowStatement(node){var argument;expectKeyword('throw');if(hasLineTerminator){throwError(Messages.NewlineAfterThrow);}argument=parseExpression();consumeSemicolon();return node.finishThrowStatement(argument);} // ECMA-262 13.15 The try statement
	function parseCatchClause(){var param,params=[],paramMap={},key,i,body,node=new Node();expectKeyword('catch');expect('(');if(match(')')){throwUnexpectedToken(lookahead);}param=parsePattern(params);for(i=0;i<params.length;i++){key='$'+params[i].value;if(Object.prototype.hasOwnProperty.call(paramMap,key)){tolerateError(Messages.DuplicateBinding,params[i].value);}paramMap[key]=true;} // ECMA-262 12.14.1
	if(strict&&isRestrictedWord(param.name)){tolerateError(Messages.StrictCatchVariable);}expect(')');body=parseBlock();return node.finishCatchClause(param,body);}function parseTryStatement(node){var block,handler=null,finalizer=null;expectKeyword('try');block=parseBlock();if(matchKeyword('catch')){handler=parseCatchClause();}if(matchKeyword('finally')){lex();finalizer=parseBlock();}if(!handler&&!finalizer){throwError(Messages.NoCatchOrFinally);}return node.finishTryStatement(block,handler,finalizer);} // ECMA-262 13.16 The debugger statement
	function parseDebuggerStatement(node){expectKeyword('debugger');consumeSemicolon();return node.finishDebuggerStatement();} // 13 Statements
	function parseStatement(){var type=lookahead.type,expr,labeledBody,key,node;if(type===Token.EOF){throwUnexpectedToken(lookahead);}if(type===Token.Punctuator&&lookahead.value==='{'){return parseBlock();}isAssignmentTarget=isBindingElement=true;node=new Node();if(type===Token.Punctuator){switch(lookahead.value){case ';':return parseEmptyStatement(node);case '(':return parseExpressionStatement(node);default:break;}}else if(type===Token.Keyword){switch(lookahead.value){case 'break':return parseBreakStatement(node);case 'continue':return parseContinueStatement(node);case 'debugger':return parseDebuggerStatement(node);case 'do':return parseDoWhileStatement(node);case 'for':return parseForStatement(node);case 'function':return parseFunctionDeclaration(node);case 'if':return parseIfStatement(node);case 'return':return parseReturnStatement(node);case 'switch':return parseSwitchStatement(node);case 'throw':return parseThrowStatement(node);case 'try':return parseTryStatement(node);case 'var':return parseVariableStatement(node);case 'while':return parseWhileStatement(node);case 'with':return parseWithStatement(node);default:break;}}expr=parseExpression(); // ECMA-262 12.12 Labelled Statements
	if(expr.type===Syntax.Identifier&&match(':')){lex();key='$'+expr.name;if(Object.prototype.hasOwnProperty.call(state.labelSet,key)){throwError(Messages.Redeclaration,'Label',expr.name);}state.labelSet[key]=true;labeledBody=parseStatement();delete state.labelSet[key];return node.finishLabeledStatement(expr,labeledBody);}consumeSemicolon();return node.finishExpressionStatement(expr);} // ECMA-262 14.1 Function Definition
	function parseFunctionSourceElements(){var statement,body=[],token,directive,firstRestricted,oldLabelSet,oldInIteration,oldInSwitch,oldInFunctionBody,node=new Node();expect('{');while(startIndex<length){if(lookahead.type!==Token.StringLiteral){break;}token=lookahead;statement=parseStatementListItem();body.push(statement);if(statement.expression.type!==Syntax.Literal){ // this is not directive
	break;}directive=source.slice(token.start+1,token.end-1);if(directive==='use strict'){strict=true;if(firstRestricted){tolerateUnexpectedToken(firstRestricted,Messages.StrictOctalLiteral);}}else {if(!firstRestricted&&token.octal){firstRestricted=token;}}}oldLabelSet=state.labelSet;oldInIteration=state.inIteration;oldInSwitch=state.inSwitch;oldInFunctionBody=state.inFunctionBody;state.labelSet={};state.inIteration=false;state.inSwitch=false;state.inFunctionBody=true;while(startIndex<length){if(match('}')){break;}body.push(parseStatementListItem());}expect('}');state.labelSet=oldLabelSet;state.inIteration=oldInIteration;state.inSwitch=oldInSwitch;state.inFunctionBody=oldInFunctionBody;return node.finishBlockStatement(body);}function validateParam(options,param,name){var key='$'+name;if(strict){if(isRestrictedWord(name)){options.stricted=param;options.message=Messages.StrictParamName;}if(Object.prototype.hasOwnProperty.call(options.paramSet,key)){options.stricted=param;options.message=Messages.StrictParamDupe;}}else if(!options.firstRestricted){if(isRestrictedWord(name)){options.firstRestricted=param;options.message=Messages.StrictParamName;}else if(isStrictModeReservedWord(name)){options.firstRestricted=param;options.message=Messages.StrictReservedWord;}else if(Object.prototype.hasOwnProperty.call(options.paramSet,key)){options.stricted=param;options.message=Messages.StrictParamDupe;}}options.paramSet[key]=true;}function parseParam(options){var token,param,params=[],i,def;token=lookahead;if(token.value==='...'){param=parseRestElement(params);validateParam(options,param.argument,param.argument.name);options.params.push(param);options.defaults.push(null);return false;}param=parsePatternWithDefault(params);for(i=0;i<params.length;i++){validateParam(options,params[i],params[i].value);}if(param.type===Syntax.AssignmentPattern){def=param.right;param=param.left;++options.defaultCount;}options.params.push(param);options.defaults.push(def);return !match(')');}function parseParams(firstRestricted){var options;options={params:[],defaultCount:0,defaults:[],firstRestricted:firstRestricted};expect('(');if(!match(')')){options.paramSet={};while(startIndex<length){if(!parseParam(options)){break;}expect(',');}}expect(')');if(options.defaultCount===0){options.defaults=[];}return {params:options.params,defaults:options.defaults,stricted:options.stricted,firstRestricted:options.firstRestricted,message:options.message};}function parseFunctionDeclaration(node,identifierIsOptional){var id=null,params=[],defaults=[],body,token,stricted,tmp,firstRestricted,message,previousStrict,isGenerator,previousAllowYield;previousAllowYield=state.allowYield;expectKeyword('function');isGenerator=match('*');if(isGenerator){lex();}if(!identifierIsOptional||!match('(')){token=lookahead;id=parseVariableIdentifier();if(strict){if(isRestrictedWord(token.value)){tolerateUnexpectedToken(token,Messages.StrictFunctionName);}}else {if(isRestrictedWord(token.value)){firstRestricted=token;message=Messages.StrictFunctionName;}else if(isStrictModeReservedWord(token.value)){firstRestricted=token;message=Messages.StrictReservedWord;}}}state.allowYield=!isGenerator;tmp=parseParams(firstRestricted);params=tmp.params;defaults=tmp.defaults;stricted=tmp.stricted;firstRestricted=tmp.firstRestricted;if(tmp.message){message=tmp.message;}previousStrict=strict;body=parseFunctionSourceElements();if(strict&&firstRestricted){throwUnexpectedToken(firstRestricted,message);}if(strict&&stricted){tolerateUnexpectedToken(stricted,message);}strict=previousStrict;state.allowYield=previousAllowYield;return node.finishFunctionDeclaration(id,params,defaults,body,isGenerator);}function parseFunctionExpression(){var token,id=null,stricted,firstRestricted,message,tmp,params=[],defaults=[],body,previousStrict,node=new Node(),isGenerator,previousAllowYield;previousAllowYield=state.allowYield;expectKeyword('function');isGenerator=match('*');if(isGenerator){lex();}state.allowYield=!isGenerator;if(!match('(')){token=lookahead;id=!strict&&!isGenerator&&matchKeyword('yield')?parseNonComputedProperty():parseVariableIdentifier();if(strict){if(isRestrictedWord(token.value)){tolerateUnexpectedToken(token,Messages.StrictFunctionName);}}else {if(isRestrictedWord(token.value)){firstRestricted=token;message=Messages.StrictFunctionName;}else if(isStrictModeReservedWord(token.value)){firstRestricted=token;message=Messages.StrictReservedWord;}}}tmp=parseParams(firstRestricted);params=tmp.params;defaults=tmp.defaults;stricted=tmp.stricted;firstRestricted=tmp.firstRestricted;if(tmp.message){message=tmp.message;}previousStrict=strict;body=parseFunctionSourceElements();if(strict&&firstRestricted){throwUnexpectedToken(firstRestricted,message);}if(strict&&stricted){tolerateUnexpectedToken(stricted,message);}strict=previousStrict;state.allowYield=previousAllowYield;return node.finishFunctionExpression(id,params,defaults,body,isGenerator);} // ECMA-262 14.5 Class Definitions
	function parseClassBody(){var classBody,token,isStatic,hasConstructor=false,body,method,computed,key;classBody=new Node();expect('{');body=[];while(!match('}')){if(match(';')){lex();}else {method=new Node();token=lookahead;isStatic=false;computed=match('[');if(match('*')){lex();}else {key=parseObjectPropertyKey();if(key.name==='static'&&(lookaheadPropertyName()||match('*'))){token=lookahead;isStatic=true;computed=match('[');if(match('*')){lex();}else {key=parseObjectPropertyKey();}}}method=tryParseMethodDefinition(token,key,computed,method);if(method){method['static']=isStatic; // jscs:ignore requireDotNotation
	if(method.kind==='init'){method.kind='method';}if(!isStatic){if(!method.computed&&(method.key.name||method.key.value.toString())==='constructor'){if(method.kind!=='method'||!method.method||method.value.generator){throwUnexpectedToken(token,Messages.ConstructorSpecialMethod);}if(hasConstructor){throwUnexpectedToken(token,Messages.DuplicateConstructor);}else {hasConstructor=true;}method.kind='constructor';}}else {if(!method.computed&&(method.key.name||method.key.value.toString())==='prototype'){throwUnexpectedToken(token,Messages.StaticPrototype);}}method.type=Syntax.MethodDefinition;delete method.method;delete method.shorthand;body.push(method);}else {throwUnexpectedToken(lookahead);}}}lex();return classBody.finishClassBody(body);}function parseClassDeclaration(identifierIsOptional){var id=null,superClass=null,classNode=new Node(),classBody,previousStrict=strict;strict=true;expectKeyword('class');if(!identifierIsOptional||lookahead.type===Token.Identifier){id=parseVariableIdentifier();}if(matchKeyword('extends')){lex();superClass=isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);}classBody=parseClassBody();strict=previousStrict;return classNode.finishClassDeclaration(id,superClass,classBody);}function parseClassExpression(){var id=null,superClass=null,classNode=new Node(),classBody,previousStrict=strict;strict=true;expectKeyword('class');if(lookahead.type===Token.Identifier){id=parseVariableIdentifier();}if(matchKeyword('extends')){lex();superClass=isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);}classBody=parseClassBody();strict=previousStrict;return classNode.finishClassExpression(id,superClass,classBody);} // ECMA-262 15.2 Modules
	function parseModuleSpecifier(){var node=new Node();if(lookahead.type!==Token.StringLiteral){throwError(Messages.InvalidModuleSpecifier);}return node.finishLiteral(lex());} // ECMA-262 15.2.3 Exports
	function parseExportSpecifier(){var exported,local,node=new Node(),def;if(matchKeyword('default')){ // export {default} from 'something';
	def=new Node();lex();local=def.finishIdentifier('default');}else {local=parseVariableIdentifier();}if(matchContextualKeyword('as')){lex();exported=parseNonComputedProperty();}return node.finishExportSpecifier(local,exported);}function parseExportNamedDeclaration(node){var declaration=null,isExportFromIdentifier,src=null,specifiers=[]; // non-default export
	if(lookahead.type===Token.Keyword){ // covers:
	// export var f = 1;
	switch(lookahead.value){case 'let':case 'const':declaration=parseLexicalDeclaration({inFor:false});return node.finishExportNamedDeclaration(declaration,specifiers,null);case 'var':case 'class':case 'function':declaration=parseStatementListItem();return node.finishExportNamedDeclaration(declaration,specifiers,null);}}expect('{');while(!match('}')){isExportFromIdentifier=isExportFromIdentifier||matchKeyword('default');specifiers.push(parseExportSpecifier());if(!match('}')){expect(',');if(match('}')){break;}}}expect('}');if(matchContextualKeyword('from')){ // covering:
	// export {default} from 'foo';
	// export {foo} from 'foo';
	lex();src=parseModuleSpecifier();consumeSemicolon();}else if(isExportFromIdentifier){ // covering:
	// export {default}; // missing fromClause
	throwError(lookahead.value?Messages.UnexpectedToken:Messages.MissingFromClause,lookahead.value);}else { // cover
	// export {foo};
	consumeSemicolon();}return node.finishExportNamedDeclaration(declaration,specifiers,src);}function parseExportDefaultDeclaration(node){var declaration=null,expression=null; // covers:
	// export default ...
	expectKeyword('default');if(matchKeyword('function')){ // covers:
	// export default function foo () {}
	// export default function () {}
	declaration=parseFunctionDeclaration(new Node(),true);return node.finishExportDefaultDeclaration(declaration);}if(matchKeyword('class')){declaration=parseClassDeclaration(true);return node.finishExportDefaultDeclaration(declaration);}if(matchContextualKeyword('from')){throwError(Messages.UnexpectedToken,lookahead.value);} // covers:
	// export default {};
	// export default [];
	// export default (1 + 2);
	if(match('{')){expression=parseObjectInitializer();}else if(match('[')){expression=parseArrayInitializer();}else {expression=parseAssignmentExpression();}consumeSemicolon();return node.finishExportDefaultDeclaration(expression);}function parseExportAllDeclaration(node){var src; // covers:
	// export * from 'foo';
	expect('*');if(!matchContextualKeyword('from')){throwError(lookahead.value?Messages.UnexpectedToken:Messages.MissingFromClause,lookahead.value);}lex();src=parseModuleSpecifier();consumeSemicolon();return node.finishExportAllDeclaration(src);}function parseExportDeclaration(){var node=new Node();if(state.inFunctionBody){throwError(Messages.IllegalExportDeclaration);}expectKeyword('export');if(matchKeyword('default')){return parseExportDefaultDeclaration(node);}if(match('*')){return parseExportAllDeclaration(node);}return parseExportNamedDeclaration(node);} // ECMA-262 15.2.2 Imports
	function parseImportSpecifier(){ // import {<foo as bar>} ...;
	var local,imported,node=new Node();imported=parseNonComputedProperty();if(matchContextualKeyword('as')){lex();local=parseVariableIdentifier();}return node.finishImportSpecifier(local,imported);}function parseNamedImports(){var specifiers=[]; // {foo, bar as bas}
	expect('{');while(!match('}')){specifiers.push(parseImportSpecifier());if(!match('}')){expect(',');if(match('}')){break;}}}expect('}');return specifiers;}function parseImportDefaultSpecifier(){ // import <foo> ...;
	var local,node=new Node();local=parseNonComputedProperty();return node.finishImportDefaultSpecifier(local);}function parseImportNamespaceSpecifier(){ // import <* as foo> ...;
	var local,node=new Node();expect('*');if(!matchContextualKeyword('as')){throwError(Messages.NoAsAfterImportNamespace);}lex();local=parseNonComputedProperty();return node.finishImportNamespaceSpecifier(local);}function parseImportDeclaration(){var specifiers=[],src,node=new Node();if(state.inFunctionBody){throwError(Messages.IllegalImportDeclaration);}expectKeyword('import');if(lookahead.type===Token.StringLiteral){ // import 'foo';
	src=parseModuleSpecifier();}else {if(match('{')){ // import {bar}
	specifiers=specifiers.concat(parseNamedImports());}else if(match('*')){ // import * as foo
	specifiers.push(parseImportNamespaceSpecifier());}else if(isIdentifierName(lookahead)&&!matchKeyword('default')){ // import foo
	specifiers.push(parseImportDefaultSpecifier());if(match(',')){lex();if(match('*')){ // import foo, * as foo
	specifiers.push(parseImportNamespaceSpecifier());}else if(match('{')){ // import foo, {bar}
	specifiers=specifiers.concat(parseNamedImports());}else {throwUnexpectedToken(lookahead);}}}else {throwUnexpectedToken(lex());}if(!matchContextualKeyword('from')){throwError(lookahead.value?Messages.UnexpectedToken:Messages.MissingFromClause,lookahead.value);}lex();src=parseModuleSpecifier();}consumeSemicolon();return node.finishImportDeclaration(specifiers,src);} // ECMA-262 15.1 Scripts
	function parseScriptBody(){var statement,body=[],token,directive,firstRestricted;while(startIndex<length){token=lookahead;if(token.type!==Token.StringLiteral){break;}statement=parseStatementListItem();body.push(statement);if(statement.expression.type!==Syntax.Literal){ // this is not directive
	break;}directive=source.slice(token.start+1,token.end-1);if(directive==='use strict'){strict=true;if(firstRestricted){tolerateUnexpectedToken(firstRestricted,Messages.StrictOctalLiteral);}}else {if(!firstRestricted&&token.octal){firstRestricted=token;}}}while(startIndex<length){statement=parseStatementListItem(); /* istanbul ignore if */if(typeof statement==='undefined'){break;}body.push(statement);}return body;}function parseProgram(){var body,node;peek();node=new Node();body=parseScriptBody();return node.finishProgram(body,state.sourceType);}function filterTokenLocation(){var i,entry,token,tokens=[];for(i=0;i<extra.tokens.length;++i){entry=extra.tokens[i];token={type:entry.type,value:entry.value};if(entry.regex){token.regex={pattern:entry.regex.pattern,flags:entry.regex.flags};}if(extra.range){token.range=entry.range;}if(extra.loc){token.loc=entry.loc;}tokens.push(token);}extra.tokens=tokens;}function tokenize(code,options,delegate){var toString,tokens;toString=String;if(typeof code!=='string'&&!(code instanceof String)){code=toString(code);}source=code;index=0;lineNumber=source.length>0?1:0;lineStart=0;startIndex=index;startLineNumber=lineNumber;startLineStart=lineStart;length=source.length;lookahead=null;state={allowIn:true,allowYield:true,labelSet:{},inFunctionBody:false,inIteration:false,inSwitch:false,lastCommentStart:-1,curlyStack:[]};extra={}; // Options matching.
	options=options||{}; // Of course we collect tokens here.
	options.tokens=true;extra.tokens=[];extra.tokenValues=[];extra.tokenize=true;extra.delegate=delegate; // The following two fields are necessary to compute the Regex tokens.
	extra.openParenToken=-1;extra.openCurlyToken=-1;extra.range=typeof options.range==='boolean'&&options.range;extra.loc=typeof options.loc==='boolean'&&options.loc;if(typeof options.comment==='boolean'&&options.comment){extra.comments=[];}if(typeof options.tolerant==='boolean'&&options.tolerant){extra.errors=[];}try{peek();if(lookahead.type===Token.EOF){return extra.tokens;}lex();while(lookahead.type!==Token.EOF){try{lex();}catch(lexError){if(extra.errors){recordError(lexError); // We have to break on the first error
	// to avoid infinite loops.
	break;}else {throw lexError;}}}tokens=extra.tokens;if(typeof extra.errors!=='undefined'){tokens.errors=extra.errors;}}catch(e){throw e;}finally {extra={};}return tokens;}function parse(code,options){var program,toString;toString=String;if(typeof code!=='string'&&!(code instanceof String)){code=toString(code);}source=code;index=0;lineNumber=source.length>0?1:0;lineStart=0;startIndex=index;startLineNumber=lineNumber;startLineStart=lineStart;length=source.length;lookahead=null;state={allowIn:true,allowYield:true,labelSet:{},inFunctionBody:false,inIteration:false,inSwitch:false,lastCommentStart:-1,curlyStack:[],sourceType:'script'};strict=false;extra={};if(typeof options!=='undefined'){extra.range=typeof options.range==='boolean'&&options.range;extra.loc=typeof options.loc==='boolean'&&options.loc;extra.attachComment=typeof options.attachComment==='boolean'&&options.attachComment;if(extra.loc&&options.source!==null&&options.source!==undefined){extra.source=toString(options.source);}if(typeof options.tokens==='boolean'&&options.tokens){extra.tokens=[];}if(typeof options.comment==='boolean'&&options.comment){extra.comments=[];}if(typeof options.tolerant==='boolean'&&options.tolerant){extra.errors=[];}if(extra.attachComment){extra.range=true;extra.comments=[];extra.bottomRightStack=[];extra.trailingComments=[];extra.leadingComments=[];}if(options.sourceType==='module'){ // very restrictive condition for now
	state.sourceType=options.sourceType;strict=true;}}try{program=parseProgram();if(typeof extra.comments!=='undefined'){program.comments=extra.comments;}if(typeof extra.tokens!=='undefined'){filterTokenLocation();program.tokens=extra.tokens;}if(typeof extra.errors!=='undefined'){program.errors=extra.errors;}}catch(e){throw e;}finally {extra={};}return program;} // Sync with *.json manifests.
	exports.version='2.7.2';exports.tokenize=tokenize;exports.parse=parse; // Deep copy.
	/* istanbul ignore next */exports.Syntax=function(){var name,types={};if(typeof Object.create==='function'){types=Object.create(null);}for(name in Syntax){if(Syntax.hasOwnProperty(name)){types[name]=Syntax[name];}}if(typeof Object.freeze==='function'){Object.freeze(types);}return types;}();}); /* vim: set sw=4 ts=4 et tw=80 : */

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/*eslint-disable no-use-before-define*/

	var common = __webpack_require__(16);
	var YAMLException = __webpack_require__(17);
	var DEFAULT_FULL_SCHEMA = __webpack_require__(39);
	var DEFAULT_SAFE_SCHEMA = __webpack_require__(19);

	var _toString = Object.prototype.toString;
	var _hasOwnProperty = Object.prototype.hasOwnProperty;

	var CHAR_TAB = 0x09; /* Tab */
	var CHAR_LINE_FEED = 0x0A; /* LF */
	var CHAR_CARRIAGE_RETURN = 0x0D; /* CR */
	var CHAR_SPACE = 0x20; /* Space */
	var CHAR_EXCLAMATION = 0x21; /* ! */
	var CHAR_DOUBLE_QUOTE = 0x22; /* " */
	var CHAR_SHARP = 0x23; /* # */
	var CHAR_PERCENT = 0x25; /* % */
	var CHAR_AMPERSAND = 0x26; /* & */
	var CHAR_SINGLE_QUOTE = 0x27; /* ' */
	var CHAR_ASTERISK = 0x2A; /* * */
	var CHAR_COMMA = 0x2C; /* , */
	var CHAR_MINUS = 0x2D; /* - */
	var CHAR_COLON = 0x3A; /* : */
	var CHAR_GREATER_THAN = 0x3E; /* > */
	var CHAR_QUESTION = 0x3F; /* ? */
	var CHAR_COMMERCIAL_AT = 0x40; /* @ */
	var CHAR_LEFT_SQUARE_BRACKET = 0x5B; /* [ */
	var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
	var CHAR_GRAVE_ACCENT = 0x60; /* ` */
	var CHAR_LEFT_CURLY_BRACKET = 0x7B; /* { */
	var CHAR_VERTICAL_LINE = 0x7C; /* | */
	var CHAR_RIGHT_CURLY_BRACKET = 0x7D; /* } */

	var ESCAPE_SEQUENCES = {};

	ESCAPE_SEQUENCES[0x00] = '\\0';
	ESCAPE_SEQUENCES[0x07] = '\\a';
	ESCAPE_SEQUENCES[0x08] = '\\b';
	ESCAPE_SEQUENCES[0x09] = '\\t';
	ESCAPE_SEQUENCES[0x0A] = '\\n';
	ESCAPE_SEQUENCES[0x0B] = '\\v';
	ESCAPE_SEQUENCES[0x0C] = '\\f';
	ESCAPE_SEQUENCES[0x0D] = '\\r';
	ESCAPE_SEQUENCES[0x1B] = '\\e';
	ESCAPE_SEQUENCES[0x22] = '\\"';
	ESCAPE_SEQUENCES[0x5C] = '\\\\';
	ESCAPE_SEQUENCES[0x85] = '\\N';
	ESCAPE_SEQUENCES[0xA0] = '\\_';
	ESCAPE_SEQUENCES[0x2028] = '\\L';
	ESCAPE_SEQUENCES[0x2029] = '\\P';

	var DEPRECATED_BOOLEANS_SYNTAX = ['y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON', 'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'];

	function compileStyleMap(schema, map) {
	  var result, keys, index, length, tag, style, type;

	  if (map === null) return {};

	  result = {};
	  keys = Object.keys(map);

	  for (index = 0, length = keys.length; index < length; index += 1) {
	    tag = keys[index];
	    style = String(map[tag]);

	    if (tag.slice(0, 2) === '!!') {
	      tag = 'tag:yaml.org,2002:' + tag.slice(2);
	    }

	    type = schema.compiledTypeMap[tag];

	    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
	      style = type.styleAliases[style];
	    }

	    result[tag] = style;
	  }

	  return result;
	}

	function encodeHex(character) {
	  var string, handle, length;

	  string = character.toString(16).toUpperCase();

	  if (character <= 0xFF) {
	    handle = 'x';
	    length = 2;
	  } else if (character <= 0xFFFF) {
	    handle = 'u';
	    length = 4;
	  } else if (character <= 0xFFFFFFFF) {
	    handle = 'U';
	    length = 8;
	  } else {
	    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
	  }

	  return '\\' + handle + common.repeat('0', length - string.length) + string;
	}

	function State(options) {
	  this.schema = options['schema'] || DEFAULT_FULL_SCHEMA;
	  this.indent = Math.max(1, options['indent'] || 2);
	  this.skipInvalid = options['skipInvalid'] || false;
	  this.flowLevel = common.isNothing(options['flowLevel']) ? -1 : options['flowLevel'];
	  this.styleMap = compileStyleMap(this.schema, options['styles'] || null);
	  this.sortKeys = options['sortKeys'] || false;
	  this.lineWidth = options['lineWidth'] || 80;
	  this.noRefs = options['noRefs'] || false;
	  this.noCompatMode = options['noCompatMode'] || false;

	  this.implicitTypes = this.schema.compiledImplicit;
	  this.explicitTypes = this.schema.compiledExplicit;

	  this.tag = null;
	  this.result = '';

	  this.duplicates = [];
	  this.usedDuplicates = null;
	}

	function indentString(string, spaces) {
	  var ind = common.repeat(' ', spaces),
	      position = 0,
	      next = -1,
	      result = '',
	      line,
	      length = string.length;

	  while (position < length) {
	    next = string.indexOf('\n', position);
	    if (next === -1) {
	      line = string.slice(position);
	      position = length;
	    } else {
	      line = string.slice(position, next + 1);
	      position = next + 1;
	    }

	    if (line.length && line !== '\n') result += ind;

	    result += line;
	  }

	  return result;
	}

	function generateNextLine(state, level) {
	  return '\n' + common.repeat(' ', state.indent * level);
	}

	function testImplicitResolving(state, str) {
	  var index, length, type;

	  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
	    type = state.implicitTypes[index];

	    if (type.resolve(str)) {
	      return true;
	    }
	  }

	  return false;
	}

	function StringBuilder(source) {
	  this.source = source;
	  this.result = '';
	  this.checkpoint = 0;
	}

	StringBuilder.prototype.takeUpTo = function (position) {
	  var er;

	  if (position < this.checkpoint) {
	    er = new Error('position should be > checkpoint');
	    er.position = position;
	    er.checkpoint = this.checkpoint;
	    throw er;
	  }

	  this.result += this.source.slice(this.checkpoint, position);
	  this.checkpoint = position;
	  return this;
	};

	StringBuilder.prototype.escapeChar = function () {
	  var character, esc;

	  character = this.source.charCodeAt(this.checkpoint);
	  esc = ESCAPE_SEQUENCES[character] || encodeHex(character);
	  this.result += esc;
	  this.checkpoint += 1;

	  return this;
	};

	StringBuilder.prototype.finish = function () {
	  if (this.source.length > this.checkpoint) {
	    this.takeUpTo(this.source.length);
	  }
	};

	function writeScalar(state, object, level, iskey) {
	  var simple, first, spaceWrap, folded, literal, single, double, sawLineFeed, linePosition, longestLine, indent, max, character, position, escapeSeq, hexEsc, previous, lineLength, modifier, trailingLineBreaks, result;

	  if (object.length === 0) {
	    state.dump = "''";
	    return;
	  }

	  if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(object) !== -1) {
	    state.dump = "'" + object + "'";
	    return;
	  }

	  simple = true;
	  first = object.length ? object.charCodeAt(0) : 0;
	  spaceWrap = CHAR_SPACE === first || CHAR_SPACE === object.charCodeAt(object.length - 1);

	  // Simplified check for restricted first characters
	  // http://www.yaml.org/spec/1.2/spec.html#ns-plain-first%28c%29
	  if (CHAR_MINUS === first || CHAR_QUESTION === first || CHAR_COMMERCIAL_AT === first || CHAR_GRAVE_ACCENT === first) {
	    simple = false;
	  }

	  // Can only use > and | if not wrapped in spaces or is not a key.
	  // Also, don't use if in flow mode.
	  if (spaceWrap || state.flowLevel > -1 && state.flowLevel <= level) {
	    if (spaceWrap) simple = false;

	    folded = false;
	    literal = false;
	  } else {
	    folded = !iskey;
	    literal = !iskey;
	  }

	  single = true;
	  double = new StringBuilder(object);

	  sawLineFeed = false;
	  linePosition = 0;
	  longestLine = 0;

	  indent = state.indent * level;
	  max = state.lineWidth;

	  // Replace -1 with biggest ingeger number according to
	  // http://ecma262-5.com/ELS5_HTML.htm#Section_8.5
	  if (max === -1) max = 9007199254740991;

	  if (indent < 40) max -= indent;else max = 40;

	  for (position = 0; position < object.length; position++) {
	    character = object.charCodeAt(position);
	    if (simple) {
	      // Characters that can never appear in the simple scalar
	      if (!simpleChar(character)) {
	        simple = false;
	      } else {
	        // Still simple.  If we make it all the way through like
	        // this, then we can just dump the string as-is.
	        continue;
	      }
	    }

	    if (single && character === CHAR_SINGLE_QUOTE) {
	      single = false;
	    }

	    escapeSeq = ESCAPE_SEQUENCES[character];
	    hexEsc = needsHexEscape(character);

	    if (!escapeSeq && !hexEsc) {
	      continue;
	    }

	    if (character !== CHAR_LINE_FEED && character !== CHAR_DOUBLE_QUOTE && character !== CHAR_SINGLE_QUOTE) {
	      folded = false;
	      literal = false;
	    } else if (character === CHAR_LINE_FEED) {
	      sawLineFeed = true;
	      single = false;
	      if (position > 0) {
	        previous = object.charCodeAt(position - 1);
	        if (previous === CHAR_SPACE) {
	          literal = false;
	          folded = false;
	        }
	      }
	      if (folded) {
	        lineLength = position - linePosition;
	        linePosition = position;
	        if (lineLength > longestLine) longestLine = lineLength;
	      }
	    }

	    if (character !== CHAR_DOUBLE_QUOTE) single = false;

	    double.takeUpTo(position);
	    double.escapeChar();
	  }

	  if (simple && testImplicitResolving(state, object)) simple = false;

	  modifier = '';
	  if (folded || literal) {
	    trailingLineBreaks = 0;
	    if (object.charCodeAt(object.length - 1) === CHAR_LINE_FEED) {
	      trailingLineBreaks += 1;
	      if (object.charCodeAt(object.length - 2) === CHAR_LINE_FEED) {
	        trailingLineBreaks += 1;
	      }
	    }

	    if (trailingLineBreaks === 0) modifier = '-';else if (trailingLineBreaks === 2) modifier = '+';
	  }

	  if (literal && longestLine < max || state.tag !== null) {
	    folded = false;
	  }

	  // If it's literally one line, then don't bother with the literal.
	  // We may still want to do a fold, though, if it's a super long line.
	  if (!sawLineFeed) literal = false;

	  if (simple) {
	    state.dump = object;
	  } else if (single) {
	    state.dump = '\'' + object + '\'';
	  } else if (folded) {
	    result = fold(object, max);
	    state.dump = '>' + modifier + '\n' + indentString(result, indent);
	  } else if (literal) {
	    if (!modifier) object = object.replace(/\n$/, '');
	    state.dump = '|' + modifier + '\n' + indentString(object, indent);
	  } else if (double) {
	    double.finish();
	    state.dump = '"' + double.result + '"';
	  } else {
	    throw new Error('Failed to dump scalar value');
	  }

	  return;
	}

	// The `trailing` var is a regexp match of any trailing `\n` characters.
	//
	// There are three cases we care about:
	//
	// 1. One trailing `\n` on the string.  Just use `|` or `>`.
	//    This is the assumed default. (trailing = null)
	// 2. No trailing `\n` on the string.  Use `|-` or `>-` to "chomp" the end.
	// 3. More than one trailing `\n` on the string.  Use `|+` or `>+`.
	//
	// In the case of `>+`, these line breaks are *not* doubled (like the line
	// breaks within the string), so it's important to only end with the exact
	// same number as we started.
	function fold(object, max) {
	  var result = '',
	      position = 0,
	      length = object.length,
	      trailing = /\n+$/.exec(object),
	      newLine;

	  if (trailing) {
	    length = trailing.index + 1;
	  }

	  while (position < length) {
	    newLine = object.indexOf('\n', position);
	    if (newLine > length || newLine === -1) {
	      if (result) result += '\n\n';
	      result += foldLine(object.slice(position, length), max);
	      position = length;
	    } else {
	      if (result) result += '\n\n';
	      result += foldLine(object.slice(position, newLine), max);
	      position = newLine + 1;
	    }
	  }

	  if (trailing && trailing[0] !== '\n') result += trailing[0];

	  return result;
	}

	function foldLine(line, max) {
	  if (line === '') return line;

	  var foldRe = /[^\s] [^\s]/g,
	      result = '',
	      prevMatch = 0,
	      foldStart = 0,
	      match = foldRe.exec(line),
	      index,
	      foldEnd,
	      folded;

	  while (match) {
	    index = match.index;

	    // when we cross the max len, if the previous match would've
	    // been ok, use that one, and carry on.  If there was no previous
	    // match on this fold section, then just have a long line.
	    if (index - foldStart > max) {
	      if (prevMatch !== foldStart) foldEnd = prevMatch;else foldEnd = index;

	      if (result) result += '\n';
	      folded = line.slice(foldStart, foldEnd);
	      result += folded;
	      foldStart = foldEnd + 1;
	    }
	    prevMatch = index + 1;
	    match = foldRe.exec(line);
	  }

	  if (result) result += '\n';

	  // if we end up with one last word at the end, then the last bit might
	  // be slightly bigger than we wanted, because we exited out of the loop.
	  if (foldStart !== prevMatch && line.length - foldStart > max) {
	    result += line.slice(foldStart, prevMatch) + '\n' + line.slice(prevMatch + 1);
	  } else {
	    result += line.slice(foldStart);
	  }

	  return result;
	}

	// Returns true if character can be found in a simple scalar
	function simpleChar(character) {
	  return CHAR_TAB !== character && CHAR_LINE_FEED !== character && CHAR_CARRIAGE_RETURN !== character && CHAR_COMMA !== character && CHAR_LEFT_SQUARE_BRACKET !== character && CHAR_RIGHT_SQUARE_BRACKET !== character && CHAR_LEFT_CURLY_BRACKET !== character && CHAR_RIGHT_CURLY_BRACKET !== character && CHAR_SHARP !== character && CHAR_AMPERSAND !== character && CHAR_ASTERISK !== character && CHAR_EXCLAMATION !== character && CHAR_VERTICAL_LINE !== character && CHAR_GREATER_THAN !== character && CHAR_SINGLE_QUOTE !== character && CHAR_DOUBLE_QUOTE !== character && CHAR_PERCENT !== character && CHAR_COLON !== character && !ESCAPE_SEQUENCES[character] && !needsHexEscape(character);
	}

	// Returns true if the character code needs to be escaped.
	function needsHexEscape(character) {
	  return !(0x00020 <= character && character <= 0x00007E || character === 0x00085 || 0x000A0 <= character && character <= 0x00D7FF || 0x0E000 <= character && character <= 0x00FFFD || 0x10000 <= character && character <= 0x10FFFF);
	}

	function writeFlowSequence(state, level, object) {
	  var _result = '',
	      _tag = state.tag,
	      index,
	      length;

	  for (index = 0, length = object.length; index < length; index += 1) {
	    // Write only valid elements.
	    if (writeNode(state, level, object[index], false, false)) {
	      if (index !== 0) _result += ', ';
	      _result += state.dump;
	    }
	  }

	  state.tag = _tag;
	  state.dump = '[' + _result + ']';
	}

	function writeBlockSequence(state, level, object, compact) {
	  var _result = '',
	      _tag = state.tag,
	      index,
	      length;

	  for (index = 0, length = object.length; index < length; index += 1) {
	    // Write only valid elements.
	    if (writeNode(state, level + 1, object[index], true, true)) {
	      if (!compact || index !== 0) {
	        _result += generateNextLine(state, level);
	      }
	      _result += '- ' + state.dump;
	    }
	  }

	  state.tag = _tag;
	  state.dump = _result || '[]'; // Empty sequence if no valid values.
	}

	function writeFlowMapping(state, level, object) {
	  var _result = '',
	      _tag = state.tag,
	      objectKeyList = Object.keys(object),
	      index,
	      length,
	      objectKey,
	      objectValue,
	      pairBuffer;

	  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
	    pairBuffer = '';

	    if (index !== 0) pairBuffer += ', ';

	    objectKey = objectKeyList[index];
	    objectValue = object[objectKey];

	    if (!writeNode(state, level, objectKey, false, false)) {
	      continue; // Skip this pair because of invalid key;
	    }

	    if (state.dump.length > 1024) pairBuffer += '? ';

	    pairBuffer += state.dump + ': ';

	    if (!writeNode(state, level, objectValue, false, false)) {
	      continue; // Skip this pair because of invalid value.
	    }

	    pairBuffer += state.dump;

	    // Both key and value are valid.
	    _result += pairBuffer;
	  }

	  state.tag = _tag;
	  state.dump = '{' + _result + '}';
	}

	function writeBlockMapping(state, level, object, compact) {
	  var _result = '',
	      _tag = state.tag,
	      objectKeyList = Object.keys(object),
	      index,
	      length,
	      objectKey,
	      objectValue,
	      explicitPair,
	      pairBuffer;

	  // Allow sorting keys so that the output file is deterministic
	  if (state.sortKeys === true) {
	    // Default sorting
	    objectKeyList.sort();
	  } else if (typeof state.sortKeys === 'function') {
	    // Custom sort function
	    objectKeyList.sort(state.sortKeys);
	  } else if (state.sortKeys) {
	    // Something is wrong
	    throw new YAMLException('sortKeys must be a boolean or a function');
	  }

	  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
	    pairBuffer = '';

	    if (!compact || index !== 0) {
	      pairBuffer += generateNextLine(state, level);
	    }

	    objectKey = objectKeyList[index];
	    objectValue = object[objectKey];

	    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
	      continue; // Skip this pair because of invalid key.
	    }

	    explicitPair = state.tag !== null && state.tag !== '?' || state.dump && state.dump.length > 1024;

	    if (explicitPair) {
	      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
	        pairBuffer += '?';
	      } else {
	        pairBuffer += '? ';
	      }
	    }

	    pairBuffer += state.dump;

	    if (explicitPair) {
	      pairBuffer += generateNextLine(state, level);
	    }

	    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
	      continue; // Skip this pair because of invalid value.
	    }

	    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
	      pairBuffer += ':';
	    } else {
	      pairBuffer += ': ';
	    }

	    pairBuffer += state.dump;

	    // Both key and value are valid.
	    _result += pairBuffer;
	  }

	  state.tag = _tag;
	  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
	}

	function detectType(state, object, explicit) {
	  var _result, typeList, index, length, type, style;

	  typeList = explicit ? state.explicitTypes : state.implicitTypes;

	  for (index = 0, length = typeList.length; index < length; index += 1) {
	    type = typeList[index];

	    if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === 'object' && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {

	      state.tag = explicit ? type.tag : '?';

	      if (type.represent) {
	        style = state.styleMap[type.tag] || type.defaultStyle;

	        if (_toString.call(type.represent) === '[object Function]') {
	          _result = type.represent(object, style);
	        } else if (_hasOwnProperty.call(type.represent, style)) {
	          _result = type.represent[style](object, style);
	        } else {
	          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
	        }

	        state.dump = _result;
	      }

	      return true;
	    }
	  }

	  return false;
	}

	// Serializes `object` and writes it to global `result`.
	// Returns true on success, or false on invalid object.
	//
	function writeNode(state, level, object, block, compact, iskey) {
	  state.tag = null;
	  state.dump = object;

	  if (!detectType(state, object, false)) {
	    detectType(state, object, true);
	  }

	  var type = _toString.call(state.dump);

	  if (block) {
	    block = state.flowLevel < 0 || state.flowLevel > level;
	  }

	  var objectOrArray = type === '[object Object]' || type === '[object Array]',
	      duplicateIndex,
	      duplicate;

	  if (objectOrArray) {
	    duplicateIndex = state.duplicates.indexOf(object);
	    duplicate = duplicateIndex !== -1;
	  }

	  if (state.tag !== null && state.tag !== '?' || duplicate || state.indent !== 2 && level > 0) {
	    compact = false;
	  }

	  if (duplicate && state.usedDuplicates[duplicateIndex]) {
	    state.dump = '*ref_' + duplicateIndex;
	  } else {
	    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
	      state.usedDuplicates[duplicateIndex] = true;
	    }
	    if (type === '[object Object]') {
	      if (block && Object.keys(state.dump).length !== 0) {
	        writeBlockMapping(state, level, state.dump, compact);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + state.dump;
	        }
	      } else {
	        writeFlowMapping(state, level, state.dump);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
	        }
	      }
	    } else if (type === '[object Array]') {
	      if (block && state.dump.length !== 0) {
	        writeBlockSequence(state, level, state.dump, compact);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + state.dump;
	        }
	      } else {
	        writeFlowSequence(state, level, state.dump);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
	        }
	      }
	    } else if (type === '[object String]') {
	      if (state.tag !== '?') {
	        writeScalar(state, state.dump, level, iskey);
	      }
	    } else {
	      if (state.skipInvalid) return false;
	      throw new YAMLException('unacceptable kind of an object to dump ' + type);
	    }

	    if (state.tag !== null && state.tag !== '?') {
	      state.dump = '!<' + state.tag + '> ' + state.dump;
	    }
	  }

	  return true;
	}

	function getDuplicateReferences(object, state) {
	  var objects = [],
	      duplicatesIndexes = [],
	      index,
	      length;

	  inspectNode(object, objects, duplicatesIndexes);

	  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
	    state.duplicates.push(objects[duplicatesIndexes[index]]);
	  }
	  state.usedDuplicates = new Array(length);
	}

	function inspectNode(object, objects, duplicatesIndexes) {
	  var objectKeyList, index, length;

	  if (object !== null && typeof object === 'object') {
	    index = objects.indexOf(object);
	    if (index !== -1) {
	      if (duplicatesIndexes.indexOf(index) === -1) {
	        duplicatesIndexes.push(index);
	      }
	    } else {
	      objects.push(object);

	      if (Array.isArray(object)) {
	        for (index = 0, length = object.length; index < length; index += 1) {
	          inspectNode(object[index], objects, duplicatesIndexes);
	        }
	      } else {
	        objectKeyList = Object.keys(object);

	        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
	          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
	        }
	      }
	    }
	  }
	}

	function dump(input, options) {
	  options = options || {};

	  var state = new State(options);

	  if (!state.noRefs) getDuplicateReferences(input, state);

	  if (writeNode(state, 0, input, true, true)) return state.dump + '\n';

	  return '';
	}

	function safeDump(input, options) {
	  return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
	}

	module.exports.dump = dump;
	module.exports.safeDump = safeDump;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/* doT + auto-compilation of doT templates
	 *
	 * 2012, Laura Doktorova, https://github.com/olado/doT
	 * Licensed under the MIT license
	 *
	 * Compiles .def, .dot, .jst files found under the specified path.
	 * It ignores sub-directories.
	 * Template files can have multiple extensions at the same time.
	 * Files with .def extension can be included in other files via {{#def.name}}
	 * Files with .dot extension are compiled into functions with the same name and
	 * can be accessed as renderer.filename
	 * Files with .jst extension are compiled into .js files. Produced .js file can be
	 * loaded as a commonJS, AMD module, or just installed into a global variable
	 * (default is set to window.render).
	 * All inline defines defined in the .jst file are
	 * compiled into separate functions and are available via _render.filename.definename
	 *
	 * Basic usage:
	 * var dots = require("dot").process({path: "./views"});
	 * dots.mytemplate({foo:"hello world"});
	 *
	 * The above snippet will:
	 * 1. Compile all templates in views folder (.dot, .def, .jst)
	 * 2. Place .js files compiled from .jst templates into the same folder.
	 *    These files can be used with require, i.e. require("./views/mytemplate").
	 * 3. Return an object with functions compiled from .dot templates as its properties.
	 * 4. Render mytemplate template.
	 */

	var fs = __webpack_require__(7),
	    doT = module.exports = __webpack_require__(46);

	doT.process = function (options) {
		//path, destination, global, rendermodule, templateSettings
		return new InstallDots(options).compileAll();
	};

	function InstallDots(o) {
		this.__path = o.path || "./";
		if (this.__path[this.__path.length - 1] !== '/') this.__path += '/';
		this.__destination = o.destination || this.__path;
		if (this.__destination[this.__destination.length - 1] !== '/') this.__destination += '/';
		this.__global = o.global || "window.render";
		this.__rendermodule = o.rendermodule || {};
		this.__settings = o.templateSettings ? copy(o.templateSettings, copy(doT.templateSettings)) : undefined;
		this.__includes = {};
	}

	InstallDots.prototype.compileToFile = function (path, template, def) {
		def = def || {};
		var modulename = path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf(".")),
		    defs = copy(this.__includes, copy(def)),
		    settings = this.__settings || doT.templateSettings,
		    compileoptions = copy(settings),
		    defaultcompiled = doT.template(template, settings, defs),
		    exports = [],
		    compiled = "",
		    fn;

		for (var property in defs) {
			if (defs[property] !== def[property] && defs[property] !== this.__includes[property]) {
				fn = undefined;
				if (typeof defs[property] === 'string') {
					fn = doT.template(defs[property], settings, defs);
				} else if (typeof defs[property] === 'function') {
					fn = defs[property];
				} else if (defs[property].arg) {
					compileoptions.varname = defs[property].arg;
					fn = doT.template(defs[property].text, compileoptions, defs);
				}
				if (fn) {
					compiled += fn.toString().replace('anonymous', property);
					exports.push(property);
				}
			}
		}
		compiled += defaultcompiled.toString().replace('anonymous', modulename);
		fs.writeFileSync(path, "(function(){" + compiled + "var itself=" + modulename + ", _encodeHTML=(" + doT.encodeHTMLSource.toString() + "(" + (settings.doNotSkipEncoded || '') + "));" + addexports(exports) + "if(typeof module!=='undefined' && module.exports) module.exports=itself;else if(typeof define==='function')define(function(){return itself;});else {" + this.__global + "=" + this.__global + "||{};" + this.__global + "['" + modulename + "']=itself;}}());");
	};

	function addexports(exports) {
		for (var ret = '', i = 0; i < exports.length; i++) {
			ret += "itself." + exports[i] + "=" + exports[i] + ";";
		}
		return ret;
	}

	function copy(o, to) {
		to = to || {};
		for (var property in o) {
			to[property] = o[property];
		}
		return to;
	}

	function readdata(path) {
		var data = fs.readFileSync(path);
		if (data) return data.toString();
		console.log("problems with " + path);
	}

	InstallDots.prototype.compilePath = function (path) {
		var data = readdata(path);
		if (data) {
			return doT.template(data, this.__settings || doT.templateSettings, copy(this.__includes));
		}
	};

	InstallDots.prototype.compileAll = function () {
		console.log("Compiling all doT templates...");

		var defFolder = this.__path,
		    sources = fs.readdirSync(defFolder),
		    k,
		    l,
		    name;

		for (k = 0, l = sources.length; k < l; k++) {
			name = sources[k];
			if (/\.def(\.dot|\.jst)?$/.test(name)) {
				console.log("Loaded def " + name);
				this.__includes[name.substring(0, name.indexOf('.'))] = readdata(defFolder + name);
			}
		}

		for (k = 0, l = sources.length; k < l; k++) {
			name = sources[k];
			if (/\.dot(\.def|\.jst)?$/.test(name)) {
				console.log("Compiling " + name + " to function");
				this.__rendermodule[name.substring(0, name.indexOf('.'))] = this.compilePath(defFolder + name);
			}
			if (/\.jst(\.dot|\.def)?$/.test(name)) {
				console.log("Compiling " + name + " to file");
				this.compileToFile(this.__destination + name.substring(0, name.indexOf('.')) + '.js', readdata(defFolder + name));
			}
		}
		return this.__rendermodule;
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;// doT.js
	// 2011-2014, Laura Doktorova, https://github.com/olado/doT
	// Licensed under the MIT license.

	(function () {
		"use strict";

		var doT = {
			version: "1.0.3",
			templateSettings: {
				evaluate: /\{\{([\s\S]+?(\}?)+)\}\}/g,
				interpolate: /\{\{=([\s\S]+?)\}\}/g,
				encode: /\{\{!([\s\S]+?)\}\}/g,
				use: /\{\{#([\s\S]+?)\}\}/g,
				useParams: /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
				define: /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
				defineParams: /^\s*([\w$]+):([\s\S]+)/,
				conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
				iterate: /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
				varname: "it",
				strip: true,
				append: true,
				selfcontained: false,
				doNotSkipEncoded: false
			},
			template: undefined, //fn, compile template
			compile: undefined //fn, for express
		},
		    _globals;

		doT.encodeHTMLSource = function (doNotSkipEncoded) {
			var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			    matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
			return function (code) {
				return code ? code.toString().replace(matchHTML, function (m) {
					return encodeHTMLRules[m] || m;
				}) : "";
			};
		};

		_globals = function () {
			return this || (0, eval)("this");
		}();

		if (typeof module !== "undefined" && module.exports) {
			module.exports = doT;
		} else if (true) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
				return doT;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else {
			_globals.doT = doT;
		}

		var startend = {
			append: { start: "'+(", end: ")+'", startencode: "'+encodeHTML(" },
			split: { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" }
		},
		    skip = /$^/;

		function resolveDefs(c, block, def) {
			return (typeof block === "string" ? block : block.toString()).replace(c.define || skip, function (m, code, assign, value) {
				if (code.indexOf("def.") === 0) {
					code = code.substring(4);
				}
				if (!(code in def)) {
					if (assign === ":") {
						if (c.defineParams) value.replace(c.defineParams, function (m, param, v) {
							def[code] = { arg: param, text: v };
						});
						if (!(code in def)) def[code] = value;
					} else {
						new Function("def", "def['" + code + "']=" + value)(def);
					}
				}
				return "";
			}).replace(c.use || skip, function (m, code) {
				if (c.useParams) code = code.replace(c.useParams, function (m, s, d, param) {
					if (def[d] && def[d].arg && param) {
						var rw = (d + ":" + param).replace(/'|\\/g, "_");
						def.__exp = def.__exp || {};
						def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
						return s + "def.__exp['" + rw + "']";
					}
				});
				var v = new Function("def", "return " + code)(def);
				return v ? resolveDefs(c, v, def) : v;
			});
		}

		function unescape(code) {
			return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
		}

		doT.template = function (tmpl, c, def) {
			c = c || doT.templateSettings;
			var cse = c.append ? startend.append : startend.split,
			    needhtmlencode,
			    sid = 0,
			    indv,
			    str = c.use || c.define ? resolveDefs(c, tmpl, def || {}) : tmpl;

			str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, " ").replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, "") : str).replace(/'|\\/g, "\\$&").replace(c.interpolate || skip, function (m, code) {
				return cse.start + unescape(code) + cse.end;
			}).replace(c.encode || skip, function (m, code) {
				needhtmlencode = true;
				return cse.startencode + unescape(code) + cse.end;
			}).replace(c.conditional || skip, function (m, elsecase, code) {
				return elsecase ? code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='" : code ? "';if(" + unescape(code) + "){out+='" : "';}out+='";
			}).replace(c.iterate || skip, function (m, iterate, vname, iname) {
				if (!iterate) return "';} } out+='";
				sid += 1;indv = iname || "i" + sid;iterate = unescape(iterate);
				return "';var arr" + sid + "=" + iterate + ";if(arr" + sid + "){var " + vname + "," + indv + "=-1,l" + sid + "=arr" + sid + ".length-1;while(" + indv + "<l" + sid + "){" + vname + "=arr" + sid + "[" + indv + "+=1];out+='";
			}).replace(c.evaluate || skip, function (m, code) {
				return "';" + unescape(code) + "out+='";
			}) + "';return out;").replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r").replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
			//.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

			if (needhtmlencode) {
				if (!c.selfcontained && _globals && !_globals._encodeHTML) _globals._encodeHTML = doT.encodeHTMLSource(c.doNotSkipEncoded);
				str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : (" + doT.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));" + str;
			}
			try {
				return new Function(c.varname, str);
			} catch (e) {
				if (typeof console !== "undefined") console.log("Could not create a template function: " + str);
				throw e;
			}
		};

		doT.compile = function (tmpl, def) {
			return doT.template(tmpl, null, def);
		};
	})();

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(48);

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	// Main perser class

	'use strict';

	var utils = __webpack_require__(49);
	var helpers = __webpack_require__(63);
	var Renderer = __webpack_require__(67);
	var ParserCore = __webpack_require__(68);
	var ParserBlock = __webpack_require__(78);
	var ParserInline = __webpack_require__(93);
	var LinkifyIt = __webpack_require__(109);
	var mdurl = __webpack_require__(53);
	var punycode = __webpack_require__(111);

	var config = {
	  'default': __webpack_require__(113),
	  zero: __webpack_require__(114),
	  commonmark: __webpack_require__(115)
	};

	////////////////////////////////////////////////////////////////////////////////
	//
	// This validator can prohibit more than really needed to prevent XSS. It's a
	// tradeoff to keep code simple and to be secure by default.
	//
	// If you need different setup - override validator method as you wish. Or
	// replace it with dummy function and use external sanitizer.
	//

	var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
	var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;

	function validateLink(url) {
	  // url should be normalized at this point, and existing entities are decoded
	  var str = url.trim().toLowerCase();

	  return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) ? true : false : true;
	}

	////////////////////////////////////////////////////////////////////////////////

	var RECODE_HOSTNAME_FOR = ['http:', 'https:', 'mailto:'];

	function normalizeLink(url) {
	  var parsed = mdurl.parse(url, true);

	  if (parsed.hostname) {
	    // Encode hostnames in urls like:
	    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
	    //
	    // We don't encode unknown schemas, because it's likely that we encode
	    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
	    //
	    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
	      try {
	        parsed.hostname = punycode.toASCII(parsed.hostname);
	      } catch (er) {/**/}
	    }
	  }

	  return mdurl.encode(mdurl.format(parsed));
	}

	function normalizeLinkText(url) {
	  var parsed = mdurl.parse(url, true);

	  if (parsed.hostname) {
	    // Encode hostnames in urls like:
	    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
	    //
	    // We don't encode unknown schemas, because it's likely that we encode
	    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
	    //
	    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
	      try {
	        parsed.hostname = punycode.toUnicode(parsed.hostname);
	      } catch (er) {/**/}
	    }
	  }

	  return mdurl.decode(mdurl.format(parsed));
	}

	/**
	 * class MarkdownIt
	 *
	 * Main parser/renderer class.
	 *
	 * ##### Usage
	 *
	 * ```javascript
	 * // node.js, "classic" way:
	 * var MarkdownIt = require('markdown-it'),
	 *     md = new MarkdownIt();
	 * var result = md.render('# markdown-it rulezz!');
	 *
	 * // node.js, the same, but with sugar:
	 * var md = require('markdown-it')();
	 * var result = md.render('# markdown-it rulezz!');
	 *
	 * // browser without AMD, added to "window" on script load
	 * // Note, there are no dash.
	 * var md = window.markdownit();
	 * var result = md.render('# markdown-it rulezz!');
	 * ```
	 *
	 * Single line rendering, without paragraph wrap:
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 * var result = md.renderInline('__markdown-it__ rulezz!');
	 * ```
	 **/

	/**
	 * new MarkdownIt([presetName, options])
	 * - presetName (String): optional, `commonmark` / `zero`
	 * - options (Object)
	 *
	 * Creates parser instanse with given config. Can be called without `new`.
	 *
	 * ##### presetName
	 *
	 * MarkdownIt provides named presets as a convenience to quickly
	 * enable/disable active syntax rules and options for common use cases.
	 *
	 * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) -
	 *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
	 * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) -
	 *   similar to GFM, used when no preset name given. Enables all available rules,
	 *   but still without html, typographer & autolinker.
	 * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) -
	 *   all rules disabled. Useful to quickly setup your config via `.enable()`.
	 *   For example, when you need only `bold` and `italic` markup and nothing else.
	 *
	 * ##### options:
	 *
	 * - __html__ - `false`. Set `true` to enable HTML tags in source. Be careful!
	 *   That's not safe! You may need external sanitizer to protect output from XSS.
	 *   It's better to extend features via plugins, instead of enabling HTML.
	 * - __xhtmlOut__ - `false`. Set `true` to add '/' when closing single tags
	 *   (`<br />`). This is needed only for full CommonMark compatibility. In real
	 *   world you will need HTML output.
	 * - __breaks__ - `false`. Set `true` to convert `\n` in paragraphs into `<br>`.
	 * - __langPrefix__ - `language-`. CSS language class prefix for fenced blocks.
	 *   Can be useful for external highlighters.
	 * - __linkify__ - `false`. Set `true` to autoconvert URL-like text to links.
	 * - __typographer__  - `false`. Set `true` to enable [some language-neutral
	 *   replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js) +
	 *   quotes beautification (smartquotes).
	 * - __quotes__ - `“”‘’`, String or Array. Double + single quotes replacement
	 *   pairs, when typographer enabled and smartquotes on. For example, you can
	 *   use `'«»„“'` for Russian, `'„“‚‘'` for German, and
	 *   `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
	 * - __highlight__ - `null`. Highlighter function for fenced code blocks.
	 *   Highlighter `function (str, lang)` should return escaped HTML. It can also
	 *   return empty string if the source was not changed and should be escaped
	 *   externaly. If result starts with <pre... internal wrapper is skipped.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * // commonmark mode
	 * var md = require('markdown-it')('commonmark');
	 *
	 * // default mode
	 * var md = require('markdown-it')();
	 *
	 * // enable everything
	 * var md = require('markdown-it')({
	 *   html: true,
	 *   linkify: true,
	 *   typographer: true
	 * });
	 * ```
	 *
	 * ##### Syntax highlighting
	 *
	 * ```js
	 * var hljs = require('highlight.js') // https://highlightjs.org/
	 *
	 * var md = require('markdown-it')({
	 *   highlight: function (str, lang) {
	 *     if (lang && hljs.getLanguage(lang)) {
	 *       try {
	 *         return hljs.highlight(lang, str).value;
	 *       } catch (__) {}
	 *     }
	 *
	 *     return ''; // use external default escaping
	 *   }
	 * });
	 * ```
	 *
	 * Or with full wrapper override (if you need assign class to <pre>):
	 *
	 * ```javascript
	 * var hljs = require('highlight.js') // https://highlightjs.org/
	 *
	 * // Actual default values
	 * var md = require('markdown-it')({
	 *   highlight: function (str, lang) {
	 *     if (lang && hljs.getLanguage(lang)) {
	 *       try {
	 *         return '<pre class="hljs"><code>' +
	 *                hljs.highlight(lang, str).value +
	 *                '</code></pre>';
	 *       } catch (__) {}
	 *     }
	 *
	 *     return '<pre class="hljs"><code>' + md.utils.esccapeHtml(str) + '</code></pre>';
	 *   }
	 * });
	 * ```
	 *
	 **/
	function MarkdownIt(presetName, options) {
	  if (!(this instanceof MarkdownIt)) {
	    return new MarkdownIt(presetName, options);
	  }

	  if (!options) {
	    if (!utils.isString(presetName)) {
	      options = presetName || {};
	      presetName = 'default';
	    }
	  }

	  /**
	   * MarkdownIt#inline -> ParserInline
	   *
	   * Instance of [[ParserInline]]. You may need it to add new rules when
	   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
	   * [[MarkdownIt.enable]].
	   **/
	  this.inline = new ParserInline();

	  /**
	   * MarkdownIt#block -> ParserBlock
	   *
	   * Instance of [[ParserBlock]]. You may need it to add new rules when
	   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
	   * [[MarkdownIt.enable]].
	   **/
	  this.block = new ParserBlock();

	  /**
	   * MarkdownIt#core -> Core
	   *
	   * Instance of [[Core]] chain executor. You may need it to add new rules when
	   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
	   * [[MarkdownIt.enable]].
	   **/
	  this.core = new ParserCore();

	  /**
	   * MarkdownIt#renderer -> Renderer
	   *
	   * Instance of [[Renderer]]. Use it to modify output look. Or to add rendering
	   * rules for new token types, generated by plugins.
	   *
	   * ##### Example
	   *
	   * ```javascript
	   * var md = require('markdown-it')();
	   *
	   * function myToken(tokens, idx, options, env, self) {
	   *   //...
	   *   return result;
	   * };
	   *
	   * md.renderer.rules['my_token'] = myToken
	   * ```
	   *
	   * See [[Renderer]] docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js).
	   **/
	  this.renderer = new Renderer();

	  /**
	   * MarkdownIt#linkify -> LinkifyIt
	   *
	   * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
	   * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.js)
	   * rule.
	   **/
	  this.linkify = new LinkifyIt();

	  /**
	   * MarkdownIt#validateLink(url) -> Boolean
	   *
	   * Link validation function. CommonMark allows too much in links. By default
	   * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
	   * except some embedded image types.
	   *
	   * You can change this behaviour:
	   *
	   * ```javascript
	   * var md = require('markdown-it')();
	   * // enable everything
	   * md.validateLink = function () { return true; }
	   * ```
	   **/
	  this.validateLink = validateLink;

	  /**
	   * MarkdownIt#normalizeLink(url) -> String
	   *
	   * Function used to encode link url to a machine-readable format,
	   * which includes url-encoding, punycode, etc.
	   **/
	  this.normalizeLink = normalizeLink;

	  /**
	   * MarkdownIt#normalizeLinkText(url) -> String
	   *
	   * Function used to decode link url to a human-readable format`
	   **/
	  this.normalizeLinkText = normalizeLinkText;

	  // Expose utils & helpers for easy acces from plugins

	  /**
	   * MarkdownIt#utils -> utils
	   *
	   * Assorted utility functions, useful to write plugins. See details
	   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js).
	   **/
	  this.utils = utils;

	  /**
	   * MarkdownIt#helpers -> helpers
	   *
	   * Link components parser functions, useful to write plugins. See details
	   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/helpers).
	   **/
	  this.helpers = helpers;

	  this.options = {};
	  this.configure(presetName);

	  if (options) {
	    this.set(options);
	  }
	}

	/** chainable
	 * MarkdownIt.set(options)
	 *
	 * Set parser options (in the same format as in constructor). Probably, you
	 * will never need it, but you can change options after constructor call.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')()
	 *             .set({ html: true, breaks: true })
	 *             .set({ typographer, true });
	 * ```
	 *
	 * __Note:__ To achieve the best possible performance, don't modify a
	 * `markdown-it` instance options on the fly. If you need multiple configurations
	 * it's best to create multiple instances and initialize each with separate
	 * config.
	 **/
	MarkdownIt.prototype.set = function (options) {
	  utils.assign(this.options, options);
	  return this;
	};

	/** chainable, internal
	 * MarkdownIt.configure(presets)
	 *
	 * Batch load of all options and compenent settings. This is internal method,
	 * and you probably will not need it. But if you with - see available presets
	 * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
	 *
	 * We strongly recommend to use presets instead of direct config loads. That
	 * will give better compatibility with next versions.
	 **/
	MarkdownIt.prototype.configure = function (presets) {
	  var self = this,
	      presetName;

	  if (utils.isString(presets)) {
	    presetName = presets;
	    presets = config[presetName];
	    if (!presets) {
	      throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name');
	    }
	  }

	  if (!presets) {
	    throw new Error('Wrong `markdown-it` preset, can\'t be empty');
	  }

	  if (presets.options) {
	    self.set(presets.options);
	  }

	  if (presets.components) {
	    Object.keys(presets.components).forEach(function (name) {
	      if (presets.components[name].rules) {
	        self[name].ruler.enableOnly(presets.components[name].rules);
	      }
	      if (presets.components[name].rules2) {
	        self[name].ruler2.enableOnly(presets.components[name].rules2);
	      }
	    });
	  }
	  return this;
	};

	/** chainable
	 * MarkdownIt.enable(list, ignoreInvalid)
	 * - list (String|Array): rule name or list of rule names to enable
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Enable list or rules. It will automatically find appropriate components,
	 * containing rules with given names. If rule not found, and `ignoreInvalid`
	 * not set - throws exception.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')()
	 *             .enable(['sub', 'sup'])
	 *             .disable('smartquotes');
	 * ```
	 **/
	MarkdownIt.prototype.enable = function (list, ignoreInvalid) {
	  var result = [];

	  if (!Array.isArray(list)) {
	    list = [list];
	  }

	  ['core', 'block', 'inline'].forEach(function (chain) {
	    result = result.concat(this[chain].ruler.enable(list, true));
	  }, this);

	  result = result.concat(this.inline.ruler2.enable(list, true));

	  var missed = list.filter(function (name) {
	    return result.indexOf(name) < 0;
	  });

	  if (missed.length && !ignoreInvalid) {
	    throw new Error('MarkdownIt. Failed to enable unknown rule(s): ' + missed);
	  }

	  return this;
	};

	/** chainable
	 * MarkdownIt.disable(list, ignoreInvalid)
	 * - list (String|Array): rule name or list of rule names to disable.
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * The same as [[MarkdownIt.enable]], but turn specified rules off.
	 **/
	MarkdownIt.prototype.disable = function (list, ignoreInvalid) {
	  var result = [];

	  if (!Array.isArray(list)) {
	    list = [list];
	  }

	  ['core', 'block', 'inline'].forEach(function (chain) {
	    result = result.concat(this[chain].ruler.disable(list, true));
	  }, this);

	  result = result.concat(this.inline.ruler2.disable(list, true));

	  var missed = list.filter(function (name) {
	    return result.indexOf(name) < 0;
	  });

	  if (missed.length && !ignoreInvalid) {
	    throw new Error('MarkdownIt. Failed to disable unknown rule(s): ' + missed);
	  }
	  return this;
	};

	/** chainable
	 * MarkdownIt.use(plugin, params)
	 *
	 * Load specified plugin with given params into current parser instance.
	 * It's just a sugar to call `plugin(md, params)` with curring.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var iterator = require('markdown-it-for-inline');
	 * var md = require('markdown-it')()
	 *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
	 *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
	 *             });
	 * ```
	 **/
	MarkdownIt.prototype.use = function (plugin /*, params, ... */) {
	  var args = [this].concat(Array.prototype.slice.call(arguments, 1));
	  plugin.apply(plugin, args);
	  return this;
	};

	/** internal
	 * MarkdownIt.parse(src, env) -> Array
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * Parse input string and returns list of block tokens (special token type
	 * "inline" will contain list of inline tokens). You should not call this
	 * method directly, until you write custom renderer (for example, to produce
	 * AST).
	 *
	 * `env` is used to pass data between "distributed" rules and return additional
	 * metadata like reference info, needed for the renderer. It also can be used to
	 * inject data in specific cases. Usually, you will be ok to pass `{}`,
	 * and then pass updated object to renderer.
	 **/
	MarkdownIt.prototype.parse = function (src, env) {
	  var state = new this.core.State(src, this, env);

	  this.core.process(state);

	  return state.tokens;
	};

	/**
	 * MarkdownIt.render(src [, env]) -> String
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * Render markdown string into html. It does all magic for you :).
	 *
	 * `env` can be used to inject additional metadata (`{}` by default).
	 * But you will not need it with high probability. See also comment
	 * in [[MarkdownIt.parse]].
	 **/
	MarkdownIt.prototype.render = function (src, env) {
	  env = env || {};

	  return this.renderer.render(this.parse(src, env), this.options, env);
	};

	/** internal
	 * MarkdownIt.parseInline(src, env) -> Array
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * The same as [[MarkdownIt.parse]] but skip all block rules. It returns the
	 * block tokens list with the single `inline` element, containing parsed inline
	 * tokens in `children` property. Also updates `env` object.
	 **/
	MarkdownIt.prototype.parseInline = function (src, env) {
	  var state = new this.core.State(src, this, env);

	  state.inlineMode = true;
	  this.core.process(state);

	  return state.tokens;
	};

	/**
	 * MarkdownIt.renderInline(src [, env]) -> String
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * Similar to [[MarkdownIt.render]] but for single paragraph content. Result
	 * will NOT be wrapped into `<p>` tags.
	 **/
	MarkdownIt.prototype.renderInline = function (src, env) {
	  env = env || {};

	  return this.renderer.render(this.parseInline(src, env), this.options, env);
	};

	module.exports = MarkdownIt;

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	// Utilities
	//
	'use strict';

	function _class(obj) {
	  return Object.prototype.toString.call(obj);
	}

	function isString(obj) {
	  return _class(obj) === '[object String]';
	}

	var _hasOwnProperty = Object.prototype.hasOwnProperty;

	function has(object, key) {
	  return _hasOwnProperty.call(object, key);
	}

	// Merge objects
	//
	function assign(obj /*from1, from2, from3, ...*/) {
	  var sources = Array.prototype.slice.call(arguments, 1);

	  sources.forEach(function (source) {
	    if (!source) {
	      return;
	    }

	    if (typeof source !== 'object') {
	      throw new TypeError(source + 'must be object');
	    }

	    Object.keys(source).forEach(function (key) {
	      obj[key] = source[key];
	    });
	  });

	  return obj;
	}

	// Remove element from array and put another array at those position.
	// Useful for some operations with tokens
	function arrayReplaceAt(src, pos, newElements) {
	  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
	}

	////////////////////////////////////////////////////////////////////////////////

	function isValidEntityCode(c) {
	  /*eslint no-bitwise:0*/
	  // broken sequence
	  if (c >= 0xD800 && c <= 0xDFFF) {
	    return false;
	  }
	  // never used
	  if (c >= 0xFDD0 && c <= 0xFDEF) {
	    return false;
	  }
	  if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) {
	    return false;
	  }
	  // control codes
	  if (c >= 0x00 && c <= 0x08) {
	    return false;
	  }
	  if (c === 0x0B) {
	    return false;
	  }
	  if (c >= 0x0E && c <= 0x1F) {
	    return false;
	  }
	  if (c >= 0x7F && c <= 0x9F) {
	    return false;
	  }
	  // out of range
	  if (c > 0x10FFFF) {
	    return false;
	  }
	  return true;
	}

	function fromCodePoint(c) {
	  /*eslint no-bitwise:0*/
	  if (c > 0xffff) {
	    c -= 0x10000;
	    var surrogate1 = 0xd800 + (c >> 10),
	        surrogate2 = 0xdc00 + (c & 0x3ff);

	    return String.fromCharCode(surrogate1, surrogate2);
	  }
	  return String.fromCharCode(c);
	}

	var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;
	var ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
	var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi');

	var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;

	var entities = __webpack_require__(50);

	function replaceEntityPattern(match, name) {
	  var code = 0;

	  if (has(entities, name)) {
	    return entities[name];
	  }

	  if (name.charCodeAt(0) === 0x23 /* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
	    code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
	    if (isValidEntityCode(code)) {
	      return fromCodePoint(code);
	    }
	  }

	  return match;
	}

	/*function replaceEntities(str) {
	  if (str.indexOf('&') < 0) { return str; }

	  return str.replace(ENTITY_RE, replaceEntityPattern);
	}*/

	function unescapeMd(str) {
	  if (str.indexOf('\\') < 0) {
	    return str;
	  }
	  return str.replace(UNESCAPE_MD_RE, '$1');
	}

	function unescapeAll(str) {
	  if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) {
	    return str;
	  }

	  return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
	    if (escaped) {
	      return escaped;
	    }
	    return replaceEntityPattern(match, entity);
	  });
	}

	////////////////////////////////////////////////////////////////////////////////

	var HTML_ESCAPE_TEST_RE = /[&<>"]/;
	var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
	var HTML_REPLACEMENTS = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;'
	};

	function replaceUnsafeChar(ch) {
	  return HTML_REPLACEMENTS[ch];
	}

	function escapeHtml(str) {
	  if (HTML_ESCAPE_TEST_RE.test(str)) {
	    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
	  }
	  return str;
	}

	////////////////////////////////////////////////////////////////////////////////

	var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;

	function escapeRE(str) {
	  return str.replace(REGEXP_ESCAPE_RE, '\\$&');
	}

	////////////////////////////////////////////////////////////////////////////////

	function isSpace(code) {
	  switch (code) {
	    case 0x09:
	    case 0x20:
	      return true;
	  }
	  return false;
	}

	// Zs (unicode class) || [\t\f\v\r\n]
	function isWhiteSpace(code) {
	  if (code >= 0x2000 && code <= 0x200A) {
	    return true;
	  }
	  switch (code) {
	    case 0x09: // \t
	    case 0x0A: // \n
	    case 0x0B: // \v
	    case 0x0C: // \f
	    case 0x0D: // \r
	    case 0x20:
	    case 0xA0:
	    case 0x1680:
	    case 0x202F:
	    case 0x205F:
	    case 0x3000:
	      return true;
	  }
	  return false;
	}

	////////////////////////////////////////////////////////////////////////////////

	/*eslint-disable max-len*/
	var UNICODE_PUNCT_RE = __webpack_require__(52);

	// Currently without astral characters support.
	function isPunctChar(ch) {
	  return UNICODE_PUNCT_RE.test(ch);
	}

	// Markdown ASCII punctuation characters.
	//
	// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
	// http://spec.commonmark.org/0.15/#ascii-punctuation-character
	//
	// Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
	//
	function isMdAsciiPunct(ch) {
	  switch (ch) {
	    case 0x21 /* ! */:
	    case 0x22 /* " */:
	    case 0x23 /* # */:
	    case 0x24 /* $ */:
	    case 0x25 /* % */:
	    case 0x26 /* & */:
	    case 0x27 /* ' */:
	    case 0x28 /* ( */:
	    case 0x29 /* ) */:
	    case 0x2A /* * */:
	    case 0x2B /* + */:
	    case 0x2C /* , */:
	    case 0x2D /* - */:
	    case 0x2E /* . */:
	    case 0x2F /* / */:
	    case 0x3A /* : */:
	    case 0x3B /* ; */:
	    case 0x3C /* < */:
	    case 0x3D /* = */:
	    case 0x3E /* > */:
	    case 0x3F /* ? */:
	    case 0x40 /* @ */:
	    case 0x5B /* [ */:
	    case 0x5C /* \ */:
	    case 0x5D /* ] */:
	    case 0x5E /* ^ */:
	    case 0x5F /* _ */:
	    case 0x60 /* ` */:
	    case 0x7B /* { */:
	    case 0x7C /* | */:
	    case 0x7D /* } */:
	    case 0x7E /* ~ */:
	      return true;
	    default:
	      return false;
	  }
	}

	// Hepler to unify [reference labels].
	//
	function normalizeReference(str) {
	  // use .toUpperCase() instead of .toLowerCase()
	  // here to avoid a conflict with Object.prototype
	  // members (most notably, `__proto__`)
	  return str.trim().replace(/\s+/g, ' ').toUpperCase();
	}

	////////////////////////////////////////////////////////////////////////////////

	// Re-export libraries commonly used in both markdown-it and its plugins,
	// so plugins won't have to depend on them explicitly, which reduces their
	// bundled size (e.g. a browser build).
	//
	exports.lib = {};
	exports.lib.mdurl = __webpack_require__(53);
	exports.lib.ucmicro = __webpack_require__(58);

	exports.assign = assign;
	exports.isString = isString;
	exports.has = has;
	exports.unescapeMd = unescapeMd;
	exports.unescapeAll = unescapeAll;
	exports.isValidEntityCode = isValidEntityCode;
	exports.fromCodePoint = fromCodePoint;
	// exports.replaceEntities     = replaceEntities;
	exports.escapeHtml = escapeHtml;
	exports.arrayReplaceAt = arrayReplaceAt;
	exports.isSpace = isSpace;
	exports.isWhiteSpace = isWhiteSpace;
	exports.isMdAsciiPunct = isMdAsciiPunct;
	exports.isPunctChar = isPunctChar;
	exports.escapeRE = escapeRE;
	exports.normalizeReference = normalizeReference;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	// HTML5 entities map: { name -> utf16string }
	//
	'use strict';

	/*eslint quotes:0*/

	module.exports = __webpack_require__(51);

/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = {
		"Aacute": "Á",
		"aacute": "á",
		"Abreve": "Ă",
		"abreve": "ă",
		"ac": "∾",
		"acd": "∿",
		"acE": "∾̳",
		"Acirc": "Â",
		"acirc": "â",
		"acute": "´",
		"Acy": "А",
		"acy": "а",
		"AElig": "Æ",
		"aelig": "æ",
		"af": "⁡",
		"Afr": "𝔄",
		"afr": "𝔞",
		"Agrave": "À",
		"agrave": "à",
		"alefsym": "ℵ",
		"aleph": "ℵ",
		"Alpha": "Α",
		"alpha": "α",
		"Amacr": "Ā",
		"amacr": "ā",
		"amalg": "⨿",
		"amp": "&",
		"AMP": "&",
		"andand": "⩕",
		"And": "⩓",
		"and": "∧",
		"andd": "⩜",
		"andslope": "⩘",
		"andv": "⩚",
		"ang": "∠",
		"ange": "⦤",
		"angle": "∠",
		"angmsdaa": "⦨",
		"angmsdab": "⦩",
		"angmsdac": "⦪",
		"angmsdad": "⦫",
		"angmsdae": "⦬",
		"angmsdaf": "⦭",
		"angmsdag": "⦮",
		"angmsdah": "⦯",
		"angmsd": "∡",
		"angrt": "∟",
		"angrtvb": "⊾",
		"angrtvbd": "⦝",
		"angsph": "∢",
		"angst": "Å",
		"angzarr": "⍼",
		"Aogon": "Ą",
		"aogon": "ą",
		"Aopf": "𝔸",
		"aopf": "𝕒",
		"apacir": "⩯",
		"ap": "≈",
		"apE": "⩰",
		"ape": "≊",
		"apid": "≋",
		"apos": "'",
		"ApplyFunction": "⁡",
		"approx": "≈",
		"approxeq": "≊",
		"Aring": "Å",
		"aring": "å",
		"Ascr": "𝒜",
		"ascr": "𝒶",
		"Assign": "≔",
		"ast": "*",
		"asymp": "≈",
		"asympeq": "≍",
		"Atilde": "Ã",
		"atilde": "ã",
		"Auml": "Ä",
		"auml": "ä",
		"awconint": "∳",
		"awint": "⨑",
		"backcong": "≌",
		"backepsilon": "϶",
		"backprime": "‵",
		"backsim": "∽",
		"backsimeq": "⋍",
		"Backslash": "∖",
		"Barv": "⫧",
		"barvee": "⊽",
		"barwed": "⌅",
		"Barwed": "⌆",
		"barwedge": "⌅",
		"bbrk": "⎵",
		"bbrktbrk": "⎶",
		"bcong": "≌",
		"Bcy": "Б",
		"bcy": "б",
		"bdquo": "„",
		"becaus": "∵",
		"because": "∵",
		"Because": "∵",
		"bemptyv": "⦰",
		"bepsi": "϶",
		"bernou": "ℬ",
		"Bernoullis": "ℬ",
		"Beta": "Β",
		"beta": "β",
		"beth": "ℶ",
		"between": "≬",
		"Bfr": "𝔅",
		"bfr": "𝔟",
		"bigcap": "⋂",
		"bigcirc": "◯",
		"bigcup": "⋃",
		"bigodot": "⨀",
		"bigoplus": "⨁",
		"bigotimes": "⨂",
		"bigsqcup": "⨆",
		"bigstar": "★",
		"bigtriangledown": "▽",
		"bigtriangleup": "△",
		"biguplus": "⨄",
		"bigvee": "⋁",
		"bigwedge": "⋀",
		"bkarow": "⤍",
		"blacklozenge": "⧫",
		"blacksquare": "▪",
		"blacktriangle": "▴",
		"blacktriangledown": "▾",
		"blacktriangleleft": "◂",
		"blacktriangleright": "▸",
		"blank": "␣",
		"blk12": "▒",
		"blk14": "░",
		"blk34": "▓",
		"block": "█",
		"bne": "=⃥",
		"bnequiv": "≡⃥",
		"bNot": "⫭",
		"bnot": "⌐",
		"Bopf": "𝔹",
		"bopf": "𝕓",
		"bot": "⊥",
		"bottom": "⊥",
		"bowtie": "⋈",
		"boxbox": "⧉",
		"boxdl": "┐",
		"boxdL": "╕",
		"boxDl": "╖",
		"boxDL": "╗",
		"boxdr": "┌",
		"boxdR": "╒",
		"boxDr": "╓",
		"boxDR": "╔",
		"boxh": "─",
		"boxH": "═",
		"boxhd": "┬",
		"boxHd": "╤",
		"boxhD": "╥",
		"boxHD": "╦",
		"boxhu": "┴",
		"boxHu": "╧",
		"boxhU": "╨",
		"boxHU": "╩",
		"boxminus": "⊟",
		"boxplus": "⊞",
		"boxtimes": "⊠",
		"boxul": "┘",
		"boxuL": "╛",
		"boxUl": "╜",
		"boxUL": "╝",
		"boxur": "└",
		"boxuR": "╘",
		"boxUr": "╙",
		"boxUR": "╚",
		"boxv": "│",
		"boxV": "║",
		"boxvh": "┼",
		"boxvH": "╪",
		"boxVh": "╫",
		"boxVH": "╬",
		"boxvl": "┤",
		"boxvL": "╡",
		"boxVl": "╢",
		"boxVL": "╣",
		"boxvr": "├",
		"boxvR": "╞",
		"boxVr": "╟",
		"boxVR": "╠",
		"bprime": "‵",
		"breve": "˘",
		"Breve": "˘",
		"brvbar": "¦",
		"bscr": "𝒷",
		"Bscr": "ℬ",
		"bsemi": "⁏",
		"bsim": "∽",
		"bsime": "⋍",
		"bsolb": "⧅",
		"bsol": "\\",
		"bsolhsub": "⟈",
		"bull": "•",
		"bullet": "•",
		"bump": "≎",
		"bumpE": "⪮",
		"bumpe": "≏",
		"Bumpeq": "≎",
		"bumpeq": "≏",
		"Cacute": "Ć",
		"cacute": "ć",
		"capand": "⩄",
		"capbrcup": "⩉",
		"capcap": "⩋",
		"cap": "∩",
		"Cap": "⋒",
		"capcup": "⩇",
		"capdot": "⩀",
		"CapitalDifferentialD": "ⅅ",
		"caps": "∩︀",
		"caret": "⁁",
		"caron": "ˇ",
		"Cayleys": "ℭ",
		"ccaps": "⩍",
		"Ccaron": "Č",
		"ccaron": "č",
		"Ccedil": "Ç",
		"ccedil": "ç",
		"Ccirc": "Ĉ",
		"ccirc": "ĉ",
		"Cconint": "∰",
		"ccups": "⩌",
		"ccupssm": "⩐",
		"Cdot": "Ċ",
		"cdot": "ċ",
		"cedil": "¸",
		"Cedilla": "¸",
		"cemptyv": "⦲",
		"cent": "¢",
		"centerdot": "·",
		"CenterDot": "·",
		"cfr": "𝔠",
		"Cfr": "ℭ",
		"CHcy": "Ч",
		"chcy": "ч",
		"check": "✓",
		"checkmark": "✓",
		"Chi": "Χ",
		"chi": "χ",
		"circ": "ˆ",
		"circeq": "≗",
		"circlearrowleft": "↺",
		"circlearrowright": "↻",
		"circledast": "⊛",
		"circledcirc": "⊚",
		"circleddash": "⊝",
		"CircleDot": "⊙",
		"circledR": "®",
		"circledS": "Ⓢ",
		"CircleMinus": "⊖",
		"CirclePlus": "⊕",
		"CircleTimes": "⊗",
		"cir": "○",
		"cirE": "⧃",
		"cire": "≗",
		"cirfnint": "⨐",
		"cirmid": "⫯",
		"cirscir": "⧂",
		"ClockwiseContourIntegral": "∲",
		"CloseCurlyDoubleQuote": "”",
		"CloseCurlyQuote": "’",
		"clubs": "♣",
		"clubsuit": "♣",
		"colon": ":",
		"Colon": "∷",
		"Colone": "⩴",
		"colone": "≔",
		"coloneq": "≔",
		"comma": ",",
		"commat": "@",
		"comp": "∁",
		"compfn": "∘",
		"complement": "∁",
		"complexes": "ℂ",
		"cong": "≅",
		"congdot": "⩭",
		"Congruent": "≡",
		"conint": "∮",
		"Conint": "∯",
		"ContourIntegral": "∮",
		"copf": "𝕔",
		"Copf": "ℂ",
		"coprod": "∐",
		"Coproduct": "∐",
		"copy": "©",
		"COPY": "©",
		"copysr": "℗",
		"CounterClockwiseContourIntegral": "∳",
		"crarr": "↵",
		"cross": "✗",
		"Cross": "⨯",
		"Cscr": "𝒞",
		"cscr": "𝒸",
		"csub": "⫏",
		"csube": "⫑",
		"csup": "⫐",
		"csupe": "⫒",
		"ctdot": "⋯",
		"cudarrl": "⤸",
		"cudarrr": "⤵",
		"cuepr": "⋞",
		"cuesc": "⋟",
		"cularr": "↶",
		"cularrp": "⤽",
		"cupbrcap": "⩈",
		"cupcap": "⩆",
		"CupCap": "≍",
		"cup": "∪",
		"Cup": "⋓",
		"cupcup": "⩊",
		"cupdot": "⊍",
		"cupor": "⩅",
		"cups": "∪︀",
		"curarr": "↷",
		"curarrm": "⤼",
		"curlyeqprec": "⋞",
		"curlyeqsucc": "⋟",
		"curlyvee": "⋎",
		"curlywedge": "⋏",
		"curren": "¤",
		"curvearrowleft": "↶",
		"curvearrowright": "↷",
		"cuvee": "⋎",
		"cuwed": "⋏",
		"cwconint": "∲",
		"cwint": "∱",
		"cylcty": "⌭",
		"dagger": "†",
		"Dagger": "‡",
		"daleth": "ℸ",
		"darr": "↓",
		"Darr": "↡",
		"dArr": "⇓",
		"dash": "‐",
		"Dashv": "⫤",
		"dashv": "⊣",
		"dbkarow": "⤏",
		"dblac": "˝",
		"Dcaron": "Ď",
		"dcaron": "ď",
		"Dcy": "Д",
		"dcy": "д",
		"ddagger": "‡",
		"ddarr": "⇊",
		"DD": "ⅅ",
		"dd": "ⅆ",
		"DDotrahd": "⤑",
		"ddotseq": "⩷",
		"deg": "°",
		"Del": "∇",
		"Delta": "Δ",
		"delta": "δ",
		"demptyv": "⦱",
		"dfisht": "⥿",
		"Dfr": "𝔇",
		"dfr": "𝔡",
		"dHar": "⥥",
		"dharl": "⇃",
		"dharr": "⇂",
		"DiacriticalAcute": "´",
		"DiacriticalDot": "˙",
		"DiacriticalDoubleAcute": "˝",
		"DiacriticalGrave": "`",
		"DiacriticalTilde": "˜",
		"diam": "⋄",
		"diamond": "⋄",
		"Diamond": "⋄",
		"diamondsuit": "♦",
		"diams": "♦",
		"die": "¨",
		"DifferentialD": "ⅆ",
		"digamma": "ϝ",
		"disin": "⋲",
		"div": "÷",
		"divide": "÷",
		"divideontimes": "⋇",
		"divonx": "⋇",
		"DJcy": "Ђ",
		"djcy": "ђ",
		"dlcorn": "⌞",
		"dlcrop": "⌍",
		"dollar": "$",
		"Dopf": "𝔻",
		"dopf": "𝕕",
		"Dot": "¨",
		"dot": "˙",
		"DotDot": "⃜",
		"doteq": "≐",
		"doteqdot": "≑",
		"DotEqual": "≐",
		"dotminus": "∸",
		"dotplus": "∔",
		"dotsquare": "⊡",
		"doublebarwedge": "⌆",
		"DoubleContourIntegral": "∯",
		"DoubleDot": "¨",
		"DoubleDownArrow": "⇓",
		"DoubleLeftArrow": "⇐",
		"DoubleLeftRightArrow": "⇔",
		"DoubleLeftTee": "⫤",
		"DoubleLongLeftArrow": "⟸",
		"DoubleLongLeftRightArrow": "⟺",
		"DoubleLongRightArrow": "⟹",
		"DoubleRightArrow": "⇒",
		"DoubleRightTee": "⊨",
		"DoubleUpArrow": "⇑",
		"DoubleUpDownArrow": "⇕",
		"DoubleVerticalBar": "∥",
		"DownArrowBar": "⤓",
		"downarrow": "↓",
		"DownArrow": "↓",
		"Downarrow": "⇓",
		"DownArrowUpArrow": "⇵",
		"DownBreve": "̑",
		"downdownarrows": "⇊",
		"downharpoonleft": "⇃",
		"downharpoonright": "⇂",
		"DownLeftRightVector": "⥐",
		"DownLeftTeeVector": "⥞",
		"DownLeftVectorBar": "⥖",
		"DownLeftVector": "↽",
		"DownRightTeeVector": "⥟",
		"DownRightVectorBar": "⥗",
		"DownRightVector": "⇁",
		"DownTeeArrow": "↧",
		"DownTee": "⊤",
		"drbkarow": "⤐",
		"drcorn": "⌟",
		"drcrop": "⌌",
		"Dscr": "𝒟",
		"dscr": "𝒹",
		"DScy": "Ѕ",
		"dscy": "ѕ",
		"dsol": "⧶",
		"Dstrok": "Đ",
		"dstrok": "đ",
		"dtdot": "⋱",
		"dtri": "▿",
		"dtrif": "▾",
		"duarr": "⇵",
		"duhar": "⥯",
		"dwangle": "⦦",
		"DZcy": "Џ",
		"dzcy": "џ",
		"dzigrarr": "⟿",
		"Eacute": "É",
		"eacute": "é",
		"easter": "⩮",
		"Ecaron": "Ě",
		"ecaron": "ě",
		"Ecirc": "Ê",
		"ecirc": "ê",
		"ecir": "≖",
		"ecolon": "≕",
		"Ecy": "Э",
		"ecy": "э",
		"eDDot": "⩷",
		"Edot": "Ė",
		"edot": "ė",
		"eDot": "≑",
		"ee": "ⅇ",
		"efDot": "≒",
		"Efr": "𝔈",
		"efr": "𝔢",
		"eg": "⪚",
		"Egrave": "È",
		"egrave": "è",
		"egs": "⪖",
		"egsdot": "⪘",
		"el": "⪙",
		"Element": "∈",
		"elinters": "⏧",
		"ell": "ℓ",
		"els": "⪕",
		"elsdot": "⪗",
		"Emacr": "Ē",
		"emacr": "ē",
		"empty": "∅",
		"emptyset": "∅",
		"EmptySmallSquare": "◻",
		"emptyv": "∅",
		"EmptyVerySmallSquare": "▫",
		"emsp13": " ",
		"emsp14": " ",
		"emsp": " ",
		"ENG": "Ŋ",
		"eng": "ŋ",
		"ensp": " ",
		"Eogon": "Ę",
		"eogon": "ę",
		"Eopf": "𝔼",
		"eopf": "𝕖",
		"epar": "⋕",
		"eparsl": "⧣",
		"eplus": "⩱",
		"epsi": "ε",
		"Epsilon": "Ε",
		"epsilon": "ε",
		"epsiv": "ϵ",
		"eqcirc": "≖",
		"eqcolon": "≕",
		"eqsim": "≂",
		"eqslantgtr": "⪖",
		"eqslantless": "⪕",
		"Equal": "⩵",
		"equals": "=",
		"EqualTilde": "≂",
		"equest": "≟",
		"Equilibrium": "⇌",
		"equiv": "≡",
		"equivDD": "⩸",
		"eqvparsl": "⧥",
		"erarr": "⥱",
		"erDot": "≓",
		"escr": "ℯ",
		"Escr": "ℰ",
		"esdot": "≐",
		"Esim": "⩳",
		"esim": "≂",
		"Eta": "Η",
		"eta": "η",
		"ETH": "Ð",
		"eth": "ð",
		"Euml": "Ë",
		"euml": "ë",
		"euro": "€",
		"excl": "!",
		"exist": "∃",
		"Exists": "∃",
		"expectation": "ℰ",
		"exponentiale": "ⅇ",
		"ExponentialE": "ⅇ",
		"fallingdotseq": "≒",
		"Fcy": "Ф",
		"fcy": "ф",
		"female": "♀",
		"ffilig": "ﬃ",
		"fflig": "ﬀ",
		"ffllig": "ﬄ",
		"Ffr": "𝔉",
		"ffr": "𝔣",
		"filig": "ﬁ",
		"FilledSmallSquare": "◼",
		"FilledVerySmallSquare": "▪",
		"fjlig": "fj",
		"flat": "♭",
		"fllig": "ﬂ",
		"fltns": "▱",
		"fnof": "ƒ",
		"Fopf": "𝔽",
		"fopf": "𝕗",
		"forall": "∀",
		"ForAll": "∀",
		"fork": "⋔",
		"forkv": "⫙",
		"Fouriertrf": "ℱ",
		"fpartint": "⨍",
		"frac12": "½",
		"frac13": "⅓",
		"frac14": "¼",
		"frac15": "⅕",
		"frac16": "⅙",
		"frac18": "⅛",
		"frac23": "⅔",
		"frac25": "⅖",
		"frac34": "¾",
		"frac35": "⅗",
		"frac38": "⅜",
		"frac45": "⅘",
		"frac56": "⅚",
		"frac58": "⅝",
		"frac78": "⅞",
		"frasl": "⁄",
		"frown": "⌢",
		"fscr": "𝒻",
		"Fscr": "ℱ",
		"gacute": "ǵ",
		"Gamma": "Γ",
		"gamma": "γ",
		"Gammad": "Ϝ",
		"gammad": "ϝ",
		"gap": "⪆",
		"Gbreve": "Ğ",
		"gbreve": "ğ",
		"Gcedil": "Ģ",
		"Gcirc": "Ĝ",
		"gcirc": "ĝ",
		"Gcy": "Г",
		"gcy": "г",
		"Gdot": "Ġ",
		"gdot": "ġ",
		"ge": "≥",
		"gE": "≧",
		"gEl": "⪌",
		"gel": "⋛",
		"geq": "≥",
		"geqq": "≧",
		"geqslant": "⩾",
		"gescc": "⪩",
		"ges": "⩾",
		"gesdot": "⪀",
		"gesdoto": "⪂",
		"gesdotol": "⪄",
		"gesl": "⋛︀",
		"gesles": "⪔",
		"Gfr": "𝔊",
		"gfr": "𝔤",
		"gg": "≫",
		"Gg": "⋙",
		"ggg": "⋙",
		"gimel": "ℷ",
		"GJcy": "Ѓ",
		"gjcy": "ѓ",
		"gla": "⪥",
		"gl": "≷",
		"glE": "⪒",
		"glj": "⪤",
		"gnap": "⪊",
		"gnapprox": "⪊",
		"gne": "⪈",
		"gnE": "≩",
		"gneq": "⪈",
		"gneqq": "≩",
		"gnsim": "⋧",
		"Gopf": "𝔾",
		"gopf": "𝕘",
		"grave": "`",
		"GreaterEqual": "≥",
		"GreaterEqualLess": "⋛",
		"GreaterFullEqual": "≧",
		"GreaterGreater": "⪢",
		"GreaterLess": "≷",
		"GreaterSlantEqual": "⩾",
		"GreaterTilde": "≳",
		"Gscr": "𝒢",
		"gscr": "ℊ",
		"gsim": "≳",
		"gsime": "⪎",
		"gsiml": "⪐",
		"gtcc": "⪧",
		"gtcir": "⩺",
		"gt": ">",
		"GT": ">",
		"Gt": "≫",
		"gtdot": "⋗",
		"gtlPar": "⦕",
		"gtquest": "⩼",
		"gtrapprox": "⪆",
		"gtrarr": "⥸",
		"gtrdot": "⋗",
		"gtreqless": "⋛",
		"gtreqqless": "⪌",
		"gtrless": "≷",
		"gtrsim": "≳",
		"gvertneqq": "≩︀",
		"gvnE": "≩︀",
		"Hacek": "ˇ",
		"hairsp": " ",
		"half": "½",
		"hamilt": "ℋ",
		"HARDcy": "Ъ",
		"hardcy": "ъ",
		"harrcir": "⥈",
		"harr": "↔",
		"hArr": "⇔",
		"harrw": "↭",
		"Hat": "^",
		"hbar": "ℏ",
		"Hcirc": "Ĥ",
		"hcirc": "ĥ",
		"hearts": "♥",
		"heartsuit": "♥",
		"hellip": "…",
		"hercon": "⊹",
		"hfr": "𝔥",
		"Hfr": "ℌ",
		"HilbertSpace": "ℋ",
		"hksearow": "⤥",
		"hkswarow": "⤦",
		"hoarr": "⇿",
		"homtht": "∻",
		"hookleftarrow": "↩",
		"hookrightarrow": "↪",
		"hopf": "𝕙",
		"Hopf": "ℍ",
		"horbar": "―",
		"HorizontalLine": "─",
		"hscr": "𝒽",
		"Hscr": "ℋ",
		"hslash": "ℏ",
		"Hstrok": "Ħ",
		"hstrok": "ħ",
		"HumpDownHump": "≎",
		"HumpEqual": "≏",
		"hybull": "⁃",
		"hyphen": "‐",
		"Iacute": "Í",
		"iacute": "í",
		"ic": "⁣",
		"Icirc": "Î",
		"icirc": "î",
		"Icy": "И",
		"icy": "и",
		"Idot": "İ",
		"IEcy": "Е",
		"iecy": "е",
		"iexcl": "¡",
		"iff": "⇔",
		"ifr": "𝔦",
		"Ifr": "ℑ",
		"Igrave": "Ì",
		"igrave": "ì",
		"ii": "ⅈ",
		"iiiint": "⨌",
		"iiint": "∭",
		"iinfin": "⧜",
		"iiota": "℩",
		"IJlig": "Ĳ",
		"ijlig": "ĳ",
		"Imacr": "Ī",
		"imacr": "ī",
		"image": "ℑ",
		"ImaginaryI": "ⅈ",
		"imagline": "ℐ",
		"imagpart": "ℑ",
		"imath": "ı",
		"Im": "ℑ",
		"imof": "⊷",
		"imped": "Ƶ",
		"Implies": "⇒",
		"incare": "℅",
		"in": "∈",
		"infin": "∞",
		"infintie": "⧝",
		"inodot": "ı",
		"intcal": "⊺",
		"int": "∫",
		"Int": "∬",
		"integers": "ℤ",
		"Integral": "∫",
		"intercal": "⊺",
		"Intersection": "⋂",
		"intlarhk": "⨗",
		"intprod": "⨼",
		"InvisibleComma": "⁣",
		"InvisibleTimes": "⁢",
		"IOcy": "Ё",
		"iocy": "ё",
		"Iogon": "Į",
		"iogon": "į",
		"Iopf": "𝕀",
		"iopf": "𝕚",
		"Iota": "Ι",
		"iota": "ι",
		"iprod": "⨼",
		"iquest": "¿",
		"iscr": "𝒾",
		"Iscr": "ℐ",
		"isin": "∈",
		"isindot": "⋵",
		"isinE": "⋹",
		"isins": "⋴",
		"isinsv": "⋳",
		"isinv": "∈",
		"it": "⁢",
		"Itilde": "Ĩ",
		"itilde": "ĩ",
		"Iukcy": "І",
		"iukcy": "і",
		"Iuml": "Ï",
		"iuml": "ï",
		"Jcirc": "Ĵ",
		"jcirc": "ĵ",
		"Jcy": "Й",
		"jcy": "й",
		"Jfr": "𝔍",
		"jfr": "𝔧",
		"jmath": "ȷ",
		"Jopf": "𝕁",
		"jopf": "𝕛",
		"Jscr": "𝒥",
		"jscr": "𝒿",
		"Jsercy": "Ј",
		"jsercy": "ј",
		"Jukcy": "Є",
		"jukcy": "є",
		"Kappa": "Κ",
		"kappa": "κ",
		"kappav": "ϰ",
		"Kcedil": "Ķ",
		"kcedil": "ķ",
		"Kcy": "К",
		"kcy": "к",
		"Kfr": "𝔎",
		"kfr": "𝔨",
		"kgreen": "ĸ",
		"KHcy": "Х",
		"khcy": "х",
		"KJcy": "Ќ",
		"kjcy": "ќ",
		"Kopf": "𝕂",
		"kopf": "𝕜",
		"Kscr": "𝒦",
		"kscr": "𝓀",
		"lAarr": "⇚",
		"Lacute": "Ĺ",
		"lacute": "ĺ",
		"laemptyv": "⦴",
		"lagran": "ℒ",
		"Lambda": "Λ",
		"lambda": "λ",
		"lang": "⟨",
		"Lang": "⟪",
		"langd": "⦑",
		"langle": "⟨",
		"lap": "⪅",
		"Laplacetrf": "ℒ",
		"laquo": "«",
		"larrb": "⇤",
		"larrbfs": "⤟",
		"larr": "←",
		"Larr": "↞",
		"lArr": "⇐",
		"larrfs": "⤝",
		"larrhk": "↩",
		"larrlp": "↫",
		"larrpl": "⤹",
		"larrsim": "⥳",
		"larrtl": "↢",
		"latail": "⤙",
		"lAtail": "⤛",
		"lat": "⪫",
		"late": "⪭",
		"lates": "⪭︀",
		"lbarr": "⤌",
		"lBarr": "⤎",
		"lbbrk": "❲",
		"lbrace": "{",
		"lbrack": "[",
		"lbrke": "⦋",
		"lbrksld": "⦏",
		"lbrkslu": "⦍",
		"Lcaron": "Ľ",
		"lcaron": "ľ",
		"Lcedil": "Ļ",
		"lcedil": "ļ",
		"lceil": "⌈",
		"lcub": "{",
		"Lcy": "Л",
		"lcy": "л",
		"ldca": "⤶",
		"ldquo": "“",
		"ldquor": "„",
		"ldrdhar": "⥧",
		"ldrushar": "⥋",
		"ldsh": "↲",
		"le": "≤",
		"lE": "≦",
		"LeftAngleBracket": "⟨",
		"LeftArrowBar": "⇤",
		"leftarrow": "←",
		"LeftArrow": "←",
		"Leftarrow": "⇐",
		"LeftArrowRightArrow": "⇆",
		"leftarrowtail": "↢",
		"LeftCeiling": "⌈",
		"LeftDoubleBracket": "⟦",
		"LeftDownTeeVector": "⥡",
		"LeftDownVectorBar": "⥙",
		"LeftDownVector": "⇃",
		"LeftFloor": "⌊",
		"leftharpoondown": "↽",
		"leftharpoonup": "↼",
		"leftleftarrows": "⇇",
		"leftrightarrow": "↔",
		"LeftRightArrow": "↔",
		"Leftrightarrow": "⇔",
		"leftrightarrows": "⇆",
		"leftrightharpoons": "⇋",
		"leftrightsquigarrow": "↭",
		"LeftRightVector": "⥎",
		"LeftTeeArrow": "↤",
		"LeftTee": "⊣",
		"LeftTeeVector": "⥚",
		"leftthreetimes": "⋋",
		"LeftTriangleBar": "⧏",
		"LeftTriangle": "⊲",
		"LeftTriangleEqual": "⊴",
		"LeftUpDownVector": "⥑",
		"LeftUpTeeVector": "⥠",
		"LeftUpVectorBar": "⥘",
		"LeftUpVector": "↿",
		"LeftVectorBar": "⥒",
		"LeftVector": "↼",
		"lEg": "⪋",
		"leg": "⋚",
		"leq": "≤",
		"leqq": "≦",
		"leqslant": "⩽",
		"lescc": "⪨",
		"les": "⩽",
		"lesdot": "⩿",
		"lesdoto": "⪁",
		"lesdotor": "⪃",
		"lesg": "⋚︀",
		"lesges": "⪓",
		"lessapprox": "⪅",
		"lessdot": "⋖",
		"lesseqgtr": "⋚",
		"lesseqqgtr": "⪋",
		"LessEqualGreater": "⋚",
		"LessFullEqual": "≦",
		"LessGreater": "≶",
		"lessgtr": "≶",
		"LessLess": "⪡",
		"lesssim": "≲",
		"LessSlantEqual": "⩽",
		"LessTilde": "≲",
		"lfisht": "⥼",
		"lfloor": "⌊",
		"Lfr": "𝔏",
		"lfr": "𝔩",
		"lg": "≶",
		"lgE": "⪑",
		"lHar": "⥢",
		"lhard": "↽",
		"lharu": "↼",
		"lharul": "⥪",
		"lhblk": "▄",
		"LJcy": "Љ",
		"ljcy": "љ",
		"llarr": "⇇",
		"ll": "≪",
		"Ll": "⋘",
		"llcorner": "⌞",
		"Lleftarrow": "⇚",
		"llhard": "⥫",
		"lltri": "◺",
		"Lmidot": "Ŀ",
		"lmidot": "ŀ",
		"lmoustache": "⎰",
		"lmoust": "⎰",
		"lnap": "⪉",
		"lnapprox": "⪉",
		"lne": "⪇",
		"lnE": "≨",
		"lneq": "⪇",
		"lneqq": "≨",
		"lnsim": "⋦",
		"loang": "⟬",
		"loarr": "⇽",
		"lobrk": "⟦",
		"longleftarrow": "⟵",
		"LongLeftArrow": "⟵",
		"Longleftarrow": "⟸",
		"longleftrightarrow": "⟷",
		"LongLeftRightArrow": "⟷",
		"Longleftrightarrow": "⟺",
		"longmapsto": "⟼",
		"longrightarrow": "⟶",
		"LongRightArrow": "⟶",
		"Longrightarrow": "⟹",
		"looparrowleft": "↫",
		"looparrowright": "↬",
		"lopar": "⦅",
		"Lopf": "𝕃",
		"lopf": "𝕝",
		"loplus": "⨭",
		"lotimes": "⨴",
		"lowast": "∗",
		"lowbar": "_",
		"LowerLeftArrow": "↙",
		"LowerRightArrow": "↘",
		"loz": "◊",
		"lozenge": "◊",
		"lozf": "⧫",
		"lpar": "(",
		"lparlt": "⦓",
		"lrarr": "⇆",
		"lrcorner": "⌟",
		"lrhar": "⇋",
		"lrhard": "⥭",
		"lrm": "‎",
		"lrtri": "⊿",
		"lsaquo": "‹",
		"lscr": "𝓁",
		"Lscr": "ℒ",
		"lsh": "↰",
		"Lsh": "↰",
		"lsim": "≲",
		"lsime": "⪍",
		"lsimg": "⪏",
		"lsqb": "[",
		"lsquo": "‘",
		"lsquor": "‚",
		"Lstrok": "Ł",
		"lstrok": "ł",
		"ltcc": "⪦",
		"ltcir": "⩹",
		"lt": "<",
		"LT": "<",
		"Lt": "≪",
		"ltdot": "⋖",
		"lthree": "⋋",
		"ltimes": "⋉",
		"ltlarr": "⥶",
		"ltquest": "⩻",
		"ltri": "◃",
		"ltrie": "⊴",
		"ltrif": "◂",
		"ltrPar": "⦖",
		"lurdshar": "⥊",
		"luruhar": "⥦",
		"lvertneqq": "≨︀",
		"lvnE": "≨︀",
		"macr": "¯",
		"male": "♂",
		"malt": "✠",
		"maltese": "✠",
		"Map": "⤅",
		"map": "↦",
		"mapsto": "↦",
		"mapstodown": "↧",
		"mapstoleft": "↤",
		"mapstoup": "↥",
		"marker": "▮",
		"mcomma": "⨩",
		"Mcy": "М",
		"mcy": "м",
		"mdash": "—",
		"mDDot": "∺",
		"measuredangle": "∡",
		"MediumSpace": " ",
		"Mellintrf": "ℳ",
		"Mfr": "𝔐",
		"mfr": "𝔪",
		"mho": "℧",
		"micro": "µ",
		"midast": "*",
		"midcir": "⫰",
		"mid": "∣",
		"middot": "·",
		"minusb": "⊟",
		"minus": "−",
		"minusd": "∸",
		"minusdu": "⨪",
		"MinusPlus": "∓",
		"mlcp": "⫛",
		"mldr": "…",
		"mnplus": "∓",
		"models": "⊧",
		"Mopf": "𝕄",
		"mopf": "𝕞",
		"mp": "∓",
		"mscr": "𝓂",
		"Mscr": "ℳ",
		"mstpos": "∾",
		"Mu": "Μ",
		"mu": "μ",
		"multimap": "⊸",
		"mumap": "⊸",
		"nabla": "∇",
		"Nacute": "Ń",
		"nacute": "ń",
		"nang": "∠⃒",
		"nap": "≉",
		"napE": "⩰̸",
		"napid": "≋̸",
		"napos": "ŉ",
		"napprox": "≉",
		"natural": "♮",
		"naturals": "ℕ",
		"natur": "♮",
		"nbsp": " ",
		"nbump": "≎̸",
		"nbumpe": "≏̸",
		"ncap": "⩃",
		"Ncaron": "Ň",
		"ncaron": "ň",
		"Ncedil": "Ņ",
		"ncedil": "ņ",
		"ncong": "≇",
		"ncongdot": "⩭̸",
		"ncup": "⩂",
		"Ncy": "Н",
		"ncy": "н",
		"ndash": "–",
		"nearhk": "⤤",
		"nearr": "↗",
		"neArr": "⇗",
		"nearrow": "↗",
		"ne": "≠",
		"nedot": "≐̸",
		"NegativeMediumSpace": "​",
		"NegativeThickSpace": "​",
		"NegativeThinSpace": "​",
		"NegativeVeryThinSpace": "​",
		"nequiv": "≢",
		"nesear": "⤨",
		"nesim": "≂̸",
		"NestedGreaterGreater": "≫",
		"NestedLessLess": "≪",
		"NewLine": "\n",
		"nexist": "∄",
		"nexists": "∄",
		"Nfr": "𝔑",
		"nfr": "𝔫",
		"ngE": "≧̸",
		"nge": "≱",
		"ngeq": "≱",
		"ngeqq": "≧̸",
		"ngeqslant": "⩾̸",
		"nges": "⩾̸",
		"nGg": "⋙̸",
		"ngsim": "≵",
		"nGt": "≫⃒",
		"ngt": "≯",
		"ngtr": "≯",
		"nGtv": "≫̸",
		"nharr": "↮",
		"nhArr": "⇎",
		"nhpar": "⫲",
		"ni": "∋",
		"nis": "⋼",
		"nisd": "⋺",
		"niv": "∋",
		"NJcy": "Њ",
		"njcy": "њ",
		"nlarr": "↚",
		"nlArr": "⇍",
		"nldr": "‥",
		"nlE": "≦̸",
		"nle": "≰",
		"nleftarrow": "↚",
		"nLeftarrow": "⇍",
		"nleftrightarrow": "↮",
		"nLeftrightarrow": "⇎",
		"nleq": "≰",
		"nleqq": "≦̸",
		"nleqslant": "⩽̸",
		"nles": "⩽̸",
		"nless": "≮",
		"nLl": "⋘̸",
		"nlsim": "≴",
		"nLt": "≪⃒",
		"nlt": "≮",
		"nltri": "⋪",
		"nltrie": "⋬",
		"nLtv": "≪̸",
		"nmid": "∤",
		"NoBreak": "⁠",
		"NonBreakingSpace": " ",
		"nopf": "𝕟",
		"Nopf": "ℕ",
		"Not": "⫬",
		"not": "¬",
		"NotCongruent": "≢",
		"NotCupCap": "≭",
		"NotDoubleVerticalBar": "∦",
		"NotElement": "∉",
		"NotEqual": "≠",
		"NotEqualTilde": "≂̸",
		"NotExists": "∄",
		"NotGreater": "≯",
		"NotGreaterEqual": "≱",
		"NotGreaterFullEqual": "≧̸",
		"NotGreaterGreater": "≫̸",
		"NotGreaterLess": "≹",
		"NotGreaterSlantEqual": "⩾̸",
		"NotGreaterTilde": "≵",
		"NotHumpDownHump": "≎̸",
		"NotHumpEqual": "≏̸",
		"notin": "∉",
		"notindot": "⋵̸",
		"notinE": "⋹̸",
		"notinva": "∉",
		"notinvb": "⋷",
		"notinvc": "⋶",
		"NotLeftTriangleBar": "⧏̸",
		"NotLeftTriangle": "⋪",
		"NotLeftTriangleEqual": "⋬",
		"NotLess": "≮",
		"NotLessEqual": "≰",
		"NotLessGreater": "≸",
		"NotLessLess": "≪̸",
		"NotLessSlantEqual": "⩽̸",
		"NotLessTilde": "≴",
		"NotNestedGreaterGreater": "⪢̸",
		"NotNestedLessLess": "⪡̸",
		"notni": "∌",
		"notniva": "∌",
		"notnivb": "⋾",
		"notnivc": "⋽",
		"NotPrecedes": "⊀",
		"NotPrecedesEqual": "⪯̸",
		"NotPrecedesSlantEqual": "⋠",
		"NotReverseElement": "∌",
		"NotRightTriangleBar": "⧐̸",
		"NotRightTriangle": "⋫",
		"NotRightTriangleEqual": "⋭",
		"NotSquareSubset": "⊏̸",
		"NotSquareSubsetEqual": "⋢",
		"NotSquareSuperset": "⊐̸",
		"NotSquareSupersetEqual": "⋣",
		"NotSubset": "⊂⃒",
		"NotSubsetEqual": "⊈",
		"NotSucceeds": "⊁",
		"NotSucceedsEqual": "⪰̸",
		"NotSucceedsSlantEqual": "⋡",
		"NotSucceedsTilde": "≿̸",
		"NotSuperset": "⊃⃒",
		"NotSupersetEqual": "⊉",
		"NotTilde": "≁",
		"NotTildeEqual": "≄",
		"NotTildeFullEqual": "≇",
		"NotTildeTilde": "≉",
		"NotVerticalBar": "∤",
		"nparallel": "∦",
		"npar": "∦",
		"nparsl": "⫽⃥",
		"npart": "∂̸",
		"npolint": "⨔",
		"npr": "⊀",
		"nprcue": "⋠",
		"nprec": "⊀",
		"npreceq": "⪯̸",
		"npre": "⪯̸",
		"nrarrc": "⤳̸",
		"nrarr": "↛",
		"nrArr": "⇏",
		"nrarrw": "↝̸",
		"nrightarrow": "↛",
		"nRightarrow": "⇏",
		"nrtri": "⋫",
		"nrtrie": "⋭",
		"nsc": "⊁",
		"nsccue": "⋡",
		"nsce": "⪰̸",
		"Nscr": "𝒩",
		"nscr": "𝓃",
		"nshortmid": "∤",
		"nshortparallel": "∦",
		"nsim": "≁",
		"nsime": "≄",
		"nsimeq": "≄",
		"nsmid": "∤",
		"nspar": "∦",
		"nsqsube": "⋢",
		"nsqsupe": "⋣",
		"nsub": "⊄",
		"nsubE": "⫅̸",
		"nsube": "⊈",
		"nsubset": "⊂⃒",
		"nsubseteq": "⊈",
		"nsubseteqq": "⫅̸",
		"nsucc": "⊁",
		"nsucceq": "⪰̸",
		"nsup": "⊅",
		"nsupE": "⫆̸",
		"nsupe": "⊉",
		"nsupset": "⊃⃒",
		"nsupseteq": "⊉",
		"nsupseteqq": "⫆̸",
		"ntgl": "≹",
		"Ntilde": "Ñ",
		"ntilde": "ñ",
		"ntlg": "≸",
		"ntriangleleft": "⋪",
		"ntrianglelefteq": "⋬",
		"ntriangleright": "⋫",
		"ntrianglerighteq": "⋭",
		"Nu": "Ν",
		"nu": "ν",
		"num": "#",
		"numero": "№",
		"numsp": " ",
		"nvap": "≍⃒",
		"nvdash": "⊬",
		"nvDash": "⊭",
		"nVdash": "⊮",
		"nVDash": "⊯",
		"nvge": "≥⃒",
		"nvgt": ">⃒",
		"nvHarr": "⤄",
		"nvinfin": "⧞",
		"nvlArr": "⤂",
		"nvle": "≤⃒",
		"nvlt": "<⃒",
		"nvltrie": "⊴⃒",
		"nvrArr": "⤃",
		"nvrtrie": "⊵⃒",
		"nvsim": "∼⃒",
		"nwarhk": "⤣",
		"nwarr": "↖",
		"nwArr": "⇖",
		"nwarrow": "↖",
		"nwnear": "⤧",
		"Oacute": "Ó",
		"oacute": "ó",
		"oast": "⊛",
		"Ocirc": "Ô",
		"ocirc": "ô",
		"ocir": "⊚",
		"Ocy": "О",
		"ocy": "о",
		"odash": "⊝",
		"Odblac": "Ő",
		"odblac": "ő",
		"odiv": "⨸",
		"odot": "⊙",
		"odsold": "⦼",
		"OElig": "Œ",
		"oelig": "œ",
		"ofcir": "⦿",
		"Ofr": "𝔒",
		"ofr": "𝔬",
		"ogon": "˛",
		"Ograve": "Ò",
		"ograve": "ò",
		"ogt": "⧁",
		"ohbar": "⦵",
		"ohm": "Ω",
		"oint": "∮",
		"olarr": "↺",
		"olcir": "⦾",
		"olcross": "⦻",
		"oline": "‾",
		"olt": "⧀",
		"Omacr": "Ō",
		"omacr": "ō",
		"Omega": "Ω",
		"omega": "ω",
		"Omicron": "Ο",
		"omicron": "ο",
		"omid": "⦶",
		"ominus": "⊖",
		"Oopf": "𝕆",
		"oopf": "𝕠",
		"opar": "⦷",
		"OpenCurlyDoubleQuote": "“",
		"OpenCurlyQuote": "‘",
		"operp": "⦹",
		"oplus": "⊕",
		"orarr": "↻",
		"Or": "⩔",
		"or": "∨",
		"ord": "⩝",
		"order": "ℴ",
		"orderof": "ℴ",
		"ordf": "ª",
		"ordm": "º",
		"origof": "⊶",
		"oror": "⩖",
		"orslope": "⩗",
		"orv": "⩛",
		"oS": "Ⓢ",
		"Oscr": "𝒪",
		"oscr": "ℴ",
		"Oslash": "Ø",
		"oslash": "ø",
		"osol": "⊘",
		"Otilde": "Õ",
		"otilde": "õ",
		"otimesas": "⨶",
		"Otimes": "⨷",
		"otimes": "⊗",
		"Ouml": "Ö",
		"ouml": "ö",
		"ovbar": "⌽",
		"OverBar": "‾",
		"OverBrace": "⏞",
		"OverBracket": "⎴",
		"OverParenthesis": "⏜",
		"para": "¶",
		"parallel": "∥",
		"par": "∥",
		"parsim": "⫳",
		"parsl": "⫽",
		"part": "∂",
		"PartialD": "∂",
		"Pcy": "П",
		"pcy": "п",
		"percnt": "%",
		"period": ".",
		"permil": "‰",
		"perp": "⊥",
		"pertenk": "‱",
		"Pfr": "𝔓",
		"pfr": "𝔭",
		"Phi": "Φ",
		"phi": "φ",
		"phiv": "ϕ",
		"phmmat": "ℳ",
		"phone": "☎",
		"Pi": "Π",
		"pi": "π",
		"pitchfork": "⋔",
		"piv": "ϖ",
		"planck": "ℏ",
		"planckh": "ℎ",
		"plankv": "ℏ",
		"plusacir": "⨣",
		"plusb": "⊞",
		"pluscir": "⨢",
		"plus": "+",
		"plusdo": "∔",
		"plusdu": "⨥",
		"pluse": "⩲",
		"PlusMinus": "±",
		"plusmn": "±",
		"plussim": "⨦",
		"plustwo": "⨧",
		"pm": "±",
		"Poincareplane": "ℌ",
		"pointint": "⨕",
		"popf": "𝕡",
		"Popf": "ℙ",
		"pound": "£",
		"prap": "⪷",
		"Pr": "⪻",
		"pr": "≺",
		"prcue": "≼",
		"precapprox": "⪷",
		"prec": "≺",
		"preccurlyeq": "≼",
		"Precedes": "≺",
		"PrecedesEqual": "⪯",
		"PrecedesSlantEqual": "≼",
		"PrecedesTilde": "≾",
		"preceq": "⪯",
		"precnapprox": "⪹",
		"precneqq": "⪵",
		"precnsim": "⋨",
		"pre": "⪯",
		"prE": "⪳",
		"precsim": "≾",
		"prime": "′",
		"Prime": "″",
		"primes": "ℙ",
		"prnap": "⪹",
		"prnE": "⪵",
		"prnsim": "⋨",
		"prod": "∏",
		"Product": "∏",
		"profalar": "⌮",
		"profline": "⌒",
		"profsurf": "⌓",
		"prop": "∝",
		"Proportional": "∝",
		"Proportion": "∷",
		"propto": "∝",
		"prsim": "≾",
		"prurel": "⊰",
		"Pscr": "𝒫",
		"pscr": "𝓅",
		"Psi": "Ψ",
		"psi": "ψ",
		"puncsp": " ",
		"Qfr": "𝔔",
		"qfr": "𝔮",
		"qint": "⨌",
		"qopf": "𝕢",
		"Qopf": "ℚ",
		"qprime": "⁗",
		"Qscr": "𝒬",
		"qscr": "𝓆",
		"quaternions": "ℍ",
		"quatint": "⨖",
		"quest": "?",
		"questeq": "≟",
		"quot": "\"",
		"QUOT": "\"",
		"rAarr": "⇛",
		"race": "∽̱",
		"Racute": "Ŕ",
		"racute": "ŕ",
		"radic": "√",
		"raemptyv": "⦳",
		"rang": "⟩",
		"Rang": "⟫",
		"rangd": "⦒",
		"range": "⦥",
		"rangle": "⟩",
		"raquo": "»",
		"rarrap": "⥵",
		"rarrb": "⇥",
		"rarrbfs": "⤠",
		"rarrc": "⤳",
		"rarr": "→",
		"Rarr": "↠",
		"rArr": "⇒",
		"rarrfs": "⤞",
		"rarrhk": "↪",
		"rarrlp": "↬",
		"rarrpl": "⥅",
		"rarrsim": "⥴",
		"Rarrtl": "⤖",
		"rarrtl": "↣",
		"rarrw": "↝",
		"ratail": "⤚",
		"rAtail": "⤜",
		"ratio": "∶",
		"rationals": "ℚ",
		"rbarr": "⤍",
		"rBarr": "⤏",
		"RBarr": "⤐",
		"rbbrk": "❳",
		"rbrace": "}",
		"rbrack": "]",
		"rbrke": "⦌",
		"rbrksld": "⦎",
		"rbrkslu": "⦐",
		"Rcaron": "Ř",
		"rcaron": "ř",
		"Rcedil": "Ŗ",
		"rcedil": "ŗ",
		"rceil": "⌉",
		"rcub": "}",
		"Rcy": "Р",
		"rcy": "р",
		"rdca": "⤷",
		"rdldhar": "⥩",
		"rdquo": "”",
		"rdquor": "”",
		"rdsh": "↳",
		"real": "ℜ",
		"realine": "ℛ",
		"realpart": "ℜ",
		"reals": "ℝ",
		"Re": "ℜ",
		"rect": "▭",
		"reg": "®",
		"REG": "®",
		"ReverseElement": "∋",
		"ReverseEquilibrium": "⇋",
		"ReverseUpEquilibrium": "⥯",
		"rfisht": "⥽",
		"rfloor": "⌋",
		"rfr": "𝔯",
		"Rfr": "ℜ",
		"rHar": "⥤",
		"rhard": "⇁",
		"rharu": "⇀",
		"rharul": "⥬",
		"Rho": "Ρ",
		"rho": "ρ",
		"rhov": "ϱ",
		"RightAngleBracket": "⟩",
		"RightArrowBar": "⇥",
		"rightarrow": "→",
		"RightArrow": "→",
		"Rightarrow": "⇒",
		"RightArrowLeftArrow": "⇄",
		"rightarrowtail": "↣",
		"RightCeiling": "⌉",
		"RightDoubleBracket": "⟧",
		"RightDownTeeVector": "⥝",
		"RightDownVectorBar": "⥕",
		"RightDownVector": "⇂",
		"RightFloor": "⌋",
		"rightharpoondown": "⇁",
		"rightharpoonup": "⇀",
		"rightleftarrows": "⇄",
		"rightleftharpoons": "⇌",
		"rightrightarrows": "⇉",
		"rightsquigarrow": "↝",
		"RightTeeArrow": "↦",
		"RightTee": "⊢",
		"RightTeeVector": "⥛",
		"rightthreetimes": "⋌",
		"RightTriangleBar": "⧐",
		"RightTriangle": "⊳",
		"RightTriangleEqual": "⊵",
		"RightUpDownVector": "⥏",
		"RightUpTeeVector": "⥜",
		"RightUpVectorBar": "⥔",
		"RightUpVector": "↾",
		"RightVectorBar": "⥓",
		"RightVector": "⇀",
		"ring": "˚",
		"risingdotseq": "≓",
		"rlarr": "⇄",
		"rlhar": "⇌",
		"rlm": "‏",
		"rmoustache": "⎱",
		"rmoust": "⎱",
		"rnmid": "⫮",
		"roang": "⟭",
		"roarr": "⇾",
		"robrk": "⟧",
		"ropar": "⦆",
		"ropf": "𝕣",
		"Ropf": "ℝ",
		"roplus": "⨮",
		"rotimes": "⨵",
		"RoundImplies": "⥰",
		"rpar": ")",
		"rpargt": "⦔",
		"rppolint": "⨒",
		"rrarr": "⇉",
		"Rrightarrow": "⇛",
		"rsaquo": "›",
		"rscr": "𝓇",
		"Rscr": "ℛ",
		"rsh": "↱",
		"Rsh": "↱",
		"rsqb": "]",
		"rsquo": "’",
		"rsquor": "’",
		"rthree": "⋌",
		"rtimes": "⋊",
		"rtri": "▹",
		"rtrie": "⊵",
		"rtrif": "▸",
		"rtriltri": "⧎",
		"RuleDelayed": "⧴",
		"ruluhar": "⥨",
		"rx": "℞",
		"Sacute": "Ś",
		"sacute": "ś",
		"sbquo": "‚",
		"scap": "⪸",
		"Scaron": "Š",
		"scaron": "š",
		"Sc": "⪼",
		"sc": "≻",
		"sccue": "≽",
		"sce": "⪰",
		"scE": "⪴",
		"Scedil": "Ş",
		"scedil": "ş",
		"Scirc": "Ŝ",
		"scirc": "ŝ",
		"scnap": "⪺",
		"scnE": "⪶",
		"scnsim": "⋩",
		"scpolint": "⨓",
		"scsim": "≿",
		"Scy": "С",
		"scy": "с",
		"sdotb": "⊡",
		"sdot": "⋅",
		"sdote": "⩦",
		"searhk": "⤥",
		"searr": "↘",
		"seArr": "⇘",
		"searrow": "↘",
		"sect": "§",
		"semi": ";",
		"seswar": "⤩",
		"setminus": "∖",
		"setmn": "∖",
		"sext": "✶",
		"Sfr": "𝔖",
		"sfr": "𝔰",
		"sfrown": "⌢",
		"sharp": "♯",
		"SHCHcy": "Щ",
		"shchcy": "щ",
		"SHcy": "Ш",
		"shcy": "ш",
		"ShortDownArrow": "↓",
		"ShortLeftArrow": "←",
		"shortmid": "∣",
		"shortparallel": "∥",
		"ShortRightArrow": "→",
		"ShortUpArrow": "↑",
		"shy": "­",
		"Sigma": "Σ",
		"sigma": "σ",
		"sigmaf": "ς",
		"sigmav": "ς",
		"sim": "∼",
		"simdot": "⩪",
		"sime": "≃",
		"simeq": "≃",
		"simg": "⪞",
		"simgE": "⪠",
		"siml": "⪝",
		"simlE": "⪟",
		"simne": "≆",
		"simplus": "⨤",
		"simrarr": "⥲",
		"slarr": "←",
		"SmallCircle": "∘",
		"smallsetminus": "∖",
		"smashp": "⨳",
		"smeparsl": "⧤",
		"smid": "∣",
		"smile": "⌣",
		"smt": "⪪",
		"smte": "⪬",
		"smtes": "⪬︀",
		"SOFTcy": "Ь",
		"softcy": "ь",
		"solbar": "⌿",
		"solb": "⧄",
		"sol": "/",
		"Sopf": "𝕊",
		"sopf": "𝕤",
		"spades": "♠",
		"spadesuit": "♠",
		"spar": "∥",
		"sqcap": "⊓",
		"sqcaps": "⊓︀",
		"sqcup": "⊔",
		"sqcups": "⊔︀",
		"Sqrt": "√",
		"sqsub": "⊏",
		"sqsube": "⊑",
		"sqsubset": "⊏",
		"sqsubseteq": "⊑",
		"sqsup": "⊐",
		"sqsupe": "⊒",
		"sqsupset": "⊐",
		"sqsupseteq": "⊒",
		"square": "□",
		"Square": "□",
		"SquareIntersection": "⊓",
		"SquareSubset": "⊏",
		"SquareSubsetEqual": "⊑",
		"SquareSuperset": "⊐",
		"SquareSupersetEqual": "⊒",
		"SquareUnion": "⊔",
		"squarf": "▪",
		"squ": "□",
		"squf": "▪",
		"srarr": "→",
		"Sscr": "𝒮",
		"sscr": "𝓈",
		"ssetmn": "∖",
		"ssmile": "⌣",
		"sstarf": "⋆",
		"Star": "⋆",
		"star": "☆",
		"starf": "★",
		"straightepsilon": "ϵ",
		"straightphi": "ϕ",
		"strns": "¯",
		"sub": "⊂",
		"Sub": "⋐",
		"subdot": "⪽",
		"subE": "⫅",
		"sube": "⊆",
		"subedot": "⫃",
		"submult": "⫁",
		"subnE": "⫋",
		"subne": "⊊",
		"subplus": "⪿",
		"subrarr": "⥹",
		"subset": "⊂",
		"Subset": "⋐",
		"subseteq": "⊆",
		"subseteqq": "⫅",
		"SubsetEqual": "⊆",
		"subsetneq": "⊊",
		"subsetneqq": "⫋",
		"subsim": "⫇",
		"subsub": "⫕",
		"subsup": "⫓",
		"succapprox": "⪸",
		"succ": "≻",
		"succcurlyeq": "≽",
		"Succeeds": "≻",
		"SucceedsEqual": "⪰",
		"SucceedsSlantEqual": "≽",
		"SucceedsTilde": "≿",
		"succeq": "⪰",
		"succnapprox": "⪺",
		"succneqq": "⪶",
		"succnsim": "⋩",
		"succsim": "≿",
		"SuchThat": "∋",
		"sum": "∑",
		"Sum": "∑",
		"sung": "♪",
		"sup1": "¹",
		"sup2": "²",
		"sup3": "³",
		"sup": "⊃",
		"Sup": "⋑",
		"supdot": "⪾",
		"supdsub": "⫘",
		"supE": "⫆",
		"supe": "⊇",
		"supedot": "⫄",
		"Superset": "⊃",
		"SupersetEqual": "⊇",
		"suphsol": "⟉",
		"suphsub": "⫗",
		"suplarr": "⥻",
		"supmult": "⫂",
		"supnE": "⫌",
		"supne": "⊋",
		"supplus": "⫀",
		"supset": "⊃",
		"Supset": "⋑",
		"supseteq": "⊇",
		"supseteqq": "⫆",
		"supsetneq": "⊋",
		"supsetneqq": "⫌",
		"supsim": "⫈",
		"supsub": "⫔",
		"supsup": "⫖",
		"swarhk": "⤦",
		"swarr": "↙",
		"swArr": "⇙",
		"swarrow": "↙",
		"swnwar": "⤪",
		"szlig": "ß",
		"Tab": "\t",
		"target": "⌖",
		"Tau": "Τ",
		"tau": "τ",
		"tbrk": "⎴",
		"Tcaron": "Ť",
		"tcaron": "ť",
		"Tcedil": "Ţ",
		"tcedil": "ţ",
		"Tcy": "Т",
		"tcy": "т",
		"tdot": "⃛",
		"telrec": "⌕",
		"Tfr": "𝔗",
		"tfr": "𝔱",
		"there4": "∴",
		"therefore": "∴",
		"Therefore": "∴",
		"Theta": "Θ",
		"theta": "θ",
		"thetasym": "ϑ",
		"thetav": "ϑ",
		"thickapprox": "≈",
		"thicksim": "∼",
		"ThickSpace": "  ",
		"ThinSpace": " ",
		"thinsp": " ",
		"thkap": "≈",
		"thksim": "∼",
		"THORN": "Þ",
		"thorn": "þ",
		"tilde": "˜",
		"Tilde": "∼",
		"TildeEqual": "≃",
		"TildeFullEqual": "≅",
		"TildeTilde": "≈",
		"timesbar": "⨱",
		"timesb": "⊠",
		"times": "×",
		"timesd": "⨰",
		"tint": "∭",
		"toea": "⤨",
		"topbot": "⌶",
		"topcir": "⫱",
		"top": "⊤",
		"Topf": "𝕋",
		"topf": "𝕥",
		"topfork": "⫚",
		"tosa": "⤩",
		"tprime": "‴",
		"trade": "™",
		"TRADE": "™",
		"triangle": "▵",
		"triangledown": "▿",
		"triangleleft": "◃",
		"trianglelefteq": "⊴",
		"triangleq": "≜",
		"triangleright": "▹",
		"trianglerighteq": "⊵",
		"tridot": "◬",
		"trie": "≜",
		"triminus": "⨺",
		"TripleDot": "⃛",
		"triplus": "⨹",
		"trisb": "⧍",
		"tritime": "⨻",
		"trpezium": "⏢",
		"Tscr": "𝒯",
		"tscr": "𝓉",
		"TScy": "Ц",
		"tscy": "ц",
		"TSHcy": "Ћ",
		"tshcy": "ћ",
		"Tstrok": "Ŧ",
		"tstrok": "ŧ",
		"twixt": "≬",
		"twoheadleftarrow": "↞",
		"twoheadrightarrow": "↠",
		"Uacute": "Ú",
		"uacute": "ú",
		"uarr": "↑",
		"Uarr": "↟",
		"uArr": "⇑",
		"Uarrocir": "⥉",
		"Ubrcy": "Ў",
		"ubrcy": "ў",
		"Ubreve": "Ŭ",
		"ubreve": "ŭ",
		"Ucirc": "Û",
		"ucirc": "û",
		"Ucy": "У",
		"ucy": "у",
		"udarr": "⇅",
		"Udblac": "Ű",
		"udblac": "ű",
		"udhar": "⥮",
		"ufisht": "⥾",
		"Ufr": "𝔘",
		"ufr": "𝔲",
		"Ugrave": "Ù",
		"ugrave": "ù",
		"uHar": "⥣",
		"uharl": "↿",
		"uharr": "↾",
		"uhblk": "▀",
		"ulcorn": "⌜",
		"ulcorner": "⌜",
		"ulcrop": "⌏",
		"ultri": "◸",
		"Umacr": "Ū",
		"umacr": "ū",
		"uml": "¨",
		"UnderBar": "_",
		"UnderBrace": "⏟",
		"UnderBracket": "⎵",
		"UnderParenthesis": "⏝",
		"Union": "⋃",
		"UnionPlus": "⊎",
		"Uogon": "Ų",
		"uogon": "ų",
		"Uopf": "𝕌",
		"uopf": "𝕦",
		"UpArrowBar": "⤒",
		"uparrow": "↑",
		"UpArrow": "↑",
		"Uparrow": "⇑",
		"UpArrowDownArrow": "⇅",
		"updownarrow": "↕",
		"UpDownArrow": "↕",
		"Updownarrow": "⇕",
		"UpEquilibrium": "⥮",
		"upharpoonleft": "↿",
		"upharpoonright": "↾",
		"uplus": "⊎",
		"UpperLeftArrow": "↖",
		"UpperRightArrow": "↗",
		"upsi": "υ",
		"Upsi": "ϒ",
		"upsih": "ϒ",
		"Upsilon": "Υ",
		"upsilon": "υ",
		"UpTeeArrow": "↥",
		"UpTee": "⊥",
		"upuparrows": "⇈",
		"urcorn": "⌝",
		"urcorner": "⌝",
		"urcrop": "⌎",
		"Uring": "Ů",
		"uring": "ů",
		"urtri": "◹",
		"Uscr": "𝒰",
		"uscr": "𝓊",
		"utdot": "⋰",
		"Utilde": "Ũ",
		"utilde": "ũ",
		"utri": "▵",
		"utrif": "▴",
		"uuarr": "⇈",
		"Uuml": "Ü",
		"uuml": "ü",
		"uwangle": "⦧",
		"vangrt": "⦜",
		"varepsilon": "ϵ",
		"varkappa": "ϰ",
		"varnothing": "∅",
		"varphi": "ϕ",
		"varpi": "ϖ",
		"varpropto": "∝",
		"varr": "↕",
		"vArr": "⇕",
		"varrho": "ϱ",
		"varsigma": "ς",
		"varsubsetneq": "⊊︀",
		"varsubsetneqq": "⫋︀",
		"varsupsetneq": "⊋︀",
		"varsupsetneqq": "⫌︀",
		"vartheta": "ϑ",
		"vartriangleleft": "⊲",
		"vartriangleright": "⊳",
		"vBar": "⫨",
		"Vbar": "⫫",
		"vBarv": "⫩",
		"Vcy": "В",
		"vcy": "в",
		"vdash": "⊢",
		"vDash": "⊨",
		"Vdash": "⊩",
		"VDash": "⊫",
		"Vdashl": "⫦",
		"veebar": "⊻",
		"vee": "∨",
		"Vee": "⋁",
		"veeeq": "≚",
		"vellip": "⋮",
		"verbar": "|",
		"Verbar": "‖",
		"vert": "|",
		"Vert": "‖",
		"VerticalBar": "∣",
		"VerticalLine": "|",
		"VerticalSeparator": "❘",
		"VerticalTilde": "≀",
		"VeryThinSpace": " ",
		"Vfr": "𝔙",
		"vfr": "𝔳",
		"vltri": "⊲",
		"vnsub": "⊂⃒",
		"vnsup": "⊃⃒",
		"Vopf": "𝕍",
		"vopf": "𝕧",
		"vprop": "∝",
		"vrtri": "⊳",
		"Vscr": "𝒱",
		"vscr": "𝓋",
		"vsubnE": "⫋︀",
		"vsubne": "⊊︀",
		"vsupnE": "⫌︀",
		"vsupne": "⊋︀",
		"Vvdash": "⊪",
		"vzigzag": "⦚",
		"Wcirc": "Ŵ",
		"wcirc": "ŵ",
		"wedbar": "⩟",
		"wedge": "∧",
		"Wedge": "⋀",
		"wedgeq": "≙",
		"weierp": "℘",
		"Wfr": "𝔚",
		"wfr": "𝔴",
		"Wopf": "𝕎",
		"wopf": "𝕨",
		"wp": "℘",
		"wr": "≀",
		"wreath": "≀",
		"Wscr": "𝒲",
		"wscr": "𝓌",
		"xcap": "⋂",
		"xcirc": "◯",
		"xcup": "⋃",
		"xdtri": "▽",
		"Xfr": "𝔛",
		"xfr": "𝔵",
		"xharr": "⟷",
		"xhArr": "⟺",
		"Xi": "Ξ",
		"xi": "ξ",
		"xlarr": "⟵",
		"xlArr": "⟸",
		"xmap": "⟼",
		"xnis": "⋻",
		"xodot": "⨀",
		"Xopf": "𝕏",
		"xopf": "𝕩",
		"xoplus": "⨁",
		"xotime": "⨂",
		"xrarr": "⟶",
		"xrArr": "⟹",
		"Xscr": "𝒳",
		"xscr": "𝓍",
		"xsqcup": "⨆",
		"xuplus": "⨄",
		"xutri": "△",
		"xvee": "⋁",
		"xwedge": "⋀",
		"Yacute": "Ý",
		"yacute": "ý",
		"YAcy": "Я",
		"yacy": "я",
		"Ycirc": "Ŷ",
		"ycirc": "ŷ",
		"Ycy": "Ы",
		"ycy": "ы",
		"yen": "¥",
		"Yfr": "𝔜",
		"yfr": "𝔶",
		"YIcy": "Ї",
		"yicy": "ї",
		"Yopf": "𝕐",
		"yopf": "𝕪",
		"Yscr": "𝒴",
		"yscr": "𝓎",
		"YUcy": "Ю",
		"yucy": "ю",
		"yuml": "ÿ",
		"Yuml": "Ÿ",
		"Zacute": "Ź",
		"zacute": "ź",
		"Zcaron": "Ž",
		"zcaron": "ž",
		"Zcy": "З",
		"zcy": "з",
		"Zdot": "Ż",
		"zdot": "ż",
		"zeetrf": "ℨ",
		"ZeroWidthSpace": "​",
		"Zeta": "Ζ",
		"zeta": "ζ",
		"zfr": "𝔷",
		"Zfr": "ℨ",
		"ZHcy": "Ж",
		"zhcy": "ж",
		"zigrarr": "⇝",
		"zopf": "𝕫",
		"Zopf": "ℤ",
		"Zscr": "𝒵",
		"zscr": "𝓏",
		"zwj": "‍",
		"zwnj": "‌"
	};

/***/ },
/* 52 */
/***/ function(module, exports) {

	module.exports = /[!-#%-\*,-/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDE38-\uDE3D]|\uD805[\uDCC6\uDDC1-\uDDC9\uDE41-\uDE43]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F/;

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports.encode = __webpack_require__(54);
	module.exports.decode = __webpack_require__(55);
	module.exports.format = __webpack_require__(56);
	module.exports.parse = __webpack_require__(57);

/***/ },
/* 54 */
/***/ function(module, exports) {

	
	'use strict';

	var encodeCache = {};

	// Create a lookup array where anything but characters in `chars` string
	// and alphanumeric chars is percent-encoded.
	//
	function getEncodeCache(exclude) {
	  var i,
	      ch,
	      cache = encodeCache[exclude];
	  if (cache) {
	    return cache;
	  }

	  cache = encodeCache[exclude] = [];

	  for (i = 0; i < 128; i++) {
	    ch = String.fromCharCode(i);

	    if (/^[0-9a-z]$/i.test(ch)) {
	      // always allow unencoded alphanumeric characters
	      cache.push(ch);
	    } else {
	      cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
	    }
	  }

	  for (i = 0; i < exclude.length; i++) {
	    cache[exclude.charCodeAt(i)] = exclude[i];
	  }

	  return cache;
	}

	// Encode unsafe characters with percent-encoding, skipping already
	// encoded sequences.
	//
	//  - string       - string to encode
	//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
	//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
	//
	function encode(string, exclude, keepEscaped) {
	  var i,
	      l,
	      code,
	      nextCode,
	      cache,
	      result = '';

	  if (typeof exclude !== 'string') {
	    // encode(string, keepEscaped)
	    keepEscaped = exclude;
	    exclude = encode.defaultChars;
	  }

	  if (typeof keepEscaped === 'undefined') {
	    keepEscaped = true;
	  }

	  cache = getEncodeCache(exclude);

	  for (i = 0, l = string.length; i < l; i++) {
	    code = string.charCodeAt(i);

	    if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
	      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
	        result += string.slice(i, i + 3);
	        i += 2;
	        continue;
	      }
	    }

	    if (code < 128) {
	      result += cache[code];
	      continue;
	    }

	    if (code >= 0xD800 && code <= 0xDFFF) {
	      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
	        nextCode = string.charCodeAt(i + 1);
	        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
	          result += encodeURIComponent(string[i] + string[i + 1]);
	          i++;
	          continue;
	        }
	      }
	      result += '%EF%BF%BD';
	      continue;
	    }

	    result += encodeURIComponent(string[i]);
	  }

	  return result;
	}

	encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
	encode.componentChars = "-_.!~*'()";

	module.exports = encode;

/***/ },
/* 55 */
/***/ function(module, exports) {

	
	'use strict';

	/* eslint-disable no-bitwise */

	var decodeCache = {};

	function getDecodeCache(exclude) {
	  var i,
	      ch,
	      cache = decodeCache[exclude];
	  if (cache) {
	    return cache;
	  }

	  cache = decodeCache[exclude] = [];

	  for (i = 0; i < 128; i++) {
	    ch = String.fromCharCode(i);
	    cache.push(ch);
	  }

	  for (i = 0; i < exclude.length; i++) {
	    ch = exclude.charCodeAt(i);
	    cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
	  }

	  return cache;
	}

	// Decode percent-encoded string.
	//
	function decode(string, exclude) {
	  var cache;

	  if (typeof exclude !== 'string') {
	    exclude = decode.defaultChars;
	  }

	  cache = getDecodeCache(exclude);

	  return string.replace(/(%[a-f0-9]{2})+/gi, function (seq) {
	    var i,
	        l,
	        b1,
	        b2,
	        b3,
	        b4,
	        chr,
	        result = '';

	    for (i = 0, l = seq.length; i < l; i += 3) {
	      b1 = parseInt(seq.slice(i + 1, i + 3), 16);

	      if (b1 < 0x80) {
	        result += cache[b1];
	        continue;
	      }

	      if ((b1 & 0xE0) === 0xC0 && i + 3 < l) {
	        // 110xxxxx 10xxxxxx
	        b2 = parseInt(seq.slice(i + 4, i + 6), 16);

	        if ((b2 & 0xC0) === 0x80) {
	          chr = b1 << 6 & 0x7C0 | b2 & 0x3F;

	          if (chr < 0x80) {
	            result += '\ufffd\ufffd';
	          } else {
	            result += String.fromCharCode(chr);
	          }

	          i += 3;
	          continue;
	        }
	      }

	      if ((b1 & 0xF0) === 0xE0 && i + 6 < l) {
	        // 1110xxxx 10xxxxxx 10xxxxxx
	        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
	        b3 = parseInt(seq.slice(i + 7, i + 9), 16);

	        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
	          chr = b1 << 12 & 0xF000 | b2 << 6 & 0xFC0 | b3 & 0x3F;

	          if (chr < 0x800 || chr >= 0xD800 && chr <= 0xDFFF) {
	            result += '\ufffd\ufffd\ufffd';
	          } else {
	            result += String.fromCharCode(chr);
	          }

	          i += 6;
	          continue;
	        }
	      }

	      if ((b1 & 0xF8) === 0xF0 && i + 9 < l) {
	        // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
	        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
	        b3 = parseInt(seq.slice(i + 7, i + 9), 16);
	        b4 = parseInt(seq.slice(i + 10, i + 12), 16);

	        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
	          chr = b1 << 18 & 0x1C0000 | b2 << 12 & 0x3F000 | b3 << 6 & 0xFC0 | b4 & 0x3F;

	          if (chr < 0x10000 || chr > 0x10FFFF) {
	            result += '\ufffd\ufffd\ufffd\ufffd';
	          } else {
	            chr -= 0x10000;
	            result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
	          }

	          i += 9;
	          continue;
	        }
	      }

	      result += '\ufffd';
	    }

	    return result;
	  });
	}

	decode.defaultChars = ';/?:@&=+$,#';
	decode.componentChars = '';

	module.exports = decode;

/***/ },
/* 56 */
/***/ function(module, exports) {

	
	'use strict';

	module.exports = function format(url) {
	  var result = '';

	  result += url.protocol || '';
	  result += url.slashes ? '//' : '';
	  result += url.auth ? url.auth + '@' : '';

	  if (url.hostname && url.hostname.indexOf(':') !== -1) {
	    // ipv6 address
	    result += '[' + url.hostname + ']';
	  } else {
	    result += url.hostname || '';
	  }

	  result += url.port ? ':' + url.port : '';
	  result += url.pathname || '';
	  result += url.search || '';
	  result += url.hash || '';

	  return result;
	};

/***/ },
/* 57 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	//
	// Changes from joyent/node:
	//
	// 1. No leading slash in paths,
	//    e.g. in `url.parse('http://foo?bar')` pathname is ``, not `/`
	//
	// 2. Backslashes are not replaced with slashes,
	//    so `http:\\example.org\` is treated like a relative path
	//
	// 3. Trailing colon is treated like a part of the path,
	//    i.e. in `http://example.org:foo` pathname is `:foo`
	//
	// 4. Nothing is URL-encoded in the resulting object,
	//    (in joyent/node some chars in auth and paths are encoded)
	//
	// 5. `url.parse()` does not have `parseQueryString` argument
	//
	// 6. Removed extraneous result properties: `host`, `path`, `query`, etc.,
	//    which can be constructed using other parts of the url.
	//

	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.pathname = null;
	}

	// Reference: RFC 3986, RFC 1808, RFC 2396

	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	    portPattern = /:[0-9]*$/,


	// Special case for a simple path URL
	simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,


	// RFC 2396: characters reserved for delimiting URLs.
	// We actually just auto-escape these.
	delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],


	// RFC 2396: characters not allowed for various reasons.
	unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),


	// Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	autoEscape = ['\''].concat(unwise),

	// Characters that are never ever allowed in a hostname.
	// Note that any invalid chars are also handled, but these
	// are the ones that are *expected* to be seen, so we fast-path
	// them.
	nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	    hostEndingChars = ['/', '?', '#'],
	    hostnameMaxLen = 255,
	    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
	    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,

	// protocols that can allow "unsafe" and "unwise" chars.
	/* eslint-disable no-script-url */
	// protocols that never have a hostname.
	hostlessProtocol = {
	  'javascript': true,
	  'javascript:': true
	},

	// protocols that always contain a // bit.
	slashedProtocol = {
	  'http': true,
	  'https': true,
	  'ftp': true,
	  'gopher': true,
	  'file': true,
	  'http:': true,
	  'https:': true,
	  'ftp:': true,
	  'gopher:': true,
	  'file:': true
	};
	/* eslint-enable no-script-url */

	function urlParse(url, slashesDenoteHost) {
	  if (url && url instanceof Url) {
	    return url;
	  }

	  var u = new Url();
	  u.parse(url, slashesDenoteHost);
	  return u;
	}

	Url.prototype.parse = function (url, slashesDenoteHost) {
	  var i,
	      l,
	      lowerProto,
	      hec,
	      slashes,
	      rest = url;

	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();

	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    var simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      this.pathname = simplePath[1];
	      if (simplePath[2]) {
	        this.search = simplePath[2];
	      }
	      return this;
	    }
	  }

	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    lowerProto = proto.toLowerCase();
	    this.protocol = proto;
	    rest = rest.substr(proto.length);
	  }

	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }

	  if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {

	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c

	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.

	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (i = 0; i < hostEndingChars.length; i++) {
	      hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
	        hostEnd = hec;
	      }
	    }

	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }

	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = auth;
	    }

	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (i = 0; i < nonHostChars.length; i++) {
	      hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
	        hostEnd = hec;
	      }
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1) {
	      hostEnd = rest.length;
	    }

	    if (rest[hostEnd - 1] === ':') {
	      hostEnd--;
	    }
	    var host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);

	    // pull out port.
	    this.parseHost(host);

	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';

	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';

	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = this.hostname.split(/\./);
	      for (i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) {
	          continue;
	        }
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }

	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    }

	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	    }
	  }

	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    rest = rest.slice(0, qm);
	  }
	  if (rest) {
	    this.pathname = rest;
	  }
	  if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
	    this.pathname = '';
	  }

	  return this;
	};

	Url.prototype.parseHost = function (host) {
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) {
	    this.hostname = host;
	  }
	};

	module.exports = urlParse;

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports.Any = __webpack_require__(59);
	module.exports.Cc = __webpack_require__(60);
	module.exports.Cf = __webpack_require__(61);
	module.exports.P = __webpack_require__(52);
	module.exports.Z = __webpack_require__(62);

/***/ },
/* 59 */
/***/ function(module, exports) {

	module.exports = /[\0-\uD7FF\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF]/;

/***/ },
/* 60 */
/***/ function(module, exports) {

	module.exports = /[\0-\x1F\x7F-\x9F]/;

/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804\uDCBD|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;

/***/ },
/* 62 */
/***/ function(module, exports) {

	module.exports = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	// Just a shortcut for bulk export
	'use strict';

	exports.parseLinkLabel = __webpack_require__(64);
	exports.parseLinkDestination = __webpack_require__(65);
	exports.parseLinkTitle = __webpack_require__(66);

/***/ },
/* 64 */
/***/ function(module, exports) {

	// Parse link label
	//
	// this function assumes that first character ("[") already matches;
	// returns the end of the label
	//
	'use strict';

	module.exports = function parseLinkLabel(state, start, disableNested) {
	  var level,
	      found,
	      marker,
	      prevPos,
	      labelEnd = -1,
	      max = state.posMax,
	      oldPos = state.pos;

	  state.pos = start + 1;
	  level = 1;

	  while (state.pos < max) {
	    marker = state.src.charCodeAt(state.pos);
	    if (marker === 0x5D /* ] */) {
	        level--;
	        if (level === 0) {
	          found = true;
	          break;
	        }
	      }

	    prevPos = state.pos;
	    state.md.inline.skipToken(state);
	    if (marker === 0x5B /* [ */) {
	        if (prevPos === state.pos - 1) {
	          // increase level if we find text `[`, which is not a part of any token
	          level++;
	        } else if (disableNested) {
	          state.pos = oldPos;
	          return -1;
	        }
	      }
	  }

	  if (found) {
	    labelEnd = state.pos;
	  }

	  // restore old state
	  state.pos = oldPos;

	  return labelEnd;
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	// Parse link destination
	//
	'use strict';

	var unescapeAll = __webpack_require__(49).unescapeAll;

	module.exports = function parseLinkDestination(str, pos, max) {
	  var code,
	      level,
	      lines = 0,
	      start = pos,
	      result = {
	    ok: false,
	    pos: 0,
	    lines: 0,
	    str: ''
	  };

	  if (str.charCodeAt(pos) === 0x3C /* < */) {
	      pos++;
	      while (pos < max) {
	        code = str.charCodeAt(pos);
	        if (code === 0x0A /* \n */) {
	            return result;
	          }
	        if (code === 0x3E /* > */) {
	            result.pos = pos + 1;
	            result.str = unescapeAll(str.slice(start + 1, pos));
	            result.ok = true;
	            return result;
	          }
	        if (code === 0x5C /* \ */ && pos + 1 < max) {
	          pos += 2;
	          continue;
	        }

	        pos++;
	      }

	      // no closing '>'
	      return result;
	    }

	  // this should be ... } else { ... branch

	  level = 0;
	  while (pos < max) {
	    code = str.charCodeAt(pos);

	    if (code === 0x20) {
	      break;
	    }

	    // ascii control characters
	    if (code < 0x20 || code === 0x7F) {
	      break;
	    }

	    if (code === 0x5C /* \ */ && pos + 1 < max) {
	      pos += 2;
	      continue;
	    }

	    if (code === 0x28 /* ( */) {
	        level++;
	        if (level > 1) {
	          break;
	        }
	      }

	    if (code === 0x29 /* ) */) {
	        level--;
	        if (level < 0) {
	          break;
	        }
	      }

	    pos++;
	  }

	  if (start === pos) {
	    return result;
	  }

	  result.str = unescapeAll(str.slice(start, pos));
	  result.lines = lines;
	  result.pos = pos;
	  result.ok = true;
	  return result;
	};

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	// Parse link title
	//
	'use strict';

	var unescapeAll = __webpack_require__(49).unescapeAll;

	module.exports = function parseLinkTitle(str, pos, max) {
	  var code,
	      marker,
	      lines = 0,
	      start = pos,
	      result = {
	    ok: false,
	    pos: 0,
	    lines: 0,
	    str: ''
	  };

	  if (pos >= max) {
	    return result;
	  }

	  marker = str.charCodeAt(pos);

	  if (marker !== 0x22 /* " */ && marker !== 0x27 /* ' */ && marker !== 0x28 /* ( */) {
	      return result;
	    }

	  pos++;

	  // if opening marker is "(", switch it to closing marker ")"
	  if (marker === 0x28) {
	    marker = 0x29;
	  }

	  while (pos < max) {
	    code = str.charCodeAt(pos);
	    if (code === marker) {
	      result.pos = pos + 1;
	      result.lines = lines;
	      result.str = unescapeAll(str.slice(start + 1, pos));
	      result.ok = true;
	      return result;
	    } else if (code === 0x0A) {
	      lines++;
	    } else if (code === 0x5C /* \ */ && pos + 1 < max) {
	      pos++;
	      if (str.charCodeAt(pos) === 0x0A) {
	        lines++;
	      }
	    }

	    pos++;
	  }

	  return result;
	};

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * class Renderer
	 *
	 * Generates HTML from parsed token stream. Each instance has independent
	 * copy of rules. Those can be rewritten with ease. Also, you can add new
	 * rules if you create plugin and adds new token types.
	 **/
	'use strict';

	var assign = __webpack_require__(49).assign;
	var unescapeAll = __webpack_require__(49).unescapeAll;
	var escapeHtml = __webpack_require__(49).escapeHtml;

	////////////////////////////////////////////////////////////////////////////////

	var default_rules = {};

	default_rules.code_inline = function (tokens, idx /*, options, env */) {
	  return '<code>' + escapeHtml(tokens[idx].content) + '</code>';
	};

	default_rules.code_block = function (tokens, idx /*, options, env */) {
	  return '<pre><code>' + escapeHtml(tokens[idx].content) + '</code></pre>\n';
	};

	default_rules.fence = function (tokens, idx, options, env, slf) {
	  var token = tokens[idx],
	      info = token.info ? unescapeAll(token.info).trim() : '',
	      langName = '',
	      highlighted;

	  if (info) {
	    langName = info.split(/\s+/g)[0];
	    token.attrJoin('class', options.langPrefix + langName);
	  }

	  if (options.highlight) {
	    highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
	  } else {
	    highlighted = escapeHtml(token.content);
	  }

	  if (highlighted.indexOf('<pre') === 0) {
	    return highlighted + '\n';
	  }

	  return '<pre><code' + slf.renderAttrs(token) + '>' + highlighted + '</code></pre>\n';
	};

	default_rules.image = function (tokens, idx, options, env, slf) {
	  var token = tokens[idx];

	  // "alt" attr MUST be set, even if empty. Because it's mandatory and
	  // should be placed on proper position for tests.
	  //
	  // Replace content with actual value

	  token.attrs[token.attrIndex('alt')][1] = slf.renderInlineAsText(token.children, options, env);

	  return slf.renderToken(tokens, idx, options);
	};

	default_rules.hardbreak = function (tokens, idx, options /*, env */) {
	  return options.xhtmlOut ? '<br />\n' : '<br>\n';
	};
	default_rules.softbreak = function (tokens, idx, options /*, env */) {
	  return options.breaks ? options.xhtmlOut ? '<br />\n' : '<br>\n' : '\n';
	};

	default_rules.text = function (tokens, idx /*, options, env */) {
	  return escapeHtml(tokens[idx].content);
	};

	default_rules.html_block = function (tokens, idx /*, options, env */) {
	  return tokens[idx].content;
	};
	default_rules.html_inline = function (tokens, idx /*, options, env */) {
	  return tokens[idx].content;
	};

	/**
	 * new Renderer()
	 *
	 * Creates new [[Renderer]] instance and fill [[Renderer#rules]] with defaults.
	 **/
	function Renderer() {

	  /**
	   * Renderer#rules -> Object
	   *
	   * Contains render rules for tokens. Can be updated and extended.
	   *
	   * ##### Example
	   *
	   * ```javascript
	   * var md = require('markdown-it')();
	   *
	   * md.renderer.rules.strong_open  = function () { return '<b>'; };
	   * md.renderer.rules.strong_close = function () { return '</b>'; };
	   *
	   * var result = md.renderInline(...);
	   * ```
	   *
	   * Each rule is called as independed static function with fixed signature:
	   *
	   * ```javascript
	   * function my_token_render(tokens, idx, options, env, renderer) {
	   *   // ...
	   *   return renderedHTML;
	   * }
	   * ```
	   *
	   * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js)
	   * for more details and examples.
	   **/
	  this.rules = assign({}, default_rules);
	}

	/**
	 * Renderer.renderAttrs(token) -> String
	 *
	 * Render token attributes to string.
	 **/
	Renderer.prototype.renderAttrs = function renderAttrs(token) {
	  var i, l, result;

	  if (!token.attrs) {
	    return '';
	  }

	  result = '';

	  for (i = 0, l = token.attrs.length; i < l; i++) {
	    result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
	  }

	  return result;
	};

	/**
	 * Renderer.renderToken(tokens, idx, options) -> String
	 * - tokens (Array): list of tokens
	 * - idx (Numbed): token index to render
	 * - options (Object): params of parser instance
	 *
	 * Default token renderer. Can be overriden by custom function
	 * in [[Renderer#rules]].
	 **/
	Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
	  var nextToken,
	      result = '',
	      needLf = false,
	      token = tokens[idx];

	  // Tight list paragraphs
	  if (token.hidden) {
	    return '';
	  }

	  // Insert a newline between hidden paragraph and subsequent opening
	  // block-level tag.
	  //
	  // For example, here we should insert a newline before blockquote:
	  //  - a
	  //    >
	  //
	  if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
	    result += '\n';
	  }

	  // Add token name, e.g. `<img`
	  result += (token.nesting === -1 ? '</' : '<') + token.tag;

	  // Encode attributes, e.g. `<img src="foo"`
	  result += this.renderAttrs(token);

	  // Add a slash for self-closing tags, e.g. `<img src="foo" /`
	  if (token.nesting === 0 && options.xhtmlOut) {
	    result += ' /';
	  }

	  // Check if we need to add a newline after this tag
	  if (token.block) {
	    needLf = true;

	    if (token.nesting === 1) {
	      if (idx + 1 < tokens.length) {
	        nextToken = tokens[idx + 1];

	        if (nextToken.type === 'inline' || nextToken.hidden) {
	          // Block-level tag containing an inline tag.
	          //
	          needLf = false;
	        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
	          // Opening tag + closing tag of the same type. E.g. `<li></li>`.
	          //
	          needLf = false;
	        }
	      }
	    }
	  }

	  result += needLf ? '>\n' : '>';

	  return result;
	};

	/**
	 * Renderer.renderInline(tokens, options, env) -> String
	 * - tokens (Array): list on block tokens to renter
	 * - options (Object): params of parser instance
	 * - env (Object): additional data from parsed input (references, for example)
	 *
	 * The same as [[Renderer.render]], but for single token of `inline` type.
	 **/
	Renderer.prototype.renderInline = function (tokens, options, env) {
	  var type,
	      result = '',
	      rules = this.rules;

	  for (var i = 0, len = tokens.length; i < len; i++) {
	    type = tokens[i].type;

	    if (typeof rules[type] !== 'undefined') {
	      result += rules[type](tokens, i, options, env, this);
	    } else {
	      result += this.renderToken(tokens, i, options);
	    }
	  }

	  return result;
	};

	/** internal
	 * Renderer.renderInlineAsText(tokens, options, env) -> String
	 * - tokens (Array): list on block tokens to renter
	 * - options (Object): params of parser instance
	 * - env (Object): additional data from parsed input (references, for example)
	 *
	 * Special kludge for image `alt` attributes to conform CommonMark spec.
	 * Don't try to use it! Spec requires to show `alt` content with stripped markup,
	 * instead of simple escaping.
	 **/
	Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
	  var result = '',
	      rules = this.rules;

	  for (var i = 0, len = tokens.length; i < len; i++) {
	    if (tokens[i].type === 'text') {
	      result += rules.text(tokens, i, options, env, this);
	    } else if (tokens[i].type === 'image') {
	      result += this.renderInlineAsText(tokens[i].children, options, env);
	    }
	  }

	  return result;
	};

	/**
	 * Renderer.render(tokens, options, env) -> String
	 * - tokens (Array): list on block tokens to renter
	 * - options (Object): params of parser instance
	 * - env (Object): additional data from parsed input (references, for example)
	 *
	 * Takes token stream and generates HTML. Probably, you will never need to call
	 * this method directly.
	 **/
	Renderer.prototype.render = function (tokens, options, env) {
	  var i,
	      len,
	      type,
	      result = '',
	      rules = this.rules;

	  for (i = 0, len = tokens.length; i < len; i++) {
	    type = tokens[i].type;

	    if (type === 'inline') {
	      result += this.renderInline(tokens[i].children, options, env);
	    } else if (typeof rules[type] !== 'undefined') {
	      result += rules[tokens[i].type](tokens, i, options, env, this);
	    } else {
	      result += this.renderToken(tokens, i, options, env);
	    }
	  }

	  return result;
	};

	module.exports = Renderer;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	/** internal
	 * class Core
	 *
	 * Top-level rules executor. Glues block/inline parsers and does intermediate
	 * transformations.
	 **/
	'use strict';

	var Ruler = __webpack_require__(69);

	var _rules = [['normalize', __webpack_require__(70)], ['block', __webpack_require__(71)], ['inline', __webpack_require__(72)], ['linkify', __webpack_require__(73)], ['replacements', __webpack_require__(74)], ['smartquotes', __webpack_require__(75)]];

	/**
	 * new Core()
	 **/
	function Core() {
	  /**
	   * Core#ruler -> Ruler
	   *
	   * [[Ruler]] instance. Keep configuration of core rules.
	   **/
	  this.ruler = new Ruler();

	  for (var i = 0; i < _rules.length; i++) {
	    this.ruler.push(_rules[i][0], _rules[i][1]);
	  }
	}

	/**
	 * Core.process(state)
	 *
	 * Executes core chain rules.
	 **/
	Core.prototype.process = function (state) {
	  var i, l, rules;

	  rules = this.ruler.getRules('');

	  for (i = 0, l = rules.length; i < l; i++) {
	    rules[i](state);
	  }
	};

	Core.prototype.State = __webpack_require__(76);

	module.exports = Core;

/***/ },
/* 69 */
/***/ function(module, exports) {

	/**
	 * class Ruler
	 *
	 * Helper class, used by [[MarkdownIt#core]], [[MarkdownIt#block]] and
	 * [[MarkdownIt#inline]] to manage sequences of functions (rules):
	 *
	 * - keep rules in defined order
	 * - assign the name to each rule
	 * - enable/disable rules
	 * - add/replace rules
	 * - allow assign rules to additional named chains (in the same)
	 * - cacheing lists of active rules
	 *
	 * You will not need use this class directly until write plugins. For simple
	 * rules control use [[MarkdownIt.disable]], [[MarkdownIt.enable]] and
	 * [[MarkdownIt.use]].
	 **/
	'use strict';

	/**
	 * new Ruler()
	 **/

	function Ruler() {
	  // List of added rules. Each element is:
	  //
	  // {
	  //   name: XXX,
	  //   enabled: Boolean,
	  //   fn: Function(),
	  //   alt: [ name2, name3 ]
	  // }
	  //
	  this.__rules__ = [];

	  // Cached rule chains.
	  //
	  // First level - chain name, '' for default.
	  // Second level - diginal anchor for fast filtering by charcodes.
	  //
	  this.__cache__ = null;
	}

	////////////////////////////////////////////////////////////////////////////////
	// Helper methods, should not be used directly

	// Find rule index by name
	//
	Ruler.prototype.__find__ = function (name) {
	  for (var i = 0; i < this.__rules__.length; i++) {
	    if (this.__rules__[i].name === name) {
	      return i;
	    }
	  }
	  return -1;
	};

	// Build rules lookup cache
	//
	Ruler.prototype.__compile__ = function () {
	  var self = this;
	  var chains = [''];

	  // collect unique names
	  self.__rules__.forEach(function (rule) {
	    if (!rule.enabled) {
	      return;
	    }

	    rule.alt.forEach(function (altName) {
	      if (chains.indexOf(altName) < 0) {
	        chains.push(altName);
	      }
	    });
	  });

	  self.__cache__ = {};

	  chains.forEach(function (chain) {
	    self.__cache__[chain] = [];
	    self.__rules__.forEach(function (rule) {
	      if (!rule.enabled) {
	        return;
	      }

	      if (chain && rule.alt.indexOf(chain) < 0) {
	        return;
	      }

	      self.__cache__[chain].push(rule.fn);
	    });
	  });
	};

	/**
	 * Ruler.at(name, fn [, options])
	 * - name (String): rule name to replace.
	 * - fn (Function): new rule function.
	 * - options (Object): new rule options (not mandatory).
	 *
	 * Replace rule by name with new function & options. Throws error if name not
	 * found.
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * Replace existing typorgapher replacement rule with new one:
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.core.ruler.at('replacements', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.at = function (name, fn, options) {
	  var index = this.__find__(name);
	  var opt = options || {};

	  if (index === -1) {
	    throw new Error('Parser rule not found: ' + name);
	  }

	  this.__rules__[index].fn = fn;
	  this.__rules__[index].alt = opt.alt || [];
	  this.__cache__ = null;
	};

	/**
	 * Ruler.before(beforeName, ruleName, fn [, options])
	 * - beforeName (String): new rule will be added before this one.
	 * - ruleName (String): name of added rule.
	 * - fn (Function): rule function.
	 * - options (Object): rule options (not mandatory).
	 *
	 * Add new rule to chain before one with given name. See also
	 * [[Ruler.after]], [[Ruler.push]].
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
	  var index = this.__find__(beforeName);
	  var opt = options || {};

	  if (index === -1) {
	    throw new Error('Parser rule not found: ' + beforeName);
	  }

	  this.__rules__.splice(index, 0, {
	    name: ruleName,
	    enabled: true,
	    fn: fn,
	    alt: opt.alt || []
	  });

	  this.__cache__ = null;
	};

	/**
	 * Ruler.after(afterName, ruleName, fn [, options])
	 * - afterName (String): new rule will be added after this one.
	 * - ruleName (String): name of added rule.
	 * - fn (Function): rule function.
	 * - options (Object): rule options (not mandatory).
	 *
	 * Add new rule to chain after one with given name. See also
	 * [[Ruler.before]], [[Ruler.push]].
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.inline.ruler.after('text', 'my_rule', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.after = function (afterName, ruleName, fn, options) {
	  var index = this.__find__(afterName);
	  var opt = options || {};

	  if (index === -1) {
	    throw new Error('Parser rule not found: ' + afterName);
	  }

	  this.__rules__.splice(index + 1, 0, {
	    name: ruleName,
	    enabled: true,
	    fn: fn,
	    alt: opt.alt || []
	  });

	  this.__cache__ = null;
	};

	/**
	 * Ruler.push(ruleName, fn [, options])
	 * - ruleName (String): name of added rule.
	 * - fn (Function): rule function.
	 * - options (Object): rule options (not mandatory).
	 *
	 * Push new rule to the end of chain. See also
	 * [[Ruler.before]], [[Ruler.after]].
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.core.ruler.push('my_rule', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.push = function (ruleName, fn, options) {
	  var opt = options || {};

	  this.__rules__.push({
	    name: ruleName,
	    enabled: true,
	    fn: fn,
	    alt: opt.alt || []
	  });

	  this.__cache__ = null;
	};

	/**
	 * Ruler.enable(list [, ignoreInvalid]) -> Array
	 * - list (String|Array): list of rule names to enable.
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Enable rules with given names. If any rule name not found - throw Error.
	 * Errors can be disabled by second param.
	 *
	 * Returns list of found rule names (if no exception happened).
	 *
	 * See also [[Ruler.disable]], [[Ruler.enableOnly]].
	 **/
	Ruler.prototype.enable = function (list, ignoreInvalid) {
	  if (!Array.isArray(list)) {
	    list = [list];
	  }

	  var result = [];

	  // Search by name and enable
	  list.forEach(function (name) {
	    var idx = this.__find__(name);

	    if (idx < 0) {
	      if (ignoreInvalid) {
	        return;
	      }
	      throw new Error('Rules manager: invalid rule name ' + name);
	    }
	    this.__rules__[idx].enabled = true;
	    result.push(name);
	  }, this);

	  this.__cache__ = null;
	  return result;
	};

	/**
	 * Ruler.enableOnly(list [, ignoreInvalid])
	 * - list (String|Array): list of rule names to enable (whitelist).
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Enable rules with given names, and disable everything else. If any rule name
	 * not found - throw Error. Errors can be disabled by second param.
	 *
	 * See also [[Ruler.disable]], [[Ruler.enable]].
	 **/
	Ruler.prototype.enableOnly = function (list, ignoreInvalid) {
	  if (!Array.isArray(list)) {
	    list = [list];
	  }

	  this.__rules__.forEach(function (rule) {
	    rule.enabled = false;
	  });

	  this.enable(list, ignoreInvalid);
	};

	/**
	 * Ruler.disable(list [, ignoreInvalid]) -> Array
	 * - list (String|Array): list of rule names to disable.
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Disable rules with given names. If any rule name not found - throw Error.
	 * Errors can be disabled by second param.
	 *
	 * Returns list of found rule names (if no exception happened).
	 *
	 * See also [[Ruler.enable]], [[Ruler.enableOnly]].
	 **/
	Ruler.prototype.disable = function (list, ignoreInvalid) {
	  if (!Array.isArray(list)) {
	    list = [list];
	  }

	  var result = [];

	  // Search by name and disable
	  list.forEach(function (name) {
	    var idx = this.__find__(name);

	    if (idx < 0) {
	      if (ignoreInvalid) {
	        return;
	      }
	      throw new Error('Rules manager: invalid rule name ' + name);
	    }
	    this.__rules__[idx].enabled = false;
	    result.push(name);
	  }, this);

	  this.__cache__ = null;
	  return result;
	};

	/**
	 * Ruler.getRules(chainName) -> Array
	 *
	 * Return array of active functions (rules) for given chain name. It analyzes
	 * rules configuration, compiles caches if not exists and returns result.
	 *
	 * Default chain name is `''` (empty string). It can't be skipped. That's
	 * done intentionally, to keep signature monomorphic for high speed.
	 **/
	Ruler.prototype.getRules = function (chainName) {
	  if (this.__cache__ === null) {
	    this.__compile__();
	  }

	  // Chain can be empty, if rules disabled. But we still have to return Array.
	  return this.__cache__[chainName] || [];
	};

	module.exports = Ruler;

/***/ },
/* 70 */
/***/ function(module, exports) {

	// Normalize input string

	'use strict';

	var NEWLINES_RE = /\r[\n\u0085]|[\u2424\u2028\u0085]/g;
	var NULL_RE = /\u0000/g;

	module.exports = function inline(state) {
	  var str;

	  // Normalize newlines
	  str = state.src.replace(NEWLINES_RE, '\n');

	  // Replace NULL characters
	  str = str.replace(NULL_RE, '\uFFFD');

	  state.src = str;
	};

/***/ },
/* 71 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function block(state) {
	  var token;

	  if (state.inlineMode) {
	    token = new state.Token('inline', '', 0);
	    token.content = state.src;
	    token.map = [0, 1];
	    token.children = [];
	    state.tokens.push(token);
	  } else {
	    state.md.block.parse(state.src, state.md, state.env, state.tokens);
	  }
	};

/***/ },
/* 72 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function inline(state) {
	  var tokens = state.tokens,
	      tok,
	      i,
	      l;

	  // Parse inlines
	  for (i = 0, l = tokens.length; i < l; i++) {
	    tok = tokens[i];
	    if (tok.type === 'inline') {
	      state.md.inline.parse(tok.content, state.md, state.env, tok.children);
	    }
	  }
	};

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	// Replace link-like texts with link nodes.
	//
	// Currently restricted by `md.validateLink()` to http/https/ftp
	//
	'use strict';

	var arrayReplaceAt = __webpack_require__(49).arrayReplaceAt;

	function isLinkOpen(str) {
	  return (/^<a[>\s]/i.test(str)
	  );
	}
	function isLinkClose(str) {
	  return (/^<\/a\s*>/i.test(str)
	  );
	}

	module.exports = function linkify(state) {
	  var i,
	      j,
	      l,
	      tokens,
	      token,
	      currentToken,
	      nodes,
	      ln,
	      text,
	      pos,
	      lastPos,
	      level,
	      htmlLinkLevel,
	      url,
	      fullUrl,
	      urlText,
	      blockTokens = state.tokens,
	      links;

	  if (!state.md.options.linkify) {
	    return;
	  }

	  for (j = 0, l = blockTokens.length; j < l; j++) {
	    if (blockTokens[j].type !== 'inline' || !state.md.linkify.pretest(blockTokens[j].content)) {
	      continue;
	    }

	    tokens = blockTokens[j].children;

	    htmlLinkLevel = 0;

	    // We scan from the end, to keep position when new tags added.
	    // Use reversed logic in links start/end match
	    for (i = tokens.length - 1; i >= 0; i--) {
	      currentToken = tokens[i];

	      // Skip content of markdown links
	      if (currentToken.type === 'link_close') {
	        i--;
	        while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
	          i--;
	        }
	        continue;
	      }

	      // Skip content of html tag links
	      if (currentToken.type === 'html_inline') {
	        if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
	          htmlLinkLevel--;
	        }
	        if (isLinkClose(currentToken.content)) {
	          htmlLinkLevel++;
	        }
	      }
	      if (htmlLinkLevel > 0) {
	        continue;
	      }

	      if (currentToken.type === 'text' && state.md.linkify.test(currentToken.content)) {

	        text = currentToken.content;
	        links = state.md.linkify.match(text);

	        // Now split string to nodes
	        nodes = [];
	        level = currentToken.level;
	        lastPos = 0;

	        for (ln = 0; ln < links.length; ln++) {

	          url = links[ln].url;
	          fullUrl = state.md.normalizeLink(url);
	          if (!state.md.validateLink(fullUrl)) {
	            continue;
	          }

	          urlText = links[ln].text;

	          // Linkifier might send raw hostnames like "example.com", where url
	          // starts with domain name. So we prepend http:// in those cases,
	          // and remove it afterwards.
	          //
	          if (!links[ln].schema) {
	            urlText = state.md.normalizeLinkText('http://' + urlText).replace(/^http:\/\//, '');
	          } else if (links[ln].schema === 'mailto:' && !/^mailto:/i.test(urlText)) {
	            urlText = state.md.normalizeLinkText('mailto:' + urlText).replace(/^mailto:/, '');
	          } else {
	            urlText = state.md.normalizeLinkText(urlText);
	          }

	          pos = links[ln].index;

	          if (pos > lastPos) {
	            token = new state.Token('text', '', 0);
	            token.content = text.slice(lastPos, pos);
	            token.level = level;
	            nodes.push(token);
	          }

	          token = new state.Token('link_open', 'a', 1);
	          token.attrs = [['href', fullUrl]];
	          token.level = level++;
	          token.markup = 'linkify';
	          token.info = 'auto';
	          nodes.push(token);

	          token = new state.Token('text', '', 0);
	          token.content = urlText;
	          token.level = level;
	          nodes.push(token);

	          token = new state.Token('link_close', 'a', -1);
	          token.level = --level;
	          token.markup = 'linkify';
	          token.info = 'auto';
	          nodes.push(token);

	          lastPos = links[ln].lastIndex;
	        }
	        if (lastPos < text.length) {
	          token = new state.Token('text', '', 0);
	          token.content = text.slice(lastPos);
	          token.level = level;
	          nodes.push(token);
	        }

	        // replace current node
	        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
	      }
	    }
	  }
	};

/***/ },
/* 74 */
/***/ function(module, exports) {

	// Simple typographyc replacements
	//
	// (c) (C) → ©
	// (tm) (TM) → ™
	// (r) (R) → ®
	// +- → ±
	// (p) (P) -> §
	// ... → … (also ?.... → ?.., !.... → !..)
	// ???????? → ???, !!!!! → !!!, `,,` → `,`
	// -- → &ndash;, --- → &mdash;
	//
	'use strict';

	// TODO:
	// - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
	// - miltiplication 2 x 4 -> 2 × 4

	var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;

	// Workaround for phantomjs - need regex without /g flag,
	// or root check will fail every second time
	var SCOPED_ABBR_TEST_RE = /\((c|tm|r|p)\)/i;

	var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
	var SCOPED_ABBR = {
	  'c': '©',
	  'r': '®',
	  'p': '§',
	  'tm': '™'
	};

	function replaceFn(match, name) {
	  return SCOPED_ABBR[name.toLowerCase()];
	}

	function replace_scoped(inlineTokens) {
	  var i, token;

	  for (i = inlineTokens.length - 1; i >= 0; i--) {
	    token = inlineTokens[i];
	    if (token.type === 'text') {
	      token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
	    }
	  }
	}

	function replace_rare(inlineTokens) {
	  var i, token;

	  for (i = inlineTokens.length - 1; i >= 0; i--) {
	    token = inlineTokens[i];
	    if (token.type === 'text') {
	      if (RARE_RE.test(token.content)) {
	        token.content = token.content.replace(/\+-/g, '±')
	        // .., ..., ....... -> …
	        // but ?..... & !..... -> ?.. & !..
	        .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..').replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
	        // em-dash
	        .replace(/(^|[^-])---([^-]|$)/mg, '$1\u2014$2')
	        // en-dash
	        .replace(/(^|\s)--(\s|$)/mg, '$1\u2013$2').replace(/(^|[^-\s])--([^-\s]|$)/mg, '$1\u2013$2');
	      }
	    }
	  }
	}

	module.exports = function replace(state) {
	  var blkIdx;

	  if (!state.md.options.typographer) {
	    return;
	  }

	  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

	    if (state.tokens[blkIdx].type !== 'inline') {
	      continue;
	    }

	    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
	      replace_scoped(state.tokens[blkIdx].children);
	    }

	    if (RARE_RE.test(state.tokens[blkIdx].content)) {
	      replace_rare(state.tokens[blkIdx].children);
	    }
	  }
	};

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	// Convert straight quotation marks to typographic ones
	//
	'use strict';

	var isWhiteSpace = __webpack_require__(49).isWhiteSpace;
	var isPunctChar = __webpack_require__(49).isPunctChar;
	var isMdAsciiPunct = __webpack_require__(49).isMdAsciiPunct;

	var QUOTE_TEST_RE = /['"]/;
	var QUOTE_RE = /['"]/g;
	var APOSTROPHE = '\u2019'; /* ’ */

	function replaceAt(str, index, ch) {
	  return str.substr(0, index) + ch + str.substr(index + 1);
	}

	function process_inlines(tokens, state) {
	  var i, token, text, t, pos, max, thisLevel, item, lastChar, nextChar, isLastPunctChar, isNextPunctChar, isLastWhiteSpace, isNextWhiteSpace, canOpen, canClose, j, isSingle, stack, openQuote, closeQuote;

	  stack = [];

	  for (i = 0; i < tokens.length; i++) {
	    token = tokens[i];

	    thisLevel = tokens[i].level;

	    for (j = stack.length - 1; j >= 0; j--) {
	      if (stack[j].level <= thisLevel) {
	        break;
	      }
	    }
	    stack.length = j + 1;

	    if (token.type !== 'text') {
	      continue;
	    }

	    text = token.content;
	    pos = 0;
	    max = text.length;

	    /*eslint no-labels:0,block-scoped-var:0*/
	    OUTER: while (pos < max) {
	      QUOTE_RE.lastIndex = pos;
	      t = QUOTE_RE.exec(text);
	      if (!t) {
	        break;
	      }

	      canOpen = canClose = true;
	      pos = t.index + 1;
	      isSingle = t[0] === "'";

	      // Find previous character,
	      // default to space if it's the beginning of the line
	      //
	      lastChar = 0x20;

	      if (t.index - 1 >= 0) {
	        lastChar = text.charCodeAt(t.index - 1);
	      } else {
	        for (j = i - 1; j >= 0; j--) {
	          if (tokens[j].type !== 'text') {
	            continue;
	          }

	          lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
	          break;
	        }
	      }

	      // Find next character,
	      // default to space if it's the end of the line
	      //
	      nextChar = 0x20;

	      if (pos < max) {
	        nextChar = text.charCodeAt(pos);
	      } else {
	        for (j = i + 1; j < tokens.length; j++) {
	          if (tokens[j].type !== 'text') {
	            continue;
	          }

	          nextChar = tokens[j].content.charCodeAt(0);
	          break;
	        }
	      }

	      isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
	      isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

	      isLastWhiteSpace = isWhiteSpace(lastChar);
	      isNextWhiteSpace = isWhiteSpace(nextChar);

	      if (isNextWhiteSpace) {
	        canOpen = false;
	      } else if (isNextPunctChar) {
	        if (!(isLastWhiteSpace || isLastPunctChar)) {
	          canOpen = false;
	        }
	      }

	      if (isLastWhiteSpace) {
	        canClose = false;
	      } else if (isLastPunctChar) {
	        if (!(isNextWhiteSpace || isNextPunctChar)) {
	          canClose = false;
	        }
	      }

	      if (nextChar === 0x22 /* " */ && t[0] === '"') {
	        if (lastChar >= 0x30 /* 0 */ && lastChar <= 0x39 /* 9 */) {
	            // special case: 1"" - count first quote as an inch
	            canClose = canOpen = false;
	          }
	      }

	      if (canOpen && canClose) {
	        // treat this as the middle of the word
	        canOpen = false;
	        canClose = isNextPunctChar;
	      }

	      if (!canOpen && !canClose) {
	        // middle of word
	        if (isSingle) {
	          token.content = replaceAt(token.content, t.index, APOSTROPHE);
	        }
	        continue;
	      }

	      if (canClose) {
	        // this could be a closing quote, rewind the stack to get a match
	        for (j = stack.length - 1; j >= 0; j--) {
	          item = stack[j];
	          if (stack[j].level < thisLevel) {
	            break;
	          }
	          if (item.single === isSingle && stack[j].level === thisLevel) {
	            item = stack[j];

	            if (isSingle) {
	              openQuote = state.md.options.quotes[2];
	              closeQuote = state.md.options.quotes[3];
	            } else {
	              openQuote = state.md.options.quotes[0];
	              closeQuote = state.md.options.quotes[1];
	            }

	            // replace token.content *before* tokens[item.token].content,
	            // because, if they are pointing at the same token, replaceAt
	            // could mess up indices when quote length != 1
	            token.content = replaceAt(token.content, t.index, closeQuote);
	            tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, openQuote);

	            pos += closeQuote.length - 1;
	            if (item.token === i) {
	              pos += openQuote.length - 1;
	            }

	            text = token.content;
	            max = text.length;

	            stack.length = j;
	            continue OUTER;
	          }
	        }
	      }

	      if (canOpen) {
	        stack.push({
	          token: i,
	          pos: t.index,
	          single: isSingle,
	          level: thisLevel
	        });
	      } else if (canClose && isSingle) {
	        token.content = replaceAt(token.content, t.index, APOSTROPHE);
	      }
	    }
	  }
	}

	module.exports = function smartquotes(state) {
	  /*eslint max-depth:0*/
	  var blkIdx;

	  if (!state.md.options.typographer) {
	    return;
	  }

	  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

	    if (state.tokens[blkIdx].type !== 'inline' || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
	      continue;
	    }

	    process_inlines(state.tokens[blkIdx].children, state);
	  }
	};

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	// Core state object
	//
	'use strict';

	var Token = __webpack_require__(77);

	function StateCore(src, md, env) {
	  this.src = src;
	  this.env = env;
	  this.tokens = [];
	  this.inlineMode = false;
	  this.md = md; // link to parser instance
	}

	// re-export Token class to use in core rules
	StateCore.prototype.Token = Token;

	module.exports = StateCore;

/***/ },
/* 77 */
/***/ function(module, exports) {

	// Token class

	'use strict';

	/**
	 * class Token
	 **/

	/**
	 * new Token(type, tag, nesting)
	 *
	 * Create new token and fill passed properties.
	 **/

	function Token(type, tag, nesting) {
	  /**
	   * Token#type -> String
	   *
	   * Type of the token (string, e.g. "paragraph_open")
	   **/
	  this.type = type;

	  /**
	   * Token#tag -> String
	   *
	   * html tag name, e.g. "p"
	   **/
	  this.tag = tag;

	  /**
	   * Token#attrs -> Array
	   *
	   * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
	   **/
	  this.attrs = null;

	  /**
	   * Token#map -> Array
	   *
	   * Source map info. Format: `[ line_begin, line_end ]`
	   **/
	  this.map = null;

	  /**
	   * Token#nesting -> Number
	   *
	   * Level change (number in {-1, 0, 1} set), where:
	   *
	   * -  `1` means the tag is opening
	   * -  `0` means the tag is self-closing
	   * - `-1` means the tag is closing
	   **/
	  this.nesting = nesting;

	  /**
	   * Token#level -> Number
	   *
	   * nesting level, the same as `state.level`
	   **/
	  this.level = 0;

	  /**
	   * Token#children -> Array
	   *
	   * An array of child nodes (inline and img tokens)
	   **/
	  this.children = null;

	  /**
	   * Token#content -> String
	   *
	   * In a case of self-closing tag (code, html, fence, etc.),
	   * it has contents of this tag.
	   **/
	  this.content = '';

	  /**
	   * Token#markup -> String
	   *
	   * '*' or '_' for emphasis, fence string for fence, etc.
	   **/
	  this.markup = '';

	  /**
	   * Token#info -> String
	   *
	   * fence infostring
	   **/
	  this.info = '';

	  /**
	   * Token#meta -> Object
	   *
	   * A place for plugins to store an arbitrary data
	   **/
	  this.meta = null;

	  /**
	   * Token#block -> Boolean
	   *
	   * True for block-level tokens, false for inline tokens.
	   * Used in renderer to calculate line breaks
	   **/
	  this.block = false;

	  /**
	   * Token#hidden -> Boolean
	   *
	   * If it's true, ignore this element when rendering. Used for tight lists
	   * to hide paragraphs.
	   **/
	  this.hidden = false;
	}

	/**
	 * Token.attrIndex(name) -> Number
	 *
	 * Search attribute index by name.
	 **/
	Token.prototype.attrIndex = function attrIndex(name) {
	  var attrs, i, len;

	  if (!this.attrs) {
	    return -1;
	  }

	  attrs = this.attrs;

	  for (i = 0, len = attrs.length; i < len; i++) {
	    if (attrs[i][0] === name) {
	      return i;
	    }
	  }
	  return -1;
	};

	/**
	 * Token.attrPush(attrData)
	 *
	 * Add `[ name, value ]` attribute to list. Init attrs if necessary
	 **/
	Token.prototype.attrPush = function attrPush(attrData) {
	  if (this.attrs) {
	    this.attrs.push(attrData);
	  } else {
	    this.attrs = [attrData];
	  }
	};

	/**
	 * Token.attrSet(name, value)
	 *
	 * Set `name` attribute to `value`. Override old value if exists.
	 **/
	Token.prototype.attrSet = function attrSet(name, value) {
	  var idx = this.attrIndex(name),
	      attrData = [name, value];

	  if (idx < 0) {
	    this.attrPush(attrData);
	  } else {
	    this.attrs[idx] = attrData;
	  }
	};

	/**
	 * Token.attrJoin(name, value)
	 *
	 * Join value to existing attribute via space. Or create new attribute if not
	 * exists. Useful to operate with token classes.
	 **/
	Token.prototype.attrJoin = function attrJoin(name, value) {
	  var idx = this.attrIndex(name);

	  if (idx < 0) {
	    this.attrPush([name, value]);
	  } else {
	    this.attrs[idx][1] = this.attrs[idx][1] + ' ' + value;
	  }
	};

	module.exports = Token;

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	/** internal
	 * class ParserBlock
	 *
	 * Block-level tokenizer.
	 **/
	'use strict';

	var Ruler = __webpack_require__(69);

	var _rules = [
	// First 2 params - rule name & source. Secondary array - list of rules,
	// which can be terminated by this one.
	['table', __webpack_require__(79), ['paragraph', 'reference']], ['code', __webpack_require__(80)], ['fence', __webpack_require__(81), ['paragraph', 'reference', 'blockquote', 'list']], ['blockquote', __webpack_require__(82), ['paragraph', 'reference', 'list']], ['hr', __webpack_require__(83), ['paragraph', 'reference', 'blockquote', 'list']], ['list', __webpack_require__(84), ['paragraph', 'reference', 'blockquote']], ['reference', __webpack_require__(85)], ['heading', __webpack_require__(86), ['paragraph', 'reference', 'blockquote']], ['lheading', __webpack_require__(87)], ['html_block', __webpack_require__(88), ['paragraph', 'reference', 'blockquote']], ['paragraph', __webpack_require__(91)]];

	/**
	 * new ParserBlock()
	 **/
	function ParserBlock() {
	  /**
	   * ParserBlock#ruler -> Ruler
	   *
	   * [[Ruler]] instance. Keep configuration of block rules.
	   **/
	  this.ruler = new Ruler();

	  for (var i = 0; i < _rules.length; i++) {
	    this.ruler.push(_rules[i][0], _rules[i][1], { alt: (_rules[i][2] || []).slice() });
	  }
	}

	// Generate tokens for input range
	//
	ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
	  var ok,
	      i,
	      rules = this.ruler.getRules(''),
	      len = rules.length,
	      line = startLine,
	      hasEmptyLines = false,
	      maxNesting = state.md.options.maxNesting;

	  while (line < endLine) {
	    state.line = line = state.skipEmptyLines(line);
	    if (line >= endLine) {
	      break;
	    }

	    // Termination condition for nested calls.
	    // Nested calls currently used for blockquotes & lists
	    if (state.sCount[line] < state.blkIndent) {
	      break;
	    }

	    // If nesting level exceeded - skip tail to the end. That's not ordinary
	    // situation and we should not care about content.
	    if (state.level >= maxNesting) {
	      state.line = endLine;
	      break;
	    }

	    // Try all possible rules.
	    // On success, rule should:
	    //
	    // - update `state.line`
	    // - update `state.tokens`
	    // - return true

	    for (i = 0; i < len; i++) {
	      ok = rules[i](state, line, endLine, false);
	      if (ok) {
	        break;
	      }
	    }

	    // set state.tight iff we had an empty line before current tag
	    // i.e. latest empty line should not count
	    state.tight = !hasEmptyLines;

	    // paragraph might "eat" one newline after it in nested lists
	    if (state.isEmpty(state.line - 1)) {
	      hasEmptyLines = true;
	    }

	    line = state.line;

	    if (line < endLine && state.isEmpty(line)) {
	      hasEmptyLines = true;
	      line++;

	      // two empty lines should stop the parser in list mode
	      if (line < endLine && state.parentType === 'list' && state.isEmpty(line)) {
	        break;
	      }
	      state.line = line;
	    }
	  }
	};

	/**
	 * ParserBlock.parse(str, md, env, outTokens)
	 *
	 * Process input string and push block tokens into `outTokens`
	 **/
	ParserBlock.prototype.parse = function (src, md, env, outTokens) {
	  var state;

	  if (!src) {
	    return [];
	  }

	  state = new this.State(src, md, env, outTokens);

	  this.tokenize(state, state.line, state.lineMax);
	};

	ParserBlock.prototype.State = __webpack_require__(92);

	module.exports = ParserBlock;

/***/ },
/* 79 */
/***/ function(module, exports) {

	// GFM table, non-standard

	'use strict';

	function getLine(state, line) {
	  var pos = state.bMarks[line] + state.blkIndent,
	      max = state.eMarks[line];

	  return state.src.substr(pos, max - pos);
	}

	function escapedSplit(str) {
	  var result = [],
	      pos = 0,
	      max = str.length,
	      ch,
	      escapes = 0,
	      lastPos = 0,
	      backTicked = false,
	      lastBackTick = 0;

	  ch = str.charCodeAt(pos);

	  while (pos < max) {
	    if (ch === 0x60 /* ` */ && escapes % 2 === 0) {
	      backTicked = !backTicked;
	      lastBackTick = pos;
	    } else if (ch === 0x7c /* | */ && escapes % 2 === 0 && !backTicked) {
	      result.push(str.substring(lastPos, pos));
	      lastPos = pos + 1;
	    } else if (ch === 0x5c /* \ */) {
	        escapes++;
	      } else {
	      escapes = 0;
	    }

	    pos++;

	    // If there was an un-closed backtick, go back to just after
	    // the last backtick, but as if it was a normal character
	    if (pos === max && backTicked) {
	      backTicked = false;
	      pos = lastBackTick + 1;
	    }

	    ch = str.charCodeAt(pos);
	  }

	  result.push(str.substring(lastPos));

	  return result;
	}

	module.exports = function table(state, startLine, endLine, silent) {
	  var ch, lineText, pos, i, nextLine, columns, columnCount, token, aligns, t, tableLines, tbodyLines;

	  // should have at least three lines
	  if (startLine + 2 > endLine) {
	    return false;
	  }

	  nextLine = startLine + 1;

	  if (state.sCount[nextLine] < state.blkIndent) {
	    return false;
	  }

	  // first character of the second line should be '|' or '-'

	  pos = state.bMarks[nextLine] + state.tShift[nextLine];
	  if (pos >= state.eMarks[nextLine]) {
	    return false;
	  }

	  ch = state.src.charCodeAt(pos);
	  if (ch !== 0x7C /* | */ && ch !== 0x2D /* - */ && ch !== 0x3A /* : */) {
	      return false;
	    }

	  lineText = getLine(state, startLine + 1);
	  if (!/^[-:| ]+$/.test(lineText)) {
	    return false;
	  }

	  columns = lineText.split('|');
	  aligns = [];
	  for (i = 0; i < columns.length; i++) {
	    t = columns[i].trim();
	    if (!t) {
	      // allow empty columns before and after table, but not in between columns;
	      // e.g. allow ` |---| `, disallow ` ---||--- `
	      if (i === 0 || i === columns.length - 1) {
	        continue;
	      } else {
	        return false;
	      }
	    }

	    if (!/^:?-+:?$/.test(t)) {
	      return false;
	    }
	    if (t.charCodeAt(t.length - 1) === 0x3A /* : */) {
	        aligns.push(t.charCodeAt(0) === 0x3A /* : */ ? 'center' : 'right');
	      } else if (t.charCodeAt(0) === 0x3A /* : */) {
	        aligns.push('left');
	      } else {
	      aligns.push('');
	    }
	  }

	  lineText = getLine(state, startLine).trim();
	  if (lineText.indexOf('|') === -1) {
	    return false;
	  }
	  columns = escapedSplit(lineText.replace(/^\||\|$/g, ''));

	  // header row will define an amount of columns in the entire table,
	  // and align row shouldn't be smaller than that (the rest of the rows can)
	  columnCount = columns.length;
	  if (columnCount > aligns.length) {
	    return false;
	  }

	  if (silent) {
	    return true;
	  }

	  token = state.push('table_open', 'table', 1);
	  token.map = tableLines = [startLine, 0];

	  token = state.push('thead_open', 'thead', 1);
	  token.map = [startLine, startLine + 1];

	  token = state.push('tr_open', 'tr', 1);
	  token.map = [startLine, startLine + 1];

	  for (i = 0; i < columns.length; i++) {
	    token = state.push('th_open', 'th', 1);
	    token.map = [startLine, startLine + 1];
	    if (aligns[i]) {
	      token.attrs = [['style', 'text-align:' + aligns[i]]];
	    }

	    token = state.push('inline', '', 0);
	    token.content = columns[i].trim();
	    token.map = [startLine, startLine + 1];
	    token.children = [];

	    token = state.push('th_close', 'th', -1);
	  }

	  token = state.push('tr_close', 'tr', -1);
	  token = state.push('thead_close', 'thead', -1);

	  token = state.push('tbody_open', 'tbody', 1);
	  token.map = tbodyLines = [startLine + 2, 0];

	  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
	    if (state.sCount[nextLine] < state.blkIndent) {
	      break;
	    }

	    lineText = getLine(state, nextLine).trim();
	    if (lineText.indexOf('|') === -1) {
	      break;
	    }
	    columns = escapedSplit(lineText.replace(/^\||\|$/g, ''));

	    token = state.push('tr_open', 'tr', 1);
	    for (i = 0; i < columnCount; i++) {
	      token = state.push('td_open', 'td', 1);
	      if (aligns[i]) {
	        token.attrs = [['style', 'text-align:' + aligns[i]]];
	      }

	      token = state.push('inline', '', 0);
	      token.content = columns[i] ? columns[i].trim() : '';
	      token.children = [];

	      token = state.push('td_close', 'td', -1);
	    }
	    token = state.push('tr_close', 'tr', -1);
	  }
	  token = state.push('tbody_close', 'tbody', -1);
	  token = state.push('table_close', 'table', -1);

	  tableLines[1] = tbodyLines[1] = nextLine;
	  state.line = nextLine;
	  return true;
	};

/***/ },
/* 80 */
/***/ function(module, exports) {

	// Code block (4 spaces padded)

	'use strict';

	module.exports = function code(state, startLine, endLine /*, silent*/) {
	  var nextLine, last, token;

	  if (state.sCount[startLine] - state.blkIndent < 4) {
	    return false;
	  }

	  last = nextLine = startLine + 1;

	  while (nextLine < endLine) {
	    if (state.isEmpty(nextLine)) {
	      nextLine++;
	      continue;
	    }
	    if (state.sCount[nextLine] - state.blkIndent >= 4) {
	      nextLine++;
	      last = nextLine;
	      continue;
	    }
	    break;
	  }

	  state.line = nextLine;

	  token = state.push('code_block', 'code', 0);
	  token.content = state.getLines(startLine, last, 4 + state.blkIndent, true);
	  token.map = [startLine, state.line];

	  return true;
	};

/***/ },
/* 81 */
/***/ function(module, exports) {

	// fences (``` lang, ~~~ lang)

	'use strict';

	module.exports = function fence(state, startLine, endLine, silent) {
	  var marker,
	      len,
	      params,
	      nextLine,
	      mem,
	      token,
	      markup,
	      haveEndMarker = false,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine];

	  if (pos + 3 > max) {
	    return false;
	  }

	  marker = state.src.charCodeAt(pos);

	  if (marker !== 0x7E /* ~ */ && marker !== 0x60 /* ` */) {
	      return false;
	    }

	  // scan marker length
	  mem = pos;
	  pos = state.skipChars(pos, marker);

	  len = pos - mem;

	  if (len < 3) {
	    return false;
	  }

	  markup = state.src.slice(mem, pos);
	  params = state.src.slice(pos, max);

	  if (params.indexOf('`') >= 0) {
	    return false;
	  }

	  // Since start is found, we can report success here in validation mode
	  if (silent) {
	    return true;
	  }

	  // search end of block
	  nextLine = startLine;

	  for (;;) {
	    nextLine++;
	    if (nextLine >= endLine) {
	      // unclosed block should be autoclosed by end of document.
	      // also block seems to be autoclosed by end of parent
	      break;
	    }

	    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
	    max = state.eMarks[nextLine];

	    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
	      // non-empty line with negative indent should stop the list:
	      // - ```
	      //  test
	      break;
	    }

	    if (state.src.charCodeAt(pos) !== marker) {
	      continue;
	    }

	    if (state.sCount[nextLine] - state.blkIndent >= 4) {
	      // closing fence should be indented less than 4 spaces
	      continue;
	    }

	    pos = state.skipChars(pos, marker);

	    // closing code fence must be at least as long as the opening one
	    if (pos - mem < len) {
	      continue;
	    }

	    // make sure tail has spaces only
	    pos = state.skipSpaces(pos);

	    if (pos < max) {
	      continue;
	    }

	    haveEndMarker = true;
	    // found!
	    break;
	  }

	  // If a fence has heading spaces, they should be removed from its inner block
	  len = state.sCount[startLine];

	  state.line = nextLine + (haveEndMarker ? 1 : 0);

	  token = state.push('fence', 'code', 0);
	  token.info = params;
	  token.content = state.getLines(startLine + 1, nextLine, len, true);
	  token.markup = markup;
	  token.map = [startLine, state.line];

	  return true;
	};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	// Block quotes

	'use strict';

	var isSpace = __webpack_require__(49).isSpace;

	module.exports = function blockquote(state, startLine, endLine, silent) {
	  var nextLine,
	      lastLineEmpty,
	      oldTShift,
	      oldSCount,
	      oldBMarks,
	      oldIndent,
	      oldParentType,
	      lines,
	      initial,
	      offset,
	      ch,
	      terminatorRules,
	      token,
	      i,
	      l,
	      terminate,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine];

	  // check the block quote marker
	  if (state.src.charCodeAt(pos++) !== 0x3E /* > */) {
	      return false;
	    }

	  // we know that it's going to be a valid blockquote,
	  // so no point trying to find the end of it in silent mode
	  if (silent) {
	    return true;
	  }

	  // skip one optional space (but not tab, check cmark impl) after '>'
	  if (state.src.charCodeAt(pos) === 0x20) {
	    pos++;
	  }

	  oldIndent = state.blkIndent;
	  state.blkIndent = 0;

	  // skip spaces after ">" and re-calculate offset
	  initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

	  oldBMarks = [state.bMarks[startLine]];
	  state.bMarks[startLine] = pos;

	  while (pos < max) {
	    ch = state.src.charCodeAt(pos);

	    if (isSpace(ch)) {
	      if (ch === 0x09) {
	        offset += 4 - offset % 4;
	      } else {
	        offset++;
	      }
	    } else {
	      break;
	    }

	    pos++;
	  }

	  lastLineEmpty = pos >= max;

	  oldSCount = [state.sCount[startLine]];
	  state.sCount[startLine] = offset - initial;

	  oldTShift = [state.tShift[startLine]];
	  state.tShift[startLine] = pos - state.bMarks[startLine];

	  terminatorRules = state.md.block.ruler.getRules('blockquote');

	  // Search the end of the block
	  //
	  // Block ends with either:
	  //  1. an empty line outside:
	  //     ```
	  //     > test
	  //
	  //     ```
	  //  2. an empty line inside:
	  //     ```
	  //     >
	  //     test
	  //     ```
	  //  3. another tag
	  //     ```
	  //     > test
	  //      - - -
	  //     ```
	  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
	    if (state.sCount[nextLine] < oldIndent) {
	      break;
	    }

	    pos = state.bMarks[nextLine] + state.tShift[nextLine];
	    max = state.eMarks[nextLine];

	    if (pos >= max) {
	      // Case 1: line is not inside the blockquote, and this line is empty.
	      break;
	    }

	    if (state.src.charCodeAt(pos++) === 0x3E /* > */) {
	        // This line is inside the blockquote.

	        // skip one optional space (but not tab, check cmark impl) after '>'
	        if (state.src.charCodeAt(pos) === 0x20) {
	          pos++;
	        }

	        // skip spaces after ">" and re-calculate offset
	        initial = offset = state.sCount[nextLine] + pos - (state.bMarks[nextLine] + state.tShift[nextLine]);

	        oldBMarks.push(state.bMarks[nextLine]);
	        state.bMarks[nextLine] = pos;

	        while (pos < max) {
	          ch = state.src.charCodeAt(pos);

	          if (isSpace(ch)) {
	            if (ch === 0x09) {
	              offset += 4 - offset % 4;
	            } else {
	              offset++;
	            }
	          } else {
	            break;
	          }

	          pos++;
	        }

	        lastLineEmpty = pos >= max;

	        oldSCount.push(state.sCount[nextLine]);
	        state.sCount[nextLine] = offset - initial;

	        oldTShift.push(state.tShift[nextLine]);
	        state.tShift[nextLine] = pos - state.bMarks[nextLine];
	        continue;
	      }

	    // Case 2: line is not inside the blockquote, and the last line was empty.
	    if (lastLineEmpty) {
	      break;
	    }

	    // Case 3: another tag found.
	    terminate = false;
	    for (i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) {
	      break;
	    }

	    oldBMarks.push(state.bMarks[nextLine]);
	    oldTShift.push(state.tShift[nextLine]);
	    oldSCount.push(state.sCount[nextLine]);

	    // A negative indentation means that this is a paragraph continuation
	    //
	    state.sCount[nextLine] = -1;
	  }

	  oldParentType = state.parentType;
	  state.parentType = 'blockquote';

	  token = state.push('blockquote_open', 'blockquote', 1);
	  token.markup = '>';
	  token.map = lines = [startLine, 0];

	  state.md.block.tokenize(state, startLine, nextLine);

	  token = state.push('blockquote_close', 'blockquote', -1);
	  token.markup = '>';

	  state.parentType = oldParentType;
	  lines[1] = state.line;

	  // Restore original tShift; this might not be necessary since the parser
	  // has already been here, but just to make sure we can do that.
	  for (i = 0; i < oldTShift.length; i++) {
	    state.bMarks[i + startLine] = oldBMarks[i];
	    state.tShift[i + startLine] = oldTShift[i];
	    state.sCount[i + startLine] = oldSCount[i];
	  }
	  state.blkIndent = oldIndent;

	  return true;
	};

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	// Horizontal rule

	'use strict';

	var isSpace = __webpack_require__(49).isSpace;

	module.exports = function hr(state, startLine, endLine, silent) {
	  var marker,
	      cnt,
	      ch,
	      token,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine];

	  marker = state.src.charCodeAt(pos++);

	  // Check hr marker
	  if (marker !== 0x2A /* * */ && marker !== 0x2D /* - */ && marker !== 0x5F /* _ */) {
	      return false;
	    }

	  // markers can be mixed with spaces, but there should be at least 3 of them

	  cnt = 1;
	  while (pos < max) {
	    ch = state.src.charCodeAt(pos++);
	    if (ch !== marker && !isSpace(ch)) {
	      return false;
	    }
	    if (ch === marker) {
	      cnt++;
	    }
	  }

	  if (cnt < 3) {
	    return false;
	  }

	  if (silent) {
	    return true;
	  }

	  state.line = startLine + 1;

	  token = state.push('hr', 'hr', 0);
	  token.map = [startLine, state.line];
	  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));

	  return true;
	};

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	// Lists

	'use strict';

	var isSpace = __webpack_require__(49).isSpace;

	// Search `[-+*][\n ]`, returns next pos arter marker on success
	// or -1 on fail.
	function skipBulletListMarker(state, startLine) {
	  var marker, pos, max, ch;

	  pos = state.bMarks[startLine] + state.tShift[startLine];
	  max = state.eMarks[startLine];

	  marker = state.src.charCodeAt(pos++);
	  // Check bullet
	  if (marker !== 0x2A /* * */ && marker !== 0x2D /* - */ && marker !== 0x2B /* + */) {
	      return -1;
	    }

	  if (pos < max) {
	    ch = state.src.charCodeAt(pos);

	    if (!isSpace(ch)) {
	      // " -test " - is not a list item
	      return -1;
	    }
	  }

	  return pos;
	}

	// Search `\d+[.)][\n ]`, returns next pos arter marker on success
	// or -1 on fail.
	function skipOrderedListMarker(state, startLine) {
	  var ch,
	      start = state.bMarks[startLine] + state.tShift[startLine],
	      pos = start,
	      max = state.eMarks[startLine];

	  // List marker should have at least 2 chars (digit + dot)
	  if (pos + 1 >= max) {
	    return -1;
	  }

	  ch = state.src.charCodeAt(pos++);

	  if (ch < 0x30 /* 0 */ || ch > 0x39 /* 9 */) {
	      return -1;
	    }

	  for (;;) {
	    // EOL -> fail
	    if (pos >= max) {
	      return -1;
	    }

	    ch = state.src.charCodeAt(pos++);

	    if (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) {

	        // List marker should have no more than 9 digits
	        // (prevents integer overflow in browsers)
	        if (pos - start >= 10) {
	          return -1;
	        }

	        continue;
	      }

	    // found valid marker
	    if (ch === 0x29 /* ) */ || ch === 0x2e /* . */) {
	        break;
	      }

	    return -1;
	  }

	  if (pos < max) {
	    ch = state.src.charCodeAt(pos);

	    if (!isSpace(ch)) {
	      // " 1.test " - is not a list item
	      return -1;
	    }
	  }
	  return pos;
	}

	function markTightParagraphs(state, idx) {
	  var i,
	      l,
	      level = state.level + 2;

	  for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
	    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
	      state.tokens[i + 2].hidden = true;
	      state.tokens[i].hidden = true;
	      i += 2;
	    }
	  }
	}

	module.exports = function list(state, startLine, endLine, silent) {
	  var nextLine,
	      initial,
	      offset,
	      indent,
	      oldTShift,
	      oldIndent,
	      oldLIndent,
	      oldTight,
	      oldParentType,
	      start,
	      posAfterMarker,
	      ch,
	      pos,
	      max,
	      indentAfterMarker,
	      markerValue,
	      markerCharCode,
	      isOrdered,
	      contentStart,
	      listTokIdx,
	      prevEmptyEnd,
	      listLines,
	      itemLines,
	      tight = true,
	      terminatorRules,
	      token,
	      i,
	      l,
	      terminate;

	  // Detect list type and position after marker
	  if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
	    isOrdered = true;
	  } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
	    isOrdered = false;
	  } else {
	    return false;
	  }

	  // We should terminate list on style change. Remember first one to compare.
	  markerCharCode = state.src.charCodeAt(posAfterMarker - 1);

	  // For validation mode we can terminate immediately
	  if (silent) {
	    return true;
	  }

	  // Start list
	  listTokIdx = state.tokens.length;

	  if (isOrdered) {
	    start = state.bMarks[startLine] + state.tShift[startLine];
	    markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));

	    token = state.push('ordered_list_open', 'ol', 1);
	    if (markerValue !== 1) {
	      token.attrs = [['start', markerValue]];
	    }
	  } else {
	    token = state.push('bullet_list_open', 'ul', 1);
	  }

	  token.map = listLines = [startLine, 0];
	  token.markup = String.fromCharCode(markerCharCode);

	  //
	  // Iterate list items
	  //

	  nextLine = startLine;
	  prevEmptyEnd = false;
	  terminatorRules = state.md.block.ruler.getRules('list');

	  while (nextLine < endLine) {
	    pos = posAfterMarker;
	    max = state.eMarks[nextLine];

	    initial = offset = state.sCount[nextLine] + posAfterMarker - (state.bMarks[startLine] + state.tShift[startLine]);

	    while (pos < max) {
	      ch = state.src.charCodeAt(pos);

	      if (isSpace(ch)) {
	        if (ch === 0x09) {
	          offset += 4 - offset % 4;
	        } else {
	          offset++;
	        }
	      } else {
	        break;
	      }

	      pos++;
	    }

	    contentStart = pos;

	    if (contentStart >= max) {
	      // trimming space in "-    \n  3" case, indent is 1 here
	      indentAfterMarker = 1;
	    } else {
	      indentAfterMarker = offset - initial;
	    }

	    // If we have more than 4 spaces, the indent is 1
	    // (the rest is just indented code block)
	    if (indentAfterMarker > 4) {
	      indentAfterMarker = 1;
	    }

	    // "  -  test"
	    //  ^^^^^ - calculating total length of this thing
	    indent = initial + indentAfterMarker;

	    // Run subparser & write tokens
	    token = state.push('list_item_open', 'li', 1);
	    token.markup = String.fromCharCode(markerCharCode);
	    token.map = itemLines = [startLine, 0];

	    oldIndent = state.blkIndent;
	    oldTight = state.tight;
	    oldTShift = state.tShift[startLine];
	    oldLIndent = state.sCount[startLine];
	    oldParentType = state.parentType;
	    state.blkIndent = indent;
	    state.tight = true;
	    state.parentType = 'list';
	    state.tShift[startLine] = contentStart - state.bMarks[startLine];
	    state.sCount[startLine] = offset;

	    state.md.block.tokenize(state, startLine, endLine, true);

	    // If any of list item is tight, mark list as tight
	    if (!state.tight || prevEmptyEnd) {
	      tight = false;
	    }
	    // Item become loose if finish with empty line,
	    // but we should filter last element, because it means list finish
	    prevEmptyEnd = state.line - startLine > 1 && state.isEmpty(state.line - 1);

	    state.blkIndent = oldIndent;
	    state.tShift[startLine] = oldTShift;
	    state.sCount[startLine] = oldLIndent;
	    state.tight = oldTight;
	    state.parentType = oldParentType;

	    token = state.push('list_item_close', 'li', -1);
	    token.markup = String.fromCharCode(markerCharCode);

	    nextLine = startLine = state.line;
	    itemLines[1] = nextLine;
	    contentStart = state.bMarks[startLine];

	    if (nextLine >= endLine) {
	      break;
	    }

	    if (state.isEmpty(nextLine)) {
	      break;
	    }

	    //
	    // Try to check if list is terminated or continued.
	    //
	    if (state.sCount[nextLine] < state.blkIndent) {
	      break;
	    }

	    // fail if terminating block found
	    terminate = false;
	    for (i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) {
	      break;
	    }

	    // fail if list has another type
	    if (isOrdered) {
	      posAfterMarker = skipOrderedListMarker(state, nextLine);
	      if (posAfterMarker < 0) {
	        break;
	      }
	    } else {
	      posAfterMarker = skipBulletListMarker(state, nextLine);
	      if (posAfterMarker < 0) {
	        break;
	      }
	    }

	    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) {
	      break;
	    }
	  }

	  // Finilize list
	  if (isOrdered) {
	    token = state.push('ordered_list_close', 'ol', -1);
	  } else {
	    token = state.push('bullet_list_close', 'ul', -1);
	  }
	  token.markup = String.fromCharCode(markerCharCode);

	  listLines[1] = nextLine;
	  state.line = nextLine;

	  // mark paragraphs tight if needed
	  if (tight) {
	    markTightParagraphs(state, listTokIdx);
	  }

	  return true;
	};

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var parseLinkDestination = __webpack_require__(65);
	var parseLinkTitle = __webpack_require__(66);
	var normalizeReference = __webpack_require__(49).normalizeReference;
	var isSpace = __webpack_require__(49).isSpace;

	module.exports = function reference(state, startLine, _endLine, silent) {
	  var ch,
	      destEndPos,
	      destEndLineNo,
	      endLine,
	      href,
	      i,
	      l,
	      label,
	      labelEnd,
	      res,
	      start,
	      str,
	      terminate,
	      terminatorRules,
	      title,
	      lines = 0,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine],
	      nextLine = startLine + 1;

	  if (state.src.charCodeAt(pos) !== 0x5B /* [ */) {
	      return false;
	    }

	  // Simple check to quickly interrupt scan on [link](url) at the start of line.
	  // Can be useful on practice: https://github.com/markdown-it/markdown-it/issues/54
	  while (++pos < max) {
	    if (state.src.charCodeAt(pos) === 0x5D /* ] */ && state.src.charCodeAt(pos - 1) !== 0x5C /* \ */) {
	        if (pos + 1 === max) {
	          return false;
	        }
	        if (state.src.charCodeAt(pos + 1) !== 0x3A /* : */) {
	            return false;
	          }
	        break;
	      }
	  }

	  endLine = state.lineMax;

	  // jump line-by-line until empty one or EOF
	  terminatorRules = state.md.block.ruler.getRules('reference');

	  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
	    // this would be a code block normally, but after paragraph
	    // it's considered a lazy continuation regardless of what's there
	    if (state.sCount[nextLine] - state.blkIndent > 3) {
	      continue;
	    }

	    // quirk for blockquotes, this line should already be checked by that rule
	    if (state.sCount[nextLine] < 0) {
	      continue;
	    }

	    // Some tags can terminate paragraph without empty line.
	    terminate = false;
	    for (i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) {
	      break;
	    }
	  }

	  str = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
	  max = str.length;

	  for (pos = 1; pos < max; pos++) {
	    ch = str.charCodeAt(pos);
	    if (ch === 0x5B /* [ */) {
	        return false;
	      } else if (ch === 0x5D /* ] */) {
	        labelEnd = pos;
	        break;
	      } else if (ch === 0x0A /* \n */) {
	        lines++;
	      } else if (ch === 0x5C /* \ */) {
	        pos++;
	        if (pos < max && str.charCodeAt(pos) === 0x0A) {
	          lines++;
	        }
	      }
	  }

	  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A /* : */) {
	      return false;
	    }

	  // [label]:   destination   'title'
	  //         ^^^ skip optional whitespace here
	  for (pos = labelEnd + 2; pos < max; pos++) {
	    ch = str.charCodeAt(pos);
	    if (ch === 0x0A) {
	      lines++;
	    } else if (isSpace(ch)) {
	      /*eslint no-empty:0*/
	    } else {
	        break;
	      }
	  }

	  // [label]:   destination   'title'
	  //            ^^^^^^^^^^^ parse this
	  res = parseLinkDestination(str, pos, max);
	  if (!res.ok) {
	    return false;
	  }

	  href = state.md.normalizeLink(res.str);
	  if (!state.md.validateLink(href)) {
	    return false;
	  }

	  pos = res.pos;
	  lines += res.lines;

	  // save cursor state, we could require to rollback later
	  destEndPos = pos;
	  destEndLineNo = lines;

	  // [label]:   destination   'title'
	  //                       ^^^ skipping those spaces
	  start = pos;
	  for (; pos < max; pos++) {
	    ch = str.charCodeAt(pos);
	    if (ch === 0x0A) {
	      lines++;
	    } else if (isSpace(ch)) {
	      /*eslint no-empty:0*/
	    } else {
	        break;
	      }
	  }

	  // [label]:   destination   'title'
	  //                          ^^^^^^^ parse this
	  res = parseLinkTitle(str, pos, max);
	  if (pos < max && start !== pos && res.ok) {
	    title = res.str;
	    pos = res.pos;
	    lines += res.lines;
	  } else {
	    title = '';
	    pos = destEndPos;
	    lines = destEndLineNo;
	  }

	  // skip trailing spaces until the rest of the line
	  while (pos < max) {
	    ch = str.charCodeAt(pos);
	    if (!isSpace(ch)) {
	      break;
	    }
	    pos++;
	  }

	  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
	    if (title) {
	      // garbage at the end of the line after title,
	      // but it could still be a valid reference if we roll back
	      title = '';
	      pos = destEndPos;
	      lines = destEndLineNo;
	      while (pos < max) {
	        ch = str.charCodeAt(pos);
	        if (!isSpace(ch)) {
	          break;
	        }
	        pos++;
	      }
	    }
	  }

	  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
	    // garbage at the end of the line
	    return false;
	  }

	  label = normalizeReference(str.slice(1, labelEnd));
	  if (!label) {
	    // CommonMark 0.20 disallows empty labels
	    return false;
	  }

	  // Reference can not terminate anything. This check is for safety only.
	  /*istanbul ignore if*/
	  if (silent) {
	    return true;
	  }

	  if (typeof state.env.references === 'undefined') {
	    state.env.references = {};
	  }
	  if (typeof state.env.references[label] === 'undefined') {
	    state.env.references[label] = { title: title, href: href };
	  }

	  state.line = startLine + lines + 1;
	  return true;
	};

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	// heading (#, ##, ...)

	'use strict';

	var isSpace = __webpack_require__(49).isSpace;

	module.exports = function heading(state, startLine, endLine, silent) {
	  var ch,
	      level,
	      tmp,
	      token,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine];

	  ch = state.src.charCodeAt(pos);

	  if (ch !== 0x23 /* # */ || pos >= max) {
	    return false;
	  }

	  // count heading level
	  level = 1;
	  ch = state.src.charCodeAt(++pos);
	  while (ch === 0x23 /* # */ && pos < max && level <= 6) {
	    level++;
	    ch = state.src.charCodeAt(++pos);
	  }

	  if (level > 6 || pos < max && ch !== 0x20 /* space */) {
	      return false;
	    }

	  if (silent) {
	    return true;
	  }

	  // Let's cut tails like '    ###  ' from the end of string

	  max = state.skipSpacesBack(max, pos);
	  tmp = state.skipCharsBack(max, 0x23, pos); // #
	  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
	    max = tmp;
	  }

	  state.line = startLine + 1;

	  token = state.push('heading_open', 'h' + String(level), 1);
	  token.markup = '########'.slice(0, level);
	  token.map = [startLine, state.line];

	  token = state.push('inline', '', 0);
	  token.content = state.src.slice(pos, max).trim();
	  token.map = [startLine, state.line];
	  token.children = [];

	  token = state.push('heading_close', 'h' + String(level), -1);
	  token.markup = '########'.slice(0, level);

	  return true;
	};

/***/ },
/* 87 */
/***/ function(module, exports) {

	// lheading (---, ===)

	'use strict';

	module.exports = function lheading(state, startLine, endLine /*, silent*/) {
	  var marker,
	      pos,
	      max,
	      token,
	      level,
	      next = startLine + 1;

	  if (next >= endLine) {
	    return false;
	  }
	  if (state.sCount[next] < state.blkIndent) {
	    return false;
	  }

	  // Scan next line

	  if (state.sCount[next] - state.blkIndent > 3) {
	    return false;
	  }

	  pos = state.bMarks[next] + state.tShift[next];
	  max = state.eMarks[next];

	  if (pos >= max) {
	    return false;
	  }

	  marker = state.src.charCodeAt(pos);

	  if (marker !== 0x2D /* - */ && marker !== 0x3D /* = */) {
	      return false;
	    }

	  pos = state.skipChars(pos, marker);

	  pos = state.skipSpaces(pos);

	  if (pos < max) {
	    return false;
	  }

	  pos = state.bMarks[startLine] + state.tShift[startLine];

	  state.line = next + 1;
	  level = marker === 0x3D /* = */ ? 1 : 2;

	  token = state.push('heading_open', 'h' + String(level), 1);
	  token.markup = String.fromCharCode(marker);
	  token.map = [startLine, state.line];

	  token = state.push('inline', '', 0);
	  token.content = state.src.slice(pos, state.eMarks[startLine]).trim();
	  token.map = [startLine, state.line - 1];
	  token.children = [];

	  token = state.push('heading_close', 'h' + String(level), -1);
	  token.markup = String.fromCharCode(marker);

	  return true;
	};

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	// HTML block

	'use strict';

	var block_names = __webpack_require__(89);
	var HTML_OPEN_CLOSE_TAG_RE = __webpack_require__(90).HTML_OPEN_CLOSE_TAG_RE;

	// An array of opening and corresponding closing sequences for html tags,
	// last argument defines whether it can terminate a paragraph or not
	//
	var HTML_SEQUENCES = [[/^<(script|pre|style)(?=(\s|>|$))/i, /<\/(script|pre|style)>/i, true], [/^<!--/, /-->/, true], [/^<\?/, /\?>/, true], [/^<![A-Z]/, />/, true], [/^<!\[CDATA\[/, /\]\]>/, true], [new RegExp('^</?(' + block_names.join('|') + ')(?=(\\s|/?>|$))', 'i'), /^$/, true], [new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + '\\s*$'), /^$/, false]];

	module.exports = function html_block(state, startLine, endLine, silent) {
	  var i,
	      nextLine,
	      token,
	      lineText,
	      pos = state.bMarks[startLine] + state.tShift[startLine],
	      max = state.eMarks[startLine];

	  if (!state.md.options.html) {
	    return false;
	  }

	  if (state.src.charCodeAt(pos) !== 0x3C /* < */) {
	      return false;
	    }

	  lineText = state.src.slice(pos, max);

	  for (i = 0; i < HTML_SEQUENCES.length; i++) {
	    if (HTML_SEQUENCES[i][0].test(lineText)) {
	      break;
	    }
	  }

	  if (i === HTML_SEQUENCES.length) {
	    return false;
	  }

	  if (silent) {
	    // true if this sequence can be a terminator, false otherwise
	    return HTML_SEQUENCES[i][2];
	  }

	  nextLine = startLine + 1;

	  // If we are here - we detected HTML block.
	  // Let's roll down till block end.
	  if (!HTML_SEQUENCES[i][1].test(lineText)) {
	    for (; nextLine < endLine; nextLine++) {
	      if (state.sCount[nextLine] < state.blkIndent) {
	        break;
	      }

	      pos = state.bMarks[nextLine] + state.tShift[nextLine];
	      max = state.eMarks[nextLine];
	      lineText = state.src.slice(pos, max);

	      if (HTML_SEQUENCES[i][1].test(lineText)) {
	        if (lineText.length !== 0) {
	          nextLine++;
	        }
	        break;
	      }
	    }
	  }

	  state.line = nextLine;

	  token = state.push('html_block', '', 0);
	  token.map = [startLine, nextLine];
	  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);

	  return true;
	};

/***/ },
/* 89 */
/***/ function(module, exports) {

	// List of valid html blocks names, accorting to commonmark spec
	// http://jgm.github.io/CommonMark/spec.html#html-blocks

	'use strict';

	module.exports = ['address', 'article', 'aside', 'base', 'basefont', 'blockquote', 'body', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dialog', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'head', 'header', 'hr', 'html', 'iframe', 'legend', 'li', 'link', 'main', 'menu', 'menuitem', 'meta', 'nav', 'noframes', 'ol', 'optgroup', 'option', 'p', 'param', 'pre', 'section', 'source', 'title', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul'];

/***/ },
/* 90 */
/***/ function(module, exports) {

	// Regexps to match html elements

	'use strict';

	var attr_name = '[a-zA-Z_:][a-zA-Z0-9:._-]*';

	var unquoted = '[^"\'=<>`\\x00-\\x20]+';
	var single_quoted = "'[^']*'";
	var double_quoted = '"[^"]*"';

	var attr_value = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';

	var attribute = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';

	var open_tag = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';

	var close_tag = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
	var comment = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
	var processing = '<[?].*?[?]>';
	var declaration = '<![A-Z]+\\s+[^>]*>';
	var cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

	var HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment + '|' + processing + '|' + declaration + '|' + cdata + ')');
	var HTML_OPEN_CLOSE_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + ')');

	module.exports.HTML_TAG_RE = HTML_TAG_RE;
	module.exports.HTML_OPEN_CLOSE_TAG_RE = HTML_OPEN_CLOSE_TAG_RE;

/***/ },
/* 91 */
/***/ function(module, exports) {

	// Paragraph

	'use strict';

	module.exports = function paragraph(state, startLine /*, endLine*/) {
	  var content,
	      terminate,
	      i,
	      l,
	      token,
	      nextLine = startLine + 1,
	      terminatorRules = state.md.block.ruler.getRules('paragraph'),
	      endLine = state.lineMax;

	  // jump line-by-line until empty one or EOF
	  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
	    // this would be a code block normally, but after paragraph
	    // it's considered a lazy continuation regardless of what's there
	    if (state.sCount[nextLine] - state.blkIndent > 3) {
	      continue;
	    }

	    // quirk for blockquotes, this line should already be checked by that rule
	    if (state.sCount[nextLine] < 0) {
	      continue;
	    }

	    // Some tags can terminate paragraph without empty line.
	    terminate = false;
	    for (i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) {
	      break;
	    }
	  }

	  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

	  state.line = nextLine;

	  token = state.push('paragraph_open', 'p', 1);
	  token.map = [startLine, state.line];

	  token = state.push('inline', '', 0);
	  token.content = content;
	  token.map = [startLine, state.line];
	  token.children = [];

	  token = state.push('paragraph_close', 'p', -1);

	  return true;
	};

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	// Parser state class

	'use strict';

	var Token = __webpack_require__(77);
	var isSpace = __webpack_require__(49).isSpace;

	function StateBlock(src, md, env, tokens) {
	  var ch, s, start, pos, len, indent, offset, indent_found;

	  this.src = src;

	  // link to parser instance
	  this.md = md;

	  this.env = env;

	  //
	  // Internal state vartiables
	  //

	  this.tokens = tokens;

	  this.bMarks = []; // line begin offsets for fast jumps
	  this.eMarks = []; // line end offsets for fast jumps
	  this.tShift = []; // offsets of the first non-space characters (tabs not expanded)
	  this.sCount = []; // indents for each line (tabs expanded)

	  // block parser variables
	  this.blkIndent = 0; // required block content indent
	  // (for example, if we are in list)
	  this.line = 0; // line index in src
	  this.lineMax = 0; // lines count
	  this.tight = false; // loose/tight mode for lists
	  this.parentType = 'root'; // if `list`, block parser stops on two newlines
	  this.ddIndent = -1; // indent of the current dd block (-1 if there isn't any)

	  this.level = 0;

	  // renderer
	  this.result = '';

	  // Create caches
	  // Generate markers.
	  s = this.src;
	  indent_found = false;

	  for (start = pos = indent = offset = 0, len = s.length; pos < len; pos++) {
	    ch = s.charCodeAt(pos);

	    if (!indent_found) {
	      if (isSpace(ch)) {
	        indent++;

	        if (ch === 0x09) {
	          offset += 4 - offset % 4;
	        } else {
	          offset++;
	        }
	        continue;
	      } else {
	        indent_found = true;
	      }
	    }

	    if (ch === 0x0A || pos === len - 1) {
	      if (ch !== 0x0A) {
	        pos++;
	      }
	      this.bMarks.push(start);
	      this.eMarks.push(pos);
	      this.tShift.push(indent);
	      this.sCount.push(offset);

	      indent_found = false;
	      indent = 0;
	      offset = 0;
	      start = pos + 1;
	    }
	  }

	  // Push fake entry to simplify cache bounds checks
	  this.bMarks.push(s.length);
	  this.eMarks.push(s.length);
	  this.tShift.push(0);
	  this.sCount.push(0);

	  this.lineMax = this.bMarks.length - 1; // don't count last fake line
	}

	// Push new token to "stream".
	//
	StateBlock.prototype.push = function (type, tag, nesting) {
	  var token = new Token(type, tag, nesting);
	  token.block = true;

	  if (nesting < 0) {
	    this.level--;
	  }
	  token.level = this.level;
	  if (nesting > 0) {
	    this.level++;
	  }

	  this.tokens.push(token);
	  return token;
	};

	StateBlock.prototype.isEmpty = function isEmpty(line) {
	  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
	};

	StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
	  for (var max = this.lineMax; from < max; from++) {
	    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
	      break;
	    }
	  }
	  return from;
	};

	// Skip spaces from given position.
	StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
	  var ch;

	  for (var max = this.src.length; pos < max; pos++) {
	    ch = this.src.charCodeAt(pos);
	    if (!isSpace(ch)) {
	      break;
	    }
	  }
	  return pos;
	};

	// Skip spaces from given position in reverse.
	StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
	  if (pos <= min) {
	    return pos;
	  }

	  while (pos > min) {
	    if (!isSpace(this.src.charCodeAt(--pos))) {
	      return pos + 1;
	    }
	  }
	  return pos;
	};

	// Skip char codes from given position
	StateBlock.prototype.skipChars = function skipChars(pos, code) {
	  for (var max = this.src.length; pos < max; pos++) {
	    if (this.src.charCodeAt(pos) !== code) {
	      break;
	    }
	  }
	  return pos;
	};

	// Skip char codes reverse from given position - 1
	StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
	  if (pos <= min) {
	    return pos;
	  }

	  while (pos > min) {
	    if (code !== this.src.charCodeAt(--pos)) {
	      return pos + 1;
	    }
	  }
	  return pos;
	};

	// cut lines range from source.
	StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
	  var i,
	      lineIndent,
	      ch,
	      first,
	      last,
	      queue,
	      lineStart,
	      line = begin;

	  if (begin >= end) {
	    return '';
	  }

	  queue = new Array(end - begin);

	  for (i = 0; line < end; line++, i++) {
	    lineIndent = 0;
	    lineStart = first = this.bMarks[line];

	    if (line + 1 < end || keepLastLF) {
	      // No need for bounds check because we have fake entry on tail.
	      last = this.eMarks[line] + 1;
	    } else {
	      last = this.eMarks[line];
	    }

	    while (first < last && lineIndent < indent) {
	      ch = this.src.charCodeAt(first);

	      if (isSpace(ch)) {
	        if (ch === 0x09) {
	          lineIndent += 4 - lineIndent % 4;
	        } else {
	          lineIndent++;
	        }
	      } else if (first - lineStart < this.tShift[line]) {
	        // patched tShift masked characters to look like spaces (blockquotes, list markers)
	        lineIndent++;
	      } else {
	        break;
	      }

	      first++;
	    }

	    queue[i] = this.src.slice(first, last);
	  }

	  return queue.join('');
	};

	// re-export Token class to use in block rules
	StateBlock.prototype.Token = Token;

	module.exports = StateBlock;

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	/** internal
	 * class ParserInline
	 *
	 * Tokenizes paragraph content.
	 **/
	'use strict';

	var Ruler = __webpack_require__(69);

	////////////////////////////////////////////////////////////////////////////////
	// Parser rules

	var _rules = [['text', __webpack_require__(94)], ['newline', __webpack_require__(95)], ['escape', __webpack_require__(96)], ['backticks', __webpack_require__(97)], ['strikethrough', __webpack_require__(98).tokenize], ['emphasis', __webpack_require__(99).tokenize], ['link', __webpack_require__(100)], ['image', __webpack_require__(101)], ['autolink', __webpack_require__(102)], ['html_inline', __webpack_require__(104)], ['entity', __webpack_require__(105)]];

	var _rules2 = [['balance_pairs', __webpack_require__(106)], ['strikethrough', __webpack_require__(98).postProcess], ['emphasis', __webpack_require__(99).postProcess], ['text_collapse', __webpack_require__(107)]];

	/**
	 * new ParserInline()
	 **/
	function ParserInline() {
	  var i;

	  /**
	   * ParserInline#ruler -> Ruler
	   *
	   * [[Ruler]] instance. Keep configuration of inline rules.
	   **/
	  this.ruler = new Ruler();

	  for (i = 0; i < _rules.length; i++) {
	    this.ruler.push(_rules[i][0], _rules[i][1]);
	  }

	  /**
	   * ParserInline#ruler2 -> Ruler
	   *
	   * [[Ruler]] instance. Second ruler used for post-processing
	   * (e.g. in emphasis-like rules).
	   **/
	  this.ruler2 = new Ruler();

	  for (i = 0; i < _rules2.length; i++) {
	    this.ruler2.push(_rules2[i][0], _rules2[i][1]);
	  }
	}

	// Skip single token by running all rules in validation mode;
	// returns `true` if any rule reported success
	//
	ParserInline.prototype.skipToken = function (state) {
	  var i,
	      pos = state.pos,
	      rules = this.ruler.getRules(''),
	      len = rules.length,
	      maxNesting = state.md.options.maxNesting,
	      cache = state.cache;

	  if (typeof cache[pos] !== 'undefined') {
	    state.pos = cache[pos];
	    return;
	  }

	  /*istanbul ignore else*/
	  if (state.level < maxNesting) {
	    for (i = 0; i < len; i++) {
	      if (rules[i](state, true)) {
	        cache[pos] = state.pos;
	        return;
	      }
	    }
	  }

	  state.pos++;
	  cache[pos] = state.pos;
	};

	// Generate tokens for input range
	//
	ParserInline.prototype.tokenize = function (state) {
	  var ok,
	      i,
	      rules = this.ruler.getRules(''),
	      len = rules.length,
	      end = state.posMax,
	      maxNesting = state.md.options.maxNesting;

	  while (state.pos < end) {
	    // Try all possible rules.
	    // On success, rule should:
	    //
	    // - update `state.pos`
	    // - update `state.tokens`
	    // - return true

	    if (state.level < maxNesting) {
	      for (i = 0; i < len; i++) {
	        ok = rules[i](state, false);
	        if (ok) {
	          break;
	        }
	      }
	    }

	    if (ok) {
	      if (state.pos >= end) {
	        break;
	      }
	      continue;
	    }

	    state.pending += state.src[state.pos++];
	  }

	  if (state.pending) {
	    state.pushPending();
	  }
	};

	/**
	 * ParserInline.parse(str, md, env, outTokens)
	 *
	 * Process input string and push inline tokens into `outTokens`
	 **/
	ParserInline.prototype.parse = function (str, md, env, outTokens) {
	  var i, rules, len;
	  var state = new this.State(str, md, env, outTokens);

	  this.tokenize(state);

	  rules = this.ruler2.getRules('');
	  len = rules.length;

	  for (i = 0; i < len; i++) {
	    rules[i](state);
	  }
	};

	ParserInline.prototype.State = __webpack_require__(108);

	module.exports = ParserInline;

/***/ },
/* 94 */
/***/ function(module, exports) {

	// Skip text characters for text token, place those to pending buffer
	// and increment current pos

	'use strict';

	// Rule to skip pure text
	// '{}$%@~+=:' reserved for extentions

	// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~

	// !!!! Don't confuse with "Markdown ASCII Punctuation" chars
	// http://spec.commonmark.org/0.15/#ascii-punctuation-character

	function isTerminatorChar(ch) {
	  switch (ch) {
	    case 0x0A /* \n */:
	    case 0x21 /* ! */:
	    case 0x23 /* # */:
	    case 0x24 /* $ */:
	    case 0x25 /* % */:
	    case 0x26 /* & */:
	    case 0x2A /* * */:
	    case 0x2B /* + */:
	    case 0x2D /* - */:
	    case 0x3A /* : */:
	    case 0x3C /* < */:
	    case 0x3D /* = */:
	    case 0x3E /* > */:
	    case 0x40 /* @ */:
	    case 0x5B /* [ */:
	    case 0x5C /* \ */:
	    case 0x5D /* ] */:
	    case 0x5E /* ^ */:
	    case 0x5F /* _ */:
	    case 0x60 /* ` */:
	    case 0x7B /* { */:
	    case 0x7D /* } */:
	    case 0x7E /* ~ */:
	      return true;
	    default:
	      return false;
	  }
	}

	module.exports = function text(state, silent) {
	  var pos = state.pos;

	  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
	    pos++;
	  }

	  if (pos === state.pos) {
	    return false;
	  }

	  if (!silent) {
	    state.pending += state.src.slice(state.pos, pos);
	  }

	  state.pos = pos;

	  return true;
	};

	// Alternative implementation, for memory.
	//
	// It costs 10% of performance, but allows extend terminators list, if place it
	// to `ParcerInline` property. Probably, will switch to it sometime, such
	// flexibility required.

	/*
	var TERMINATOR_RE = /[\n!#$%&*+\-:<=>@[\\\]^_`{}~]/;

	module.exports = function text(state, silent) {
	  var pos = state.pos,
	      idx = state.src.slice(pos).search(TERMINATOR_RE);

	  // first char is terminator -> empty text
	  if (idx === 0) { return false; }

	  // no terminator -> text till end of string
	  if (idx < 0) {
	    if (!silent) { state.pending += state.src.slice(pos); }
	    state.pos = state.src.length;
	    return true;
	  }

	  if (!silent) { state.pending += state.src.slice(pos, pos + idx); }

	  state.pos += idx;

	  return true;
	};*/

/***/ },
/* 95 */
/***/ function(module, exports) {

	// Proceess '\n'

	'use strict';

	module.exports = function newline(state, silent) {
	  var pmax,
	      max,
	      pos = state.pos;

	  if (state.src.charCodeAt(pos) !== 0x0A /* \n */) {
	      return false;
	    }

	  pmax = state.pending.length - 1;
	  max = state.posMax;

	  // '  \n' -> hardbreak
	  // Lookup in pending chars is bad practice! Don't copy to other rules!
	  // Pending string is stored in concat mode, indexed lookups will cause
	  // convertion to flat mode.
	  if (!silent) {
	    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
	      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
	        state.pending = state.pending.replace(/ +$/, '');
	        state.push('hardbreak', 'br', 0);
	      } else {
	        state.pending = state.pending.slice(0, -1);
	        state.push('softbreak', 'br', 0);
	      }
	    } else {
	      state.push('softbreak', 'br', 0);
	    }
	  }

	  pos++;

	  // skip heading spaces for next line
	  while (pos < max && state.src.charCodeAt(pos) === 0x20) {
	    pos++;
	  }

	  state.pos = pos;
	  return true;
	};

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	// Proceess escaped chars and hardbreaks

	'use strict';

	var isSpace = __webpack_require__(49).isSpace;

	var ESCAPED = [];

	for (var i = 0; i < 256; i++) {
	  ESCAPED.push(0);
	}

	'\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'.split('').forEach(function (ch) {
	  ESCAPED[ch.charCodeAt(0)] = 1;
	});

	module.exports = function escape(state, silent) {
	  var ch,
	      pos = state.pos,
	      max = state.posMax;

	  if (state.src.charCodeAt(pos) !== 0x5C /* \ */) {
	      return false;
	    }

	  pos++;

	  if (pos < max) {
	    ch = state.src.charCodeAt(pos);

	    if (ch < 256 && ESCAPED[ch] !== 0) {
	      if (!silent) {
	        state.pending += state.src[pos];
	      }
	      state.pos += 2;
	      return true;
	    }

	    if (ch === 0x0A) {
	      if (!silent) {
	        state.push('hardbreak', 'br', 0);
	      }

	      pos++;
	      // skip leading whitespaces from next line
	      while (pos < max) {
	        ch = state.src.charCodeAt(pos);
	        if (!isSpace(ch)) {
	          break;
	        }
	        pos++;
	      }

	      state.pos = pos;
	      return true;
	    }
	  }

	  if (!silent) {
	    state.pending += '\\';
	  }
	  state.pos++;
	  return true;
	};

/***/ },
/* 97 */
/***/ function(module, exports) {

	// Parse backticks

	'use strict';

	module.exports = function backtick(state, silent) {
	  var start,
	      max,
	      marker,
	      matchStart,
	      matchEnd,
	      token,
	      pos = state.pos,
	      ch = state.src.charCodeAt(pos);

	  if (ch !== 0x60 /* ` */) {
	      return false;
	    }

	  start = pos;
	  pos++;
	  max = state.posMax;

	  while (pos < max && state.src.charCodeAt(pos) === 0x60 /* ` */) {
	    pos++;
	  }

	  marker = state.src.slice(start, pos);

	  matchStart = matchEnd = pos;

	  while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
	    matchEnd = matchStart + 1;

	    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60 /* ` */) {
	      matchEnd++;
	    }

	    if (matchEnd - matchStart === marker.length) {
	      if (!silent) {
	        token = state.push('code_inline', 'code', 0);
	        token.markup = marker;
	        token.content = state.src.slice(pos, matchStart).replace(/[ \n]+/g, ' ').trim();
	      }
	      state.pos = matchEnd;
	      return true;
	    }
	  }

	  if (!silent) {
	    state.pending += marker;
	  }
	  state.pos += marker.length;
	  return true;
	};

/***/ },
/* 98 */
/***/ function(module, exports) {

	// ~~strike through~~
	//
	'use strict';

	// Insert each marker as a separate text token, and add it to delimiter list
	//

	module.exports.tokenize = function strikethrough(state, silent) {
	  var i,
	      scanned,
	      token,
	      len,
	      ch,
	      start = state.pos,
	      marker = state.src.charCodeAt(start);

	  if (silent) {
	    return false;
	  }

	  if (marker !== 0x7E /* ~ */) {
	      return false;
	    }

	  scanned = state.scanDelims(state.pos, true);
	  len = scanned.length;
	  ch = String.fromCharCode(marker);

	  if (len < 2) {
	    return false;
	  }

	  if (len % 2) {
	    token = state.push('text', '', 0);
	    token.content = ch;
	    len--;
	  }

	  for (i = 0; i < len; i += 2) {
	    token = state.push('text', '', 0);
	    token.content = ch + ch;

	    state.delimiters.push({
	      marker: marker,
	      jump: i,
	      token: state.tokens.length - 1,
	      level: state.level,
	      end: -1,
	      open: scanned.can_open,
	      close: scanned.can_close
	    });
	  }

	  state.pos += scanned.length;

	  return true;
	};

	// Walk through delimiter list and replace text tokens with tags
	//
	module.exports.postProcess = function strikethrough(state) {
	  var i,
	      j,
	      startDelim,
	      endDelim,
	      token,
	      loneMarkers = [],
	      delimiters = state.delimiters,
	      max = state.delimiters.length;

	  for (i = 0; i < max; i++) {
	    startDelim = delimiters[i];

	    if (startDelim.marker !== 0x7E /* ~ */) {
	        continue;
	      }

	    if (startDelim.end === -1) {
	      continue;
	    }

	    endDelim = delimiters[startDelim.end];

	    token = state.tokens[startDelim.token];
	    token.type = 's_open';
	    token.tag = 's';
	    token.nesting = 1;
	    token.markup = '~~';
	    token.content = '';

	    token = state.tokens[endDelim.token];
	    token.type = 's_close';
	    token.tag = 's';
	    token.nesting = -1;
	    token.markup = '~~';
	    token.content = '';

	    if (state.tokens[endDelim.token - 1].type === 'text' && state.tokens[endDelim.token - 1].content === '~') {

	      loneMarkers.push(endDelim.token - 1);
	    }
	  }

	  // If a marker sequence has an odd number of characters, it's splitted
	  // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
	  // start of the sequence.
	  //
	  // So, we have to move all those markers after subsequent s_close tags.
	  //
	  while (loneMarkers.length) {
	    i = loneMarkers.pop();
	    j = i + 1;

	    while (j < state.tokens.length && state.tokens[j].type === 's_close') {
	      j++;
	    }

	    j--;

	    if (i !== j) {
	      token = state.tokens[j];
	      state.tokens[j] = state.tokens[i];
	      state.tokens[i] = token;
	    }
	  }
	};

/***/ },
/* 99 */
/***/ function(module, exports) {

	// Process *this* and _that_
	//
	'use strict';

	// Insert each marker as a separate text token, and add it to delimiter list
	//

	module.exports.tokenize = function emphasis(state, silent) {
	  var i,
	      scanned,
	      token,
	      start = state.pos,
	      marker = state.src.charCodeAt(start);

	  if (silent) {
	    return false;
	  }

	  if (marker !== 0x5F /* _ */ && marker !== 0x2A /* * */) {
	      return false;
	    }

	  scanned = state.scanDelims(state.pos, marker === 0x2A);

	  for (i = 0; i < scanned.length; i++) {
	    token = state.push('text', '', 0);
	    token.content = String.fromCharCode(marker);

	    state.delimiters.push({
	      // Char code of the starting marker (number).
	      //
	      marker: marker,

	      // An amount of characters before this one that's equivalent to
	      // current one. In plain English: if this delimiter does not open
	      // an emphasis, neither do previous `jump` characters.
	      //
	      // Used to skip sequences like "*****" in one step, for 1st asterisk
	      // value will be 0, for 2nd it's 1 and so on.
	      //
	      jump: i,

	      // A position of the token this delimiter corresponds to.
	      //
	      token: state.tokens.length - 1,

	      // Token level.
	      //
	      level: state.level,

	      // If this delimiter is matched as a valid opener, `end` will be
	      // equal to its position, otherwise it's `-1`.
	      //
	      end: -1,

	      // Boolean flags that determine if this delimiter could open or close
	      // an emphasis.
	      //
	      open: scanned.can_open,
	      close: scanned.can_close
	    });
	  }

	  state.pos += scanned.length;

	  return true;
	};

	// Walk through delimiter list and replace text tokens with tags
	//
	module.exports.postProcess = function emphasis(state) {
	  var i,
	      startDelim,
	      endDelim,
	      token,
	      ch,
	      isStrong,
	      delimiters = state.delimiters,
	      max = state.delimiters.length;

	  for (i = 0; i < max; i++) {
	    startDelim = delimiters[i];

	    if (startDelim.marker !== 0x5F /* _ */ && startDelim.marker !== 0x2A /* * */) {
	        continue;
	      }

	    // Process only opening markers
	    if (startDelim.end === -1) {
	      continue;
	    }

	    endDelim = delimiters[startDelim.end];

	    // If the next delimiter has the same marker and is adjacent to this one,
	    // merge those into one strong delimiter.
	    //
	    // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
	    //
	    isStrong = i + 1 < max && delimiters[i + 1].end === startDelim.end - 1 && delimiters[i + 1].token === startDelim.token + 1 && delimiters[startDelim.end - 1].token === endDelim.token - 1 && delimiters[i + 1].marker === startDelim.marker;

	    ch = String.fromCharCode(startDelim.marker);

	    token = state.tokens[startDelim.token];
	    token.type = isStrong ? 'strong_open' : 'em_open';
	    token.tag = isStrong ? 'strong' : 'em';
	    token.nesting = 1;
	    token.markup = isStrong ? ch + ch : ch;
	    token.content = '';

	    token = state.tokens[endDelim.token];
	    token.type = isStrong ? 'strong_close' : 'em_close';
	    token.tag = isStrong ? 'strong' : 'em';
	    token.nesting = -1;
	    token.markup = isStrong ? ch + ch : ch;
	    token.content = '';

	    if (isStrong) {
	      state.tokens[delimiters[i + 1].token].content = '';
	      state.tokens[delimiters[startDelim.end - 1].token].content = '';
	      i++;
	    }
	  }
	};

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	// Process [link](<to> "stuff")

	'use strict';

	var parseLinkLabel = __webpack_require__(64);
	var parseLinkDestination = __webpack_require__(65);
	var parseLinkTitle = __webpack_require__(66);
	var normalizeReference = __webpack_require__(49).normalizeReference;
	var isSpace = __webpack_require__(49).isSpace;

	module.exports = function link(state, silent) {
	  var attrs,
	      code,
	      label,
	      labelEnd,
	      labelStart,
	      pos,
	      res,
	      ref,
	      title,
	      token,
	      href = '',
	      oldPos = state.pos,
	      max = state.posMax,
	      start = state.pos;

	  if (state.src.charCodeAt(state.pos) !== 0x5B /* [ */) {
	      return false;
	    }

	  labelStart = state.pos + 1;
	  labelEnd = parseLinkLabel(state, state.pos, true);

	  // parser failed to find ']', so it's not a valid link
	  if (labelEnd < 0) {
	    return false;
	  }

	  pos = labelEnd + 1;
	  if (pos < max && state.src.charCodeAt(pos) === 0x28 /* ( */) {
	      //
	      // Inline link
	      //

	      // [link](  <href>  "title"  )
	      //        ^^ skipping these spaces
	      pos++;
	      for (; pos < max; pos++) {
	        code = state.src.charCodeAt(pos);
	        if (!isSpace(code) && code !== 0x0A) {
	          break;
	        }
	      }
	      if (pos >= max) {
	        return false;
	      }

	      // [link](  <href>  "title"  )
	      //          ^^^^^^ parsing link destination
	      start = pos;
	      res = parseLinkDestination(state.src, pos, state.posMax);
	      if (res.ok) {
	        href = state.md.normalizeLink(res.str);
	        if (state.md.validateLink(href)) {
	          pos = res.pos;
	        } else {
	          href = '';
	        }
	      }

	      // [link](  <href>  "title"  )
	      //                ^^ skipping these spaces
	      start = pos;
	      for (; pos < max; pos++) {
	        code = state.src.charCodeAt(pos);
	        if (!isSpace(code) && code !== 0x0A) {
	          break;
	        }
	      }

	      // [link](  <href>  "title"  )
	      //                  ^^^^^^^ parsing link title
	      res = parseLinkTitle(state.src, pos, state.posMax);
	      if (pos < max && start !== pos && res.ok) {
	        title = res.str;
	        pos = res.pos;

	        // [link](  <href>  "title"  )
	        //                         ^^ skipping these spaces
	        for (; pos < max; pos++) {
	          code = state.src.charCodeAt(pos);
	          if (!isSpace(code) && code !== 0x0A) {
	            break;
	          }
	        }
	      } else {
	        title = '';
	      }

	      if (pos >= max || state.src.charCodeAt(pos) !== 0x29 /* ) */) {
	          state.pos = oldPos;
	          return false;
	        }
	      pos++;
	    } else {
	    //
	    // Link reference
	    //
	    if (typeof state.env.references === 'undefined') {
	      return false;
	    }

	    // [foo]  [bar]
	    //      ^^ optional whitespace (can include newlines)
	    for (; pos < max; pos++) {
	      code = state.src.charCodeAt(pos);
	      if (!isSpace(code) && code !== 0x0A) {
	        break;
	      }
	    }

	    if (pos < max && state.src.charCodeAt(pos) === 0x5B /* [ */) {
	        start = pos + 1;
	        pos = parseLinkLabel(state, pos);
	        if (pos >= 0) {
	          label = state.src.slice(start, pos++);
	        } else {
	          pos = labelEnd + 1;
	        }
	      } else {
	      pos = labelEnd + 1;
	    }

	    // covers label === '' and label === undefined
	    // (collapsed reference link and shortcut reference link respectively)
	    if (!label) {
	      label = state.src.slice(labelStart, labelEnd);
	    }

	    ref = state.env.references[normalizeReference(label)];
	    if (!ref) {
	      state.pos = oldPos;
	      return false;
	    }
	    href = ref.href;
	    title = ref.title;
	  }

	  //
	  // We found the end of the link, and know for a fact it's a valid link;
	  // so all that's left to do is to call tokenizer.
	  //
	  if (!silent) {
	    state.pos = labelStart;
	    state.posMax = labelEnd;

	    token = state.push('link_open', 'a', 1);
	    token.attrs = attrs = [['href', href]];
	    if (title) {
	      attrs.push(['title', title]);
	    }

	    state.md.inline.tokenize(state);

	    token = state.push('link_close', 'a', -1);
	  }

	  state.pos = pos;
	  state.posMax = max;
	  return true;
	};

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	// Process ![image](<src> "title")

	'use strict';

	var parseLinkLabel = __webpack_require__(64);
	var parseLinkDestination = __webpack_require__(65);
	var parseLinkTitle = __webpack_require__(66);
	var normalizeReference = __webpack_require__(49).normalizeReference;
	var isSpace = __webpack_require__(49).isSpace;

	module.exports = function image(state, silent) {
	  var attrs,
	      code,
	      content,
	      label,
	      labelEnd,
	      labelStart,
	      pos,
	      ref,
	      res,
	      title,
	      token,
	      tokens,
	      start,
	      href = '',
	      oldPos = state.pos,
	      max = state.posMax;

	  if (state.src.charCodeAt(state.pos) !== 0x21 /* ! */) {
	      return false;
	    }
	  if (state.src.charCodeAt(state.pos + 1) !== 0x5B /* [ */) {
	      return false;
	    }

	  labelStart = state.pos + 2;
	  labelEnd = parseLinkLabel(state, state.pos + 1, false);

	  // parser failed to find ']', so it's not a valid link
	  if (labelEnd < 0) {
	    return false;
	  }

	  pos = labelEnd + 1;
	  if (pos < max && state.src.charCodeAt(pos) === 0x28 /* ( */) {
	      //
	      // Inline link
	      //

	      // [link](  <href>  "title"  )
	      //        ^^ skipping these spaces
	      pos++;
	      for (; pos < max; pos++) {
	        code = state.src.charCodeAt(pos);
	        if (!isSpace(code) && code !== 0x0A) {
	          break;
	        }
	      }
	      if (pos >= max) {
	        return false;
	      }

	      // [link](  <href>  "title"  )
	      //          ^^^^^^ parsing link destination
	      start = pos;
	      res = parseLinkDestination(state.src, pos, state.posMax);
	      if (res.ok) {
	        href = state.md.normalizeLink(res.str);
	        if (state.md.validateLink(href)) {
	          pos = res.pos;
	        } else {
	          href = '';
	        }
	      }

	      // [link](  <href>  "title"  )
	      //                ^^ skipping these spaces
	      start = pos;
	      for (; pos < max; pos++) {
	        code = state.src.charCodeAt(pos);
	        if (!isSpace(code) && code !== 0x0A) {
	          break;
	        }
	      }

	      // [link](  <href>  "title"  )
	      //                  ^^^^^^^ parsing link title
	      res = parseLinkTitle(state.src, pos, state.posMax);
	      if (pos < max && start !== pos && res.ok) {
	        title = res.str;
	        pos = res.pos;

	        // [link](  <href>  "title"  )
	        //                         ^^ skipping these spaces
	        for (; pos < max; pos++) {
	          code = state.src.charCodeAt(pos);
	          if (!isSpace(code) && code !== 0x0A) {
	            break;
	          }
	        }
	      } else {
	        title = '';
	      }

	      if (pos >= max || state.src.charCodeAt(pos) !== 0x29 /* ) */) {
	          state.pos = oldPos;
	          return false;
	        }
	      pos++;
	    } else {
	    //
	    // Link reference
	    //
	    if (typeof state.env.references === 'undefined') {
	      return false;
	    }

	    // [foo]  [bar]
	    //      ^^ optional whitespace (can include newlines)
	    for (; pos < max; pos++) {
	      code = state.src.charCodeAt(pos);
	      if (!isSpace(code) && code !== 0x0A) {
	        break;
	      }
	    }

	    if (pos < max && state.src.charCodeAt(pos) === 0x5B /* [ */) {
	        start = pos + 1;
	        pos = parseLinkLabel(state, pos);
	        if (pos >= 0) {
	          label = state.src.slice(start, pos++);
	        } else {
	          pos = labelEnd + 1;
	        }
	      } else {
	      pos = labelEnd + 1;
	    }

	    // covers label === '' and label === undefined
	    // (collapsed reference link and shortcut reference link respectively)
	    if (!label) {
	      label = state.src.slice(labelStart, labelEnd);
	    }

	    ref = state.env.references[normalizeReference(label)];
	    if (!ref) {
	      state.pos = oldPos;
	      return false;
	    }
	    href = ref.href;
	    title = ref.title;
	  }

	  //
	  // We found the end of the link, and know for a fact it's a valid link;
	  // so all that's left to do is to call tokenizer.
	  //
	  if (!silent) {
	    content = state.src.slice(labelStart, labelEnd);

	    state.md.inline.parse(content, state.md, state.env, tokens = []);

	    token = state.push('image', 'img', 0);
	    token.attrs = attrs = [['src', href], ['alt', '']];
	    token.children = tokens;
	    token.content = content;

	    if (title) {
	      attrs.push(['title', title]);
	    }
	  }

	  state.pos = pos;
	  state.posMax = max;
	  return true;
	};

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	// Process autolinks '<protocol:...>'

	'use strict';

	var url_schemas = __webpack_require__(103);

	/*eslint max-len:0*/
	var EMAIL_RE = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
	var AUTOLINK_RE = /^<([a-zA-Z.\-]{1,25}):([^<>\x00-\x20]*)>/;

	module.exports = function autolink(state, silent) {
	  var tail,
	      linkMatch,
	      emailMatch,
	      url,
	      fullUrl,
	      token,
	      pos = state.pos;

	  if (state.src.charCodeAt(pos) !== 0x3C /* < */) {
	      return false;
	    }

	  tail = state.src.slice(pos);

	  if (tail.indexOf('>') < 0) {
	    return false;
	  }

	  if (AUTOLINK_RE.test(tail)) {
	    linkMatch = tail.match(AUTOLINK_RE);

	    if (url_schemas.indexOf(linkMatch[1].toLowerCase()) < 0) {
	      return false;
	    }

	    url = linkMatch[0].slice(1, -1);
	    fullUrl = state.md.normalizeLink(url);
	    if (!state.md.validateLink(fullUrl)) {
	      return false;
	    }

	    if (!silent) {
	      token = state.push('link_open', 'a', 1);
	      token.attrs = [['href', fullUrl]];
	      token.markup = 'autolink';
	      token.info = 'auto';

	      token = state.push('text', '', 0);
	      token.content = state.md.normalizeLinkText(url);

	      token = state.push('link_close', 'a', -1);
	      token.markup = 'autolink';
	      token.info = 'auto';
	    }

	    state.pos += linkMatch[0].length;
	    return true;
	  }

	  if (EMAIL_RE.test(tail)) {
	    emailMatch = tail.match(EMAIL_RE);

	    url = emailMatch[0].slice(1, -1);
	    fullUrl = state.md.normalizeLink('mailto:' + url);
	    if (!state.md.validateLink(fullUrl)) {
	      return false;
	    }

	    if (!silent) {
	      token = state.push('link_open', 'a', 1);
	      token.attrs = [['href', fullUrl]];
	      token.markup = 'autolink';
	      token.info = 'auto';

	      token = state.push('text', '', 0);
	      token.content = state.md.normalizeLinkText(url);

	      token = state.push('link_close', 'a', -1);
	      token.markup = 'autolink';
	      token.info = 'auto';
	    }

	    state.pos += emailMatch[0].length;
	    return true;
	  }

	  return false;
	};

/***/ },
/* 103 */
/***/ function(module, exports) {

	// List of valid url schemas, accorting to commonmark spec
	// http://jgm.github.io/CommonMark/spec.html#autolinks

	'use strict';

	module.exports = ['coap', 'doi', 'javascript', 'aaa', 'aaas', 'about', 'acap', 'cap', 'cid', 'crid', 'data', 'dav', 'dict', 'dns', 'file', 'ftp', 'geo', 'go', 'gopher', 'h323', 'http', 'https', 'iax', 'icap', 'im', 'imap', 'info', 'ipp', 'iris', 'iris.beep', 'iris.xpc', 'iris.xpcs', 'iris.lwz', 'ldap', 'mailto', 'mid', 'msrp', 'msrps', 'mtqp', 'mupdate', 'news', 'nfs', 'ni', 'nih', 'nntp', 'opaquelocktoken', 'pop', 'pres', 'rtsp', 'service', 'session', 'shttp', 'sieve', 'sip', 'sips', 'sms', 'snmp', 'soap.beep', 'soap.beeps', 'tag', 'tel', 'telnet', 'tftp', 'thismessage', 'tn3270', 'tip', 'tv', 'urn', 'vemmi', 'ws', 'wss', 'xcon', 'xcon-userid', 'xmlrpc.beep', 'xmlrpc.beeps', 'xmpp', 'z39.50r', 'z39.50s', 'adiumxtra', 'afp', 'afs', 'aim', 'apt', 'attachment', 'aw', 'beshare', 'bitcoin', 'bolo', 'callto', 'chrome', 'chrome-extension', 'com-eventbrite-attendee', 'content', 'cvs', 'dlna-playsingle', 'dlna-playcontainer', 'dtn', 'dvb', 'ed2k', 'facetime', 'feed', 'finger', 'fish', 'gg', 'git', 'gizmoproject', 'gtalk', 'hcp', 'icon', 'ipn', 'irc', 'irc6', 'ircs', 'itms', 'jar', 'jms', 'keyparc', 'lastfm', 'ldaps', 'magnet', 'maps', 'market', 'message', 'mms', 'ms-help', 'msnim', 'mumble', 'mvn', 'notes', 'oid', 'palm', 'paparazzi', 'platform', 'proxy', 'psyc', 'query', 'res', 'resource', 'rmi', 'rsync', 'rtmp', 'secondlife', 'sftp', 'sgn', 'skype', 'smb', 'soldat', 'spotify', 'ssh', 'steam', 'svn', 'teamspeak', 'things', 'udp', 'unreal', 'ut2004', 'ventrilo', 'view-source', 'webcal', 'wtai', 'wyciwyg', 'xfire', 'xri', 'ymsgr'];

/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	// Process html tags

	'use strict';

	var HTML_TAG_RE = __webpack_require__(90).HTML_TAG_RE;

	function isLetter(ch) {
	  /*eslint no-bitwise:0*/
	  var lc = ch | 0x20; // to lower case
	  return lc >= 0x61 /* a */ && lc <= 0x7a /* z */;
	}

	module.exports = function html_inline(state, silent) {
	  var ch,
	      match,
	      max,
	      token,
	      pos = state.pos;

	  if (!state.md.options.html) {
	    return false;
	  }

	  // Check start
	  max = state.posMax;
	  if (state.src.charCodeAt(pos) !== 0x3C /* < */ || pos + 2 >= max) {
	    return false;
	  }

	  // Quick fail on second char
	  ch = state.src.charCodeAt(pos + 1);
	  if (ch !== 0x21 /* ! */ && ch !== 0x3F /* ? */ && ch !== 0x2F /* / */ && !isLetter(ch)) {
	    return false;
	  }

	  match = state.src.slice(pos).match(HTML_TAG_RE);
	  if (!match) {
	    return false;
	  }

	  if (!silent) {
	    token = state.push('html_inline', '', 0);
	    token.content = state.src.slice(pos, pos + match[0].length);
	  }
	  state.pos += match[0].length;
	  return true;
	};

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	// Process html entity - &#123;, &#xAF;, &quot;, ...

	'use strict';

	var entities = __webpack_require__(50);
	var has = __webpack_require__(49).has;
	var isValidEntityCode = __webpack_require__(49).isValidEntityCode;
	var fromCodePoint = __webpack_require__(49).fromCodePoint;

	var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i;
	var NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;

	module.exports = function entity(state, silent) {
	  var ch,
	      code,
	      match,
	      pos = state.pos,
	      max = state.posMax;

	  if (state.src.charCodeAt(pos) !== 0x26 /* & */) {
	      return false;
	    }

	  if (pos + 1 < max) {
	    ch = state.src.charCodeAt(pos + 1);

	    if (ch === 0x23 /* # */) {
	        match = state.src.slice(pos).match(DIGITAL_RE);
	        if (match) {
	          if (!silent) {
	            code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
	            state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
	          }
	          state.pos += match[0].length;
	          return true;
	        }
	      } else {
	      match = state.src.slice(pos).match(NAMED_RE);
	      if (match) {
	        if (has(entities, match[1])) {
	          if (!silent) {
	            state.pending += entities[match[1]];
	          }
	          state.pos += match[0].length;
	          return true;
	        }
	      }
	    }
	  }

	  if (!silent) {
	    state.pending += '&';
	  }
	  state.pos++;
	  return true;
	};

/***/ },
/* 106 */
/***/ function(module, exports) {

	// For each opening emphasis-like marker find a matching closing one
	//
	'use strict';

	module.exports = function link_pairs(state) {
	  var i,
	      j,
	      lastDelim,
	      currDelim,
	      delimiters = state.delimiters,
	      max = state.delimiters.length;

	  for (i = 0; i < max; i++) {
	    lastDelim = delimiters[i];

	    if (!lastDelim.close) {
	      continue;
	    }

	    j = i - lastDelim.jump - 1;

	    while (j >= 0) {
	      currDelim = delimiters[j];

	      if (currDelim.open && currDelim.marker === lastDelim.marker && currDelim.end < 0 && currDelim.level === lastDelim.level) {

	        lastDelim.jump = i - j;
	        lastDelim.open = false;
	        currDelim.end = i;
	        currDelim.jump = 0;
	        break;
	      }

	      j -= currDelim.jump + 1;
	    }
	  }
	};

/***/ },
/* 107 */
/***/ function(module, exports) {

	// Merge adjacent text nodes into one, and re-calculate all token levels
	//
	'use strict';

	module.exports = function text_collapse(state) {
	  var curr,
	      last,
	      level = 0,
	      tokens = state.tokens,
	      max = state.tokens.length;

	  for (curr = last = 0; curr < max; curr++) {
	    // re-calculate levels
	    level += tokens[curr].nesting;
	    tokens[curr].level = level;

	    if (tokens[curr].type === 'text' && curr + 1 < max && tokens[curr + 1].type === 'text') {

	      // collapse two adjacent text nodes
	      tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
	    } else {
	      if (curr !== last) {
	        tokens[last] = tokens[curr];
	      }

	      last++;
	    }
	  }

	  if (curr !== last) {
	    tokens.length = last;
	  }
	};

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	// Inline parser state

	'use strict';

	var Token = __webpack_require__(77);
	var isWhiteSpace = __webpack_require__(49).isWhiteSpace;
	var isPunctChar = __webpack_require__(49).isPunctChar;
	var isMdAsciiPunct = __webpack_require__(49).isMdAsciiPunct;

	function StateInline(src, md, env, outTokens) {
	  this.src = src;
	  this.env = env;
	  this.md = md;
	  this.tokens = outTokens;

	  this.pos = 0;
	  this.posMax = this.src.length;
	  this.level = 0;
	  this.pending = '';
	  this.pendingLevel = 0;

	  this.cache = {}; // Stores { start: end } pairs. Useful for backtrack
	  // optimization of pairs parse (emphasis, strikes).

	  this.delimiters = []; // Emphasis-like delimiters
	}

	// Flush pending text
	//
	StateInline.prototype.pushPending = function () {
	  var token = new Token('text', '', 0);
	  token.content = this.pending;
	  token.level = this.pendingLevel;
	  this.tokens.push(token);
	  this.pending = '';
	  return token;
	};

	// Push new token to "stream".
	// If pending text exists - flush it as text token
	//
	StateInline.prototype.push = function (type, tag, nesting) {
	  if (this.pending) {
	    this.pushPending();
	  }

	  var token = new Token(type, tag, nesting);

	  if (nesting < 0) {
	    this.level--;
	  }
	  token.level = this.level;
	  if (nesting > 0) {
	    this.level++;
	  }

	  this.pendingLevel = this.level;
	  this.tokens.push(token);
	  return token;
	};

	// Scan a sequence of emphasis-like markers, and determine whether
	// it can start an emphasis sequence or end an emphasis sequence.
	//
	//  - start - position to scan from (it should point at a valid marker);
	//  - canSplitWord - determine if these markers can be found inside a word
	//
	StateInline.prototype.scanDelims = function (start, canSplitWord) {
	  var pos = start,
	      lastChar,
	      nextChar,
	      count,
	      can_open,
	      can_close,
	      isLastWhiteSpace,
	      isLastPunctChar,
	      isNextWhiteSpace,
	      isNextPunctChar,
	      left_flanking = true,
	      right_flanking = true,
	      max = this.posMax,
	      marker = this.src.charCodeAt(start);

	  // treat beginning of the line as a whitespace
	  lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;

	  while (pos < max && this.src.charCodeAt(pos) === marker) {
	    pos++;
	  }

	  count = pos - start;

	  // treat end of the line as a whitespace
	  nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20;

	  isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
	  isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

	  isLastWhiteSpace = isWhiteSpace(lastChar);
	  isNextWhiteSpace = isWhiteSpace(nextChar);

	  if (isNextWhiteSpace) {
	    left_flanking = false;
	  } else if (isNextPunctChar) {
	    if (!(isLastWhiteSpace || isLastPunctChar)) {
	      left_flanking = false;
	    }
	  }

	  if (isLastWhiteSpace) {
	    right_flanking = false;
	  } else if (isLastPunctChar) {
	    if (!(isNextWhiteSpace || isNextPunctChar)) {
	      right_flanking = false;
	    }
	  }

	  if (!canSplitWord) {
	    can_open = left_flanking && (!right_flanking || isLastPunctChar);
	    can_close = right_flanking && (!left_flanking || isNextPunctChar);
	  } else {
	    can_open = left_flanking;
	    can_close = right_flanking;
	  }

	  return {
	    can_open: can_open,
	    can_close: can_close,
	    length: count
	  };
	};

	// re-export Token class to use in block rules
	StateInline.prototype.Token = Token;

	module.exports = StateInline;

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	////////////////////////////////////////////////////////////////////////////////
	// Helpers

	// Merge objects
	//

	function assign(obj /*from1, from2, from3, ...*/) {
	  var sources = Array.prototype.slice.call(arguments, 1);

	  sources.forEach(function (source) {
	    if (!source) {
	      return;
	    }

	    Object.keys(source).forEach(function (key) {
	      obj[key] = source[key];
	    });
	  });

	  return obj;
	}

	function _class(obj) {
	  return Object.prototype.toString.call(obj);
	}
	function isString(obj) {
	  return _class(obj) === '[object String]';
	}
	function isObject(obj) {
	  return _class(obj) === '[object Object]';
	}
	function isRegExp(obj) {
	  return _class(obj) === '[object RegExp]';
	}
	function isFunction(obj) {
	  return _class(obj) === '[object Function]';
	}

	function escapeRE(str) {
	  return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
	}

	////////////////////////////////////////////////////////////////////////////////

	var defaultOptions = {
	  fuzzyLink: true,
	  fuzzyEmail: true,
	  fuzzyIP: false
	};

	function isOptionsObj(obj) {
	  return Object.keys(obj || {}).reduce(function (acc, k) {
	    return acc || defaultOptions.hasOwnProperty(k);
	  }, false);
	}

	var defaultSchemas = {
	  'http:': {
	    validate: function (text, pos, self) {
	      var tail = text.slice(pos);

	      if (!self.re.http) {
	        // compile lazily, because "host"-containing variables can change on tlds update.
	        self.re.http = new RegExp('^\\/\\/' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i');
	      }
	      if (self.re.http.test(tail)) {
	        return tail.match(self.re.http)[0].length;
	      }
	      return 0;
	    }
	  },
	  'https:': 'http:',
	  'ftp:': 'http:',
	  '//': {
	    validate: function (text, pos, self) {
	      var tail = text.slice(pos);

	      if (!self.re.no_http) {
	        // compile lazily, becayse "host"-containing variables can change on tlds update.
	        self.re.no_http = new RegExp('^' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i');
	      }

	      if (self.re.no_http.test(tail)) {
	        // should not be `://`, that protects from errors in protocol name
	        if (pos >= 3 && text[pos - 3] === ':') {
	          return 0;
	        }
	        return tail.match(self.re.no_http)[0].length;
	      }
	      return 0;
	    }
	  },
	  'mailto:': {
	    validate: function (text, pos, self) {
	      var tail = text.slice(pos);

	      if (!self.re.mailto) {
	        self.re.mailto = new RegExp('^' + self.re.src_email_name + '@' + self.re.src_host_strict, 'i');
	      }
	      if (self.re.mailto.test(tail)) {
	        return tail.match(self.re.mailto)[0].length;
	      }
	      return 0;
	    }
	  }
	};

	/*eslint-disable max-len*/

	// RE pattern for 2-character tlds (autogenerated by ./support/tlds_2char_gen.js)
	var tlds_2ch_src_re = 'a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]';

	// DON'T try to make PRs with changes. Extend TLDs with LinkifyIt.tlds() instead
	var tlds_default = 'biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф'.split('|');

	/*eslint-enable max-len*/

	////////////////////////////////////////////////////////////////////////////////

	function resetScanCache(self) {
	  self.__index__ = -1;
	  self.__text_cache__ = '';
	}

	function createValidator(re) {
	  return function (text, pos) {
	    var tail = text.slice(pos);

	    if (re.test(tail)) {
	      return tail.match(re)[0].length;
	    }
	    return 0;
	  };
	}

	function createNormalizer() {
	  return function (match, self) {
	    self.normalize(match);
	  };
	}

	// Schemas compiler. Build regexps.
	//
	function compile(self) {

	  // Load & clone RE patterns.
	  var re = self.re = assign({}, __webpack_require__(110));

	  // Define dynamic patterns
	  var tlds = self.__tlds__.slice();

	  if (!self.__tlds_replaced__) {
	    tlds.push(tlds_2ch_src_re);
	  }
	  tlds.push(re.src_xn);

	  re.src_tlds = tlds.join('|');

	  function untpl(tpl) {
	    return tpl.replace('%TLDS%', re.src_tlds);
	  }

	  re.email_fuzzy = RegExp(untpl(re.tpl_email_fuzzy), 'i');
	  re.link_fuzzy = RegExp(untpl(re.tpl_link_fuzzy), 'i');
	  re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), 'i');
	  re.host_fuzzy_test = RegExp(untpl(re.tpl_host_fuzzy_test), 'i');

	  //
	  // Compile each schema
	  //

	  var aliases = [];

	  self.__compiled__ = {}; // Reset compiled data

	  function schemaError(name, val) {
	    throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val);
	  }

	  Object.keys(self.__schemas__).forEach(function (name) {
	    var val = self.__schemas__[name];

	    // skip disabled methods
	    if (val === null) {
	      return;
	    }

	    var compiled = { validate: null, link: null };

	    self.__compiled__[name] = compiled;

	    if (isObject(val)) {
	      if (isRegExp(val.validate)) {
	        compiled.validate = createValidator(val.validate);
	      } else if (isFunction(val.validate)) {
	        compiled.validate = val.validate;
	      } else {
	        schemaError(name, val);
	      }

	      if (isFunction(val.normalize)) {
	        compiled.normalize = val.normalize;
	      } else if (!val.normalize) {
	        compiled.normalize = createNormalizer();
	      } else {
	        schemaError(name, val);
	      }

	      return;
	    }

	    if (isString(val)) {
	      aliases.push(name);
	      return;
	    }

	    schemaError(name, val);
	  });

	  //
	  // Compile postponed aliases
	  //

	  aliases.forEach(function (alias) {
	    if (!self.__compiled__[self.__schemas__[alias]]) {
	      // Silently fail on missed schemas to avoid errons on disable.
	      // schemaError(alias, self.__schemas__[alias]);
	      return;
	    }

	    self.__compiled__[alias].validate = self.__compiled__[self.__schemas__[alias]].validate;
	    self.__compiled__[alias].normalize = self.__compiled__[self.__schemas__[alias]].normalize;
	  });

	  //
	  // Fake record for guessed links
	  //
	  self.__compiled__[''] = { validate: null, normalize: createNormalizer() };

	  //
	  // Build schema condition
	  //
	  var slist = Object.keys(self.__compiled__).filter(function (name) {
	    // Filter disabled & fake schemas
	    return name.length > 0 && self.__compiled__[name];
	  }).map(escapeRE).join('|');
	  // (?!_) cause 1.5x slowdown
	  self.re.schema_test = RegExp('(^|(?!_)(?:>|' + re.src_ZPCc + '))(' + slist + ')', 'i');
	  self.re.schema_search = RegExp('(^|(?!_)(?:>|' + re.src_ZPCc + '))(' + slist + ')', 'ig');

	  self.re.pretest = RegExp('(' + self.re.schema_test.source + ')|' + '(' + self.re.host_fuzzy_test.source + ')|' + '@', 'i');

	  //
	  // Cleanup
	  //

	  resetScanCache(self);
	}

	/**
	 * class Match
	 *
	 * Match result. Single element of array, returned by [[LinkifyIt#match]]
	 **/
	function Match(self, shift) {
	  var start = self.__index__,
	      end = self.__last_index__,
	      text = self.__text_cache__.slice(start, end);

	  /**
	   * Match#schema -> String
	   *
	   * Prefix (protocol) for matched string.
	   **/
	  this.schema = self.__schema__.toLowerCase();
	  /**
	   * Match#index -> Number
	   *
	   * First position of matched string.
	   **/
	  this.index = start + shift;
	  /**
	   * Match#lastIndex -> Number
	   *
	   * Next position after matched string.
	   **/
	  this.lastIndex = end + shift;
	  /**
	   * Match#raw -> String
	   *
	   * Matched string.
	   **/
	  this.raw = text;
	  /**
	   * Match#text -> String
	   *
	   * Notmalized text of matched string.
	   **/
	  this.text = text;
	  /**
	   * Match#url -> String
	   *
	   * Normalized url of matched string.
	   **/
	  this.url = text;
	}

	function createMatch(self, shift) {
	  var match = new Match(self, shift);

	  self.__compiled__[match.schema].normalize(match, self);

	  return match;
	}

	/**
	 * class LinkifyIt
	 **/

	/**
	 * new LinkifyIt(schemas, options)
	 * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
	 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
	 *
	 * Creates new linkifier instance with optional additional schemas.
	 * Can be called without `new` keyword for convenience.
	 *
	 * By default understands:
	 *
	 * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
	 * - "fuzzy" links and emails (example.com, foo@bar.com).
	 *
	 * `schemas` is an object, where each key/value describes protocol/rule:
	 *
	 * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
	 *   for example). `linkify-it` makes shure that prefix is not preceeded with
	 *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
	 * - __value__ - rule to check tail after link prefix
	 *   - _String_ - just alias to existing rule
	 *   - _Object_
	 *     - _validate_ - validator function (should return matched length on success),
	 *       or `RegExp`.
	 *     - _normalize_ - optional function to normalize text & url of matched result
	 *       (for example, for @twitter mentions).
	 *
	 * `options`:
	 *
	 * - __fuzzyLink__ - recognige URL-s without `http(s):` prefix. Default `true`.
	 * - __fuzzyIP__ - allow IPs in fuzzy links above. Can conflict with some texts
	 *   like version numbers. Default `false`.
	 * - __fuzzyEmail__ - recognize emails without `mailto:` prefix.
	 *
	 **/
	function LinkifyIt(schemas, options) {
	  if (!(this instanceof LinkifyIt)) {
	    return new LinkifyIt(schemas, options);
	  }

	  if (!options) {
	    if (isOptionsObj(schemas)) {
	      options = schemas;
	      schemas = {};
	    }
	  }

	  this.__opts__ = assign({}, defaultOptions, options);

	  // Cache last tested result. Used to skip repeating steps on next `match` call.
	  this.__index__ = -1;
	  this.__last_index__ = -1; // Next scan position
	  this.__schema__ = '';
	  this.__text_cache__ = '';

	  this.__schemas__ = assign({}, defaultSchemas, schemas);
	  this.__compiled__ = {};

	  this.__tlds__ = tlds_default;
	  this.__tlds_replaced__ = false;

	  this.re = {};

	  compile(this);
	}

	/** chainable
	 * LinkifyIt#add(schema, definition)
	 * - schema (String): rule name (fixed pattern prefix)
	 * - definition (String|RegExp|Object): schema definition
	 *
	 * Add new rule definition. See constructor description for details.
	 **/
	LinkifyIt.prototype.add = function add(schema, definition) {
	  this.__schemas__[schema] = definition;
	  compile(this);
	  return this;
	};

	/** chainable
	 * LinkifyIt#set(options)
	 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
	 *
	 * Set recognition options for links without schema.
	 **/
	LinkifyIt.prototype.set = function set(options) {
	  this.__opts__ = assign(this.__opts__, options);
	  return this;
	};

	/**
	 * LinkifyIt#test(text) -> Boolean
	 *
	 * Searches linkifiable pattern and returns `true` on success or `false` on fail.
	 **/
	LinkifyIt.prototype.test = function test(text) {
	  // Reset scan cache
	  this.__text_cache__ = text;
	  this.__index__ = -1;

	  if (!text.length) {
	    return false;
	  }

	  var m, ml, me, len, shift, next, re, tld_pos, at_pos;

	  // try to scan for link with schema - that's the most simple rule
	  if (this.re.schema_test.test(text)) {
	    re = this.re.schema_search;
	    re.lastIndex = 0;
	    while ((m = re.exec(text)) !== null) {
	      len = this.testSchemaAt(text, m[2], re.lastIndex);
	      if (len) {
	        this.__schema__ = m[2];
	        this.__index__ = m.index + m[1].length;
	        this.__last_index__ = m.index + m[0].length + len;
	        break;
	      }
	    }
	  }

	  if (this.__opts__.fuzzyLink && this.__compiled__['http:']) {
	    // guess schemaless links
	    tld_pos = text.search(this.re.host_fuzzy_test);
	    if (tld_pos >= 0) {
	      // if tld is located after found link - no need to check fuzzy pattern
	      if (this.__index__ < 0 || tld_pos < this.__index__) {
	        if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {

	          shift = ml.index + ml[1].length;

	          if (this.__index__ < 0 || shift < this.__index__) {
	            this.__schema__ = '';
	            this.__index__ = shift;
	            this.__last_index__ = ml.index + ml[0].length;
	          }
	        }
	      }
	    }
	  }

	  if (this.__opts__.fuzzyEmail && this.__compiled__['mailto:']) {
	    // guess schemaless emails
	    at_pos = text.indexOf('@');
	    if (at_pos >= 0) {
	      // We can't skip this check, because this cases are possible:
	      // 192.168.1.1@gmail.com, my.in@example.com
	      if ((me = text.match(this.re.email_fuzzy)) !== null) {

	        shift = me.index + me[1].length;
	        next = me.index + me[0].length;

	        if (this.__index__ < 0 || shift < this.__index__ || shift === this.__index__ && next > this.__last_index__) {
	          this.__schema__ = 'mailto:';
	          this.__index__ = shift;
	          this.__last_index__ = next;
	        }
	      }
	    }
	  }

	  return this.__index__ >= 0;
	};

	/**
	 * LinkifyIt#pretest(text) -> Boolean
	 *
	 * Very quick check, that can give false positives. Returns true if link MAY BE
	 * can exists. Can be used for speed optimization, when you need to check that
	 * link NOT exists.
	 **/
	LinkifyIt.prototype.pretest = function pretest(text) {
	  return this.re.pretest.test(text);
	};

	/**
	 * LinkifyIt#testSchemaAt(text, name, position) -> Number
	 * - text (String): text to scan
	 * - name (String): rule (schema) name
	 * - position (Number): text offset to check from
	 *
	 * Similar to [[LinkifyIt#test]] but checks only specific protocol tail exactly
	 * at given position. Returns length of found pattern (0 on fail).
	 **/
	LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text, schema, pos) {
	  // If not supported schema check requested - terminate
	  if (!this.__compiled__[schema.toLowerCase()]) {
	    return 0;
	  }
	  return this.__compiled__[schema.toLowerCase()].validate(text, pos, this);
	};

	/**
	 * LinkifyIt#match(text) -> Array|null
	 *
	 * Returns array of found link descriptions or `null` on fail. We strongly
	 * to use [[LinkifyIt#test]] first, for best speed.
	 *
	 * ##### Result match description
	 *
	 * - __schema__ - link schema, can be empty for fuzzy links, or `//` for
	 *   protocol-neutral  links.
	 * - __index__ - offset of matched text
	 * - __lastIndex__ - index of next char after mathch end
	 * - __raw__ - matched text
	 * - __text__ - normalized text
	 * - __url__ - link, generated from matched text
	 **/
	LinkifyIt.prototype.match = function match(text) {
	  var shift = 0,
	      result = [];

	  // Try to take previous element from cache, if .test() called before
	  if (this.__index__ >= 0 && this.__text_cache__ === text) {
	    result.push(createMatch(this, shift));
	    shift = this.__last_index__;
	  }

	  // Cut head if cache was used
	  var tail = shift ? text.slice(shift) : text;

	  // Scan string until end reached
	  while (this.test(tail)) {
	    result.push(createMatch(this, shift));

	    tail = tail.slice(this.__last_index__);
	    shift += this.__last_index__;
	  }

	  if (result.length) {
	    return result;
	  }

	  return null;
	};

	/** chainable
	 * LinkifyIt#tlds(list [, keepOld]) -> this
	 * - list (Array): list of tlds
	 * - keepOld (Boolean): merge with current list if `true` (`false` by default)
	 *
	 * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
	 * to avoid false positives. By default this algorythm used:
	 *
	 * - hostname with any 2-letter root zones are ok.
	 * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
	 *   are ok.
	 * - encoded (`xn--...`) root zones are ok.
	 *
	 * If list is replaced, then exact match for 2-chars root zones will be checked.
	 **/
	LinkifyIt.prototype.tlds = function tlds(list, keepOld) {
	  list = Array.isArray(list) ? list : [list];

	  if (!keepOld) {
	    this.__tlds__ = list.slice();
	    this.__tlds_replaced__ = true;
	    compile(this);
	    return this;
	  }

	  this.__tlds__ = this.__tlds__.concat(list).sort().filter(function (el, idx, arr) {
	    return el !== arr[idx - 1];
	  }).reverse();

	  compile(this);
	  return this;
	};

	/**
	 * LinkifyIt#normalize(match)
	 *
	 * Default normalizer (if schema does not define it's own).
	 **/
	LinkifyIt.prototype.normalize = function normalize(match) {

	  // Do minimal possible changes by default. Need to collect feedback prior
	  // to move forward https://github.com/markdown-it/linkify-it/issues/1

	  if (!match.schema) {
	    match.url = 'http://' + match.url;
	  }

	  if (match.schema === 'mailto:' && !/^mailto:/i.test(match.url)) {
	    match.url = 'mailto:' + match.url;
	  }
	};

	module.exports = LinkifyIt;

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Use direct extract instead of `regenerate` to reduse browserified size

	var src_Any = exports.src_Any = __webpack_require__(59).source;
	var src_Cc = exports.src_Cc = __webpack_require__(60).source;
	var src_Z = exports.src_Z = __webpack_require__(62).source;
	var src_P = exports.src_P = __webpack_require__(52).source;

	// \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
	var src_ZPCc = exports.src_ZPCc = [src_Z, src_P, src_Cc].join('|');

	// \p{\Z\Cc} (white spaces + control)
	var src_ZCc = exports.src_ZCc = [src_Z, src_Cc].join('|');

	// All possible word characters (everything without punctuation, spaces & controls)
	// Defined via punctuation & spaces to save space
	// Should be something like \p{\L\N\S\M} (\w but without `_`)
	var src_pseudo_letter = '(?:(?!' + src_ZPCc + ')' + src_Any + ')';
	// The same as abothe but without [0-9]
	var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCc + ')' + src_Any + ')';

	////////////////////////////////////////////////////////////////////////////////

	var src_ip4 = exports.src_ip4 = '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

	exports.src_auth = '(?:(?:(?!' + src_ZCc + ').)+@)?';

	var src_port = exports.src_port = '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';

	var src_host_terminator = exports.src_host_terminator = '(?=$|' + src_ZPCc + ')(?!-|_|:\\d|\\.-|\\.(?!$|' + src_ZPCc + '))';

	var src_path = exports.src_path = '(?:' + '[/?#]' + '(?:' + '(?!' + src_ZCc + '|[()[\\]{}.,"\'?!\\-]).|' + '\\[(?:(?!' + src_ZCc + '|\\]).)*\\]|' + '\\((?:(?!' + src_ZCc + '|[)]).)*\\)|' + '\\{(?:(?!' + src_ZCc + '|[}]).)*\\}|' + '\\"(?:(?!' + src_ZCc + '|["]).)+\\"|' + "\\'(?:(?!" + src_ZCc + "|[']).)+\\'|" + "\\'(?=" + src_pseudo_letter + ').|' + // allow `I'm_king` if no pair found
	'\\.{2,3}[a-zA-Z0-9%/]|' + // github has ... in commit range links. Restrict to
	// - english
	// - percent-encoded
	// - parts of file path
	// until more examples found.
	'\\.(?!' + src_ZCc + '|[.]).|' + '\\-(?!--(?:[^-]|$))(?:-*)|' + // `---` => long dash, terminate
	'\\,(?!' + src_ZCc + ').|' + // allow `,,,` in paths
	'\\!(?!' + src_ZCc + '|[!]).|' + '\\?(?!' + src_ZCc + '|[?]).' + ')+' + '|\\/' + ')?';

	var src_email_name = exports.src_email_name = '[\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]+';

	var src_xn = exports.src_xn = 'xn--[a-z0-9\\-]{1,59}';

	// More to read about domain names
	// http://serverfault.com/questions/638260/

	var src_domain_root = exports.src_domain_root =

	// Can't have digits and dashes
	'(?:' + src_xn + '|' + src_pseudo_letter_non_d + '{1,63}' + ')';

	var src_domain = exports.src_domain = '(?:' + src_xn + '|' + '(?:' + src_pseudo_letter + ')' + '|' +
	// don't allow `--` in domain names, because:
	// - that can conflict with markdown &mdash; / &ndash;
	// - nobody use those anyway
	'(?:' + src_pseudo_letter + '(?:-(?!-)|' + src_pseudo_letter + '){0,61}' + src_pseudo_letter + ')' + ')';

	var src_host = exports.src_host = '(?:' + src_ip4 + '|' + '(?:(?:(?:' + src_domain + ')\\.)*' + src_domain_root + ')' + ')';

	var tpl_host_fuzzy = exports.tpl_host_fuzzy = '(?:' + src_ip4 + '|' + '(?:(?:(?:' + src_domain + ')\\.)+(?:%TLDS%))' + ')';

	var tpl_host_no_ip_fuzzy = exports.tpl_host_no_ip_fuzzy = '(?:(?:(?:' + src_domain + ')\\.)+(?:%TLDS%))';

	exports.src_host_strict = src_host + src_host_terminator;

	var tpl_host_fuzzy_strict = exports.tpl_host_fuzzy_strict = tpl_host_fuzzy + src_host_terminator;

	exports.src_host_port_strict = src_host + src_port + src_host_terminator;

	var tpl_host_port_fuzzy_strict = exports.tpl_host_port_fuzzy_strict = tpl_host_fuzzy + src_port + src_host_terminator;

	var tpl_host_port_no_ip_fuzzy_strict = exports.tpl_host_port_no_ip_fuzzy_strict = tpl_host_no_ip_fuzzy + src_port + src_host_terminator;

	////////////////////////////////////////////////////////////////////////////////
	// Main rules

	// Rude test fuzzy links by host, for quick deny
	exports.tpl_host_fuzzy_test = 'localhost|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:' + src_ZPCc + '|$))';

	exports.tpl_email_fuzzy = '(^|>|' + src_ZCc + ')(' + src_email_name + '@' + tpl_host_fuzzy_strict + ')';

	exports.tpl_link_fuzzy =
	// Fuzzy link can't be prepended with .:/\- and non punctuation.
	// but can start with > (markdown blockquote)
	'(^|(?![.:/\\-_@])(?:[$+<=>^`|]|' + src_ZPCc + '))' + '((?![$+<=>^`|])' + tpl_host_port_fuzzy_strict + src_path + ')';

	exports.tpl_link_no_ip_fuzzy =
	// Fuzzy link can't be prepended with .:/\- and non punctuation.
	// but can start with > (markdown blockquote)
	'(^|(?![.:/\\-_@])(?:[$+<=>^`|]|' + src_ZPCc + '))' + '((?![$+<=>^`|])' + tpl_host_port_no_ip_fuzzy_strict + src_path + ')';

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/punycode v1.4.0 by @mathias */
	;(function (root) {

		/** Detect free variables */
		var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
		var freeModule = typeof module == 'object' && module && !module.nodeType && module;
		var freeGlobal = typeof global == 'object' && global;
		if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal) {
			root = freeGlobal;
		}

		/**
	  * The `punycode` object.
	  * @name punycode
	  * @type Object
	  */
		var punycode,


		/** Highest positive signed 32-bit float value */
		maxInt = 2147483647,
		    // aka. 0x7FFFFFFF or 2^31-1

		/** Bootstring parameters */
		base = 36,
		    tMin = 1,
		    tMax = 26,
		    skew = 38,
		    damp = 700,
		    initialBias = 72,
		    initialN = 128,
		    // 0x80
		delimiter = '-',
		    // '\x2D'

		/** Regular expressions */
		regexPunycode = /^xn--/,
		    regexNonASCII = /[^\x20-\x7E]/,
		    // unprintable ASCII chars + non-ASCII chars
		regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g,
		    // RFC 3490 separators

		/** Error messages */
		errors = {
			'overflow': 'Overflow: input needs wider integers to process',
			'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
			'invalid-input': 'Invalid input'
		},


		/** Convenience shortcuts */
		baseMinusTMin = base - tMin,
		    floor = Math.floor,
		    stringFromCharCode = String.fromCharCode,


		/** Temporary variable */
		key;

		/*--------------------------------------------------------------------------*/

		/**
	  * A generic error utility function.
	  * @private
	  * @param {String} type The error type.
	  * @returns {Error} Throws a `RangeError` with the applicable error message.
	  */
		function error(type) {
			throw new RangeError(errors[type]);
		}

		/**
	  * A generic `Array#map` utility function.
	  * @private
	  * @param {Array} array The array to iterate over.
	  * @param {Function} callback The function that gets called for every array
	  * item.
	  * @returns {Array} A new array of values returned by the callback function.
	  */
		function map(array, fn) {
			var length = array.length;
			var result = [];
			while (length--) {
				result[length] = fn(array[length]);
			}
			return result;
		}

		/**
	  * A simple `Array#map`-like wrapper to work with domain name strings or email
	  * addresses.
	  * @private
	  * @param {String} domain The domain name or email address.
	  * @param {Function} callback The function that gets called for every
	  * character.
	  * @returns {Array} A new string of characters returned by the callback
	  * function.
	  */
		function mapDomain(string, fn) {
			var parts = string.split('@');
			var result = '';
			if (parts.length > 1) {
				// In email addresses, only the domain name should be punycoded. Leave
				// the local part (i.e. everything up to `@`) intact.
				result = parts[0] + '@';
				string = parts[1];
			}
			// Avoid `split(regex)` for IE8 compatibility. See #17.
			string = string.replace(regexSeparators, '\x2E');
			var labels = string.split('.');
			var encoded = map(labels, fn).join('.');
			return result + encoded;
		}

		/**
	  * Creates an array containing the numeric code points of each Unicode
	  * character in the string. While JavaScript uses UCS-2 internally,
	  * this function will convert a pair of surrogate halves (each of which
	  * UCS-2 exposes as separate characters) into a single code point,
	  * matching UTF-16.
	  * @see `punycode.ucs2.encode`
	  * @see <https://mathiasbynens.be/notes/javascript-encoding>
	  * @memberOf punycode.ucs2
	  * @name decode
	  * @param {String} string The Unicode input string (UCS-2).
	  * @returns {Array} The new array of code points.
	  */
		function ucs2decode(string) {
			var output = [],
			    counter = 0,
			    length = string.length,
			    value,
			    extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) {
						// low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}

		/**
	  * Creates a string based on an array of numeric code points.
	  * @see `punycode.ucs2.decode`
	  * @memberOf punycode.ucs2
	  * @name encode
	  * @param {Array} codePoints The array of numeric code points.
	  * @returns {String} The new Unicode string (UCS-2).
	  */
		function ucs2encode(array) {
			return map(array, function (value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			}).join('');
		}

		/**
	  * Converts a basic code point into a digit/integer.
	  * @see `digitToBasic()`
	  * @private
	  * @param {Number} codePoint The basic numeric code point value.
	  * @returns {Number} The numeric value of a basic code point (for use in
	  * representing integers) in the range `0` to `base - 1`, or `base` if
	  * the code point does not represent a value.
	  */
		function basicToDigit(codePoint) {
			if (codePoint - 48 < 10) {
				return codePoint - 22;
			}
			if (codePoint - 65 < 26) {
				return codePoint - 65;
			}
			if (codePoint - 97 < 26) {
				return codePoint - 97;
			}
			return base;
		}

		/**
	  * Converts a digit/integer into a basic code point.
	  * @see `basicToDigit()`
	  * @private
	  * @param {Number} digit The numeric value of a basic code point.
	  * @returns {Number} The basic code point whose value (when used for
	  * representing integers) is `digit`, which needs to be in the range
	  * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	  * used; else, the lowercase form is used. The behavior is undefined
	  * if `flag` is non-zero and `digit` has no uppercase form.
	  */
		function digitToBasic(digit, flag) {
			//  0..25 map to ASCII a..z or A..Z
			// 26..35 map to ASCII 0..9
			return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
		}

		/**
	  * Bias adaptation function as per section 3.4 of RFC 3492.
	  * https://tools.ietf.org/html/rfc3492#section-3.4
	  * @private
	  */
		function adapt(delta, numPoints, firstTime) {
			var k = 0;
			delta = firstTime ? floor(delta / damp) : delta >> 1;
			delta += floor(delta / numPoints);
			for (; /* no initialization */delta > baseMinusTMin * tMax >> 1; k += base) {
				delta = floor(delta / baseMinusTMin);
			}
			return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		}

		/**
	  * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	  * symbols.
	  * @memberOf punycode
	  * @param {String} input The Punycode string of ASCII-only symbols.
	  * @returns {String} The resulting string of Unicode symbols.
	  */
		function decode(input) {
			// Don't use UCS-2
			var output = [],
			    inputLength = input.length,
			    out,
			    i = 0,
			    n = initialN,
			    bias = initialBias,
			    basic,
			    j,
			    index,
			    oldi,
			    w,
			    k,
			    digit,
			    t,

			/** Cached calculation results */
			baseMinusT;

			// Handle the basic code points: let `basic` be the number of input code
			// points before the last delimiter, or `0` if there is none, then copy
			// the first basic code points to the output.

			basic = input.lastIndexOf(delimiter);
			if (basic < 0) {
				basic = 0;
			}

			for (j = 0; j < basic; ++j) {
				// if it's not a basic code point
				if (input.charCodeAt(j) >= 0x80) {
					error('not-basic');
				}
				output.push(input.charCodeAt(j));
			}

			// Main decoding loop: start just after the last delimiter if any basic code
			// points were copied; start at the beginning otherwise.

			for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) /* no final expression */{

				// `index` is the index of the next character to be consumed.
				// Decode a generalized variable-length integer into `delta`,
				// which gets added to `i`. The overflow checking is easier
				// if we increase `i` as we go, then subtract off its starting
				// value at the end to obtain `delta`.
				for (oldi = i, w = 1, k = base;; /* no condition */k += base) {

					if (index >= inputLength) {
						error('invalid-input');
					}

					digit = basicToDigit(input.charCodeAt(index++));

					if (digit >= base || digit > floor((maxInt - i) / w)) {
						error('overflow');
					}

					i += digit * w;
					t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

					if (digit < t) {
						break;
					}

					baseMinusT = base - t;
					if (w > floor(maxInt / baseMinusT)) {
						error('overflow');
					}

					w *= baseMinusT;
				}

				out = output.length + 1;
				bias = adapt(i - oldi, out, oldi == 0);

				// `i` was supposed to wrap around from `out` to `0`,
				// incrementing `n` each time, so we'll fix that now:
				if (floor(i / out) > maxInt - n) {
					error('overflow');
				}

				n += floor(i / out);
				i %= out;

				// Insert `n` at position `i` of the output
				output.splice(i++, 0, n);
			}

			return ucs2encode(output);
		}

		/**
	  * Converts a string of Unicode symbols (e.g. a domain name label) to a
	  * Punycode string of ASCII-only symbols.
	  * @memberOf punycode
	  * @param {String} input The string of Unicode symbols.
	  * @returns {String} The resulting Punycode string of ASCII-only symbols.
	  */
		function encode(input) {
			var n,
			    delta,
			    handledCPCount,
			    basicLength,
			    bias,
			    j,
			    m,
			    q,
			    k,
			    t,
			    currentValue,
			    output = [],

			/** `inputLength` will hold the number of code points in `input`. */
			inputLength,

			/** Cached calculation results */
			handledCPCountPlusOne,
			    baseMinusT,
			    qMinusT;

			// Convert the input in UCS-2 to Unicode
			input = ucs2decode(input);

			// Cache the length
			inputLength = input.length;

			// Initialize the state
			n = initialN;
			delta = 0;
			bias = initialBias;

			// Handle the basic code points
			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue < 0x80) {
					output.push(stringFromCharCode(currentValue));
				}
			}

			handledCPCount = basicLength = output.length;

			// `handledCPCount` is the number of code points that have been handled;
			// `basicLength` is the number of basic code points.

			// Finish the basic string - if it is not empty - with a delimiter
			if (basicLength) {
				output.push(delimiter);
			}

			// Main encoding loop:
			while (handledCPCount < inputLength) {

				// All non-basic code points < n have been handled already. Find the next
				// larger one:
				for (m = maxInt, j = 0; j < inputLength; ++j) {
					currentValue = input[j];
					if (currentValue >= n && currentValue < m) {
						m = currentValue;
					}
				}

				// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
				// but guard against overflow
				handledCPCountPlusOne = handledCPCount + 1;
				if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
					error('overflow');
				}

				delta += (m - n) * handledCPCountPlusOne;
				n = m;

				for (j = 0; j < inputLength; ++j) {
					currentValue = input[j];

					if (currentValue < n && ++delta > maxInt) {
						error('overflow');
					}

					if (currentValue == n) {
						// Represent delta as a generalized variable-length integer
						for (q = delta, k = base;; /* no condition */k += base) {
							t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
							if (q < t) {
								break;
							}
							qMinusT = q - t;
							baseMinusT = base - t;
							output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
							q = floor(qMinusT / baseMinusT);
						}

						output.push(stringFromCharCode(digitToBasic(q, 0)));
						bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
						delta = 0;
						++handledCPCount;
					}
				}

				++delta;
				++n;
			}
			return output.join('');
		}

		/**
	  * Converts a Punycode string representing a domain name or an email address
	  * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	  * it doesn't matter if you call it on a string that has already been
	  * converted to Unicode.
	  * @memberOf punycode
	  * @param {String} input The Punycoded domain name or email address to
	  * convert to Unicode.
	  * @returns {String} The Unicode representation of the given Punycode
	  * string.
	  */
		function toUnicode(input) {
			return mapDomain(input, function (string) {
				return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
			});
		}

		/**
	  * Converts a Unicode string representing a domain name or an email address to
	  * Punycode. Only the non-ASCII parts of the domain name will be converted,
	  * i.e. it doesn't matter if you call it with a domain that's already in
	  * ASCII.
	  * @memberOf punycode
	  * @param {String} input The domain name or email address to convert, as a
	  * Unicode string.
	  * @returns {String} The Punycode representation of the given domain name or
	  * email address.
	  */
		function toASCII(input) {
			return mapDomain(input, function (string) {
				return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
			});
		}

		/*--------------------------------------------------------------------------*/

		/** Define the public API */
		punycode = {
			/**
	   * A string representing the current Punycode.js version number.
	   * @memberOf punycode
	   * @type String
	   */
			'version': '1.3.2',
			/**
	   * An object of methods to convert from JavaScript's internal character
	   * representation (UCS-2) to Unicode code points, and back.
	   * @see <https://mathiasbynens.be/notes/javascript-encoding>
	   * @memberOf punycode
	   * @type Object
	   */
			'ucs2': {
				'decode': ucs2decode,
				'encode': ucs2encode
			},
			'decode': decode,
			'encode': encode,
			'toASCII': toASCII,
			'toUnicode': toUnicode
		};

		/** Expose `punycode` */
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (true) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
				return punycode;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (freeExports && freeModule) {
			if (module.exports == freeExports) {
				// in Node.js, io.js, or RingoJS v0.8.0+
				freeModule.exports = punycode;
			} else {
				// in Narwhal or RingoJS v0.7.0-
				for (key in punycode) {
					punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
				}
			}
		} else {
			// in Rhino or a web browser
			root.punycode = punycode;
		}
	})(this);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(112)(module), (function() { return this; }())))

/***/ },
/* 112 */
/***/ function(module, exports) {

	module.exports = function (module) {
		if (!module.webpackPolyfill) {
			module.deprecate = function () {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	};

/***/ },
/* 113 */
/***/ function(module, exports) {

	// markdown-it default options

	'use strict';

	module.exports = {
	  options: {
	    html: false, // Enable HTML tags in source
	    xhtmlOut: false, // Use '/' to close single tags (<br />)
	    breaks: false, // Convert '\n' in paragraphs into <br>
	    langPrefix: 'language-', // CSS language prefix for fenced blocks
	    linkify: false, // autoconvert URL-like texts to links

	    // Enable some language-neutral replacements + quotes beautification
	    typographer: false,

	    // Double + single quotes replacement pairs, when typographer enabled,
	    // and smartquotes on. Could be either a String or an Array.
	    //
	    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
	    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
	    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

	    // Highlighter function. Should return escaped HTML,
	    // or '' if the source string is not changed and should be escaped externaly.
	    // If result starts with <pre... internal wrapper is skipped.
	    //
	    // function (/*str, lang*/) { return ''; }
	    //
	    highlight: null,

	    maxNesting: 20 // Internal protection, recursion limit
	  },

	  components: {

	    core: {},
	    block: {},
	    inline: {}
	  }
	};

/***/ },
/* 114 */
/***/ function(module, exports) {

	// "Zero" preset, with nothing enabled. Useful for manual configuring of simple
	// modes. For example, to parse bold/italic only.

	'use strict';

	module.exports = {
	  options: {
	    html: false, // Enable HTML tags in source
	    xhtmlOut: false, // Use '/' to close single tags (<br />)
	    breaks: false, // Convert '\n' in paragraphs into <br>
	    langPrefix: 'language-', // CSS language prefix for fenced blocks
	    linkify: false, // autoconvert URL-like texts to links

	    // Enable some language-neutral replacements + quotes beautification
	    typographer: false,

	    // Double + single quotes replacement pairs, when typographer enabled,
	    // and smartquotes on. Could be either a String or an Array.
	    //
	    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
	    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
	    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

	    // Highlighter function. Should return escaped HTML,
	    // or '' if the source string is not changed and should be escaped externaly.
	    // If result starts with <pre... internal wrapper is skipped.
	    //
	    // function (/*str, lang*/) { return ''; }
	    //
	    highlight: null,

	    maxNesting: 20 // Internal protection, recursion limit
	  },

	  components: {

	    core: {
	      rules: ['normalize', 'block', 'inline']
	    },

	    block: {
	      rules: ['paragraph']
	    },

	    inline: {
	      rules: ['text'],
	      rules2: ['balance_pairs', 'text_collapse']
	    }
	  }
	};

/***/ },
/* 115 */
/***/ function(module, exports) {

	// Commonmark default options

	'use strict';

	module.exports = {
	  options: {
	    html: true, // Enable HTML tags in source
	    xhtmlOut: true, // Use '/' to close single tags (<br />)
	    breaks: false, // Convert '\n' in paragraphs into <br>
	    langPrefix: 'language-', // CSS language prefix for fenced blocks
	    linkify: false, // autoconvert URL-like texts to links

	    // Enable some language-neutral replacements + quotes beautification
	    typographer: false,

	    // Double + single quotes replacement pairs, when typographer enabled,
	    // and smartquotes on. Could be either a String or an Array.
	    //
	    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
	    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
	    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

	    // Highlighter function. Should return escaped HTML,
	    // or '' if the source string is not changed and should be escaped externaly.
	    // If result starts with <pre... internal wrapper is skipped.
	    //
	    // function (/*str, lang*/) { return ''; }
	    //
	    highlight: null,

	    maxNesting: 20 // Internal protection, recursion limit
	  },

	  components: {

	    core: {
	      rules: ['normalize', 'block', 'inline']
	    },

	    block: {
	      rules: ['blockquote', 'code', 'fence', 'heading', 'hr', 'html_block', 'lheading', 'list', 'reference', 'paragraph']
	    },

	    inline: {
	      rules: ['autolink', 'backticks', 'emphasis', 'entity', 'escape', 'html_inline', 'image', 'link', 'newline', 'text'],
	      rules2: ['balance_pairs', 'emphasis', 'text_collapse']
	    }
	  }
	};

/***/ },
/* 116 */
/***/ function(module, exports) {

	//endsWith Polyfill
	if (!String.prototype.endsWith) {
	  String.prototype.endsWith = function (searchString, position) {
	    var subjectString = this.toString();
	    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
	      position = subjectString.length;
	    }
	    position -= searchString.length;
	    var lastIndex = subjectString.indexOf(searchString, position);
	    return lastIndex !== -1 && lastIndex === position;
	  };
	}

	var origin = window.location.origin;
	var loc = decodeURI(window.location.href);

	var page = loc.split("/");
	page = page[page.length - 1].split("?")[0];
	page = page || "index";

	var root = loc;
	if (loc[loc.length - 1] != "/") {
	  if (loc.endsWith("/wiki/" + page)) {
	    root = loc.replace("/wiki/" + page, "/");
	  } else {
	    root = loc.replace("/" + page, "/");
	  }
	  root = root.split("?")[0];
	}

	var git = root.split("/");
	git_user = git[2].split(".")[0];
	git_repo = git[3];
	git_repo_url = "https://github.com/" + git_user + "/" + git_repo + "/";
	git_clone_url = "https://github.com/" + git_user + "/" + git_repo + ".git";

	//var wiki = loc.split("/");
	//wiki = wiki[wiki.length-3];

	var markup_page = page;
	var markup_loc = root + "wiki/markup/" + markup_page + ".md";

	window.nouwiki.origin = {
	  markup_loc: markup_loc,
	  page: page,
	  root: root
	};

/***/ }
/******/ ]);