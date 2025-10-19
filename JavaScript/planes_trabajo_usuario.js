// planes_trabajo_usuario.js
// VERSIÓN SÚPER OPTIMIZADA - Dashboard todo-en-uno

document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  // Usar sistema de compatibilidad
  await initPlanesDashboard();
});

// NUEVA FUNCIÓN OPTIMIZADA: Carga todo en una sola llamada
async function loadPlanesDashboard() {
  const token = localStorage.getItem('access_token');
  
  try {
    // Mostrar skeleton loaders
    mostrarSkeletons();
    
    // UNA SOLA LLAMADA AL BACKEND
    const response = await fetch(API_URLS.cooperativa.planesTrabajoDashboard(), {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const dashboardData = await response.json();
    
    // Ocultar skeletons
    ocultarSkeletons();
    
    // Renderizar planes con progreso incluido
    renderPlanesOptimizado(dashboardData.planes);
    
    // Actualizar estadísticas globales
    updateEstadisticasGlobales(dashboardData.estadisticas);
    
  } catch (error) {
    ocultarSkeletons();
    mostrarErrorMessage('Error al cargar los planes de trabajo');
  }
}

// Renderizar planes con todos los datos ya incluidos
function renderPlanesOptimizado(planes) {
  const tbody = document.getElementById('tabla-planes-tbody');
  if (!tbody) return;
  
  if (!Array.isArray(planes) || planes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#888;font-size:1.1rem;padding:32px 0;">
          No tienes planes de trabajo asignados.
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = '';
  
  planes.forEach(plan => {
    const progreso = plan.progreso;
    const porcentaje = Math.min(Math.round(progreso.porcentaje), 100);
    const esCompleto = progreso.completado;
    
    // Crear el texto de horas trabajadas con desglose si hay justificadas
    let horasTexto = '';
    if (progreso.horas_justificadas && progreso.horas_justificadas > 0) {
      horasTexto = `
        <div>
          <strong>${progreso.horas_cumplidas}h</strong>
        </div>
        <div class="horas-desglose">
          ${progreso.horas_reales}h reales + ${progreso.horas_justificadas}h justif.
        </div>
      `;
    } else {
      horasTexto = `<strong>${progreso.horas_cumplidas}h</strong>`;
    }
    
    const claseRow = esCompleto ? ' class="horas-completo"' : '';
    const estadoBadge = esCompleto ? 
      '<span class="badge-completado">✅ Completado</span>' : 
      '<span class="badge-activo">🔄 Activo</span>';
    
    tbody.innerHTML += `
      <tr${claseRow}>
        <td>${plan.mes}</td>
        <td>${plan.anio}</td>
        <td>${plan.horas_requeridas}h</td>
        <td>${horasTexto}</td>
        <td>
          <span style="font-weight:600;color:${esCompleto ? '#27ae60' : '#1976d2'}">${porcentaje}%</span>
          ${estadoBadge}
        </td>
      </tr>
    `;
  });
}
// Actualizar estadísticas globales (si existen elementos en el HTML)
function updateEstadisticasGlobales(estadisticas) {
  // Actualizar elementos de estadísticas si existen
  const statTotal = document.getElementById('stat-total-planes');
  const statCompletados = document.getElementById('stat-planes-completados');
  const statActivos = document.getElementById('stat-planes-activos');
  const statProgreso = document.getElementById('stat-progreso-global');
  
  if (statTotal) statTotal.textContent = estadisticas.total_planes;
  if (statCompletados) statCompletados.textContent = estadisticas.planes_completados;
  if (statActivos) statActivos.textContent = estadisticas.planes_activos;
  if (statProgreso) statProgreso.textContent = `${estadisticas.porcentaje_global}%`;
}

// Funciones auxiliares para skeletons y errores
function mostrarSkeletons() {
  mostrarSkeletonsTabla('tabla-planes-tbody');
  
  // Mostrar skeletons de estadísticas si existen
  const statsContainer = document.querySelector('.stats-overview');
  if (statsContainer) {
    const statCards = statsContainer.querySelectorAll('.stat-card');
    statCards.forEach(card => {
      card.style.opacity = '0.6';
      card.style.pointerEvents = 'none';
    });
  }
}

function ocultarSkeletons() {
  ocultarSkeletonsTabla('tabla-planes-tbody');
  
  // Restaurar estadísticas
  const statsContainer = document.querySelector('.stats-overview');
  if (statsContainer) {
    const statCards = statsContainer.querySelectorAll('.stat-card');
    statCards.forEach(card => {
      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
    });
  }
}

function mostrarErrorMessage(mensaje) {
  const tbody = document.getElementById('tabla-planes-tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#d81b60;font-size:1.1rem;padding:32px 0;">
          ❌ ${mensaje}
          <br><br>
          <button onclick="loadPlanesDashboard()" style="
            background: #1976d2; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 4px; 
            cursor: pointer;
          ">Reintentar</button>
        </td>
      </tr>
    `;
  }
}

// Función auxiliar para crear tabla si no existe el sistema de cards
function createTableIfNeeded() {
  const tbody = document.getElementById('tabla-planes-tbody');
  if (tbody) return tbody; // Ya existe tabla
  
  // Si no hay tabla pero hay grid de cards, crear tabla dinámicamente
  const planesGrid = document.getElementById('planesGrid');
  if (planesGrid) {
    const tableHTML = `
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Año</th>
              <th>Horas Requeridas</th>
              <th>Horas Completadas</th>
              <th>Progreso</th>
            </tr>
          </thead>
          <tbody id="tabla-planes-tbody"></tbody>
        </table>
      </div>
    `;
    
    planesGrid.innerHTML = tableHTML;
    return document.getElementById('tabla-planes-tbody');
  }
  
  return null;
}

// Función de compatibilidad para sistemas mixtos
function initPlanesDashboard() {
  // Si existe el sistema de cards HTML embebido, usar loadPlanesDataHtml
  if (document.getElementById('planesGrid') && window.loadPlanesDataHtml) {
    window.loadPlanesDataHtml();
  } else {
    // Sino, usar el sistema de tabla optimizado
    loadPlanesDashboard();
  }
}

// Exponer funciones globales
window.loadPlanesDashboard = loadPlanesDashboard;
window.initPlanesDashboard = initPlanesDashboard;
