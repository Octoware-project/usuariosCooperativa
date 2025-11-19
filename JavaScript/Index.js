  $(document).ready(function(){
    var accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      $.ajax({
        url: API_URLS.usuarios.validate(),
        type: 'GET',
        headers: {
          "Accept": "application/json",
          "Authorization": "Bearer " + accessToken
        },
        success: function(data) {
          window.location.href = 'dashboard.html';
        },
        error: function() {
          localStorage.removeItem("access_token");
        }
      });
    }

    $('#loginForm').on('submit', function(e) {
      e.preventDefault();
      return false;
    });

    $('#usuario, #password').on('keypress', function(e) {
    if (e.which === 13) {
      e.preventDefault();
      $('#boton').click();
    }
    });

    $("#boton").click(function(){
      var usuario = $("#usuario").val().trim();
      var password = $("#password").val().trim();

      if (!usuario || !password) {
        $("#error").html("Todos los campos son obligatorios.");
        return;
      }

      $("#boton").prop("disabled", true);
      $("#loader").show();
      $("#error").html("");

      var data = {
        "username": usuario,
        "password": password,
        "grant_type": "password",
        "client_id": API_CONFIG.OAUTH_CLIENT_ID,
        "client_secret": API_CONFIG.OAUTH_CLIENT_SECRET
      };

      // Convertir a x-www-form-urlencoded
      var formBody = Object.keys(data).map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
      }).join('&');

      $.ajax({
        url: API_URLS.usuarios.token(),
        type: 'POST',
        headers: {
          "Accept" : "application/json",
          "Content-Type" : "application/x-www-form-urlencoded",
        },
        data: formBody,
        success: function(data) {
          localStorage.setItem("access_token", data.access_token);
          $.ajax({
            url: API_URLS.usuarios.validate(),
            type: 'GET',
            headers: {
              'Authorization': 'Bearer ' + data.access_token,
              'Accept': 'application/json'
            },
            success: function(res) {
              if (res.persona && (res.persona.estadoRegistro === 'Aceptado' || res.persona.estadoRegistro === 'Inactivo')) {
                window.location.href = "dashboard.html";
              } else {
                $("#error").html("Tu cuenta no está habilitada para acceder.");
              }
            },
            error: function() {
              window.location.href = "dashboard.html";
            }
          });
        },
        error: function(xhr){
          let msg = "Credenciales incorrectas";
          if (xhr.responseJSON) {
            if (xhr.responseJSON.error_description) {
              msg = xhr.responseJSON.error_description;
            } else if (xhr.responseJSON.error) {
              msg = xhr.responseJSON.error;
            }
          }
          $("#error").html(msg);
        },
        complete: function() {
          $("#boton").prop("disabled", false);
          $("#loader").hide();
        }
      });
    });
  });