<?php

namespace EPD\Guia1122\Util;
use \Datetime;
use \Exception;

define('MAP_HOUR_00',    8388608);  // 100000000000000000000000
define('MAP_HOUR_01',    4194304);  // 010000000000000000000000
define('MAP_HOUR_02',    2097152);  // 001000000000000000000000
define('MAP_HOUR_03',    1048576);  // 000100000000000000000000
define('MAP_HOUR_04',     524288);  //     10000000000000000000
define('MAP_HOUR_05',     262144);  //     ‭01000000000000000000
define('MAP_HOUR_06',     131072);  //     ‭00100000000000000000
define('MAP_HOUR_07',      65536);  //     ‭00010000000000000000
define('MAP_HOUR_08',      32768);  //         1000000000000000
define('MAP_HOUR_09',      16384);  //         0100000000000000
define('MAP_HOUR_10',       8192);  //         0010000000000000
define('MAP_HOUR_11',       4096);  //         0001000000000000
define('MAP_HOUR_12',       2048);  //             100000000000
define('MAP_HOUR_13',       1024);  //             010000000000
define('MAP_HOUR_14',        512);  //             001000000000
define('MAP_HOUR_15',        256);  //             000100000000
define('MAP_HOUR_16',        128);  //                 10000000
define('MAP_HOUR_17',         64);  //                 01000000
define('MAP_HOUR_18',         32);  //                 00100000
define('MAP_HOUR_19',         16);  //                 00010000
define('MAP_HOUR_20',          8);  //                     1000
define('MAP_HOUR_21',          4);  //                     0100
define('MAP_HOUR_22',          2);  //                     0010
define('MAP_HOUR_23',          1);  //                     0001

define('MAP_DAY_0',         64);  //                 01000000 (Domingo)
define('MAP_DAY_1',         32);  //                 00100000 (Lunes)
define('MAP_DAY_2',         16);  //                 00010000 (Martes)
define('MAP_DAY_3',          8);  //                     1000 (Miercoles)
define('MAP_DAY_4',          4);  //                     0100 (Jueves)
define('MAP_DAY_5',          2);  //                     0010 (Viernes)
define('MAP_DAY_6',          1);  //                     0001 (Sabado)

class Util{

    /* Funcion que devuelve si el json es valido */
    public static function isJsonValid($string){
        return ((is_string($string) && (is_object(json_decode($string)) || is_array(json_decode($string))))) ? true : false;
    }

    /* Funcion que devuelve el array paginado mediante el metodo slice */
    public static function obtenerArrayPaginado($array, $pagina, $cantPaginar, $cantidadPaginasAMostrar, $verTodasPaginas = '0')
    {

        $arrayRetorno = array(
            'pagina' => '1',
            'array' => array(),
            'cantidadPaginas' => '0'
        );

        /* obtengo la cantidad de items */
        $cantidadItems = count($array);

        /* si la cantidad de items es mayor que 0 */
        if ($cantidadItems > 0) {

            //$cantidadItems--;

            /* si la cantidad de items es mayor que la cantidad que se puede paginar, los recorto */
            if ($cantidadItems > $cantPaginar) {
                $cantidadPaginas = ceil($cantidadItems / $cantPaginar);
            } else {
                $cantidadPaginas = 1;
            }

            /* si tengo mas paginas que la cantidad a mostrar, recorto la cantidad de paginas a mostrar */
            if ($verTodasPaginas == '0') {
                if ($cantidadPaginas > $cantidadPaginasAMostrar) {
                    $cantidadPaginas = $cantidadPaginasAMostrar;
                }
            }

            if ($pagina == 1) {
                $desde = 0; /* el array comienza en 0 */
            } else {
                $desde = (($pagina - 1) * $cantPaginar); /* como el array empieza en 0 tengo que restarle uno */
            }

            if ($pagina == 0 || $pagina > $cantidadPaginas) {
                $pagina = 1;
            }

            $arrayRetorno['array'] = array_slice($array, $desde, $cantPaginar);

            $arrayRetorno['cantidadPaginas'] = $cantidadPaginas;
            $arrayRetorno['pagina'] = $pagina;
        }

        /* devuelvo el array */
        return $arrayRetorno;
    }

    public static function arrayToLog($name, $array, $field, $app)
    {
        $app['logger']->error('================ Loggin array ' . $name . ' ========================');
        foreach ($array as $key => $value) {
            $app['logger']->error($key . '=' . $value[$field]);
        }
        $app['logger']->error('----------- End array ' . $name . ' -----------');
    }

    public static function showMemoryUsage()
    {
        $mem_usage = memory_get_usage(true);
        $str = null;

        if ($mem_usage < 1024) {
            $str = $mem_usage . ' bytes';
        } elseif ($mem_usage < 1048576) {
            $str = round($mem_usage / 1024, 2) . ' kilobytes';
        } else {
            $str = round($mem_usage / 1048576, 2) . ' megabytes';
        }

        return '<br><div align="center" style="background-color: black; color: red;" class="clearfix">Uso de memoria: ' . $str . '</div>';
    }

    /**
     * Modifies a string to remove all non ASCII characters and spaces.
     */
    public static function slugify($text)
    {
        // replace non letter or digits by -
        $text = preg_replace('~[^\\pL\d]+~u', '-', $text);

        // trim
        $text = trim($text, '-');

        // transliterate
        if (function_exists('iconv')) {
            $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        }

        // lowercase
        $text = strtolower($text);

        // remove unwanted characters
        $text = preg_replace('~[^-\w]+~', '', $text);

        if (empty($text)) {
            return 'n-a';
        }

        return $text;
    }

