/**
 * Navbar Loader - Carga automática de navbar desktop y móvil
 * Uso: Incluir este script en cualquier página para cargar ambos navbars
 */

// Función para cargar navbar desktop
function loadDesktopNavbar() {
  const navbarContainer = document.getElementById('navbar');
  if (!navbarContainer) return;

  fetch('navbar.html')
    .then(response => response.text())
    .then(html => {
      navbarContainer.innerHTML = html;
      
      // Ejecutar script del navbar desktop
      const script = document.createElement('script');
      script.textContent = `
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (userMenuBtn && userDropdown) {
          userMenuBtn.addEventListener('click', function() {
            userDropdown.classList.toggle('show');
          });

          document.addEventListener('click', function(event) {
            if (!userMenuBtn.contains(event.target)) {
              userDropdown.classList.remove('show');
            }
          });

          const logoutBtn = document.getElementById('logoutBtn');
          if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
              localStorage.removeItem('access_token');
              localStorage.removeItem('user_data');
              window.location.href = 'index.html';
            });
          }
        }
      `;
      document.head.appendChild(script);
    })
    .catch(error => console.error('Error loading desktop navbar:', error));
}

// Función para cargar navbar móvil
function loadMobileNavbar() {
  const mobileNavbarContainer = document.getElementById('mobile-navbar-container');
  if (!mobileNavbarContainer) return;

  fetch('mobile-navbar.html')
    .then(response => response.text())
    .then(html => {
      mobileNavbarContainer.innerHTML = html;
      
      // Ejecutar scripts del navbar móvil
      const script = document.createElement('script');
      script.textContent = `
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
        
        // Logout functionality
        function logout() {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
          window.location.href = 'index.html';
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
          const sidebar = document.getElementById('sidebarMenu');
          const userDropdown = document.getElementById('userDropdownMobile');
          const menuBtn = document.querySelector('.menu-btn');
          const userIcon = document.getElementById('userIconMobile');
          
          // Close sidebar if clicking outside
          if (sidebar && sidebar.classList.contains('open') && 
              !sidebar.contains(event.target) && 
              !menuBtn.contains(event.target)) {
            closeMenu();
          }
          
          // Close user dropdown if clicking outside
          if (userDropdown && userDropdown.classList.contains('show') && 
              !userDropdown.contains(event.target) && 
              !userIcon.contains(event.target)) {
            userDropdown.classList.remove('show');
          }
        });
        
        // Initialize user icon
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userIconMobile = document.getElementById('userIconMobile');
            if (userIconMobile && payload.usuario) {
              userIconMobile.textContent = payload.usuario.charAt(0).toUpperCase();
            }
          } catch (error) {
            console.error('Error parsing token:', error);
          }
        }
        
        // Make functions globally available
        window.toggleMenu = toggleMenu;
        window.closeMenu = closeMenu;
        window.toggleUserDropdown = toggleUserDropdown;
        window.logout = logout;
      `;
      document.head.appendChild(script);
    })
    .catch(error => console.error('Error loading mobile navbar:', error));
}

// Función para ocultar navbar desktop en móvil
function hideMobileDesktopNavbar() {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 767px) {
      #navbar {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Función principal para inicializar navbars
function initNavbars() {
  loadDesktopNavbar();
  loadMobileNavbar();
  hideMobileDesktopNavbar();
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbars);
} else {
  initNavbars();
}

// Exponer funciones globalmente
window.initNavbars = initNavbars;
window.loadDesktopNavbar = loadDesktopNavbar;
window.loadMobileNavbar = loadMobileNavbar;