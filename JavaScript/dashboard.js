
function redirectToLogin() {
  localStorage.removeItem('access_token');
  window.location.href = 'index.html';
}








// Los eventos del modal ya no son necesarios en el dashboard

// Verificar token al cargar página
window.addEventListener('load', () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    redirectToLogin();
  }
});
