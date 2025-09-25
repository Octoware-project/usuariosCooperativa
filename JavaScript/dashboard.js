
// Hacer variables y función globales
window.modoEdicion = false;
window.userData = {};
window.personaData = {};



// No obtener referencias fijas, se buscarán dinámicamente en cada función

function redirectToLogin() {
  localStorage.removeItem('access_token');
  window.location.href = 'index.html';
}


window.cargarDatosUsuario = async function cargarDatosUsuario() {
  window.modoEdicion = false;
  // Obtener referencias dinámicamente
  const modalContent = document.getElementById('modalContent');
  const modalButtons = document.getElementById('modalButtons');
  const editBtn = document.getElementById('editBtn');
  if (modalButtons) modalButtons.style.display = 'flex';
  if (modalContent) modalContent.innerHTML = '<p>Cargando...</p>';
  // Asignar evento al botón Editar cada vez que se muestra el modal
  if (editBtn) {
    editBtn.onclick = function() {
      window.location.href = 'EditarDatos.html';
    };
  }
  const token = localStorage.getItem('access_token');
  if (!token) {
    redirectToLogin();
    return;
  }
  try {
    const res = await fetch(API_URLS.usuarios.validate(), {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error('No se pudieron cargar los datos');
    const data = await res.json();

    // Suponiendo que data.persona es el array que contiene la información
    const persona = Array.isArray(data.persona) ? data.persona[0] : data.persona;
    // Suponiendo que data.user es el array que contiene el email
    const user = Array.isArray(data.user) ? data.user[0] : data.user;
    window.personaData = persona || {};
    window.userData = user || {};

    // Mostrar ambos objetos de forma clara y usando los nombres exactos de la API
    if (modalContent) {
      modalContent.innerHTML = `
        <h4 style="margin-bottom:10px;">Datos de Usuario</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;align-items:center;">
          <div><span class="icon">👤</span> <strong>Nombre:</strong></div><div>${window.userData.name || ''}</div>
          <div><span class="icon">📧</span> <strong>Email:</strong></div><div>${window.userData.email || ''}</div>
        </div>
        <hr style="margin:14px 0;">
        <h4 style="margin-bottom:10px;">Datos Personales</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;align-items:center;">
          <div><span class="icon">👥</span> <strong>Apellido:</strong></div><div>${window.personaData.apellido || ''}</div>
          <div><span class="icon">🆔</span> <strong>Cédula:</strong></div><div>${window.personaData.CI || ''}</div>
          <div><span class="icon">📞</span> <strong>Teléfono:</strong></div><div>${window.personaData.telefono || ''}</div>
          <div><span class="icon">🏠</span> <strong>Dirección:</strong></div><div>${window.personaData.direccion || ''}</div>
          <div><span class="icon">💍</span> <strong>Estado Civil:</strong></div><div>${window.personaData.estadoCivil || ''}</div>
          <div><span class="icon">⚧️</span> <strong>Género:</strong></div><div>${window.personaData.genero || ''}</div>
          <div><span class="icon">🎂</span> <strong>Fecha de Nacimiento:</strong></div><div>${window.personaData.fechaNacimiento || ''}</div>
          <div><span class="icon">💼</span> <strong>Ocupación:</strong></div><div>${window.personaData.ocupacion || ''}</div>
          <div><span class="icon">🌍</span> <strong>Nacionalidad:</strong></div><div>${window.personaData.nacionalidad || ''}</div>
        </div>
      `;
    }
  } catch (err) {
    if (modalContent) modalContent.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
};








// Asignar eventos solo si existen los elementos (para compatibilidad cross-page)
window.addEventListener('DOMContentLoaded', function() {
  const editBtn = document.getElementById('editBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalBg = document.getElementById('modalBg');
  if (editBtn) {
    editBtn.addEventListener('click', function() {
      window.location.href = 'EditarDatos.html';
    });
  }
  if (closeModalBtn && modalBg) {
    closeModalBtn.addEventListener('click', () => {
      modalBg.classList.remove('show');
      window.modoEdicion = false;
    });
  }
});
closeModalBtn.addEventListener('click', () => {
  modalBg.classList.remove('show');
  modoEdicion = false;
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalBg.classList.contains('show')) {
    modalBg.classList.remove('show');
    modoEdicion = false;
  }
});

// Verificar token al cargar página
window.addEventListener('load', () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    redirectToLogin();
  }
});
