<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Service\UbertoAPICaller;

$requestsList = $app['controllers_factory'];

// UBERTO | GENERAL
// Lista los pedidos de ordenes o presupuestos.
// Por ahora se basa en el DeviceId.

function checkGeneralStatus($req){
  $res = new \stdClass();
  $res->generalStatus   = 'PENDIENTE';
  $res->generalReviewed = 0;
  for($x=0; $x < count($req->responses); $x++){
    if ($req->responses[$x]->status == 'ENTREGADO'){
      $res->generalStatus = 'ENTREGADO';
      $res->generalReviewed = $req->responses[$x]->reviewed;
    }else if ($req->responses[$x]->status == 'ACEPTADO'){
      $res->generalStatus = 'ACEPTADO';
    }else if ($req->responses[$x]->status == 'CONTESTADO'){
      $res->generalStatus = 'CONTESTADO';
    }else if ($req->responses[$x]->status == 'VISTO'){
      $res->generalStatus = 'VISTO';
    }
  }
  return $res;
};

$requestsList->get('/pedidos', function(Request $request) use ($app) {

  $deviceId = $app['api_caller']->getDeviceId($app);

  $showBtnPedidos = TRUE;

  if (isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
    $aToken = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
  }else{
    $aToken = null;
  }
  $response = $app['uberto_api_caller']->requestsListGrouped($deviceId, $aToken);
//   if ($response == NULL){
//     echo "Ocurrio un error";
//     die();
//   }else if ($response->meta->status != 200){
//     echo "Error de servidor: " . $response->meta->status . "<br>";
//     echo "  -> " . $response->meta->message;
//     die();
//   }

  // Beautify dates
  for($i=0;$i<count($response->data->reqs->inprogress);$i++){
    $tempDate = new \Moment\Moment($response->data->reqs->inprogress[$i]->dateFrom, 'UTC');
    $response->data->reqs->inprogress[$i]->dateFromNice = $tempDate->calendar();
    $gralStatus = checkGeneralStatus($response->data->reqs->inprogress[$i]);
    $response->data->reqs->inprogress[$i]->generalStatus = $gralStatus->generalStatus;
    $response->data->reqs->inprogress[$i]->generalReviewed = $gralStatus->generalReviewed;
  }
  for($i=0;$i<count($response->data->reqs->waiting);$i++){
    $tempDate = new \Moment\Moment($response->data->reqs->waiting[$i]->dateFrom, 'UTC');
    $response->data->reqs->waiting[$i]->dateFromNice = $tempDate->calendar();
    $gralStatus = checkGeneralStatus($response->data->reqs->waiting[$i]);
    $response->data->reqs->waiting[$i]->generalStatus = $gralStatus->generalStatus;
    $response->data->reqs->waiting[$i]->generalReviewed = $gralStatus->generalReviewed;
  }
  for($i=0;$i<count($response->data->reqs->answered);$i++){
    $tempDate = new \Moment\Moment($response->data->reqs->answered[$i]->dateFrom, 'UTC');
    $response->data->reqs->answered[$i]->dateFromNice = $tempDate->calendar();
    $gralStatus = checkGeneralStatus($response->data->reqs->answered[$i]);
    $response->data->reqs->answered[$i]->generalStatus = $gralStatus->generalStatus;
    $response->data->reqs->answered[$i]->generalReviewed = $gralStatus->generalReviewed;
  }
  for($i=0;$i<count($response->data->reqs->accepted);$i++){
    $tempDate = new \Moment\Moment($response->data->reqs->accepted[$i]->dateFrom, 'UTC');
    $response->data->reqs->accepted[$i]->dateFromNice = $tempDate->calendar();
    $gralStatus = checkGeneralStatus($response->data->reqs->accepted[$i]);
    $response->data->reqs->accepted[$i]->generalStatus = $gralStatus->generalStatus;
    $response->data->reqs->accepted[$i]->generalReviewed = $gralStatus->generalReviewed;
  }
  for($i=0;$i<count($response->data->reqs->finished);$i++){
    $tempDate = new \Moment\Moment($response->data->reqs->finished[$i]->dateFrom, 'UTC');
    $response->data->reqs->finished[$i]->dateFromNice = $tempDate->calendar();
    $gralStatus = checkGeneralStatus($response->data->reqs->finished[$i]);
    $response->data->reqs->finished[$i]->generalStatus = $gralStatus->generalStatus;
    $response->data->reqs->finished[$i]->generalReviewed = $gralStatus->generalReviewed;
  }

  return $app['twig']->render('uberto/requestsList.html.twig', array(
    'data'           => $response->data,
    'showBtnPedidos' => $showBtnPedidos
  ));

})->bind('uberto/requestList');

return $requestsList;