var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.quoteRequest = {};

gmwa.controllers.quoteRequest.videoDevices      = [];
gmwa.controllers.quoteRequest.videoDevicesIndex = 0;
gmwa.controllers.quoteRequest.stream            = undefined;
gmwa.controllers.quoteRequest.addStoresToggle   = false;

gmwa.controllers.quoteRequest.init = function(){
  gmwa.components.header.init();
  
  // Check webpush supported
  gmwa.services.worker.onInitializeState(function(state){
    gmwa.logger.log('onInitializeState | ' + JSON.stringify(state));
    if (!state.isPushSupported){
      $('#qrNotifyMeCntr').hide();
    }else{
      gmwa.controllers.quoteRequest.isPushEnabled = state.isPushEnabled;
      if (state.isPushEnabled){
        $('#qrNotifyMe i').removeClass('fa-bell-slash-o');
        $('#qrNotifyMe i').addClass('fa-bell-o');
        $('#qrNotifyMeDesc').html('<span style="color: #4CAF50;">Recibiras notificaciones en este dispositivo</span>');
        //if (gmwa.isSafari){
        //  $('#qrNotifyMe').prop('disabled', true);
        //}
      }else{
        $('#qrNotifyMe i').removeClass('fa-bell-o');
        $('#qrNotifyMe i').addClass('fa-bell-slash-o');
        $('#qrNotifyMeDesc').html('<span style="color: #FF9800;">No recibiras notificaciones</span>');
        //if (gmwa.isSafari){
        //  $('#qrNotifyMe').prop('disabled', false);
        //}
      }
    }
  });

  $('#qrNotifyMe').click(function(e){
    $('#qrNotifyMe').prop('disabled', true);
    e.preventDefault();
    //if( ! $(this).is(':checked') ){
    if (gmwa.controllers.quoteRequest.isPushEnabled){
      // Unsubcribe
      // TODO: ask confirmation
      gmwa.webpush.unsubscribe(function(res){
        if (res === 0){
          // Unubscription OK
          //$('#qrNotifyMe').prop('checked', false);
          $('#qrNotifyMe i').removeClass('fa-bell-o');
          $('#qrNotifyMe i').addClass('fa-bell-slash-o');
          gmwa.controllers.quoteRequest.isPushEnabled = false;
          $('#qrNotifyMeDesc').html('<span style="color: #FF9800;">No recibiras notificaciones</span>');
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
          //$('#qrNotifyMe').prop('checked', true);
          $('#qrNotifyMe i').removeClass('fa-bell-slash-o');
          $('#qrNotifyMe i').addClass('fa-bell-o');
          $('#qrNotifyMeDesc').html('<span style="color: #4CAF50;">Recibiras notificaciones en este dispositivo</span>');
          gmwa.controllers.quoteRequest.isPushEnabled = true;
        }else if (res == -1){
          // TODO: Show message 
          $('#qrNotifyMeError1').show();
          //$('#qrNotifyMe').prop('checked', false);
          $('#qrNotifyMe i').removeClass('fa-bell-o');
          $('#qrNotifyMe i').addClass('fa-bell-slash-o');
          gmwa.controllers.quoteRequest.isPushEnabled = false;
        }else if (res == -2){
          // TODO: Show message 
          $('#qrNotifyMeError2').show();
          //$('#qrNotifyMe').prop('checked', false);
          $('#qrNotifyMe i').removeClass('fa-bell-o');
          $('#qrNotifyMe i').addClass('fa-bell-slash-o');
          gmwa.controllers.quoteRequest.isPushEnabled = false;
        };
        $('#qrNotifyMe').prop('disabled', false);
      });
    }
  })

  $('#qrSubmit').click(function(e){
    e.preventDefault();
  

    gmwa.controllers.quoteRequest.addImagesToForm();

    var errMsg = gmwa.controllers.quoteRequest.validateForm();
    if (errMsg.length > 0){
      $('#errMsg').html(errMsg);
      $('#errMsg').show();
    }else{
      $('#errMsg').hide();
      gmwa.utils.showProgress('Enviando solicitud', 'Espere por favor...', true, true);
      grecaptcha.execute();
    }
  });

  // Create modals for quote accept
  gmwa.controllers.requestsList.initQuoteHandlers();
  // Hook quote accept button
  $('qBtnAccept').click(gmwa.controllers.requestsList.quoteAcceptClick);
  gmwa.controllers.requestsList.token = $('#req-info').data('token');


  $('input[name=qrScheduleType]').change(function(){
    var value = $( 'input[name=qrScheduleType]:checked' ).val();
    if (value == 4){
      $('#dpMonths').show();
    }else{
      $('#dpMonths').hide();
    }
  });

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

  // Init upload photo
  $('#photosAdd').click(function(e){
    $('#photoLoader').click();
  });
  $('#photoLoader').change(function(e) {
      var file = e.target.files[0],
      imageType = /image.*/;

      if (!file.type.match(imageType))
          return;

      var reader = new FileReader();
      reader.onload = function(e){
        var $img = $('<img>', { src: e.target.result });
        $img.load(function() {
            var canvas = gmwa.controllers.quoteRequest.buildCanvasElement(this.naturalWidth, this.naturalHeight);
            var context = canvas.element.getContext('2d');
            context.drawImage(this, 0, 0, this.naturalWidth,this.naturalHeight);
            $('#canvas-'+canvas.id+' > i').click(function(e){
              $(this).parent().remove();
              gmwa.controllers.quoteRequest.checkAddPhotoButton();
            })
            gmwa.controllers.quoteRequest.checkAddPhotoButton();
        });
      };
      reader.readAsDataURL(file);
  });
  // Handle check clear
  $('.u-option input').click(function(e){
    var radName = $(this).prop('name');
    if (gmwa.controllers.quoteRequest[radName] == undefined){
      gmwa.controllers.quoteRequest[radName] = $(this).prop('value');
    }else{
      if (gmwa.controllers.quoteRequest[radName] == $(this).prop('value')){
        $(this).prop('checked', false);
        gmwa.controllers.quoteRequest[radName] = undefined;
      }else{
        gmwa.controllers.quoteRequest[radName] = $(this).prop('value');
      }
    }
  });

  // Init images
  gmwa.controllers.quoteRequest.initTakePhoto();

  // Handle existing user data
  $('#changeUserLocation').on('click', function(e){
    e.preventDefault();
    $('#qrLocation').val('');
    $('#qrLocationCntrForm').show();
    $('#qrLocationCntrLabel').hide();
    $(this).hide();
  });
  $('#changeUserData').on('click', function(e){
    e.preventDefault();
    $('#qrUserName').val('');
    $('#qrUserEmail').val('');
    $('#qrUserTel').val('');
    $('#qrUserDataForm').show();
    $('#qrUserDataLabel').hide();
    $(this).hide();
  });

  // Toggle all additional stores
  $('#qrastoggle-all').on('click', function(e){
    $('#qras-cntr').find('input:checkbox').prop('checked', !gmwa.controllers.quoteRequest.addStoresToggle);
    gmwa.controllers.quoteRequest.addStoresToggle = !gmwa.controllers.quoteRequest.addStoresToggle;
    gmwa.controllers.quoteRequest.countAdditionalStores();
  });
  $('#qras-cntr').find('input:checkbox').on('click', function(e){
    gmwa.controllers.quoteRequest.countAdditionalStores();

    if ($(this).parent().hasClass('label-checked')){
      $(this).parent().removeClass('label-checked');
    }else{
      $(this).parent().addClass('label-checked');
    }
  });

  // Initialize date picker
  var elementFDP = document.createElement("script");
  elementFDP.src = '/js/vendors/foundation-datepicker/foundation-datepicker.min.js';
  elementFDP.onload = function(){    
    $('#dpMonths').fdatepicker();
  }
  document.body.appendChild(elementFDP);
};

