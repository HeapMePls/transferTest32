var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.orderCheckout = {};
var users = null;
var user  = null;
var apto = false;

gmwa.controllers.orderCheckout.newLocation     = {};
gmwa.controllers.orderCheckout.scheduleType    = 0; // NOW
gmwa.controllers.orderCheckout.cartOpened      = false;
gmwa.controllers.orderCheckout.coverageChecked = false;
gmwa.controllers.orderCheckout.coverageData    = null;

gmwa.controllers.orderCheckout.init = function(){
  gmwa.logger.log('OrderCheckout|Init...');
  
  gmwa.controllers.orderCheckout.isMobile = gmwa.utils.isMobile();

  gmwa.components.header.init();

  if(window.preUser != null){
    users = window.preUser;
    if (users.length > 0){
      user = users[users.length-1];
      if (user.address !== undefined && user.address !== null && user.address.address.length > 0){
        user.selectedAddress = user.address;
        gmwa.controllers.orderCheckout.isFirstAddress = false;
      }else{
        user.selectedAddress = null;
        //gmwa.controllers.orderCheckout.isFirstAddress = true;
      }
    }else{
      gmwa.controllers.orderCheckout.isFirstAddress = true;
    }
  }

  if (!window.isOpened && window.outOfHours){
    gmwa.controllers.orderCheckout.scheduleType = 1; // SCHEDULE
  }
  

  $("#verModal").click(function(e){
    if (user === null || gmwa.controllers.orderCheckout.isFirstAddress){
      if (gmwa.controllers.orderCheckout.entrega == 1){
        $('#modalAddAddressGeo').show();
      }else{
        $('#modalAddAddressGeo').hide();
      }
      gmwa.controllers.orderCheckout.openAddLocation();
    }else{
      gmwa.controllers.orderCheckout.openLocationSelector();
    }
  });
  
  $('#lblSpInstr').click(function(e){
    $('#lblSpInstr').hide();
    $('#txtSpInstr').show(0,function(){
      $('#textArea').focus();
    });
  });

  $('#textArea').focusout(function(e){
    if($('#textArea').val().length === 0){
      $('#lblSpInstr').show();
      $('#txtSpInstr').hide(); 
    }
  });

  $('#cart-table-title').on('click', function(e){
    //if (Foundation.MediaQuery.current == 'small'){
    if (gmwa.controllers.orderCheckout.isMobile){
      if (gmwa.controllers.orderCheckout.cartOpened){
        $('#cart-table').hide();
      }else{
        $('#cart-table').show();
      }
      gmwa.controllers.orderCheckout.cartOpened = !gmwa.controllers.orderCheckout.cartOpened;
    }
  });
  
  var initialDTPDate = dayjs().add(3, 'd').toDate();
  var elementFDP = document.createElement("script");
  elementFDP.src = '/js/vendors/foundation-datepicker/foundation-datepicker.min.js';
  elementFDP.onload = function(){    
    $('#optPickDate').fdatepicker({language:'es',initialDate: initialDTPDate, startDate: initialDTPDate}).on('changeDate', function (ev) {
      var seldate = dayjs.utc(ev.date);
      seldate.add(ev.date.getTimezoneOffset(), 'minutes');
      $('#optPickDate').html('<div>'+seldate.format('dddd')+'</div><p>'+seldate.format('DD')+'</p><div>'+seldate.format('MMM').toUpperCase()+'</div>');
      $('.optionsDays div').removeClass('selected');
      $(this).addClass('selected');
      // Build grid, as it doesn't EXISTS!!!!
      //<option value="-1" > --- Elije una hora --- </option>
      //#opt-list-X-sel
      // BUILD TABLE HOUR OPTIONS
      var dow = seldate.format('e');
      var opHtml = gmwa.controllers.orderCheckout.buildHoursOptions(dow);
      $('#opt-list-X-sel').html(opHtml);

      if (gmwa.controllers.orderCheckout.previousScheduleTable === undefined){
        gmwa.controllers.orderCheckout.previousScheduleTable = $('#opt-list-1');
      }
      gmwa.controllers.orderCheckout.previousScheduleTable.hide();
      gmwa.controllers.orderCheckout.previousScheduleTable = $('#opt-list-X');
      gmwa.controllers.orderCheckout.previousScheduleTableSelect = gmwa.controllers.orderCheckout.previousScheduleTable.find('select');
      gmwa.controllers.orderCheckout.previousScheduleTable.show();
      if (gmwa.controllers.orderCheckout.scheduleValue === undefined){
        gmwa.controllers.orderCheckout.scheduleValue = {}
      }
      gmwa.controllers.orderCheckout.scheduleValue.date = seldate.format('YYYY/MM/DD');
      gmwa.controllers.orderCheckout.scheduleValue.hour = "-1";
      gmwa.controllers.orderCheckout.previousScheduleTableSelect.val($("#opt-list-X select option:first").val());
      //$('#optPickDate').fdatepicker('hide');
    });
  };
  document.body.appendChild(elementFDP);


  // Push Notifications
  // Check webpush supported
  gmwa.services.worker.onInitializeState(function(state){
    gmwa.logger.log('onInitializeState | ' + JSON.stringify(state));
    if (!state.isPushSupported){
      $('#qrNotifyMeCntr').hide();
    }else{
      if (state.isPushEnabled){
        gmwa.logger.log('Push ON');
        $('#qrNotifyMe').prop('checked', true);
        if (gmwa.isSafari){
          $('#qrNotifyMe').prop('disabled', true);
        }
      }else{
        if (gmwa.isSafari){
          $('#qrNotifyMe').prop('disabled', false);
        }
      }
    }
  });
  $('#qrNotifyMe').click(function(e){
    $('#qrNotifyMe').prop('disabled', true);
    e.preventDefault();
    if( ! $(this).is(':checked') ){
      // Unsubcribe
      // TODO: ask confirmation
      gmwa.webpush.unsubscribe(function(res){
        if (res === 0){
          // Subscription OK
          $('#qrNotifyMe').prop('checked', false);
        }else if (res == -1){
          gmwa.logger.error('Unubscribe returned ' + res);
        }
        $('#qrNotifyMe').prop('disabled', false);
      });
    }else{
      // Subscribe
      gmwa.webpush.subscribe(function(res){
        if (res === 0){
          // Subscription OK
          $('#qrNotifyMe').prop('checked', true);
        }else if (res == -1){
          // TODO: Show message 
          $('#qrNotifyMeError1').show();
          $('#qrNotifyMe').prop('checked', false);
        }else if (res == -2){
          // TODO: Show message 
          $('#qrNotifyMeError2').show();
          $('#qrNotifyMe').prop('checked', false);
        };
        $('#qrNotifyMe').prop('disabled', false);
      });
    }
  })

  gmwa.controllers.orderCheckout.drawUserData();

  gmwa.controllers.orderCheckout.checkoutOptions();

  gmwa.controllers.orderCheckout.hookSchedule();

  gmwa.controllers.orderCheckout.checkDeliveryCoverage();

}

