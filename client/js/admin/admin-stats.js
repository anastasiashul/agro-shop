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

window.loadMachinesStats = loadMachinesStats;
window.loadUsersStats = loadUsersStats;