<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;

$logout = $app['controllers_factory'];

$logout->get('/logout', function(Request $request) use ($app){
  
  $deviceToken = $app['api_caller']->getDeviceId($app);
  $app['logger']->info('login| Logging out user at device ' . $deviceToken);
  $res = $app['api_caller']->logout($app, $deviceToken);

  header("Location: /");
  exit();

})->bind('logout');


return $logout;