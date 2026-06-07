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
        } else {
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

function initAdminUserForm() {
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
}

window.loadUsers = loadUsers;
window.createUser = createUser;
window.initAdminUserForm = initAdminUserForm;