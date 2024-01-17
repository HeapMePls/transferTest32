var gmjs = gmjs || {};
gmjs.reveal = gmjs.reveal || {};

gmjs.reveal.init = function(){
  var els = document.querySelectorAll('[data-open]');
  if (els){
    for(var i=0; i < els.length; i++){
      els[i].addEventListener('click', function(ev){
        gmjs.reveal.showDialog(ev.currentTarget.getAttribute('data-open'));
      });
    }
  }
  els = document.querySelectorAll('[data-close]');
  if (els){
    for(var i=0; i < els.length; i++){
      els[i].style.cursor = 'pointer';
      els[i].addEventListener('click', function(ev){
        var dialEl = ev.currentTarget.closest('.reveal-overlay');
        if (dialEl){
          dialEl.style.display = 'none';
        }
      });
    }
  }
}

gmjs.reveal.showDialog = function(dialogId){
  var dialogEl = document.getElementById(dialogId);
  if (!dialogEl) return;

  var dialogBackId = 'back_'+dialogId;
  if (!gmjs.reveal[dialogBackId]){
    var backdropHtml = '<div id="'+dialogBackId+'" class="reveal-overlay"></div>';
    document.body.insertAdjacentHTML("beforeend", backdropHtml);
    gmjs.reveal[dialogBackId] = document.getElementById(dialogBackId);
    gmjs.reveal[dialogBackId].appendChild(dialogEl);
    gmjs.reveal[dialogBackId].style.display = 'block';
    dialogEl.style.display = 'block';
    gmjs.reveal[dialogBackId].addEventListener('click', function(ev){
      if (ev.target == gmjs.reveal[dialogBackId]){
        gmjs.reveal[dialogBackId].style.display = 'none';
      }
    })
  }else{
    gmjs.reveal[dialogBackId].style.display = 'block';
  }
}