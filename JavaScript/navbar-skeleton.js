/**
 * Navbar Skeleton Loader
 * Sistema de carga elegante para el navbar
 */

class NavbarSkeletonLoader {
  constructor() {
    this.desktopSkeleton = null;
    this.mobileSkeleton = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa y muestra el skeleton
   */
  init() {
    if (this.isInitialized) return;

    // Crear skeleton para desktop
    this.createDesktopSkeleton();
    
    // Crear skeleton para móvil
    this.createMobileSkeleton();
    
    this.isInitialized = true;
  }

  /**
   * Crea el skeleton para navbar desktop
   */
  createDesktopSkeleton() {
    const skeleton = document.createElement('div');
    skeleton.className = 'navbar-skeleton';
    skeleton.id = 'navbar-skeleton-desktop';
    
    skeleton.innerHTML = `
      <div class="navbar-skeleton-logo"></div>
      <div class="navbar-skeleton-links">
        <div class="navbar-skeleton-link"></div>
        <div class="navbar-skeleton-link"></div>
        <div class="navbar-skeleton-link"></div>
        <div class="navbar-skeleton-link"></div>
      </div>
      <div class="navbar-skeleton-actions">
        <div class="navbar-skeleton-icon"></div>
        <div class="navbar-skeleton-icon"></div>
      </div>
    `;
    
    document.body.insertBefore(skeleton, document.body.firstChild);
    this.desktopSkeleton = skeleton;
  }

  /**
   * Crea el skeleton para navbar móvil
   */
  createMobileSkeleton() {
    const skeleton = document.createElement('div');
    skeleton.className = 'mobile-navbar-skeleton';
    skeleton.id = 'navbar-skeleton-mobile';
    
    skeleton.innerHTML = `
      <div class="mobile-skeleton-menu"></div>
      <div class="mobile-skeleton-logo"></div>
      <div class="mobile-skeleton-user"></div>
    `;
    
    document.body.insertBefore(skeleton, document.body.firstChild);
    this.mobileSkeleton = skeleton;
  }

  /**
   * Oculta el skeleton con animación
   */
  hide() {
    if (!this.isInitialized) return;

    // Agregar clase de animación de salida
    if (this.desktopSkeleton) {
      this.desktopSkeleton.classList.add('hiding');
    }
    
    if (this.mobileSkeleton) {
      this.mobileSkeleton.classList.add('hiding');
    }

    // Remover después de la animación
    setTimeout(() => {
      if (this.desktopSkeleton) {
        this.desktopSkeleton.remove();
        this.desktopSkeleton = null;
      }
      
      if (this.mobileSkeleton) {
        this.mobileSkeleton.remove();
        this.mobileSkeleton = null;
      }
      
      this.isInitialized = false;
    }, 300);
  }

  /**
   * Muestra el skeleton (útil si se necesita volver a mostrar)
   */
  show() {
    if (this.isInitialized) return;
    this.init();
  }

  /**
   * Verifica si el skeleton está visible
   */
  isVisible() {
    return this.isInitialized && 
           (this.desktopSkeleton !== null || this.mobileSkeleton !== null);
  }
}

// Crear instancia global
const navbarSkeletonLoader = new NavbarSkeletonLoader();

// Función para cargar navbar desde caché inmediatamente
function loadNavbarFromCacheInstantly() {
  const cachedNavbar = localStorage.getItem('navbar_cache');
  const cacheVersion = localStorage.getItem('navbar_cache_version');
  const currentVersion = '1.0';
  
  if (cachedNavbar && cacheVersion === currentVersion) {
    const navbarContainer = document.getElementById("navbar");
    const mobileNavbarContainer = document.getElementById("mobile-navbar-container");
    
    if (navbarContainer || mobileNavbarContainer) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cachedNavbar;
      
      // Limpiar elementos no necesarios
      const mobileNavToRemove = tempDiv.querySelector('.mobile-nav');
      const sidebarToRemove = tempDiv.querySelector('.sidebar-menu');
      const overlayToRemove = tempDiv.querySelector('.menu-overlay');
      
      if (mobileNavToRemove) mobileNavToRemove.remove();
      if (sidebarToRemove) sidebarToRemove.remove();
      if (overlayToRemove) overlayToRemove.remove();
      
      const cleanedHTML = tempDiv.innerHTML;
      
      if (navbarContainer) {
        navbarContainer.innerHTML = cleanedHTML;
        navbarContainer.classList.add('loaded');
      }
      
      if (mobileNavbarContainer) {
        mobileNavbarContainer.innerHTML = cleanedHTML;
        mobileNavbarContainer.classList.add('loaded');
      }
      
      // Marcar como cargado inmediatamente
      document.body.classList.add('navbar-loaded');
      
      // Inicializar funciones del navbar de forma asíncrona
      requestAnimationFrame(() => {
        if (typeof attachNavbarEvents === 'function') {
          attachNavbarEvents();
        }
        if (typeof initUserIcon === 'function') {
          initUserIcon();
        }
      });
      
      return true;
    }
  }
  return false;
}

