<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;
use Symfony\Component\HttpFoundation\RedirectResponse;

$feed = $app['controllers_factory'];

$feed->get('/novedades', function(Request $request) use ($app) {
  $logger   = $app['logger'];
  $offset   = (int) $request->query->get('o', 0);
  $urlParam = '';
  $maxItems = 10;

  // $logger->info('Galeria| Requesting CORE API with ('.$idr.', '.$ids.', '.$idg.')');
  $params = array();
  $params['max'] = $maxItems;
  if ($offset > 0){
    $params['from'] = $offset;
    $urlParam = '?o='.$offset;
  }
  $raw = $app['api_caller']->call(APICallerService::GM_FEED2, $params, true);
  $raw = json_decode($raw, true);

  // echo(json_encode($raw));
  // die();

  // TODO: Build title and desc
  $title      = 'Novedades de tu barrio';
  $desc       = 'Conocé las novedades de los comercios y profesionales';
  $nextOffset = $offset + count($raw['r']['feed']);
  $showMore   = count($raw['r']['feed']) == $maxItems;

  for($i=0; $i < count($raw['r']['feed']); $i++){
    if ($raw['r']['feed'][$i]['ids'] == 0){
      $raw['r']['feed'][$i]['ids'] = 1;
    }
    $raw['r']['feed'][$i]['idrids'] = ($raw['r']['feed'][$i]['idr'] * 10000) + $raw['r']['feed'][$i]['ids'];
    $raw['r']['feed'][$i]['niceDate'] = (new \Moment\Moment($raw['r']['feed'][$i]['date'], 'UTC'))->fromNow()->getRelative();
  }

  return $app['twig']->render('feed.html.twig', array(
    'urlParam'        => $urlParam,
    'pageTitle'       => $title, 
    'pageDescription' => $desc, 
    'posts'           => $raw['r']['feed'], 
    'location'        => $raw['location'],
    'zona'            => NULL,
    'nextOffset'      => $nextOffset,
    'showMore'        => $showMore
  ));
})->bind('novedades');


return $feed;