var gmwa = gmwa || {};
gmwa.webpush = {};

gmwa.webpush.isPushEnabled   = false;
gmwa.webpush.isPushSupported = false;
gmwa.webpush.isBlocked       = false;
gmwa.webpush.pushId          = "web.uy.com.1122";  

gmwa.webpush.urlBase64ToUint8Array = function(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

gmwa.webpush.unsubscribe = function(cb) {
  if (!gmwa.isSafari){
    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
      // To unsubscribe from push messaging, you need get the
      // subcription object, which you can call unsubscribe() on.
      gmwa.logger.log('WebPush|Unsubscribe from push requested');
      serviceWorkerRegistration.pushManager.getSubscription().then(
        function(pushSubscription) {
          // Check we have a subscription to unsubscribe
          if (!pushSubscription) {
            // No subscription object, so set the state
            // to allow the user to subscribe to push
            gmwa.webpush.isPushEnabled = false;
            gmwa.logger.log('WebPush|No subscription yet. User must request permission');
            cb(0);
            return;
          }

          // TODO: Make a request to your server to remove
          // the users data from your data store so you
          // don't attempt to send them push messages anymore

          // We have a subcription, so call unsubscribe on it
          pushSubscription.unsubscribe().then(function() {
            gmwa.logger.log('WebPush|Push service unsubscribed');
            gmwa.webpush.isPushEnabled = false;
            cb(0);
          }).catch(function(e) {
            // We failed to unsubscribe, this can lead to
            // an unusual state, so may be best to remove
            // the subscription id from your data store and
            // inform the user that you disabled push
            cb(-1);
            gmwa.logger.log('WebPush|Unsubscription error: ', e);
          });
        }).catch(function(e) {
          cb(-2);
          gmwa.logger.log('WebPush|Error thrown while unsubscribing from ' + 'push messaging.', e);
        });
    });
  }else{

  }
}

gmwa.webpush.subscribe = function(cb) {
  
  if (!gmwa.isSafari){
    // Request permission at Chrome
    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
      gmwa.logger.log('WebPush|Subscribe to push requested');
      var pubKey = '';
      if (window.location.hostname.toLowerCase().indexOf("buscoinfo") >= 0){
        pubKey = 'BMdNOGlVFilaDpgOdZTP1znMUxo93j6ck8J4Rt3sMpdPHPkoyiJTfuUe3X2379dMfIy-zDETn3S_2GF5Ownc_qg';
      }else{
        pubKey = 'BAmkGWd5l67dpfKt35y1C5w33tyxuK3if4XbYLe3j69z2R5ZhLPsh3-flPdwIC_1Ecle9WRHXJXY_s61uzIlMFo';
      }
      gmwa.logger.log('WebPush|Will request notifications subscription with pub key => ' + pubKey);
      const convPubKey = gmwa.webpush.urlBase64ToUint8Array(pubKey);
      serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convPubKey
      }).then(function(subscription) {
        // The subscription was successful
        gmwa.webpush.isPushEnabled = true;

        // TODO: Send the subscription subscription.endpoint
        // to your server and save it to send a push message
        // at a later date
        if (cb) cb(0)
        return gmwa.webpush.sendSubscriptionToServer(subscription);
      }).catch(function(e) {
        if (Notification.permission === 'denied') {
          // The user denied the notification permission which
          // means we failed to subscribe and the user will need
          // to manually change the notification permission to
          // subscribe to push messages
          gmwa.logger.log('WebPush|Permission for Notifications was denied');
          if (cb) cb(-1);
        } else {
          // A problem occurred with the subscription, this can
          // often be down to an issue or lack of the gcm_sender_id
          // and / or gcm_user_visible_only
          gmwa.logger.error('WebPush|Unable to subscribe to push.', e);
          if (cb) cb(-2);
        }
      });
    });
  }else{
    // Request permission at Safari
    if ('safari' in window && 'pushNotification' in window.safari) {
      gmwa.logger.log('WebPush|Subscribe to push requested for PushID ' + gmwa.webpush.pushId);
      var permissionData = window.safari.pushNotification.permission(gmwa.webpush.pushId); 
      if (permissionData.permission === 'denied') {  
        gmwa.logger.log('WebPush|Permission for Notifications was denied');
        gmwa.logger.log(permissionData);
        if (cb) cb(-1);
      }else if (permissionData.permission === 'granted') {
        gmwa.webpush.isPushEnabled = true;
        if (cb) cb(0)
        gmwa.logger.log('WebPush|Permission for Notifications was granted!');
        gmwa.logger.log(permissionData);
        return gmwa.webpush.sendSubscriptionToServer({isAPN:true, endpoint:permissionData.deviceToken});
      }else if (permissionData.permission === 'default') {
        window.safari.pushNotification.requestPermission(  
          'https://wgm.tingelmar.com',  
          gmwa.webpush.pushId,  
          {"id":"web.wgm"},  
          function (permissionData){
            if (permissionData.permission === 'denied') {  
              gmwa.logger.log('WebPush|Permission for Notifications was denied');
              gmwa.logger.log(permissionData);
              if (cb) cb(-1);
            }else if (permissionData.permission === 'granted') {
              gmwa.webpush.isPushEnabled = true;
              gmwa.logger.log('WebPush|Permission for Notifications was granted!');
              gmwa.logger.log(permissionData);

              // TODO: Send the subscription subscription.endpoint
              // to your server and save it to send a push message
              // at a later date
              if (cb) cb(0)
              return gmwa.webpush.sendSubscriptionToServer({isAPN:true, endpoint:permissionData.deviceToken});
            }else{
              gmwa.logger.log('WebPush|Permission for Notifications is unknown!');
              gmwa.logger.log(permissionData);
            }
          });
      }else{
        gmwa.logger.log('WebPush|Permission for Notifications is unknown!');
        gmwa.logger.log(permissionData);
      }
    }else{
      gmwa.logger.log('WebPush|WebPush not supported');
      if (cb) cb(-2);
    }
    
  }
}

gmwa.webpush.sendSubscriptionToServer = function(subscription) {
  var splittedEP = subscription.endpoint.split('/');
  //gmwa.logger.log('PushToken --> ' + splittedEP[splittedEP.length-1]);
  var data = JSON.stringify(subscription);
  //gmwa.logger.info(data);

  //Check if we are synced
  // var localSubs = JSON.stringify(gmwa.storage.get('_gmwa_subscription'));
  // if (localSubs == data){
  //   gmwa.logger.log('WebPush|Subscription is synched!');
  //   return;
  // }
  // gmwa.logger.log('WebPush|Subscription differs or does not exists, must sync now!');
  var url = '/pedidos/pushsubscribe?dt=' + gmwa.storage.get('_gmwa_dt');
  $.ajax({
    type     : "POST",
    url      : url,
    data     : data,
    dataType : 'json',
    contentType:"application/json; charset=utf-8"
  }).done(function(resData){
    if (resData.outcode === 0){
      gmwa.logger.log('WebPush|API returned OK: ' + JSON.stringify(resData));
      gmwa.storage.set('_gmwa_subscription', data);
      gmwa.logger.log('WebPush|Subscription saved to local storage');
      gmwa.logger.log(data);
    }else{
      gmwa.logger.error('WebPush|API returned error: ' + JSON.stringify(resData));
    }
  }).fail(function(err){
    gmwa.logger.error('WebPush|API returned error: ' + JSON.stringify(err));
  });
}