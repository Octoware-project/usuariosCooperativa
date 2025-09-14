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
    const respPlanes = await fetch('http://localhost:8001/api/planes-trabajo', {
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
    // Obtener todas las horas mensuales del usuario
    const respHoras = await fetch('http://localhost:8001/api/horas/usuario', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    let horas = [];
    if (respHoras.ok) {
      const data = await respHoras.json();
      horas = data.horas || [];
    }
    // Limpiar skeleton
    ocultarSkeletonsTabla('tabla-planes-tbody');
    // Renderizar filas
    tbody.innerHTML = '';
    planes.forEach(plan => {
      // Sumar horas trabajadas para ese mes/año (sin deleted_at)
      const horasPlan = horas.filter(h => h.anio == plan.anio && h.mes == plan.mes && !h.deleted_at);
      const totalHoras = horasPlan.reduce((acc, h) => acc + (h.Cantidad_Horas || 0), 0);
      let porcentaje = plan.horas_requeridas > 0 ? Math.round((totalHoras / plan.horas_requeridas) * 100) : 0;
      porcentaje = Math.min(porcentaje, 100);
      tbody.innerHTML += `
        <tr${porcentaje === 100 ? ' style="background:#eafaf1;"' : ''}>
          <td>${plan.mes}</td>
          <td>${plan.anio}</td>
          <td>${plan.horas_requeridas}</td>
          <td>${totalHoras}</td>
          <td><span style="font-weight:600;color:${porcentaje === 100 ? '#27ae60' : '#1976d2'}">${porcentaje}%</span></td>
        </tr>
      `;
    });
  } catch {
    ocultarSkeletonsTabla('tabla-planes-tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#d81b60;font-size:1.1rem;padding:32px 0;">Error al cargar los planes de trabajo.</td></tr>';
  }
});
