import { KeyManager } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const keyManager = new KeyManager();
    
    // Initialize the manager
    await keyManager.init();
    
    // Setup event listeners
    document.getElementById('createKeyBtn')?.addEventListener('click', async () => {
        const newKey = await keyManager.createKey();
        if (newKey) {
            keyManager.showResult(`Đã tạo key mới: <strong>${newKey}</strong>`, 'success');
        }
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        keyManager.renderKeys(e.target.value);
    });
    
    // Initial load
    await keyManager.loadKeys();
});
