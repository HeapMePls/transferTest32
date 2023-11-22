<?php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Util;
use EPD\Guia1122\Util\Urlizer;


$comercio = $app['controllers_factory'];
$comercio->get('/local/{comercioNombre}/{id}', function(Request $request, $comercioNombre, $id) use ($app) {
    $logger         = $app['logger'];
    $rubroId        = "0";
    $rubro          = "";
    $sponsorGuia    = APICallerService::PROMOCION_SPONSOR_GUIA;
    $isAdultContent = FALSE;
    $hasCoords      = FALSE;

    // Init API
    $app['api_caller']->init();

    // Check cookies and bot
    $accessToken    = NULL;
    $showBtnPedidos = FALSE;
    if (!Util::checkBot()){
      $cookies        = $request->cookies;
      $showBtnPedidos = ($cookies->has('lastreq'));
      if ($cookies->has(APICallerService::$COOKIE_USER_TOKEN)){
        $accessToken  = $cookies->get(APICallerService::$COOKIE_USER_TOKEN);
        $logger->info("COMERCIO| Found user's cookie and AT is " . $accessToken);
      }
    }

    //Remuevo el PID si es ya viene al principio del request
    $prefix = strtoupper(substr($id, 0, 3));
    if ($prefix == "PID") {
        $id = substr($id, 3);
    }
    // Chequeo por mal armado de PID
    if ( $prefix != "LOC" && strlen($id) <= 7 ) {
      // Se re-arma el ID completo con el local 1 que sabemos que existe
      $id = "LOC".$id."0001";
    }

    //
    // Call GmPIID and check result
    //
    $params = array('piid' => $id, 'opts' => 'GQ', 'html' => 1, 'prm' => 1, 'rel' => 1, 'subs' => 1);
    if ($accessToken == NULL){
      $raw = $app['api_caller']->call(APICallerService::GM_COMERCIO_ACCION, $params, TRUE);
    }else{
      $logger->info("COMERCIO| gmPiid with AT=".$accessToken);
      $params['at'] = $accessToken;
      $raw = $app['api_caller']->call(APICallerService::GM_COMERCIO_ACCION, $params, FALSE, TRUE, $accessToken);
    }
    $raw = json_decode($raw, true);
    
    // echo(json_encode($raw));
    // die();

    // Check valid data found
    $foundValidData = FALSE;
    if ($raw['outcode'] == 0){
      if (strlen(trim($raw['r']['nam'])) > 0){
        $foundValidData = TRUE;
      }
    }

    if ($foundValidData){
      // ALL OK
      $result = $raw['r'];
    }else if ($raw['outcode'] == 153 || !$foundValidData){
      // PIID NOT FOUND! SEARCH BY NAME
      $logger->warning("COMERCIO| API retorno 153 para el comerio '".$comercioNombre."' (".$id."), buscando por nombre...");
      $searchName = str_replace('-', ' ', $comercioNombre);
      $newGmPiid = $app['api_caller']->buscarComercioPorNombre($searchName, $app['config']['brand.country']);
      if ($newGmPiid == NULL){
        $redirectUrl = '/buscar/'.$comercioNombre."/todo-el-pais";
        $logger->warning("COMERCIO| No se encontro un match perfecto para el nombre, haciendo redirect hacia busqueda con el nombre [" . $redirectUrl . "]");
        // $subRequest = \Symfony\Component\HttpFoundation\Request::create(
        //     $redirectUrl,
        //     'GET'
        // );
        // return $app->handle($subRequest);
        return new RedirectResponse($redirectUrl, 302);
      }else{
        $redirectUrl = '/local/'.$comercioNombre."/".$newGmPiid;
        $logger->warning("COMERCIO| Se encontro un match, re-direccionado request hacia [" . $redirectUrl . "]");
        // $subRequest = \Symfony\Component\HttpFoundation\Request::create(
        //     $redirectUrl,
        //     'GET'
        // );
        // return $app->handle($subRequest);
        return new RedirectResponse($redirectUrl, 302);
      }
    }else{
      // TODO: Should never end here as exception will be raised
    }

    //
    // Check for store marked as deleted
    //
    if (array_key_exists('del', $result)){
      if ($result['del']){
        // Found deleted store, re-search by exact name
        $logger->warning("COMERCIO| Se encontro un comercio marcado como borrado: " . $result['nam'] . " (" . $result['idr'] . "-" . $result['ids'] . ")");
        $searchName = str_replace('-', ' ', $comercioNombre);
        $newGmPiid = $app['api_caller']->buscarComercioPorNombre($searchName, $app['config']['brand.country']);
        if ($newGmPiid == NULL){
          // Check if zone is available
          $searchZone = "todo-el-pais";
          if (strlen($result['znam']) > 0){
            $searchZone = Urlizer::urlize($result['znam']);
          }else if (strlen($result['pznam']) > 0){
            $searchZone = Urlizer::urlize($result['pznam']);
          }else if (strlen($result['sta']) > 0){
            $searchZone = Urlizer::urlize($result['sta']);
          }
          // Check main product
          $searchTerm = $comercioNombre;
          if (array_key_exists('ctgs', $result)){
            if (count($result['ctgs']) > 0){
              $searchTerm = Urlizer::urlize(ucwords(strtolower($result['ctgs'][0][1])));
            }
          }
          $redirectUrl = '/buscar/'.$searchTerm."/".$searchZone;
          $logger->warning("COMERCIO| No se encontro un match perfecto para el nombre, haciendo redirect hacia busqueda con [" . $searchTerm . "] en la zona [" . $searchZone . "]");
          // $subRequest = \Symfony\Component\HttpFoundation\Request::create(
          //     $redirectUrl,
          //     'GET'
          // );
          //$subRequest->redirectMsg = "El lugar " . ucwords($searchName) . " ya no está disponible en nuestra base, pero aquí tienes otros similares.";
          //return $app->handle($subRequest);
          return new RedirectResponse($redirectUrl, 302);
        }else{
          $redirectUrl = '/local/'.$comercioNombre."/".$newGmPiid;
          $logger->warning("COMERCIO| Se encontro un match, haciendo redirect hacia [" . $redirectUrl . "]");
          // $subRequest = \Symfony\Component\HttpFoundation\Request::create(
          //     $redirectUrl,
          //     'GET'
          // );
          // return $app->handle($subRequest);
          return new RedirectResponse($redirectUrl, 301);
        }
      }
    }

    //
    // ALL OK, prepare render
    //
    $zonaId = 'Z' . $result['zon'];
    $zona = $result['znam'];
    $result['idrids'] = ($result['idr'] * 10000) + $result['ids'];

    //
    // Resolve main category
    //
    if (array_key_exists('ctgs', $result) && count($result['ctgs']) > 0){
      $rubrosListado = $result['ctgs'];
      $rubroId       = $result['ctgs'][0][0];
      $rubro         = $result['ctgs'][0][1];
    }else{
      $rubrosListado = array();
      $rubroId       = "0";
      $rubro         = "Empresas";
    }


    // if (!empty($rubroId)) {
    //   $rubro = $app['api_caller']->getNombreRubro($rubroId);
    // }

    /* si es loc busco el primer rubro en el listado de rubros que viene */
    // for ($i=0; $i < count($result['ctgs']); $i++){
    //   $result['ctgs'][$i][1] = ucwords(strtolower($result['ctgs'][$i][1]));
    // }
    // if (isset($result['ctgs'])) {
    //   $rubrosListado = $result['ctgs'];
    // } else {
    //   $rubrosListado=array();
    // }

    // /*sino no encontro el rubroid o es empresas y no viene vacio el listado de rubros, tomo el de los listados de rubros*/
    // if (((empty($rubro) || $rubro==APICallerService::EMPRESAS_STRING_COMERCIO)) && count($rubrosListado)>0) {

    //     if (isset($rubrosListado[0])) {

    //         /* me quedo con el rubro principal */
    //         $rubroPrincipal = $rubrosListado[0];

    //         if (!empty($rubroPrincipal[0]) && !empty($rubroPrincipal[1])) {
    //             $rubroId = $rubroPrincipal[0];
    //             $rubro = $rubroPrincipal[1];
    //         }
    //     }
    // }


    /*sino me encontro el rubro de ninguna forma lo seteo a empresas*/
    // if (empty($rubro)) {
    //     $rubro="Empresas";
    //     $rubroId="0";
    // }

    // Get related rubros
    // if (empty($rubro) || empty($zona)) {
    //     $rubrosRelacionados = array();
    // } else {
    //     // $rubrosRelacionados = $app['api_caller']->obtenerRubrosRelacionados($rubroId, $rubro, $app['config']['brand.country']);
    // }
    $rubrosRelacionados = array();
    if (array_key_exists('relprods', $raw['r'])){
      $rubrosRelacionados = $raw['r']['relprods'];
    }

    // Se cambia la carga de relacionados con lo que ya viene cargado en la llamada al la API de gmPIID.
    //$comerciosSimilares = $app['api_caller']->obtenerComerciosSimilares($id, $zona, $rubro, APICallerService::CANT_COMERCIOS_SIMILARES, $result['nam']);
    if (array_key_exists('rel', $result)){
      $comerciosSimilares = $result['rel'];
    }else{
      $comerciosSimilares = NULL;
    }

    // Build tels
    $telcels   = array(); // tels and cels
    $telefonos = array(); // only tels 
    $celulares = array(); // only cells
    $tels = explode(' ', $result['phl']);
    for($i=0; $i < count($tels);$i++){
      if (strlen($tels[$i])>0){
        $telefonos[] = $tels[$i];
        $telcels[] = $tels[$i];
      }
    }
    $cels = explode(' ', $result['phm']);
    for($i=0; $i < count($cels);$i++){
      if (strlen($cels[$i])>0){
        $celulares[] = $cels[$i];
        $telcels[] = $cels[$i];
      }
    }
    
    // Build Buttons
    $buttons = array(
      'default' => array(),
      'secondary' => array(),
      'list' => array()
    );
    if ( (array_key_exists('cta',$result) &&  $result['cta']['btn'] == 'CALL') || !array_key_exists('cta',$result) ){
      // Add default button as call
      $buttons['default']['btn'] = 'CALL';
    }else if (array_key_exists('cta',$result)){
      $buttons['default']['btn'] = $result['cta']['btn'];
      $buttons['default']['val'] = $result['cta']['val'];
    }
    if (strlen($result['lat']) > 0){
      $hasCoords = TRUE;
      // Add como llegar
      $buttons['secondary'][] = array(
        'typ' => 'directions'
      );
    }
    
    // Prepare Vids
    if (array_key_exists('vids', $result)){
      if ($result['vids'] != NULL){
        $vidsCount = count($result['vids']); 
        if ($vidsCount <= 2){
          $result['vidsMaxWidth'] = '49%';
        }else if ($vidsCount == 3){
          $result['vidsMaxWidth'] = '32%';
        }else if ($vidsCount >= 4){
          $result['vidsMaxWidth'] = '24%';
        }
      }
    }

    // Check url link
    if (strlen($result['url']) > 0){
      if (strtolower(substr($result['url'], 0, 4)) != 'http'){
        $result['url'] = 'http://'.$result['url'];
      }
    }

    // Build high quality images
    if (strpos($result['ics'], "big") === false) {
      $result['icshq'] = str_replace('icono/', 'icono/big/', $result['ics']);
    }else{
      $result['icshq'] = $result['ics'];
    }
    if (strpos($result['ims'], "big") === false) {
      $result['imshq'] = str_replace('imagen/', 'imagen/big/', $result['ims']);
    }else{
      $result['imshq'] = $result['ims'];
    }
    if (array_key_exists('iPrm', $result)){
      for($i=0; $i < count($result['iPrm']); $i++){
        if (strpos($result['iPrm'][$i]['imp'], "big") === false) {
          $result['iPrm'][$i]['imphq'] = str_replace('imagen/', 'imagen/big/', $result['iPrm'][$i]['imp']);
        }else{
          $result['iPrm'][$i]['imphq'] = $result['iPrm'][$i]['imp'];
        }
      }
    }

    // Build hours table
    if (array_key_exists('hrsp', $result)){
      if ($result['hrsp'] != 0){
        $today = intval(date('w'));
        $today = ($today == 0) ? 6 : $today-1;
        $result['hrsp']      = Util::buildHoursProfile($today, $result['hrsp'], $result['hrsps']);
        $result['hoursState'] = Util::checkOpen($today, $result['hrsp'], $result['o24'], $app);
      }
    }
    $result['hrsps'] = json_encode($result['hrsps']);

    // Beautify comments dates
    // for($i=0; $i < count($result['iCmt']); $i++){
    //   $result['iCmt'][$i]['niceTs'] = (new \Moment\Moment( $result['iCmt'][$i]['ts'], 'UTC'))->calendar();
    // }
    if (array_key_exists('revs', $result)){
      for($i=0; $i < count($result['revs']); $i++){
        $result['revs'][$i]['niceDate'] = (new \Moment\Moment( $result['revs'][$i]['date'], 'UTC'))->fromNow()->getRelative();
        if ($result['revs'][$i]['repd'] != NULL){
          $result['revs'][$i]['niceRepd'] = (new \Moment\Moment( $result['revs'][$i]['repd'], 'UTC'))->fromNow()->getRelative();
        }
      }
    }

    // Check Social Networks links
    if (array_key_exists('snet', $result)){
      for($i=0; $i < count($result['snet']); $i++){
        if (substr($result['snet'][$i]['lnk'],0,4) != 'http'){
          $result['snet'][$i]['lnk'] = 'http://'.$result['snet'][$i]['lnk'];
        }
      }
    }

    // Check attributes
    if (array_key_exists('attr', $result)){
      if (array_key_exists('highlights', $result['attr'])){
        for($i=0; $i < count($result['attr']['highlights']); $i++){
          if ($result['attr']['highlights'][$i]['typ'] == 'BOOLEAN'){
            $result['attr']['highlights'][$i]['ico'] = Util::buildAttrImagePath($result['attr']['highlights'][$i]['id'], NULL);
          }else{
            $result['attr']['highlights'][$i]['ico'] = Util::buildAttrImagePath($result['attr']['highlights'][$i]['id'], $result['attr']['highlights'][$i]['valId']);
          }
        }
      }
    }

    // Check StructuredData compatibility
    $result['url_for_sd'] = $result['url'];
    if (strlen($result['url_for_sd']) > 0){
      $explodedUrls = explode(' ', $result['url_for_sd']);
      if (count($explodedUrls) > 1){
        $result['url_for_sd'] = $explodedUrls[0];
      }
    }

    // Check logged user
    $deviceId = $app['api_caller']->getDeviceId($app);
    $userData = $app['uberto_api_caller']->getUserData($deviceId, false);
    
    // Check Zuck Carrousel
    $showZuck = NULL;
    if ($result['spo'] == 2 && array_key_exists('pics',$result)){
      if (count($result['pics']) > 0){
        $showZuck = array();
        if (array_key_exists('imshq', $result)){
          if (strlen($result['imshq']) > 0 ){
            $showZuck[] = array (
              'src'   => $result['imshq'],
              'title' => NULL,
            );
          }
        }
        for ($i=0; $i < count($result['pics']) && $i < 4; $i++){
          $newZuck = array (
            'src'   => $result['pics'][$i]['src'],
            'title' => $result['pics'][$i]['title'],
            'desc'  => $result['pics'][$i]['desc'],
          );
          if (strlen($newZuck['title']) == 0){
            $newZuck['title'] = $result['pics'][$i]['title'];
          }
          if (strlen($newZuck['desc']) == 0){
            $newZuck['desc'] = $result['pics'][$i]['desc'];
          }
          $showZuck[] = $newZuck;
        }
      }
    }

    // Check Verified Date and beautifuly it
    // Badge is only
    //$result['vfd'] = '2017-07-08';//."T00:00:00";
    if (array_key_exists('vfd', $result)){
      $tempVfd = new \Moment\Moment($result['vfd']);
      $result['nice_vfd'] = $tempVfd->format('l, d M Y');
    }

    // Beautify data for humans
    $result['nam'] = str_replace('_', ' ', $result['nam']);
    if ($result['url'] != NULL && strlen($result['url']) > 6){
      if (substr($result['url'], 0, 11) == 'http://www.'){
        $result['urlNice'] = substr($result['url'], 11);
      }else if (substr($result['url'], 0, 12) == 'https://www.'){
        $result['urlNice'] = substr($result['url'], 12);
      }else if (substr($result['url'], 0, 8) == 'https://'){
        $result['urlNice'] = substr($result['url'], 8);
      }else if (substr($result['url'], 0, 7) == 'http://'){
        $result['urlNice'] = substr($result['url'], 7);
      }else{
        $result['urlNice'] = $result['url'];
      }
    }

    //
    // Check Adult Content
    //
    if ($result['iac'] == '1'){
      $isAdultContent = TRUE;
      $app['logger']->error("comercio|Found IAC on local " . $result['nam'] . "! Ads disabled");
    }

    //
    // Set map static image URL 
    //
    $mapStaticImage = '';
    if ($hasCoords){
      $mapStaticImage = $app['config']['maps.staticServer'];
    }

    //
    // Check system tags than need action
    //
    $hideRetailerData = FALSE;
    if (array_key_exists('tags', $result)){
      for ($i=0; $i < count($result['tags']); $i++){
        if ($result['tags']['id'] == 'BAD_PAYER'){
          $hideRetailerData = TRUE;
          break;
        }
      }
    }

    // print_r($result);
    // die();

    $r = new Response($app['twig']->render('comercio.html.twig', array(
      'zona'                    => $zona, 
      'rubroId'                 => $rubroId, 
      'zonaId'                  => $zonaId, 
      'rubro'                   => $rubro, 
      'comercio'                => $result, 
      'rubrosRelacionadosArray' => $rubrosRelacionados, 
      'comerciosSimilaresArray' => $comerciosSimilares,
      'telefonos'               => $telefonos, 
      'celulares'               => $celulares, 
      'telcels'                 => $telcels,
      'sponsorGuia'             => $sponsorGuia,
      'showBtnPedidos'          => $showBtnPedidos,
      'userData'                => $userData,
      'showZuck'                => $showZuck,
      'isAdultContent'          => $isAdultContent,
      'mapStaticImage'          => $mapStaticImage,
      'hideRetailerData'        => $hideRetailerData
      /*'sdJsonDataLB'   => $sdJsonDataLB*/)));
    $lastZone = $result['zon'].'|'.$result['znam'];
    $r->headers->setCookie(new Cookie('lastzone', $lastZone, strtotime( '+10 years' )));
    return $r;

})->bind('comercio');

