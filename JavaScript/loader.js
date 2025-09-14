// Funciones globales para skeleton loaders en tablas
function mostrarSkeletonsTabla(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (tbody) {
    Array.from(tbody.getElementsByClassName('skeleton-row')).forEach(row => row.style.display = '');
  }
}

function ocultarSkeletonsTabla(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (tbody) {
    Array.from(tbody.getElementsByClassName('skeleton-row')).forEach(row => row.style.display = 'none');
  }
}
async function loadNavbar() {
  const navbarContainer = document.getElementById("navbar");
  if (navbarContainer) {
    const response = await fetch("navbar.html");
    const navbarHTML = await response.text();
    navbarContainer.innerHTML = navbarHTML;
    attachNavbarEvents();
    // Inyectar modal global si no existe
    if (!document.getElementById('modalBg')) {
      const modalDiv = document.createElement('div');
      modalDiv.innerHTML = `
        <div class="modal-bg" id="modalBg">
          <div class="modal">
            <h3>Datos del Usuario</h3>
            <div id="modalContent"><p>Cargando...</p></div>
            <div class="modal-buttons" id="modalButtons">
              <button class="btn-edit" id="editBtn">Editar</button>
              <button class="btn-close" id="closeModalBtn">Cerrar</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalDiv.firstElementChild);
    }
    // Inicializar eventos del modal si dashboard.js no está presente
    if (typeof cargarDatosUsuario !== 'function') {
      window.cargarDatosUsuario = function() {
        const modalContent = document.getElementById('modalContent');
        const modalButtons = document.getElementById('modalButtons');
        if (modalContent) {
          modalContent.innerHTML = `
            <div id="cartelNoDisponible" style="display:flex;justify-content:center;align-items:center;height:80px;">
              <span style="background:#ffe0e0;color:#b71c1c;padding:8px 18px;border-radius:8px;font-size:0.98rem;cursor:pointer;box-shadow:0 2px 8px #b71c1c22;">Funcionalidad no disponible en esta página</span>
            </div>
          `;
          const cartel = document.getElementById('cartelNoDisponible');
          if (cartel) {
            cartel.onclick = function() {
              cartel.style.display = 'none';
              // Cerrar el modal también
              const modalBg = document.getElementById('modalBg');
              if (modalBg) modalBg.classList.remove('show');
            };
          }
        }
        if (modalButtons) modalButtons.style.display = 'none';
      };
    }
    // Botones cerrar/esc
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalBg = document.getElementById('modalBg');
    if (closeModalBtn && modalBg) {
      closeModalBtn.onclick = () => modalBg.classList.remove('show');
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBg.classList.contains('show')) {
          modalBg.classList.remove('show');
        }
      });
    }
  }
}

function attachNavbarEvents() {
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  const verDatosBtn = document.getElementById('verDatosBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  function redirectToLogin() {
    localStorage.removeItem('access_token');
    window.location.href = 'login.html';
  }

  userMenuBtn.addEventListener('click', () => {
    userDropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!userMenuBtn.contains(e.target)) {
      userDropdown.classList.remove('show');
    }
  });

  logoutBtn.addEventListener('click', redirectToLogin);

  verDatosBtn.addEventListener('click', () => {
    if (typeof cargarDatosUsuario === "function") {
      cargarDatosUsuario();
    }
    document.getElementById('modalBg').classList.add('show');
    userDropdown.classList.remove('show');
  });
}

window.addEventListener("DOMContentLoaded", loadNavbar);
