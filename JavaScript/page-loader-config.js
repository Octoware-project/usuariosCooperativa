/**
 * Configuración del Page Loader
 * Personaliza estos valores según tus necesidades
 */

const LOADER_CONFIG = {
  // Posicionamiento
  topOffset: 70,           // Distancia desde arriba (altura del navbar desktop)
  topOffsetMobile: 60,     // Distancia desde arriba en móvil
  
  // Tiempos (en milisegundos)
  minDisplayTime: 300,     // Tiempo mínimo que se muestra el loader
  fadeOutDuration: 300,    // Duración de la animación de salida
  
  // Imágenes
  logoDark: 'img/IconoClaro.jpeg',   // Logo para tema oscuro
  logoLight: 'img/IconoOscuro.jpeg', // Logo para tema claro
  
  // Tamaños (en píxeles)
  logoSize: 80,            // Tamaño del logo
  spinnerSize: 120,        // Tamaño del contenedor del spinner
  logoSizeMobile: 65,      // Tamaño del logo en móvil
  spinnerSizeMobile: 100,  // Tamaño del spinner en móvil
  
  // Textos (soporta i18n)
  loadingText: {
    es: 'Cargando...',
    en: 'Loading...',
    pt: 'Carregando...'
  },
  
  // Z-index
  zIndex: {
    loader: 999,
    navbar: 1000,
    sidebar: 1001
  },
  
  // Colores
  colors: {
    spinnerPrimary: 'var(--primary-color, #007bff)',
    spinnerSecondary: 'rgba(0, 123, 255, 0.3)',
    textColor: 'var(--text-primary, #e4e6eb)',
    backgroundColor: 'var(--background, #0f1419)'
  },
  
  // Comportamiento
  behavior: {
    autoHide: true,              // Ocultar automáticamente cuando termine la carga
    waitForNavbar: true,         // Esperar a que el navbar esté cargado
    waitForCriticalImages: true, // Esperar a imágenes con data-critical
    showOnSlowConnection: true,  // Mostrar incluso en conexiones rápidas
  },
  
  // Debug
  debug: false  // Activar para ver logs en consola
};

// Función para obtener el texto según el idioma actual
function getLoadingText() {
  const lang = localStorage.getItem('language') || 'es';
  return LOADER_CONFIG.loadingText[lang] || LOADER_CONFIG.loadingText.es;
}

// Función para actualizar la configuración en tiempo real
function updateLoaderConfig(newConfig) {
  Object.assign(LOADER_CONFIG, newConfig);
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.LOADER_CONFIG = LOADER_CONFIG;
  window.getLoadingText = getLoadingText;
  window.updateLoaderConfig = updateLoaderConfig;
}
