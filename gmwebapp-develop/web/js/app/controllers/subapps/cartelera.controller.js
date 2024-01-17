gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.cartelera = {};

gmwa.controllers.cartelera.init = function(){
  gmwa.logger.log('Cartelera|Init...');
  $('#mi-cart').addClass('u-tb-item-selected');
  //$('.lazy').Lazy({effect: 'fadeIn'});

  gmwa.components.header.init();
};