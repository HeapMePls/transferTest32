var gmwa = gmwa || {};

//https://github.com/GoogleChrome/samples/blob/gh-pages/push-messaging-and-notifications/main.js

gmwa.init = function(dToken, debug, mapsFW){

  //Init logger
  gmwa.logger.init(debug);
  gmwa.logger.log('App|GM WebApp started');

  // Init global config
  gmwa.isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
  gmwa.storage  = Storages.localStorage
  gmwa.mapsFW   = mapsFW;

  if(dToken === undefined){
    //gmwa.logger.log('App|No device token available');
  }else{  
    //gmwa.logger.log('App|Checking device token...');
    if (gmwa.storage.isEmpty('_gmwa_dt')){
      // gmwa.logger.log('App|Setting device token for the first time at local storage');
      gmwa.storage.set('_gmwa_dt', dToken);
      // s.setItem undefined
    }else{
      var currDToken = gmwa.storage.get('_gmwa_dt');
      if (currDToken != dToken){
        // gmwa.logger.log('App|Updating device token as its differs from local');
        gmwa.storage.set('_gmwa_dt', dToken);
        gmwa.webpush.subscribe();
      }else{
        // gmwa.logger.log('App|Device token is synched');
      }
    }
    //gmwa.webpush.subscribe();
  }

  //if (window.location.pathname.substr(0,7) == "/uberto"){
    // gmwa.logger.log('App|Registering service worker...');
    gmwa.services.worker.register();
    // gmwa.logger.log('App|Service worker registered');
  // }else{
  //   gmwa.logger.log('App|Service worker not available here');
  // }
  //if (location.protocol != 'https:'){
  //   gmwa.logger.log('App|Service worker not available here');
  // }else{
  //   gmwa.logger.log('App|Registering service worker...');
  //   gmwa.services.worker.register();
  //   gmwa.logger.log('App|Service worker registered');
  // }

  // Init global lazy config
  window.lazySizesConfig = window.lazySizesConfig || {};
  window.lazySizesConfig.hFac = 0.4;

  // Init DayJS
  if (window.dayjs){
    window.dayjs.locale('es');
  }

  // Init maps
  if (gmwa.components.maps){
    gmwa.components.maps.init(mapsFW);
  }
  
  // Init default view
  gmwa.initDefaults();

  // Init controller
  gmwa.router.init();

  // Init ads
  // gmwa.initAds();
}

gmwa.initDefaults = function(){
  //$('input, textarea').placeholder();
  $('.list-collapsible').on('click', function () {
    $(this).next('div:first').slideToggle('slow');
  });
}


// gmwa.initAds = function(){
//   gmwa.logger.log('App|initAds|Initializing ads...');
//   gmwa.utils.loadScript('//www5.smartadserver.com/config.js?nwid=1151', function(){
//     gmwa.logger.log('App|initAds|Config loaded.');
//     gmwa.utils.loadScript('//static.diarioelpais.com/scripts/15/sas.min.js', function(){
//       gmwa.logger.log('App|initAds|SAS loaded. Initializing module...');
//       sas.setup({ domain: '//www5.smartadserver.com', async: true, renderMode: 1, inSequence: true });
//       $('.adp').each(function(i,e){
//         e.append('<script type="text/javascript">epd_ads("' + $(e).data('sastag') + '");</script>');
//       });
//     });
//   });
// }
