// ============================================
// NAVBAR FUNCTIONS - Mobile & Desktop
// ============================================

// Mobile menu functionality
function toggleMenu() {
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('menuOverlay');
  const userDropdown = document.getElementById('userDropdownMobile');
  
  // Close user dropdown if open
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
  
  // Close sidebar if open
  if (sidebar) {
    sidebar.classList.remove('open');
  }
  if (overlay) {
    overlay.classList.remove('active');
  }
  
  // Toggle dropdown
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
  const userIcon = document.getElementById('userIconMobile');
  const userDropdown = document.getElementById('userDropdownMobile');
  const menuBtn = document.querySelector('.menu-btn');
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('menuOverlay');
  
  // Close mobile user dropdown if clicking outside
  if (userIcon && userDropdown && !userIcon.contains(event.target) && !userDropdown.contains(event.target)) {
    userDropdown.classList.remove('show');
  }
  
  // Close sidebar if clicking on overlay
  if (overlay && overlay.contains(event.target)) {
    closeMenu();
  }
});

// Initialize user icon - Keep it simple with 'U'
function initUserIcon() {
  const userIcon = document.getElementById('userIconMobile');
  
  if (!userIcon) return;
  
  // Keep icon as 'U' - don't fetch user name
  const token = localStorage.getItem('access_token');
  if (token) {
    userIcon.textContent = 'U';
  }
}

// Desktop navbar user menu toggle
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
    
    // Close desktop dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (!userMenuBtn.contains(event.target) && !userDropdown.contains(event.target)) {
        userDropdown.classList.remove('show');
        userMenuBtn.classList.remove('menu-open');
      }
    });
  }
}

// Logout function
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('userData');
  localStorage.removeItem('authToken');
  window.location.href = 'index.html';
}

// Initialize navbar after it's loaded
function initNavbarAfterLoad() {
  initUserIcon();
  initDesktopNavbar();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for navbar to be loaded by loader.js
    setTimeout(initNavbarAfterLoad, 200);
  });
} else {
  // DOM already loaded
  setTimeout(initNavbarAfterLoad, 200);
}

// ============================================
// CONFIGURATION MODAL FUNCTIONS
// ============================================

function openConfigModal() {
  const modal = document.getElementById('configModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update theme buttons state
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

// Close modal with ESC key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeConfigModal();
  }
});
