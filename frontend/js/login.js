document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorText = document.getElementById('errorText');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('passwordField').value;

            // Hardcoded Check
            if (username === 'admin' && password === 'admin123') {
                console.log("Login Successful: Setting Session");
                
                // --- FIX: Key matches what admin.js looks for ---
                sessionStorage.setItem('isLoggedIn', 'true'); 
                
                // 2. Redirect
                window.location.href = 'admin.html';
            } else {
                // Show Error
                if(errorText) errorText.style.display = 'flex';
                
                // Shake Animation
                const card = document.querySelector('.login-card');
                if (card) {
                    card.style.transform = "translateX(5px)";
                    setTimeout(() => card.style.transform = "translateX(-5px)", 50);
                    setTimeout(() => card.style.transform = "translateX(5px)", 100);
                    setTimeout(() => card.style.transform = "translateX(0)", 150);
                }
            }
        });
    }
});