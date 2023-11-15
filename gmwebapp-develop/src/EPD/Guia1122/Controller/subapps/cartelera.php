<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Util\Util,
    EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Urlizer;

$cartelera = $app['controllers_factory'];

$cartelera->get('/cartelera/{place}/{placeidr}/{placeids}', function(Request $request, $place, $placeidr, $placeids) use ($app) {

    // Check wherezone available
    $wherezone = '';
    $pwherezone = '';
    $title     = '';
    $cookies = $request->cookies;
    if ($cookies->has('lastzone')){
        $tempwz = explode('|',$cookies->get('lastzone'));
        if (count($tempwz) > 1){
            $tempwz[1] = strtolower($tempwz[1]);
            if ($tempwz[1] != 'todo el pais' && $tempwz[1] != 'todo+el+pais'){
                $wherezone = $tempwz[1];
            }
        }
    }
    $showBtnPedidos = ($cookies->has('lastreq'));

    if ($placeidr != '0') {
        $raw = $app['api_caller']->call(APICallerService::GM_CARTELERA, array('wherezone' => $pwherezone, 'idr' => $placeidr, 'ids' => $placeids));
    } else {
        $raw = $app['api_caller']->call(APICallerService::GM_CARTELERA, array('wherezone' => $pwherezone));
    }
    $raw = json_decode($raw, true);

    // Set title
    if ($placeidr != '0') {
        for($i=0; $i < count($raw['locations']); $i++){
            if ($raw['locations'][$i]['idr'] == $placeidr && $raw['locations'][$i]['ids'] == $placeids){
                $title = $raw['locations'][$i]['nam'];
                $raw['locations'][$i]['sel'] = true;
            }else{
                $raw['locations'][$i]['sel'] = false;
            }
        }
    }else{
        $title = 'Todos los complejos';
    }

    // Fix language
    for($i=0; $i < count($raw['events']); $i++){
        if (array_key_exists('hrs', $raw['events'][$i])){
            $raw['events'][$i]['hrs'] = str_replace('Manana', 'Mañana', $raw['events'][$i]['hrs']);
        }
    }
    

    //$infoPaginacion = Util::obtenerArrayPaginado($promociones, $pagina, APICallerService::CANT_PAGINADO_TODAS_LAS_PROMOS, APICallerService::CANT_MAX_PAGINAS_TODAS_LAS_PROMOS, $verTodasPaginas);

    
    return $app['twig']->render('subapps/cartelera.html.twig', array(
        'data'           => $raw, 
        'title'          => $title,
        'placeidr'       => $placeidr,
        'placeids'       => $placeids,
        'showBtnPedidos' => $showBtnPedidos,
        'lastzone'       => $wherezone));
    
})->bind('cartelera');

$cartelera->get('/cartelera/{eventname}/{eventid}', function(Request $request, $eventname, $eventid) use ($app) {

    // Check wherezone available
    $wherezone = '';
    $title     = '';
    $cookies = $request->cookies;
    if ($cookies->has('lastzone')){
        $tempwz = explode('|',$cookies->get('lastzone'));
        if (count($tempwz) > 1){
            $tempwz[1] = strtolower($tempwz[1]);
            if ($tempwz[1] != 'todo el pais' && $tempwz[1] != 'todo+el+pais'){
                $wherezone = $tempwz[1];
            }
        }
    }
    $showBtnPedidos = ($cookies->has('lastreq'));

    $raw = $app['api_caller']->call(APICallerService::GM_CARTELERA_VIEW, array('wherezone' => $wherezone, 'eventid' => $eventid));
    $raw = json_decode($raw, true);

    // Check if event exists
    if (!array_key_exists('nam', $raw['event'])){
        header("Location: /cartelera/-/0/0");
        exit();
    }

    $title = $raw['event']['nam'];
    // Arrange hours and places
    for($i=0; $i < count($raw['event']['sto']); $i++){
        for($x=0; $x < count($raw['event']['inf']['horarios']); $x++){
            if ( ($raw['event']['sto'][$i]['idr'] == $raw['event']['inf']['horarios'][$x]['retailerNumber']) && 
                 ($raw['event']['sto'][$i]['ids'] == $raw['event']['inf']['horarios'][$x]['storeNumber']) ){
                $raw['event']['sto'][$i]['funciones'] = $raw['event']['inf']['horarios'][$x]['funciones'];
                for($y=0; $y < count($raw['event']['sto'][$i]['funciones']); $y++){
                    $raw['event']['sto'][$i]['funciones'][$y]['mdatetime'] = new \Moment\Moment($raw['event']['sto'][$i]['funciones'][$y]['datetime']);
                    $raw['event']['sto'][$i]['funciones'][$y]['ndatetime'] = $raw['event']['sto'][$i]['funciones'][$y]['mdatetime']->calendar(false) . ' ' . $raw['event']['sto'][$i]['funciones'][$y]['mdatetime']->format('d \d\e M');
                }
                usort($raw['event']['sto'][$i]['funciones'], function($a, $b){
                    return ($a['mdatetime'] > $b['mdatetime']);
                });
                continue;
            }
        }
    }

    // Sort by date


    // Get trailer data
    $trailerInfo = new stdClass();
    $trailerInfo->isYoutube = false;
    $trailerInfo->youtubeId = -1;
    if (array_key_exists('trailer', $raw['event']['inf']['media'])){
        if (strlen($raw['event']['inf']['media']['trailer']) > 0){
            $trailerInfo->link = $raw['event']['inf']['media']['trailer'];
            if (stripos($raw['event']['inf']['media']['trailer'], 'youtube')){
                $trailerInfo->isYoutube = true;
            }
            $posID = stripos($raw['event']['inf']['media']['trailer'], 'v=');
            $trailerInfo->youtubeId = substr($raw['event']['inf']['media']['trailer'], $posID+2);
        }
    }
    //https://www.youtube.com/watch?v=_cq1XIVXdjU
    
    return $app['twig']->render('subapps/carteleraview.html.twig', array(
        'data'           => $raw, 
        'title'          => $title,
        'trailerInfo'    => $trailerInfo,
        'showBtnPedidos' => $showBtnPedidos,
        'lastzone'       => $wherezone));
    
})->bind('carteleraview');


return $cartelera;
