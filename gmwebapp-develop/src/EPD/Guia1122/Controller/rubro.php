<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Util\Util,
    EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Urlizer;

$rubro = $app['controllers_factory'];

$rubro->get('/rubro/{rubroNombre}/{rubroId}', function(Request $request, $rubroNombre, $rubroId) use ($app) {

    $zonaNombre             = 'Todo el pais';
    $zonaId                 = 'Z00001';
    $cantidadTotalComercios = 0;
    $cantidadTotalProductos = -1;
    $pagina                 = (int) $request->query->get('pagina', 1);
    $verTodasPaginas        = $request->query->get('verTodasPaginas', '0');
    $cantidadPaginas        = (int) $request->query->get('cantidadPaginas', 1);
    $maxPaginasPrimeras     = APICallerService::CANT_MAX_PAGINAS_RUBRO;
    $premPrms               = [];
    $metaDescSponsors       = '';
    $showMap                = FALSE;
    $rubros                 = array();
    $isAdultContent         = FALSE;

    $cookies = $request->cookies;
    $showBtnPedidos = ($cookies->has('lastreq'));

    $tienePRD = strtoupper(substr($rubroId, 0, 3)) == 'PRD';
    if (!$tienePRD) {
        $rubroId = 'PRD' . $rubroId;
    }

    $rubrosRelacionadosArray = $app['api_caller']->obtenerRubrosRelacionados($rubroId, $rubroNombre, $app['config']['brand.country']);
   
    $raw = $app['api_caller']->call(APICallerService::GM_QUERY, array(
        'txt'    => $rubroId, 
        'window' => '0|' . 
        APICallerService::MAX_RESULTADOS_RETORNADOS));
    $raw = json_decode($raw, true);
    $resultadosRetornados = count($raw['r']['prd']);
    
    $comerciosArray = array();
    
    //
    // Check Xpanded Search
    //
    if (isset($raw['r']['prd'][0])) {
        $qtyStores = count($raw['r']['prd'][0]);
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



    if(array_key_exists('prd',$raw['r'])){
        if(count($raw['r']['prd']) > 0){
            if($raw['r']['prd'][0]['nam'] != ''){
                $rubroNombreVerdadero = $raw['r']['prd'][0]['nam'];
            }
            else{
                $rubroNombreVerdadero = $app['api_caller']->getNombreRubro($rubroId);
            }
        }
        else{
            $rubroNombreVerdadero = $app['api_caller']->getNombreRubro($rubroId);
        }
    }else{
        $rubroNombreVerdadero = $app['api_caller']->getNombreRubro($rubroId);
    }
    
    if (empty($rubroNombreVerdadero)) {
        $rubroNombreVerdadero = '0';
    }
    
    $cantidadTotalProductos = count($raw['r']['prd']);
    if ($resultadosRetornados > 0) {

        // RONDY
        // Prepare array of stores collecting from each product
        // MAX_RESULTADOS_RETORNADOS will be the maximum products that will come with its store loaded
        //  at the 'sto' attribute
        // OLD:
        $comerciosArray = $raw['r']['prd'][0]['sto'];
        $cantidadTotalComercios += count($comerciosArray);

        $infoPaginacion = Util::obtenerArrayPaginado($comerciosArray, $pagina, APICallerService::CANT_PAGINADO_COMERCIOS, APICallerService::CANT_MAX_PAGINAS_RUBRO, $verTodasPaginas);
        $comerciosArray = $infoPaginacion['array'];
        $cantidadPaginas = $infoPaginacion['cantidadPaginas'];

        // Build Rubros
        for($i = 0; $i < count($raw['r']['prd']); $i++){
            if ($raw['r']['prd'][$i]['typ'] == 'R' || $raw['r']['prd'][$i]['typ'] == 'G'){
                $rubros[] = array(
                    "nam" => $raw['r']['prd'][$i]['nam'],
                    "idp" => 'PRD'. $raw['r']['prd'][$i]['idp'],
                    "cnt" => $raw['r']['prd'][$i]['cnt'],
                    "idx" => $raw['r']['prd'][$i]['index']
                );
                //
                // Check Adult Content
                //
                if (!$isAdultContent && $raw['r']['prd'][$i]['iac'] == '1'){
                  $isAdultContent = TRUE;
                  $app['logger']->error("rubro|Found IAC on rubro " . $raw['r']['prd'][$i]['nam'] . "! Ads disabled");
                }
            }
        }
        // Complement Rubros
        if ($resultsMode == 3 || $resultsMode == 1){
            if (array_key_exists('idp', $raw['r']['prd'][0]['asto'])){
                $rubros[] = array(
                    "nam" => ucwords(strtolower($raw['r']['prd'][0]['asto']['nam'])),
                    "idp" => 'PRD'. $raw['r']['prd'][0]['asto']['idp'],
                    "cnt" => $raw['r']['prd'][0]['asto']['cnt'],
                    "idx" => -1
                );
            }
        }
        // Build Zonas
        if (array_key_exists('near', $raw['r']['zonaBusqueda'])){
            $nearZones = $raw['r']['zonaBusqueda']['near'];
        }else{
            $nearZones = $app['api_caller']->obtenerZonasPrincipales();
        }

        // Check map show
        for($i = 0; $i < count($comerciosArray); $i++){
            if (strlen($comerciosArray[$i]['lat']) > 0){
                $showMap = TRUE;
                break;
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
    }else{
        $nearZones = $app['api_caller']->obtenerZonasPrincipales();
    }

    $paginatorLink = array(
        'path'   => 'buscador',
        'params' => array(
            'zonaNombre'  => Urlizer::urlize($zonaNombre), 
            'rubroNombre' => Urlizer::urlize($rubroNombre)
        ) 
    );

    if (count($rubros) == 0){
        $rubros = $app['api_caller']->obtenerRubrosPrincipales();
    }
    if (count($nearZones) == 0){
        $nearZones = $app['api_caller']->obtenerZonasPrincipales();
    }

    return $app['twig']->render('buscador.html.twig', array(
                'maxPaginasPrimeras'      => $maxPaginasPrimeras,
                'pagina'                  => $pagina,
                'rubroNombreVerdadero'    => $rubroNombreVerdadero,
                'zonaNombreVerdadera'     => $zonaNombre,
                'rubrosRelacionadosArray' => $rubrosRelacionadosArray,
                'zonaSeleccionada'        => 0,
                'rubroNombre'             => $rubroNombre,
                'zonaId'                  => $zonaId,
                'zonaNombre'              => $zonaNombre,
                'rubros'                  => $rubros,
                'rubroSeleccionado'       => $rubroId,
                'rubroId'                 => $rubroId,
                'comerciosArray'          => $comerciosArray,
                'cantidadPaginas'         => $cantidadPaginas,
                'verTodasPaginas'         => $verTodasPaginas,
                'cantidadTotalComercios'  => $cantidadTotalComercios,
                'promosPremium'           => $premPrms,
                'metaDescSponsors'        => $metaDescSponsors,
                'paginatorLink'           => $paginatorLink,
                'nearZones'               => $nearZones,
                'showMap'                 => $showMap,
                'showBtnPedidos'          => $showBtnPedidos,
                'comerciosAdicionales'    => $comerciosAdicionales,
                'resultsMode'             => $resultsMode,
                'isAdultContent'          => $isAdultContent));
})->bind('rubro');

return $rubro;
