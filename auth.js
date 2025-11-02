// ============================================
// Authentication Management
// ============================================

// Initialize demo user if no users exist
function initializeDemoUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
        users.push({
            email: 'demo@example.com',
            password: 'demo123',
            name: 'Demo User',
            phone: '',
            address: '',
            bookings: [],
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Get current logged in user
function getCurrentUser() {
    const currentEmail = localStorage.getItem('currentUser');
    if (!currentEmail) return null;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.email === currentEmail) || null;
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Login function
function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', email);
        return { success: true, user };
    }
    return { success: false, message: 'Invalid email or password' };
}

// Signup function
function signup(name, email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
    }
    
    // Create new user
    const newUser = {
        email,
        password,
        name,
        phone: '',
        address: '',
        bookings: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', email);
    
    return { success: true, user: newUser };
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Update user data
function updateUser(userData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentEmail = localStorage.getItem('currentUser');
    const userIndex = users.findIndex(u => u.email === currentEmail);
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData };
        localStorage.setItem('users', JSON.stringify(users));
        return { success: true };
    }
    return { success: false };
}

// Add booking to user
function addBookingToUser(booking) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === user.email);
    
    if (userIndex !== -1) {
        if (!users[userIndex].bookings) {
            users[userIndex].bookings = [];
        }
        users[userIndex].bookings.push({
            ...booking,
            bookingId: `IR-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
            bookingDate: new Date().toISOString(),
            status: 'confirmed'
        });
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    }
    return false;
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const emailError = document.getElementById('emailError');
        const passwordError = document.getElementById('passwordError');
        
        // Clear previous errors
        emailError.textContent = '';
        passwordError.textContent = '';
        
        // Validation
        let isValid = true;
        
        if (!email) {
            emailError.textContent = 'Email is required';
            document.getElementById('email').setAttribute('aria-invalid', 'true');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            emailError.textContent = 'Please enter a valid email';
            document.getElementById('email').setAttribute('aria-invalid', 'true');
            isValid = false;
        }
        
        if (!password) {
            passwordError.textContent = 'Password is required';
            document.getElementById('password').setAttribute('aria-invalid', 'true');
            isValid = false;
        }
        
        if (!isValid) {
            const firstInvalid = [document.getElementById('email'), document.getElementById('password')]
                .find(field => field.getAttribute('aria-invalid') === 'true');
            if (firstInvalid) firstInvalid.focus();
            return;
        }
        
        // Attempt login
        const result = login(email, password);
        
        if (result.success) {
            // Store booking data if it exists
            const bookingData = sessionStorage.getItem('bookingData');
            if (bookingData) {
                try {
                    const booking = JSON.parse(bookingData);
                    addBookingToUser(booking);
                    sessionStorage.removeItem('bookingData');
                } catch (e) {
                    console.error('Error parsing booking data:', e);
                }
            }
            
            // Small delay to show success, then redirect
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 100);
        } else {
            passwordError.textContent = result.message || 'Invalid email or password';
            document.getElementById('password').setAttribute('aria-invalid', 'true');
            document.getElementById('password').focus();
        }
    });
}

// Setup signup form
function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        const nameError = document.getElementById('nameError');
        const emailError = document.getElementById('signupEmailError');
        const passwordError = document.getElementById('signupPasswordError');
        const confirmPasswordError = document.getElementById('confirmPasswordError');
        const termsError = document.getElementById('termsError');
        
        // Clear errors
        [nameError, emailError, passwordError, confirmPasswordError, termsError].forEach(el => {
            if (el) el.textContent = '';
        });
        
        // Validation
        let isValid = true;
        
        if (!name) {
            nameError.textContent = 'Name is required';
            document.getElementById('signupName').setAttribute('aria-invalid', 'true');
            isValid = false;
        }
        
        if (!email) {
            emailError.textContent = 'Email is required';
            document.getElementById('signupEmail').setAttribute('aria-invalid', 'true');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            emailError.textContent = 'Please enter a valid email';
            document.getElementById('signupEmail').setAttribute('aria-invalid', 'true');
            isValid = false;
        }
        
        if (!password) {
            passwordError.textContent = 'Password is required';
            document.getElementById('signupPassword').setAttribute('aria-invalid', 'true');
            isValid = false;
        } else if (password.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters';
            document.getElementById('signupPassword').setAttribute('aria-invalid', 'true');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            confirmPasswordError.textContent = 'Passwords do not match';
            document.getElementById('confirmPassword').setAttribute('aria-invalid', 'true');
            isValid = false;
        }
        
        if (!agreeTerms) {
            termsError.textContent = 'You must agree to the terms and conditions';
            isValid = false;
        }
        
        if (!isValid) {
            const firstInvalid = [
                document.getElementById('signupName'),
                document.getElementById('signupEmail'),
                document.getElementById('signupPassword'),
                document.getElementById('confirmPassword')
            ].find(field => field && field.getAttribute('aria-invalid') === 'true');
            if (firstInvalid) firstInvalid.focus();
            return;
        }
        
        // Attempt signup
        const result = signup(name, email, password);
        
        if (result.success) {
            window.location.href = 'dashboard.html';
        } else {
            emailError.textContent = result.message || 'Registration failed';
            document.getElementById('signupEmail').setAttribute('aria-invalid', 'true');
        }
    });
}

// Check authentication on protected pages
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Display user name in header
function displayUserName() {
    const user = getCurrentUser();
    const userNameElements = document.querySelectorAll('#userName');
    
    userNameElements.forEach(el => {
        if (el && user) {
            el.textContent = `Welcome, ${user.name}`;
        }
    });
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    initializeDemoUser();
    
    // Setup login form if exists
    setupLoginForm();
    
    // Setup signup form if exists
    setupSignupForm();
    
    // Display user name if logged in
    if (isLoggedIn()) {
        displayUserName();
    }
    
    // Check auth on protected pages (pages with dashboard, tickets, history, profile)
    const protectedPages = ['dashboard.html', 'mytickets.html', 'history.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        if (!requireAuth()) {
            return; // Redirected to login
        }
    }
});

// Make logout function global
window.logout = logout;

