// ************************** CONFIGURATION **********************************
//const BRAND        = "BUSCOINFO";
const BRAND = "GUIAMOVIL";
var appjsFiles = ["web/js/app/**/*.js"];

// NOTE: jQuery is required as standalone at HTML so it does not need to be included here.
var vendorsjsFiles = [
  "web/js/vendors/modernizr/modernizr-2.8.3.js",
  "web/js/vendors/jquery/2.2.4/jquery.min.js",
  "web/js/vendors/jqueryui/1.12.1/jquery-ui.min.js",
  "web/js/vendors/fastclick/1.0.6/fastclick.min.js",
  "web/js/vendors/jquery-placeholder/2.0.8/jquery.placeholder.min.js",
  "web/js/vendors/foundation/foundation.js",
  //'web/js/vendors/Swiper/4.2.6/swiper.min.js',
  "web/js/vendors/keen-slider/5.4.0/keen-slider.min.js",
  // 'web/js/vendors/moment.js/2.22.1/moment.min.js',
  "web/js/vendors/dayjs/dayjs.min.js",
  // 'web/js/vendors/moment.js/2.22.1/locale/es.js',
  "web/js/vendors/dayjs/es.min.js",
  "web/js/vendors/dayjs/utc.min.js",
  "web/js/vendors/dayjs/relativeTime.min.js",
  "web/js/vendors/storage/js.storage.min.js",
  "web/js/vendors/lazysizes/lazysizes.min.js",
  "web/js/vendors/easyautocomplete/jquery.easy-autocomplete.min.js",
  "web/js/vendors/sticky/jquery.sticky.js ",
];

if (BRAND == "BUSCOINFO") {
  var allcssFiles = [
    "web/css/bi/foundation.css",
    // 'web/css/bi-categs.css',
    "web/css/bi/style.css",
    "web/css/bi/style.mobile.css",
    "web/css/bi/style.tablet.css",
    "web/css/jquery-ui.min.css",
    "web/css/jquery-ui.structure.min.css",
    "web/css/jquery-ui.theme.min.css",
    //'web/css/swiper.css',
    "web/css/font-awesome.min.css",
    "web/js/vendors/tarekautocomplete/autoComplete.css",
  ];
} else {
  var allcssFiles = [
    "web/css/foundation.css",
    // 'web/css/bi-categs.css',
    "web/css/style.css",
    "web/css/style.mobile.css",
    "web/css/style.tablet.css",
    "web/css/jquery-ui.min.css",
    "web/css/jquery-ui.structure.min.css",
    "web/css/jquery-ui.theme.min.css",
    // 'web/css/swiper.css',
    "web/css/font-awesome.min.css",
    "web/js/vendors/tarekautocomplete/autoComplete.css",
  ];
}
var allimgFiles = ["web/img/**/*.jpg", "web/img/**/*.png", "web/img/**/*.svg"];

var distFolder = "web";
var distFolderJs = distFolder + "/js/dist";
var distFolderCss = distFolder + "/css/dist";
var distFolderImgs = distFolder + "/img";
var distFolderFonts = distFolder + "/css/fonts/";
var distFolderTemplates = distFolder + "/templates/";

// **************************** INCLUDES **************************************

// Include gulp & its plugins
var gulp = require("gulp");
var gutil = require("gulp-util");
var gpConcat = require("gulp-concat");
var gpRename = require("gulp-rename");
var gpUglify = require("gulp-uglify");
var gpMinifyCSS = require("gulp-minify-css");
var gpJscs = require("gulp-jscs");
var jsCommentless = require("gulp-strip-comments");
var HtmlCommentless = require("gulp-remove-html-comments");
var gpReplace = require("gulp-replace");
var gpRimraf = require("gulp-rimraf");
var gpImagemin = require("gulp-imagemin");
var runSequence = require("run-sequence");
var gs = require("gulp-selectors");
var gpLec = require("gulp-line-ending-corrector");
var gpHtmlMin = require("gulp-htmlmin");
var gpw3cjs = require("gulp-w3cjs");
var filelog = require("gulp-filelog");
var pjson = require("./_package.json");
var purgecss = require("gulp-purgecss");
var critical = require("critical").stream;
var request = require("request");
var fs = require("fs");
var del = require("del");
var size = require("gulp-size");
var terser = require("gulp-terser");

// ***************************** INITIALIZE ****************************************

process.setMaxListeners(0);

var today = new Date();
var appVersion = pjson.version;
var postfix = "-" + appVersion + "-" + today.getYear() + (today.getMonth() + 1) + today.getDate() + today.getHours() + today.getMinutes();
var vendorjsName = "vendors" + postfix + ".js";
var appjsName = "app" + postfix + ".js";
var appcssName = "style" + postfix + ".min.css";
var accessToken = "";
var deviceToken = "";
var accessTokenCookie = "";
var deviceTokenCookie = "";
// if (BRAND == 'BUSCOINFO'){
//   accessToken       = '5OEmaBFXJQtr666lboQfo8QsSHzafQT9GQOAF6S8SAQ9xpOPk3BmPGMwpEfa8ry0';
//   deviceToken       = 'QR7KYV7S4VOAdYG4gED8sevAeCOOQdMyVdiu3CO0EXg';
//   accessTokenCookie = '_biwa_ut';
//   deviceTokenCookie = '_biwa_dt';
// }else{
accessToken = "4uVoQ9h9oYkvPZnk9TWkDZDVBDZshmv1uBwIU7ZGKFBHFRqNkHXeysFeVZlGYGAJ";
deviceToken = "vdN2rF0cCtAHQQ4kwNQy7HPIL-cnPRkSdpkj-Y5CL5w";
accessTokenCookie = "_gmwa_ut";
deviceTokenCookie = "_gmwa_dt";
// }
var brandPrefix = BRAND == "BUSCOINFO" ? "bi" : "gm";
// clean dyn
gulp.task("cleanDyn", function () {
  gutil.log("Deleting previous dymanic files...");
  var filesToDelete = ["web/css/dist/style-*", "web/css/dist/c/c-*", "web/css/dist/p-" + brandPrefix + "/p-*", "src/EPD/Guia1122/views/_inlinecss/" + brandPrefix + "/c-*", "web/js/dist/vendors-*", "web/js/dist/app-*", "web/js/dist/parts/*", "/tmp/gm-*"];
  return del(filesToDelete, { force: true });
});

