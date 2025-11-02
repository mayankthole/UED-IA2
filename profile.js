// ============================================
// Profile Management
// ============================================

function loadProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Populate form fields
    const nameField = document.getElementById('profileName');
    const emailField = document.getElementById('profileEmail');
    const phoneField = document.getElementById('profilePhone');
    const addressField = document.getElementById('profileAddress');
    
    if (nameField) nameField.value = user.name || '';
    if (emailField) emailField.value = user.email || '';
    if (phoneField) phoneField.value = user.phone || '';
    if (addressField) addressField.value = user.address || '';
    
    // Load preferences
    const notificationsPref = document.getElementById('prefNotifications');
    const seatPref = document.getElementById('prefSeatPref');
    
    if (notificationsPref) notificationsPref.checked = user.preferences?.notifications || false;
    if (seatPref) seatPref.checked = user.preferences?.seatPreference || false;
}

function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;
    
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('profileName').value.trim();
        const phone = document.getElementById('profilePhone').value.trim();
        const address = document.getElementById('profileAddress').value.trim();
        
        const result = updateUser({
            name,
            phone,
            address
        });
        
        if (result.success) {
            alert('Profile updated successfully!');
            displayUserName(); // Update header
        } else {
            alert('Failed to update profile');
        }
    });
}

function setupPreferencesForm() {
    const preferencesForm = document.getElementById('preferencesForm');
    if (!preferencesForm) return;
    
    preferencesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const notifications = document.getElementById('prefNotifications').checked;
        const seatPreference = document.getElementById('prefSeatPref').checked;
        
        const user = getCurrentUser();
        const result = updateUser({
            preferences: {
                notifications,
                seatPreference
            }
        });
        
        if (result.success) {
            alert('Preferences saved successfully!');
        } else {
            alert('Failed to save preferences');
        }
    });
}

function changePassword() {
    const currentPassword = prompt('Enter current password:');
    if (!currentPassword) return;
    
    const user = getCurrentUser();
    if (user.password !== currentPassword) {
        alert('Current password is incorrect');
        return;
    }
    
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
        alert('New password must be at least 6 characters');
        return;
    }
    
    const confirmPassword = prompt('Confirm new password:');
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    const result = updateUser({ password: newPassword });
    if (result.success) {
        alert('Password changed successfully!');
    } else {
        alert('Failed to change password');
    }
}

function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }
    
    if (!confirm('This will permanently delete all your data. Type DELETE to confirm:')) {
        return;
    }
    
    const user = getCurrentUser();
    if (!user) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter(u => u.email !== user.email);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    logout();
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAuth === 'function' && !requireAuth()) {
        return;
    }
    
    loadProfile();
    setupProfileForm();
    setupPreferencesForm();
});

window.changePassword = changePassword;
window.deleteAccount = deleteAccount;

