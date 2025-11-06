
function redirectToLogin() {
  localStorage.removeItem('access_token');
  window.location.href = 'index.html';
}
    
    async function loadDashboardData() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = 'index.html';
        return;
      }

      try {
        // Registrar validación en el loader universal
        const validatePromise = fetch(API_URLS.usuarios.validate(), {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        }).then(res => {
          if (!res.ok) throw new Error('No se pudo validar el token');
          return res.json();
        });

        // Registrar en el universal loader
        if (window.universalLoader) {
          window.universalLoader.registerApiCall(validatePromise, 'Validar Usuario');
        }

        const userData = await validatePromise;
        
        // Check user status
        if (userData.persona && userData.persona.estadoRegistro === 'Inactivo') {
          alert('Debes completar todos tus datos');
          window.location.href = 'completarDatos.html';
          return;
        }
        
        if (userData.persona && userData.persona.estadoRegistro !== 'Aceptado') {
          window.location.href = 'index.html';
          return;
        }
        
        // Get user data from cooperativa API
        try {
          const userDataPromise = fetch(API_URLS.cooperativa.datosUsuario(), {
            headers: {
              'Authorization': 'Bearer ' + token,
              'Accept': 'application/json'
            }
          });

          // Registrar en el universal loader
          if (window.universalLoader) {
            window.universalLoader.registerApiCall(userDataPromise, 'Datos Usuario');
          }

          const userDataRes = await userDataPromise;
          
          if (userDataRes.ok) {
            const userInfo = await userDataRes.json();
            
            // Get name from persona object
            const userName = userInfo.persona?.name || 
                           userInfo.user?.name || 
                           (userData.persona ? userData.persona.nombre : 'Usuario');
            
            document.getElementById('userName').textContent = userName;
          } else {
            // Fallback to validation data
            const userName = userData.persona ? userData.persona.nombre : 'Usuario';
            document.getElementById('userName').textContent = userName;
          }
        } catch (err) {
          // Fallback to validation data
          const userName = userData.persona ? userData.persona.nombre : 'Usuario';
          document.getElementById('userName').textContent = userName;
        }
        
        // Load upcoming events
        await loadAsambleasStats();
        
      } catch (err) {
        window.location.href = 'index.html';
      }
    }
    
    // Load asambleas statistics
    async function loadAsambleasStats() {
      try {
        const token = localStorage.getItem('access_token');
        
        // Crear promesa y registrarla
        const asambleasPromise = fetch(API_URLS.cooperativa.asambleas(), {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        }).then(res => {
          if (!res.ok) throw new Error('Error al cargar asambleas');
          return res.json();
        });

        // Registrar en el universal loader
        if (window.universalLoader) {
          window.universalLoader.registerApiCall(asambleasPromise, 'Asambleas');
        }

        const data = await asambleasPromise;
        
        if (data) {
          const asambleas = Array.isArray(data) ? data : (data.data || []);
          
          // Filter future asambleas
          const now = new Date();
          const futureAsambleas = asambleas.filter(a => new Date(a.fecha_raw) >= now);
          
          // Show upcoming events
          const upcomingContainer = document.getElementById('upcomingEvents');
          if (upcomingContainer && futureAsambleas.length > 0) {
            upcomingContainer.innerHTML = futureAsambleas.slice(0, 3).map(asamblea => {
              // Parse date correctly to avoid timezone issues
              const fechaParts = asamblea.fecha_raw.split('-');
              const fecha = new Date(fechaParts[0], fechaParts[1] - 1, fechaParts[2]);
              const day = fecha.getDate();
              const month = fecha.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
              
              return `
                <div class="upcoming-item">
                  <div class="upcoming-date">
                    <div class="upcoming-day">${day}</div>
                    <div class="upcoming-month">${month}</div>
                  </div>
                  <div class="upcoming-info">
                    <h4>${asamblea.titulo || 'Asamblea'}</h4>
                    <p>${asamblea.lugar || 'Por definir'} ${asamblea.hora ? '• ' + asamblea.hora : ''}</p>
                  </div>
                </div>
              `;
            }).join('');
          }
        }
      } catch (err) {
        }
    }
    
    // Initialize dashboard only if we're on the dashboard page
    document.addEventListener('DOMContentLoaded', async function() {
      // Check if we're on dashboard.html
      const isDashboardPage = window.location.pathname.includes('dashboard.html');
      
      if (isDashboardPage) {
        try {
          await loadDashboardData();
        } catch (error) {
          console.error('Error cargando dashboard:', error);
          // Forzar mostrar contenido incluso si hay error
          if (window.universalLoader) {
            window.universalLoader.forceShow();
          }
        }
      }
    });