    public static function isRobot($userAgent = null)
    {
        $robotsName = array('abcdatos botlink', 'churl', 'christcrawler.com', 'checkbot', 'digimarc marcspider/cgi', 'cassandra',
            'calif', 'cactvs chemistry spider', 'bspider', 'bright.net caching robot', 'boxseabot', 'borg-bot', 'bloodhound',
            'die blinde kuh', 'blackwidow', 'bjaaland', 'big brother', 'bbot', 'bayspider', 'backrub', 'auresys', 'atomz.com search robot',
            'atn worldwide', 'aspider (associative spider)', 'arks', 'ariadne', 'aretha', 'architextspider', 'araybot', 'araneo', 'arale',
            'arachnophilia', 'walhello appie', 'anthill', 'alkaline', 'ahoy! the homepage finder', 'acme.spider', 'wild ferret web hopper #1, #2, #3',
            'felix ide', 'fluid dynamics search engine robot', 'fastcrawler', 'nzexplorer', 'evliya celebi', 'esther', 'esculapio', 'ananzi',
            'emacs-w3 search engine', 'elfinbot', 'eit link verifier robot', 'ebiness', 'e-collector', "dwcp (dridus' web cataloging project)",
            'dragonbot', 'download express', 'dnabot', 'direct hit grabber', 'digital integrity robot', 'digger', 'dienstspider',
            'deweb(c) katalog/index', 'desert realm spider', 'cydralspider', 'cyberspyder link test', 'cusco', 'internet cruiser robot',
            'xyleme robot', 'web core / roots', 'coolbot', 'confuzzledbot', 'combine system', 'collective', 'cmc/0.01', 'cienciaficcion.net',
            'incywincy', 'imagelock', 'ingrid', 'popular iconoclast', 'ibm_planetwide', 'iajabot', 'hyper-decontextualizer', 'htmlgobble',
            'ht://dig', 'wired digital', 'hometown spider pro', 'hi (html index) search', 'havindex', 'harvest', 'hambot', 'gulper bot',
            'northern light gulliver', 'gromit', 'griffon', 'grapnel/0.01 experiment', 'googlebot', 'golem', 'geturl', 'getbot', 'gcreep',
            'gazz', 'gammaspider, focusedcrawler', 'funnelweb', 'freecrawl', 'robot francoroute', 'fouineur', 'fish search', 'kit-fireball',
            'hämähäkki', 'fido', 'fetchrover', 'mattie', 'marvin/infoseek', 'magpie', 'mac wwwworm', 'lycos', 'logo.gif crawler', 'lockon',
            'linkwalker', 'linkscan', 'link validator', 'legs', 'larbin', 'labelgrabber', 'ko_yappo_robot', 'kilroy', 'kdd-explorer', 'katipo',
            'image.kapsi.net', 'jumpstation', 'the jubii indexing robot', 'joebot', 'jobot', 'jobo java web robot', 'askjeeves', 'jcrawler',
            'jbot java web robot', 'javabee', 'israeli-search', 'iron33', 'i, robot', 'intelliagent', 'inspector web', 'infospiders',
            'infoseek sidewinder', 'infoseek robot 1.0', 'informant', 'perlcrawler 1.0', 'the peregrinator', 'pegasus', 'patric', 'parasite',
            'pageboy', 'pack rat', 'orb search', 'openfind data gatherer', 'ontospider', 'hku www octopus', 'occam', 'objectssearch',
            'the northstar robot', 'nomad', 'nhse web forager', 'newscan-online', 'netscoop', 'netmechanic', 'netcarta webmap engine',
            'ndspider', 'internet shinchakubin', 'mwd.search', 'muscat ferret', 'muninn', 'muncher', 'msnbot', 'motor', 'monster', 'momspider',
            'moget', 'mnogosearch search engine software', 'mindcrawler', 'nec-meshexplorer', 'merzscope', 'mediafox', 'sift', "shai'hulud",
            'shagseeker', 'sg-scout', 'senrigan', 'searchprocess', 'sleek', 'search.aus-au.com', 'scooter', 'safetynet robot', 'rules', 'roverbot',
            'robozilla', 'robofox', 'robocrawl spider', 'computingsite robi/1.0', 'robbie the robot', 'road runner: the imagescape robot', 'rixbot',
            'roadhouse crawling system', 'resume robot', 'rbse spider', 'raven search', 'the python robot', 'getterroboplus puu', 'psbot',
            'portalb spider', 'poppi', 'plumtreewebaccessor', 'pgp key agent', 'portal juice spider', 'html_analyzer', 'pioneer',
            "pimptrain.com's robot", 'piltdownman', 'phpdig', 'phantom', 'valkyrie', 'url spider pro', 'url check', 'uptimebot', 'udmsearch',
            'ucsd crawl', 'tlspider', 'the tkwww robot', 'titan', 'titin', 'templeton', 'techbot', 'tcl w3 robot', 'tarspider', 'tarantula',
            'tach black widow', 'sygol', 'sven', 'suntek search engine', 'suke', 'site searcher', 'spry wizard robot', 'spiderview(tm)', 'spiderman',
            'spiderline crawler', 'spiderbot', 'spider_monkey', 'speedy spider', 'solbot', 'snooper', 'smart spider', 'inktomi slurp', 'slcrawler',
            'skymob.com', 'sitetech-rover', 'site valet', 'simmany robot ver1.0', 'webstolperer', 'w3mir', 'weblog monitor', 'whowhere robot',
            'whatuseek winona', 'wget', 'webwatch', 'webwalker', 'webwalk', 'webvac', 'webspider', 'websnarf', 'webs', 'webreaper', 'digimarc marcspider',
            'webquest', 'the web moose', 'webmirror', 'weblinker', 'weblayers', 'webinator', 'the webfoot robot', 'webfetcher', 'webcopy', 'webcatcher',
            'webbandit web spider', 'w@pspider by wap4.com', 'the world wide web wanderer', 'wallpaper (alias crawlpaper)', 'w3m2', 'the nwi robot',
            'vwbot', 'voyager', 'void-bot', 'vision-search', 'victoria', 'verticrawl', 'nederland.zoek', 'xget', 'webzinger', 'wwwc ver 0.2.5',
            'the world wide web worm', 'the web wombat');

        return in_array(strtolower($userAgent), $robotsName);
    }

