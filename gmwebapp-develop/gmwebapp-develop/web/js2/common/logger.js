var gmjs = gmjs || {};
gmjs.logger = {};

//
// Application logger
// ------------------
//
gmjs.logger.init = function (debug){
  gmjs.logger.debug = debug;

  if(debug){
    gmjs.logger.log   = console.log.bind(window.console);
    gmjs.logger.info  = console.info.bind(window.console);
    gmjs.logger.warn  = console.warn.bind(window.console);
    gmjs.logger.error = console.error.bind(window.console);
  }else{
    gmjs.logger.log   = function(){};
    gmjs.logger.info  = function(){};
    gmjs.logger.warn  = function(){};
    gmjs.logger.error = function(){};
  }
};

