document.addEventListener('DOMContentLoaded', async function() {
  const token = localStorage.getItem('access_token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  const form = document.getElementById('editDatosForm');
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');

  try {
    const res = await fetch(API_URLS.cooperativa.datosUsuario(), {
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
    
    const fechaNacimiento = persona.fechaNacimiento || '';
    if (fechaNacimiento) {
      const datePart = fechaNacimiento.split('T')[0];
      document.getElementById('fechaNacimiento').value = datePart;
    }
    
    document.getElementById('ocupacion').value = persona.ocupacion || '';
    document.getElementById('nacionalidad').value = persona.nacionalidad || '';
  } catch (err) {
    errorDiv.textContent = err.message;
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
    successDiv.textContent = '';
    successDiv.style.display = 'none';
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="display:inline-block;width:18px;height:18px;border:3px solid #fff;border-top:3px solid #d81b60;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;margin-right:8px;"></span>Guardando...';

    const formData = new FormData(form);
    const body = {};
    formData.forEach((v, k) => body[k] = v);
    try {
      const res = await fetch(API_URLS.cooperativa.editarDatos(), {
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
        errorDiv.style.display = 'block';
        successDiv.textContent = '';
        successDiv.style.display = 'none';
        return;
      }
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
      successDiv.textContent = data.message || 'Datos actualizados correctamente.';
      successDiv.style.display = 'block';
      
      localStorage.removeItem('user_cache');
      
      setTimeout(() => {
        window.location.href = 'PerfilUsuario.html?refresh=' + Date.now();
      }, 1500);
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  const style = document.createElement('style');
  style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`;
  document.head.appendChild(style);
});

    function toggleMenu() {
      const sidebar = document.getElementById('sidebarMenu');
      const overlay = document.getElementById('menuOverlay');
      const userDropdown = document.getElementById('userDropdownMobile');
      
      // Close user dropdown if open
      if (userDropdown) userDropdown.classList.remove('show');
      
      if (sidebar) sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active');
    }
    
    function closeMenu() {
      const sidebar = document.getElementById('sidebarMenu');
      const overlay = document.getElementById('menuOverlay');
      
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
    }
    
    function toggleUserDropdown() {
      const dropdown = document.getElementById('userDropdownMobile');
      const sidebar = document.getElementById('sidebarMenu');
      const overlay = document.getElementById('menuOverlay');
      
      // Close sidebar if open
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
      
      if (dropdown) dropdown.classList.toggle('show');
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
      const userIcon = document.getElementById('userIconMobile');
      const userDropdown = document.getElementById('userDropdownMobile');
      const menuBtn = document.querySelector('.menu-btn');
      
      if (userIcon && userDropdown && !userIcon.contains(event.target) && !userDropdown.contains(event.target)) {
        userDropdown.classList.remove('show');
      }
    });
    
    // Initialize user icon with first letter of name
    function initUserIcon() {
      const userIcon = document.getElementById('userIconMobile');
      const token = localStorage.getItem('access_token');
      
      if (token && userIcon) {
        // Try to get user data from token or make API call
        userIcon.textContent = 'U'; // Default, can be updated when user data loads
      }
    }
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initUserIcon);
    
    // Logout function
    function logout() {
      localStorage.removeItem('access_token');
      window.location.href = 'index.html';
    }
    
    // Load navbar dynamically
    document.addEventListener('DOMContentLoaded', function() {
      loadNavbar();
    });