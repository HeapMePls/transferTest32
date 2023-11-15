gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.comercio = {};

gmwa.controllers.comercio.toggleFav = null;

gmwa.controllers.comercio.init = function () {
  gmwa.logger.log("Comercio|Init...");
  $("div.ver-condiciones").on("click", function (event) {
    event.preventDefault();
    var $btn = $(this).find("a:first");
    $(this)
      .next("div.condiciones:first")
      .toggle(0, function () {
        if ($("div.condiciones:first").is(":visible")) {
          $btn.text("Ocultar condiciones");
        } else {
          $btn.text("Ver condiciones");
        }
      });
  });

  gmwa.components.header.init();
  // gmwa.components.galleryviewer.init();
  gmwa.components.videoviewer.init();

  if (gmwa.utils.isMobile()) {
    gmwa.controllers.comercio.initKeenSlider();
    // var swiper = new Swiper('#sw-subs', {
    //   slidesPerView: 2.2,
    //   paginationClickable: false,
    //   navigation: {
    //     nextEl: '#sw-subs-next',
    //     prevEl: '#sw-subs-prev'
    //   },
    //   spaceBetween: 10,
    //   lazy: {
    //     loadPrevNext: true,
    //   }
    // });
    // var swiper = new Swiper('#sw-nprms', {
    //   slidesPerView: 1.2,
    //   paginationClickable: false,
    //   navigation: {
    //     nextEl: '#sw-nprms-next',
    //     prevEl: '#sw-nprms-prev'
    //   },
    //   spaceBetween: 30,
    //   lazy: {
    //     loadPrevNext: true,
    //   }
    // });
  } else {
    // var swiper = new Swiper('#sw-subs', {
    //   slidesPerView: 3.4,
    //   paginationClickable: false,
    //   navigation: {
    //     nextEl: '#sw-subs-next',
    //     prevEl: '#sw-subs-prev'
    //   },
    //   spaceBetween: 10,
    //   lazy: {
    //     loadPrevNext: true,
    //   }
    // });
    // var swiper = new Swiper('#sw-nprms', {
    //   slidesPerView: 2.2,
    //   paginationClickable: false,
    //   navigation: {
    //     nextEl: '#sw-nprms-next',
    //     prevEl: '#sw-nprms-prev'
    //   },
    //   spaceBetween: 30,
    //   lazy: {
    //     loadPrevNext: true,
    //   }
    // });
  }

  //gmwa.controllers.comercio.enhanceHours();
  gmwa.controllers.comercio.buildSpecialHoursStatus();

  // Initialize Map
  gmwa.controllers.comercio.smiImg = document.getElementById("smiImg");
  if (!gmwa.controllers.comercio.smiImg) {
    gmwa.controllers.comercio.initializeMap();
  } else {
    gmwa.controllers.comercio.smiImg.addEventListener("click", function (ev) {
      gmwa.controllers.comercio.initializeMap();
    });
  }

  gmwa.controllers.comercio.updateMailData();

  gmwa.controllers.comercio.inlineSpinner = document.getElementById("btnFastLoginNext2Spin");

  // Hook Bookmark
  $("#bookSave").click(function (e) {
    e.preventDefault();
    if (gmwa.controllers.comercio.toggleFav == null) {
      gmwa.controllers.comercio.toggleFav = $(this).data("saved");
    }
    if (gmwa.controllers.comercio.toggleFav == "1") {
      $(this).prop("disabled", true);
      gmwa.controllers.comercio.toggleFavorite($("#ficha").data("idr"), $("#ficha").data("ids"), "del", function (res) {
        if (res) {
          $("#bookSave").html('<i class="fa fa-bookmark-o" aria-hidden="true"></i> Guardar');
          $("#bookSave").prop("disabled", false);
          gmwa.controllers.comercio.toggleFav = "0";
        }
      });
    } else {
      $(this).prop("disabled", true);
      gmwa.controllers.comercio.toggleFavorite($("#ficha").data("idr"), $("#ficha").data("ids"), "add", function (res) {
        if (res) {
          $("#bookSave").html('<i class="fa fa-bookmark" aria-hidden="true"></i> Guardado');
          $("#bookSave").prop("disabled", false);
          gmwa.controllers.comercio.toggleFav = "1";
        }
      });
    }
  });

  // Comment send
  $("#commentBtn").click(function (e) {
    e.preventDefault();
    gmwa.controllers.comercio.doReview();
  });

  // Like Hooks
  $("#btnLike").click(function (e) {
    e.preventDefault();
    if (gmwa.controllers.comercio.commentLike == undefined || gmwa.controllers.comercio.commentLike == false) {
      $("#btnLike").addClass("btnLikeSelected");
      $("#btnDisLike").removeClass("btnDislikeSelected");
      gmwa.controllers.comercio.commentLike = true;
    }
  });
  $("#btnDisLike").click(function (e) {
    e.preventDefault();
    if (gmwa.controllers.comercio.commentLike == undefined || gmwa.controllers.comercio.commentLike == true) {
      $("#btnDisLike").addClass("btnDislikeSelected");
      $("#btnLike").removeClass("btnLikeSelected");
      gmwa.controllers.comercio.commentLike = false;
    }
  });

  //$('.lazy').Lazy({effect: 'fadeIn', effectTime: 1000, chainable: false});

  // Hook action buttons
  $("#btn-getdir").click(function (e) {
    var gaLabel = $("#ficha").data("name") + "|" + $("#ficha").data("idr") + "|" + $("#ficha").data("ids");
    gmwa.utils.sendGAEvent("Profile", "Directions", gaLabel);
    gmwa.controllers.comercio.openDirections(e);
  });
  // Default button
  $(".retact-def-btn a").each(function (idx) {
    if ($(this).attr("href")) {
      if ($(this).attr("data-type") == "0") {
        $(this).on("click", function (e) {
          var gaLabel = $("#ficha").data("name") + "|" + $("#ficha").data("idr") + "|" + $("#ficha").data("ids");
          gmwa.utils.sendGAEvent("Profile", "DF-Call", gaLabel);
        });
      } else if ($(this).attr("data-type") == "1") {
        $(this).on("click", function (e) {
          var gaLabel = $("#ficha").data("name") + "|" + $("#ficha").data("idr") + "|" + $("#ficha").data("ids");
          gmwa.utils.sendGAEvent("Profile", "DF-SMS", gaLabel);
        });
      } else if ($(this).attr("data-type") == "2") {
        $(this).on("click", function (e) {
          var gaLabel = $("#ficha").data("name") + "|" + $("#ficha").data("idr") + "|" + $("#ficha").data("ids");
          gmwa.utils.sendGAEvent("Profile", "DF-WA", gaLabel);
        });
      } else if ($(this).attr("data-type") == "3") {
        $(this).on("click", function (e) {
          var gaLabel = $("#ficha").data("name") + "|" + $("#ficha").data("idr") + "|" + $("#ficha").data("ids");
          gmwa.utils.sendGAEvent("Profile", "DF-UB", gaLabel);
        });
      }
    }
  });
  // Normal Buttons
  $(".retact-btn a").each(function (idx) {
    if ($(this).attr("href")) {
      if ($(this).attr("href").substr(0, 4) == "tel:") {
        $(this).on("click", function (e) {
          var gaLabel = $("#ficha").data("name") + "|" + $("#ficha").data("idr") + "|" + $("#ficha").data("ids");
          gmwa.utils.sendGAEvent("Profile", "Call", gaLabel);
        });
      } else if ($(this).attr("href").substr(0, 5) == "http:") {
        $(this).on("click", function (e) {
          var gaLabel = $("#ficha").data("name") + "|" + $("#ficha").data("idr") + "|" + $("#ficha").data("ids");
          gmwa.utils.sendGAEvent("Profile", "Web", gaLabel);
        });
      } else if ($(this).attr("href").substr(0, 7) == "mailto:") {
        $(this).on("click", function (e) {
          var gaLabel = $("#ficha").data("name") + "|" + $("#ficha").data("idr") + "|" + $("#ficha").data("ids");
          gmwa.utils.sendGAEvent("Profile", "Mail", gaLabel);
        });
      } else if ($(this).attr("href").substr(0, 4) == "sms:") {
        $(this).on("click", function (e) {
          var gaLabel = $("#ficha").data("name") + "|" + $("#ficha").data("idr") + "|" + $("#ficha").data("ids");
          gmwa.utils.sendGAEvent("Profile", "SMS", gaLabel);
        });
      }
    }
  });

  $("#snets").click(function (e) {
    var gaLabel = $("#ficha").data("name") + "|" + $("#ficha").data("idr") + "|" + $("#ficha").data("ids");
    var net = $(this).attr("data-net");
    gmwa.utils.sendGAEvent("Profile", "SNET" + net, gaLabel);
  });

  // Check native share
  if (navigator.share) {
    $("#btnShareMenu").hide();
    $("#btnShare").click(function (e) {
      e.preventDefault();
      e.stopPropagation();
      var objShare = {
        name: $("#ficha").attr("data-name"),
        text: $("#locAdr").text().trim(),
        url: window.location.href,
      };

      gmwa.controllers.comercio.sendShareEvent("native");

      navigator
        .share({
          title: objShare.name,
          text: objShare.name + " | " + objShare.text,
          url: objShare.url,
        })
        .then(function () {})
        .catch(function (error) {
          console.log("Error sharing", error);
        });
    });
  } else {
    $("#btnShare").click(function (e) {
      if (gmwa.controllers.comercio.shareOpened) {
        // $('#btnShareMenu').hide();
        $("#shareModal").foundation("close");
        gmwa.controllers.comercio.shareOpened = true;
      } else {
        //$('#btnShareMenu').show();
        $("#shareModal").foundation("open");
        gmwa.controllers.comercio.shareOpened = false;
      }
    });
    $(".sharerpanel a").each(function () {
      $(this).on("click", function (e) {
        //console.log('WILL SEND EVENT FOR ' + $(this).text());
        gmwa.controllers.comercio.sendShareEvent($(this).text());
      });
    });
  }

  // Init swiper promo if present
  // var slidesPerView = 2.7;
  // if (gmwa.utils.isMobile()){
  //   slidesPerView = 1.4;
  // }
  // var swiper = new Swiper("#sw-prms", {
  //   slidesPerView: slidesPerView,
  //   paginationClickable: false,
  //   navigation: {
  //     nextEl: '#sw-prms-next',
  //     prevEl: '#sw-prms-prev'
  //   },
  //   spaceBetween: 10
  // });

  // ZUCK TEST --------------------------------- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // var swiper = new Swiper("#zuckSwiper", {
  //   loop: true,
  //   autoplay: {
  //     delay: 3000,
  //   },
  //   spaceBetween: 0,
  //   effect: 'fade',
  //   pagination: {
  //     el: '.swiper-pagination',
  //     type: 'bullets',
  //   },
  //   lazy: {
  //     loadPrevNext: false,
  //     loadOnTransitionStart: true
  //   }
  // });
};

