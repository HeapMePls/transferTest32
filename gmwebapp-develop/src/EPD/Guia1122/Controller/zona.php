<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Cookie;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Util;
use EPD\Guia1122\Util\Urlizer;

$zona = $app['controllers_factory'];

$zona->get('/zona/{zonaNombre}/{zonaId}/{verTodasPaginas}', function(Request $request, $zonaNombre, $zonaId, $verTodasPaginas) use ($app) {
    
    $pagina             = (int) $request->query->get('pagina', 1);
    $maxPaginasPrimeras = APICallerService::CANT_MAX_PAGINAS_ZONA;
    $premPrms           = [];
    $metaDescSponsors   = '';
    $comerciosArray     = array();
    $cookies            = $request->cookies;
    $showBtnPedidos     = ($cookies->has('lastreq'));
    $isAdultContent     = FALSE;

    $raw = $app['api_caller']->call(APICallerService::GM_QUERY, array('txt' => 'prd0', 'wherezone' => $zonaNombre, 'window' => '0|' . APICallerService::MAX_RESULTADOS_RETORNADOS));
    $raw = json_decode($raw, true);
        
    if(array_key_exists('zonaBusqueda',$raw['r'])){
        if($raw['r']['zonaBusqueda']['name'] != ''){
            $zonaNombreVerdadera = $raw['r']['zonaBusqueda']['name'];
        }
        else{
            $zonaNombreVerdadera = $app['api_caller']->getNombreZona($zonaId);
        }
    }
    else{
        $zonaNombreVerdadera = $app['api_caller']->getNombreZona($zonaId);
    }
    if (isset($raw['r']['prd'][0])) {
        if (count($raw['r']['prd'][0]) > 0) {

            $comercioAux = $raw['r']['prd'][0]['sto'];
            foreach ($comercioAux as $key => $comercio) {
                $comerciosArray[] = $comercio;
            }
            $cantidadTotalComercios = count($comerciosArray);


            //
            // Check additional stores and set resultsMode
            //
            if (array_key_exists('asto', $raw['r']['prd'][0])){
                $comerciosAdicionales = $raw['r']['prd'][0]['asto']['sto'];
                $cantidadTotalComercios += $raw['r']['prd'][0]['asto']['cnt'];
                if (count($comerciosArray) > 0){
                    $resultsMode = 3; // common + additional
                }else{
                    $resultsMode = 1; // only additional
                }
                // Re-Check map show
                for($i = 0; $i < count($comerciosAdicionales); $i++){
                    if (strlen($comerciosAdicionales[$i]['lat']) > 0){
                        $showMap = TRUE;
                        break;
                    }
                }
            }else{
                if (count($comerciosArray) > 0){
                    $resultsMode = 2; // only common
                }else{
                    $resultsMode = 0; // no results
                }
                $comerciosAdicionales = array(); // empty array to show no extra found
            }

        }else{
            $comerciosAdicionales = array(); // empty array to show no extra found
            $resultsMode = 0; // no results
        }
    }else{
        $comerciosAdicionales = array(); // empty array to show no extra found
        $resultsMode = 0; // no results
    }

    if (array_key_exists('near', $raw['r']['zonaBusqueda'])){
        $nearZones = $raw['r']['zonaBusqueda']['near'];
    }else{
        $nearZones = NULL;
    }

    $arrayInfo = Util::obtenerArrayPaginado($comerciosArray, $pagina, APICallerService::CANT_MAX_PAGINAS_ZONA, APICallerService::CANT_MAX_PAGINAS_ZONA, $verTodasPaginas);
    $comerciosArray = $arrayInfo['array'];

    // Get premium promos (only for first page)
    if ($pagina == 1){
        $premPrmsObj = Util::getPremiumPromos($comercioAux);
        $premPrms    = $premPrmsObj->arrPrms;
        if (count($premPrmsObj->arrSpons) > 0){
            $metaDescSponsors = 'Beneficios con ' . implode(', ', $premPrmsObj->arrSpons);
        }
    }

    $rubrosArray = $app['api_caller']->obtenerRubrosPrincipales();
    //$rubrosArray = array();
    // $raw = $app['api_caller']->call(APICallerService::GM_RUBROS_ACCION, array('item' => 'productList'));
    // $raw = json_decode($raw, true)['r'];
    // foreach ($raw as $key => $info) {
    //     $rubrosArray[$info['id']] = $info['clasif'];
    // }

    // Check map show
    $showMap = FALSE;
    for($i = 0; $i < count($comerciosArray); $i++){
        if (strlen($comerciosArray[$i]['lat']) > 0){
            $showMap = TRUE;
            break;
        }
    }

    $rubrosRelacionadosArray[] = array('idp' => 'PRD0', 'nam' => 'Empresas', 'icp' => '', 'typ' => '', 'cnt' => 44, 'index' => 1);

    $paginatorLink = array(
        'path'   => 'zona',
        'params' => array(
            'zonaId'     => $zonaId, 
            'zonaNombre' => Urlizer::urlize($zonaNombre)
        ) 
    );

    $r = new Response($app['twig']->render('buscador.html.twig', array(
        'controllerUrl'           => 'zona',
        'maxPaginasPrimeras'      => $maxPaginasPrimeras, 
        'pagina'                  => $pagina, 
        'cantidadTotalComercios'  => $cantidadTotalComercios,
        'rubrosRelacionadosArray' => $rubrosRelacionadosArray, 
        'rubroSeleccionado'       => 0, 
        'rubroId'                 => 0, 
        'rubroNombre'             => 'Lugares y comercios',
        'rubroNombreVerdadero'    => 'Lugares y comercios',
        'zonaNombre'              => $zonaNombreVerdadera, 
        'zonaNombreVerdadera'     => $zonaNombreVerdadera,
        'zonaId'                  => $zonaId, 
        'comerciosArray'          => $comerciosArray, 
        'verTodasPaginas'         => $verTodasPaginas, 
        'cantidadPaginas'         => $arrayInfo['cantidadPaginas'],
        'promosPremium'           => $premPrms,
        'metaDescSponsors'        => $metaDescSponsors,
        'rubros'                  => $rubrosArray,
        'nearZones'               => $nearZones,
        'paginatorLink'           => $paginatorLink,
        'showMap'                 => $showMap,
        'showBtnPedidos'          => $showBtnPedidos,
        'comerciosAdicionales'    => $comerciosAdicionales,
        'resultsMode'             => $resultsMode,
        'isAdultContent'          => $isAdultContent
    )));
    $r->headers->setCookie(new Cookie('lastzone', $zonaId.'|'.$zonaNombreVerdadera, strtotime( '+10 years' )));
    return $r;
})->bind('zona')->value('verTodasPaginas', '0');

$zona->get('/zonanearestcoords/{lat}/{lng}', function ($lat, $lng)  use ($app){
    $raw = $app['api_caller']->call(APICallerService::GM_ZONAS_ACCION, array(
        'want' => 'nearest', 
        'usrlat' => $lat,
        'usrlon' => $lng
    ));
    $raw = json_decode($raw, true);
    $datos = null;
    if (array_key_exists('r', $raw)){
        for($i=0; $i < count($raw['r']); $i++){
            if ($raw['r'][$i]['inside']){
                $datos = $raw['r'][$i];
                break;
            }
        }
    }
    return $app->json($datos);
});

return $zona;
