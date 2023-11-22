<?php

use Symfony\Component\HttpFoundation\Response;
use EPD\Guia1122\Util\Util;

$sas = $app['controllers_factory'];

$sas->get('/sas/map.js', function() use ($app) {

    return new Response($app['twig']->render('sas/map.js.twig', 
            array('data' => Util::sasMap())), 
            200, 
            array('Content-Type' => 'application/x-javascript; charset=utf-8'));
})->bind('sasMap');

return $sas;