$comercio->post('/local/fav', function(Request $request) use ($app) {
  $app['api_caller']->init();
  if (!isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
    return $app->json(array('outcode'=>'999', 'outmsg'=>'AccessTokenMissingCookie'));
  }
  $postData   = $request->getContent();
  $data = json_decode($postData);
  $app['logger']->info('COMERCIO | Favorite operation for ' . $data->retailer . '-' . $data->store . ', Op: ' . $data->op);
  
  $params = array(
    'type'     => 'gmStore',
    'op'       => $data->op,
    'retailer' => $data->retailer,
    'store'    => $data->store,
    'at'       => $_COOKIE[APICallerService::$COOKIE_USER_TOKEN]
  );
  $res = $app['api_caller']->call(APICallerService::GM_FAVORITE, $params, FALSE, TRUE);

  return $res;
});

$comercio->post('/local/comment', function(Request $request) use ($app) {
  if (!isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
    return $app->json(array('outcode'=>'999', 'outmsg'=>'AccessTokenMissingCookie'));
  }
  $at = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
  $postData   = $request->getContent();
  $data = json_decode($postData);
  $app['logger']->info('COMERCIO | Comment operation for ' . $data->retailer . '-' . $data->store);
  
  $params = array(
    'type'     => 'gmStorePubComment',
    'retailer' => $data->retailer,
    'store'    => $data->store,
    'body'     => $data->body,
    'at'       => $at
  );
  $app['logger']->info('COMERCIO | Sending comment for ' . $data->retailer . '-' . $data->store . ' text=[' . $data->body . '] AT=' . $_COOKIE[APICallerService::COOKIE_USER_TOKEN]);
  $res = $app['api_caller']->call(APICallerService::GM_REPORTAR_ERROR_ACCION, $params, FALSE, TRUE, $at);

  return $res;
});

