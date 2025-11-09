      document.addEventListener('DOMContentLoaded', function() {
        setDefaultYearMonthDay();
      });

      // Set default year and month
      function setDefaultYearMonthDay() {
        const now = new Date();
        document.getElementById('anio').value = now.getFullYear();
        document.getElementById('mes').value = (now.getMonth() + 1).toString();
        document.getElementById('dia').value = now.getDate();
      }
      
      function goToHorasMensuales() {
        window.location.href = 'HorasMensuales.html';
      }
      
      function showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.classList.add('show');
      }

      // Show message helper
      function showMessage(message, type = 'info') {
        let msg = document.getElementById('msg-estado');
        if (!msg) {
          msg = document.createElement('div');
          msg.id = 'msg-estado';
          msg.style.marginTop = '1rem';
          msg.style.padding = '1rem';
          msg.style.borderRadius = '12px';
          msg.style.textAlign = 'center';
          msg.style.fontWeight = '600';
          msg.style.fontSize = '0.95rem';
          document.querySelector('.step-content').appendChild(msg);
        }
        msg.textContent = message;
        msg.className = '';
        
        if (type === 'success') {
          msg.style.background = 'rgba(16, 185, 129, 0.1)';
          msg.style.border = '1px solid #10b981';
          msg.style.color = '#10b981';
        } else if (type === 'error') {
          msg.style.background = 'rgba(239, 68, 68, 0.1)';
          msg.style.border = '1px solid #ef4444';
          msg.style.color = '#ef4444';
        } else {
          msg.style.background = 'rgba(59, 130, 246, 0.1)';
          msg.style.border = '1px solid #3b82f6';
          msg.style.color = '#3b82f6';
        }
      }

      document.getElementById('addJustificacionForm').onsubmit = async function(e) {
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
          
          const response = await fetch(API_URLS.cooperativa.horasJustificacion(), {
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
            let errorMsg = 'Error al registrar justificación';
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