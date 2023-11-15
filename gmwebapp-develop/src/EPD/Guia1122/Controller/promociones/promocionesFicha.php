<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use EPD\Guia1122\Util\Util,
    EPD\Guia1122\Service\APICallerService;

$promocionesFicha = $app['controllers_factory'];

$promocionesFicha->get('/promocion/{promoNombre}/{promoId}', function(Request $request, $promoNombre, $promoId) use ($app) {
    
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

    $raw = $app['api_caller']->call(APICallerService::GM_PROMOCIONES_ACCION, array(
        'filter'      => 'promo',
        'filtervalue' => $promoId,
        'filtercateg' => '',
        'wherezone'   => $wherezone,
        'html'        => '1'
    ));

    $raw = json_decode($raw, true);
    
    // Check valid data
    $dataValid = FALSE;
    if (array_key_exists('r', $raw)){
        $result = $raw['r'];
        if (array_key_exists('prms', $result)){
            if (count($result['prms']) > 0) {
                $dataValid = TRUE;
            }
        }
    }

    if (!$dataValid){
        return new RedirectResponse("/promociones-y-ofertas");
    }else{
        return $app['twig']->render('promociones/promocionesFicha.html.twig', array(
        'promo'          => $result['prms'][0],
        'categs'         => $result['ctgs'],
        'showBtnPedidos' => $showBtnPedidos
        ));
    }

})->bind('promocionesFicha');

return $promocionesFicha;
