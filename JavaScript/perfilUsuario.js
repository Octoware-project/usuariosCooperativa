let userData = {};
let personaData = {};
let dataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000;
function redirectToLogin() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_cache');
  window.location.href = 'index.html';
}

function isCacheValid() {
  if (!dataCache || !cacheTimestamp) return false;
  return (Date.now() - cacheTimestamp) < CACHE_DURATION;
}

function saveToCache(data) {
  dataCache = data;
  cacheTimestamp = Date.now();
  try {
    localStorage.setItem('user_cache', JSON.stringify({
      data: data,
      timestamp: cacheTimestamp
    }));
  } catch (error) {
  }
}

function loadFromCache() {
  try {
    const cached = localStorage.getItem('user_cache');
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if ((Date.now() - parsedCache.timestamp) < CACHE_DURATION) {
        dataCache = parsedCache.data;
        cacheTimestamp = parsedCache.timestamp;
        return true;
      }
    }
  } catch (error) {
  }
  return false;
}

async function cargarDatosPerfil(forceRefresh = false) {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      redirectToLogin();
      return;
    }

    if (!forceRefresh && loadFromCache() && isCacheValid()) {
      procesarDatos(dataCache);
      actualizarInterfaz();
      return;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(API_URLS.cooperativa.datosUsuario(), {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
      signal: controller.signal,
      keepalive: true
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      if (res.status === 401) {
        redirectToLogin();
        return;
      }
      throw new Error(`Error del servidor: ${res.status}`);
    }
    
    const data = await res.json();
    
    saveToCache(data);
    procesarDatos(data);
    actualizarInterfaz();
    
  } catch (err) {
    if (err.name === 'AbortError') {
      mostrarError('La conexión tardó demasiado. Intenta nuevamente.');
    } else {
      mostrarError('No se pudieron cargar los datos del perfil');
      
      if (loadFromCache()) {
        procesarDatos(dataCache);
        actualizarInterfaz();
      }
    }
  }
}

function procesarDatos(data) {
  const persona = Array.isArray(data.persona) ? data.persona[0] : data.persona;
  const user = Array.isArray(data.user) ? data.user[0] : data.user;
  const unidadHabitacional = Array.isArray(data.unidad_habitacional) ? data.unidad_habitacional[0] : data.unidad_habitacional;
  
  userData = user || {};
  personaData = persona || {};
  userData.unidadHabitacional = unidadHabitacional || {};
}

function actualizarInterfaz() {
  document.getElementById('fullName').textContent = 
    `${userData.name || 'Cargando...'} ${personaData.apellido || ''}`.trim();
  
  document.getElementById('userRole').textContent = 
    personaData.estadoRegistro || 'Usuario';
  
  document.getElementById('birthDate').textContent = 
    formatearFecha(personaData.fechaNacimiento) || 'No especificado';
  
  document.getElementById('cedula').textContent = 
    personaData.CI || 'No especificado';
  
  document.getElementById('address').textContent = 
    personaData.direccion || 'No especificado';
  
  document.getElementById('occupation').textContent = 
    personaData.ocupacion || 'No especificado';
  
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');
  if (userData.name) {
    avatarPlaceholder.textContent = userData.name.charAt(0).toUpperCase();
  }
  
  document.getElementById('email').textContent = 
    userData.email || 'No especificado';
  
  document.getElementById('phone').textContent = 
    personaData.telefono || 'No especificado';
  
  document.getElementById('username').textContent = 
    userData.name || 'No especificado';
  
  document.getElementById('gender').textContent = 
    personaData.genero || 'No especificado';
  
  document.getElementById('civilStatus').textContent = 
    personaData.estadoCivil || 'No especificado';
  
  document.getElementById('nationality').textContent = 
    personaData.nacionalidad || 'No especificado';
  
  const unidadHabitacional = userData.unidadHabitacional || {};
  document.getElementById('unitNumber').textContent = 
    unidadHabitacional.numero_departamento || 'No asignado';
  document.getElementById('floor').textContent = 
    unidadHabitacional.piso || 'No especificado';
  document.getElementById('registrationDate').textContent = 
    formatearFecha(personaData.fecha_asignacion_unidad || userData.created_at) || 'No especificado';
}

function formatearFecha(fechaString) {
  if (!fechaString) return null;
  
  try {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  } catch (e) {
    return fechaString;
  }
}

