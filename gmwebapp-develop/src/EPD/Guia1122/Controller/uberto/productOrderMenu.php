<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Util;


$productOrderMenu = $app['controllers_factory'];

// UBERTO | PEDIDOS
// Muestra los detalles de un producto a agregar al carrito
// TYPE: 0=order, 1=store
$productOrderMenu->get('/pd/{name}/{id}/{idr}/{ids}', function(Request $request, $name, $id, $idr, $ids) use ($app) {
    
  $token = $request->query->get('t', '');
  $lineId = $request->query->get('l', '');
  $token = ($token == '-') ? '' : $token;
  $smi = true; // Show More Info
  $fm  = false; // Force Mobile
  
  // Init API
  $app['api_caller']->init();

  // Get device id
  $deviceId = $app['api_caller']->getDeviceId($app);

  // Get user token
  if (isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
    $aToken = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
  }else{
    $aToken = null;
  }

  // Call API
  $result = $app['uberto_api_caller']->orderGetProductDetails(array(
    'id'       => $id, 
    'deviceId' => $deviceId, 
    'token'    => $token,
    'idr'      => $idr), $aToken);

  if (property_exists($result, 'meta')){
    if (property_exists($result->meta, 'status')){
      if ($result->meta->status != "200"){
        if (property_exists($result->meta, 'message')){
          if ($result->meta->message == "INSTANCE_NOT_FOUND"){
            $newUri = "/pedir/".$name."/".$idr."/".$ids;
            return new RedirectResponse($newUri, 302);
          }
        }
        throw new Exception('INVALID SERVER RESPONSE');
      }
    }else{
      throw new Exception('INVALID SERVER RESPONSE');
    }
  }else{
    throw new Exception('INVALID SERVER RESPONSE');
  }

  // Prepare data
  $result->data->origPrice = $result->data->price; // Compatibility for edit mode
  $result->data->idr       = $idr;
  $result->data->ids       = $ids;
  $result->data->token     = $token;

  // If we dont have a token from URL, lets check if UbertoServer has a token inside cart
  if ($result->data->token == ''){
    if (property_exists($result->data, 'cart')){
      if ($result->data->cart != NULL){
        if (property_exists($result->data->cart, 'token')){
          $result->data->token = $result->data->cart->token;
        }
      }
    }
  }

  // Prepare custom fields
  $result->data->customFieldsLabels = array();
  $result->data->customFieldsInput = array();
  for($i=0; $i < count($result->data->customFields); $i++){
    if ($result->data->customFields[$i]->type == 0){
      $result->data->customFieldsLabels[] = $result->data->customFields[$i];
    }else{
      $result->data->customFieldsInput[] = $result->data->customFields[$i];
    }
  }

  // Prepare main image
  $result->data->mainImage = $result->data->imageBasePath . 'thg-' . $result->data->imageName;
  if (!property_exists($result->data,'imageMetadata')){
    $result->data->imageMetadata = new \stdClass();
    $result->data->imageMetadata->size = new \stdClass();
    $result->data->imageMetadata->size->width = 500;
    $result->data->imageMetadata->size->height = 500;
  }

  // Prepare additional images
  for($i=0; $i < count($result->data->additionalImages); $i++){
    $result->data->additionalImages[$i]->index = $i + 1;
    $result->data->additionalImages[$i]->srcImage = $result->data->additionalImages[$i]->srcBase . 'thg-' . $result->data->additionalImages[$i]->srcName;
    if (!property_exists($result->data->additionalImages[$i],'metadata')){
      $result->data->additionalImages[$i]->metadata = new \stdClass();
      $result->data->additionalImages[$i]->metadata->size = new \stdClass();
      $result->data->additionalImages[$i]->metadata->size->width = 500;
      $result->data->additionalImages[$i]->metadata->size->height = 500;
    }
  }

  // Check show more info flag to prepare related
  if ($smi && $result->data->related){
    for($i=0; $i < count($result->data->related); $i++){
      $result->data->related[$i]->link = '';
    }
  }
  $result->data->store->loc = Util::buildLOC($result->data->store->idr, $result->data->store->ids);

  if($lineId != null){
    $data = new stdClass();
    //$data->productId = $id;
    $data->lineId = $lineId;
    $data->idr = $idr;
    $data->ids = $ids;
    $data->token = $token;
    $item = $app['uberto_api_caller']->getOrderItem($data);  
    for($i=0; $i < count($item->data->customFields); $i++){
      for($j=0; $j < count($result->data->customFields); $j++){
        if($item->data->customFields[$i]->id == $result->data->customFields[$j]->id){
          if($result->data->customFields[$j]->type == 1){
            $result->data->customFields[$j]->checked = true;
          }
          else if($result->data->customFields[$j]->type == 2 || $result->data->customFields[$j]->type == 3){
            $result->data->customFields[$j]->val = $item->data->customFields[$i]->val;
          }
        }
      }
    }
  }
  else{
    $item = null;
  }

  // Week days
  if ($result->data->weekMap > 0){
    $result->data->weekMapToShow = Util::printWeekDay("Disponible solo los ", $result->data->weekMap);
    $result->data->weekMap_show = true;
  }else{
    $result->data->weekMap_show = false;
  }

  return $app['twig']->render('uberto/productOrderMenu.html.twig', array(
    'data'      => $result->data,
    'id'        => $id, 
    'idr'       => $idr,
    'ids'       => $ids,
    'token'     => $token,
    'product'   => $item,
    'productStr'=> json_encode($item),
    'smi'       => 1, /* SMI = Show More Info */
    'fm'        => 0, /* FM = Force Mobile */));

})->bind('productOrderMenu');

