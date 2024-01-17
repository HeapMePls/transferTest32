<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Cookie;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Service\UbertoAPICaller;
use EPD\Guia1122\Util\Util;

$orderCheckout = $app['controllers_factory'];

// UBERTO | PEDIDOS
// Solicita el PRE-checkout, y se muestran detalles para confirmar
//
$orderCheckout->get('/pedido/checkout/{idr}/{ids}/{token}', function($idr, $ids, $token) use ($app){
    $showBtnPedidos = TRUE;
    // Get pre-checkout data
    $pre = $app['uberto_api_caller']->orderPreCheckout($token);
    $preString = json_encode($pre->data->user);
    
    // Calculate hour state 
    $today = intval(date('w'));
    $today = ($today == 0) ? 6 : $today-1;
    //$pre->data->hours = Util::buildHoursProfileAsToday($today, $pre->data->hours);
    //$hoursState = Util::checkOpen($today, $pre->data->hours, $app) ;
    $hoursState = $pre->data->hoursState;

    // Check schedule table 
    //$optionsTable = null;
    //if (!$pre->data->hoursState->isOpen && $pre->data->store->outOfHours == 1){
      // Must build table it
      $optionsTable = Util::buildScheduleOrderTable($pre->data->hours, $pre->data->hoursState);
    //}
    // Set last user
    if (property_exists($pre->data, 'user')){
      if (count($pre->data->user) > 0){
        $lastUser = $pre->data->user[count($pre->data->user)-1];
      }else{
        $lastUser = new stdClass();
        $lastUser->name  = '';
        $lastUser->phone = '';
        $lastUser->email = '';
      }
    }

    return $app['twig']->render('uberto/orderCheckout.html.twig', array(
      'token'              => $token,
      'hoursState'         => $hoursState,
      'preString'          => $preString, 
      'pre'                => $pre->data,
      'optionsTable'       => $optionsTable,
      'optionsTableString' => json_encode($pre->data->hours),
      'showBtnPedidos'     => $showBtnPedidos,
      'lastUser'           => $lastUser));

})->bind('orderMenuCheckout');


// UBERTO | PEDIDOS
// Obtiene mas datos de las coordenadas del usuario
//
$orderCheckout->get('/pedido/zoneinfo/{lat}/{lng}', function($lat, $lng) use ($app){

  $res = new \stdClass();
  $res->found = false;

  $raw = $app['api_caller']->call(APICallerService::GM_ZONAS_ACCION, array('want'=>'nearest', 'usrlat'=>$lat, 'usrlon'=>$lng));
  $data = json_decode($raw);

  if (property_exists($data, 'r')){
    if (count($data->r) > 0){
      if ($data->r[0]->inside){
        $res->zon   = $data->r[0]->zon;
        $res->nmz   = $data->r[0]->nmz;
        $res->zonp  = $data->r[0]->zonp;
        $res->nmzp  = $data->r[0]->nmzp;
        $res->sta   = $data->r[0]->sta;
        $res->found = true;
      }
    }
  }
  return $app->json($res);
});


// UBERTO | PEDIDOS 
// Confirma el checkout
//
$orderCheckout->post('/pedido/checkout', function(Request $request) use ($app) {
  $postData   = $request->getContent();
  $data = json_decode($postData);
  // Add deviceId
  $deviceId = $app['api_caller']->getDeviceId($app);
  $data->deviceId = $deviceId;
  // Send request
  $app['logger']->info('Uberto|orderCheckout| Doing checkout for - '.$deviceId.'...');
  $raw = $app['uberto_api_caller']->orderCheckout($data);
  //return $app->json($raw);

  $response = new JsonResponse();
  $response->headers->setCookie(new Cookie('lastreq', TRUE));
  $response->setContent(json_encode($raw));

  return $response;
});


// UBERTO | PEDIDOS 
// Busca coordenadas en base a direccion (geocode via RAL Server)
//
$orderCheckout->get('/pedido/gc/{adr}', function($adr) use ($app){
  
  $app['uberto_api_caller']->init();
  $uri = UbertoAPICaller::$API_SERVER . '/gc?a='.urlencode($adr);

  try{
    $curl = curl_init($uri);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_VERBOSE, 0);
    curl_setopt($curl, CURLOPT_TIMEOUT, 30);
    $curl_response = curl_exec($curl);
    if ($curl_response === false) {
      $info = curl_getinfo($curl);
      curl_close($curl);
      $app['logger']->error('APIU|GC|Error occured during curl exec. Additional info: ' . json_encode($info));
      throw new Exception('APIU|GC|JSON is invalid for request ('.$uri.')');
    }
    $httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curlErr  = curl_errno($curl);
    curl_close($curl);
    // Check HTTP Code
    if ($curlErr != 0){
      throw new Exception('APIU|GC|CURL failed with code ['.$curlErr.'] for ('.$uri.')');
    }
    if ($httpcode != 0 && $httpcode != 200){
      throw new Exception('APIU|GC|CURL failed with http status ['.$httpcode.'] for ('.$uri.')');
    }
    return $app->json(json_decode($curl_response));
  }catch (Exception $ex) {
    $app['logger']->error('APIU|GET|General exception:');
    $app['logger']->error($ex->getMessage());
    $response = new Response();
    $response->headers->set( 'Content-Type', 'application/json' );
    $response->setStatusCode(500);
    return $response;
  }

});

return $orderCheckout;