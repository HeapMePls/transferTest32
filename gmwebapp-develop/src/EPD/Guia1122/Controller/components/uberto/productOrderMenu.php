<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Util;

$productOrderMenu = $app['controllers_factory'];

$productOrderMenu->get('/pd/component/{id}/{idr}/{ids}/{token}/{smi}/{fm}', function(Request $request, $id, $idr, $ids, $token, $smi, $fm) use ($app) {
    
    $smi = ($smi == 1); // Show More Info
    $fm  = ($fm  == 1); // Force Mobile

    $lineId = $request->query->get('lineId', '');
    
    // Get device id
    $deviceId = $app['api_caller']->getDeviceId($app);

    // Call API
    $result = $app['uberto_api_caller']->orderGetProductDetails(array('id' => $id, 'deviceId' => $deviceId), true);
    
    // Prepare data
    $result->data->origPrice = $result->data->price; // Compatibility for edit mode
    $result->data->ids       = $ids;
    $result->data->token     = ($token == '-') ? '' : $token;
  
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
    if ($smi){
      for($i=0; $i < count($result->data->related); $i++){
        $result->data->related[$i]->link = '';
      }
      for($i=0; $i < count($result->data->groups); $i++){
        $result->data->groups[$i]->link = '';
      }
    }

    // Week days
    if ($result->data->weekMap > 0){
      $result->data->weekMapToShow = Util::printWeekDay("Disponible solo los ", $result->data->weekMap);
      $result->data->weekMap_show = true;
    }else{
      $result->data->weekMap_show = false;
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
  
    return $app['twig']->render('components/uberto/productOrderMenu.html.twig', array(
      'data'      => $result->data, 
      'idProduct' => $id, 
      'lineId'    => -1,
      'ids'       => $ids,
      'smi'       => $smi,
      'fm'        => $fm,
      'productStr'=> json_encode($item),
      'product'   => $item));
  
})->bind('productOrderMenuComponent')->value('token', '-');

return $productOrderMenu;