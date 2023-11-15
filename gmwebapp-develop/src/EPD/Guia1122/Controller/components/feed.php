<?php

use EPD\Guia1122\Service\APICallerService;

$listadoDestacados = $app['controllers_factory'];

$listadoDestacados->get('/components/feed', function() use ($app) {

    $destacados = array();
    $result = $app['api_caller']->call(APICallerService::GM_FEED, array('id' => 'web1122'), true);
    
    $result = json_decode($result);
    for($i = 0; $i < count($result->r->feed); $i++) {
        $temp = $result->r->feed[$i];
        $idrids = $temp->idr * 10000 + $temp->ids;
        $result->r->feed[$i]->storeLink = 'loc/' . $idrids;
        $result->r->feed[$i]->storeImageUrl = 'images/imsbi.jpg';
        switch($result->r->feed[$i]->eventType) {
          case "G":
            $idrids = $temp->idr * 1000 + $temp->ids;
            $result->r->feed[$i]->link = 'gal/' . strtolower(str_replace(' ', '_', $temp->storeName)) . '----' . $idrids . '-' . $temp->eventId;
            if ($result->r->feed[$i]->galDesc == '') {
              $result->r->feed[$i]->galDesc = 'Nueva galería';
              $result->r->feed[$i]->xPercentageSquare = 'Nueva galería';
              $square = $temp->metaData->smartCrop->square;
              $result->r->feed[$i]->metaData->smartCrop->square->xPercentage = ($square->x / $square->width) * 100 ;
              $result->r->feed[$i]->metaData->smartCrop->square->yPercentage = ($square->y / $square->height) * 100 ;
            }
            break;
    
          case "P":
            $result->r->feed[$i]->link = 'prm/' . strtolower(str_replace(' ', '_', $temp->storeName)) .  '/' . $temp->idp;
            break;
    
          case "L":
            $temp = $result->r->feed[$i];
            if ($temp->storeImageUrl == '') {
              $result->r->feed[$i]->storeImageUrl = 'images/imsbi.jpg';
            }
            $result->r->feed[$i]->link = 'loc/' . $idrids;
            $result->r->feed[$i]->isLocal = true;
            break;
    
          case "V":
            $result->r->feed[$i]->link = 'https://www.youtube.com/watch?v=' . $result->r->feed[$i]->idv;
            $result->r->feed[$i]->isVideo = true;
            break;
        }
      }

    return $app['twig']->render('components/feed.html.twig', array('feed' => $result));
})->bind('feedData');

return $listadoDestacados;