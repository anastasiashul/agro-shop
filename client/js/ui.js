function updateUI() {
    const userInfo = document.getElementById('user-info');
    const guestButtons = document.getElementById('guest-buttons');
    const usernameSpan = document.getElementById('username');
    const ordersLink = document.getElementById('orders-link');
    const adminLink = document.getElementById('admin-link');
    
    if (currentUser) {
        if (userInfo) userInfo.style.display = 'flex';
        if (guestButtons) guestButtons.style.display = 'none';
        if (usernameSpan) usernameSpan.textContent = currentUser.username;
        if (ordersLink) ordersLink.style.display = 'inline-block';
        if (adminLink) adminLink.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (guestButtons) guestButtons.style.display = 'block';
        if (ordersLink) ordersLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

function initModals() {
    const modal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginSubmit = document.getElementById('login-submit');
    const registerSubmit = document.getElementById('register-submit');
    const logoutBtn = document.getElementById('logout-btn');
    
    document.querySelectorAll('.modal .close').forEach(close => {
        close.addEventListener('click', () => {
            close.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
            if (modal) modal.style.display = 'block';
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
            if (modal) modal.style.display = 'block';
        });
    }
    
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
    
    if (loginSubmit) {
        loginSubmit.addEventListener('click', () => {
            const username = document.getElementById('login-username')?.value || '';
            const password = document.getElementById('login-password')?.value || '';
            login(username, password);
        });
    }
    
    if (registerSubmit) {
        registerSubmit.addEventListener('click', async () => {
            const username = document.getElementById('register-username')?.value || '';
            const email = document.getElementById('register-email')?.value || '';
            const name = document.getElementById('register-name')?.value || '';
            const password = document.getElementById('register-password')?.value || '';
            if (await register(username, email, name, password)) {
                if (loginForm) loginForm.style.display = 'block';
                if (registerForm) registerForm.style.display = 'none';
                alert('Регистрация успешна! Теперь войдите.');
            }
        });
    }
    
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
}