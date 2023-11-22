<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use EPD\Guia1122\Util\Util,
    EPD\Guia1122\Util\Urlizer,
    EPD\Guia1122\Service\APICallerService;

$rubroZona = $app['controllers_factory'];

$rubroZona->get('/rubro-zona/{zonaNombre}/{rubroNombre}/{rubroId}/{zonaId}', function(Request $request, $zonaNombre, $rubroNombre, $rubroId, $zonaId) use ($app) {
    $logger                 = $app['logger'];
    $pagina                 = (int) $request->query->get('pagina', 1);
    $verTodasPaginas        = $request->query->get('verTodasPaginas', '0');
    $cantidadPaginas        = 1;
    $cantidadTotalProductos = -1;
    $cantidadTotalComercios = 0;
    $maxPaginasPrimeras     = APICallerService::CANT_MAX_PAGINAS_RUBRO_ZONA;
    $premPrms               = [];
    $metaDescSponsors       = '';
    $rubroIdNumeric         = str_replace('PRD','', $rubroId );
    $isAdultContent         = FALSE;
    $showBtnPedidos         = FALSE;
    $accessToken            = NULL;

    // Init API
    $app['api_caller']->init();

    if (!Util::checkBot()){
      $cookies        = $request->cookies;
      $showBtnPedidos = ($cookies->has('lastreq'));
      if ($cookies->has(APICallerService::$COOKIE_USER_TOKEN)){
        $accessToken  = $cookies->get(APICallerService::$COOKIE_USER_TOKEN);
        $logger->info("buscador| Found user's cookie and AT is " . $accessToken);
      }
    }

    $rubrosRelacionadosArray = $app['api_caller']->obtenerRubrosRelacionados($rubroId, $rubroNombre, $app['config']['brand.country']);
    
    $raw = $app['api_caller']->call(APICallerService::GM_QUERY, array(
        'wherezone' => $zonaNombre, 
        'txt'       => $rubroNombre, 
        //'prodId'    => $rubroIdNumeric, /* USED FOR GMQUERY2 THAT IS NOT USED RIGHT NOW */
        'window'    => '0|' . APICallerService::MAX_RESULTADOS_RETORNADOS
        ),
        TRUE, FALSE, $accessToken);
    $raw = json_decode($raw, true);
    
    // echo json_encode($raw);
    // die();

    //
    // Check response
    //
    if (isset($raw['r']['prd'])) {
        if (count($raw['r']['prd']) == 0) {
            if (array_key_exists('zonaBusqueda', $raw['r'])){
                if (array_key_exists('state', $raw['r']['zonaBusqueda'])){
                    $newZonaNombre = strtolower($raw['r']['zonaBusqueda']['state']);
                    $app['logger']->info("rubroZona|No products found for [".$rubroNombre."] at [".$zonaNombre."], re-searching at [".$newZonaNombre."]...");
                    $rawGmQuery = $app['api_caller']->call(APICallerService::GM_QUERY, array(
                        'txt'       => $rubroNombre, 
                        'wherezone' => $newZonaNombre, 
                        'window'    => '0|' . APICallerService::MAX_RESULTADOS_RETORNADOS),
                        TRUE, FALSE);
                
                    $raw = json_decode($rawGmQuery, true);
                    // Re-Check response
                    //
                    // if (isset($raw['r']['prd'])) {
                    //     if (count($raw['r']['prd']) == 0) {
                    //         $newZonaNombre = 'todo el pais';
                    //         $app['logger']->info("rubroZona|No products found for [".$rubroNombre."] at [".$zonaNombre."], re-searching at [".$newZonaNombre."]...");
                    //         $rawGmQuery = $app['api_caller']->call(APICallerService::GM_QUERY, array(
                    //             'txt'       => $rubroNombre, 
                    //             'wherezone' => $newZonaNombre, 
                    //             'window'    => '0|' . APICallerService::MAX_RESULTADOS_RETORNADOS),
                    //             TRUE, FALSE);
                    //         $raw = json_decode($rawGmQuery, true);
                    //     }
                    // }
                }
            }
        }
    }
    

    //
    // Check Xpanded Search
    //
    if (isset($raw['r']['prd'][0])) {
        $qtyStores = $raw['r']['prd'][0]['cnt'];
        //
        // Check additional stores and set resultsMode
        //
        if (array_key_exists('asto', $raw['r']['prd'][0])){
            if ($raw['r']['prd'][0]['asto']['cnt']){
                $comerciosAdicionales = $raw['r']['prd'][0]['asto']['sto'];
                $cantidadTotalComercios += $raw['r']['prd'][0]['asto']['cnt'];
                if ($qtyStores > 0){
                    $resultsMode = 3; // common + additional
                }else{
                    $resultsMode = 1; // only additional
                }
            }else{
                $comerciosAdicionales = array(); // empty array to show no extra found
                $resultsMode = 2; // only common
            }
        }else{
            if ($qtyStores > 0){
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


    if(array_key_exists('zonaBusqueda',$raw['r'])){
        if($raw['r']['zonaBusqueda']['name'] != ''){
            $zonaNombreVerdadera = $raw['r']['zonaBusqueda']['name'];
        }else{
            $zonaNombreVerdadera = $app['api_caller']->getNombreZona($zonaId);
        }
    }else{
        $zonaNombreVerdadera = $app['api_caller']->getNombreZona($zonaId);
    }
    // Re-arrange zonaNombre
    if ($zonaNombre == ''){
        $zonaNombre = $zonaNombreVerdadera;
    }else{
        $zonaNombre = str_replace('-', ' ', str_replace('+', ' ' , $zonaNombre));
    }
    if(array_key_exists('prd',$raw['r'])){
        if(count($raw['r']['prd']) > 0){
            if($raw['r']['prd'][0]['nam'] != ''){
                $rubroNombreVerdadero = $raw['r']['prd'][0]['nam'];
                $rubroId = "PRD".$raw['r']['prd'][0]['idp'];
            }else{
                $rubroNombreVerdadero = $app['api_caller']->getNombreRubro($rubroId);
            }
        }else{
            $rubroNombreVerdadero = $app['api_caller']->getNombreRubro($rubroId);
        }
    }else{
        $rubroNombreVerdadero = $app['api_caller']->getNombreRubro($rubroId);
    }
    if (empty($rubroNombreVerdadero)) {
        $rubroNombreVerdadero = '0';
    }
    
    // Build Rubros and Zonas
    $rubros = array();
    for($i = 0; $i < count($raw['r']['prd']); $i++){
        if ($raw['r']['prd'][$i]['typ'] == 'R' || $raw['r']['prd'][$i]['typ'] == 'G'){
            $rubros[] = array(
                "nam" => ucwords(strtolower($raw['r']['prd'][$i]['nam'])),
                "idp" => 'PRD'. $raw['r']['prd'][$i]['idp'],
                "cnt" => $raw['r']['prd'][$i]['cnt'],
                "idx" => $raw['r']['prd'][$i]['index']
            );
            //
            // Check Adult Content
            //
            if (!$isAdultContent && $raw['r']['prd'][$i]['iac'] == '1'){
              $isAdultContent = TRUE;
              $app['logger']->error("rubroZona|Found IAC on rubro " . $raw['r']['prd'][$i]['nam'] . "! Ads disabled");
            }
        }
    }
    if ($resultsMode == 3 || $resultsMode == 1){
        if (array_key_exists('idp', $raw['r']['prd'][0]['asto'])){
            $raw['r']['prd'][0]['asto']['idp'] = 'PRD'. $raw['r']['prd'][0]['asto']['idp'];
            $bRubroFound = FALSE;
            for($i=0; $i < count($rubros);$i++){
                if ($rubros[$i]['idp'] == $raw['r']['prd'][0]['asto']['idp']){
                    $rubros[$i]['cnt'] += $raw['r']['prd'][0]['asto']['cnt'];
                    $bRubroFound = TRUE;
                    break;
                }
            }
            if (!$bRubroFound){
                $rubros[] = array(
                    "nam" => ucwords(strtolower($raw['r']['prd'][0]['asto']['nam'])),
                    "idp" => $raw['r']['prd'][0]['asto']['idp'],
                    "cnt" => $raw['r']['prd'][0]['asto']['cnt'],
                    "idx" => -1
                );
            }
        }
    }
    if (array_key_exists('near', $raw['r']['zonaBusqueda'])){
        $nearZones = $raw['r']['zonaBusqueda']['near'];
    }else{
        $nearZones = $app['api_caller']->obtenerZonasPrincipales();
    }

    $showMap = FALSE;
    $comerciosArray = array();
    $cantidadTotalProductos = count($raw['r']['prd']);
    if ($cantidadTotalProductos > 0) {
        
        // RONDY
        // Prepare array of stores collecting from each product
        // MAX_RESULTADOS_RETORNADOS will be the maximum products that will come with its store loaded
        //  at the 'sto' attribute
        // OLD:
        $stores = $raw['r']['prd'][0]['sto'];
        $cantidadTotalComercios += count($stores);
        // $stores = array(); 
        // for($i=0; $i < $cantidadTotalProductos; $i++){
        //     if (array_key_exists('sto', $raw['r']['prd'][$i])){
        //         for ($x=0; $x < count($raw['r']['prd'][$i]['sto']); $x++){
        //             $bStoreFound = FALSE;
        //             for ($z=0; $z < count($stores); $z++){
        //                 if ( ($stores[$z]['idr'] == $raw['r']['prd'][$i]['sto'][$x]['idr']) &&
        //                     ($stores[$z]['ids'] == $raw['r']['prd'][$i]['sto'][$x]['ids']) ) {
        //                     $bStoreFound = TRUE;
        //                     break;
        //                 }
        //             }
        //             if (!$bStoreFound){
        //                 array_push($stores, $raw['r']['prd'][$i]['sto'][$x]);
        //                 $cantidadTotalComercios++;
        //             }
        //         }
        //     }
        // }
        // // Re-sort by ranking
        // usort($stores, function($sA, $sB){
        //     if ($sA['sRnk'] > $sB['sRnk']){
        //         return -1;
        //     }else{
        //         return 1;
        //     }
        // });
        // // Check count on duplicates
        // $storesQty = count($stores);
        // if ( ($storesQty < APICallerService::MAX_RESULTADOS_RETORNADOS) && 
        //      ($cantidadTotalComercios > $storesQty) ){
        //     $cantidadTotalComercios = $storesQty;
        // }

        $infoPaginacion = Util::obtenerArrayPaginado($stores, $pagina, APICallerService::CANT_PAGINADO_COMERCIOS, APICallerService::CANT_MAX_PAGINAS_RUBRO_ZONA, $verTodasPaginas);
        $comerciosArray = $infoPaginacion['array'];
        $cantidadPaginas = $infoPaginacion['cantidadPaginas'];

        // Get premium promos (only for first page)
        if ($pagina == 1){
            $premPrmsObj = Util::getPremiumPromos($stores);
            $premPrms    = $premPrmsObj->arrPrms;
            if (count($premPrmsObj->arrSpons) > 0){
                $metaDescSponsors = 'Beneficios con ' . implode(', ', $premPrmsObj->arrSpons);
            }
        }

        
        
    }
    
    // Check map show
    for($i = 0; $i < count($comerciosArray); $i++){
        if (strlen($comerciosArray[$i]['lat']) > 0){
            $showMap = TRUE;
            break;
        }
    }
    for($i = 0; $i < count($comerciosAdicionales) && !$showMap; $i++){
        if (strlen($comerciosAdicionales[$i]['lat']) > 0){
            $showMap = TRUE;
            break;
        }
    }

    $paginatorLink = array(
        'path'   => 'rubroZona',
        'params' => array(
            'zonaNombre'  => Urlizer::urlize($zonaNombre),
            'rubroId'     => $rubroId, 
            'rubroNombre' => Urlizer::urlize($rubroNombre), 
            'zonaId'      => $zonaId
        ) 
    );

    if (count($rubros) == 0){
        $rubros = $app['api_caller']->obtenerRubrosPrincipales();
    }
    if (count($nearZones) == 0){
        $nearZones = $app['api_caller']->obtenerZonasPrincipales();
    }

    //
    // Re-check adult content
    //
    if (!$isAdultContent){
      if (strstr(strtolower($rubroNombre), 'erotico')){
        $isAdultContent = TRUE;
        $app['logger']->error("rubroZona|Found IAC on rubro nombre " . $rubroNombre . "! Ads disabled");
      }
    }
    
    if ($resultsMode == 0){
        throw new NotFoundHttpException('C404|RUBROZONA|'.$zonaNombre.'|'.$rubroNombre);
    };

    $r = new Response($app['twig']->render('buscador.html.twig', array(
                                        'controllerUrl'           => 'rubroZona',
                                        'maxPaginasPrimeras'      => $maxPaginasPrimeras,
                                        'verTodasPaginas'         => $verTodasPaginas,
                                        'rubroNombreVerdadero'    => $rubroNombreVerdadero,
                                        'zonaNombreVerdadera'     => $zonaNombreVerdadera,
                                        'rubrosRelacionadosArray' => $rubrosRelacionadosArray,
                                        'cantidadPaginas'         => $cantidadPaginas,
                                        'pagina'                  => $pagina,
                                        'rubroId'                 => $rubroId,
                                        'rubros'                  => $rubros,
                                        'zonaId'                  => $zonaId,
                                        'rubroNombre'             => $rubroNombre,
                                        'zonaNombre'              => $zonaNombre,
                                        'comerciosArray'          => $comerciosArray,
                                        'cantidadTotalComercios'  => $cantidadTotalComercios,
                                        'promosPremium'           => $premPrms,
                                        'metaDescSponsors'        => $metaDescSponsors,
                                        'nearZones'               => $nearZones,
                                        'paginatorLink'           => $paginatorLink,
                                        'showMap'                 => $showMap,
                                        'showBtnPedidos'          => $showBtnPedidos,
                                        'comerciosAdicionales'    => $comerciosAdicionales,
                                        'resultsMode'             => $resultsMode,
                                        'isAdultContent'          => $isAdultContent)));
    $r->headers->setCookie(new Cookie('lastzone', $zonaId.'|'.$zonaNombre, strtotime( '+10 years' )));
    
    return $r;
})->bind('rubroZona');

return $rubroZona;
