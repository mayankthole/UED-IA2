// ============================================
// Dashboard Management
// ============================================

function loadDashboardData() {
    const user = getCurrentUser();
    if (!user) return;
    
    const bookings = user.bookings || [];
    const now = new Date();
    
    // Calculate stats
    const totalBookings = bookings.length;
    const activeTickets = bookings.filter(b => {
        const tripDate = new Date(b.date);
        return tripDate >= now;
    }).length;
    const upcomingTrips = activeTickets;
    
    // Update stats
    const totalBookingsEl = document.getElementById('totalBookings');
    const activeTicketsEl = document.getElementById('activeTickets');
    const upcomingTripsEl = document.getElementById('upcomingTrips');
    
    if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
    if (activeTicketsEl) activeTicketsEl.textContent = activeTickets;
    if (upcomingTripsEl) upcomingTripsEl.textContent = upcomingTrips;
    
    // Load upcoming trips
    loadUpcomingTrips(bookings);
    
    // Load recent bookings
    loadRecentBookings(bookings);
}

function loadUpcomingTrips(bookings) {
    const container = document.getElementById('upcomingTripsList');
    if (!container) return;
    
    const now = new Date();
    const upcoming = bookings
        .filter(b => {
            const tripDate = new Date(b.date);
            return tripDate >= now;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p class="no-data">No upcoming trips scheduled</p>';
        return;
    }
    
    container.innerHTML = upcoming.map(booking => `
        <div class="trip-item" role="listitem">
            <div class="trip-info">
                <strong>${booking.train || 'Train'}</strong>
                <span class="trip-date">${new Date(booking.date).toLocaleDateString()}</span>
                <span class="trip-route">${booking.origin || ''} → ${booking.destination || ''}</span>
            </div>
            <a href="mytickets.html" class="btn-secondary btn-small">View</a>
        </div>
    `).join('');
}

function loadRecentBookings(bookings) {
    const container = document.getElementById('recentBookingsList');
    if (!container) return;
    
    const recent = bookings
        .sort((a, b) => new Date(b.bookingDate || b.date) - new Date(a.bookingDate || a.date))
        .slice(0, 3);
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="no-data">No recent bookings</p>';
        return;
    }
    
    container.innerHTML = recent.map(booking => `
        <div class="booking-item" role="listitem">
            <div class="booking-info">
                <strong>${booking.bookingRef || 'N/A'}</strong>
                <span class="booking-date">${new Date(booking.bookingDate || booking.date).toLocaleDateString()}</span>
                <span class="booking-route">${booking.origin || ''} → ${booking.destination || ''}</span>
            </div>
            <a href="history.html" class="btn-secondary btn-small">View</a>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAuth === 'function' && !requireAuth()) {
        return;
    }
    
    loadDashboardData();
});