function mostrarError(mensaje) {
  const toastHtml = `
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <div class="toast show" role="alert">
        <div class="toast-header bg-danger text-white">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <strong class="me-auto">Error</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          ${mensaje}
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', toastHtml);
  
  setTimeout(() => {
    const toast = document.querySelector('.toast-container');
    if (toast) toast.remove();
  }, 5000);
}

function mostrarExito(mensaje) {
  const toastHtml = `
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <div class="toast show" role="alert">
        <div class="toast-header bg-success text-white">
          <i class="bi bi-check-circle-fill me-2"></i>
          <strong class="me-auto">Éxito</strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          ${mensaje}
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', toastHtml);
  
  setTimeout(() => {
    const toast = document.querySelector('.toast-container');
    if (toast) toast.remove();
  }, 3000);
}

function editPersonalInfo() {
  window.location.href = 'EditarDatos.html';
}

function cambiarContrasena() {
  window.location.href = 'CambiarContrasena.html';
}

function editAccountData() {
  mostrarModalEdicion('account', 'Editar Datos de la Cuenta', {
    email: { label: 'Correo electrónico', type: 'email', value: userData.email },
    telefono: { label: 'Teléfono', type: 'tel', value: personaData.telefono }
  });
}

function editWorkInfo() {
  mostrarModalEdicion('work', 'Editar Información Laboral', {
    department: { label: 'Departamento', type: 'text', value: 'Cooperativa' },
    position: { label: 'Puesto', type: 'text', value: 'Asociado' }
  });
}

function editSecurity() {
  mostrarModalEdicion('security', 'Configurar Seguridad', {
    password: { label: 'Nueva contraseña', type: 'password', value: '' },
    confirmPassword: { label: 'Confirmar contraseña', type: 'password', value: '' }
  });
}

function editField(fieldName) {
  let config = {};
  
  switch(fieldName) {
    case 'email':
      config = { email: { label: 'Correo electrónico', type: 'email', value: userData.email } };
      break;
    case 'phone':
      config = { telefono: { label: 'Teléfono', type: 'tel', value: personaData.telefono } };
      break;
    case 'username':
      config = { name: { label: 'Nombre de usuario', type: 'text', value: userData.name } };
      break;
    case 'password':
      config = { 
        password: { label: 'Nueva contraseña', type: 'password', value: '' },
        confirmPassword: { label: 'Confirmar contraseña', type: 'password', value: '' }
      };
      break;
    case 'gender':
      config = { genero: { label: 'Género', type: 'text', value: personaData.genero } };
      break;
    case 'civilStatus':
      config = { estadoCivil: { label: 'Estado Civil', type: 'text', value: personaData.estadoCivil } };
      break;
    case 'nationality':
      config = { nacionalidad: { label: 'Nacionalidad', type: 'text', value: personaData.nacionalidad } };
      break;
    default:
      mostrarError('Campo no editable en esta versión');
      return;
  }
  
  mostrarModalEdicion(fieldName, `Editar ${fieldName}`, config);
}

async function guardarCambios(tipo) {
  const form = document.getElementById(`form-${tipo}`);
  const formData = new FormData(form);
  const datos = Object.fromEntries(formData);
  
  if (tipo === 'security' || tipo === 'password') {
    if (datos.password !== datos.password_confirmation) {
      mostrarError('Las contraseñas no coinciden');
      return;
    }
    if (datos.password && datos.password.length < 6) {
      mostrarError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!datos.current_password) {
      mostrarError('Debes ingresar tu contraseña actual');
      return;
    }
  }
  
  try {
    const token = localStorage.getItem('access_token');
    
    let endpoint, payload;
    
    if (tipo === 'account' || tipo === 'email' || tipo === 'phone' || tipo === 'username' || 
        tipo === 'gender' || tipo === 'civilStatus' || tipo === 'nationality') {
      endpoint = API_URLS.cooperativa.editarDatos();
      payload = {
        ...personaData,
        ...datos
      };
    } else if (tipo === 'password') {
      endpoint = API_URLS.cooperativa.cambiarContrasena();
      payload = datos;
    } else {
      mostrarExito('Cambios guardados correctamente');
      bootstrap.Modal.getInstance(document.querySelector('.modal.show')).hide();
      await cargarDatosPerfil(true);
      return;
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al guardar cambios');
    }
    
    mostrarExito('Cambios guardados correctamente');
    bootstrap.Modal.getInstance(document.querySelector('.modal.show')).hide();
    await cargarDatosPerfil(true);
    
  } catch (error) {
    mostrarError(error.message || 'Error al guardar cambios');
  }
}

