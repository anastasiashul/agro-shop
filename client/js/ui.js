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
    document.querySelectorAll('.modal .close').forEach(close => {
        close.addEventListener('click', () => {
            close.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) cartBtn.addEventListener('click', showCartModal);
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
    
    
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'login.html?tab=login';
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            window.location.href = 'login.html?tab=register';
        });
    }
    
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    

    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
        });
    }

    const loginSubmit = document.getElementById('login-submit');
    if (loginSubmit) {
        loginSubmit.addEventListener('click', () => {
            const username = document.getElementById('login-username') ? document.getElementById('login-username').value : '';
            const password = document.getElementById('login-password') ? document.getElementById('login-password').value : '';
            login(username, password);
        });
    }

    const registerSubmit = document.getElementById('register-submit');
    if (registerSubmit) {
        registerSubmit.addEventListener('click', async () => {
            const username = document.getElementById('register-username') ? document.getElementById('register-username').value : '';
            const email = document.getElementById('register-email') ? document.getElementById('register-email').value : '';
            const name = document.getElementById('register-name') ? document.getElementById('register-name').value : '';
            const age = document.getElementById('register-age') ? document.getElementById('register-age').value : '';
            const password = document.getElementById('register-password') ? document.getElementById('register-password').value : '';
            if (await register(username, email, name, age, password)) {
                if (loginForm) loginForm.style.display = 'block';
                if (registerForm) registerForm.style.display = 'none';
                alert('Регистрация успешна! Теперь войдите.');
            }
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (typeof initAdminTabs === 'function') {
        initAdminTabs();
    }
    
    const applyFilters = document.getElementById('apply-filters');
    if (applyFilters) {
        applyFilters.addEventListener('click', () => {
            if (typeof applyOrdersFilter === 'function') applyOrdersFilter();
        });
    }
}
