<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;

$uberto = $app['controllers_factory'];


// UBERTO | GENERAL
// Envia datos de subscripcion WebPush al servidor
//
$uberto->post('/pedidos/pushsubscribe', function(Request $request) use ($app) {
  //$app['logger']->debug('Uberto|pushSubscribe|Getting device token...');
  $dtToken    = $app['api_caller']->getDeviceToken($app);
  //$app['logger']->debug('Uberto|pushSubscribe|Device token is [' . $dtToken . ']');
  $postData   = $request->getContent();
  $country = '';
  if ($app['config']['brand.country'] == 'uy'){
    $country = 'UY';
  }else if ($app['config']['brand.country'] == 'py'){
    $country = 'PY';
  }
  $postParams = array('country'=>$country, 'did'=>$dtToken, 'k'=>'0', 'v'=>'');
  $app['logger']->debug('Uberto|pushSubscribe|Sending subscription data: ['.json_encode($postParams).']['.$postData.']');
  $raw = $app['api_caller']->callPost(APICallerService::GM_DEVICE_DATA_SET, $postParams, $postData);
  $app['logger']->debug('Uberto|pushSubscribe|Subscription response : ' . $raw);
  return $app->json(json_decode($raw));
  //return $app->json(json_decode('OK'));
});


// UBERTO | GENERAL
// Verifica si las coordenadas del usuario estan dentro de la cobertura del negocio
//
$uberto->get('/pedidos/checkDeliveryCoverageZone/{idr}/{ids}/{lat}/{lng}', function($idr, $ids, $lat, $lng) use ($app) {
  $app['logger']->debug('Uberto|checkDeliveryCoverageZone|Checking coverage for '.$idr.'-'.$ids.' at '.$lat.','.$lng.'...');
  $params = array(
    'idr' => $idr,
    'ids' => $ids,
    'point' => array(
      'x' => $lat,
      'y' => $lng
    )
  );
  $res = $app['uberto_api_caller']->checkDeliveryCoverageZone($params);
  
  $app['logger']->debug('Uberto|checkDeliveryCoverageZone|Response is [' . json_encode($res) . ']');
  return $app->json($res);
});


// UBERTO | GENERAL
// Retorna HTML para reveal con datos de cobertura para delivery
//
$uberto->get('/pedidos/listDeliveryCoverage/{idr}/{ids}', function($idr, $ids) use ($app) {
  
  $app['logger']->debug('Uberto|listDeliveryCoverage|Listing coverage for '.$idr.'-'.$ids.'...');
  $res = $app['uberto_api_caller']->listDeliveryCoverage($idr, $ids);
  
  // $zonesData = array();
  // for($i=0; $i < count($res->data->zones); $i++){
  //   $zonesData[] = array(
  //     'name'  => $res->data->zones[$i]->name,
  //     'cost'  => $res->data->zones[$i]->amount,
  //   );
  // }

  // return $app['twig']->render('components/uberto/deliveryCoverage.html.twig', array(
  //       'storeName'   => $res->data->storeName,
  //       'zones'       => $zonesData,
  //       'dataString'  => json_encode($res->data)));
  return $app->json($res->data);
});


return $uberto;
