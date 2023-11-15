var gmjs = gmjs || {};

gmjs.init = function(dToken, debug, mapsFW){

  //Init logger
  gmjs.logger.init(debug);
  gmjs.logger.log('App|GM WebApp v2 started');

  // Init global config
  gmjs.isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
  gmjs.storage  = Storages.localStorage
  gmjs.mapsFW   = mapsFW;

  if(dToken === undefined){
    gmjs.logger.log('App|No device token available');
  }else{  
    // gmjs.logger.log('App|Checking device token...');
    if (gmjs.storage.isEmpty('_gmjs_dt')){
      // gmjs.logger.log('App|Setting device token for the first time at local storage');
      gmjs.storage.set('_gmjs_dt', dToken);
      // s.setItem undefined
    }else{
      var currDToken = gmjs.storage.get('_gmjs_dt');
      if (currDToken != dToken){
        // gmjs.logger.log('App|Updating device token as its differs from local');
        gmjs.storage.set('_gmjs_dt', dToken);
        gmjs.webpush.subscribe();
      }else{
        // gmjs.logger.log('App|Device token is synched');
      }
    }
    //gmjs.webpush.subscribe();
  }

  gmjs.services.worker.register();

  // Init global lazy config
  window.lazySizesConfig = window.lazySizesConfig || {};
  window.lazySizesConfig.hFac = 0.4;

  // Init DayJS
  if (window.dayjs){
    window.dayjs.locale('es');
  }

  // Init maps
  if (gmjs.components && gmjs.components.maps){
    gmjs.components.maps.init(mapsFW);
  }
}

