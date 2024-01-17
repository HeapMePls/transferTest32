<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;

$orderCheckoutConfirm = $app['controllers_factory'];

// UBERTO | PEDIDOS
// Muestra la confirmacion del checkout
// 
//$orderCheckoutConfirm->get('/uberto/orderCheckoutConfirm/{id}/{total}', function($id, $total) use ($app) {
$orderCheckoutConfirm->get('/pedido/checkout/{id}/{total}', function($id, $total) use ($app) {

    return $app['twig']->render('uberto/orderCheckoutConfirm.html.twig', array('id' => $id, 'total' => $total));

})->bind('orderCheckoutConfirm');

return $orderCheckoutConfirm;