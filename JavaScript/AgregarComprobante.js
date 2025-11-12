// ============================================
// MODERN STEP FORM JAVASCRIPT
// ============================================

let currentStep = 1;
const totalSteps = 4;

// Initialize form on page load
document.addEventListener('DOMContentLoaded', function() {
  setDefaultMonthYear();
  initFileUpload();
  initRequiredFields();
  initPeriodSelectors();
  initCustomMonthSelector();
  updateStepDisplay();
  
  // Form submission handler
  document.getElementById('addComprobanteForm').addEventListener('submit', handleFormSubmit);
});

// Initialize required field management - remove all required attributes
function initRequiredFields() {
  // Simply remove all required attributes to prevent validation conflicts
  document.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
    input.removeAttribute('required');
  });
}

// Set default month and year
function setDefaultMonthYear() {
  const meses = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const now = new Date();
  const mes = now.getMonth() + 1;
  const anio = now.getFullYear();
  
  const mesSelect = document.getElementById('Mes');
  const anioInput = document.getElementById('Anio');
  
  if (mesSelect && meses[mes]) {
    mesSelect.value = meses[mes];
  }
  if (anioInput) {
    anioInput.value = anio;
  }
  
  // Update visual display
  updatePeriodDisplay();
}

// Initialize simple selectors - no custom functionality needed
function initCustomMonthSelector() {
  // Simple initialization - the native select will work by itself
}

// ============================================
// PERIOD SELECTOR INTERACTIVITY
// ============================================

function initPeriodSelectors() {
  const mesSelect = document.getElementById('Mes');
  const anioInput = document.getElementById('Anio');
  const yearBtns = document.querySelectorAll('.year-btn');

  // Month selector change
  mesSelect.addEventListener('change', function() {
    updatePeriodDisplay();
    addSelectionAnimation(this.closest('.selector-card'));
  });

  // Year input change
  anioInput.addEventListener('input', function() {
    updatePeriodDisplay();
    updateYearButtons();
    addSelectionAnimation(this.closest('.selector-card'));
  });

  // Year buttons click
  yearBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const year = this.dataset.year;
      anioInput.value = year;
      updatePeriodDisplay();
      updateYearButtons();
      addSelectionAnimation(anioInput.closest('.selector-card'));
    });
  });

  // Initial setup
  updateYearButtons();
}

function updatePeriodDisplay() {
  const mesSelect = document.getElementById('Mes');
  const anioInput = document.getElementById('Anio');
  const monthDisplay = document.getElementById('selectedMonthDisplay');
  const yearDisplay = document.getElementById('selectedYearDisplay');

  // Update month display
  if (mesSelect.value) {
    const selectedOption = mesSelect.options[mesSelect.selectedIndex];
    const monthNumber = selectedOption.dataset.number || '--';
    monthDisplay.querySelector('.month-name').textContent = mesSelect.value;
    monthDisplay.querySelector('.month-number').textContent = monthNumber;
    monthDisplay.style.transform = 'scale(1.05)';
    setTimeout(() => monthDisplay.style.transform = '', 200);
  } else {
    monthDisplay.querySelector('.month-name').textContent = 'Selecciona';
    monthDisplay.querySelector('.month-number').textContent = '--';
  }

  // Update year display
  if (anioInput.value) {
    yearDisplay.querySelector('.year-label').textContent = 'Año';
    yearDisplay.querySelector('.year-number').textContent = anioInput.value;
    yearDisplay.style.transform = 'scale(1.05)';
    setTimeout(() => yearDisplay.style.transform = '', 200);
  } else {
    yearDisplay.querySelector('.year-label').textContent = 'Año';
    yearDisplay.querySelector('.year-number').textContent = '----';
  }
}