//
// *************************** JS SECTION ************************************
//
// Compile App
gulp.task("jsapp", function () {
  var jsAppSize = size({ showTotal: false });
  var jsFinalAppSize = size({ showTotal: false });
  gutil.log(">>---------------------------------------------------");
  gutil.log("Compiling application JS files...");
  var stream = gulp
    .src(appjsFiles)
    //.pipe(filelog())
    .pipe(gpConcat(appjsName))
    .pipe(jsAppSize)
    .pipe(gpUglify().on("error", gutil.log))
    .pipe(jsFinalAppSize)
    .pipe(gulp.dest(distFolderJs));
  stream.on("end", function () {
    gutil.log(gutil.colors.green("Application JS files compiled successfully."));
    gutil.log("   JS APP size       : " + gutil.colors.bold(gutil.colors.magenta(jsAppSize.prettySize)));
    gutil.log("   JS APP final size : " + gutil.colors.bold(gutil.colors.magenta(jsFinalAppSize.prettySize)));
    gutil.log("<<---------------------------------------------------");
  });
  stream.on("error", function (err) {
    gutil.log("Error ocurred compiling JS App files:");
    gutil.log(err);
    gutil.log("<<---------------------------------------------------");
  });
  return stream;
});

// Compile Vendors Libs
gulp.task("jslib", function () {
  var jsLibSize = size({ showTotal: false });
  var jsFinalLibSize = size({ showTotal: false });
  gutil.log(">>---------------------------------------------------");
  gutil.log("Compiling 3rd party JS files...");
  var stream = gulp
    .src(vendorsjsFiles)
    //.pipe(filelog())
    .pipe(gpConcat(vendorjsName))
    .pipe(jsLibSize)
    .pipe(gpUglify())
    .pipe(jsFinalLibSize)
    .pipe(gulp.dest(distFolderJs));
  stream.on("end", function () {
    gutil.log(gutil.colors.green("3rd party JS files compiled successfully."));
    gutil.log("   JS LIB size       : " + gutil.colors.bold(gutil.colors.magenta(jsLibSize.prettySize)));
    gutil.log("   JS final LIB size : " + gutil.colors.bold(gutil.colors.magenta(jsFinalLibSize.prettySize)));
    gutil.log("<<---------------------------------------------------");
  });
  stream.on("error", function (err) {
    gutil.log("Error ocurred compiling 3rd party JS files:");
    gutil.log(err);
    gutil.log("<<---------------------------------------------------");
  });
  return stream;
});

gulp.task("injfiles", function () {
  gutil.log(">>---------------------------------------------------");
  gutil.log("Injecting JS files...");
  // Get replace
  var stream = gulp
    .src("app/bootstrap.php")
    .pipe(gpReplace(/'filesSignature',.*'.*?'/g, "'filesSignature', '" + postfix + "'"))
    .pipe(gulp.dest("app/"));
  stream.on("end", function () {
    gutil.log(gutil.colors.green("Finished injecting JS files"));
    gutil.log("<<---------------------------------------------------");
  });
  stream.on("error", function (err) {
    gutil.log("Error");
    gutil.log(err);
    gutil.log("<<---------------------------------------------------");
  });
  return stream;
});

// === === === === === === === === === === === === === === === === === === === === ===
// Bambustech Lab
// Experiment: Web Javascrit 2nd generation
//     Home
//        Current JS => (184+539)  723 Kb  || Home new JS => 41.7 Kb   ||  -681.3 Kb (-94.2%)
//        Current Performance score (Local LAB)      => Mobile: 60 || Desktop: 95
//        New Performance score (Local LAB)          => Mobile: 64 || Desktop: 99
//        Current Performance score (Production LAB) => Mobile: ?? || Desktop: ??
//
//
// https://www.omnicalculator.com/math/percentage-change
//

//
// *************************** JS 2.0 - Smart JS Compiler ***************************
//
var baseJSFiles = ["web/js/vendors/storage/js.storage.min.js", "web/js/vendors/lazysizes/lazysizes.min.js", "web/js2/app.js", "web/js2/config.js", "web/js2/common/logger.js", "web/js2/common/utils.js", "web/js2/common/webpush.js", "web/js2/common/worker.service.js"];
var pagesJS = [
  {
    name: "home",
    prefix: "h",
    files: baseJSFiles.concat(["web/js2/common/reveal.js", "web/js/vendors/tarekautocomplete/autoComplete.min.js", "web/js2/components/autocomplete.component.js", "web/js2/pages/home.js"]),
  },
];
gulp.task("js2", function (cb) {
  gutil.log(">>---------------------------------------------------");
  gutil.log("Compiling Javascript files (smart compiler)...");

  Promise.all(
    pagesJS.map((item) => {
      return new Promise(function (resolve, reject) {
        var itemSize = size({ showTotal: false });
        var finalItemSize = size({ showTotal: false });
        var filename = item.prefix + postfix + ".js";
        gutil.log("Compiling JS file for " + item.name + "...");
        gulp
          .src(item.files)
          .pipe(filelog())
          .pipe(gpConcat(filename))
          .pipe(itemSize)
          .pipe(terser().on("error", gutil.log))
          .pipe(finalItemSize)
          .pipe(gulp.dest(distFolderJs + "/parts"))
          .on("error", function (err) {
            gutil.log(gutil.colors.red("Error generating javascript for " + item.name));
            gutil.log(err.message);
            reject();
          })
          .on("end", function () {
            gutil.log("   JS file for " + gutil.colors.green(item.name) + " as (" + filename + ") Size from: " + gutil.colors.bold(gutil.colors.magenta(itemSize.prettySize)) + " to: " + gutil.colors.bold(gutil.colors.green(finalItemSize.prettySize)));
            resolve();
          });
        //.pipe(gulp.dest('web/css/dist/c'));
      });
    })
  )
    .then(function () {
      gutil.log("Javascript files compiled successfully.");
      gutil.log("<<---------------------------------------------------");
      cb();
    })
    .catch(function (err) {
      gutil.log(gutil.colors.red("EXCEPTION SMART JS HDPPPP !"));
      gutil.log(err.message);
      gutil.log("<<---------------------------------------------------");
    });
});

// === === === === === === === === === === === === === === === === === === === === ===

// Prepare CSS
gulp.task("css", function () {
  gutil.log("Compiling CSS files...");
  var stream = gulp
    .src(allcssFiles)
    .pipe(filelog())
    .pipe(gpConcat(appcssName))
    .pipe(gpMinifyCSS({ keepSpecialComments: 0 }))
    //.pipe(gs.run(processors, ignores))
    .pipe(gulp.dest(distFolderCss));
  stream.on("end", function () {
    gutil.log(gutil.colors.green("CSS files compiled successfully."));
  });
  stream.on("error", function (err) {
    gutil.log("Error ocurred compiling CSS files:");
    gutil.log(err);
  });
  return stream;
});

gulp.task("images", function () {
  gutil.log("Compressing and copying images...");
  var stream = gulp
    .src(allimgFiles)
    .pipe(filelog())
    .pipe(gpImagemin({ progressive: true, optimizationLevel: 4 }))
    .pipe(gulp.dest(distFolderImgs));
  stream.on("end", function () {
    gutil.log(gutil.colors.green("Image files compressed and copied successfully."));
  });
  stream.on("error", function (err) {
    gutil.log("Error ocurred processing image files:");
    gutil.log(err);
  });
  return stream;
});

