function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function validateUserForm(username, email, name, password) {
    if (!username || !email || !name || !password) {
        return { valid: false, message: 'Все поля обязательны для заполнения' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Неверный формат email' };
    }
    
    if (password.length < 6) {
        return { valid: false, message: 'Пароль должен быть не менее 6 символов' };
    }
    
    return { valid: true, message: '' };
}