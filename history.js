// ============================================
// Booking History Management
// ============================================

function loadHistory(year = 'all') {
    const user = getCurrentUser();
    if (!user) return;
    
    const bookings = user.bookings || [];
    
    let filteredBookings = bookings;
    
    if (year !== 'all') {
        filteredBookings = bookings.filter(b => {
            const bookingYear = new Date(b.bookingDate || b.date).getFullYear().toString();
            return bookingYear === year;
        });
    }
    
    // Sort by booking date (newest first)
    filteredBookings.sort((a, b) => {
        const dateA = new Date(b.bookingDate || b.date);
        const dateB = new Date(a.bookingDate || a.date);
        return dateA - dateB;
    });
    
    displayHistory(filteredBookings);
}

function displayHistory(bookings) {
    const container = document.getElementById('historyList');
    const noHistory = document.getElementById('noHistory');
    
    if (!container) return;
    
    if (bookings.length === 0) {
        container.style.display = 'none';
        if (noHistory) noHistory.style.display = 'block';
        return;
    }
    
    if (noHistory) noHistory.style.display = 'none';
    container.style.display = 'block';
    
    container.innerHTML = bookings.map(booking => {
        const tripDate = new Date(booking.date);
        const bookingDate = new Date(booking.bookingDate || booking.date);
        const now = new Date();
        const isUpcoming = tripDate >= now;
        const status = booking.status || (isUpcoming ? 'confirmed' : 'completed');
        const statusClass = status === 'cancelled' ? 'status-cancelled' : 
                           status === 'completed' ? 'status-completed' : 
                           'status-upcoming';
        
        return `
            <article class="history-card" role="listitem">
                <div class="history-header">
                    <div class="history-ref">
                        <span class="ref-label">Booking Ref:</span>
                        <span class="ref-value">${booking.bookingRef || 'N/A'}</span>
                    </div>
                    <div class="history-meta">
                        <span class="booking-date">Booked on: ${bookingDate.toLocaleDateString()}</span>
                        <span class="history-status ${statusClass}">${status.toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="history-body">
                    <div class="history-train">
                        <h3>${booking.train || 'Train'}</h3>
                        <span class="train-number">${booking.trainNo || 'N/A'}</span>
                    </div>
                    
                    <div class="history-route">
                        <div class="route-section">
                            <span class="route-label">From</span>
                            <span class="route-value">${booking.origin || 'N/A'}</span>
                        </div>
                        <div class="route-arrow" aria-hidden="true">→</div>
                        <div class="route-section">
                            <span class="route-label">To</span>
                            <span class="route-value">${booking.destination || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="history-details-grid">
                        <div class="history-detail">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">📅</span> Travel Date</span>
                            <span class="detail-value">${tripDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div class="history-detail">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">⏰</span> Time</span>
                            <span class="detail-value">${booking.departure || 'N/A'} - ${booking.arrival || 'N/A'}</span>
                        </div>
                        <div class="history-detail">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">🪑</span> Seats</span>
                            <span class="detail-value">${booking.seats || 'N/A'}</span>
                        </div>
                        <div class="history-detail">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">👥</span> Passengers</span>
                            <span class="detail-value">${booking.passengers || 'N/A'}</span>
                        </div>
                        <div class="history-detail">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">🪑</span> Class</span>
                            <span class="detail-value">${booking.class || 'AC 2 Tier'}</span>
                        </div>
                        <div class="history-detail">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">💰</span> Fare</span>
                            <span class="detail-value price">₹ ${(booking.fare || 0).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
                
                <div class="history-actions">
                    ${status !== 'cancelled' ? `
                        <button onclick="window.print()" class="btn-secondary">
                            <span class="btn-icon" aria-hidden="true">🖨️</span>
                            Print
                        </button>
                    ` : ''}
                    <button onclick="viewHistoryDetails('${booking.bookingRef}')" class="btn-primary">
                        <span class="btn-icon" aria-hidden="true">👁️</span>
                        View Details
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

function viewHistoryDetails(bookingRef) {
    sessionStorage.setItem('viewBookingRef', bookingRef);
    alert(`Booking Reference: ${bookingRef}\n\nDetailed view can be implemented here.`);
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAuth === 'function' && !requireAuth()) {
        return;
    }
    
    loadHistory('all');
    
    const yearFilter = document.getElementById('historyYear');
    if (yearFilter) {
        yearFilter.addEventListener('change', (e) => {
            loadHistory(e.target.value);
        });
    }
});

window.viewHistoryDetails = viewHistoryDetails;

