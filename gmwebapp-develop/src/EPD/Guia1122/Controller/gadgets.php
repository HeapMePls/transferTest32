<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;

$gadgets = $app['controllers_factory'];

$gadgets->get('/gadgetbuscador', function(Request $request) use ($app) {

    return $app['twig']->render('gadgets/gadgetbuscador.html.twig', array(
        'msg'            => ''
        ));
})->bind('gadgetbuscador');

$gadgets->post('/gadgetbuscador', function(Request $request) use ($app) {

    $rubro     = $request->request->get('search-rubroNombre', '');
    $zona      = $request->request->get('search-zonaNombre', '');
    $url       = "/";

    if (strlen(trim($rubro)) > 0){
        if (strlen(trim($zona)) > 0){
            // Rubro and zona
            $url = "/buscar/".$rubro."/".$zona;
        }else{
            // Only rubro
            $url = "/buscar/".$rubro;
        }
    }


    header("Location: ".$url);
    //echo "URL=" . $url;
    exit();

})->bind('postgadgetbuscador');

return $gadgets;
