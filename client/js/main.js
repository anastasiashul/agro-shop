document.addEventListener('DOMContentLoaded', () => {
    const token = getToken();
    if (token) {
        const payload = atob(token);
        const parts = payload.split(':');
        if (parts.length === 3) {
            currentUser = { id: parts[0], username: parts[1], role: parts[2] };
        }
        updateUI();
    }
    
    if (document.getElementById('machines-list')) {
        loadCatalog();
    }
    
    initModals();
});