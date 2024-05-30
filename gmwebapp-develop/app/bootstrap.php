<?php

//use \Exception;
use Silex\Provider\MonologServiceProvider,
  Silex\Provider\TwigServiceProvider,
  Silex\Provider\UrlGeneratorServiceProvider,
  Silex\Provider\SessionServiceProvider,
  Silex\Provider\SwiftmailerServiceProvider,
  Symfony\Component\HttpFoundation\Response,
  Symfony\Component\HttpFoundation\Request,
  Symfony\Component\HttpFoundation\RedirectResponse,
  Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use EPD\Guia1122\Service\APICallerService,
  EPD\Guia1122\Service\UbertoAPICaller,
  EPD\Guia1122\Twig\Extension\GlobalExtension,
  EPD\Guia1122\Provider\PHPRedisServiceProvider;

$app = new Silex\Application();

//Settings and params and config
$app['cache.path'] = __DIR__ . '/cache/' . APPLICATION_ENV;
$app['locale'] = 'es';
$app['config'] = parse_ini_file(__DIR__ . '/config/' . APPLICATION_ENV . '.ini');

//Setup Moment
//date_default_timezone_set('America/Caracas');
date_default_timezone_set('America/Argentina/Buenos_Aires');
\Moment\Moment::setLocale('es_ES');

//Providers
$app->register(new SessionServiceProvider());
$app->register(new UrlGeneratorServiceProvider());

$app->register(new SwiftmailerServiceProvider(), array(
  'swiftmailer.options' => array(
    'host' => $app['config']['swiftmailer.host'],
    'port' => $app['config']['swiftmailer.port'],
    'encryption' => $app['config']['swiftmailer.encryption'],
    'username' => $app['config']['swiftmailer.username'],
    'password' => $app['config']['swiftmailer.password']
  ),
));
$app['swiftmailer.use_spool'] = false;

$app->register(new MonologServiceProvider(), array(
  'monolog.logfile' => __DIR__ . '/logs/app_' . ((APPLICATION_ENV == 'dev') ? date('d_m_Y_H') : date('d_m_Y')) . '_' . APPLICATION_ENV . '.log',
  'monolog.name' => $app['config']['monolog.name'],
  'monolog.level' => $app['config']['monolog.level'],
));

// NOT USED YET
// Include this: ,Monolog\Handler\RotatingFileHandler
// $app['logger.stats'] = function ($app) {
//     $filename = __DIR__ . '/logs/stats_' . ((APPLICATION_ENV == 'dev') ? date('d_m_Y_H') : date('d_m_Y')) . '_' . APPLICATION_ENV . '.log';
//     $log      = new $app['monolog.logger.class']('stats');
//     $handler  = new RotatingFileHandler($filename, 10, 'INFO');
//     $log->pushHandler($handler);

//     return $log;
// };

$app->register(new TwigServiceProvider(), array(
  'twig.path' => array(__DIR__ . '/../src/EPD/Guia1122/views'),
  'twig.options' => array(
    'cache' => __DIR__ . '/cache/' . APPLICATION_ENV,
    'strict_variables' => true
  ),
));

$app['twig'] = $app->share($app->extend('twig', function ($twig, $app) {
  $twig->addExtension(new Twig_Extensions_Extension_Text($app));
  $twig->addExtension(new GlobalExtension($app));
  $twig->addGlobal('IS_PRODUCTION',   $app['config']['isProduction']);
  $twig->addGlobal('COUNTRY',         $app['config']['brand.country']);
  $twig->addGlobal('BRAND',           $app['config']['brand.name']);
  $twig->addGlobal('BRANDCODE',       $app['config']['brand.code']);
  $twig->addGlobal('BRANDNOIMS',      $app['config']['brand.noims']);
  $twig->addGlobal('URUGUAY_ID',      APICallerService::URUGUAY_ID);
  $twig->addGlobal('URUGUAY_TEXT',    APICallerService::URUGUAY_TEXT);
  $twig->addGlobal('assetVersion',    '5.3.3');
  $twig->addGlobal('filesSignature', '-5.3.3-1245301439');
  $twig->addGlobal('mapFramework',    $app['config']['maps.framework']);
  $twig->addGlobal('mapJsSrc',        $app['config']['maps.jssrc']);
  $twig->addGlobal('ADS_SLOT_TOP',    $app['config']['ads.slotTop']);
  $twig->addGlobal('ADS_SLOT_MIDDLE', $app['config']['ads.slotMiddle']);
  $twig->addGlobal('ADS_SLOT_BOTTOM', $app['config']['ads.slotBottom']);
  $twig->addGlobal('ADS_SLOT_RIGHT',  $app['config']['ads.slotRight']);
  $twig->addGlobal('ADS_SLOT_RIGHT1', $app['config']['ads.slotRight1']);

  return $twig;
}));

