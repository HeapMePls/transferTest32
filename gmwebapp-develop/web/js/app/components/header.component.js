var gmwa = gmwa || {};
gmwa.components = gmwa.components || {};
gmwa.components.header = {};

gmwa.components.header.buscadorOpened = false;
gmwa.components.header.navigating     = false;
gmwa.components.header.menuOpened     = false;
gmwa.components.header.menuBtn        = null;

gmwa.components.header.init = function(){
  gmwa.logger.log('Header|Init...');
  // $('#search-zonaNombre').autocomplete({
  //   source: '/components/listado-zonas-json',
  //   minLength: 3
  // });

  // $('#search-rubroNombre').autocomplete({
  //   source: '/components/listado-rubros-json',
  //   minLength: 3
  // });
  var options = {
    url: function(phrase) {
      if (phrase.length >= 3) {
        return "/components/pred-rubros-json/" + phrase;
      }
    },
    requestDelay: 300,
    getValue: "name",
    template: {
      type: "description",
      fields: {
          description: "desc"
      }
    },
    list:{
      maxNumberOfElements: 15,
      onChooseEvent: function(){
        var value = $("#search-rubroNombre").getSelectedItemData();
        if (value.type == 1){
          if (!gmwa.components.header.navigating){
            var splittedKey = value.key.split('~');
            var iKey = parseInt(splittedKey[0]*10000) + parseInt(splittedKey[1]);
            var url = '/local/' + encodeURI(value.name.toLowerCase()) + '/LOC'; //local/guillermina-gallinal/LOC219020001
            url = url + iKey.toString();
            gmwa.components.header.navigating = true;
            window.location = url;
          }
        }
      }
    }
  };
  $("#search-rubroNombre").easyAutocomplete(options);

  options = {
    url: function(phrase) {
      if (phrase.length >= 3) {
        return "/components/pred-zonas-json/" + phrase;
      }
    },
    requestDelay: 300,
    getValue: "name",
    template: {
      type: "description",
      fields: {
        description: "desc"
      }
    }
  };
  $("#search-zonaNombre").easyAutocomplete(options);

  $('#searcher-form a, #doSearch').on('click', function (event) {
    event.preventDefault();
    gmwa.components.header.search();
  });

  $('#searcher-form').submit(function(e){
    e.preventDefault();
    gmwa.components.header.search();
  });

  // $('#headerLupa').on('click', function(e){
  //   if (gmwa.components.header.buscadorOpened){
  //     $('#headerBuscador').hide();
  //     $('#headerLupa > p').text('BUSCAR');
  //     $('#headerLupa > i').removeClass('fa-times');
  //     $('#headerLupa > i').addClass('fa-search');
  //   }else{
  //     $('#headerBuscador').show();
  //     $('#headerLupa > p').text('CERRAR');
  //     $('#headerLupa > i').removeClass('fa-search');
  //     $('#headerLupa > i').addClass('fa-times');
  //   }
  //   gmwa.components.header.buscadorOpened = !gmwa.components.header.buscadorOpened;
  // });
  $('#headerLupa').on('click', function(e){
    $('#headerBuscador').show();
  });
  $('#cancelSearch').on('click', function(e){
    $('#headerBuscador').hide();
  });
  

  var loginRetUrl = $('#btnLogin').attr('href');
  if (loginRetUrl !== undefined){
    loginRetUrl = loginRetUrl.replace('retUrl=/', 'retUrl='+location.href);
    $('#btnLogin').attr('href', loginRetUrl);
  }

  gmwa.components.header.menuBtn = $('#btnMenu i');
  $('#btnMenu').on('click', function(e){
    if (gmwa.components.header.menuCntr == undefined){
      gmwa.components.header.menuCntr = $('#headerToolbar');
      // gmwa.components.header.menuCntr.on('click', function(e){
      //   // gmwa.components.header.menuCntr.hide();
      //   // document.body.style.overflow = "hidden";
      //   gmwa.components.header.menuCntr.removeClass('show');
      //   gmwa.components.header.menuOpened = false;
      // });
      gmwa.components.header.menuCntr.show(function(){
        // document.body.style.overflow = "auto";
        gmwa.components.header.menuCntr.addClass('show');
      });
    }else{
      // document.body.style.overflow = "auto";
      gmwa.components.header.menuCntr.show(function(){
        gmwa.components.header.menuCntr.addClass('show');
      });
    }
  });
  $('#btnMenuClose').on('click', function(e){
    gmwa.components.header.menuCntr.removeClass('show');
    setTimeout(function(){
      gmwa.components.header.menuCntr.hide();
      // document.body.style.overflow = "auto";
    },400);
  });

  gmwa.components.header.initCrosshair();
};

