<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Util;
use EPD\Guia1122\Util\Urlizer;

$buscadorRubro = $app['controllers_factory'];

$buscadorRubro->get('/buscar/{rubroNombre}/{zonaNombre}/{coords}', function(Request $request, $rubroNombre, $zonaNombre, $coords) use ($app) {
    $logger                 = $app['logger'];
    $zonaNombreVerdadera    = '0';
    $rubroNombreVerdadero   = '0';
    $cantidadTotalComercios = 0;
    $cantidadTotalProductos = 0;
    $showBtnPedidos         = FALSE;
    $verTodasPaginas        = $request->query->get('verTodasPaginas', '0');
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

    // Check redirected message to show
    if (property_exists($app['request'], 'redirectMsg')){
        $redirectMsg = $app['request']->redirectMsg;
    }else{
        $redirectMsg = NULL;
    }

    //
    // Call GMQUery and process response
    //
    $apiParams = array(
        'txt'       => $rubroNombre, 
        'window'    => '0|' . APICallerService::MAX_RESULTADOS_RETORNADOS);
    if ($coords == NULL){
        $apiParams['wherezone'] = $zonaNombre;
    }else{
        $arrCoords = explode(',', $coords);
        if (count($arrCoords) == 2){
            $apiParams['usrlat'] = $arrCoords[0];
            $apiParams['usrlon'] = $arrCoords[1];
        }else{
            $apiParams['wherezone'] = $zonaNombre;
        }
    }
    $rawGmQuery = $app['api_caller']->call(APICallerService::GM_QUERY, $apiParams, TRUE, FALSE, $accessToken);
    $raw = json_decode($rawGmQuery, true);
    //print_r($app['config']);


    // echo(json_encode($raw));
    // die();

    //
    // Check response
    //
    if (isset($raw['r']['prd'])) {
        if (count($raw['r']['prd']) == 0) {
            if (array_key_exists('zonaBusqueda', $raw['r'])){
                if (array_key_exists('state', $raw['r']['zonaBusqueda'])){
                    $newZonaNombre = strtolower($raw['r']['zonaBusqueda']['state']);
                    $app['logger']->info("buscadorRubro|No products found for [".$rubroNombre."] at [".$zonaNombre."], re-searching at [".$newZonaNombre."]...");
                    $rawGmQuery = $app['api_caller']->call(APICallerService::GM_QUERY, array(
                        'txt'       => $rubroNombre, 
                        'wherezone' => $newZonaNombre, 
                        'window'    => '0|' . APICallerService::MAX_RESULTADOS_RETORNADOS),
                        TRUE, FALSE);
                    $raw = json_decode($rawGmQuery, true);
                    // Re-Check response
                    //
                    if (isset($raw['r']['prd'])) {
                        if (count($raw['r']['prd']) == 0) {
                            $newZonaNombre = 'todo el pais';
                            $app['logger']->info("buscadorRubro|No products found for [".$rubroNombre."] at [".$zonaNombre."], re-searching at [".$newZonaNombre."]...");
                            $rawGmQuery = $app['api_caller']->call(APICallerService::GM_QUERY, array(
                                'txt'       => $rubroNombre, 
                                'wherezone' => $newZonaNombre, 
                                'window'    => '0|' . APICallerService::MAX_RESULTADOS_RETORNADOS),
                                TRUE, FALSE);
                            $raw = json_decode($rawGmQuery, true);
                        }
                    }
                }
            }
        }
    }


    $pagina                  = (int) $request->query->get('pagina', 1);
    $zonaId                  = '0';
    $rubroId                 = '0';
    $cantidadPaginas         = null;
    $rubrosRelacionadosArray = array();
    $comerciosArray          = array();
    $cantidadTotalComercios  = 0;
    $premPrms                = [];
    $metaDescSponsors        = '';
    $showMap                 = FALSE;
    $rubros                  = array();
    $nearZones               = [];
    $isAdultContent          = FALSE;

    if (isset($raw['r']['prd'][0])) {
        if (count($raw['r']['prd'][0]) > 0) {
            if (isset($raw['r']['whr'])) {
                $zonaId = 'Z' . $raw['r']['whr'];
            }

            // Load rubro and zona names
            $rubroId = 'PRD' . $raw['r']['prd']['0']['idp'];
            if (strlen($raw['r']['prd']['0']['nam']) > 0){
                $rubroNombreVerdadero = ucwords(strtolower($raw['r']['prd']['0']['nam']));
            }else{
                $rubroNombreVerdadero = $app['api_caller']->getNombreRubro($rubroId);
            }
            if (array_key_exists('zonaBusqueda', $raw['r'])){
                if (array_key_exists('name', $raw['r']['zonaBusqueda'])){
                    $zonaNombreVerdadera = ucwords(strtolower($raw['r']['zonaBusqueda']['name']));
                }else{
                    $zonaNombreVerdadera = $app['api_caller']->getNombreZona($zonaId);
                }
            }else{
                $zonaNombreVerdadera = $app['api_caller']->getNombreZona($zonaId);
            }

            if (empty($zonaNombreVerdadera)) {
                $zonaNombreVerdadera = '0';
            }

            if (empty($rubroNombreVerdadero)) {
                $rubroNombreVerdadero = '0';
            }

            // Re-arrange zonaNombre
            if ($zonaNombre == '' || $zonaNombre == '-' || $zonaNombre == '--'){
                $zonaNombre = $zonaNombreVerdadera;
            }else{
                $zonaNombre = str_replace('-', ' ', $zonaNombre);
            }

            // RONDY
            // Prepare array of stores collecting from each product
            // MAX_RESULTADOS_RETORNADOS will be the maximum products that will come with its store loaded
            //  at the 'sto' attribute
            // OLD:
            $comerciosArray = $raw['r']['prd']['0']['sto'];
            //print_r ($raw['r']['prd']['0']['sto']);
            $cantidadTotalComercios = count($comerciosArray);
            // $cantidadTotalProductos = count($raw['r']['prd']);
            // $comerciosArray = array(); 
            // for($i=0; $i < $cantidadTotalProductos; $i++){
            //     if (array_key_exists('sto', $raw['r']['prd'][$i])){
            //         for ($x=0; $x < count($raw['r']['prd'][$i]['sto']); $x++){
            //             $bStoreFound = FALSE;
            //             for ($z=0; $z < count($comerciosArray); $z++){
            //                 if ( ($comerciosArray[$z]['idr'] == $raw['r']['prd'][$i]['sto'][$x]['idr']) &&
            //                     ($comerciosArray[$z]['ids'] == $raw['r']['prd'][$i]['sto'][$x]['ids']) ) {
            //                     $bStoreFound = TRUE;
            //                     break;
            //                 }
            //             }
            //             if (!$bStoreFound){
            //                 array_push($comerciosArray, $raw['r']['prd'][$i]['sto'][$x]);
            //                 $cantidadTotalComercios++;
            //             }
            //         }
            //     }
            // }

            // // Re-sort by ranking
            // usort($comerciosArray, function($sA, $sB){
            //     if ($sA['sRnk'] > $sB['sRnk']){
            //         return -1;
            //     }else{
            //         return 1;
            //     }
            // });

            // // Check count on duplicates
            // $storesQty = count($comerciosArray);
            // if ( ($storesQty < APICallerService::MAX_RESULTADOS_RETORNADOS) && 
            //     ($cantidadTotalComercios > $storesQty) ){
            //     $cantidadTotalComercios = $storesQty;
            // }


            $infoPaginacion = Util::obtenerArrayPaginado($comerciosArray, $pagina, APICallerService::CANT_PAGINADO_COMERCIOS_BUSCADOR, APICallerService::CANT_MAX_PAGINAS_BUSCADOR, $verTodasPaginas);
            $comerciosArray = $infoPaginacion['array'];
            $cantidadPaginas = $infoPaginacion['cantidadPaginas'];
            $rubrosRelacionadosArray = $app['api_caller']->obtenerRubrosRelacionados($rubroId, $rubroNombre, $app['config']['brand.country']);

            // Check map show
            for($i = 0; $i < count($comerciosArray); $i++){
                if (strlen($comerciosArray[$i]['lat']) > 0){
                    $showMap = TRUE;
                    break;
                }
            }

            foreach($comerciosArray as &$comercio) {
                if (strlen($comercio['dsc']) >= 150) {
                    $comercio['dsc'] = substr($comercio['dsc'], 0, 150);
                    $comercio['dsc'] = substr($comercio['dsc'], 0, strrpos($comercio['dsc'], ' '));
                    $comercio['dsc'] .= "...";
                }
            }

            // Get premium promos (only for first page)
            if ($pagina == 1){
                $premPrmsObj = Util::getPremiumPromos($raw['r']['prd'][0]['sto']);
                $premPrms    = $premPrmsObj->arrPrms;
                if (count($premPrmsObj->arrSpons) > 0){
                    $metaDescSponsors = 'Beneficios con ' . implode(', ', $premPrmsObj->arrSpons);
                }
            }

            // Build Rubros and Zonas
            for($i = 0; $i < count($raw['r']['prd']); $i++){
                if ($raw['r']['prd'][$i]['typ'] == 'R' || $raw['r']['prd'][$i]['typ'] == 'G'){
                    $rubros[] = array(
                        "nam" => ucwords(strtolower($raw['r']['prd'][$i]['nam'])),
                        "idp" => 'PRD'. $raw['r']['prd'][$i]['idp'],
                        "cnt" => $raw['r']['prd'][$i]['cnt'],
                        "idx" => $raw['r']['prd'][$i]['index'],
                        "iac" => $raw['r']['prd'][$i]['iac'],
                    );
                    //
                    // Check Adult Content
                    //
                    if (!$isAdultContent && $raw['r']['prd'][$i]['iac'] == '1'){
                      $isAdultContent = TRUE;
                      $app['logger']->error("buscador|Found IAC on rubro " . $raw['r']['prd'][$i]['nam'] . "! Ads disabled");
                    }
                }
            }
            
            if (array_key_exists('near', $raw['r']['zonaBusqueda'])){
                $nearZones = $raw['r']['zonaBusqueda']['near'];
            }

            
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

    if (count($rubros) == 0){
        $rubros = $app['api_caller']->obtenerRubrosPrincipales();
    }
    if (count($nearZones) == 0){
        $nearZones = $app['api_caller']->obtenerZonasPrincipales();
    }

    $maxPaginasPrimeras = APICallerService::CANT_MAX_PAGINAS_BUSCADOR;
    $paginatorLink = array(
        'path'   => 'buscador',
        'params' => array(
            'zonaNombre'  => Urlizer::urlize($zonaNombre), 
            'rubroNombre' => Urlizer::urlize($rubroNombre)
        ) 
    );


    $resRubros = $app['api_caller']->call(APICallerService::GM_RUBROS_ACCION, array('item' => APICallerService::RUBROS_TIPO_DESTACADOS), true);
    $rubrosTodos = json_decode($resRubros, true)['r'];

    if (strlen(trim($rubroNombre)) == 0){
        $rubroNombre = 'Lugares y comercios';
    }

    if ($resultsMode == 0){
        throw new NotFoundHttpException('C404|BUSCADOR|'.$zonaNombre.'|'.$rubroNombre);
    };

    $r = new Response($app['twig']->render('buscador.html.twig', array(
                'rubrosTodos'             => $rubrosTodos,
                'rubroNombreVerdadero'    => $rubroNombreVerdadero,
                'zonaNombreVerdadera'     => $zonaNombreVerdadera,
                'maxPaginasPrimeras'      => $maxPaginasPrimeras,
                'rubroId'                 => $rubroId,
                'rubrosRelacionadosArray' => $rubrosRelacionadosArray,
                'zonaId'                  => $zonaId,
                'zonaNombre'              => $zonaNombre,
                'rubroNombre'             => $rubroNombre,
                'pagina'                  => $pagina,
                'cantidadPaginas'         => $cantidadPaginas,
                'comerciosArray'          => $comerciosArray,
                'verTodasPaginas'         => $verTodasPaginas,
                'cantidadTotalComercios'  => $cantidadTotalComercios,
                'promosPremium'           => $premPrms,
                'metaDescSponsors'        => $metaDescSponsors,
                'redirectMsg'             => $redirectMsg,
                'rubros'                  => $rubros,
                'nearZones'               => $nearZones,
                'paginatorLink'           => $paginatorLink,
                'showMap'                 => $showMap,
                'showBtnPedidos'          => $showBtnPedidos,
                'comerciosAdicionales'    => $comerciosAdicionales,
                'resultsMode'             => $resultsMode,
                'isAdultContent'          => $isAdultContent)
    ));

    // Store searched zone
    if (array_key_exists('zonaBusqueda', $raw['r'])){
        if (array_key_exists('zip', $raw['r']['zonaBusqueda'])){
            if (array_key_exists('name', $raw['r']['zonaBusqueda'])){
                $lastZone = $raw['r']['zonaBusqueda']['zip'].'|'.$raw['r']['zonaBusqueda']['name'];
                $r->headers->setCookie(new Cookie('lastzone', $lastZone, strtotime( '+10 years' )));
            }
        }
    }

    return $r;

})->bind('buscador')->value('rubroNombre', 'empresas')->value('zonaNombre', APICallerService::URUGUAY_TEXT)->value('coords',NULL);

return $buscadorRubro;
