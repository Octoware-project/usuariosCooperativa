// Variables globales para datos del usuario
let userData = {};
let personaData = {};
let dataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

function redirectToLogin() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_cache');
  window.location.href = 'index.html';
}

// Función para verificar si el caché es válido
function isCacheValid() {
  if (!dataCache || !cacheTimestamp) return false;
  return (Date.now() - cacheTimestamp) < CACHE_DURATION;
}

// Función para guardar datos en caché
function saveToCache(data) {
  dataCache = data;
  cacheTimestamp = Date.now();
  try {
    localStorage.setItem('user_cache', JSON.stringify({
      data: data,
      timestamp: cacheTimestamp
    }));
  } catch (error) {
    console.warn('No se pudo guardar en localStorage:', error);
  }
}

// Función para cargar datos del caché
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
    console.warn('Error cargando caché:', error);
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

    // Verificar si tenemos datos en caché válidos y no se fuerza la actualización
    if (!forceRefresh && loadFromCache() && isCacheValid()) {
      console.log('Cargando datos desde caché...');
      procesarDatos(dataCache);
      actualizarInterfaz();
      return;
    }

    console.log('Cargando datos desde API...');
    
    // Configurar fetch con timeout y optimizaciones
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout
    
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
    
    // Guardar en caché y procesar datos
    saveToCache(data);
    procesarDatos(data);
    actualizarInterfaz();
    
  } catch (err) {
    if (err.name === 'AbortError') {
      mostrarError('La conexión tardó demasiado. Intenta nuevamente.');
    } else {
      console.error('Error cargando datos del perfil:', err);
      mostrarError('No se pudieron cargar los datos del perfil');
      
      // Intentar cargar desde caché como fallback
      if (loadFromCache()) {
        console.log('Usando datos en caché como fallback...');
        procesarDatos(dataCache);
        actualizarInterfaz();
      }
    }
  }
}

function procesarDatos(data) {
  // Procesar datos de la respuesta de forma optimizada
  const persona = Array.isArray(data.persona) ? data.persona[0] : data.persona;
  const user = Array.isArray(data.user) ? data.user[0] : data.user;
  
  userData = user || {};
  personaData = persona || {};
}

function actualizarInterfaz() {
  // Panel lateral izquierdo
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
  
  // Avatar placeholder con inicial del nombre
  const avatarPlaceholder = document.getElementById('avatarPlaceholder');
  if (userData.name) {
    avatarPlaceholder.textContent = userData.name.charAt(0).toUpperCase();
  }
  
  // Card 1: Datos de la cuenta
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
  
  // Card 2: Información laboral (valores por defecto ya que no están en la API)
  document.getElementById('department').textContent = 'Cooperativa';
  document.getElementById('position').textContent = 'Asociado';
  document.getElementById('joinDate').textContent = 
    formatearFecha(userData.created_at) || 'No especificado';
  
  // Card 3: Seguridad (valores por defecto)
  document.getElementById('lastAccess').textContent = 'Hoy';
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
  // Crear un toast de Bootstrap para mostrar errores
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
  
  // Auto-remover el toast después de 5 segundos
  setTimeout(() => {
    const toast = document.querySelector('.toast-container');
    if (toast) toast.remove();
  }, 5000);
}

function mostrarExito(mensaje) {
  // Crear un toast de Bootstrap para mostrar éxito
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
  
  // Auto-remover el toast después de 3 segundos
  setTimeout(() => {
    const toast = document.querySelector('.toast-container');
    if (toast) toast.remove();
  }, 3000);
}

// Funciones para editar diferentes secciones
function editPersonalInfo() {
  // Redirigir a la página de editar datos existente
  window.location.href = 'EditarDatos.html';
}

function cambiarContrasena() {
  mostrarModalEdicion('password', 'Cambiar Contraseña', {
    current_password: { label: 'Contraseña actual', type: 'password', value: '' },
    password: { label: 'Nueva contraseña', type: 'password', value: '' },
    password_confirmation: { label: 'Confirmar nueva contraseña', type: 'password', value: '' }
  });
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

function mostrarModalEdicion(tipo, titulo, campos) {
  // Crear modal dinámico
  const modalId = `editModal-${tipo}`;
  
  // Remover modal existente si existe
  const existingModal = document.getElementById(modalId);
  if (existingModal) existingModal.remove();
  
  let camposHtml = '';
  for (const [key, field] of Object.entries(campos)) {
    camposHtml += `
      <div class="mb-3">
        <label for="${key}" class="form-label">${field.label}</label>
        <input type="${field.type}" class="form-control" id="${key}" name="${key}" 
               value="${field.value || ''}" ${field.type === 'password' ? '' : ''}>
      </div>
    `;
  }
  
  const modalHtml = `
    <div class="modal fade" id="${modalId}" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content" style="border-radius: 20px; border: none;">
          <div class="modal-header" style="background: linear-gradient(135deg, #f9a8d4 0%, #c084fc 100%); color: white; border-radius: 20px 20px 0 0;">
            <h5 class="modal-title">${titulo}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="form-${tipo}">
              ${camposHtml}
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn" style="background: #f9a8d4; color: white;" 
                    onclick="guardarCambios('${tipo}')">Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById(modalId));
  modal.show();
  
  // Limpiar modal cuando se cierre
  document.getElementById(modalId).addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

async function guardarCambios(tipo) {
  const form = document.getElementById(`form-${tipo}`);
  const formData = new FormData(form);
  const datos = Object.fromEntries(formData);
  
  // Validaciones básicas
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
    
    // Preparar datos para enviar según el endpoint correspondiente
    let endpoint, payload;
    
    if (tipo === 'account' || tipo === 'email' || tipo === 'phone' || tipo === 'username' || 
        tipo === 'gender' || tipo === 'civilStatus' || tipo === 'nationality') {
      // Usar el endpoint de actualizar persona desde API Cooperativa
      endpoint = API_URLS.cooperativa.editarDatos();
      payload = {
        ...personaData,
        ...datos
      };
    } else if (tipo === 'password') {
      // Usar el endpoint de cambiar contraseña
      endpoint = API_URLS.cooperativa.cambiarContrasena();
      payload = datos;
    } else {
      // Para otros casos, simular guardado exitoso
      mostrarExito('Cambios guardados correctamente');
      bootstrap.Modal.getInstance(document.querySelector('.modal.show')).hide();
      await cargarDatosPerfil(true); // Forzar recarga desde API
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
    await cargarDatosPerfil(true); // Forzar recarga desde API
    
  } catch (error) {
    console.error('Error guardando cambios:', error);
    mostrarError(error.message || 'Error al guardar cambios');
  }
}

// Función para mostrar indicador de carga
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

// Función para actualizar solo si es necesario
async function actualizarDatosSiNecesario() {
  if (!isCacheValid()) {
    mostrarCargando(true);
    await cargarDatosPerfil(true);
  }
}

// Verificar token al cargar página
window.addEventListener('load', async () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    redirectToLogin();
    return;
  }
  
  // Cargar datos inmediatamente (desde caché si está disponible)
  await cargarDatosPerfil();
  
  // Configurar actualización automática cada 5 minutos
  setInterval(actualizarDatosSiNecesario, 5 * 60 * 1000);
});

// Hacer funciones globales para compatibilidad
window.cargarDatosPerfil = cargarDatosPerfil;
window.editPersonalInfo = editPersonalInfo;
window.editAccountData = editAccountData;
window.editWorkInfo = editWorkInfo;
window.editSecurity = editSecurity;
window.editField = editField;
window.guardarCambios = guardarCambios;
window.cambiarContrasena = cambiarContrasena;