gmwa.controllers.orderCheckout.drawUserData = function(){
  var userDataContent = '';
  var userDataButton  = '';
  if (user === null){
    if (gmwa.controllers.orderCheckout.entrega == 1){ // delivery
      userDataContent = "<div>Por favor ingresa tus datos y tu ubicación para poder solicitar la entrega</div>";
      $('#datosUsuarioMap').html('<i class="fa fa-map-marker" aria-hidden="true" style="position: absolute;left: 30px;top: 20px;font-size: 50px;color: #DDD;"></i>');
    }else{ // Pickup
      userDataContent = "<div>Por favor ingresa tus datos para identificarte al momento de levantar el pedido</div>";
      $('#datosUsuarioMap').html('<i class="fa fa-shopping-bag" aria-hidden="true" style="position: absolute;left: 30px;top: 20px;font-size: 50px;color: #DDD;"></i>');
    }
    userDataButton = "Agregar mis datos";
  }else{
    if (gmwa.controllers.orderCheckout.entrega == 1){ // delivery
      if (user.selectedAddress !== null){
        userDataContent  = '<div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;color: grey;">' + user.name + '</div>';
        userDataContent += "<div style='color: grey; display: inline;'>Tel: " + user.phone + "</div>";
        userDataContent += '<div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;color: grey;">' + user.selectedAddress.address + '</div>';
        userDataButton = "Cambiar";
        // DEPRECATED
        // if (user.selectedAddress.lat !== undefined && user.selectedAddress.lat && gmwa.controllers.orderCheckout.entrega == 1){
        //   $('#datosUsuarioMap').html('<img width="80" src="https://maps.googleapis.com/maps/api/staticmap?center='+user.selectedAddress.lat+','+user.selectedAddress.lng+'&zoom=16&scale=1&size=80x90&maptype=roadmap&format=png&markers='+user.selectedAddress.lat+','+user.selectedAddress.lng+'&key=AIzaSyDc92QvHR0Y851sudPN0KtQ-9Vq2YrYs7s">');
        //   $('#datosUsuarioMap').show();
        // }else{
        //   $('#datosUsuarioMap').hide();
        // }
      }else{ 
        userDataContent = "Para solicitar entrega a domicilio necesitamos los datos de tu dirección.";
        userDataButton = "Ingresar mi dirección";
        $('#datosUsuarioMap').hide();
      }
    }else{
      userDataContent  = '<div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;color: grey;">' + user.name + '</div>';
      userDataContent += "<div style='color: grey; display: inline;'>Tel: " + user.phone + "</div>";
      userDataButton = "Cambiar";
      $('#datosUsuarioMap').html('<i class="fa fa-shopping-bag" aria-hidden="true" style="position: absolute;left: 30px;top: 20px;font-size: 50px;color: #DDD;"></i>');
    }
  }
  $("#datosUsuario").html(userDataContent);
  $('#verModal').html(userDataButton);

}

gmwa.controllers.orderCheckout.openLocationSelector = function(){

  if (gmwa.controllers.orderCheckout.modalSelectAddress !== undefined){
    gmwa.controllers.orderCheckout.modalSelectAddress.foundation('open');
    return;  
  }
  gmwa.controllers.orderCheckout.modalSelectAddress = $('#modalSelectAddress');
  gmwa.controllers.orderCheckout.modalSelectAddress.foundation('open');


  $(".u-address-card").click(gmwa.controllers.orderCheckout.selectAddressCard);
}

gmwa.controllers.orderCheckout.selectAddressCard = function(e){
  gmwa.controllers.orderCheckout.selectAddress($(this).attr("data-index"));
}