$productOrderMenu->post('/pedido/producto/agregado', function(Request $request) use ($app){
  /*$postData   = $request->getContent();
  $data = json_decode($postData);
  */
  $currentItem = new stdClass();
  $currentItem->notes    = $request->request->get('additionalNotes');
  $currentItem->quantity = $request->request->get('quantityItem');
  $currentItem->id       = $request->request->get('id');
  $auxPrice              = $request->request->get('price');
  $currentItem->price    = $auxPrice * $currentItem->quantity;
  
  $serverObject = new stdClass();
  $serverObject->token  = $request->request->get('token');
  $serverObject->idr    = $request->request->get('idr');
  $serverObject->ids    = $request->request->get('ids');
  $serverObject->type   = $request->request->get('type');
  $productId            = $request->request->get('id');

  //CUSTOM FIELDS
  $customFields = array();
  $allParams = $request->request->all();
  foreach ($allParams as $paramKey => $paramVal){
    //$app['logger']->debug('------------------------> Checking key ' . $paramKey . ' with value ' . $paramVal);
    // Check CFs fields
    if (substr($paramKey, 0, 2) == 'cf'){
      $arrParamVal = explode('-', $paramKey);
      if (count($arrParamVal) == 3){
        $newParam = new stdClass();
        $newParam->id = $arrParamVal[2];
        $newParam->type = $arrParamVal[1];
        $arrVal = explode('-', $paramVal);
        $newParam->val = $arrVal[0];
        if(count($arrVal) == 2){
          $aux = $arrVal[1] * $currentItem->quantity;
          $currentItem->price = $currentItem->price + $aux;
        }
        $customFields[] = $newParam;
      }else{
        $app['logger']->warn('Uberto|quoteRequest|Post|Custom field [' . $paramKey . '] with value [' . $paramVal . '] has invalid format!!');
      }
    }
  }
  $currentItem->customFields = $customFields;
  

  // Get current device Id
  $deviceId = $app['api_caller']->getDeviceId($app);
  $serverObject->deviceToken = $deviceId;

  // Get current user access token
  if (isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
    $accToken = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
  }else{
    $accToken = null;
  }

  if($request->request->get('lineId') != null && $request->request->get('lineId') != ''){
    $serverObject->lineId       = $request->request->get('lineId');
    $serverObject->notes        = $currentItem->notes;
    $serverObject->quantity     = $currentItem->quantity;
    $serverObject->id           = $currentItem->id;
    $serverObject->price        = $currentItem->price;
    $serverObject->customFields = $currentItem->customFields;
    $raw = $app['uberto_api_caller']->orderEditProduct($serverObject);
    $token = $raw->data->token; 
  }
  else{
    $serverObject->plist[] = $currentItem;
    $raw = $app['uberto_api_caller']->orderAddProduct($serverObject, $accToken);

    $token = $raw->data->token; 
  }

  $deviceId = $app['api_caller']->getDeviceId($app);
  $userData = $app['uberto_api_caller']->getUserData($deviceId, true);
  
    
  // Check complete cart
  $pre = $app['uberto_api_caller']->orderPreCheckout($token);

  $pre->data->token = $token;
  
  for($i = 0; $i < count($pre->data->plist); $i++){
    if($pre->data->plist[$i]->id == $productId){
      $productData = $pre->data->plist[$i];
    }
  }

  return $app['twig']->render('uberto/productAdded.html.twig', array(
    'data' => $pre->data,
    'productData' => $productData));
})->bind('productOrderMenuAdd');

// UBERTO | PEDIDOS
// Solicita los detalles de una linea del carrito para volver a mostrar 
// el formulario de agregar y dejar modificar la linea.
//
$productOrderMenu->post('/pedido/producto', function(Request $request) use ($app) {
    $postData = $request->getContent();
    $data     = json_decode($postData);
    $item     = $app['uberto_api_caller']->getOrderItem($data);

    // Add extra data
    $item->data->idr = $data->idr;
    $item->data->ids = $data->ids;
    $item->data->token = $data->token;
    
    //return $app->json($item);

    return $app['twig']->render('components/uberto/productOrderMenu.html.twig', array(
      'data'      => $item->data, 
      'idProduct' => $data->productId, 
      'lineId'    => $data->lineId,
      'type'      => $data->type));
    
})->bind('productOrderMenuLine');