$comercio->post('/local/like', function(Request $request) use ($app) {
  if (!isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
    return $app->json(array('outcode'=>'999', 'outmsg'=>'AccessTokenMissingCookie'));
  }
  $at = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
  $postData   = $request->getContent();
  $data = json_decode($postData);
  $app['logger']->info('COMERCIO | Like operation for ' . $data->retailer . '-' . $data->store);

  if ($data->recommend == 1){
    $data->stars = 5;
    $data->like = 'true';
  }else{
    $data->stars = 1;
    $data->like = 'false';
  }
  $params = array(
    'type'     => 'gmStoreRank',
    'retailer' => $data->retailer,
    'store'    => $data->store,
    'stars'    => $data->stars,
    'like'     => $data->like,
    'at'       => $at
  );
  $app['logger']->info('COMERCIO | Sending rate for ' . $data->retailer . '-' . $data->store . ' stars=' . $data->stars . ' like=' . $data->like . ' AT=' . $at);
  $res = $app['api_caller']->call(APICallerService::GM_REPORTAR_ERROR_ACCION, $params, FALSE, TRUE);

  return $res;
});

$comercio->post('/local/commentLike', function(Request $request) use ($app) {
  $postData   = $request->getContent();
  $data       = json_decode($postData);
  $params = array(
    'retailer' => $data->retailer,
    'store'    => $data->store,
    'text'     => $data->body
  );
  if ($data->like == 1){
    $params['stars'] = 5;
    $params['like'] = 'true';
  }else{
    $params['stars'] = 1;
    $params['like'] = 'false';
  }
  //
  // Check if user is logged in
  //
  $app['api_caller']->init();
  $app['logger']->info('COMERCIO | commentLike | Checking cookie at ' . APICallerService::$COOKIE_USER_TOKEN);
  if (isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
    //
    // User is logged in, send Access Token (AT)
    //
    $params['at'] = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
    $app['logger']->info('COMERCIO | commentLike | Comment and like operation for ' . $data->retailer . '-' . $data->store);
    $app['logger']->info('COMERCIO | commentLike | Sending recommendation for ' . $data->retailer . '-' . $data->store . ' text=[' . $data->body . '] AT=' . $params['at']);

    $res = $app['api_caller']->call(APICallerService::GM_RECOMMEND, $params, FALSE, TRUE);
    return $res;
  }else{
    //
    // User is not logged in, send command to register and comment
    //
    $params['name']     = $data->name;
    $params['email']    = $data->email;
    $params['password'] = $data->password;
    $app['logger']->info('COMERCIO | commentLike | Comment, register and like operation for ' . $data->retailer . '-' . $data->store);
    $app['logger']->info('COMERCIO | commentLike | Sending recommendation for ' . $data->retailer . '-' . $data->store . ' text=[' . $data->body . '] Email=' . $params['email']);
    $res = $app['api_caller']->call(APICallerService::GM_RECOMENDANDREGISTER, $params, FALSE, TRUE);

    $resJson = json_decode($res, true);
    if ($resJson['outcode'] != 0){
      $app['logger']->error('COMERCIO | commentLike | RecommendAndRegister failed for ' . $data->email . '. API returned code ' . $resJson['outcode'] . ' (' . $resJson['outmsg'] . ')');
      return $res;
    }
    $resJson['r']['user']['cookieName'] = APICallerService::$COOKIE_USER_TOKEN;
    $resJson['r']['user']['cookieTTL'] = strtotime( '+1 years' );

    $deviceToken = $app['api_caller']->getDeviceId($app);
    $app['logger']->info("COMERCIO | commentLike | Reload user data with device " . $deviceToken . " and token " . $resJson['r']['user']['token'] . " as logged now...");
    $app['uberto_api_caller']->callClientData($deviceToken, $resJson['r']['user']['token']);

    return $app->json($resJson);
  }
});