gmwa.controllers.orderCheckout.selectAddress = function(index){
  user = users[index];
  user.selectedAddress = user.address;
  
  if (gmwa.controllers.orderCheckout.modalSelectAddress){
    gmwa.controllers.orderCheckout.modalSelectAddress.foundation('close');
  }
  gmwa.controllers.orderCheckout.drawUserData();
  
  gmwa.controllers.orderCheckout.checkDeliveryCoverage();
}

gmwa.controllers.orderCheckout.checkDeliveryCoverage = function(){
  // Calculate delivery coverage and cost
  if (gmwa.controllers.orderCheckout.entrega == 1){ // delivery
    $('#infoDelCost').html('Verificando cobertura...');
    $('#infoDelCost').show();
    var GET = document.location.href.split('/');
    var idr = GET[GET.length - 3];
    var ids = GET[GET.length - 2];
    if (user === null || user.selectedAddress === undefined || user.selectedAddress === null){
      $('#infoDelCost').addClass('alert');
      $('#infoDelCost').removeClass('success');
      $('#infoDelCost').html('<div>Para poder solicitar entrega a domicilio, por favor ingrese sus datos y su dirección. Recuerde confirmar el punto en el mapa para asgurar que la entrega llegue a destino sin problemas.</div>');
      return;
    }
    if( user.selectedAddress.lat === undefined || user.selectedAddress.lat === null){
      $('#infoDelCost').addClass('alert');
      $('#infoDelCost').removeClass('success');
      $('#infoDelCost').html('<div>No se puede verificar su ubicación (1). Por favor vuelva a ingresar su dirección y confirma el punto en el mapa.</div>');
      return;
    }
    $.ajax({
      url      : '/pedidos/checkDeliveryCoverageZone/'+idr+'/'+ids+'/'+user.selectedAddress.lat+'/'+user.selectedAddress.lng,
      contentType:"application/json; charset=utf-8"
    }).done(function(resData){
      if (resData.meta.status == 200){
        gmwa.logger.log('CoverageCheck | API returned OK. DATA= ' + JSON.stringify(resData));
        gmwa.controllers.orderCheckout.coverageChecked = true;
        gmwa.controllers.orderCheckout.coverageData = resData.data;
        if (resData.data.isInside){
          if (resData.data.amount === 0){
            $('#infoDelCost').html('<div>Te encuentras dentro del area de cobertura. El envío es gratis.</div>');
            gmwa.controllers.orderCheckout.updateCartTotal(0);
          }else{
            $('#infoDelCost').html('<div>Te encuentras dentro del area de cobertura. El costo de envío es $' + resData.data.amount + '</div>');
            gmwa.controllers.orderCheckout.updateCartTotal(resData.data.amount);
          }
          $('#infoDelCost').addClass('success');
          $('#infoDelCost').removeClass('alert');
        }else{
          $('#infoDelCost').addClass('alert');
          $('#infoDelCost').removeClass('success');
          $('#infoDelCost').html('<div>Lamentablemente te encuentras fuera del area de cobertura para entrega.</div>')
          gmwa.controllers.orderCheckout.updateCartTotal(0);
        }
      }else{
        gmwa.logger.error('CoverageCheck | API returned error: ' + JSON.stringify(resData));
        $('#infoDelCost').addClass('alert');
        $('#infoDelCost').removeClass('success');
        $('#infoDelCost').html('<div>Ocurrio un error verificando su ubicación (2). Por favor vuelva a ingresar su dirección y confirma el punto en el mapa.</div>');
        gmwa.controllers.orderCheckout.updateCartTotal(0);
      }
    }).fail(function(err){
      gmwa.logger.error('CoverageCheck | API returned error: ' + JSON.stringify(err));
      $('#infoDelCost').addClass('alert');
      $('#infoDelCost').removeClass('success');
      $('#infoDelCost div').html('<div>Ocurrio un error verificando su ubicación (3). Por favor vuelva a ingresar su dirección y confirma el punto en el mapa.</div>');
      gmwa.controllers.orderCheckout.updateCartTotal(0);
    });
  }else{
    $('#infoDelCost').hide();
    gmwa.controllers.orderCheckout.updateCartTotal(0);    
  }
}

gmwa.controllers.orderCheckout.updateCartTotal = function(amount){
  $('#cartDeliveryCost').html(gmwa.utils.formatNumberHTML(amount));
  var currentTotal = $('#cartTotalAmount').data('amount');
  $('#cartTotalAmount').html(gmwa.utils.formatNumberHTML(currentTotal + amount));
  $('#headerCartTotal').html(gmwa.utils.formatNumberHTML(currentTotal + amount));
  $('#cartTotalAmount').fadeTo('slow', 0.1).fadeTo('slow', 1.0);
  $('#headerCartTotal').fadeTo('slow', 0.1).fadeTo('slow', 1.0);
};

