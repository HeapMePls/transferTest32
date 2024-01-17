<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Urlizer;
use EPD\Guia1122\Util\Util;

$home = $app['controllers_factory'];

$home->get('/', function(Request $request) use ($app) {

    if ($app['config']['brand.country'] == 'uy'){
      $wherezone   = 'Montevideo';
      $lastZoneId  = '01000';
    }else{
      $wherezone   = 'Asunción';
      $lastZoneId  = '20000';
    }
    $lastZoneUrl = '';
    $cookies = $request->cookies;
    if ($cookies->has('lastzone')){
        $tempwz = explode('|',$cookies->get('lastzone'));
        if (count($tempwz) > 1){
            $lastZoneId = substr($tempwz[0], -5);
            $wherezone = $tempwz[1];
            $lastZoneUrl = '/'.Urlizer::urlize($wherezone);
        }
    }else{
        $app['logger']->debug('HOME| No lastzone cookie!');
    }

    $rawHome  = $app['api_caller']->call(APICallerService::GM_HOME, array('z' => $lastZoneId));
    $dataHome = json_decode($rawHome, true);

    // echo json_encode($dataHome);
    // die();

    //
    // Prepare covers
    //
    // for ($i=0; $i < count($dataHome['r']['covers']); $i++){
    //   if ($dataHome['r']['covers'][$i]['action'] == 'gmquery'){
    //     $dataHome['r']['covers'][$i]['actionUrl'] = '/buscar/' . Urlizer::urlize($dataHome['r']['covers'][$i]['actionParams']['gmquery']['term']) . $lastZoneUrl;
    //   }else if ($dataHome['r']['covers'][$i]['action'] == 'gmpiid'){
    //     $loc = ($dataHome['r']['covers'][$i]['actionParams']['gmpiid']['idr'] * 1000) + $dataHome['r']['covers'][$i]['actionParams']['gmpiid'];
    //     $dataHome['r']['covers'][$i]['actionUrl'] = '/local/-/LOC' . $loc;
    //   }else if ($dataHome['r']['covers'][$i]['action'] == 'gmpromo'){
    //     $dataHome['r']['covers'][$i]['actionUrl'] = '/promocion/';
    //   }else{
    //     $dataHome['r']['covers'][$i]['actionUrl'] = '';
    //   }
    // }
    if (count($dataHome['r']['covers']) > 0){
      shuffle($dataHome['r']['covers']);
      if ($dataHome['r']['covers'][0]['action'] == 'gmquery'){
        $dataHome['r']['covers'][0]['actionUrl'] = '/buscar/' . Urlizer::urlize($dataHome['r']['covers'][0]['actionParams']['gmquery']['term']) . $lastZoneUrl;
      }else if ($dataHome['r']['covers'][0]['action'] == 'gmpiid'){
        $loc = ($dataHome['r']['covers'][0]['actionParams']['gmpiid']['idr'] * 1000) + $dataHome['r']['covers'][0]['actionParams']['gmpiid'];
        $dataHome['r']['covers'][0]['actionUrl'] = '/local/-/LOC' . $loc;
      }else if ($dataHome['r']['covers'][0]['action'] == 'gmpromo'){
        $dataHome['r']['covers'][0]['actionUrl'] = '/promocion/';
      }else{
        $dataHome['r']['covers'][0]['actionUrl'] = '';
      }
    }


    //
    // Prepare posts
    //
    if (array_key_exists('posts', $dataHome['r'])){
      for ($i=0; $i < count($dataHome['r']['posts']); $i++){
        if ($dataHome['r']['posts'][$i]['type'] == 'NEW_HOURS'){
          for ($x=0; $x < count($dataHome['r']['posts'][$i]['hrsp']); $x++){
            for ($y=0; $y < count($dataHome['r']['posts'][$i]['hrsp'][$x]['hours']); $y++){
              $dataHome['r']['posts'][$i]['hrsp'][$x]['hours'][$y]['start'] = substr($dataHome['r']['posts'][$i]['hrsp'][$x]['hours'][$y]['start'],0,-2) . ":" . substr($dataHome['r']['posts'][$i]['hrsp'][$x]['hours'][$y]['start'],-2);
              $dataHome['r']['posts'][$i]['hrsp'][$x]['hours'][$y]['end'] = substr($dataHome['r']['posts'][$i]['hrsp'][$x]['hours'][$y]['end'],0,-2) . ":" . substr($dataHome['r']['posts'][$i]['hrsp'][$x]['hours'][$y]['end'],-2);
            }
          }
        }
      }
    }

    // Change Collection background image extension
    // for ($i=0; $i < count($dataHome['feedData']); $i++){
    //     if ($dataHome['feedData'][$i]['name'] == 'collection'){
    //         $dataHome['feedData'][$i]['data']['backimgfullwebp'] = str_replace('.jpg', '.webp', $dataHome['feedData'][$i]['data']['backimgfull']);
    //     }
    // } 
    // Check collections time
    $cols = array();
    if (array_key_exists('cols', $dataHome['r'])){
      for($i=0; $i < count($dataHome['r']['cols']); $i++){
        if (Util::checkMapHour(strtoupper($app['config']['brand.country']), $dataHome['r']['cols'][$i]['data']['maphour'])){
          $cols[] = $dataHome['r']['cols'][$i];
        }
      }
    }

    if (array_key_exists('posts', $dataHome['r'])){
      for($i=0; $i < count($dataHome['r']['posts']); $i++){
        $dataHome['r']['posts'][$i]['idrids'] = ($dataHome['r']['posts'][$i]['idr'] * 10000) + $dataHome['r']['posts'][$i]['ids'];
        $dataHome['r']['posts'][$i]['niceDate'] = (new \Moment\Moment($dataHome['r']['posts'][$i]['date'], 'UTC'))->fromNow()->getRelative();
      }
    }

    $nearWhere = '';
    if (strtolower($wherezone) != 'todo el pais'){
        $nearWhere = ' de ' . $wherezone;
    }

    // echo json_encode($dataHome);
    // die();

    return $app['twig']->render('home.html.twig', array(
        'data'           => $dataHome['r'],
        'collections'    => $cols,
        'lastZoneId'     => $lastZoneId, 
        'lastzone'       => $wherezone,
        'lastZoneUrl'    => $lastZoneUrl,
        'nearWhere'      => $nearWhere
        ));
})->bind('home');

return $home;
