var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.orderView = {};

var status            = null;
var dateAccepted      = null;
var estimatedTime     = null;
var promised          = null;
var scheduleType      = null;
var scheduleValueDate = null;
var scheduleValueHour = null;
var openedCart        = false;

gmwa.controllers.orderView.init = function(){
    $('#mi-reqs').addClass('u-tb-item-selected');
    gmwa.logger.log('OrderView|Init...');
    gmwa.components.header.init();
    
    dayjs.extend(window.dayjs_plugin_relativeTime);

    $('#orevprocessval').change(function(e){
        if (!this.checked){
            $('#trwrongprocessval').show();
            $('#trwrongprocesscomplex').show();
        }else{
            $('#trwrongprocessval').hide();
            $('#trwrongprocesscomplex').hide();
        }
    });
    
    $('#orevshippingval').change(function(e){
        if (!this.checked){
            $('#trwrongshippingsval').show();
            $('#trwrongshippingslow').show();
            $('#trwrongshippingbad').show();
        }else{
            $('#trwrongshippingsval').hide();
            $('#trwrongshippingslow').hide();
            $('#trwrongshippingbad').hide();
        }
    });
    
    $('#orevproductval').change(function(e){
        if (!this.checked){
            $('#trwrongproductval').show();
            $('#trwrongproductdiff').show();
        }else{
            $('#trwrongproductval').hide();
            $('#trwrongproductdiff').hide();
        }
    });
    $('#doSendReview').click(gmwa.controllers.orderView.sendReview);

    status = $("#dataStatus").attr("data-status");
    if(status == "ACEPTADO"){
        dateAccepted      = $("#dataFecha").attr("data-date");
        estimatedTime     = $("#dataFecha").attr("data-estimated");
        scheduleType      = $("#dataFecha").attr("data-scheduletype");
        scheduleValueDate = $("#dataFecha").attr("data-schedulevaluedate");
        scheduleValueHour = $("#dataFecha").attr("data-schedulevaluehour");
        
        if (scheduleType == 0){
            promised = dayjs(dateAccepted).add(estimatedTime, 'm');
        }else{
            promised = dayjs(scheduleValueDate);
            var spltHour  =  scheduleValueHour.replace(' ', '').split('-');
            var spltHour2 = spltHour[0].split(':');
            promised.hour(spltHour2[0]);
            promised.minute(spltHour2[1]);
            promised.second(0);
        }
        
        gmwa.controllers.orderView.reloj();
    }

    $('#cart-checkedout-title').click(function(){
        if (openedCart){
            $('#cart-checked-table').hide();
            $('#cart-checkedout-title > i').removeClass('fa-caret-left');
            $('#cart-checkedout-title > i').addClass('fa-caret-down');
        }else{
            $('#cart-checked-table').show();
            $('#cart-checkedout-title > i').removeClass('fa-caret-down');
            $('#cart-checkedout-title > i').addClass('fa-caret-left');
        }
        openedCart = !openedCart;
    });

    //gmwa.controllers.orderView.lazy = $('.lazy').Lazy({effect: 'fadeIn', effectTime: 1000, chainable: false});

}

gmwa.controllers.orderView.reloj = function(){
    var aux = dayjs().to(promised);
    if(dayjs() >= promised){
        var element = $('<div style="font-size: 17px;line-height: 20px;">El pedido ya deberia haberse entregado</div>');
        $("#minutes").html(element);
    }else{
        $("#minutes").html(aux);
    }
    setTimeout(function(){gmwa.controllers.orderView.reloj()}, 60000);

}

gmwa.controllers.orderView.sendReview = function (e) {
  e.preventDefault();

  var reqData = {
    token                 : $('#orevToken').val(),
    text                  : $('#orevDesc').val(),
    processVal            : ( $('#orevprocessval').is(":checked") ? 1 : 0),
    shippingVal           : ( $('#orevshippingval').is(":checked") ? 1 : 0),
    productVal            : ( $('#orevproductval').is(":checked") ? 1 : 0),
    wrongProcessComplex   : ( $('#orevwrongprocesscomplex').is(":checked") ? 1 : 0),
    wrongShippingSlow     : ( $('#qrevwrongshippingslow').is(":checked") ? 1 : 0),
    wrongShippingBad      : ( $('#orevwrongshippingbad').is(":checked") ? 1 : 0),
    wrongProductDiff      : ( $('#qrevwrongproductdiff').is(":checked") ? 1 : 0),
  };

  var data = JSON.stringify(reqData);    
  var url = '/pedido/review';
              
  $.ajax({
      type       : "POST",
      url        : url,
      data       : data,
      contentType:"application/json"
  }).done(function(resp){
      // Create modal
    if (gmwa.controllers.orderView.reviewDoneModal === undefined){
      $('body').append($('<div class="tiny reveal u-reveal" id="cord" data-reveal data-animation-in="fade-in" data-animation-out="fade-out" data-close-on-click="false" data-close-on-esc="false"><div class="u-reveal-body"></div><div class="u-reveal-footer"><button id="cordClose" type="button" class="alert button">Cerrar</button></div></div>'));
      gmwa.controllers.orderView.reviewDoneModal = $('#cord');
      gmwa.controllers.orderView.reviewDoneModal.foundation();
    }
    // Load content
    $('#cord .u-reveal-body').html(resp);
    $('#cordClose').click(function(e){
      gmwa.controllers.orderView.reviewDoneModal.foundation('close');
      document.location.href = '/pedidos';
    });
    gmwa.controllers.orderView.reviewDoneModal.foundation('open');
  }).fail(function(err){
      gmwa.logger.error('Order Review | API returned error: ' + JSON.stringify(err));
  });
}