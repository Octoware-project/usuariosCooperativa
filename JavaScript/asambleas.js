/**
 * Asambleas.js - Gestión de asambleas de la cooperativa
 * Maneja la carga y visualización de asambleas desde la API
 */

let asambleasData = [];
let currentFilter = 'todas';

/**
 * Inicializar la funcionalidad de asambleas
 */
function initAsambleas() {
    console.log('Inicializando módulo de asambleas...');
    
    // Verificar autenticación
    const token = localStorage.getItem('access_token');
    if (!token) {
        showError('No autenticado. Por favor, inicie sesión.');
        return;
    }

    // Configurar event listeners
    setupEventListeners();
    
    // Cargar asambleas
    loadAsambleas();
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Filtros de pestañas
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Actualizar pestañas activas
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Obtener filtro seleccionado
            currentFilter = this.getAttribute('data-filter');
            
            // Aplicar filtro
            filterAsambleas(currentFilter);
        });
    });
}

/**
 * Cargar asambleas desde la API
 */
async function loadAsambleas() {
    showLoading();
    
    try {
        const token = localStorage.getItem('access_token');
        
        const response = await fetch(API_URLS.cooperativa.asambleas(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            asambleasData = data.data || [];
            filterAsambleas(currentFilter);
            console.log('Asambleas cargadas exitosamente:', asambleasData.length);
        } else {
            throw new Error(data.message || 'Error al obtener asambleas');
        }

    } catch (error) {
        console.error('Error al cargar asambleas:', error);
        showError('Error al cargar las asambleas: ' + error.message);
    }
}

/**
 * Mostrar alerta de función en desarrollo
 */
function mostrarResolucion(asambleaId) {
    alert('Función en Desarrollo');
}

/**
 * Filtrar asambleas según el tipo seleccionado
 */
function filterAsambleas(filter) {
    let filteredData = [];

    switch (filter) {
        case 'futuras':
            filteredData = asambleasData.filter(a => a.es_futura);
            break;
        case 'pasadas':
            filteredData = asambleasData.filter(a => !a.es_futura);
            break;
        case 'todas':
        default:
            filteredData = asambleasData;
            break;
    }

    renderAsambleas(filteredData);
}

/**
 * Renderizar asambleas en el grid
 */
function renderAsambleas(asambleas) {
    hideLoading();
    
    const grid = document.getElementById('asambleas-grid');
    const emptyState = document.getElementById('empty-state');

    if (!asambleas || asambleas.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    grid.style.display = 'grid';
    
    grid.innerHTML = asambleas.map(asamblea => createAsambleaCard(asamblea)).join('');
}

/**
 * Crear tarjeta de asamblea
 */
function createAsambleaCard(asamblea) {
    const fechaClass = asamblea.es_futura ? 'futura' : 'pasada';
    const fechaText = asamblea.es_futura ? 'PRÓXIMA' : 'REALIZADA';
    const iconClass = asamblea.es_futura ? 'bi-calendar-plus' : 'bi-calendar-check';

    return `
        <div class="asamblea-card" data-id="${asamblea.id}">
            <div class="asamblea-header">
                <div class="asamblea-icon">
                    <i class="bi ${iconClass}"></i>
                </div>
                <div class="fecha-badge ${fechaClass}">
                    <i class="bi ${iconClass}"></i>${fechaText}
                </div>
            </div>
            
            <div class="asamblea-body">
                <div class="lugar-title">
                    <i class="bi bi-geo-alt"></i>${escapeHtml(asamblea.lugar)}
                </div>
                
                <div class="fecha-info">
                    <i class="bi bi-calendar-event"></i>${asamblea.fecha}
                </div>
                
                ${asamblea.detalle ? `
                    <div class="detalle-text">
                        <i class="bi bi-info-circle"></i>
                        ${escapeHtml(asamblea.detalle)}
                    </div>
                ` : `
                    <div class="detalle-text text-muted">
                        <i class="bi bi-info-circle"></i>
                        Sin detalles adicionales
                    </div>
                `}
            </div>
            
            <div class="asamblea-footer">
                <small class="text-muted">
                    <i class="bi bi-clock me-1"></i>
                    Registrada: ${formatDateTime(asamblea.created_at)}
                </small>
                ${asamblea.es_futura ? `
                    <span class="fecha-badge futura">
                        <i class="bi bi-calendar-plus"></i>Próxima
                    </span>
                ` : `
                    <button class="btn-resolucion" onclick="mostrarResolucion(${asamblea.id})">
                        <i class="bi bi-file-earmark-text"></i>Ver resolución
                    </button>
                `}
            </div>
        </div>
    `;
}

/**
 * Mostrar estado de carga
 */
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('asambleas-grid').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
}

/**
 * Ocultar estado de carga
 */
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

/**
 * Mostrar mensaje de error
 */
function showError(message) {
    hideLoading();
    
    const grid = document.getElementById('asambleas-grid');
    const emptyState = document.getElementById('empty-state');
    
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.innerHTML = `
        <i class="bi bi-exclamation-triangle text-danger" style="font-size: 4rem; margin-bottom: 20px;"></i>
        <h3>Error al cargar asambleas</h3>
        <p>${escapeHtml(message)}</p>
        <button class="btn btn-primary" onclick="loadAsambleas()">
            <i class="bi bi-arrow-clockwise me-2"></i>Reintentar
        </button>
    `;
}

/**
 * Formatear fecha y hora
 */
function formatDateTime(dateString) {
    if (!dateString) return 'Sin fecha';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Fecha inválida';
    }
}

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Función para refrescar los datos
 */
function refreshAsambleas() {
    loadAsambleas();
}

// Exponer funciones globalmente si es necesario
window.initAsambleas = initAsambleas;
window.refreshAsambleas = refreshAsambleas;
window.mostrarResolucion = mostrarResolucion;