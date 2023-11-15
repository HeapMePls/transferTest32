### 5.3.0
 + Se agrega tiktok
 + Se agrega telegram
 + Fix en URLs para compartir
 + Se agrega handy y POS
  
### PENDING
 + gmPiid que retorne si es fevoirto y/o si hizo comentario 
 + JS2 en comercio
 + JS2 en listado
 + JS2 en subapps
 + CWV en novedades y otras paginas secundarias
 + Agregar banners como publicaciones en novedades
 + Puedo entrar a https://test.1122.com.uy/login estando logueado
 + Entro a https://test.1122.com.uy/ y no aparezco logueado

### 5.2.X (2021-XX-XX)
 + Fixes de CWV en pagina de:
   + novedades
   + comentarios - https://1122.com.uy/app.php/comentarios/la-fortaleza-pizzeria/LOC442760001
 + Que onda con gmrelatedprods en la API ?? quien lo llama?
 + Sacar el protector de Facebook o hacerlo mas suave
 + En web hacer que el login vuelva a la misma pagina

### 5.2.9 (2022-03-28)
 - Agregado de tag de mal pagador para ocultar info en perfil de comercio

### 5.2.8 (2021-11-02)
 - Se agrega clase de icono de Youtube en compilado de pagina de local
 - Se agrega imagen por defecto cuando no tiene cover de local
 - Se arregla generacion de imagen NOIMS en LD+JSON en comercio

### 5.2.7 (2021-10-19)
 - Se agrega link de agregar negocio en menu mobile cuando no esta logueado y en toolbar en desktop
 - Se deja fijo el header en mobile
 - Se cambia el mensaje de mejorar presencia si es dueño al final del perfil de comercio

### 5.2.6 (2021-10-04)
 - Agregado de Facebook Pixel para UY
 - Ajustes menores de auditoria SEO

### 5.2.5 (2021-09-06)
 - Compilado para PY
 - Ajuste de tamaño de imagen y de estilos de promo en perfil
 - Ajuste de link de empresas en menu movil.

### 5.2.4 (2021-08-24)
#### Fixes
 - Agregar accessToken a rubrozona
 - Se corrige foto de promo en perfil en version web
 - Se carga el nombre de usuario y mail en reportar informacion erronea
 - Se cambia atributo `decode` por `decoding` para carga async en tag img.
 - Fixes de CWV en pagina de:
   - comercio       [LCP] (cuando el mapa es el LCP)
   - galerias       [CLS] [CLP] http://localhost:8315/fotos/barraca-maldonado/262120001
   - galeria        [CLS] [CLP] http://localhost:8315/galeria/la-fortaleza-pizzeria/442760001/7900
   - cartelera      [CLS]
   - cartelera view [CLS] [CLP] 

### 5.2.3 (2021-07-30 - BETA9)
#### Fixes
 - Fix de estilo de buscador en home
 - Fix de comentario sin registro con clave incorrecta de usuario ya existente
 - Se corrigen textos en pagina de quienes somos.

### 5.2.2 (2021-07-19 - BETA8)
### Fixes
 - Se agrega searchBox2 en mobile en la home.
 - Se corrige Json+LD de comercio.

### 5.2.1 (2021-07-16 - BETA8)
### Fixes
 - Se corrige carga de rubro en nuevo componente de buscador de JS.


### 5.2.0 (2021-07-16 - BETA8)
#### New
 - Nueva version de JS2 en home
 - Nueva carga de javascript dedicada por pagina para dar soporte de JS2.

#### Fixes
 - Se corrigen links en pagina de novedades.
 - Se corrige links a azar en paginas de error y se redirecciona a home cuando se accede al link cuando no es UY.
 - Se corrige el `addressCountry` en el LD-JSON de `LocalBusiness`.
 - Se corrige estilo de comentarios en novedades en home

### 5.1.1 (2021-06-07 - BETA7)
#### Fixes
 - Se corrige ver mas rubros (`listadoRubrosPrincipales.html`) para que la zona sea dinamica
 - Se corrigen los departamentos por pais en el generador de sitemap
 - Ajuste de departamentos principales en pagina de error y error 404.
 - Ajuste de L&F en pagina de error
 - Se corrigen armado de los links en la pagina y componente de novedades 
 - Se agrega H1 a paginas: contacto, login, quienes somos, solicitud de presupuesto.
 - Se corrige largo de `meta description` en home, horoscopo, contacto, login, quienes, comercio y buscador.
 - Se corrige largo de `meta title` en horoscopo, promociones, quienes, contacto, local. 

