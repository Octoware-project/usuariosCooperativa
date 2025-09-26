$(function() {
  // Obtener token de autenticación como en comprobantes.js
  const token = localStorage.getItem('access_token');
  const tbody = $('.facturas-table tbody');
  
  console.log('Token:', token ? 'Presente' : 'No encontrado');
  
  if (!token) {
    tbody.empty();
    tbody.append('<tr><td colspan="4" style="text-align:center;">No autenticado. Inicie sesión.</td></tr>');
    return;
  }

  
  $.ajax({
    url: API_URLS.cooperativa.horas(),
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    success: function(data) {
      console.log('Respuesta exitosa:', data);
      tbody.empty();
      // data.horas es el array de registros
        if (data && Array.isArray(data.horas) && data.horas.length > 0) {
          data.horas.forEach(function(hora) {
            const fecha = `${hora.dia.toString().padStart(2, '0')}/${hora.mes.toString().padStart(2, '0')}/${hora.anio}`;
            const horasReales = hora.Cantidad_Horas !== null ? parseFloat(hora.Cantidad_Horas) : 0;
            const esJustificacion = hora.Monto_Compensario && hora.Monto_Compensario > 0;
            
            // Verificar si puede cancelar (menos de 1 día desde created_at)
            let puedeCancelar = false;
            if (hora.created_at) {
              const date = new Date(hora.created_at);
              const ahora = new Date();
              const diffMs = ahora - date;
              const diffDias = diffMs / (1000 * 60 * 60 * 24);
              puedeCancelar = diffDias <= 1;
            }
            
            let horasTexto = '';
            let claseRow = '';
            
            if (horasReales > 0 && esJustificacion) {
              // Tiene horas reales Y justificación (registro mixto)
              const horasJustificadas = hora.horas_equivalentes_calculadas ? 
                parseFloat(hora.horas_equivalentes_calculadas) : 
                (hora.Monto_Compensario / (hora.valor_hora_al_momento || 1000));
              horasTexto = `${horasReales}h + ${horasJustificadas.toFixed(1)}h justif.`;
              claseRow = 'horas-mixtas-row';
            } else if (horasReales > 0) {
              // Solo horas reales
              horasTexto = `${horasReales}h`;
              claseRow = 'horas-reales-row';
            } else if (esJustificacion) {
              // Solo justificación
              const horasJustificadas = hora.horas_equivalentes_calculadas ? 
                parseFloat(hora.horas_equivalentes_calculadas) : 
                (hora.Monto_Compensario / (hora.valor_hora_al_momento || 1000));
              horasTexto = `${horasJustificadas.toFixed(1)}h justif.`;
              claseRow = 'justificacion-row';
            } else {
              horasTexto = '-';
              claseRow = '';
            }
            
            // Crear botón de cancelar (habilitado o deshabilitado)
            let botonCancelar = puedeCancelar
              ? `<button class="btn-cancelar" data-id="${hora.id}">Cancelar</button>`
              : `<button class="btn-cancelar" data-id="${hora.id}" disabled style="opacity:0.5;cursor:not-allowed;">Cancelar</button>`;
            
            const row = $('<tr>');
            
            // Aplicar clase CSS según el tipo de registro
            if (claseRow) {
              row.addClass(claseRow);
            }
            
            row.append($('<td>').text(fecha));
            row.append($('<td>').html(horasTexto));
            row.append($('<td>').html(botonCancelar));
            tbody.append(row);
          });
      } else {
          tbody.append('<tr><td colspan="3" style="text-align:center;">No hay horas registradas.</td></tr>');
      }
    },
    error: function(xhr) {
      console.log('Error en la petición:');
      console.log('Status:', xhr.status);
      console.log('Status Text:', xhr.statusText);
      console.log('Response Text:', xhr.responseText);
      
      tbody.empty();
      tbody.append('<tr><td colspan="3" style="text-align:center;">Error al cargar las horas. Código: ' + xhr.status + '</td></tr>');
    }
  });

  // Manejar el click en Cancelar (solo para botones habilitados)
  $(document).on('click', '.btn-cancelar:not([disabled])', function() {
    const id = $(this).data('id');
    if (confirm('¿Seguro que deseas cancelar estas horas?')) {
      $.ajax({
        url: API_URLS.cooperativa.horasById(id),
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