function updateYearButtons() {
  const anioInput = document.getElementById('Anio');
  const yearBtns = document.querySelectorAll('.year-btn');
  
  yearBtns.forEach(btn => {
    if (btn.dataset.year === anioInput.value) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function addSelectionAnimation(card) {
  card.style.transform = 'translateY(-8px) scale(1.02)';
  card.style.boxShadow = '0 16px 40px rgba(236, 72, 153, 0.2)';
  
  setTimeout(() => {
    card.style.transform = '';
    card.style.boxShadow = '';
  }, 300);
}

// Step navigation functions
function changeStep(direction) {
  if (direction === 1 && !validateCurrentStep()) {
    return;
  }
  
  const newStep = currentStep + direction;
  
  if (newStep >= 1 && newStep <= totalSteps) {
    // Hide current step
    document.querySelector(`[data-step="${currentStep}"].form-step`)?.classList.remove('active');
    
    // Show new step
    currentStep = newStep;
    document.querySelector(`[data-step="${currentStep}"].form-step`)?.classList.add('active');
    
    // Update confirmation data if going to step 4
    if (newStep === 4) {
      updateConfirmationData();
    }
    
    // Update stepper display
    updateStepDisplay();
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Add step animation
    animateStepTransition();
  }
}

function validateCurrentStep() {
  switch (currentStep) {
    case 1:
      const mes = document.getElementById('Mes').value;
      const anio = document.getElementById('Anio').value;
      if (!mes || !anio) {
        showNotification('Por favor completa el período del pago', 'error');
        return false;
      }
      break;
      
    case 2:
      const monto = document.getElementById('Monto').value;
      const tipoPago = document.querySelector('input[name="tipo_pago"]:checked');
      const motivo = document.getElementById('motivo').value.trim();
      if (!monto || !tipoPago) {
        showNotification('Por favor completa el monto y método de pago', 'error');
        return false;
      }
      if (parseFloat(monto) <= 0) {
        showNotification('El monto debe ser mayor a cero', 'error');
        return false;
      }
      if (!motivo || motivo.length < 5) {
        showNotification('El motivo del pago es obligatorio (mínimo 5 caracteres)', 'error');
        return false;
      }
      break;
      
    case 3:
      const archivo = document.getElementById('Archivo_Comprobante').files[0];
      if (!archivo) {
        showNotification('Por favor selecciona un archivo', 'error');
        return false;
      }
      // Validate file size and type
      if (archivo.size > 5 * 1024 * 1024) {
        showNotification('El archivo es demasiado grande. Máximo 5MB.', 'error');
        return false;
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(archivo.type)) {
        showNotification('Tipo de archivo no permitido. Solo JPG, PNG y PDF.', 'error');
        return false;
      }
      break;
      
    case 4:
      const termsAccept = document.getElementById('termsAccept');
      if (!termsAccept.checked) {
        showNotification('Debes aceptar los términos para continuar', 'error');
        return false;
      }
      break;
  }
  return true;
}

function validateAllSteps() {
  // Validate step 1
  const mes = document.getElementById('Mes').value;
  const anio = document.getElementById('Anio').value;
  if (!mes || !anio) {
    showNotification('Por favor completa el período del pago (Paso 1)', 'error');
    return false;
  }
  
  // Validate step 2
  const monto = document.getElementById('Monto').value;
  const tipoPago = document.querySelector('input[name="tipo_pago"]:checked');
  const motivo = document.getElementById('motivo').value.trim();
  if (!monto || !tipoPago || parseFloat(monto) <= 0) {
    showNotification('Por favor completa los detalles del pago (Paso 2)', 'error');
    return false;
  }
  if (!motivo || motivo.length < 5) {
    showNotification('El motivo del pago es obligatorio (mínimo 5 caracteres)', 'error');
    return false;
  }
  
  // Validate step 3
  const archivo = document.getElementById('Archivo_Comprobante').files[0];
  if (!archivo) {
    showNotification('Por favor selecciona un archivo (Paso 3)', 'error');
    return false;
  }
  
  // Validate step 4
  const termsAccept = document.getElementById('termsAccept');
  if (!termsAccept.checked) {
    showNotification('Debes aceptar los términos para continuar', 'error');
    return false;
  }
  
  return true;
}

function updateStepDisplay() {
  // Update stepper
  document.querySelectorAll('.step').forEach((step, index) => {
    const stepNum = index + 1;
    const stepElement = step;
    
    if (stepNum < currentStep) {
      stepElement.classList.add('completed');
      stepElement.classList.remove('active');
    } else if (stepNum === currentStep) {
      stepElement.classList.add('active');
      stepElement.classList.remove('completed');
    } else {
      stepElement.classList.remove('active', 'completed');
    }
  });
  
  // Update step lines
  document.querySelectorAll('.step-line').forEach((line, index) => {
    if (index + 1 < currentStep) {
      line.classList.add('completed');
    } else {
      line.classList.remove('completed');
    }
  });
  
  // Update form steps display
  document.querySelectorAll('.form-step').forEach((step, index) => {
    const stepNum = index + 1;
    if (stepNum === currentStep) {
      step.classList.add('active');
    } else {
      step.classList.remove('active');
    }
  });
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  
  // Previous button
  if (currentStep === 1) {
    prevBtn.style.display = 'none';
  } else {
    prevBtn.style.display = 'flex';
  }
  
  // Next/Submit buttons
  if (currentStep === totalSteps) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'flex';
  } else {
    nextBtn.style.display = 'flex';
    submitBtn.style.display = 'none';
  }
}

function animateStepTransition() {
  const activeStep = document.querySelector('.form-step.active');
  if (activeStep) {
    activeStep.style.opacity = '0';
    activeStep.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      activeStep.style.opacity = '1';
      activeStep.style.transform = 'translateX(0)';
    }, 50);
  }
}

