<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Urlizer;

$listadoRubros = $app['controllers_factory'];

$listadoRubros->get('/components/listado-rubros/{class}/{item}/{layout}/{rubroSeleccionado}/{zonaSeleccionada}/{zonaNombreSeleccionada}/{tituloRubro}', function($class, $item, $layout, $rubroSeleccionado, $zonaSeleccionada, $zonaNombreSeleccionada, $tituloRubro) use ($app) {
    

    $rubros = array();
    $raw = $app['api_caller']->call(APICallerService::GM_RUBROS_ACCION, array('item' => $item), true);
    $rawArray = json_decode($raw, true)['r'];

    foreach ($rawArray as $key => $value) {
        $rubros[$value['id']] = $value['clasif'];
    }

    asort($rubros);

    return $app['twig']->render('components/listadoRubros' . $layout . '.html.twig', array('tituloRubro' => $tituloRubro, 'zonaNombreSeleccionada' => $zonaNombreSeleccionada, 'zonaSeleccionada' => $zonaSeleccionada, 'rubros' => $rubros, 'class' => $class, 'rubroSeleccionado' => $rubroSeleccionado));
})->bind('listadoRubros')->value('rubroSeleccionado', '0')->value('zonaNombreSeleccionada', '0')->value('zonaSeleccionada', '0')->value('class', 'medium-4 columns zonarubroslistado listrubro')->value('item', APICallerService::RUBROS_TIPO_DESTACADOS)->value('layout', 'Default')->value('tituloRubro', '');


$listadoRubros->get('/components/listado-rubros-json', function(Request $request) use ($app) {
    $rubros = array();
    $raw = $app['api_caller']->call(APICallerService::GM_RUBROS_ACCION, array('item' => APICallerService::RUBROS_TIPO_TODOS), true);
    $rawArray = json_decode($raw, true)['r'];

    foreach ($rawArray as $value) {
        if (stripos($value['clasif'], $request->get('term')) !== false) {
            $rubros[] = array('label' => mb_convert_case($value['clasif'], MB_CASE_TITLE, 'UTF-8'), 'value' => mb_convert_case($value['clasif'], MB_CASE_TITLE, 'UTF-8'));
        }
    }

    return $app->json($rubros);
})->bind('listadoRubrosJson');

$listadoRubros->get('/components/pred-rubros-json/{term}', function(Request $request, $term) use ($app) {
    $rubros = array();
    $raw = $app['api_caller']->call(APICallerService::GM_PRED, array('txt' => $term, 'want' => 'catloc'), FALSE, TRUE);
    $rawArray = json_decode($raw, true)['r'];

    $res = array();

    for($i=0; $i < count($rawArray[0]) && $i < 5; $i++){
        array_push($res, array(
            'name' => $rawArray[0][$i][0],
            'desc' => '',
            'type' => 0,
            'key'  => $rawArray[0][$i][1]
        ));
    }
    for($i =0; $i < count($rawArray[1])  && $i < 5; $i++){
        array_push($res, array(
            'name' => $rawArray[1][$i][0],
            'desc' => $rawArray[1][$i][5],
            'type' => 1,
            'key'  => $rawArray[1][$i][1]
        ));
    }

    return $app->json($res);
})->bind('predRubrosJson');


return $listadoRubros;
