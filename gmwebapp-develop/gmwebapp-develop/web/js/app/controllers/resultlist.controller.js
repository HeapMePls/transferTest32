var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.resultlist = {};

gmwa.controllers.resultlist.markersItems = [];

// gmwa.controllers.resultlist.noPoi = [{featureType: 'poi', stylers: [{ visibility: 'off' }]},
//     {   'featureType': 'landscape',
//         'elementType': 'geometry',
//         'stylers': [{   'hue': '#f3f4f4'}, {   'saturation': -84}, {   'lightness': 59}, {   'visibility': 'on'}]},
//     {   'featureType': 'landscape',
//         'elementType': 'labels',
//         'stylers': [{'hue': '#ffffff'}, {'saturation': -100}, {'lightness': 100}, {'visibility': 'off'}]},
//     {  'featureType': 'poi.park',
//         'elementType': 'geometry',
//         'stylers': [{'hue': '#83cead'}, {'saturation': 1}, {'lightness': -15}, {'visibility': 'on'}]},
//     {  'featureType': 'poi.school',
//         'elementType': 'all',
//         'stylers': [{'hue': '#d7e4e4'}, {'saturation': -60}, {'lightness': 23}, {'visibility': 'on'}]},
//     {  'featureType': 'road',
//         'elementType': 'geometry',
//         'stylers': [{'hue': '#ffffff'}, {'saturation': -100}, {'lightness': 100}, {'visibility': 'on'}]},
//     {  'featureType': 'road',
//         'elementType': 'labels',
//         'stylers': [{'hue': '#bbbbbb'}, {'saturation': -100}, {'lightness': 26}, {'visibility': 'on'}]},
//     {  'featureType': 'road.highway',
//         'elementType': 'geometry',
//         'stylers': [{'hue': '#ffcc00'}, {'saturation': 100}, {'lightness': -22}, {'visibility': 'on'}]},
//     {  'featureType': 'road.arterial',
//         'elementType': 'geometry',
//         'stylers': [{'hue': '#ffcc00'}, {'saturation': 100}, {'lightness': -35}, {'visibility': 'simplified'}]},
//     {  'featureType': 'road.arterial',
//         'elementType': 'geometry.fill',
//         'stylers': [{'saturation': '64'}, {'visibility': 'on'}, {'lightness': '53'}, {'gamma': '1.27'}]},
//     {  'featureType': 'road.arterial',
//         'elementType': 'geometry.stroke',
//         'stylers': [{'saturation': '0'}, {'visibility': 'off'}]},
//     {  'featureType': 'road.local',
//         'elementType': 'geometry.fill',
//         'stylers': [{'visibility': 'on'}, {'saturation': '0'}, {'lightness': '0'}]},
//     {  'featureType': 'water',
//         'elementType': 'all',
//         'stylers': [{'hue': '#7fc8ed'}, {'saturation': 55}, {'lightness': -6}, {'visibility': 'on'}]},
//     {  'featureType': 'water',
//         'elementType': 'labels',
//         'stylers': [{'hue': '#7fc8ed'}, {'saturation': 55}, {'lightness': -6}, {'visibility': 'off'}]
//     }
// ];

