var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.productOrderMenu = {};

var currentItem = {};
var actualPrice = 0;
var selectPrice = 0;
var originalPrice = 0;

gmwa.controllers.productOrderMenu.init = function(){
  gmwa.components.header.init();
  console.log("---------------- INICIANDO PRODUCT ORDER MENU");
  // Initialize product javascript controls
  currentItem.customFields = [];
  currentItem.quantity = 1;
  actualPrice = parseFloat($("#price").val());
  currentItem.price = actualPrice;
  currentItem.originalPrice = actualPrice;
  originalPrice = actualPrice;
  gmwa.controllers.storeSmall.initProductControls();

  // Initialize PhotoSwiper 
  // <script type="text/javascript" src="https://cdn.rawgit.com/igorlino/elevatezoom-plus/1.1.6/src/jquery.ez-plus.js"></script>
  // <script type="text/javascript" src="{{ app.request.basepath }}/js/vendors/photoswipe/dist/photoswipe.min.js"></script>
  // <script type="text/javascript" src="{{ app.request.basepath }}/js/vendors/photoswipe/dist/photoswipe-ui-default.min.js"></script>
  
  var elementEzPlus = document.createElement("script");
  elementEzPlus.src = 'https://cdn.rawgit.com/igorlino/elevatezoom-plus/1.1.6/src/jquery.ez-plus.js';
  elementEzPlus.onload = function(){ 
    var elementPhSw = document.createElement("script");
    elementPhSw.src = '/js/vendors/photoswipe/dist/photoswipe.min.js';
    elementPhSw.onload = function(){
      var elementPhSwD = document.createElement("script");
      elementPhSwD.src = '/js/vendors/photoswipe/dist/photoswipe-ui-default.min.js';
      elementPhSwD.onload = function(){

        // PhotoSwiper init
        gmwa.controllers.productOrderMenu.pswp = $('.pswp')[0];
        gmwa.controllers.productOrderMenu.pswpItems = [];
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
            gmwa.controllers.productOrderMenu.pswpItems.push(item);
          }
        });

        if (gmwa.utils.isMobile()){
          gmwa.controllers.productOrderMenu.imagesSwiper = new Swiper('#adImgGal', {
            slidesPerView: 1,
            paginationClickable: false,
            spaceBetween: 0,
            pagination: {
              el: '#adImgGalPag',
              type: 'bullets',
            },
          });

          gmwa.controllers.productOrderMenu.imagesSwiper = new Swiper('#relProds', {
            slidesPerView: 1.3,
            paginationClickable: false,
            spaceBetween: 0,
            pagination: {
              el: '#relProdsPag',
              type: 'bullets',
            },
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
              gmwa.controllers.productOrderMenu.pswp, 
              PhotoSwipeUI_Default, 
              gmwa.controllers.productOrderMenu.pswpItems, 
              options
            );
            lightBox.init();
          });
          
        }else{

          // Capture image hover and elevateZoom
          $(".additional-image").mouseover(function(){
            // Get image data
            var img = $(this).attr("data-image");
            // Update principal image src
            $("#principal-image").attr('src', img);
            // re-init elevateZoom
            $('.zoomContainer').remove();
            //$('#principal-image').removeData('elevateZoom');
            $('#principal-image').removeData('ezPlus');
            $('#principal-image').data('zoom-image', $(this).data('zoom-image'));
            // Update ingex
            var tempIndex = $(this).data("index");
            $('#principal-image').data("index", tempIndex);
            // Reinit
            //$("#principal-image").elevateZoom ( {
            $("#principal-image").ezPlus ( {
              // cursor: 'pointer',
              // imageCrossfade: true,
              // responsive: true,
              // zoomWindowPosition: 1,
              // zoomWindowOffsetx: 0
              zoomType: 'inner',
              cursor: 'crosshair'
            });
          });

          // First elevateZoom init
          $("#principal-image").ezPlus ( {
            // cursor: 'pointer',
            // imageCrossfade: true,
            // responsive: true,
            // zoomWindowPosition: 1,
            // zoomWindowOffsetx: 0
            zoomType: 'inner',
            cursor: 'crosshair'
          });

          
          // Initialize PhotoSwipe click
          $('#principal-image').on('click', function(event) {
            event.preventDefault();
            var imgIndex = parseInt($("#principal-image").data("index"));
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
              gmwa.controllers.productOrderMenu.pswp, 
              PhotoSwipeUI_Default, 
              gmwa.controllers.productOrderMenu.pswpItems, 
              options
            );
            lightBox.init();
          });
        }

      }
      document.body.appendChild(elementPhSwD);
    }
    document.body.appendChild(elementPhSw);
  }
  document.body.appendChild(elementEzPlus);

  $("#pdForm").submit(function(e){
    if (gmwa.controllers.storeSmall.addProductCheckMandatories()){
      $('#lblError').html('');
      $('#ay mama').prop('disabled', true);
      $('#ompaModify').prop('disabled', true);
      gmwa.utils.showProgress('Enviando', 'Agregando producto al carrito...', true, true);
    }else{
      $('#lblError').html('<strong>Campos invalidos</strong> Ingrese todos los datos obligatorios');
      e.preventDefault();
      return;
    }
  });

  // Change error messages language
  $('#pdForm input[type=radio]').on('change invalid', function() {
    var textfield = $(this).get(0);

    // 'setCustomValidity not only sets the message, but also marks
    // the field as invalid. In order to see whether the field really is
    // invalid, we have to remove the message first
    textfield.setCustomValidity('');

    if (!textfield.validity.valid) {
      textfield.setCustomValidity('Porfavor seleccione una de estas opciones');
    }
  });
}