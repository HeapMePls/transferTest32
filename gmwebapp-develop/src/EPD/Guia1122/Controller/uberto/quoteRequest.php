<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Cookie;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Service\UbertoAPICaller;
use EPD\Guia1122\Util\Util;

$quoteRequest = $app['controllers_factory'];

// UBERTO | PRESUPUESTO
// Muestra el formulario de solicitud de presupuesto
//
$quoteRequest->get('/presupuesto/{nam}/{idr}/{ids}', function($nam, $idr, $ids) use ($app) {
  $deviceId = $app['api_caller']->getDeviceId($app);
  $userData = $app['uberto_api_caller']->getUserData($deviceId, false);

  $res = $app['uberto_api_caller']->quoteStart($idr, $ids, $deviceId);

  if ($res->meta->status != 200){
    echo "Error on quoteStart API";
    die();
  }

  // Calculate nice avgRespTime
  if ($res->data->retailer->avgRespTime !== NULL){
    $res->data->retailer->avgRespTimeNice = Util::buildNiceMinsTime($res->data->retailer->avgRespTime);
  }

  // Calculate nice avgRespTime and PIID
  if (property_exists($res->data, 'relatedStores')){
    for($i=0; $i < count($res->data->relatedStores); $i++){
      $res->data->relatedStores[$i]->avgRespTimeNice = Util::buildNiceMinsTime($res->data->relatedStores[$i]->avgRespTime);
    }
  }

  $comercio = $res->data->retailer;

  // Build user data
  if (property_exists($res->data, 'userData')){
    $localUserData = $res->data->userData;
    $localUserData->previousData = true;
  }else{
    if ($userData != NULL){
      $localUserData = new \stdClass();
      $localUserData->lastPhone   = '';
      $localUserData->lastAddress = '';
      $localUserData->lastEmail   = $userData->email;
      $localUserData->lastName    = $userData->nick;
    }else{
      $localUserData->lastPhone   = '';
      $localUserData->lastAddress = '';
      $localUserData->lastEmail   = '';
      $localUserData->lastName    = '';
    }
    $localUserData->previousData = false;
  }

  if (property_exists($res->data, 'relatedStores')){
    $relStores = $res->data->relatedStores;
  }else{
    $relStores = NULL;
  }

  return $app['twig']->render('uberto/quoteRequest.html.twig', array(
    'comercio'      => $comercio, 
    'customfields'  => $res->data->cfields,
    'userData'      => $localUserData,
    'relatedStores' => $relStores));

})->bind('uberto/quoteRequest');

