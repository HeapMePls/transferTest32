var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.storeSmall = {};

gmwa.controllers.storeSmall.mobileCarritoOpened  = false;
gmwa.controllers.storeSmall.mobileCarritoQty     = null;
gmwa.controllers.storeSmall.mobileCarritoViewBtn = null;
gmwa.controllers.storeSmall.hoursOpened          = false;
gmwa.controllers.storeSmall.sectionsOpened       = false;
gmwa.controllers.storeSmall.colors               = ["#fc8c69","#006fed","#379300","#d300cf","#d1a504","#750072","#01a4a8","#b32e00","#4db8cd","#de95b9"];

var pList = {};
pList.plist = [];
var currentItem = {};
var idSelect = 0;
var carrito = null;
var productName = "";
var actualPrice = 0;
var selectPrice = 0;
var originalPrice = 0;
var aux = -1;
var city = "Montevideo";
var address1 = "";
var country = "Uruguay";

gmwa.controllers.storeSmall.init = function(){
  gmwa.logger.log('storeSmall|Init...');
  // $('.lazy').Lazy({effect: 'fadeIn'});
  gmwa.components.header.init();

  currentItem.customFields = [];
  // Add orderView and confirmation modal
  $('body').append($('<div class="reveal u-reveal small" id="addProduct" data-reveal data-v-offset="0" style="padding: 0px;max-width:600px;top:20px"><div class="u-reveal-body"></div></div>'));
  gmwa.controllers.storeSmall.addProductModal = $('#addProduct');
  gmwa.controllers.storeSmall.addProductModal.foundation();

  gmwa.controllers.storeSmall.addProductModal.on('closeme.zf.reveal', function() {
    if(!gmwa.controllers.storeSmall.modalOpen) gmwa.controllers.storeSmall.scrollPosition = $(document).scrollTop();
  });
  gmwa.controllers.storeSmall.addProductModal.on('open.zf.reveal', function() {
    gmwa.controllers.storeSmall.modalOpen = true;
  });
  gmwa.controllers.storeSmall.addProductModal.on('closed.zf.reveal', function() {
    $(document).scrollTop(gmwa.controllers.storeSmall.scrollPosition);
    gmwa.controllers.storeSmall.modalOpen = false;
  });;

  $('[data-reveal]').on('closed.zf.reveal', function () {
    if ($(this).attr('id') == 'addProduct'){
      // if (gmwa.controllers.storeSmall.imagesSwiper != null){
      //   gmwa.controllers.storeSmall.imagesSwiper.destroy();
      //   gmwa.controllers.storeSmall.imagesSwiper = undefined;
      // }
      $('#adImgGal').each(function(){
        if (this.swiper){
          this.swiper.destroy();
        }
      })
      $('#adImgGal').remove();
    }
  });
 
  $('#closeButton').click(function(e){
    gmwa.controllers.storeSmall.addProductModal.foundation('close');
  });
  
  $('.u-menu-item, .u-prod-card > a').click(function(e){
    e.preventDefault();
    gmwa.utils.showProgress('', '', false, false);
    productName = $(this).attr('data-name');
    token = $('#carritoCntr').data('token');
    if (token.length == 0) token = '-';
    var url = '/pd/component/' + $(this).data('id') +'/'+ $(this).attr('data-ids') +'/'+ 
               $(this).attr('data-ids') +'/'+ token+'/0/1';
               ///pd/component/{id}/{idr}/{ids}/{token}/{smi}/{fm}
    $.ajax(url).done(function(resp){
      // Load content
      $('#addProduct .u-reveal-body').html(resp);
      // Hook modal's buttons
      gmwa.controllers.storeSmall.addProductOpened(-1);
      // All ready, show now
      gmwa.controllers.storeSmall.addProductModal.foundation('open');
      gmwa.utils.hideProgress();
    });
  });

  $('#buttonCheckout, #lnkCheckout').click(function(e){
    if (!gmwa.controllers.storeSmall.goToCheckout()){
      e.preventDefault();
    }
  });

  // INIT MOBILE CARRITO
  $('#bottomCartView').click(function(e){
    if (gmwa.controllers.storeSmall.mobileCarritoOpened){
      $('#carritoCntr').hide();
      gmwa.controllers.storeSmall.mobileCarritoViewBtn.text('PEDIDO')
    }else{
      $('#carritoCntr').show();
      gmwa.controllers.storeSmall.mobileCarritoViewBtn.text('CERRAR')
    }
    gmwa.controllers.storeSmall.mobileCarritoOpened = !gmwa.controllers.storeSmall.mobileCarritoOpened;
  });
  $('#bottomCartClose').click(function(e){
    $('#carritoCntr').hide();
    gmwa.controllers.storeSmall.mobileCarritoViewBtn.text('PEDIDO')
    gmwa.controllers.storeSmall.mobileCarritoOpened = false;
  });
  gmwa.controllers.storeSmall.mobileCarritoViewBtn = $('#bottomCartView > :nth-child(2)');
  gmwa.controllers.storeSmall.mobileCarritoQty = $('#bottomCartView > :nth-child(3)');
  $('#btnprodgroups').click(function(e){
    if (gmwa.controllers.storeSmall.sectionsOpened){
      $('#prodgroups').hide();
    }else{
      $('#prodgroups').show();
    }
    gmwa.controllers.storeSmall.sectionsOpened = !gmwa.controllers.storeSmall.sectionsOpened;
  });
  $('#prodgroups ul li').click(function(e){
    if (Foundation.MediaQuery.is('small only')){
      $('#prodgroups').hide();
      gmwa.controllers.storeSmall.sectionsOpened = false;
    }
  });

  $('#hourToday').click(function(e){
    if(gmwa.controllers.storeSmall.hoursOpened){
      $('#restHours').hide();
    }else{
      $('#restHours').show();
    }
    gmwa.controllers.storeSmall.hoursOpened = !gmwa.controllers.storeSmall.hoursOpened;
  });


  if(window.loadCarrito != null){
    carrito = window.loadCarrito;
    gmwa.controllers.storeSmall.cartDraw();
  }

  // if (Foundation.MediaQuery.atLeast('medium')){
  //   $("#prodgroups").sticky({topSpacing:10,zIndex:100});
  //   //$("#carritoCntr").sticky({topSpacing:10,zIndex:100, bottomSpacing:340});
  // }

  // Add coverage modal
  // $('body').append($('<div class="reveal u-reveal large" id="viewCoverage" data-reveal><div class="u-reveal-body"></div></div>'));
  // gmwa.controllers.storeSmall.viewCoverageModal = $('#viewCoverage');
  // gmwa.controllers.storeSmall.viewCoverageModal.foundation();
  $('#openCoverage').click(function(e){
    e.preventDefault();
    if (window.coverageData === undefined){
      gmwa.controllers.storeSmall.viewCoverageModal = $('#viewCoverage');
      // var GET = document.location.href.split('/');
      // var idr = GET[GET.length - 3];
      // var ids = GET[GET.length - 2];
      var idr = $('#retInfoCntr').data('idr');
      var ids = $('#retInfoCntr').data('ids');
      var url = '/pedidos/listDeliveryCoverage/' + idr + '/' + ids;
      gmwa.utils.showProgress('','',false,false);
      $.ajax(url).done(function(resp){
        gmwa.utils.hideProgress();
        // Load content
        //$('#viewCoverage .u-reveal-body').html(resp);
        window.coverageData = resp;
        // All ready, show now
        gmwa.controllers.storeSmall.viewCoverageModal.foundation('open');
        setTimeout(function(){
          window.coverageData.storeLat = parseFloat(window.coverageData.storeLat);
          window.coverageData.storeLng = parseFloat(window.coverageData.storeLng);
          // Check URBAN coverage
          var bUrbanPresent = false;
          if (window.coverageData.zones.length > 0){
            if (gmwa.mapsFW == 0){
              gmwa.controllers.storeSmall.loadCoverageGMap();
            }else{
              gmwa.controllers.storeSmall.loadCoverageLMap();
            }
            bUrbanPresent = true;
          }else{
            $('#btnShowUrban').hide();
            $('#covUrban').hide();
          }
          // Check NATIONAL coverage
          if(window.coverageData.states.length > 0){
            var html = '<ul>';
            for (var i=0; i < window.coverageData.states.length; i++){
              html += '<li>'+window.coverageData.states[i].name+'<span> ( $U '+ window.coverageData.states[i].amount +')</span></li>'
            }
            html += "</ul>";
            $('#covNational > div').html(html);
            if (!bUrbanPresent){
              $('#covNational').show();
            }
          }else{
            $('#btnShowNational').hide();
            $('#covNational').hide();
          }
        }, 400);
      }).fail(function(err){
        gmwa.utils.hideProgress();
         gmwa.logger.error('listDeliveryCoverage | API returned error: ' + JSON.stringify(err));
      });
    }else{
      gmwa.controllers.storeSmall.viewCoverageModal.foundation('open');
    }
  });
  $('#btnShowUrban').click(function(){
    $('#btnShowUrban').css('font-weight', '600');
    $('#btnShowNational').css('font-weight', '100');
    $('#covUrban').show();
    $('#covNational').hide();
  });
  $('#btnShowNational').click(function(){
    $('#btnShowUrban').css('font-weight', '100');
    $('#btnShowNational').css('font-weight', '600');
    $('#covUrban').hide();
    $('#covNational').show();
  });

  // $("#ompaAdd").click(gmwa.controllers.storeSmall.addProduct);
  // $("#ompaCancel, #ompaCancelTimes").click(gmwa.controllers.storeSmall.addProductCancel);
  currentItem.customFields = [];
  currentItem.quantity = $('#quantityItem').val();
  currentItem.price = actualPrice;
  currentItem.originalPrice = actualPrice;
  originalPrice = actualPrice;
  

  var swiper = new Swiper("#swipHighlights", {
    slidesPerView: 1.3,
    paginationClickable: false,
    navigation: {
      nextEl: '#next-sw-nearprms',
      prevEl: '#prev-sw-nearprms'
    },
    spaceBetween: 10
  });

  // PRODUCTO DATOS PARA AGREGAR AL CARRITO
  // QUANTITY, CUSTOM FIELDS, NOTAS, ETC
  // gmwa.controllers.storeSmall.initProductControls();

  // Re-attach carritoCntr if is mobile
  if (gmwa.utils.isMobile()){
    var eCart = $('#carritoCntr').detach();
    $(document.body).append(eCart);
  }
}

