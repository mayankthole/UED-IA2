// ============================================
// Accessibility Settings Manager
// ============================================

class AccessibilitySettings {
    constructor() {
        this.settings = {
            fontSize: 3, // Default (1-5)
            highContrast: false,
            dyslexiaFont: false
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.applySettings();
        this.setupEventListeners();
        this.renderSettingsPanel();
    }

    loadSettings() {
        const saved = localStorage.getItem('accessibilitySettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveSettings() {
        localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        const body = document.body;
        
        // Remove all font size classes
        body.classList.remove('font-size-1', 'font-size-2', 'font-size-3', 'font-size-4', 'font-size-5');
        // Add current font size class
        body.classList.add(`font-size-${this.settings.fontSize}`);
        
        // High contrast
        if (this.settings.highContrast) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
        
        // Dyslexia font
        if (this.settings.dyslexiaFont) {
            body.classList.add('dyslexia-font');
        } else {
            body.classList.remove('dyslexia-font');
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.renderSettingsPanel();
    }

    resetSettings() {
        this.settings = {
            fontSize: 3,
            highContrast: false,
            dyslexiaFont: false
        };
        this.saveSettings();
        this.renderSettingsPanel();
    }

    renderSettingsPanel() {
        const panel = document.getElementById('settingsContent');
        if (!panel) return;

        const fontSizeLabels = ['Small', 'Default', 'Large', 'Extra Large', 'Maximum'];
        
        panel.innerHTML = `
            <div class="setting-group">
                <label for="panelFontSize">Font Size</label>
                <div class="setting-control">
                    <input 
                        type="range" 
                        id="panelFontSize" 
                        min="1" 
                        max="5" 
                        value="${this.settings.fontSize}"
                        aria-label="Font size adjustment"
                        aria-valuemin="1"
                        aria-valuemax="5"
                        aria-valuenow="${this.settings.fontSize}"
                    >
                    <div class="current-value" id="panelFontSizeValue" aria-live="polite">
                        ${fontSizeLabels[this.settings.fontSize - 1]}
                    </div>
                </div>
            </div>

            <div class="setting-group">
                <label>
                    <input 
                        type="checkbox" 
                        id="panelHighContrast" 
                        ${this.settings.highContrast ? 'checked' : ''}
                        aria-describedby="panelHighContrastHelp"
                    >
                    <span class="checkbox-label">High Contrast Mode</span>
                </label>
                <span id="panelHighContrastHelp" class="help-text">
                    Increases color contrast for better visibility
                </span>
            </div>

            <div class="setting-group">
                <label>
                    <input 
                        type="checkbox" 
                        id="panelDyslexiaFont" 
                        ${this.settings.dyslexiaFont ? 'checked' : ''}
                        aria-describedby="panelDyslexiaFontHelp"
                    >
                    <span class="checkbox-label">Dyslexia-Friendly Font</span>
                </label>
                <span id="panelDyslexiaFontHelp" class="help-text">
                    Uses fonts designed for better readability
                </span>
            </div>

            <div class="settings-actions" style="margin-top: 1rem;">
                <button type="button" class="btn-secondary" id="panelResetSettings" aria-label="Reset all settings to defaults">
                    Reset to Defaults
                </button>
            </div>
        `;

        // Add event listeners
        const fontSizeSlider = panel.querySelector('#panelFontSize');
        const fontSizeValue = panel.querySelector('#panelFontSizeValue');
        const highContrastCheckbox = panel.querySelector('#panelHighContrast');
        const dyslexiaFontCheckbox = panel.querySelector('#panelDyslexiaFont');
        const resetButton = panel.querySelector('#panelResetSettings');

        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.updateSetting('fontSize', value);
                fontSizeValue.textContent = fontSizeLabels[value - 1];
                fontSizeSlider.setAttribute('aria-valuenow', value);
            });
        }

        if (highContrastCheckbox) {
            highContrastCheckbox.addEventListener('change', (e) => {
                this.updateSetting('highContrast', e.target.checked);
            });
        }

        if (dyslexiaFontCheckbox) {
            dyslexiaFontCheckbox.addEventListener('change', (e) => {
                this.updateSetting('dyslexiaFont', e.target.checked);
            });
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetSettings();
            });
        }
    }

    setupEventListeners() {
        // Settings panel toggle
        const settingsToggle = document.getElementById('settingsToggle');
        const settingsPanel = document.getElementById('settings-panel');
        const settingsClose = document.getElementById('settingsClose');

        if (settingsToggle && settingsPanel) {
            settingsToggle.addEventListener('click', () => {
                const isHidden = settingsPanel.getAttribute('aria-hidden') === 'true';
                settingsPanel.setAttribute('aria-hidden', !isHidden);
                if (!isHidden) {
                    settingsPanel.querySelector('#settingsContent')?.focus();
                }
            });
        }

        if (settingsClose && settingsPanel) {
            settingsClose.addEventListener('click', () => {
                settingsPanel.setAttribute('aria-hidden', 'true');
                settingsToggle?.focus();
            });
        }

        // Close panel on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && settingsPanel) {
                if (settingsPanel.getAttribute('aria-hidden') === 'false') {
                    settingsPanel.setAttribute('aria-hidden', 'true');
                    settingsToggle?.focus();
                }
            }
        });

        // Close panel when clicking outside
        if (settingsPanel) {
            settingsPanel.addEventListener('click', (e) => {
                if (e.target === settingsPanel) {
                    settingsPanel.setAttribute('aria-hidden', 'true');
                }
            });

            // Prevent closing when clicking inside
            const settingsContent = settingsPanel.querySelector('.settings-content');
            if (settingsContent) {
                settingsContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        }
    }
}

