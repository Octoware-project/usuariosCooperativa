    let userData = {};

    function redirectToLogin() {
      localStorage.removeItem('access_token');
      window.location.href = 'index.html';
    }

    // Función para mostrar alerta de éxito personalizada
    function showSuccessAlert(message, callback) {
      // Crear el overlay
      const overlay = document.createElement('div');
      overlay.className = 'custom-alert-overlay';
      
      // Crear el contenedor del alert
      const alertBox = document.createElement('div');
      alertBox.className = 'custom-alert-box';
      
      // Crear el contenido del alert
      alertBox.innerHTML = `
        <div class="custom-alert-icon">
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <h3 class="custom-alert-title">¡Éxito!</h3>
        <p class="custom-alert-message">${message}</p>
        <button class="custom-alert-btn">Aceptar</button>
      `;
      
      overlay.appendChild(alertBox);
      document.body.appendChild(overlay);
      
      // Animar entrada
      setTimeout(() => {
        overlay.classList.add('show');
        alertBox.classList.add('show');
      }, 10);
      
      // Manejar click en botón
      const btn = alertBox.querySelector('.custom-alert-btn');
      btn.addEventListener('click', () => {
        overlay.classList.remove('show');
        alertBox.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(overlay);
          if (callback) callback();
        }, 300);
      });
    }

    // Función para mostrar alerta de error personalizada
    function showErrorAlert(message) {
      // Crear el overlay
      const overlay = document.createElement('div');
      overlay.className = 'custom-alert-overlay';
      
      // Crear el contenedor del alert
      const alertBox = document.createElement('div');
      alertBox.className = 'custom-alert-box';
      
      // Crear el contenido del alert
      alertBox.innerHTML = `
        <div class="custom-alert-icon error">
          <i class="bi bi-exclamation-circle-fill"></i>
        </div>
        <h3 class="custom-alert-title">Error</h3>
        <p class="custom-alert-message">${message}</p>
        <button class="custom-alert-btn">Aceptar</button>
      `;
      
      overlay.appendChild(alertBox);
      document.body.appendChild(overlay);
      
      // Animar entrada
      setTimeout(() => {
        overlay.classList.add('show');
        alertBox.classList.add('show');
      }, 10);
      
      // Manejar click en botón
      const btn = alertBox.querySelector('.custom-alert-btn');
      btn.addEventListener('click', () => {
        overlay.classList.remove('show');
        alertBox.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 300);
      });
    }

    async function loadUserData() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          redirectToLogin();
          return;
        }

        const res = await fetch(API_URLS.cooperativa.datosUsuario(), {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            redirectToLogin();
            return;
          }
          throw new Error(`Error del servidor: ${res.status}`);
        }

        const data = await res.json();
        userData = data.usuario || {};
        
        // Actualizar UI con datos del usuario
        const name = userData.name || 'Usuario';
        const email = userData.email || '';
        
        // Actualizar mobile user icon
        const userIconMobile = document.getElementById('userIconMobile');
        if (userIconMobile) {
          userIconMobile.textContent = name.charAt(0).toUpperCase();
        }
        
        // Actualizar campo oculto de username
        document.getElementById('username').value = email;
        
      } catch (err) {
        console.error('Error cargando datos:', err);
      }
    }

    // Función logout (compatible con navbar-functions.js)
    function logout() {
      localStorage.removeItem('access_token');
      window.location.href = 'index.html';
    }

    // Manejar envío del formulario
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = e.target.querySelector('.btn-save');
      const btnText = submitBtn.querySelector('span');
      const btnIcon = submitBtn.querySelector('i');
      const originalText = btnText.textContent;
      
      const currentPassword = document.getElementById('current_password').value;
      const newPassword = document.getElementById('password').value;
      const confirmPassword = document.getElementById('password_confirmation').value;
      
      // Validar que las contraseñas coincidan
      if (newPassword !== confirmPassword) {
        showErrorAlert('Las contraseñas no coinciden');
        return;
      }
      
      // Validar longitud mínima
      if (newPassword.length < 8) {
        showErrorAlert('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      
      // Mostrar animación de carga
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      btnIcon.className = 'bi bi-arrow-repeat spinner';
      
      // Usar traducción si está disponible
      const savingText = (typeof LanguageManager !== 'undefined' && LanguageManager.translate) 
        ? LanguageManager.translate('profile.saving') 
        : 'Guardando...';
      btnText.textContent = savingText;
      
      try {
        const token = localStorage.getItem('access_token');
        
        const res = await fetch(API_URLS.cooperativa.cambiarContrasena(), {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword
          })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || 'Error al cambiar la contraseña');
        }
        
        // Mostrar éxito
        btnIcon.className = 'bi bi-check-circle-fill';
        
        // Usar traducción si está disponible
        const savedText = (typeof LanguageManager !== 'undefined' && LanguageManager.translate) 
          ? LanguageManager.translate('profile.saved') 
          : '¡Guardado!';
        btnText.textContent = savedText;
        
        // Mostrar alerta de confirmación personalizada
        showSuccessAlert('Contraseña actualizada correctamente', () => {
          document.getElementById('passwordForm').reset();
          // Invalidar el caché para forzar recarga de datos
          localStorage.removeItem('user_cache');
          // Redirigir a la página de perfil
          window.location.href = 'PerfilUsuario.html';
        });
        
      } catch (err) {
        console.error('Error:', err);
        
        // Restaurar botón en caso de error
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        btnIcon.className = 'bi bi-check-circle-fill';
        btnText.textContent = originalText;
        
        showErrorAlert(err.message || 'Error al cambiar la contraseña');
      }
    });

    // Botón cancelar
    document.getElementById('cancelBtn').addEventListener('click', () => {
      window.location.href = 'PerfilUsuario.html';
    });

    // Cargar datos al iniciar
    document.addEventListener('DOMContentLoaded', loadUserData);