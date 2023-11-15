<?php


use EPD\Guia1122\Service\APICallerService;
use Symfony\Component\HttpFoundation\RedirectResponse;

$galeria = $app['controllers_factory'];

$galeria->get('/galeria/{comercioNombre}/{id}/{idg}', function($comercioNombre, $id, $idg) use ($app) {
  $logger = $app['logger'];

  // ID  = IDR * 10000 + IDS
  // IDE = IDS de negociosExtra (formato numerico normal)
  // IDV = ID del video

  // TODO: Add META information from gallery info

  $ids = (int)substr($id, -4);
  $idr  = (int)substr($id, 0, -4);

  $logger->info('Galeria| Requesting CORE API with ('.$idr.', '.$ids.', '.$idg.')');

  $raw = $app['api_caller']->call(APICallerService::GM_FULL_GALLERY, array('idr' => $idr, 'ids' => $ids, 'idg' => $idg), true);
  $raw = json_decode($raw, true);

  // print_r(json_encode($raw));
  // die();

  // Check gallery deletion
  if ($raw['outcode'] == 157){
    return new RedirectResponse("/local/".$comercioNombre."/LOC".$id, 302);
  }

  // Check retailer deletion
  if (strlen(trim($raw['r']['retailer']['nam'])) == 0){
    return new RedirectResponse("/local/".$comercioNombre."/LOC".$id, 301);
  }

  $comercio  = $raw['r']['retailer'];
  $zona      = $comercio['znam'];
  $isAdult   = FALSE;
  if (count($comercio['ctgs']) > 0){
    $rubro     = $comercio['ctgs'][1];
    $rubroId   = $comercio['ctgs'][0];
    $isAdult   = ($comercio['ctgs'][3] == "1");
  }else{
    $rubro="Empresas";
    $rubroId="0";
  }
  $telefonos = explode(' ', $comercio['phl']);
  $celulares = explode(' ', $comercio['phm']);

  // Build high quality images for retailer logos
  if (strpos($comercio['ics'], "big") === false) {
    $comercio['icshq'] = str_replace('icono/', 'icono/big/', $comercio['ics']);
  }else{
    $comercio['icshq'] = $comercio['ics'];
  }
  if (array_key_exists('ims', $comercio)){
    if (strpos($comercio['ims'], "big") === false) {
      $comercio['imshq'] = str_replace('imagen/', 'imagen/big/', $comercio['ims']);
    }else{
      $comercio['imshq'] = $comercio['ims'];
    }
  }

  // Add IDG and IDRIDS
  $raw['r']['gallery']['idg'] = $idg;
  $comercio['idrids'] = $id;

  if (array_key_exists('url', $comercio)){
    if (strlen($comercio['url']) > 0){
      if (substr($comercio['url'], 0, 4) != "http"){
        $comercio['url'] = "http://" . $comercio['url'];
      }
      if (strlen($comercio['url']) > 6){
        if (substr($comercio['url'], 0, 11) == 'http://www.'){
          $comercio['urlNice'] = substr($comercio['url'], 11);
        }else if (substr($comercio['url'], 0, 12) == 'https://www.'){
          $comercio['urlNice'] = substr($comercio['url'], 12);
        }else if (substr($comercio['url'], 0, 8) == 'https://'){
          $comercio['urlNice'] = substr($comercio['url'], 8);
        }else if (substr($comercio['url'], 0, 7) == 'http://'){
          $comercio['urlNice'] = substr($comercio['url'], 7);
        }else{
          $comercio['urlNice'] = $comercio['url'];
        }
      }
    }
  }

  return $app['twig']->render('galeria.html.twig', array(
    'zona'      => $zona, 
    'rubro'     => $rubro, 
    'rubroId'   => $rubroId, 
    'comercio'  => $comercio, 
    'telefonos' => $telefonos, 
    'celulares' => $celulares, 
    'gallery'   => $raw['r']['gallery'],
    'isAdult'   => $isAdult));
})->bind('galeria');

$app->get('/galeria/info/{id}/{ide}/{idg}', function ($id, $ide, $idg) use ($app) {
  $logger = $app['logger'];

  // ID  = IDR * 10000 + IDS
  // IDE = IDS de negociosExtra (formato numerico normal)
  // IDG = ID de la galeria

  $ids = (int)substr($id, -4);
  $idr  = (int)substr($id, 0, -4); 

  $logger->info('Galeria|info| Requesting CORE API with ('.$idr.', '.$ids.', '.$idg.')');

  $raw = $app['api_caller']->call(APICallerService::GM_FULL_GALLERY, array('idr' => $idr, 'ids' => $ids, 'idg' => $idg), true);
  
  return $raw;
});

//
// BuscoInfo migration
$app->get('/gal/{hash}', function ($hash) use ($app) {
  $logger = $app['logger'];
  // i.e.: /gal/mb_explo_sound-san_vicente-asuncion-asunción-98861001-1470
  //     => //galeria/mb-explo-sound/988610001/1470
  $logger->warning("GALERIA| Will translate hash [" . $hash . "]");
  $expHash = explode('-', $hash);
  if (count($expHash) > 4){
    $pid = $expHash[count($expHash)-2];
    $pid = substr($pid, 0, -3)."0".substr($pid,-3);
    $redirectUrl = '/galeria/'.str_replace('_','-',$expHash[0]).'/'.$pid.'/'.$expHash[count($expHash)-1];
    $logger->warning("GALERIA| Redirecting to " . $redirectUrl . " based on hash [" . $hash . "]");
    return new RedirectResponse($redirectUrl, 301);
  }else{
    $logger->error("GALERIA| Could not translate hash [" . $hash . "] !!! redirecting to home");
    return new RedirectResponse('/', 302);
  }
});

return $galeria;