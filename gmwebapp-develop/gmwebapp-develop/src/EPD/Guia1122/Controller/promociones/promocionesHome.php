<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Util\Util,
    EPD\Guia1122\Service\APICallerService;

$promocionesHome = $app['controllers_factory'];

$promocionesHome->get('/promociones-y-ofertas', function(Request $request) use ($app) {
    
    // Check wherezone available
    $wherezone = '';
    $cookies = $request->cookies;
    if ($cookies->has('lastzone')){
        $tempwz = explode('|',$cookies->get('lastzone'));
        if (count($tempwz) > 1){
            $wherezone = $tempwz[1];
        }
    }
    $showBtnPedidos = ($cookies->has('lastreq'));

    $raw = $app['api_caller']->call(APICallerService::GM_PROMO_HOME2_ACCION, array('wherezone' => $wherezone));

    $raw = json_decode($raw, true);
    $result = $raw['r'];

    return $app['twig']->render('promociones/promocionesHome.html.twig', array(
      'categs'         => $result['prms'],
      'showBtnPedidos' => $showBtnPedidos,
      'lastzone'       => $wherezone
    ));

})->bind('promocionesHome');

return $promocionesHome;
