// ============================================
// Tickets Management
// ============================================

function loadTickets(filter = 'all') {
    const user = getCurrentUser();
    if (!user) return;
    
    const bookings = user.bookings || [];
    const now = new Date();
    
    let filteredBookings = bookings;
    
    if (filter === 'upcoming') {
        filteredBookings = bookings.filter(b => {
            const tripDate = new Date(b.date);
            return tripDate >= now;
        });
    } else if (filter === 'past') {
        filteredBookings = bookings.filter(b => {
            const tripDate = new Date(b.date);
            return tripDate < now;
        });
    }
    
    displayTickets(filteredBookings);
}

function displayTickets(bookings) {
    const container = document.getElementById('ticketsList');
    const noTickets = document.getElementById('noTickets');
    
    if (!container) return;
    
    if (bookings.length === 0) {
        container.style.display = 'none';
        if (noTickets) noTickets.style.display = 'block';
        return;
    }
    
    if (noTickets) noTickets.style.display = 'none';
    container.style.display = 'block';
    
    container.innerHTML = bookings.map(booking => {
        const tripDate = new Date(booking.date);
        const now = new Date();
        const isUpcoming = tripDate >= now;
        const status = isUpcoming ? 'Upcoming' : 'Completed';
        const statusClass = isUpcoming ? 'status-upcoming' : 'status-completed';
        
        return `
            <article class="ticket-card" role="listitem">
                <div class="ticket-header">
                    <div class="ticket-ref">
                        <span class="ref-label">Booking Ref:</span>
                        <span class="ref-value">${booking.bookingRef || 'N/A'}</span>
                    </div>
                    <span class="ticket-status ${statusClass}">${status}</span>
                </div>
                
                <div class="ticket-body">
                    <div class="ticket-train">
                        <h3>${booking.train || 'Train'}</h3>
                        <span class="train-number">${booking.trainNo || 'N/A'}</span>
                    </div>
                    
                    <div class="ticket-route">
                        <div class="route-item">
                            <span class="route-label"><span class="route-icon" aria-hidden="true">📍</span> From</span>
                            <span class="route-value">${booking.origin || 'N/A'}</span>
                        </div>
                        <div class="route-item">
                            <span class="route-label"><span class="route-icon" aria-hidden="true">📍</span> To</span>
                            <span class="route-value">${booking.destination || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="ticket-details">
                        <div class="detail-item">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">📅</span> Date</span>
                            <span class="detail-value">${tripDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">⏰</span> Departure</span>
                            <span class="detail-value">${booking.departure || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">⏰</span> Arrival</span>
                            <span class="detail-value">${booking.arrival || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">🪑</span> Seats</span>
                            <span class="detail-value">${booking.seats || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">👥</span> Passengers</span>
                            <span class="detail-value">${booking.passengers || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"><span class="detail-icon" aria-hidden="true">💰</span> Fare</span>
                            <span class="detail-value price">₹ ${(booking.fare || 0).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ticket-actions">
                    ${isUpcoming ? `
                        <button onclick="window.print()" class="btn-secondary">
                            <span class="btn-icon" aria-hidden="true">🖨️</span>
                            Print Ticket
                        </button>
                        <button onclick="cancelTicket('${booking.bookingRef}')" class="btn-secondary">
                            <span class="btn-icon" aria-hidden="true">❌</span>
                            Cancel
                        </button>
                    ` : ''}
                    <button onclick="viewTicketDetails('${booking.bookingRef}')" class="btn-primary">
                        <span class="btn-icon" aria-hidden="true">👁️</span>
                        View Details
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

function cancelTicket(bookingRef) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const user = getCurrentUser();
        if (!user) return;
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.email === user.email);
        
        if (userIndex !== -1) {
            const bookingIndex = users[userIndex].bookings.findIndex(b => b.bookingRef === bookingRef);
            if (bookingIndex !== -1) {
                users[userIndex].bookings[bookingIndex].status = 'cancelled';
                localStorage.setItem('users', JSON.stringify(users));
                alert('Booking cancelled successfully');
                loadTickets();
            }
        }
    }
}

function viewTicketDetails(bookingRef) {
    // Store booking ref and navigate to a details page or show in modal
    sessionStorage.setItem('viewBookingRef', bookingRef);
    // Could navigate to a details page or show modal
    alert(`Booking Reference: ${bookingRef}\n\nDetailed view can be implemented here.`);
}

// Filter buttons
document.addEventListener('DOMContentLoaded', () => {
    if (typeof requireAuth === 'function' && !requireAuth()) {
        return;
    }
    
    loadTickets('all');
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            
            // Update button states
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            e.target.classList.add('active');
            e.target.setAttribute('aria-pressed', 'true');
            
            loadTickets(filter);
        });
    });
});

window.cancelTicket = cancelTicket;
window.viewTicketDetails = viewTicketDetails;

