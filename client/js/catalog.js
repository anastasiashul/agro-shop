async function loadCatalog() {
    const response = await fetch(`${API_URL}/machines`);
    const data = await response.json();
    const container = document.getElementById('machines-list');
    
    if (data.status === 'success' && data.data && container) {
        const machines = data.data;
        container.innerHTML = `
                <div class="machines-grid">
                    ${machines.map(machine => `
                        <div class="machine-card" data-id="${machine.id}">
                            <h3>${machine.name}</h3>
                            <p><strong>Категория:</strong> ${machine.category}</p>
                            <p><strong>Цена:</strong> ${machine.price.toLocaleString()} ₽</p>
                            <p>${machine.description || ''}</p>
                            ${currentUser ? `
                                <button class="add-to-cart" data-id="${machine.id}" data-name="${machine.name}" data-price="${machine.price}">Добавить в корзину</button>
                            ` : ''}
                            
                        </div>
                    `).join('')}
                </div>
            `;
                
        if (currentUser) {
            document.querySelectorAll('.add-to-cart').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var id = parseInt(btn.dataset.id);
                    var name = btn.dataset.name;
                    var price = parseInt(btn.dataset.price);
                    addToCart(id, name, price);
                });
            });
        }
    }
}