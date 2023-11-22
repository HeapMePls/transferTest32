<?php

namespace EPD\Guia1122\Service;

use \Exception;
use \Redis;
use Monolog\Logger;
use Symfony\Component\HttpFoundation\Session\Session,
    Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Util\Util;

class UbertoAPICaller
{
    private $redis;
    private $logger;
    private $session;
    private $request;
    private $debug;

    public static $API_SERVER;
    public static $API_END_POINT;

    // const API_SERVER = 'https://empresas.1122.com.uy'; // PRODUCTION
    // const API_END_POINT = 'https://empresas.1122.com.uy/api/uberto'; // PRODUCTION
    
    // const API_SERVER = 'https://stg2.tingelmar.com'; // Staging DC
    // const API_END_POINT = 'https://stg2.tingelmar.com/api/uberto'; // Staging DC
    
    // const API_SERVER = 'http://localhost:3000'; // Local develep
    // const API_END_POINT = 'http://localhost:3000/api/uberto'; // Local develep
    //const API_END_POINT = '192.168.1.207:3000/api/uberto'; // Local develep

    // public function __construct(Redis $redis, Logger $logger, Session $session, Request $request, $debug)
    // {
    //     $this->redis = $redis;
    //     $this->logger = $logger;
    //     $this->session = $session;
    //     $this->request = $request;
    //     $this->debug = $debug;
    public function __construct($app){
      $this->redis       = $app['redis'];
      $this->logger      = $app['logger'];
      $this->session     = $app['session'];
      $this->request     = $app['request'];
      $this->debug       = $app['debug'];

      self::$API_SERVER    = $app['config']['ralapi.server'];
      self::$API_END_POINT = $app['config']['ralapi.endpoint'];
      
    }

    //
    // Dummy init in order to trigger singleton contructor
    //
    public function init(){
      return true;
    }