var quoteRequestSendRequest = function(token){
  console.log('reCaptcha user response :');
  console.log(token);
  $('#qrForm').submit();
}

gmwa.controllers.quoteRequest.initTakePhoto = function(){
  // Check camera support
  if(navigator.mediaDevices) {
    // Show Photo take
    $('#photosTake').show();
    // Hook add button 
    $('#photosTake').click(function(e){
      if (gmwa.controllers.quoteRequest.addPhotoPreview === undefined){
        gmwa.controllers.quoteRequest.addPhotoPreview = document.getElementById('addPhotoPreviewVideo');
      }
      if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        gmwa.controllers.quoteRequest.addPhotoModal.foundation('open');
      }
    });
    // Build reveal
    $('body').append($('<div class="reveal u-reveal small" id="addPhotoModal" data-reveal style="background-color: #000;"><div class="u-reveal-body"><div class="u-quote-form-photoadd"><p>Asegurese de que la imagen salga clara y en foco</p><video id="addPhotoPreviewVideo" width="100%" height="auto" autoplay></video><div class="photoadd-btns-cntr"><button id="rotateCamera" class="button small" style="display:none"><i class="fa fa-retweet" aria-hidden="true"></i></button><button id="addPhotoSnap" class="button small right small-expanded"><i class="fa fa-camera" aria-hidden="true"></i></button><button id="closePhotoSnap" class="button small secondary small-expanded">Cancelar</button></div></div></div></div>'));
    gmwa.controllers.quoteRequest.addPhotoModal = $('#addPhotoModal');
    gmwa.controllers.quoteRequest.addPhotoModal.foundation();
    // Handle opening and closing events
    $(document).on('open.zf.reveal', '#addPhotoModal[data-reveal]', function () {
      navigator.mediaDevices.enumerateDevices().then(function(deviceInfos){

        // Search video input
        for (var i = 0; i !== deviceInfos.length; ++i) {
          var deviceInfo = deviceInfos[i];
          if (deviceInfo.kind === 'videoinput') {
            gmwa.controllers.quoteRequest.videoDevices.push(deviceInfo.deviceId);
          }
        }

        if (gmwa.controllers.quoteRequest.videoDevices.length === 0){
          // Show error
          gmwa.logger.log('No video devices found!');
          return
        }else if (gmwa.controllers.quoteRequest.videoDevices.length > 1){
          // Show change icon
          $('#rotateCamera').click(function(e){
            var newIndex = gmwa.controllers.quoteRequest.videoDevicesIndex+1;
            if (newIndex == gmwa.controllers.quoteRequest.videoDevices.length){
              newIndex = 0;
            }
            gmwa.controllers.quoteRequest.videoDevicesIndex = newIndex;
            var constraints = {
              video : {
                deviceId: gmwa.controllers.quoteRequest.videoDevices[newIndex]
              }
            };
            gmwa.logger.log('Using device at index ' + newIndex + ' with deviceId ' + constraints.video.deviceId);
            gmwa.controllers.quoteRequest.playTakePhoto(constraints);
          });
          $('#rotateCamera').show();
        }
        gmwa.controllers.quoteRequest.videoDevicesIndex = gmwa.controllers.quoteRequest.videoDevices.length-1;
        var constraints = {
          video : {
            deviceId: gmwa.controllers.quoteRequest.videoDevices[gmwa.controllers.quoteRequest.videoDevicesIndex]
          }
        };
        gmwa.controllers.quoteRequest.playTakePhoto(constraints);
        

      }).catch(function(err){
        gmwa.logger.error('Could not enumerate devices: ', err);
      });
      
    });
    $(document).on('closed.zf.reveal', '#addPhotoModal[data-reveal]', function () {
      // var tracks = gmwa.controllers.quoteRequest.addPhotoStream.getTracks();
      // if (tracks.length > 0){
      //   tracks[0].stop();
      // }else{
      //   gmwa.logger.log('WOAH, found ' + tracks.length + ' video streams!');
      // }
    });
    // Hook Snap photo button
    $('#closePhotoSnap').click(function(e){
      gmwa.controllers.quoteRequest.stopTakePhoto();
      gmwa.controllers.quoteRequest.addPhotoModal.foundation('close');
    });
    $('#addPhotoSnap').click(function(e){
      var canvas = gmwa.controllers.quoteRequest.buildCanvasElement(gmwa.controllers.quoteRequest.addPhotoPreview.videoWidth, gmwa.controllers.quoteRequest.addPhotoPreview.videoHeight);
      var context = canvas.element.getContext('2d');
      context.drawImage(gmwa.controllers.quoteRequest.addPhotoPreview, 0, 0, gmwa.controllers.quoteRequest.addPhotoPreview.videoWidth, gmwa.controllers.quoteRequest.addPhotoPreview.videoHeight);
      $('#canvas-'+canvas.id+' > i').click(function(e){
        $(this).parent().remove();
        gmwa.controllers.quoteRequest.checkAddPhotoButton();
      })
      gmwa.controllers.quoteRequest.checkAddPhotoButton();
      gmwa.controllers.quoteRequest.stopTakePhoto();
      gmwa.controllers.quoteRequest.addPhotoModal.foundation('close');
    });
  }
};