$app->register(new PHPRedisServiceProvider(), array(
  'redis.host' => $app['config']['redis.host'],
  'redis.port' => $app['config']['redis.port'],
  'redis.timeout' => $app['config']['redis.timeout'],
  'redis.persistent' => true,
  'redis.serializer.igbinary' => false,
  'redis.serializer.php' => false,
  'redis.prefix' => $app['config']['redis.prefix'],
  'redis.database' => '0'
));


//Services declaration
$app['api_caller'] = $app->share(function () use ($app) {
  // return new APICallerService(
  //     $app['redis'], 
  //     $app['logger'], 
  //     //$app['logger.stats'],
  //     $app['session'], 
  //     $app['request'], 
  //     $app['debug']);
  return new APICallerService($app);
});

$app['uberto_api_caller'] = $app->share(function () use ($app) {
  // return new UbertoAPICaller($app['redis'], $app['logger'], $app['session'], $app['request'], $app['debug']);
  return new UbertoAPICaller($app);
});


//Fix 404 hasta encontrar como se hace
$app->error(function (Exception $e, $code) use ($app) {
  $expMsg = $e->getMessage();
  if ($code == 404) {
    // RONDY [28-mar-2019]: Se agrega pagina 404 customizada con status code 404
    //                      para indicarle a Google que no tenemos el restulado
    //                      y evitar el soft-404
    // Check new NOT RESULTS FOUND custom page
    if (substr($expMsg, 0, 4) == 'C404') {
      $notFoundParams = explode('|', $expMsg);
      $app['logger']->error("No se encontro en " . $notFoundParams[1] . " el rubro " . $notFoundParams[3] . " en la zona " . $notFoundParams[2]);

      // RONDY [11-abr-2019]: Google tampoco le gusta el 404 explicito. 
      //                      Volvemos a retornar 200 pero esta vez con NOINDEX
      // $r = new Response($app['twig']->render('error404.html.twig', array(
      //     'rubro' => $notFoundParams[3],
      //     'zona'  => $notFoundParams[2]
      // )), 404);
      // $r->headers->set( 'X-Status-Code', 404 );
      // $r->setStatusCode(404);
      $r = new Response($app['twig']->render('error404.html.twig', array(
        'rubro' => $notFoundParams[3],
        'zona'  => $notFoundParams[2]
      )), 200);
      $r->headers->set('X-Robots-Tag:', 'noindex');
      $r->headers->set('X-Status-Code', 200);
      $r->setStatusCode(200, 'OK');
      return $r;
    } else {
      if ($app['config']['brand.country'] == 'py') {
        //
        // Redirect to /buscar at BuscoInfo
        //
        $uri    = substr($app['request']->getRequestUri(), 1);
        if (substr($uri, 0, 7) != 'buscar/' && substr($uri, 0, 11) != 'favicon.ico') {
          $newUri = '/buscar/';
          $expUri = str_replace('_', '-', explode('-', $uri));
          if (count($expUri) == 1) {
            $newUri .= $expUri[0];
          } else if (count($expUri) == 2) {
            $newUri .= $expUri[0] . "/" . $expUri[1];
          } else if (count($expUri) >= 3) {
            $newUri .= $expUri[0] . "/" . $expUri[1] . '-' . $expUri[2];
          }
          $app['logger']->warning("Url not found for PY, translated from " . $uri . " ==> " . $newUri);
          return new RedirectResponse($newUri, 301);
        }
      } else {
        //
        // Search for Quick Name access
        //
        $uri = strtolower(substr($app['request']->getRequestUri(), 1));
        $app['logger']->debug('Checking name shortcut access for [' . $uri . ']...');

        $result = $app['api_caller']->call(APICallerService::GM_CHECK_DIRECT_ACCESS, array('name' => $uri));
        $result = json_decode($result);
        if ($result->outcode == '0') {
          if ($result->r->url != NULL) {
            header("Location: " . $result->r->url);
            exit();
          }
        }
      }
    }
    // Default 404
    $r = new Response($app['twig']->render('error.html.twig', array('code' => $code)));
    return $r;
  }

  $app['logger']->error('Se produjo un error/exception ' . $expMsg . ' y el codigo fue ' . $code . '. URI=[' . $app['request']->getUri() . ']');

  if ($app['config']['isProduction']) {
    $r = new Response($app['twig']->render('error.html.twig', array('code' => $code)));
    $r->headers->set('X-Status-Code', 503);
    $r->setStatusCode(503);
    return $r;
  }
});

// RONDY: Se quita para poder contestar con 
//        404 => para indicar que la pagina no tiene contenido actualmente
//        503 => cuando hay un problema, y no debe indexar el contenido retornado para la URL pedida
//Force 200 code
// $app->after(function (Request $request, Response $response) {
//     $response->setStatusCode(200, 'OK');
// });


if (APPLICATION_ENV != 'dev' && APPLICATION_ENV != 'dev_bi') {
  putenv('HTTPS=on');
}

return $app;
