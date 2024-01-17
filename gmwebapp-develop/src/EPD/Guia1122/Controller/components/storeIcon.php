<?php

$storeIconComponent = $app['controllers_factory'];

$storeIconComponent->get('/components/storeIcon/{name}/{width}', function($name, $width) use ($app) {
  
  $height = $width;
  $fontSize = $width/2;
  $paddingTop = $width/8;
  $letter     = substr($name, 0, 1);
  $colors = ['#dcecac','#f3c9dd','#a7d7e6','#f5eab4'];
  $bcolor = $colors[ord($letter)%3];

  return $app['twig']->render('components/storeIcon.html.twig', array(
    'letter'     => $letter,
    'width'      => $width,
    'height'     => $height,
    'fontSize'   => $fontSize,
    'paddingTop' => $paddingTop,
    'bcolor'     => $bcolor
  ));

})->bind('storeIconComponent');

return $storeIconComponent;