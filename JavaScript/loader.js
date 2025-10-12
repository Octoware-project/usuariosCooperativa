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
  }
}

function attachNavbarEvents() {
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  const verDatosBtn = document.getElementById('verDatosBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  function redirectToLogin() {
    localStorage.removeItem('access_token');
    window.location.href = 'index.html';
  }

  userMenuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = userDropdown.classList.contains('show');
    
    if (isOpen) {
      userDropdown.classList.remove('show');
      userMenuBtn.classList.remove('menu-open');
    } else {
      userDropdown.classList.add('show');
      userMenuBtn.classList.add('menu-open');
    }
  });

  document.addEventListener('click', (e) => {
    // Solo cerrar el dropdown si el click no es en el menú de usuario ni en sus elementos
    if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove('show');
      userMenuBtn.classList.remove('menu-open');
    }
  });

  logoutBtn.addEventListener('click', redirectToLogin);

  // El enlace del dropdown solo necesita cerrar el menú cuando se hace click
  if (verDatosBtn) {
    verDatosBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevenir navegación por defecto
      console.log('Click en Ver datos detectado');
      userDropdown.classList.remove('show');
      userMenuBtn.classList.remove('menu-open');
      
      // Navegar inmediatamente
      window.location.href = 'EditarPerfilModerno.html';
    });
  }
}

window.addEventListener("DOMContentLoaded", loadNavbar);
