
      
      // Back button function
      function goBack() {
        window.location.href = 'HorasMensuales.html';
      }
      
      function goToHorasMensuales() {
        window.location.href = 'HorasMensuales.html';
      }
      
      function showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.add('show');
      }
      
      // Set default year and month
      (function setDefaultYearMonthDay() {
        const now = new Date();
        document.getElementById('anio').value = now.getFullYear();
        document.getElementById('mes').value = (now.getMonth() + 1).toString();
        document.getElementById('dia').value = now.getDate();
      })();

      // Show message helper
      function showMessage(message, type = 'info') {
        let msg = document.getElementById('msg-estado');
        if (!msg) {
          msg = document.createElement('div');
          msg.id = 'msg-estado';
          document.querySelector('.step-content').appendChild(msg);
        }
        msg.textContent = message;
        msg.className = type;
      }

      document.getElementById('addHoursForm').onsubmit = async function(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        showMessage('Enviando...', 'info');
        
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            showMessage('No autenticado. Por favor, inicie sesión.', 'error');
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            return;
          }
          
          // Convertir FormData a objeto para JSON
          const data = {};
          formData.forEach((value, key) => { data[key] = value; });
          
          const response = await fetch(API_URLS.cooperativa.horas(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            showSuccessModal();
          } else {
            let errorMsg = 'Error al registrar horas';
            try {
              const text = await response.text();
              const data = JSON.parse(text);
              if (data && data.error) errorMsg += ': ' + data.error;
              else errorMsg += ': ' + text;
            } catch {
              // Si no es JSON
            }
            showMessage(errorMsg, 'error');
          }
        } catch (err) {
          showMessage('Error de conexión con el servidor', 'error');
        }
      };

      document.getElementById('btnJustificacion').onclick = function() {
        window.location.href = 'AgregarJustificacion.html';
      };