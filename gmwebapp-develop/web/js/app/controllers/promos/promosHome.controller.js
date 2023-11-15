var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.promosHome = {};

gmwa.controllers.promosHome.init = function(){

  $('#mi-prms').addClass('u-tb-item-selected');
  gmwa.components.header.init();

  $("div[id^='prm-categ-']").each(function(){
    var elemId = $(this).data('id');
    var slidesPerView = 3.4;
    if (gmwa.utils.isMobile()){
      slidesPerView = 1.2;
    }
    //gmwa.logger.log('PROMOHOME|Initializing swiper for #' + elemId + ' width next-' + elemId + '...');
    var swiper = new Swiper("#prm-categ-"+elemId, {
      slidesPerView: slidesPerView,
      paginationClickable: false,
      navigation: {
        nextEl: '#next-categ-prm-'+elemId,
        prevEl: '#prev-categ-prm-'+elemId
      },
      spaceBetween: 10
    });
  });

};