// ============================================
// Form Validation
// ============================================

function setupFormValidation() {
    const searchForm = document.getElementById('searchForm');
    if (!searchForm) return;

    const origin = document.getElementById('origin');
    const destination = document.getElementById('destination');
    const date = document.getElementById('date');
    const passengers = document.getElementById('passengers');

    function validateField(field, errorElement) {
        let isValid = true;
        const value = field.value.trim();

        if (field.hasAttribute('required') && !value) {
            errorElement.textContent = 'This field is required';
            errorElement.setAttribute('role', 'alert');
            field.setAttribute('aria-invalid', 'true');
            isValid = false;
        } else {
            errorElement.textContent = '';
            field.setAttribute('aria-invalid', 'false');
        }

        // Date validation
        if (field.type === 'date' && value) {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                errorElement.textContent = 'Please select a future date';
                field.setAttribute('aria-invalid', 'true');
                isValid = false;
            }
        }

        // Origin and destination should be different
        if (origin && destination && origin.value.trim() && destination.value.trim()) {
            if (origin.value.trim().toLowerCase() === destination.value.trim().toLowerCase()) {
                document.getElementById('destinationError').textContent = 
                    'Origin and destination must be different';
                destination.setAttribute('aria-invalid', 'true');
                isValid = false;
            }
        }

        return isValid;
    }

    function setupFieldValidation(field, errorElement) {
        field.addEventListener('blur', () => validateField(field, errorElement));
        field.addEventListener('input', () => {
            if (field.getAttribute('aria-invalid') === 'true') {
                validateField(field, errorElement);
            }
        });
    }

    if (origin) setupFieldValidation(origin, document.getElementById('originError'));
    if (destination) setupFieldValidation(destination, document.getElementById('destinationError'));
    if (date) setupFieldValidation(date, document.getElementById('dateError'));
    if (passengers) setupFieldValidation(passengers, document.getElementById('passengersError'));

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isOriginValid = validateField(origin, document.getElementById('originError'));
        const isDestinationValid = validateField(destination, document.getElementById('destinationError'));
        const isDateValid = validateField(date, document.getElementById('dateError'));
        const isPassengersValid = validateField(passengers, document.getElementById('passengersError'));

        if (isOriginValid && isDestinationValid && isDateValid && isPassengersValid) {
            // Store search data
            const searchData = {
                origin: origin.value.trim(),
                destination: destination.value.trim(),
                date: date.value,
                passengers: passengers.value
            };
            sessionStorage.setItem('searchData', JSON.stringify(searchData));
            
            // Navigate to results
            window.location.href = 'results.html';
        } else {
            // Focus first invalid field
            const firstInvalid = [origin, destination, date, passengers].find(field => 
                field && field.getAttribute('aria-invalid') === 'true'
            );
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }
    });
}

