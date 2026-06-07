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

window.initAdminTabs = initAdminTabs;