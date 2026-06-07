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

function initAdminMachineForm() {
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
}

window.loadAdminMachines = loadAdminMachines;
window.addMachine = addMachine;
window.deleteMachine = deleteMachine;
window.initAdminMachineForm = initAdminMachineForm;