gmwa.controllers.comercio.updateMailData = function () {
  var email = "info@1122.com.uy";
  var empresa = "1122";
  var tituloNegocio = $(".infoFicha .title").text();

  if (window.location.hostname.toLowerCase().indexOf("buscoinfo") >= 0) {
    email = "feedback@buscoinfo.com.py";
    empresa = "BuscoInfo";
  }

  var subject = "Mensaje a " + empresa + " | " + tituloNegocio;
  var newLink = "mailto:" + email;
  newLink += "?subject=" + subject + "&body=-----" + subject;
  $("#fContactEmail").attr("href", newLink);
};

gmwa.controllers.comercio.initializeGoogleMap = function () {
  var mapElement = $("#mapa");
  if (mapElement.length == 0) return;

  var lat = mapElement.data("lat");
  var lng = mapElement.data("lng");
  var izoom = 15;
  var isMobile = mapElement.data("im");

  if (lat != "" && lng != "") {
    if (lat != 0 && lng != 0 && izoom != 0) {
      var latlng = new google.maps.LatLng(lat, lng);
      if (isMobile) {
        var myOptions = {
          zoom: izoom,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          draggable: false,
          scrollwheel: false,
          panControl: true,
          zoomControl: true,
          scaleControl: true,
          overviewMapControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          },
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
          },
        };
      } else {
        var myOptions = {
          zoom: izoom,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          draggable: true,
          scrollwheel: true,
          panControl: true,
          zoomControl: true,
          scaleControl: true,
          overviewMapControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          },
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
          },
        };
      }
      var map = new google.maps.Map(mapElement[0], myOptions);
      var marker = new google.maps.Marker({ position: latlng, map: map });
    }
  }
};

