<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use EPD\Guia1122\Util\Util,
    EPD\Guia1122\Service\APICallerService;

$azar = $app['controllers_factory'];

$azar->get('/azar', function(Request $request) use ($app) {

    // Check country
    if ($app['config']['brand.country'] != 'uy'){
      return new RedirectResponse('/', 302);
    }

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

    // GET 5 de ORO DATA
    $raw = $app['api_caller']->call(APICallerService::GM_QUERY, array('txt' => '5 DE ORO', 'special' => '1'));
    $raw = json_decode($raw);
    $datos = null;
    if (property_exists($raw, 'r')){
        if (property_exists($raw->r, 'datosOriginales')){
            $datos = $raw->r->datosOriginales;
        }
    }

    // GET JUEGOS DE AZAR STORES
    $raw = $app['api_caller']->call(APICallerService::GM_QUERY, array('txt' => 'JUEGOS DE AZAR', 'window' => '0|0', 'suggestion' => 'PRD10106843', 'wherezone' => $wherezone));
    $raw = json_decode($raw);
    $stores = null;
    if (property_exists($raw, 'r')){
        if (property_exists($raw->r, 'prd')){
            if (count($raw->r->prd) > 0 ){
                $stores = array_slice($raw->r->prd[0]->sto, 0, 8);
            }
        }
    }


    return $app['twig']->render('subapps/azar.html.twig', array(
        'datos'          => $datos,
        'stores'         => $stores,
        'showBtnPedidos' => $showBtnPedidos,
        'lastzone'       => $wherezone
    ));
    
})->bind('azar');

$azar->get('/azar/{game}', function($game) use ($app) {
    
    if ($game == 'quiniela'){
        $txt = 'QUINIELA';
    }else if ($game == 'tombola'){
        $txt = 'TOMBOLA';
    }else if ($game == 'loteria'){
        $txt = 'LOTERIA';
    }

    $raw = $app['api_caller']->call(APICallerService::GM_QUERY, array('txt' => $txt, 'special' => '1'));
    $raw = json_decode($raw);
    $datos = null;
    if (property_exists($raw, 'r')){
        if (property_exists($raw->r, 'datosOriginales')){
            $datos = $raw->r->datosOriginales;
        }
    }
    return $app->json($datos);
});

return $azar;