### 5.1.0 (2021-05-27 - BETA6)
#### New
 - Se agrega modal de fast login para comentar en pagina de comercio sin estar logueado antes.
 - Cambio de look&feel de pagina de login

#### Fixes
 - Se corrigen URLs de `/loc` y `/neg` para casos de URLs mal armadas.
 - Ajuste de menu en mobile
 - Ajustes de CWV 
   - CLS en pagina de galeria y promocion
   - CLP en home

### 5.0.3 (2021-05-07 - BETA5)
#### Fixes
 - Se corrige subscripcion push para soporte de multipais
 - Se corrige eventos nuevos de push en serviceWorker
 - Se corrige rubros sin nombre en vista buscador.
 - Ajuste de url de register
 - Ajuste de layout de quoteView
 - Ajuste de JS de login
 - Ajuste de gulpBuild


### 5.0.2 (2021-04-09 - BETA3)
#### Fixes
 - Se corrige redireccion de pagina de producto para BuscoInfo
 - Se ajusta estilo de productos relacionados en pagina de producto.
 - Se corrige envio de evento de GAnalytics en CTA de perfil.
 - Se agrega codigo de AdSense de BuscoInfo a Ads.txt.
 - Se cambian lo redirect para BuscoInfo de 302 a 301.
 - Se corrige mostrado de zonas cercanas en buscador para cuando no tienen nombre.
 - Se ajusta pagina de quienes somos.
 
### 5.0.1 (2021-04-08 - BETA2)
#### Fixes
 - Se ajusta estilo en promos en pagina de rubro (promobox)
 - Pagina de favoritos y pedidos no tiene estilo
 - Ajuste de formulario de contacto para manejar las keys por pais