gmwa.controllers.orderCheckout.openAddLocation = function(){
  if (gmwa.controllers.orderCheckout.modalAddAddress !== undefined){
    gmwa.controllers.orderCheckout.modalAddAddress.foundation('open');
    return;  
  }
  gmwa.controllers.orderCheckout.modalAddAddress = $('#modalAddAddress');
  gmwa.controllers.orderCheckout.modalAddAddress.foundation('open');

  $("#datoAdd").click(function(e){
    // if (user == null){
      var user = {};
    // }
    user.name = $("#txtNombre").val();
    user.phone = $("#txtTelefono").val();
    user.email = $("#txtEMail").val();
    var aux ={};
    var calle = $("#txtCalle").val();
    var nro = $('#txtNro').val();
    var ciudad = $('#txtCity').val();
    var apto = $('#txtApto').val();
    if (apto && apto.length > 0){
      aux.address = calle + ' ' + nro + ' apto ' + apto; 
    }else{
      aux.address = calle + ' ' + nro; 
    }
    if (ciudad && ciudad.length > 0){
      aux.address += ', ' + ciudad;
    }
    aux.coords = gmwa.controllers.orderCheckout.newLocation;

    var errMsg = '';
    if (user.name === undefined || user.name === null || user.name.length === 0){
      errMsg = "Nombre es requerido";
    }
    if (user.phone === undefined || user.phone === null || user.phone.length === 0){
      if (errMsg.length > 0) errMsg += '<br>';
      errMsg += "Telefono es requerido";
    }
    if (gmwa.controllers.orderCheckout.entrega == 1){
      if (calle === undefined || calle === null || calle.length === 0){
        if (errMsg.length > 0) errMsg += '<br>';
        errMsg += "Calle es requerida";
      }
      if (nro === undefined || nro === null || nro.length === 0){
        if (errMsg.length > 0) errMsg += '<br>';
        errMsg += "Numero de puerta es requerido";
      }
      if (ciudad === undefined || ciudad === null || ciudad.length === 0){
        if (errMsg.length > 0) errMsg += '<br>';
        errMsg += "Ciudad es requerida";
      }
      if (aux.coords === undefined || aux.coords.lat === undefined || aux.coords.lat.length === 0){
        if (errMsg.length > 0) errMsg += '<br>';
        errMsg += "Por favor confirma el punto en el mapa para garantizar estar dentro de la zona de cobertura para entregas. Completa el formulario y haz clic en 'Buscar dirección'";
      }
    }

    if (errMsg.length > 0 ){
      $('#formError').html(errMsg);
      $('#formError').show();
    }else{
      user.selectedAddress = {
        address: aux.address,
        lat    : aux.coords.lat,
        lng    : aux.coords.lng 
      };
      user.address = user.selectedAddress;

      var alreadyAddedNew = false;
      var newIndex = null;
      if ($('#newAddrAdded').length > 0){
        alreadyAddedNew = true;
        newIndex = ($('#addrCntr').children().length-1);
      }else{
        newIndex = ($('#addrCntr').children().length);
      }
      var newCard = '<div id="newAddrAdded" class="large-6 medium-6 small-12 columns" data-index="' + newIndex + '">' +
                '<div class="u-address-card" ' +
                '" data-name="' + user.name + '" data-phone="' + user.phone + '" data-address="' + aux.address + 
                '" data-lat="' + aux.coords.lat + '" data-lng="' + aux.coords.lng + '" >';
      newCard += '<p>' + user.name + '</p>';
      newCard += '<p><strong>' + aux.address + '</strong></p>';
      newCard += '<p>Tel: ' + user.phone + '</p></div></div>';
      if (alreadyAddedNew){
        // Already added, must update
        users[users.length-1] = user;
        $('#newAddrAdded').replaceWith($(newCard));
      }else{
        // Its new, append it
        if (users === undefined || users === null){
          users = [];
        }
        users.push(user);
        $('#addrCntr').append($(newCard));
      }
      $("#newAddrAdded").click(gmwa.controllers.orderCheckout.selectAddressCard);

      gmwa.controllers.orderCheckout.selectAddress(newIndex);

      gmwa.controllers.orderCheckout.modalAddAddress.foundation('close');
      gmwa.controllers.orderCheckout.drawUserData();
      gmwa.controllers.orderCheckout.checkDeliveryCoverage();
    }
  });

  $("#searchAddr").click(function(e){
    $(this).prop( "disabled", true );
    
    var adr = $('#txtCalle').val();
    var num = $('#txtNro').val();
    var city = $('#txtCity').val();
    $('#searchAddrInfo').html('Buscando...');
    gmwa.controllers.orderCheckout.buscarCoordenadas(adr, num, city, function(coords){
      $(this).prop( "disabled", false );
      if (coords == null){
        $('#searchAddrInfo').html('<div style="color: #F44336;">No se pudo ubicar la direccion, por favor ingresela de otra manera e intente nuevamente</div>');
      }else{
        gmwa.controllers.orderCheckout.newLocation.lat = coords.lat;
        gmwa.controllers.orderCheckout.newLocation.lng = coords.lng;
        //gmwa.controllers.orderCheckout.initializeGoogleMap(coords.lat, coords.lng);
        gmwa.controllers.orderCheckout.initializeLMap(coords.lat, coords.lng);
        $.ajax({
          url      : '/pedido/zoneinfo/'+coords.lat+'/'+coords.lng,
          contentType:"application/json; charset=utf-8"
        }).done(function(zonData){
          if (zonData.found){
            gmwa.controllers.orderCheckout.newLocation.zone = zonData;
          }else{
            gmwa.controllers.orderCheckout.newLocation.zone = null;
          }
          $('#searchAddrInfo').html('<div style="color: #4CAF50;">Ubicacion encontrada. Arrastre el pin en el mapa para ajustarlo de ser necesario</div>');
          $('#datoAdd').prop('disabled', false);
          gmwa.logger.info(zonData);
        }).fail(function(err){
          $('#datoAdd').prop('disabled', false);
          gmwa.logger.error('Could not get zone info: ' + JSON.stringify(err));
        });

        
      }
    });
  });
};

