var gmwa = gmwa || {};
gmwa.logger = {};

//
// Application logger
// ------------------
//
gmwa.logger.init = function (debug){
  gmwa.logger.debug = debug;

  if(debug){
    gmwa.logger.log   = console.log.bind(window.console);
    gmwa.logger.info  = console.info.bind(window.console);
    gmwa.logger.warn  = console.warn.bind(window.console);
    gmwa.logger.error = console.error.bind(window.console);
  }else{
    gmwa.logger.log   = function(){};
    gmwa.logger.info  = function(){};
    gmwa.logger.warn  = function(){};
    gmwa.logger.error = function(){};
  }
};