// ============================================
// Settings Page Handler
// ============================================

function setupSettingsPage() {
    const settingsForm = document.getElementById('settingsForm');
    const fontSizeSlider = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const highContrastCheckbox = document.getElementById('highContrast');
    const dyslexiaFontCheckbox = document.getElementById('dyslexiaFont');
    const resetButton = document.getElementById('resetSettings');

    if (!settingsForm || !accessibilitySettings) return;

    const fontSizeLabels = ['Small', 'Default', 'Large', 'Extra Large', 'Maximum'];

    // Load current settings
    if (fontSizeSlider) {
        fontSizeSlider.value = accessibilitySettings.settings.fontSize;
        if (fontSizeValue) {
            fontSizeValue.textContent = fontSizeLabels[accessibilitySettings.settings.fontSize - 1];
        }
    }

    if (highContrastCheckbox) {
        highContrastCheckbox.checked = accessibilitySettings.settings.highContrast;
    }

    if (dyslexiaFontCheckbox) {
        dyslexiaFontCheckbox.checked = accessibilitySettings.settings.dyslexiaFont;
    }

    // Update font size display
    if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            fontSizeValue.textContent = fontSizeLabels[value - 1];
            accessibilitySettings.updateSetting('fontSize', value);
            fontSizeSlider.setAttribute('aria-valuenow', value);
        });
    }

    if (highContrastCheckbox) {
        highContrastCheckbox.addEventListener('change', (e) => {
            accessibilitySettings.updateSetting('highContrast', e.target.checked);
        });
    }

    if (dyslexiaFontCheckbox) {
        dyslexiaFontCheckbox.addEventListener('change', (e) => {
            accessibilitySettings.updateSetting('dyslexiaFont', e.target.checked);
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            accessibilitySettings.resetSettings();
            
            if (fontSizeSlider) {
                fontSizeSlider.value = 3;
                if (fontSizeValue) {
                    fontSizeValue.textContent = 'Default';
                }
            }
            if (highContrastCheckbox) {
                highContrastCheckbox.checked = false;
            }
            if (dyslexiaFontCheckbox) {
                dyslexiaFontCheckbox.checked = false;
            }
        });
    }
}

// ============================================
// Results Page Handler
// ============================================

function setupResultsPage() {
    const searchData = sessionStorage.getItem('searchData');
    if (!searchData) return;

    try {
        const data = JSON.parse(searchData);
        
        const originEl = document.getElementById('searchOrigin');
        const destinationEl = document.getElementById('searchDestination');
        const dateEl = document.getElementById('searchDate');
        const passengersEl = document.getElementById('searchPassengers');

        if (originEl) originEl.textContent = data.origin;
        if (destinationEl) destinationEl.textContent = data.destination;
        if (dateEl) dateEl.textContent = new Date(data.date).toLocaleDateString();
        if (passengersEl) passengersEl.textContent = data.passengers;
    } catch (e) {
        console.error('Error parsing search data:', e);
    }
}

// ============================================
// Confirmation Page Handler
// ============================================

