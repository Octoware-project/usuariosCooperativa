let modoEdicion = false;
let userData = {};

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

    userData = data;
    const { password, created_at, updated_at, id, ...user } = data;

    modalContent.innerHTML = `
      <p><span class="icon">👤</span><strong>Nombre:</strong> ${user.nombre || ''}</p>
      <p><span class="icon">👥</span><strong>Apellido:</strong> ${user.apellido || ''}</p>
      <p><span class="icon">📧</span><strong>Email:</strong> ${user.email || ''}</p>
      <p><span class="icon">🆔</span><strong>Cédula:</strong> ${user.CI || ''}</p>
      <p><span class="icon">📞</span><strong>Teléfono:</strong> ${user.Telefono || ''}</p>
      <p><span class="icon">🏠</span><strong>Dirección:</strong> ${user.Direccion || ''}</p>
      <p><span class="icon">🔖</span><strong>Tipo de Usuario:</strong> ${user.Tipo_Persona || ''}</p>
    `;
  } catch (err) {
    modalContent.innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

function mostrarFormularioEdicion() {
  modoEdicion = true;
  modalButtons.style.display = 'none';

  modalContent.innerHTML = `
    <form id="editUserForm" novalidate>
      <label for="nombre">Nombre:</label>
      <input type="text" id="nombre" name="nombre" required value="${userData.nombre || ''}" />

      <label for="apellido">Apellido:</label>
      <input type="text" id="apellido" name="apellido" required value="${userData.apellido || ''}" />

      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required value="${userData.email || ''}" />

      <label for="CI">Cédula:</label>
      <input type="text" id="CI" name="CI" required value="${userData.CI || ''}" />

      <label for="Telefono">Teléfono:</label>
      <input type="text" id="Telefono" name="Telefono" required value="${userData.Telefono || ''}" />

      <label for="Direccion">Dirección:</label>
      <input type="text" id="Direccion" name="Direccion" required value="${userData.Direccion || ''}" />

      <div class="form-message" id="formMessage"></div>

      <button type="submit">Guardar cambios</button>
    </form>
  `;

  const editUserForm = document.getElementById('editUserForm');
  const formMessage = document.getElementById('formMessage');

  editUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMessage.textContent = '';
    const token = localStorage.getItem('access_token');
    if (!token) {
      redirectToLogin();
      return;
    }

    const body = {
      nombre: editUserForm.nombre.value.trim(),
      apellido: editUserForm.apellido.value.trim(),
      email: editUserForm.email.value.trim(),
      CI: editUserForm.CI.value.trim(),
      Telefono: editUserForm.Telefono.value.trim(),
      Direccion: editUserForm.Direccion.value.trim(),
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar los datos');
      }

      userData = {...userData, ...body};
      formMessage.style.color = 'green';
      formMessage.textContent = 'Datos actualizados correctamente.';

      setTimeout(() => {
        cargarDatosUsuario();
        modalButtons.style.display = 'flex';
        modoEdicion = false;
      }, 1500);

    } catch (err) {
      formMessage.style.color = 'red';
      formMessage.textContent = err.message;
    }
  });
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
