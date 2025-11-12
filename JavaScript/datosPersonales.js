
let userData = {};
let personaData = {};

function redirectToLogin() {
  localStorage.removeItem('access_token');
  window.location.href = 'index.html';
}

async function cargarDatosPersonales() {
  const datosContent = document.getElementById('datosContent');
  const actionButtons = document.getElementById('actionButtons');
  
  datosContent.innerHTML = `
    <div class="loading-container">
      <p>Cargando datos...</p>
    </div>
  `;
  
  const token = localStorage.getItem('access_token');
  if (!token) {
    redirectToLogin();
    return;
  }
  
  try {

    const res = await fetch(API_URLS.cooperativa.datosUsuario(), {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) throw new Error('No se pudieron cargar los datos');
    
    const data = await res.json();
    
    const persona = Array.isArray(data.persona) ? data.persona[0] : data.persona;
    const user = Array.isArray(data.user) ? data.user[0] : data.user;
    
    userData = user || {};
    personaData = persona || {};
    
    mostrarDatos();
    
    if (actionButtons) {
      actionButtons.style.display = 'flex';
    }
    
  } catch (err) {
    mostrarError(err.message);
  }
}

function mostrarDatos() {
  const datosContent = document.getElementById('datosContent');
  
  datosContent.innerHTML = `
    <div class="datos-section">
      <h3>Datos de Usuario</h3>
      <div class="datos-grid">
        <div class="datos-item">
          <span class="icon">👤</span>
          <span class="datos-label">Nombre:</span>
          <span class="datos-value">${userData.name || 'No especificado'}</span>
        </div>
        <div class="datos-item">
          <span class="icon">📧</span>
          <span class="datos-label">Email:</span>
          <span class="datos-value">${userData.email || 'No especificado'}</span>
        </div>
      </div>
    </div>
    
    <div class="datos-section">
      <h3>Datos Personales</h3>
      <div class="datos-grid">
        <div class="datos-item">
          <span class="icon">👥</span>
          <span class="datos-label">Apellido:</span>
          <span class="datos-value">${personaData.apellido || 'No especificado'}</span>
        </div>
        <div class="datos-item">
          <span class="icon">🆔</span>
          <span class="datos-label">Cédula:</span>
          <span class="datos-value">${personaData.CI || 'No especificado'}</span>
        </div>
        <div class="datos-item">
          <span class="icon">📞</span>
          <span class="datos-label">Teléfono:</span>
          <span class="datos-value">${personaData.telefono || 'No especificado'}</span>
        </div>
        <div class="datos-item">
          <span class="icon">🏠</span>
          <span class="datos-label">Dirección:</span>
          <span class="datos-value">${personaData.direccion || 'No especificado'}</span>
        </div>
        <div class="datos-item">
          <span class="icon">💍</span>
          <span class="datos-label">Estado Civil:</span>
          <span class="datos-value">${personaData.estadoCivil || 'No especificado'}</span>
        </div>
        <div class="datos-item">
          <span class="icon">⚧️</span>
          <span class="datos-label">Género:</span>
          <span class="datos-value">${personaData.genero || 'No especificado'}</span>
        </div>
        <div class="datos-item">
          <span class="icon">🎂</span>
          <span class="datos-label">Fecha de Nacimiento:</span>
          <span class="datos-value">${personaData.fechaNacimiento || 'No especificado'}</span>
        </div>
        <div class="datos-item">
          <span class="icon">💼</span>
          <span class="datos-label">Ocupación:</span>
          <span class="datos-value">${personaData.ocupacion || 'No especificado'}</span>
        </div>
        <div class="datos-item">
          <span class="icon">🌍</span>
          <span class="datos-label">Nacionalidad:</span>
          <span class="datos-value">${personaData.nacionalidad || 'No especificado'}</span>
        </div>
        <div class="datos-item">
          <span class="icon">📊</span>
          <span class="datos-label">Estado:</span>
          <span class="datos-value">${personaData.estadoRegistro || 'No especificado'}</span>
        </div>
      </div>
    </div>
  `;
}

function mostrarError(mensaje) {
  const datosContent = document.getElementById('datosContent');
  
  datosContent.innerHTML = `
    <div class="error-container">
      <h3>❌ Error</h3>
      <p>${mensaje}</p>
      <button onclick="cargarDatosPersonales()" class="btn btn-edit" style="margin-top: 1rem;">
        🔄 Reintentar
      </button>
    </div>
  `;
}