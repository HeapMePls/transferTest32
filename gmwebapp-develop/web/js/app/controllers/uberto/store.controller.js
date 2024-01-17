var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.store = {};

gmwa.controllers.store.init = function(){
  var sType = $('#retInfoCntr').data('stype');
  if (sType == '1'){
    // Big
    gmwa.controllers.storeBig.init();
  }else{
    // Small
    gmwa.controllers.storeSmall.init();
  }
}