$comercio->get('/checkuser/{email}', function(Request $request, $email) use ($app) {

  $raw = $app['api_caller']->checkUserEmail($app, $email);

  return $app->json($raw);
});

//
// For BuscoInfo redirect
$comercio->get('/loc/{id}', function(Request $request, $id) use ($app) {
  $logger = $app['logger'];
  $logger->error("COMERCIO|LOC| Must redirect /loc URL with id " . $id);
  $params = array('piid' => $id, 'opts' => 'GQ', 'html' => 1, 'prm' => 0, 'rel' => 0, 'subs' => 0);
  $raw = $app['api_caller']->call(APICallerService::GM_COMERCIO_ACCION, $params, true);
  $raw = json_decode($raw, true);
  if ($raw['outcode'] == 0){
    if (strlen(trim($raw['r']['nam'])) > 0){
      $redirectUrl = "/local/".Urlizer::urlize($raw['r']['nam'])."/LOC".$id;
      $logger->error("COMERCIO|LOC| Found retailer " . $raw['r']['nam'] . " for id " . $id . ". URL => " . $redirectUrl);
      return new RedirectResponse($redirectUrl, 301);
    }else{
      if (array_key_exists('ctgs', $raw['r'])){
        if (count($raw['r']['ctgs']) > 0){
          $redirectUrl = "/rubro/".Urlizer::urlize($raw['r']['ctgs'][0][1])."/".$raw['r']['ctgs'][0][0];
          $logger->error("COMERCIO|LOC| Retailer without name but with categories, redirecting to URL => " . $redirectUrl);
          return new RedirectResponse($redirectUrl, 302);
        }
      }
      $logger->error("COMERCIO|LOC| Retailer name is NOT EMPTY! for id " . $id);
      throw new NotFoundHttpException('LOC-NAME-EMPTY|'.$id);
    }
  }else{
    throw new NotFoundHttpException('LOC-REDIRECT|'.$id);
  }
});

