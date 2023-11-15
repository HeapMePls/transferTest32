<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use EPD\Guia1122\Util\Util;

$pushPackage = $app['controllers_factory'];

$pushPackage->post('/v1/pushPackages/{websitePushID}', function(Request $request, $websitePushID) use ($app) {
  $logger = $app['logger'];
  $postData   = $request->getContent();
  $data = json_decode($postData);

  $cert_path     = __DIR__. "/../Resources/PushPackage/WebPush1122.p12";  
  $cert_password = "pushache"; 
  $id            = $data->id;

  $logger->debug("pushPackages|Package requested with id = " . $id);

  // 0. Create base dir
  $package_dir = '/tmp/pushPackage' . date('Ymd');
  if (file_exists($package_dir.".zip")){
    $logger->debug("pushPackages| Found HIT file {$package_dir}.zip, returning it...");
    $response = new Response(file_get_contents($package_dir.".zip"));
    $response->headers->set('Content-Type', 'application/zip');
    $response->headers->set('Content-length', filesize($package_dir.".zip"));
    return $response;
  }
  if (!mkdir($package_dir)) {
    $logger->error("pushPackages|Could not create tmp directory!");
    unlink($package_dir);
    $response = new Response();
    $response->setStatusCode(500);
    return $response;
  }

  // 1. copy_raw_push_package_files($package_dir, $id);
  // Base files
  $baseRawFiles = array(
    'icon.iconset/icon_16x16.png',
    'icon.iconset/icon_16x16@2x.png',
    'icon.iconset/icon_32x32.png',
    'icon.iconset/icon_32x32@2x.png',
    'icon.iconset/icon_128x128.png',
    'icon.iconset/icon_128x128@2x.png',
    'website.json'
  );

  // Copy files to build
  mkdir($package_dir . '/icon.iconset');
  foreach ($baseRawFiles as $raw_file) {
    copy(__DIR__.'/../Resources/PushPackage/'.$raw_file, "$package_dir/$raw_file");
		if($raw_file == "website.json") {
			$wjson = file_get_contents("$package_dir/$raw_file");
			unlink("$package_dir/$raw_file");
			$ff = fopen("$package_dir/$raw_file", "x");
			fwrite($ff, str_replace("{AUTHTOKEN}", "authenticationToken_".$id, $wjson)); // we have to add "authenticationToken_" because it has to be at least 16 for some reason thx apple
			fclose($ff);
		}
  }

  // 2. create_manifest($package_dir);
  $manifest_data = array();
  foreach ($baseRawFiles as $raw_file) {
      $manifest_data[$raw_file] = sha1(file_get_contents("$package_dir/$raw_file"));
  }
  file_put_contents("$package_dir/manifest.json", json_encode((object)$manifest_data));


  // 3. create_signature($package_dir, $certificate_path, $certificate_password);
  // Load the push notification certificate
  $pkcs12 = file_get_contents($cert_path);
  $certs = array();
  if(!openssl_pkcs12_read($pkcs12, $certs, $cert_password)) {
      $logger->error("pushPackages|Could not open certificate at [".$cert_path."]!");
      $response = new Response();
      $response->setStatusCode(500);
      return $response;
  }
  $signature_path = "$package_dir/signature";
  // Sign the manifest.json file with the private key from the certificate
  $cert_data = openssl_x509_read($certs['cert']);
  $private_key = openssl_pkey_get_private($certs['pkey'], $cert_password);
  openssl_pkcs7_sign("$package_dir/manifest.json", $signature_path, $cert_data, $private_key, array(), PKCS7_BINARY | PKCS7_DETACHED);
  // Convert the signature from PEM to DER
  $signature_pem = file_get_contents($signature_path);
  $matches = array();
  if (!preg_match('~Content-Disposition:[^\n]+\s*?([A-Za-z0-9+=/\r\n]+)\s*?-----~', $signature_pem, $matches)) {
      $logger->error("pushPackages|Could not convert signature!");
      $response = new Response();
      $response->setStatusCode(500);
      return $response;
  }
  $signature_der = base64_decode($matches[1]);
  file_put_contents($signature_path, $signature_der);


  // 4. $package_path = package_raw_data($package_dir);
  $zip_path = "$package_dir.zip";
  // Package files as a zip file
  $zip = new ZipArchive();
  if (!$zip->open("$package_dir.zip", ZIPARCHIVE::CREATE)) {
      $logger->error("pushPackages|Could not create zip file at [".$zip_path."]!");
      $response = new Response();
      $response->setStatusCode(500);
      return $response;
  }
  $raw_files = $baseRawFiles;
  $raw_files[] = 'manifest.json';
  $raw_files[] = 'signature';
  foreach ($raw_files as $raw_file) {
      $zip->addFile("$package_dir/$raw_file", $raw_file);
  }
  $zip->close();
  

  // 5. $package_path = create_push_package();
  $package_path = $zip_path;

  $logger->debug("pushPackages| File {$package_path} generated OK");

  // Read file and return
  $response = new Response(file_get_contents($package_path));
  $response->headers->set('Content-Type', 'application/zip');
  $response->headers->set('Content-length', filesize($package_path));

  return $response;
});

$pushPackage->post('/v1/log', function(Request $request) use ($app) {
  $logger = $app['logger'];
  $postData   = $request->getContent();
  //$data = json_decode($postData);

  $logger->error("APN|Notification system error ***".$postData."***");

  $response = new Response();
  $response->setStatusCode(200);
  return $response;

});

$pushPackage->post('/v1/devices/{deviceToken}/registrations/{siteId}', function(Request $request, $deviceToken, $siteId) use ($app) {
  $logger = $app['logger'];
  $postData   = $request->getContent();
  //$data = json_decode($postData);
  $deviceId = $app['api_caller']->getDeviceId($app);

  $logger->error("APN|New device [" . $deviceId . "] registered with token " . $deviceToken);

  $response = new Response();
  $response->setStatusCode(200);
  return $response;

});

$pushPackage->delete('/v1/devices/{deviceToken}/registrations/{siteId}', function(Request $request, $deviceToken, $siteId) use ($app) {
  $logger = $app['logger'];
  $postData   = $request->getContent();
  //$data = json_decode($postData);
  $deviceId = $app['api_caller']->getDeviceId($app);

  $logger->error("APN|Device [" . $deviceId . "] got unregistered with token " . $deviceToken);

  $response = new Response();
  $response->setStatusCode(200);
  return $response;

});

return $pushPackage;