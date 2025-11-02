// ============================================
// Seat Selection Handler
// ============================================

let selectedSeats = [];
let maxSeats = 6; // Maximum seats that can be selected

// Seat layout data
const seatLayout = {
    lower: Array.from({ length: 18 }, (_, i) => ({
        number: `LB-${i + 1}`,
        available: Math.random() > 0.3, // 70% available
        disabled: Math.random() < 0.1 // 10% disabled
    })),
    middle: Array.from({ length: 18 }, (_, i) => ({
        number: `MB-${i + 1}`,
        available: Math.random() > 0.3,
        disabled: Math.random() < 0.1
    })),
    upper: Array.from({ length: 18 }, (_, i) => ({
        number: `UB-${i + 1}`,
        available: Math.random() > 0.3,
        disabled: Math.random() < 0.1
    }))
};

// Get passenger count from search data
function getPassengerCount() {
    const searchData = sessionStorage.getItem('searchData');
    if (searchData) {
        try {
            const data = JSON.parse(searchData);
            return parseInt(data.passengers) || 2;
        } catch (e) {
            return 2;
        }
    }
    return 2;
}

// Initialize seat selection
function initializeSeats() {
    const passengers = getPassengerCount();
    maxSeats = passengers;

    // Render lower berth seats
    renderSeats('lower', seatLayout.lower);
    
    // Render middle berth seats
    renderSeats('middle', seatLayout.middle);
    
    // Render upper berth seats
    renderSeats('upper', seatLayout.upper);

    // Update selected seats display
    updateSelectedSeatsDisplay();

    // Load train info from URL or session
    loadTrainInfo();

    // Update confirm button state
    updateConfirmButton();
}

// Render seats for a berth type
function renderSeats(berthType, seats) {
    const container = document.querySelector(`.berth-type:nth-of-type(${berthType === 'lower' ? 1 : berthType === 'middle' ? 2 : 3}) .seats-grid`);
    if (!container) return;

    container.innerHTML = '';
    
    seats.forEach(seat => {
        const button = document.createElement('button');
        button.className = 'seat-button';
        button.type = 'button';
        button.textContent = seat.number;
        button.setAttribute('data-seat', seat.number);
        button.setAttribute('aria-label', `${seat.number} seat`);
        
        if (!seat.available) {
            button.disabled = true;
            button.classList.add('occupied-seat');
            button.setAttribute('aria-label', `${seat.number} seat - Occupied`);
        } else if (seat.disabled) {
            button.disabled = true;
            button.classList.add('disabled-seat');
            button.setAttribute('aria-label', `${seat.number} seat - Not available`);
        } else {
            button.setAttribute('tabindex', '0');
            button.addEventListener('click', () => toggleSeatSelection(seat.number));
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSeatSelection(seat.number);
                }
            });
        }
        
        container.appendChild(button);
    });
}

// Toggle seat selection
function toggleSeatSelection(seatNumber) {
    const index = selectedSeats.indexOf(seatNumber);
    const passengers = getPassengerCount();
    
    if (index > -1) {
        // Deselect
        selectedSeats.splice(index, 1);
    } else {
        // Select
        if (selectedSeats.length >= passengers) {
            // Show message that max seats reached
            const message = `You can select up to ${passengers} seat(s) for ${passengers} passenger(s).`;
            alert(message);
            return;
        }
        selectedSeats.push(seatNumber);
    }
    
    updateSeatButtons();
    updateSelectedSeatsDisplay();
    updateConfirmButton();
    
    // Announce to screen readers
    const announcement = index > -1 
        ? `${seatNumber} seat deselected. ${selectedSeats.length} seat(s) selected.`
        : `${seatNumber} seat selected. ${selectedSeats.length} seat(s) selected.`;
    
    announceToScreenReader(announcement);
}

// Update seat button states
function updateSeatButtons() {
    document.querySelectorAll('.seat-button').forEach(button => {
        const seatNumber = button.getAttribute('data-seat');
        if (seatNumber) {
            if (selectedSeats.includes(seatNumber)) {
                button.classList.add('selected');
                button.setAttribute('aria-pressed', 'true');
                button.setAttribute('aria-label', `${seatNumber} seat - Selected`);
            } else {
                button.classList.remove('selected');
                button.setAttribute('aria-pressed', 'false');
                const originalLabel = button.getAttribute('data-original-label') || `${seatNumber} seat`;
                button.setAttribute('aria-label', originalLabel);
            }
        }
    });
}

