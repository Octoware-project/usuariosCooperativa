const API_CONFIG = {
    API_USUARIOS: 'http://127.0.0.1:8000',    
    API_COOPERATIVA: 'http://127.0.0.1:8001',
    OAUTH_CLIENT_ID: '1',
    OAUTH_CLIENT_SECRET: 'XFotbSneZol6xkANuLQ0zjlOevverYv6sPQgID4g'
};

const API_URLS = {
    usuarios: {
        validate: () => `${API_CONFIG.API_USUARIOS}/api/validate`,
        login: () => `${API_CONFIG.API_USUARIOS}/api/login`,
        register: () => `${API_CONFIG.API_USUARIOS}/api/register`,
        token: () => `${API_CONFIG.API_USUARIOS}/oauth/token`
    },
    
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
        completarDatos: () => `${API_CONFIG.API_COOPERATIVA}/api/completar-datos`,
        editarDatos: () => `${API_CONFIG.API_COOPERATIVA}/api/editar-datos-persona`,
        datosUsuario: () => `${API_CONFIG.API_COOPERATIVA}/api/datos-usuario`,
        cambiarContrasena: () => `${API_CONFIG.API_COOPERATIVA}/api/cambiar-contrasena`,
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