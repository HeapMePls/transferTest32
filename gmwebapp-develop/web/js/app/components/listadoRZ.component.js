var gmwa = gmwa || {};
gmwa.components = gmwa.components || {};
gmwa.components.listadoRZ = {};

gmwa.components.listadoRZ.init = function(){
  gmwa.logger.log('ListadoRZ|Init...');
  $('.listado-rubro li, .listado-zona li').on('click', function () {
    $(this).parents('ul:first').find('li').removeClass('check');
    $(this).addClass('check');
  });

};