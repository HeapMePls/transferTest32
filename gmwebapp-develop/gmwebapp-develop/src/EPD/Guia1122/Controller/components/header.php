<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Util;

$headerComponent = $app['controllers_factory'];

$headerComponent->get('/components/header/{forceServer}/{zoneId}/{zoneName}/{jsVersion}', function(Request $request, $forceServer, $zoneId, $zoneName, $jsVersion) use ($app) {
  
    $cookies        = $request->cookies;
    $showBtnPedidos = ($cookies->has('lastreq'));
    $deviceId       = $app['api_caller']->getDeviceId($app);
    $userData       = $app['uberto_api_caller']->getUserData($deviceId, ($forceServer == '1'));
    $cart           = $request->query->get('cart');
    $idr            = $request->query->get('idr');
    $ids            = $request->query->get('ids');
    $token          = $request->query->get('token');

    if ($zoneId[0] == 'Z'){
      $zoneId = substr($zoneId, 1);
    }

    $headerData = array(
      'showBtnPedidos' => $showBtnPedidos,
      'userData'       => $userData,
      'cart'           => $cart,
      'idr'            => $idr,
      'ids'            => $ids,
      'token'          => $token,
      'zoneId'         => $zoneId,
      'zoneName'       => $zoneName,
      'jsVersion'      => $jsVersion
    );

    // Render quote view page
    
    return $app['twig']->render('components/header/header_'.$app['config']['brand.country'].'.html.twig', array(
      'header' => $headerData 
    ));


})->bind('headerComponent')->value('forceServer', '0')->value('zoneId', '00001')->value('zoneName', 'todo-el-pais')->value('jsVersion', 1);

return $headerComponent;