gmwa.controllers.resultlist.init = function(){
  gmwa.logger.log('ResultList|Init...');
  gmwa.components.header.init();

  $('.related-list-opener').on('click', function () {
    var $this = $(this);
    $(this).parents('ul:first').find('li.to-show').toggle(0, function () {
        if ($this.find('b:first').text() == 'Ver más relacionados') {
            $this.find('b:first').text('Ocultar');
        } else {
            $this.find('b:first').text('Ver más relacionados');
        }
    });
  });

  // if (Foundation.MediaQuery.atLeast('medium')){
  if (window.innerWidth >= 640){
    $("#listMapCntr").sticky({topSpacing:10,zIndex:0});
    gmwa.controllers.resultlist.loadStoresInMap();
  }else{
    gmwa.controllers.resultlist.mapSwitchOn = false;
    $('#fabMapSwitch').click(function(e){
      if (!gmwa.controllers.resultlist.mapSwitchOn){
        $('#mapCntr').show();
        if (gmwa.controllers.resultlist.map === undefined){
          gmwa.controllers.resultlist.loadStoresInMap();
        }
        $(this).html('<i class="fa fa-list" aria-hidden="true"></i>');
      }else{
        $('#mapCntr').hide();
        $(this).html('<i class="fa fa-map-o" aria-hidden="true"></i>');
      }
      gmwa.controllers.resultlist.mapSwitchOn = !gmwa.controllers.resultlist.mapSwitchOn;
    });
  }
  
  // var swiper = new Swiper('.swiper-container', {
  //   slidesPerView: 1.4,
  //   //paginationClickable: false,
  //   navigation: {
  //     nextEl: '.swiper-button-next',
  //     prevEl: '.swiper-button-prev'
  //   },
  //   spaceBetween: 10,
  //   lazy: {
  //     loadPrevNext: true,
  //   }
  // });
  
  //$('.lazy').Lazy({effect: 'fadeIn'});
}


gmwa.controllers.resultlist.loadStoresInMap = function (){
    
  if (gmwa.mapsFW == 0){
    gmwa.controllers.resultlist.loadStoresInGMap("listMap");
  }else{
    gmwa.controllers.resultlist.loadStoresInLMap("listMap");
  }
    
  // Check premium sponsor buttons
  // if (arrSponPrem !== null && arrSponPrem.length > 0){
  //   var fabHtml = '';
  //   $('#premSponList').empty();
  //   for (var key in arrSponPrem) {
  //     fabHtml = '<div id="spoPre'+arrSponPrem[key].id+'" class="fab-spo-prem" data-id="'+arrSponPrem[key].id+'"><img src="'+arrSponPrem[key].ics+'"></div>';
  //     $('#premSponList').append(fabHtml);
  //     $('#spoPre'+arrSponPrem[key].id).click(function(e){
  //       if (gmwa.controllers.resultlist.viewSponsorsMode === undefined){
  //         gmwa.controllers.resultlist.viewSponsorsMode = false;
  //       }
  //       if (!Bgmwa.controllers.resultlist.viewSponsorsMode){
  //         gmwa.controllers.resultlist.viewSponsorMarkers($(this).data('id'));
  //       }else{
  //        gmwa.controllers.resultlist.resetSponsorMarkers();
  //       }
  //       gmwa.controllers.resultlist.viewSponsorsMode = !gmwa.controllers.resultlistviewSponsorsMode;
  //     });
  //   }
  // }
}



