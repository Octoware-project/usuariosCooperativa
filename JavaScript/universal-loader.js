/**
 * Sistema Universal de Carga - Octoware
 * Gestiona la carga de páginas esperando respuestas de APIs
 */

class UniversalPageLoader {
  constructor() {
    this.apiCalls = [];
    this.minLoadTime = 300; // Tiempo mínimo de visualización del loader
    this.maxLoadTime = 10000; // Timeout máximo
    this.startTime = Date.now();
    this.contentReady = false;
  }

  /**
   * Registra una llamada API para monitorear
   */
  registerApiCall(promise, name = 'API Call') {
    const apiCall = {
      name,
      completed: false,
      success: false,
      error: null
      // Removido 'promise' para evitar mantener referencias innecesarias
    };

    this.apiCalls.push(apiCall);

    promise
      .then(result => {
        apiCall.completed = true;
        apiCall.success = true;
        this.checkAllApisCompleted();
        return result;
      })
      .catch(error => {
        apiCall.completed = true;
        apiCall.success = false;
        apiCall.error = error;
        this.checkAllApisCompleted();
        return Promise.reject(error);
      });

    return promise;
  }

  /**
   * Verifica si todas las APIs completaron
   */
  checkAllApisCompleted() {
    const allCompleted = this.apiCalls.every(call => call.completed);
    
    if (allCompleted && !this.contentReady) {
      this.contentReady = true;
      this.showContent();
    }
  }

  /**
   * Muestra el contenido cuando todo está listo
   */
  async showContent() {
    // Asegurar tiempo mínimo de carga
    const elapsed = Date.now() - this.startTime;
    const remainingTime = Math.max(0, this.minLoadTime - elapsed);
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }

    // Ocultar el page loader
    if (window.pageLoader) {
      window.pageLoader.hide();
    }

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('contentReady', {
      detail: {
        apiCalls: this.apiCalls,
        loadTime: Date.now() - this.startTime
      }
    }));
  }

  /**
   * Forzar mostrar contenido (timeout o emergencia)
   */
  forceShow() {
    if (!this.contentReady) {
      this.contentReady = true;
      this.showContent();
    }
  }

  /**
   * Timeout de seguridad
   */
  setupSafetyTimeout() {
    setTimeout(() => {
      if (!this.contentReady) {
        this.forceShow();
      }
    }, this.maxLoadTime);
  }
}

// Crear instancia global
const universalLoader = new UniversalPageLoader();
universalLoader.setupSafetyTimeout();

// Exportar
window.universalLoader = universalLoader;

// No interceptar fetch automáticamente - usar registro manual

/**
 * Helper para código legacy que no usa fetch
 */
window.registerApiPromise = function(promise, name) {
  return universalLoader.registerApiCall(promise, name);
};

/**
 * Notificar que el contenido está listo manualmente
 */
window.contentIsReady = function() {
  universalLoader.forceShow();
};

// Si no hay APIs registradas después de 2 segundos, mostrar el contenido
setTimeout(() => {
  if (universalLoader.apiCalls.length === 0) {
    universalLoader.forceShow();
  }
}, 2000);
