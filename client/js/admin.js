async function loadAdminMachines() {
    const container = document.getElementById('admin-machines-list');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/machines`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) {
            container.innerHTML = '<p class="error">Ошибка загрузки техники</p>';
            return;
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            const machines = data.data;
            
            if (machines.length === 0) {
                container.innerHTML = '<p>Техника не найдена</p>';
                return;
            }
            
            container.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Категория</th>
                            <th>Цена</th>
                            <th>Кол-во</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${machines.map(machine => `
                            <tr>
                                <td>${machine.id}</td>
                                <td>${escapeHtml(machine.name)}</td>
                                <td>${escapeHtml(machine.category)}</td>
                                <td>${Number(machine.price).toLocaleString()} ₽</td>
                                <td>${machine.stock || 0} шт.</td>
                                <td>
                                    <button class="edit-machine" data-id="${machine.id}">Изменить</button>
                                    <button class="delete-machine danger" data-id="${machine.id}">Удалить</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            document.querySelectorAll('#admin-machines-list .edit-machine').forEach(btn => {
                btn.addEventListener('click', () => openEditMachineModal(parseInt(btn.dataset.id)));
            });
            document.querySelectorAll('#admin-machines-list .delete-machine').forEach(btn => {
                btn.addEventListener('click', () => deleteMachine(parseInt(btn.dataset.id)));
            });
        }
    } catch (error) {
        console.error('Error loading machines:', error);
        container.innerHTML = '<p class="error">Ошибка соединения с сервером</p>';
    }
}
async function loadUsers() {
    const container = document.getElementById('users-list');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) {
            container.innerHTML = '<p class="error">Ошибка загрузки пользователей</p>';
            return;
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            const users = data.data;
            
            if (users.length === 0) {
                container.innerHTML = '<p>Пользователей не найдено</p>';
                return;
            }
            container.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Логин</th>
                            <th>Email</th>
                            <th>Имя</th>
                            <th>Возраст</th>
                            <th>Роль</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${escapeHtml(user.username)}</td>
                                <td>${escapeHtml(user.email || '—')}</td>
                                <td>${escapeHtml(user.name || '—')}</td>
                                <td>${user.age || '—'}</td>
                                <td>${user.role === 'admin' ? 'Администратор' : 'Пользователь'}</td>
                                <td>
                                    <button class="view-user" data-id="${user.id}">Подробнее</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
                        
            document.querySelectorAll('#users-list .view-user').forEach(btn => {
                btn.addEventListener('click', () => viewUserDetails(parseInt(btn.dataset.id)));
            });
        }
        else {
            container.innerHTML = '<p>Ошибка загрузки данных</p>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        container.innerHTML = '<p class="error">Ошибка соединения с сервером</p>';
    }
}

async function viewUserDetails(userId) {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) {
            alert('Ошибка загрузки данных пользователя');
            return;
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            const user = data.data;
            let message = 'ПОЛЬЗОВАТЕЛЬ #' + user.id + '\n\n';
            message += 'Логин: ' + user.username + '\n';
            message += 'Email: ' + (user.email || '—') + '\n';
            message += 'Имя: ' + (user.name || '—') + '\n';
            message += 'Возраст: ' + (user.age || '—') + '\n';
            message += 'Роль: ' + (user.role === 'admin' ? 'Администратор' : 'Пользователь') + '\n';
            message += 'Зарегистрирован: ' + (user.created_at || '—');
            alert(message);
        } else {
            alert(data.message || 'Ошибка загрузки данных');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером');
    }
}

async function createUser(userData) {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            return { success: true, message: data.message || 'Пользователь создан' };
        } else {
            const errorMsg = data.message || 'Ошибка создания пользователя';
            alert(errorMsg);
            return { success: false, message: errorMsg };
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером');
        return { success: false, message: 'Ошибка соединения с сервером' };
    }
}

