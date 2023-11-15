<?php

use Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Service\APICallerService;
use EPD\Guia1122\Util\Util;

$quoteViewComponent = $app['controllers_factory'];

// UBERTO | PRESUPUESTOS
// Visualiza un presupuesto y sus respuestas
// Usado dentro de Reveal y en views/uberto/quoteView
//
$quoteViewComponent->get('/components/pedidos/presupuesto/{token}', function($token) use ($app) {

    // Get quote data
    $errMsg   = NULL;
    $reqData  = $app['uberto_api_caller']->quoteView($token);
    $viewData = NULL;
    if ($reqData != NULL){
        if ($reqData->meta->status != 200){
            $app['logger']->error('QUOTEVIEW | Error requesting quoteStatus for token ' . $token . ' Error was: ***' . json_encode($reqData) . '***');
            $reqData = NULL;
        }
    }
    
    if ($reqData != NULL){
        // Check scheduled date
        if ($reqData->data->scheduleType == 4){
            $reqData->data->scheduleValue = json_decode($reqData->data->scheduleValue);
            $mScheduleValue = new \Moment\Moment(str_replace('/','-',$reqData->data->scheduleValue->date).'T00:00:00');
            $reqData->data->scheduleValue = 'En esta fecha: ' . $mScheduleValue->format('D d-M-Y');
        }

        // Beautify dates
        $tempDate = new \Moment\Moment($reqData->data->dateFrom, 'UTC');
        $reqData->data->dateFromNice = $tempDate->calendar();
        for($i=0;$i<count($reqData->data->responses);$i++){
            $tempDate = new \Moment\Moment($reqData->data->responses[$i]->dateFrom, 'UTC');
            $reqData->data->responses[$i]->dateFromNice = $tempDate->calendar();
            if (property_exists($reqData->data->responses[$i], 'review')){
                if ($reqData->data->responses[$i]->review != NULL){
                    $tempDate = new \Moment\Moment($reqData->data->responses[$i]->review->date, 'UTC');
                    $reqData->data->responses[$i]->review->dateNice = $tempDate->calendar();
                }
            }
            if (strlen($reqData->data->responses[$i]->estimatedTime) > 0){
                $reqData->data->responses[$i]->estimatedTimeNice = Util::buildNiceEstimatedMinsTime($reqData->data->responses[$i]->estimatedTime);
            }
        }

        $reqData->data->token = $token;

        $viewData = $reqData->data;
    }else{
        $app['logger']->error('QUOTEVIEW | Could not retrieve data for quote token ' . $token);
        $errMsg = "No es posible visualizar los detalles del presupuesto en este momento";
    }

    // print_r($viewData);
    // die();

    // Render quote view page
    return $app['twig']->render('components/uberto/quoteView.html.twig', array(
        'request' => $viewData,
        'errMsg'  => $errMsg
    ));

})->bind('quoteViewComponent');

return $quoteViewComponent;