    public static function sasMap()
    {
        $oasMap = array(
            'stid' => 63603,
            'pages' => array(
                'Guia_Movil_1122/buscador' => array(
                    'pgid' => 537965,
                    'formats' => array('right' => 27528, 'right1' => 27838, 'top' => 27839, 'middle' => 28425, 'bottom' => 28427)
                ),
                'Guia_Movil_1122/home' => array(
                    'pgid' => 538980,
                    'formats' => array('right' => 27528, 'right1' => 27838, 'top' => 27839, 'middle' => 28425,  'bottom' => 28427)
                ),
                'Guia_Movil_1122/local' => array(
                    'pgid' => 537966,
                    'formats' => array('right' => 27528, 'right1' => 27838, 'top' => 27839, 'bottom' => 28427)
                ),
                'Guia_Movil_1122/promociones-y-ofertas' => array(
                    'pgid' => 537967,
                    'formats' => array('top' => 27839, 'middle' => 28425, 'top' => 27839, 'bottom' => 28427)
                ),
                'Guia_Movil_1122/rubro' => array(
                    'pgid' => 537968,
                    'formats' => array('right' => 27528, 'right1' => 27838, 'top' => 27839, 'middle' => 28425, 'bottom' => 28427)
                ),
                'Guia_Movil_1122/rubro-zona' => array(
                    'pgid' => 537969,
                    'formats' => array('right' => 27528, 'right1' => 27838, 'top' => 27839, 'middle' => 28425)
                ),
                'Guia_Movil_1122/sponsor' => array(
                    'pgid' => 537970,
                    'formats' => array('middle' => 28425, 'mobile_bottom' => 30132, 
                        'mobile_middle' => 30131, 'mobile_top' => 30130)
                ),
                'Guia_Movil_1122/zona' => array(
                    'pgid' => 537971,
                    'formats' => array('right' => 27528, 'right1' => 27838, 'top' => 27839, 'middle' => 28425)
                ),
               
            )
        );

        return $oasMap;
    }

    public static function getPremiumPromos($arrStores)
    {
        $countStores      = count($arrStores);
        $retObj           = new \stdClass();
        $retObj->arrPrms  = [];
        $retObj->arrSpons = [];
        $bMustAdd     = false;
        $bMustAddSpon = false;
        for($i=0; $i < $countStores; $i++){
            if (array_key_exists('iPrm', $arrStores[$i])){
                if (count($arrStores[$i]['iPrm']) > 0){
                    if (array_key_exists('prmm', $arrStores[$i]['iPrm'][0]['sponsor'])){
                        if ($arrStores[$i]['iPrm'][0]['sponsor']['prmm']){
                            $bMustAdd = true;
                            for($pi=0; $pi < count($retObj->arrPrms); $pi++){
                                if ($retObj->arrPrms[$pi]['idp'] == $arrStores[$i]['iPrm'][0]['idp']){
                                    $bMustAdd = false;
                                    break;
                                }
                            }
                            if ($bMustAdd){
                                $prm = array(
                                    'idr'     => $arrStores[$i]['idr'],
                                    'ids'     => $arrStores[$i]['ids'],
                                    'stonam'  => $arrStores[$i]['nam'],
                                    'idp'     => $arrStores[$i]['iPrm'][0]['idp'],
                                    'nmp'     => $arrStores[$i]['iPrm'][0]['nmp'],
                                    'dsc'     => $arrStores[$i]['iPrm'][0]['dsc'],
                                    'imp'     => $arrStores[$i]['iPrm'][0]['imp'],
                                    'link'    => '',
                                    'spNmp'   => $arrStores[$i]['iPrm'][0]['sponsor']['nmp'],
                                    'spIcs'   => $arrStores[$i]['iPrm'][0]['sponsor']['ics']
                                );
                                if (array_key_exists('bon', $arrStores[$i]['iPrm'][0])){
                                    $prm['bon'] = $arrStores[$i]['iPrm'][0]['bon'];
                                }
                                $retObj->arrPrms[] = $prm;
                            }
                            $bMustAddSpon = true;
                            for($pi=0; $pi < count($retObj->arrSpons); $pi++){
                                if ($retObj->arrSpons[$pi] == $arrStores[$i]['iPrm'][0]['sponsor']['nmp']){
                                    $bMustAddSpon = false;
                                    break;
                                }
                            }
                            if ($bMustAddSpon){
                                $retObj->arrSpons[] = $arrStores[$i]['iPrm'][0]['sponsor']['nmp'];
                            }
                        }
                    }
                }
            }
        }
        return $retObj;
    }

    public static function buildHoursProfileAsToday($today, $hours, $app){
      //$today = 0;
      $table = array();
      $basetable  = array(
        array("sday"   => "Lunes",     "isOpen" => FALSE, "intDay" => 0),
        array("sday"   => "Martes",    "isOpen" => FALSE, "intDay" => 1), 
        array("sday"   => "Miércoles", "isOpen" => FALSE, "intDay" => 2), 
        array("sday"   => "Jueves",    "isOpen" => FALSE, "intDay" => 3),
        array("sday"   => "Viernes",   "isOpen" => FALSE, "intDay" => 4),
        array("sday"   => "Sábado",    "isOpen" => FALSE, "intDay" => 5),
        array("sday"   => "Domingo",   "isOpen" => FALSE, "intDay" => 6),
      );

      for($i=0; $i < count($hours); $i++){
        $iDay = intval($hours[$i]->day);
        if (!$basetable[$iDay]["isOpen"]){
          // Init array of hours and change open
          $basetable[$iDay]["isOpen"] = TRUE;
          $basetable[$iDay]["hours"] = array();
        }
        // Add new time
        $basetable[$iDay]["hours"][] = array(
          "sstart"   => substr($hours[$i]->start, 0, -2) . ":" . substr($hours[$i]->start, -2),
          "send"     => substr($hours[$i]->end, 0, -2) . ":" . substr($hours[$i]->end, -2),
          "start"    => $hours[$i]->start,
          "end"      => $hours[$i]->end
        );
      }

      for($i=$today+1; $i < 7; $i++){
        //$app['logger']->debug('Util|buildHoursProfileAsToday| 1 Adding index ' . $i . ' as ' . $basetable[$i]['sday']); 
        array_push($table, $basetable[$i]);
      }
      for($i=0; $i < $today; $i++){
        //$app['logger']->debug('Util|buildHoursProfileAsToday| 2 Adding index ' . $i . ' as ' . $basetable[$i]['sday']); 
        array_push($table, $basetable[$i]);
      }
      //$app['logger']->debug('Util|buildHoursProfileAsToday| 3 Adding index 0 as ' . $basetable[$today]['sday']); 
      array_unshift($table, $basetable[$today]);
      

      return $table;
    }