gmwa.controllers.storeSmall.loadCoverageLMap = function(){
  gmwa.logger.log('Initializing LMaps...');
  var mapElement = $('#coverageMap');
  var izoom    = 16;
  var isMobile = mapElement.data('im');
  var lat = null;
  var lng = null;
  var bAddMarker = false;
  if (!isNaN(window.coverageData.storeLat)){
    lat = window.coverageData.storeLat;
    lng = window.coverageData.storeLng;
    bAddMarker = true;
  }else{
    lat = window.coverageData.zones[0].polygon[0].lat;
    lng = window.coverageData.zones[0].polygon[0].lng;
  }
  gmwa.components.maps.instance.initMapAsync('coverageMap', lat, lng, izoom, isMobile, function(map){
    gmwa.controllers.storeSmall.map = map;
    if (bAddMarker){
      gmwa.controllers.reportarError.marker = gmwa.components.maps.instance.addMarkerSimple(gmwa.controllers.storeSmall.map, lat, lng);
    }
    // Add polygons
    var zonesLength = window.coverageData.zones.length;
    var bounds = [];
    var labels = '';
    var labelCost = '';
    for(var i=0; i < zonesLength; i++){
      var multipolygon = L.polygon(window.coverageData.zones[i].polygon, {
        color  : gmwa.controllers.storeSmall.colors[i],
        weight : 1
      });
      multipolygon.addTo(gmwa.controllers.storeSmall.map);

      if (window.coverageData.zones[i].amount == 0){
        labelCost = 'sin costo';
      }else{
        labelCost = '$U '+window.coverageData.zones[i].amount;
      }
      labels += '<div style="background-color:'+gmwa.controllers.storeSmall.colors[i]+';width:15px;height:15px;display:inline-block;margin: -2px 4px -2px 10px;border-radius: 50%;"></div><div style="display:inline-block">'+window.coverageData.zones[i].name+' ('+labelCost+')</div>';

      bounds = bounds.concat(window.coverageData.zones[i].polygon);
    }
    gmwa.controllers.storeSmall.map.fitBounds(bounds);
    $('#coverageZonesDesc').html(labels);
  });
}

