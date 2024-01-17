<?php

use EPD\Guia1122\Service\APICallerService;
use Symfony\Component\HttpFoundation\RedirectResponse;
use EPD\Guia1122\Util\Urlizer;

$video = $app['controllers_factory'];

$video->get('/video/{comercioNombre}/{id}/{idv}', function($comercioNombre, $id, $idv) use ($app) {
  $logger = $app['logger'];

  // ID  = IDR * 10000 + IDS
  // IDE = IDS de negociosExtra (formato numerico normal)
  // IDV = ID del video
  
  // TODO: Add META information from video info (SCHEMA.ORG)


  $ids = (int)substr($id, -4);
  $idr  = (int)substr($id, 0, -4);

  $logger->info('Video| Requesting CORE API with ('.$idr.', '.$ids.', '.$idv.')');

  $raw = $app['api_caller']->call(APICallerService::GM_FULL_VIDEO, array('idr' => $idr, 'ids' => $ids, 'idv' => $idv), true);
  $raw = json_decode($raw, true);

  // echo(json_encode($raw));
  // die();

  if ($raw['outcode'] != '0'){
    return new RedirectResponse("/local/".$comercioNombre."/LOC".$id, 302);
  }else if (strlen($raw['r']['retailer']['nam']) == 0){
    if (array_key_exists('ctgs', $raw['r']['retailer']) && count($raw['r']['retailer']['ctgs']) > 0){
      $safeRubro = Urlizer::urlize($raw['r']['retailer']['ctgs'][1]);
      return new RedirectResponse("/buscar/".$safeRubro."/todo-el-pais");
    }
  }

  $zona      = $raw['r']['retailer']['znam'];
  $telefonos = explode(' ', $raw['r']['retailer']['phl']);
  $celulares = explode(' ', $raw['r']['retailer']['phm']);
  $rubro     = NULL;
  $rubroId   = NULL;
  if (array_key_exists('ctgs', $raw['r']['retailer'])){
    if ($raw['r']['retailer']['ctgs'] != NULL && count($raw['r']['retailer']['ctgs']) > 0){
      $rubro     = $raw['r']['retailer']['ctgs'][1];
      $rubroId   = $raw['r']['retailer']['ctgs'][0];
    }
  }

  if (array_key_exists('desc', $raw['r']['video'])){
    if (strlen(trim($raw['r']['video']['desc'])) == 0){
      $raw['r']['video']['desc'] = 'Video de '.$raw['r']['retailer']['nam'];
    }
  }
  if (strpos($raw['r']['retailer']['ics'], "big") === false) {
    $raw['r']['retailer']['icshq'] = str_replace('icono/', 'icono/big/', $raw['r']['retailer']['ics']);
  }else{
    $raw['r']['retailer']['icshq'] = $raw['r']['retailer']['ics'];
  }

  // Add IDG and IDRIDS
  $raw['r']['video']['idv'] = $idv;
  $raw['r']['retailer']['idrids'] = $id;

  if (array_key_exists('url',  $raw['r']['retailer'])){
    if (strlen($raw['r']['retailer']['url']) > 0){
      if (substr($raw['r']['retailer']['url'], 0, 4) != "http"){
        $raw['r']['retailer']['url'] = "http://" . $raw['r']['retailer']['url'];
      }
      if (strlen($raw['r']['retailer']['url']) > 6){
        if (substr($raw['r']['retailer']['url'], 0, 11) == 'http://www.'){
          $raw['r']['retailer']['urlNice'] = substr($raw['r']['retailer']['url'], 11);
        }else if (substr($raw['r']['retailer']['url'], 0, 12) == 'https://www.'){
          $raw['r']['retailer']['urlNice'] = substr($raw['r']['retailer']['url'], 12);
        }else if (substr($raw['r']['retailer']['url'], 0, 8) == 'https://'){
          $raw['r']['retailer']['urlNice'] = substr($raw['r']['retailer']['url'], 8);
        }else if (substr($raw['r']['retailer']['url'], 0, 7) == 'http://'){
          $raw['r']['retailer']['urlNice'] = substr($raw['r']['retailer']['url'], 7);
        }else{
          $raw['r']['retailer']['urlNice'] = $raw['r']['retailer']['url'];
        }
      }
    }
  }

  return $app['twig']->render('video.html.twig', array(
    'zona'      => $zona, 
    'rubro'     => $rubro, 
    'rubroId'   => $rubroId, 
    'comercio'  => $raw['r']['retailer'], 
    'telefonos' => $telefonos, 
    'celulares' => $celulares, 
    'video'     => $raw['r']['video']));

})->bind('video');

return $video;