    private static function buildHourLabel($hour){
        if ($hour < 100){
            if ($hour >= 10){
                return "00:".$hour;
            } else {
                return "00:0".$hour;
            }
        } else {
            return substr($hour, 0, -2) . ":" . substr($hour, -2);
        }
    }

    private static function convertDateToString($date, $includeDay) {
      $days = array('Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado');
      $months = array('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre');
      $bDate = ($includeDay ? $days[$date->format('w')] . " " : "") . $date->format('j') . " de " . $months[$date->format('n') - 1];
      return $bDate;
    }
    
    public static function buildHoursProfile($today, $hours, $specialHours){
      // Init table
      $today = intval(date('w'));
      $today = ($today == 0) ? 6 : $today-1;
      $table  = array(
        array("sday"   => "Lunes",     "isOpen" => FALSE, "isToday" => ($today == 0), "hours" => NULL, "isSpecial" => FALSE, "isSpecialConfirmed" => FALSE, "desc" => NULL, "intsDay" => "Monday"),
        array("sday"   => "Martes",    "isOpen" => FALSE, "isToday" => ($today == 1), "hours" => NULL, "isSpecial" => FALSE, "isSpecialConfirmed" => FALSE, "desc" => NULL, "intsDay" => "Tuesday"),
        array("sday"   => "Miércoles", "isOpen" => FALSE, "isToday" => ($today == 2), "hours" => NULL, "isSpecial" => FALSE, "isSpecialConfirmed" => FALSE, "desc" => NULL, "intsDay" => "Wednesday"),
        array("sday"   => "Jueves",    "isOpen" => FALSE, "isToday" => ($today == 3), "hours" => NULL, "isSpecial" => FALSE, "isSpecialConfirmed" => FALSE, "desc" => NULL, "intsDay" => "Thursday"),
        array("sday"   => "Viernes",   "isOpen" => FALSE, "isToday" => ($today == 4), "hours" => NULL, "isSpecial" => FALSE, "isSpecialConfirmed" => FALSE, "desc" => NULL, "intsDay" => "Friday"),
        array("sday"   => "Sábado",    "isOpen" => FALSE, "isToday" => ($today == 5), "hours" => NULL, "isSpecial" => FALSE, "isSpecialConfirmed" => FALSE, "desc" => NULL, "intsDay" => "Saturday"),
        array("sday"   => "Domingo",   "isOpen" => FALSE, "isToday" => ($today == 6), "hours" => NULL, "isSpecial" => FALSE, "isSpecialConfirmed" => FALSE, "desc" => NULL, "intsDay" => "Sunday")
        );
      for($i=0; $i < count($hours); $i++){
        $iDay = intval($hours[$i]['day']);
        if (!$table[$iDay]["isOpen"]){
          // Init array of hours and change open
          $table[$iDay]["isOpen"] = TRUE;
          $table[$iDay]["hours"] = array();
        }
        // Add new time
        $table[$iDay]["hours"][] = array(
          "sstart"   => self::buildHourLabel($hours[$i]['start']),
          "send"     => self::buildHourLabel($hours[$i]['end']),
          "start"    => $hours[$i]['start'],
          "end"      => $hours[$i]['end']
        );
      }
      if (!isset($specialHours)) $specialHours = array();
      foreach ($specialHours as $h) {
        $date = new DateTime($h['d'] . " 00:00:00");
        $days = array('Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado');
        $day = array(
          "sday"                => $days[$date->format('w')],
          "isOpen"              => TRUE,
          "isToday"             => date('w') == $date->format('w'),
          "hours"               => NULL,
          "isSpecial"           => TRUE,
          "isSpecialConfirmed"  => $h['cf'],
          "desc"                => self::convertDateToString($date, false),
          "color"               => 'green',
          "intsDay"             => $date->format('l')
        );
        if ($h['cf']):
            if (isset($h['hp'])):
                if (count($h['hp'])):
                    $day['hours'] = array();
                    foreach($h['hp'] as $x) {
                      $range = array(
                        "sstart"  => self::buildHourLabel($x['start']),
                        "send"    => self::buildHourLabel($x['end']),
                        "start"   => $x['start'],
                        "end"     => $x['end']
                      );
                      $day['hours'][] = $range;
                    }
                else:
                  $day['color'] = "#F44336";
                  $day['isOpen'] = FALSE;
                endif;
          else:
            $day['color'] = "#F44336";
            $day['isOpen'] = FALSE;
          endif;

          if (isset($h['dsc'])):
            $day['desc'] = "Especial por " . $h['dsc'];
          else:
            $day['desc'] = "Especial para el " . $day['desc'];
          endif;
        else:
          $day['color'] = '#a96500';
          $eDay = array_values(array_filter($table, function($dH) use ($day) {
            if ($dH['sday'] == $day['sday'] && $dH['isSpecial'] == FALSE):
              return true;
            endif;
          }));
          $day['hours'] = $eDay[0]['hours'];
          $day['isOpen'] = $eDay[0]['isOpen'];

          if ($h['dsc']):
            $day['desc'] = $h['dsc'] . " puede afectar estos horarios";
          endif;
        endif;

        $idx = 0;
        foreach($table as $index => $d) {
          if ($d['sday'] == $day['sday'] && $d['isSpecial'] == FALSE) {
            $idx = $index;
          };
        };

        $table[$idx] = $day;
      };
      return $table;
    }

