    document.addEventListener('DOMContentLoaded', async function() {
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = 'index.html';
        return;
      }
      try {
        const res = await fetch(API_URLS.usuarios.validate(), {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        });
        if (!res.ok) throw new Error('No se pudo validar el token');
        const data = await res.json();
        const persona = Array.isArray(data.persona) ? data.persona[0] : data.persona;
        const user = Array.isArray(data.user) ? data.user[0] : data.user;
        document.getElementById('nombre').value = persona?.name || '';
        document.getElementById('apellido').value = persona?.apellido || '';
        document.getElementById('email').value = user?.email || '';
        document.getElementById('ci').value = persona?.CI || '';
      } catch (err) {
        window.location.href = 'index.html';
      }
    });

    document.getElementById('completarDatosForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = 'index.html';
        return;
      }
      // Validar que todos los campos estén completos
  const requiredFields = ['telefono','direccion','estadoCivil','genero','fechaNacimiento','ocupacion','nacionalidad'];
      let valid = true;
      for (const id of requiredFields) {
        const el = document.getElementById(id);
        if (!el || !el.value.trim()) {
          valid = false;
          el && (el.style.borderColor = '#de5f88');
        } else {
          el.style.borderColor = '#A3D8F4';
        }
      }
      if (!valid) {
        document.getElementById('mensaje').innerHTML = '<span style="color:red;">Debes completar todos los campos para activar tu cuenta.</span>';
        return;
      }
      const datos = {
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        estadoCivil: document.getElementById('estadoCivil').value,
        genero: document.getElementById('genero').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        ocupacion: document.getElementById('ocupacion').value,
        nacionalidad: document.getElementById('nacionalidad').value
      };
      try {
        const res = await fetch(API_URLS.cooperativa.completarDatos(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          },
          body: JSON.stringify(datos)
        });
        const data = await res.json();
        if (res.ok) {
          document.getElementById('mensaje').innerHTML = '<span style="color:green;">Datos completados correctamente. Tu cuenta será activada pronto.</span>';
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
        } else {
          let errorMsg = data.message || 'Error al guardar los datos.';
          if (data.errors) {
            errorMsg += '<ul>' + Object.values(data.errors).map(arr => `<li>${arr[0]}</li>`).join('') + '</ul>';
          }
          document.getElementById('mensaje').innerHTML = '<span style="color:red;">' + errorMsg + '</span>';
          }
      } catch (err) {
        document.getElementById('mensaje').innerHTML = '<span style="color:red;">Error de conexión.</span>';
        }
    });