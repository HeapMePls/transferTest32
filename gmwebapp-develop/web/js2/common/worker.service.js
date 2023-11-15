var gmjs = gmjs || {};
gmjs.services = gmjs.services || {};
gmjs.services.worker = {};

gmjs.services.worker.register = function(){
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(gmjs.services.worker.initialiseState);
  } else {
    if (!gmjs.isSafari){
      gmjs.logger.log('App|Service workers aren\'t supported in this browser.');
    }else{
      gmjs.logger.log('App|Safari delaying check....');
      setTimeout(function(){
        gmjs.services.worker.initialiseState();
      }, 500);
    }
  }
}

gmjs.services.worker.onInitializeState = function(f){
  if (gmjs.services.worker.eventSubsInitializeState === undefined){
    gmjs.services.worker.eventSubsInitializeState = [];
  }
  gmjs.services.worker.eventSubsInitializeState.push(f);
}

gmjs.services.worker.triggerInitializeState = function(isSupported, isEnabled, isBlocked){
  if (gmjs.services.worker.eventSubsInitializeState !== undefined){
    for(var i=0; i < gmjs.services.worker.eventSubsInitializeState.length; i++){
      gmjs.services.worker.eventSubsInitializeState[i]({isPushSupported:isSupported, isPushEnabled:isEnabled, isPushBlocked:isBlocked});
    }
  }
}



gmjs.services.worker.initialiseState = function() {
  // Chrome handler
  if (!gmjs.isSafari){
    // Are Notifications supported in the service worker?
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
      gmjs.logger.log('App|InitState|Notifications aren\'t supported.');
      gmjs.services.worker.triggerInitializeState(false, false, false);
      return;
    }else{
      gmjs.webpush.isPushSupported = true;
    }

    // Check the current Notification permission.
    // If its denied, it's a permanent block until the
    // user changes the permission
    if (Notification.permission === 'denied') {
      gmjs.logger.log('App|InitState|The user has blocked notifications.');
      gmjs.webpush.isBlocked = true;
      gmjs.services.worker.triggerInitializeState(true, false, true);
      return;
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
      gmjs.logger.log('App|InitState|Push messaging isn\'t supported.');
      gmjs.services.worker.triggerInitializeState(true, false, true);
      return;
    }

    // We need the service worker registration to check for a subscription
    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
      // Do we already have a push message subscription?
      serviceWorkerRegistration.pushManager.getSubscription()
        .then(function(subscription) {
          // Enable any UI which subscribes / unsubscribes from
          // push messages.
          //var pushButton = document.querySelector('.js-push-button');
          //pushButton.disabled = false;

          if (!subscription) {
            // We aren’t subscribed to push, so set UI
            // to allow the user to enable push
            gmjs.logger.log('App|PushManager|No push registration detected. User must request it.');
            gmjs.services.worker.triggerInitializeState(true, false, false);
            return;
          }

          // Keep your server in sync with the latest subscription
          if (gmjs.router.sendPushSubscription){
            gmjs.logger.log('App|PushManager|Found existing push registration, synching with server...');
            gmjs.webpush.sendSubscriptionToServer(subscription);
          }

          // Set your UI to show they have subscribed for
          // push messages
          gmjs.webpush.isPushEnabled = true;
          gmjs.services.worker.triggerInitializeState(true, true, false);
        })
        .catch(function(err) {
          gmjs.logger.error('App|PushManager|Error during getSubscription()', err);
        });
    });
      
  }else{
    // Safari handler
    if ('safari' in window && 'pushNotification' in window.safari) {
        var permissionData = window.safari.pushNotification.permission(gmjs.webpush.pushId);  
        gmjs.webpush.isPushSupported = true;
    } else {  
        gmjs.logger.log('App|InitState|Notifications aren\'t supported.');
        gmjs.services.worker.triggerInitializeState(false, false, false);
        return;
    }


    // Check the current Notification permission.
    // If its denied, it's a permanent block until the
    // user changes the permission
    if (permissionData.permission === 'denied') {
      gmjs.logger.log('App|InitState|The user has blocked notifications.');
      gmjs.webpush.isBlocked = true;
      gmjs.services.worker.triggerInitializeState(true, false, true);
    }else if (permissionData.permission === 'granted') {
      gmjs.logger.log("User is already subscriberd with token: "+ permissionData.deviceToken); 
      
      // Keep your server in sync with the latest subscription
      if (gmjs.router.sendPushSubscription){
        gmjs.logger.log('App|PushManager|Found existing push registration, synching with server...');
        gmjs.webpush.sendSubscriptionToServer({isAPN: true, endpoint: permissionData.deviceToken});
      }
      
      // Set your UI to show they have subscribed for
      // push messages
      gmjs.webpush.isPushEnabled = true;
      gmjs.services.worker.triggerInitializeState(true, true, false);
    }
      
  }
}
