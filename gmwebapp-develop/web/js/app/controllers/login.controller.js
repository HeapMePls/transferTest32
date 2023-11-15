var gmwa = gmwa || {};
gmwa.controllers = gmwa.controllers || {};
gmwa.controllers.login = {};

gmwa.controllers.login.inlineSpinner = '<div id="galspinner" class="spinner spinnerInline spinnerWhite"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>';

gmwa.controllers.login.init = function(){

  gmwa.logger.log('Login|Init...');
  gmwa.components.header.init();
  // $('.lazy').Lazy({effect: 'fadeIn'});


  $('#forgotPassBtn').click(function(e){
    e.preventDefault();
    $('#boxLogin').hide();
    $('#boxForgotPass').show();
  });

  $('#reInit').click(function(e){
    e.preventDefault();
    $('#boxForgotPass').hide();
    $('#boxLogin').show();
  });

  $('#regreInit').click(function(e){
    e.preventDefault();
    $('#boxRegister').hide();
    $('#boxLogin').show();
  });
  
  $('#gotoRegister').click(function(e){
    e.preventDefault();
    $('#boxLogin').hide();
    $('#boxRegister').show();
  });

  $('#btnRecoverPas').click(function(e){
    e.preventDefault();

    var email = $('#recoverEmail').val();
    if (email == undefined || email == null || email.length == 0){
      $('#recoverError').html('Ingrese su direccion de correo electronico para recuperar su contraseña');
      return;
    }
    email = encodeURIComponent(email);

    $.ajax({
      type        : "GET",
      url         : '/resetPass?email='+email
    }).done(function(resData){
      $('#recoverRequest').hide();
      $('#recoverRequested').show();
    }).fail(function(err){
      gmwa.logger.error('btnRecoverPas | API returned error: ' + JSON.stringify(err));
      $('#recoverError').html('No fue posible solicitar la recuperacion en este momento.');
    });
  });

  $('#btnRegister').click(function(e){
    e.preventDefault();
    $('#reg_error').text('');
    $('#reg_error').hide();


    var email = $('#reg_email').val();
    if (email == undefined || email == null || email.length == 0){
      $('#reg_error').text('Ingrese su direccion de correo electronico');
      $('#reg_error').show();
      return;
    }
    email = encodeURIComponent(email);
    var username = $('#reg_username').val();
    if (username == undefined || username == null || username.length == 0){
      $('#reg_error').text('Ingrese su nombre');
      $('#reg_error').show();
      return;
    }
    var pass = $('#reg_pass').val();
    if (pass == undefined || pass == null || pass.length == 0){
      $('#reg_error').text('Ingrese una contraseña válida');
      $('#reg_error').show();
      return;
    }

    var data ={
      reg_email    : email,
      reg_username : username,
      reg_pass     : pass
    };

    $('#btnRegister').html('Espere...');
    $('#btnRegister').append(gmwa.controllers.login.inlineSpinner);
    $('#btnRegister').prop('disabled', true);
    $.ajax({
      type        : "POST",
      url         : '/register',
      data        : JSON.stringify(data),
      dataType    : 'json',
      contentType : "application/json; charset=utf-8"
    }).done(function(resData){
      $('#btnRegister').html('Crear usuario');
      $('#btnRegister #galspinner').remove();
      $('#btnRegister').prop('disabled', false);
      console.log(resData);
      if (resData.outcode == 999){
        $('#reg_error').html('<i class="fa fa-exclamation" aria-hidden="true"></i> Ingrese su direccion de correo electronico');
        $('#reg_error').show();
      }else if (resData.outcode == 998){
        $('#reg_error').html('<i class="fa fa-exclamation" aria-hidden="true"></i> Ingrese su nombre');
        $('#reg_error').show();
      }else if (resData.outcode == 997){
        $('#reg_error').html('<i class="fa fa-exclamation" aria-hidden="true"></i> Ingrese una contraseña válida');
        $('#reg_error').show();
      }else if (resData.outcode == 142){
        $('#reg_error').html('<i class="fa fa-exclamation" aria-hidden="true"></i> La dirección de correo ingresada ya está registrada');
        $('#reg_error').show();
      }else if (resData.outcode == 0){
        data.reg_email = decodeURIComponent(data.reg_email);
        $('#boxRegister').hide();
        $('#boxLogin').show();
        $('#lblRegOk').html('<strong style="color: #1497d8;"><i class="fa fa-check-circle-o" aria-hidden="true"></i> Bienvenido '+data.reg_username+'!</strong> <br>Por favor inicia sesion con tu clave ahora.');
        $('#lblRegOk').show();
        $('#username').val(data.reg_email);
      }else{
        $('#reg_error').html('<i class="fa fa-exclamation" aria-hidden="true"></i> No es posible realizar el registro en este momento. (' + resData.outcode + ')');
        $('#reg_error').show();
      }
    }).fail(function(err){
      $('#btnRegister').html('Crear usuario');
      $('#btnRegister #galspinner').remove();
      $('#btnRegister').prop('disabled', false);
      gmwa.logger.error('btnRegister | API returned error: ' + JSON.stringify(err));
      $('#reg_error').html('<i class="fa fa-exclamation" aria-hidden="true"></i> No fue posible realizar el registro en este momento.');
    });
  });

};
