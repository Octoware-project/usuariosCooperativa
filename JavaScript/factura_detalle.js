document.addEventListener('DOMContentLoaded', function() {
      loadNavbar();
      
      loadFacturaDetail();
    });

    function showToast(message, type = 'info') {
      const toastContainer = document.querySelector('.toast-container') || createToastContainer();
      
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      
      toast.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-${getToastIcon(type)}"></i>
          <span>${message}</span>
        </div>
      `;
      
      toastContainer.appendChild(toast);
      
      setTimeout(() => toast.classList.add('show'), 100);
      
      // Remove toast
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    function createToastContainer() {
      const container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
      return container;
    }

    function getToastIcon(type) {
      switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'x-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
      }
    }

    // Load factura detail function
    function loadFacturaDetail() {
      const urlParams = new URLSearchParams(window.location.search);
      const facturaId = urlParams.get('id');
      
      if (!facturaId) {
        showToast(window.t('invoice.idNotFound'), 'error');
        setTimeout(() => window.location.href = 'Comprobantes.html', 2000);
        return;
      }

      showSkeletonLoading();
      
      const token = localStorage.getItem('access_token');
      
      fetch(API_URLS.cooperativa.facturasById(facturaId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo cargar la factura`);
        }
        return response.json();
      })
      .then(data => {
        hideSkeletonLoading();
        renderFacturaDetail(data.factura);
        setupDownloadButton(facturaId, data.factura);
      })
      .catch(error => {
        hideSkeletonLoading();
        showToast(window.t('invoice.errorLoadingDetails'), 'error');
      });
    }

    function showSkeletonLoading() {
      const detailContainer = document.getElementById('factura-detalle');
      const imageContainer = document.getElementById('factura-imagen');
      
      detailContainer.innerHTML = `
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
      `;
      
      imageContainer.innerHTML = `
        <div class="skeleton-item" style="width: 200px; height: 200px; border-radius: 12px;"></div>
      `;
    }

    function hideSkeletonLoading() {
      // Content will be replaced by renderFacturaDetail
    }

    function renderFacturaDetail(factura) {
      const detailContainer = document.getElementById('factura-detalle');
      const imageContainer = document.getElementById('factura-imagen');
      
      // Render details con iconos y mejor presentación
      const details = [
        { 
          label: window.t('invoice.reason'), 
          value: factura.motivo || window.t('invoice.noReasonSpecified'),
          icon: 'bi-chat-left-text'
        },
        { 
          label: window.t('invoice.paymentDate'), 
          value: new Date(factura.created_at).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }),
          icon: 'bi-calendar-event'
        },
        { 
          label: window.t('invoice.amount'), 
          value: `$${parseFloat(factura.Monto || 0).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`,
          icon: 'bi-cash-coin'
        },
        { 
          label: window.t('invoice.status'), 
          value: getEstadoBadge(factura.Estado_Pago),
          icon: 'bi-info-circle'
        },
        { 
          label: window.t('invoice.paymentMonth'), 
          value: getMonthName(new Date(factura.created_at)),
          icon: 'bi-calendar3'
        }
      ];
      
      detailContainer.innerHTML = details.map(item => `
        <div class="detail-item">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="bi ${item.icon}" style="color: var(--primary); font-size: 1.1rem;"></i>
            <span class="detail-label">${item.label}</span>
          </div>
          <span class="detail-value">${item.value}</span>
        </div>
      `).join('');
      
      // Render image
      if (factura.imagen_comprobante || factura.Archivo_Comprobante) {
        // Intentar cargar con autenticación primero
        loadComprobanteImage(factura.id, imageContainer);
      } else {
        // No hay comprobante disponible
        imageContainer.innerHTML = `
          <div class="image-placeholder">
            <i class="bi bi-file-earmark-x"></i>
            <span>${window.t('invoice.noImage')}</span>
            <small>No se ha cargado ningún comprobante para esta factura</small>
          </div>
        `;
      }
    }

    // Global function to handle image errors
    window.handleImageError = function(img, facturaId) {
      const container = img ? img.parentElement : null;
      if (container) {
        loadComprobanteImage(facturaId, container);
      } else {
        console.error('Container not found for image error handling');
      }
    }

    function loadComprobanteImage(facturaId, container) {
      // Validate container exists
      if (!container) {
        console.error('Container is null, cannot load comprobante image');
        return;
      }
      
      // Show loading state
      container.innerHTML = `
        <div class="image-placeholder" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; gap: 1rem;">
          <div class="spinner-border" style="color: var(--primary);" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <span style="color: var(--text-secondary); font-size: 0.875rem;">Cargando comprobante...</span>
        </div>
      `;
      
      const token = localStorage.getItem('access_token');
      const comprobanteUrl = API_URLS.cooperativa.comprobante(facturaId);
      
      fetch(comprobanteUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: No se pudo cargar el comprobante`);
        }
        
        const contentType = response.headers.get('content-type');
        return response.blob();
      })
      .then(blob => {
        const imageUrl = URL.createObjectURL(blob);
        const contentType = blob.type || 'application/octet-stream';
        
        if (contentType.startsWith('image/')) {
          container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; width: 100%;">
              <div style="width: 100%; display: flex; justify-content: center; align-items: center; background: var(--surface-variant); border-radius: 12px; padding: 1rem;">
                <img src="${imageUrl}" alt="Comprobante" 
                     style="max-width: 100%; height: auto; max-height: 500px; border-radius: 8px; box-shadow: var(--shadow-lg); cursor: pointer;"
                     onclick="window.open('${imageUrl}', '_blank')"
                     title="Click para ver en tamaño completo">
              </div>
              <button type="button" class="btn btn-primary" onclick="window.open('${imageUrl}', '_blank')" 
                      style="background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; color: white; width: 100%;">
                <i class="bi bi-arrows-fullscreen me-2"></i>Ver en pantalla completa
              </button>
            </div>
          `;
        } else if (contentType.includes('pdf')) {
          container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
              <iframe src="${imageUrl}" 
                      style="width: 100%; height: 500px; border: none; border-radius: 12px; box-shadow: var(--shadow-lg); background: white;" 
                      title="Vista previa del comprobante PDF">
              </iframe>
              <button type="button" class="btn btn-primary" onclick="window.open('${imageUrl}', '_blank')" 
                      style="background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; color: white; width: 100%;">
                <i class="bi bi-arrows-fullscreen me-2"></i>Ver en pantalla completa
              </button>
            </div>
          `;
        } else {
          // Try to display as image anyway (some servers don't set correct content-type)
          const img = new Image();
          img.onload = function() {
            container.innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; width: 100%;">
                <div style="width: 100%; display: flex; justify-content: center; align-items: center; background: var(--surface-variant); border-radius: 12px; padding: 1rem;">
                  <img src="${imageUrl}" alt="Comprobante" 
                       style="max-width: 100%; height: auto; max-height: 500px; border-radius: 8px; box-shadow: var(--shadow-lg); cursor: pointer;"
                       onclick="window.open('${imageUrl}', '_blank')"
                       title="Click para ver en tamaño completo">
                </div>
                <button type="button" class="btn btn-primary" onclick="window.open('${imageUrl}', '_blank')" 
                        style="background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; color: white; width: 100%;">
                  <i class="bi bi-arrows-fullscreen me-2"></i>Ver en pantalla completa
                </button>
              </div>
            `;
          };
          img.onerror = function() {
            // Si no es imagen, intentar mostrar como PDF en iframe
            container.innerHTML = `
              <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
                <iframe src="${imageUrl}" 
                        style="width: 100%; height: 500px; border: none; border-radius: 12px; box-shadow: var(--shadow-lg); background: white;" 
                        title="Vista previa del comprobante">
                </iframe>
                <button type="button" class="btn btn-primary" onclick="window.open('${imageUrl}', '_blank')" 
                        style="background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; color: white; width: 100%;">
                  <i class="bi bi-arrows-fullscreen me-2"></i>Ver en pantalla completa
                </button>
              </div>
            `;
          };
          img.src = imageUrl;
        }
      })
      .catch(error => {
        if (container) {
          container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem; background: var(--surface-variant); border-radius: 12px;">
              <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: var(--warning);"></i>
              <div style="text-align: center;">
                <h4 style="color: var(--text-primary); margin: 0 0 0.5rem 0; font-size: 1.125rem;">Error al cargar el comprobante</h4>
                <p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0;">${error.message}</p>
              </div>
            </div>
          `;
        }
      });
    }

    function getMonthName(date) {
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    function getEstadoBadge(estado) {
      const badges = {
        'Pendiente': `
          <span style="
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.2));
            color: #f59e0b;
            padding: 0.5rem 1rem;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            border: 1px solid rgba(245, 158, 11, 0.3);
          ">
            <i class="bi bi-clock" style="font-size: 1rem;"></i>
            ${window.t('invoice.pending')}
          </span>
        `,
        'Aprobado': `
          <span style="
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2));
            color: #10b981;
            padding: 0.5rem 1rem;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            border: 1px solid rgba(16, 185, 129, 0.3);
          ">
            <i class="bi bi-check-circle" style="font-size: 1rem;"></i>
            ${window.t('invoice.approved')}
          </span>
        `,
        'Rechazado': `
          <span style="
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.2));
            color: #ef4444;
            padding: 0.5rem 1rem;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            border: 1px solid rgba(239, 68, 68, 0.3);
          ">
            <i class="bi bi-x-circle" style="font-size: 1rem;"></i>
            ${window.t('invoice.rejected')}
          </span>
        `
      };
      
      return badges[estado] || estado;
    }

    function setupDownloadButton(facturaId, factura) {
      const downloadBtn = document.getElementById('downloadBtn');
      const downloadBtnMobile = document.getElementById('downloadBtnMobile');
      
      function downloadComprobante() {
        showToast(window.t('invoice.downloadingReceipt'), 'info');
        
        const token = localStorage.getItem('access_token');
        
        fetch(API_URLS.cooperativa.comprobante(facturaId) + '?download=true', {
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
          
          // Generar nombre de archivo personalizado con fecha y motivo
          let filename = '';
          
          // Formatear fecha como YYYY-MM-DD
          if (factura && factura.created_at) {
            const fecha = new Date(factura.created_at);
            const fechaStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
            filename += fechaStr;
          }
          
          // Agregar motivo (limpiar caracteres especiales)
          if (factura && factura.motivo) {
            const motivoLimpio = factura.motivo
              .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiales
              .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
              .substring(0, 50); // Limitar a 50 caracteres
            filename += filename ? `_${motivoLimpio}` : motivoLimpio;
          }
          
          // Si no se pudo generar nombre, usar uno por defecto
          if (!filename) {
            filename = `comprobante_${facturaId}`;
          }
          
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
                  filename += '.jpg';
                }
              }
            }
          }
          
          return response.blob().then(blob => ({ blob, filename }));
        })
        .then(({ blob, filename }) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = filename;
          
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          window.URL.revokeObjectURL(url);
          showToast(window.t('invoice.downloadSuccess'), 'success');
        })
        .catch(error => {
          showToast(window.t('invoice.downloadError'), 'error');
        });
      }
      
      if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadComprobante);
      }
      
      if (downloadBtnMobile) {
        downloadBtnMobile.addEventListener('click', downloadComprobante);
      }
    }

    function openImageModal(imageSrc) {
      // Create modal for full-size image viewing
      const modal = document.createElement('div');
      modal.className = 'image-modal';
      
      const closeBtn = document.createElement('div');
      closeBtn.className = 'image-modal-close';
      closeBtn.innerHTML = '<i class="bi bi-x"></i>';
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => document.body.removeChild(modal), 300);
      };
      
      const img = document.createElement('img');
      img.src = imageSrc;
      img.onclick = (e) => e.stopPropagation();
      
      modal.appendChild(closeBtn);
      modal.appendChild(img);
      document.body.appendChild(modal);
      
      // Close on background click
      modal.addEventListener('click', () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => document.body.removeChild(modal), 300);
      });
      
      // Close on ESC key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          modal.style.animation = 'fadeOut 0.3s ease';
          setTimeout(() => {
            if (document.body.contains(modal)) {
              document.body.removeChild(modal);
            }
          }, 300);
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    }
    
    // Expose globally for HTML onclick
    window.openImageModal = openImageModal;
    
    // Add fadeOut animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);