gmwa.controllers.orderCheckout.checkoutOptions = function(token, idr, ids){
  var sdp = $('#deliveryMethod').data('sdp');
  var sdd = $('#deliveryMethod').data('sdd');
  if (sdp && sdd){
    gmwa.controllers.orderCheckout.entrega = 2; //pick up as default
  }else if (!sdp && sdd){
    gmwa.controllers.orderCheckout.entrega = 1; //only delivery
  }else if (sdp && !sdd){
    gmwa.controllers.orderCheckout.entrega = 2; //only pick up
  }
  var pago = 1; //efectivo
  var terminos = false;

  $("#ingresarDatos").click(function(e){
    //$("#formulario").css("display", "flex");
    //$("#opcionesDatos").css("display", "none");
    //$("#opciones").css("display", "block");
    //$("#ingresarDatos").css("display", "none");
    if (gmwa.controllers.orderCheckout.entrega == 1){
      $('#modalAddAddressGeo').show();
    }else{
      $('#modalAddAddressGeo').hide();
    }
    gmwa.controllers.orderCheckout.openAddLocation();
  });

  $("#opciones").click(function(e){
    $("#formulario").css("display", "none");
    $("#opcionesDatos").css("display", "flex");
    //$("#opciones").css("display", "none");
    //$("#ingresarDatos").css("display", "block");
  });

  $('#ingresarDatosCancel').click(function(e){
    gmwa.controllers.orderCheckout.modalSelectAddress.foundation('close');
  });
  
  $('#btnDeliveryMethod button').click(function(e){
    $(this).siblings().removeClass('is-active');
    $(this).addClass('is-active');
    if($(this).attr('data-id') == '1'){
      gmwa.controllers.orderCheckout.entrega = 1; //delivery
      $('#deliveryMethodText-1').show();
      $('#deliveryMethodText-2').hide();
    }else{
      gmwa.controllers.orderCheckout.entrega = 2; //pick up
      $('#deliveryMethodText-2').show();
      $('#deliveryMethodText-1').hide();
    }
    gmwa.controllers.orderCheckout.checkDeliveryCoverage();
    gmwa.controllers.orderCheckout.drawUserData();
  });

  $('#btnScheduleType button').click(function(e){
    $(this).siblings().removeClass('is-active');
    $(this).addClass('is-active');
    if($(this).attr('data-id') == '1'){
      gmwa.controllers.orderCheckout.scheduleType = 1;
      $('#schedOptions').show();
    }else{
      gmwa.controllers.orderCheckout.scheduleType = 0;
      $('#schedOptions').hide();
    }
  });


  $('.tipoPago').click(function(e){
    if($(this).attr('data-id') == '1'){
      pago = 1; //efectivo
    }
    else{
      pago = 2; //tarjeta
    }
  });
  
  $("#disclaimer").change(function(){
    terminos = $(this).prop('checked');
  });

  $('#checkoutConfirm').click(function(){
    gmwa.controllers.orderCheckout.checkoutConfirm(pago, token, idr, ids);
  });

  $('#checkoutCancel').click(function(){
    
  });

}

gmwa.controllers.orderCheckout.checkoutConfirm = function(pago, token, idr, ids){
  // Check if we can checkout
  if (!window.isOpened && !window.outOfHours){
    gmwa.utils.showError('No es posible pedir en este momento', 'Vuelve cuando estemos abiertos y confirma tu pedido. Puedes retomarlo en la seccion de Pedidos del menu principal.');
    return;
  }
  var GET = document.location.href.split('/');
  var total = $('#totalPrice').html();
  var aux = {};
  aux.token = GET[GET.length - 1];
  aux.idr = GET[GET.length - 3];
  aux.ids = GET[GET.length - 2];
  aux.shipping = gmwa.controllers.orderCheckout.entrega;
  aux.description = $('#textArea').val();
  // Check schedule
  if (gmwa.controllers.orderCheckout.scheduleType === 0){
    aux.scheduleType = 0;
    aux.scheduleValue = '';
  }else{
    aux.scheduleType = 1;
    if (gmwa.controllers.orderCheckout.scheduleValue !== undefined){
      aux.scheduleValue = {
        date: gmwa.controllers.orderCheckout.scheduleValue.date,
        hour: gmwa.controllers.orderCheckout.scheduleValue.hour
      }
    }else{
      aux.scheduleValue = {}
    }
  }
  aux.paymentMethod = pago;
  // Prepare user data
  aux.user = {
    email   : user.email,
    name    : user.name,
    phone   : user.phone,
    address : user.selectedAddress
  };
  if (gmwa.controllers.orderCheckout.newLocation.zone !== undefined && gmwa.controllers.orderCheckout.newLocation.zone !== null){
    aux.user.zone = gmwa.controllers.orderCheckout.newLocation.zone.zon;
  }
  // Validate checkout data
  var errs = gmwa.controllers.orderCheckout.validateCheckout(aux);
  if (errs.length > 0){
    var msg = "<ul>";
    errs.forEach(function(err) {
      msg += "<li>" + err + "</li>";
    });
    msg += "</ul>"
    $('#errormsg').html(msg);
    $('#errormsgCntr').show();
    return;
  }else{
    $('#errormsgCntr').hide();
  }

  var isValid = true;
  $('#cart-table tr[id*="line-id"]').each(function () {
    if(isValid){
      var weekMap = $(this).data('open-days');
      if (weekMap != '') {
        if (aux.scheduleType == 0) {
          var checkoutDay = new Date().getDay();
        } else {
          var checkoutDay = new Date(aux.scheduleValue.date).getDay();
        }
        isValid = gmwa.controllers.orderCheckout.validateOpenDays(weekMap, checkoutDay);
      }
    } 
  });

  if (isValid) {
    // Prepare data to send
    var data = JSON.stringify(aux);    
    var url = '/pedido/checkout';

    gmwa.utils.showProgress('Enviando pedido', 'Espere por favor...', true, true);
    $.ajax({
      type     : "POST",
      url      : url,
      data     : data,
      dataType : 'json',
      contentType:"application/json; charset=utf-8"
    }).done(function(resData){
      if (resData.meta.status == 200){
        gmwa.logger.log('Order Add Product | API returned OK: ' + JSON.stringify(resData));
        gmwa.logger.log(data);
        document.location.href = '/pedidos/pedido/' + aux.token; 
      }else{
        gmwa.logger.error('Order Add Product | API returned error: ' + JSON.stringify(resData));
        gmwa.utils.hideProgress();
        gmwa.utils.showError('No se pudo enviar el pedido', 'Ocurrio un problema al enviar el pedido, por favor inténtelo más tarde.');
      }
    }).fail(function(err){
      gmwa.utils.hideProgress();
      gmwa.utils.showError('No se pudo enviar el pedido', 'Ocurrio un problema al enviar el pedido, por favor inténtelo más tarde.');
      gmwa.logger.error('Order Add Product | API returned error: ' + JSON.stringify(err));
    });
  } else {
    gmwa.utils.showError('Pedido invalido', 'Uno o mas de los productos no pueden venderse en el día seleccionado');
    gmwa.logger.error('Order Add Product | Invalid day to buy product(s)');
  }
}