gmwa.controllers.comercio.initializeMap = function () {
  var mapElement = $("#mapa");
  var lat = mapElement.data("lat");
  var lng = mapElement.data("lng");
  var izoom = 16;
  var isMobile = mapElement.data("im");

  if (lat != "" && lng != "" && lat != 0 && lng != 0 && izoom != 0 && !isNaN(lat) && !isNaN(lng)) {
    gmwa.logger.log("Initializing Maps...");
    gmwa.components.maps.instance.initMapAsync("mapa", lat, lng, izoom, isMobile, function (map) {
      gmwa.controllers.comercio.map = map;
      gmwa.components.maps.instance.addMarkerSimple(gmwa.controllers.comercio.map, lat, lng);
      if (gmwa.controllers.comercio.smiImg) {
        gmwa.controllers.comercio.smiImg.style.display = "none";
      }
    });
  }
};

gmwa.controllers.comercio.enhanceHoursCalulateDelta = function (hourOpens, hour) {
  hHourOpens = parseInt(hourOpens / 100);
  hHour = parseInt(hour / 100);
  if (hHourOpens == hHour) {
    return hourOpens - hour;
  } else {
    return hourOpens - hour - 40;
  }
};

gmwa.controllers.comercio.convertDateToString = function (date, includeDay) {
  if (includeDay) {
    return date.format("dddd D [de] MMMM");
  }
  return date.format("D [de] MMMM");
};

gmwa.controllers.comercio.buildHourLabel = function (hour) {
  var ihour = parseInt(hour);
  if (ihour < 100) {
    if (ihour >= 10) {
      return "00:" + hour;
    } else {
      return "00:0" + hour;
    }
  } else {
    return hour.slice(0, -2) + ":" + hour.slice(-2, 8);
  }
};

gmwa.controllers.comercio.buildSpecialHoursStatus = function () {
  var ret = {
    color: "darkorange",
    text: "text",
    show: true,
    htext: "text",
    specialDate: null,
  };

  var hours = window.hrsps;
  var todayDate = null;
  todayDate = new Date();
  todayDate = todayDate.getFullYear() + "-" + (0 + String(todayDate.getMonth() + 1)).slice(-2) + "-" + (0 + String(todayDate.getDate())).slice(-2);

  if (hours.length) {
    ret.color = "#7CB342";
    var date = dayjs(hours[0].d + " 00:00:00");
    ret.specialDate = gmwa.controllers.comercio.convertDateToString(date, true);
    if (hours[0].dsc) {
      ret.specialDate = hours[0].dsc + ", " + gmwa.controllers.comercio.convertDateToString(date, true);
    }

    if (hours[0].cf) {
      var msg;
      if (!hours[0].hp) {
        msg = " cerrado";
        ret.color = "#FF5722";
      } else {
        msg = " abierto de ";
        var ranges = [];
        hours[0].hp.forEach(function (hour) {
          ranges.push(gmwa.controllers.comercio.buildHourLabel(hour.start) + " a " + gmwa.controllers.comercio.buildHourLabel(hour.end));
        });
        msg += ranges.join(", ");
      }

      if (hours[0].dsc) {
        ret.htext = gmwa.controllers.comercio.convertDateToString(date, true) + ' "' + hours[0].dsc + '" ' + msg;
      } else {
        ret.htext = gmwa.controllers.comercio.convertDateToString(date, true) + msg;
      }
    } else {
      ret.color = "#a96500";
      if (new Date().getDay() == parseInt(date.format("d"))) {
        ret.htext = "El horario de hoy puede variar";
      } else {
        ret.htext = "El horario para el " + gmwa.controllers.comercio.convertDateToString(date, true) + (hours[0].dsc ? " " + hours[0].dsc : "") + " puede variar";
      }
    }

    $("#horarioEspecial").append($('<div style="color: ' + ret.color + '">' + ret.htext + "</div>"));
  }
};

