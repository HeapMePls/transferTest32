var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.requestsList = {};

gmwa.controllers.requestsList.init = function(){
  gmwa.components.header.init();
  $('#mi-reqs').addClass('u-tb-item-selected');

  gmwa.controllers.requestsList.initQuoteHandlers();

  // Hook list items
  $('.u-req-bottom-btns-link').click(function(e){
    e.preventDefault();
    gmwa.controllers.requestsList.token = $(this).data('token');
    var sql = '/components/pedidos/presupuesto/' + $(this).data('token');
    $.ajax(sql).done(function(resp){
      // Load content
      $('#qvm .u-reveal-body').html(resp);
      // Hook modal's buttons
      $('.btnAccept').each(function(e){
        $(this).click(gmwa.controllers.requestsList.quoteAcceptClick);
      });
      $("#qrevForm").submit(gmwa.controllers.requestsList.quoteSendReviewClick);
      // Hook review form
      $('#qrevpriceval').change(function(){
        if (!this.checked){
          $('#trpricevalwrong').show();
          $('#trwrongpriceexpensive').show();
        }else{
          $('#trpricevalwrong').hide();
          $('#trwrongpriceexpensive').hide();
        }
      });
      $('#qrevworkval').change(function(){
        if (!this.checked){
          $('#trwrongworkbad').show();
          $('#trwrongworkslow').show();
          $('#trwrongworksloppy').show();
        }else{
          $('#trwrongworkbad').hide();
          $('#trwrongworkslow').hide();
          $('#trwrongworksloppy').hide();
        }
      });
      // All ready, show now
      gmwa.controllers.requestsList.orderViewModal.foundation('open');
    });
  });

};

gmwa.controllers.requestsList.initQuoteHandlers = function(){
  // Add quoteView and confirmation modal
  $('body').append($('<div class="tiny reveal u-reveal" id="cqvm" data-reveal data-animation-in="fade-in" data-animation-out="fade-out" data-close-on-click="false" data-close-on-esc="false"><div class="u-reveal-body"></div><div class="u-reveal-footer"><button id="cqvmAccept" type="button" class="success button">Aceptar</button><button id="cqvmClose" type="button" class="alert button gmbutton">Cancelar</button></div></div>'));
  gmwa.controllers.requestsList.confirmModal = $('#cqvm');
  gmwa.controllers.requestsList.confirmModal.foundation();
  $('body').append($('<div class="reveal u-reveal" id="qvm" data-reveal data-animation-in="fade-in" data-animation-out="fade-out"><div class="u-reveal-body"></div><div class="u-reveal-footer"><button id="qvmClose" type="button" class="button gmbutton">Cerrar</button></div></div>'));
  gmwa.controllers.requestsList.orderViewModal = $('#qvm');
  gmwa.controllers.requestsList.orderViewModal.foundation();
  $('body').append($('<div class="small reveal u-reveal" id="fcqvm" data-reveal data-animation-in="fade-in" data-animation-out="fade-out" data-close-on-click="false" data-close-on-esc="false"><div class="u-reveal-body"></div><div class="u-reveal-footer"><button id="fcqvmClose" type="button" class="button gmbutton">Aceptar</button></div></div>'));
  gmwa.controllers.requestsList.finalModal = $('#fcqvm');
  gmwa.controllers.requestsList.finalModal.foundation();

  // Hook buttons
  $('#qvmClose').click(function(e){
    gmwa.controllers.requestsList.orderViewModal.foundation('close');
  });
};

gmwa.controllers.requestsList.quoteAcceptClick = function(e){
  gmwa.controllers.requestsList.retailerName = $(this).data('name');
  gmwa.controllers.requestsList.respId       = $(this).data('id');

  // Build confirmation
  var confirmBody = '<div style="width: 100%;text-align: center;padding: 20px 0px;"><i class="fa fa-handshake-o" aria-hidden="true" style="font-size: 50px;color: #FFC107;"></i></div><div style="text-align: center;font-size: 16px;line-height: 19px;font-weight: 600;">Confirma que acepta el presupuesto enviado por ' + 
                    gmwa.controllers.requestsList.retailerName + '?</div><div style="font-size: 80%;line-height: 110%;text-align: center;padding: 20px 10px;color: #777;"><i class="fa fa-info-circle" aria-hidden="true"></i> Una vez aceptado el presupuesto, le enviaremos una notificacion a ' + 
                    gmwa.controllers.requestsList.retailerName + ' quien se pondra en contacto con usted para afinar los detalles necesarios.</div>';
  $('#cqvm .u-reveal-body').html(confirmBody);
  // Hook click
  $('#cqvmClose').click(gmwa.controllers.requestsList.quoteAcceptConfirmCancelClick);
  $('#cqvmAccept').click(gmwa.controllers.requestsList.quoteAcceptConfirmOKClick);
  gmwa.controllers.requestsList.confirmModal.foundation('open');
};

