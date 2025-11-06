// Mobile Navbar and Sidebar Module
// This module handles the mobile navigation bar, sidebar menu, and user dropdown

const MobileNavbar = {
  // Cache de elementos DOM
  elements: {
    menuBtn: null,
    userIcon: null,
    overlay: null,
    sidebarLogout: null,
    mobileLogout: null
  },
  
  /**
   * Initialize and inject mobile navbar into the page
   * Should be called on DOMContentLoaded
   */
  init: function() {
    this.injectHTML();
    this.cacheElements();
    this.setupEventListeners();
    this.updateUserIcon();
  },
  
  /**
   * Cache elementos DOM para reutilizar
   */
  cacheElements: function() {
    this.elements.menuBtn = document.getElementById('mobileMenuBtn');
    this.elements.userIcon = document.getElementById('userIconMobile');
    this.elements.overlay = document.getElementById('menuOverlay');
    this.elements.sidebarLogout = document.getElementById('sidebarLogoutBtn');
    this.elements.mobileLogout = document.getElementById('mobileLogoutBtn');
  },

  /**
   * Inject the mobile navbar and sidebar HTML into the body
   */
  injectHTML: function() {
    const navbarHTML = `
      <!-- Mobile Navigation Bar -->
      <nav class="mobile-nav">
        <button class="menu-btn" id="mobileMenuBtn">
          <i class="bi bi-list"></i>
        </button>
        <div class="user-icon-mobile" id="userIconMobile">U</div>
        <div class="user-dropdown-mobile" id="userDropdownMobile">
          <a href="PerfilUsuario.html">
            <i class="bi bi-person-circle"></i><span data-i18n="nav.profile">Ver Perfil</span>
          </a>
          <a href="#" id="mobileLogoutBtn">
            <i class="bi bi-box-arrow-right"></i><span data-i18n="nav.logout">Cerrar Sesión</span>
          </a>
        </div>
      </nav>
      
      <!-- Sidebar Menu -->
      <div class="sidebar-menu" id="sidebarMenu">
        <div class="sidebar-header">
          <h3 data-i18n="nav.menu">Menú Principal</h3>
          <p data-i18n="nav.navigation">Navegación</p>
        </div>
        <nav class="sidebar-nav">
          <div class="sidebar-main-links">
            <a href="dashboard.html">
              <i class="bi bi-house"></i><span data-i18n="nav.dashboard">Dashboard</span>
            </a>
            <a href="Comprobantes.html">
              <i class="bi bi-credit-card"></i><span data-i18n="nav.payments">Pagos</span>
            </a>
            <a href="HorasMensuales.html">
              <i class="bi bi-clock"></i><span data-i18n="nav.hours">Horas Mensuales</span>
            </a>
            <a href="PlanesTrabajoUsuario.html">
              <i class="bi bi-calendar-check"></i><span data-i18n="nav.work_plans">Planes de Trabajo</span>
            </a>
            <a href="Asambleas.html">
              <i class="bi bi-people-fill"></i><span data-i18n="nav.assemblies">Asambleas</span>
            </a>
          </div>
          <div class="sidebar-bottom-links">
            <a href="PerfilUsuario.html">
              <i class="bi bi-person-circle"></i><span data-i18n="nav.profile">Mi Perfil</span>
            </a>
            <a href="configuracion.html">
              <i class="bi bi-gear"></i><span data-i18n="nav.settings">Configuración</span>
            </a>
            <a href="#" id="sidebarLogoutBtn">
              <i class="bi bi-box-arrow-right"></i><span data-i18n="nav.logout">Cerrar Sesión</span>
            </a>
          </div>
        </nav>
      </div>
      
      <!-- Menu Overlay -->
      <div class="menu-overlay" id="menuOverlay"></div>
    `;

    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    if (typeof LanguageManager !== 'undefined' && LanguageManager.applyTranslations) {
      LanguageManager.applyTranslations();
    }
  },


  setupEventListeners: function() {
    // Usar elementos cacheados
    const { menuBtn, userIcon, overlay, sidebarLogout, mobileLogout } = this.elements;

    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        if (typeof toggleMenu === 'function') {
          toggleMenu();
        } else {
          this.toggleMenu();
        }
      });
    }

    if (userIcon) {
      userIcon.addEventListener('click', () => {
        if (typeof toggleUserDropdown === 'function') {
          toggleUserDropdown();
        } else {
          this.toggleUserDropdown();
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        if (typeof closeMenu === 'function') {
          closeMenu();
        } else {
          this.closeMenu();
        }
      });
    }

    // Logout buttons - use global function if available
    if (sidebarLogout) {
      sidebarLogout.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof logout === 'function') {
          logout();
        } else {
          this.logout();
        }
      });
    }

    if (mobileLogout) {
      mobileLogout.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof logout === 'function') {
          logout();
        } else {
          this.logout();
        }
      });
    }

    // Close dropdown when clicking outside (usando delegación)
    // Solo agregar listener si no existe
    if (!document._mobileNavbarClickHandlerAttached) {
      document.addEventListener('click', (e) => {
        const userDropdown = document.getElementById('userDropdownMobile');
        const userIconEl = document.getElementById('userIconMobile');
        
        if (userDropdown && userIconEl && 
            !userIconEl.contains(e.target) && 
            !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('active');
        }
      }, { passive: true });
      
      document._mobileNavbarClickHandlerAttached = true;
    }
  },

  /**
   * Toggle sidebar menu visibility
   * Usa funciones globales si existen para evitar duplicación
   */
  toggleMenu: function() {
    if (typeof window.toggleMenu === 'function') {
      window.toggleMenu();
    } else {
      const sidebar = document.getElementById('sidebarMenu');
      const overlay = document.getElementById('menuOverlay');
      
      if (sidebar && overlay) {
        const isOpen = sidebar.classList.contains('open');
        
        if (isOpen) {
          this.closeMenu();
        } else {
          sidebar.classList.add('open');
          overlay.classList.add('active', 'open');
          document.body.style.overflow = 'hidden';
        }
      }
    }
  },

  /**
   * Close sidebar menu
   * Usa funciones globales si existen para evitar duplicación
   */
  closeMenu: function() {
    if (typeof window.closeMenu === 'function') {
      window.closeMenu();
    } else {
      const sidebar = document.getElementById('sidebarMenu');
      const overlay = document.getElementById('menuOverlay');
      
      if (sidebar) {
        sidebar.classList.remove('open');
      }
      
      if (overlay) {
        overlay.classList.remove('active', 'open');
      }
      
      document.body.style.overflow = '';
    }
  },

  /**
   * Toggle user dropdown menu
   * Usa funciones globales si existen para evitar duplicación
   */
  toggleUserDropdown: function() {
    if (typeof window.toggleUserDropdown === 'function') {
      window.toggleUserDropdown();
    } else {
      const dropdown = document.getElementById('userDropdownMobile');
      
      if (dropdown) {
        dropdown.classList.toggle('active');
      }
    }
  },

  /**
   * Update user icon with first letter of user's name
   */
  updateUserIcon: function() {
    const userIcon = document.getElementById('userIconMobile');
    const userData = localStorage.getItem('user_data');
    
    if (userIcon && userData) {
      try {
        const user = JSON.parse(userData);
        const initial = user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U';
        userIcon.textContent = initial;
      } catch (e) {
        userIcon.textContent = 'U';
      }
    }
  },

  /**
   * Logout user and redirect to login page
   */
  logout: function() {
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    
    // Close any open menus
    this.closeMenu();
    
    // Redirect to login
    window.location.href = 'index.html';
  }
};

// Auto-initialize when DOM is ready (if not already initialized)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MobileNavbar.init());
} else {
  // DOM already loaded
  MobileNavbar.init();
}

// Export for use in other scripts if needed
if (typeof window !== 'undefined') {
  window.MobileNavbar = MobileNavbar;
}
