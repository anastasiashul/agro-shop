async function loadCatalog() {
    const response = await fetch(`${API_URL}/machines`);
    const data = await response.json();
    const container = document.getElementById('machines-list');
    
    if (data.status === 'success' && data.data && container) {
        const machines = data.data;
        let html = '<div class="machines-grid">';
        for (var i = 0; i < machines.length; i++) {
            var machine = machines[i];
            html += '<div class="machine-card">';
            html += '<h3>' + machine.name + '</h3>';
            html += '<p><strong>Категория:</strong> ' + machine.category + '</p>';
            html += '<p><strong>Цена:</strong> ' + machine.price.toLocaleString() + ' руб.</p>';
            html += '<p>' + (machine.description || '') + '</p>';
            if (currentUser) {
                html += '<button class="add-to-cart" data-id="' + machine.id + '" data-name="' + machine.name + '" data-price="' + machine.price + '">Добавить в корзину</button>';
            }
            html += '</div>';
        }
        html += '</div>';
        container.innerHTML = html;
        
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