gmwa.controllers.quoteRequest.playTakePhoto = function(constraints){
  gmwa.controllers.quoteRequest.stopTakePhoto();
  gmwa.logger.log('Requesting stream at device ' + constraints.video.deviceId + '...');
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    gmwa.controllers.quoteRequest.stream = stream;
    gmwa.controllers.quoteRequest.addPhotoStream = stream;
    //gmwa.controllers.quoteRequest.addPhotoPreview.src = window.URL.createObjectURL(stream);
    try {
      gmwa.controllers.quoteRequest.addPhotoPreview.srcObject = stream;
      gmwa.controllers.quoteRequest.addPhotoPreview.onloadedmetadata = function(e) {
        gmwa.logger.log('Playing (1) stream at device ' + constraints.video.deviceId + '.');
        gmwa.controllers.quoteRequest.addPhotoPreview.play();
      };
    } catch (error) {
      gmwa.controllers.quoteRequest.addPhotoPreview.src = window.URL.createObjectURL(stream);
      gmwa.logger.log('Playing (2) stream at device ' + constraints.video.deviceId + '.');
      gmwa.controllers.quoteRequest.addPhotoPreview.play();
    }
  });
};

gmwa.controllers.quoteRequest.stopTakePhoto = function (){
  if (gmwa.controllers.quoteRequest.stream) {
    gmwa.controllers.quoteRequest.stream.getTracks().forEach(function(track) {
      gmwa.logger.log('Stopping current stream');
      track.stop();
    });
  }
};