### 5.0.0 (2021-04-08 - BETA1)
#### New
 - Soporte para multi-marca
   - Soporte para estilos propios
   - Soporte para configuracion de APIs y marcas en INIs
   - Soporte para configuracion de servicios
     - Anaylitics
     - Ads
 - Nuevo diseño
   - Se sustituye el carrousel de swiper a keen-slider (based on: https://itnext.io/javascript-sliders-will-kill-your-website-performance-5e4925570e2b)
   - Nuevo home (mas datos mas rapido)
   - Nueva pagina de novedades

#### Fixes
 - Se mejora mostrado de URL en pagina de perfil, galeria y video
 - Se mejora mostrado de telefono multiples en pagina de perfil, galeria y video


### 4.11.4 (2021-07-21)
#### Fixes
 - Ajuste de compilado para seccion de cartelera
 
### 4.11.3 (2021-05-06)
#### Fixes
 - Ajuste de url de register
 - Ajuste de layout de quoteView
 - Ajuste de JS de login
 - Ajuste de gulpBuild

### 4.11.2 (2021-04-09)
#### Fixes
 - Se corrige envio de evento de GAnalytics en CTA de perfil.

### 4.11.1 (2021-04-06)
#### Fixes
 - Se corrige mostrado de URL en pagina de galeria y video.

### 4.11.0 (2021-02-23)
#### Fixes
 - Se corrige pagina /register
 - Fixes CLS en paginas
   - Home        - /
   - Buscar      - /buscar/farmacias/maldonado
   - Rubro       - /rubro/reparaciones-cortadoras-cesped/PRD10036289
   - Video       - /video/genesis-decoraciones/687070001/VT6wp5Yp1W0
   - Galerias    - /fotos/pizzeria-la-siciliana/294090001
   - Galeria     - /galeria/pizzeria-la-siciliana/294090001/952
   - Comentarios - /comentarios/genesis-decoraciones/LOC687070001
   - Contacto    - /contacto
   - TyC         - /terminos-y-condiciones
   - Politica    - /politica-privacidad

### 4.10.3 (2021-02-23)
#### Fixes
 - Se re-ajustan paths a iconos en head de layout.

### 4.10.2 (2021-02-23)
#### Fixes
 - Se ajustan paths a iconos en head de layout.

### 4.10.1 (2021-02-19)
#### Fixes
 - Ajuste de css compilado para carrusel de colecciones en home
 - Se agrega manejo de local borrado (API)
 - Se agrega promo en perfil (API)
 - Se ajusta titulo y descripcion en OpenGraph para que no ponga la categoria adelante
 - Se corrige error en pag de video cuando el local no tiene rubros
 - Se corrigen estilos criticos para mejorar CLS
 - Se corrigen estilos para pagina de producto agregado

### New 
 - Se mejora compilador de JS/CSS

### 4.10.0 (2021-01-29)
#### New
  - Se agrega soporte de reservas
  - Nuevo layout de pagina de comercio
    - Se ajusta boton CTA en desktop
  - Se sustituye MomentJs por DayJs
  - Se ajustan redirect 301 por 302
  - Se agrega nuevo metodo de obtencion de rubros relacionados en pagina de perfil.
  - Nueva página de galerias
    - Perfil - mostrar ultimas fotos y boton de ver mas con link a pag de galerias
    - Compile - compilar ultimas fotos, no todas las galerias
    - Reserva - Poner la misma logica de galerias de comercio
  - Armado de carrusel con imagenes nuevas (pics)
  - Orden de imagenes en perfil y carrusel por seleccion de favoritas
    
#### Fixes
  - Se corrige metadata de descripcion de video en pagina de video
  - Se corrige look and feel de datos de comercio en pagina de video y galeria 

### 4.9.13 (2020-10-16)
#### New
  - Se cambia API de home
  - Se agregan formas de pago de MercadoPago y Tarjeta MIDES.

### 4.9.12 (2020-09-14)
#### Fixes
  - Se corrige pagina de video (control de nombre de comercio e inyeccion de banners)

### 4.9.11 (2020-09-03)
#### Fixes
  - Actualizacion de favicons (manifest)

### 4.9.10 (2020-08-21)
#### New
  - Ajuste de version

### 4.9.8 (2020-08-21)
#### New
  - Nuevo logo
  - Se agrega captcha en pagina de contacto
  - Se saca la publicidad de categorias marcadas para adultos
    SON:
    - Masajes Eroticos *
    - Sexo *
    - Prostitutas *

    NO SON:
    - Travestis
    - Escort
    - Juguetes Eroticos
    - Peliculas Porno
    - Delivery Sex Shop
    - Sex Shops
    - Boutique Erotica (nombre de comercio) *
    - Sex Shop Kisme (nombre de comercio) *
      (Rubros: Sex Shops, Afrodisiacos, Delivery Sex Shop, Gel Intimo, Juguetes Eroticos, Lenceria Erotica, Peliculas Porno,  Tangas)
    - Armas, Armerias, Escopetas, Pistolas, Revolveres *
    - Tabacaleras (Montepaz Tabacalera) * (por tobacco)
    - local/whiskeria-pikaros/LOC307250001 * (por alcohol) 
      (rubro: Whiskerias)
    - promociones-y-ofertas (promo con foto dudosa)

    * paginas bloqueadas en AdSense 

### Fix
  - Se ajusta letra enie en categorias en pagina comercio. 

### 4.9.7 (2020-07-28)
#### New
  - Se agrega filtro de bot para PetalBot
  - Se cambia titulo de comercio
    ```
    Antes: "    Aislaciones Termicas Poliuretano Del Sur en Mercedes  | Guía Móvil 1122"  
    Ahora: "Poliuretano Del Sur | Aislaciones Termicas | Mercedes | Guía Móvil 1122"
    ```

#### Fix
  - Se corrige pagina de video para cuando no tiene foto de perfil 
  - Se corrigen estilos en promos de paginas de resultados y perfil.
  - Se corrige carga de iconos de negocio en mapa de resultados
  - Se corrige estilos en negocios adicionales en solicitud de presupuesto
  - Se corrige carga de store de uberto cuando no tiene productos y falla
  - Se maneja el caso de que no exista mas un video y se redirecciona al perfil del comercio
  - Se maneja el caso de que no existan mas promociones para un sponsor, y se redirecciona al home de promos
  - Se maneja el caso de que no exista mas un local en la pagina de video

### 4.9.6 (2020-03-31)
#### Fix 
  - Boton de cerrar en productDescription popup
  - Ajuste de estilo de favoritos (problema de compilacion)

### 4.9.5 (2020-03-26)
#### Fix 
  - Ajustes de L&F en carrito de tienda chica movil.

### 4.9.4 (2020-03-25)
#### Fix 
  - Se corrige armado de dias en checkout en Uberto
  - Se corrige carga de mapa en agregar direccion en checkout 
  - Se corrige estilos en orderView.

### 4.9.3 (2020-02-01)
#### Fix 
  - Se actualiza funcion de htmlentities para tiles.
  - Se actualizan formato de Ads para version mobile.
  - Se corrige mostrado de comentarios en base a "Allow Public Comments".
  - Se corrige verificacion de promos en controller listadoPromociones.
  - Se corrige verificacion de videos en controller comercio.

### 4.9.2 (2019-07-24)
#### New 
  - Se actualiza JS de Leaflet
  - Se agrega nuevo lazy loader para imagenes
  - Se agrega carga de imagenes WEBP donde este disponible

#### Fixes
  - Fixes de Accessibility, Best Practices
  - Se ajusta la carga de banners
  - Cross-origin destinations: Redes Sociales. Target _blank sin nofollow noref
  - Se corrige estilo de icono 24 horas en perfil de comercio
  - Se corrige carga de carrusel zuck cuando no tiene portada

### 4.9.1 (2019-07-10)  
#### New 
  - Soporte para nuevos Banners/AdManager

### 4.9.0 (2019-07-02)  
#### Fix
  * Se agrega if de control de campos para mostrar o no mostrar en caso de que el negocio este pagando o no
  * Se corrige mobile usability de pagina de todos los rubros.
  * Se corrige layout de pagina de promo multilocal
  * Ajustes de layout de datos basicos en perfil de comercio
  * Fix de carrusel de imagenes en ficha de promo
  * Fix de parsley en reportar error
  * Se eliminan los siguientes twigs que ya no se usan:
    - /sponsor.html.twig
    - /rubroZona.html.twig
    - /zona.html.twig
    - /rubro.html.twig
    - /contacto.html.twig
  * Se agrega el header a la pagina de sponsor
  * Se corrige interfaz con camara en quoteRequest para update de Chrome.
  * Fix de pagina multilocal cuando ya no existe (redirect 301)

#### New
  * Se cambia carga de mapas
  * Se cambia L&F de buscador en header
  * Nuevo header 
  * Nuevo carusel de portadas en perfil de comercio (si tiene galerias y paga)
  * Se agrega mercado libre como red social
  * Se agrega rating al SD de comercio
  * Se quitan las categorias de atributos del perfil de comercio
  * Se cambia numeracion de version para ser compatible con npm.
  * Se agrega badge de verificado
    - Algoritmo:
        Si esta pagando y hace menos de 36 meses que se actualizo, si hace mas no se muestra
        ```
        Total locales: 71.844
        Con contrato activo: 8.394
        Actualizados en los ultimos 12 (365) meses  : 3.571 (43% con contrato) (5% del total)
        Actualizados en los ultimos 24 (730) meses  : 5.262 (63% con contrato) (7% del total)
        Actualizados en los ultimos 36 (1095) meses : 6.480 (77% con contrato) (9% del total)
        Actualizados en los ultimos 48 (1460) meses : 7.135 (85% con contrato) (10% del total)
        ```
  * Se agregan CSS compilados y purgados por pagina
  * Preparacion de banners con nuevo AdManager
  
    
### 4.08 (2019-06-10)
  * Agregar UA de FacebookBot
  * Quitar reintentos de API (se deja 1)
  * Se agrega UA y XFwdFor como header en APIService.
  * Se agrega proteccion de Bot antes de arrancar la app.

### 4.07 (2019-05-08)
  * Nuevo sitemap.
  * Fix de campo telephone e image en SD de LocalBusiness en comercio.
  * Fix de redirect en comercio cuando no se encuentra el PID o el local fue borrado.
     (Se cambia a Redirect con 301 y 302)
  * Fix de campo url en SD de LocalBusiness en comercio para cuando tenian mas de una URL ingresada en comercio.url.

### 4.06 (2019-04-26)
  * Fix de pagina de visualizacion de presupuesto

### 4.05 (2019-04-22)
  * Ajustes de Mobile Usability
  * Ajustes de L&F para tablet

### 4.04 (2019-04-10)
  * Se cambia para que la pagina de 404 se retorne como 200 y con NOINDEX
    ```
    /rubro-zona/rocha/flameadores/PRD10109906/Z14
    /rubro-zona/centro/cursos-automaquillaje/PRD10034827/Z01002
    ```
  * Se crean archivos de critical 
  * Se agrega carga de CSS con deferred loading
    ```
    - Home
    - Comercio, ReportarError
    - Buscador, Rubro, RubroZona, Zona
    - PromoHome, PromoView, PromoSponsor
    - Azar, Horoscopo, CarteleraHome, CarteleraView
    - Login, Favorites, Requests, Contacto
    - QuoteRequest, OrderView, OrderRequestSmall, Checkout, ProductAdded, OrderRequestBig, ProductDescription, QuoteRequestConfirm, QuoteView, quoteReview, orderReview
    - QuienesSomos, Contacto, TyC, Politica
    - Galeria
    - Video
    - Error, Error404
    ```
  * Se disminuye el tamanio del CSS
  * Se agrega preconnect para SmartAd.
  * Se quita ShareThis y se lo hace manual.
  * Se corrige manejo de cuando no existe la galeria de un comercio o ya no existe el comercio (se redirige al perfil con 301 para sumar la URL)
  * Se corrige accesibilidad en algunas paginas
  * Se corrige manejo de galeria que ya no existe (se redirige al negocio de la galeria)
  * Se corrige manejo de promocion que ya no existe (se redirige a promo home)
  * Se corrige manejo de locales que no existe y se retornan vacios desde la API.

### 4.03 (2019-04-01)
  * Se actualiza codigo de GA.
  * Se quita Facebook Page Widget de Comercio, Buscador, Galeria, Video
  * Se quita Facebook SDK de todas las paginas
  * Se quita Google Font
  * Se convierten imagenes fijas a webp (se actualiza lazyload)
  * Se cambia carga de JS 
  * Se corrige mostrado de perfil de comercio sin rubros o promos
  * Se agrega canonical a rubroZona, zona, reportarError. (SEO: duplicate with no canonical)
  * Se agrega retorno de status code 404 cuando no hay resultados
    
    ```
    ACTUAL:
    https://1122.com.uy/rubro-zona/estacion-atlantida/parapsicologia/PRD5708/Z03014
    NUEVO:
    https://test.1122.com.uy/rubro-zona/estacion-atlantida/parapsicologia/PRD5708/Z03014

    ACTUAL:
    https://1122.com.uy/buscar/asdasdasdad/artigas  
    NUEVO:
    https://test.1122.com.uy/buscar/asdasdasdad/artigas  

    ACTUAL:
    https://1122.com.uy/rubro-zona/guazuvira-nuevo/asdhgsfsa/PRD10101795/Z03116  
    NUEVO:
    https://test.1122.com.uy/rubro-zona/guazuvira-nuevo/asdhgsfsa/PRD10101795/Z03116 
    ```

  * Se pone opcion de mejora a buscador de rubroZona  
    ```
    ACUTAL:
    https://1122.com.uy/rubro-zona/parque-lecocq/joyerias/PRD1000647/Z01117
    NUEVO:
    https://test.1122.com.uy/rubro-zona/parque-lecocq/joyerias/PRD1000647/Z01117

    ACTUAL:
    https://1122.com.uy/rubro-zona/guazuvira-nuevo/policlinicas/PRD10101795/Z03116  
    NUEVO:
    https://test.1122.com.uy/rubro-zona/guazuvira-nuevo/policlinicas/PRD10101795/Z03116  
    ````

### 4.02 (2018-12-04)
  * Se corrige pagina de evento de cartelera cuando ya no existe el evento.
    ej: http://1122.com.uy/cartelera/deadpool-2/10113865
  * Se actualiza plugin de Facebook (appId + script js).
  * Se corrige pagina de galeria cuando no tiene icono el negocio.
    ej: http://1122.com.uy/galeria/sanitario-y-revestimiento-daniel-furez/636730001/1091
  * Se agrega gadget de buscador para paginas viejas que lo referencian.
  * Se ajustan banners (tags y posiciones)

### 4.01 (2018-12-02)
  * Se vuelve al generador de claves de cache anterior.

### 4.00 (2018-11-15)
  * Se corrige mostrado de logo de promotor en listado de promociones de un local en perfil.
  * Ajustes L&F.
  * Se agrega link a Blog e Instagram en footer.
  * Se cambia link de mapas a maps.tingelmar.com.
  * Se agrega corrige y agrega soporte para eñies en perfil.
  * Se actualiza la inyeccion de banners por nueva version de SmartAd.
  * Se modifica la suscripcion a notificaciones para que solo pida en Uberto
  * Se cambian los time-to-live del cache (redis) a dinamicos dependiendo del comando
  * Se agrega boton de "Como llegar" en perfil.
  * Se agregan eventos de GA
    - Perfil -> Llamada, Como llegar, Web, Mail, default CTA button
  * Se cambia layout de promoview
  * Se agrega configuracion de CTA Button
    Whatsapp: https://faq.whatsapp.com/en/general/26000030/?category=5245251
  * Se agregan atributos principales y generales.
  * Se agregan iconos a medios de pago.
  * Se mejora header para version mobile.
  * Se quita cache para predictivos de productos y zonas.
  * Se agrega compartir nativo para celulares.

### 3.03 (2018-07-25)
  * Se validan los productos por dia
  * Se guarda el userId en los presupuestos en caso de estar logeado
  * Se corrige error en el carrito (mostraba siempre la misma cantidad)
  * Se manejan las variantes en los customFields de los productos 
  * Se sorrige constantes en ApiCallerService.
  * Se agrega la extension htmlentities para el manejo de los tildes.

### 3.02 (2018-06-27)
  * Se agrega lazy-load en azar y horoscopo.
  * Se ajusta tamanio y posicion de reveal de AddProduct.
  * Se corrige ortografia en confirmacion de quote.
  * Se ajusta variantes en Uberto.

### 3.01 (2018-06-21)
  * Se agrega lazy loading a imagenes en buscador y comercio (SEO - Offscreen images)
  * Se agrega carga de mapa asincronica en buscador y comercio (SEO - render-blocking JS/CSS)
  * Se ajustan links de header (SEO - link accessibility)
  * Se ajustan tamaños de letras (SEO - accessibility)
  * No pide getUserData o getDeviceToken cuando es bot
  * No hace skip cache en gmPiid cuando es bot
  * Se agrega prueba de nuevo codigo de Analytics.
  * se corrige mostrado de video en pagina de video y en comercio.

### 3.00 (2018-06-06)
  * Se corrige chequeo de abierto en hora de inicio en punto.
  * Se mejora autocompletado en cajas de busqueda.
  * Se cambia zona por defecto en home a Montevideo cuando no hay ultima zona conocida.
  * Se pasa el assetVersion a global para que sea visible en todas partes.
  * Se agrega soporte de usuarios (login, logout, register, forgotpass)
  * Se agrega pagina de guardados
  * Se permite realizar comentarios en comercios
  * Se permite recomendar (me gusta o no me gusta) un comercio al momento de hacer un comentario.
  * Se cambia header para que sea tipo componente (con twig + controller propios)
  * Se modifica servicio de la API para permitir indicar si saltear cache o no
    (aplica para los comandos de accion como login, logout, favoritos, etc)
  * Se agrega recordar datos de usuario en formulario de presupuesto.
  * Se agrega soporte de pedidos multiples para presupuestos.
  * Se agrega mapa de OpenStreetMap en comercio y resultList.
  * Se agrega mostrado de horarios especiales para fechas especiales en comercio.
  * Se aplica cambio de look & feel
  * Se aplican mejoras de SEO.
  * Se agrega reCaptcha en pedido de presupuesto
  * Se arman canonical con https

### 2.06 (2018-02-27)
  * Se mejoran mostrados de montos (con moneda y decimales)
  * Se ajustan precios opcionales cuando valen $0.
  * Se ajusta calculo de adicional en agregar producto y se agrega costos al carrito.
  * Se ajustan precios en checkout.
  * Se corrige calculo de horarios de apertura en orderMenu.
  * Se corrige mostrando de opcion tipo lista sin precio.
  * Se agregan headers NOINDEX a paginas de Uberto de usuarios (listado de pedidos, vista de presupuesto, resenia, vista de pedido, resenia de pedido, checkout)
  * Se actualiza robots.txt para no indexar paginas de Uberto de usuarios.
  * Se agrega pagina de referencia a formulario de contacto.
  * Se agrega subject y body a mailto de info@1122.com.uy en el footer.
  * Se agregan datos estructurados para los productos en storeStart.
  * Se ajusta mostrado de zonas de cobertura.
  * Se ajusta armado de preview de galerias.
  * Se corrige link de ver todos los rubros.
  * Se agrega el archivo Ads.txt

### 2.05 (2018-01-19)
  * Se corrige filtrado de pagina de promociones por sponsor y categorias.
  * Se ajusta estilo y mensaje de no encontrados en filtrado de promociones.
  * Se ajustan datos estructurados para Google y Facebook.
    - imagenes grandes en ambos
    - datos tipo negocio en facebook, con imagen grande y datos de direccion y geo

### 2.04 (2018-01-09)
  * Se actualiza el precio del SMS en el footer.
  * Se ajustan URLs en tag canonical para que sean https.

### 2.03 (2017-10-31)
  * Se corrige assetVersion en layout para tomar el ultimo CSS.

### 2.02 (2017-10-26)
  * Ajustes de Uberto.
  * Ajuste de cookie de lastzone y agregado en paginas de rubro-zona y zona.
  * Ajuste de generacion de sitemap.

### 2.01 (2017-10-09)
  * Se ajusta mostrado de errores en formularios.
  * Se corrige envio de reporte de error y contacto.
  * Se corrige inicializacion de JS en pagina de azar.
  * Se corrige pagina rubro-zona para cuando no hay resultados.

### 2.00 (2017-08-15)
  * General | Se actualiza a Foundation 6.
  * General | Se agrega menu en header.
  * Ultima posicion | Se guarda la posicion de las ultimas busquedas o la zona del negocio accedido (cookie.lastzone).
  * Promociones | El listado general ordena por cercania basado en la ultima zona accedida por el usuario (cookie.lastzone).
  * Uberto | Se agrega soporte de pedidos.
  * Uberto | Se agrega soporte de solicitudes de presupuestos.
  * Uberto | Se agrega soporte de serviceWorker para recepcion de WebPush.

### 1.41 (2017-06-27)
  * Primer deploy equipo Guía 1122

### 1.40 (2017-06-16)
  * Se modifican los banners en mobile para usar tags top, middle y bottom.
  * Se quitan banners de componentes de promociones ya que los banners se cargan en las paginas que los incluyen.
  * Se modifica pagina de comercio para no mostrar banners cuando el comercio paga

### 1.39 (2017-04-28)
  * Se ajusta configuracion de banners para actualizar nuevos tags.
  * Se pasa todo a HTTPs para no generar contenido mixto.

### 1.38 (2017-04-06)
  * Se agrega manejo de error 153 de API.
  * Se agrega nuevo tratamiento para locales marcados como borrados.
  * Se agrega la URI en el error handler global.
  * Se agrega manejo de retries en APICaller.

### 1.37 (2017-02-17)
  * Se agrega carrusel de promos premium en rubro, rubroZona, zona y busqueda (solo en 1ra pagina).
  * Se agrega badge especial en item de resultado en rubro, rubroZona, zona y busqueda.
  * Se agrega badge especial de promo en comercio para sponsor premium.
  * Se agrega listado de sucursales para un comercio en comercio.
  * Se ajusta pagina de promos de un sponsor (se cambia solicitar tarjeta por mas informacion que lleva al perfil del sponsor)
  * Se modifica carga de sponsors en home para solo pedir los premiums.
  * Se mejora pagina de promo con multiples locales.
  * Se agrega tabla de horarios y formas de pago en comercio.

### 1.36 (2016-12-09)
  * Cambios en estilo general.
  * Se re-ajusta armado de URL de web de un comercio.
  * Se separan los archivos CSS segun media queries.
  
### 1.35 (2016-10-25)
  * Se agrega visualizacion de galerias de negocios.  
    Se muestra una previsualizacion de galerias en vista comercio.  
    Se agrega visualizador de galeria por javascript en vista comercio.  
    Se agrega nueva vista de galeria para cuando no esta habilitado javascript o para los robots.  
  * Se agrega visualizacion de videos de negocios.  
    Se muestra una previsualizacion de videos en vista comercio.  
    Se agrega visualizador de video por javascript en vista comercio.  
    Se agrega nueva vista de video para cuando no esta habilitado javascript o para los robots.  
  * Se modifica el mostrado de promos de un negocio en comercio   
    No se muestra datos de sponsor si es 1122 y layout.
  * Se agrega nuevo FilterTag para AdServer: sponsored(0=no paga, 1=alguna vez pago, 2=esta pagando
  * Se agrega etiqueta de bonus de promo en listados (busqueda, rubro, rubro-zona) para los comercios que tienen promo.
    
### 1.34 (2016-10-06)
  * Bug fixing

### 1.33 (2016-09-20)
  * Se arreglo el carrousell de galeria de imagenes en promo (no funcionaba para avanzar de imagen ni retroceder).
  * Se agrego boton de adherir mi comercio en home, rubro, rubrozona, zona y detalle de comercio.
  * Controles en inconsistencias de datos

### 1.32 (2016-08-08)
  * Fixes log. 
  * Se modifican todos los PID por LOC. 
  * Ajustes en la carga de comercio y relacionados. 
  * Se modifica carga de condiciones de promos asociadas por la que viene en la API en comercio.
  * Se agrega archivo de verificacion de sitio de SearchConsole para el usuario tingelmar.apps
  * Galería de fotos en promociones.

### 1.31 (2016-07-21)
  * Se agrego compartir por Whatsapp.
  * Se agrego página de Términos y Condiciones.
  * Se agrego página de Política de Privacidad (ambas paginas linkeadas en el footer).

### 1.30 (2016-06-27)
  * Fix error atributo rel
  * Fix error zonaNombre
  * Carga de relacionados desde gmpiid
  * Imagenes adherir comercio
  * Id negocios relacionados
  * Telefonos detalle comercio

### 1.29 (2016-06-14)
  * Listado
  * Se modifica el titulo del listado (contenido, texto y pre-titulo)
  * Se modifican las placas con sombra y mas separadas
  * Se agrega badge de 24 hrs y promo
  * Se agrega texto adicional a la placa
  * Carousel promos relacionadas
  * Se agrega carousel con promociones relacionadas en detalle de comercio.
  * Detalle de comercio
  * Se agrega badge de 24 hrs y promo
  * Se agranda nombre de comercio
  * Se agregan sugerencias de busquedas debajo del breadcrumb (arriba de la caja de detalles de comercio)
  * Se mejora listado de promociones del local
  * Se agrega lista de categorias del comerico
  * Se modifica cantidad de comercios en lista de relacionados a 5 y se agrega distancia mejorada

### 1.28 (2015-11-06)
  * Ajustes de SEO (más contenido) en promociones y locales

### 1.27 (2015-10-28)
  * Nuevo formulario de Adherir comercio

### 1.26 (2015-09-17)
  * Ajustes formulario reportar error

### 1.25 (2015-09-07)
  * Se agrego nueva landing

### 1.24 (2015-08-12)
  * Ajustes estilos locales deudores

### 1.23 (2015-08-07)
  * Ajustes en bloque destacados

### 1.22 (2015-08-04)
  * Cambios de Martín (Destacado, Relacionados y Reporte de Error)

### 1.21 (2015-06-25)

  * Se ajusto la landing

### 1.20 (2015-06-19)

  * Se agrego un landing

### 1.19 (2015-06-09)

  * Ajustes en composer update -o

### 1.18 (2015-06-08)

  * Ajustes en composer update -o

### 1.17 (2015-05-29)

  * Se ajusto la inclusion del SAS Map

### 1.16 (2015-05-28)

  * Falto urlize en breadcrumb rubro de la pagina comercio

### 1.15 (2015-05-28)

  * Se activo el redis nuevamente

### 1.14 (2015-05-28)

  * Cambios post seo

### 1.13 (2015-05-08)

  * Se agrego mensaje de locales cerrados

### 1.12 (2015-05-05)

  * Pagina de error responsiva y mejoras SEO

### 1.11 (2015-04-30)

  * ajuste de SEO

### 1.10 (2015-04-30)

  * ajuste urlize en lista de zonas

### 1.9 (2015-04-29)

  * ajuste canonical

### 1.8 (2015-04-28)

  * ajuste damian seo

### 1.7 (2015-04-27)

  * ajuste en los estilos

### 1.6 (2015-04-27)

  * cambios en el seo por solicitud de javier pietroroia

### 1.5 (2015-04-17)
     
  * ajustes en gear disk

### 1.4 (2015-04-15)

  * Cambios en los iconos galeria

### 1.3 (2015-04-14)

  * Se agrego la ip LCaraballo para acceder al sitio test.1122.com.uy

### 1.2 (2015-04-13)

  * Correcciones en el sipmap creator

### 1.1 (2015-04-08) 

  * Mejoras de Seo, clases 
