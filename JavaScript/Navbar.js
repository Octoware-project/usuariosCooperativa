if (typeof openConfigModal === 'undefined') {
  window.openConfigModal = function() {
    const modal = document.getElementById('configModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateThemeButtons();
    }
  };
}

if (typeof closeConfigModal === 'undefined') {
  window.closeConfigModal = function() {
    const modal = document.getElementById('configModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };
}

if (typeof setTheme === 'undefined') {
  window.setTheme = function(themeName) {
    if (window.ThemeManager) {
      window.ThemeManager.applyTheme(themeName);
      updateThemeButtons();
    }
  };
}

if (typeof updateThemeButtons === 'undefined') {
  window.updateThemeButtons = function() {
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
    
    // Update logo based on theme
    updateNavbarLogo(currentTheme);
  };
}

// Function to update navbar logo based on theme
if (typeof updateNavbarLogo === 'undefined') {
  window.updateNavbarLogo = function(theme) {
    const logo = document.getElementById('navbarLogo');
    if (logo) {
      if (theme === 'dark') {
        logo.src = 'img/IconoOscuro.jpeg';
      } else {
        logo.src = 'img/IconoClaro.jpeg';
      }
    }
  };
}

// Initialize logo on page load
(function() {
  const initLogo = function() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    updateNavbarLogo(currentTheme);
  };

  // Set logo immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogo);
  } else {
    initLogo();
  }

  // Listen for theme changes from ThemeManager
  window.addEventListener('themeChanged', function(e) {
    if (e.detail && e.detail.theme) {
      updateNavbarLogo(e.detail.theme);
    }
  });
})();