gmwa.controllers.requestsList.quoteAcceptConfirmCancelClick = function(e){
  gmwa.controllers.requestsList.confirmModal.foundation('close');
  //gmwa.controllers.requestsList.orderViewModal.foundation('open');
}

gmwa.controllers.requestsList.quoteAcceptConfirmOKClick = function(e){
  gmwa.controllers.requestsList.confirmModal.foundation('close');
  gmwa.utils.showProgress("Enviando confirmación", "Por favor espere...", true, false);
  
  var sql = '/components/presupuesto/ac/' + gmwa.controllers.requestsList.token + '/' + gmwa.controllers.requestsList.respId;
  $.ajax(sql).done(function(resp){
    // Load content
    gmwa.utils.hideProgress();
    $('#fcqvm .u-reveal-body').html(resp);
    $('#fcqvmClose').click(function(e){
      gmwa.controllers.requestsList.finalModal.foundation('close');
      document.location.href = '/pedidos';
    });
    gmwa.controllers.requestsList.finalModal.foundation('open');
  }).fail(function(err){
    gmwa.utils.hideProgress();
    gmwa.utils.showError('No se pudo enviar la confirmación', 'Ocurrio un problema al enviar la confirmación, por favor inténtelo más tarde.');
    gmwa.logger.error('DoQuoteAccept | API returned error: ' + JSON.stringify(err));
  });

};

gmwa.controllers.requestsList.quoteSendReviewClick = function(e){
  e.preventDefault();

  var reqData = {
    token               : $('#qrevToken').val(),
    text                : $('#qrevDesc').val(),
    workVal             : ( $('#qrevworkval').is(":checked") ? 1 : 0),
    priceVal            : ( $('#qrevpriceval').is(":checked") ? 1 : 0),
    wrongWorkBad        : ( $('#qrevwrongworkbad').is(":checked") ? 1 : 0),
    wrongWorkSlow       : ( $('#qrevwrongworkslow').is(":checked") ? 1 : 0),
    wrongWorkSloppy     : ( $('#qrevwrongworksloppy').is(":checked") ? 1 : 0),
    wrongPriceExpensive : ( $('#qrevwrongpriceexpensive').is(":checked") ? 1 : 0),
  };

  gmwa.utils.showProgress("Enviando reseña", "Por favor espere...", true, false);

  var url = '/presupuesto/review';
  $.ajax({ 
    type        : "POST",
    url         : url,
    data        : JSON.stringify(reqData),
    contentType :"application/json"
  }).done(function(resp){
    gmwa.utils.hideProgress();
    // Create modal
    if (gmwa.controllers.requestsList.reviewDoneModal === undefined){
      $('body').append($('<div class="tiny reveal u-reveal" id="cqrd" data-reveal data-animation-in="fade-in" data-animation-out="fade-out" data-close-on-click="false" data-close-on-esc="false"><div class="u-reveal-body"></div><div class="u-reveal-footer"><button id="cqrdClose" type="button" class="alert button">Cerrar</button></div></div>'));
      gmwa.controllers.requestsList.reviewDoneModal = $('#cqrd');
      gmwa.controllers.requestsList.reviewDoneModal.foundation();
    }
    // Load content
    $('#cqrd .u-reveal-body').html(resp);
    $('#cqrdClose').click(function(e){
      gmwa.controllers.requestsList.reviewDoneModal.foundation('close');
      document.location.href = '/pedidos';
    });
    gmwa.controllers.requestsList.reviewDoneModal.foundation('open');
  }).fail(function(err){
    gmwa.utils.hideProgress();
    gmwa.utils.showError('No se pudo enviar la reseña', 'Ocurrio un problema al enviar la reseña, por favor inténtelo más tarde.');
    gmwa.logger.error('DoQuoteReview | API returned error: ' + JSON.stringify(err));
  });
};