//
// *************************** CRITICAL CSS ************************************
//
var baseUrl = "http://localhost:8305/app_dev.php";
var commonForceInclude = ["buscador"];
var critBase = [
  "div",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "li",
  "p",
  "table",
  "tr",
  "td",
  "ul",
  ".large-uncollapse",
  ".medium-uncollapse",
  /^\.row/,
  /^\.small-collapse/,
  ".large-4",
  "large-12",
  "medium-12",
  "columns",
  ".medium-4",
  ".columns.sin-bordes",
  ".fa",
  /^\.camposbuscador/,
  "#guia-container",
  /^\.dropdown/,
  /^\.menu/,
  /^\.easy-autocomplete/,
  /^\.submenu/,
  /^\.is-dropdown-submenu/,
  /^\.first-sub/,
  /^\.vertical/,
  /^\.headerRightBtns/,
  /^\.buscador/,
  /^\.btnsBuscador/,
  /^\.btnBuscador/,
  /^\.header/,
  /header/,
  /^\.header-toolbar/,
];
var searchBox = [/^\.search-form/, /^\.autoComplete_wrapper/];
// UBERTO
// TOKEN DE PEDIDO
var ubRetailer = 55247;
var ubItemId = 46;
var ubItemPrice = 350;
var ubOrderToken = "55d885c376252e29631dbd55abae49cee11bd3f981aaf66344";
var ubQuoteToken = "55d885c471232d27691db754a4ae4dc2e41eddf981aa854e7a";

