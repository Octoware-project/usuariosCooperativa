// Cachear referencias DOM para optimizar performance
const NavbarCache = {
  sidebar: null,
  overlay: null,
  userDropdown: null,
  
  init() {
    this.sidebar = document.getElementById('sidebarMenu');
    this.overlay = document.getElementById('menuOverlay');
    this.userDropdown = document.getElementById('userDropdownMobile');
  },
  
  refresh() {
    // Refrescar referencias si es necesario
    if (!this.sidebar) this.sidebar = document.getElementById('sidebarMenu');
    if (!this.overlay) this.overlay = document.getElementById('menuOverlay');
    if (!this.userDropdown) this.userDropdown = document.getElementById('userDropdownMobile');
  }
};

function toggleMenu() {
  NavbarCache.refresh();
  
  if (NavbarCache.userDropdown) {
    NavbarCache.userDropdown.classList.remove('show');
  }
  
  if (NavbarCache.sidebar) {
    NavbarCache.sidebar.classList.toggle('open');
  }
  if (NavbarCache.overlay) {
    NavbarCache.overlay.classList.toggle('active');
  }
}

function closeMenu() {
  NavbarCache.refresh();
  
  if (NavbarCache.sidebar) {
    NavbarCache.sidebar.classList.remove('open');
  }
  if (NavbarCache.overlay) {
    NavbarCache.overlay.classList.remove('active');
  }
}

function toggleUserDropdown() {
  NavbarCache.refresh();
  
  if (NavbarCache.sidebar) {
    NavbarCache.sidebar.classList.remove('open');
  }
  if (NavbarCache.overlay) {
    NavbarCache.overlay.classList.remove('active');
  }
  
  if (NavbarCache.userDropdown) {
    NavbarCache.userDropdown.classList.toggle('show');
  }
}

// Usar delegación de eventos y cachear elementos
let globalClickHandlerAttached = false;

function attachGlobalClickHandler() {
  if (globalClickHandlerAttached) return;
  
  document.addEventListener('click', function(event) {
    const target = event.target;
    
    // Usar delegación - verificar clases en lugar de consultar DOM
    const userDropdown = document.getElementById('userDropdownMobile');
    const userIcon = document.getElementById('userIconMobile');
    
    if (userIcon && userDropdown && !userIcon.contains(target) && !userDropdown.contains(target)) {
      userDropdown.classList.remove('show');
    }
    
    // Verificar si el click fue en el overlay
    if (target.classList.contains('menu-overlay') || target.id === 'menuOverlay') {
      closeMenu();
    }
  }, { passive: true });
  
  globalClickHandlerAttached = true;
}

// Llamar al final de la inicialización
attachGlobalClickHandler();

function initUserIcon() {
  const userIcon = document.getElementById('userIconMobile');
  
  if (!userIcon) return;
  
  const token = localStorage.getItem('access_token');
  if (token) {
    userIcon.textContent = 'U';
  }
}

// Cachear elementos del desktop navbar
let desktopNavbarInitialized = false;
let userMenuBtn = null;
let userDropdown = null;

function initDesktopNavbar() {
  if (desktopNavbarInitialized) return;
  
  userMenuBtn = document.getElementById('userMenuBtn');
  userDropdown = document.getElementById('userDropdown');
  
  if (userMenuBtn && userDropdown) {
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
    
    // Solo agregar este listener una vez
    document.addEventListener('click', function desktopDropdownHandler(event) {
      if (userMenuBtn && userDropdown && 
          !userMenuBtn.contains(event.target) && 
          !userDropdown.contains(event.target)) {
        userDropdown.classList.remove('show');
        userMenuBtn.classList.remove('menu-open');
      }
    }, { passive: true });
    
    desktopNavbarInitialized = true;
  }
}

function logout() {
  // Limpiar todo el localStorage de una vez en lugar de múltiples llamadas
  const keysToRemove = ['access_token', 'userData', 'authToken'];
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  window.location.href = 'index.html';
}

function initNavbarAfterLoad() {
  NavbarCache.init();
  initUserIcon();
  initDesktopNavbar();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initNavbarAfterLoad, 200);
  });
} else {
  setTimeout(initNavbarAfterLoad, 200);
}

function openConfigModal() {
  const modal = document.getElementById('configModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    updateThemeButtons();
  }
}

function closeConfigModal() {
  const modal = document.getElementById('configModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function setTheme(themeName) {
  if (window.ThemeManager) {
    window.ThemeManager.applyTheme(themeName);
    updateThemeButtons();
  }
}

function updateThemeButtons() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const lightBtn = document.getElementById('lightThemeBtn');
  const darkBtn = document.getElementById('darkThemeBtn');
  
  if (lightBtn && darkBtn) {
    lightBtn.classList.remove('active');
    darkBtn.classList.remove('active');
    
    if (currentTheme === 'light') {
      lightBtn.classList.add('active');
    } else {
      darkBtn.classList.add('active');
    }
  }
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeConfigModal();
  }
});