// Validation of product days of selling
gmwa.controllers.orderCheckout.validateOpenDays = function (macroFlag, checkoutDay) {
  const MAP_DAY_0 = 64; // 01000000 (Domingo)
  const MAP_DAY_1 = 32; // 00100000 (Lunes)
  const MAP_DAY_2 = 16; // 00010000 (Martes)
  const MAP_DAY_3 = 8; // 1000 (Miercoles)
  const MAP_DAY_4 = 4; // 0100 (Jueves)
  const MAP_DAY_5 = 2; // 0010 (Viernes)
  const MAP_DAY_6 = 1; // 0001 (Sabado)

  var arrDays = []
  if ((macroFlag & MAP_DAY_0) == MAP_DAY_0){
    arrDays.push(0);
  }
  if ((macroFlag & MAP_DAY_1) == MAP_DAY_1){
    arrDays.push(1);
  }
  if ((macroFlag & MAP_DAY_2) == MAP_DAY_2){
    arrDays.push(2);
  }
  if ((macroFlag & MAP_DAY_3) == MAP_DAY_3){
    arrDays.push(3);
  }
  if ((macroFlag & MAP_DAY_4) == MAP_DAY_4){
    arrDays.push(4);
  }
  if ((macroFlag & MAP_DAY_5) == MAP_DAY_5){
    arrDays.push(5);
  }
  if ((macroFlag & MAP_DAY_6) == MAP_DAY_6){
    arrDays.push(6);
  }

  return (arrDays.includes(checkoutDay) ? true : false);
};

gmwa.controllers.orderCheckout.validateCheckout = function(aux){
  var msgs = [];
  if (aux.shipping != 1 && aux.shipping != 2){
    msgs.push('Selecciona un metodo de entrega');
  }
  if (gmwa.controllers.orderCheckout.scheduleType !== 0){
    if (aux.scheduleValue === undefined){
      if (aux.shipping === 1){
        msgs.push('Selecciona un dia y una hora para la entrega de tu pedido');
      }else{
        msgs.push('Selecciona un dia y una hora para levantar tu pedido.');
      }
    }else{
      if (aux.scheduleValue.date === undefined || aux.scheduleValue.date.length === 0 || aux.scheduleValue.hour === undefined || aux.scheduleValue.hour.length === 0 || aux.scheduleValue.hour == -1){
        if (aux.shipping === 1){
          msgs.push('Selecciona un dia y una hora para la entrega de tu pedido');
        }else{
          msgs.push('Selecciona un dia y una hora para levantar tu pedido.');
        }
      }
    }
  }
  if ((aux.user.name === undefined || aux.user.name === null || aux.user.name.length === 0) && aux.shipping == 2){
    msgs.push('Por favor ingresa un nombre para poder identificarte al momento de levantar tu pedido');
  }
  if (aux.user.phone !== undefined && aux.user.phone !== null && aux.user.phone.length > 0){
    if (aux.user.phone.length < 8 ){
      msgs.push('Por favor ingresa un numero de télefono válido');
    }
  }
  if (aux.user.address === undefined && aux.shipping == 1){
    msgs.push('Por favor ingresa una dirección donde enviar el pedido');
  }
  if (aux.shipping == 1){
    if (aux.user.address.address === undefined || aux.user.address.address.length === 0 || aux.user.address.lat === undefined || aux.user.address.lat.length === 0){
      msgs.push('Por favor ingresa una dirección valida y especifica el punto en el mapa para facilitar la entrega');
    }else{
      if (gmwa.controllers.orderCheckout.coverageData === undefined){
        msgs.push('Por favor ingresa una direccion valida y especifica el punto en el mapa para facilitar la entrega');
      }else{
        if (!gmwa.controllers.orderCheckout.coverageData.isInside){
          msgs.push('La direccion de entrega se encuentra fuera de nuestra zona de cobertura.');
        }
      }
    }
  }

  return msgs;
};

