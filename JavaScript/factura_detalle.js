$(document).ready(function() {
  // Obtener el id de la factura de la URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    $('#factura-detalle').html('<p>No se encontró la factura.</p>');
    return;
  }
  const token = localStorage.getItem('access_token');
  $.ajax({
    url: API_URLS.cooperativa.facturasById(id),
    type: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json'
    },
    success: function(data) {
      const f = data.factura || data;
  let html = '<ul>';
  // No mostrar ID
      if (f.created_at) {
        const fechaObj = new Date(f.created_at);
        const fechaStr = fechaObj.toLocaleDateString();
        const horaStr = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        html += `<li><span class="label">Fecha</span><span class="valor">${fechaStr}</span></li>`;
        html += `<li><span class="label">Hora</span><span class="valor">${horaStr}</span></li>`;
      }
      html += `<li><span class="label">Monto</span><span class="valor">$${parseFloat(f.Monto).toLocaleString('es-AR', {minimumFractionDigits:2})}</span></li>`;
  html += `<li><span class="label">Tipo de Pago</span><span class="valor">${f.tipo_pago || ''}</span></li>`;
  html += `<li><span class="label">Estado</span><span class="valor">${f.Estado_Pago || f.estado || ''}</span></li>`;
  // No mostrar email
  html += '</ul>';
  $('#factura-detalle').html(html);
      if (f.imagen_comprobante) {
        // Detectar tipo de archivo por extensión de la URL o del archivo original
        const extension = f.Archivo_Comprobante ? f.Archivo_Comprobante.split('.').pop().toLowerCase() : 'unknown';
        const token = localStorage.getItem('access_token');
        
        if (extension === 'pdf') {
          // Para PDFs, crear un objeto URL con headers de autorización
          $('#factura-imagen').html(`
            <div style="text-align:center;">
              <div id="pdf-container" style="width:100%;height:400px;border:1px solid #ddd;border-radius:8px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;">
                <p>Cargando PDF...</p>
              </div>
              <br><br>
              <button onclick="abrirPDFNuevaPestana('${f.imagen_comprobante}', '${token}')" 
                 style="background:#d81b60;color:white;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">
                 📄 Abrir PDF en nueva pestaña
              </button>
            </div>
          `);
          
          // Cargar PDF con autorización
          cargarPDFConAuth(f.imagen_comprobante, token);
          
        } else {
          // Para imágenes, crear un elemento img que incluya el token
          $('#factura-imagen').html(`
            <img id="comprobante-img" src="" 
                 alt="Comprobante" 
                 style="max-width:100%;max-height:500px;border-radius:12px;box-shadow:0 2px 12px #ccc;cursor:pointer;" 
                 onclick="abrirImagenNuevaPestana('${f.imagen_comprobante}', '${token}')" 
                 title="Click para ver en tamaño completo">
          `);
          
          // Cargar imagen con autorización
          cargarImagenConAuth(f.imagen_comprobante, token);
        }
      } else {
        $('#factura-imagen').html('<p style="color:#666;text-align:center;font-style:italic;">No hay comprobante disponible.</p>');
      }
    },
    error: function() {
      $('#factura-detalle').html('<p>Error al cargar la factura.</p>');
    }
  });
});

// Función para cargar PDF con autorización
function cargarPDFConAuth(url, token) {
  fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => response.blob())
  .then(blob => {
    const objectURL = URL.createObjectURL(blob);
    $('#pdf-container').html(`
      <iframe src="${objectURL}" 
              style="width:100%;height:400px;border:none;border-radius:8px;" 
              title="Comprobante PDF">
      </iframe>
    `);
  })
  .catch(error => {
    $('#pdf-container').html('<p style="color:red;">Error al cargar el PDF</p>');
  });
}

// Función para cargar imagen con autorización
function cargarImagenConAuth(url, token) {
  fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => response.blob())
  .then(blob => {
    const objectURL = URL.createObjectURL(blob);
    $('#comprobante-img').attr('src', objectURL);
  })
  .catch(error => {
    $('#comprobante-img').attr('src', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZHk9Ii4zZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9InJlZCI+RXJyb3IgYWwgY2FyZ2FyPC90ZXh0Pjwvc3ZnPg==');
  });
}

// Función para abrir PDF en nueva pestaña
function abrirPDFNuevaPestana(url, token) {
  fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => response.blob())
  .then(blob => {
    const objectURL = URL.createObjectURL(blob);
    window.open(objectURL, '_blank');
  })
  .catch(error => {
    alert('Error al abrir el PDF');
  });
}

// Función para abrir imagen en nueva pestaña
function abrirImagenNuevaPestana(url, token) {
  fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => response.blob())
  .then(blob => {
    const objectURL = URL.createObjectURL(blob);
    window.open(objectURL, '_blank');
  })
  .catch(error => {
    alert('Error al abrir la imagen');
  });
}