gmwa.controllers.resultlist.loadStoresInLMap = function(eMap){
  gmwa.logger.log('ResultList|Loading LMaps....');
  // Load locations
  $('.item-comercio').each(function(){
    var lat   = $(this).data('lat');
    var lon   = $(this).data('lng');
    var locId = $(this).data('id');
    var icon  = null;
    
    // Check icon
    var itemIcon = $(this).find('.item-icon');
    if (itemIcon.length > 0){
      itemIcon = $(itemIcon[0]);
      if (itemIcon.hasClass('lazyload')){
        icon  = itemIcon.attr('data-src');
      }else{
        icon  = itemIcon.attr('src');
      }
    }
    
    if (lat !== '' ) {
      var point = {
        latitude  : parseFloat(lat),
        longitude : parseFloat(lon)
      };
      var markerClass = 'gmMarkerDot';
      var markerClassH1 = 'gmMarkerPin4';
      var mType = 0;
      var piid = 0;

      // ------

      // Build infowindow content and add it
      var locName = $(this).find('h2').text().replace(/ /g, '-');
      infoWContent = '<div id="iwStore" class="rs-iw-cntr" data-id="'+locId+'" data-name="'+locName+'">';
      if (icon && icon.length > 0){
        infoWContent += '<img src="'+icon+'" alt="'+locName+'" witdh="31" height="31"><div style="margin-left: 55px;">';
      }else{
        infoWContent += '<div>';
      }
      infoWContent += '<h4>'+$(this).find('h2').text()+'</h4><p>'+$(this).find('h3').html()+'</p>';
      infoWContent += '</div></div>';

      if ( $(this).data('plan') == 'vigente') {
          if (icon && icon.length > 0){
            richMarkerHtml = '<div class="' + markerClassH1 + '"><div><img src="' + icon + '"  alt="'+locName+'" witdh="31" height="31"></div></div>';
          }else{
            richMarkerHtml = '<div class="' + markerClass + '"></div>';
          }
          mType = 1;
        }else {
          richMarkerHtml = '<div class="' + markerClass + '"></div>';
      }
      // Store marker at store
      gmwa.controllers.resultlist.markersItems.push({
        locName      : locName,
        point        : point,
        markerHtml   : richMarkerHtml,
        infoWHtml    : infoWContent
      })
    }

  });
  
  // Check 0 locations
  if( gmwa.controllers.resultlist.markersItems.length > 0){
    var bounds = [];
    // Init map
    gmwa.components.maps.LMaps.initMapAsync(
      eMap, 
      gmwa.controllers.resultlist.markersItems[0].point.latitude, 
      gmwa.controllers.resultlist.markersItems[0].point.longitude, 
      16, 
      false,
      function(map){
        gmwa.controllers.resultlist.map = map;
        // Hook Popup events
        gmwa.controllers.resultlist.map.on('popupopen', function(e){
          console.log('Hook open');
          $('#iwStore').on('click', function(e){
            console.log('popup click');
            window.location = '/local/'+$(this).data('name').toLowerCase()+'/LOC'+$(this).data('id');
          });
        });
        gmwa.controllers.resultlist.map.on('popupclose', function(e){
          console.log('Hook close');
          $('#iwStore').off('click');
        });
        // Add Markers
        for (var i=0; i < gmwa.controllers.resultlist.markersItems.length; i++){
          var marker = new L.marker(
            [
              gmwa.controllers.resultlist.markersItems[i].point.latitude, 
              gmwa.controllers.resultlist.markersItems[i].point.longitude
            ],
            {
              icon: L.divIcon({html: gmwa.controllers.resultlist.markersItems[i].markerHtml})
            }
          );
          var popup = L.popup();
          popup.setContent(gmwa.controllers.resultlist.markersItems[i].infoWHtml);
          marker.bindPopup( popup );
          //marker.bindPopup( gmwa.controllers.resultlist.markersItems[i].locName );
          //marker.openPopup();
          marker.addTo(gmwa.controllers.resultlist.map);
          gmwa.controllers.resultlist.markersItems[i].marker = marker;
          bounds.push([
            gmwa.controllers.resultlist.markersItems[i].point.latitude, 
            gmwa.controllers.resultlist.markersItems[i].point.longitude
          ]);
        }
        gmwa.controllers.resultlist.map.fitBounds(bounds, {
          padding: [20, 20]
        });
      }
    );
    
  }
}