gmwa.controllers.storeSmall.loadCoverageGMap = function(){
  covMap = new google.maps.Map(document.getElementById('coverageMap'), {
    //zoom: 15,
    center: {lat: window.coverageData.storeLat, lng: window.coverageData.storeLng},
    styles: [
              {
                "elementType": "labels",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "administrative.land_parcel",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "administrative.neighborhood",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "administrative.neighborhood",
                "elementType": "geometry",
                "stylers": [
                  {
                    "visibility": "on"
                  }
                ]
              },
              {
                "featureType": "administrative.neighborhood",
                "elementType": "geometry.fill",
                "stylers": [
                  {
                    "visibility": "on"
                  }
                ]
              },
              {
                "featureType": "administrative.neighborhood",
                "elementType": "geometry.stroke",
                "stylers": [
                  {
                    "visibility": "on"
                  }
                ]
              },
              {
                "featureType": "administrative.neighborhood",
                "elementType": "labels",
                "stylers": [
                  {
                    "visibility": "on"
                  }
                ]
              },
              {
                "featureType": "administrative.neighborhood",
                "elementType": "labels.text",
                "stylers": [
                  {
                    "visibility": "on"
                  }
                ]
              },
              {
                "featureType": "administrative.neighborhood",
                "elementType": "labels.text.fill",
                "stylers": [
                  {
                    "color": "#0080ff"
                  },
                  {
                    "visibility": "on"
                  }
                ]
              },
              {
                "featureType": "administrative.neighborhood",
                "elementType": "labels.text.stroke",
                "stylers": [
                  {
                    "visibility": "on"
                  }
                ]
              },
              {
                "featureType": "poi",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              },
              {
                "featureType": "road.local",
                "elementType": "labels.text",
                "stylers": [
                  {
                    "visibility": "on"
                  }
                ]
              },
              {
                "featureType": "transit",
                "stylers": [
                  {
                    "visibility": "off"
                  }
                ]
              }
            ]
  });
  google.maps.event.addListenerOnce(covMap, 'idle', function(){
    var marker = new google.maps.Marker({
      map: covMap,
      position: {lat: window.coverageData.storeLat, lng: window.coverageData.storeLng}
    });
    var bounds = new google.maps.LatLngBounds();
    //http://tools.medialab.sciences-po.fr/iwanthue/
    
    var labels = '';
    var labelCost = '';
    var zonesLength = window.coverageData.zones.length;
    for(var i=0; i < zonesLength; i++){
      polygon = new google.maps.Polygon({
        paths: window.coverageData.zones[i].polygon,
        strokeColor: gmwa.controllers.storeSmall.colors[i],
        //strokeOpacity: 1.0,
        strokeWeight: 0.5,
        fillColor: gmwa.controllers.storeSmall.colors[i],
        fillOpacity: 0.35
      });
      polygon.zonaIndex = i;
      //window.coverageData.zones[i].polygon = polygon;
      polygon.setMap(covMap);
      for(var x=0; x < window.coverageData.zones[i].polygon.length; x++){
        bounds.extend(window.coverageData.zones[i].polygon[x]);
      }
      
      if (window.coverageData.zones[i].amount == 0){
        labelCost = 'sin costo';
      }else{
        labelCost = '$U '+window.coverageData.zones[i].amount;
      }
      labels += '<div style="background-color:'+gmwa.controllers.storeSmall.colors[i]+';width:15px;height:15px;display:inline-block;margin: -2px 4px -2px 10px;border-radius: 50%;"></div><div style="display:inline-block">'+window.coverageData.zones[i].name+' ('+labelCost+')</div>';
    }
    covMap.fitBounds(bounds)
    $('#coverageZonesDesc').html(labels);
  });
}

