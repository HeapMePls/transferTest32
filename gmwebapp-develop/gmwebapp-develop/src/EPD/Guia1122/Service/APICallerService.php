<?php

namespace EPD\Guia1122\Service;

use \Exception;
use \Redis;
use Monolog\Logger;
use Symfony\Component\HttpFoundation\Session\Session,
    Symfony\Component\HttpFoundation\Request;
use EPD\Guia1122\Util\Util;

class APICallerService{

    private $redis;
    private $logger;
    private $session;
    private $request;
    private $debug;
    //private $statsLogger;

    /* =============================== DEFINICION DE CONSTANTES =============================== */

        const EMPRESAS_STRING_COMERCIO = 'Empresas';
        // const SHARED_ID                = 'web1122';
        // const CACHE_KEY_PREFIX         = 'guia1122_tingelmar_api_';
        // const CACHE_KEY_PREFIX_NEW     = 'gmapi_';
        public static $SHARED_ID;
        public static $CACHE_KEY_PREFIX;
        public static $CACHE_KEY_PREFIX_NEW;
        public static $COUNTRY;
        
        const CACHE_TTL                = 3600;     // 1 hora de cache
        const CACHE_12_TTL             = 43200;    // 12 horas de cache
        const CACHE_24_TTL             = 86400;    // 24 horas de cache
        const CACHE_1W_TTL             = 604800;   // 1 semana de cache (86400*7)
        const CACHE_1M_TTL             = 2592000;  // 1 mes de cache (86400*30)

        // const API_END_POINT            = 'https://www.tingelmar.com/com/app/api.php'; //en producción
        // const API_END_POINT          = 'http://api.hidrogeno.com:16936/api.php'; //hidrogeno
        // const API_END_POINT          = 'https://www.tingelmar.com/stg/app/api.php'; //en desarrollo
        //const API_END_POINT          = 'https://api.tingelmar.com/stg/app/api.php'; //en desarrollo
        public static $API_END_POINT;
        const API_TIMEOUT              = 8;
        const API_RETRIES              = 1;

        //Actions
        const GM_QUERY                  = 'gmquery4';
        const GM_PROVEEDORES_ACCION     = 'gmsponsors';     /* para obtener los provedores */
        const GM_ZONAS_ACCION           = 'gmzone';         /* para obtener las zonas */
        const GM_RUBROS_ACCION          = 'gminfo';         /* para obtener los rubros */
        const GM_RUBRO_ZONA_ACCION      = 'gmquery';        /* para obtener los locales segun la zona y el rubro */
        const GM_COMERCIO_ACCION        = 'gmpiid7';        /* para obtener el local segun el id */
        const GM_PROMOCIONES_ACCION     = 'gmpromos';       /* para obtener las promociones */
        const GM_CATEGORIAS_ACCION      = 'gmpromocategs';  /* para obtener las categorias de promociones */
        const GM_REPORTAR_ERROR_ACCION  = 'feedback';       /* para enviar el reporte de error a la API */
        const GM_ADHERIR_COMERIO_ACCION = 'storeregreq';    /* para enviar pedido de registro de nuevo comerio en la API */
        const GM_RELATED_PRODS          = 'gmrelatedprods'; /* retorna lista de rubros seleccioandos para un rubro dado */
        const GM_FULL_GALLERY           = 'gmfullgal';      /* retorna la lista completa de una galeria de imagenes */
        const GM_FULL_VIDEO             = 'gmfullvid';      /* retorna el video solicitado */
        const GM_REGISTER0              = 'register0';      /* registra un dispositivo */
        const GM_REGISTER3              = 'register3';      /* registra un usuario */
        const GM_DEVICE_DATA_SET        = 'devicedataset';  /* guarda un valor para un dispositivo */
        const GM_HOME                   = 'gmhome7';        /* retorna contenido para home */
        const GM_CARTELERA              = 'gmbillboardhome';  /* retorna la home de cartelera */
        const GM_CARTELERA_VIEW         = 'gmbillboardevent'; /* retorna detalles de un evento */
        const GM_PROMO_HOME2_ACCION     = 'gmpromohome2';   /* home de promociones */
        const GM_CHECK_DIRECT_ACCESS    = 'gmcheckda';      /* direct access by name in url */
        const GM_LOGIN                  = 'login' ;         /* login */
        const GM_LOGOUT                 = 'logout' ;        /* logout */
        const GM_FORGOT_PASS            = 'forgotpass2';    /* sends password reset mail */
        const GM_FAVORITE               = 'favorite';       /* add/rem favorites */
        const GM_PRED                   = 'gmpred';         /* predictive products and zones */
        const GM_SITEMAPHELPER          = 'gmsmh';          /* Sitemap helper to get data for sitemap */
        const GM_FEED                   = 'gmfeed';
        const GM_FEED2                  = 'gmfeed2';
        const GM_RESERVE                = 'gmreserve';      /* Trae datos para reservas */
        const GM_GALLERIES              = 'gmgals';         /* Listado de galerias del negocio */
        const GM_RECOMMEND              = 'gmrecommend';    /* genera un comentario publico y un rating */
        const GM_REVIEWS                = 'gmreviews';      /* Listado de comentarios del negocio */
        const GM_CHECKUSER              = 'gmcheckuser';    /* Check if user email exists */
        const GM_RECOMENDANDREGISTER    = 'gmrcmndreg';     /* Same as gmrecommend plus register user */