// Intentar cargar desde caché antes de mostrar skeleton
const loadedFromCache = loadNavbarFromCacheInstantly();

// Mostrar el skeleton solo si no se cargó desde caché
if (!loadedFromCache) {
  if (document.readyState === 'loading') {
    navbarSkeletonLoader.init();
  } else {
    navbarSkeletonLoader.init();
  }
}

// Timeout de seguridad centralizado: Si después de 5 segundos el navbar no se cargó, mostrarlo de todos modos
const NAVBAR_LOAD_TIMEOUT = 5000;

setTimeout(() => {
  const navbar = document.getElementById('navbar');
  const mobileNavbar = document.getElementById('mobile-navbar-container');
  
  if (navbar && !navbar.classList.contains('loaded')) {
    navbar.classList.add('loaded');
    if (mobileNavbar) mobileNavbar.classList.add('loaded');
    document.body.classList.add('navbar-loaded');
    navbarSkeletonLoader.hide();
  }
}, NAVBAR_LOAD_TIMEOUT);

// Exportar para uso global
window.navbarSkeletonLoader = navbarSkeletonLoader;

// Integración con el loader existente
// Sobrescribir la función loadNavbar para incluir el skeleton
(function() {
  // Guardar la función original si existe
  const originalLoadNavbar = window.loadNavbar;
  
  // Nueva función mejorada
  window.loadNavbar = async function() {
    // Verificar si ya está cargado desde caché
    const navbarContainer = document.getElementById("navbar");
    const mobileNavbarContainer = document.getElementById("mobile-navbar-container");
    
    if ((navbarContainer && navbarContainer.classList.contains('loaded')) ||
        (mobileNavbarContainer && mobileNavbarContainer.classList.contains('loaded'))) {
      return;
    }

    // Asegurar que el skeleton esté visible
    if (!navbarSkeletonLoader.isVisible()) {
      navbarSkeletonLoader.show();
    }

    try {
      // Si existe la función original, ejecutarla
      if (typeof originalLoadNavbar === 'function') {
        await originalLoadNavbar();
      } else {
        // Si no, usar nuestra propia implementación
        await loadNavbarContent();
      }
      
      // Esperar un frame adicional para asegurar renderizado
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      
      // Marcar los containers como cargados
      const navbarContainer = document.getElementById("navbar");
      const mobileNavbarContainer = document.getElementById("mobile-navbar-container");
      
      if (navbarContainer) {
        navbarContainer.classList.add('loaded');
      }
      
      if (mobileNavbarContainer) {
        mobileNavbarContainer.classList.add('loaded');
      }
      
      // Marcar el body como navbar loaded
      document.body.classList.add('navbar-loaded');
      
      // Delay para la transición suave
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Ocultar el skeleton con animación
      navbarSkeletonLoader.hide();
      
      // Disparar evento personalizado
      window.dispatchEvent(new CustomEvent('navbarLoaded'));
      
    } catch (error) {
      // Ocultar el skeleton incluso si hay error
      navbarSkeletonLoader.hide();
    }
  };

  /**
   * Implementación de carga del navbar
   */
  async function loadNavbarContent() {
    const navbarContainer = document.getElementById("navbar");
    const mobileNavbarContainer = document.getElementById("mobile-navbar-container");
    
    if (!navbarContainer && !mobileNavbarContainer) return;

    try {
      // Intentar cargar desde caché primero
      const cachedNavbar = localStorage.getItem('navbar_cache');
      const cacheVersion = localStorage.getItem('navbar_cache_version');
      const currentVersion = '1.0'; // Incrementar cuando cambies el navbar
      
      let navbarHTML = null;
      
      // Si hay caché válido, usar el caché
      if (cachedNavbar && cacheVersion === currentVersion) {
        navbarHTML = cachedNavbar;
      } else {
        // Si no hay caché o está desactualizado, cargar desde el servidor
        const response = await fetch("navbar.html");
        navbarHTML = await response.text();
        
        // Guardar en caché
        try {
          localStorage.setItem('navbar_cache', navbarHTML);
          localStorage.setItem('navbar_cache_version', currentVersion);
        } catch (e) {
          // No se pudo guardar en caché
        }
      }
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = navbarHTML;
      
      // Manejar estilos - cargarlos primero
      const styles = tempDiv.querySelectorAll('style');
      const stylePromises = [];
      
      // Verificar si los estilos ya están en caché
      const cachedStyles = sessionStorage.getItem('navbar_styles_applied');
      
      if (!cachedStyles) {
        styles.forEach((style) => {
          const newStyle = document.createElement('style');
          newStyle.textContent = style.textContent;
          newStyle.setAttribute('data-navbar-style', 'true');
          document.head.appendChild(newStyle);
          style.remove();
          
          // Esperar a que el estilo se aplique
          stylePromises.push(new Promise(resolve => {
            requestAnimationFrame(() => {
              requestAnimationFrame(resolve);
            });
          }));
        });
        
        // Esperar a que todos los estilos se apliquen
        await Promise.all(stylePromises);
        
        // Marcar estilos como aplicados en esta sesión
        sessionStorage.setItem('navbar_styles_applied', 'true');
      } else {
        // Remover estilos del HTML ya que ya están aplicados
        styles.forEach(style => style.remove());
      }
      
      // Limpiar elementos innecesarios para versión desktop
      const mobileNavToRemove = tempDiv.querySelector('.mobile-nav');
      const sidebarToRemove = tempDiv.querySelector('.sidebar-menu');
      const overlayToRemove = tempDiv.querySelector('.menu-overlay');
      
      if (mobileNavToRemove) mobileNavToRemove.remove();
      if (sidebarToRemove) sidebarToRemove.remove();
      if (overlayToRemove) overlayToRemove.remove();
      
      const cleanedHTML = tempDiv.innerHTML;
      
      // Insertar el HTML con un micro-delay para evitar FOUC
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      if (navbarContainer) {
        navbarContainer.innerHTML = cleanedHTML;
      }
      
      if (mobileNavbarContainer) {
        mobileNavbarContainer.innerHTML = cleanedHTML;
      }
      
      // Usar requestAnimationFrame en lugar de forzar reflow
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
      
      // Manejar scripts
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
      
      // Esperar un momento para que se ejecuten los scripts
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Adjuntar eventos si la función existe
      if (typeof attachNavbarEvents === 'function') {
        attachNavbarEvents();
      }
      
      // Inicializar otros componentes si existen
      if (typeof initUserIcon === 'function') {
        initUserIcon();
      }
      
      if (typeof initDesktopNavbar === 'function') {
        initDesktopNavbar();
      }
      
      // Actualizar traducciones
      if (typeof LanguageManager !== 'undefined' && 
          typeof LanguageManager.updatePageLanguage === 'function') {
        LanguageManager.updatePageLanguage();
      }
      
    } catch (error) {
      throw error;
    }
  }
})();

// Auto-ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Cargar el navbar automáticamente
    setTimeout(() => {
      if (typeof loadNavbar === 'function') {
        loadNavbar();
      } else {
        // Si no existe loadNavbar, ocultar el skeleton y mostrar el navbar
        navbarSkeletonLoader.hide();
        const navbar = document.getElementById('navbar');
        const mobileNavbar = document.getElementById('mobile-navbar-container');
        if (navbar) navbar.classList.add('loaded');
        if (mobileNavbar) mobileNavbar.classList.add('loaded');
        document.body.classList.add('navbar-loaded');
      }
    }, 100);
  });
} else {
  // Si el DOM ya está listo, ejecutar inmediatamente
  setTimeout(() => {
    if (typeof loadNavbar === 'function') {
      loadNavbar();
    } else {
      navbarSkeletonLoader.hide();
      const navbar = document.getElementById('navbar');
      const mobileNavbar = document.getElementById('mobile-navbar-container');
      if (navbar) navbar.classList.add('loaded');
      if (mobileNavbar) mobileNavbar.classList.add('loaded');
      document.body.classList.add('navbar-loaded');
    }
  }, 100);
}
