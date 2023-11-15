var gmjs = gmjs || {};
gmjs.controllers = gmjs.controllers || {};
gmjs.controllers.home = {};
gmjs.controller = gmjs.controllers.home;

gmjs.controllers.home.init = function(){
  gmjs.logger.log('Home|Init...');
  
  // gmjs.components.header.init();
  gmjs.components.ac.init();

  gmjs.reveal.init();
}
