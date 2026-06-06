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
    
    const authModal = document.getElementById('auth-modal');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
            if (authModal) authModal.style.display = 'block';
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
            if (authModal) authModal.style.display = 'block';
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
    
    initAdminTabs();
    
    const applyFilters = document.getElementById('apply-filters');
    if (applyFilters) {
        applyFilters.addEventListener('click', () => {
            if (typeof applyOrdersFilter === 'function') applyOrdersFilter();
        });
    }
}
function initAdminTabs() {
    const tabButtons = document.querySelectorAll('#admin-tabs .tab-btn');
    const machinesTab = document.getElementById('admin-machines');
    const usersTab = document.getElementById('admin-users');
    const ordersTab = document.getElementById('admin-orders');
    const statsTab = document.getElementById('admin-stats');
    
    if (!tabButtons.length) return;
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            if (machinesTab) machinesTab.style.display = 'none';
            if (usersTab) usersTab.style.display = 'none';
            if (ordersTab) ordersTab.style.display = 'none';
            if (statsTab) statsTab.style.display = 'none';
            
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (tab === 'machines' && machinesTab) {
                machinesTab.style.display = 'block';
                if (typeof loadAdminMachines === 'function') loadAdminMachines();
            }
            if (tab === 'users' && usersTab) {
                usersTab.style.display = 'block';
                if (typeof loadUsers === 'function') loadUsers();
            }
            if (tab === 'all-orders' && ordersTab) {
                ordersTab.style.display = 'block';
                if (typeof loadAllOrders === 'function') loadAllOrders();
                if (typeof loadUsersForFilter === 'function') loadUsersForFilter();
            }
            if (tab === 'stats' && statsTab) {
                statsTab.style.display = 'block';
                if (typeof loadMachinesStats === 'function') loadMachinesStats();
                if (typeof loadUsersStats === 'function') loadUsersStats();
            }
        });
    });
}