gmwa.controllers.resultlist.loadStoresInGMap = function(eMap){
  var map = document.getElementById(eMap);
  if ( map === null ){return;}

  gmwa.controllers.resultlist.map = new google.maps.Map(map, {
    center: new google.maps.LatLng(-27.747, -62.987952),
    zoom: 13,
    mapTypeId: 'roadmap',
    styles: gmwa.controllers.resultlist.noPoi,
    zoomControlOptions : {
      position  : google.maps.ControlPosition.LEFT_BOTTOM
    },
    streetViewControlOptions: {
      position  : google.maps.ControlPosition.LEFT_BOTTOM
    }
  });
  gmwa.controllers.resultlist.map.initialZoom = true;

    // This is needed to set the zoom after fitbounds,
  google.maps.event.addListener(gmwa.controllers.resultlist.map, 'zoom_changed', function() {
      var zoomChangeBoundsListener = google.maps.event.addListener(gmwa.controllers.resultlist.map, 'bounds_changed', function(event) {
        if (this.getZoom() > 15 && gmwa.controllers.resultlist.map.initialZoom === true) {
            // Change max/min zoom here
            this.setZoom(15);
            gmwa.controllers.resultlist.map.initialZoom = false;
        }
        google.maps.event.removeListener(zoomChangeBoundsListener);
      });
  });

  bounds = new google.maps.LatLngBounds();
  var j=0;
  var infoWContent = '';
  var arrSponPrem = [];

  // Load locations
  $('.item-comercio').each(function(){
      var lat   = $(this).data('lat');
      var lon   = $(this).data('lng');
      var locId = $(this).data('id');
      
      var icon  = $(this).find('.item-icon').attr('src');
      if (icon == null || icon == undefined){
        icon  = $(this).find('.item-icon').attr('data-src');
      }

      if (lat !== '' ) {
          var point = new google.maps.LatLng(
              parseFloat(lat),
              parseFloat(lon));
          var markerClass = 'gmMarkerDot';
          var markerClassH1 = 'gmMarkerPin4';
          var mType = 0;
          var piid = 0;

          // ------

          // Build infowindow content and add it
          var locName = $(this).find('h2').text().replace(/ /g, '-');
          infoWContent = '<div id="iwStore" class="rs-iw-cntr" data-id="'+locId+'" data-name="'+locName+'">';
          if (icon && icon.length > 0){
              infoWContent += '<img src="'+icon+'">';
          // }else if (data[i]['icp'] && data[i]['icp'].length > 0){
          //     infoWContent += '<img src="'+data[i]['icp']+'">';
          }
          infoWContent += '<div><h4>'+$(this).find('h2').text()+'</h4><p>'+$(this).find('h3').html()+'</p>';
          // Check promos
          // if (data[i].iPrm !== undefined){
          //     if (data[i].iPrm.length > 0){
          //         for(var ip=0; ip < data[i].iPrm.length; ip++){
          //             if (data[i].iPrm[ip].sponsor.prmm){
          //                 infoWContent += '<div style="width: 50%;display: inline-block;margin-top: 15px;float:left">';
          //                 infoWContent += '<img src="'+data[i].iPrm[ip].sponsor.ics+'" style="width: 40px;float: left;">';
          //                 infoWContent += '<div style="font-size: 13px;margin-left: 46px;line-height: 13px;">Beneficiate aqui con ' + data[i].iPrm[ip].sponsor.nmp + '</div></div>';
          //                 arrSponPrem[data[i].iPrm[ip].sponsor.idr] = {id: data[i].iPrm[ip].sponsor.idr, ics: data[i].iPrm[ip].sponsor.ics};
          //                 break;
          //             }
          //         }
          //     }
          // }
          infoWContent += '<div style="bottom: 0px;position: absolute;right: 0px;font-weight:100">Ver mas</div></div></div>';
          infoW = new google.maps.InfoWindow({content: infoWContent});
          infoW.idr = 1000;

          google.maps.event.addListener(infoW, 'domready', function() {
              $('#iwStore').on('click', function(e){
                  window.location.href = '/local/' + $(this).data('name').toLowerCase() + '/LOC' + $(this).data('id');
              });
          });

          // -------



          if ( $(this).data('plan') == 'vigente') {
              richMarkerHtml = '<div class=\'' + markerClassH1 + '\'><div><img src=\'' + icon + '\'></div></div>';
              mType = 1;
            }else {
              richMarkerHtml = '<div class=\'' + markerClass + '\'></div>';
          }
          var marker = new RichMarker({
              position  : point,
              draggable : false,
              flat      : true,
              anchor    : RichMarkerPosition.BOTTOM,
              content   : richMarkerHtml,
              map       : gmwa.controllers.resultlist.map,
              piid      : piid,
              type      : mType,
              infoW     : infoW
          });
          gmwa.controllers.resultlist.markersItems[j++] = marker;
          gmwa.controllers.resultlist.buildMarker(marker, gmwa.controllers.resultlist.map, piid);
          bounds.extend(point);

          // Store marker at store
          //data[i].marker = marker;

          // Add item events
          if (Foundation.MediaQuery.atLeast('medium')){
              var itemElem = $(this).get(0);
              itemElem.marker = marker;
              $(this).mouseenter(function(e){
                  var markerElem = e.currentTarget.marker.a;
                  if (e.currentTarget.marker.type === 0) {
                      markerElem.children[0].children[0].className = 'gmMarkerDotSelected';
                  }else {
                      markerElem.children[0].children[0].className = 'gmMarkerPin4Selected';
                  }
                  if (markerElem.style.zIndex === undefined || markerElem.style.zIndex === null || markerElem.style.zIndex.length === 0){
                      markerElem.prevZIndex =  1;
                  }else{
                      markerElem.prevZIndex =  markerElem.style.zIndex;
                  }
                  markerElem.style.zIndex = parseInt(markerElem.prevZIndex) + 1000;
                  //e.currentTarget.marker.hovered = true;
                  
              });
              $(this).mouseleave(function(e){
                  var markerElem = e.currentTarget.marker.a;
                  if (e.currentTarget.marker.type === 0) {
                      markerElem.children[0].children[0].className = 'gmMarkerDot';
                  }else {
                      markerElem.children[0].children[0].className = 'gmMarkerPin4';
                  }
                  e.currentTarget.marker.hovered = true;
                  markerElem.style.zIndex = markerElem.prevZIndex;
              });
          }
      }
  });
  // Check 0 locations
  if( j === 0){
      var COUNTRY_SW_LAT = '-27.747508';
      var COUNTRY_SW_LON = '-62.987952';
      var COUNTRY_NE_LAT = '-18.881115';
      var COUNTRY_NE_LON = '-54.440589';
      var southWest = new google.maps.LatLng(COUNTRY_SW_LAT, COUNTRY_SW_LON);
      var northEast = new google.maps.LatLng(COUNTRY_NE_LAT, COUNTRY_NE_LON);
      bounds = new google.maps.LatLngBounds(southWest,northEast);
  }
  // Re-arrange map
  gmwa.controllers.resultlist.reArrangeMap(bounds);
}

