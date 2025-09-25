// config.js
// Configuración centralizada de URLs de API

const API_CONFIG = {
    // API de Usuarios (puerto 8000)
    API_USUARIOS: 'http://127.0.0.1:8000',
    
    // API de Cooperativa (puerto 8001)
    API_COOPERATIVA: 'http://127.0.0.1:8001',
    
    // Backoffice (puerto 8002)
    BACKOFFICE: 'http://127.0.0.1:8002'
};

// Funciones helper para construir URLs
const API_URLS = {
    // URLs para API de Usuarios
    usuarios: {
        validate: () => `${API_CONFIG.API_USUARIOS}/api/validate`,
        editarDatos: () => `${API_CONFIG.API_USUARIOS}/api/editar-datos-persona`,
        completarDatos: () => `${API_CONFIG.API_USUARIOS}/api/completar-datos`,
        login: () => `${API_CONFIG.API_USUARIOS}/api/login`,
        register: () => `${API_CONFIG.API_USUARIOS}/api/register`,
        token: () => `${API_CONFIG.API_USUARIOS}/oauth/token`
    },
    
    // URLs para API de Cooperativa
    cooperativa: {
        horas: () => `${API_CONFIG.API_COOPERATIVA}/api/horas`,
        horasById: (id) => `${API_CONFIG.API_COOPERATIVA}/api/horas/${id}`,
        horasCalcular: () => `${API_CONFIG.API_COOPERATIVA}/api/horas/calcular`,
        horasJustificacion: () => `${API_CONFIG.API_COOPERATIVA}/api/horas/justificacion`,
        facturas: () => `${API_CONFIG.API_COOPERATIVA}/api/facturas`,
        facturasById: (id) => `${API_CONFIG.API_COOPERATIVA}/api/facturas/${id}`,
        comprobante: (id) => `${API_CONFIG.API_COOPERATIVA}/api/facturas/${id}/comprobante`,
        planesTrabajoList: () => `${API_CONFIG.API_COOPERATIVA}/api/planes-trabajo`,
        planesTrabajoProgreso: (id) => `${API_CONFIG.API_COOPERATIVA}/api/planes-trabajo/${id}/progreso`
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, API_URLS };
}