// UBERTO | PRESUPUESTO
// Confirma la solicitud de presupuesto
//
$quoteRequest->post('/presupuesto/{nam}/{idr}/{ids}', function($idr, $ids, Request $request) use ($app) {

  // {
  //   user:{
  //     name : 
  //     phone : 
  //     email : 
  //     addrees:	
  //   },
  //   idr,
  //   ids,
  //   item : //id rubro
  //   description: //descripcion sobre el presupuesto (obligatorio)
  //   dateTo : 
  //   paymentMethod,
  //   scheduleType,
  //   scheduleValue,
  //   customFields: {

  //   }
  // }

  // Check reCaptcha
  if ($request->request->has('g-recaptcha-response')){
    $rcToken = $request->request->get('g-recaptcha-response');
    $app['logger']->info('Uberto|quoteRequest|Post| Checking reCaptcha with token ' . $rcToken);
    $validCaptcha = Util::checkReCaptcha($app, $rcToken);
    if (!$validCaptcha){
      $app['logger']->info('Uberto|quoteRequest|Post| We got a negative from reCaptcha!!');
      echo "ERROR CAPTCHA";
      die();
    }
  }else{
    $app['logger']->info('Uberto|quoteRequest|Post| Missing reCaptcha token');
    echo "MISSING CAPTCHA";
    die();
  }

  $deviceId = $app['api_caller']->getDeviceId($app);

  //Load orderRequest
  $qr = new stdClass();
  $qr->user = new stdClass();
  $qr->user->name    = $request->request->get('qrUserName');
  $qr->user->email   = $request->request->get('qrUserEmail');
  $qr->user->phone   = $request->request->get('qrUserTel');
  $qr->user->notify  = $request->request->get('qrNotifyMe');
  $qr->user->address = $request->request->get('qrLocation');
  $qr->deviceToken   = $deviceId;
  $qr->idr           = $idr;
  $qr->ids           = $ids;
  $qr->description   = $request->request->get('qrDesc');

  // Check schedule
  $qrScheduleType = $request->request->get('qrScheduleType');
  if ($qrScheduleType != NULL){
    $qr->scheduleType  = $qrScheduleType;
    if ($qrScheduleType == 4){
      $qr->scheduleValue = new \stdClass();
      $scheduleValueDate = $request->request->get('qrScheduleValue'); //dd/mm/yyyy
      $arrScheduleValueDate = explode('/',$scheduleValueDate);
      $qr->scheduleValue->date = $arrScheduleValueDate[2].'/'.$arrScheduleValueDate[1].'/'.$arrScheduleValueDate[0]; //yyyy/mm/dd
      $qr->scheduleValue->hour = '';
      //'{"date":"'.$request->request->get('qrScheduleValue').'","hour":""}';
    }else{
      $qr->scheduleValue = '';
    }
  }

  // Check CustomFields AND additional stores
  $customFields = array();
  $addStores    = array();
  $allParams = $request->request->all();
  foreach ($allParams as $paramKey => $paramVal){
    //$app['logger']->debug('------------------------> Checking key ' . $paramKey . ' with value ' . $paramVal);
    // Check CFs fields
    if (substr($paramKey, 0, 4) == 'qrcf'){
      $arrParamVal = explode('-', $paramKey);
      if (count($arrParamVal) == 3){
        $newParam = new stdClass();
        $newParam->id = $arrParamVal[2];
        $newParam->type = $arrParamVal[1];
        $newParam->val = $paramVal;
        $customFields[] = $newParam;
      }else{
        $app['logger']->warn('Uberto|quoteRequest|Post|Custom field [' . $paramKey . '] with value [' . $paramVal . '] has invalid format!!');
      }
    }else if (substr($paramKey, 0, 4) == 'qras'){
      //$app['logger']->debug('------------------------> Key is Additional store, adding it!!!!');
      $arrParamVal = explode('-', $paramKey);
      if (count($arrParamVal) == 3){
        if ($paramVal || $paramVal == 1 || $paramVal == 'on'){
          $addStore = new stdClass();
          $addStore->idr = $arrParamVal[1];
          $addStore->ids = $arrParamVal[2];
          $addStores[] = $addStore;
        }
      }else{
        $app['logger']->warn('Uberto|quoteRequest|Post|Additional store [' . $paramKey . '] with value [' . $paramVal . '] has invalid format!!');
      }
    }
  }
  $qr->customFields = $customFields;

  if (count($addStores) > 0 ){
    $qr->additionalStores = $addStores;
  }

  // Check images
  if ($request->request->has('qImgTotal')){
    $totalImgs = $request->request->get('qImgTotal');
    $qr->images = array();
    for($i=0; $i < $totalImgs; $i++){
      //$paramName = 'qImg-'.$i;
      //$img = $request->request->get($paramName);
      // $app['logger']->warn('--------------- ADDING IMAGE');
      // $app['logger']->warn($img);
      // $app['logger']->warn('----------------------------');
      //$qr->images[] = $img;
      $qr->images[] = $request->request->get('qImg-'.$i);
    }
  }


  // CALL UBERTO
  $response = $app['uberto_api_caller']->quoteRequest($qr);
  if ($response == NULL){
    echo "Ocurrio un error";
    die();
  }else if ($response->meta->status != 200){
    echo "Error de servidor: " . $response->meta->status . "<br>";
    echo "  -> " . $response->meta->message;
    die();
  }

  if (property_exists($response->data, "similars")){
    $lsimilars = $response->data->similars;
  }else{
    $lsimilars = null;
  }
  
  $response->data->retailer->avgResNice = Util::buildNiceMinsTime($response->data->retailer->avgRes);

  $r = new Response($app['twig']->render('uberto/quoteRequestConfirm.html.twig', array(
    'retailer'    => $response->data->retailer, 
    'user'        => $qr->user, 
    'additionals' => $lsimilars)));
  $r->headers->setCookie(new Cookie('lastreq', TRUE));
  return $r;

})->bind('uberto/quoteRequestPost');

return $quoteRequest;