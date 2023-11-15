<?php

use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Util;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

$orderMenu = $app['controllers_factory'];

// UBERTO | PEDIDOS
// Solicita el comienzo de un pedido.
// Solo pide un token y redirecciona al usuario al vista con IDR + IDS + TOKEN
//
$orderMenu->get('/pedir/{nam}/{idr}/{ids}', function(Request $request, $nam, $idr, $ids) use ($app) {

    // 
    // Prepare request
    //
    $limit    = 12;
    $page     = $request->query->get('p', 1);
    $dtToken  = $app['api_caller']->getDeviceToken($app);
    $pageBack = $page - 1;
    $pageNext = $page + 1;
    $pageAux  = $page - 1;
    $offset   = $limit * $pageBack;
    $filter   = $request->query->get('f', '');
    $token    = $request->query->get('t', '');

    // validate filter
    $arrFilter = explode('|', $filter);
    if (count($arrFilter) > 1){
        $filter = $arrFilter[1];
    }else{
        $filter = '';
    }

    $result = $app['uberto_api_caller']->orderStart2(array(
        'idr'               => $idr, 
        'ids'               => $ids, 
        'deviceToken'       => $dtToken,
        'token'             => $token,
        'limit'             => $limit, 
        'offset'            => $offset, 
        'catId'             => null, 
        'groupId'           => $filter, 
        'userId'            => null, 
        'highlightFistPage' => 1, 
        'highlightRest'     => 1
    ), true);

    // Check valid token
    if ($result->meta->status == 422){
        // Token is checked out!
        // Redirect to view: /pedidos/pedido/55db80c2732120226718b65ca7ae49c9e616d0f981aac4707e?idr=52594&ids=1
        header("Location: /pedidos/pedido/{$token}?idr={$idr}&ids={$ids}");
        exit();
    }
    // All OK
    $data = $result->data;

    //
    // Check valid data
    //
    if (!property_exists($data, 'nam')){
      $idrids = ($idr*1000)+$ids;
      header("Location: /local/{$nam}/LOC{$idrids}");
      exit();
    }

    //
    // Prepare common data
    //
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

    // Add selected filter
    if (strlen($filter) > 0){
        $data->filteredGroup = new \stdClass();
        $data->filteredGroup->id = $filter;
        $data->filteredGroup->name = '';
        for($i=0;$i < count($data->groups); $i++){
            if ($data->groups[$i]->id == $filter){
                $data->filteredGroup->name = $data->groups[$i]->name;
                break;
            }
        }
    }

    //
    // Check tempate
    //
    if ($result->data->storeTemplate == 0){
        //
        // SMALL
        // ----------------------------------------------
        // Get label list
        $arrLabels     = array();
        $formatedPrice = '';
        $data->highlights = array();
        for($w=0; $w < count($data->glist); $w++){
          for($i=0; $i < count($data->glist[$w]->plist); $i++){
                          
            $formatedPrice = explode(',', number_format ($data->glist[$w]->plist[$i]->price, 2, "," , "."));
            $data->glist[$w]->plist[$i]->priceToShow         = $formatedPrice[0];
            $data->glist[$w]->plist[$i]->priceDecimalsToShow = ','.$formatedPrice[1];
            $data->glist[$w]->plist[$i]->priceCurrency       = '$U';
            // Process custom fields
            for($x=0; $x < count($data->glist[$w]->plist[$i]->customFields); $x++){
              if (property_exists($data->glist[$w]->plist[$i]->customFields[$x], 'icon')){
                $bFound = false;
                for ($z=0; $z < count($arrLabels); $z++){
                  if ($arrLabels[$z]->id == $data->glist[$w]->plist[$i]->customFields[$x]->id){
                    $bFound = true;
                    break;
                  }
                }
                if (!$bFound){
                  $label = new stdClass();
                  $label->id = $data->glist[$w]->plist[$i]->customFields[$x]->id;
                  $label->icon = $data->glist[$w]->plist[$i]->customFields[$x]->icon;
                  $label->color = $data->glist[$w]->plist[$i]->customFields[$x]->color;
                  $label->val = $data->glist[$w]->plist[$i]->customFields[$x]->val;
                  $arrLabels[] = $label;
                }
              }
            }

            // Check highlights
            if ($data->glist[$w]->plist[$i]->highlight == 1){
              $data->glist[$w]->plist[$i]->imageHSrc = $data->glist[$w]->plist[$i]->imageBasePath . 'thm-' . $data->glist[$w]->plist[$i]->imageName;
              $data->highlights[] = $data->glist[$w]->plist[$i];
            }
          }
        }

        // Force browser to not cache page
        header("Cache-Control: no-store, must-revalidate, max-age=0");
        header("Pragma: no-cache");
        
        return $app['twig']->render('uberto/storeSmall.html.twig', array(
            'data'        => $data, 
            'deviceToken' => $dtToken,
            'labels'      => $arrLabels));
        // SMALL END ----------------------------------------------
    }else{
        //
        // BIG
        // --------------------------------------------------------
        $data->limit    = $limit;
        $data->page     = $page;
        $data->filter   = $filter;
        $data->pageBack = $pageBack;
        $data->pageNext = $pageNext;
        $data->pageAux  = $pageAux;
        $data->offset   = $offset;
        $data->idr      = $idr;
        $data->ids      = $ids;
        if (!property_exists($data, 'token')){
            $data->token = '';
        }
        // Force browser to not cache page
        header("Cache-Control: no-store, must-revalidate, max-age=0");
        header("Pragma: no-cache");
                
        return $app['twig']->render('uberto/storeBig.html.twig', array(
            'data'        => $result->data, 
            'deviceToken' => $dtToken));
        // BIG END-------------------------------------------------
    }
    
    
})->bind('storeStart');

// UBERTO | PEDIDOS
// Vieja URL que redirige a la nueva
//
$orderMenu->get('/pedir/{nam}/{idr}/{ids}/{orderToken}', function($nam, $idr, $ids, $orderToken) use ($app) {
    
    header("Location: /pedir/{$nam}/{$idr}/{$ids}?t={$orderToken}");
    exit();

})->bind('orderMenuToken');

return $orderMenu;