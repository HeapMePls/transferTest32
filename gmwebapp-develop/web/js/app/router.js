var gmwa = gmwa || {};
gmwa.router = {};

gmwa.router.sendPushSubscription = false;

gmwa.router.init = function(){
  if (window.location.pathname == "/"){
    gmwa.logger.log('Router|Resolved to home controller');
    gmwa.controllers.home.init();
  }else if (window.location.pathname.substr(0,6) == "/local"){
    gmwa.logger.log('Router|Resolved to comercio controller');
    gmwa.controllers.comercio.init();
  }else if (window.location.pathname.substr(0,9) == "/reservar"){
    gmwa.logger.log('Router|Resolved to reserve controller');
    gmwa.controllers.reserve.init();
  }else if (window.location.pathname.substr(0,6) == "/fotos"){
    gmwa.logger.log('Router|Resolved to gals controller');
    gmwa.controllers.gals.init();
  }else if (window.location.pathname.substr(0,7) == "/buscar" ||
            window.location.pathname.substr(0,6) == "/rubro" || 
            window.location.pathname.substr(0,11) == "/rubro-zona" || 
            window.location.pathname.substr(0,5) == "/zona"){
    gmwa.logger.log('Router|Resolved to resultList controller');
    gmwa.controllers.resultlist.init();
  }else if (window.location.pathname == "/promociones-y-ofertas"){
    gmwa.logger.log('Router|Resolved to promosHome controller');
    gmwa.controllers.promosHome.init();
  }else if (window.location.pathname.substr(0,22) == "/promociones-y-ofertas"){
    gmwa.logger.log('Router|Resolved to promosAll controller');
    gmwa.controllers.promosAll.init();
  }else if (window.location.pathname.substr(0,13) == "/promociones/"){
    gmwa.logger.log('Router|Resolved to promosSponsor controller');
    gmwa.controllers.promosSponsor.init();
  }else if (window.location.pathname.substr(0,11) == "/promocion/"){
    gmwa.logger.log('Router|Resolved to promosFicha controller');
    gmwa.controllers.promosFicha.init();
  }else if (window.location.pathname == "/pedidos"){
    gmwa.logger.log('Router|Resolved to requestsList controller');
    gmwa.controllers.requestsList.init();
  }else if (window.location.pathname.substr(0,7) == "/pedir/") {
    gmwa.logger.log('Router|Resolved to store controller');
    gmwa.router.sendPushSubscription = true;
    gmwa.controllers.store.init();
  }else if (window.location.pathname.substr(0,4) == "/pd/"){
    gmwa.logger.log('Router|Resolved to productOrderMenu controller');
    gmwa.router.sendPushSubscription = true;
    gmwa.controllers.productOrderMenu.init();
  // }else if (window.location.pathname.substr(0,7) == "/store/"){
  //   gmwa.logger.log('Router|Resolved to storeMenu controller');
  //   gmwa.router.sendPushSubscription = true;
  //   gmwa.controllers.storeMenu.init();
  }else if (window.location.pathname.substr(0,15) == "/presupuesto/v/"){
    gmwa.logger.log('Router|Resolved to quoteView controller');
    gmwa.controllers.quoteView.init();
  }else if (window.location.pathname.substr(0,13) == "/presupuesto/"){
    gmwa.logger.log('Router|Resolved to quoteRequest controller');
    gmwa.router.sendPushSubscription = true;
    gmwa.controllers.quoteRequest.init();
  }else if (window.location.pathname.substr(0,15) == "/pedidos/pedido"){
    gmwa.logger.log('Router|Resolved to orderView controller');
    gmwa.controllers.orderView.init();
  }else if (window.location.pathname.substr(0,16) == "/pedido/checkout"){
    gmwa.logger.log('Router|Resolved to orderCheckout controller');
    gmwa.router.sendPushSubscription = true;
    gmwa.controllers.orderCheckout.init();
  }else if (window.location.pathname.substr(0,10) == "/cartelera"){
    gmwa.logger.log('Router|Resolved to cartelera controller');
    gmwa.controllers.cartelera.init();
  }else if (window.location.pathname.substr(0,10) == "/horoscopo"){
    gmwa.logger.log('Router|Resolved to horoscopo controller');
    gmwa.controllers.horoscopo.init();
  }else if (window.location.pathname.substr(0,14) == "/reportarerror"){
    gmwa.logger.log('Router|Resolved to reportar error controller');
    gmwa.controllers.reportarError.init();
  }else if (window.location.pathname.substr(0,9) == "/contacto"){
    gmwa.logger.log('Router|Resolved to contacto controller');
    gmwa.controllers.contact.init();
  }else if (window.location.pathname.substr(0,5) == "/azar"){
    gmwa.logger.log('Router|Resolved to azar controller');
    gmwa.controllers.azar.init();
  }else if (window.location.pathname.substr(0,6) == "/login"){
      gmwa.logger.log('Router|Resolved to login controller');
      gmwa.controllers.login.init();
  }else if (window.location.pathname.substr(0,5) == "/favs"){
    gmwa.logger.log('Router|Resolved to favorites controller');
    gmwa.controllers.favorites.init();
  }else{
    gmwa.logger.log('Router|Resolved to default home controller');
    gmwa.controllers.home.init();
  }

};