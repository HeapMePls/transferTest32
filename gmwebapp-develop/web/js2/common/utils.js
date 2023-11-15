var gmjs = gmjs || {};
gmjs.utils = {};
gmjs.utils.eErrMsg = null;

gmjs.utils.isMobile = function (){
  return ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) );
}

gmjs.utils.isAndroid = function (){
  return ( /Android/i.test(navigator.userAgent) );
}

gmjs.utils.showProgress = function(title, subtitle, showBox, blur){
  var winHtml = '<div id="divProgress" style="position:fixed;left:0px;top:0px;width:100vw;height:100vh;z-index:2000;background-color: rgba(0,0,0,0.5);text-align: center;">';
  if (showBox){
    winHtml += '<div style="margin-top: 20px;text-align: center;background-color: #FFF;display: inline-block;padding: 10px; box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.5);">';
    winHtml += '<div id="galspinner" class="spinner" style="margin-top: 20px;"><div class="rect1" style="background-color:#757575"></div><div class="rect2" style="background-color:#757575"></div><div class="rect3" style="background-color:#757575"></div><div class="rect4" style="background-color:#757575"></div><div class="rect5" style="background-color:#757575"></div></div>';
    winHtml += '<div style="font-size:22px;font-weight:100">'+title +'</div><div>'+subtitle+'</div></div>'
  }  
  winHtml += '</div>';
  document.body.insertAdjacentHTML("beforeend", winHtml);
  gmjs.utils.divProgress = document.getElementById('divProgress');
  if (blur){
    if (!gmjs.utils.guiaContainer) gmjs.utils.guiaContainer = document.getElementById('guia-container');
    gmjs.utils.guiaContainer.style.filter = 'blur(2px)';
  }
}

gmjs.utils.hideProgress = function(){
  // $('#divProgress').remove();
  document.body.removeChild(gmjs.utils.divProgress);
  gmjs.utils.guiaContainer.style.filter = 'blur(0px)';
}

gmjs.utils.showError = function(title, message){
  if (gmjs.utils.eErrMsg === null){
    var errHtml = '<div class="tiny reveal" id="errMsg" data-reveal><h4>'+title+'</h4><p>'+message+'</p><button class="button" data-close>OK</button><button class="close-button" data-close aria-label="Close reveal" type="button"><span aria-hidden="true">&times;</span></button></div>';
    // gmjs.utils.eErrMsg = document.createElement(errHtml);
    document.body.insertAdjacentHTML("beforeend", errHtml);
    gmjs.utils.eErrMsg = document.getElementById('errMsg');
    // gmjs.utils.eErrMsg.foundation();
    // gmjs.utils.eErrMsg.foundation('open');
    gmjs.utils.eErrMsg.style.display = 'block';
  }else{
    // gmjs.utils.eErrMsg.foundation('open');
    gmjs.utils.eErrMsg.style.display = 'block';
  }
}

gmjs.utils.scrollTo = function(e){
  // $('html, body').animate({
  //   scrollTop: $("#"+e).offset().top
  // }, 500);
  var element = document.getElementById(e);
  if (!element) return;
  var pos = element.offsetTop;
  var currentPos = window.pageYOffset;
  var start = null;
  var time = 500;
  pos = +pos, time = +time;
  window.requestAnimationFrame(function step(currentTime) {
      start = !start ? currentTime : start;
      var progress = currentTime - start;
      if (currentPos < pos) {
          window.scrollTo(0, ((pos - currentPos) * progress / time) + currentPos);
      } else {
          window.scrollTo(0, currentPos - ((currentPos - pos) * progress / time));
      }
      if (progress < time) {
          window.requestAnimationFrame(step);
      } else {
          window.scrollTo(0, pos);
      }
  });
}

gmjs.utils.flash = function(e){
  // $('#'+e).effect("highlight", {}, 2000);
  return;
}

