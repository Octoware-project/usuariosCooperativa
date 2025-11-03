
// Modern planes de trabajo with optimized loading
let planesData = [];

document.addEventListener('DOMContentLoaded', function() {
  loadNavbar();
  loadPlanesDataHtml();
});

    // Load planes data with proper skeleton animation and optimized rendering
    async function loadPlanesDataHtml() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          window.location.href = 'index.html';
          return;
        }
        
        // Show skeletons while loading
        showSkeletons();
        
        // Fetch dashboard data
        const response = await fetch(API_URLS.cooperativa.planesTrabajoDashboard(), {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const dashboardData = await response.json();
          
          // Update planesData
          planesData = dashboardData.planes || [];
          
          if (planesData.length === 0) {
            await hideSkeletonsAnimated();
            showNoDataMessage();
            return;
          }
          
          // Hide skeletons with fade out animation
          await hideSkeletonsAnimated();
          
          // OPTIMIZATION: Render most recent plan first, then load the rest
          await renderMostRecentPlanFirst();
          
        } else {
          throw new Error(`Dashboard failed: ${response.status} - ${response.statusText}`);
        }

      } catch (error) {
        console.error('Error loading planes:', error);
        await hideSkeletonsAnimated();
        showNoDataMessage();
      }
    }

    // Show skeleton loaders
    function showSkeletons() {
      // Show skeleton cards
      const skeletons = document.querySelectorAll('.plan-card.skeleton');
      skeletons.forEach(skeleton => {
        skeleton.style.display = 'block';
        skeleton.style.opacity = '1';
      });
    }

    // Hide skeletons with animation
    async function hideSkeletonsAnimated() {
      return new Promise((resolve) => {
        const skeletons = document.querySelectorAll('.skeleton');
        
        // Fade out animation
        skeletons.forEach(skeleton => {
          skeleton.style.transition = 'opacity 0.3s ease';
          skeleton.style.opacity = '0';
        });
        
        // Wait for animation to complete
        setTimeout(() => {
          skeletons.forEach(skeleton => {
            skeleton.style.display = 'none';
          });
          resolve();
        }, 300);
      });
    }

    // OPTIMIZED: Render most recent plan first, then load remaining plans
    async function renderMostRecentPlanFirst() {
      const container = document.getElementById('planesGrid');
      if (!container) {
        return;
      }
      
      // Clear existing cards (skeletons already hidden)
      const existingCards = container.querySelectorAll('.plan-card:not(.skeleton)');
      existingCards.forEach(card => card.remove());
      
      // Sort plans by year and month (most recent first)
      const sortedPlanes = [...planesData].sort((a, b) => {
        if (b.anio !== a.anio) {
          return b.anio - a.anio; // Most recent year first
        }
        return b.mes - a.mes; // Most recent month first
      });
      
      // Render the most recent plan immediately
      if (sortedPlanes.length > 0) {
        const mostRecentPlan = sortedPlanes[0];
        const card = createPlanCard(mostRecentPlan);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        container.appendChild(card);
        
        // Animate first card
        requestAnimationFrame(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      }
      
      // Load remaining plans after a short delay (optimized for UX)
      if (sortedPlanes.length > 1) {
        setTimeout(() => {
          renderRemainingPlans(sortedPlanes.slice(1), container);
        }, 150);
      }
    }
    
    // Render remaining plans with staggered animation
    function renderRemainingPlans(remainingPlanes, container) {
      const fragment = document.createDocumentFragment();
      
      remainingPlanes.forEach(plan => {
        const card = createPlanCard(plan);
        fragment.appendChild(card);
      });
      
      container.appendChild(fragment);
      
      // Animate remaining cards with stagger
      const newCards = Array.from(container.querySelectorAll('.plan-card:not(.skeleton)'));
      const cardsToAnimate = newCards.slice(1); // Skip first card (already animated)
      
      cardsToAnimate.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 80);
      });
    }
    
    // Render planes directly with entrance animations (fallback/legacy function)
    function renderPlanesDirectly() {
      if (!planesData || planesData.length === 0) {
        showNoDataMessage();
        return;
      }

      const container = document.getElementById('planesGrid');
      if (!container) {
        return;
      }
      
      const fragment = document.createDocumentFragment();
      
      planesData.forEach(plan => {
        const card = createPlanCard(plan);
        fragment.appendChild(card);
      });
      
      // Clear container (skeletons already hidden)
      const existingCards = container.querySelectorAll('.plan-card:not(.skeleton)');
      existingCards.forEach(card => card.remove());
      
      container.appendChild(fragment);
      
      // Animate cards entrance
      const cards = container.querySelectorAll('.plan-card:not(.skeleton)');
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }



    // Create individual plan card with animation
    function createPlanCard(plan) {
      const card = document.createElement('div');
      card.className = 'plan-card';
      card.setAttribute('data-plan-id', plan.id);

      // Get data from plan
      const progreso = plan.progreso || {};
      const horasCompletadas = progreso.horas_cumplidas || 0;
      const horasRequeridas = plan.horas_requeridas || 1;
      const porcentaje = progreso.porcentaje || 0;
      const completado = progreso.completado || false;
      
      // Determine status with i18n
      let status = 'pending';
      let statusText = window.t ? t('plans.status_pending') : 'Pendiente';
      
      if (completado || porcentaje >= 100) {
        status = 'completed';
        statusText = (window.t ? t('plans.status_completed') : 'Completado') + ' ✅';
      } else if (porcentaje > 0) {
        status = 'active';
        statusText = (window.t ? t('plans.status_in_progress') : 'En Progreso') + ' 🔄';
      }
      
      // Hours display with breakdown if justified hours exist (i18n)
      let horasDisplay = `${horasCompletadas}h`;
      const justifText = window.t ? t('hours.justified_short') : 'justif.';
      if (progreso.horas_justificadas > 0) {
        horasDisplay = `${horasCompletadas}h (${progreso.horas_reales}h + ${progreso.horas_justificadas}h ${justifText})`;
      }

      // Get month name with i18n
      const monthKey = `months.${plan.mes}`;
      const monthName = window.t ? t(monthKey) : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][plan.mes - 1] || 'Mes ' + plan.mes;

      // Translate labels
      const requiredLabel = window.t ? t('plans.required') : 'Requeridas';
      const completedLabel = window.t ? t('plans.completed_short') : 'Completadas';
      const progressLabel = window.t ? t('plans.progress') : 'Progreso';

      card.innerHTML = `
        <div class="plan-header">
          <div>
            <div class="plan-period">${monthName}</div>
            <div class="plan-year">${plan.anio}</div>
          </div>
          <div class="plan-status ${status}">${statusText}</div>
        </div>
        
        <div class="plan-body">
          <div class="plan-hours">
            <div class="hours-info">
              <div class="hours-required">${plan.horas_requeridas}h</div>
              <div class="hours-label">${requiredLabel}</div>
            </div>
            <div class="hours-completed">
              <div class="completed-number" title="${horasDisplay}">${Math.round(horasCompletadas * 10) / 10}h</div>
              <div class="completed-label">${completedLabel}</div>
            </div>
          </div>
          
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">${progressLabel}</span>
              <span class="progress-percentage">${Math.round(porcentaje)}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: 0%" data-width="${porcentaje}%"></div>
            </div>
          </div>
        </div>
      `;

      // Animate progress bar after card is rendered
      setTimeout(() => {
        const progressBar = card.querySelector('.progress-bar-fill');
        if (progressBar) {
          progressBar.style.transition = 'width 1s ease-out';
          progressBar.style.width = progressBar.dataset.width;
        }
      }, 100);

      return card;
    }

    // Animation helper
    function animateNumber(elementId, finalValue) {
      const element = document.getElementById(elementId);
      if (!element) return;

      const startValue = 0;
      const increment = finalValue / 30;
      let current = startValue;

      const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
          current = finalValue;
          clearInterval(timer);
        }
        element.textContent = Math.round(current);
      }, 50);
    }

    // Hide skeleton loaders
    function hideSkeletons() {
      const skeletons = document.querySelectorAll('.skeleton');
      skeletons.forEach(skeleton => {
        skeleton.style.display = 'none';
      });
    }

    // Update statistics with animation
    function updateStatsWithDashboardData(estadisticas) {
      if (!estadisticas) return;
      
      // Show real stat cards with fade in
      document.getElementById('stat-total').style.display = 'flex';
      document.getElementById('stat-active').style.display = 'flex';
      document.getElementById('stat-completed').style.display = 'flex';
      
      // Animate opacity
      setTimeout(() => {
        document.getElementById('stat-total').style.opacity = '1';
        document.getElementById('stat-active').style.opacity = '1';
        document.getElementById('stat-completed').style.opacity = '1';
      }, 50);
      
      // Animate numbers
      animateNumber('totalPlanes', estadisticas.total_planes || 0);
      animateNumber('planesActivos', estadisticas.planes_activos || 0);
      animateNumber('planesCompletados', estadisticas.planes_completados || 0);
    }



    // Show no data message with i18n
    function showNoDataMessage() {
      const container = document.getElementById('planesGrid');
      const noDataMessage = document.getElementById('noDataMessage');
      
      // Hide skeletons
      const skeletons = container.querySelectorAll('.skeleton');
      skeletons.forEach(skeleton => skeleton.remove());
      
      // Update message with translations if available
      if (noDataMessage) {
        const noPlansTitle = window.t ? t('plans.no_plans') : 'No hay planes de trabajo';
        const noPlansMsg = window.t ? t('plans.no_plans_assigned') : 'No tienes planes de trabajo asignados en este momento.';
        
        noDataMessage.innerHTML = `
          <i class="bi bi-calendar-x"></i>
          <h3>${noPlansTitle}</h3>
          <p>${noPlansMsg}</p>
        `;
        
        noDataMessage.style.display = 'block';
      }
    }

    // Logout function
    function logout() {
      localStorage.removeItem('access_token');
      window.location.href = 'index.html';
    }

    // Make functions available globally
    window.loadPlanesDataHtml = loadPlanesDataHtml;