async function deleteMachine(id) {
    if (!confirm('Удалить эту технику? Это действие нельзя отменить.')) return;
    
    try {
        const response = await fetch(`${API_URL}/machines/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!response.ok) {
            alert('Ошибка удаления');
            return;
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            alert('Техника удалена');
            try {
                await loadCatalog();
            } catch (e) {
                console.warn('Catalog refresh error:', e);
            }
            if (currentUser && currentUser.role === 'admin') {
                try {
                    await loadAdminMachines();
                } catch (e) {
                    console.warn('Admin machines refresh error:', e);
                }
            }
        } else {
            alert(data.message || 'Ошибка удаления');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером');
    }
}

async function openEditMachineModal(id) {
    try {
        const response = await fetch(`${API_URL}/machines/${id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            const machine = data.data;
            document.getElementById('machine-modal-title').textContent = 'Редактировать технику';
            document.getElementById('machine-id').value = machine.id;
            document.getElementById('machine-name').value = machine.name;
            document.getElementById('machine-category').value = machine.category;
            document.getElementById('machine-price').value = machine.price;
            document.getElementById('machine-description').value = machine.description || '';
            document.getElementById('machine-stock').value = machine.stock || 0;
            
            const modal = document.getElementById('machine-modal');
            if (modal) modal.style.display = 'block';
        } else {
            alert(data.message || 'Ошибка загрузки данных');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером');
    }
}

async function addMachine(machineData) {
    const method = machineData.id ? 'PUT' : 'POST';
    const url = machineData.id ? `/machines/${machineData.id}` : '/machines';
    
    try {
        const response = await fetch(`${API_URL}${url}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(machineData)
        });
        if (!response.ok) {
            let errorMsg = 'Ошибка сервера';
            try {
                const data = await response.json();
                errorMsg = data.message || errorMsg;
            } catch (e) {
                errorMsg = `HTTP ${response.status}: ${response.statusText}`;
            }
            alert(errorMsg);
            return false;
        }
        const data = await response.json();
        
        if (data.status === 'success') {
            alert(machineData.id ? 'Техника обновлена' : 'Техника добавлена');
            try {
                await loadCatalog();
            } catch (e) {
                console.warn('Catalog refresh error:', e);
            }
            if (currentUser && currentUser.role === 'admin') {
                try {
                    await loadAdminMachines();
                } catch (e) {
                    console.warn('Admin machines refresh error:', e);
                }
            }
            return true;
        } else {
            alert(data.message || 'Ошибка');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка соединения с сервером');
        return false;
    }
}
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

async function loadMachinesStats() {
    const container = document.getElementById('machines-stats');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/stats/machines`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) {
            container.innerHTML = '<p class="error">Ошибка загрузки статистики</p>';
            return;
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            const stats = data.data;
            
            if (stats.length === 0) {
                container.innerHTML = '<p>Нет данных</p>';
                return;
            }
            
            container.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Категория</th>
                            <th>Цена</th>
                            <th>Остаток</th>
                            <th>Заказано раз</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.map(m => `
                            <tr>
                                <td>${m.id}</td>
                                <td>${escapeHtml(m.name)}</td>
                                <td>${escapeHtml(m.category)}</td>
                                <td>${Number(m.price).toLocaleString()} ₽</td>
                                <td>${m.stock || 0} шт.</td>
                                <td>${m.total_ordered || 0}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p style="margin-top: 10px; color: #666;">Всего позиций: ${stats.length}</p>
            `;
        }
    } catch (error) {
        console.error('Error loading machines stats:', error);
        container.innerHTML = '<p class="error">Ошибка соединения с сервером</p>';
    }
}

async function loadUsersStats() {
    const container = document.getElementById('users-stats');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/stats/users`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (!response.ok) {
            container.innerHTML = '<p class="error">Ошибка загрузки статистики</p>';
            return;
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            const stats = data.data;
            
            if (stats.length === 0) {
                container.innerHTML = '<p>Нет данных</p>';
                return;
            }
            
            let totalSpent = 0;
            let totalOrders = 0;
            
            for (let i = 0; i < stats.length; i++) {
                totalSpent += parseFloat(stats[i].total_spent) || 0;
                totalOrders += parseInt(stats[i].orders_count) || 0;
            }
            
            let html = '<table class="admin-table"><thead><tr>';
            html += '<th>ID</th><th>Пользователь</th><th>Заказов</th><th>Потрачено</th><th>Средний чек</th>';
            html += '</tr></thead><tbody>';
            
            for (let i = 0; i < stats.length; i++) {
                const u = stats[i];
                const spent = parseFloat(u.total_spent) || 0;
                const orders = parseInt(u.orders_count) || 0;
                const avg = orders > 0 ? spent / orders : 0;
                
                html += '<tr>';
                html += '<td>' + u.id + '</td>';
                html += '<td>' + escapeHtml(u.username) + '</td>';
                html += '<td>' + orders + '</td>';
                html += '<td>' + spent.toLocaleString() + ' руб.</td>';
                html += '<td>' + avg.toLocaleString() + ' руб.</td>';
                html += '</tr>';
            }
            html += '</tbody></table>';
            html += '<div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">';
            html += '<strong>Итоговая статистика:</strong><br>';
            html += 'Всего пользователей: ' + stats.length + '<br>';
            html += 'Всего заказов: ' + totalOrders + '<br>';
            html += 'Общая выручка: ' + totalSpent.toLocaleString() + ' руб.';
            html += '</div>';
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading users stats:', error);
        container.innerHTML = '<p class="error">Ошибка соединения с сервером</p>';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function validateUserForm(username, email, name, password) {
    if (!username || !email || !name || !password) {
        return { valid: false, message: 'Все поля обязательны для заполнения' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Неверный формат email' };
    }
    
    if (password.length < 6) {
        return { valid: false, message: 'Пароль должен быть не менее 6 символов' };
    }
    
    return { valid: true, message: '' };
}

function initAdminForms() {
    const addMachineBtn = document.getElementById('add-machine-btn');
    if (addMachineBtn) {
        addMachineBtn.addEventListener('click', () => {
            document.getElementById('machine-modal-title').textContent = 'Добавить технику';
            const form = document.getElementById('machine-form');
            if (form) form.reset();
            document.getElementById('machine-id').value = '';
            const modal = document.getElementById('machine-modal');
            if (modal) modal.style.display = 'block';
        });
    }
    
    const machineForm = document.getElementById('machine-form');
    if (machineForm) {
        const newMachineForm = machineForm.cloneNode(true);
        machineForm.parentNode.replaceChild(newMachineForm, machineForm);
        
        newMachineForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('machine-id') ? document.getElementById('machine-id').value : null;
            const machineData = {
                id: id ? parseInt(id) : null,
                name: document.getElementById('machine-name') ? document.getElementById('machine-name').value.trim() : '',
                category: document.getElementById('machine-category') ? document.getElementById('machine-category').value : '',
                price: parseFloat(document.getElementById('machine-price') ? document.getElementById('machine-price').value : 0),
                description: document.getElementById('machine-description') ? document.getElementById('machine-description').value.trim() : '',
                stock: parseInt(document.getElementById('machine-stock') ? document.getElementById('machine-stock').value : 0)
            };
            
            if (!machineData.name) {
                alert('Введите название техники');
                return;
            }
            if (!machineData.category) {
                alert('Выберите категорию');
                return;
            }
            if (machineData.price <= 0) {
                alert('Цена должна быть больше 0');
                return;
            }
            
            if (await addMachine(machineData)) {
                const modal = document.getElementById('machine-modal');
                if (modal) modal.style.display = 'none';
                newMachineForm.reset();
            }
        });
    }
    
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        const newAddUserBtn = addUserBtn.cloneNode(true);
        addUserBtn.parentNode.replaceChild(newAddUserBtn, addUserBtn);
        
        newAddUserBtn.addEventListener('click', () => {
            const form = document.getElementById('user-form');
            if (form) form.reset();
            const modal = document.getElementById('user-modal');
            if (modal) modal.style.display = 'block';
        });
    }
    
    const userForm = document.getElementById('user-form');
    if (userForm) {
        const newUserForm = userForm.cloneNode(true);
        userForm.parentNode.replaceChild(newUserForm, userForm);
        
        newUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('user-username') ? document.getElementById('user-username').value.trim() : '';
            const email = document.getElementById('user-email') ? document.getElementById('user-email').value.trim() : '';
            const name = document.getElementById('user-name') ? document.getElementById('user-name').value.trim() : '';
            const ageElem = document.getElementById('user-age');
            const age = ageElem ? ageElem.value : '';
            const password = document.getElementById('user-password') ? document.getElementById('user-password').value : '';
            const role = document.getElementById('user-role') ? document.getElementById('user-role').value : 'user';
            
            const validation = validateUserForm(username, email, name, password);
            
            if (!validation.valid) {
                alert(validation.message);
                return;
            }
            
            const userData = { username, email, name, password, role };
            if (age !== undefined && age !== null && age !== '') {
                userData.age = parseInt(age);
            }
            
            const result = await createUser(userData);
            
            if (result.success) {
                alert(result.message);
                const modal = document.getElementById('user-modal');
                if (modal) modal.style.display = 'none';
                newUserForm.reset();
                await loadUsers();
            }
        });
    }
    
    const applyFilters = document.getElementById('apply-filters');
    if (applyFilters) {
        applyFilters.addEventListener('click', () => {
            applyOrdersFilter();
        });
    }
}

window.loadAdminMachines = loadAdminMachines;
window.loadUsers = loadUsers;
window.loadAllOrders = loadAllOrders;
window.loadUsersForFilter = loadUsersForFilter;
window.initAdminForms = initAdminForms;
window.applyOrdersFilter = applyOrdersFilter;
window.createUser = createUser;
window.addMachine = addMachine;
window.deleteMachine = deleteMachine;
window.loadMachinesStats = loadMachinesStats;
window.loadUsersStats = loadUsersStats;