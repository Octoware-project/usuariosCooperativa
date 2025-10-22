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
        planesTrabajoProgreso: (id) => `${API_CONFIG.API_COOPERATIVA}/api/planes-trabajo/${id}/progreso`,
        planesTrabajoDashboard: () => `${API_CONFIG.API_COOPERATIVA}/api/planes-trabajo/dashboard`,
        // Nuevas URLs para gestión de usuarios (ahora desde cooperativa)
        completarDatos: () => `${API_CONFIG.API_COOPERATIVA}/api/completar-datos`,
        editarDatos: () => `${API_CONFIG.API_COOPERATIVA}/api/editar-datos-persona`,
        datosUsuario: () => `${API_CONFIG.API_COOPERATIVA}/api/datos-usuario`,
        cambiarContrasena: () => `${API_CONFIG.API_COOPERATIVA}/api/cambiar-contrasena`,
        // URLs para Asambleas
        asambleas: () => `${API_CONFIG.API_COOPERATIVA}/api/asambleas`,
        asambleasById: (id) => `${API_CONFIG.API_COOPERATIVA}/api/asambleas/${id}`,
        asambleasFuturas: () => `${API_CONFIG.API_COOPERATIVA}/api/asambleas-futuras`,
        asambleasPasadas: () => `${API_CONFIG.API_COOPERATIVA}/api/asambleas-pasadas`
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, API_URLS };
}