    private function sendPost($url, $data, $accessToken=NULL){
        try{
            $uri = self::$API_END_POINT . $url;
            $curl_post_data = json_encode($data);

            
            $headers = array( 'Content-Type:application/json');
            if ($accessToken != NULL){
                array_push($headers, 'Authorization:'.$accessToken);
                $this->logger->debug('APIU|POST|Sending request to ' . $uri . ' with header [Authorization:'.$accessToken.'] data [' . $curl_post_data . ']');
            }else{
                $this->logger->debug('APIU|POST|Sending request to ' . $uri . ' with data [' . $curl_post_data . ']');
            }
            

            $start = microtime(true);
            $curl = curl_init($uri);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_VERBOSE, 0);
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $curl_post_data);
            curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($curl, CURLOPT_TIMEOUT, 30);
            $curl_response = curl_exec($curl);
            $httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $curlErr  = curl_errno($curl);
            curl_close($curl);
            $finish = microtime(true);
            $this->logger->info('APIU|POST|'.round(($finish - $start), 4) . ' secs for '.$url.' ['. $httpcode .']');
            // Check HTTP Code
            if ($curlErr != 0){
                throw new Exception('APIU|POST|CURL failed with code ['.$curlErr.'] for ('.$uri.')');
            }
            if ($httpcode != 0 && $httpcode != 200){
                throw new Exception('APIU|POST|CURL failed with http status ['.$httpcode.'] for ('.$uri.')');
            }
            // Check response
            if ($curl_response === false) {
                $info = curl_getinfo($curl);
                curl_close($curl);
                $this->logger->error('APIU|POST|Error occured during curl exec. Additioanl info: ' . var_export($info));
                throw new Exception('APIU|POST|JSON is invalid for request ('.$uri.')');
            }
            // Check response
            $res = json_decode($curl_response);
            // if (isset($res->response->status) && $res->response->status == 'ERROR') {
            //     $this->logger->error('APIU|POST|Error occured: ' . $res->response->errormessage);
            //     throw new Exception('APIU|POST|JSON is invalid for request ('.$uri.')');
            // }
            $this->logger->debug('APIU|POST|Response['.$curl_response.']');
            return $res;
        }catch (Exception $ex) {
            $this->logger->error('APIU|POST|General exception:');
            $this->logger->error($ex->getMessage());
            return NULL;
        }
    }

    private function sendGet($url, $accessToken=NULL){
        try{
            $uri = self::$API_END_POINT . $url;
            $headers = array();

            if ($accessToken != NULL){
                array_push($headers, 'Authorization:'.$accessToken);
                $this->logger->debug('APIU|GET|Sending request to ' . $uri . ' with header [Authorization:'.$accessToken.']');
            }else{
                $this->logger->debug('APIU|GET|Sending request to ' . $uri);
            }

            $start = microtime(true);
            $curl = curl_init($uri);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_VERBOSE, 0);
            curl_setopt($curl, CURLOPT_TIMEOUT, 30);
            curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
            $curl_response = curl_exec($curl);
            if ($curl_response === false) {
                $info = curl_getinfo($curl);
                curl_close($curl);
                $this->logger->error('APIU|GET|Error occured during curl exec. Additional info: ' . json_encode($info));
                throw new Exception('APIU|GET|JSON is invalid for request ('.$uri.')');
            }
            $httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $curlErr  = curl_errno($curl);
            curl_close($curl);
            $finish = microtime(true);
            $this->logger->info('APIU|GET|'.round(($finish - $start), 4) . ' secs for '.$url.' ['. $httpcode .']');
            // Check HTTP Code
            if ($curlErr != 0){
                throw new Exception('APIU|GET|CURL failed with code ['.$curlErr.'] for ('.$uri.')');
            }
            if ($httpcode != 0 && $httpcode != 200){
                throw new Exception('APIU|GET|CURL failed with http status ['.$httpcode.'] for ('.$uri.')');
            }
            $this->logger->debug('APIU|GET| Response is >>>' . $curl_response . '<<<');
            $res = json_decode($curl_response);
            if (isset($res->response->status) && $res->response->status == 'ERROR') {
                $this->logger->error('APIU|GET|Error occured: ' . $res->response->errormessage);
                throw new Exception('APIU|GET|JSON is invalid for request ('.$uri.')');
            }
            return $res;
        }catch (Exception $ex) {
            $this->logger->error('APIU|GET|General exception:');
            $this->logger->error($ex->getMessage());
            throw $ex;
        }
    }

    //
    // GENERAL
    // 
    public function requestsList($deviceToken, $userId)  {
        $apiUrl = '/requestsList?' . http_build_query(array('deviceToken'=>$deviceToken, 'userId'=>$userId));
        $res = $this->sendGet($apiUrl);
        return $res;
    }

    public function requestsListGrouped($deviceToken, $accessToken)  {
        //$apiUrl = '/requestsListGrouped?' . http_build_query(array('deviceToken'=>$deviceToken, 'userId'=>$userId));
        $apiUrl = '/requestsListGrouped?' . http_build_query(array('deviceToken'=>$deviceToken));
        $res = $this->sendGet($apiUrl, $accessToken);
        return $res;
    }

    public function checkDeliveryCoverageZone($params){
        $apiUrl = '/checkDeliveryCoverageZone';
        $res = $this->sendPost($apiUrl, $params);
        return $res;
    }

    public function listDeliveryCoverage($idr, $ids){
        $apiUrl = '/listCoverageZone?' . http_build_query(array('idr'=>$idr, 'ids'=>$ids));
        $res = $this->sendGet($apiUrl);
        return $res;
    }

    //METODOS GET
   
    public function orderStart(array $params = array(), $forceCache = false){
        $res = null;
        if(isset($params['token'])){
            $apiUrl = '/orderStart' . '?idr=' . $params['idr'] . '&ids=' . $params['ids'] .  '&token=' . $params['token'];    
        }
        else{
            $apiUrl = '/orderStart' . '?idr=' . $params['idr'] . '&ids=' . $params['ids'];
        }
        $res = $this->sendGet($apiUrl);
        return $res;
    }

    public function orderStart2(array $params = array(), $forceCache = false){
        $apiUrl = '/orderStart2';
        if (isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
            $aToken = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
        }else{
            $aToken = null;
        }
        $res = $this->sendPost($apiUrl, $params, $aToken);
        return $res;
        
        // OLD STORE START
        /*$res = null;
        $apiUrl = '/storeStart' . '?idr=' . $params['idr'] . '&ids=' . $params['ids'];
        if(isset($params['token'])){
            if($params['token'] != null && $params['token'] != ''){
                $apiUrl .= '&token=' . $params['token'];    
            }
        }
        $apiUrl .= '&limit=' . $params['limit'] . '&offset=' . $params['offset'];
        if(isset($params['catId'])){
            if($params['catId'] != null && $params['catId'] != ''){
                $apiUrl .= '&catId=' . $params['catId'];    
            }       
        }
        
        if(isset($params['groupId'])){
            if($params['groupId'] != null && $params['groupId'] != ''){
                $apiUrl .= '&groupId=' . $params['groupId'];    
            }   
        }
        $apiUrl .= '&userId=' . $params['userId'] . '&deviceId=' . $params['deviceId'] . '&hlfirstpage=' . $params['hlfirstpage'] . '&hlrest=' . $params['hlrest'];
        $res = $this->sendGet($apiUrl);
        return $res;
        */
    }

    public function orderView($token){
        $res = null;
        $apiUrl = '/orderView' . '?token=' . $token;
        $res = $this->sendGet($apiUrl);
        return $res;
    }

    public function orderPreCheckout($token){
        $res = null;
        $apiUrl = '/orderPreCheckout' . '?token=' . $token;
        $res = $this->sendGet($apiUrl);
        return $res;
    }

    public function orderGetProductDetails(array $params = array(), $accesToken = false){
        $res = null;
        $apiUrl = '/orderGetProductDetails' . '?id=' . $params['id'] . '&deviceId=' . $params['deviceId'];
        if (array_key_exists('token', $params)){
            $apiUrl .= '&token='.$params['token'];
        }
        if (array_key_exists('idr', $params)){
            $apiUrl .= '&idr='.$params['idr'];
        }
        $res = $this->sendGet($apiUrl, $accesToken);
        return $res;
    }

    public function getOrderItem($params){
        $res = null;
        $apiUrl = '/getOrderItem';
        $res = $this->sendPost($apiUrl, $params);
        return $res;
    }

    public function doOrderReview($params){
        $res = null;
        $apiUrl = '/doOrderReview';
        $res = $this->sendPost($apiUrl, $params);
        return $res;
    }

    //METODOS POST    
    
    public function sendRequest(array $params = array()){
        $apiUrl = '/sendRequest';
        $res = $this->sendPost($apiUrl, $params);
        return $res;
    }

    public function orderAddProduct($params, $accessToken){
        $apiUrl = '/orderAddProduct';
        $res = $this->sendPost($apiUrl, $params, $accessToken);
        return $res;
    }

    public function orderCheckout($params){
        $apiUrl = '/orderCheckout';
        $res = $this->sendPost($apiUrl, $params);
        return $res;
    }

    public function orderRemoveProduct($params){
        $apiUrl = '/orderRemoveProduct';
        $res = $this->sendPost($apiUrl, $params);
        return $res;
    }
    
    public function orderEditProduct($params){
        $apiUrl = '/orderEditProduct';
        $res = $this->sendPost($apiUrl, $params);
        return $res;
    }

    public function checkSelectedVariation($params){
        $apiUrl = '/checkSelectedVariation';
        $res = $this->sendPost($apiUrl, $params);
        return $res;
    }

    //
    // QUOTE API
    //
    public function quoteStart($idr, $ids, $token)  {
        $apiUrl = '/quoteStart?idr='.$idr.'&ids='.$ids.'&token='.$token;
        $res = $this->sendGet($apiUrl);
        return $res;
    }

    public function quoteRequest($params)  {
        $apiUrl = '/quoteRequest';
        if (isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
            $aToken = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
        }else{
            $aToken = null;
        }
        $res = $this->sendPost($apiUrl, $params, $aToken);
        return $res;
    }

    public function quoteView($token) {
        $params = array('token'=>$token);
        $apiUrl = '/getQuoteStatus';
        $res = $this->sendPost($apiUrl, $params);
        return $res;
    }

    public function quoteAccept($token, $respId) {
        $params = array('token'=>$token, 'responseId'=>$respId);
        $apiUrl = '/quoteAccept';
        $res = $this->sendPost($apiUrl, $params);
        return $res;
    }

    public function doQuoteReview($params){
        $res = null;
        $apiUrl = '/doQuoteReview';
        $res = $this->sendPost($apiUrl, $params);
        return $res;
    }


    //
    // USER METHODS
    //
    
    public function getUserData($deviceToken, $flag){
      
      // UserData returned is:
      //  - token (AccessToken from RAL Server)
      //  - mdn (user's mobile)
      //  - mail (user's email and username)
      //  - nick (user's name)
      //  - favs (user's saved stores)
      //    - ...
      //  - bkms (user's saved bookmarks)

      // FOR TESTING PURPOSES ONLY !!
      $force_cookie = FALSE;

      // CHECK FOR BOTS AND SKIP !!
      if (Util::checkBot()){
        return NULL;
      }
      
      if($flag == false){
        // Check already loaded client data
        if (!$force_cookie && $this->session->has(APICallerService::CLIENT_DATA_SESSION)) {
            $this->logger->info('APIU|getClientData|Found client data at session');
            $usr = $this->session->get(APICallerService::CLIENT_DATA_SESSION);
            if($usr == null){
                // Check for user token
                if (isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
                    $aToken = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
                    $this->logger->info('APIU|getClientData|No session data found, requesting info from server with AT ' . $aToken . '...');
                }else{
                    $aToken = null;
                    $this->logger->info('APIU|getClientData|No session data found, requesting info from server with DT ' . $deviceToken . '...');
                }
                return $this->callClientData($deviceToken, $aToken);
            }
            else{
                return $usr;
            }
        }else{
            // Check for user token
            if (isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
                $aToken = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
                $this->logger->info('APIU|getClientData|No session data found, requesting info from server with AT ' . $aToken . '...');
            }
            else{
                $aToken = null;
                $this->logger->info('APIU|getClientData|No session data found, requesting info from server with DT ' . $deviceToken . '...');
            }
            return $this->callClientData($deviceToken, $aToken);
        }
      }else{
        $this->logger->info('APIU|getClientData|Forced server...');
        // Check for user token
        if (isset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN])) {
            $aToken = $_COOKIE[APICallerService::$COOKIE_USER_TOKEN];
            $this->logger->info('APIU|getClientData|No session data found, requesting info from server with AT ' . $aToken . '...');
        }
        else{
            $aToken = null;
            $this->logger->info('APIU|getClientData|No session data found, requesting info from server with DT ' . $deviceToken . '...');
        }
        return $this->callClientData($deviceToken, $aToken);
      }

      
    }

    public function callClientData($deviceToken, $aToken){
      //
      // Force load of client data
      //
      $params = array('deviceToken'=> $deviceToken);
      $apiUrl = '/getClientData';
      $res = $this->sendPost($apiUrl, $params, $aToken);
      if ($res != NULL){
        if ($res->meta->rescode == 0){
            $this->logger->info('APIU|callClientData|Setting new client data for device ' . $deviceToken);
            $this->session->set(APICallerService::CLIENT_DATA_SESSION, $res->data);
            return $res->data;
        }else{
            $this->logger->error('APIU|callClientData|Returned error ' . $res->meta->rescode . ' (' . $res->meta->msg . ') Will reset user cookie');
            unset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN]);
            setcookie(APICallerService::$COOKIE_USER_TOKEN, '', time() - 3600, '/');
            return NULL;
        }
      }else{
        $this->logger->error('APIU|callClientData|Server seems unavailable! Will reset user cookie');
        unset($_COOKIE[APICallerService::$COOKIE_USER_TOKEN]);
        setcookie(APICallerService::$COOKIE_USER_TOKEN, '', time() - 3600, '/');
        return NULL;
      }
    }

}
