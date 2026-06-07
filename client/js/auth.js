function getToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const decoded = atob(token);
        const parts = decoded.split(':');
        if (parts.length === 4) {
            const expires = parseInt(parts[3]);
            if (expires < Date.now() / 1000) {
                clearToken();
                return null;
            }
        }
        return token;
    } catch(e) {
        return token;
    }
}

function saveToken(token) {
    localStorage.setItem('token', token);
}

function clearToken() {
    localStorage.removeItem('token');
}

async function login(username, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
        const data = await response.json();
        alert(data.message || 'Ошибка входа');
        return false;
    }
    
    const data = await response.json();
    if (data.status === 'success') {
        saveToken(data.data.token);
        currentUser = data.data.user;
        if (typeof loadCart === 'function') loadCart();
        if (typeof updateUI === 'function') updateUI();
        window.location.href = 'index.html';
        return true;
    }
    return false;
}

async function register(username, email, name, age, password) {
    const dataToSend = { username, email, name, password };
    if (age !== undefined && age !== null && age !== '' && !isNaN(age)) {
        dataToSend.age = parseInt(age);
    }

    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
    });
    
    const data = await response.json();
    if (data.status === 'success') {
        return true;
    } else {
        alert(data.message || 'Ошибка регистрации');
        return false;
    }
}

function logout() {
    fetch(`${API_URL}/logout`, { 
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    }).catch(e => console.log('Logout error:', e));
    clearToken();
    currentUser = null;
    cart = [];
    if (typeof updateCartCount === 'function') updateCartCount();
    window.location.href = 'index.html';
}