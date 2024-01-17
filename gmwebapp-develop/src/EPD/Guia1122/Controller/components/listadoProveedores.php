<?php

use EPD\Guia1122\Service\APICallerService;

$listadoProveedores = $app['controllers_factory'];

$listadoProveedores->get('/components/listado-proveedores/{layout}/{sponsorNombre}/{sponsorId}', function($layout,$sponsorNombre,$sponsorId) use ($app) {
    $raw = $app['api_caller']->call(APICallerService::GM_PROVEEDORES_ACCION, array('op'=>'1'));
    $proveedores = json_decode($raw, true)['r'];

    return $app['twig']->render('components/listadoProveedores' . $layout . '.html.twig', array('proveedores' => $proveedores,'sponsorId'=>$sponsorId,'sponsorNombre'=>$sponsorNombre));
})->bind('listadoProveedores')->value('layout', 'Default')->value('sponsorId','0')->value('sponsorNombre','0');

return $listadoProveedores;
