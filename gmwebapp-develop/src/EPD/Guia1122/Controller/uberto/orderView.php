<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;

$orderView = $app['controllers_factory'];

// UBERTO | PEDIDOS
// Muestra los detalles de un pedido con el checkout realizado
//
$orderView->get('/pedidos/pedido/{token}', function($token) use ($app) {
  $showBtnPedidos = TRUE;

  $result = $app['uberto_api_caller']->orderView($token);
  

  $tempDate = new \Moment\Moment($result->data->dateFrom, 'UTC');
  $result->data->dateFromNice = $tempDate->calendar();
  if (property_exists($result->data, 'review')){
    if ($result->data->review != NULL){
      $tempDate = new \Moment\Moment($result->data->review->date, 'UTC');
      $result->data->review->dateNice = $tempDate->format('l d \d\e M');
    }
  }
  if ($result->data->scheduleType == 1){
    $tempDate = new \Moment\Moment(str_replace('/', '-', $result->data->scheduleValue->date));
    $result->data->scheduleValue->dateNice = $tempDate->format('l d \d\e M');
  }
  //$result->data->store->tel .= ' 28001122';
  if (strlen($result->data->store->tel) > 0){
    $result->data->store->tels = explode(' ', $result->data->store->tel);
  }else{
    $result->data->store->tels = array();
  }
  //$result->data->store->cel = '099123123 098221122';
  if (strlen($result->data->store->cel) > 0){
    $result->data->store->cels = explode(' ', $result->data->store->cel);
  }else{
    $result->data->store->cels = array();
  }

  return $app['twig']->render('uberto/orderView.html.twig', array(
    'data'           => $result->data,
    'showBtnPedidos' => $showBtnPedidos
  ));

})->bind('orderView');


// UBERTO | PEDIDOS
// Recibe una reseña de un pedido y lo envia a la API.
// Soporta pedirlo por AJAX o por FORM
//
$orderView->post('/pedido/review', function(Request $request) use ($app) {
  $isAjax = false;

  if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
    $app['logger']->info('Uberto|orderReview| Received as AJAX');
    // Is AJAX REQUEST, just proxy it
    $postData   = $request->getContent();
    $data = json_decode($postData);
    $isAjax = true;
  }else{
    $app['logger']->info('Uberto|orderReview| Received as FORM request');
    // Is FORM REQUEST, arrange and send 
    $data = new stdClass();
    $data->token               = $request->request->get('orevToken');
    $data->text                = $request->request->get('orevDesc');
    $data->processVal          = ( $request->request->get('orevprocessval') == 'on' ? 1 : 0);
    $data->shippingVal         = ( $request->request->get('ooevshippingval') == 'on' ? 1 : 0);
    $data->productVal          = ( $request->request->get('ooevproductval') == 'on' ? 1 : 0);
    $data->wrongProcessComplex = ( $request->request->get('orevwrongprocesscomplex') == 'on' ? 1 : 0);
    $data->wrongShippingSlow   = ( $request->request->get('orevwrongshippingslow') == 'on' ? 1 : 0);
    $data->wrongShippingBad    = ( $request->request->get('orevwrongshippingbad')  == 'on' ? 1 : 0);
    $data->wrongProductDiff    = ( $request->request->get('orevwrongproductdiff') == 'on' ? 1 : 0);
  }

  $raw = $app['uberto_api_caller']->doOrderReview($data);


  if ($isAjax){
    return $app['twig']->render('components/uberto/orderReview.html.twig', array('result'=> $raw));
  }else{
    return $app['twig']->render('uberto/orderReview.html.twig', array('result'=> $raw));
  }

})->bind('doOrderReview');


return $orderView;