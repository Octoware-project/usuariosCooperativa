$(function() {
  // Obtener token de autenticación como en comprobantes.js
  const token = localStorage.getItem('access_token');
  const tbody = $('.facturas-table tbody');
  if (!token) {
    tbody.empty();
    tbody.append('<tr><td colspan="4" style="text-align:center;">No autenticado. Inicie sesión.</td></tr>');
    return;
  }

  $.ajax({
    url: 'http://localhost:8001/api/horas/usuario',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    success: function(data) {
      tbody.empty();
      // data.horas es el array de registros
        if (data && Array.isArray(data.horas) && data.horas.length > 0) {
          data.horas.forEach(function(hora) {
            const fecha = `${hora.dia.toString().padStart(2, '0')}/${hora.mes.toString().padStart(2, '0')}/${hora.anio}`;
            const horas = hora.Cantidad_Horas !== null ? hora.Cantidad_Horas : '-';
            const row = $('<tr>');
            row.append($('<td>').text(fecha));
            row.append($('<td>').text(horas));
            row.append($('<td>').html('<button class="btn-cancelar" data-id="'+hora.id+'">Cancelar</button>'));
            tbody.append(row);
          });
      } else {
          tbody.append('<tr><td colspan="3" style="text-align:center;">No hay horas registradas.</td></tr>');
      }
    },
    error: function(xhr) {
      tbody.empty();
  tbody.append('<tr><td colspan="3" style="text-align:center;">Error al cargar las horas.</td></tr>');
    }
  });

  // Manejar el click en Cancelar
  $(document).on('click', '.btn-cancelar', function() {
    const id = $(this).data('id');
    if (confirm('¿Seguro que deseas cancelar estas horas?')) {
      $.ajax({
        url: 'http://localhost:8001/api/horas/' + id,
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        success: function() {
          location.reload();
        },
        error: function() {
          alert('No se pudo cancelar las horas.');
        }
      });
    }
  });
});
