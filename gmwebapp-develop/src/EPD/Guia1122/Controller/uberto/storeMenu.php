<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Util;

$storeMenu = $app['controllers_factory'];

// UBERTO | PEDIDOS
// Solicita el comienzo de un pedido.
// Solo pide un token y redirecciona al usuario al vista con IDR + IDS + TOKEN
//
$storeMenu->get('/storeold/{idr}/{ids}/{page}/{filter}', function(Request $request, $idr, $ids, $page, $filter) use ($app) {
    
    $limit = 20;
    $pageBack = $page - 1;
    $pageNext = $page + 1;
    $pageAux = $page - 1;
    $offset = $limit * $pageBack;
    $token = $request->query->get('token', '');
    $dtToken = $app['api_caller']->getDeviceToken($app);
    if($filter != 0){
        if($token != ''){
            $result = $app['uberto_api_caller']->orderStart2(array('idr' => $idr, 'ids' => $ids, 'limit' => $limit, 'offset' => $offset, 'catId' => null, 'groupId' => $filter, 'userId' => null, 'deviceId' => $dtToken, 'highlightFistPage' => 1, 'highlightRest' => 1, 'token' => $token), true);
        }
        else{
            $result = $app['uberto_api_caller']->orderStart2(array('idr' => $idr, 'ids' => $ids, 'limit' => $limit, 'offset' => $offset, 'catId' => null, 'groupId' => $filter, 'userId' => null, 'deviceId' => $dtToken, 'highlightFistPage' => 1, 'highlightRest' => 1), true);
        }
    }
    else{
        if($token != ''){
            $result = $app['uberto_api_caller']->orderStart2(array('idr' => $idr, 'ids' => $ids, 'limit' => $limit, 'offset' => $offset, 'catId' => null, 'groupId' => null, 'userId' => null, 'deviceId' => $dtToken, 'highlightFistPage' => 1, 'highlightRest' => 1, 'token' => $token), true);  
    
        }
        else{
            $result = $app['uberto_api_caller']->orderStart2(array('idr' => $idr, 'ids' => $ids, 'limit' => $limit, 'offset' => $offset, 'catId' => null, 'groupId' => null, 'userId' => null, 'deviceId' => $dtToken, 'highlightFistPage' => 1, 'highlightRest' => 1), true);  
    
        }
    }
    $data = $result->data;
    $data->limit = $limit;
    $data->page = $page;
    $data->filter = $filter;
    $data->pageBack = $pageBack;
    $data->pageNext = $pageNext;
    $data->pageAux = $pageAux;
    $data->offset = $offset;
    $data->idr = $idr;
    $data->ids = $ids;
    //$app['session']->set('storeStart', $result->data);

    // Beautify fields
    if (property_exists($data, 'avgTime') && $data->avgTime > 0){
        if ($data->avgTime < 60){
            $data->avgTimeNice = $data->avgTime;
            if ($data->avgTimeNice == 1){
                $data->avgTimeNice .= ' minuto';
            }else{
                $data->avgTimeNice .= ' minutos';
            }
        }else if ($data->avgTime >= 60 && $data->avgTime < 1440){
            $data->avgTimeNice = round($data->avgTime / 60);
            if ($data->avgTimeNice == 1){
                $data->avgTimeNice .= ' hora';
            }else{
                $data->avgTimeNice .= ' horas';
            }
        }else if ($data->avgTime > 1440){
            $data->avgTimeNice = round($data->avgTime / 60 / 24);
            if ($data->avgTimeNice == 1){
                $data->avgTimeNice .= ' día';
            }else{
                $data->avgTimeNice .= ' días';
            }
        }
    }
    
    if (property_exists($data, 'hours')){
        $today = intval(date('w'));
        $today = ($today == 0) ? 6 : $today-1;
        $data->hours      = Util::buildHoursProfileAsToday($today, $data->hours, $app);
        $today = 0; // After using buildHoursProfileAsToday, first element of hours table is today
        $data->hoursState = Util::checkOpen($today, $data->hours, $data->o24, $app);
    }

    // Force browser to not cache page
    header("Cache-Control: no-store, must-revalidate, max-age=0");
    header("Pragma: no-cache");
    
    return $app['twig']->render('uberto/storeMenu.html.twig', array(
        'data'        => $result->data, 
        'deviceToken' => $dtToken));
    
})->bind('storeMenuOld');


return $storeMenu;