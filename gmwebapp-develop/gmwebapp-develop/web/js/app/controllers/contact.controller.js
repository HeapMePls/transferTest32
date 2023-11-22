var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.contact = {};

gmwa.controllers.contact.init = function(){
  gmwa.logger.log('Contact|Init...');
  gmwa.components.header.init();

  // Download and initialize parsley
  var elementI18 = document.createElement("script");
  elementI18.src = '/js/vendors/parsley/i18n/es.js';
  elementI18.onload = function(){    
    var elementP = document.createElement("script");
    elementP.src = '/js/vendors/parsley/parsley.min.js';
    elementP.onload = function(){    
      window.ParsleyValidator.setLocale('es');

      var captchaRednered = false;
      var contactForm = document.getElementById('contactForm');
      var btnSend     = document.getElementById('btnSend');

      $('#contactForm').parsley();
      $.listen('parsley:form:validated', function (formInstance) {
          $.each(formInstance.fields, function (e, elem) {
              var text = null;
              var $errorContainer = elem.$element.next('ul.parsley-errors-list:first');
              elem.$element.parents('div:first').find('small.error:first').hide();
              if ($errorContainer.find('li:first').length) {
                  text = $errorContainer.find('li:first').text();
                  elem.$element.parents('div:first').find('small.error:first').text(text).show();
                  var parsleyId = elem.$element.data('parsley-id');
                  $('#parsley-id-'+parsleyId).show();
              }
          });
          if(!captchaRednered && formInstance.isValid()) {
            formInstance.validationResult = false;
    
            $('#btnSend').prop('disabled', true);
            $('#btnSend').text('Enviando...');

            var rckey = null;
            if (window.location.hostname.toLowerCase().indexOf("buscoinfo") >= 0){
              console.info('Sending as BI');
              rckey = '6LfzeqEaAAAAAFmSgGiocTLX0ObFqJJ_JzXDpQHB';
            }else{
              console.info('Sending as GM');
              rckey = '6LcIPzwUAAAAAEAKqChvPCt0sx_y03vZM4GiiX5Y';
            }

            var widget = grecaptcha.render(btnSend, {
                'sitekey'  : rckey,
                'size'     : "invisible",
                'callback' : function () {
                    formInstance.validationResult = true;
                    contactForm.submit();
                }
            });
    
            grecaptcha.reset(widget);
            grecaptcha.execute(widget);
    
            captchaRednered = true;
          }
      });


      /**
       * <div class="g-recaptcha"
                        data-sitekey="6LcIPzwUAAAAAEAKqChvPCt0sx_y03vZM4GiiX5Y"
                        data-callback="contactSendRequest"
                        data-size="invisible"></div>
       */

    };
    document.body.appendChild(elementP);
  };
  document.body.appendChild(elementI18);


  // var contactSendRequest = function(token){
  //   console.log('reCaptcha user response :');
  //   console.log(token);
  //   document.getElementById('dummyField').value = 'nonEmpty';
  //   $('#contactForm').submit();
  // }

  $(document).on('submit','form',function(){
    $('#btnSend').prop('disabled', true);
    $('#btnSend').text('Enviando...');
  });

  // Add referrer page
  gmwa.logger.log('Contact|Adding referrer as ['+document.referrer+']');
  $('<input>').attr({
    type  : 'hidden',
    id    : 'refPage',
    name  : 'refPage',
    value : document.referrer,
  }).appendTo('#contactForm');

  //gmwa.controllers.contact.lazy = $('.lazy').Lazy({effect: 'fadeIn', effectTime: 1000, chainable: false});
};