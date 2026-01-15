// Auth Check
async function checkAuth() {
    const res = await fetch('/api/me');
    const data = await res.json();
    const nav = document.querySelector('nav');
    // Keep Home link, update the rest
    if (data.authenticated) {
        nav.innerHTML = `
            <a href="/">Home</a>
            <span style="margin-left:20px; color:#555">Welcome, ${data.name}</span>
            <a href="#" onclick="logout()">Logout</a>
        `;
    } else {
        nav.innerHTML = `
            <a href="/">Home</a>
            <a href="/login" style="font-weight:bold; color:var(--primary)">Login</a>
        `;
    }
    return data.authenticated;
}

async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
}

async function searchBuses(e) {
    if (e) e.preventDefault();

    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;

    const res = await fetch(`/api/search?from=${from}&to=${to}&date=${date}`);
    const data = await res.json();

    const container = document.getElementById('results');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666">No buses found for this route.</p>';
        return;
    }

    data.forEach(bus => {
        const div = document.createElement('div');
        div.className = 'bus-card';
        div.innerHTML = `
            <div class="bus-info">
                <h3>${bus.operator} <span style="font-size:0.8rem; color:#fbc02d">★ ${bus.rating}</span></h3>
                <div class="bus-meta">${bus.bus_type} | ${bus.duration}</div>
                <div><strong>${bus.departure_time}</strong> (${bus.from_city}) ➝ <strong>${bus.arrival_time}</strong> (${bus.to_city})</div>
            </div>
            <div class="bus-action">
                <div class="bus-price">₹${bus.price}</div>
                <button class="primary" onclick="window.location.href='/seats?scheduleId=${bus.id}'">Select Seats</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (window.location.pathname === '/') {
        // Only auto-search if not redirecting or fresh load
        // But for this simple app, let's just search if elements exist
        if (document.getElementById('results')) searchBuses();
    }
});


// Seat Selection Logic
if (window.location.pathname === '/seats') {
    const params = new URLSearchParams(window.location.search);
    const scheduleId = params.get('scheduleId');
    let selectedSeats = [];
    let pricePerSeat = 0;

    (async () => {
        // Fetch Details
        const res = await fetch(`/api/schedule/${scheduleId}`);
        const schedule = await res.json();
        pricePerSeat = schedule.price;

        document.getElementById('bus-header').innerHTML = `
            <h2>${schedule.from_city} to ${schedule.to_city}</h2>
            <p>${schedule.operator} | ${schedule.travel_date} | ${schedule.departure_time}</p>
        `;

        // Fetch Booked Seats
        const res2 = await fetch(`/api/seats/${scheduleId}`);
        const { booked } = await res2.json();

        // Render Seats (Mock 40 seats)
        const layout = document.getElementById('seat-map');
        for (let i = 1; i <= 40; i++) {
            const num = i + 'A'; // Simplified naming
            const seat = document.createElement('div');
            seat.className = `seat ${booked.includes(num) ? 'booked' : ''}`;
            seat.textContent = num;
            if (!booked.includes(num)) {
                seat.onclick = () => toggleSeat(seat, num);
            }
            layout.appendChild(seat);

            // Render Aisle after every 2 seats
            if (i % 2 === 0 && i % 4 !== 0) {
                const aisle = document.createElement('div');
                aisle.style.width = '20px';
                layout.appendChild(aisle);
            }
        }
    })();

    function toggleSeat(el, num) {
        if (selectedSeats.includes(num)) {
            selectedSeats = selectedSeats.filter(s => s !== num);
            el.classList.remove('selected');
        } else {
            selectedSeats.push(num);
            el.classList.add('selected');
        }
        updateSummary();
    }

    function updateSummary() {
        const total = selectedSeats.length * pricePerSeat;
        document.getElementById('summary-text').innerHTML = `
            Selected: ${selectedSeats.join(', ') || 'None'}<br>
            Total: <strong>₹${total}</strong>
        `;
        document.getElementById('book-btn').disabled = selectedSeats.length === 0;
    }

    document.getElementById('book-btn').onclick = async () => {
        // Authenticate before booking
        const auth = await checkAuth();
        if (!auth) {
            alert("Please login to book tickets.");
            window.location.href = '/login';
            return;
        }

        const res = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scheduleId: scheduleId,
                seats: selectedSeats
            })
        });
        const data = await res.json();
        if (data.message === 'Booking successful') {
            alert(`Booking Confirmed!\nTicket ID: ${data.ticketId}`);
            window.location.href = '/';
        } else {
            alert('Error booking: ' + data.error);
        }
    };
}