gmwa.controllers.storeSmall.initProductControls = function(){
  if(window.loadCustomFields != null){
    var aux = window.loadCustomFields;
    currentItem.customFields = aux.data.customFields;
  }
  var variantes = [];

  $('.u-menu-option option[data-variant=1]').each(function() {
    var cfId = $(this).data('id');
    var cfOpId = $(this).data('val');
    variantes.push({cfId: cfId,
                    cfOpId: cfOpId});
  });

  $('.u-menu-option input[data-variant=1]').each(function() {
    var cfId = $(this).data('id');
    var cfOpId = $(this).data('val');
    variantes.push({cfId: cfId,
                    cfOpId: cfOpId});
  });


  currentItem.quantity = $('#quantityItem').val();
  $("#ompaQtyMinus").click(function(){
    if (currentItem.quantity > 1){
      currentItem.quantity--;
      $("#ompaQtyNumber").html(currentItem.quantity);
      $("#quantityItem").val(currentItem.quantity);
      currentItem.price = gmwa.controllers.storeSmall.calculateItemPrice(currentItem);
      $("#priceCustom").html(gmwa.utils.formatNumberHTML(currentItem.price));
    }
  });
  $("#ompaQtyPlus").click(function(){
    if (currentItem.quantity < 20){
      currentItem.quantity++;
      $("#ompaQtyNumber").html(currentItem.quantity);
      $("#quantityItem").val(currentItem.quantity);
      currentItem.price = gmwa.controllers.storeSmall.calculateItemPrice(currentItem);
      $("#priceCustom").html(gmwa.utils.formatNumberHTML(currentItem.price));
    }
  });
 
  //CAMBIO EN SELECT
  $(".custom-list").change(function(){
    // Load item
    var custom = {};
    var optSelected = $('option:selected', this);
    var variant    = $(this).data('variant');
    custom.id      = parseInt(optSelected.attr("data-id"));
    custom.type    = 2;
    custom.val     = parseInt(optSelected.attr("data-val"));
    custom.name    = optSelected.data('name');
    custom.optName = optSelected.data('label');
    custom.price   = parseInt(optSelected.attr('data-extra'));
   
    if($(this).val() != 'null'){
      // Add or update
      //idSelect = custom.id;
      // actualPrice = actualPrice - selectPrice;
      // var extraSelect = parseInt($(this).find(':selected').attr('data-extraSelect'));
      // selectPrice = extraSelect;
      // actualPrice = actualPrice + selectPrice;
      for(var i = 0; i < currentItem.customFields.length; i++){
        if(currentItem.customFields[i].id == custom.id){
          currentItem.customFields.splice( i, 1 );
          break;
        }
      }
      currentItem.customFields.push(custom);
      // $("#priceCustom").text(actualPrice * currentItem.quantity);
      currentItem.price = gmwa.controllers.storeSmall.calculateItemPrice(currentItem);
      $("#priceCustom").html(gmwa.utils.formatNumberHTML(currentItem.price));
    }
    else{
      // Remove
      // actualPrice = actualPrice - selectPrice;
      // selectPrice = 0;
      for(var i = 0; i < currentItem.customFields.length; i++){
        if(currentItem.customFields[i].id == custom.id){
          currentItem.customFields.splice( i, 1 );
          break;
        }
      }
      //$("#priceCustom").text(actualPrice * currentItem.quantity);
      currentItem.price = gmwa.controllers.storeSmall.calculateItemPrice(currentItem);
      $("#priceCustom").html(gmwa.utils.formatNumberHTML(currentItem.price));
    }

    if(variant == 1){
      var myCfId = custom.id;
      var myCfOpId = custom.val;
      var optionSelected = $(this).find('option[data-val=' + myCfOpId + ']');
      if (optionSelected.data('unavailable') || myCfOpId == 0) {
        $('.u-menu-option input[data-variant=1]').each(function() {
          $(this).parent().removeClass('notavailable');
          $(this).prop('checked', false);
        });
        $('.u-menu-option select[data-variant=1] option').each(function() {
          var cfOpIdLabel = $(this).data('label');
          var cfOpId = $(this).data('val');
          var cfExtraSelect = Number($(this).data('extraselect'));
          if (cfOpId != 0) {
            $(this).text(cfOpIdLabel);
            if (cfExtraSelect > 0) {
              $(this).append(' + $' + cfExtraSelect);
            }
          }
        });
      }

      var variantData = {};
      variantData.pInstId = $("#datos").data("id");
      var available = optSelected.data('unavailable');
      variantData.pairs = [];
      variantData.clickedPair = {};
      variantData.clickedPair.cfId = custom.id;
      variantData.clickedPair.cfOpId = custom.val;
      variantData.pairs.push(variantData.clickedPair);

      for(var i = 0; i < currentItem.customFields.length; i++){
        if(currentItem.customFields[i].variant == 1){
          var pair = {};
          pair.cfId = currentItem.customFields[i].id;
          pair.cfOpId = currentItem.customFields[i].val;
          variantData.pairs.push(pair);
        }
      }
      var url = '/pd/variant';
      gmwa.utils.showProgress('', '', false, false);
      $.ajax({
        type     : "POST",
        url      : url,
        data     : JSON.stringify(variantData),
        dataType : 'json',
        contentType:"application/json; charset=utf-8"
      }).done(function(resData){
                
        $('.u-menu-option input[data-variant=1]').each(function() {
          var cfId = $(this).data('id');
          if(variantData.clickedPair.cfId != cfId) {
            $(this).parent().addClass('notavailable');
            $(this).attr('data-unavailable', true);
          }
        });
        
        $('.u-menu-option select[data-variant=1] option').each(function() {
          var valueLabel = $(this).text();
          var cfId = $(this).data('id');
          var cfOpId = $(this).data('val');
          if(variantData.clickedPair.cfId != cfId || variantData.clickedPair.cfOpId != cfOpId) {
            if (!valueLabel.includes('[NO DISPONIBLE]')) {
              $(this).text(valueLabel + ' [NO DISPONIBLE]');
            }
            $(this).attr('data-unavailable', true);
          }
        });

        resData.data.pairs.forEach(function(e) {
          $('#cf-' + e.cfId + '-' + e.cfOpId).parent().removeClass('notavailable');
          cleanLabel = $('.u-menu-option select[data-variant=1] option[data-val=' + e.cfOpId + ']').text().replace('[NO DISPONIBLE]', '');
          $('.u-menu-option select[data-variant=1] option[data-val=' + e.cfOpId + ']').text(cleanLabel);
  
          $('.u-menu-option select[data-variant=1] option[data-val=' + e.cfOpId + ']').attr('data-unavailable', false);
        })

        gmwa.utils.hideProgress();
      }).fail(function(err){
        gmwa.utils.hideProgress();
        gmwa.logger.error('Product variant | API returned error: ' + JSON.stringify(err));
      });
    }
  });

  //CAMBIO EN CHECKBOX
  $(".custom-check").change(function(){
    var checked = $(this).prop('checked');
    var extraCheck = parseInt($(this).attr("data-extra"));
    var custom = {};
    custom.id = parseInt($(this).attr("data-id"));
    custom.type = 1;
    custom.name = $(this).data('label');
    custom.price = extraCheck;
    
    if(!checked){
      //actualPrice = actualPrice - extraCheck;
      //BORRAR CUSTOM FIELD
      for(var i = 0; i < currentItem.customFields.length; i++){
        if(currentItem.customFields[i].id == custom.id){
          currentItem.customFields.splice( i, 1 );
        }
      }
    }
    else{
      //actualPrice = actualPrice + extraCheck;
      //AGREGAR CUSTOM FIELD
      currentItem.customFields.push(custom);
    }
    //$("#priceCustom").text(actualPrice * currentItem.quantity);
    currentItem.price = gmwa.controllers.storeSmall.calculateItemPrice(currentItem);
    $("#priceCustom").html(gmwa.utils.formatNumberHTML(currentItem.price));
  });

  //CAMBIO EN RADIO
  $(".custom-radio").change(function(){
    // Load item
    var custom = {};
    var optSelected = $(this);
    custom.id      = parseInt(optSelected.attr("data-id"));
    custom.type    = 2;
    var variant    = optSelected.data('variant');
    custom.val     = parseInt(optSelected.attr("data-val"));
    custom.name    = optSelected.data('name');
    custom.optName = optSelected.data('label');
    custom.price   = parseFloat($(this).attr('data-extra'));

    if($(this).val() != 'null'){
      // Add or update
      //idSelect = custom.id;
      // actualPrice = actualPrice - selectPrice;
      // var extraSelect = parseInt($(this).find(':selected').attr('data-extraSelect'));
      // selectPrice = extraSelect;
      // actualPrice = actualPrice + selectPrice;
      for(var i = 0; i < currentItem.customFields.length; i++){
        if(currentItem.customFields[i].id == custom.id){
          currentItem.customFields.splice( i, 1 );
          break;
        }
      }
      currentItem.customFields.push(custom);
      // $("#priceCustom").text(actualPrice * currentItem.quantity);
      currentItem.price = gmwa.controllers.storeSmall.calculateItemPrice(currentItem);
      $("#priceCustom").html(gmwa.utils.formatNumberHTML(currentItem.price));
    }
    else{
      // Remove
      // actualPrice = actualPrice - selectPrice;
      // selectPrice = 0;
      for(var i = 0; i < currentItem.customFields.length; i++){
        if(currentItem.customFields[i].id == custom.id){
          currentItem.customFields.splice( i, 1 );
          break;
        }
      }
      //$("#priceCustom").text(actualPrice * currentItem.quantity);
      currentItem.price = gmwa.controllers.storeSmall.calculateItemPrice(currentItem);
      $("#priceCustom").html(gmwa.utils.formatNumberHTML(currentItem.price));
    }

    if(variant == 1){
      var myCfId = custom.id;
      var myCfOpId = custom.val;
      var optionSelected = $(this).find('option[data-val=' + myCfOpId + ']');
      if ($(this).parent().hasClass('notavailable')) {
        $('.u-menu-option input[data-variant=1]').each(function() {
          $(this).parent().removeClass('notavailable');
          if ($(this).attr('id') != 'cf-' + myCfId + '-' + myCfOpId) {
            $(this).prop('checked', false);
          }
        });
        $('.u-menu-option select[data-variant=1] option').val('');
        $('.u-menu-option select[data-variant=1] option').each(function() {
          var cfOpId = $(this).data('val');
          var cfOpIdLabel = $(this).text();
          if (cfOpId != 0) {
            $(this).text(cfOpIdLabel);
          }

        });
      }
      
      var variantData = {};
      variantData.pInstId = $("#datos").data("id");
      var available = optSelected.data('unavailable');
      variantData.pairs = [];
      variantData.clickedPair = {};
      variantData.clickedPair.cfId = custom.id;
      variantData.clickedPair.cfOpId = custom.val;
      variantData.pairs.push(variantData.clickedPair);

      for(var i = 0; i < currentItem.customFields.length; i++){
        if(currentItem.customFields[i].variant == 1){
          var pair = {};
          pair.cfId = currentItem.customFields[i].id;
          pair.cfOpId = currentItem.customFields[i].val;
          variantData.pairs.push(pair);
        }
      }
      var url = '/pd/variant';
      gmwa.utils.showProgress('', '', false, false);
      $.ajax({
        type     : "POST",
        url      : url,
        data     : JSON.stringify(variantData),
        dataType : 'json',
        contentType:"application/json; charset=utf-8"
      }).done(function(resData){
                
        $('.u-menu-option input[data-variant=1]').each(function() {
          var cfId = $(this).data('id');
          var cfOpId = $(this).data('val');
          if(variantData.clickedPair.cfId != cfId || variantData.clickedPair.cfOpId != cfOpId) {
            $(this).parent().addClass('notavailable');
            $(this).attr('data-unavailable', true);
          }
        });
        
        $('.u-menu-option select[data-variant=1] option').each(function() {
          var valueLabel = $(this).text();
          var cfId = $(this).data('id');
          var cfOpId = $(this).data('val');
          if (!valueLabel.includes('[NO DISPONIBLE]')) {
            $(this).text(valueLabel + ' [NO DISPONIBLE]');
          }
          $(this).attr('data-unavailable', true);
        });

        resData.data.pairs.forEach(function(e) {
          $('#cf-' + e.cfId + '-' + e.cfOpId).parent().removeClass('notavailable');
          cleanLabel = $('.u-menu-option select[data-variant=1] option[data-val=' + e.cfOpId + ']').text().replace('[NO DISPONIBLE]', '');
          $('.u-menu-option select[data-variant=1] option[data-val=' + e.cfOpId + ']').text(cleanLabel);
  
          $('.u-menu-option select[data-variant=1] option[data-val=' + e.cfOpId + ']').attr('data-unavailable', false);
        })

        gmwa.utils.hideProgress();
      }).fail(function(err){
        gmwa.utils.hideProgress();
        gmwa.logger.error('Product variant | API returned error: ' + JSON.stringify(err));
      });
    }
  });

  // SPECIAL INSTRUCTIONS
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

  $('#ompaModify').click(function(e){

  })
}

