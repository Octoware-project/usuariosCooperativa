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
    url: `http://localhost:8001/api/facturas/${id}`,
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
        $('#factura-imagen').html(`<img src="${f.imagen_comprobante}" alt="Comprobante" style="max-width:100%;border-radius:12px;box-shadow:0 2px 12px #ccc;">`);
      } else {
        $('#factura-imagen').html('<p>No hay imagen de comprobante.</p>');
      }
    },
    error: function() {
      $('#factura-detalle').html('<p>Error al cargar la factura.</p>');
    }
  });
});
