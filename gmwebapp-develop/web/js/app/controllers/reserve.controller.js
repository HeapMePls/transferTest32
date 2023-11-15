gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.reserve = {};


gmwa.controllers.reserve.init = function(){
  gmwa.logger.log('Reserve|Init...');

  gmwa.components.header.init();

  //gmwa.controllers.reserve.enhanceHours();
  gmwa.controllers.reserve.buildSpecialHoursStatus();

  // Initialize Map
  if (gmwa.utils.isMobile()){
    var tabInfo = document.getElementById('tabInfo');
    if (tabInfo){
      tabInfo.addEventListener('click', function(ev){
        if (!gmwa.controllers.reserve.map){
          gmwa.controllers.reserve.initializeMap();
        }
      });
    }
  }else{
    gmwa.controllers.reserve.initializeMap();
  }

  gmwa.controllers.reserve.initKeenSlider();

  // ZUCK TEST --------------------------------- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // var swiper = new Swiper("#zuckSwiper", {
  //   loop: true,
  //   autoplay: {
  //     delay: 3000,
  //   },
  //   spaceBetween: 0,
  //   effect: 'fade',
  //   pagination: {
  //     el: '.swiper-pagination',
  //     type: 'bullets',
  //   },
  //   lazy: {
  //     loadPrevNext: false,
  //     loadOnTransitionStart: true
  //   }
  // });
};

gmwa.controllers.reserve.initializeGoogleMap = function() {

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

gmwa.controllers.reserve.initializeMap = function(){
  var mapElement = $('#mapa');
  var lat      = mapElement.data('lat');
  var lng      = mapElement.data('lng');
  var izoom    = 16;
  var isMobile = mapElement.data('im');

  if (lat != '' && lng != '' && lat != 0 && lng != 0 && izoom != 0 && !isNaN(lat) && !isNaN(lng)) {
    gmwa.logger.log('Initializing Maps...');
    gmwa.components.maps.instance.initMapAsync('mapa', lat, lng, izoom, isMobile, function(map){
      gmwa.controllers.reserve.map = map;
      gmwa.components.maps.instance.addMarkerSimple(gmwa.controllers.reserve.map, lat, lng);
    });
  }
}

gmwa.controllers.reserve.buildSpecialHoursStatus = function() {
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
    ret.specialDate = gmwa.controllers.reserve.convertDateToString(date, true);
    if (hours[0].dsc) {
      ret.specialDate = hours[0].dsc + ", " +  gmwa.controllers.reserve.convertDateToString(date, true);
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
          ranges.push(gmwa.controllers.reserve.buildHourLabel(hour.start) + " a " + gmwa.controllers.reserve.buildHourLabel(hour.end));
        });
        msg += ranges.join(", ");
      }

      if (hours[0].dsc) {
        ret.htext = gmwa.controllers.reserve.convertDateToString(date, true) + ' "' + hours[0].dsc + '" ' + msg
      } else {
        ret.htext = gmwa.controllers.reserve.convertDateToString(date, true) + msg
      }
    } else {
      ret.color = '#FF9800'
      if (new Date().getDay() == parseInt(date.format('d'))) {
        ret.htext = "El horario de hoy puede variar";
      } else {
        ret.htext = "El horario para el " + gmwa.controllers.reserve.convertDateToString(date, true) + (hours[0].dsc ? " " + hours[0].dsc : "") + " puede variar";
      }
    }

    $('#horarioEspecial').append($('<div style="color: ' + ret.color + '">' + ret.htext +'</div>'));
  }
}

gmwa.controllers.reserve.convertDateToString = function(date, includeDay) {
  if (includeDay) {
    return date.format("dddd D [de] MMMM");
  }
  return date.format("D [de] MMMM")
}



//
// Covers Carrousel
//
gmwa.controllers.reserve.coversCarrousel = null;
gmwa.controllers.reserve.coversCarrouselInterval = 0;
gmwa.controllers.reserve.initKeenSlider = function(){
  gmwa.controllers.reserve.coversCarrouselInterval = 0
  var sliderElement = document.getElementById("keenCovers");
  if (!sliderElement) return;
  gmwa.controllers.reserve.coversCarrousel = new KeenSlider(sliderElement, {
    loop: true,
    duration: 1000,
    dragStart: function() {
      gmwa.controllers.reserve.carrouselAutoplay(false);
    },
    dragEnd: function() {
      gmwa.controllers.reserve.carrouselAutoplay(true);
    },
    created: function() {
      sliderElement.style.display = 'flex';
      var slides = document.querySelectorAll(".keen-slider__slide");
      slides.forEach(function (slide, idx) {
        if (idx > 0){
          slide.style.display = 'block';
        }
      });
    },
    slideChanged: function(instance) {
      var slide = instance.details().relativeSlide;
      var dots = document.querySelectorAll(".story-dot ");
      dots.forEach(function (dot, idx) {
        if (idx == slide){
          dot.classList.add("story-dot--active");
        }else{
          dot.classList.remove("story-dot--active");
        }
      });
    }
  });
  gmwa.controllers.reserve.carrouselAutoplay(true);
}
gmwa.controllers.reserve.carrouselAutoplay = function(run){
  clearInterval(gmwa.controllers.reserve.coversCarrouselInterval)
  gmwa.controllers.reserve.coversCarrouselInterval = setInterval(function() {
    if (run && gmwa.controllers.reserve.coversCarrousel) {
      gmwa.controllers.reserve.coversCarrousel.next();
    }
  }, 5000);
}