gmwa.controllers.comercio.enhanceHours = function () {
  var bIsOpenFound = false;
  var sIsOpenText = "...";
  var sHeaderStatusText = "";
  var d = new Date();
  var hour = d.getHours() * 100 + d.getMinutes();
  //var hour = 1416;
  //var hour = 2001;
  var hourOpens = -1;
  var hourCloses = -1;
  var hourDiff = -1;
  var days = $("#hoursIsToday").children(0).children(1);
  days.each(function () {
    hourOpens = $(this).data("start");
    hourCloses = $(this).data("end");
    dayIsOpen = $(this).parent().data("isopen");
    if (dayIsOpen) {
      if (!bIsOpenFound) {
        if (hour < hourOpens) {
          if (hour < hourCloses && hourOpens > hourCloses) {
            sIsOpenText = "<span style='color:#2f7733;font-weight: 100;'>(abierto)</span>";
            sHeaderStatusText = "<span style='color:#2f7733;'>Ahora abierto</span>";
          } else {
            hourDiff = gmwa.controllers.comercio.enhanceHoursCalulateDelta(hourOpens, hour);
            if (hourDiff < 100) {
              sIsOpenText = "<span style='color:#cc362b;font-weight: 100;'>(abre en " + hourDiff + " mins)</span>";
              sHeaderStatusText = "<span style='color:#cc362b;'>Ahora cerrado </span><span> (abre en " + hourDiff + " mins)</span>";
            } else {
              sIsOpenText = "<span style='color:#cc362b;font-weight: 100;'>(cerrado)</span>";
              hourOpens = hourOpens + "";
              hourOpens = [hourOpens.slice(0, -2), ":", hourOpens.slice(-2)].join("");
              sHeaderStatusText = "<span style='color:#cc362b;'>Ahora cerrado </span><span> (abre hoy a las " + hourOpens + ")</span>";
            }
          }
          bIsOpenFound = true;
        } else if (hour > hourOpens && hour < hourCloses) {
          hourDiff = gmwa.controllers.comercio.enhanceHoursCalulateDelta(hourCloses, hour);
          if (hourDiff < 100) {
            sIsOpenText = "<span style='color:#c74802;font-weight: 100;'>(cierra en " + hourDiff + " mins)</span>";
            sHeaderStatusText = "<span style='color:#c74802'>Ahora abierto </span><span> (cierra en " + hourDiff + " mins)</span>";
          } else {
            sIsOpenText = "<span style='color:#2f7733;font-weight: 100;'>(abierto)</span>";
            sHeaderStatusText = "<span style='color:#2f7733'>Ahora abierto</span>";
          }
          bIsOpenFound = true;
        } else {
          if (hourCloses < hourOpens) {
            if (hour > hourOpens && hour < 2400) {
              sIsOpenText = "<span style='color:#2f7733;font-weight: 100;'>(abierto)</span>";
              sHeaderStatusText = "<span style='color:#2f7733;'>Ahora abierto</span>";
              bIsOpenFound = true;
            } else {
              sIsOpenText = "<span style='color:#cc362b;font-weight: 100;'>(cerrado)</span>";
              sHeaderStatusText = "<span style='color:#cc362b'>Ahora cerrado</span>";
            }
          } else {
            sIsOpenText = "<span style='color:#cc362b;font-weight: 100;'>(cerrado)</span>";
            sHeaderStatusText = "<span style='color:#cc362b'>Ahora cerrado</span>";
          }
        }
      }
    }
  });
  // Calculate next open
  var today = d.getDay();
  today = today == 0 ? 6 : today - 1;
  if (!bIsOpenFound) {
    sHeaderStatusText = "<span style='color:#F44336;'>Ahora cerrado</span>";
    var idxDay = today + 1;
    var table = $(".hours-table>tbody>tr");
    var $day = null;
    var nextOpen = null;
    for (var i = 0; i < table.length; i++) {
      if (idxDay >= table.length - 1) idxDay = 0;
      $day = table.eq(idxDay);
      if ($day.children().eq(1).children().length > 0) {
        nextOpen = $day.children().eq(1).children().eq(0).data("start") + "";
        nextOpen = [nextOpen.slice(0, -2), ":", nextOpen.slice(-2)].join("");
        if (today == idxDay) {
          sHeaderStatusText += " <span> (abre hoy a las " + nextOpen + ")</span>";
        } else if (idxDay - today == 1) {
          sHeaderStatusText += " <span> (abre mañana a las " + nextOpen + ")</span>";
        } else {
          sHeaderStatusText += " <span> (abre el " + $day.children().eq(0).text() + " a las " + nextOpen + ")</span>";
        }
        break;
      }
    }
  }
  $("#hoursIsToday td:nth-child(2)").append($("<div style='display: block;'>" + sIsOpenText + "<div>"));
  $(".horario").append($(sHeaderStatusText));
};

gmwa.controllers.comercio.toggleFavorite = function (idr, ids, op, cb) {
  var data = {
    op: op,
    retailer: idr,
    store: ids,
  };
  $.ajax({
    type: "POST",
    url: "/local/fav",
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json; charset=utf-8",
  })
    .done(function (resData) {
      if (resData.outcode == "0") {
        cb(true);
      } else {
        if (resData.outcode == 999) {
          gmwa.utils.showError("Inicia sesión", "Para poder guardar tus lugares favoritos");
          cb(false);
        } else {
          gmwa.logger.error("toggleFavorite | Server returned " + resData.outcode + " (" + resData.outmsg + ")");
          cb(false);
        }
      }
    })
    .fail(function (err) {
      gmwa.logger.error("toggleFavorite | API returned error: " + JSON.stringify(err));
      cb(false);
    });
};

