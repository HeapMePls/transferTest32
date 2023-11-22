<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;

$listadoZonas = $app['controllers_factory'];

$listadoZonas->get('/components/listado-zonas/{layout}/{rubroId}/{zonaSeleccionada}/{rubroSeleccionado}/{rubroNombreSeleccionado}/{tituloZona}', function($layout, $rubroId, $zonaSeleccionada, $rubroSeleccionado, $rubroNombreSeleccionado, $tituloZona) use ($app) {    
    
    
    try{
        $raw = $app['api_caller']->call(APICallerService::GM_ZONAS_ACCION, array('want' => 'statezonelist'), true);
        $array = json_decode($raw, true)['r'];

        $departamentos = array();
        foreach ($array as $key => $depto) {
            $idDepto = $depto['zon'];
            $departamentos[$idDepto]['nombre'] = $depto['nmz'];
            $departamentos[$idDepto]['zonas'] = array();
            foreach ($depto['zones'] as $key => $zona) {
                $departamentos[$idDepto]['zonas']['Z' . $zona['zon']] = $zona['nmz'];
            }
        }
    }catch(Exception $ex) {
        $app['logger']->error('Components|ListadoZonas|General exception:');
        $app['logger']->error($ex->getMessage());
        $departamentos = array();
    }

    $departamentosId = $app['api_caller']->obtenerDepartamentosId();

    return $app['twig']->render('components/listadoZonas' . $layout . '.html.twig', array(
        'tituloZona'              => $tituloZona, 
        'departamentosId'         => $departamentosId, 
        'rubroNombreSeleccionado' => $rubroNombreSeleccionado, 
        'rubroSeleccionado'       => $rubroSeleccionado, 
        'zonaSeleccionada'        => $zonaSeleccionada, 
        'rubroId'                 => $rubroId, 
        'departamentos'           => $departamentos, 
        'layout'                  => $layout));
})->bind('listadoZonas')->value('rubroNombreSeleccionado', '0')->value('rubroSeleccionado', '0')->value('rubroId', '0')->value('zonaSeleccionada', '0')->value('layout', 'Default')->value('tituloZona', ''); /* en este caso le estamos pasando el nombre del sufijo ejemplo: listadoZonasLarge */


$listadoZonas->get('/components/listado-zonas-json', function(Request $request) use ($app) {
    $ret = array();
    $raw = $app['api_caller']->call(APICallerService::GM_ZONAS_ACCION, array('want' => 'statezonelist'), true);
    $array = json_decode($raw, true)['r'];

    foreach ($array as $key => $depto) {
        foreach ($depto['zones'] as $idZona => $zona) {
            if (stripos($zona['nmz'], $request->get('term')) !== false) {
                $ret[] = array('label' => mb_convert_case($zona['nmz'], MB_CASE_TITLE, 'UTF-8'), 'value' => mb_convert_case($zona['nmz'], MB_CASE_TITLE, 'UTF-8'));
            }
        }
    }

    return $app->json($ret);
})->bind('listadoZonasJson');

$listadoZonas->get('/components/pred-zonas-json/{term}', function(Request $request, $term) use ($app) {
    $raw = $app['api_caller']->call(APICallerService::GM_ZONAS_ACCION, array('want' => 'predictive', 'txt' => $term), FALSE, TRUE);
    $array = json_decode($raw, true)['r'];
    
    $ret = array();
    for($i=0; $i < count($array); $i++){
        array_push($ret, array(
            'name' => $array[$i][0]['nmz'],
            'desc' => $array[$i][0]['sta']
        ));
    }

    return $app->json($ret);
})->bind('predZonasJson');

return $listadoZonas;