gmwa.controllers.storeSmall.goToCheckout = function(){
  if (carrito == null || carrito.items.length === 0){
    gmwa.utils.showError('El carrito esta vacio', 'Agrega algunos productos antes de finalizar la compra');
    return false;
  }else{
    return true;
    // var GET = document.location.href.split('/');
    // var token = GET[GET.length - 1];
    // var ids = GET[GET.length - 2];
    // var idr = GET[GET.length - 3];
    // var url = '/pedido/checkout/' + token;
    // window.location = '/pedido/checkout/'+idr+'/'+ids+'/'+token;
    // $.ajax(url).done(function(resp){
    //   // Load content
    //   $('#addProduct .u-reveal-body').html(resp);
    //   // Hook modal's buttons
    //   gmwa.controllers.storeSmall.checkoutOptions(token, idr, ids);
    //   // All ready, show now
    //   gmwa.controllers.storeSmall.addProductModal.foundation('open');
    // })
  }
}

gmwa.controllers.storeSmall.addProductOpened = function(lineId){
  //if (e.namespace == 'fndtn.reveal'){ // Special workaround
  selectPrice = 0;
  //actualPrice = parseFloat($("#priceCustom").data('price'));
  actualPrice = parseFloat($("#price").val());
  if(lineId > 0){
    $("#ompaAdd").click(gmwa.controllers.storeSmall.modifyProduct);
    $("#ompaAdd").text('Actualizar');
    $("#ompaCancel, #ompaCancelTimes").click(gmwa.controllers.storeSmall.addProductCancel);
    currentItem   = gmwa.controllers.storeSmall.cartGetItem(lineId);
    originalPrice = parseFloat($("#productOrigPrice").val());
  }else{
    $("#ompaAdd").click(gmwa.controllers.storeSmall.addProduct);
    $("#ompaCancel, #ompaCancelTimes").click(gmwa.controllers.storeSmall.addProductCancel);
    currentItem.customFields  = [];
    currentItem.quantity      = $('#quantityItem').val();
    currentItem.price         = actualPrice;
    currentItem.originalPrice = actualPrice;
    originalPrice             = actualPrice;
  }

  // PRODUCTO DATOS PARA AGREGAR AL CARRITO
  // QUANTITY, CUSTOM FIELDS, NOTAS, ETC
  gmwa.controllers.storeSmall.initProductControls();
  
  // Init swiper for images
  $('.swiper-wrapper').attr('style', '');
  setTimeout(function(){
    gmwa.controllers.storeSmall.imagesSwiper = new Swiper('#adImgGal', {
      slidesPerView: 1,
      paginationClickable: false,
      spaceBetween: 0,
      pagination: {
        el: '#adImgGalPag',
        type: 'bullets',
      },
    });

    // PhotoSwiper init
    gmwa.controllers.storeSmall.pswp = $('.pswp')[0];
    gmwa.controllers.storeSmall.pswpItems = [];
    // Load photoswiper items
    $('.additional-image, #adImgGal img').each(function() {
      if ($(this).attr('id') != 'moreImages') {
        var $href   = $(this).data('zoom-image'),
          $size   = $(this).data('size').split('x'),
          $width  = $size[0],
          $height = $size[1];
        var item = {
          src : $href,
          w   : $width,
          h   : $height
        }
        gmwa.controllers.storeSmall.pswpItems.push(item);
      }
    });
    // Initialize PhotoSwipe click
    $('#adImgGal img').on('click', function(event) {
      event.preventDefault();
      var imgIndex = parseInt($(this).data("index"));
      var options = {
        index           : imgIndex,
        bgOpacity       : 0.7,
        showHideOpacity : true,
        shareEl         : false,
        fullscreenEl    : false,
        tapToClose      : true,
        preload         : [0, 0]
      }
      var lightBox = new PhotoSwipe(
        gmwa.controllers.storeSmall.pswp, 
        PhotoSwipeUI_Default, 
        gmwa.controllers.storeSmall.pswpItems, 
        options
      );
      lightBox.init();
    });
  }, 500); 
}