gmwa.controllers.comercio.sendReview = function (data, cb) {
  $.ajax({
    type: "POST",
    url: "/local/comment",
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json; charset=utf-8",
  })
    .done(function (resData) {
      if (resData.outcode == "0") {
        cb(true);
      } else {
        if (resData.outcode == 999) {
          gmwa.utils.showError("Inicia sesión", "Para poder agregar comentarios");
          cb(false);
        } else {
          gmwa.logger.error("sendReview | Server returned " + resData.outcode + " (" + resData.outmsg + ")");
          cb(false);
        }
      }
    })
    .fail(function (err) {
      gmwa.logger.error("sendReview | API returned error: " + JSON.stringify(err));
      cb(false);
    });
};

gmwa.controllers.comercio.sendReviewAndLike = function (data, cb) {
  gmwa.controllers.comercio.initFastLogin(data, cb);
  //
  // check if user is logged
  //
  var usermail = document.querySelector("#ficha").getAttribute("data-username");
  if (usermail && usermail.length > 0) {
    gmwa.controllers.comercio.doSendReviewAndLike(data, cb);
  } else {
    $("#fastLoginModal").foundation("open");
  }
};

gmwa.controllers.comercio.doSendReviewAndLike = function (data, cb) {
  $.ajax({
    type: "POST",
    url: "/local/commentLike",
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json; charset=utf-8",
  })
    .done(function (resData) {
      if (resData.outcode == "0" || resData.outcode == "139") {
        cb(resData);
      } else {
        if (resData.outcode == 999) {
          gmwa.utils.showError("Inicia sesión", "Para poder agregar comentarios");
          cb(false);
        } else if (resData.outcode == 151) {
          gmwa.utils.showError("No se pudo iniciar sesión", "El usuario o la contraseña no son los correctos");
          cb(false);
        } else {
          gmwa.logger.error("sendReviewAndLike | Server returned " + resData.outcode + " (" + resData.outmsg + ")");
          cb(false);
        }
      }
    })
    .fail(function (err) {
      gmwa.logger.error("sendReviewAndLike | API returned error: " + JSON.stringify(err));
      cb(false);
    });
};

/**
 *
 * https://www.w3schools.com/js/js_cookies.asp
 *
 */

