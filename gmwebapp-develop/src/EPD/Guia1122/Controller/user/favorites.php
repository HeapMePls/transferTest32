<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;

$favs = $app['controllers_factory'];

$favs->get('/favs', function(Request $request) use ($app){
  
  $app['api_caller']->init();
  
  if (isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
    $userAccessToken = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
    $userLogged = TRUE;
  }else{
    $app['logger']->warning('favs| No user found token ' . APICallerService::$COOKIE_USER_TOKEN );
    $userAccessToken = '';
    $userLogged = FALSE;
  }


  if ($userLogged){
    $rawRes = $app['api_caller']->call(APICallerService::GM_FAVORITE, array(
      'type'     => 'gmStore',
      'op'       => 'list',
      'country'  => 'uy',
      'retailer' => '0',
      'store'    => '0',
      'at'       => $userAccessToken), FALSE, TRUE);
  
    $data = json_decode($rawRes, true);

    for($i=0; $i < count($data['r']); $i++){
      $data['r'][$i]['idLoc'] = (intval($data['r'][$i]['storeRetailerNumber']) * 10000) + intval($data['r'][$i]['storeNumber']);
    }
  }else{
    $data = array('r' => array());
  }

  return $app['twig']->render('user/favorites.html.twig', array(
    'userLogged' => $userLogged,
    'favs'       => $data['r']
  ));

})->bind('favs');


return $favs;