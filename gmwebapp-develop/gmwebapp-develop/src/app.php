<?php

$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/home.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/contacto.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/rubroZona.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/comercio.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/todosLosRubros.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/promociones/promocionesHome.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/promociones/promocionesFicha.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/promociones/promocionesTodas.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/promociones/promocionesSponsor.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/multiLocal.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/buscador.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/rubro.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/zona.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/sponsor.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/sas/sas.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/sitemapCreator.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/terminosCondiciones.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/politicaPrivacidad.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/galeria.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/video.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/pushpackage.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/gadgets.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/reservar.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/galerias.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/feed.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/reviews.php');

// ------------------------ COMPONENTS ------------------------------
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/header.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/storeIcon.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/listadoZonas.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/listadoRubros.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/listadoProveedores.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/listadoPromociones.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/listadoDestacados.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/uberto/uberto.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/uberto/quoteView.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/uberto/quoteAccept.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/uberto/productOrderMenu.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/components/feed.php');

// ------------------------ UBERTO ------------------------------
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/uberto/store.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/uberto/orderCheckout.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/uberto/orderView.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/uberto/quoteRequest.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/uberto/quoteAnswerView.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/uberto/quoteView.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/uberto/requestsList.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/uberto/productOrderMenu.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/uberto/orderCheckoutConfirm.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/uberto/storeMenu.php');

// ------------------------ SUBAPPS ------------------------------
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/subapps/cartelera.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/subapps/horoscopo.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/subapps/azar.php');

// ------------------------ USER ------------------------------
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/user/login.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/user/logout.php');
$app->mount('/', include_once __DIR__ . '/EPD/Guia1122/Controller/user/favorites.php');