<?php

// This check prevents access to debug front controllers that are deployed by accident to production servers.
// Feel free to remove this, extend it, or make something more sophisticated.

/*
if (isset($_SERVER['HTTP_CLIENT_IP']) ||
        isset($_SERVER['HTTP_X_FORWARDED_FOR']) ||
        !(in_array(@$_SERVER['REMOTE_ADDR'], array('127.0.0.1', 'fe80::1', '127.0.0.1', '::1', '10.1.10.229', '190.0.151.66', '10.1.10.184', '10.1.1.145')) ||
        php_sapi_name() === 'cli-server')) {
    header('HTTP/1.0 404 Not Found');
    exit();
}
*/
ini_set('display_errors', 1);
error_reporting(-1);

//set_time_limit(60);
ini_set('default_socket_timeout', 5);
date_default_timezone_set('America/Montevideo');
setlocale(LC_ALL, 'es_ES');

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
            echo "SLOW DOWN (".$lastTime." | ".$microTime.")";
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


define('APPLICATION_ENV', 'dev');
define('COUNTRY', 'UY');

// Load the libraries, controllers and calsses
require_once __DIR__ . '/../vendor/autoload.php';

// Create the application
$app = require_once __DIR__ . '/../app/bootstrap.php';
require_once __DIR__ . '/../src/app.php';

$app['debug'] = true;

$app->run();
