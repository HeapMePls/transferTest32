<?php

use EPD\Guia1122\Service\APICallerService;

$listadoDestacados = $app['controllers_factory'];

$listadoDestacados->get('/components/listadoDestacados', function() use ($app) {

    $destacados = array();
    $raw = $app['api_caller']->call(APICallerService::GM_RUBROS_ACCION, array('item' => 'retailersHighlight', 'index' => rand(0, 9)), true);

    $rawArray = json_decode($raw, true)['r']['list'];
    foreach ($rawArray as $key => $value) {
        $destacados[$value['id']] = $value;
    }

    asort($destacados);

    return $app['twig']->render('components/listadoDestacados.html.twig', array('destacados' => $destacados));
})->bind('listadoDestacados');

return $listadoDestacados;
