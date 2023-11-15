<?php

$politicaPrivacidad = $app['controllers_factory'];

$politicaPrivacidad->get('/politica-privacidad', function() use ($app) {

    return $app['twig']->render('contacto/politicaPrivacidad.html.twig', array());
})->bind('politicaPrivacidad');

return $politicaPrivacidad;