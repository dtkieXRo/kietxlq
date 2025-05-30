import CONFIG from './config.js';

export class KeyManager {
    constructor() {
        this.keys = [];
        this.authenticated = false;
    }

    async init() {
        try {
            this.token = await this.getToken();
            this.authenticated = true;
            this.updateAuthStatus('Đã kết nối hệ thống', 'success');
            return true;
        } catch (error) {
            console.error('Authentication failed:', error);
            this.updateAuthStatus(`Lỗi xác thực: ${error.message}`, 'error');
            return false;
        }
    }

    async getToken() {
        // In production, this will use GitHub Secrets
        if (process.env.ACCESS_TOKEN) return process.env.ACCESS_TOKEN;
        
        // For development (set in config.js)
        if (CONFIG.GITHUB.TOKEN) return CONFIG.GITHUB.TOKEN;
        
        throw new Error('No authentication token provided');
    }

    updateAuthStatus(message, type) {
        const authElement = document.getElementById('auth-status');
        if (authElement) {
            authElement.textContent = message;
            authElement.className = `auth-${type}`;
        }
    }

    async createKey() {
        try {
            const response = await this.callGitHubAPI('dispatches', {
                method: 'POST',
                body: {
                    event_type: 'create-key'
                }
            });
            
            // Simulate response (in real app, wait for workflow completion)
            const newKey = {
                value: `kiet_${Math.random().toString().slice(2, 12)}`,
                created: new Date().toISOString(),
                active: true
            };
            
            this.keys.push(newKey);
            this.renderKeys();
            
            return newKey.value;
        } catch (error) {
            console.error('Create key error:', error);
            this.showResult(`Lỗi tạo key: ${error.message}`, 'error');
            return null;
        }
    }

    async loadKeys() {
        try {
            const response = await fetch(
                `${CONFIG.API.CONTENT_URL}/${CONFIG.GITHUB.USERNAME}/${CONFIG.GITHUB.REPO}/main/data/keys.json`,
                {
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );
            
            if (!response.ok) throw new Error('Failed to load keys');
            
            this.keys = await response.json();
            this.renderKeys();
        } catch (error) {
            console.error('Load keys error:', error);
            this.showResult(`Lỗi tải danh sách key: ${error.message}`, 'error');
        }
    }

    renderKeys(filter = '') {
        const container = document.getElementById('keysContainer');
        if (!container) return;
        
        const filteredKeys = this.keys.filter(key => 
            key.value.toLowerCase().includes(filter.toLowerCase())
        );
        
        container.innerHTML = filteredKeys.length > 0
            ? filteredKeys.map(key => this.renderKeyItem(key)).join('')
            : '<div class="empty">Không có key nào</div>';
    }

    renderKeyItem(key) {
        return `
            <div class="key-item">
                <div class="key-info">
                    <div class="key-value">${key.value}</div>
                    <div class="key-meta">
                        <span>Ngày tạo: ${new Date(key.created).toLocaleDateString()}</span>
                        <span>Trạng thái: ${key.active ? 'Hoạt động' : 'Vô hiệu'}</span>
                    </div>
                </div>
                <button class="btn-danger" data-key="${key.value}">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        `;
    }

    showResult(message, type) {
        const resultElement = document.getElementById('key-result');
        if (resultElement) {
            resultElement.innerHTML = `<div class="${type}">${message}</div>`;
        }
    }
}
