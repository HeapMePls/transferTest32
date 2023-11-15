<?php


use EPD\Guia1122\Service\APICallerService;
use Symfony\Component\HttpFoundation\Request;

$quoteViewPage = $app['controllers_factory'];

// UBERTO | PRESUPUESTO
// Muestra los detalles de un presupuesto
//
$quoteViewPage->get('/presupuesto/v/{token}', function($token) use ($app) {
  $showBtnPedidos = TRUE;

  // Render quote view page
  return $app['twig']->render('uberto/quoteView.html.twig', array(
    'token'          => $token,
    'showBtnPedidos' => $showBtnPedidos
  ));

})->bind('quoteViewPage');

// UBERTO | PRESUPUESTO
// Envia una reseña de un prespupuesto.
// Soporta pedido por AJAX o FORM
//
$quoteViewPage->post('/presupuesto/review', function(Request $request) use ($app) {
  $isAjax = false;

  if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
    $app['logger']->info('Uberto|quoteReview| Received as AJAX');
    // Is AJAX REQUEST, just proxy it
    $postData   = $request->getContent();
    $data = json_decode($postData);
    $isAjax = true;
  }else{
    $app['logger']->info('Uberto|quoteReview| Received as FORM request');
    // Is FORM REQUEST, arrange and send 
    $data = new stdClass();
    $data->token               = $request->request->get('qrevToken');
    $data->text                = $request->request->get('qrevDesc');
    $data->workVal             = ( $request->request->get('qrevworkval') == 'on' ? 1 : 0);
    $data->priceVal            = ( $request->request->get('qrevpriceval') == 'on' ? 1 : 0);
    $data->wrongWorkBad        = ( $request->request->get('qrevwrongworkbad') == 'on' ? 1 : 0);
    $data->wrongWorkSlow       = ( $request->request->get('qrevwrongworkslow')  == 'on' ? 1 : 0);
    $data->wrongWorkSloppy     = ( $request->request->get('qrevwrongworksloppy') == 'on' ? 1 : 0);
    $data->wrongPriceExpensive = ( $request->request->get('qrevwrongpriceexpensive') == 'on' ? 1 : 0);
  }

  $raw = $app['uberto_api_caller']->doQuoteReview($data);


  if ($isAjax){
    return $app['twig']->render('components/uberto/quoteReview.html.twig', array('result'=> $raw));
  }else{
    return $app['twig']->render('uberto/quoteReview.html.twig', array('result'=> $raw));
  }

})->bind('doQuoteReview');



return $quoteViewPage;