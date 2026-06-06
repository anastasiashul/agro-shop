async function loadMyOrders() {
    const response = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    if (!response.ok) return;
    
    const data = await response.json();
    const container = document.getElementById('orders-list');
    
    if (data.status === 'success' && data.data && container) {
        const orders = data.data;
        if (orders.length === 0) {
            container.innerHTML = '<p>У вас пока нет заказов</p>';
        } else {
            container.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Номер</th>
                            <th>Товары</th>
                            <th>Итого</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>${order.id}</td>
                                <td>${order.items?.map(i => `${i.name} x${i.quantity}`).join(', ') || ''}</td>
                                <td>${order.total.toLocaleString()} ₽</td>
                                <td>${order.status === 'pending' ? 'Ожидает оплаты' : order.status === 'paid' ? 'Оплачен' : 'Отменён'}</td>
                                <td>
                                    ${order.status === 'pending' ? `
                                        <button class="pay-order" data-id="${order.id}">Оплатить</button>
                                        <button class="cancel-order" data-id="${order.id}">Отменить</button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            document.querySelectorAll('.pay-order').forEach(btn => {
                btn.addEventListener('click', () => payOrder(parseInt(btn.dataset.id)));
            });
            document.querySelectorAll('.cancel-order').forEach(btn => {
                btn.addEventListener('click', () => cancelOrder(parseInt(btn.dataset.id)));
            });
        }
    }
}

async function payOrder(orderId) {
    const response = await fetch(`${API_URL}/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    const data = await response.json();
    if (data.status === 'success') {
        alert('Заказ оплачен');
        loadMyOrders();
    } else {
        alert(data.message || 'Ошибка оплаты');
    }
}

async function cancelOrder(orderId) {
    if (!confirm('Отменить заказ?')) return;
    
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    const data = await response.json();
    if (data.status === 'success') {
        alert('Заказ отменён');
        loadMyOrders();
    } else {
        alert(data.message || 'Ошибка отмены');
    }
}

