var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.quoteView = {};

gmwa.controllers.quoteView.init = function(){
  gmwa.components.header.init();
  $('#mi-reqs').addClass('u-tb-item-selected');

  gmwa.controllers.requestsList.token = $('#req-info').data('token');
  //
  // Hook buttons using requestList shared methods
  //
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

  gmwa.controllers.quoteView.initQuoteHandlers();
}

gmwa.controllers.quoteView.initQuoteHandlers = function(){
  // Add quoteView and confirmation modal
  $('body').append($('<div class="tiny reveal u-reveal" id="cqvm" data-reveal data-animation-in="fade-in" data-animation-out="fade-out" data-close-on-click="false" data-close-on-esc="false"><div class="u-reveal-body"></div><div class="u-reveal-footer"><button id="cqvmAccept" type="button" class="success button">Aceptar</button><button id="cqvmClose" type="button" class="alert button">Cancelar</button></div></div>'));
  gmwa.controllers.requestsList.confirmModal = $('#cqvm');
  gmwa.controllers.requestsList.confirmModal.foundation();
  $('body').append($('<div class="small reveal u-reveal" id="fcqvm" data-reveal data-animation-in="fade-in" data-animation-out="fade-out" data-close-on-click="false" data-close-on-esc="false"><div class="u-reveal-body"></div><div class="u-reveal-footer"><button id="fcqvmClose" type="button" class="button">Aceptar</button></div></div>'));
  gmwa.controllers.requestsList.finalModal = $('#fcqvm');
  gmwa.controllers.requestsList.finalModal.foundation();

  // Hook buttons
  $('#qvmClose').click(function(e){
    gmwa.controllers.requestsList.orderViewModal.foundation('close');
  });
};