$productOrderMenu->post('/pd/{name}/{id}/{idr}/{ids}', function(Request $request, $name, $id, $idr, $ids) use ($app) {
  $data = new stdClass();
  $data->productId = $id;
  $data->lineId = $request->query->get('lineId');
  $data->idr = $idr;
  $data->ids = $ids;
  $data->token = $request->query->get('token');
  $item     = $app['uberto_api_caller']->getOrderItem($data);

  // Add extra data
  $item->data->idr = $data->idr;
  $item->data->ids = $data->ids;
  $item->data->token = $data->token;

  return $app['twig']->render('uberto/productOrderMenu.html.twig', array(
    'data'      => $item->data, 
    'idProduct' => $data->productId, 
    'lineId'    => $data->lineId,
    'type'      => $data->type));

})->bind('productOrderModify');


// UBERTO | PEDIDOS
// Agregar el producto al carrito
//
$productOrderMenu->post('/pedido/agregar', function(Request $request) use ($app) {
  // Get data
  $postData   = $request->getContent();
  $data = json_decode($postData);
  
  // Add device and user token
  $deviceId = $app['api_caller']->getDeviceId($app);
  $data->deviceToken = $deviceId;
  if (isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
    $accToken = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
  }else{
    $accToken = null;
  }
  $app['logger']->info('Uberto|orderAddProduct|Adding new product for device ['.$deviceId.'], user ['.$accToken.']...');
  
  if($data->type == 0 || $data->type == '0'){
    $raw = $app['uberto_api_caller']->orderAddProduct($data, $accToken);
    $deviceId = $app['api_caller']->getDeviceId($app);
    $userData = $app['uberto_api_caller']->getUserData($deviceId, true);
    return $app->json($raw);
  }else{
    if(isset($data->token)){
      if($data->token === 0 || $data->token === '0'){
        $data->token = null;
      }
    }
    else{
      $data->token = null;
    }
    $token = $raw->data->token;
    $pre = $app['uberto_api_caller']->orderPreCheckout($token);
    $deviceId = $app['api_caller']->getDeviceId($app);
    $userData = $app['uberto_api_caller']->getUserData($deviceId, true);
    return $app['twig']->render('uberto/productAdded.html.twig', array(
      'data' => $pre));
  }
  
});

// UBERTO | PEDIDOS
// Confirma edicion de una linea del carrito
//
$productOrderMenu->post('/pedido/editar', function(Request $request) use ($app) {
  $postData   = $request->getContent();
  $data = json_decode($postData);
  $app['logger']->info('Uberto|orderEditProduct|Send..');
  $raw = $app['uberto_api_caller']->orderEditProduct($data);
  return $app->json($raw);
});

$productOrderMenu->post('/pd/variant', function(Request $request) use ($app) {
  $postData   = $request->getContent();
  $data = json_decode($postData);
  $app['logger']->info('Uberto|checkSelectedVariation|Send..');
  $raw = $app['uberto_api_caller']->checkSelectedVariation($data);
  return $app->json($raw);
});

// UBERTO | PEDIDOS
// Quita una linea del carrito
//
$productOrderMenu->post('/pedido/quitar', function(Request $request) use ($app) {
  $lineId = $request->query->get('lineId');
  if($lineId != null){
    $data = new stdClass();
    $data->lineId = $lineId;
    $data->idr = $request->query->get('idr');
    $data->ids = $request->query->get('ids');
    $data->token = $request->query->get('token');
  }
  else{
    $postData   = $request->getContent();
    $data = json_decode($postData);
  }
  $app['logger']->info('Uberto|orderAddProduct|Send..');
  $raw = $app['uberto_api_caller']->orderRemoveProduct($data);
  return $app->json($raw);
});

$productOrderMenu->get('/pd/quitar/{lineId}/{token}/{idr}/{ids}', function($lineId, $token, $idr, $ids) use ($app) {
  $data = new stdClass();
  $data->lineId = $lineId;
  $data->idr = $idr;
  $data->ids = $ids;
  $data->token = $token;

  $app['logger']->info('Uberto|orderAddProduct|Send..');
  $raw = $app['uberto_api_caller']->orderRemoveProduct($data);

  $pre = $app['uberto_api_caller']->orderPreCheckout($token);
  $pre->data->token = $token;
  return $app['twig']->render('uberto/productAdded.html.twig', array(
    'data' => $pre->data,
    'productData' => null));
})->bind('productDelete');



//
// Redirect from BuscoInfo
$productOrderMenu->get('/pd/{name}/{storeName}/{idr}/{ids}/{id}', function(Request $request, $name, $storeName, $idr, $ids, $id) use ($app) {
  $redirectUrl = "/pd/".$name."/".$id."/".$idr."/".$ids;
  return new RedirectResponse($redirectUrl, 301);
});


return $productOrderMenu;