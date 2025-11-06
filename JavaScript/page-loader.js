/**
 * Sistema de carga de página para Octoware
 * Muestra una animación de carga mientras se carga el contenido
 */

class PageLoader {
  constructor() {
    this.loaderElement = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa el loader creando el HTML necesario
   */
  init() {
    if (this.isInitialized) return;

    // Crear el HTML del loader
    const loaderHTML = `
      <div id="page-loader" class="page-loader">
        <div class="loader-content">
          <div class="loader-logo-container">
            <img id="loaderLogo" src="img/IconoClaro.jpeg" alt="Octoware Logo" class="loader-logo">
            <div class="loader-spinner"></div>
          </div>
          <div class="loader-text">Cargando...</div>
        </div>
      </div>
    `;

    // Insertar al inicio del body
    document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    this.loaderElement = document.getElementById('page-loader');
    this.isInitialized = true;

    // Aplicar tema actual al logo del loader
    this.updateLoaderTheme();
  }

  /**
   * Actualiza el logo del loader según el tema actual
   */
  updateLoaderTheme() {
    const loaderLogo = document.getElementById('loaderLogo');
    if (!loaderLogo) return;

    // Detectar tema actual desde localStorage y body class
    const savedTheme = localStorage.getItem('theme') || 'light';
    const hasLightClass = document.body.classList.contains('theme-light');
    const hasDarkClass = document.body.classList.contains('theme-dark');
    
    let currentTheme = savedTheme;
    if (hasLightClass) currentTheme = 'light';
    if (hasDarkClass) currentTheme = 'dark';
    
    // En tema claro usamos logo oscuro, en tema oscuro usamos logo claro
    const logoSrc = currentTheme === 'light' ? 'img/IconoOscuro.jpeg' : 'img/IconoClaro.jpeg';
    loaderLogo.src = logoSrc;
  }

  /**
   * Muestra el loader
   */
  show() {
    if (!this.isInitialized) {
      this.init();
    }
    
    if (this.loaderElement) {
      this.loaderElement.classList.add('active');
      document.body.classList.add('loading');
      // No bloqueamos el overflow para permitir navegación
    }
  }

  /**
   * Oculta el loader con animación suave
   */
  hide() {
    if (!this.loaderElement) return;

    this.loaderElement.classList.add('fade-out');
    document.body.classList.remove('loading');
    
    setTimeout(() => {
      if (this.loaderElement) {
        this.loaderElement.classList.remove('active', 'fade-out');
      }
    }, 300);
  }

  /**
   * Verifica si todos los recursos críticos están cargados
   */
  async waitForCriticalResources() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    // Esperar a que las imágenes críticas se carguen
    const criticalImages = document.querySelectorAll('img[data-critical]');
    if (criticalImages.length > 0) {
      await Promise.all(
        Array.from(criticalImages).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve); // Continuar incluso si hay error
          });
        })
      );
    }

    // Pequeño delay para asegurar que todo esté renderizado
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Espera a que el navbar esté cargado
   */
  async waitForNavbar() {
    return new Promise((resolve) => {
      // Si hay un skeleton visible, esperar al evento navbarLoaded
      if (window.navbarSkeletonLoader && window.navbarSkeletonLoader.isVisible()) {
        const handler = () => {
          window.removeEventListener('navbarLoaded', handler);
          resolve();
        };
        window.addEventListener('navbarLoaded', handler, { once: true });
        
        // Timeout de seguridad
        setTimeout(() => {
          window.removeEventListener('navbarLoaded', handler);
          resolve();
        }, 5000);
      } else {
        // Usar MutationObserver en lugar de polling
        const navbar = document.querySelector('nav');
        const navbarLinks = document.querySelectorAll('.nav-links a, .sidebar-nav a');
        
        if (navbar && navbarLinks.length > 0) {
          resolve();
          return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
          const nav = document.querySelector('nav');
          const links = document.querySelectorAll('.nav-links a, .sidebar-nav a');
          
          if (nav && links.length > 0) {
            obs.disconnect();
            resolve();
          }
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        // Timeout de seguridad
        setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 5000);
      }
    });
  }

  /**
   * Maneja todo el proceso de carga de la página
   */
  async handlePageLoad() {
    // Mostrar loader inmediatamente
    this.show();

    try {
      // Esperar a que se carguen los recursos críticos
      await Promise.all([
        this.waitForCriticalResources(),
        this.waitForNavbar()
      ]);

      // Esperar un mínimo de tiempo para evitar parpadeos
      await new Promise(resolve => setTimeout(resolve, 300));

      // Ocultar el loader
      this.hide();
    } catch (error) {
      // Ocultar el loader incluso si hay error
      this.hide();
    }
  }
}

// Crear instancia global
const pageLoader = new PageLoader();

// Iniciar automáticamente cuando se carga el script
if (document.readyState === 'loading') {
  pageLoader.show();
  
  // Manejar la carga completa de la página
  window.addEventListener('load', () => {
    pageLoader.handlePageLoad();
  });
} else {
  // Si el DOM ya está cargado, manejar la carga inmediatamente
  pageLoader.handlePageLoad();
}

// Escuchar cambios de tema para actualizar el logo del loader
window.addEventListener('themeChanged', (event) => {
  if (pageLoader.isInitialized) {
    pageLoader.updateLoaderTheme();
  }
});

// También escuchar cambios en localStorage (para otros tabs)
window.addEventListener('storage', (event) => {
  if (event.key === 'theme' && pageLoader.isInitialized) {
    pageLoader.updateLoaderTheme();
  }
});

// Observar cambios en las clases del body
if (typeof MutationObserver !== 'undefined') {
  const bodyObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class' && pageLoader.isInitialized) {
        pageLoader.updateLoaderTheme();
      }
    });
  });
  
  bodyObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
}

// Función para limpiar caché del navbar
window.clearNavbarCache = function() {
  localStorage.removeItem('navbar_cache');
  localStorage.removeItem('navbar_cache_version');
  location.reload();
};

// Exportar para uso manual si es necesario
window.pageLoader = pageLoader;
