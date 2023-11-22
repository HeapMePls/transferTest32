var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.reportarError = {};

gmwa.controllers.reportarError.map = null;

gmwa.controllers.reportarError.init = function(){
  gmwa.logger.log('ReportarError|Init...');
  gmwa.components.header.init();

  $('#vermapa, #lblvermapa').on('click', function () {
    if (this.checked) {
      $('#mapaVer').show('fast', function () {
        var lat = parseFloat($('#errorForm').data('lat'));
        var lon = parseFloat($('#errorForm').data('lon'));
        gmwa.controllers.reportarError.initializeMap(lat, lon);
        // $('#us3').locationpicker({
        //   location: {latitude:lat, longitude:lon},
        //   radius: 0,
        //   enableAutocomplete: true,
        //   onchanged: function (currentLocation, radius, isMarkerDropped) {
        //       $('#storeloc').val(currentLocation.latitude + ', ' + currentLocation.longitude);
        //   }
        // });
      });
    } else {
      $('#mapaVer').hide();
    }
  });

  // Download and initialize parsley
  var elementI18 = document.createElement("script");
  elementI18.src = '/js/vendors/parsley/i18n/es.js';
  elementI18.onload = function(){    
    var elementP = document.createElement("script");
    elementP.src = '/js/vendors/parsley/parsley.min.js';
    elementP.onload = function(){    
      window.ParsleyValidator.setLocale('es');
      $('#errorForm').parsley();
      $.listen('parsley:form:validated', function (data) {
          $.each(data.fields, function (e, elem) {
              var text = null;
              var $errorContainer = elem.$element.next('ul.parsley-errors-list:first');
              elem.$element.parents('div:first').find('small.error:first').hide();
              if ($errorContainer.find('li:first').length) {
                  text = $errorContainer.find('li:first').text();
                  elem.$element.parents('div:first').find('ul').show();
              }
          });
      });
    };
    document.body.appendChild(elementP);
  };
  document.body.appendChild(elementI18);

  $(document).on('submit','form',function(){
    $('#btnSend').prop('disabled', true);
    $('#btnSend').text('Enviando...');
  });
}

gmwa.controllers.reportarError.initializeMap = function(lat, lng){
  if (gmwa.controllers.reportarError.map == null){
    var mapElement = $('#us3');
    var izoom    = 16;
    var isMobile = mapElement.data('im');
  
    if (lat != '' && lng != '') {
      if (lat != 0 && lng != 0 && izoom != 0) {
        gmwa.logger.log('Initializing Maps...');
        gmwa.components.maps.instance.initMapAsync('mapa', lat, lng, izoom, isMobile, function(map){
          gmwa.controllers.reportarError.map = map;
        
          gmwa.controllers.reportarError.marker = gmwa.components.maps.instance.addMarkerDraggable(gmwa.controllers.reportarError.map, lat, lng);
          gmwa.controllers.reportarError.marker.on('dragend', function(event){
            var marker = event.target;
            var position = marker.getLatLng();
            var storeLoc = position.lat + ',' + position.lng;
            marker.setLatLng(new L.LatLng(position.lat, position.lng),{draggable:'true'});
            gmwa.controllers.reportarError.map.panTo(new L.LatLng(position.lat, position.lng));
            $('#storeloc').val(storeLoc);
          });
        });
      }
    }
  }
}