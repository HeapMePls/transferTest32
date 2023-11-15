var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.storeBig = {};

gmwa.controllers.storeBig.mobileCarritoOpened  = false;
gmwa.controllers.storeBig.mobileCarritoQty     = null;
gmwa.controllers.storeBig.mobileCarritoViewBtn = null;
gmwa.controllers.storeBig.hoursOpened          = false;
gmwa.controllers.storeBig.sectionsOpened       = false;
gmwa.controllers.storeBig.colors               = ["#fc8c69","#006fed","#379300","#d300cf","#d1a504","#750072","#01a4a8","#b32e00","#4db8cd","#de95b9"];

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

gmwa.controllers.storeBig.init = function(){
  
  var isMobile = gmwa.utils.isMobile();
  
  gmwa.logger.log('storeBig|Init...');
  // $('.lazy').Lazy({effect: 'fadeIn'});
  gmwa.components.header.init();

  currentItem.customFields = [];
  currentItem.quantity = $('#quantityItem').val();
  // console.log(currentItem.quantity);
  // console.log("------------------------------------------- ARRIBA BIG");
  // Add storeView and confirmation modal
  $('body').append($('<div class="reveal u-reveal small" id="addProduct" data-reveal><div class="u-reveal-body"></div></div>'));
  gmwa.controllers.storeBig.addProductModal = $('#addProduct');
  gmwa.controllers.storeBig.addProductModal.foundation();
 
  $('#closeButton').click(function(e){
    gmwa.controllers.storeBig.addProductModal.foundation('close');
  });
  
  $('.u-menu-item').click(function(e){
    e.preventDefault();
    gmwa.utils.showProgress('', '', false, false);
    productName = $(this).attr('data-name');
    var url = '/pedido/producto/' + $(this).data('id') + '/' + 1;;
    $.ajax(url).done(function(resp){
      // Load content
      $('#addProduct .u-reveal-body').html(resp);
      // Hook modal's buttons
      gmwa.controllers.storeBig.addProductOpened(-1);
      // All ready, show now
      gmwa.controllers.storeBig.addProductModal.foundation('open');
      gmwa.utils.hideProgress();
    });
  });

  $('#buttonCheckout, #lnkCheckout').click(function(e){
    e.preventDefault();
    gmwa.controllers.storeBig.goToCheckout();
  });

  // INIT MOBILE CARRITO
  $('#bottomCartView').click(function(e){
    if (gmwa.controllers.storeBig.mobileCarritoOpened){
      $('#carritoCntr').hide();
      gmwa.controllers.storeBig.mobileCarritoViewBtn.text('PEDIDO')
    }else{
      $('#carritoCntr').show();
      gmwa.controllers.storeBig.mobileCarritoViewBtn.text('CERRAR')
    }
    gmwa.controllers.storeBig.mobileCarritoOpened = !gmwa.controllers.storeBig.mobileCarritoOpened;
  });
  $('#bottomCartClose').click(function(e){
    $('#carritoCntr').hide();
    gmwa.controllers.storeBig.mobileCarritoViewBtn.text('PEDIDO')
    gmwa.controllers.storeBig.mobileCarritoOpened = false;
  });
  gmwa.controllers.storeBig.mobileCarritoViewBtn = $('#bottomCartView > :nth-child(2)');
  gmwa.controllers.storeBig.mobileCarritoQty = $('#bottomCartView > :nth-child(3)');
  $('#btnprodgroups').click(function(e){
    if (gmwa.controllers.storeBig.sectionsOpened){
      $('#prodgroups').hide();
    }else{
      $('#prodgroups').show();
    }
    gmwa.controllers.storeBig.sectionsOpened = !gmwa.controllers.storeBig.sectionsOpened;
  });
  $('#prodgroups ul li').click(function(e){
    if (Foundation.MediaQuery.is('small only')){
      $('#prodgroups').hide();
      gmwa.controllers.storeBig.sectionsOpened = false;
    }
  });

  $('#hourToday').click(function(e){
    if(gmwa.controllers.storeBig.hoursOpened){
      $('#restHours').hide();
    }else{
      $('#restHours').show();
    }
    gmwa.controllers.storeBig.hoursOpened = !gmwa.controllers.storeBig.hoursOpened;
  });


  if(window.loadCarrito != null){
    carrito = window.loadCarrito;
    //gmwa.controllers.storeBig.cartDraw();
  }

  // prodgroups DOES NOT EXISTS!!
  // if (Foundation.MediaQuery.atLeast('medium')){
  //   // Initialize Sticky
  //   var elementStk = document.createElement("script");
  //   elementStk.src = '/js/vendors/sticky/jquery.sticky.js';
  //   elementStk.onload = function(){
  //     $("#prodgroups").sticky({topSpacing:10,zIndex:100});
  //     //$("#carritoCntr").sticky({topSpacing:10,zIndex:100, bottomSpacing:340});
  //   }
  //   document.body.appendChild(elementStk);
  // }

  // Add coverage modal
  // $('body').append($('<div class="reveal u-reveal large" id="viewCoverage" data-reveal><div class="u-reveal-body"></div></div>'));
  // gmwa.controllers.storeBig.viewCoverageModal = $('#viewCoverage');
  // gmwa.controllers.storeBig.viewCoverageModal.foundation();
  $('#openCoverage').click(function(e){
    //console.log("----------------------------- entro coverage");
    e.preventDefault();
    if (window.coverageData === undefined){
      gmwa.controllers.storeBig.viewCoverageModal = $('#viewCoverage');
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
        gmwa.controllers.storeBig.viewCoverageModal.foundation('open');
        setTimeout(function(){
          window.coverageData.storeLat = parseFloat(window.coverageData.storeLat);
          window.coverageData.storeLng = parseFloat(window.coverageData.storeLng);
          // Check URBAN coverage
          var bUrbanPresent = false;
          if (window.coverageData.zones.length > 0){
            
            if (gmwa.mapsFW == 0){
              gmwa.controllers.storeBig.loadCoverageGMap();
            }else{
              gmwa.controllers.storeBig.loadCoverageLMap();
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
              html += '<li>'+window.coverageData.states[i].name+'</li>'
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
      gmwa.controllers.storeBig.viewCoverageModal.foundation('open');
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

  if (isMobile){
    var swiper = new Swiper("#swipHighlights", {
      slidesPerView: 1.3,
      paginationClickable: false,
      navigation: {
        nextEl: '#next-sw-nearprms',
        prevEl: '#prev-sw-nearprms'
      },
      spaceBetween: 10
    });
  }else{
    var swiper = new Swiper("#swipHighlights", {
      slidesPerView: 2.3,
      paginationClickable: false,
      navigation: {
        nextEl: '#next-sw-nearprms',
        prevEl: '#prev-sw-nearprms'
      },
      spaceBetween: 10
    });
  }

  
}


gmwa.controllers.storeBig.loadCoverageLMap = function(){
  gmwa.logger.log('Initializing Maps...');
  var mapElement = $('#coverageMap');
  var izoom    = 16;
  var isMobile = mapElement.data('im');
  var lat = window.coverageData.storeLat;
  var lng = window.coverageData.storeLng;
  gmwa.components.maps.instance.initMapAsync('coverageMap', lat, lng, izoom, isMobile, function(map){
    gmwa.controllers.storeBig.map = map;
    gmwa.controllers.reportarError.marker = gmwa.components.maps.instance.addMarkerSimple(gmwa.controllers.storeBig.map, lat, lng);
    // Add polygons
    var zonesLength = window.coverageData.zones.length;
    var bounds = [];
    var labels = '';
    var labelCost = '';
    for(var i=0; i < zonesLength; i++){
      var multipolygon = L.polygon(window.coverageData.zones[i].polygon, {
        color  : gmwa.controllers.storeBig.colors[i],
        weight : 1
      });
      multipolygon.addTo(gmwa.controllers.storeBig.map);

      if (window.coverageData.zones[i].amount == 0){
        labelCost = 'sin costo';
      }else{
        labelCost = '$U '+window.coverageData.zones[i].amount;
      }
      labels += '<div style="background-color:'+gmwa.controllers.storeBig.colors[i]+';width:15px;height:15px;display:inline-block;margin: -2px 4px -2px 10px;border-radius: 50%;"></div><div style="display:inline-block">'+window.coverageData.zones[i].name+' ('+labelCost+')</div>';

      bounds = bounds.concat(window.coverageData.zones[i].polygon);
    }
    gmwa.controllers.storeBig.map.fitBounds(bounds);
    $('#coverageZonesDesc').html(labels);
  });
}

gmwa.controllers.storeBig.loadCoverageGMap = function(){
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
        strokeColor: gmwa.controllers.storeBig.colors[i],
        //strokeOpacity: 1.0,
        strokeWeight: 0.5,
        fillColor: gmwa.controllers.storeBig.colors[i],
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
      labels += '<div style="background-color:'+gmwa.controllers.storeBig.colors[i]+';width:15px;height:15px;display:inline-block;margin: -2px 4px -2px 10px;border-radius: 50%;"></div><div style="display:inline-block">'+window.coverageData.zones[i].name+' ('+labelCost+')</div>';
    }
    covMap.fitBounds(bounds)
    $('#coverageZonesDesc').html(labels);
  });
}

// gmwa.controllers.storeBig.goToCheckout = function(){
//   if (carrito == null || carrito.items.length === 0){
//     gmwa.utils.showError('El carrito esta vacio', 'Agrega algunos productos antes de finalizar la compra');
//   }else{
//     var GET = document.location.href.split('/');
//     var token = GET[GET.length - 1];
//     var ids = GET[GET.length - 2];
//     var idr = GET[GET.length - 3];
//     var url = '/pedido/checkout/' + token;
//     window.location = '/pedido/checkout/'+idr+'/'+ids+'/'+token;
//     // $.ajax(url).done(function(resp){
//     //   // Load content
//     //   $('#addProduct .u-reveal-body').html(resp);
//     //   // Hook modal's buttons
//     //   gmwa.controllers.storeBig.checkoutOptions(token, idr, ids);
//     //   // All ready, show now
//     //   gmwa.controllers.storeBig.addProductModal.foundation('open');
//     // })
//   }
// }

// gmwa.controllers.storeBig.addProductOpened = function(lineId){
//   //if (e.namespace == 'fndtn.reveal'){ // Special workaround
//   selectPrice = 0;
//   actualPrice = parseFloat($("#priceCustom").html());
//   if(lineId > 0){
//     $("#ompaAdd").click(gmwa.controllers.storeBig.modifyProduct);
//     $("#ompaCancel, #ompaCancelTimes").click(gmwa.controllers.storeBig.addProductCancel);
//     currentItem = gmwa.controllers.storeBig.cartGetItem(lineId);
//     originalPrice = parseFloat($("#productOrigPrice").val());
//   }
//   else{
//     $("#ompaAdd").click(gmwa.controllers.storeBig.addProduct);
//     $("#ompaCancel, #ompaCancelTimes").click(gmwa.controllers.storeBig.addProductCancel);
//     currentItem.customFields = [];
//     currentItem.quantity = $('#quantityItem').val();
//     currentItem.price = actualPrice;
//     currentItem.originalPrice = actualPrice;
//     originalPrice = actualPrice;
//   }
  
//   //CAMBIO EN SELECT
//   $(".custom-list").change(function(){
//     // Load item
//     var custom = {};
//     var optSelected = $(this);
//     custom.id      = parseInt(optSelected.attr("data-idCustomSelect"));
//     custom.type    = 2;
//     custom.val     = parseInt(optSelected.attr("data-valCustomSelect"));
//     custom.name    = optSelected.data('valcustomname');
//     custom.optName = optSelected.data('label');
//     custom.price   = parseFloat($(this).attr('data-extraSelect'));
//     if($(this).val() != 'null'){
//       // Add or update
//       //idSelect = custom.id;
//       // actualPrice = actualPrice - selectPrice;
//       // var extraSelect = parseInt($(this).find(':selected').attr('data-extraSelect'));
//       // selectPrice = extraSelect;
//       // actualPrice = actualPrice + selectPrice;
//       for(var i = 0; i < currentItem.customFields.length; i++){
//         if(currentItem.customFields[i].id == custom.id){
//           currentItem.customFields.splice( i, 1 );
//           break;
//         }
//       }
//       currentItem.customFields.push(custom);
//       // $("#priceCustom").text(actualPrice * currentItem.quantity);
//       currentItem.price = gmwa.controllers.storeBig.calculateItemPrice(currentItem);
//       $("#priceCustom").text(currentItem.price);
//     }
//     else{
//       // Remove
//       // actualPrice = actualPrice - selectPrice;
//       // selectPrice = 0;
//       for(var i = 0; i < currentItem.customFields.length; i++){
//         if(currentItem.customFields[i].id == custom.id){
//           currentItem.customFields.splice( i, 1 );
//           break;
//         }
//       }
//       //$("#priceCustom").text(actualPrice * currentItem.quantity);
//       currentItem.price = gmwa.controllers.storeBig.calculateItemPrice(currentItem);
//       $("#priceCustom").text(currentItem.price);
//     }
    
//   });


//   //CAMBIO EN CHECKBOX
//   $(".check-custom").change(function(){
//     var checked = $(this).prop('checked');
//     var extraCheck = parseInt($(this).attr("data-extraCheck"));
//     var custom = {};
//     custom.id = parseInt($(this).attr("data-idCustom"));
//     custom.type = 1;
//     custom.name = $(this).data('label');
//     custom.price = extraCheck;
//     if(!checked){
//       //actualPrice = actualPrice - extraCheck;
//       //BORRAR CUSTOM FIELD
//       for(var i = 0; i < currentItem.customFields.length; i++){
//         if(currentItem.customFields[i].id == custom.id){
//           currentItem.customFields.splice( i, 1 );
//         }
//       }
//     }
//     else{
//       //actualPrice = actualPrice + extraCheck;
//       //AGREGAR CUSTOM FIELD
//       currentItem.customFields.push(custom);
//     }
//     //$("#priceCustom").text(actualPrice * currentItem.quantity);
//     currentItem.price = gmwa.controllers.storeBig.calculateItemPrice(currentItem);
//     $("#priceCustom").text(currentItem.price);
//   });
  
//   //CAMBIO EN CANTIDAD
//   // $("#ompaQty").change(function(){
//   //   currentItem.quantity = parseInt($("#ompaQty").val());
//   //   $("#priceCustom").text(actualPrice * currentItem.quantity);
//   // });

//   // CANTIDAD
//   $("#ompaQtyMinus").click(function(){
//     if (currentItem.quantity > 1){
//       currentItem.quantity--;
//       $("#ompaQtyNumber").html(currentItem.quantity);
//       currentItem.price = gmwa.controllers.storeBig.calculateItemPrice(currentItem);
//       $("#priceCustom").text(currentItem.price);
//     }
//   });
//   $("#ompaQtyPlus").click(function(){
//     if (currentItem.quantity < 20){
//       currentItem.quantity++;
//       $("#ompaQtyNumber").html(currentItem.quantity);
//       currentItem.price = gmwa.controllers.storeBig.calculateItemPrice(currentItem);
//       $("#priceCustom").text(currentItem.price);
//     }
//   });

//   // SPECIAL INSTRUCTIONS
//   $('#lblSpInstr').click(function(e){
//     $('#lblSpInstr').hide();
//     $('#txtSpInstr').show(0,function(){
//       $('#textArea').focus();
//     });
//   });
//   $('#textArea').focusout(function(e){
//     if($('#textArea').val().length === 0){
//       $('#lblSpInstr').show();
//       $('#txtSpInstr').hide(); 
//     }
//   });
// }

// gmwa.controllers.storeBig.addProduct = function(e){
//   // Process form
//   gmwa.logger.log("El producto es " + $("#ompaId").val() + " con cantidad: " + $("#ompaQty").val());

//   var loc = document.location.href;
//   // obtenemos un array con cada clave=valor
//   var GET = loc.split('/');
//   var get = {};

//   var serverObject = gmwa.controllers.storeBig.getMainIDs();
//   var fecha = new Date();
//   serverObject.dateTo = [fecha.getMonth()+1,
//                fecha.getDate(),
//                fecha.getFullYear()].join('/')+' '+
//               [fecha.getHours(),
//                fecha.getMinutes(),
//                fecha.getSeconds()].join(':');
//   currentItem.notes = $("#textArea").val();
//   currentItem.id = $("#datos").attr("data-idProduct");
//   serverObject.plist = [];
//   serverObject.plist.push(currentItem);
  
//   var data = JSON.stringify(serverObject);    
//   var url = '/pedido/agregar';
//   currentItem.productName = productName;
//   //currentItem.price = actualPrice * currentItem.quantity;
//   gmwa.utils.showProgress('', '', false, false);
//   $.ajax({
//     type     : "POST",
//     url      : url,
//     data     : data,
//     dataType : 'json',
//     contentType:"application/json; charset=utf-8"
//   }).done(function(resData){
//     if (resData.meta.status == 200){
//       gmwa.logger.log('store Add Product | API returned OK: ' + JSON.stringify(resData));
//       gmwa.logger.log(data);
//       currentItem.lineId = resData.data.lineId;
//       gmwa.controllers.storeBig.cartAdd(currentItem);
//       gmwa.controllers.storeBig.cartDraw();
      
//     }else{
//       gmwa.logger.error('store Add Product | API returned error: ' + JSON.stringify(resData));
//     }
//     gmwa.utils.hideProgress();
//   }).fail(function(err){
//     gmwa.logger.error('store Add Product | API returned error: ' + JSON.stringify(err));
//     gmwa.utils.hideProgress();
//   });
  
  // Close modal
//   gmwa.controllers.storeBig.addProductModal.foundation('close');
// }

// gmwa.controllers.storeBig.modifyProduct = function(e){
//   // Process form
//   gmwa.logger.log("El producto a modificar es " + $("#ompaId").val() + " con cantidad: " + $("#ompaQty").val());

//   currentItem.notes = $("#textArea").val();

//   var serverObject = gmwa.controllers.storeBig.getMainIDs();
//   serverObject.lineId = $('#storeLineId').val();
//   serverObject.customFields = currentItem.customFields;
//   serverObject.notes = currentItem.notes;
//   serverObject.quantity = currentItem.quantity;
  
//   var data = JSON.stringify(serverObject);    
//   var url = '/pedido/editar';
  
//   //currentItem.price = actualPrice * currentItem.quantity;
//   gmwa.utils.showProgress('', '', false, false);
//   $.ajax({
//     type     : "POST",
//     url      : url,
//     data     : data,
//     dataType : 'json',
//     contentType:"application/json; charset=utf-8"
//   }).done(function(resData){
//     if (resData.meta.status == 200){
//       gmwa.logger.log('store Edit Product | API returned OK: ' + JSON.stringify(resData));
//       gmwa.logger.log(data);
//       gmwa.controllers.storeBig.cartEdit(currentItem);
//       gmwa.controllers.storeBig.cartDraw();
      
//     }else{
//       gmwa.logger.error('store Edit Product | API returned error: ' + JSON.stringify(resData));
//     }
//     gmwa.utils.hideProgress();
//   }).fail(function(err){
//     gmwa.utils.hideProgress();
//     gmwa.logger.error('store Edit Product | API returned error: ' + JSON.stringify(err));
//   });
  
//   // Close modal
//   gmwa.controllers.storeBig.addProductModal.foundation('close');
// }

// gmwa.controllers.storeBig.addProductCancel = function(e){
//   // Close modal
//   gmwa.controllers.storeBig.addProductModal.foundation('close');
// }

// gmwa.controllers.storeBig.iniciarAdministrador = function(){
//   $('.line-edit').click(function(e){
//      e.preventDefault();
//      var auxArray = {};
//      auxArray.productId = $(this).attr('data-id');
//      auxArray.lineId = $(this).attr('data-lineId');
//      auxArray.token = carrito.token;
//      auxArray.idr = carrito.idr;
//      auxArray.type = 1;
//      //auxArray.ids = carrito[auxId].ids;
//      var data = JSON.stringify(auxArray); 
//      var url = '/pedido/producto';
//      gmwa.utils.showProgress('', '', false, false);
//      $.ajax({
//         type     : "POST",
//         url      : url,
//         data     : data,
//         json : true,
//       }).done(function(resp){
//         $('#addProduct .u-reveal-body').html(resp);
//         gmwa.controllers.storeBig.addProductOpened(auxArray.lineId);
//         gmwa.controllers.storeBig.addProductModal.foundation('open');
//         gmwa.utils.hideProgress();
//       }).fail(function(err){
//         gmwa.utils.hideProgress();
//         gmwa.logger.error('store Modify Product | API returned error: ' + JSON.stringify(err));
//       });
//   });

//   $('.line-delete').click(function(e){
//      e.preventDefault();
//      var auxArray = {};
//      var auxId = $(this).attr('data-id');
//      auxArray.token = carrito.token;
//      auxArray.idr = carrito.idr;
//      auxArray.ids = carrito.ids;
//      auxArray.lineId = $(this).attr('data-lineId');
//      var data = JSON.stringify(auxArray);    
//      var url = '/pedido/quitar';
//      gmwa.utils.showProgress('', '', false, false);
//      $.ajax({
//         type     : "POST",
//         url      : url,
//         data     : data,
//         dataType : 'json',
//         contentType:"application/json; charset=utf-8"
//       }).done(function(resData){
//         if (resData.meta.status == 200){
//           gmwa.logger.log('store Remove Product | API returned OK: ' + JSON.stringify(resData));
//           gmwa.logger.log(data);
//           gmwa.controllers.storeBig.cartDelete(auxArray.lineId);
//           gmwa.controllers.storeBig.cartDraw();
//         }else{
//           gmwa.logger.error('store Add Product | API returned error: ' + JSON.stringify(resData));
//         }
//         gmwa.utils.hideProgress();
//       }).fail(function(err){
//         gmwa.utils.hideProgress();
//         gmwa.logger.error('store Add Product | API returned error: ' + JSON.stringify(err));
//       });

     
//   });
// }

gmwa.controllers.storeBig.calculateItemPrice = function(item){
  var total = item.originalPrice;
  for(var i=0; i < item.customFields.length; i++){
    total += item.customFields[i].price;
  }
  //total = total * item.quantity;
  console.log("---------------------------------- EL QUANTITY ES");
  console.log($("#quantityItem").val());
  total = total * $("#quantityItem").val();
  return total;
}

// gmwa.controllers.storeBig.cartDraw = function(){
//   var carritoHtml = '';
//   var cfText = '';
//   var cfAdded = false;
//   var subtotal = 0;
//   var taxes = 0;

//   // Check Empty
//   if (carrito.items.length == 0){
//     carritoHtml = '<tr><td style="font-size: 12px;text-align: center;padding: 30px;">Nada por aqui. Busca un producto y agregalo a tu carrito</td></tr>';
//   }else{
//     for(var i=0; i < carrito.items.length; i++){
//       cfText = '';
//       cfAdded = false;

//       if (carrito.items[i].notes && carrito.items[i].notes.length > 0){
//         cfAdded = true;
//         if (carrito.items[i].notes.length > 20){
//           cfText = '<p>' + carrito.items[i].notes.substring(0, 15) + '... ';
//         }else{
//           cfText = '<p>' + carrito.items[i].notes + ' ';
//         }
//       }

//       for(var x=0; x < carrito.items[i].customFields.length; x++){
//         if (cfAdded){
//           cfText += ', ';
//         }else{
//           cfText = '<p>';
//           cfAdded = true;
//         }
//         if (carrito.items[i].customFields[x].type == 2){
//           cfText += carrito.items[i].customFields[x].name + ": " + carrito.items[i].customFields[x].optName;
//         }else{
//           cfText += carrito.items[i].customFields[x].name;
//         }
//       }
//       if (cfAdded){
//         cfText += '</p>';
//       }
//       var objPrice = gmwa.utils.formatNumberObject(carrito.items[i].price);
//       carritoHtml += '<tr id="store-'+ carrito.items[i].lineId +'" style="border-top: 1px solid #EEE;">'+
//                       '<td>'+ carrito.items[i].productName +cfText+'<div>'+
//                       '<a href="" class="line-edit" data-lineId='+ carrito.items[i].lineId +' data-id='+ carrito.items[i].id +' id="modifystore-'+ carrito.items[i].lineId +'">Modificar </a>'+
//                       '<a href="" class="line-delete" data-lineId='+ carrito.items[i].lineId +' data-id='+ carrito.items[i].id +' id="deletestore-'+ carrito.items[i].lineId +'">Quitar</a></div></td>'+
//                       '<td>x'+ carrito.items[i].quantity +'</td>' + 
//                       '<td class="price" style="text-align:right"><span class="currency">'+ objPrice.currency + ' </span>'+ objPrice.number +'<span class="decimals">,' + objPrice.decimals + '</span></td>'+
//                       '</tr>';  
//       subtotal += carrito.items[i].price;
//     }
//     subtotal = parseFloat(Math.round(subtotal * 100) / 100);
//     oSubTotal = gmwa.utils.formatNumberObject(subtotal);
//     carritoHtml += '<tr style="border-top: 2px solid #DDD;"><td colspan="2" style="text-align:right;bstore-top: 1px dashed #DDD;padding-bottom: 1px;">Sub-total:</td><td style="bstore-top: 1px dashed #DDD;padding-bottom: 1px;text-align:right" class="price"><span class="currency">'+ oSubTotal.currency + ' </span>'+ oSubTotal.number +'<span class="decimals">,' + oSubTotal.decimals + '</span></td></tr>';
//     // taxes = (subtotal * 0.23);
//     // taxes = parseFloat(Math.round(taxes * 100) / 100).toFixed(2);
//     // carritoHtml += '<tr><td colspan="2" style="text-align:right;padding-bottom: 1px;">Impuestos:</td><td style="padding-bottom: 1px;">' + taxes + '</td></tr>';
    
//     total = parseFloat(Math.round((parseFloat(subtotal) + parseFloat(taxes)) * 100) / 100);
//     oTotal = gmwa.utils.formatNumberObject(total);
//     carritoHtml += '<tr><td colspan="2" style="text-align:right;padding-bottom: 1px;font-size: 20px;">Total:</td><td style="color: #159de1;font-weight: 600;padding-bottom: 1px;font-size: 20px;text-align:right" class="price"><span class="currency">'+ oTotal.currency + ' </span>'+ oTotal.number +'<span class="decimals">,' + oTotal.decimals + '</span></td></tr>';
//   }

//   $('#carrito').html(carritoHtml);
//   gmwa.controllers.storeBig.iniciarAdministrador();

//   gmwa.controllers.storeBig.cartUpdateMobileQty();
// }

// gmwa.controllers.storeBig.cartInit = function(){
//   var fecha = new Date();
//   // var GET = document.location.href.split('/');
//   carrito = gmwa.controllers.storeBig.getMainIDs();
//   carrito.dateTo = [fecha.getMonth()+1,
//                fecha.getDate(),
//                fecha.getFullYear()].join('/')+' '+
//               [fecha.getHours(),
//                fecha.getMinutes(),
//                fecha.getSeconds()].join(':');
//   // carrito.idr = GET[GET.length - 3];
//   // carrito.ids = GET[GET.length - 2];
//   // carrito.token = GET[GET.length - 1];
//   carrito.items = [];
// }

// gmwa.controllers.storeBig.cartAdd = function(item){
//   var localItem = $.extend({}, item);
//   if (carrito === null){
//     gmwa.controllers.storeBig.cartInit();
//   }
//   carrito.items.push(localItem);
//   gmwa.controllers.storeBig.cartUpdateMobileQty();
// }

// gmwa.controllers.storeBig.cartEdit = function(item){
//   var localItem = $.extend({}, item);
//   if (carrito === null){
//     gmwa.controllers.storeBig.cartInit();
//   }
//   for(var i=0; i < carrito.items.length; i++){
//     if (carrito.items[i].lineId == localItem.lineId){
//       carrito.items[i] = localItem;
//       break;
//     }
//   }
// }

// gmwa.controllers.storeBig.cartDelete = function(lineId){
//   if (carrito === null){
//     gmwa.controllers.storeBig.cartInit();
//   }
//   for(var i=0; i < carrito.items.length; i++){
//     if (carrito.items[i].lineId == lineId){
//       carrito.items.splice(i, 1);
//       break;
//     }
//   }
//   gmwa.controllers.storeBig.cartUpdateMobileQty();
// }

// gmwa.controllers.storeBig.cartGetItem = function(lineId){
//   for(var i=0; i < carrito.items.length; i++){
//     if (carrito.items[i].lineId == lineId){
//       return carrito.items[i];
//     }
//   }
// }

// gmwa.controllers.storeBig.cartUpdateMobileQty = function(){
//   var qty = carrito.items.length;
//   if (qty > 0){
//     gmwa.controllers.storeBig.mobileCarritoQty.css('display','inline-block');
//     gmwa.controllers.storeBig.mobileCarritoQty.text(qty);
//   }else{
//     gmwa.controllers.storeBig.mobileCarritoQty.css('display','none');
//   }
// }



gmwa.controllers.storeBig.getMainIDs = function(){
  var loc = document.location.href;
  // obtenemos un array con cada clave=valor
  var GET = loc.split('/');
  var get = {};
  var serverObject = {};
  if(GET.length === 6){
    serverObject.idr = GET[GET.length - 4];
    serverObject.ids = GET[GET.length - 3];
    serverObject.token = null;
  }
  else if(GET.length === 7){
    serverObject.idr = GET[GET.length - 5];
    serverObject.ids = GET[GET.length - 4];
    var tmpToken = GET[GET.length - 1];
    var tmpTokenArr = tmpToken.split('#');
    serverObject.token = tmpTokenArr[0]
  }
  return serverObject;
}