gmwa.controllers.resultlist.reArrangeMap = function(bounds){
  google.maps.event.addListener(gmwa.controllers.resultlist.map, 'zoom_changed', function() {
      var zoomChangeBoundsListener = google.maps.event.addListener(gmwa.controllers.resultlist.map, 'bounds_changed', function(event) {
        if (this.getZoom() > 15 && gmwa.controllers.resultlist.map.initialZoom === true) {
            // Change max/min zoom here
            this.setZoom(15);
            gmwa.controllers.resultlist.map.initialZoom = false;
        }
        google.maps.event.removeListener(zoomChangeBoundsListener);
      });
  });
  gmwa.controllers.resultlist.bounds = bounds;
  gmwa.controllers.resultlist.map.fitBounds(gmwa.controllers.resultlist.bounds);
  gmwa.controllers.resultlist.map.setCenter(gmwa.controllers.resultlist.map.getCenter());
};

gmwa.controllers.resultlist.buildMarker = function(marker, map, piid) {
    google.maps.event.addListener(marker, 'click', function() {

      if (gmwa.controllers.resultlist.lastMarkerSelected) {
        if (gmwa.controllers.resultlist.lastMarkerSelected.type === 0) {
          gmwa.controllers.resultlist.lastMarkerSelected.a.children[0].children[0].className = 'gmMarkerDot';
        }else {
          gmwa.controllers.resultlist.lastMarkerSelected.a.children[0].children[0].className = 'gmMarkerPin4';
        }
      }
      if (this.type === 0) {
        this.a.children[0].children[0].className = 'gmMarkerDotSelected';
      }else {
        this.a.children[0].children[0].className = 'gmMarkerPin4Selected';
      }

      gmwa.controllers.resultlist.lastMarkerSelected = this;
    //   if (BIApp.controllers.mobileController.isMobile('xs') || BIApp.controllers.mobileController.isMobile('sm')){


    //     // ----
    //     //showStoreMobile(piid);
        if (gmwa.controllers.resultlist.prevInfoWindow !== undefined){
          gmwa.controllers.resultlist.prevInfoWindow.close();
        }
        this.infoW.open(gmwa.controllers.resultlist.map, this);
        gmwa.controllers.resultlist.prevInfoWindow = this.infoW; 
    //     // -----


    //   }else{
    //     showStore(piid, true);
    //   }
    });
  }