gmwa.controllers.orderCheckout.hookSchedule = function() {
  $('.optionsDays').on('click', function(e){
    gmwa.controllers.orderCheckout.scheduleType = 1; // SCHEDULED AT DATE AND TIME
    if (gmwa.controllers.orderCheckout.previousScheduleTable === undefined){
      gmwa.controllers.orderCheckout.previousScheduleTable = $('#opt-list-1');
    }
    gmwa.controllers.orderCheckout.previousScheduleTable.hide();
    var id = $(this).data('id');
    gmwa.controllers.orderCheckout.previousScheduleTable = $('#opt-list-' + id);
    gmwa.controllers.orderCheckout.previousScheduleTableSelect = gmwa.controllers.orderCheckout.previousScheduleTable.find('select');
    gmwa.controllers.orderCheckout.previousScheduleTable.show();
    $('.optionsDays div').removeClass('selected');
    $('#optPickDate').removeClass('selected');
    $(this).children('div').addClass('selected');

    if (gmwa.controllers.orderCheckout.scheduleValue === undefined){
      gmwa.controllers.orderCheckout.scheduleValue = {}
    }
    gmwa.controllers.orderCheckout.scheduleValue.date = $(this).data('date');
    gmwa.controllers.orderCheckout.scheduleValue.hour = "-1";
    gmwa.controllers.orderCheckout.previousScheduleTableSelect.val($("#opt-list-" + id  + " select option:first").val());
  });

  $('.optionsHours').on('change', function(e){
    if (gmwa.controllers.orderCheckout.scheduleValue !== undefined){
      //gmwa.controllers.orderCheckout.scheduleValue.hour = $(this).find('option:selected').text();
      gmwa.controllers.orderCheckout.scheduleValue.hour = gmwa.controllers.orderCheckout.previousScheduleTableSelect.val();
      // $('.optionsHours div').removeClass('selected');
      // $(this).children('div').addClass('selected');
      gmwa.logger.log(JSON.stringify(gmwa.controllers.orderCheckout.scheduleValue));
    }
  });
};

gmwa.controllers.orderCheckout.buildHoursOptions = function(day){
  var todayHours  = window.optionsTable[day];
  var outHtml     = '';
  var hourStart   = null;
  var hourEnd     = null;
  var opCount     = null;
  var opDate      = null;
  var mDate       = dayjs();
  var currentHour = parseInt(mDate.hour());
  var option      = null;

  if (todayHours.isOpen){
    // Build options
    for(var i=0; i < todayHours.hours.length;i++){
      hourStart = todayHours.hours[i].start;
      //Protect hours after midnight
      if (todayHours.hours[i].end < hourStart){
          hourEnd = 2400;
      }else{
          hourEnd = todayHours.hours[i].end;
      }
      opCount = ((hourEnd - hourStart) / 50) / 2;
      opDate  = dayjs();
      opDate.hour(parseInt(hourStart/100));
      opDate.minute(parseInt(hourStart%100));
      for(var opIndex=0; opIndex < opCount; opIndex++){
        // if (todayHours.isToday){
        //   if (opDate.hour() <= currentHour){
        //     opDate.add(60, 'm');
        //     continue;
        //   }
        // }
        // First half
        option   = {}
        option.start = opDate.format('HH:mm');
        opDate.add(30, 'm');
        option.end   = opDate.format('HH:mm');
        outHtml += '<option value="' + option.start + ' - ' + option.end + '" >' + option.start + ' - ' + option.end + '</option>';
        // Second half
        option   = {}
        option.start = opDate.format('HH:mm');
        opDate.add(30, 'm');
        option.end   = opDate.format('HH:mm');
        outHtml += '<option value="' + option.start + ' - ' + option.end + '" >' + option.start + ' - ' + option.end + '</option>';
      }
    }
  }else{
    outHtml = '<option value="-1" > CERRADO </option>';
  }
  return outHtml;
}



//MAPA
gmwa.controllers.orderCheckout.removePunctuation = function (str){
    return str.replace(/[á]/g, 'a').replace(/[é]/g, 'e').replace(/[ó]/g, 'o').replace(/[í]/g, 'i').replace(/[ú]/g, 'u');
}

gmwa.controllers.orderCheckout.matchNames = function(nameA, nameB){
      var spNameA = nameA.split(' ');
      var spNameB = nameB.split(' ');
     // var qtyNameA = spNameA.length;
      var qtyNameB = spNameB.length;
      var qtyMatch = 0;
      for (var i=0; i < spNameA.length; i++){
        for (var j=0; j < spNameB.length; j++){
          var nameAPunctuationless = gmwa.controllers.orderCheckout.removePunctuation(spNameA[i].toLowerCase());
          var nameBPunctuationless = gmwa.controllers.orderCheckout.removePunctuation(spNameB[j].toLowerCase());
          if (nameAPunctuationless == nameBPunctuationless){
            qtyMatch += 1;
          }
        }
      }
      var comapreIdx = qtyMatch / qtyNameB;
      gmwa.logger.info("Comparing A: [" + nameA + "] vs B: [" + nameB + " returned " + qtyMatch + " over" + qtyNameB + " (" + comapreIdx + ")");
      if (comapreIdx >= 0.5){
        return true;
      }
      else{
        return false;
      }
}