gmwa.controllers.comercio.initFastLogin = function (data, cb) {
  if (!gmwa.controllers.comercio.lblflEmail) {
    gmwa.controllers.comercio.flDesc = document.getElementById("flDesc");
    gmwa.controllers.comercio.flErr = document.getElementById("flErr");
    gmwa.controllers.comercio.lblflEmail = document.getElementById("lblflEmail");
    gmwa.controllers.comercio.flEmail = document.getElementById("flEmail");
    gmwa.controllers.comercio.lblflName = document.getElementById("lblflName");
    gmwa.controllers.comercio.flName = document.getElementById("flName");
    gmwa.controllers.comercio.lblflPass = document.getElementById("lblflPass");
    gmwa.controllers.comercio.flPass = document.getElementById("flPass");
    gmwa.controllers.comercio.btnFastLoginNext1 = document.getElementById("btnFastLoginNext1");
    gmwa.controllers.comercio.btnFastLoginNext2 = document.getElementById("btnFastLoginNext2");

    gmwa.controllers.comercio.btnFastLoginNext1.addEventListener("click", function (ev) {
      // validate and check email existance
      gmwa.controllers.comercio.fastLoginFormMove(1);
      //
      // validate input
      if (!gmwa.controllers.comercio.flEmail.value || gmwa.controllers.comercio.flEmail.value.length == 0 || !gmwa.utils.isEmail(gmwa.controllers.comercio.flEmail.value)) {
        gmwa.controllers.comercio.fastLoginFormMove(0);
        gmwa.controllers.comercio.fastLoginShowError("Ingrese una dirección de correo electrónico válido");
        return;
      }
      gmwa.controllers.comercio.fastLoginFormMailExists = false;
      $.ajax({
        type: "GET",
        url: "/checkuser/" + encodeURIComponent(gmwa.controllers.comercio.flEmail.value),
        contentType: "application/json; charset=utf-8",
      })
        .done(function (resData) {
          if (resData) {
            gmwa.controllers.comercio.fastLoginFormMove(2);
            if (resData.exists) {
              gmwa.controllers.comercio.fastLoginFormMailExists = true;
              gmwa.controllers.comercio.fastLoginFormMove(3);
            } else {
              gmwa.controllers.comercio.fastLoginFormMove(4);
            }
            gmwa.controllers.comercio.btnFastLoginNext2.style.display = "block";
          } else {
            gmwa.utils.showError("Verificación de correo", "No se pudo verificar el correo, por favor inténtelo más tarde.");
            gmwa.controllers.comercio.fastLoginFormMove(0);
            cb(false);
          }
        })
        .fail(function (err) {
          gmwa.controllers.comercio.fastLoginFormMove(0);
          gmwa.utils.showError("Verificación de correo", "No se pudo verificar el correo, por favor inténtelo más tarde. [2]");
          cb(false);
        });
    });

    gmwa.controllers.comercio.btnFastLoginNext2.addEventListener("click", function () {
      // validate form
      if (!gmwa.controllers.comercio.fastLoginFormMailExists) {
        if (!gmwa.controllers.comercio.flName.value || gmwa.controllers.comercio.flName.value.length < 3) {
          gmwa.controllers.comercio.fastLoginFormMove(4);
          gmwa.controllers.comercio.fastLoginShowError("Ingrese un nombre");
          return;
        }
      }
      if (!gmwa.controllers.comercio.flPass.value || gmwa.controllers.comercio.flPass.value.length < 4) {
        if (!gmwa.controllers.comercio.fastLoginFormMailExists) {
          gmwa.controllers.comercio.fastLoginFormMove(4);
        } else {
          gmwa.controllers.comercio.fastLoginFormMove(3);
        }
        gmwa.controllers.comercio.fastLoginShowError("Ingrese una contraseña válida");
        return;
      }
      data.name = gmwa.controllers.comercio.flName.value;
      data.email = encodeURIComponent(gmwa.controllers.comercio.flEmail.value);
      data.password = gmwa.controllers.comercio.flPass.value;
      gmwa.controllers.comercio.fastLoginFormMove(5);
      gmwa.controllers.comercio.doSendReviewAndLike(data, function (res) {
        // Check result to login user
        if (!res) {
          gmwa.controllers.comercio.fastLoginFormReset();
          return;
        }
        var expireDate = new Date(res.r.user.cookieTTL * 1000);
        document.cookie = res.r.user.cookieName + "=" + res.r.user.token + "; expires=" + expireDate.toUTCString() + "; path=/";

        gmwa.controllers.comercio.fastLoginFormMove(0);
        $("#fastLoginModal").foundation("close");
        cb(res);
      });
    });
  }
};
gmwa.controllers.comercio.fastLoginFormReset = function () {
  gmwa.controllers.comercio.btnFastLoginNext1.style.display = "block";
  gmwa.controllers.comercio.btnFastLoginNext2.style.display = "none";
  gmwa.controllers.comercio.flDesc.innerText = "Para poder enviar tu comentario es necesario inciar sesión";
  gmwa.controllers.comercio.flDesc.style.display = "block";
  gmwa.controllers.comercio.lblflPass.style.display = "none";
  gmwa.controllers.comercio.flPass.style.display = "none";
  gmwa.controllers.comercio.lblflEmail.style.display = "block";
  gmwa.controllers.comercio.flEmail.style.display = "block";
  gmwa.controllers.comercio.btnFastLoginNext1.disabled = false;
  gmwa.controllers.comercio.btnFastLoginNext2.disabled = false;
  gmwa.controllers.comercio.flName.disabled = false;
  gmwa.controllers.comercio.flPass.disabled = false;
  gmwa.controllers.comercio.flEmail.disabled = false;

  gmwa.controllers.comercio.inlineSpinner.style.display = "none";
  $("#commentMsg").prop("disabled", false);
  $("#commentBtn").prop("disabled", false);
};
gmwa.controllers.comercio.fastLoginFormMove = function (step) {
  gmwa.controllers.comercio.flErr.style.display = "none";
  if (step == 0) {
    gmwa.controllers.comercio.lblflEmail.style.display = "block";
    gmwa.controllers.comercio.flEmail.style.display = "block";
    gmwa.controllers.comercio.btnFastLoginNext1.style.display = "block";
    gmwa.controllers.comercio.flEmail.disabled = false;
    gmwa.controllers.comercio.btnFastLoginNext1.disabled = false;
  } else if (step == 1) {
    gmwa.controllers.comercio.flEmail.disabled = true;
    gmwa.controllers.comercio.btnFastLoginNext1.disabled = true;
  } else if (step == 2) {
    gmwa.controllers.comercio.lblflEmail.style.display = "none";
    gmwa.controllers.comercio.flEmail.style.display = "none";
    gmwa.controllers.comercio.btnFastLoginNext1.style.display = "none";
  } else if (step == 3) {
    gmwa.controllers.comercio.flDesc.innerText = "Ya existe una cuenta con ese correo, ingresa tu contraseña para continuar";
    gmwa.controllers.comercio.flDesc.style.display = "block";
    gmwa.controllers.comercio.lblflPass.style.display = "block";
    gmwa.controllers.comercio.flPass.style.display = "block";
    gmwa.controllers.comercio.btnFastLoginNext2.style.display = "block";
  } else if (step == 4) {
    gmwa.controllers.comercio.flDesc.innerText = "No existe una cuenta con ese correo, ingresa tu nombre y una contraseña para continuar";
    gmwa.controllers.comercio.flDesc.style.display = "block";
    gmwa.controllers.comercio.lblflName.style.display = "block";
    gmwa.controllers.comercio.flName.style.display = "block";
    gmwa.controllers.comercio.lblflPass.style.display = "block";
    gmwa.controllers.comercio.flPass.style.display = "block";
    gmwa.controllers.comercio.btnFastLoginNext2.style.display = "block";
  } else if (step == 5) {
    gmwa.controllers.comercio.lblflName.disabled = true;
    gmwa.controllers.comercio.flName.disabled = true;
    gmwa.controllers.comercio.lblflPass.disabled = true;
    gmwa.controllers.comercio.flPass.disabled = true;
    gmwa.controllers.comercio.btnFastLoginNext2.disabled = true;
  }
};
gmwa.controllers.comercio.fastLoginShowError = function (msg) {
  gmwa.controllers.comercio.flErr.innerText = msg;
  gmwa.controllers.comercio.flErr.style.display = "block";
};