function updateConfirmationData() {
  const mes = document.getElementById('Mes').value;
  const anio = document.getElementById('Anio').value;
  const monto = document.getElementById('Monto').value;
  const tipoPago = document.querySelector('input[name="tipo_pago"]:checked');
  const archivo = document.getElementById('Archivo_Comprobante').files[0];
  const motivo = document.getElementById('motivo').value;
  
  document.getElementById('confirmPeriod').textContent = `${mes} ${anio}`;
  document.getElementById('confirmAmount').textContent = `$${parseFloat(monto).toLocaleString('es-ES')}`;
  document.getElementById('confirmMethod').textContent = tipoPago ? tipoPago.value : '-';
  document.getElementById('confirmFile').textContent = archivo ? archivo.name : '-';
  document.getElementById('confirmMotivo').textContent = motivo || 'Sin especificar';
}

// File upload functionality
function initFileUpload() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('Archivo_Comprobante');
  
  // Click to upload
  uploadArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  });
  
  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  });
}

function handleFileSelect(file) {
  // Validate file
  if (!validateFile(file)) {
    return;
  }
  
  // Update file input
  const fileInput = document.getElementById('Archivo_Comprobante');
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  fileInput.files = dataTransfer.files;
  
  // Show preview
  showFilePreview(file);
  
  // Simulate upload progress
  simulateUploadProgress();
}

function validateFile(file) {
  // Size validation (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('El archivo es demasiado grande. Máximo 5MB.', 'error');
    return false;
  }
  
  // Type validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    showNotification('Tipo de archivo no permitido. Solo JPG, PNG y PDF.', 'error');
    return false;
  }
  
  return true;
}

function showFilePreview(file) {
  const uploadContent = document.getElementById('uploadContent');
  const filePreview = document.getElementById('filePreview');
  
  // Update file info
  filePreview.querySelector('.file-name').textContent = file.name;
  filePreview.querySelector('.file-size').textContent = formatFileSize(file.size);
  
  // Show preview, hide upload content
  uploadContent.style.display = 'none';
  filePreview.style.display = 'block';
}

function removeFile() {
  const fileInput = document.getElementById('Archivo_Comprobante');
  const uploadContent = document.getElementById('uploadContent');
  const filePreview = document.getElementById('filePreview');
  
  // Clear file input
  fileInput.value = '';
  
  // Show upload content, hide preview
  uploadContent.style.display = 'flex';
  filePreview.style.display = 'none';
  
  // Reset progress bar
  document.getElementById('progressBar').style.width = '0%';
}

function simulateUploadProgress() {
  const progressBar = document.getElementById('progressBar');
  let progress = 0;
  
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
    }
    progressBar.style.width = progress + '%';
  }, 200);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility functions
function goBack() {
  window.history.back();
}

function goToComprobantes() {
  window.location.href = 'Comprobantes.html';
}

function showSuccessModal() {
  const modal = document.getElementById('successModal');
  modal.classList.add('show');
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    ${type === 'error' ? 'background: #ef4444;' : 
      type === 'success' ? 'background: #10b981;' : 
      'background: #3b82f6;'}
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after delay
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 4000);
}

// Form submission handler (replaces old onsubmit)
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Ensure we're on the final step
  if (currentStep !== 4) {
    showNotification('Por favor completa todos los pasos', 'error');
    return;
  }
  
  // Final validation of all steps
  if (!validateAllSteps()) {
    return;
  }
  
  const formElement = e.target;
  
  // Show loading state
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i> Guardando...';
  submitBtn.disabled = true;
  
  // Prepare form data
  const formData = new FormData(formElement);
  
  // Note: API expects Mes and Anio separately, not fecha_pago
  // The server will construct the date from Mes and Anio fields

  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      showNotification('No autenticado. Por favor, inicie sesión.', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      return;
    }
    
    const response = await fetch(API_URLS.cooperativa.facturas(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      showSuccessModal();
    } else {
      let errorMsg = 'Error al guardar el comprobante';
      try {
        const data = await response.json();
        
        // Handle Laravel validation errors
        if (data && data.errores) {
          // Laravel validation errors under 'errores' key
          const errors = Object.entries(data.errores).map(([field, messages]) => {
            return `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
          });
          errorMsg = errors.join('\n');
        } else if (data && data.errors) {
          const errors = Object.values(data.errors).flat();
          errorMsg = errors.join(', ');
        } else if (data && data.mensaje) {
          errorMsg = data.mensaje;
        } else if (data && data.message) {
          errorMsg = data.message;
        } else if (data && data.error) {
          errorMsg = data.error;
        }
      } catch (parseError) {
        // If response is not JSON
        errorMsg = `Error ${response.status}: ${response.statusText}`;
      }
      showNotification(errorMsg, 'error');
    }
  } catch (err) {
    showNotification('Error de conexión con el servidor: ' + err.message, 'error');
  } finally {
    // Restore button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// CSS for spinning animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(style);