gmwa.components.header.search = function() {
    var rubro = gmwa.components.header.slugify($('#search-rubroNombre').val().trim());
    var zona = gmwa.components.header.slugify($('#search-zonaNombre').val().trim());
    rubro = (!rubro) ? 'empresas' : rubro;
    zona = (!zona) ? 'todo-el-pais' : zona;

    if (!gmwa.components.header.crossHairActive){
      document.location = '/buscar/' + rubro + '/' + zona;
    }else{
      if (gmwa.components.header.coords && gmwa.components.header.coords.latitude){
        document.location = '/buscar/' + rubro + '/' + zona + '/' + 
          gmwa.components.header.coords.latitude + ',' + gmwa.components.header.coords.longitude;
      }else{
        document.location = '/buscar/' + rubro + '/' + zona;
      }
    }
}

gmwa.components.header.slugify = function(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    var to = "aaaaaeeeeeiiiiooooouuuunc------";
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes

    return str;
}

gmwa.components.header.initCrosshair = function() {
  // Check if feature is present
  if (!("geolocation" in navigator)) return;
  gmwa.components.header.crossHairActive = false;
  $('#cross').on('click', function(e){
    if (gmwa.components.header.crossHairActive){
      // Disable near-me
      $('#cross').removeClass('fa-close');
      $('#cross').addClass('fa-crosshairs');
      $('#search-zonaNombre').val('');
      $('#search-zonaNombre').prop('disabled', false);
      gmwa.components.header.crossHairActive = false;
      gmwa.storage.remove('_gmwa_nm');
    }else{
      // Activate near-me
      gmwa.components.header.activateNearMe();
    }
  });

  // Check previously NearMe activated 
  if (!gmwa.storage.isEmpty('_gmwa_nm')){
    try{
      $lastZoneData = gmwa.storage.get('_gmwa_nm');
    }catch(e){
      gmwa.logger.error('Header|Exception catched loading lastZoneData!');
      gmwa.logger.error(e);
      gmwa.storage.remove('_gmwa_nm');
    }
    // Check valid cache
    var currentTime = (new Date().getTime()) / 1000;
    if (currentTime - $lastZoneData.timestamp >= 300) {
      // Need to refresh
      gmwa.logger.log('Header|Refreshing lastZonaData...');
      gmwa.components.header.activateNearMe();
    }else{
      gmwa.logger.log('Header|Using cached lastZonaData...');
      gmwa.components.header.coords = $lastZoneData.coords;
      $('#cross').removeClass('fa-crosshairs');
      $('#cross').addClass('fa-close');
      $('#search-zonaNombre').val($lastZoneData.zoneName);
      $('#search-zonaNombre').prop('disabled', true);
      gmwa.components.header.crossHairActive = true;
    }
  }
}

gmwa.components.header.activateNearMe = function(){
  gmwa.components.header.getNearMe(function(zoneName){
    if (zoneName){
      // Enable near-me
      $('#cross').removeClass('fa-crosshairs');
      $('#cross').addClass('fa-close');
      $('#search-zonaNombre').val(zoneName);
      $('#search-zonaNombre').prop('disabled', true);
      var nearMeData = {
        zoneName  : zoneName,
        coords    : {
          latitude  : gmwa.components.header.coords.latitude,
          longitude : gmwa.components.header.coords.longitude
        },
        timestamp : (new Date().getTime()) / 1000
      }
      gmwa.storage.set('_gmwa_nm', JSON.stringify(nearMeData)); // Store NearMe value in storage
      gmwa.components.header.crossHairActive = true;
    }
  });
}

gmwa.components.header.getNearMe = function(cb){
  // Check if is enabled and show explanation to user on how to proceed
  // ...
  //
  navigator.geolocation.getCurrentPosition(function(position) {
    //do_something(position.coords.latitude, position.coords.longitude);
    gmwa.components.header.coords = position.coords;
    $.ajax({
      url      : '/zonanearestcoords/'+position.coords.latitude+'/'+position.coords.longitude,
      contentType:"application/json; charset=utf-8"
    }).done(function(datos){
      if (datos != null){
        cb(datos.nmz);
      }else{
        gmwa.logger.error('No zone found for coords: ' + position.coords.latitude + ' , ' + position.coords.longitude);
        cb(null);
      }
    }).fail(function(err){
      gmwa.logger.error('Error getting zone for coords: ' + position.coords.latitude + ' , ' + position.coords.longitude);
      gmwa.logger.error(err);
      cb(null)
    });
  });
}