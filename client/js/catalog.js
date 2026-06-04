async function loadCatalog() {
    const response = await fetch(`${API_URL}/machines`);
    const data = await response.json();
    const container = document.getElementById('machines-list');
    
    if (data.status === 'success' && data.data && container) {
        const machines = data.data;
        container.innerHTML = `
            <div class="machines-grid">
                ${machines.map(machine => `
                    <div class="machine-card">
                        <h3>${machine.name}</h3>
                        <p><strong>Категория:</strong> ${machine.category}</p>
                        <p><strong>Цена:</strong> ${machine.price.toLocaleString()} ₽</p>
                        <p>${machine.description || ''}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}