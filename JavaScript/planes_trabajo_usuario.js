// planes_trabajo_usuario.js
// Muestra todos los planes de trabajo del usuario y su progreso

document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('access_token');
  const tbody = document.getElementById('tabla-planes-tbody');
  if (!token || !tbody) return;

  // Mostrar skeleton loader
  mostrarSkeletonsTabla('tabla-planes-tbody');

  try {
    // Obtener planes de trabajo del usuario
    const respPlanes = await fetch(API_URLS.cooperativa.planesTrabajoList(), {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    let planes = [];
    if (respPlanes.ok) {
      planes = await respPlanes.json();
    }
    // Si no hay planes, mostrar mensaje
    if (!Array.isArray(planes) || planes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;font-size:1.1rem;padding:32px 0;">No tienes planes de trabajo asignados.</td></tr>';
      return;
    }

    // Limpiar skeleton
    ocultarSkeletonsTabla('tabla-planes-tbody');
    // Renderizar filas
    tbody.innerHTML = '';
    
    // Para cada plan, obtener su progreso desde el backend
    for (const plan of planes) {
      try {
        // Obtener progreso del plan desde el backend
        const respProgreso = await fetch(API_URLS.cooperativa.planesTrabajoProgreso(plan.id), {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        
        let progreso = {
          horas_requeridas: plan.horas_requeridas,
          horas_cumplidas: 0,
          porcentaje: 0
        };
        
        if (respProgreso.ok) {
          progreso = await respProgreso.json();
        }
        
        const porcentaje = Math.min(Math.round(progreso.porcentaje), 100);
        const esCompleto = porcentaje >= 100;
        
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
        
        tbody.innerHTML += `
          <tr${claseRow}>
            <td>${plan.mes}</td>
            <td>${plan.anio}</td>
            <td>${progreso.horas_requeridas}h</td>
            <td>${horasTexto}</td>
            <td><span style="font-weight:600;color:${esCompleto ? '#27ae60' : '#1976d2'}">${porcentaje}%</span></td>
          </tr>
        `;
      } catch (error) {
        // Si falla el progreso de un plan específico, mostrar valores por defecto
        tbody.innerHTML += `
          <tr>
            <td>${plan.mes}</td>
            <td>${plan.anio}</td>
            <td>${plan.horas_requeridas}</td>
            <td>-</td>
            <td><span style="font-weight:600;color:#e74c3c">Error</span></td>
          </tr>
        `;
      }
    }
  } catch {
    ocultarSkeletonsTabla('tabla-planes-tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#d81b60;font-size:1.1rem;padding:32px 0;">Error al cargar los planes de trabajo.</td></tr>';
  }
});
