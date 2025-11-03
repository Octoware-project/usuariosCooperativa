
function toggleMenu() {
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('menuOverlay');
  const userDropdown = document.getElementById('userDropdownMobile');
  
  if (userDropdown) {
    userDropdown.classList.remove('show');
  }
  
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
  if (overlay) {
    overlay.classList.toggle('active');
  }
}

function closeMenu() {
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('menuOverlay');
  
  if (sidebar) {
    sidebar.classList.remove('open');
  }
  if (overlay) {
    overlay.classList.remove('active');
  }
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdownMobile');
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('menuOverlay');
  
  if (sidebar) {
    sidebar.classList.remove('open');
  }
  if (overlay) {
    overlay.classList.remove('active');
  }
  
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

document.addEventListener('click', function(event) {
  const userIcon = document.getElementById('userIconMobile');
  const userDropdown = document.getElementById('userDropdownMobile');
  const menuBtn = document.querySelector('.menu-btn');
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('menuOverlay');
  
  if (userIcon && userDropdown && !userIcon.contains(event.target) && !userDropdown.contains(event.target)) {
    userDropdown.classList.remove('show');
  }
  
  if (overlay && overlay.contains(event.target)) {
    closeMenu();
  }
});

function initUserIcon() {
  const userIcon = document.getElementById('userIconMobile');
  
  if (!userIcon) return;
  
  const token = localStorage.getItem('access_token');
  if (token) {
    userIcon.textContent = 'U';
  }
}

function initDesktopNavbar() {
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = userDropdown.classList.contains('show');
      
      if (isOpen) {
        userDropdown.classList.remove('show');
        userMenuBtn.classList.remove('menu-open');
      } else {
        userDropdown.classList.add('show');
        userMenuBtn.classList.add('menu-open');
      }
    });
    
    document.addEventListener('click', function(event) {
      if (!userMenuBtn.contains(event.target) && !userDropdown.contains(event.target)) {
        userDropdown.classList.remove('show');
        userMenuBtn.classList.remove('menu-open');
      }
    });
  }
}

function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('userData');
  localStorage.removeItem('authToken');
  window.location.href = 'index.html';
}

function initNavbarAfterLoad() {
  initUserIcon();
  initDesktopNavbar();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initNavbarAfterLoad, 200);
  });
} else {
  setTimeout(initNavbarAfterLoad, 200);
}

function openConfigModal() {
  const modal = document.getElementById('configModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    updateThemeButtons();
  }
}

function closeConfigModal() {
  const modal = document.getElementById('configModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function setTheme(themeName) {
  if (window.ThemeManager) {
    window.ThemeManager.applyTheme(themeName);
    updateThemeButtons();
  }
}

function updateThemeButtons() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const lightBtn = document.getElementById('lightThemeBtn');
  const darkBtn = document.getElementById('darkThemeBtn');
  
  if (lightBtn && darkBtn) {
    lightBtn.classList.remove('active');
    darkBtn.classList.remove('active');
    
    if (currentTheme === 'light') {
      lightBtn.classList.add('active');
    } else {
      darkBtn.classList.add('active');
    }
  }
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeConfigModal();
  }
});
