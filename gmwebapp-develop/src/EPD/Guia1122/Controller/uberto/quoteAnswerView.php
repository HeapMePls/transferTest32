<?php


use EPD\Guia1122\Service\APICallerService;

$orderAnswerView = $app['controllers_factory'];

// $orderAnswerView->get('/uberto/orderAnswerView', function() use ($app) {

//     $dato = "Prueba order answer view";
  
//     return $app['twig']->render('uberto/orderAnswerView.html.twig', array('dato' => $dato));

// })->bind('orderAnswerView');

return $orderAnswerView;