gmwa.controllers.comercio.doReview = function () {
  var data = {};
  data.body = $("#commentMsg").val();
  data.retailer = $("#ficha").data("idr");
  data.store = $("#ficha").data("ids");
  data.like = gmwa.controllers.comercio.commentLike;
  var storeName = $("#ficha").data("name");

  if (data.body == null || data.body.length == 0) {
    $("#commentErrMsg").html("Ingresa tu comentario para poder enviarlo");
    return;
  } else {
    $("#commentErrMsg").html("");
  }
  if (data.like == undefined) {
    $("#commentErrMsg").html("Selecciona si recomiendas este lugar");
    return;
  }

  gmwa.logger.info("sendReview | Sending review ...");
  gmwa.controllers.comercio.inlineSpinner.style.display = "inline";
  $("#commentMsg").prop("disabled", true);
  $("#commentBtn").prop("disabled", true);
  gmwa.controllers.comercio.sendReviewAndLike(data, function (res) {
    if (res && res.outcode == 0) {
      // var html = '<div class="mensaje"><strong>Tu</strong> <span>'+data.body+'</span>';
      // html += '<div>Ahora</div>';
      // html += '</div>';
      // $('#cmntsCntr').prepend(html);
      // gmwa.utils.scrollTo('cmntsCntr');
      // gmwa.utils.flash('cmntsCntr');
      // $('#cmntCntr').text('Gracias por tu opinión!')
      $("#cmntCntr").html(
        '<div style="padding: 40px 0px 80px 0px;text-align:center"><svg style="width: 45px;height: 45px;margin: 10px 0px;fill: #9e9e9e;" height="511pt" viewBox="1 0 511 511.99995" width="511pt" xmlns="http://www.w3.org/2000/svg"><path d="m450.675781 125.457031-63.636719-63.636719-118.496093 119.488282 63.648437 63.644531zm0 0"/><path d="m211.527344 282.316406c-5.152344 12.371094 7.269531 24.777344 19.632812 19.609375l76.175782-39.40625-56.4375-56.4375zm0 0"/><path d="m508.105469 68.027344c5.859375-5.859375 5.859375-15.355469 0-21.214844l-42.421875-42.417969c-5.859375-5.859375-15.355469-5.859375-21.214844 0l-36.214844 36.214844 63.632813 63.636719zm0 0"/><path d="m45.5 421h15v76c0 6.0625 3.648438 11.542969 9.257812 13.855469 5.527344 2.308593 12.015626 1.078125 16.347657-3.25l86.605469-86.605469h174.789062c24.8125 0 45-20.1875 45-45v-148.933594l-47.316406 47.316406c-4.128906 4.132813-8.949219 7.382813-14.355469 9.652344l-85.882813 44.53125c-7.808593 3.371094-13.667968 4.558594-19.644531 4.558594-4.464843 0-8.769531-.859375-12.929687-2.125h-106.871094c-8.292969 0-15-6.710938-15-15 0-8.292969 6.707031-15 15-15h75.957031c-2.960937-9.820312-1.691406-20.457031 2.390625-30.21875l46.289063-89.898438c1.316406-3.324218 4.570312-8.160156 8.6875-12.273437l47.609375-47.609375h-240.933594c-24.8125 0-45 20.1875-45 45v210c0 24.8125 20.1875 45 45 45zm0 0"/></svg><div style="font-weight: 600;font-size: 18px;">Gracias por tu opinión!</div><div style="">Tu comentario será agregado al perfil de ' +
          storeName +
          " en las próximas 24 horas</div></div>"
      );
    } else {
      if (res && res.outcode == 139) {
        $("#cmntCntr").html(
          '<div style="padding: 40px 0px 80px 0px;text-align:center"><svg style="width: 45px;height: 45px;margin: 10px 0px;fill: #9e9e9e;" height="511pt" viewBox="1 0 511 511.99995" width="511pt" xmlns="http://www.w3.org/2000/svg"><path d="m450.675781 125.457031-63.636719-63.636719-118.496093 119.488282 63.648437 63.644531zm0 0"/><path d="m211.527344 282.316406c-5.152344 12.371094 7.269531 24.777344 19.632812 19.609375l76.175782-39.40625-56.4375-56.4375zm0 0"/><path d="m508.105469 68.027344c5.859375-5.859375 5.859375-15.355469 0-21.214844l-42.421875-42.417969c-5.859375-5.859375-15.355469-5.859375-21.214844 0l-36.214844 36.214844 63.632813 63.636719zm0 0"/><path d="m45.5 421h15v76c0 6.0625 3.648438 11.542969 9.257812 13.855469 5.527344 2.308593 12.015626 1.078125 16.347657-3.25l86.605469-86.605469h174.789062c24.8125 0 45-20.1875 45-45v-148.933594l-47.316406 47.316406c-4.128906 4.132813-8.949219 7.382813-14.355469 9.652344l-85.882813 44.53125c-7.808593 3.371094-13.667968 4.558594-19.644531 4.558594-4.464843 0-8.769531-.859375-12.929687-2.125h-106.871094c-8.292969 0-15-6.710938-15-15 0-8.292969 6.707031-15 15-15h75.957031c-2.960937-9.820312-1.691406-20.457031 2.390625-30.21875l46.289063-89.898438c1.316406-3.324218 4.570312-8.160156 8.6875-12.273437l47.609375-47.609375h-240.933594c-24.8125 0-45 20.1875-45 45v210c0 24.8125 20.1875 45 45 45zm0 0"/></svg><div style="">Tu comentario para ' +
            storeName +
            " ya fue enviado y será publicado en las siguientes 24 horas</div></div>"
        );
      } else {
        gmwa.utils.showError("Ocurrió un error", "No fue posible procesar su comentario en este momento.");
      }
    }
    $("#commentBtn #galspinner").remove();
    $("#cmntsEmpty").remove();
    $("#commentMsg").prop("disabled", false);
    $("#commentBtn").prop("disabled", false);
  });
};