gmwa.controllers.storeSmall.addProductCheckMandatories = function(){
  var requiredCFs = [];
  var isValid = true;

  // Evaluo tipo radio y check
  $('.u-menu-option-options input[required]').each(function() {
    var arrId     = $(this).attr('id').split('-');
    var cfLabel   = $(this).data('name');
    var cfId      = $(this).data('id');
    var cfOpId    = Number(arrId[2]);
    var cfChecked = $(this).is(':checked');
    var pair      = {'cfId': cfId, 'cfOpId': cfOpId, 'cfLabel': cfLabel, 'checked': cfChecked}
    requiredCFs.push(pair);
  });

  var prevCfId  = 0;
  var isChecked = false;
  for(var i = 0; i < requiredCFs.length; i++) {
    // Si no hay cfId previa es porque es la primera
    if(prevCfId == 0) {
      prevCfId = requiredCFs[i].cfId;
    }
    // Si cfId previa es diferente a la cfId es porque cambié de grupo y si isChecked es false
    // es porque no se seleccionó ninún elemento en ese grupo
    if ((prevCfId != requiredCFs[i].cfId)) {
      if (!isChecked) {
        gmwa.logger.log('Required custom field ' + requiredCFs[i-1].cfId + '-' + requiredCFs[i-1].cfLabel + ' is not checked');
        isValid = false;
      }
      // Como paso a otro CF vuelvo isChecked a false para controlar su conjunto
      isChecked = false;
    }
    if(requiredCFs[i].checked) {
      isChecked = true;
    }
    if(i + 1 == requiredCFs.length && !isChecked) {
      gmwa.logger.log('Required custom field ' + requiredCFs[i].cfId + '-' + requiredCFs[i].cfLabel + ' is not checked 2');
      isValid = false;
    }
    prevCfId = requiredCFs[i].cfId;
  }

  // Evaluo tipo Select
  $('.u-menu-option-options select[required]').each(function() {
    cfId = $(this).val();
    if (cfId == '') {
      cfLabel = $(this).data('valcustomname');
      gmwa.logger.log('Required custom field ' + cfLabel + ' is not checked');
    }
  });
  var validCFs = true;
  requiredCFs.forEach(function(el) {
    var i = 0;
  });
  return isValid;
}

gmwa.controllers.storeSmall.addProduct = function(e){
  e.preventDefault();

  // Process form
  //gmwa.logger.log("El producto es " + $("#datos").data("id") + " con cantidad: " + currentItem.quantity);

  var serverObject = gmwa.controllers.storeSmall.getMainIDs();
  var fecha = new Date();
  serverObject.dateTo = [fecha.getMonth()+1,
               fecha.getDate(),
               fecha.getFullYear()].join('/')+' '+
              [fecha.getHours(),
               fecha.getMinutes(),
               fecha.getSeconds()].join(':');
  currentItem.notes   = $("#additionalNotes").val();
  if (currentItem.quantity && currentItem.quantity > 1){
    currentItem.price   = $("#datos").data("price") * currentItem.quantity;
  }else{
    currentItem.price   = $("#datos").data("price");
  }
  currentItem.id      = $("#datos").data("id");

  serverObject.token  = $("#token").val();
  serverObject.idr    = $("#retInfoCntr").data("idr");
  serverObject.ids    = $("#retInfoCntr").data("ids");
  serverObject.type   = $("#retInfoCntr").data("stype");
  serverObject.plist  = [];
  serverObject.plist.push(currentItem);
  var data = JSON.stringify(serverObject);  
  var url = '/pedido/agregar';
  currentItem.productName = productName;
  //currentItem.price = actualPrice * currentItem.quantity;
  if (gmwa.controllers.storeSmall.addProductCheckMandatories()){
    $('#lblError').html('');
  }else{
    $('#lblError').html('<strong>Campos invalidos</strong> Ingrese todos los datos obligatorios');
    return;
  }

  gmwa.utils.showProgress('', '', false, false);
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
      currentItem.lineId = resData.data.lineId;
      gmwa.controllers.storeSmall.cartAdd(currentItem);
      gmwa.controllers.storeSmall.cartDraw();  
    }else{
      gmwa.logger.error('Order Add Product | API returned error: ' + JSON.stringify(resData));
    }
    gmwa.utils.hideProgress();
  }).fail(function(err){
    gmwa.logger.error('Order Add Product | API returned error: ' + JSON.stringify(err));
    gmwa.utils.hideProgress();
  });
  
  // Close modal
  gmwa.controllers.storeSmall.addProductModal.foundation('close');
}

gmwa.controllers.storeSmall.modifyProduct = function(e){
  e.preventDefault();
  // Process form
  gmwa.logger.log("El producto a modificar es " + $("#ompaId").val() + " con cantidad: " + $("#ompaQty").val());

  currentItem.notes = $("#textArea").val();

  var serverObject = {};
  serverObject.idr = $('#idr').val();
  serverObject.ids = $('#ids').val();
  serverObject.token = $('#token').val();
  serverObject.lineId = $('#lineId').val();
  serverObject.customFields = currentItem.customFields;
  serverObject.notes = currentItem.notes;
  serverObject.quantity = currentItem.quantity;
  
  var data = JSON.stringify(serverObject);    
  var url = '/pedido/editar';
  
  //currentItem.price = actualPrice * currentItem.quantity;
  gmwa.utils.showProgress('', '', false, false);
  $.ajax({
    type     : "POST",
    url      : url,
    data     : data,
    dataType : 'json',
    contentType:"application/json; charset=utf-8"
  }).done(function(resData){
    if (resData.meta.status == 200){
      gmwa.logger.log('Order Edit Product | API returned OK: ' + JSON.stringify(resData));
      gmwa.logger.log(data);
      gmwa.controllers.storeSmall.cartEdit(currentItem);
      gmwa.controllers.storeSmall.cartDraw();
      
    }else{
      gmwa.logger.error('Order Edit Product | API returned error: ' + JSON.stringify(resData));
    }
    gmwa.utils.hideProgress();
  }).fail(function(err){
    gmwa.utils.hideProgress();
    gmwa.logger.error('Order Edit Product | API returned error: ' + JSON.stringify(err));
  });
  
  // Close modal
  gmwa.controllers.storeSmall.addProductModal.foundation('close');
}