function setupConfirmationPage() {
    const bookingData = sessionStorage.getItem('bookingData');
    const searchData = sessionStorage.getItem('searchData');

    if (bookingData) {
        try {
            const booking = JSON.parse(bookingData);
            const search = searchData ? JSON.parse(searchData) : {};

            // Set train info
            const trainNameEl = document.getElementById('confirmTrainName');
            const trainNoEl = document.getElementById('confirmTrainNo');
            if (trainNameEl) trainNameEl.textContent = booking.train || 'Rajdhani Express';
            if (trainNoEl) trainNoEl.textContent = booking.trainNo || '12345';

            // Set journey details
            const originEl = document.getElementById('confirmOrigin');
            const destEl = document.getElementById('confirmDestination');
            const dateEl = document.getElementById('confirmDate');
            const deptEl = document.getElementById('confirmDeparture');
            const arrEl = document.getElementById('confirmArrival');

            if (originEl) originEl.textContent = search.origin || 'Mumbai';
            if (destEl) destEl.textContent = search.destination || 'Delhi';
            if (dateEl) {
                const date = new Date(search.date || '2024-12-15');
                dateEl.textContent = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
            if (deptEl) deptEl.textContent = booking.departure || '08:00';
            if (arrEl) arrEl.textContent = booking.arrival || '20:30';

            // Set passenger and seat info
            const passengersEl = document.getElementById('confirmPassengers');
            const seatsEl = document.getElementById('confirmSeats');
            if (passengersEl) passengersEl.textContent = search.passengers || '2';
            if (seatsEl) seatsEl.textContent = booking.seats || 'LB-12, LB-13';

            // Generate booking reference
            const bookingRefEl = document.getElementById('bookingRef');
            if (bookingRefEl) {
                const ref = `IR-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
                bookingRefEl.textContent = ref;
            }

            // Calculate total
            const passengers = parseInt(search.passengers || '2');
            const baseFare = passengers * 2500;
            const serviceCharge = 50;
            const total = baseFare + serviceCharge;
            const totalEl = document.getElementById('confirmTotal');
            if (totalEl) {
                totalEl.textContent = `₹ ${total.toLocaleString('en-IN')}`;
            }
            
            // Save booking to user account if logged in
            if (typeof addBookingToUser === 'function') {
                const bookingData = {
                    train: booking.train || 'Rajdhani Express',
                    trainNo: booking.trainNo || '12345',
                    seats: booking.seats || 'LB-12, LB-13',
                    departure: booking.departure || '08:00',
                    arrival: booking.arrival || '20:30',
                    origin: search.origin || 'Mumbai',
                    destination: search.destination || 'Delhi',
                    date: search.date || new Date().toISOString().split('T')[0],
                    passengers: search.passengers || '2',
                    fare: total,
                    bookingRef: bookingRefEl ? bookingRefEl.textContent : '',
                    coach: 'A2',
                    class: 'AC 2 Tier'
                };
                addBookingToUser(bookingData);
            }
        } catch (e) {
            console.error('Error parsing booking data:', e);
        }
    }
}

// ============================================
// Keyboard Navigation Enhancements
// ============================================

function enhanceKeyboardNavigation() {
    // Enhance train card keyboard navigation
    const trainCards = document.querySelectorAll('.train-card');
    trainCards.forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const button = card.querySelector('.btn-primary');
                if (button) {
                    button.click();
                }
            }
        });
    });

    // Enhance seat button navigation
    const seatButtons = document.querySelectorAll('.seat-button');
    seatButtons.forEach((button, index) => {
        button.addEventListener('keydown', (e) => {
            const buttons = Array.from(seatButtons);
            const currentIndex = buttons.indexOf(button);
            
            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    if (currentIndex < buttons.length - 1) {
                        buttons[currentIndex + 1].focus();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        buttons[currentIndex - 1].focus();
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    // Move down by approximately row width (6 seats per row in this layout)
                    const nextRowIndex = Math.min(currentIndex + 6, buttons.length - 1);
                    buttons[nextRowIndex].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevRowIndex = Math.max(currentIndex - 6, 0);
                    buttons[prevRowIndex].focus();
                    break;
            }
        });
    });
}

// ============================================
// Initialize Everything
// ============================================

let accessibilitySettings;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize accessibility settings
    accessibilitySettings = new AccessibilitySettings();

    // Setup page-specific handlers
    if (document.getElementById('searchForm')) {
        setupFormValidation();
    }

    if (document.getElementById('settingsForm')) {
        setupSettingsPage();
    }

    if (document.getElementById('searchOrigin')) {
        setupResultsPage();
    }

    if (document.getElementById('confirmTrainName')) {
        setupConfirmationPage();
    }

    // Enhance keyboard navigation
    enhanceKeyboardNavigation();

    // Set minimum date to today for date picker
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
});

