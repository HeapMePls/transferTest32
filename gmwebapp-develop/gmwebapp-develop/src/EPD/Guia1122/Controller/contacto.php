<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Util;
use Symfony\Component\HttpFoundation\RedirectResponse;

$contacto = $app['controllers_factory'];

$contacto->match('/contacto/{hash}/{id}', function(Request $request, $hash, $id = null) use ($app) {

    $cookies = $request->cookies;
    $showBtnPedidos = ($cookies->has('lastreq'));

    if ($request->getMethod() == 'POST') {
        if ($request->request->get('qform') == 'Contacto') {
            // Check reCaptcha
            if ($request->request->has('g-recaptcha-response')){
              $rcToken = $request->request->get('g-recaptcha-response');
              $app['logger']->info('Contacto|Post| Checking reCaptcha with token ' . $rcToken);
              $validCaptcha = Util::checkReCaptcha($app, $rcToken);
              if (!$validCaptcha){
                $app['logger']->info('Contacto|Post| We got a negative from reCaptcha!!');
                $app['session']->getFlashBag()->set('alert', 'No se pudo procesar el control anti-robot, por favor inténtelo de nuevo.');
                return $app['twig']->render('contacto/contacto.html.twig', array(
                  'msg'            => $request->get('msg'), 
                  'hash'           => $hash, 
                  'showBtnPedidos' => $showBtnPedidos
                  ));
              }
            }else{
              $app['logger']->info('Uberto|quoteRequest|Post| Missing reCaptcha token');
              $app['session']->getFlashBag()->set('alert', 'No se pudo procesar el control anti-robot, por favor inténtelo de nuevo.');
              return $app['twig']->render('contacto/contacto.html.twig', array(
                'msg'            => $request->get('msg'), 
                'hash'           => $hash, 
                'showBtnPedidos' => $showBtnPedidos
                ));
            }

            if ($request->request->get('message', '') != '') {

                $body = '<strong>Mensaje desde pagina web</strong><br><br> ' . PHP_EOL . PHP_EOL .
                        'Nombre: ' . $request->request->get('name') . '<br>' . PHP_EOL .
                        'Correo: ' . $request->request->get('email') . '<br>' . PHP_EOL .
                        'Asunto: Pagina web - Contacto' . '<br>' . PHP_EOL .
                        'Mensaje: ' . '<br>' . PHP_EOL . PHP_EOL . addslashes($request->request->get('message')) . '<br>' . PHP_EOL;
                if ($request->request->has('refPage')){
                    $body .= "--------------------------" . PHP_EOL .
                          "Pagina de referencia: " . $request->request->get('refPage') . PHP_EOL;
                }

                if ($app['config']['brand.country'] == 'uy'){
                  //
                  // Send at EPD (UY) SwiftMailer
                  //
                  $message = \Swift_Message::newInstance()
                          ->setSubject('Mensaje desde pagina web ' . date("Y-m-d") . ' ' . $request->request->get('name'))
                          ->setFrom(array($app['config']['swiftmailer.username'] => 'Página de contacto 1122'))
                          ->setTo(array($app['config']['contact.address']))
                          ->setReplyTo(array($request->request->get('email') => $request->request->get('name')))
                          ->setBody($body);

                  $app['mailer']->send($message);

                  $app['session']->getFlashBag()->set('success', 'El email ha sido enviado!, lo contactaremos pronto.');
                }else{
                  $res = Util::sendMailPrivate(
                    $app, 
                    'Mensaje desde pagina web ' . date("Y-m-d") . ' ' . $request->request->get('name'), 
                    'noreply@tingelmar.com', 
                    $app['config']['contact.address'], 
                    $body, 
                    NULL);
                  if ($res->meta->code == 200){
                    $app['session']->getFlashBag()->set('success', 'El email ha sido enviado!, lo contactaremos pronto.');
                  }else{
                    $app['logger']->info('Contacto|Post| nGage returned error ['.$res->meta->code.']!!');
                    $app['session']->getFlashBag()->set('alert', 'No fue posible enviar el mensaje en este momento, por favor inténtelo de nuevo más tarde.');
                    return $app['twig']->render('contacto/contacto.html.twig', array(
                      'msg'            => $request->get('msg'), 
                      'hash'           => $hash, 
                      'showBtnPedidos' => $showBtnPedidos
                      ));
                  }
                }
            }
        } elseif ($request->request->get('qform') == 'AdherirComercio') {
            $tel = $request->request->get('tel');
            $name = $request->request->get('name');

            $app['api_caller']->call(APICallerService::GM_ADHERIR_COMERIO_ACCION, array('tel' => $tel, 'name' => $name));

            $app['session']->getFlashBag()->set('success', 'Lo contactáremos a la brevedad, gracias.');
        }
    }

    return $app['twig']->render('contacto/contacto.html.twig', array(
        'msg'            => $request->get('msg'), 
        'hash'           => $hash, 
        'showBtnPedidos' => $showBtnPedidos
        ));
})->bind('contacto')->value('hash', null)->value('id', null)->value('localLat', null)->value('localLon', null);





