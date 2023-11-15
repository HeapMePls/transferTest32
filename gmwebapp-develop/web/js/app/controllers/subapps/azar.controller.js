gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.azar = {};

gmwa.controllers.azar.init = function(){
  gmwa.logger.log('Azar|Init...');
  $('#mi-azar').addClass('u-tb-item-selected');
  gmwa.components.header.init();
  

  $('#bPanel2').on('click', function(e){
    e.preventDefault();

    if (gmwa.controllers.azar.quinielaLoaded) return;

    $.ajax({
      url      : '/azar/quiniela',
      contentType:"application/json; charset=utf-8"
    }).done(function(datos){
      if (datos){
        $('#quinTitle1').text(datos.tipo1);
        $('#quinFecha1').text(datos.fecha1);
        $('#quinNum1').html(
          '<li><span class="badge">01</span> '+datos.num1_01+'</li>' +
          '<li><span class="badge">02</span> '+datos.num1_02+'</li>' +
          '<li><span class="badge">03</span> '+datos.num1_03+'</li>' +
          '<li><span class="badge">04</span> '+datos.num1_04+'</li>' +
          '<li><span class="badge">05</span> '+datos.num1_05+'</li>'
        );
        $('#quinNum2').html(
          '<li><span class="badge">06</span> '+datos.num1_06+'</li>' +
          '<li><span class="badge">07</span> '+datos.num1_07+'</li>' +
          '<li><span class="badge">08</span> '+datos.num1_08+'</li>' +
          '<li><span class="badge">09</span> '+datos.num1_09+'</li>' +
          '<li><span class="badge">10</span> '+datos.num1_10+'</li>'
        );
        $('#quinNum3').html(
          '<li><span class="badge">11</span> '+datos.num1_11+'</li>' +
          '<li><span class="badge">12</span> '+datos.num1_12+'</li>' +
          '<li><span class="badge">13</span> '+datos.num1_13+'</li>' +
          '<li><span class="badge">14</span> '+datos.num1_14+'</li>' +
          '<li><span class="badge">15</span> '+datos.num1_15+'</li>'
        );
        $('#quinNum4').html(
          '<li><span class="badge">16</span> '+datos.num1_16+'</li>' +
          '<li><span class="badge">17</span> '+datos.num1_17+'</li>' +
          '<li><span class="badge">18</span> '+datos.num1_18+'</li>' +
          '<li><span class="badge">19</span> '+datos.num1_19+'</li>' +
          '<li><span class="badge">20</span> '+datos.num1_20+'</li>'
        );
        $('#quinTitle2').text(datos.tipo2);
        $('#quinFecha2').text(datos.fecha2);
        $('#quinNum21').html(
          '<li><span class="badge">01</span> '+datos.num2_01+'</li>' +
          '<li><span class="badge">02</span> '+datos.num2_02+'</li>' +
          '<li><span class="badge">03</span> '+datos.num2_03+'</li>' +
          '<li><span class="badge">04</span> '+datos.num2_04+'</li>' +
          '<li><span class="badge">05</span> '+datos.num2_05+'</li>'
        );
        $('#quinNum22').html(
          '<li><span class="badge">06</span> '+datos.num2_06+'</li>' +
          '<li><span class="badge">07</span> '+datos.num2_07+'</li>' +
          '<li><span class="badge">08</span> '+datos.num2_08+'</li>' +
          '<li><span class="badge">09</span> '+datos.num2_09+'</li>' +
          '<li><span class="badge">10</span> '+datos.num2_10+'</li>'
        );
        $('#quinNum23').html(
          '<li><span class="badge">11</span> '+datos.num2_11+'</li>' +
          '<li><span class="badge">12</span> '+datos.num2_12+'</li>' +
          '<li><span class="badge">13</span> '+datos.num2_13+'</li>' +
          '<li><span class="badge">14</span> '+datos.num2_14+'</li>' +
          '<li><span class="badge">15</span> '+datos.num2_15+'</li>'
        );
        $('#quinNum24').html(
          '<li><span class="badge">16</span> '+datos.num2_16+'</li>' +
          '<li><span class="badge">17</span> '+datos.num2_17+'</li>' +
          '<li><span class="badge">18</span> '+datos.num2_18+'</li>' +
          '<li><span class="badge">19</span> '+datos.num2_19+'</li>' +
          '<li><span class="badge">20</span> '+datos.num2_20+'</li>'
        );
        //$('#azarTabs').foundation('selectTab', '#panel2', true);
        gmwa.controllers.azar.quinielaLoaded = true;
      }
    }).fail(function(err){
      gmwa.logger.error('Could not get quinela info: ' + JSON.stringify(err));
    });

  });

  $('#bPanel3').on('click', function(e){
    e.preventDefault();

    if (gmwa.controllers.azar.tombolaLoaded) return;

    $.ajax({
      url      : '/azar/tombola',
      contentType:"application/json; charset=utf-8"
    }).done(function(datos){
      if (datos){
        $('#tombTitle1').text(datos.tipo1);
        $('#tombFecha1').text(datos.fecha1);
        $('#tombNum1').html(
          '<li><span class="badge">01</span> '+datos.num1_01+'</li>' +
          '<li><span class="badge">02</span> '+datos.num1_02+'</li>' +
          '<li><span class="badge">03</span> '+datos.num1_03+'</li>' +
          '<li><span class="badge">04</span> '+datos.num1_04+'</li>' +
          '<li><span class="badge">05</span> '+datos.num1_05+'</li>'
        );
        $('#tombNum2').html(
          '<li><span class="badge">06</span> '+datos.num1_06+'</li>' +
          '<li><span class="badge">07</span> '+datos.num1_07+'</li>' +
          '<li><span class="badge">08</span> '+datos.num1_08+'</li>' +
          '<li><span class="badge">09</span> '+datos.num1_09+'</li>' +
          '<li><span class="badge">10</span> '+datos.num1_10+'</li>'
        );
        $('#tombNum3').html(
          '<li><span class="badge">11</span> '+datos.num1_11+'</li>' +
          '<li><span class="badge">12</span> '+datos.num1_12+'</li>' +
          '<li><span class="badge">13</span> '+datos.num1_13+'</li>' +
          '<li><span class="badge">14</span> '+datos.num1_14+'</li>' +
          '<li><span class="badge">15</span> '+datos.num1_15+'</li>'
        );
        $('#tombNum4').html(
          '<li><span class="badge">16</span> '+datos.num1_16+'</li>' +
          '<li><span class="badge">17</span> '+datos.num1_17+'</li>' +
          '<li><span class="badge">18</span> '+datos.num1_18+'</li>' +
          '<li><span class="badge">19</span> '+datos.num1_19+'</li>' +
          '<li><span class="badge">20</span> '+datos.num1_20+'</li>'
        );
        $('#tombTitle2').text(datos.tipo2);
        $('#tombFecha2').text(datos.fecha2);
        $('#tombNum21').html(
          '<li><span class="badge">01</span> '+datos.num2_01+'</li>' +
          '<li><span class="badge">02</span> '+datos.num2_02+'</li>' +
          '<li><span class="badge">03</span> '+datos.num2_03+'</li>' +
          '<li><span class="badge">04</span> '+datos.num2_04+'</li>' +
          '<li><span class="badge">05</span> '+datos.num2_05+'</li>'
        );
        $('#tombNum22').html(
          '<li><span class="badge">06</span> '+datos.num2_06+'</li>' +
          '<li><span class="badge">07</span> '+datos.num2_07+'</li>' +
          '<li><span class="badge">08</span> '+datos.num2_08+'</li>' +
          '<li><span class="badge">09</span> '+datos.num2_09+'</li>' +
          '<li><span class="badge">10</span> '+datos.num2_10+'</li>'
        );
        $('#tombNum23').html(
          '<li><span class="badge">11</span> '+datos.num2_11+'</li>' +
          '<li><span class="badge">12</span> '+datos.num2_12+'</li>' +
          '<li><span class="badge">13</span> '+datos.num2_13+'</li>' +
          '<li><span class="badge">14</span> '+datos.num2_14+'</li>' +
          '<li><span class="badge">15</span> '+datos.num2_15+'</li>'
        );
        $('#tombNum24').html(
          '<li><span class="badge">16</span> '+datos.num2_16+'</li>' +
          '<li><span class="badge">17</span> '+datos.num2_17+'</li>' +
          '<li><span class="badge">18</span> '+datos.num2_18+'</li>' +
          '<li><span class="badge">19</span> '+datos.num2_19+'</li>' +
          '<li><span class="badge">20</span> '+datos.num2_20+'</li>'
        );
        gmwa.controllers.azar.tombolaLoaded = true;
      }
    }).fail(function(err){
      gmwa.logger.error('Could not get tombola info: ' + JSON.stringify(err));
    });
  });

  $('#bPanel4').on('click', function(e){
    e.preventDefault();

    if (gmwa.controllers.azar.loteriaLoaded) return;

    $.ajax({
      url      : '/azar/loteria',
      contentType:"application/json; charset=utf-8"
    }).done(function(datos){
      if (datos){
        $('#lotFecha1').text(datos.fecha);
        $('#lotNum1').html(
          '<li><span class="badge">01</span> '+datos.num01+'</li>' +
          '<li><span class="badge">02</span> '+datos.num02+'</li>' +
          '<li><span class="badge">03</span> '+datos.num03+'</li>' +
          '<li><span class="badge">04</span> '+datos.num04+'</li>' +
          '<li><span class="badge">05</span> '+datos.num05+'</li>'
        );
        $('#lotNum2').html(
          '<li><span class="badge">06</span> '+datos.num06+'</li>' +
          '<li><span class="badge">07</span> '+datos.num07+'</li>' +
          '<li><span class="badge">08</span> '+datos.num08+'</li>' +
          '<li><span class="badge">09</span> '+datos.num09+'</li>' +
          '<li><span class="badge">10</span> '+datos.num10+'</li>'
        );
        $('#lotNum3').html(
          '<li><span class="badge">11</span> '+datos.num11+'</li>' +
          '<li><span class="badge">12</span> '+datos.num12+'</li>' +
          '<li><span class="badge">13</span> '+datos.num13+'</li>' +
          '<li><span class="badge">14</span> '+datos.num14+'</li>' +
          '<li><span class="badge">15</span> '+datos.num15+'</li>'
        );
        $('#lotNum4').html(
          '<li><span class="badge">16</span> '+datos.num16+'</li>' +
          '<li><span class="badge">17</span> '+datos.num17+'</li>' +
          '<li><span class="badge">18</span> '+datos.num18+'</li>' +
          '<li><span class="badge">19</span> '+datos.num19+'</li>' +
          '<li><span class="badge">20</span> '+datos.num20+'</li>'
        );
        $('#lotAprox1').text(datos.aprox1);
        $('#lotAprox2').text(datos.aprox2);
        $('#lotPrem01').text(datos.prem01);
        $('#lotPrem02').text(datos.prem02);
        $('#lotPrem03').text(datos.prem03);
        $('#lotPrem04_05').text(datos.prem04_05);
        $('#lotPrem06_10').text(datos.prem06_10);
        $('#lotPrem11_20').text(datos.prem11_20);
        $('#lotPremaprox').text(datos.premaprox);
        gmwa.controllers.azar.loteriaLoaded = true;
      }
    }).fail(function(err){
      gmwa.logger.error('Could not get loteria info: ' + JSON.stringify(err));
    });
  });

  //$('.lazy').Lazy({effect: 'fadeIn'});
};