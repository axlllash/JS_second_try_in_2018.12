/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 2,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true
*/
var uknow = (function() {
  'use strict';
  var initModule = function($container) {
    uknow.shell.initModule($container);
  };

  return { initModule: initModule };
}());