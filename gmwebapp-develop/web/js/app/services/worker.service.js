var gmwa = gmwa || {};
gmwa.services = gmwa.services || {};
gmwa.services.worker = {};

gmwa.services.worker.register = function(){
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(gmwa.services.worker.initialiseState);
  } else {
    if (!gmwa.isSafari){
      gmwa.logger.log('App|Service workers aren\'t supported in this browser.');
    }else{
      gmwa.logger.log('App|Safari delaying check....');
      setTimeout(function(){
        gmwa.services.worker.initialiseState();
      }, 500);
    }
  }
}

gmwa.services.worker.onInitializeState = function(f){
  if (gmwa.services.worker.eventSubsInitializeState === undefined){
    gmwa.services.worker.eventSubsInitializeState = [];
  }
  gmwa.services.worker.eventSubsInitializeState.push(f);
}

gmwa.services.worker.triggerInitializeState = function(isSupported, isEnabled, isBlocked){
  if (gmwa.services.worker.eventSubsInitializeState !== undefined){
    for(var i=0; i < gmwa.services.worker.eventSubsInitializeState.length; i++){
      gmwa.services.worker.eventSubsInitializeState[i]({isPushSupported:isSupported, isPushEnabled:isEnabled, isPushBlocked:isBlocked});
    }
  }
}



gmwa.services.worker.initialiseState = function() {
  // Chrome handler
  if (!gmwa.isSafari){
    // Are Notifications supported in the service worker?
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
      gmwa.logger.log('App|InitState|Notifications aren\'t supported.');
      gmwa.services.worker.triggerInitializeState(false, false, false);
      return;
    }else{
      gmwa.webpush.isPushSupported = true;
    }

    // Check the current Notification permission.
    // If its denied, it's a permanent block until the
    // user changes the permission
    if (Notification.permission === 'denied') {
      gmwa.logger.log('App|InitState|The user has blocked notifications.');
      gmwa.webpush.isBlocked = true;
      gmwa.services.worker.triggerInitializeState(true, false, true);
      return;
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
      gmwa.logger.log('App|InitState|Push messaging isn\'t supported.');
      gmwa.services.worker.triggerInitializeState(true, false, true);
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
            gmwa.logger.log('App|PushManager|No push registration detected. User must request it.');
            gmwa.services.worker.triggerInitializeState(true, false, false);
            return;
          }

          // Keep your server in sync with the latest subscription
          if (gmwa.router.sendPushSubscription){
            gmwa.logger.log('App|PushManager|Found existing push registration, synching with server...');
            gmwa.webpush.sendSubscriptionToServer(subscription);
          }

          // Set your UI to show they have subscribed for
          // push messages
          gmwa.webpush.isPushEnabled = true;
          gmwa.services.worker.triggerInitializeState(true, true, false);
        })
        .catch(function(err) {
          gmwa.logger.error('App|PushManager|Error during getSubscription()', err);
        });
    });
      
  }else{
    // Safari handler
    if ('safari' in window && 'pushNotification' in window.safari) {
        var permissionData = window.safari.pushNotification.permission(gmwa.webpush.pushId);  
        gmwa.webpush.isPushSupported = true;
    } else {  
        gmwa.logger.log('App|InitState|Notifications aren\'t supported.');
        gmwa.services.worker.triggerInitializeState(false, false, false);
        return;
    }


    // Check the current Notification permission.
    // If its denied, it's a permanent block until the
    // user changes the permission
    if (permissionData.permission === 'denied') {
      gmwa.logger.log('App|InitState|The user has blocked notifications.');
      gmwa.webpush.isBlocked = true;
      gmwa.services.worker.triggerInitializeState(true, false, true);
    }else if (permissionData.permission === 'granted') {
      gmwa.logger.log("User is already subscriberd with token: "+ permissionData.deviceToken); 
      
      // Keep your server in sync with the latest subscription
      if (gmwa.router.sendPushSubscription){
        gmwa.logger.log('App|PushManager|Found existing push registration, synching with server...');
        gmwa.webpush.sendSubscriptionToServer({isAPN: true, endpoint: permissionData.deviceToken});
      }
      
      // Set your UI to show they have subscribed for
      // push messages
      gmwa.webpush.isPushEnabled = true;
      gmwa.services.worker.triggerInitializeState(true, true, false);
    }
      
  }
}
