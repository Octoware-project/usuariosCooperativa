    document.addEventListener('DOMContentLoaded', function() {
      loadNavbar();
      updateCurrentTheme();
      updateThemeCards();
      updateCurrentLanguage();
      updateLanguageCards();
    });
    
    // Select theme
    function selectTheme(themeName) {
      if (window.ThemeManager) {
        window.ThemeManager.applyTheme(themeName);
        updateThemeCards();
        updateCurrentTheme();
        showToast(`Tema ${themeName === 'light' ? 'Claro' : 'Oscuro'} aplicado correctamente`, 'success');
      } else {
        showToast('Error al aplicar el tema', 'error');
      }
    }
    
    // Update theme cards active state
    function updateThemeCards() {
      const currentTheme = localStorage.getItem('theme') || 'light';
      const cards = document.querySelectorAll('.option-card[data-theme]');
      
      cards.forEach(card => {
        const theme = card.getAttribute('data-theme');
        if (theme === currentTheme) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }
    
    // Update current theme display
    function updateCurrentTheme() {
      // No longer needed as we show active state directly on cards
      updateThemeCards();
    }
    
    // Select language
    function selectLanguage(languageName) {
      if (window.LanguageManager) {
        window.LanguageManager.setLanguage(languageName);
        updateLanguageCards();
        updateCurrentLanguage();
        updateCurrentTheme();
        showToast(window.LanguageManager.t('toast.language_changed'), 'success');
      } else {
        showToast('Error changing language', 'error');
      }
    }
    
    // Update language cards active state
    function updateLanguageCards() {
      const currentLanguage = localStorage.getItem('language') || 'es';
      const cards = document.querySelectorAll('.option-card[data-language]');
      
      cards.forEach(card => {
        const language = card.getAttribute('data-language');
        if (language === currentLanguage) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }
    
    // Update current language display
    function updateCurrentLanguage() {
      // No longer needed as we show active state directly on cards
      updateLanguageCards();
    }
    
    // Reset to default theme
    function resetToDefault() {
      selectTheme('light');
    }
    
    // Go to Comprobantes page
    function goToComprobantes() {
      window.location.href = 'Comprobantes.html';
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      const toastMessage = document.getElementById('toastMessage');
      const icon = toast.querySelector('i');
      
      // Update message
      toastMessage.textContent = message;
      
      // Update icon and style
      toast.className = 'toast ' + type;
      if (type === 'success') {
        icon.className = 'bi bi-check-circle-fill';
      } else {
        icon.className = 'bi bi-x-circle-fill';
      }
      
      // Show toast
      toast.classList.add('show');
      
      // Hide after 3 seconds
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
    
    // Listen for theme changes
    window.addEventListener('themeChanged', function(e) {
      updateThemeCards();
      updateCurrentTheme();
    });
    
    // Listen for language changes
    window.addEventListener('languageChanged', function(e) {
      updateLanguageCards();
      updateCurrentLanguage();
      updateCurrentTheme();
    });
    
    // Logout function
    function logout() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      window.location.href = 'index.html';
    }
