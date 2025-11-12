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
  const mobileNavbarContainer = document.getElementById("mobile-navbar-container");
  
  if (navbarContainer || mobileNavbarContainer) {
    try {
      const response = await fetch("navbar.html");
      const navbarHTML = await response.text();
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = navbarHTML;
      
      const styles = tempDiv.querySelectorAll('style');
      
      styles.forEach((style) => {
        const newStyle = document.createElement('style');
        newStyle.textContent = style.textContent;
        document.head.appendChild(newStyle);
        style.remove();
      });
      
      const mobileNavToRemove = tempDiv.querySelector('.mobile-nav');
      const sidebarToRemove = tempDiv.querySelector('.sidebar-menu');
      const overlayToRemove = tempDiv.querySelector('.menu-overlay');
      
      if (mobileNavToRemove) mobileNavToRemove.remove();
      if (sidebarToRemove) sidebarToRemove.remove();
      if (overlayToRemove) overlayToRemove.remove();
      
      const cleanedHTML = tempDiv.innerHTML;
      
      if (navbarContainer) {
        navbarContainer.innerHTML = cleanedHTML;
      }
      
      if (mobileNavbarContainer) {
        mobileNavbarContainer.innerHTML = cleanedHTML;
      }
      
      const scripts = tempDiv.querySelectorAll('script');
      
      scripts.forEach((script) => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.head.appendChild(newScript);
      });
      
      setTimeout(() => {
        attachNavbarEvents();
        
        if (typeof initUserIcon === 'function') {
          initUserIcon();
        }
        
        if (typeof initDesktopNavbar === 'function') {
          initDesktopNavbar();
        }
        
        // Update translations after navbar is loaded
        if (typeof LanguageManager !== 'undefined' && typeof LanguageManager.updatePageLanguage === 'function') {
          LanguageManager.updatePageLanguage();
        }
      }, 100);
    } catch (error) {
    }
  }
}

function attachNavbarEvents() {
  // Desktop navbar events
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  const verDatosBtn = document.getElementById('verDatosBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Mobile navbar events
  const userIconMobile = document.getElementById('userIconMobile');
  const userDropdownMobile = document.getElementById('userDropdownMobile');
  const sidebarMenu = document.getElementById('sidebarMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  function redirectToLogin() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
  }

  // Desktop navbar functionality
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
  }

  // Mobile navbar functionality
  if (userIconMobile && userDropdownMobile) {
    userIconMobile.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      userDropdownMobile.classList.toggle('show');
      
      // Close sidebar if open
      if (sidebarMenu) {
        sidebarMenu.classList.remove('open');
      }
      if (menuOverlay) {
        menuOverlay.classList.remove('active');
      }
    });
  }

  // Menu overlay click
  if (menuOverlay) {
    menuOverlay.addEventListener('click', () => {
      if (sidebarMenu) {
        sidebarMenu.classList.remove('open');
      }
      menuOverlay.classList.remove('active');
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    // Desktop dropdown
    if (userMenuBtn && userDropdown && 
        !userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove('show');
      if (userMenuBtn.classList) {
        userMenuBtn.classList.remove('menu-open');
      }
    }

    // Mobile dropdown
    if (userIconMobile && userDropdownMobile && 
        !userIconMobile.contains(e.target) && !userDropdownMobile.contains(e.target)) {
      userDropdownMobile.classList.remove('show');
    }
  });

  // Logout buttons
  if (logoutBtn) {
    logoutBtn.addEventListener('click', redirectToLogin);
  }

  // Mobile logout buttons (there might be multiple)
  const mobileLogoutBtns = document.querySelectorAll('[onclick="logout()"]');
  mobileLogoutBtns.forEach(btn => {
    btn.removeAttribute('onclick'); // Remove inline onclick
    btn.addEventListener('click', redirectToLogin);
  });

  // Ver datos buttons
  if (verDatosBtn) {
    verDatosBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (userDropdown) {
        userDropdown.classList.remove('show');
      }
      if (userMenuBtn && userMenuBtn.classList) {
        userMenuBtn.classList.remove('menu-open');
      }
      window.location.href = 'PerfilUsuario.html';
    });
  }

  // Mobile ver datos buttons
  const mobileVerDatosBtns = document.querySelectorAll('a[href="PerfilUsuario.html"]');
  mobileVerDatosBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (userDropdownMobile) {
        userDropdownMobile.classList.remove('show');
      }
    });
  });

  // Initialize user icons
  initializeUserIcons();
}

function initializeUserIcons() {
  const userIconMobile = document.getElementById('userIconMobile');
  const userIcon = document.querySelector('.user-icon');
  
  // Get user data from localStorage or session
  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userInitial = userData.nombre ? userData.nombre.charAt(0).toUpperCase() : 'U';
  
  if (userIconMobile) {
    userIconMobile.textContent = userInitial;
  }
  
  if (userIcon) {
    userIcon.textContent = userInitial;
  }
}

// Global functions for mobile navbar (to be available in onclick attributes)
window.toggleMenu = function() {
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('menuOverlay');
  const userDropdown = document.getElementById('userDropdownMobile');
  
  if (sidebar && overlay) {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    
    // Close user dropdown if open
    if (userDropdown) {
      userDropdown.classList.remove('show');
    }
  }
};

window.closeMenu = function() {
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('menuOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }
};

window.toggleUserDropdown = function() {
  const dropdown = document.getElementById('userDropdownMobile');
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('menuOverlay');
  
  if (dropdown) {
    dropdown.classList.toggle('show');
    
    // Close sidebar if open
    if (sidebar && overlay) {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }
  }
};

window.logout = function() {
  localStorage.removeItem('userData');
  localStorage.removeItem('authToken');
  localStorage.removeItem('access_token');
  window.location.href = 'index.html';
};

window.addEventListener("DOMContentLoaded", loadNavbar);
