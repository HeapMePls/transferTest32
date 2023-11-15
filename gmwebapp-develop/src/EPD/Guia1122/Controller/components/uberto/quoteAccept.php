<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;

$quoteAcceptComponent = $app['controllers_factory'];

// UBERTO | PRESUPUESTOS
// Acepta un presupuesto
// Usado dentro de Reveal
//
$quoteAcceptComponent->get('/components/presupuesto/ac/{token}/{responseId}', function($token, $responseId) use ($app) {

    $err = NULL;
    $data = NULL;
    $response = $app['uberto_api_caller']->quoteAccept($token, $responseId);
    if ($response == NULL){
        $err = "Ocurrio un problema al intentar aceptar el presupuesto";
    }else{
        if ($response->meta->status != 200){
            $err = "Ocurrio un problema al intentar aceptar el presupuesto (" . $response->meta->status . ")";
        }else{
            $data = $response->data;
        }
    }
    return $app['twig']->render('components/uberto/quoteAccept.html.twig', array('err'=>$err, 'data'=>$data));

})->bind('quoteAcceptComponent');


return $quoteAcceptComponent;