gmjs.utils.formatNumber = function(num, decimals, groupSep, decimalSep, currency) {
  decimals   = typeof decimals    === 'undefined' ? 2    : decimals;
  groupSep   = typeof groupSep    === 'undefined' ? '.'  : groupSep;
  decimalSep = typeof decimalSep  === 'undefined' ? ','  : decimalSep;
  currency   = typeof currency    === 'undefined' ? '$U' : currency;

  var x = 3;
  var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (decimals > 0 ? '\\D' : '$') + ')';
  var lnum = parseFloat(num).toFixed(Math.max(0, ~~decimals));

  return (decimalSep ? lnum.replace('.', decimalSep) : lnum).replace(new RegExp(re, 'g'), '$&' + (groupSep || ','));
};

gmjs.utils.formatNumberObject = function(num, decimals, groupSep, decimalSep, currency) {
  decimals   = typeof decimals    === 'undefined' ? 2    : decimals;
  groupSep   = typeof groupSep    === 'undefined' ? '.'  : groupSep;
  decimalSep = typeof decimalSep  === 'undefined' ? ','  : decimalSep;
  currency   = typeof currency    === 'undefined' ? '$U' : currency;

  var x = 3;
  var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (decimals > 0 ? '\\D' : '$') + ')';
  var lnum = parseFloat(num).toFixed(Math.max(0, ~~decimals));

  var result = (decimalSep ? lnum.replace('.', decimalSep) : lnum).replace(new RegExp(re, 'g'), '$&' + (groupSep || ',')).toString();
  var spResult = result.split(',');
  return {
    number   : spResult[0],
    decimals : typeof spResult[1] === 'undefined' ? '' : spResult[1],
    currency : currency
  }
};

gmjs.utils.formatNumberHTML = function(num, decimals, groupSep, decimalSep, currency) {
  decimals   = typeof decimals    === 'undefined' ? 2    : decimals;
  groupSep   = typeof groupSep    === 'undefined' ? '.'  : groupSep;
  decimalSep = typeof decimalSep  === 'undefined' ? ','  : decimalSep;
  currency   = typeof currency    === 'undefined' ? '$U' : currency;

  var x = 3;
  var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (decimals > 0 ? '\\D' : '$') + ')';
  var lnum = parseFloat(num).toFixed(Math.max(0, ~~decimals));

  var result = (decimalSep ? lnum.replace('.', decimalSep) : lnum).replace(new RegExp(re, 'g'), '$&' + (groupSep || ',')).toString();
  var spResult = result.split(',');
  var oResult = {
    number   : spResult[0],
    decimals : typeof spResult[1] === 'undefined' ? '' : spResult[1],
    currency : currency
  };

  return '<span class="currency">'+oResult.currency+'</span> '+oResult.number+'<span class="decimals">,'+oResult.decimals+'</span>';
};

gmjs.utils.loadStylesheet = function(url, callback) {
  var stylesheet = document.createElement('link');
  stylesheet.href = url;
  stylesheet.rel = 'stylesheet';
  stylesheet.type = 'text/css';
  stylesheet.media = 'only x';
  stylesheet.onload = function() {
    stylesheet.media = 'all';
    callback();
  };
  document.getElementsByTagName('head')[0].appendChild(stylesheet);
};

gmjs.utils.loadScript = function(url, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  if (script.readyState) {
    script.onreadystatechange = function () {
      if (script.readyState == "loaded" || script.readyState == "complete") {
        script.onreadystatechange = null;
        if (callback && typeof callback === "function") {
          callback();
        }
      }
    };
  } else {
    script.onload = function () {
      if (callback && typeof callback === "function") {
        callback();
      }
    };
  }
  script.src = url;
  (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
}

gmjs.utils.sendGAEvent = function(categ, action, label){
  if (gtag){
    console.log('Utils | sendGAEvent | Sending event(' + categ + ',' + action + ',' + label + ')');
    var temp = label.split("|");
    var name = temp[0];
    var idr = temp[1];
    var ids = temp[2];
    gtag('event', action, {
      'event_category': categ,
      'event_label': label,
      'name': name,
      'idr': idr,
      'ids': ids
    });
  }
}

gmjs.utils.isEmail = function(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}