var pages = [
  {
    name: "h",
    url: baseUrl,
    forceInclude: [
      /^\.u-box-cntr/,
      /^\.cover/,
      /^\.reveal/,
      /^\.col-cntr/,
      /^\.gm-btn-categ/,
      /^\.gmad-top/,
      /^\.section-header/,
      /^\.homehead/,
      /^\.homeheadbtns/,
      /^\.homesearch/,
      /^\.homecategs/,
      /^\.homecolcntr/,
      /^\.homecolgrid/,
      /^\.homemorecategs/,
      /^\.homemoreclose/,
      /^\.camposbuscador/,
      /^\.breakline/,
      /^\.mpost-card/,
      /^\.home/,
    ].concat(critBase, searchBox),
  },
  {
    name: "b",
    url: baseUrl + "/buscar/delivery/punta-carretas",
    forceInclude: [
      ".resultadosbusqueda-subtitulo",
      /^\.resultadosbusqueda/,
      /^\.listado-comercios/,
      /^\.widget-relacionados-nuevo/,
      /^\.tbox/,
      /^\.dropdown-pane/,
      ".banner-recuadro",
      ".gmad-desktop",
      /^\#mapCntr/,
      /^\.u-box-cntr-wh/,
      ".separador",
      ".show-for-medium-only",
      /^\.u-box-cntr/,
      /^\.nbox/,
      ".listado-filter-button",
      "button",
      ".u-fab-button",
      "h2.resultadosbusqueda",
      /^\.item-comercio/,
      /^\.fa-tag/,
      /^\.fa-sliders/,
      /^\.promobox/,
      /^\.large-8/,
      /^\.medium-4/,
      /^\.medium-5/,
      /^\.small-12/,
      /^\.columns/,
      /^\.reveal/,
      /^\.list-com/,
    ].concat(critBase),
  },
  { name: "sr", url: baseUrl + "/buscar/asdasdsad", forceInclude: [].concat(critBase) },
  { name: "tlr", url: baseUrl + "/rubro/todos-los-rubros", forceInclude: [].concat(critBase) },
  { name: "co", url: baseUrl + "/contacto", forceInclude: [/^\.u-box-cntr/, /^\.contacto/, /^\.titulo/, /^\.ancho-total/, /^\.content/, /^\#contactForm/].concat(critBase) },
  { name: "aq", url: baseUrl + "/acerca/quienessomos", forceInclude: [].concat(critBase) },
  { name: "av", url: baseUrl + "/acerca/verificacion", forceInclude: [].concat(critBase) },
  { name: "tc", url: baseUrl + "/terminos-y-condiciones", forceInclude: [/^\.u-box-cntr/, /^\.letra-gris/, /^\.legal/].concat(critBase) },
  { name: "pp", url: baseUrl + "/politica-privacidad", forceInclude: [/^\.u-box-cntr/, /^\.letra-gris/, /^\.legal/].concat(critBase) },
  { name: "feed", url: baseUrl + "/novedades", forceInclude: [].concat(critBase) },
  // Promos
  { name: "ph", url: baseUrl + "/promociones-y-ofertas", forceInclude: [/^\.tarjeta-promo/].concat(critBase) },
  { name: "pa", url: baseUrl + "/promociones-y-ofertas/0/0/otros-productos/10", forceInclude: [/^\.tarjeta-promo/].concat(critBase) },
  { name: "ps", url: baseUrl + "/promociones/club-el-pais/30898", forceInclude: [/^\.tarjeta-promo/].concat(critBase) },
  { name: "pv", url: baseUrl + "/promocion/bond-street/10109818", forceInclude: [/^\.large-12/, /^\.medium-12/, /^\.small-12/, /^\.columns/, /^\.large-8/, /^\.medium-8/, /^\.u-box-cntr/, /^\.section-subheader/, /^\.section-header-left/].concat(critBase) },
  { name: "pml", url: baseUrl + "/multilocal/8-cuotas-sin-recargo/10112318", forceInclude: [].concat(critBase) },
  // Subapps
  { name: "a", url: baseUrl + "/azar", forceInclude: [/^\.widget-relacionados-nuevo/, /^\.store-card/].concat(critBase) },
  { name: "ho", url: baseUrl + "/horoscopo", forceInclude: [/^\.widget-relacionados-nuevo/].concat(critBase) },
  { name: "ca", url: baseUrl + "/cartelera/-/0/0", forceInclude: [/^\.movie-card/, /^\.large-3/, /^\.medium-4/, /^\.small-12/, /^\.columns/, /^\.row/, /^\.align-spaced/, ".gmad-top"].concat(critBase) },
  {
    name: "cav",
    url: baseUrl + "/cartelera/renfield-asistente-de-vampiro/10116983",
    forceInclude: [
      /^\.u-box-cntr/,
      /^\.boxedlines/,
      /^\.letra-gris/,
      /^\.tabs/,
      /^\.fichaTabs/,
      /^\.tabs-title/,
      /^\.is-active/,
      ".section-header",
      ".section-header-left",
      ".section-subheader",
      /^\.tabs-content/,
      /^\.tabs-panel/,
      /^\.large-6/,
      /^\.medium-6/,
      /^\.small-12/,
      /^\.columns/,
      /^\.gm-simple-table/,
    ].concat(critBase),
  },
  // Comercio
  {
    name: "c",
    url: baseUrl + "/local/axion-bulevar/LOC599790001",
    forceInclude: [
      ".sugerenciaCategorias",
      ".sugeridasInline",
      /^\.ficha/,
      /^\.widget-relacionados/,
      /^\.infoFicha/,
      ".infoFichaSI",
      /^\.ranking/,
      ".badge-24h",
      /^\.header/,
      /^\.u-box-cntr/,
      /^\.nbox/,
      /^\.camposbuscador/,
      /^\.buscador/,
      ".retact-cntr",
      ".banner-recuadro",
      ".gmad-desktop",
      /^\.retact-def-btn/,
      /^\.boxedlines/,
      /^\.large-8/,
      /^\.medium-8/,
      /^\.small-12/,
      /^\.columns/,
      /^\.reveal/,
      /^\.ficha-cntr/,
      /^\.ficha-aside/,
      /^\.hours-table/,
      /^\.retact-btn/,
      /^\.categoriasComercio/,
      /^\.smStore-cntr/,
      /^\.smStore/,
      /^\.contenedor-ficha/,
      /^\.snet-cntr/,
      /^\.gal-pics-cntr2/,
      /^\.attr-lbl/,
      /^\.attr-val/,
      /^\.keen-slider-cntr/,
      /^\.keen-slider/,
      /^\.story-dots/,
      /^\.story-dot/,
      "textarea",
      /^\.btnLike/,
      /^\.btnDislike/,
      ".fa-thumbs-o-down",
      "fa-thumbs-o-up",
      "fa-youtube-play",
      /^\.promo/,
      /^\.promo-bonus/,
      /^\.promo-titulo/,
      /^\.promo-imagen/,
      /^\.promo-descripcion/,
    ].concat(critBase),
  },
  {
    name: "gs",
    url: baseUrl + "/fotos/genesis-decoraciones/687070001",
    forceInclude: [
      /^\.gal-cntr-goprofile/,
      "breadcrumbs",
      "sc",
      /^\.ficha/,
      /^\.infoFicha/,
      ".infoFichaSI",
      /^\.large-8/,
      /^\.medium-8/,
      /^\.small-12/,
      /^\.columns/,
      /^\.gals-cntr-pic/,
      /^\.large-12/,
      /^\.gal-cntr-full/,
      /^\.gal-cntr-pic/,
      /^\.u-box-cntr/,
      /^\.hours-table/,
      /^\.boxbody/,
      /^\.attr-cntr/,
      /^\.attr-lbl/,
      /^\.attr-val/,
      /^\.fp-list/,
      /^\.ranking/,
      ".badge-24h",
      /^\.gal-cntr-pic/,
      /^\.button/,
      /^\.large-uncollapse/,
      /^\.medium-uncollapse/,
      /^\.small-collapse/,
    ].concat(critBase),
  },
  {
    name: "g",
    url: baseUrl + "/galeria/genesis-decoraciones/687070001/7924",
    forceInclude: [
      /^\.gal-cntr-goprofile/,
      /^\.gal-cntr-full/,
      /^\.gal-cntr-pic/,
      "breadcrumbs",
      "sc",
      /^\.large-8/,
      /^\.medium-8/,
      /^\.small-12/,
      /^\.columns/,
      /^\.large-12/,
      /^\.ficha/,
      /^\.infoFicha/,
      ".infoFichaSI",
      /^\.u-box-cntr/,
      /^\.gal-image-full/,
      /^\.banner300x250/,
      /^\.separador/,
      /^\.show-for-medium-only/,
      /^\.banner-recuadro/,
      /^\.gmad-mobile-big/,
      /^\.button/,
      /^\.gmad-desktop/,
      /^\.vid-cntr/,
      /^\.attr-lbl/,
      /^\.attr-val/,
      /^\.attr-cntr/,
    ].concat(critBase),
  },
  { name: "re", url: baseUrl + "/reportarerror/LOC552470001", forceInclude: [/^\.ranking/, /^\.ficha/, ".infoFicha", ".infoFichaSI", ".badge-24h"].concat(critBase) },
  {
    name: "revs",
    url: baseUrl + "/comentarios/genesis-decoraciones/LOC687070001",
    forceInclude: [
      /^\.ranking/,
      /^\.ficha/,
      ".infoFicha",
      ".sc",
      ".infoFichaSI",
      ".badge-24h",
      ".attr-lbl",
      ".attr-val",
      ".button",
      /^\.comentarios/,
      /^\.gal-cntr-goprofile/,
      /^\.u-box-cntr/,
      /^\.boxbody/,
      /^\.gal-cntr-goprofile/,
      /^\.gmad-desktop/,
      /^\.banner-recuadro/,
      /^\.fp-list/,
      /^\.hours-table/,
    ].concat(critBase),
  },
  // User
  { name: "f", url: baseUrl + "/favs", forceInclude: [].concat(critBase) },
  { name: "l", url: baseUrl + "/login", forceInclude: [].concat(critBase) },
  // Uberto
  { name: "pl", url: baseUrl + "/pedidos", forceInclude: [/^\.widget-relacionados/, /^\.switch/, /^\.switch-input/, /^\.u-review-form/, /^\.u-quote-info-ret/, /^\.u-quote-info-resps/, /\.switch-active/, /\.switch-inactive/, /^\.large-10/].concat(critBase) },
  { name: "qr", url: baseUrl + "/presupuesto/guia-movil-1122/19719/1", forceInclude: [].concat(critBase) },
  { name: "qv", url: baseUrl + "/presupuesto/v/" + ubQuoteToken, forceInclude: [/^\.switch/, /^\.switch-input/, /^\.u-review-form/, /^\.u-quote-info-ret/, /^\.u-quote-info-resps/, /\.switch-active/, /\.switch-inactive/, /^\.large-10/, /^\.fa-thumbs-up/].concat(critBase) },
  { name: "or", url: baseUrl + "/pedir/beninca-y-cia/" + ubRetailer + "/1", forceInclude: [].concat(critBase) },
  { name: "os", url: baseUrl + "/pedir/genesis-decoraciones/68707/1", forceInclude: [].concat(critBase) },
  { name: "oc", url: baseUrl + "/pedido/checkout/" + ubRetailer + "/1/" + ubOrderToken, forceInclude: [].concat(critBase) },
  { name: "ov", url: baseUrl + "/pedidos/pedido/55db86c977262c296018bd58a4ae49cee11bd3f981aad96171?idr=" + ubRetailer + "&ids=1", forceInclude: [].concat(critBase) },
  { name: "pd", url: baseUrl + "/pd/poroto-manteca-5-kg/46/" + ubRetailer + "/1", forceInclude: [/^\.large-*/, /^\.medium-*/, /^\.small-*/, /^\.breadcrumbs/, ".sc", ".additional-image", ".principal-image", /^\.u-prod-rel/].concat(critBase) },
  { name: "pda", url: baseUrl + "/pedido/producto/agregado", forceInclude: [].concat(critBase), method: "POST", data: { token: ubOrderToken, idr: ubRetailer, ids: 1, id: ubItemId, price: ubItemPrice, quantityItem: 1 } },
  { name: "res", url: baseUrl + "/reservar/reiki-del-norte/775550001", forceInclude: [".sugerenciaCategorias", ".sugeridasInline", /^\.ficha/, /^\.widget-relacionados/, ".infoFicha", ".infoFichaSI", /^\.ranking/, ".badge-24h"].concat(critBase) },
];

gulp.task("critical-login", function (cb) {
  // Validate cookies before continue

  const url = "http://localhost:8302/login";
  const j = request.jar();
  gutil.log("Requsting login at " + url + " with user nacho@tingelmar.com...");
  request(
    {
      method: "POST",
      url: url,
      jar: j,
      form: {
        login: "login",
        inputUsername: "nacho@tingelmar.com",
        inputPassword: "nachito123",
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36",
      },
    },
    function (error, response, body) {
      const cookie_string = j.getCookieString(url);
      const cookies = j.getCookies(url);
      gutil.log("Checking response, looking for the AT cookie in the jar...");
      // console.log('---------------------------');
      // console.log(cookie_string);
      // console.log('---------------------------');
      // console.log(cookies);
      // console.log('---------------------------');
      var atFound = false;
      for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].key == "_biwa_ut") {
          accessToken = cookies[i].value;
          console.log("Found AT cookie =" + accessToken);
          atFound = true;
        }
      }
      if (!atFound) {
        gutil.log(gutil.colors.red("Could not get a valid AccessToken, CANNOT CONTINUE"));
        process.exit();
      }
    }
  );
});

