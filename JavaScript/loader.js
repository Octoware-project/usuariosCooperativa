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