$contacto->get('/acerca/quienessomos', function() use ($app){

    return $app['twig']->render('contacto/quienes.html.twig');

})->bind('quienes');

$contacto->get('/acerca/verificacion', function() use ($app){

    return $app['twig']->render('contacto/verification.html.twig');

})->bind('verification');





$contacto->match('/reportarerror/{id}', function(Request $request, $id) use ($app){

    $localLat = null;
    $localLon = null;
    $localName = null;
    if (!is_null($id)) {
        $locInfoRaw = $app['api_caller']->call(APICallerService::GM_COMERCIO_ACCION, array('piid' => $id, 'opts' => 'GQ'), true);
        $locInfo = json_decode($locInfoRaw, true)['r'];
        $localLat = ($locInfo['lat'] == '') ? '-34.9071' : $locInfo['lat'];
        $localLon = ($locInfo['lon'] == '') ? '-56.1935' : $locInfo['lon'];
        $localName = $locInfo['nam'];
    }

    if ($request->getMethod() == 'POST') {
        if ($request->request->has('wrong')){
            $wrong = implode(',', $request->request->get('wrong'));
        }else{
            $wrong = array();
        }
        $body      = $request->request->get('datos-correctos');
        $username  = $request->request->get('username');
        $useremail = $request->request->get('useremail');
        $latitud   = $locInfo['lat'];
        $longitud  = $locInfo['lon'];
        $idNegocio = $locInfo['idr'];
        $store     = $locInfo['ids'];
        if ($request->request->get('storeloc', '') != '') {
            $ubicacion = $request->request->get('storeloc');
        } else {
            $ubicacion = $latitud . ', ' . $longitud;
        }

        $app['api_caller']->call(APICallerService::GM_REPORTAR_ERROR_ACCION, array('type' => 'gmStoreErrReport', 'username' => $username, 'useremail' => $useremail, 'body' => $body, 'wrongfields' => $wrong, 'storeloc' => $ubicacion, 'retailer' => $idNegocio, 'store' => $store));

        $app['session']->getFlashBag()->set('success', 'El reporte ha sido enviado, gracias.');
    }

    //
    // Check user data
    //
    $username  = '';
    $usermail  = '';
    $deviceId  = $app['api_caller']->getDeviceId($app);
    if ($deviceId != NULL){
      $userData  = $app['uberto_api_caller']->getUserData($deviceId, true);
      if ($userData != NULL){
        $username = $userData->nick;
        $usermail = $userData->email;
      }
    }

    return $app['twig']->render('contacto/reportarerror.html.twig', array(
        'localLat'  => $localLat, 
        'localName' => $localName, 
        'localLon'  => $localLon, 
        'id'        => $id,
        'username'  => $username,
        'usermail'  => $usermail
    ));

})->bind('reportarerror');

//
// BuscoInfo migration
$contacto->get('/negInformacionErronea/{hash}', function(Request $request, $hash) use ($app){
  $logger = $app['logger'];
  // i.e.: /negInformacionErronea/mb_explo_sound-san_vicente-asuncion-asunción-98861001
  //    => /reportarerror/LOC988610001
  $logger->warning("REPERROR| Will translate hash [" . $hash . "]");
  $expHash = explode('-', $hash);
  if (count($expHash) >= 4){
    $pid = $expHash[count($expHash)-1];
    $pid = substr($pid, 0, -3)."0".substr($pid,-3);
    $redirectUrl = '/reportarerror/LOC'.$pid;
    $logger->warning("REPERROR| Redirecting to " . $redirectUrl . " based on hash [" . $hash . "]");
    return new RedirectResponse($redirectUrl, 301);
  }else{
    $logger->error("REPERROR| Could not translate hash [" . $hash . "] !!! redirecting to home");
    return new RedirectResponse('/', 302);
  }
});

return $contacto;
