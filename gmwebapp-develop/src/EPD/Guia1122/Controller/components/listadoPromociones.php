<?php

use EPD\Guia1122\Service\APICallerService;

$listadoPromociones = $app['controllers_factory'];

$listadoPromociones->get('/components/listado-promociones/{filter}/{layout}', function($filter, $layout) use ($app) {
    $raw = $app['api_caller']->call(APICallerService::GM_PROMOCIONES_ACCION, array('filter' => $filter), TRUE);
    $rawData = json_decode($raw, true);
    if (array_key_exists('prms', $rawData['r'])){
      $promociones = $rawData['r']['prms'];
    }else{
      $promociones = [];
    }

    return $app['twig']->render('components/listadoPromociones' . $layout . '.html.twig', array('promociones' => $promociones));
})->bind('listadoPromociones')->value('layout', 'Default');

return $listadoPromociones;
