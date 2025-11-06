
    let allAsambleas = [];
    let currentFilter = 'todas';
    
    // Toggle filters panel
    function toggleFilters() {
      const filtersPanel = document.getElementById('filtersPanel');
      filtersPanel.classList.toggle('active');
    }
    
    // Expose globally for HTML onclick
    window.toggleFilters = toggleFilters;
    
    // Initialize page
    document.addEventListener('DOMContentLoaded', function() {
      loadNavbar(); // From loader.js
      // initUserIcon() is called automatically by navbar-functions.js
      loadAsambleas();
      initFilters();
    });
    
    // Initialize filter tabs
    function initFilters() {
      const filterTabs = document.querySelectorAll('.filter-tab');
      filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
          // Remove active class from all tabs
          filterTabs.forEach(t => t.classList.remove('active'));
          // Add active class to clicked tab
          this.classList.add('active');
          // Get filter type
          currentFilter = this.getAttribute('data-filter');
          // Filter asambleas
          filterAsambleas(currentFilter);
        });
      });
    }
    
    // Load asambleas from API
    async function loadAsambleas() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = 'index.html';
        return;
      }
      
      const gridEl = document.getElementById('asambleas-grid');
      const skeletons = document.querySelectorAll('.skeleton');
      
      try {
        // Show skeletons while loading
        skeletons.forEach(skeleton => {
          skeleton.style.display = 'block';
          skeleton.style.opacity = '1';
        });
        
        const asambleasPromise = fetch(API_URLS.cooperativa.asambleas(), {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        });

        // Registrar en universal loader
        if (window.universalLoader) {
          window.universalLoader.registerApiCall(asambleasPromise, 'Asambleas');
        }
        
        const response = await asambleasPromise;
        
        if (!response.ok) {
          throw new Error('Error al cargar asambleas');
        }
        
        const data = await response.json();
        
        // El backend devuelve { success: true, data: [...] }
        allAsambleas = Array.isArray(data) ? data : (data.data || data.asambleas || []);
        
        // Hide skeletons with fade out animation
        await hideSkeletonsAnimated(skeletons);
        
        filterAsambleas(currentFilter);
        
      } catch (error) {
        await hideSkeletonsAnimated(skeletons);
        gridEl.innerHTML = '<div class="alert alert-danger" style="grid-column: 1/-1;">Error al cargar las asambleas. Por favor, recarga la página.</div>';
      }
    }
    
    // Hide skeletons with animation
    async function hideSkeletonsAnimated(skeletons) {
      return new Promise((resolve) => {
        // Fade out animation
        skeletons.forEach(skeleton => {
          skeleton.style.transition = 'opacity 0.3s ease';
          skeleton.style.opacity = '0';
        });
        
        // Wait for animation to complete, then remove
        setTimeout(() => {
          skeletons.forEach(skeleton => {
            skeleton.style.display = 'none';
          });
          resolve();
        }, 300);
      });
    }
    
    // Filter asambleas
    function filterAsambleas(filter) {
      const now = new Date();
      let filtered = [];
      
      if (filter === 'todas') {
        filtered = allAsambleas;
      } else if (filter === 'futuras') {
        filtered = allAsambleas.filter(a => new Date(a.fecha_raw) >= now);
      } else if (filter === 'pasadas') {
        filtered = allAsambleas.filter(a => new Date(a.fecha_raw) < now);
      }
      
      renderAsambleas(filtered);
    }
    
    // Render asambleas
    function renderAsambleas(asambleas) {
      const gridEl = document.getElementById('asambleas-grid');
      const emptyState = document.getElementById('empty-state');
      
      // Remove skeletons if they exist
      const skeletons = gridEl.querySelectorAll('.skeleton');
      skeletons.forEach(skeleton => skeleton.remove());
      
      if (!asambleas || asambleas.length === 0) {
        gridEl.style.display = 'none';
        if (emptyState) {
          emptyState.style.display = 'block';
        }
        return;
      }
      
      gridEl.style.display = 'grid';
      if (emptyState) {
        emptyState.style.display = 'none';
      }
      
      // Render cards with entrance animation
      gridEl.innerHTML = asambleas.map(asamblea => createAsambleaCard(asamblea)).join('');
      
      // Animate cards entrance
      const cards = gridEl.querySelectorAll('.asamblea-card:not(.skeleton)');
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 80);
      });
    }
    
    // Create asamblea card
    function createAsambleaCard(asamblea) {
      // Usar fecha_raw (formato YYYY-MM-DD) para que JavaScript pueda parsearla correctamente
      const fecha = new Date(asamblea.fecha_raw);
      const now = new Date();
      const isFutura = fecha >= now;
      const statusClass = isFutura ? 'badge bg-primary' : 'badge bg-secondary';
      const statusText = isFutura ? (window.t ? window.t('assemblies.status_upcoming') : 'Próxima') : (window.t ? window.t('assemblies.status_past') : 'Realizada');
      
      // Usar la fecha ya formateada que viene del backend (formato dd/mm/yyyy)
      const fechaFormateada = asamblea.fecha;
      
      const horaFormateada = asamblea.hora || fecha.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Obtener el valor actual de las variables CSS
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      const surfaceColor = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
      const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
      const textSecondary = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
      const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
      const surfaceVariant = getComputedStyle(document.documentElement).getPropertyValue('--surface-variant').trim();
      
      const assemblyTitle = asamblea.titulo || (window.t ? window.t('assemblies.assembly') : 'Asamblea');
      const topicsLabel = window.t ? window.t('assemblies.topics') : 'TEMAS A TRATAR';
      
      return `
        <div class="card" style="border-radius: 16px; box-shadow: var(--shadow-md); overflow: hidden; border: 1px solid var(--border); transition: all 0.3s ease; cursor: pointer; background: var(--surface);">
          <div class="card-body" style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <h5 class="card-title" style="margin: 0; color: var(--text-primary); font-weight: 700; font-size: 1.2rem;">${assemblyTitle}</h5>
              <span class="${statusClass}" style="font-size: 0.75rem; padding: 0.35rem 0.75rem; border-radius: 12px; font-weight: 600;">${statusText}</span>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 0.875rem; color: var(--text-secondary); margin-top: 1.25rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--surface-variant); display: flex; align-items: center; justify-content: center;">
                  <i class="bi bi-calendar3" style="color: var(--primary); font-size: 0.95rem;"></i>
                </div>
                <span style="font-weight: 500; color: var(--text-primary);">${fechaFormateada}</span>
              </div>
              
              ${asamblea.hora ? `
                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--surface-variant); display: flex; align-items: center; justify-content: center;">
                    <i class="bi bi-clock" style="color: var(--primary); font-size: 0.95rem;"></i>
                  </div>
                  <span style="font-weight: 500; color: var(--text-primary);">${horaFormateada}</span>
                </div>
              ` : ''}
              
              ${asamblea.lugar ? `
                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--surface-variant); display: flex; align-items: center; justify-content: center;">
                    <i class="bi bi-geo-alt" style="color: var(--primary); font-size: 0.95rem;"></i>
                  </div>
                  <span style="font-weight: 500; color: var(--text-primary);">${asamblea.lugar}</span>
                </div>
              ` : ''}
              
              ${asamblea.descripcion ? `
                <p style="margin: 0.75rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; padding: 1rem; background: var(--surface-variant); border-radius: 12px; border-left: 3px solid var(--primary);">${asamblea.descripcion}</p>
              ` : ''}
            </div>
            
            ${asamblea.temas && asamblea.temas.length > 0 ? `
              <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border);">
                <p style="margin: 0 0 0.75rem 0; font-weight: 700; color: var(--text-primary); font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
                  <i class="bi bi-list-check" style="color: var(--primary);"></i>
                  ${topicsLabel}
                </p>
                <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary); font-size: 0.875rem; line-height: 1.8;">
                  ${asamblea.temas.map(tema => `<li style="margin-bottom: 0.25rem;">${tema}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }
  