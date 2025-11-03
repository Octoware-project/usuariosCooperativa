
const ThemeManager = {
  themes: {
    light: {
      '--primary': '#d946a6',
      '--secondary': '#a855f7',
      '--success': '#059669',
      '--warning': '#d97706',
      '--error': '#dc2626',
      '--info': '#2563eb',
      
      '--surface': '#ffffff',
      '--surface-variant': '#f1f5f9',
      '--surface-hover': '#fce7f3',
      
      '--text-primary': '#1f2937',
      '--text-secondary': '#6b7280',
      '--text-tertiary': '#9ca3af',
      
      '--border': '#e5e7eb',
      '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.06)',
      '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
      '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
      
      '--bg-gradient': '#fafcfe',
      '--navbar-bg': 'rgba(255, 255, 255, 0.98)',
      '--navbar-shadow': '0 2px 10px rgba(0, 0, 0, 0.05)',
      '--navbar-border': 'rgba(226, 232, 240, 0.5)',
      
      '--sidebar-bg': '#ffffff',
      '--sidebar-header-bg': 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%)',
      '--sidebar-hover': '#fce7f3',
      
      '--card-bg': '#ffffff',
      '--card-border': '#e5e7eb',
      '--card-shadow': '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      
      '--btn-primary-bg': 'linear-gradient(135deg, #d946a6, #a855f7)',
      '--btn-primary-hover': 'linear-gradient(135deg, #c026d3, #9333ea)',
      
      '--status-approved-bg': 'rgba(5, 150, 105, 0.08)',
      '--status-approved-color': '#059669',
      '--status-pending-bg': 'rgba(217, 119, 6, 0.08)',
      '--status-pending-color': '#d97706',
      '--status-rejected-bg': 'rgba(220, 38, 38, 0.08)',
      '--status-rejected-color': '#dc2626',
      
      '--icon-success-bg': 'linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(5, 150, 105, 0.12))',
      '--icon-warning-bg': 'linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(217, 119, 6, 0.12))',
      '--icon-error-bg': 'linear-gradient(135deg, rgba(220, 38, 38, 0.08), rgba(220, 38, 38, 0.12))',
    },
    
    dark: {
      '--primary': '#ec4899',
      '--secondary': '#f472b6',
      '--success': '#059669',
      '--warning': '#d97706',
      '--error': '#dc2626',
      '--info': '#ec4899',
      
      '--surface': '#1e2128',
      '--surface-variant': '#282c34',
      '--surface-hover': '#2d3340',
      
      '--text-primary': '#d1d5db',
      '--text-secondary': '#9ca3af',
      '--text-tertiary': '#6b7280',
      
      '--border': '#374151',
      '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
      '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.25)',
      '--shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      '--shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.35)',
      
      '--bg-gradient': '#212529',
      '--navbar-bg': 'rgba(30, 33, 40, 0.98)',
      '--navbar-shadow': '0 2px 10px rgba(0, 0, 0, 0.2)',
      '--navbar-border': 'rgba(55, 65, 81, 0.3)',
      
      '--sidebar-bg': '#1e2128',
      '--sidebar-header-bg': 'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
      '--sidebar-hover': '#282c34',
      
      '--card-bg': '#1e2128',
      '--card-border': '#374151',
      '--card-shadow': '0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      
      '--btn-primary-bg': 'linear-gradient(135deg, #ec4899, #f472b6)',
      '--btn-primary-hover': 'linear-gradient(135deg, #db2777, #ec4899)',
      
      '--status-approved-bg': 'rgba(5, 150, 105, 0.12)',
      '--status-approved-color': '#10b981',
      '--status-pending-bg': 'rgba(217, 119, 6, 0.12)',
      '--status-pending-color': '#fbbf24',
      '--status-rejected-bg': 'rgba(220, 38, 38, 0.12)',
      '--status-rejected-color': '#f87171',
      
      '--icon-success-bg': 'linear-gradient(135deg, rgba(5, 150, 105, 0.12), rgba(5, 150, 105, 0.18))',
      '--icon-warning-bg': 'linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(217, 119, 6, 0.18))',
      '--icon-error-bg': 'linear-gradient(135deg, rgba(220, 38, 38, 0.12), rgba(220, 38, 38, 0.18))',
      '--icon-primary-bg': 'linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(236, 72, 153, 0.18))',
    }
  },
  
  init() {
    const savedTheme = this.getSavedTheme();
    this.applyTheme(savedTheme);
    this.updateThemeIcon(savedTheme);
  },
  
  getSavedTheme() {
    return localStorage.getItem('theme') || 'light';
  },
  
  saveTheme(theme) {
    localStorage.setItem('theme', theme);
  },
  
  applyTheme(themeName) {
    const theme = this.themes[themeName];
    const root = document.documentElement;
    
    Object.keys(theme).forEach(property => {
      root.style.setProperty(property, theme[property]);
    });
    
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${themeName}`);
    
    this.saveTheme(themeName);
    
    this.updateThemeIcon(themeName);
    
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
  },
  
  toggleTheme() {
    const currentTheme = this.getSavedTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  },
  
  updateThemeIcon(theme) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (themeIcon) {
      themeIcon.className = theme === 'light' ? 'bi bi-moon-stars' : 'bi bi-sun';
    }
    
    if (themeText) {
      themeText.textContent = theme === 'light' ? 'Modo Oscuro' : 'Modo Claro';
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
  ThemeManager.init();
}

window.ThemeManager = ThemeManager;