gmwa.controllers.quoteRequest.buildCanvasElement = function(width, height){
    var date = new Date;
    var canvasId = date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds();
    $('#photosList').prepend($('<div id="canvas-'+canvasId+'" class="u-picture-cntr"><i class="fa fa-times" aria-hidden="true"></i><canvas width="'+width+'" height="'+height+'"></canvas></div>'));
    var canvas = $('#canvas-'+canvasId+' > canvas').get(0);
    return {id: canvasId, element: canvas};
};

gmwa.controllers.quoteRequest.checkAddPhotoButton = function(){
  var totalPhotos = $('#photosList').children().length;
  if (totalPhotos === 0){
    $('#photosTake').text('Tomar con la cámara');
    $('#photosTake').show();
    $('#photosAdd').text('Cargar desde el dispositivo');
    $('#photosAdd').show();
    $('#photosMaxMsg').hide();
  }else if (totalPhotos < 4){
    $('#photosAdd').text('Cargar otra');
    $('#photosAdd').show();
    $('#photosTake').text('Tomar otra');
    $('#photosTake').show();
    $('#photosMaxMsg').hide();
  }else{
    $('#photosTake').hide();
    $('#photosAdd').hide();
    $('#photosMaxMsg').show();
  }
};

gmwa.controllers.quoteRequest.addImagesToForm = function(){
  var imgId = 0;
  $('.u-picture-cntr canvas').each(function(idx, canva){
    gmwa.logger.log('Adding image ' + imgId);
    $('<input>').attr({
        type  : 'hidden',
        id    : 'qImg-'+imgId,
        name  : 'qImg-'+imgId,
        value : canva.toDataURL('image/jpeg',0.92),
    }).appendTo('#qrForm');
    imgId++;
  });
  $('<input>').attr({
      type  : 'hidden',
      id    : 'qImgTotal',
      name  : 'qImgTotal',
      value : imgId,
  }).appendTo('#qrForm');
  gmwa.logger.log('Added ' + imgId + ' images and total to form');
};

gmwa.controllers.quoteRequest.validateForm = function(){
  var errMsg = '';
  if (document.forms.qrForm.qrDesc.value.length === 0){
    errMsg = "Ingresa una descripción de lo que necesitas.";
  }
  if (document.forms.qrForm.qrScheduleType.value.length === 0){
    if (errMsg.length > 0) errMsg += '<br>';
      errMsg += "Ingresa para cuando lo necesitas.";
  }
  if (document.forms.qrForm.qrUserEmail.value.length > 0){
    if(!document.forms.qrForm.qrUserEmail.validity.valid){
      if (errMsg.length > 0) errMsg += '<br>';
      errMsg += "Ingresa un correo electrónico válido.";
    }
  }else if (document.forms.qrForm.qrUserEmail.value.length === 0){
    if (errMsg.length > 0) errMsg += '<br>';
    errMsg += "Ingresa un correo electrónico para que podamos enviarte la respuesta.";
  }
  if (document.forms.qrForm.qrLocation.value.length === 0){
    if (errMsg.length > 0) errMsg += '<br>';
    errMsg += "Ingresa tu ubicación aproximada, calle, barrio o zona.";
  }
  if (document.forms.qrForm.qrUserName.value.length === 0){
    if (errMsg.length > 0) errMsg += '<br>';
    errMsg += "Ingresa tu nombre.";
  }
  if (document.forms.qrForm.qrUserTel.value.length > 0){
    if(!document.forms.qrForm.qrUserTel.validity.valid){
      if (errMsg.length > 0) errMsg += '<br>';
      errMsg += "Ingresa un número de teléfono válido.";
    }
  }
  return errMsg
  
};

gmwa.controllers.quoteRequest.countAdditionalStores = function(){
  var qty = 0;
  $('#qras-cntr').find('input:checkbox').each(function(e){
    if ($(this).prop('checked')){
      qty++;
    }
  });
  var storeName = $('#qras-desc').data('store');
  if (qty == 0){
    $('#qras-desc').html('Enviaremos la solicitud solo a ' + storeName);
  }else{
    $('#qras-desc').html('Enviaremos la solicitud a ' + storeName + ' y a ' + qty + ' más');
  }
}
