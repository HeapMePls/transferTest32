var gmwa = gmwa || {};
gmwa.components = gmwa.components || {};
gmwa.components.maps = {};
gmwa.components.maps.GMaps = {};
gmwa.components.maps.LMaps = {};



gmwa.components.maps.downloadDeferred = function(cb){
  // Download LeafLet CSS
  var cssDiv = document.createElement("div");
  cssDiv.innerHTML = '<link rel="stylesheet" type="text/css" href="/js/vendors/leaflet2/leaflet.css">';
  document.body.appendChild(cssDiv);

  // Download Leaflet JS
  var element = document.createElement("script");
  element.src = '/js/vendors/leaflet2/leaflet.js';
  element.onload = function(){
    cb();
  };
  document.body.appendChild(element);
}

//
// Implement LMaps
//
gmwa.components.maps.LMaps.initMap = function(elem, centerLat, centerLng, zoom, isMobile){
  // Check if element exists
  var mapElement = $('#'+elem);
  if (mapElement.length == 0) return;

  // Define the OSM Tile Server and Co-ordinate Placeholders
  //var mapTileServerUrl = 'https://tvz2.tingelmar.com/maps/osm_tiles/';
  var mapTileServerUrl = 'https://maps.tingelmar.com/osm_tiles/';
  var osmTileCoordinatesPlaceholder = '{z}/{x}/{y}.png';
  var mapTileLayerMinimumZoomLevel = 7;
  var mapTileLayerMaximumZoomLevel = 18;
  var defaultZoomLevel = zoom;

  // Define the Attribution
  var mapTileAttribution = 'Map Data &#9400 OpenStreetMap contributors';
  // Set up the Lefalet Map
  var map = new L.Map(elem);

  // Create the Tile Layer with correct attribution
  var osmUrl = mapTileServerUrl + osmTileCoordinatesPlaceholder;
  var osm = new L.TileLayer(osmUrl, {
    minZoom: mapTileLayerMinimumZoomLevel,
    maxZoom: mapTileLayerMaximumZoomLevel,
    attribution: mapTileAttribution
  });

  // Navigate to the requested co-ordinates
  var latitude = parseFloat(centerLat);
  var longitude = parseFloat(centerLng);
  map.setView(new L.LatLng(latitude, longitude), defaultZoomLevel);
  map.addLayer(osm);

  return map;
}

gmwa.components.maps.LMaps.initMapAsync = function(elem, centerLat, centerLng, zoom, isMobile, cb){
  // Check if library is loaded
  if (typeof(L) == 'undefined'){
    //gmwa.logger.log('LMaps|Loading CSS...');
    // Load and re-call
    // gmwa.utils.loadStylesheet('https://unpkg.com/leaflet@1.3.1/dist/leaflet.css', function(){
    //   gmwa.logger.log('LMaps|Loading JS...');
    //   gmwa.utils.loadScript('https://unpkg.com/leaflet@1.3.1/dist/leaflet.js', function(){
    //     gmwa.logger.log('LMaps|Re-initing...');
    //     cb(gmwa.components.maps.LMaps.initMap(elem, centerLat, centerLng, zoom, isMobile));
    //   });
    // });
    gmwa.components.maps.downloadDeferred( function(){
      cb(gmwa.components.maps.LMaps.initMap(elem, centerLat, centerLng, zoom, isMobile));
    });
  }else{
    cb(gmwa.components.maps.LMaps.initMap(elem, centerLat, centerLng, zoom, isMobile));
  }
}

gmwa.components.maps.LMaps.addMarkerSimple = function(map, lat, lng){
  var marker = new L.marker([parseFloat(lat), parseFloat(lng)])
  marker.addTo(map);
  return marker;
}

gmwa.components.maps.LMaps.addMarkerDraggable = function(map, lat, lng){
  var marker = new L.marker([parseFloat(lat), parseFloat(lng)], {draggable:'true'})
  marker.addTo(map);
  return marker;
}

//
// Implement GMaps
//
gmwa.components.maps.GMaps.initMap = function(elem, centerLat, centerLng, zoom, isMobile){
  var mapElement = $('#'+elem);
  if (mapElement.length == 0) return;

  var latlng = new google.maps.LatLng(centerLat, centerLng);
  if (isMobile) {
    var myOptions = {
      zoom: zoom,
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
      zoom: zoom,
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
  return new google.maps.Map(mapElement[0], myOptions);
}

gmwa.components.maps.GMaps.addMarkerSimple = function(map, lat, lng){
  var latlng = new google.maps.LatLng(lat, lng);
  return new google.maps.Marker({position: latlng, map: map});
}

//
// Init Maps Interface
//
gmwa.components.maps.init = function(mapFW){
  if (mapFW == 0){
    //gmwa.logger.log('Using GMaps');
    gmwa.components.maps.instance = gmwa.components.maps.GMaps;
  }else{
    //gmwa.logger.log('Using LMaps');
    gmwa.components.maps.instance = gmwa.components.maps.LMaps;
  }
}