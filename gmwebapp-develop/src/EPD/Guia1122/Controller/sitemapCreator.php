<?php

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGenerator;
use EPD\Guia1122\Util\Util;
use EPD\Guia1122\Service\APICallerService;

$sitemapCreator = $app['controllers_factory'];

// 
// WARNING: OLD SITE MAP GENERATOR
//
$sitemapCreator->match('/php/sitemapcreator.php', function(Request $request) use ($app) {
    $refType = UrlGenerator::NETWORK_PATH;
    $baseUrl = "https:";
    $data = array();
    $paramQ = $request->query->get('q', '');
    $paramName = $request->query->get('name');
    $paramId = $request->query->get('id');

    if ($paramQ == APICallerService::SITEMAP_CREATOR_PAGINAS_ESTATICAS) {
        $url = $baseUrl.$app['url_generator']->generate('contacto', array(), $refType);
        $changefreq = 'weekly';
        $priority = '0.5';
        $lastmod = date('Y-m-d');

        $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);

        $url = $baseUrl.$app['url_generator']->generate('contacto', array('hash' => 'quienes-somos'), $refType);
        $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);

        $url = $baseUrl.$app['url_generator']->generate('contacto', array('hash' => 'nuestra-mision'), $refType);
        $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);

        $url = $baseUrl.$app['url_generator']->generate('contacto', array('hash' => 'como-funciona'), $refType);
        $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);

        $url = $baseUrl.$app['url_generator']->generate('home', array(), $refType);
        $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);

        $url = $baseUrl.$app['url_generator']->generate('promocionesTodas', array(), $refType);
        $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);

        $headerXml = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        $footerXml = '</urlset>';
    } elseif ($paramQ == APICallerService::SITEMAP_CREATOR_TODAS_LAS_ZONAS) {

        $headerXml = '<urlset xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        $footerXml = '</urlset>';

        $raw = $app['api_caller']->call(APICallerService::GM_ZONAS_ACCION, array('want' => 'statezonelist'), true);
        $array = json_decode($raw, true)['r'];

        foreach ($array as $key => $depto) {
            $cod = 'Z' . $depto['zon'];
            $zna = $depto['nmz'];
            $url = $baseUrl.$app['url_generator']->generate('zona', array('zonaNombre' => Util::slugify($zna), 'zonaId' => $cod), $refType);
            $changefreq = 'weekly';
            $priority = '0.5';
            $lastmod = date('Y-m-d');
            $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);

            foreach ($depto['zones'] as $key => $zona) {
                $cod = 'Z' . $zona['zon'];
                $zna = $zona['nmz'];
                $url = $baseUrl.$app['url_generator']->generate('zona', array('zonaNombre' => Util::slugify($zna), 'zonaId' => $cod), $refType);
                $changefreq = 'weekly';
                $priority = '0.5';
                $lastmod = date('Y-m-d');
                $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);
            }
        }
    } elseif ($paramQ == APICallerService::SITEMAP_CREATOR_TODAS_LOS_RUBROS) {
        $headerXml = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        $footerXml = '</urlset>';

        $lastmod = date('Y-m-d');
        $raw = $app['api_caller']->call(APICallerService::GM_RUBROS_ACCION, array('item' => 'productList'));
        $rawArray = json_decode($raw, true)['r'];

        foreach ($rawArray as $key => $value) {
            $data[] = array('lastmod' => $lastmod, 'priority' => '0.5', 'changefreq' => 'weekly', 'url' => $baseUrl.$app['url_generator']->generate('rubro', array('rubroNombre' => Util::slugify($value['clasif']), 'rubroId' => $value['id']), $refType));
        }
    } elseif ($paramQ == APICallerService::SITEMAP_CREATOR_ZONA_RUBRO && isset($paramName) && isset($paramId)) {
        $headerXml = '<urlset xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        $footerXml = '</urlset>';

        $lastmod = date('Y-m-d');
        $raw = $app['api_caller']->call(APICallerService::GM_RUBROS_ACCION, array('item' => 'productList'));
        $rawArray = json_decode($raw, true)['r'];

        foreach ($rawArray as $key => $value) {
            $data[] = array('lastmod' => $lastmod, 'priority' => '0.5', 'changefreq' => 'weekly', 'url' => $baseUrl.$app['url_generator']->generate('rubroZona', array('zonaNombre' => Util::slugify($paramName), 'rubroNombre' => Util::slugify($value['clasif']), 'zonaId' => $paramId, 'rubroId' => $value['id']), $refType));
        }
    } elseif ($paramQ == APICallerService::SITEMAP_CREATOR_SPONSORS) {
        $raw = $app['api_caller']->call(APICallerService::GM_PROVEEDORES_ACCION, array());
        $proveedores = json_decode($raw, true)['r'];

        $headerXml = '<sitemapindex xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        $footerXml = '</sitemapindex>';
        $data = array();

        foreach ($proveedores as $pos => $proveedor) {
            $url = $baseUrl.$app['url_generator']->generate('sponsor', array('sponsorNombre' => Util::slugify($proveedor['name']), 'sponsorId' => $proveedor['idr']), $refType);
            $changefreq = 'weekly';
            $priority = '0.5';
            $lastmod = date('Y-m-d');
            $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);
        }
    } else {
        $contador = 1;

        $headerXml = '<sitemapindex xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        $footerXml = '</sitemapindex>';

        $raw = $app['api_caller']->call(APICallerService::GM_ZONAS_ACCION, array('want' => 'statezonelist'), true);
        $array = json_decode($raw, true)['r'];

        $lastmod = date('Y-m-d');


        /* agrego a todo el pais */
        $cod = APICallerService::URUGUAY_ID;
        $zna = APICallerService::URUGUAY_TEXT;
        $url = $baseUrl.$app['url_generator']->generate('sitemapCreator', array(), $refType) . '?q=' . APICallerService::SITEMAP_CREATOR_ZONA_RUBRO . '&id=' . $cod . '&name=' . Util::slugify($zna);
        $data[$contador++] = array('lastmod' => $lastmod, 'url' => $url);


        /* agrego los departamentos */
        foreach ($array as $key => $depto) {
            $cod = 'Z' . $depto['zon'];
            $zna = $depto['nmz'];
            $url = $baseUrl.$app['url_generator']->generate('sitemapCreator', array(), $refType) . '?q=' . APICallerService::SITEMAP_CREATOR_ZONA_RUBRO . '&id=' . $cod . '&name=' . Util::slugify($zna);

            $data[$contador++] = array('lastmod' => $lastmod, 'url' => $url);

            /* agrego las zonas */
            foreach ($depto['zones'] as $key => $zona) {
                $cod = 'Z' . $zona['zon'];
                $zna = $zona['nmz'];
                $url = $baseUrl.$app['url_generator']->generate('sitemapCreator', array(), $refType) . '?q=' . APICallerService::SITEMAP_CREATOR_ZONA_RUBRO . '&id=' . $cod . '&name=' . Util::slugify($zna);
                $lastmod = date('Y-m-d');
                $data[$contador++] = array('lastmod' => $lastmod, 'url' => $url);
            }
        }

        $url = $baseUrl.$app['url_generator']->generate('sitemapCreator', array(), $refType) . '?q=' . APICallerService::SITEMAP_CREATOR_TODAS_LAS_ZONAS;
        $data[$contador++] = array('lastmod' => $lastmod, 'url' => $url);

        $url = $baseUrl.$app['url_generator']->generate('sitemapCreator', array(), $refType) . '?q=' . APICallerService::SITEMAP_CREATOR_TODAS_LOS_RUBROS;
        $data[$contador++] = array('lastmod' => $lastmod, 'url' => $url);

        $url = $baseUrl.$app['url_generator']->generate('sitemapCreator', array(), $refType) . '?q=' . APICallerService::SITEMAP_CREATOR_PAGINAS_ESTATICAS;
        $data[$contador++] = array('lastmod' => $lastmod, 'url' => $url);
    }

    return new Response($app['twig']->render('sitemapCreator.xml.twig', array('data' => $data, 'paramQ' => $paramQ, 'headerXml' => $headerXml, 'footerXml' => $footerXml)), 200, array('Content-Type' => 'application/xml; charset=utf-8')
    );
})->bind('sitemapCreator');




