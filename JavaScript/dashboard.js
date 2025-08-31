let modoEdicion = false;
let userData = {};
let personaData = {};

const modalBg = document.getElementById('modalBg');
const modalContent = document.getElementById('modalContent');
const modalButtons = document.getElementById('modalButtons');
const editBtn = document.getElementById('editBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

function redirectToLogin() {
  localStorage.removeItem('access_token');
  window.location.href = 'login.html';
}

async function cargarDatosUsuario() {
  modoEdicion = false;
  modalButtons.style.display = 'flex';
  modalContent.innerHTML = '<p>Cargando...</p>';
  const token = localStorage.getItem('access_token');
  if (!token) {
    redirectToLogin();
    return;
  }
  try {
    const res = await fetch('http://127.0.0.1:8000/api/validate', {
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
    personaData = persona || {};
    userData = user || {};


    modalContent.innerHTML = `
      <p><span class="icon">👤</span><strong>Nombre:</strong> ${personaData.name || ''}</p>
      <p><span class="icon">👥</span><strong>Apellido:</strong> ${personaData.apellido || ''}</p>
      <p><span class="icon">📧</span><strong>Email:</strong> ${userData.email || ''}</p>
      <p><span class="icon">🆔</span><strong>Cédula:</strong> ${personaData.CI || ''}</p>
      <p><span class="icon">📞</span><strong>Teléfono:</strong> ${personaData.Telefono || ''}</p>
      <p><span class="icon">🏠</span><strong>Dirección:</strong> ${personaData.Direccion || ''}</p>
      <p><span class="icon">🏢</span><strong>Unidad Habitacional:</strong> ${personaData.UnidadHabitacional || ''}</p>
      <p><span class="icon">💍</span><strong>Estado Civil:</strong> ${personaData.EstadoCivil || ''}</p>
      <p><span class="icon">⚧️</span><strong>Género:</strong> ${personaData.Genero || ''}</p>
      <p><span class="icon">🎂</span><strong>Fecha de Nacimiento:</strong> ${personaData.FechaNacimiento || ''}</p>
      <p><span class="icon">💼</span><strong>Ocupación:</strong> ${personaData.Ocupacion || ''}</p>
      <p><span class="icon">🌍</span><strong>Nacionalidad:</strong> ${personaData.Nacionalidad || ''}</p>
      `

      ;
  } catch (err) {
    modalContent.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}







editBtn.addEventListener('click', mostrarFormularioEdicion);
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
