<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Util\Util,
    EPD\Guia1122\Service\APICallerService;

$horoscopo = $app['controllers_factory'];

$horoscopo->get('/horoscopo', function(Request $request) use ($app) {

    // Check wherezone available
    $wherezone = '';
    $title     = '';
    $cookies = $request->cookies;
    if ($cookies->has('lastzone')){
        $tempwz = explode('|',$cookies->get('lastzone'));
        if (count($tempwz) > 1){
            $wherezone = $tempwz[1];
        }
    }
    $showBtnPedidos = ($cookies->has('lastreq'));

    $raw = $app['api_caller']->call(APICallerService::GM_QUERY, array(
        'txt'        => 'VIDENTE', 
        'suggestion' => '3379',
        'suggstrict' => '1',
        'window'     => '0|0',
        'wherezone'  => $wherezone));

    $data = json_decode($raw);

    $stores = array();
    if (property_exists($data, 'r')){
        if (property_exists($data->r, 'prd')){
            if (count($data->r->prd) > 0){
                $stores = array_slice($data->r->prd[0]->sto, 0, 8);
            }
        }
    }
    
    return $app['twig']->render('subapps/horoscopo.html.twig', array(
        'stores'         => $stores,
        'showBtnPedidos' => $showBtnPedidos,
        'lastzone'       => $wherezone
    ));
    
})->bind('horoscopo');


$horoscopo->get('/horoscopo/{sign}', function($sign) use ($app) {
  
  $raw = $app['api_caller']->call(APICallerService::GM_QUERY, array('txt' => 'HOROSCOPO ' . $sign, 'special' => '1'));

  $res = json_decode($raw);
  if ($res->outcode === 0){
    return $app->json($res->r->datosOriginales);
  }else{
    $app['logger']->info("Horoscopo| API returned error " + $res->outcode + " [" + $res->outmsg + "]");
    return $app->json(array('error'=>'No se pudo obtener ahora'));
  }
});

return $horoscopo;