//
// NEW SITEMAP GENERATOR
//

// Root
$sitemapCreator->get('/smap', function(Request $request) use ($app) {
  if ($app['config']['brand.country'] == 'uy'){
    $deptos = array(
      array('id' => '01', 'name' => 'montevideo', 'gTotal' => 3, 'gIndex' => 0),
      array('id' => '01', 'name' => 'montevideo', 'gTotal' => 3, 'gIndex' => 1),
      array('id' => '01', 'name' => 'montevideo', 'gTotal' => 3, 'gIndex' => 2),
      array('id' => '02', 'name' => 'artigas',    'gTotal' => -1, 'gIndex' => -1),
      array('id' => '03', 'name' => 'canelones',  'gTotal' => -1, 'gIndex' => -1),
      array('id' => '04', 'name' => 'cerro-largo','gTotal' => -1, 'gIndex' => -1),
      array('id' => '05', 'name' => 'colonia',    'gTotal' => -1, 'gIndex' => -1),
      array('id' => '06', 'name' => 'durazno',    'gTotal' => -1, 'gIndex' => -1),
      array('id' => '07', 'name' => 'flores',     'gTotal' => -1, 'gIndex' => -1),
      array('id' => '08', 'name' => 'florida',    'gTotal' => -1, 'gIndex' => -1),
      array('id' => '09', 'name' => 'lavalleja',  'gTotal' => -1, 'gIndex' => -1),
      array('id' => '10', 'name' => 'maldonado',  'gTotal' => -1, 'gIndex' => -1),
      array('id' => '11', 'name' => 'paysandu',   'gTotal' => -1, 'gIndex' => -1),
      array('id' => '12', 'name' => 'rio-negro',  'gTotal' => -1, 'gIndex' => -1),
      array('id' => '13', 'name' => 'rivera',     'gTotal' => -1, 'gIndex' => -1),
      array('id' => '14', 'name' => 'rocha',      'gTotal' => -1, 'gIndex' => -1),
      array('id' => '15', 'name' => 'salto',      'gTotal' => -1, 'gIndex' => -1),
      array('id' => '16', 'name' => 'san-jose',   'gTotal' => -1, 'gIndex' => -1),
      array('id' => '17', 'name' => 'soriano',    'gTotal' => -1, 'gIndex' => -1),
      array('id' => '18', 'name' => 'tacuarembo', 'gTotal' => -1, 'gIndex' => -1),
      array('id' => '19', 'name' => 'treinta-y-tres', 'gTotal' => -1, 'gIndex' => -1),
    );
  }else{
    $deptos = array(
      array('id' => '01', 'name' => 'concepcion',       'gTotal' => -1, 'gIndex' => -1),
      array('id' => '02', 'name' => 'san-pedro',        'gTotal' => -1, 'gIndex' => -1),
      array('id' => '03', 'name' => 'cordillera',       'gTotal' => -1, 'gIndex' => -1),
      array('id' => '04', 'name' => 'guaira',           'gTotal' => -1, 'gIndex' => -1),
      array('id' => '05', 'name' => 'caaguazu',         'gTotal' => -1, 'gIndex' => -1),
      array('id' => '06', 'name' => 'caazapa',          'gTotal' => -1, 'gIndex' => -1),
      array('id' => '07', 'name' => 'itapua',           'gTotal' => -1, 'gIndex' => -1),
      array('id' => '08', 'name' => 'misiones',         'gTotal' => -1, 'gIndex' => -1),
      array('id' => '09', 'name' => 'paraguari',        'gTotal' => -1, 'gIndex' => -1),
      array('id' => '10', 'name' => 'alto-parana',      'gTotal' => -1, 'gIndex' => -1),
      array('id' => '11', 'name' => 'central',          'gTotal' => -1, 'gIndex' => -1),
      array('id' => '12', 'name' => 'ñeembucu',         'gTotal' => -1, 'gIndex' => -1),
      array('id' => '13', 'name' => 'amambay',          'gTotal' => -1, 'gIndex' => -1),
      array('id' => '14', 'name' => 'canindeyu',        'gTotal' => -1, 'gIndex' => -1),
      array('id' => '15', 'name' => 'presidente-hayes', 'gTotal' => -1, 'gIndex' => -1),
      array('id' => '16', 'name' => 'alto-paraguay',    'gTotal' => -1, 'gIndex' => -1),
      array('id' => '17', 'name' => 'boqueron',         'gTotal' => -1, 'gIndex' => -1),
      array('id' => '20', 'name' => 'asuncion',         'gTotal' => 3, 'gIndex' => 0),
      array('id' => '20', 'name' => 'asuncion',         'gTotal' => 3, 'gIndex' => 1),
      array('id' => '20', 'name' => 'asuncion',         'gTotal' => 3, 'gIndex' => 2),
    );
  }
  $lastmod = date('Y-m-d');
  $data      = array();
  $refType   = UrlGenerator::NETWORK_PATH;
  $baseUrl   = "https:";
  $paramQ    = NULL;

  // Get data
  $params = array('q'=>'zl');
  $raw = $app['api_caller']->call(APICallerService::GM_SITEMAPHELPER, $params, FALSE, TRUE);
  $raw = json_decode($raw, true);
  if ($raw['outcode'] != 0){
    throw new Exception('DATA NOT AVAILABLE');
  }

  // Start generating XML Data
  // Locales X departamento
  foreach ($deptos as $dept) {
    $url = $baseUrl.$app['url_generator']->generate('smap-loc', array(
      'deptName' => Util::slugify($dept['name']),
      'deptId'   => $dept['id'],
      'gTotal'   => $dept['gTotal'],
      'gIndex'   => $dept['gIndex']
    ), $refType);
    $data[] = array('lastmod' => $lastmod, 'url' => $url);
  }
  // Rubros X zona
  foreach ($raw['r'] as $zone) {
    $url = $baseUrl.$app['url_generator']->generate('smap-rz', array(
      'zoneName' => Util::slugify($zone[1]),
      'zipCode'  => $zone[0]
    ), $refType);
    $data[] = array('lastmod' => $lastmod, 'url' => $url);
  }
  // Rubros
  $url = $baseUrl.$app['url_generator']->generate('smap-r', array(), $refType);
  $data[] = array('lastmod' => $lastmod, 'url' => $url);
  // Galerias
  $url = $baseUrl.$app['url_generator']->generate('smap-g', array(), $refType);
  $data[] = array('lastmod' => $lastmod, 'url' => $url);
  // Zonas
  $url = $baseUrl.$app['url_generator']->generate('smap-z', array(), $refType);
  $data[] = array('lastmod' => $lastmod, 'url' => $url);
  // Promos
  $url = $baseUrl.$app['url_generator']->generate('smap-p', array(), $refType);
  $data[] = array('lastmod' => $lastmod, 'url' => $url);
  // Promos
  $url = $baseUrl.$app['url_generator']->generate('smap-v', array(), $refType);
  $data[] = array('lastmod' => $lastmod, 'url' => $url);

  // Set XML header
  $headerXml = '<sitemapindex xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  $footerXml = '</sitemapindex>';

  // Render XML
  return new Response($app['twig']->render('sitemapCreator.xml.twig', array(
    'data'      => $data, 
    'paramQ'    => $paramQ, 
    'headerXml' => $headerXml, 
    'footerXml' => $footerXml)), 200, array('Content-Type' => 'application/xml; charset=utf-8')
  );
});