gmwa.controllers.storeSmall.addProductCancel = function(e){
  // Close modal
  gmwa.controllers.storeSmall.addProductModal.foundation('close');
}

gmwa.controllers.storeSmall.iniciarAdministrador = function(){
  $('.line-edit').click(function(e){
    e.preventDefault();
    var auxArray = {};
    auxArray.productId = $(this).attr('data-id');
    auxArray.lineId = $(this).attr('data-lineId');
    auxArray.token = carrito.token;
    auxArray.idr = carrito.idr;
    auxArray.ids = carrito.ids;
    auxArray.type = 0;
    var url = '/pd/component/' + auxArray.productId +'/'+ auxArray.idr +'/'+ 
               auxArray.ids +'/'+ auxArray.token + '/0/1?lineId=' + auxArray.lineId;
    gmwa.utils.showProgress('', '', false, false);
    $.ajax(url).done(function(resp){
      $('#addProduct .u-reveal-body').html(resp);
      gmwa.controllers.storeSmall.addProductOpened(auxArray.lineId);
      gmwa.controllers.storeSmall.addProductModal.foundation('open');
      gmwa.utils.hideProgress();
    }).fail(function(err){
      gmwa.utils.hideProgress();
      gmwa.logger.error('Order Modify Product | API returned error: ' + JSON.stringify(err));
    });
  });

  $('.line-delete').click(function(e){
     e.preventDefault();
     var auxArray = {};
     var auxId = $(this).attr('data-id');
     auxArray.token = carrito.token;
     auxArray.idr = carrito.idr;
     auxArray.ids = carrito.ids;
     auxArray.lineId = $(this).attr('data-lineId');
     var data = JSON.stringify(auxArray);    
     var url = '/pedido/quitar';
     gmwa.utils.showProgress('', '', false, false);
     $.ajax({
        type     : "POST",
        url      : url,
        data     : data,
        dataType : 'json',
        contentType:"application/json; charset=utf-8"
      }).done(function(resData){
        if (resData.meta.status == 200){
          gmwa.logger.log('Order Remove Product | API returned OK: ' + JSON.stringify(resData));
          gmwa.logger.log(data);
          gmwa.controllers.storeSmall.cartDelete(auxArray.lineId);
          gmwa.controllers.storeSmall.cartDraw();
        }else{
          gmwa.logger.error('Order Add Product | API returned error: ' + JSON.stringify(resData));
        }
        gmwa.utils.hideProgress();
      }).fail(function(err){
        gmwa.utils.hideProgress();
        gmwa.logger.error('Order Add Product | API returned error: ' + JSON.stringify(err));
      });

     
  });
}

gmwa.controllers.storeSmall.calculateItemPrice = function(item){
  var total = parseInt(item.originalPrice);
  for(var i=0; i < item.customFields.length; i++){
    if(item.customFields[i].type == 1){
      if(item.customFields[i].price != undefined && item.customFields[i].price != null){
        total = parseInt(total) + parseInt(item.customFields[i].price);
      }
    }
    else if(item.customFields[i].type == 2 || item.customFields[i].type == 3){
      if(Array.isArray(item.customFields[i].val)){
        for(var j=0; j < item.customFields[i].val.length; j ++){
          if(item.customFields[i].val[j].checked != undefined && item.customFields[i].val[j].checked == true){
            if(item.customFields[i].val[j].price != undefined && item.customFields[i].val[j].price != null){
              total = parseInt(total) + parseInt(item.customFields[i].val[j].price);
            }
          }
        }
      }
      else{
        if(item.customFields[i].price != undefined && item.customFields[i].price != null){
          total = parseInt(total) + parseInt(item.customFields[i].price);
        }
      }
    }
  }
  total = parseInt(total) * parseInt(item.quantity);
  return total;
}