gmwa.controllers.orderCheckout.buscarCoordenadas = function(adr, num, city, cb){
    var error = '';
    var geoCodingWarning = '';
    var country = "Uruguay";

    if (adr != undefined && city != undefined){
      //var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + adr + ' ' + num + ',' +  city + ',' +  country;
      var url = "/pedido/gc/" + adr + ' ' + num + ',' +  city + ',' +  country;
      $.ajax(url).done(function(response){
        if( response.status = "OK" && response.results.length > 0){
          var details = response.data;
          //response.data.results[0].address_components
          //response.data.results[0].formatted_address
          var streetMatch = false;
          var stateMatch = false;
          var adminAreaMatch = false;
          var countryMatch = false;

          for(var i =0; i < response.results[0].address_components.length; i++){
              switch (response.results[0].address_components[i]['types'][0]){
                  case 'route':
                  if(gmwa.controllers.orderCheckout.matchNames(response.results[0].address_components[i]['long_name'], adr)){
                      streetMatch = true;
                  }
                  break;
                  case 'locality':
                  if(gmwa.controllers.orderCheckout.matchNames(response.results[0].address_components[i]['long_name'], city)){
                      stateMatch = true;
                  }
                  break;
                  case 'administrative_area_level_1':
                  if(gmwa.controllers.orderCheckout.matchNames(response.results[0].address_components[i]['long_name'], city)){
                      adminAreaMatch = true;
                  }
                  break;
                  case 'country':
                  if(gmwa.controllers.orderCheckout.matchNames(response.results[0].address_components[i]['long_name'], country)){
                      countryMatch = true;
                  }
                  break;
              }
          }

          if (streetMatch && (stateMatch || adminAreaMatch ) && countryMatch){
            // lat = response.results[0].geometry.location.lat;
            // lng = response.results[0].geometry.location.lng;
            // gmwa.controllers.orderCheckout.initializeGoogleMap(lat, lng);
            cb(response.results[0].geometry.location);
          }else{
            cb(null);
          }
        }
      });
    }else{
      cb(null);
    }
}

gmwa.controllers.orderCheckout.initializeGoogleMap = function(lat, lng) {
  var mapElement = $('#mapa');
  if (mapElement.length == 0) return;

  // var lat      = -34.913791;
  // var lng      = -56.168247;
  var izoom    = 17;
  //var isMobile = mapElement.data('im');

  if (lat != '' && lng != '') {
    if (lat != 0 && lng != 0 && izoom != 0) {
      var latlng = new google.maps.LatLng(lat, lng);
      /*if (isMobile) {
        var myOptions = {
          zoom: izoom,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          draggable: false,
          scrollwheel: false,
          panControl: true,
          zoomControl: true,
          scaleControl: true,
          overviewMapControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
          },
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
          }
        };
      } else {*/
        var myOptions = {
          zoom: izoom,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          draggable: true,
          scrollwheel: true,
          panControl: true,
          zoomControl: true,
          scaleControl: true,
          overviewMapControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
          },
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
          }
        };
      //}
      var map = new google.maps.Map(mapElement[0], myOptions);
      var marker = new google.maps.Marker({position: latlng, map: map, draggable:true});
      marker.addListener('dragend', function(e){
        gmwa.controllers.orderCheckout.newLocation.lat = e.latLng.lat();
        gmwa.controllers.orderCheckout.newLocation.lng = e.latLng.lng();
      });
      
      setTimeout(function(){
        gmwa.logger.log('resize!');
        //google.maps.event.trigger(map,'resize',{});
        //window.dispatchEvent(new Event('resize'));
      }, 1000);

      //gmwa.controllers.orderMenu.addProductModal.foundation();
    }
  }
};

gmwa.controllers.orderCheckout.initializeLMap = function(lat, lng){
  if (gmwa.controllers.orderCheckout.map == null){
    var mapElement = $('#mapa');
    var izoom    = 16;
    //var isMobile = mapElement.data('im');
    var isMobile = gmwa.controllers.orderCheckout.isMobile;
  
    if (lat != '' && lng != '') {
      if (lat != 0 && lng != 0 && izoom != 0) {
        gmwa.logger.log('Initializing LMaps...');
        
        //gmwa.controllers.orderCheckout.map = gmwa.components.maps.instance.initMap('mapa', lat, lng, izoom, isMobile);
        gmwa.components.maps.instance.initMapAsync('mapa', lat, lng, izoom, isMobile, function(map){
          gmwa.controllers.orderCheckout.map = map;

          gmwa.controllers.orderCheckout.marker = gmwa.components.maps.instance.addMarkerDraggable(gmwa.controllers.orderCheckout.map, lat, lng);
          gmwa.controllers.orderCheckout.marker.on('dragend', function(event){
            var marker = event.target;
            var position = marker.getLatLng();

            gmwa.controllers.orderCheckout.newLocation.lat = position.lat;
            gmwa.controllers.orderCheckout.newLocation.lng = position.lng;

            gmwa.controllers.orderCheckout.map.panTo(new L.LatLng(position.lat, position.lng));
          });
        });
        
      }
    }
  }
}
