<?php

use EPD\Guia1122\Service\APICallerService;
use Symfony\Component\HttpFoundation\RedirectResponse;

$sponsor = $app['controllers_factory'];

$sponsor->get('/sponsor/{sponsorNombre}/{sponsorId}/{categoriaNombre}/{categoriaId}', function($sponsorNombre, $sponsorId, $categoriaNombre, $categoriaId) use ($app) {
    
    
    /*Se arma un array locales adheridos para mostrarlos,  en caso que sean todos
     *  o filtrado por categorias, solos los locales de las promos con dichas categorias*/
    $localesAdheridos=array();
    
    
    $promociones = array();
    $raw = $app['api_caller']->call(APICallerService::GM_PROMOCIONES_ACCION, array('filter' => 'sponsor', 'filtervalue' => $sponsorId));
    $sponsorArray = json_decode($raw, true)['r'];
    
    if (!array_key_exists('prms',$sponsorArray)){
      $app['logger']->error('sponsor| No promos found for '.$sponsorNombre.','.$sponsorId.' !! redirecting to promos home...');
      return new RedirectResponse("/promociones-y-ofertas", 302);
    }
    
    $ics = $sponsorArray['sponsor']['ics'];
    
    
    
    
    $contador = 0;
    foreach ($sponsorArray['prms'] as $keyPromo => $value) {
        
        
        $cantidadLocales = count($value['stores']);
        if($cantidadLocales == 1){
            $comercioId = ($value['stores'][0]['idr']*10000) + $value['stores'][0]['ids'];
            $comercioNombre = $value['stores'][0]['name'];
        }
        else{
            $comercioId = ($value['stores'][0]['idr']*10000) + $value['stores'][0]['ids'];
            $comercioNombre = $value['stores'][0]['name'];
        }
        $categoriasPromo = array_map(function($var) {
            return $var['id'];
        }, $value['ctgs']);
        
        if ($cantidadLocales > 0) {
            if ($categoriaId != '0') {
                if (in_array($categoriaId, $categoriasPromo)) {
                    $promociones[$contador] = array('idPromocion' => $value['idp'], 'comercioNombre' => $comercioNombre, 'comercioId' => $comercioId, 'condiciones' => $app['api_caller']->obtenerCondicionesPromo($value['idp']), 'iconoSponsor' => $ics, 'imagenPromo' => $value['imp'], 'nombrePromo' => $value['name'], 'cantLocales' => $cantidadLocales, 'descripcionCorta' => $value['dsc'], 'descripcionLarga' => $value['ldsc']);
                    foreach ($value['stores'] as $pos=>$store) {
                        $localesAdheridos[]=$store;
                    }
                    
                    $contador++;
                }
            } else {
                $promociones[$contador] = array('idPromocion' => $value['idp'], 'comercioNombre' => $comercioNombre, 'comercioId' => $comercioId, 'condiciones' => $app['api_caller']->obtenerCondicionesPromo($value['idp']), 'iconoSponsor' => $ics, 'imagenPromo' => $value['imp'], 'nombrePromo' => $value['name'], 'cantLocales' => $cantidadLocales, 'descripcionCorta' => $value['dsc'], 'descripcionLarga' => $value['ldsc']);
                foreach ($value['stores'] as $pos=>$store) {
                        $localesAdheridos[]=$store;
                }
                $contador++;
            }
        }
    }
    
        
    unset($sponsorArray['prms']); /*NO USO ESTA DIMENSION DEL ARRAY*/
    
    return $app['twig']->render('sponsor.html.twig', array('localesAdheridos'=>$localesAdheridos,'categoriaId' => $categoriaId, 'sponsorArray' => $sponsorArray, 'sponsorNombre' => $sponsorNombre, 'sponsorId' => $sponsorId, 'promociones' => $promociones));
})->bind('sponsor')->value('categoriaId', '0')->value('categoriaNombre', '0');

return $sponsor;