// Locales por departamento
$sitemapCreator->get('/smap/loc/{deptName}/{deptId}/{gTotal}/{gIndex}', function(Request $request, $deptName, $deptId, $gTotal, $gIndex) use ($app) {
  $refType    = UrlGenerator::NETWORK_PATH;
  $baseUrl    = "https:";
  $changefreq = 'weekly';
  $priority   = '0.5';
  $lastmod    = date('Y-m-d');
  $paramQ     = 'loc';

  // Get data
  $params = array(
    'q'  => 'loc', 
    'd'  => $deptId,
    'gt' => $gTotal,
    'gi' => $gIndex);
  $raw = $app['api_caller']->call(APICallerService::GM_SITEMAPHELPER, $params, FALSE, TRUE);
  $raw = json_decode($raw, true);
  if ($raw['outcode'] != 0){
    throw new Exception('DATA NOT AVAILABLE');
  }

  // Start generating XML Data
  $data = array();
  foreach ($raw['r'] as $loc) {
    $locId = 'LOC'. strval( (intval($loc[0])*10000) + intval($loc[1]) );
    $url = $baseUrl.$app['url_generator']->generate('comercio', array('comercioNombre' => Util::slugify($loc[2]), 'id' => $locId), $refType);
    $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);
  }

  // Set XML header
  $headerXml = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  $footerXml = '</urlset>';

  // Render XML
  return new Response($app['twig']->render('sitemapCreator.xml.twig', array(
    'data'      => $data, 
    'paramQ'    => $paramQ, 
    'headerXml' => $headerXml, 
    'footerXml' => $footerXml)), 200, array('Content-Type' => 'application/xml; charset=utf-8')
  );

})->bind('smap-loc');

