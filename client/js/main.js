document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    if (token) {
        const payload = atob(token);
        const parts = payload.split(':');
        if (parts.length === 3 || parts.length === 4) {
            currentUser = { id: parts[0], username: parts[1], role: parts[2] };
        }
        updateUI();
    }
    else {
        const isLoginPage = window.location.pathname.includes('login.html');
        const isAdminPage = window.location.pathname.includes('admin.html');
        const isOrdersPage = window.location.pathname.includes('orders.html');
        
        if (!isLoginPage && (isAdminPage || isOrdersPage)) {
            window.location.href = 'login.html';
            return;
        }
    }
    
    if (document.getElementById('machines-list')) {
        loadCatalog();
    }
    
    if (document.getElementById('orders-list') && currentUser) {
        loadMyOrders();
    }
    
    if (document.getElementById('admin-machines-list') && currentUser && currentUser.role === 'admin') {
        loadAdminMachines();
        loadUsers();
        loadAllOrders();
        loadUsersForFilter();
        initAdminMachineForm();
        initAdminUserForm();
        initAdminFilters();
        const machinesTab = document.getElementById('admin-machines');
        if (machinesTab) machinesTab.style.display = 'block';
    }
    
    initModals();
});