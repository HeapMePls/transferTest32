var gmwa = gmwa || {};
gmwa.components = gmwa.components || {};
gmwa.components.videoviewer = {};

gmwa.components.videoviewer.init = function(){
  gmwa.logger.log('VideoViewer|Init 2...');
  // if ($( window ).width() < 650)return;
  $('a.itemVideo').on('click', function(e){
    e.preventDefault();
     var viewerHtml = '<div id="galviewer"><i class="fa fa-times gal-close" aria-hidden="true"></i>'+
                      '<div id="gal-cntr" class="gal-cntr" style="padding-right:0px">' + 
                      '<iframe id="galvid" type="text/html" '+
                      '  src="https://www.youtube.com/embed/'+this.dataset.id+'?autoplay=1&loop=0&rel=0"'+
                      '  frameborder="0"/>';
    
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
    // Bind escape key
    $(document).on('keydown', function(e) {
      switch(e.which) {
        case 27: // Esc
          closeGalViewer(e);
          break;
        default: return; 
      }
      e.preventDefault();
    });
    // var detailsHeaderHtml  = '<div class="bizDetails"><table><tr><td>';
    //     detailsHeaderHtml += '<img src="'+$('.imagen > a > img').attr('src')+'"></td><td>';
    //     detailsHeaderHtml += '<h1>'+$('.titulo')[0].innerText+'</h1><br><h2>'+$('.direccion')[0].innerText+'</h2></td></tr></table></div>';
    // var detailsGalHtml = '<div class="galDetails"><h1>'+$('.itemVideo > h4').first().text()+'</h1><h2>'+$('.itemVideo > h5').first().text()+
    //                       '</h2></div>';
    // $('.gal-info').html(detailsHeaderHtml+detailsGalHtml);
  });
};