gmwa.controllers.comercio.sendLike = function (data, cb) {
  $.ajax({
    type: "POST",
    url: "/local/like",
    data: JSON.stringify(data),
    dataType: "json",
    contentType: "application/json; charset=utf-8",
  })
    .done(function (resData) {
      if (resData.outcode == "0") {
        cb(true);
      } else {
        if (resData.outcode == 999) {
          gmwa.utils.showError("Inicia sesión", "Para poder recomendar un lugar");
          cb(false);
        } else {
          gmwa.logger.error("sendLike | Server returned " + resData.outcode + " (" + resData.outmsg + ")");
          cb(false);
        }
      }
    })
    .fail(function (err) {
      gmwa.logger.error("sendLike | API returned error: " + JSON.stringify(err));
      cb(false);
    });
};

gmwa.controllers.comercio.doLike = function (like) {
  var data = {};
  data.retailer = $("#ficha").data("idr");
  data.store = $("#ficha").data("ids");

  if (like) {
    data.recommend = 1;
  } else {
    data.recommend = 0;
  }
  $("#commentLike").prop("disabled", true);
  $("#commentDislike").prop("disabled", true);
  gmwa.logger.info("sendLike | Sending like to idr=" + data.retailer + ", ids=" + data.store + ", like=" + data.recommend + "...");
  // $('#liked').append(gmwa.controllers.comercio.inlineSpinner);
  gmwa.controllers.comercio.sendLike(data, function (res) {
    if (res) {
      if (data.recommend == 1) {
        var html = 'Haz recomendado este lugar <i class="fa fa-thumbs-o-up" aria-hidden="true"></i><div id="commentStopLike"><small><i class="fa fa-thumbs-o-down" aria-hidden="true"></i> Dejar de recomendar</small></div>';
        $("#liked").html(html);
        $("#commentStopLike").click(function (e) {
          gmwa.controllers.comercio.doLike(false);
        });
      } else {
        var html = 'No recomiendas este lugar <i class="fa fa-thumbs-o-down" aria-hidden="true"></i><div id="commentStartLike"><small><i class="fa fa-thumbs-o-up" aria-hidden="true"></i> Empezar a recomendar</small></div>';
        $("#liked").html(html);
        $("#commentStartLike").click(function (e) {
          gmwa.controllers.comercio.doLike(true);
        });
      }
    } else {
      gmwa.utils.showError("Ocurrió un error", "No fue posible procesar su comentario en este momento.");
      $("#liked #galspinner").remove();
    }
    $("#commentLike").prop("disabled", false);
    $("#commentDislike").prop("disabled", false);
  });
};

gmwa.controllers.comercio.openDirections = function (e) {
  e.preventDefault();
  var addr = $("#btn-getdir").data("addr");
  var lat = $("#btn-getdir").data("lat");
  var lon = $("#btn-getdir").data("lon");
  var link = "";

  if (/* if we're on iOS, open in Apple Maps */ navigator.platform.indexOf("iPhone") != -1 || navigator.platform.indexOf("iPad") != -1 || navigator.platform.indexOf("iPod") != -1) {
    link = encodeURI("maps://maps.google.com/maps?daddr=" + lat + "," + lon + "&amp;ll=");
  } else {
    if (addr && addr.length > 0) {
      link = encodeURI("https://maps.google.com/maps?daddr=" + addr + "@" + lat + "," + lon + "&amp;ll=");
    } else {
      link = encodeURI("https://maps.google.com/maps?daddr=" + lat + "," + lon + "&amp;ll=");
    }
  }

  //console.log(link);
  window.open(link);
};

gmwa.controllers.comercio.sendShareEvent = function (net) {
  var gaLabel = net + "|" + $("#ficha").data("name") + "|" + $("#ficha").data("idr") + "|" + $("#ficha").data("ids");
  gmwa.utils.sendGAEvent("Profile", "Share", gaLabel);
};

//
// Covers Carrousel
//
gmwa.controllers.comercio.coversCarrousel = null;
gmwa.controllers.comercio.coversCarrouselInterval = 0;
gmwa.controllers.comercio.initKeenSlider = function () {
  gmwa.controllers.comercio.coversCarrouselInterval = 0;
  var sliderElement = document.getElementById("keenCovers");
  if (!sliderElement) return;
  gmwa.controllers.comercio.coversCarrousel = new KeenSlider(sliderElement, {
    loop: true,
    duration: 1000,
    dragStart: function () {
      gmwa.controllers.comercio.carrouselAutoplay(false);
    },
    dragEnd: function () {
      gmwa.controllers.comercio.carrouselAutoplay(true);
    },
    created: function () {
      sliderElement.style.display = "flex";
      var slides = document.querySelectorAll(".keen-slider__slide");
      slides.forEach(function (slide, idx) {
        if (idx > 0) {
          slide.style.display = "block";
        }
      });
    },
    slideChanged: function (instance) {
      var slide = instance.details().relativeSlide;
      var dots = document.querySelectorAll(".story-dot ");
      dots.forEach(function (dot, idx) {
        if (idx == slide) {
          dot.classList.add("story-dot--active");
        } else {
          dot.classList.remove("story-dot--active");
        }
      });
    },
  });
  gmwa.controllers.comercio.carrouselAutoplay(true);
};
gmwa.controllers.comercio.carrouselAutoplay = function (run) {
  clearInterval(gmwa.controllers.comercio.coversCarrouselInterval);
  gmwa.controllers.comercio.coversCarrouselInterval = setInterval(function () {
    if (run && gmwa.controllers.comercio.coversCarrousel) {
      gmwa.controllers.comercio.coversCarrousel.next();
    }
  }, 5000);
};
