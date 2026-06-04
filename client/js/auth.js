function getToken() {
    return localStorage.getItem('token');
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
        if (typeof updateUI === 'function') updateUI();
        window.location.href = 'index.html';
        return true;
    }
    return false;
}

async function register(username, email, name, password) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, name, password })
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
    clearToken();
    currentUser = null;
    window.location.href = 'index.html';
}