// Rubros por departamento
$sitemapCreator->get('/smap/rz/{zoneName}/{zipCode}', function(Request $request, $zoneName, $zipCode) use ($app) {
  $refType    = UrlGenerator::NETWORK_PATH;
  $baseUrl    = "https:";
  $changefreq = 'weekly';
  $priority   = '0.5';
  $lastmod    = date('Y-m-d');
  $paramQ     = 'rz';

  // Get data
  $params = array('q'=>'rz', 'z' => $zipCode);
  $raw = $app['api_caller']->call(APICallerService::GM_SITEMAPHELPER, $params, FALSE, TRUE);
  $raw = json_decode($raw, true);
  if ($raw['outcode'] != 0){
    throw new Exception('DATA NOT AVAILABLE');
  }
  
  // Start generating XML Data
  $data = array();
  foreach ($raw['r'] as $rzItem) {
    $url = $baseUrl.$app['url_generator']->generate('rubroZona', array(
      'zonaNombre'  => $zoneName, 
      'rubroNombre' => Util::slugify($rzItem[1]), 
      'rubroId'     => $rzItem[0], 
      'zonaId'      => $zipCode, 
    ), $refType);
    $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);
  }

  // Set XML header
  $headerXml = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  $footerXml = '</urlset>';

  // Render XML
  return new Response($app['twig']->render('sitemapCreator.xml.twig', array(
    'data'      => $data, 
    'paramQ'    => $paramQ, 
    'headerXml' => $headerXml, 
    'footerXml' => $footerXml)), 200, array('Content-Type' => 'application/xml; charset=utf-8')
  );
})->bind('smap-rz');