gulp.task("critical-prepare", function (cb) {
  gutil.log(">>---------------------------------------------------");
  gutil.log("Compiling HTML files for CSS critical and purge processing...");

  const j = request.jar();
  var cookie = request.cookie(deviceTokenCookie + "=" + deviceToken);
  j.setCookie(cookie, "http://localhost");
  var cookie = request.cookie(accessTokenCookie + "=" + accessToken);
  j.setCookie(cookie, "http://localhost");

  var headers = { "User-Agent": "Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36" };

  Promise.all(
    pages.map((item) => {
      return new Promise(function (resolve, reject) {
        gutil.log("Downloading " + item.name + "...");
        var method = item.method ? item.method : "GET";
        request({
          method: method,
          url: item.url,
          headers: headers,
          jar: j,
          form: item.data ? item.data : null,
        })
          .on("response", function (response) {
            if (response.statusCode != 200) {
              gutil.log(gutil.colors.red(item.name + " file download returned error:" + response.statusCode));
              gutil.log("----------------");
              gutil.log("URL     : " + item.url);
              gutil.log("Method  : " + method);
              gutil.log("Headers : " + headers);
              gutil.log("Data    : " + JSON.stringify(item.data));
              gutil.log("----------------");
            } else {
              gutil.log(gutil.colors.green(item.name + " file downloaded OK (" + response.statusCode + ")..."));
            }
            resolve();
          })
          .on("error", function (err) {
            gutil.log(gutil.colors.red("ERRORR HDPPPP"));
            gutil.log(err.message);
            reject();
          })
          .pipe(fs.createWriteStream("/tmp/" + item.name + ".html"));
      });
    })
  )
    .then(function () {
      gutil.log("HTML files prepared successfully for critical.");
      gutil.log("<<---------------------------------------------------");
      cb();
    })
    .catch(function (err) {
      gutil.log(gutil.colors.red("EXCEPTION HDPPPP"));
      gutil.log(err.message);
      gutil.log("<<---------------------------------------------------");
    });
});