    private static function checkOpenCalculateDelta($hourOpens, $hour){
        $hHourOpens = intval($hourOpens / 100);
        $hHour      = intval($hour / 100);
        if ($hHourOpens == $hHour){
            return ($hourOpens - $hour);
        }else{
            return (($hourOpens - $hour)-40);
        }
    }

    public static function checkOpen($today, $table, $isOpen24, $app){
        $bIsOpenFound = false;
        $hour = date('Hi');
        //$hour = 2305;

        // Init response
        $res = new \stdClass();
        $res->isOpen               = false;
        $res->minsToOpen           = 0; 
        $res->minsToClose          = 0; 
        $res->openHourToday        = false; 
        $res->openHourTodayTime    = NULL;
        $res->openHourTomorrow     = false; 
        $res->openHourTomorrowTime = NULL;
        $res->openHourDay          = NULL;
        $res->openHourDayTime      = NULL;



        if (!is_array($table) || !is_array($table[0])){
            $app['logger']->debug('Util|checkOpen| Fixing table to json array');
            $table = json_decode(json_encode($table), true);
        }

        //$app['logger']->debug('Util|checkOpen| using table ----'. json_encode($table) .'----');

        //$app['logger']->debug('Util|checkOpen| Checking table for today as ' . $today);
        if (isset($table[$today]["hours"])) {
            if (!count($table[$today]["hours"])) {
                if ($isOpen24) {
                    if ($table[$today]["hours"]["isSpecialConfirmed"]) {
                        $res->isOpen = false;
                    } else {
                        $res->isOpen = false;
                    }
                    return $res;
                }
            }
        }
        if ($table[$today]['isOpen']){
          for($idxHour=0; $idxHour < count($table[$today]["hours"]); $idxHour++){
              $hourOpens  = $table[$today]["hours"][$idxHour]["start"];
              $hourCloses = $table[$today]["hours"][$idxHour]["end"];
              $dayIsOpen  = $table[$today]['isOpen'];
              if ($dayIsOpen){
                  if (!$bIsOpenFound){
                      if ($hour < $hourOpens){
                          if ($hour < $hourCloses && $hourOpens > $hourCloses){
                              $res->isOpen = true;
                              //$app['logger']->debug('Util|checkOpen|Current hour '.$hour.' is between opened hours ['.$hourOpens.'-'.$hourCloses.']');
                          }else{
                              $hourDiff = self::checkOpenCalculateDelta($hourOpens, $hour);
                              if ( $hourDiff < 100){
                                  $res->isOpen        = false;
                                  $res->minsToOpen    = $hourDiff;
                                  $res->openHourToday = true;
                                  //$app['logger']->debug('Util|checkOpen|Store is closed and opens today in '.$hourDiff.' minutes');
                              }else{
                                  $res->isOpen            = false;
                                  $res->openHourToday     = true;
                                  $res->minsToOpen        = 0;
                                  $res->openHourTodayTime = $table[$today]["hours"][$idxHour]["sstart"];
                                  //$app['logger']->debug('Util|checkOpen|Store is closed and opens today at '.$res->openHourTodayTime);
                              }
                          }
                          $bIsOpenFound = true;
                      }else if ($hour >= $hourOpens && $hour < $hourCloses){
                          $hourDiff = self::checkOpenCalculateDelta($hourCloses , $hour);
                          if ( $hourDiff < 100){
                              $res->isOpen      = true;
                              $res->minsToClose = $hourDiff;
                              //$app['logger']->debug('Util|checkOpen|Current hour '.$hour.' is between opened hours ['.$hourOpens.'-'.$hourCloses.'] and closes in '.$hourDiff.' minutes.');
                          }else{
                              //$app['logger']->debug('Util|checkOpen| (2) Current hour '.$hour.' is between opened hours ['.$hourOpens.'-'.$hourCloses.']');
                              $res->isOpen = true;
                          }
                          $bIsOpenFound = true;
                      }else{
                          if ($hourCloses < $hourOpens){
                              if ($hour > $hourOpens && $hour < 2400){
                                  $res->isOpen = true;
                                  $bIsOpenFound = true;
                                  //$app['logger']->debug('Util|checkOpen| (3) Current hour '.$hour.' is between opened hours ['.$hourOpens.'-'.$hourCloses.']');
                              }else{
                                  $res->isOpen = false;
                                  //$app['logger']->debug('Util|checkOpen| (4) Current hour '.$hour.' is NOT between opened hours ['.$hourOpens.'-'.$hourCloses.']');
                              }
                          }else{
                              $res->isOpen = false;
                              //$app['logger']->debug('Util|checkOpen| (5) Current hour '.$hour.' is NOT between opened hours ['.$hourOpens.'-'.$hourCloses.']');
                          }
                      }
                  }
              }
          }
        }

        if (!$bIsOpenFound){

            $idxDay = $today+1;
            //var $day     = null;
            //var nextOpen = null;
            $tableCount = count($table);
            for($i=0; $i < $tableCount; $i++){
                if ($idxDay >= $tableCount-1) $idxDay = 0;
                if (isset($table[$idxDay]["hours"])) {
                    if (count($table[$idxDay]["hours"])>0){
                        $nextOpen = $table[$idxDay]["hours"][0]["sstart"];
                        if ($today == $idxDay){
                            $res->openHourToday = true;
                            $res->openHourTodayTime = $nextOpen;
                        }else if ($idxDay - $today == 1){
                            if ($isOpen24) {
                                if (!$table[$idxDay]["isSpecialConfirmed"]) {
                                    $res->openHourTomorrow = true;
                                }
                            } else {
                                $res->openHourTomorrow = true;
                                $res->openHourTomorrowTime = $nextOpen;    
                            }
                        }else{
                            $res->openHourDay = $table[$idxDay]["sday"];
                            $res->openHourDayTime = $nextOpen;
                        }
                        break;
                    }
                }
                $idxDay++;
            }
        }

        return $res;
    }