// Update selected seats display
function updateSelectedSeatsDisplay() {
    const display = document.getElementById('selectedSeatsList');
    if (!display) return;

    if (selectedSeats.length === 0) {
        display.innerHTML = '<p class="no-selection">No seats selected yet</p>';
        display.setAttribute('aria-live', 'polite');
    } else {
        const passengers = getPassengerCount();
        const seatsList = selectedSeats.map(seat => 
            `<span class="selected-seat-item" role="listitem">${seat}</span>`
        ).join('');
        
        display.innerHTML = `
            <div role="list" aria-label="Selected seats">
                ${seatsList}
            </div>
            <p class="help-text" style="margin-top: 0.5rem;">
                ${selectedSeats.length} of ${passengers} seat(s) selected
            </p>
        `;
    }
}

// Update confirm button state
function updateConfirmButton() {
    const button = document.getElementById('confirmSeatsBtn');
    const help = document.getElementById('confirmSeatsHelp');
    const passengers = getPassengerCount();
    
    if (!button) return;
    
    if (selectedSeats.length === 0) {
        button.disabled = true;
        button.setAttribute('aria-describedby', 'confirmSeatsHelp');
        if (help) {
            help.textContent = 'Please select at least one seat to continue';
        }
    } else if (selectedSeats.length < passengers) {
        button.disabled = false;
        button.setAttribute('aria-describedby', 'confirmSeatsHelp');
        if (help) {
            help.textContent = `You have selected ${selectedSeats.length} seat(s). You can select up to ${passengers} seat(s) or proceed.`;
        }
    } else {
        button.disabled = false;
        button.setAttribute('aria-describedby', 'confirmSeatsHelp');
        if (help) {
            help.textContent = `${passengers} seat(s) selected. Ready to confirm.`;
        }
    }
}

// Load train information
function loadTrainInfo() {
    // Get train info from URL params
    const params = new URLSearchParams(window.location.search);
    const train = params.get('train') || 'Rajdhani Express';
    const trainNo = params.get('trainNo') || '12345';
    
    // Update display
    const trainEl = document.getElementById('selectedTrain');
    const trainNoEl = document.getElementById('selectedTrainNo');
    const dateEl = document.getElementById('selectedDate');
    const passengersEl = document.getElementById('selectedPassengers');
    
    if (trainEl) trainEl.textContent = train;
    if (trainNoEl) trainNoEl.textContent = trainNo;
    
    // Get date from search data
    const searchData = sessionStorage.getItem('searchData');
    if (searchData) {
        try {
            const data = JSON.parse(searchData);
            if (dateEl) {
                dateEl.textContent = new Date(data.date).toLocaleDateString();
            }
            if (passengersEl) {
                passengersEl.textContent = data.passengers;
            }
        } catch (e) {
            if (dateEl) dateEl.textContent = new Date().toLocaleDateString();
            if (passengersEl) passengersEl.textContent = '2';
        }
    } else {
        if (dateEl) dateEl.textContent = new Date().toLocaleDateString();
        if (passengersEl) passengersEl.textContent = '2';
    }
}

// Handle confirm button
function handleConfirmSeats() {
    const passengers = getPassengerCount();
    
    if (selectedSeats.length === 0) {
        alert('Please select at least one seat to continue.');
        return;
    }
    
    // Get train info
    const params = new URLSearchParams(window.location.search);
    const train = params.get('train') || 'Rajdhani Express';
    const trainNo = params.get('trainNo') || '12345';
    
    // Get times based on train
    const trainTimes = {
        'Rajdhani Express': { departure: '08:00', arrival: '20:30' },
        'Shatabdi Express': { departure: '10:15', arrival: '21:30' },
        'Duronto Express': { departure: '14:30', arrival: '03:30' }
    };
    
    const times = trainTimes[train] || trainTimes['Rajdhani Express'];
    
    // Save booking data
    const bookingData = {
        train: train,
        trainNo: trainNo,
        seats: selectedSeats.join(', '),
        departure: times.departure,
        arrival: times.arrival
    };
    
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Navigate to confirmation
    window.location.href = 'confirmation.html';
}

// Screen reader announcement
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeSeats();
    
    const confirmBtn = document.getElementById('confirmSeatsBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleConfirmSeats);
    }
});

// Export for global access
window.toggleSeatSelection = toggleSeatSelection;

