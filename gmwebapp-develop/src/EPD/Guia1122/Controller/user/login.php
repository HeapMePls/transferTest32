<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;
use Symfony\Component\HttpFoundation\RedirectResponse;


$login = $app['controllers_factory'];

$login->get('/login', function(Request $request) use ($app){
  $retUrl = $request->query->get('retUrl');
  return $app['twig']->render('user/login.html.twig', array('retUrl' => $retUrl));
})->bind('login');

$login->post('/login', function(Request $request) use ($app){

  $username = $request->request->get('username');
  $password = $request->request->get('password');
  $retUrl   = $request->request->get('retUrl');

  $app['logger']->info('login| Logging in user ' . $username);

  $deviceToken = $app['api_caller']->getDeviceId($app);

  try{
    $res = $app['api_caller']->login($app, $username, $password, $deviceToken);
    if ($res == NULL){
      $app['session']->getFlashBag()->set('alert', 'El usuario o la clave no son correctos');
      return $app['twig']->render('user/login.html.twig', array('retUrl' => $retUrl));
    }else{
      $retUrl = $request->query->get('retUrl');
      $app['logger']->info('login| User logged in OK, redirecting to ' . $retUrl);
      header("Location: " . $retUrl);
      exit();
    }
  } catch (Exception $ex) {
    $app['session']->getFlashBag()->set('alert', 'El usuario o la clave no son correctos');
    return $app['twig']->render('user/login.html.twig', array('retUrl' => $retUrl));
  }

})->bind('loginPost');

$login->get('/resetPass', function(Request $request) use ($app){
  if (!$request->query->has('email')){
    return $app->json(array('outcode'=>'999', 'outmsg'=>'MissingEmailAddress'));
  }
  $email = $request->query->get('email');

  $params = array('email'=>$email);
  $res = $app['api_caller']->call(APICallerService::GM_FORGOT_PASS, $params, FALSE, TRUE);
  
  return $res;

})->bind('resetPass');

$login->post('/register', function(Request $request) use ($app){
  $postData   = $request->getContent();
  $data = json_decode($postData);

  if (!property_exists($data, 'reg_email') || strlen($data->reg_email)==0){
    return $app->json(array('outcode'=>'999', 'outmsg'=>'MissingEmailAddress'));
  }
  if (!property_exists($data, 'reg_username') || strlen($data->reg_username)==0){
    return $app->json(array('outcode'=>'998', 'outmsg'=>'MissingUsername'));
  }
  if (!property_exists($data, 'reg_pass') || strlen($data->reg_pass)==0){
    return $app->json(array('outcode'=>'997', 'outmsg'=>'MissingPassword'));
  }
  
  $app['logger']->info('REGISTER | Registering user ' . $data->reg_username . ' - ' . $data->reg_email);
  $res = $app['api_caller']->call(APICallerService::GM_REGISTER3, array(
    'name'     => $data->reg_username,
    'email'    => $data->reg_email,
    'password' => $data->reg_pass
  ), FALSE, TRUE);

  return $res;

})->bind('register');

$login->get('/register', function(Request $request) use ($app){
  return new RedirectResponse('/login', 302);
})->bind('registerGet');

return $login;