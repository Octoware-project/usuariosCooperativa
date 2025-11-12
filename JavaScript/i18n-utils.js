/**
 * Language Utility Functions
 * Funciones auxiliares para facilitar el uso del sistema de internacionalización
 */

const LanguageUtils = {
  /**
   * Aplica traducciones a elementos dinámicos creados con JavaScript
   * @param {HTMLElement} container - Contenedor con elementos a traducir
   */
  translateContainer(container) {
    if (!container) return;
    
    const elements = container.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = window.LanguageManager.t(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.placeholder !== undefined) {
          element.placeholder = translation;
        }
      } else {
        element.textContent = translation;
      }
    });
  },
  
  /**
   * Crea un elemento con traducción
   * @param {string} tag - Etiqueta HTML (div, span, button, etc.)
   * @param {string} i18nKey - Clave de traducción
   * @param {string} className - Clases CSS opcionales
   * @returns {HTMLElement}
   */
  createElement(tag, i18nKey, className = '') {
    const element = document.createElement(tag);
    element.setAttribute('data-i18n', i18nKey);
    element.textContent = window.LanguageManager.t(i18nKey);
    if (className) {
      element.className = className;
    }
    return element;
  },
  
  /**
   * Actualiza un elemento existente con traducción
   * @param {string|HTMLElement} elementOrId - Elemento o ID del elemento
   * @param {string} i18nKey - Clave de traducción
   */
  updateElement(elementOrId, i18nKey) {
    const element = typeof elementOrId === 'string' 
      ? document.getElementById(elementOrId)
      : elementOrId;
    
    if (element) {
      element.setAttribute('data-i18n', i18nKey);
      element.textContent = window.LanguageManager.t(i18nKey);
    }
  },
  
  /**
   * Obtiene el nombre del mes traducido
   * @param {number} monthNumber - Número del mes (1-12)
   * @returns {string}
   */
  getMonthName(monthNumber) {
    return window.LanguageManager.t(`month.${monthNumber}`);
  },
  
  /**
   * Formatea una fecha con el idioma actual
   * @param {Date|string} date - Fecha a formatear
   * @param {object} options - Opciones de formateo (Intl.DateTimeFormat)
   * @returns {string}
   */
  formatDate(date, options = {}) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const lang = window.LanguageManager.getCurrentLanguage();
    const locale = lang === 'es' ? 'es-ES' : 'en-US';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  },
  
  /**
   * Formatea un número con el idioma actual
   * @param {number} number - Número a formatear
   * @param {object} options - Opciones de formateo (Intl.NumberFormat)
   * @returns {string}
   */
  formatNumber(number, options = {}) {
    const lang = window.LanguageManager.getCurrentLanguage();
    const locale = lang === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  },
  
  /**
   * Formatea una moneda con el idioma actual
   * @param {number} amount - Cantidad a formatear
   * @param {string} currency - Código de moneda (USD, EUR, UYU, etc.)
   * @returns {string}
   */
  formatCurrency(amount, currency = 'UYU') {
    const lang = window.LanguageManager.getCurrentLanguage();
    const locale = lang === 'es' ? 'es-UY' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  },
  
  /**
   * Traduce un estado (Aprobado, Pendiente, Rechazado)
   * @param {string} status - Estado a traducir
   * @returns {string}
   */
  translateStatus(status) {
    const statusMap = {
      'aprobado': 'payments.approved',
      'pendiente': 'payments.pending',
      'rechazado': 'payments.rejected',
      'approved': 'payments.approved',
      'pending': 'payments.pending',
      'rejected': 'payments.rejected',
      'completado': 'plans.completed',
      'en progreso': 'plans.in_progress',
      'completed': 'plans.completed',
      'in_progress': 'plans.in_progress'
    };
    
    const key = statusMap[status.toLowerCase()];
    return key ? window.LanguageManager.t(key) : status;
  },
  
  /**
   * Genera HTML para un selector de idioma simple
   * @param {string} containerId - ID del contenedor donde insertar
   */
  renderLanguageSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const currentLang = window.LanguageManager.getCurrentLanguage();
    
    const selector = document.createElement('div');
    selector.className = 'language-selector';
    selector.innerHTML = `
      <button class="lang-btn ${currentLang === 'es' ? 'active' : ''}" onclick="LanguageUtils.switchLanguage('es')">
        🇪🇸 ES
      </button>
      <button class="lang-btn ${currentLang === 'en' ? 'active' : ''}" onclick="LanguageUtils.switchLanguage('en')">
        🇬🇧 EN
      </button>
    `;
    
    container.appendChild(selector);
  },
  
  /**
   * Cambia el idioma y actualiza el selector
   * @param {string} lang - Idioma a cambiar (es, en)
   */
  switchLanguage(lang) {
    window.LanguageManager.setLanguage(lang);
    
    // Actualizar botones activos
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`.lang-btn[onclick*="${lang}"]`)?.classList.add('active');
  },
  
  /**
   * Valida que todas las traducciones necesarias existan
   * @param {Array<string>} keys - Claves a validar
   * @returns {object} - {valid: boolean, missing: Array<string>}
   */
  validateTranslations(keys) {
    const missing = {
      es: [],
      en: []
    };
    
    keys.forEach(key => {
      if (!window.LanguageManager.translations.es[key]) {
        missing.es.push(key);
      }
      if (!window.LanguageManager.translations.en[key]) {
        missing.en.push(key);
      }
    });
    
    const valid = missing.es.length === 0 && missing.en.length === 0;
    return { valid, missing };
  }
};

// Hacer disponible globalmente
window.LanguageUtils = LanguageUtils;

// Agregar estilos básicos para el selector de idioma
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .language-selector {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    
    .lang-btn {
      padding: 0.5rem 1rem;
      border: 2px solid var(--border);
      background: var(--surface);
      color: var(--text-primary);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .lang-btn:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
      transform: translateY(-1px);
    }
    
    .lang-btn.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
    }
  `;
  document.head.appendChild(style);
}
