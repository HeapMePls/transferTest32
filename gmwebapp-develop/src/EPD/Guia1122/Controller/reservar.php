<?php


use EPD\Guia1122\Service\APICallerService;
use Symfony\Component\HttpFoundation\RedirectResponse;
use EPD\Guia1122\Util\Util;

$ctrlReserva = $app['controllers_factory'];

$ctrlReserva->get('/reservar/{comercioNombre}/{loc}', function($comercioNombre, $loc) use ($app) {
  $logger = $app['logger'];

  $ids = (int)substr($loc, -4);
  $idr  = (int)substr($loc, 0, -4);

  $logger->info('Reserva | Requesting CORE API with ('.$idr.', '.$ids.')');

  $raw = $app['api_caller']->call(APICallerService::GM_RESERVE, array('idr' => $idr, 'ids' => $ids), true);
  $raw = json_decode($raw, true);

  // print_r(json_encode($raw));
  // die();

  // Check deletion
  if ($raw['outcode'] == 166){
    return new RedirectResponse("/local/".$comercioNombre."/LOC".$loc, 302);
  }
  // Check booking disabled
  if ($raw['r']['retailer']['book'] == 0){
    return new RedirectResponse("/local/".$comercioNombre."/LOC".$loc, 302);
  }
  // Check retailer deletion
  if (strlen(trim($raw['r']['retailer']['nam'])) == 0){
    return new RedirectResponse("/local/".$comercioNombre."/LOC".$loc, 302);
  }

  $comercio           = $raw['r']['retailer'];
  $comercio['idrids'] = ($comercio['idr'] * 10000) + $comercio['ids'];
  $zona               = $comercio['znam'];
  if (array_key_exists('ctgs', $comercio) &&  count($comercio['ctgs']) > 0){
    $rubro     = $comercio['ctgs'][1];
    $rubroId   = $comercio['ctgs'][0];
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

  // Build hours table
  if (array_key_exists('hrsp', $comercio)){
    if ($comercio['hrsp'] != 0){
      $today = intval(date('w'));
      $today = ($today == 0) ? 6 : $today-1;
      $comercio['hrsp']       = Util::buildHoursProfile($today, $comercio['hrsp'], $comercio['hrsps']);
      $comercio['hoursState'] = Util::checkOpen($today, $comercio['hrsp'], $comercio['o24'], $app);
    }
  }
  $comercio['hrsps'] = json_encode($comercio['hrsps']);

  if (array_key_exists('attr', $comercio)){
    $comercio['attrs'] = [];
    if (array_key_exists('highlights', $comercio['attr'])){
      $comercio['attrs'] = array_merge($comercio['attrs'], $comercio['attr']['highlights']);
    }
    if (array_key_exists('list', $comercio['attr'])){
      for($i=0;$i < count($comercio['attr']['list']);$i++){
        $comercio['attrs'] = array_merge($comercio['attrs'], $comercio['attr']['list'][$i]['attrs']);
      }
    }
    $comercio['attr'] = NULL;
  }

  // Check Zuck Carrousel
  $showZuck = NULL;
  if ($comercio['spo'] == 2 && array_key_exists('gals',$comercio)){
    if (count($comercio['gals']) > 0){
      $showZuck = array();
      if (array_key_exists('imshq', $comercio)){
        if (strlen($comercio['imshq']) > 0 ){
          $showZuck[] = array (
            'src'   => $comercio['imshq'],
            'title' => NULL,
          );
        }
      }
      for ($i=0; $i < count($comercio['gals'][0]['images']) && $i < 4; $i++){
        $newZuck = array (
          'src'   => $comercio['gals'][0]['images'][$i]['src'],
          'title' => $comercio['gals'][0]['images'][$i]['title'],
          'desc'  => $comercio['gals'][0]['images'][$i]['desc'],
        );
        if (strlen($newZuck['title']) == 0){
          $newZuck['title'] = $comercio['gals'][0]['name'];
        }
        if (strlen($newZuck['desc']) == 0){
          $newZuck['desc'] = $comercio['gals'][0]['description'];
        }
        $showZuck[] = $newZuck;
      }
    }
  }

  // print_r($comercio);
  // die();

  $serverUrl = $app['config']['booking.host'];


  return $app['twig']->render('reservar.html.twig', array(
    'loc'       => $loc,
    'zona'      => $zona, 
    'rubro'     => $rubro, 
    'rubroId'   => $rubroId, 
    'comercio'  => $comercio, 
    'telefonos' => $telefonos, 
    'celulares' => $celulares,
    'showZuck'  => $showZuck,
    'serverUrl' => $serverUrl));
})->bind('reservar');


return $ctrlReserva;