<?php

use EPD\Guia1122\Service\APICallerService;

$todosLosRubros = $app['controllers_factory'];

$todosLosRubros->get('/rubro/todos-los-rubros', function() use ($app) {
    $raw = $app['api_caller']->call(APICallerService::GM_RUBROS_ACCION, array('item' => 'productList'));
    $rawArray = json_decode($raw, true)['r'];

    $rubros = array();
    foreach ($rawArray as $key => $value) {
        $rubros[$value['id']] = $value['clasif'];
    }

    asort($rubros);

    return $app['twig']->render('todosLosRubros.html.twig', array('rubrosArray' => $rubros));
})->bind('todosLosRubros');

return $todosLosRubros;