function mostrarCargando(show = true) {
  const elementos = [
    'fullName', 'userRole', 'birthDate', 'cedula', 'address', 'occupation',
    'email', 'phone', 'username', 'gender', 'civilStatus', 'nationality'
  ];
  
  if (show) {
    elementos.forEach(id => {
      const elemento = document.getElementById(id);
      if (elemento) {
        elemento.innerHTML = '<div class="text-muted">Cargando...</div>';
      }
    });
  }
}

async function actualizarDatosSiNecesario() {
  if (!isCacheValid()) {
    mostrarCargando(true);
    await cargarDatosPerfil(true);
  }
}

window.addEventListener('load', async () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    redirectToLogin();
    return;
  }
  
  const cacheExists = localStorage.getItem('user_cache');
  
  const urlParams = new URLSearchParams(window.location.search);
  const hasRefreshParam = urlParams.has('refresh');
  
  const forceRefresh = !cacheExists || hasRefreshParam;
  
  if (hasRefreshParam) {
    const newUrl = window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }
  
  await cargarDatosPerfil(forceRefresh);
  
  setInterval(actualizarDatosSiNecesario, 5 * 60 * 1000);
});

window.cargarDatosPerfil = cargarDatosPerfil;
window.editPersonalInfo = editPersonalInfo;
window.editAccountData = editAccountData;
window.editWorkInfo = editWorkInfo;
window.editSecurity = editSecurity;
window.editField = editField;
window.guardarCambios = guardarCambios;
window.cambiarContrasena = cambiarContrasena;

    document.addEventListener('DOMContentLoaded', async function() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = 'index.html';
        return;
      }
      
      try {
        const res = await fetch(API_URLS.usuarios.validate(), {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        });
        
        if (!res.ok) throw new Error('No se pudo validar el token');
        
        const data = await res.json();
        
        // Si el usuario tiene estadoRegistro 'Inactivo', muestra alerta y redirige
        if (data.persona && data.persona.estadoRegistro === 'Inactivo') {
          alert('Debes completar todos tus datos');
          window.location.href = 'completarDatos.html';
          return;
        }
        
        // Si el usuario no está aceptado, redirige a login
        if (data.persona && data.persona.estadoRegistro !== 'Aceptado') {
          window.location.href = 'index.html';
          return;
        }
        
        // Cargar datos del perfil después de la validación
        await cargarDatosPerfil();
        
      } catch (err) {
        window.location.href = 'index.html';
      }
    });
    
    // Mobile menu functionality
    function toggleMenu() {
      const sidebar = document.getElementById('sidebarMenu');
      const overlay = document.getElementById('menuOverlay');
      const userDropdown = document.getElementById('userDropdownMobile');
      
      // Close user dropdown if open
      userDropdown.classList.remove('show');
      
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    }
    
    function closeMenu() {
      const sidebar = document.getElementById('sidebarMenu');
      const overlay = document.getElementById('menuOverlay');
      
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }
    
    function toggleUserDropdown() {
      const dropdown = document.getElementById('userDropdownMobile');
      const sidebar = document.getElementById('sidebarMenu');
      const overlay = document.getElementById('menuOverlay');
      
      // Close sidebar if open
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      
      dropdown.classList.toggle('show');
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
      const userIcon = document.getElementById('userIconMobile');
      const userDropdown = document.getElementById('userDropdownMobile');
      const menuBtn = document.querySelector('.menu-btn');
      
      if (!userIcon.contains(event.target) && !userDropdown.contains(event.target)) {
        userDropdown.classList.remove('show');
      }
    });
    
    // Initialize user icon with first letter of name
    function initUserIcon() {
      const userIcon = document.getElementById('userIconMobile');
      const fullNameElement = document.getElementById('fullName');
      
      if (fullNameElement && fullNameElement.textContent !== 'Cargando...') {
        const firstName = fullNameElement.textContent.split(' ')[0];
        userIcon.textContent = firstName.charAt(0).toUpperCase();
      }
    }
    
    // Call initUserIcon after profile data is loaded
    window.addEventListener('load', function() {
      setTimeout(initUserIcon, 1000); // Wait for data to load
    });
    
    // Logout function
    function logout() {
      localStorage.removeItem('access_token');
      window.location.href = 'index.html';
    }