gulp.task("critical", ["critical-prepare"], function (cb) {
  var masterCssFile = "web/css/dist/style" + postfix + ".min.css";
  //var masterCssFile = 'web/css/style-4.04-11944115.min.css';

  gutil.log(gutil.colors.blue(">>---------------------------------------------------"));
  gutil.log("Starting critical with master css file " + masterCssFile + "...");

  Promise.all(
    pages.map((item) => {
      return new Promise(function (resolve, reject) {
        var itemSize = size({ showTotal: false });
        gutil.log("Genearating critical css " + item.name + "...");
        gulp
          .src("/tmp/" + item.name + ".html")
          .pipe(
            critical({
              base: "web/css/",
              inline: false,
              width: 1024,
              height: 1024,
              css: [masterCssFile],
              ignore: ["@font-face", /url\(/, /glyphicons-halflings-regular/g, /@font-face/g],
              penthouse: {
                forceInclude: commonForceInclude.concat(item.forceInclude),
              },
            })
          )
          .pipe(gpRename("c-" + item.name + postfix + ".css"))
          .pipe(itemSize)
          .pipe(gulp.dest("src/EPD/Guia1122/views/_inlinecss/" + brandPrefix + "/"))
          .on("error", function (err) {
            gutil.log(gutil.colors.red("Error generating critical css for " + item.name));
            gutil.log(err.message);
            reject();
          })
          .on("end", function () {
            gutil.log(gutil.colors.green("  Critical CSS _inlinecss/" + brandPrefix + "/c-" + item.name + postfix + ".css generated successfully: ") + gutil.colors.bold(gutil.colors.magenta(itemSize.prettySize)));
            resolve();
          });
        //.pipe(gulp.dest('web/css/dist/c'));
      });
    })
  )
    .then(function (resProms) {
      gutil.log(resProms.length + " critical CSS files prepared successfully.");
      gutil.log(gutil.colors.blue("<<---------------------------------------------------"));
      cb();
    })
    .catch(function (err) {
      gutil.log(gutil.colors.red("EXCEPTION HDPPPP"));
      gutil.log(err.message);
      gutil.log(gutil.colors.blue("<<---------------------------------------------------"));
    });
});

// ******************* NEW CSS (PURGED AND MINIFIED) ***************************

gulp.task("csspurged", function () {
  gutil.log(gutil.colors.blue(">>---------------------------------------------------"));
  gutil.log("Start compiling and purging CSS master...");
  var allFilesSize = size({ showTotal: false });
  var purgedFileSize = size({ showTotal: false });
  var finalFileSize = size({ showTotal: false });
  var stream = gulp
    .src(allcssFiles)
    //.pipe(filelog())
    .pipe(allFilesSize)
    .pipe(gpConcat(appcssName))
    .pipe(
      purgecss({
        content: ["src/EPD/Guia1122/views/**/*.twig"],
        whitelist: [
          /*Comercio*/ "fa-bookmark",
          "infoFichaSI",
          "u-box-cntr-wh",
          /*Gallery*/ "galviewer",
          "galspinner",
          "galspinnertext",
          "gal-cntr",
          "gal-prev",
          "galimg",
          "gal-next",
          "gal-info",
          "bizDetails",
          "galDetails",
          "gal-close",
          /*AutoComplete*/ "easy-autocomplete",
          "eac-description",
          "eac-item",
          /*FoundationReveal*/ "reveal-overlay",
          "reveal",
          "tiny",
          "u-reveal",
          "u-reveal-body",
          "u-reveal-footer",
          /*FoundationMenu*/ "dropdown",
          "menu",
          "is-dropdown-submenu-parent",
          "opens-left",
          "menu",
          "is-dropdown-submenu",
          "submenu",
          "first-sub",
          "vertical",
          "is-submenu-item",
          "is-dropdown-submenu-item",
          "is-active",
          "js-dropdown-active",
          /*FoundationDropDownPane*/ "dropdown-pane.is-open",
          "is-open",
          /*Maps*/ "gmMarkerDot",
          "gmMarkerDotSelected",
          "gmMarkerPin4",
          "gmMarkerPin4Selected",
          "rs-iw-cntr",
          /*PhotoPopup*/ "photoadd-btns-cntr",
          "u-quote-form-photoadd",
          "u-picture-cntr",
          /*Swiper*/ "swiper-container",
          "swiper-wrapper",
          "swiper-slide",
          "swiper-pagination",
          "swiper-pagination-bullet",
          "swiper-pagination-bullets",
          "swiper-pagination-bullet-active",
          "sw-nprms-next",
          "sw-nprms-prev",
          /*KeenSlider*/ "keen-slider-cntr",
          "keen-slider",
          "story-dots",
          "story-dot",
          /*Ads*/ "gmad-desktop",
          "gmad-top",
          "gmad-mobile",
          "gmad-mobile-big",
        ],
        whitelistPatterns: [
          /*Header*/ /u-tb-item/,
          /u-tb-item-selected/,
          /*Comercio*/ /ficha/,
          /snet-cntr/,
          /gal-image-ho/,
          /itemVideo/,
          /promocionesRelacionadas/,
          /store-card/,
          /badge-promo/,
          /img-sponsor-promo/,
          /faq/,
          /u-box-cntr/,
          /*FoundationMenu*/ /vertical/,
          /opens-left/,
          /opens-left/,
          /*Parsley*/ /\.parsley-errors-list/,
          /\.parsley-required/,
          /\.filled/,
          /parsley-error/,
          /*Uberto*/ /\.u-picture-cntr/,
        ],
        whitelistPatternsChildren: [
          /*Header*/ /u-tb-item/,
          /u-tb-item-selected/,
          /*Autocomplete*/ /easy-autocomplete-container/,
          /faq/,
          /search-form/,
          /autoComplete_wrapper/,
          /*Comercio*/ /ficha/,
          /tarjeta-promo/,
          /header-badges/,
          /promo/,
          /gal-pics-cntr2/,
          /gal-pics-cntr-column/,
          /u-box-cntr/,
          /smStore-cntr/,
          /smStore/,
          /*FoundationDropDownPane*/ /\.dropdown-pane/,
          /is-open/,
          /*Swiper*/ /swiper-container-fade/,
          /swiper-container-android/,
          /swiper-container-horizontal/,
          /*KeenSlider*/ /keen-slider-cntr/,
          /keen-slider/,
          /story-dots/,
          /story-dot/,
          /*Uberto*/ /u-quote-form-photoadd/,
          /*Parsley*/ /parsley-errors-list/,
          /parsley-required/,
          /filled/,
          /parsley-error/,
        ],
      })
    )
    .pipe(purgedFileSize)
    .pipe(gpMinifyCSS({ keepSpecialComments: 0 }))
    .pipe(finalFileSize)
    .pipe(gulp.dest(distFolderCss));
  stream.on("end", function () {
    gutil.log(gutil.colors.green("CSS files compiled successfully."));
    gutil.log("   Complete CSS size           : " + gutil.colors.bold(gutil.colors.magenta(allFilesSize.prettySize)));
    gutil.log("   Purged CSS size             : " + gutil.colors.bold(gutil.colors.magenta(purgedFileSize.prettySize)));
    gutil.log("   Minimized purged CSS size   : " + gutil.colors.bold(gutil.colors.magenta(finalFileSize.prettySize)));
    gutil.log(gutil.colors.blue("<<---------------------------------------------------"));
  });
  stream.on("error", function (err) {
    gutil.log("Error ocurred compiling CSS files:");
    gutil.log(err);
    gutil.log(gutil.colors.blue("<<---------------------------------------------------"));
  });
  return stream;
});

// ******************* NEW PAGE DEDICATED CSS's (PURGED AND MINIFIED) ***************************

// Complete Purged CSS Files
var cssPurgedWhitelists = {
  Comercio: ["fa", "fa-angle-right", "fa-angle-left", "fa-bookmark-o", "fa-calendar", "fa-calculator", "infoFichaSI", "fa-star", "check", "u-box-cntr-wh", "btnLikeSelected", "btnDislikeSelected", "badge-24h", "galvid", "ranking"],
  AutoComplete: ["fa-bookmark", "fa-times", "fa-shopping-cart", "easy-autocomplete", "eac-description", "easy-autocomplete-container", "eac-item"],
  Ads: ["gmad-desktop", "gmad-top", "gmad-mobile", "gmad-mobile-big"],
  FoundationReveal: ["reveal-overlay", "reveal", "tiny", "u-reveal", "u-reveal-body", "u-reveal-footer", "shrink", "fade-out", "mui-leave", "mui-leave-active"],
  FoundationMenu: ["fa-close", "dropdown", "menu", "is-dropdown-submenu-parent", "opens-left", "menu", "is-dropdown-submenu", "submenu", "first-sub", "vertical", "is-submenu-item", "is-dropdown-submenu-item", "is-active", "js-dropdown-active"],
  FoundationDropDownPane: ["dropdown-pane.is-open", "is-open"],
  Maps: ["gmMarkerDot", "gmMarkerDotSelected", "gmMarkerPin4", "gmMarkerPin4Selected", "rs-iw-cntr"],
  PhotoPopup: ["photoadd-btns-cntr", "u-quote-form-photoadd", "u-picture-cntr"],
  Gallery: ["galviewer", "galspinner", "galspinnertext", "gal-cntr", "gal-prev", "galimg", "gal-next", "gal-info", "bizDetails", "galDetails", "gal-close"],
  FormMsg: ["callout", "success", "small"],
  Swiper: ["swiper-container", "swiper-wrapper", "swiper-slide", "swiper-pagination", "swiper-pagination-bullet", "swiper-pagination-bullets", "swiper-pagination-bullet-active", "sw-nprms-next", "sw-nprms-prev"],
  KeenSlider: ["keen-slider-cntr", "keen-slider", "story-dots", "story-dot"],
};
var cssPurgedWhitelistPatterns = {
  Comercio: [/ficha/, /snet-cntr/, /gal-image-ho/, /itemVideo/, /promocionesRelacionadas/, /store-card/, /badge-promo/, /img-sponsor-promo/, /faq/, /u-box-cntr/, /smStore-cntr/],
  FoundationMenu: [/vertical/, /opens-left/, /opens-left/],
  FoundationReveal: [/reveal/],
  Parsley: [/parsley-errors-list/, /parsley-required/, /filled/, /parsley-error/, /close-button/],
};
var cssPurgedWhitelistPatternsCh = {
  Header: [/btnsBuscador/, /btnBuscador/, /buscador/, /header/, /menu/, /submenu/, /is-dropdown-submenu/, /first-sub/, /vertical/],
  Comercio: [/ficha/, /tarjeta-promo/, /header-badges/, /promo/, /comentarios/, /gal-pics-cntr2/, /gal-pics-cntr-column/, /faq/, /u-box-cntr/, /smStore-cntr/, /smStore/],
  FoundationDropDownPane: [/\.dropdown-pane/, /is-open/],
  FoundationReveal: [/reveal/],
  //Swiper                : [/swiper-container-fade/,/swiper-container-android/,/swiper-container-horizontal/],
  KeenSlider: [/keen-slider-cntr/, /keen-slider/, /story-dots/, /story-dot/],
  Parsley: [/parsley-errors-list/, /parsley-required/, /parsley-error/],
};

var cssPurgedFiles = [
  // -------------- HOME AND SUBAPPS
  {
    cssFileName: "p-h" /* HOME */,
    content: ["/tmp/h.html"],
    whitelist: [/col-cntr/, /card/, /txt-card/, /homeRevealCategs/].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/col-cntr/, /card/, /txt-card/, /easy-autocomplete-container/, /homecolcntr/, /homecolgrid/, /mpost-card/],
  },
  {
    cssFileName: "p-a" /* AZAR */,
    content: ["/tmp/a.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-ho" /* HOROSCOPO */,
    content: ["/tmp/ho.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-ca" /* CARTELERA */,
    content: ["/tmp/ca.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-cav" /* CARTELERA VIEW */,
    content: ["/tmp/cav.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-tlr" /* TODOS LOS RUBROS */,
    content: ["/tmp/tlr.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-feed" /* pagina de novedades */,
    content: ["/tmp/feed.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  // -------------- PROMO
  {
    cssFileName: "p-ph" /* PROMO HOME */,
    content: ["/tmp/ph.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-pv" /* PROMO VIEW */,
    content: ["/tmp/pv.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane).concat(cssPurgedWhitelists.Gallery).concat(cssPurgedWhitelists.KeenSlider),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header).concat(cssPurgedWhitelistPatternsCh.KeenSlider),
  },
  {
    cssFileName: "p-ps" /* PROMOS SPONSORS */,
    content: ["/tmp/ps.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane).concat(cssPurgedWhitelists.Gallery),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-pa" /* PROMO POR CATEG?? */,
    content: ["/tmp/pa.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane).concat(cssPurgedWhitelists.Gallery),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-pml" /* PROMO MULTI LOCAL */,
    content: ["/tmp/pml.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane).concat(cssPurgedWhitelists.Gallery),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  // -------------- BUSCADOR
  {
    cssFileName: "p-b" /* BUSCADOR */,
    content: ["/tmp/b.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane).concat(cssPurgedWhitelists.Maps),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/img-sponsor-promo/, /tarjeta-promo/, /car-highlight/, /car-highlight-title/].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-sr" /* BUSCADOR SIN RESULTADOS*/,
    content: ["/tmp/sr.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane).concat(cssPurgedWhitelists.Maps),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  // ------------- COMERCIO (+ GALERIA/VIDEO + REPORTAR ERROR)
  {
    cssFileName: "p-c" /* COMERCIO */,
    content: ["/tmp/c.html"],
    whitelist: []
      .concat(cssPurgedWhitelists.Ads)
      .concat(cssPurgedWhitelists.AutoComplete)
      .concat(cssPurgedWhitelists.FoundationReveal)
      .concat(cssPurgedWhitelists.FoundationMenu)
      .concat(cssPurgedWhitelists.FoundationDropDownPane)
      .concat(cssPurgedWhitelists.Maps)
      .concat(cssPurgedWhitelists.PhotoPopup)
      .concat(cssPurgedWhitelists.Gallery)
      .concat(cssPurgedWhitelists.Comercio)
      .concat(cssPurgedWhitelists.KeenSlider),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.Comercio).concat(cssPurgedWhitelistPatterns.FoundationMenu).concat(cssPurgedWhitelistPatterns.FoundationReveal),
    whitelistPatternsChildren: [/bizDetails/].concat(cssPurgedWhitelistPatternsCh.Header).concat(cssPurgedWhitelistPatternsCh.KeenSlider).concat(cssPurgedWhitelistPatternsCh.Comercio).concat(cssPurgedWhitelistPatternsCh.FoundationReveal),
  },
  {
    cssFileName: "p-g" /* PAGINA GALERIA - Se usa en pagina de video tambien */,
    content: ["/tmp/g.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane).concat(cssPurgedWhitelists.Maps).concat(cssPurgedWhitelists.Comercio),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-gs" /* PAGINA LISTADO DE GALERIAS */,
    content: ["/tmp/gs.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane).concat(cssPurgedWhitelists.Maps).concat(cssPurgedWhitelists.Comercio),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/gal-cntr-full/, /u-box-cntr/, /boxbody/, /attr-cntr/, /hours-table/, /fp-list/].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-re" /* REPORTAR ERROR */,
    content: ["/tmp/re.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane).concat(cssPurgedWhitelists.Maps).concat(cssPurgedWhitelists.FormMsg),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu).concat(cssPurgedWhitelistPatterns.Parsley),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Parsley).concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-revs" /* COMENTARIOS */,
    content: ["/tmp/revs.html"],
    whitelist: ["attr-lbl", "attr-val"]
      .concat(cssPurgedWhitelists.Ads)
      .concat(cssPurgedWhitelists.AutoComplete)
      .concat(cssPurgedWhitelists.FoundationReveal)
      .concat(cssPurgedWhitelists.FoundationMenu)
      .concat(cssPurgedWhitelists.FoundationDropDownPane)
      .concat(cssPurgedWhitelists.Maps)
      .concat(cssPurgedWhitelists.Comercio),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  // ------------- USER (LOGIN, FAVS, PEDIDOS)
  {
    cssFileName: "p-l" /* LOGIN */,
    content: ["/tmp/l.html"],
    whitelist: ["callout", "alert", "small"].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-f" /* FAVORITOS */,
    content: ["/tmp/f.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  // ------------- UBERTO
  {
    cssFileName: "p-pl" /* LISTADO DE PEDIDOS */,
    content: ["/tmp/pl.html", "/tmp/qv.html"],
    whitelist: ["fa-calculator"].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/button/, /gmbutton/].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-qr" /* QUOTE REQUEST */,
    content: ["/tmp/qr.html"],
    whitelist: ["fa-bell-slash-o", "fa-bell-slash", "u-picture-cntr", "fa-check", "fa-retweet"]
      .concat(cssPurgedWhitelists.Ads)
      .concat(cssPurgedWhitelists.AutoComplete)
      .concat(cssPurgedWhitelists.FoundationReveal)
      .concat(cssPurgedWhitelists.FoundationMenu)
      .concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [/u-picture-cntr/].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/u-picture-cntr/, /u-quote-form-photoadd/, /u-quote-form-addstore/].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-qv" /* QUOTE VIEW */,
    content: ["/tmp/qv.html"],
    whitelist: ["u-picture-cntr"].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [/u-picture-cntr/].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/u-picture-cntr/, /button/, /gmbutton/].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-or" /* ORDER STORE BIG  */,
    content: ["/tmp/or.html"],
    whitelist: ["u-picture-cntr"].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [/u-picture-cntr/].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/u-picture-cntr/].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-os" /* ORDER STORE SMALL */,
    content: ["/tmp/os.html", "/tmp/pd.html"],
    whitelist: ["u-picture-cntr", "u-reveal-closebtncntr", "close-button", "u-reveal-closebtn", "u-menu-label"]
      .concat(cssPurgedWhitelists.Ads)
      .concat(cssPurgedWhitelists.AutoComplete)
      .concat(cssPurgedWhitelists.FoundationReveal)
      .concat(cssPurgedWhitelists.FoundationMenu)
      .concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [/u-picture-cntr/].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/u-picture-cntr/].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-pd" /* PRODUCT DESCRIPTION */,
    content: ["/tmp/pd.html"],
    whitelist: ["u-picture-cntr"].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [/u-picture-cntr/].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/u-picture-cntr/].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-pda" /* ADD PRODUCT TO CART */,
    content: ["/tmp/pda.html"],
    whitelist: ["u-picture-cntr", "u-reveal-closebtncntr", "close-button", "u-reveal-closebtn", "u-menu-label"]
      .concat(cssPurgedWhitelists.Ads)
      .concat(cssPurgedWhitelists.AutoComplete)
      .concat(cssPurgedWhitelists.FoundationReveal)
      .concat(cssPurgedWhitelists.FoundationMenu)
      .concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [/u-picture-cntr/, /button.clear/].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/u-picture-cntr/, /button.clear/].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-ov" /* ORDER VIEW */,
    content: ["/tmp/ov.html"],
    whitelist: ["u-picture-cntr", "fa-thumbs-up"].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [/u-picture-cntr/, /switch/, /u-review-switch/, /u-review-form/].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/u-picture-cntr/, /switch/, /u-review-switch/, /u-review-form/].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-oc" /* ORDER CHECKOUT */,
    content: ["/tmp/oc.html"],
    whitelist: ["u-picture-cntr", "fa-check", "fa-retweet"].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [/u-picture-cntr/, /u-option-cntr/].concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [/u-picture-cntr/, /u-option-cntr/, /callout/].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-res" /* RESERVA */,
    content: ["/tmp/res.html"],
    whitelist: ["infoFichaSI", "check", "u-box-cntr-wh", "badge-24h"]
      .concat(cssPurgedWhitelists.Ads)
      .concat(cssPurgedWhitelists.AutoComplete)
      .concat(cssPurgedWhitelists.Comercio)
      .concat(cssPurgedWhitelists.FoundationReveal)
      .concat(cssPurgedWhitelists.FoundationMenu)
      .concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.FoundationMenu).concat(cssPurgedWhitelistPatterns.Comercio),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Comercio).concat(cssPurgedWhitelistPatternsCh.Header),
  },
  // ------------- FOOTER PAGES
  {
    cssFileName: "p-co" /* CONTACTO */,
    content: ["/tmp/co.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane).concat(cssPurgedWhitelists.FormMsg),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.Parsley).concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Parsley).concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-aq" /* ACERCA QUIENES SOMOS */,
    content: ["/tmp/aq.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.Parsley).concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-av" /* ACERCA VERIFICACION */,
    content: ["/tmp/av.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.Parsley).concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-tc" /* TERMINOS Y CONDICIONES */,
    content: ["/tmp/tc.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.Parsley).concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
  {
    cssFileName: "p-pp" /* POLITICA DE PRIVACIDAD */,
    content: ["/tmp/pp.html"],
    whitelist: [].concat(cssPurgedWhitelists.Ads).concat(cssPurgedWhitelists.AutoComplete).concat(cssPurgedWhitelists.FoundationReveal).concat(cssPurgedWhitelists.FoundationMenu).concat(cssPurgedWhitelists.FoundationDropDownPane),
    whitelistPatterns: [].concat(cssPurgedWhitelistPatterns.Parsley).concat(cssPurgedWhitelistPatterns.FoundationMenu),
    whitelistPatternsChildren: [].concat(cssPurgedWhitelistPatternsCh.Header),
  },
];

gulp.task("purgePages", function (cb) {
  gutil.log(gutil.colors.blue(">>---------------------------------------------------"));
  gutil.log("Starting purged CSS files for deferred load for pages...");

  Promise.all(
    cssPurgedFiles.map((cssItem) => {
      return new Promise(function (resolve, reject) {
        var itemSize = size({ showTotal: false });
        var pageCSSName = cssItem.cssFileName + postfix + ".min.css";
        // gutil.log('Genearating page purged css for '+pageCSSName+'...');

        gulp
          .src(allcssFiles)
          .pipe(gpConcat(pageCSSName))
          .pipe(
            purgecss({
              content: cssItem.content,
              whitelist: cssItem.whitelist,
              whitelistPatterns: cssItem.whitelistPatterns,
              whitelistPatternsChildren: cssItem.whitelistPatternsChildren,
            })
          )
          .pipe(gpMinifyCSS({ keepSpecialComments: 0 }))
          .pipe(itemSize)
          .pipe(gulp.dest(distFolderCss + "/p-" + brandPrefix))
          .on("end", function () {
            gutil.log(gutil.colors.green("   CSS file " + distFolderCss + "/p-" + brandPrefix + "/" + pageCSSName + " compiled successfully: ") + gutil.colors.bold(gutil.colors.magenta(itemSize.prettySize)));
            resolve();
          })
          .on("error", function (err) {
            gutil.log("Error ocurred compiling CSS files:");
            gutil.log(err);
            reject();
          });
      });
    })
  )
    .then(function (resProms) {
      gutil.log(resProms.length + " purged CSS files prepared successfully.");
      gutil.log(gutil.colors.blue("<<---------------------------------------------------"));
      cb();
    })
    .catch(function (err) {
      gutil.log(gutil.colors.red("EXCEPTION AT PAGE PURGED CSS"));
      gutil.log(err.message);
      gutil.log(gutil.colors.blue("<<---------------------------------------------------"));
    });
});

// *************************** MAIN TASKS **************************************

gulp.task("buildAll", function () {
  gutil.log(gutil.colors.cyan.bold("GuiaMovil WebApp build tool 1.1 (buildAll)"));
  runSequence("jsapp", "jslib", "css", "images", function () {
    gutil.log(gutil.colors.cyan.bold("GuiaMovil WebApp built successfully"));
  });
});

gulp.task("buildDyn", function () {
  gutil.log(gutil.colors.cyan.bold("GuiaMovil WebApp build tool 1.4 (buildDyn)"));
  runSequence("cleanDyn", "js2", "jsapp", "jslib", "csspurged", "injfiles", "critical", "purgePages", function () {
    gutil.log(gutil.colors.cyan.bold("GuiaMovil WebApp build dynamic successfully"));
  });
});
