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
  };
}