
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
        
        // Load payment notifications
        await loadPaymentNotifications();
        
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

    // Load payment notifications
    async function loadPaymentNotifications() {
      try {
        const token = localStorage.getItem('access_token');
        
        // Crear promesa y registrarla
        const comprobantesPromise = fetch(API_URLS.cooperativa.comprobantes(), {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        }).then(res => {
          if (!res.ok) throw new Error('Error al cargar comprobantes');
          return res.json();
        });

        // Registrar en el universal loader
        if (window.universalLoader) {
          window.universalLoader.registerApiCall(comprobantesPromise, 'Notificaciones de Pagos');
        }

        const data = await comprobantesPromise;
        
        if (data) {
          const comprobantes = Array.isArray(data) ? data : (data.data || data.facturas || []);
          
          // Obtener primer y último día del mes actual
          const now = new Date();
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          
          // Filtrar facturas del mes actual usando fecha_pago
          const currentMonthFacturas = comprobantes.filter(c => {
            // Usar fecha_pago en lugar de created_at
            const dateString = c.fecha_pago || c.created_at;
            
            // Parsear fecha sin zona horaria para evitar problemas de UTC
            const parts = dateString.split(/[-T]/);
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const day = parseInt(parts[2]);
            
            const paymentDate = new Date(year, month, day);
            return paymentDate >= firstDayOfMonth && paymentDate <= lastDayOfMonth;
          });
          
          // Separar por estado (priorizar rechazados, luego pendientes, luego aceptados)
          const rejected = currentMonthFacturas.filter(c => c.Estado_Pago === 'Rechazado');
          const pending = currentMonthFacturas.filter(c => c.Estado_Pago === 'Pendiente');
          const approved = currentMonthFacturas.filter(c => c.Estado_Pago === 'Aceptado');
          
          // Mostrar notificaciones
          const notificationsContainer = document.getElementById('paymentNotifications');
          if (notificationsContainer) {
            const notifications = [];
            
            // Agregar rechazados primero (son los más importantes)
            rejected.forEach(comp => {
              notifications.push(createNotificationItem(comp, 'rejected'));
            });
            
            // Agregar pendientes
            pending.forEach(comp => {
              notifications.push(createNotificationItem(comp, 'pending'));
            });
            
            // Agregar aceptados
            approved.forEach(comp => {
              notifications.push(createNotificationItem(comp, 'approved'));
            });
            
            if (notifications.length > 0) {
              // Mostrar un resumen en la parte superior
              const monthName = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
              const summary = `
                <div class="month-summary">
                  <h6 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-weight: 600;">
                    <i class="bi bi-calendar-month"></i> ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                  </h6>
                  <div style="display: flex; gap: 1rem; font-size: 0.85rem; color: var(--text-secondary); flex-wrap: wrap;">
                    ${rejected.length > 0 ? `<span><i class="bi bi-x-circle-fill" style="color: var(--error);"></i> ${rejected.length} Rechazada${rejected.length !== 1 ? 's' : ''}</span>` : ''}
                    ${pending.length > 0 ? `<span><i class="bi bi-clock-history" style="color: var(--warning);"></i> ${pending.length} Pendiente${pending.length !== 1 ? 's' : ''}</span>` : ''}
                    ${approved.length > 0 ? `<span><i class="bi bi-check-circle-fill" style="color: var(--success);"></i> ${approved.length} Aceptada${approved.length !== 1 ? 's' : ''}</span>` : ''}
                  </div>
                </div>
              `;
              notificationsContainer.innerHTML = summary + notifications.join('');
            } else {
              const monthName = now.toLocaleDateString('es-ES', { month: 'long' });
              notificationsContainer.innerHTML = `
                <div class="empty-state">
                  <i class="bi bi-inbox"></i>
                  <p>No hay facturas en ${monthName}</p>
                </div>
              `;
            }
          }
        }
      } catch (err) {
        console.error('Error cargando notificaciones:', err);
      }
    }

    // Crear item de notificación
    function createNotificationItem(comprobante, tipo) {
      const amount = formatCurrency(comprobante.Monto);
      // Usar fecha_pago en lugar de created_at
      const date = formatShortDate(comprobante.fecha_pago || comprobante.created_at);
      const concepto = comprobante.motivo || comprobante.Concepto || 'Sin concepto';
      
      let icon, title, message, cssClass;
      
      switch(tipo) {
        case 'pending':
          icon = 'bi-clock-history';
          title = 'Factura Pendiente';
          message = `${concepto} - ${amount}`;
          cssClass = 'pending';
          break;
        case 'approved':
          icon = 'bi-check-circle-fill';
          title = 'Factura Aceptada';
          message = `${concepto} - ${amount}`;
          cssClass = 'approved';
          break;
        case 'rejected':
          icon = 'bi-x-circle-fill';
          title = 'Factura Rechazada';
          message = `${concepto} - ${amount}`;
          cssClass = 'rejected';
          break;
      }
      
      return `
        <div class="notification-item ${cssClass}" onclick="window.location.href='FacturaDetalle.html?id=${comprobante.id}'" style="cursor: pointer;">
          <div class="notification-icon ${cssClass}">
            <i class="${icon}"></i>
          </div>
          <div class="notification-content">
            <h5>${title}</h5>
            <p>${message}</p>
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 0.25rem;">${date}</span>
          </div>
        </div>
      `;
    }

    // Formatear moneda
    function formatCurrency(amount) {
      if (!amount && amount !== 0) return '$0';
      try {
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(amount);
      } catch (error) {
        return `$${amount}`;
      }
    }

    // Formatear fecha corta
    function formatShortDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        // Parsear fecha sin zona horaria para evitar problemas de UTC
        const parts = dateString.split(/[-T]/);
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        
        const date = new Date(year, month, day);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      } catch (error) {
        return dateString;
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
