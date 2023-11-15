<?php

use EPD\Guia1122\Service\APICallerService;
use Symfony\Component\HttpFoundation\RedirectResponse;

$multilocal = $app['controllers_factory'];

$multilocal->get('/multilocal/{promocionNombre}/{promocionId}', function ($promocionNombre, $promocionId) use ($app) {
    $raw = $app['api_caller']->call(APICallerService::GM_PROMOCIONES_ACCION, array(
      'filter' => 'promo',
      'filtervalue' => $promocionId,
      'html' => 1
    ));

    $raw = json_decode($raw, true);

    if (array_key_exists('r', $raw)){
      if (count($raw['r']) > 0){
        return $app['twig']->render('multilocal.html.twig', array('multilocalArray' => $raw));
      }
    }
    
    // Otherwise redirect to promos home
    return new RedirectResponse("/promociones-y-ofertas", 302);
    
})->bind('multilocal');

return $multilocal;
