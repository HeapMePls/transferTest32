'use strict';

self.addEventListener('push', function(event) {

  console.log('Received a push message', event);

  var title = 'Nueva respuesta';
  var body = '';
  var icon = '/img/icos/android-chrome-144x144.png';
  var tag = 'simple-push-demo-notification-tag';

  if (event.data !== undefined && event.data !== null){
    var pushData = event.data.json();
    
    // console.info('-------------------------');
    // console.info(pushData);
    // console.info('-------------------------');

    if (pushData.t == 1){
      title = 'Respuesta de presupuesto';
      body  = '📩 Nueva respuesta de ' + pushData.rn + '. Haz clic aqui para verla.';
    }else if (pushData.t == 2){
      title = 'Trabajo finalizado';
      body  = '✔️ '+pushData.rn + ' ha marcado el trabajo como realizado. Escribe una reseña sobre esto.';
    }else if (pushData.t == 3){
      body =  '👍🏽 ' + pushData.rn + ' acepto su pedido';
    }else if (pushData.t == 4){
      body = '🚚 ' + pushData.rn + ' marco el pedido como entregado.  Escribe una reseña sobre esto.';
    }else if (pushData.t == 6){
      title = 'Respuesta de presupuesto actualizada';
      body = '📩 Respuesta actualizada por ' + pushData.rn + '. Haz clic aqui para verla.';
    }
  }
  

  event.waitUntil(
    self.registration.showNotification(title, {
      body : body,
      icon : icon,
      tag  : tag,
      data : pushData
      // actions: [
      //   { action: "viewOrder", title: "Ver pedido" }
      // ]
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event.notification.tag);
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function(clientList) {
    var url = '';
    if (event.notification.data.t == 1 || event.notification.data.t == 2 || event.notification.data.t == 6){
      url = '/presupuesto/v/' + event.notification.data.tk;
    }else if (event.notification.data.t == 3){
      url = '/pedidos/pedido/' + event.notification.data.tk + '?idr=' + event.notification.data.v2 + '&ids=' + event.notification.data.v3;
    }else if (event.notification.data.t == 4){
      url = '/pedidos/pedido/' + event.notification.data.tk + '?idr=' + event.notification.data.v1 + '&ids=' + event.notification.data.v2;
    }
    if (clientList.length == 0){
      return clients.openWindow(url);
    }else{
      return clientList[0].navigate(url).then(function(client){client.focus()});
    }
  }));
});