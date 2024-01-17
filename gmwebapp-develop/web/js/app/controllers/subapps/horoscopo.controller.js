var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.horoscopo = {};

gmwa.controllers.horoscopo.init = function(){
  $('#mi-horo').addClass('u-tb-item-selected');
  gmwa.components.header.init();
  
  $('a.btnHor').each(function(){
    $(this).click(function(e){
      var imgSrc = $(this).find('img').attr('src');
      var signName = $(this).find('.signo').text();
      
      $('#iconPrediction').attr('src', imgSrc); 
      $('#signName').text(signName); 

      $.ajax({
        url      : '/horoscopo/' + signName,
        //dataType : 'json',
        //contentType:"application/json; charset=utf-8"
      }).done(function(resData){
        $('#textPrediction').text(resData.pronostico);
        if (gmwa.controllers.horoscopo.modal === undefined){
          gmwa.controllers.horoscopo.modal = $('#modalPrediction');
        }
        gmwa.controllers.horoscopo.modal.foundation('open');
      }).fail(function(err){
        gmwa.logger.error('Could not get horoscopo for sign : ' + signName);
        gmwa.logger.error(err);
      });

    });
  });

  //$('.lazy').Lazy({effect: 'fadeIn'});
};