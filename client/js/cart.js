let cart = [];

async function syncCartToServer() {
    if (!currentUser) return;
    
    await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ items: cart })
    }).catch(e => console.log('Sync error:', e));
}

async function loadCartFromServer() {
    if (!currentUser) return;
    
    const response = await fetch(`${API_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data) {
            cart = data.data;
            saveCart();
            updateCartCount();
        }
    }
}

function saveCart() {
    if (currentUser) {
        localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
        syncCartToServer();
    }
}

function loadCart() {
    if (currentUser) {
        const saved = localStorage.getItem(`cart_${currentUser.id}`);
        if (saved) {
            cart = JSON.parse(saved);
        } else {
            cart = [];
        }
        loadCartFromServer();
    } else {
        cart = [];
    }
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = count;
}

function clearCart() {
    cart = [];
    if (currentUser) {
        localStorage.removeItem(`cart_${currentUser.id}`);
    }
    updateCartCount();
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = `Итого: ${total.toLocaleString()} ₽`;
    return total;
}

function addToCart(id, name, price) {
    if (!currentUser) return;
    
    const existing = cart.find(item => item.machine_id === id);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ machine_id: id, name, price, quantity: 1 });
    }
    saveCart();
    updateCartCount();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    updateCartTotal();
    renderCartModal();
}

function renderCartModal() {
    const container = document.getElementById('cart-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<p>Корзина пуста</p>';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
    } else {
        container.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <span>${item.name} x${item.quantity}</span>
                <span>${(item.price * item.quantity).toLocaleString()} ₽</span>
                <button class="remove-from-cart" data-index="${index}">Удалить</button>
            </div>
        `).join('');
        if (checkoutBtn) checkoutBtn.style.display = 'block';
        
        document.querySelectorAll('.remove-from-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                removeFromCart(index);
            });
        });
    }
    updateCartTotal();
}

function showCartModal() {
    renderCartModal();
    const modal = document.getElementById('cart-modal');
    if (modal) modal.style.display = 'block';
}