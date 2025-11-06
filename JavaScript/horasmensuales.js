// Modern horas mensuales management with cards UI
document.addEventListener('DOMContentLoaded', function() {
      loadNavbar();
      initFilters();
      initSkeletonLoader();
      
      loadHoras(); 
      
      // Redirigir al hacer click en el botón de planes de trabajo
      var btnPlanes = document.getElementById('btn-ver-planes');
      if (btnPlanes) {
        btnPlanes.addEventListener('click', function() {
          window.location.href = 'PlanesTrabajoUsuario.html';
        });
      }
    });

    // Filter Functions
    function initFilters() {
      // Chip filters
      const chips = document.querySelectorAll('.chip');
      chips.forEach(chip => {
        chip.addEventListener('click', function() {
          // Remove active class from all chips
          chips.forEach(c => c.classList.remove('active'));
          // Add active class to clicked chip
          this.classList.add('active');
          
          // Filter horas based on type
          const type = this.getAttribute('onclick').match(/filterByType\('([^']+)'\)/)[1];
          filterHoras(type);
        });
      });
      
      // Search functionality
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          filterHorasBySearch(this.value);
        });
      }
    }

    function toggleFilters() {
      const filtersPanel = document.getElementById('filtersPanel');
      filtersPanel.classList.toggle('active');
    }
    
    // Expose globally for HTML onclick
    window.toggleFilters = toggleFilters;

    // Skeleton Loader
    function initSkeletonLoader() {
      const skeletonCards = document.querySelectorAll('#horasGrid .hora-card.skeleton');
      
      // Hide skeleton after loading
      setTimeout(() => {
        skeletonCards.forEach(card => {
          card.style.opacity = '0';
          setTimeout(() => card.style.display = 'none', 300);
        });
      }, 2000);
    }

    // Mostrar skeleton loaders
    function mostrarSkeletons() {
      // Mostrar skeleton cards
      const skeletonCards = document.querySelectorAll('#horasGrid .hora-card.skeleton');
      skeletonCards.forEach(card => {
        card.style.display = 'block';
        card.style.opacity = '1';
      });
      
      // Progreso
      const barSkeleton = document.getElementById('progress-bar-bg-skeleton');
      const barContainer = document.getElementById('progress-bar-container');
      if (barSkeleton) barSkeleton.style.display = 'flex';
      if (barContainer) barContainer.style.display = 'none';
      const values = document.getElementById('progress-values');
      if (values) values.innerHTML = '&nbsp;';
    }

    // Ocultar skeleton loaders
    function ocultarSkeletons() {
      // Ocultar skeleton cards
      const skeletonCards = document.querySelectorAll('#horasGrid .hora-card.skeleton');
      skeletonCards.forEach(card => {
        card.style.opacity = '0';
        setTimeout(() => card.style.display = 'none', 300);
      });
      
      // Progreso
      const barSkeleton = document.getElementById('progress-bar-bg-skeleton');
      const barContainer = document.getElementById('progress-bar-container');
      if (barSkeleton) barSkeleton.style.display = 'none';
      if (barContainer) barContainer.style.display = 'block';
    }

    // ============================================
    // DYNAMIC HORAS LOADING
    // ============================================

    // Load horas from API and render as cards
    async function loadHoras() {
      try {
        mostrarSkeletons();
        
        const token = localStorage.getItem('access_token');
        if (!token) {
          showNoHorasMessage('No hay token de autenticación');
          return;
        }

        const now = new Date();
        const mes = now.getMonth() + 1;
        const anio = now.getFullYear();

        // Cargar datos desde endpoints existentes
        const horasPromise = fetch(API_URLS.cooperativa.horas(), {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        const calcularPromise = fetch(API_URLS.cooperativa.horasCalcular(), {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ mes, anio })
        });

        const planesPromise = fetch(API_URLS.cooperativa.planesTrabajoList(), {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });

        // Registrar en universal loader
        if (window.universalLoader) {
          window.universalLoader.registerApiCall(horasPromise, 'Horas');
          window.universalLoader.registerApiCall(calcularPromise, 'Calcular Horas');
          window.universalLoader.registerApiCall(planesPromise, 'Planes de Trabajo');
        }

        const [horasResponse, calcularResponse, planesResponse] = await Promise.all([
          horasPromise,
          calcularPromise,
          planesPromise
        ]);

        if (!horasResponse.ok) {
          throw new Error('Error al cargar horas: ' + horasResponse.status);
        }

        const horasData = await horasResponse.json();
        
        let estadisticas = { horas_reales: 0, horas_justificadas: 0, total_horas: 0 };
        if (calcularResponse.ok) {
          estadisticas = await calcularResponse.json();
        }

        let planActual = null;
        if (planesResponse.ok) {
          const planes = await planesResponse.json();
          if (Array.isArray(planes)) {
            planActual = planes.find(p => p.mes == mes && p.anio == anio);
          }
        }

        // Hide skeleton loaders
        ocultarSkeletons();

        // Render horas as cards usando los datos cargados
        renderHoras(horasData);

        // Calcular estadísticas localmente como fallback
        const estadisticasLocales = calcularEstadisticasLocales(horasData, mes, anio);
        const statsToUse = estadisticas.total_horas > 0 ? estadisticas : estadisticasLocales;
        updateStatsFromData(statsToUse);

        // Update progress usando el plan actual y estadísticas
        updateProgressFromData(planActual, statsToUse);

      } catch (error) {
        ocultarSkeletons();
        showNoHorasMessage('Error al cargar las horas mensuales: ' + error.message);
      }
    }

    // Render horas as cards
    function renderHoras(horas) {
      const container = document.getElementById('horasGrid');
      
      // Clear existing dynamic cards but keep skeleton
      const existingCards = container.querySelectorAll('.hora-card:not(.skeleton)');
      existingCards.forEach(card => card.remove());

      // Extract array of horas from response
      let registros = [];
      if (horas && horas.horas && Array.isArray(horas.horas)) {
        registros = horas.horas;
      } else if (Array.isArray(horas)) {
        registros = horas;
      }

      if (registros.length === 0) {
        showNoHorasMessage('No hay registros de horas para mostrar');
        return;
      }

      // Ordenar registros por fecha de creación (más recientes primero)
      registros.sort((a, b) => {
        const dateA = new Date(a.created_at || a.fecha);
        const dateB = new Date(b.created_at || b.fecha);
        return dateB - dateA; // Orden descendente (más recientes primero)
      });

      registros.forEach((hora, index) => {
        const card = createHoraCard(hora);
        container.appendChild(card);
        
        // Animate card entrance
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }

    function createHoraCard(hora) {
      const card = document.createElement('div');
      card.className = 'hora-card';
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

      // Determine type and styling
      const typeInfo = getHoraTypeInfo(hora);
      const formattedDate = formatDate(hora);
      const formattedHours = formatHours(hora);

      card.setAttribute('data-type', typeInfo.key);
      
      // Calcular tiempo restante para eliminar
      const createdAt = new Date(hora.created_at || hora.fecha);
      const now = new Date();
      const hoursElapsed = Math.floor((now - createdAt) / (1000 * 60 * 60));
      
      // Determinar si puede cancelar
      const puedeCancelar = hoursElapsed < 24;

      // Botón de eliminar habilitado/deshabilitado
      const deleteButtonClass = puedeCancelar ? 'action-btn delete-btn' : 'action-btn delete-btn disabled';
      const deleteButtonProps = puedeCancelar ? '' : 'disabled title="No se puede eliminar (más de 24h)"';
      
      card.innerHTML = `
        <div class="card-header">
          <div class="hora-icon ${typeInfo.key}">
            <i class="${typeInfo.icon}"></i>
          </div>
          <div class="hora-info">
            <h4 class="hora-title">${typeInfo.title}</h4>
            <p class="hora-subtitle">${typeInfo.subtitle}</p>
          </div>
          <div class="hora-badge badge-${typeInfo.key}">
            ${typeInfo.badge}
          </div>
        </div>
        <div class="card-body">
          <div class="hora-amount">${formattedHours.display}</div>
          <div class="hora-details">
            <div class="detail-date">
              <i class="bi bi-calendar3"></i>
              ${formattedDate}
            </div>
            <div class="detail-actions">
              <button class="${deleteButtonClass}" onclick="deleteHora(${hora.id})" title="Eliminar" ${deleteButtonProps}>
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      return card;
    }

    // Helper functions
    function getHoraTypeInfo(hora) {
      // Manejar diferentes formatos de datos de la API
      const horasReales = parseFloat(hora.Cantidad_Horas || hora.horas_reales) || 0;
      const esJustificacion = (hora.Monto_Compensario && hora.Monto_Compensario > 0) || 
                             (hora.horas_justificadas && parseFloat(hora.horas_justificadas) > 0);
      const horasJustificadas = hora.horas_equivalentes_calculadas ? 
                               parseFloat(hora.horas_equivalentes_calculadas) : 
                               (hora.Monto_Compensario ? (hora.Monto_Compensario / (hora.valor_hora_al_momento || 1000)) : parseFloat(hora.horas_justificadas) || 0);

      if (horasReales > 0 && esJustificacion) {
        return {
          key: 'mixtas',
          title: window.t ? t('hours.mixedHours') : 'Horas Mixtas',
          subtitle: window.t ? t('hours.realPlusJustified') : 'Reales + Justificadas',
          badge: window.t ? t('hours.mixedHours').split(' ')[1] : 'Mixta',
          icon: 'bi-layers'
        };
      } else if (esJustificacion) {
        return {
          key: 'justificacion',
          title: window.t ? t('hours.justification') : 'Justificación',
          subtitle: hora.descripcion_justificacion || (window.t ? t('hours.justifiedHours') : 'Horas justificadas'),
          badge: window.t ? t('hours.justification') : 'Justificación',
          icon: 'bi-file-earmark-text'
        };
      } else {
        return {
          key: 'horas-reales',
          title: window.t ? t('hours.workedHours') : 'Horas Trabajadas',
          subtitle: hora.descripcion || (window.t ? t('hours.workHours') : 'Horas de trabajo'),
          badge: window.t ? t('hours.realHours').split(' ')[1] : 'Reales',
          icon: 'bi-clock'
        };
      }
    }

    function formatHours(hora) {
      // Manejar diferentes formatos de datos de la API
      const reales = parseFloat(hora.Cantidad_Horas || hora.horas_reales) || 0;
      const esJustificacion = (hora.Monto_Compensario && hora.Monto_Compensario > 0) || 
                             (hora.horas_justificadas && parseFloat(hora.horas_justificadas) > 0);
      const justificadas = hora.horas_equivalentes_calculadas ? 
                          parseFloat(hora.horas_equivalentes_calculadas) : 
                          (hora.Monto_Compensario ? (hora.Monto_Compensario / (hora.valor_hora_al_momento || 1000)) : parseFloat(hora.horas_justificadas) || 0);
      const total = reales + (esJustificacion ? justificadas : 0);

      if (reales > 0 && esJustificacion) {
        return {
          display: `${total.toFixed(1)}h`,
          detail: `${reales}h + ${justificadas.toFixed(1)}h`
        };
      } else if (esJustificacion) {
        return {
          display: `${justificadas.toFixed(1)}h`,
          detail: window.t ? t('hours.justified') : 'Justificadas'
        };
      } else {
        return {
          display: `${reales.toFixed(1)}h`,
          detail: window.t ? t('hours.worked') : 'Trabajadas'
        };
      }
    }

    function formatDate(hora) {
      // La API devuelve día, mes, año por separado
      if (hora.dia && hora.mes && hora.anio) {
        return `${hora.dia.toString().padStart(2, '0')}/${hora.mes.toString().padStart(2, '0')}/${hora.anio}`;
      }
      
      // Fallback para otros formatos
      const dateString = hora.fecha || hora.created_at;
      if (!dateString) return 'N/A';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        return dateString;
      }
    }

    function showNoHorasMessage(message) {
      const container = document.getElementById('horasGrid');
      const existingCards = container.querySelectorAll('.hora-card:not(.skeleton)');
      existingCards.forEach(card => card.remove());

      const noDataCard = document.createElement('div');
      noDataCard.className = 'no-data-message';
      noDataCard.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary); grid-column: 1 / -1;">
          <i class="bi bi-clock" style="font-size: 3rem; color: var(--text-tertiary); margin-bottom: 1rem; display: block;"></i>
          <h3 style="margin-bottom: 0.5rem; color: var(--text-secondary);">${window.t ? t('hours.no_hours') : 'No hay horas registradas'}</h3>
          <p style="margin-bottom: 1.5rem;">${message}</p>
          <a href="AgregarHoras.html" class="btn-primary-modern">
            <i class="bi bi-plus-lg"></i>
            ${window.t ? t('hours.addFirstHour') : 'Agregar Primera Hora'}
          </a>
        </div>
      `;
      
      container.appendChild(noDataCard);
    }



    // Calcular estadísticas localmente desde los datos de horas
    function calcularEstadisticasLocales(horasData, mes, anio) {
      let horasReales = 0;
      let horasJustificadas = 0;
      
      if (horasData && horasData.horas && Array.isArray(horasData.horas)) {
        horasData.horas.forEach(hora => {
          // Solo contar horas del mes/año especificado
          if (hora.mes === mes && hora.anio === anio) {
            // Horas reales
            const reales = parseFloat(hora.Cantidad_Horas) || 0;
            horasReales += reales;
            
            // Horas justificadas
            if (hora.Monto_Compensario && hora.Monto_Compensario > 0) {
              const justificadas = hora.horas_equivalentes_calculadas ? 
                                 parseFloat(hora.horas_equivalentes_calculadas) : 
                                 (hora.Monto_Compensario / (hora.valor_hora_al_momento || 1000));
              horasJustificadas += justificadas;
            }
          }
        });
      }
      
      return {
        horas_reales: horasReales,
        horas_justificadas: horasJustificadas,
        total_horas: horasReales + horasJustificadas
      };
    }

    function updateStatsFromData(estadisticas) {
      animateNumber('stat-horas-reales', estadisticas.horas_reales || 0);
      animateNumber('stat-justificaciones', estadisticas.horas_justificadas || 0);
    }

    function updateProgressFromData(planActual, estadisticas) {
      if (!planActual) {
        const values = document.getElementById('progress-values');
        if (values) {
          values.innerHTML = `
            <div style="color: var(--text-secondary); font-style: italic;">
              ${window.t ? t('hours.noActivePlan') : 'No hay plan de trabajo activo para este mes'}
            </div>
          `;
        }
        return;
      }

      // Calcular progreso basado en los datos
      const horasRequeridas = parseFloat(planActual.horas_requeridas) || 0;
      const horasCumplidas = estadisticas.total_horas || 0;
      const horasReales = estadisticas.horas_reales || 0;
      const horasJustificadas = estadisticas.horas_justificadas || 0;
      const porcentaje = horasRequeridas > 0 ? Math.min(100, (horasCumplidas / horasRequeridas) * 100) : 0;
      const completado = horasCumplidas >= horasRequeridas;

      // Actualizar elementos del progreso
      const progressBar = document.getElementById('progress-bar');
      const progressText = document.getElementById('progress-percentage');
      const values = document.getElementById('progress-values');
      const icono = document.getElementById('progreso-icono');
      const finishedMsg = document.getElementById('progress-finished');
      
      // Actualizar barra de progreso con animación
      if (progressBar) {
        setTimeout(() => {
          progressBar.style.width = porcentaje + '%';
        }, 100);
      }

      // Actualizar porcentaje en el centro de la barra
      if (progressText) {
        setTimeout(() => {
          progressText.textContent = Math.round(porcentaje) + '%';
        }, 100);
      }
      
      // Mostrar desglose detallado
      const hoursWord = window.t ? t('hours.hours') : 'horas';
      if (horasJustificadas > 0) {
        if (values) {
          values.innerHTML = `
            <div style="font-size: 0.9rem; margin-bottom: 0.25rem;">
              ${horasReales}h ${window.t ? t('hours.worked').toLowerCase() : 'reales'} + ${horasJustificadas}h ${window.t ? t('hours.justified').toLowerCase() : 'justificadas'}
            </div>
            <div style="font-weight: 700; color: var(--primary);">
              ${horasCumplidas} / ${horasRequeridas} ${hoursWord}
            </div>
          `;
        }
      } else {
        if (values) {
          values.innerHTML = `
            <div style="font-weight: 700; color: var(--primary);">
              ${horasCumplidas} / ${horasRequeridas} ${hoursWord}
            </div>
          `;
        }
      }
      
      // Actualizar icono y mensaje de finalización
      if (completado) {
        if (icono) icono.src = 'img/approved_icon.svg';
        if (finishedMsg) finishedMsg.style.display = 'flex';
      } else {
        if (icono) icono.src = 'img/clock_icon.svg';
        if (finishedMsg) finishedMsg.style.display = 'none';
      }
    }





    function animateNumber(elementId, finalValue) {
      const element = document.getElementById(elementId);
      if (!element) return;

      const startValue = 0;
      const increment = finalValue / 30; // 30 frames
      let current = startValue;

      const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
          current = finalValue;
          clearInterval(timer);
        }
        element.textContent = Math.round(current * 10) / 10;
      }, 50);
    }

    // Filter functions
    function filterByType(type) {
      const cards = document.querySelectorAll('#horasGrid .hora-card:not(.skeleton):not(.no-data-message)');
      
      let visibleCount = 0;
      cards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        
        if (type === 'all' || cardType === type) {
          card.style.display = 'block';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
          visibleCount++;
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(-10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
      
      }
    
    // Expose globally for HTML onclick
    window.filterByType = filterByType;

    function filterHorasBySearch(searchTerm) {
      const cards = document.querySelectorAll('#horasGrid .hora-card:not(.skeleton):not(.no-data-message)');
      const term = searchTerm.toLowerCase();
      
      cards.forEach(card => {
        const title = card.querySelector('.hora-title').textContent.toLowerCase();
        const subtitle = card.querySelector('.hora-subtitle').textContent.toLowerCase();
        const date = card.querySelector('.detail-date').textContent.toLowerCase();
        
        const matches = title.includes(term) || subtitle.includes(term) || date.includes(term);
        
        if (matches) {
          card.style.display = 'block';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(-10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    }

    function searchHoras() {
      const searchInput = document.getElementById('searchInput');
      filterHorasBySearch(searchInput.value);
    }
    
    // Expose globally for HTML onclick
    window.searchHoras = searchHoras;

    // Card action functions
    function editHora(id) {
      // Navigate to edit page or show edit modal
      window.location.href = `EditarHoras.html?id=${id}`;
    }
    
    // Expose globally for HTML onclick
    window.editHora = editHora;

    async function deleteHora(id) {
      // Verificar si el botón está deshabilitado
      const button = event.target.closest('button');
      if (button && button.disabled) {
        mostrarMensaje('No se puede eliminar este registro. Han pasado más de 24 horas desde su creación.', 'error');
        return;
      }

      // Mostrar modal de confirmación personalizado
      const confirmed = await showDeleteConfirmModal(id);
      if (!confirmed) {
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          mostrarMensaje('No hay token de autenticación', 'error');
          return;
        }

        // Mostrar indicador de carga
        const loadingCard = button.closest('.hora-card');
        if (loadingCard) {
          loadingCard.style.opacity = '0.6';
          loadingCard.style.pointerEvents = 'none';
        }

        const response = await fetch(API_URLS.cooperativa.horasById(id), {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Mostrar mensaje de éxito
        mostrarMensaje('Registro de horas eliminado exitosamente', 'success');

        // Recargar los datos para actualizar la vista
        await loadHoras();

      } catch (error) {
        // Restaurar estado de la tarjeta
        if (loadingCard) {
          loadingCard.style.opacity = '1';
          loadingCard.style.pointerEvents = 'auto';
        }

        // Mostrar mensaje de error específico
        let errorMessage = 'Error al eliminar el registro de horas';
        if (error.message.includes('24 horas') || error.message.includes('tiempo')) {
          errorMessage = 'No se puede eliminar. Han pasado más de 24 horas desde la creación del registro.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        mostrarMensaje(errorMessage, 'error');
      }
    }
    
    // Expose globally for HTML onclick
    window.deleteHora = deleteHora;

  
    // Mostrar mensaje de notificación
    function mostrarMensaje(mensaje, tipo = 'info') {
      // Remover notificación existente si la hay
      const existing = document.querySelector('.notification-toast');
      if (existing) {
        existing.remove();
      }

      // Crear notificación
      const toast = document.createElement('div');
      toast.className = `notification-toast ${tipo}`;
      toast.innerHTML = `
        <div class="notification-content">
          <i class="bi ${tipo === 'success' ? 'bi-check-circle' : tipo === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'}"></i>
          <span>${mensaje}</span>
          <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
            <i class="bi bi-x"></i>
          </button>
        </div>
      `;

      // Agregar estilos dinámicamente si no existen
      if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
          .notification-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: var(--surface);
            border-radius: 12px;
            padding: 1rem;
            box-shadow: none;
            border-left: 4px solid var(--primary);
            min-width: 300px;
            animation: slideInRight 0.3s ease;
          }
          .notification-toast.success { border-left-color: var(--success); }
          .notification-toast.error { border-left-color: var(--error); }
          .notification-toast.info { border-left-color: var(--info); }
          .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          .notification-content i:first-child {
            font-size: 1.25rem;
            color: var(--primary);
          }
          .notification-toast.success .notification-content i:first-child { color: var(--success); }
          .notification-toast.error .notification-content i:first-child { color: var(--error); }
          .notification-toast.info .notification-content i:first-child { color: var(--info); }
          .notification-content span {
            flex: 1;
            color: var(--text-primary);
            font-weight: 500;
          }
          .notification-close {
            background: none;
            border: none;
            padding: 0.25rem;
            cursor: pointer;
            color: var(--text-secondary);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .notification-close:hover {
            background: var(--surface-variant);
            color: var(--text-primary);
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(styles);
      }

      // Agregar al DOM
      document.body.appendChild(toast);

      // Auto-remover después de 5 segundos
     
      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.animation = 'slideInRight 0.3s ease reverse';
          setTimeout(() => toast.remove(), 300);
        }
      }, 5000);
    }

    // Modal de confirmación personalizado para eliminación
    function showDeleteConfirmModal(horaId) {
      return new Promise((resolve) => {
        // Remover modal existente si hay uno
        const existing = document.querySelector('.delete-confirm-modal');
        if (existing) {
          existing.remove();
        }

        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'delete-confirm-modal';
        modal.innerHTML = `
          <div class="modal-overlay"></div>
          <div class="modal-content">
            <div class="modal-header">
              <i class="bi bi-exclamation-triangle text-warning"></i>
              <h3>Confirmar Eliminación</h3>
            </div>
            <div class="modal-body">
              <p><strong>¿Estás seguro de que deseas eliminar este registro de horas?</strong></p>
              <p class="text-muted">Esta acción no se puede deshacer. El registro será eliminado permanentemente.</p>
              <div class="warning-notice">
                <i class="bi bi-info-circle"></i>
                <span>Recuerda: Solo puedes eliminar registros creados en las últimas 24 horas.</span>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-cancel" onclick="closeDeleteModal(false)">
                <i class="bi bi-x-circle"></i>
                Cancelar
              </button>
              <button class="btn-delete" onclick="closeDeleteModal(true)">
                <i class="bi bi-trash"></i>
                Eliminar Registro
              </button>
            </div>
          </div>
        `;

        // Agregar estilos del modal si no existen
        if (!document.querySelector('#delete-modal-styles')) {
          const styles = document.createElement('style');
          styles.id = 'delete-modal-styles';
          styles.textContent = `
            .delete-confirm-modal {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 10000;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: modalFadeIn 0.3s ease;
            }
            .modal-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.6);
              backdrop-filter: blur(4px);
            }
            .modal-content {
              background: var(--surface);
              border-radius: 16px;
              padding: 0;
              max-width: 480px;
              width: 90%;
              box-shadow: var(--shadow-xl);
              position: relative;
              animation: modalSlideUp 0.3s ease;
            }
            .modal-header {
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 2rem 2rem 1rem;
              border-bottom: 1px solid var(--border);
            }
            .modal-header i {
              font-size: 2rem;
              color: #f59e0b;
            }
            .modal-header h3 {
              margin: 0;
              color: var(--text-primary);
              font-weight: 600;
              font-size: 1.25rem;
            }
            .modal-body {
              padding: 1.5rem 2rem;
            }
            .modal-body p {
              margin: 0 0 1rem 0;
              color: var(--text-primary);
              line-height: 1.5;
            }
            .modal-body .text-muted {
              color: var(--text-secondary);
              font-size: 0.9rem;
            }
            .warning-notice {
              background: var(--surface-variant);
              border: 1px solid var(--border);
              border-radius: 8px;
              padding: 0.75rem;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              margin-top: 1rem;
            }
            .warning-notice i {
              color: var(--primary);
              font-size: 1rem;
            }
            .warning-notice span {
              color: var(--text-secondary);
              font-size: 0.875rem;
            }
            .modal-actions {
              display: flex;
              gap: 1rem;
              padding: 1rem 2rem 2rem;
              justify-content: flex-end;
            }
            .btn-cancel, .btn-delete {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              transition: all 0.2s ease;
              font-size: 0.9rem;
            }
            .btn-cancel {
              background: var(--surface-variant);
              color: var(--text-secondary);
            }
            .btn-cancel:hover {
              background: var(--border);
              color: var(--text-primary);
            }
            .btn-delete {
              background: #ef4444;
              color: white;
              box-shadow: none;
            }
            .btn-delete:hover {
              background: #dc2626;
              transform: translateY(-1px);
              box-shadow: none;
            }
            @keyframes modalFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes modalSlideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `;
          document.head.appendChild(styles);
        }

        // Variable global para resolver la promesa
        window.resolveDeleteModal = resolve;

        // Agregar al DOM
        document.body.appendChild(modal);

        // Crear y agregar event listener para Escape
        currentKeydownHandler = (e) => {
          if (e.key === 'Escape') {
            closeDeleteModal(false);
          }
        };
        document.addEventListener('keydown', currentKeydownHandler);

        // Cerrar al hacer clic en overlay
        modal.querySelector('.modal-overlay').onclick = () => closeDeleteModal(false);
      });
    }

    // Variable para el event listener del teclado
    let currentKeydownHandler = null;

    // Cerrar modal de confirmación
    function closeDeleteModal(confirmed) {
      const modal = document.querySelector('.delete-confirm-modal');
      if (modal) {
        modal.style.animation = 'modalFadeIn 0.2s ease reverse';
        setTimeout(() => {
          modal.remove();
          if (window.resolveDeleteModal) {
            window.resolveDeleteModal(confirmed);
            delete window.resolveDeleteModal;
          }
        }, 200);
      }
      
      // Remover event listener si existe
      if (currentKeydownHandler) {
        document.removeEventListener('keydown', currentKeydownHandler);
        currentKeydownHandler = null;
      }
    }
    
    // Expose globally for HTML onclick
    window.closeDeleteModal = closeDeleteModal;
    
    // Logout function
    function logout() {
      localStorage.removeItem('access_token');
      window.location.href = 'index.html';
    }