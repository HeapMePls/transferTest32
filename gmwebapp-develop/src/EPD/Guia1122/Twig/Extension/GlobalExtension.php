<?php

namespace EPD\Guia1122\Twig\Extension;

use Twig_Function_Method;
use Mobile_Detect;
use EPD\Guia1122\Util\Urlizer;
use EPD\Guia1122\Util\Util;

class GlobalExtension extends \Twig_Extension
{

    private $mobileDetect;

    public function __construct()
    {
        $this->mobileDetect = new Mobile_Detect();
    }

    public function getFunctions()
    {
        return array(
            'urlize'   => new Twig_Function_Method($this, 'urlize'),
            'isMobile' => new Twig_Function_Method($this, 'isMobile'),
            'sasTag'   => new Twig_Function_Method($this, 'sasTag'),
            'procTime' => new Twig_Function_Method($this, 'procTime'),
        );
    }

    public function urlize($text, $separator = '-')
    {
        return Urlizer::urlize($text, $separator);
    }

    public function isMobile()
    {
        return ( $this->mobileDetect->isMobile() && !$this->mobileDetect->isTablet());
    }

    public function sasTag($spage, $format)
    {
        $oasMap = Util::sasMap();
        $page = $oasMap['pages']['Guia_Movil_1122/' . $spage];

        return '<script type="text/javascript">
                    epd_ads("' . $format . '");
                </script>';
                    //sas.call("std", {siteId: ' . $oasMap['stid'] . ', pageId: ' . $page['pgid'] . ', formatId: ' . $page['formats'][$format] . '});
    }

    public function procTime($decimals = 3)
    {
        return number_format(microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'], $decimals);
    }

    public function getName()
    {
        return 'guia_1122_global_extension';
    }

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('distance'      , [$this, 'distanceFilter']),
            new \Twig_SimpleFilter('momentCalendar', [$this, 'momentCalendarFilter']),
            new \Twig_SimpleFilter('momentFromNow' , [$this, 'momentFromNowFilter']),
            new \Twig_SimpleFilter('cost'          , [$this, 'costFilter']),
            new \Twig_SimpleFilter('price'         , [$this, 'priceFilter']),
            new \Twig_SimpleFilter('niceMinutes'   , [$this, 'niceMinutes']),
            new \Twig_SimpleFilter('htmlentities'  , [$this, 'htmlentities']),
            new \Twig_SimpleFilter('asWebp'        , [$this, 'asWebp']),
        ];
    }

    public function distanceFilter($dst)
    {
        if ($dst < 1000){
          return "a " . $dst . " mts"; // Es muy lejos, no muestro distancia porque no tiene sentido.
        }else  if ($dst > 1000 && $dst < 100000){
            return "a " . round(($dst / 1000), 2) . " kms";
        }else{
          return "";
        }
    }

    public function momentCalendarFilter($date)
    {
        $tempDate = new \Moment\Moment($date, 'UTC');
        return $tempDate->calendar();
    }

    public function momentFromNowFilter($date)
    {
        $tempDate = new \Moment\Moment($date, 'UTC');
        return $tempDate->fromNow();
    }

    public function costFilter($val)
    {
        return number_format((float)$val, 2, ',', '.');
    }

    public function priceFilter($price){
        $formatedPrice       = explode(',', number_format ($price, 2, "," , "."));
        $priceToShow         = $formatedPrice[0];
        $priceDecimalsToShow = ','.$formatedPrice[1];
        $priceCurrency       = '$U';
        return '<span class="currency">'.$priceCurrency.'</span> '.$priceToShow.'<span class="decimals">'.$priceDecimalsToShow.'</span>';
    }

    public function niceMinutes($mins){
        return Util::buildNiceMinsTime($mins);
    }

    public function htmlentities($text){
        // Old
        // return htmlentities($text, ENT_HTML401,'UTF-8');
        
        // New 1
        // $transText = htmlentities($text, ENT_QUOTES | ENT_HTML401, 'UTF-8');
        // if (strlen($transText) == 0){
        //   $transText = htmlentities($text, ENT_QUOTES | ENT_HTML401, 'ISO-8859-1');
        // }
        // return $transText;

        // New 2
        return htmlspecialchars($text, ENT_QUOTES, "UTF-8");
    }

    public function asWebp($imgsrc){
        return str_replace('.jpg', '.webp', str_replace('.jpeg', '.webp', str_replace('.png', '.webp', $imgsrc)));
    }
}
