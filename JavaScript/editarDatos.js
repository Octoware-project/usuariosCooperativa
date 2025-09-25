// editarDatos.js
// Cargar datos actuales y enviar cambios al backend (solo campos editables)

document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('access_token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  const form = document.getElementById('editDatosForm');
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');

  // Cargar datos actuales
  try {
    const res = await fetch(API_URLS.usuarios.validate(), {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) throw new Error('No se pudieron cargar los datos');
    const data = await res.json();
    const persona = data.persona || {};
    document.getElementById('telefono').value = persona.telefono || '';
    document.getElementById('direccion').value = persona.direccion || '';
    document.getElementById('estadoCivil').value = persona.estadoCivil || '';
    document.getElementById('genero').value = persona.genero || '';
    document.getElementById('fechaNacimiento').value = persona.fechaNacimiento || '';
    document.getElementById('ocupacion').value = persona.ocupacion || '';
    document.getElementById('nacionalidad').value = persona.nacionalidad || '';
  } catch (err) {
    errorDiv.textContent = err.message;
  }

  // Enviar cambios
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    errorDiv.textContent = '';
    successDiv.textContent = '';
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    // Animación de carga
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="display:inline-block;width:18px;height:18px;border:3px solid #fff;border-top:3px solid #d81b60;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;margin-right:8px;"></span>Guardando...';

    const formData = new FormData(form);
    const body = {};
    formData.forEach((v, k) => body[k] = v);
    try {
      const res = await fetch(API_URLS.usuarios.editarDatos(), {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          errorDiv.textContent = Object.values(data.errors).join(' ');
        } else {
          errorDiv.textContent = data.message || 'Error al actualizar.';
        }
        successDiv.textContent = '';
        return;
      }
      // Mostrar el mensaje de la API debajo del botón en negrita
      errorDiv.textContent = '';
      successDiv.textContent = data.message || 'Datos actualizados correctamente.';
      // Redirigir al dashboard tras 1.5s
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } catch (err) {
      errorDiv.textContent = err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  // Spinner CSS
  const style = document.createElement('style');
  style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`;
  document.head.appendChild(style);
});
