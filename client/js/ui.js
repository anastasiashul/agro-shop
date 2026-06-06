function updateUI() {
    const userInfo = document.getElementById('user-info');
    const guestButtons = document.getElementById('guest-buttons');
    const usernameSpan = document.getElementById('username');
    const ordersLink = document.getElementById('orders-link');
    const adminLink = document.getElementById('admin-link');
    const cartBtn = document.getElementById('cart-btn');
    
    if (currentUser) {
        if (userInfo) userInfo.style.display = 'flex';
        if (guestButtons) guestButtons.style.display = 'none';
        if (usernameSpan) usernameSpan.textContent = currentUser.username;
        if (ordersLink) ordersLink.style.display = 'inline-block';
        if (adminLink) adminLink.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
        if (cartBtn) cartBtn.style.display = 'inline-block';
        if (typeof loadCart === 'function') loadCart();
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (guestButtons) guestButtons.style.display = 'block';
        if (ordersLink) ordersLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        if (cartBtn) cartBtn.style.display = 'none';
        cart = [];
        if (typeof updateCartCount === 'function') updateCartCount();
    }
}

function initModals() {
    const modal = document.getElementById('auth-modal');
    const cartModal = document.getElementById('cart-modal');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const cartBtn = document.getElementById('cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginSubmit = document.getElementById('login-submit');
    const registerSubmit = document.getElementById('register-submit');
    const logoutBtn = document.getElementById('logout-btn');
    
    document.querySelectorAll('.modal .close').forEach(function(close) {
        close.addEventListener('click', function() {
            close.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
            if (modal) modal.style.display = 'block';
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
            if (modal) modal.style.display = 'block';
        });
    }
    
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            if (typeof showCartModal === 'function') showCartModal();
        });
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (typeof checkout === 'function') checkout();
        });
    }
    
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
        });
    }
    
    if (loginSubmit) {
        loginSubmit.addEventListener('click', function() {
            var username = document.getElementById('login-username')?.value || '';
            var password = document.getElementById('login-password')?.value || '';
            login(username, password);
        });
    }
    
    if (registerSubmit) {
        registerSubmit.addEventListener('click', async function() {
            var username = document.getElementById('register-username')?.value || '';
            var email = document.getElementById('register-email')?.value || '';
            var name = document.getElementById('register-name')?.value || '';
            var age = document.getElementById('register-age')?.value || '';
            var password = document.getElementById('register-password')?.value || '';
            if (await register(username, email, name, age, password)) {
                if (loginForm) loginForm.style.display = 'block';
                if (registerForm) registerForm.style.display = 'none';
                alert('Регистрация успешна! Теперь войдите.');
            }
        });
    }
    
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
}
function initAdminTabs() {
    const tabButtons = document.querySelectorAll('#admin-tabs .tab-btn');
    const machinesTab = document.getElementById('admin-machines');
    
    if (!tabButtons.length) return;
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            if (machinesTab) machinesTab.style.display = 'none';
            
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (tab === 'machines' && machinesTab) {
                machinesTab.style.display = 'block';
                if (typeof loadAdminMachines === 'function') loadAdminMachines();
            }
        });
    });
}