// Rubros
$sitemapCreator->get('/smap/r', function(Request $request) use ($app) {
  $refType    = UrlGenerator::NETWORK_PATH;
  $baseUrl    = "https:";
  $changefreq = 'weekly';
  $priority   = '0.5';
  $lastmod    = date('Y-m-d');
  $paramQ     = 'rz';

  // Get data
  $params = array('q'=>'r');
  $raw = $app['api_caller']->call(APICallerService::GM_SITEMAPHELPER, $params, FALSE, TRUE);
  $raw = json_decode($raw, true);
  if ($raw['outcode'] != 0){
    throw new Exception('DATA NOT AVAILABLE');
  }
  
  // Start generating XML Data
  $data = array();
  foreach ($raw['r'] as $rzItem) {
    $url = $baseUrl.$app['url_generator']->generate('rubro', array(
      'rubroNombre' => Util::slugify($rzItem[1]), 
      'rubroId'     => $rzItem[0], 
    ), $refType);
    $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);
  }

  // Set XML header
  $headerXml = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  $footerXml = '</urlset>';

  // Render XML
  return new Response($app['twig']->render('sitemapCreator.xml.twig', array(
    'data'      => $data, 
    'paramQ'    => $paramQ, 
    'headerXml' => $headerXml, 
    'footerXml' => $footerXml)), 200, array('Content-Type' => 'application/xml; charset=utf-8')
  );
})->bind('smap-r');

// Galerias
// OJO ===========> ALGUNAS GALERIAS YA NO EXISTEN, O NO ESTAN PAGANDO, QUE HACMOS?
$sitemapCreator->get('/smap/g', function(Request $request) use ($app) {
  $refType    = UrlGenerator::NETWORK_PATH;
  $baseUrl    = "https:";
  $changefreq = 'weekly';
  $priority   = '0.5';
  $lastmod    = date('Y-m-d');
  $paramQ     = 'g';

  // Get data
  $params = array('q'=>'g');
  $raw = $app['api_caller']->call(APICallerService::GM_SITEMAPHELPER, $params, FALSE, TRUE);
  $raw = json_decode($raw, true);
  if ($raw['outcode'] != 0){
    throw new Exception('DATA NOT AVAILABLE');
  }
  
  // Start generating XML Data
  $data = array();
  foreach ($raw['r'] as $gItem) {
    $locId = strval( (intval($gItem[1])*10000) + intval($gItem[2]) );
    $url = $baseUrl.$app['url_generator']->generate('galeria', array(
      'comercioNombre' => Util::slugify($gItem[3]), 
      'id'             => $locId, 
      'idg'            => $gItem[0], 
    ), $refType);
    $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);
  }

  // Set XML header
  $headerXml = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  $footerXml = '</urlset>';

  // Render XML
  return new Response($app['twig']->render('sitemapCreator.xml.twig', array(
    'data'      => $data, 
    'paramQ'    => $paramQ, 
    'headerXml' => $headerXml, 
    'footerXml' => $footerXml)), 200, array('Content-Type' => 'application/xml; charset=utf-8')
  );
})->bind('smap-g');

