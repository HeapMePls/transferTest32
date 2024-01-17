var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.home = {};

gmwa.controllers.home.init = function(){
  gmwa.logger.log('Home|Init...');
  var isMobile = gmwa.utils.isMobile();
  $('#mi-home').addClass('u-tb-item-selected');
  //gmwa.controllers.home.lazy = $('.lazy').Lazy({effect: 'fadeIn', effectTime: 1000, chainable: false});
  
  $('#bPushRegister').click(function(e){
    gmwa.webpush.subscribe();
  });
  $('#bPushUnregister').click(function(e){
    gmwa.webpush.unsubscribe();
  });
  gmwa.components.header.init();

  // if (Foundation.MediaQuery.current == 'small'){
  //   var swiperCovers = new Swiper("#covers", {
  //     slidesPerView            : 1,
  //     paginationClickable      : true,
  //     preventClicksPropagation : false,
  //     preventClicks            : false,
  //     autoplay                 : 3000,
  //     loop                     : true,
  //     preloadImages            : false, 
  //     lazy                     : true
  //   });
  // }else{
  //   var swiperCovers = new Swiper("#covers", {
  //     slidesPerView            : 1,
  //     paginationClickable      : true,
  //     preventClicksPropagation : false,
  //     preventClicks            : false,
  //     navigation: {
  //       nextEl: '#sCovNext',
  //       prevEl: '#sCovPrev'
  //     },
  //     pagination               : '#sCovPag',
  //     autoplay                 : 3000,
  //     loop                     : true
  //   });
  // }
  // swiperCovers.on('slideChange', function () {
  //   gmwa.controllers.home.lazy.update();
  // });

  // $("div[id^='sw-col']").each(function(){
  //   var elemId = $(this).attr('id');
  //   if (isMobile){
  //     //gmwa.logger.log('HOME|Initializing swiper(M) for #' + elemId + ' width next-' + elemId + '...');
  //     var swiper = new Swiper("#"+elemId, {
  //       slidesPerView: 'auto',
  //       paginationClickable: false,
  //       navigation: {
  //         nextEl: '#next-'+elemId,
  //         prevEl: '#prev-'+elemId
  //       },
  //       spaceBetween: 10
  //     });
  //     swiper.on('slideChangeTransitionEnd', function(){
  //       if (this.activeIndex > 0){
  //         $('#bck-'+elemId).fadeTo(300, 0.2);
  //       }else{
  //         $('#bck-'+elemId).fadeTo(300, 1);
  //       }
  //       //gmwa.controllers.home.lazy.update();
  //     });
  //   }else{
  //     //gmwa.logger.log('HOME|Initializing swiper(D) for #' + elemId + ' width next-' + elemId + '...');
  //     var swiper = new Swiper("#"+elemId, {
  //       slidesPerView: 'auto',
  //       paginationClickable: false,
  //       navigation: {
  //         nextEl: '#next-'+elemId,
  //         prevEl: '#prev-'+elemId
  //       },
  //       spaceBetween: 10
  //     });
  //     swiper.on('slideChangeTransitionEnd', function(){
  //       if (this.activeIndex > 0){
  //         $('#bck-'+elemId).fadeTo(300, 0.2);
  //       }else{
  //         $('#bck-'+elemId).fadeTo(300, 1);
  //       }
  //       //gmwa.controllers.home.lazy.update();
  //     });
  //   }
  // });

  // if (isMobile){
  //   var swiper = new Swiper("#sw-nearprms", {
  //     slidesPerView: 1.2,
  //     paginationClickable: false,
  //     navigation: {
  //       nextEl: '#next-sw-nearprms',
  //       prevEl: '#prev-sw-nearprms'
  //     },
  //     spaceBetween   : 10,
  //     preloadImages  : false, 
  //     lazy           : true
  //   });
  // }else{
  //   var swiper = new Swiper("#sw-nearprms", {
  //     slidesPerView: 3.2,
  //     paginationClickable: false,
  //     navigation: {
  //       nextEl: '#next-sw-nearprms',
  //       prevEl: '#prev-sw-nearprms'
  //     },
  //     spaceBetween   : 10,
  //     preloadImages  : false, 
  //     lazy           : true
  //   });
  // }
  // swiper.on('slideChange', function () {
  //   gmwa.controllers.home.lazy.update();
  // });
}
