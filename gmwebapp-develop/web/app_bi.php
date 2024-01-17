<?php

set_time_limit(60);
ini_set('default_socket_timeout', 5);
date_default_timezone_set('America/Asuncion');
setlocale(LC_ALL, 'es_ES');

define('APPLICATION_ENV', 'production_bi');
define('COUNTRY', 'PY');

//
// FACEBOOK BOT PROTECTION
//
define( 'FACEBOOK_REQUEST_THROTTLE', 2.0 ); // Number of seconds permitted between each hit from facebookexternalhit
if( !empty( $_SERVER['HTTP_USER_AGENT'] ) 
    && preg_match( '/^facebookexternalhit|petalbot/', $_SERVER['HTTP_USER_AGENT'] ) 
    ) {
    $fbTmpFile = sys_get_temp_dir().'/facebookexternalhit.txt';
    if( $fh = fopen( $fbTmpFile, 'c+' ) ) {
        $lastTime = fread( $fh, 100 );
        $microTime = microtime( TRUE );
        // check current microtime with microtime of last access
        if( $microTime - $lastTime < FACEBOOK_REQUEST_THROTTLE ) {
            // bail if requests are coming too quickly with http 503 Service Unavailable
            header( $_SERVER["SERVER_PROTOCOL"].' 503' );
            die;
        } else {
            // write out the microsecond time of last access
            rewind( $fh );
            fwrite( $fh, $microTime );
        }
        fclose( $fh );
    } else {
        header( $_SERVER["SERVER_PROTOCOL"].' 503' );
        die;
    }
}


// Load the libraries, controllers and calsses
require_once __DIR__ . '/../vendor/autoload.php';

// Create the application
$app = require_once __DIR__ . '/../app/bootstrap.php';
require_once __DIR__ . '/../src/app.php';

//$app['redis']->flushAll();

$app->run();

//$app['redis']->flushAll();