    public static function buildScheduleOrderTable($table, $hoursState, $includeClosedDays=false){
        //
        // [day dd/mm/yyyy]
        //                 [hour range]
        //
        $today        = intval(date('w'));
        $index        = ($today == 0) ? 6 : $today-1;
        $optionsTable = array();
        $mDate        = new \Moment\Moment('UTC');
        $currentHour  = intval(date('H'));
        //$currentHour = 23;
        $isToday      = false;
        $optDaysMax   = 3;
        $optDaysIdx   = 0;
        $optDaysIdxController = 0;

        //for ($days=0; $days < 3; $days++){
        while($optDaysIdx < $optDaysMax){
            if ($table[$index]->isOpen){
                //
                // This day is opened, check what time is it and build options
                //
                $opt = new \stdClass();
                if ($table[$index]->isToday){
                    $opt->day = 'HOY';
                    $isToday = true;
                }else{
                    $opt->day = $table[$index]->sday;
                    $isToday = false;
                }
                $opt->isOpen    = true;
                $opt->date      = $mDate->format('Y/m/d');
                $opt->dayNumber = $mDate->format('d');
                $opt->monthName = strtoupper($mDate->format('M'));
                $opt->ranges    = [];
                for($i=0;$i < count($table[$index]->hours);$i++){
                    // Protect hours after midnight
                    $hourStart = $table[$index]->hours[$i]->start;
                    if ($table[$index]->hours[$i]->end < $hourStart){
                        $hourEnd = 2400;
                    }else{
                        $hourEnd = $table[$index]->hours[$i]->end;
                    }
                    $opCount = (($hourEnd - $hourStart) / 50) / 2;

                    $opDate  = new \Moment\Moment('UTC');
                    $opDate->setHour(intval($hourStart/100));
                    $opDate->setMinute(intval($hourStart%100));
                    for($opIndex=0; $opIndex < $opCount; $opIndex++){
                        if ($isToday){
                            if ($opDate->getHour() <= $currentHour){
                                $opDate->addMinutes(60);
                                continue;
                            }
                        }
                        // First half
                        $option = new \stdClass();
                        $option->start = $opDate->format('H:i');
                        $opDate->addMinutes(30);
                        $option->end   = $opDate->format('H:i');
                        $opt->ranges[] = $option;
                        // Second half
                        $option = new \stdClass();
                        $option->start = $opDate->format('H:i');
                        $opDate->addMinutes(30);
                        $option->end   = $opDate->format('H:i');
                        $opt->ranges[] = $option;
                    }
                }
                // Check available slots
                if (count($opt->ranges) > 0){
                    $optionsTable[] = $opt;
                    $optDaysIdx++;
                }
            }else{
                //
                // This day is closed, check if we must include closed days
                //
                if ($includeClosedDays){
                    $opt = new \stdClass();
                    if ($table[$index]->isToday){
                        $opt->day = 'HOY';
                        $isToday = true;
                    }else{
                        $opt->day = $table[$index]->sday;
                        $isToday = false;
                    }
                    $opt->isOpen    = false;
                    $opt->date      = $mDate->format('Y/m/d');
                    $opt->dayNumber = $mDate->format('d');
                    $opt->monthName = strtoupper($mDate->format('M'));
                    $optionsTable[] = $opt;
                }
            }
            // If not opened, just move next checking last day, and adding 1 day to calendar date
            if ($index == 6) {
                $index=0;
            }else{
                $index++;
            }
            $mDate->addDays(1);

            // Special infinite loop controller
            $optDaysIdxController++;
            if ($optDaysIdxController > 10){
                $optDaysIdx = $optDaysMax;
            }
        }

        return $optionsTable;
    }

    public static function buildNiceMinsTime($mins){
        if ($mins < 60){ // menos d 1 hora
            $ret = $mins;
            if ($ret == 1){
                return $ret . " minuto";
            }else{
                return $ret . " minutos";
            }
        }else if ($mins >= 60 && $mins < 1380){ // entre 1 y 23 horas
            $ret = $mins = round($mins / 60);
            if ($ret == 1){
                return $ret . " hora";
            }else{
                return $ret . " horas";
            }
        }else if ($mins > 1380 && $mins < 8640){ // entre 23 horas y 6 dias
            $ret = $mins = round($mins / 60 / 24);
            if ($ret == 1){
                return $ret . " día";
            }else{
                return $ret . " días";
            }
        }else{
            return 'más de una semana';
        }
    }

    public static function buildNiceEstimatedMinsTime($mins){
        if ($mins < 60){ // menos d 1 hora
            $ret = $mins;
            if ($ret == 1){
                return $ret . " minuto";
            }else{
                return $ret . " minutos";
            }
        }else if ($mins >= 60 && $mins < 1380){ // entre 1 y 23 horas
            $ret = $mins = round($mins / 60);
            if ($ret == 1){
                return $ret . " hora";
            }else{
                return $ret . " horas";
            }
        }else if ($mins > 1380){ // entre 23 horas y 6 dias
            $ret = $mins = round($mins / 60 / 24);
            if ($ret == 1){
                return $ret . " día";
            }else{
                return $ret . " días";
            }
        }
    }

    public static function buildNiceDistance($mts){
        if ($mts < 1000){
            return " a " . $mts . " mts";
        }else if ($mts >= 1000 && $mts < 100000){
            return " a " . round($mts / 1000, 0) . " kms";
        }else{
            return "";
        }
    }


