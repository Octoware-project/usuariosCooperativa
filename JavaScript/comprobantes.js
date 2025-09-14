$(document).ready(function() {
  let facturasGlobal = [];

  function renderFacturas(facturas) {
    if (!Array.isArray(facturas) || facturas.length === 0) {
      $("tbody").html('<tr><td colspan="5">No hay comprobantes.</td></tr>');
      return;
    }
    let filas = "";
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    facturas.forEach(function(factura) {
      let ingreso = "-";
      let mesPago = "-";
      let puedeCancelar = false;
      if (factura.created_at) {
        const date = new Date(factura.created_at);
        const ahora = new Date();
        const diffMs = ahora - date;
        const diffDias = diffMs / (1000 * 60 * 60 * 24);
        puedeCancelar = diffDias <= 1;
        ingreso = date.getDate().toString().padStart(2, '0') + "/" + (date.getMonth()+1).toString().padStart(2, '0') + "/" + date.getFullYear();
      }
      if (factura.fecha_pago) {
        // fecha_pago viene en formato YYYY-MM-DD, pero new Date() puede interpretarlo como UTC y restar un mes si la zona horaria es negativa
        // Extraer mes y año manualmente para evitar desfase
        const match = /^\d{4}-(\d{2})-\d{2}$/.exec(factura.fecha_pago);
        if (match) {
          const mesNum = parseInt(match[1], 10); // 1-12
          mesPago = meses[mesNum - 1] + " " + factura.fecha_pago.substring(0, 4);
        } else {
          // fallback por si viene en otro formato
          const datePago = new Date(factura.fecha_pago);
          if (!isNaN(datePago.getTime())) {
            mesPago = meses[datePago.getMonth()] + " " + datePago.getFullYear();
          }
        }
      }
      let botonCancelar = puedeCancelar
        ? `<button class='btn btn-cancelar' data-id='${factura.id}'>Cancelar</button>`
        : `<button class='btn btn-cancelar' data-id='${factura.id}' disabled style='opacity:0.5;cursor:not-allowed;'>Cancelar</button>`;
      filas += `
        <tr class="factura-row" data-id="${factura.id}">
          <td data-label="Ingreso">${ingreso}</td>
          <td data-label="Mes">${mesPago}</td>
          <td data-label="Tipo de Pago">${factura.tipo_pago ? factura.tipo_pago : "-"}</td>
          <td data-label="Monto">${factura.Monto !== undefined && factura.Monto !== null ? "$" + parseFloat(factura.Monto).toLocaleString("es-AR", {minimumFractionDigits:2}) : "-"}</td>
          <td data-label="Acción">${botonCancelar}</td>
        </tr>
      `;
    });
    $("tbody").html(filas);
  // Evento para cancelar
  $(".btn-cancelar").click(function() {
      const id = $(this).data("id");
      const token = localStorage.getItem("access_token");
      if (!confirm("¿Seguro que deseas cancelar esta factura?")) return;
      $.ajax({
        url: `http://localhost:8001/api/facturas/${id}`,
        type: "DELETE",
        headers: {
          "Authorization": "Bearer " + token,
          "Accept": "application/json"
        },
        success: function() {
          alert("Factura cancelada correctamente.");
          cargarFacturas();
        },
        error: function() {
          alert("No se pudo cancelar la factura.");
        }
      });
    });
    // Evento doble click para ver detalle
    $(".factura-row").on('dblclick', function() {
      const id = $(this).data('id');
      window.location.href = `FacturaDetalle.html?id=${id}`;
    });
  }

  function cargarFacturas() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      $("tbody").html('<tr><td colspan="4">No autenticado. Inicie sesión.</td></tr>');
      return;
    }
    $.ajax({
      url: "http://localhost:8001/api/facturas",
      type: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
      },
      success: function(data) {
        facturasGlobal = data.facturas || [];
        renderFacturas(facturasGlobal);
      },
      error: function(xhr) {
        $("tbody").html('<tr><td colspan="4">Error al cargar comprobantes.</td></tr>');
      }
    });
  }

  // Evento de filtro por mes y año
  function filtrarFacturas() {
    const mes = $('#filtro-mes').val();
    const anio = $('#filtro-anio').val();
    // Si ambos filtros están vacíos, mostrar todas
    if (!mes && !anio) {
  renderFacturas(facturasGlobal);
      return;
    }
    // Filtrado local por created_at
    let mesNum = mes ? parseInt(mes) : null;
    let anioNum = anio ? parseInt(anio) : null;
    let filtradas = facturasGlobal.filter(f => {
      if (!f.created_at) return false;
      const fecha = new Date(f.created_at);
      const mesFactura = fecha.getMonth() + 1;
      const anioFactura = fecha.getFullYear();
      if (mesNum && anioNum) {
        return mesFactura === mesNum && anioFactura === anioNum;
      } else if (mesNum) {
        return mesFactura === mesNum;
      } else if (anioNum) {
        return anioFactura === anioNum;
      }
      return true;
    });
    renderFacturas(filtradas);
  }

  $(document).on('change', '#filtro-mes, #filtro-anio', filtrarFacturas);

  cargarFacturas();
});
