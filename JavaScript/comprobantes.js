// Modern comprobantes management with cards UI
document.addEventListener('DOMContentLoaded', function() {
      loadNavbar();
      initFilters();
      initSkeletonLoader();
      loadComprobantes(); // Cargar comprobantes desde la API
      
      // Listen for theme changes
      window.addEventListener('themeChanged', function(e) {
        // Re-render cards with new theme if needed
      });
    });
    

    
    // Global filter state
    let currentFilters = {
      status: 'all',
      period: 'all',
      search: ''
    };

    // Filter Functions
    function initFilters() {
      // Chip filters
      const chips = document.querySelectorAll('.chip');
      chips.forEach(chip => {
        chip.addEventListener('click', function() {
          // Remove active from siblings
          this.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          // Add active to clicked chip
          this.classList.add('active');
          
          // Update filter state
          const statusValue = this.getAttribute('data-status');
          const periodValue = this.getAttribute('data-period');
          
          if (statusValue !== null) {
            currentFilters.status = statusValue;
          } else if (periodValue !== null) {
            currentFilters.period = periodValue;
          }
          
          // Apply all filters
          applyFilters();
          
          // Add animation feedback
          this.style.transform = 'scale(0.95)';
          setTimeout(() => {
            this.style.transform = '';
          }, 150);
        });
      });
      
      // Search functionality - real-time
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          currentFilters.search = this.value.toLowerCase();
          applyFilters();
        });
      }
    }
    
    // Combined filter function
    function applyFilters() {
      const cards = document.querySelectorAll('#comprobantesGrid .comprobante-card:not(.skeleton)');
      let visibleCount = 0;
      
      cards.forEach(card => {
        let shouldShow = true;
        
        // Status filter
        if (currentFilters.status !== 'all') {
          const cardStatus = card.getAttribute('data-status');
          if (cardStatus !== currentFilters.status) {
            shouldShow = false;
          }
        }
        
        // Period filter
        if (shouldShow && currentFilters.period !== 'all') {
          const dateElement = card.querySelector('.detail-item .detail-label')?.parentElement;
          if (dateElement) {
            const dateText = dateElement.textContent.split(':')[1]?.trim() || '';
            shouldShow = matchesPeriod(dateText, currentFilters.period);
          } else {
            shouldShow = false;
          }
        }
        
        // Search filter
        if (shouldShow && currentFilters.search) {
          const title = card.querySelector('.payment-title')?.textContent.toLowerCase() || '';
          const amount = card.querySelector('.amount')?.textContent.toLowerCase() || '';
          const subtitle = card.querySelector('.payment-subtitle')?.textContent.toLowerCase() || '';
          
          shouldShow = title.includes(currentFilters.search) || 
                      amount.includes(currentFilters.search) ||
                      subtitle.includes(currentFilters.search);
        }
        
        // Apply visibility with animation
        if (shouldShow) {
          card.style.display = 'block';
          card.style.animation = 'fadeInUp 0.3s ease';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });
      
      // Show "no results" message if needed
      if (visibleCount === 0) {
        showNoResultsMessage();
      } else {
        hideNoResultsMessage();
      }
    }
    
    // Helper function to match period
    function matchesPeriod(dateText, period) {
      const now = new Date();
      let cardDate;
      
      try {
        // Parse date (format: "dd/mm/yyyy")
        const parts = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (!parts) return false;
        
        const [, day, month, year] = parts;
        cardDate = new Date(year, month - 1, day);
      } catch (error) {
        return false;
      }
      
      switch (period) {
        case 'month':
          return cardDate.getMonth() === now.getMonth() && 
                 cardDate.getFullYear() === now.getFullYear();
        case 'quarter':
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const cardQuarter = Math.floor(cardDate.getMonth() / 3);
          return cardQuarter === currentQuarter && 
                 cardDate.getFullYear() === now.getFullYear();
        case 'year':
          return cardDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    }
    
    // Show/hide no results message
    function showNoResultsMessage() {
      let noResults = document.getElementById('noResultsMessage');
      if (!noResults) {
        const container = document.getElementById('comprobantesGrid');
        noResults = document.createElement('div');
        noResults.id = 'noResultsMessage';
        noResults.className = 'empty-state';
        noResults.style.gridColumn = '1 / -1';
        noResults.innerHTML = `
          <div class="empty-icon">
            <i class="bi bi-search"></i>
          </div>
          <h3>${window.t ? window.t('common.no_results') : 'No se encontraron resultados'}</h3>
          <p>${window.t ? window.t('common.try_different_filters') : 'Intenta con otros filtros'}</p>
        `;
        container.appendChild(noResults);
      }
      noResults.style.display = 'block';
    }
    
    function hideNoResultsMessage() {
      const noResults = document.getElementById('noResultsMessage');
      if (noResults) {
        noResults.style.display = 'none';
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
      const skeletonLoader = document.getElementById('skeletonLoader');
      
      // Hide skeleton after 2 seconds (simulate loading)
      setTimeout(() => {
        skeletonLoader.style.opacity = '0';
        setTimeout(() => {
          skeletonLoader.style.display = 'none';
        }, 300);
      }, 2000);
    }
    
    // Card Animations
    function initCardAnimations() {
      const cards = document.querySelectorAll('.comprobante-card:not(.skeleton)');
      
      // Intersection Observer for scroll animations
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      cards.forEach((card, index) => {
        // Initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.transitionDelay = `${index * 0.1}s`;
        
        observer.observe(card);
      });
    }
    
    // ============================================
    // DYNAMIC COMPROBANTES LOADING
    // ============================================
    
    // Load comprobantes from API
    async function loadComprobantes() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          showNoComprobantesMessage('No autenticado. Por favor, inicie sesión.');
          return;
        }
        
        const response = await fetch(API_URLS.cooperativa.facturas(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const facturas = data.facturas || [];
        
        // Hide skeleton loader
        const skeletonLoader = document.getElementById('skeletonLoader');
        if (skeletonLoader) {
          skeletonLoader.style.opacity = '0';
          setTimeout(() => {
            skeletonLoader.style.display = 'none';
          }, 300);
        }
        
        // Render comprobantes
        renderComprobantes(facturas);
        
      } catch (error) {
        showNoComprobantesMessage('Error al cargar los comprobantes. Inténtalo de nuevo.');
        
        // Hide skeleton loader on error
        const skeletonLoader = document.getElementById('skeletonLoader');
        if (skeletonLoader) {
          skeletonLoader.style.display = 'none';
        }
      }
    }
    
    // Render comprobantes as cards
    function renderComprobantes(facturas) {
      const container = document.getElementById('comprobantesGrid');
      
      // Clear existing dynamic cards but keep skeleton
      const existingCards = container.querySelectorAll('.comprobante-card:not(.skeleton)');
      existingCards.forEach(card => card.remove());
      
      if (!facturas || facturas.length === 0) {
        showNoComprobantesMessage('No hay comprobantes disponibles.');
        return;
      }
      
      facturas.forEach((factura, index) => {
        const card = createComprobanteCard(factura);
        container.appendChild(card);
        
        // Animate card appearance
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }
    
    // Create a single comprobante card
    function createComprobanteCard(factura) {
      const card = document.createElement('div');
      card.className = 'comprobante-card';
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.cursor = 'pointer';
      
      // Determine status and icon
      const status = getStatusInfo(factura.Estado_Pago);
      const paymentIcon = getPaymentIcon(factura.tipo_pago);
      const formattedDate = formatDate(factura.created_at);
      const formattedAmount = formatCurrency(factura.Monto);
      const periodDate = formatPeriodDate(factura.fecha_pago);
      
      card.setAttribute('data-status', status.key);
      card.onclick = () => viewComprobante(factura.id);
      
      const viewTitle = window.t ? window.t('payments.view') : 'Ver detalle';
      const downloadTitle = window.t ? window.t('payments.download') : 'Descargar';
      const submittedLabel = window.t ? window.t('payments.submitted_on') : 'Enviado el';
      
      card.innerHTML = `
        <div class="card-header">
          <div class="payment-icon ${status.iconClass}">
            ${paymentIcon}
          </div>
          <div class="payment-info">
            <h4 class="payment-title">${factura.motivo || 'Pago de cooperativa'}</h4>
            <p class="payment-subtitle">${periodDate}</p>
          </div>
          <div class="status-badge ${status.badgeClass}">
            ${status.icon}
            ${status.text}
          </div>
        </div>
        <div class="card-body">
          <div class="amount">${formattedAmount}</div>
          <div class="payment-details">
            <span class="detail-item">
              <i class="bi bi-calendar3"></i>
              <span class="detail-label">${submittedLabel}:</span> ${formattedDate}
            </span>
            <span class="detail-item">
              <i class="bi bi-credit-card"></i>
              ${factura.tipo_pago || 'N/A'}
            </span>
          </div>
        </div>
        <div class="card-actions">
          <button class="action-btn" onclick="event.stopPropagation(); viewComprobante(${factura.id});" title="${viewTitle}">
            <i class="bi bi-eye"></i>
          </button>
          <button class="action-btn" onclick="event.stopPropagation(); downloadComprobante(${factura.id});" title="${downloadTitle}">
            <i class="bi bi-download"></i>
          </button>
        </div>
      `;
      
      return card;
    }
    
    // Helper functions for formatting
    function getStatusInfo(estadoPago) {
      const isDark = document.body.classList.contains('theme-dark');
      
      switch (estadoPago) {
        case 'Aceptado':
          return {
            key: 'approved',
            text: window.t ? window.t('payments.approved') : 'Aprobado',
            icon: '<i class="bi bi-check-circle"></i>',
            iconClass: 'success',
            badgeClass: 'status-approved'
          };
        case 'Rechazado':
          return {
            key: 'rejected',
            text: window.t ? window.t('payments.rejected') : 'Rechazado',
            icon: '<i class="bi bi-x-circle"></i>',
            iconClass: 'error',
            badgeClass: 'status-rejected'
          };
        case 'Pendiente':
        default:
          return {
            key: 'pending',
            text: window.t ? window.t('payments.pending') : 'Pendiente',
            icon: '<i class="bi bi-clock"></i>',
            iconClass: 'warning',
            badgeClass: 'status-pending'
          };
      }
    }
    
    function getPaymentIcon(tipoPago) {
      const iconMap = {
        'Transferencia': '<i class="bi bi-building"></i>',
        'Efectivo': '<i class="bi bi-cash-coin"></i>',
        'Tarjeta': '<i class="bi bi-credit-card"></i>',
        'Cheque': '<i class="bi bi-clipboard-check"></i>',
        'default': '<i class="bi bi-credit-card-2-front"></i>'
      };
      
      return iconMap[tipoPago] || iconMap['default'];
    }
    
    function formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (error) {
        return 'N/A';
      }
    }
    
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
    
    function formatPeriodDate(fechaPago) {
      if (!fechaPago) return 'N/A';
      
      try {
        const date = new Date(fechaPago);
        const meses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        return `${meses[date.getMonth()]} ${date.getFullYear()}`;
      } catch (error) {
        return 'N/A';
      }
    }
    
    function showNoComprobantesMessage(message) {
      const container = document.getElementById('comprobantesGrid');
      
      // Clear existing dynamic cards but keep skeleton
      const existingCards = container.querySelectorAll('.comprobante-card:not(.skeleton)');
      existingCards.forEach(card => card.remove());
      
      // Create empty message that spans the full width of the grid
      const emptyMessage = document.createElement('div');
      emptyMessage.style.gridColumn = '1 / -1'; // Span all columns
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.padding = '3rem';
      emptyMessage.style.color = 'var(--text-secondary)';
      emptyMessage.innerHTML = `
        <i class="bi bi-inbox" style="font-size: 3rem; margin-bottom: 1rem; color: var(--border);"></i>
        <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;" data-i18n="payments.no_receipts">No hay comprobantes</h3>
        <p>${message}</p>
      `;
      
      // Apply translations
      if (window.LanguageManager) {
        window.LanguageManager.updatePageLanguage();
      }
      
      container.appendChild(emptyMessage);
    }

    // Card Action Functions
    function viewComprobante(id) {
      // Prevenir que el evento se propague si se hace clic en los botones de acción
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      
      // Redirigir a la página de detalle
      window.location.href = `FacturaDetalle.html?id=${id}`;
    }
    
    function downloadComprobante(id) {
      showToast('Iniciando descarga...', 'info');
      
      const token = localStorage.getItem('access_token');
      
      fetch(API_URLS.cooperativa.comprobante(id) + '?download=true', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo descargar el comprobante`);
        }
        
        // Obtener el nombre del archivo desde el header Content-Disposition si existe
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `comprobante_${id}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        
        // Si no hay extensión, determinar por el tipo de contenido
        if (!filename.includes('.')) {
          const contentType = response.headers.get('content-type');
          if (contentType) {
            if (contentType.includes('pdf')) {
              filename += '.pdf';
            } else if (contentType.includes('image')) {
              if (contentType.includes('jpeg') || contentType.includes('jpg')) {
                filename += '.jpg';
              } else if (contentType.includes('png')) {
                filename += '.png';
              } else {
                filename += '.jpg'; // default para imágenes
              }
            }
          }
        }
        
        return response.blob().then(blob => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
        // Crear URL temporal para el blob
        const url = window.URL.createObjectURL(blob);
        
        // Crear elemento <a> temporal para descargar
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        
        // Agregar al DOM, hacer click y remover
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Limpiar URL temporal
        window.URL.revokeObjectURL(url);
        
        showToast('Comprobante descargado correctamente', 'success');
      })
      .catch(error => {
        showToast('Error al descargar el comprobante: ' + error.message, 'error');
      });
    }
    

    
    // Utility Functions
    function createRippleEffect(element) {
      const ripple = document.createElement('span');
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
    
    function showToast(message, type = 'info') {
      // Create toast container if it doesn't exist
      let toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
        `;
        document.body.appendChild(toastContainer);
      }
      
      // Create toast
      const toast = document.createElement('div');
      toast.style.cssText = `
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        font-size: 14px;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: #10b981;' : 
          type === 'error' ? 'background: #ef4444;' : 
          'background: #3b82f6;'}
      `;
      toast.textContent = message;
      
      toastContainer.appendChild(toast);
      
      // Animate in
      setTimeout(() => {
        toast.style.transform = 'translateX(0)';
      }, 10);
      
      // Remove after delay
      setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    }
    
    // CSS for ripple effect
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
      .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
      }
      
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(rippleStyle);