    public static function sdBuildLocalBusiness($ml, $znam, $sta, $adr, $stoName, $lat, $lon, $url, $tel, $fax, $ics, $eml, $canUrl, $hp){
        $crumbs = new \stdClass();
        $crumbs->{'@context'}              = 'http://schema.org';
        $crumbs->{'@type'}                 = 'LocalBusiness';
        //$crumbs->{'@id'}                   = $ml;
        $crumbs->address                   = new \stdClass();
        $crumbs->address->{'@type'}        = 'PostalAddress';
        $crumbs->address->addressLocality  = $znam;
        $crumbs->address->addressRegion    = $sta;
        $crumbs->address->streetAddress    = $adr;
        $crumbs->address->addressCountry   = 'UY';
        $crumbs->name                      = $stoName;
        if ($lat != null){
            $crumbs->geo                     = new \stdClass();
            $crumbs->geo->{'@type'}          = "GeoCoordinates";
            $crumbs->geo->latitude           = $lat;
            $crumbs->geo->longitude          = $lon;
        }
        if ($url != null && strlen($url)>0){
            $crumbs->url                     = $url;
        }else{
            $crumbs->url                     = $canUrl;
        }
        if ($tel != null){
            $crumbs->telephone              = $tel;
        }
        if ($fax != null){
            $crumbs->faxNumber              = $fax;
        }
        if ($eml != null){
            $crumbs->email                  = $eml;
        }
        if ($ics != null){
            $ics = $ics;
        }else{
            $ics = '';//buildCompleteLink('/images/bishare.png');
        }
        $crumbs->logo                     = $ics;
        $crumbs->image                    = $ics;

        // PENDING -------------------------------
        // aggregateRating
        // paymentAccepted


        // openingHours
        // Will use openingHoursSpecification
        if ($hp != null){
            if (count($hp) > 0){
            $crumbs->openingHoursSpecification = array();
            $days = array(
                "http://schema.org/Monday",
                "http://schema.org/Tuesday",
                "http://schema.org/Wednesday",
                "http://schema.org/Thursday",
                "http://schema.org/Friday",
                "http://schema.org/Saturday",
                "http://schema.org/Sunday"
            );
            for($i=0; $i < count($hp); $i++){
                for($x=0; $x < count($hp[$i]['hours']); $x++) {
                    $ohs = new \stdClass();
                    $ohs->{'@type'} = "OpeningHoursSpecification";
                    $ohs->dayOfWeek = $days[intval($hp[$i]['intDay'])];
                    $ohs->opens     = substr($hp[$i]['hours'][$x]['start'], 0, -2) . ":" . substr($hp[$i]['hours'][$x]['start'], -2).":00";
                    $ohs->closes    = substr($hp[$i]['hours'][$x]['end'], 0, -2) . ":" . substr($hp[$i]['hours'][$x]['end'], -2).":00";
                }
                $crumbs->openingHoursSpecification[] = $ohs;
            }
            }
        }

        return json_encode($crumbs);
    }


