document.addEventListener('DOMContentLoaded', function() {
    var token = getToken();
    if (token) {
        var payload = atob(token);
        var parts = payload.split(':');
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
    
    if (document.getElementById('admin-machines-list') && currentUser?.role === 'admin') {
        loadAdminMachines();
        initAdminForms();
        initAdminTabs();
    }
    
    initModals();
});