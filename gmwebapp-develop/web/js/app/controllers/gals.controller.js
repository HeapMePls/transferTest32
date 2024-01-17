gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.gals = {};


gmwa.controllers.gals.init = function(){
  gmwa.logger.log('Gals|Init...');

  gmwa.components.header.init();

  //gmwa.controllers.gals.enhanceHours();
  gmwa.controllers.gals.buildSpecialHoursStatus();

  // Initialize Map
  gmwa.controllers.gals.smiImg = document.getElementById('smiImg');
  if (gmwa.utils.isMobile()){
    var tabInfo = document.getElementById('tabInfo');
    if (tabInfo){
      tabInfo.addEventListener('click', function(ev){
        if (!gmwa.controllers.gals.map){
          if (!gmwa.controllers.gals.smiImg){
            gmwa.controllers.gals.initializeMap();
          }else{
            gmwa.controllers.gals.smiImg.addEventListener('click', function(ev){
              gmwa.controllers.gals.initializeMap();
            });
          }
        }
      });
    }
  }else{
    if (!gmwa.controllers.gals.smiImg){
      gmwa.controllers.gals.initializeMap();
    }else{
      gmwa.controllers.gals.smiImg.addEventListener('click', function(ev){
        gmwa.controllers.gals.initializeMap();
      });
    }
  }

  
};

gmwa.controllers.gals.initializeGoogleMap = function() {

  var mapElement = $('#mapa');
  if (mapElement.length == 0) return;

  var lat      = mapElement.data('lat');
  var lng      = mapElement.data('lng');
  var izoom    = 15;
  var isMobile = mapElement.data('im');

  if (lat != '' && lng != '') {
    if (lat != 0 && lng != 0 && izoom != 0) {
      var latlng = new google.maps.LatLng(lat, lng);
      if (isMobile) {
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
      } else {
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
      }
      var map = new google.maps.Map(mapElement[0], myOptions);
      var marker = new google.maps.Marker({position: latlng, map: map});
    }
  }
};

gmwa.controllers.gals.initializeMap = function(){
  var mapElement = $('#mapa');
  var lat      = mapElement.data('lat');
  var lng      = mapElement.data('lng');
  var izoom    = 16;
  var isMobile = mapElement.data('im');

  if (lat != '' && lng != '' && lat != 0 && lng != 0 && izoom != 0 && !isNaN(lat) && !isNaN(lng)) {
    gmwa.logger.log('Initializing Maps...');
    gmwa.components.maps.instance.initMapAsync('mapa', lat, lng, izoom, isMobile, function(map){
      gmwa.controllers.gals.map = map;
      gmwa.components.maps.instance.addMarkerSimple(gmwa.controllers.gals.map, lat, lng);
      if (gmwa.controllers.gals.smiImg){
        gmwa.controllers.gals.smiImg.style.display = 'none';
      }
    });
  }
}

gmwa.controllers.gals.buildSpecialHoursStatus = function() {
  var ret = {
    color: 'darkorange',
    text: 'text',
    show: true,
    htext: 'text',
    specialDate: null
  };

  var hours = window.hrsps;
  var todayDate = null;
  todayDate = new Date();
  todayDate = todayDate.getFullYear() + "-" + ((0 + String(todayDate.getMonth() + 1)).slice(-2)) + "-" + ((0 + String(todayDate.getDate())).slice(-2))

  if (hours.length) {
    ret.color = '#7CB342'
    var date = dayjs(hours[0].d + " 00:00:00");
    ret.specialDate = gmwa.controllers.gals.convertDateToString(date, true);
    if (hours[0].dsc) {
      ret.specialDate = hours[0].dsc + ", " +  gmwa.controllers.gals.convertDateToString(date, true);
    }

    if (hours[0].cf) {
      var msg;
      if (!hours[0].hp) {
        msg = " cerrado"
        ret.color = "#FF5722"
      } else {
        msg = " abierto de "
        var ranges = []
        hours[0].hp.forEach(function(hour){
          ranges.push(gmwa.controllers.gals.buildHourLabel(hour.start) + " a " + gmwa.controllers.gals.buildHourLabel(hour.end));
        });
        msg += ranges.join(", ");
      }

      if (hours[0].dsc) {
        ret.htext = gmwa.controllers.gals.convertDateToString(date, true) + ' "' + hours[0].dsc + '" ' + msg
      } else {
        ret.htext = gmwa.controllers.gals.convertDateToString(date, true) + msg
      }
    } else {
      ret.color = '#FF9800'
      if (new Date().getDay() == parseInt(date.format('d'))) {
        ret.htext = "El horario de hoy puede variar";
      } else {
        ret.htext = "El horario para el " + gmwa.controllers.gals.convertDateToString(date, true) + (hours[0].dsc ? " " + hours[0].dsc : "") + " puede variar";
      }
    }

    $('#horarioEspecial').append($('<div style="color: ' + ret.color + '">' + ret.htext +'</div>'));
  }
}

gmwa.controllers.gals.convertDateToString = function(date, includeDay) {
  if (includeDay) {
    return date.format("dddd D [de] MMMM");
  }
  return date.format("D [de] MMMM")
}