    public static function checkReCaptcha($app, $token){
        $uri = 'https://www.google.com/recaptcha/api/siteverify';
        if ($app['config']['brand.country'] == 'uy'){
          $app['logger']->warning('Validating recaptcha for UY...');
          $secretKey = '6LcIPzwUAAAAAChqVrQSzTN-aiiksP-HQJJ2FMKt';
        }else{
          $app['logger']->warning('Validating recaptcha for PY...');
          $secretKey = '6LfzeqEaAAAAAFNrbCZEjSigy12spk9Q1mPPqJqg';
        }

        $app['logger']->debug('checkReCaptcha|Checking  reCpatcha ' . $token . '...');
        $data = array(
            'secret'   => $secretKey,
            'response' => $token
        );
        $curl_post_data = http_build_query($data);
        
        $curl = curl_init($uri);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_VERBOSE, 0);
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $curl_post_data);
        curl_setopt($curl, CURLOPT_TIMEOUT, 30);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        $curl_response = curl_exec($curl);
        $httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $curlErr  = curl_errno($curl);
        curl_close($curl);

        // Check HTTP Code
        if ($curlErr != 0){
            $app['logger']->error('checkReCaptcha|CURL failed with code ['.$curlErr.'] for ('.$uri.')');
            return FALSE;
        }
        if ($httpcode != 0 && $httpcode != 200){
            $app['logger']->error('checkReCaptcha|CURL failed with http status ['.$httpcode.'] for ('.$uri.')');
            return FALSE;
        }
        // Check response
        if ($curl_response === false) {
            $info = curl_getinfo($curl);
            curl_close($curl);
            $app['logger']->error('checkReCaptcha|Error occured during curl exec. Additioanl info: ' . var_export($info));
            return FALSE;
        }
        // Check response
        $app['logger']->debug('checkReCaptcha| Server returned: ['.$curl_response.']');

        $res = json_decode($curl_response);
        
        if ($res->success){
            return TRUE;
        }else{
            return FALSE;
        }
    }

    public static function buildLOC($idr, $ids){
        return 'LOC'.((intval($idr) * 10000) + intval($ids));
    }

    public static function checkBot(){
        return (
            isset($_SERVER['HTTP_USER_AGENT'])
            && preg_match('/bot|crawl|slurp|spider|mediapartners|facebookexternalhit/i', $_SERVER['HTTP_USER_AGENT'])
        );
    }

    public static function printIndexWeekDay ($macroFlag)  {
        $arrDays = array();
        if ( ($macroFlag & MAP_DAY_1) == MAP_DAY_1){
          array_push($arrDays, 1);
        }
        if ( ($macroFlag & MAP_DAY_2) == MAP_DAY_2){
          array_push($arrDays, 2);
        }
        if ( ($macroFlag & MAP_DAY_3) == MAP_DAY_3){
          array_push($arrDays, 3);
        }
        if ( ($macroFlag & MAP_DAY_4) == MAP_DAY_4){
          array_push($arrDays, 4);
        }
        if ( ($macroFlag & MAP_DAY_5) == MAP_DAY_5){
          array_push($arrDays, 5);
        }
        if ( ($macroFlag & MAP_DAY_6) == MAP_DAY_6){
          array_push($arrDays, 6);
        }
        if ( ($macroFlag & MAP_DAY_7) == MAP_DAY_7){
          array_push($arrDays, 7);
        }
      
        return $arrDays;
    }
    
    public static function printWeekDay($prefix, $macroFlag){
        $arrDays = array();
        $index = 0;
        $output = $prefix;
        if ( ($macroFlag & MAP_DAY_0) == MAP_DAY_0){
            array_push($arrDays, 'Domingo');
        }
        if ( ($macroFlag & MAP_DAY_1) == MAP_DAY_1){
            array_push($arrDays, 'Lunes');
        }
        if ( ($macroFlag & MAP_DAY_2) == MAP_DAY_2){
            array_push($arrDays, 'Martes');
        }
        if ( ($macroFlag & MAP_DAY_3) == MAP_DAY_3){
            array_push($arrDays, 'Miercoles');
        }
        if ( ($macroFlag & MAP_DAY_4) == MAP_DAY_4){
            array_push($arrDays, 'Jueves');
        }
        if ( ($macroFlag & MAP_DAY_5) == MAP_DAY_5){
            array_push($arrDays, 'Viernes');
        }
        if ( ($macroFlag & MAP_DAY_6) == MAP_DAY_6){
            array_push($arrDays, 'Sabado');
        }
        
        $countDays = count($arrDays);
        for ($i=0; $i < $countDays; $i++){
            if ($i == 0){
            $output .= " " . $arrDays[$i];
            }else if ($i > 0 && $i < $countDays -1){
            $output .= ", " . $arrDays[$i];
            }else if ($i == $countDays -1){
            $output .= " y " . $arrDays[$i];
            }
        }
        return $output;
    }

    public static function buildAttrImagePath($atrId, $opId){
        $staticURL = 'https://static.tingelmar.com/atr/';
        if ($opId != NULL){
            return $staticURL.'bh-'.$atrId.'-'.$opId.'.png';
        }else{
            return $staticURL.'bh-'.$atrId.'.png';
        }
    }

    public static function getCurrentTime($country){
      if (strtolower($country) == 'uy'){
        return new DateTime('now', new \DateTimeZone('America/Argentina/Buenos_Aires'));
      }else if (strtolower($country) == 'py'){
        return new DateTime('now', new \DateTimeZone('America/Argentina/Buenos_Aires'));
      }else{
        return new DateTime();
      }
    }

    public static function getCurrentTimeAsString($country, $format='Y-m-d H:i:s'){
      $date = Util::getCurrentTime($country);
      return $date->format($format);
    }

    public static function getHourMapNumber($hour){
      if ($hour == 0){
        return MAP_HOUR_00;
      }else if ($hour == 1){
          return MAP_HOUR_01;
      }else if ($hour == 2){
          return MAP_HOUR_02;
      }else if ($hour == 3){
          return MAP_HOUR_03;
      }else if ($hour == 4){
          return MAP_HOUR_04;
      }else if ($hour == 5){
          return MAP_HOUR_05;
      }else if ($hour == 6){
          return MAP_HOUR_06;
      }else if ($hour == 7){
          return MAP_HOUR_07;
      }else if ($hour == 8){
          return MAP_HOUR_08;
      }else if ($hour == 9){
          return MAP_HOUR_09;
      }else if ($hour == 10){
          return MAP_HOUR_10;
      }else if ($hour == 11){
          return MAP_HOUR_11;
      }else if ($hour == 12){
          return MAP_HOUR_12;
      }else if ($hour == 13){
          return MAP_HOUR_13;
      }else if ($hour == 14){
          return MAP_HOUR_14;
      }else if ($hour == 15){
          return MAP_HOUR_15;
      }else if ($hour == 16){
          return MAP_HOUR_16;
      }else if ($hour == 17){
          return MAP_HOUR_17;
      }else if ($hour == 18){
        return MAP_HOUR_18;
      }else if ($hour == 19){
          return MAP_HOUR_19;
      }else if ($hour == 20){
          return MAP_HOUR_20;
      }else if ($hour == 21){
          return MAP_HOUR_21;
      }else if ($hour == 22){
          return MAP_HOUR_22;
      }else if ($hour == 23){
          return MAP_HOUR_23;
      }else{
          return -1;
      }
    }

    public static function checkMapHour($country, $mapHour){

      $timestamp = Util::getCurrentTimeAsString($country, 'YmdHis');
      $currTime  = explode('|', Util::getCurrentTimeAsString($country, 'w|H'));
      $currHour  = Util::getHourMapNumber($currTime[1]);

      return ( (($mapHour & $currHour) == $currHour)  || $mapHour == NULL);
    }

    public static function sendMailPrivate($app, $subject, $from, $to, $html_body, $cc){
      $host = 'http://'.$app['config']['ngage.host'];
      if ($app['config']['ngage.port'] != NULL && strlen($app['config']['ngage.port']) > 0){
        $host .= ':'.$app['config']['ngage.port'];
      }
      $uri = $host.'/sender/sendprivate';
      $curl_post_data = array(
        'to'          => $to,
        'cc'          => $cc,
        'source'      => $from,
        'subject'     => $subject,
        'htmlBody'    => $html_body,
        'campaignId'  => $app['config']['ngage.defaultCampaign']
      );
      $headers = array( 'Content-Type:application/json');

      $curl = curl_init($uri);
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
      curl_setopt($curl, CURLOPT_HEADER, 0);
      curl_setopt($curl, CURLOPT_VERBOSE, 0);
      curl_setopt($curl, CURLOPT_POST, 1);
      curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($curl_post_data));
      curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
      curl_setopt($curl, CURLOPT_TIMEOUT, 30);
      
      $app['logger']->info('sendMailPrivate|Sending mail to '.$to.' through '.$uri);

      $curl_response = curl_exec($curl);
      $httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
      $curlErr  = curl_errno($curl);
      curl_close($curl);
      $finish = microtime(true);
      $app['logger']->info('sendMailPrivate| result for '.$uri.' is ['. $httpcode .']');
      // Check HTTP Code
      if ($curlErr != 0){
          throw new Exception('sendMailPrivate|CURL failed with code ['.$curlErr.'] for ('.$uri.')');
      }
      // Check response
      if ($curl_response === false) {
          $info = curl_getinfo($curl);
          curl_close($curl);
          $this->logger->error('sendMailPrivate|Error occured during curl exec. Additioanl info: ' . var_export($info));
          throw new Exception('sendMailPrivate|JSON is invalid for request ('.$uri.')');
      }
      // Check response
      $res = json_decode($curl_response);
      return $res;
    }
}
