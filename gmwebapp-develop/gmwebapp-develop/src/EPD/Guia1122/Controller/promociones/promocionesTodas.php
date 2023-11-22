<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Util\Util,
    EPD\Guia1122\Service\APICallerService;

$promociones = $app['controllers_factory'];

$promociones->get('/promociones-y-ofertas/{sponsorNombre}/{sponsorId}/{categoriaNombre}/{categoriaId}', function(Request $request, $sponsorNombre, $sponsorId, $categoriaNombre, $categoriaId) use ($app) {
    $categorias = json_decode($app['api_caller']->call(APICallerService::GM_CATEGORIAS_ACCION, array()), true)['r'];
    $pagina = (int) $request->query->get('pagina', 1);
    $verTodasPaginas = $request->query->get('verTodasPaginas', '0');
    $maxPaginasPrimeras = APICallerService::CANT_MAX_PAGINAS_TODAS_LAS_PROMOS;

    // CHeck wherezone available
    $wherezone = '';
    $cookies = $request->cookies;
    if ($cookies->has('lastzone')){
        $tempwz = explode('|',$cookies->get('lastzone'));
        if (count($tempwz) > 1){
            $wherezone = $tempwz[1];
        }
    }
    $showBtnPedidos = ($cookies->has('lastreq'));


    if ($categoriaId != '0'){
        $filterCategs = $categoriaId;
    }else{
        $filterCategs = '';
    }

    if ($sponsorId != '0') {
        $raw = $app['api_caller']->call(APICallerService::GM_PROMOCIONES_ACCION, array('filter' => 'sponsor', 'filtervalue' => $sponsorId, 'filtercateg' => $filterCategs, 'wherezone' => $wherezone));
    } else {
        $raw = $app['api_caller']->call(APICallerService::GM_PROMOCIONES_ACCION, array('filter' => APICallerService::PROMOCION_TIPO_TODAS, 'filtercateg' => $filterCategs, 'wherezone' => $wherezone));
    }

   //$promociones = array();
    $categoriasPromo = array();
    $raw = json_decode($raw, true);

    // $promocionesTemp = $raw['r'];
    // $contador = 0;
    // $bancoNombre = '';
    // $bancoId = '';
    if (array_key_exists('prms', $raw['r'])){
        $promociones = $raw['r']['prms'];
    }else{
        $promociones = array();
    }
    
    $categoriaNombreNice = str_replace('-', ' ', $categoriaNombre);

    if (array_key_exists('sponsor', $raw['r'])){
        $sponsor = $raw['r']['sponsor'];
        // Overwrite categoria to show sponsor name
        //$app['logger']->warning("PROMOTODAS| Categoria es [" . $categoriaNombre . ']');
        if ($categoriaNombre == null || strlen($categoriaNombre) == 0 || $categoriaNombre == '0'){
            $categoriaNombreNice = $sponsor['name'];
        }else{
            $categoriaNombreNice = $categoriaNombreNice . ' con ' . $sponsor['name'];
        }
    }else{
        $sponsor = null;
    }
    
    $infoPaginacion = Util::obtenerArrayPaginado($promociones, $pagina, APICallerService::CANT_PAGINADO_TODAS_LAS_PROMOS, APICallerService::CANT_MAX_PAGINAS_TODAS_LAS_PROMOS, $verTodasPaginas);

    return $app['twig']->render('promociones/promocionesTodas.html.twig', array(
        'maxPaginasPrimeras' => $maxPaginasPrimeras, 
        'verTodasPaginas'    => $verTodasPaginas, 
        'categoriaId'        => $categoriaId, 
        'categorias'         => $categorias, 
        'pagina'             => $pagina, 
        'cantidadPaginas'    => $infoPaginacion['cantidadPaginas'], 
        'promociones'        => $infoPaginacion['array'], 
        'sponsorId'          => $sponsorId, 
        'sponsorNombre'      => $sponsorNombre, 
        'categoriaId'        => $categoriaId, 
        'categoriaNombre'    => $categoriaNombre,
        'categoriaNombreNice'=> $categoriaNombreNice,
        'sponsor'            => $sponsor,
        'showBtnPedidos'     => $showBtnPedidos));

})->bind('promocionesTodas')->value('categoriaNombre', '0')->value('categoriaId', '0')->value('sponsorNombre', '0')->value('sponsorId', '0')->value('verTodasPaginas', '0');

return $promociones;