// Zona
$sitemapCreator->get('/smap/z', function(Request $request) use ($app) {
  $refType    = UrlGenerator::NETWORK_PATH;
  $baseUrl    = "https:";
  $changefreq = 'weekly';
  $priority   = '0.5';
  $lastmod    = date('Y-m-d');
  $paramQ     = 'rz';

  // Get data
  $params = array('q'=>'zl');
  $raw = $app['api_caller']->call(APICallerService::GM_SITEMAPHELPER, $params, FALSE, TRUE);
  $raw = json_decode($raw, true);
  if ($raw['outcode'] != 0){
    throw new Exception('DATA NOT AVAILABLE');
  }
  
  // Start generating XML Data
  $data = array();
  foreach ($raw['r'] as $rzItem) {
    $url = $baseUrl.$app['url_generator']->generate('zona', array(
      'zonaNombre' => Util::slugify($rzItem[1]), 
      'zonaId'     => $rzItem[0], 
    ), $refType);
    $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);
  }

  // Set XML header
  $headerXml = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  $footerXml = '</urlset>';

  // Render XML
  return new Response($app['twig']->render('sitemapCreator.xml.twig', array(
    'data'      => $data, 
    'paramQ'    => $paramQ, 
    'headerXml' => $headerXml, 
    'footerXml' => $footerXml)), 200, array('Content-Type' => 'application/xml; charset=utf-8')
  );
})->bind('smap-z');

// Promos
$sitemapCreator->get('/smap/p', function(Request $request) use ($app) {
  $refType    = UrlGenerator::NETWORK_PATH;
  $baseUrl    = "https:";
  $changefreq = 'weekly';
  $priority   = '0.5';
  $lastmod    = date('Y-m-d');
  $paramQ     = 'rz';

  // Get data
  $params = array('q'=>'p');
  $raw = $app['api_caller']->call(APICallerService::GM_SITEMAPHELPER, $params, FALSE, TRUE);
  $raw = json_decode($raw, true);
  if ($raw['outcode'] != 0){
    throw new Exception('DATA NOT AVAILABLE');
  }
  
  // Start generating XML Data
  $data = array();
  foreach ($raw['r'] as $rzItem) {
    $url = $baseUrl.$app['url_generator']->generate('promocionesFicha', array(
      'promoNombre' => Util::slugify($rzItem[1]), 
      'promoId'     => $rzItem[0], 
    ), $refType);
    $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);
  }

  // Set XML header
  $headerXml = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  $footerXml = '</urlset>';

  // Render XML
  return new Response($app['twig']->render('sitemapCreator.xml.twig', array(
    'data'      => $data, 
    'paramQ'    => $paramQ, 
    'headerXml' => $headerXml, 
    'footerXml' => $footerXml)), 200, array('Content-Type' => 'application/xml; charset=utf-8')
  );
})->bind('smap-p');

// Video
// OJO ===========> ALGUNAS GALERIAS YA NO EXISTEN, O NO ESTAN PAGANDO, QUE HACMOS?
$sitemapCreator->get('/smap/v', function(Request $request) use ($app) {
  $refType    = UrlGenerator::NETWORK_PATH;
  $baseUrl    = "https:";
  $changefreq = 'weekly';
  $priority   = '0.5';
  $lastmod    = date('Y-m-d');
  $paramQ     = 'g';

  // Get data
  $params = array('q'=>'v');
  $raw = $app['api_caller']->call(APICallerService::GM_SITEMAPHELPER, $params, FALSE, TRUE);
  $raw = json_decode($raw, true);
  if ($raw['outcode'] != 0){
    throw new Exception('DATA NOT AVAILABLE');
  }
  
  // Start generating XML Data
  $data = array();
  foreach ($raw['r'] as $vItem) {
    if ($vItem[2] == 0) $vItem[2] = 1;
    $locId = strval( (intval($vItem[1])*10000) + intval($vItem[2]) );
    $url = $baseUrl.$app['url_generator']->generate('video', array(
      'comercioNombre' => Util::slugify($vItem[3]), 
      'id'             => $locId, 
      'idv'            => $vItem[0], 
    ), $refType);
    $data[] = array('lastmod' => $lastmod, 'priority' => $priority, 'changefreq' => $changefreq, 'url' => $url, 'priority' => $priority);
  }

  // Set XML header
  $headerXml = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  $footerXml = '</urlset>';

  // Render XML
  return new Response($app['twig']->render('sitemapCreator.xml.twig', array(
    'data'      => $data, 
    'paramQ'    => $paramQ, 
    'headerXml' => $headerXml, 
    'footerXml' => $footerXml)), 200, array('Content-Type' => 'application/xml; charset=utf-8')
  );
})->bind('smap-v');


return $sitemapCreator;