gmwa.controllers.storeSmall.cartDraw = function(){
  var carritoHtml = '';
  var cfText = '';
  var cfAdded = false;
  var subtotal = 0;
  var taxes = 0;

  // Check Empty
  if (carrito.items.length == 0){
    carritoHtml = '<tr><td style="font-size: 12px;text-align: center;padding: 30px;">Nada por aqui. Busca un producto y agregalo a tu carrito</td></tr>';
  }else{
    for(var i=0; i < carrito.items.length; i++){
      cfText = '';
      cfAdded = false;

      if (carrito.items[i].notes && carrito.items[i].notes.length > 0){
        cfAdded = true;
        if (carrito.items[i].notes.length > 20){
          cfText = '<p>' + carrito.items[i].notes.substring(0, 15) + '... ';
        }else{
          cfText = '<p>' + carrito.items[i].notes + ' ';
        }
      }

      for(var x=0; x < carrito.items[i].customFields.length; x++){
        if (cfAdded){
          cfText += ', ';
        }else{
          cfText = '<p>';
          cfAdded = true;
        }
        if (carrito.items[i].customFields[x].type == 2){
          cfText += carrito.items[i].customFields[x].name + ": " + carrito.items[i].customFields[x].optName;
          if (carrito.items[i].customFields[x].price > 0){
            cfText += '<span style="font-size:90%"> (' + gmwa.utils.formatNumberHTML(carrito.items[i].customFields[x].price) + ')</span>';
          }
        }else{
          cfText += carrito.items[i].customFields[x].name;
          if (carrito.items[i].customFields[x].price > 0){
            cfText += '<span style="font-size:90%"> (' + gmwa.utils.formatNumberHTML(carrito.items[i].customFields[x].price) + ')</span>';
          }
        }
      }
      if (cfAdded){
        cfText += '</p>';
      }
      var objPrice = gmwa.utils.formatNumberObject(carrito.items[i].price);
      carritoHtml += '<tr id="order-'+ carrito.items[i].lineId +'" style="border-top: 1px solid #EEE;">'+
                      '<td>'+ carrito.items[i].productName +cfText+'<div>'+
                      '<a href="" class="line-edit" data-lineId='+ carrito.items[i].lineId +' data-id='+ carrito.items[i].id +' id="modifyOrder-'+ carrito.items[i].lineId +'">Modificar </a>'+
                      '<a href="" class="line-delete" data-lineId='+ carrito.items[i].lineId +' data-id='+ carrito.items[i].id +' id="deleteOrder-'+ carrito.items[i].lineId +'">Quitar</a></div></td>'+
                      '<td>x'+ carrito.items[i].quantity +'</td>' + 
                      '<td class="price" style="text-align:right"><span class="currency">'+ objPrice.currency + ' </span>'+ objPrice.number +'<span class="decimals">,' + objPrice.decimals + '</span></td>'+
                      '</tr>';  
      subtotal += carrito.items[i].price;
    }
    subtotal = parseFloat(Math.round(subtotal * 100) / 100);
    oSubTotal = gmwa.utils.formatNumberObject(subtotal);
    carritoHtml += '<tr style="border-top: 2px solid #DDD;"><td colspan="2" style="text-align:right;bstore-top: 1px dashed #DDD;padding-bottom: 1px;">Sub-total:</td><td style="bstore-top: 1px dashed #DDD;padding-bottom: 1px;text-align:right" class="price"><span class="currency">'+ oSubTotal.currency + ' </span>'+ oSubTotal.number +'<span class="decimals">,' + oSubTotal.decimals + '</span></td></tr>';
    // taxes = (subtotal * 0.23);
    // taxes = parseFloat(Math.round(taxes * 100) / 100).toFixed(2);
    // carritoHtml += '<tr><td colspan="2" style="text-align:right;padding-bottom: 1px;">Impuestos:</td><td style="padding-bottom: 1px;">' + taxes + '</td></tr>';
    
    total = parseFloat(Math.round((subtotal + parseFloat(taxes)) * 100) / 100);
    oTotal = gmwa.utils.formatNumberObject(total);
    carritoHtml += '<tr><td colspan="2" style="text-align:right;padding-bottom: 1px;font-size: 20px;">Total:</td><td style="color: #159de1;font-weight: 600;padding-bottom: 1px;font-size: 20px;text-align:right" class="price"><span class="currency">'+ oTotal.currency + ' </span>'+ oTotal.number +'<span class="decimals">,' + oTotal.decimals + '</span></td></tr>';
  }

  $('#carrito').html(carritoHtml);
  gmwa.controllers.storeSmall.iniciarAdministrador();

  gmwa.controllers.storeSmall.cartUpdateMobileQty();
}

gmwa.controllers.storeSmall.cartInit = function(){
  var fecha = new Date();
  // var GET = document.location.href.split('/');
  carrito = gmwa.controllers.storeSmall.getMainIDs();
  carrito.dateTo = [fecha.getMonth()+1,
               fecha.getDate(),
               fecha.getFullYear()].join('/')+' '+
              [fecha.getHours(),
               fecha.getMinutes(),
               fecha.getSeconds()].join(':');
  // carrito.idr = GET[GET.length - 3];
  // carrito.ids = GET[GET.length - 2];
  // carrito.token = GET[GET.length - 1];
  carrito.items = [];
}

gmwa.controllers.storeSmall.cartAdd = function(item){
  var localItem = $.extend({}, item);
  if (carrito === null){
    gmwa.controllers.storeSmall.cartInit();
  }
  carrito.items.push(localItem);
  gmwa.controllers.storeSmall.cartUpdateMobileQty();
}

gmwa.controllers.storeSmall.cartEdit = function(item){
  var localItem = $.extend({}, item);
  if (carrito === null){
    gmwa.controllers.storeSmall.cartInit();
  }
  for(var i=0; i < carrito.items.length; i++){
    if (carrito.items[i].lineId == localItem.lineId){
      carrito.items[i] = localItem;
      break;
    }
  }
}

gmwa.controllers.storeSmall.cartDelete = function(lineId){
  if (carrito === null){
    gmwa.controllers.storeSmall.cartInit();
  }
  for(var i=0; i < carrito.items.length; i++){
    if (carrito.items[i].lineId == lineId){
      carrito.items.splice(i, 1);
      break;
    }
  }
  gmwa.controllers.storeSmall.cartUpdateMobileQty();
}

gmwa.controllers.storeSmall.cartGetItem = function(lineId){
  for(var i=0; i < carrito.items.length; i++){
    if (carrito.items[i].lineId == lineId){
      return carrito.items[i];
    }
  }
}

gmwa.controllers.storeSmall.cartUpdateMobileQty = function(){
  var qty = carrito.items.length;
  if (qty > 0){
    gmwa.controllers.storeSmall.mobileCarritoQty.css('display','inline-block');
    gmwa.controllers.storeSmall.mobileCarritoQty.text(qty);
  }else{
    gmwa.controllers.storeSmall.mobileCarritoQty.css('display','none');
  }
}

gmwa.controllers.storeSmall.getMainIDs = function(){

  var serverObject = {};
  //
  // New Method
  //
  var eToken = document.getElementById('token');
  var eIDR = document.getElementById('idr');
  var eIDS = document.getElementById('ids');
  if (eToken && eIDR && eIDS){
    serverObject.token = eToken.value;
    serverObject.idr   = eIDR.value;
    serverObject.ids   = eIDS.value;
    return serverObject;
  }


  var loc = document.location.href;
  // obtenemos un array con cada clave=valor
  var GET = loc.split('/');
  if(GET[3] == 'store'){
    if(GET.length > 8){
      serverObject.idr = GET[GET.length - 5];
      serverObject.ids = GET[GET.length - 4];
      var tmpToken = GET[GET.length - 1];
      var tmpTokenArr = tmpToken.split('#');
      serverObject.token = tmpTokenArr[0]
    }
    else{
      serverObject.idr = GET[GET.length - 4];
      serverObject.ids = GET[GET.length - 3];
    }
  }else if(GET[3] == 'pedido'){
    if(GET.length > 8){
      var tmpToken = GET[GET.length - 1];
      var tmpTokenArr = tmpToken.split('#');
      serverObject.token = tmpTokenArr[0];
      serverObject.ids = GET[GET.length - 2];
    } 
    else{
      serverObject.ids = GET[GET.length - 1];
    }
  }
  return serverObject;
}