<?php

$terminosCondiciones = $app['controllers_factory'];

$terminosCondiciones->get('/terminos-y-condiciones', function() use ($app) {

    return $app['twig']->render('contacto/terminosCondiciones.html.twig', array());
})->bind('terminosCondiciones');

return $terminosCondiciones;

