var gmwa = gmwa || {};
gmwa.components = gmwa.components || {};
gmwa.components.galleryviewer = {};

gmwa.components.galleryviewer.init = function(){
  gmwa.logger.log('GalleryViewer|Init...');
  $('a.gal-image-ho').on('click', function(e){
  e.preventDefault();
  
  var imgIndex = -1;
  if (e.currentTarget.childNodes[0].tagName.toUpperCase() == 'PICTURE'){
    var eImg = e.currentTarget.childNodes[0].getElementsByTagName('img');
    if (eImg && eImg.length){
      var eImgIndex = eImg[0].attributes['index'];
      if (eImgIndex){
        imgIndex = parseInt(eImgIndex.nodeValue); 
      }
    }
  }else{
    imgIndex = parseInt(e.currentTarget.childNodes[0].attributes['index'].nodeValue); 
  }
  if (imgIndex == -1) return;

  var viewerHtml = '<div id="galviewer"><i class="fa fa-times gal-close" aria-hidden="true"></i>'+
                    '<div id="galspinner" class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div><div id="galspinnertext" style="text-align: center;color: #FFF;font-size: 13px;">Cargando...</div>'+
                    '<div id="gal-cntr" class="gal-cntr" style="display:none"><div class="gal-prev"><i class="fa fa-angle-left" aria-hidden="true"></i></div>' + 
                    '<img id="galimg" ><div class="gal-next"><i class="fa fa-angle-right" aria-hidden="true"></i></div>'+
                    '<div id="gal-info" class="gal-info"></div></div></div>';
  
  $(document.body).append(viewerHtml);

  // Init basic viewer functions
  var closeGalViewer = function(e){
    $('#galviewer').remove();
    $(document).off('keydown');
  } 
  $('#galviewer').on('click', function(e){
        closeGalViewer(e);
    }).children().click(function(e) {
        return false;
    });
    $('.gal-close').on('click', function(e){
        closeGalViewer(e);
    });

  gmwa.logger.log('Will request data...');

  $.getJSON( "/galeria/info/" + e.currentTarget.dataset.idrids + "/" +
                                e.currentTarget.dataset.ide + "/" +
                                e.currentTarget.dataset.id)
    .done(function(data){
      if (data.outcode == 0){
        // Init data
        window.currentGallery = data.r.gallery;
        window.currentGalleryIndex = imgIndex;
        // Init rest of viewer functions
        var nextAction = function(e){
          gmwa.logger.log('Moving next');
          if ( (window.currentGalleryIndex + 1) < window.currentGallery.images.length){
            window.currentGalleryIndex++;
            $('#galimg').attr("src", window.currentGallery.images[window.currentGalleryIndex].src);
            $('#galImgTitle').text(window.currentGallery.images[window.currentGalleryIndex].title);
            $('#galImgDesc').text(window.currentGallery.images[window.currentGalleryIndex].desc);
            if (window.currentGalleryIndex == (window.currentGallery.images.length-1)){
              $('.gal-next').hide();
            }else{
              $('.gal-next').show();
            }
            $('.gal-prev').show();
          }
        };
        var prevAction = function(e){
          gmwa.logger.log('Moving prev');
          if ( (window.currentGalleryIndex - 1) >= 0){
            window.currentGalleryIndex--;
            $('#galimg').attr("src", window.currentGallery.images[window.currentGalleryIndex].src);
            $('#galImgTitle').text(window.currentGallery.images[window.currentGalleryIndex].title);
            $('#galImgDesc').text(window.currentGallery.images[window.currentGalleryIndex].desc);
            if (window.currentGalleryIndex === 0){
              $('.gal-prev').hide();
            }else{
              $('.gal-prev').show();
            }
            $('.gal-next').show();
          }
        };
        $('.gal-next').on('click', nextAction);
        $('.gal-prev').on('click', prevAction);
        // Bind arrows keys
        $(document).on('keydown', function(e) {
          switch(e.which) {
            case 37: // left
              prevAction();
              break;
            case 39: // right
              nextAction();
              break;
            case 27:
              closeGalViewer(e);
              break;

            default: return; 
          }
          e.preventDefault();
        });
        // Load first image, data and show
        var detailsHeaderHtml = '<div class="bizDetails"><table><tr><td>';
        if (data.r.retailer.ics && data.r.retailer.ics.length > 0){
          detailsHeaderHtml += '<img src="'+data.r.retailer.ics+'"></td><td>';
        }else{
          detailsHeaderHtml += '<img src="/img/local_default.png"></td><td>';
        }
        detailsHeaderHtml += '<h1>'+data.r.retailer.nam+'</h1><br><h2>'+data.r.retailer.adr+'</h2></td></tr></table></div>';
        var detailsGalHtml = '<div class="galDetails"><h1>'+data.r.gallery.name+'</h1><h2>'+data.r.gallery.description+'</h2><h3 id="galImgTitle">'+
                              data.r.gallery.images[window.currentGalleryIndex].title+
                              '</h3><h4 id="galImgDesc">'
                              +data.r.gallery.images[window.currentGalleryIndex].desc+'</h4></div>';
        $('.gal-info').html(detailsHeaderHtml+detailsGalHtml);
        $('#galimg').attr("src", window.currentGallery.images[window.currentGalleryIndex].src);
        $('#galImgTitle').text(window.currentGallery.images[window.currentGalleryIndex].title);
        $('#galImgDesc').text(window.currentGallery.images[window.currentGalleryIndex].desc);
        if (window.currentGalleryIndex == 0){
          $('.gal-prev').hide();
        }
        $('.gal-cntr').fadeIn(400);
        $('#galspinner, #galspinnertext').hide();
      }else{
        gmwa.logger.error('API returned error: ' + data.outcode + ' ('+data.outmsg+')');
      }
    })
    .fail(function(error){
      gmwa.logger.error(error);
    });
  });
};