        /* ============================== CONSTANTES URUGUAY =========================== */
        const URUGUAY_ID   = 'Z00001';
        const URUGUAY_TEXT = 'todo el pais';

        /* ============================== CANTIDAD MAXIMA DE ITEMS A DEVOLVER =========================== */
        //const MAX_RESULTADOS_RETORNADOS = 25;
        const MAX_RESULTADOS_RETORNADOS = 0;

        /* =============================== Webservices para obtener todos los locales con una caracteristica =============================== */
        // const TODAS_ZONAS               = 'uy';
        public static $TODAS_ZONAS;
        const TODOS_RUBROS              = 'PRD0';
        const MAX_RUBROS_RELACIONADOS   = 15;
        const RUBROS_RELACIONADOS_TIPOS = 'R|G|E|A';  /* Categorias de rubros relacionados ®ondy: R=Rubro G=Generico E=Especifico, O=Promo, A=Afinidad, C=Cartelera */
        //*===============================  Paginado Comercio ===============================*//
        const CANT_PAGINADO_COMERCIOS_BUSCADOR  = 10; /* hacer un offset del array para recorrer pagina,esta cantidad */
        const CANT_PAGINADO_COMERCIOS           = 10; /* hacer un offset del array para recorrer pagina,esta cantidad */
        const CANT_MAX_PAGINAS_RUBRO_ZONA       = 10;
        const CANT_MAX_PAGINAS_RUBRO            = 10;
        const CANT_MAX_PAGINAS_ZONA             = 10;
        const CANT_MAX_PAGINAS_BUSCADOR         = 10;
        const CANT_MAX_PAGINAS_TODAS_LAS_PROMOS = 5;
        const CANT_PAGINADO_TODAS_LAS_PROMOS    = 9;
        //*===============================  Tipos de promociones ===============================*//
        const PROMOCION_TIPO_TODAS       = 'all';
        const PROMOCION_TIPO_DESTACADAS  = 'highlight';
        const PROMOCION_POR_ID_PROMO     = 'promo';
        const PROMOCION_SPONSOR_GUIA     = '19719';
        //*=============================== Tipo de rubros destacados o todos  ===============================*//
        const RUBROS_TIPO_DESTACADOS     = 'mainProducts';
        const RUBROS_TIPO_TODOS          = 'productList';
        //*=============================== Otras constantes  ===============================*//
        const CANT_COMERCIOS_SIMILARES   = 3; /* cantidad de negocios similares que se muestran al lado del local seleccionado vista:comercio */
        //*=============================== Constantes Sitemap creator =======================*//
        const SITEMAP_CREATOR_TODAS_LAS_ZONAS   = 'allsite'; /* despliega todas las zonas */
        const SITEMAP_CREATOR_TODAS_LOS_RUBROS  = 'allcategory'; /* despliega todos los rubros */
        const SITEMAP_CREATOR_ZONA_RUBRO        = 'categoryzone'; /* despliega la pagina zonarubro */
        const SITEMAP_CREATOR_PAGINAS_ESTATICAS = 'staticpage'; /* despliega las paginas estaticas */
        const SITEMAP_CREATOR_SPONSORS          = 'soponsors'; /* despliega los soponsors */
        //*=============================== COOKIE KEYS =======================*//
        // const COOKIE_DEVICE_TOKEN = '_gmwa_dt';
        // const COOKIE_USER_TOKEN   = '_gmwa_ut';
        public static $COOKIE_DEVICE_TOKEN;
        public static $COOKIE_USER_TOKEN;
        const CLIENT_DATA_SESSION = 'clientData';

    /* =============================== tipso de avisos  ===============================
      1- Si sRnk == 0 => Nunca pago (titulo simple)
      2- Si sRnk > 0 & <= 1000 => Alguna vez pago pero esta vencido (titulo en negrita)
      3- Si sRnk > 1000 => Contrato active (titulo con Azul y negrita)
    */

    // public function __construct(Redis $redis, Logger $logger, Session $session, Request $request, $debug){
    //     $this->redis       = $redis;
    //     $this->logger      = $logger;
    //     //$this->statsLogger = $statsLogger;
    //     $this->session     = $session;
    //     $this->request     = $request;
    //     $this->debug       = $debug;
    //     $this->redisTTL    = self::CACHE_TTL;
    public function __construct($app){
      $this->redis       = $app['redis'];
      $this->logger      = $app['logger'];
      $this->session     = $app['session'];
      $this->request     = $app['request'];
      $this->debug       = $app['debug'];
      $this->redisTTL    = self::CACHE_TTL;

      self::$COUNTRY              = $app['config']['brand.country'];
      self::$SHARED_ID            = $app['config']['api.shared_id'];
      self::$CACHE_KEY_PREFIX     = $app['config']['api.shared_prefix_new'];
      self::$CACHE_KEY_PREFIX_NEW = $app['config']['api.shared_id'];
      self::$API_END_POINT        = $app['config']['api.endpoint'];
      self::$TODAS_ZONAS          = $app['config']['api.allzones'];
      self::$COOKIE_DEVICE_TOKEN  = $app['config']['api.devicetokenkey'];
      self::$COOKIE_USER_TOKEN    = $app['config']['api.usertokenkey'];

      $this->logger->debug('API|Setting userTokenKey as ' . $app['config']['api.usertokenkey']);
    }

