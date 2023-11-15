var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.favorites = {};

gmwa.controllers.favorites.init = function(){
  // Hook Bookmark
  $('.savedDelete').click(function(e){
    var fav = $(this).data('fav');
    gmwa.controllers.comercio.toggleFavorite($(this).data('idr'), $(this).data('ids'), 'del', function(res){
      if (res){
        $('#fav-' + fav).remove();
      }
    });
  });

  gmwa.components.header.init();

  $('.btns-rem').each(function(el){
    $(this).on("click", function(e){
      e.preventDefault();
      var data      = {};
      data.retailer = $(this).data('idr');
      data.store    = $(this).data('ids');
      data.op       = 'del'
      $.ajax({
        type        : "POST",
        url         : '/local/fav',
        data        : JSON.stringify(data),
        dataType    : 'json',
        contentType : "application/json; charset=utf-8"
      }).done(function(resData){
        if (resData.outcode == '0'){
          var idLoc = ( (data.retailer * 10000) + data.store);
          $('#fav-'+idLoc).remove();
        }else{
          gmwa.logger.error('toggleFavorite | Server returned ' + resData.outcode + ' (' + resData.outmsg + ')');
        }
      }).fail(function(err){
        gmwa.logger.error('toggleFavorite | API returned error: ' + JSON.stringify(err));
      });
    })
  });

  gmwa.controllers.comercio.toggleFavorite = function(idr, ids, op, cb){
    var data = {
      op       : op,
      retailer : idr,
      store    : ids
    }
    $.ajax({
      type        : "POST",
      url         : '/local/fav',
      data        : JSON.stringify(data),
      dataType    : 'json',
      contentType : "application/json; charset=utf-8"
    }).done(function(resData){
      if (resData.outcode == '0'){
        cb(true);
      }else{
        if (resData.outcode == 999){
          gmwa.utils.showError('Inicia sesión', 'Para poder guardar tus lugares favoritos');
          cb(false);
        }else{
          gmwa.logger.error('toggleFavorite | Server returned ' + resData.outcode + ' (' + resData.outmsg + ')');
          cb(false);
        }
      }
    }).fail(function(err){
      gmwa.logger.error('toggleFavorite | API returned error: ' + JSON.stringify(err));
      cb(false);
    });
  }

}