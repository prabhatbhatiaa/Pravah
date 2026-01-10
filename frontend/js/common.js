/**
 * COMMON CONFIGURATION
 */

const API_BASE = "https://pravah-br0g.onrender.com";

const Utils = {
    getRiskColor: (level) => {
        if (!level) return '#94a3b8';
        const norm = level.toLowerCase();
        if (norm === 'high') return '#ef4444';   // Red
        if (norm === 'medium') return '#eab308'; // Yellow/Amber
        if (norm === 'low') return '#22c55e';    // Green
        return '#94a3b8';
    },

    // Generates the Toast HTML structure defined in your admin.html CSS
    showToast: (title, message, type = 'success') => {
        let container = document.getElementById('toast-container');
        
        // Create container if it doesn't exist (useful for dashboard/login pages)
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Icons based on type
        const iconName = type === 'success' ? 'check-circle-2' : 'alert-circle';
        
        toast.innerHTML = `
            <i data-lucide="${iconName}" class="toast-icon ${type}" style="width: 20px; height: 20px;"></i>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Initialize the icon for this new element
        if (window.lucide) window.lucide.createIcons();

        // Auto-remove
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

};
