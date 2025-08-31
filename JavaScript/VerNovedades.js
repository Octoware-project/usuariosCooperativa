  
    // Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    document.getElementById('tituloNovedad').textContent = params.get('titulo') || 'Novedad';
    document.getElementById('fechaNovedad').textContent = params.get('fecha') || '';
    document.getElementById('subtituloNovedad').textContent = params.get('subtitulo') || '';
