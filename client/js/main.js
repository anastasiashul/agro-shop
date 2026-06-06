document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    if (token) {
        const payload = atob(token);
        const parts = payload.split(':');
        if (parts.length === 3) {
            currentUser = { id: parts[0], username: parts[1], role: parts[2] };
        }
        updateUI();
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
        initAdminForms();
        const machinesTab = document.getElementById('admin-machines');
        if (machinesTab) machinesTab.style.display = 'block';
    }
    
    initModals();
});