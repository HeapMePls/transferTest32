<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use EPD\Guia1122\Util\Util,
    EPD\Guia1122\Service\APICallerService;

$promosSponsor = $app['controllers_factory'];

$promosSponsor->get('/promociones/{sponsorNombre}/{sponsorId}/{categoriaNombre}/{categoriaId}', function(Request $request, $sponsorNombre, $sponsorId, $categoriaNombre, $categoriaId) use ($app) {
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

    $raw = $app['api_caller']->call(APICallerService::GM_PROMOCIONES_ACCION, array('filter' => 'sponsor', 'filtervalue' => $sponsorId, 'wherezone' => $wherezone));
    
    $raw = json_decode($raw, true);

    if (!array_key_exists('prms',$raw['r'])){
      $app['logger']->error('promosSponsor| No promos found for '.$sponsorNombre.','.$sponsorId.' !! redirecting to promos home...');
      return new RedirectResponse("/promociones-y-ofertas", 302);
    }

    $promociones = $raw['r']['prms'];
    $categoriasPromo = $raw['r']['sponsor']['ctgs'];
    $sponsor = $raw['r']['sponsor'];

    $infoPaginacion = Util::obtenerArrayPaginado($promociones, $pagina, APICallerService::CANT_PAGINADO_TODAS_LAS_PROMOS, APICallerService::CANT_MAX_PAGINAS_TODAS_LAS_PROMOS, $verTodasPaginas);

    return $app['twig']->render('promociones/promocionesSponsor.html.twig', array(
        'maxPaginasPrimeras' => $maxPaginasPrimeras, 
        'verTodasPaginas'    => $verTodasPaginas, 
        'categoriaId'        => $categoriaId, 
        'categorias'         => $categorias, 
        'pagina'             => $pagina, 
        'cantidadPaginas'    => $infoPaginacion['cantidadPaginas'], 
        'promociones'        => $infoPaginacion['array'], 
        'sponsor'            => $sponsor,
        'categoriaId'        => $categoriaId, 
        'categoriaNombre'    => $categoriaNombre,
        'showBtnPedidos'     => $showBtnPedidos));

})->bind('promosSponsor')->value('categoriaNombre', '0')->value('categoriaId', '0')->value('sponsorNombre', '0')->value('sponsorId', '0')->value('verTodasPaginas', '0');

return $promosSponsor;