    //
    // Dummy init in order to trigger singleton contructor
    //
    public function init(){
      return true;
    }

    public function call($action, array $params = array(), $forceCache = FALSE, $skipCache = FALSE, $accessToken=NULL){
        try {
            $res = null;

            if ($forceCache) {
                $id = self::$SHARED_ID;
            } else {
                if ($this->session->has('id')) {
                    $id = $this->session->get('id');
                } else {
                    $id = uniqid();
                    $this->session->set('id', $id);
                }
            }

            $params['id'] = $id;
            $params['action'] = $action;
            //$params['ishuman'] = (Util::isRobot($this->request->headers->get('User-Agent'))) ? 'N' : 'Y';

            $uri = self::$API_END_POINT . '?' . http_build_query($params);
            //echo $uri;

            if (!$skipCache){
                $key = $this->keyGenerator($uri);
                // New Smart Key Generator
                //$key = $this->keyGeneratorNew($uri, $params);
            }
            
            // //////////////////////////////////////////////////////////////
            // ///////////////////////////// WARNING !!!! \\\\\\\\\\\\\\\\\\\
            // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
            // !!!!! REMOVE THIS !!!!!
            // if ($action == 'gmhome5'){
                // $skipCache = TRUE;
            // }
            //$skipCache = TRUE;



            if (!$skipCache && $this->redis->exists($key)) {
                $this->logger->debug('REDIS|Cache HIT for ' . $action . ', key=['.$key.']');
                //$this->statsLogger->info('REDIS|Cache HIT for ' . $action . ', key=['.$key.']');
                $res = $this->redis->get($key);
            } else {
                if (!$skipCache){
                    $this->logger->debug('REDIS|Cache MISS for ' . $action . ', key=['.$key.']');
                    //$this->statsLogger->info('REDIS|Cache MISS for ' . $action . ', key=['.$key.']');
                }else{
                    $this->logger->debug('REDIS|Cache SKIPPED for ' . $action);
                    //$this->statsLogger->info('REDIS|Cache SKIPPED for ' . $action);
                }

                $start = microtime(true);
                $fc = curl_init();
                curl_setopt($fc, CURLOPT_URL, $uri);
                curl_setopt($fc, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($fc, CURLOPT_HEADER, 0);
                curl_setopt($fc, CURLOPT_VERBOSE, 0);
                curl_setopt($fc, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($fc, CURLOPT_TIMEOUT, self::API_TIMEOUT);

                // Add UA
                if (isset($_SERVER['HTTP_USER_AGENT'])){
                    curl_setopt($fc, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
                }
                // Prepare headers
                $headers   = array();
                $headers[] = 'X-Forwarded-For:'. $this->get_client_ip();
                if ($accessToken != NULL){
                  $headers[] = 'accessToken:'.$accessToken;
                }
                // Add RemoteAddr
                curl_setopt($fc, CURLOPT_HTTPHEADER, $headers);

                // Execute CURL and get output
                $retry = 0;
                $res = curl_exec($fc);
                $curlErr = curl_errno($fc);
                while($curlErr == 28 && $retry < self::API_RETRIES){
                    $this->logger->warning('API|CURL timedout! retry ' . ($retry+1) . ' of ' . self::API_RETRIES . '...');
                    $res = curl_exec($fc);
                    $curlErr = curl_errno($fc);
                    $retry++;
                }
                $httpcode = curl_getinfo($fc, CURLINFO_HTTP_CODE);
                $curlErr  = curl_errno($fc);
                curl_close($fc);

                $finish = microtime(true);

                // Log HTTP result
                if ($retry > 0){
                    $this->logger->warning('API|With ' . $retry . ' retries|'.round(($finish - $start), 4) . ' secs for '.$action.' ['. $httpcode .']: ' . $uri);
                }else{
                    $this->logger->info('API|'.round(($finish - $start), 4) . ' secs for '.$action.' ['. $httpcode .']: ' . $uri);
                }

                // Check CURL result
                if ($curlErr == 0){
                    // Check JSON
                    if (Util::isJsonValid($res)) {
                        $arrJson = json_decode($res);
                        // Check API response code
                        if ($arrJson->outcode === 0) {
                            // Store response at Redis Cache
                            if (!$skipCache){
                                $this->redis->setex($key, $this->redisTTL, $res);
                            }
                            return $res;
                        }else if ($arrJson->outcode == 153 ||
                                  $arrJson->outcode == 151 ||
                                  $arrJson->outcode == 142 || 
                                  $arrJson->outcode == 157 || 
                                  $arrJson->outcode == 166 || 
                                  $arrJson->outcode == 139 || 
                                  $arrJson->outcode == 158) {
                            return $res;
                        }else{
                            throw new Exception('API|Request returned error ' . $arrJson->outcode . ' (' . $arrJson->outmsg . ') for URI(' . $uri . ')');
                        }
                    }else{
                        $this->logger->error('API|JSON is not valid for >>>' . $res . '<<<');
                        throw new Exception('API|JSON is invalid for request ('.$uri.')');
                    }
                }else{
                    throw new Exception('API|CURL failed with code ['.$curlErr.'] for ('.$uri.')');
                }
            }

            return $res;
        } catch (Exception $ex) {
            $this->logger->error('API| Request raised exception:');
            $this->logger->error($ex->getMessage());

            throw $ex;
        }
    }

    public function callPost($action, $params = array(), $data){
        try {

            if ($this->session->has('id')) {
              $id = $this->session->get('id');
            } else {
              $id = uniqid();
              $this->session->set('id', $id);
            }
            $params['id'] = $id;
            $params['action'] = $action;

            $uri = self::$API_END_POINT . '?' . http_build_query($params);

            $res = null;

            $start = microtime(true);
            $fc = curl_init();
            curl_setopt($fc, CURLOPT_URL, $uri);
            curl_setopt($fc, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($fc, CURLOPT_HEADER, 0);
            curl_setopt($fc, CURLOPT_VERBOSE, 0);
            curl_setopt($fc, CURLOPT_POST, 1);
            curl_setopt($fc, CURLOPT_POSTFIELDS, $data);
            curl_setopt($fc, CURLOPT_HTTPHEADER, array( 'Content-Type:', 'application/json'));
            curl_setopt($fc, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($fc, CURLOPT_TIMEOUT, 60);
            // Execute CURL and get output
            $res      = curl_exec($fc);
            $httpcode = curl_getinfo($fc, CURLINFO_HTTP_CODE);
            $curlErr  = curl_errno($fc);
            curl_close($fc);

            $finish = microtime(true);

            // Log HTTP result
            $this->logger->info('API|POST|'.round(($finish - $start), 4) . ' secs for '.$action.' ['. $httpcode .']: ' . $uri);

            // Check CURL result
            if ($curlErr == 0){
                // Check JSON
                if (Util::isJsonValid($res)) {
                    $arrJson = json_decode($res);
                    // Check API response code
                    if (!empty($arrJson->outcode)) {
                        throw new Exception('API|POST|Request returned error ' . $arrJson->outcode . ' (' . $arrJson->outmsg . ') for URI(' . $uri . ')');
                    }
                }else{
                    $this->logger->error('API|POST|JSON is not valid for >>>' . $res . '<<<');
                    throw new Exception('API|POST|JSON is invalid for request ('.$uri.')');
                }
            }else{
                throw new Exception('API|POST|CURL failed with code ['.$curlErr.'] for ('.$uri.')');
            }

            return $res;
        } catch (Exception $ex) {
            $this->logger->error('API|POST| Request raised exception:');
            $this->logger->error($ex->getMessage());

            throw $ex;
        }
    }

    // Function to get the client IP address
    private function get_client_ip() {
        $ipaddress = '';
        if (getenv('HTTP_CLIENT_IP'))
            $ipaddress = getenv('HTTP_CLIENT_IP');
        else if(getenv('HTTP_X_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
        else if(getenv('HTTP_X_FORWARDED'))
            $ipaddress = getenv('HTTP_X_FORWARDED');
        else if(getenv('HTTP_FORWARDED_FOR'))
            $ipaddress = getenv('HTTP_FORWARDED_FOR');
        else if(getenv('HTTP_FORWARDED'))
        $ipaddress = getenv('HTTP_FORWARDED');
        else if(getenv('REMOTE_ADDR'))
            $ipaddress = getenv('REMOTE_ADDR');
        else
            $ipaddress = 'UNKNOWN';
        return $ipaddress;
    }

    public function obtenerDepartamentosId()
    {
        $departamentos = array();
        $raw = $this->call(self::GM_ZONAS_ACCION, array('want' => 'statelist'), true);
        $infoDepartamentos = json_decode($raw, true)['r'];
        foreach ($infoDepartamentos as $key => $value) {
            $departamentos[$value['nmz']] = 'Z' . $value['zon'];
        }

        return $departamentos;
    }

    public function getNombreSponsor($clave)
    {
        $raw = $this->call(self::GM_PROVEEDORES_ACCION, array(), true);
        $array = json_decode($raw, true)['r'];
        foreach ($array as $key => $value) {
            if ($value['idr'] == $clave) {

                return $value['name'];
            }
        }
        return '';
    }

    public function obtenerCondicionesPromo($idPromo)
    {
        $raw = $this->call(APICallerService::GM_PROMOCIONES_ACCION, array('filter' => self::PROMOCION_POR_ID_PROMO, 'filtervalue' => $idPromo), true);
        $array = json_decode($raw, true);

        if (isset($array['r']['prms'][0]['cond'])) {

            return $array['r']['prms'][0]['cond'];
        } else {

            return '';
        }
    }

    public function getNombreRubro($clave)
    {
        $prefix = 'PRD';
        if (substr($clave, 0, 3) != $prefix) {
            $clave = $prefix . $clave;
        }

        if ($clave == 'PRD0') {

            return 'Empresas';
        } else {
            $nombreRubro = '';
            $raw = $this->call(self::GM_RUBROS_ACCION, array('item' => 'fullProducts'), true);
            $rawArray = json_decode($raw, true)['r'];

            foreach ($rawArray as $key => $value) {
                if (substr($value['id'], 0, 3) != 'PRD') {
                    $value['id'] = 'PRD' . $value['id'];
                }
                if ($value['id'] == $clave) {
                    $nombreRubro = $value['clasif'];
                    break;
                }
            }
        }

        return $nombreRubro;
    }

    public function getNombreZona($clave)
    {
        $raw = $this->call(self::GM_ZONAS_ACCION, array('want' => 'statezonelist'), true);
        $rawArray = json_decode($raw, true)['r'];

        if ($clave == self::URUGUAY_ID) {
            return self::URUGUAY_TEXT;
        } else {
            foreach ($rawArray as $key => $depto) {
                if ($clave == 'Z' . $depto['zon']) {

                    return $depto['nmz'];
                }

                foreach ($depto['zones'] as $key => $zona) {
                    if ('Z' . $zona['zon'] == $clave) {

                        return $zona['nmz'];
                    }
                }
            }
        }

        return '';
    }

    /* obtener rubros relacionados */
    /* Categorias de rubros relacionados ®ondy: R=Rubro G=Generico E=Especifico, O=Promo, A=Afinidad, C=Cartelera */

    public function obtenerRubrosRelacionados($rubroId, $rubro, $country){
        //$this->logger->info('obteniendo rubros relacionados para ' . $rubro . ' (' . $rubroId . ')');
        $raw = $this->call(self::GM_RELATED_PRODS, array('txt' => urlencode($rubro), 'country' => $country, 'maxprods' => '15', 'maxlocs' => '0'));
        $relProdsData = json_decode($raw);

        //$this->logger->info('RELATED PRODS RETURNED ***' .  $raw . '***');
        $rubrosRelacionadosArray = array(
            'rubros' => array(),
            'promos' => array()
        );

        if (property_exists($relProdsData, 'r')){
          if (!is_array($relProdsData->r)){
            if (property_exists($relProdsData->r, 'ProductRecords')){
                    if (property_exists($relProdsData->r->ProductRecords, 'Total')){
                        $lastProdIdx = $relProdsData->r->ProductRecords->Total;
                        for($i=0; $i < $lastProdIdx; $i++){
                            $relItem = array(
                                'idp'  => 'PRD'.$relProdsData->r->ProductRecords->$i->ProductId,
                                'sidp' => $relProdsData->r->ProductRecords->$i->ProductId,
                                'nam'  => ucwords(strtolower($relProdsData->r->ProductRecords->$i->ProductName))
                            );
                            if (property_exists($relProdsData->r->ProductRecords->$i, 'ProductType')){
                                $relItem['typ'] = $relProdsData->r->ProductRecords->$i->ProductType;
                            }else{
                                $relItem['typ'] = 0;
                            }
                            if ($relItem['typ'] == 2){
                                $rubrosRelacionadosArray['promos'][] = $relItem;
                            }else{
                                $rubrosRelacionadosArray['rubros'][] = $relItem;
                            }
                            //$rubrosRelacionadosArray[$relItem['idp']] = $relItem;
                        }
                    }else{
                        $this->logger->error('(2) obteniendo rubros relacionados para ' . $rubro . ' (' . $rubroId . ')');
                    }
            }else{
                $this->logger->error('(1) obteniendo rubros relacionados para ' . $rubro . ' (' . $rubroId . ')');
            }
          }
        }else{
          $this->logger->error('(0) obteniendo rubros relacionados para ' . $rubro . ' (' . $rubroId . ')');
        }

        return $rubrosRelacionadosArray;
    }

    /* Obtener locales en la misma zona y el mismo rubro */

    public function obtenerComerciosSimilares($id, $zona, $rubro, $cant, $exceptoElComercio = '0')
    {
        $comerciosSimilares = array();
        if (!empty($zona) && !empty($rubro)) {
            $raw = $this->call(self::GM_COMERCIO_ACCION, array('piid' => $id, 'opts' => 'GQ', 'rel' => 1), true);

            $contador = 1;
            if(array_key_exists("rel", json_decode($raw, true))){
                $similaresParsear = json_decode($raw, true)['r']['prd']['0']['sto']['0']['rel'];

                foreach ($similaresParsear as $clave => $dato) {
                    if ($dato['nam'] != $exceptoElComercio) {
                        $comerciosSimilares[$clave] = $dato;
                        if ($contador > $cant) {
                            break;
                        }
                        $contador++;
                    }
                }
            }

            return $comerciosSimilares;
        }
    }

    public function obtenerZonasPrincipales(){
      if (self::$SHARED_ID == 'web1122'){
        return array(
            array('nmz' => 'Artigas'       , 'zip' => '02220'),
            array('nmz' => 'Canelones'     , 'zip' => '03320'),
            array('nmz' => 'Colonia'       , 'zip' => '05320'),
            array('nmz' => 'Durazno'       , 'zip' => '06220'),
            array('nmz' => 'Florida'       , 'zip' => '08220'),
            array('nmz' => 'Maldonado'     , 'zip' => '10007'),
            array('nmz' => 'Montevideo'    , 'zip' => '01000'),
            array('nmz' => 'Paysandú'      , 'zip' => '11120'),
            array('nmz' => 'Rivera'        , 'zip' => '13220'),
            array('nmz' => 'Rocha'         , 'zip' => '14320'),
            array('nmz' => 'Salto'         , 'zip' => '15120'),
        );
      }else{
        return array(
          array('nmz' => 'Asunción'       ,     'zip' => '20000'),
          array('nmz' => 'Ciudad del Este',     'zip' => '10001'),
          array('nmz' => 'Luque',               'zip' => '11010'),
          array('nmz' => 'San Lorenzo',         'zip' => '11015'),
          array('nmz' => 'Capiatá',             'zip' => '11002'),
          array('nmz' => 'Lambaré',             'zip' => '11008'),
          array('nmz' => 'Fernando de la Mora', 'zip' => '11003'),
          array('nmz' => 'Limpio',              'zip' => '11009'),
          array('nmz' => 'Encarnación',         'zip' => '07010'),
          array('nmz' => 'Pedro Juan Caballero','zip' => '13003'),
        );
      }
    }

    public function obtenerRubrosPrincipales()
    {
        $rubros = array();
        $rubros[] = array("nam" => 'Bancos',                "idp" => 'PRD1000136');
        $rubros[] = array("nam" => 'Cajeros',               "idp" => 'PRD2280');
        $rubros[] = array("nam" => 'Cerrajeria',            "idp" => 'PRD1000247');
        $rubros[] = array("nam" => 'Delivery',              "idp" => 'PRD10050');
        $rubros[] = array("nam" => 'Estaciones De Servicio',"idp" => 'PRD1001378');
        $rubros[] = array("nam" => 'Farmacias',             "idp" => 'PRD1000500');
        $rubros[] = array("nam" => 'Gomerias',              "idp" => 'PRD1001359');
        $rubros[] = array("nam" => 'Hoteles',               "idp" => 'PRD1000597');
        $rubros[] = array("nam" => 'Restaurantes',          "idp" => 'PRD1000898');
        $rubros[] = array("nam" => 'Talleres Mecanicos',    "idp" => 'PRD1001872');
        $rubros[] = array("nam" => 'Electricistas',         "idp" => 'PRD1000390');
        return $rubros;
    }

    private function keyGenerator($str)
    {
        return self::$CACHE_KEY_PREFIX . md5($str);
    }

    private function keyGeneratorNew($str, $params){
        $action = $params['action'];
        if ($action == 'gminfo'){
            if ($params['item'] == 'retailersHighlight'){
                $seed = '-' . $params['item'] . '-' . $params['index'];
                $key = '';
                $this->redisTTL = $this->calculateDailyRedisExp();
            }else if ($params['item'] == 'mainProducts'){
                $seed = '-mainProducts';
                $key  = '';
                $this->redisTTL = self::CACHE_1M_TTL;
            }else{
                $seed = '-' . $params['item'];
                //$key = '-'.md5($_SERVER['REQUEST_URI']);
                $key = '-'.($_SERVER['REQUEST_URI']);
                $this->redisTTL = self::CACHE_TTL;
            }
        }else if ($action == 'gmzone'){
            $want = $params['want'];
            if ($want == 'statelist' || $want == 'statezonelist'){
                // This is shared by all site and hardly changes
                $seed = $want;
                $key  = '';
                $this->redisTTL = self::CACHE_1M_TTL;
            }else{
                // This is particular for some zone info
                $seed = '-' . $params['want'];
                //$key = '-'.md5($_SERVER['REQUEST_URI']);
                $key = '-'.($_SERVER['REQUEST_URI']);
                $this->redisTTL = self::CACHE_TTL;
            }
        }else if ($action == 'gmpromos'){
            $filter = $params['filter'];
            if ($filter == 'highlight'){
                // This is shared by all site and hardly changes
                $seed = '-' . str_replace('+', '-', str_replace(' ', '-', $filter));
                $key  = '';
                $this->redisTTL = $this->calculateDailyRedisExp();
            }else{
                // No special seed, just send our URI
                $seed = '';
                //$key = '-'.md5($_SERVER['REQUEST_URI']);
                $key = '-'.($_SERVER['REQUEST_URI']);
                $this->redisTTL = self::CACHE_TTL;
            }
        }else if ($action == 'gmrelatedprods') {
            $seed = '-' . str_replace('+', '-', str_replace(' ', '-', strtolower($params['txt'])));
            $key  = '';
            $this->redisTTL = self::CACHE_1W_TTL;
        }else if ($action == 'gmhome' || $action == 'gmhome3') {
            $seed = '-' . str_replace(' ', '-', strtolower($params['wherezone']));
            $key  = '';
            $this->redisTTL = $this->calculateDailyRedisExp();
        }else if ($action == 'gmquery'){
            if (array_key_exists('wherezone', $params)){
                $seed = '-'.str_replace('+', '-', str_replace(' ', '-', strtolower($params['txt']))).
                        '-'.str_replace('+', '-', str_replace(' ', '-', strtolower($params['wherezone']))).
                        '-'.str_replace('+', '-', str_replace(' ', '-', strtolower($params['window'])));
            }else{
                if (array_key_exists('window', $params)){
                    $seed = '-'.str_replace('+', '-', str_replace(' ', '-', strtolower($params['txt']))).
                            '-nozone'.
                            '-'.str_replace('+', '-', str_replace(' ', '-', strtolower($params['window'])));
                }else{
                    $seed = '-'.str_replace('+', '-', str_replace(' ', '-', strtolower($params['txt']))).
                            '-nozone'.
                            '-nowin';
                }
            }
            $key  = '';
            // Keep 1 hour for now
            $this->redisTTL = self::CACHE_TTL;
            // $this->redisTTL = $this->calculateDailyRedisExp();
        }else{
            // No special seed, just send our URI
            $seed = '';
            $key = '-'.($_SERVER['REQUEST_URI']);
            // Keep 1 hour for now
            $this->redisTTL = self::CACHE_TTL;
            //$this->redisTTL = $this->calculateDailyRedisExp();
        }

        $retKey = self::$CACHE_KEY_PREFIX_NEW.$action.$seed.$key;
        
        // DEBUG ONLY
        $expiresOn = floor($this->redisTTL / 60 / 60 / 24) . " dias " . 
                     floor(($this->redisTTL / 60 / 60 )% 24) . " horas " . 
                     floor(($this->redisTTL / 60) % 60) . " mins";
        $this->logger->debug("REDIS| Action {$action} with KEY [{$retKey}] with TTL [".$this->redisTTL." | " . $expiresOn . "] for [".$_SERVER['REQUEST_URI']."] -------");

        return $retKey;
    }

    private function calculateDailyRedisExp(){
        $cutHour = 5;
        $hour = $date = date('H');
        //$this->logger->debug("REDIS| --- Hour is {$hour}");
        if ($hour > $cutHour && $hour < 24){
            // Expires tomorrow at 5 AM
            $datetime = new \DateTime();
            $datetime->modify('+1 day');
            $newDateTime = new \DateTime($datetime->format('Y-m-d 05:00:00'));

            //$this->logger->debug("REDIS| --- Expires at ".$newDateTime->format('Y-m-d H:i:s'));

            //echo $newDateTime->format('Y-m-d H:i:s') . "<br>";
            $diff = $newDateTime->getTimestamp() - (new \DateTime())->getTimestamp();
            //echo $diff . "<br>";
            return $diff;
        }else{
            // Expires today at 5 AM
            $datetime = new \DateTime();
            $newDateTime = new \DateTime($datetime->format('Y-m-d 05:00:00'));

            //$this->logger->debug("REDIS| --- Expires at ".$newDateTime->format('Y-m-d H:i:s'));

            $diff = $newDateTime->getTimestamp() - (new \DateTime())->getTimestamp();
            return $diff;
        }
    }

        
    public function buscarComercioPorNombre($searchName, $country){
        try{
            $searchName = strtolower($searchName);
            $this->logger->info('Buscando comercio por nombre ' . $searchName);
            $raw = $this->call(self::GM_QUERY, array('txt' => urlencode($searchName), 'country' => $country, 'window' => '0|0'));
            $resGmQuery = json_decode($raw, true);
            // Check gmQuery result
            if ($resGmQuery['outcode'] == 0){
                if ($resGmQuery['r']['cntprd'] > 0){
                    $this->logger->info('Comparando ['.$resGmQuery['r']['prd'][0]['sto'][0]['nam'].'] con buscado ['.$searchName.']');
                    if (strtolower($resGmQuery['r']['prd'][0]['sto'][0]['nam']) == $searchName){
                        $locId = 'LOC' . ( ( ($resGmQuery['r']['prd'][0]['sto'][0]['idr'] + 0) * 10000) + ($resGmQuery['r']['prd'][0]['sto'][0]['ids'] + 0) );
                        // $this->logger->info('El nombre matchea, cargando local ' . $locId . '...');
                        // $rawGmPiid = $this->call(APICallerService::GM_COMERCIO_ACCION, array('piid' => $locId, 'opts' => 'GQ', 'html' => 1, 'prm' => 1, 'rel' => 1), false, true);
                        // $resGmPiid = json_decode($rawGmPiid, true);
                        // if ($resGmPiid['outcode'] == 0){
                        //     return $resGmPiid;
                        // }else{
                        //     $this->logger->debug('Fallo Buscando comercio por nombre 1');
                        //     return NULL;
                        // }
                        return $locId;
                    }else{
                        $this->logger->debug('Fallo Buscando comercio por nombre 2');
                        return NULL;
                    }
                }else{
                    $this->logger->debug('Fallo Buscando comercio por nombre 3 (' . $resGmQuery['r']['cntprd'] . ')');
                    return NULL;
                }
            }else{
                $this->logger->debug('Fallo Buscando comercio por nombre 4');
                return NULL;
            }
        } catch (Exception $ex) {
            $this->logger->error('buscarComercioPorNombre raised exception:');
            $this->logger->error($ex->getMessage());
            throw $ex;
        }
    }




    //*=============================== Device Token =======================*//

    private static function decrypt($encryptedData) {
        $key = 'PdGy8@.8;s7hXs_d';
        $enc = mcrypt_module_open(MCRYPT_RIJNDAEL_256, '', MCRYPT_MODE_CBC, '');
        $iv = strtolower(md5($key . strtoupper(md5($key))));
        mcrypt_generic_init($enc, strtolower(md5($key)), $iv);

        $encryptedData = base64_decode(strtr($encryptedData, '-_', '+/'));
        $data = mdecrypt_generic($enc, $encryptedData);
        mcrypt_generic_deinit($enc);
        mcrypt_module_close($enc);

        // PKCS7 Padding from: https://gist.github.com/1077723
        $dataPad = ord($data[strlen($data) - 1]);

        return substr($data, 0, -$dataPad);
    }

    public function getDeviceToken($app){

      //session_destroy();

      //$this->logger->debug('API|getDeviceToken|Checking...');
    
      // CHECK FOR BOTS AND SKIP !!
      if (Util::checkBot()){
        $this->logger->debug('API|getDeviceToken|Found Bot UA, skipping user and device checks ('.$_SERVER['HTTP_USER_AGENT'].')');
        return NULL;
      }

      if ($this->session->has(self::$COOKIE_DEVICE_TOKEN)){
        $dtToken = $this->session->get(self::$COOKIE_DEVICE_TOKEN);
        $this->logger->debug('API|getDeviceToken|Found on session : '. $dtToken);
        if (!isset($_COOKIE[self::$COOKIE_DEVICE_TOKEN])) {
            $this->logger->warning('API|getDeviceToken|Token missing at cookie, re-setting...');
            setcookie(self::$COOKIE_DEVICE_TOKEN, $dtToken, strtotime( '+10 years' ));
        }
        $app['dtToken'] = $dtToken;
        return $dtToken;
      }else{
        if (isset($_COOKIE[self::$COOKIE_DEVICE_TOKEN])) {
          // Decrypt device token
          $dtToken = $_COOKIE[self::$COOKIE_DEVICE_TOKEN];
          //$device_id = decrypt($dtToken);
          $app['dtToken'] = $dtToken;
          $this->logger->debug('API|getDeviceToken|Found on cookie, storing at session and returning ' . $dtToken);
          $this->session->set(self::$COOKIE_DEVICE_TOKEN, $dtToken);
          return $dtToken;
        }else{
          // Must register device
          $this->logger->info('API|getDeviceToken|Device token not found, will request one...');
          $country = '';
          if ($app['config']['brand.country'] == 'uy'){
            $country = 'uy';
          }else if ($app['config']['brand.country'] == 'py'){
            $country = 'py';
          }
          $raw  = self::call(self::GM_REGISTER0, array('salt' => '12345678909876543210', 'cty' => $country, 'ap' => 'webapp'));
          $res = json_decode($raw, true);
          if ($res['outcode'] == 0){
              $dtToken = $res['r']['id'];
              setcookie(self::$COOKIE_DEVICE_TOKEN, $dtToken, strtotime( '+10 years' ));
              $this->session->set(self::$COOKIE_DEVICE_TOKEN, $dtToken);
              //$device_id = decrypt($dtToken);
              $app['dtToken'] = $dtToken;
              $this->logger->info('API|getDeviceToken|New token generated ('.$dtToken.')');
              return $dtToken;
          }else{
            $this->logger->error('API|getDeviceToken| Could not register device. API returned ' . $res['outcode'] . ' (' . $res['outmsg'] . ')');
            return NULL;
          }
        }
      }
    }

    public function getDeviceId($app){
        // Uberto server will handle decryption now, just return token
        return $this->getDeviceToken($app);
        //$dtToken = $this->getDeviceToken($app);
        //return APICallerService::decrypt($dtToken);
    }


    //*=============================== User methods =======================*//

    public function login($app, $username, $password, $deviceToken){

      // On logged in, store AuthId, Name
      $res = $this->call(self::GM_LOGIN, array(
        'loginid'  => $username,
        'pass'     => $password,
        'country'  => $app['config']['brand.country']
      ), FALSE, TRUE /* SKIP REDIS!! */);
      $res = json_decode($res, true);
      if ($res['outcode'] != 0){
        $this->logger->debug('Login failed for ' . $username . '. API returned code ' . $res['outcode'] . ' (' . $res['outmsg'] . ')');
        return NULL;
      }
      $this->logger->debug('Login sucessfull for ' . $username . ' token is ' . $res['r']['token'] . ' nick: ' . $res['r']['nick']);

      // store auth token at cookie
      $this->logger->info('API|login|Saving user token to ['.self::$COOKIE_USER_TOKEN.']');
      setcookie(self::$COOKIE_USER_TOKEN, $res['r']['token'], strtotime( '+1 years' ), '/');

      // OLD: store user data at session
      // $this->session->set(self::CLIENT_DATA_SESSION, $res['r']);

      // Force client data reload
      return $app['uberto_api_caller']->callClientData($deviceToken, $res['r']['token']);

      //return $res['r'];
    }

    public function logout($app, $deviceToken){

      // OLD: On server search for logged in user and clear it
      //$this->session->remove(self::CLIENT_DATA_SESSION);

      // Force client data reload
      $app['uberto_api_caller']->callClientData($deviceToken, NULL);

      // After OK, locally delete AuthId and name from Cookie
      unset($_COOKIE[self::$COOKIE_USER_TOKEN]);
      setcookie(self::$COOKIE_USER_TOKEN, '', time() - 3600, '/');
    }

    public function checkUserEmail($app, $email){
      $this->logger->debug('checkUserEmail checking email ' . $email . '...');
      
      $res = $this->call(self::GM_CHECKUSER, array('email'  => $email,'country'  => $app['config']['brand.country']), FALSE, TRUE /* SKIP REDIS!! */);
      $res = json_decode($res, true);
      if ($res['outcode'] != 0){
        $this->logger->debug('checkUserEmail failed for ' . $email . '. API returned code ' . $res['outcode'] . ' (' . $res['outmsg'] . ')');
        return NULL;
      }
      if ($res['r']['exists']){
        $this->logger->debug('checkUserEmail sucessfull for ' . $email . ' email exists ');
      }else{
        $this->logger->debug('checkUserEmail sucessfull for ' . $email . ' email DOES NOT EXISTS');
      }

      return $res['r'];
    }
}
