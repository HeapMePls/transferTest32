<?php

$redis = new Redis();
$redis->connect('127.0.0.1', 6379); 
$redis->setOption(Redis::OPT_SCAN, Redis::SCAN_RETRY);
//$redis->setOption(Redis::OPT_PREFIX, 'dev_guia1122');

function niceTTL($ttl){
    $hours = ($ttl/60/60);
    if ($hours > 24){
        $hours = $hours / 24;
        return round($hours, 1) . ' days';
    }else{
        return round($hours, 1) . ' hours';
    }
}

$info = $redis->info();
echo "Info:\n";
echo "--------------------------------------------\n";
print_r($info);
echo "--------------------------------------------\n";

$info = $redis->select(0);

echo "Listing keys: \n";
echo "--------------------------------------------\n";

$totalKeys = 0;
$it = NULL;
$pattern = "*gmPiid*";
while ($arr_keys = $redis->scan($it)) {
    foreach($arr_keys as $str_key) {
        echo " - {$str_key} \n";
        $ttl = $redis->ttl($str_key);
        echo "   |_ Exp: " . date("m/d/Y h:i:s a", time() + $ttl ) . " (" . niceTTL($ttl) . ")\n";
        $totalKeys++;
    }
}
echo "--------------------------------------------\n";
echo " TOTAL: " . $totalKeys . "\n";
echo "--------------------------------------------\n";

$redis->close();
?>