//
// For BuscoInfo redirect
$comercio->get('/neg/{hash}', function(Request $request, $hash) use ($app) {
  // i.e.: grúas_24_horas-panamabí_verá-lambaré-central-
  //       to /local/grúas_24_horas/LOC987690001
  $logger = $app['logger'];
  $logger->warning("COMERCIO|NEG| Must redirect /neg URL with hash " . $hash);
  // Decode hash
  $expHash = explode('-', $hash);
  if (count($expHash) > 1){
    $nam = $expHash[0];
    $pid = $expHash[count($expHash)-1];
    $logger->warning("COMERCIO|NEG| Hash decoded to name " . $nam . " and pid " . $pid);
    if (is_numeric($pid)){
      $transPid = substr($pid, 0, -3) . "0" . substr($pid, -3);
      $logger->warning("COMERCIO|NEG| Pid translated from " . $pid . " to " . $transPid);
      $redirectUrl = "/local/".Urlizer::urlize($nam)."/LOC".$transPid;
      $logger->warning("COMERCIO|NEG| New URL for hash " . $hash . " => " . $redirectUrl);
      return new RedirectResponse($redirectUrl, 301);
    }else{
      if (strlen($nam) > 0){
        $logger->warning("COMERCIO|NEG| Hash without pid, redirecting to search by name to /buscar/".$nam);
        $redirectUrl = "/buscar/".str_replace('_',' ', $nam);
        return new RedirectResponse($redirectUrl, 302);
      }else{
        $logger->warning("COMERCIO|NEG| Hash without pid nor name, redirecting to home");
        return new RedirectResponse("/", 302);
      }
    }
  }else{
    $logger->warning("COMERCIO|NEG| Incorrect hash, redirecting to home");
    return new RedirectResponse("/", 302);
  }
});

return $comercio;
