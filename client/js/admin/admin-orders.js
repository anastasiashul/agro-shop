let allOrders = [];

async function loadAllOrders() {
    const container = document.getElementById('admin-orders-list');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/orders/all`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) {
            container.innerHTML = '<p class="error">Ошибка загрузки заказов</p>';
            return;
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            allOrders = data.data;
            applyOrdersFilter();
        } else {
            container.innerHTML = '<p>Заказов пока нет</p>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = '<p class="error">Ошибка соединения с сервером</p>';
    }
}

function applyOrdersFilter() {
    const container = document.getElementById('admin-orders-list');
    const filterUser = document.getElementById('filter-user') ? document.getElementById('filter-user').value : '';
    const filterStatus = document.getElementById('filter-status') ? document.getElementById('filter-status').value : '';
    
    let filtered = [...allOrders];
    
    if (filterUser) {
        filtered = filtered.filter(order => order.username === filterUser || order.user_id == filterUser);
    }
    
    if (filterStatus) {
        filtered = filtered.filter(order => order.status === filterStatus);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '<p>Заказов не найдено</p>';
        return;
    }
    
    let html = '<table class="admin-table"><thead><tr>';
    html += '<th>Номер заказа</th><th>Пользователь</th><th>Товары</th><th>Итого</th><th>Статус</th><th>Дата</th>';
    html += '</tr></thead><tbody>';
    
    for (let i = 0; i < filtered.length; i++) {
        const order = filtered[i];
        let itemsText = '';
        if (order.items) {
            for (let j = 0; j < order.items.length; j++) {
                if (j > 0) itemsText += ', ';
                itemsText += order.items[j].name + ' x' + order.items[j].quantity;
            }
        } else {
            itemsText = 'Нет товаров';
        }
        
        let statusText = '';
        if (order.status === 'pending') {
            statusText = 'Ожидает оплаты';
        } else if (order.status === 'paid') {
            statusText = 'Оплачен';
        } else {
            statusText = 'Отменён';
        }
        
        let date = order.created_at ? new Date(order.created_at).toLocaleString('ru-RU') : '—';
        
        html += '<tr>';
        html += '<td>' + order.id + '</td>';
        html += '<td>' + escapeHtml(order.username || 'user_' + order.user_id) + '</td>';
        html += '<td>' + escapeHtml(itemsText) + '</td>';
        html += '<td>' + Number(order.total).toLocaleString() + ' руб.</td>';
        html += '<td>' + statusText + '</td>';
        html += '<td>' + date + '</td>';
        html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function loadUsersForFilter() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            const select = document.getElementById('filter-user');
            if (select) {
                select.innerHTML = '<option value="">Все пользователи</option>';
                for (let i = 0; i < data.data.length; i++) {
                    const user = data.data[i];
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = user.username + ' (' + (user.name || 'без имени') + ')';
                    select.appendChild(option);
                }
            }
        }
    } catch (error) {
        console.error('Error loading users for filter:', error);
    }
}

function initAdminFilters() {
    const applyFilters = document.getElementById('apply-filters');
    if (applyFilters) {
        applyFilters.addEventListener('click', () => {
            applyOrdersFilter();
        });
    }
}

window.loadAllOrders = loadAllOrders;
window.loadUsersForFilter = loadUsersForFilter;
window.applyOrdersFilter = applyOrdersFilter;
window.initAdminFilters = initAdminFilters;