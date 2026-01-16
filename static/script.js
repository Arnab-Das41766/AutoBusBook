
// --- Global State ---
const API_BASE = '/api';

// --- Utilities ---
function formatMoney(amount) {
    return '₹' + amount;
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// --- Auth Check ---
async function checkAuth() {
    try {
        const res = await fetch('/api/me');
        const data = await res.json();
        const nav = document.querySelector('nav');
        if (data.authenticated) {
            nav.innerHTML = `
                <span style="margin-right:15px; color:#333; font-weight:500;">Hi, ${data.name}</span>
                <a href="#" onclick="logout()" class="nav-link">Logout</a>
            `;
        } else {
            nav.innerHTML = `<a href="/login" class="nav-link">Login / Signup</a>`;
        }
        return data.authenticated;
    } catch (e) {
        console.error("Auth check failed", e);
        return false;
    }
}

async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
}

// --- Page: Search (Index) ---
async function searchBuses(e) {
    if (e) e.preventDefault();

    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const resultsDiv = document.getElementById('results');

    if (!resultsDiv) return; // Not on search page

    resultsDiv.innerHTML = '<div class="loader">Searching best buses for you...</div>';

    try {
        const res = await fetch(`/api/search?from=${from}&to=${to}&date=${date}`);
        const buses = await res.json();

        resultsDiv.innerHTML = '';

        if (buses.length === 0) {
            resultsDiv.innerHTML = '<div class="no-results">No buses found for this route/date via our partners. <br>Try changing the date.</div>';
            return;
        }

        buses.forEach(bus => {
            const card = document.createElement('div');
            card.className = 'bus-card';
            card.innerHTML = `
                <div class="bus-info">
                    <div class="bus-company">
                        <h3>${bus.operator}</h3>
                        <span class="rating">★ ${bus.rating}</span>
                    </div>
                    <div class="bus-type">${bus.bus_type}</div>
                    <div class="bus-route-time">
                        <div class="time-loc">
                            <strong>${bus.departure_time}</strong>
                            <span>${bus.from_city}</span>
                        </div>
                        <div class="duration-strip">
                            <span class="dur-line"></span>
                            <span class="dur-text">${bus.duration}</span>
                        </div>
                        <div class="time-loc">
                            <strong>${bus.arrival_time}</strong>
                            <span>${bus.to_city}</span>
                        </div>
                    </div>
                </div>
                <div class="bus-price-action">
                    <div class="price">
                        <span class="amount">₹${bus.price}</span>
                        <span class="label">per seat</span>
                    </div>
                    <button class="primary" onclick="selectSeats(${bus.id})">Select Seats</button>
                    <div class="seats-left">${Math.floor(Math.random() * 15) + 5} Seats Left</div>
                </div>
            `;
            resultsDiv.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = '<div style="color:red; text-align:center;">Failed to load results.</div>';
    }
}

function selectSeats(scheduleId) {
    window.location.href = `/seats?id=${scheduleId}`;
}

// --- Page: Seat Selection ---
if (window.location.pathname === '/seats') {
    const scheduleId = getQueryParam('id');
    const seatMap = document.getElementById('seat-map');
    const summaryText = document.getElementById('summary-text');
    const bookBtn = document.getElementById('book-btn');
    const header = document.getElementById('bus-header');

    let selectedSeats = [];
    let pricePerSeat = 0;

    async function loadSeatMap() {
        try {
            // 1. Get Schedule Details
            const sRes = await fetch(`/api/schedule/${scheduleId}`);
            const schedule = await sRes.json();

            if (schedule.error) {
                alert("Invalid Schedule");
                window.location.href = '/';
                return;
            }

            pricePerSeat = schedule.price;
            header.innerHTML = `
                <h1>${schedule.operator}</h1>
                <p>${schedule.from_city} → ${schedule.to_city} | ${schedule.departure_time}</p>
            `;

            // 2. Get Booked Seats
            const bRes = await fetch(`/api/seats/${scheduleId}`);
            const bData = await bRes.json();
            const bookedSeats = new Set(bData.booked);

            // 3. Render Map (Simple 2x2 layout for 40 seats)
            seatMap.innerHTML = '';

            // Driver Cabin
            const driver = document.createElement('div');
            driver.className = 'driver-cabin';
            driver.innerText = 'Driver';
            seatMap.appendChild(driver);

            // Seats Container
            const seatsGrid = document.createElement('div');
            seatsGrid.className = 'seats-grid';

            // 10 Rows, 4 Columns (A, B || aisle || C, D)
            const rows = 10;
            const cols = ['A', 'B', 'C', 'D'];

            for (let r = 1; r <= rows; r++) {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'seat-row';

                cols.forEach(c => {
                    const seatNum = `${r}${c}`;
                    const seat = document.createElement('div');
                    seat.className = 'seat';
                    seat.innerText = seatNum;

                    if (bookedSeats.has(seatNum)) {
                        seat.classList.add('booked');
                    } else {
                        seat.onclick = () => toggleSeat(seat, seatNum);
                    }

                    if (c === 'B') {
                        seat.style.marginRight = '30px'; // Aisle
                    }

                    rowDiv.appendChild(seat);
                });
                seatsGrid.appendChild(rowDiv);
            }
            seatMap.appendChild(seatsGrid);

        } catch (e) {
            console.error(e);
            header.innerText = "Error loading bus details.";
        }
    }

    function toggleSeat(el, num) {
        if (selectedSeats.includes(num)) {
            selectedSeats = selectedSeats.filter(s => s !== num);
            el.classList.remove('selected');
        } else {
            if (selectedSeats.length >= 6) {
                alert("Max 6 seats per booking.");
                return;
            }
            selectedSeats.push(num);
            el.classList.add('selected');
        }
        updateSummary();
    }

    function updateSummary() {
        if (selectedSeats.length === 0) {
            summaryText.innerText = "No seats selected";
            bookBtn.disabled = true;
            bookBtn.innerText = "Select Seats";
        } else {
            const total = selectedSeats.length * pricePerSeat;
            summaryText.innerHTML = `Selected: <strong>${selectedSeats.join(', ')}</strong> <br> Total: ₹${total}`;
            bookBtn.disabled = false;
            bookBtn.innerText = `Proceed to Book (₹${total})`;
        }
    }

    bookBtn.onclick = async () => {
        // Go to Booking Details directly (Auth check happens there on Pay)
        sessionStorage.setItem('currentBooking', JSON.stringify({ scheduleId, selectedSeats, pricePerSeat }));
        window.location.href = '/booking-details';
    };

    loadSeatMap();
}

// --- Page: Booking Details ---
if (window.location.pathname === '/booking-details') {
    const data = JSON.parse(sessionStorage.getItem('currentBooking'));
    if (!data) {
        window.location.href = '/';
    }

    const { scheduleId, selectedSeats, pricePerSeat } = data;
    const passengerList = document.getElementById('passenger-list');
    const totalPriceEl = document.getElementById('total-price');

    document.getElementById('booking-summary-card').innerHTML = `
        <h3>Booking for ${selectedSeats.length} Passengers</h3>
        <p>Seats: ${selectedSeats.join(', ')}</p>
    `;

    totalPriceEl.innerText = formatMoney(selectedSeats.length * pricePerSeat);

    // Generate Forms
    selectedSeats.forEach((seat, index) => {
        const div = document.createElement('div');
        div.className = 'passenger-row-form';
        div.style.marginBottom = '1.5rem';
        div.style.padding = '1rem';
        div.style.background = '#f9f9f9';
        div.style.borderRadius = '8px';

        div.innerHTML = `
            <h4>Passenger ${index + 1} (Seat ${seat})</h4>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <input type="text" placeholder="Full Name" required minlength="3" class="p-name" data-seat="${seat}">
                <input type="number" placeholder="Age" required min="1" max="120" class="p-age">
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
                <input type="email" placeholder="Email ID" required class="p-email">
                <input type="tel" placeholder="Phone (Optional)" class="p-phone">
            </div>
            <div style="margin-top:10px;">
                <label style="margin-right:15px;"><input type="radio" name="g-${seat}" value="Male" checked> Male</label>
                <label><input type="radio" name="g-${seat}" value="Female"> Female</label>
            </div>
        `;
        passengerList.appendChild(div);
    });

    // Restore saved passengers if any
    const savedPassengers = JSON.parse(sessionStorage.getItem('pendingPassengers'));
    if (savedPassengers) {
        savedPassengers.forEach(p => {
            const row = document.querySelector(`.p-name[data-seat="${p.seat}"]`).closest('.passenger-row-form');
            if (row) {
                row.querySelector('.p-name').value = p.name || '';
                row.querySelector('.p-age').value = p.age || '';
                row.querySelector('.p-email').value = p.email || '';
                row.querySelector('.p-phone').value = p.phone || '';
                row.querySelector(`input[name="g-${p.seat}"][value="${p.gender}"]`).checked = true;
            }
        });
        sessionStorage.removeItem('pendingPassengers'); // Clear after restoring
    }

    // Global function for form submission
    window.submitBooking = async function (e) {
        e.preventDefault();

        const passengers = [];
        const rows = document.querySelectorAll('.passenger-row-form');

        rows.forEach(row => {
            const name = row.querySelector('.p-name').value;
            const age = row.querySelector('.p-age').value;
            const email = row.querySelector('.p-email').value;
            const phone = row.querySelector('.p-phone').value;
            const seat = row.querySelector('.p-name').dataset.seat;
            const gender = row.querySelector(`input[name="g-${seat}"]:checked`).value;

            passengers.push({ name, age, email, phone, gender, seat });
        });

        // --- Auth Check on Payment ---
        const isAuth = await checkAuth();
        if (!isAuth) {
            // Save state and redirect
            alert("Please login to complete your booking.");
            sessionStorage.setItem('pendingPassengers', JSON.stringify(passengers));
            window.location.href = `/login?redirect=/booking-details`;
            return;
        }

        // --- SHOW PAYMENT MODAL ---
        const totalAmount = selectedSeats.length * pricePerSeat;
        document.getElementById('pay-amount').innerText = formatMoney(totalAmount);
        document.getElementById('payment-modal').style.display = 'flex';

        // Store for verify step
        window.pendingBookingData = {
            scheduleId,
            seats: selectedSeats,
            passengers
        };
    };

    // Called by Modal "I have Paid" button
    window.verifyPayment = async function () {
        const btn = document.getElementById('verify-payment-btn');
        const origText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "Verifying Payment...";

        // Simulate Gateway Delay
        await new Promise(r => setTimeout(r, 2000));

        try {
            const res = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(window.pendingBookingData)
            });

            const result = await res.json();

            if (res.ok) {
                sessionStorage.removeItem('currentBooking');
                window.location.href = `/ticket/${result.ticketId}`;
            } else {
                alert(result.error);
                btn.disabled = false;
                btn.innerText = "Retry Payment";
                if (res.status === 409) {
                    window.location.href = `/seats?id=${window.pendingBookingData.scheduleId}`;
                }
            }
        } catch (err) {
            console.error(err);
            alert("Payment verification failed. Check connection.");
            btn.disabled = false;
            btn.innerText = origText;
        }
    };

    window.closePaymentModal = function () {
        document.getElementById('payment-modal').style.display = 'none';
    };
}

// --- Page: Ticket ---
if (window.location.pathname.startsWith('/ticket/')) {
    const ticketId = window.location.pathname.split('/').pop();

    async function loadTicket() {
        try {
            const res = await fetch(`/api/ticket/${ticketId}`);
            const data = await res.json();

            if (data.error) {
                document.getElementById('ticket-details-loader').innerText = "Ticket not found or access denied.";
                return;
            }

            document.getElementById('ticket-content').style.display = 'block';
            document.getElementById('ticket-details-loader').style.display = 'none';
            document.getElementById('ticket-body').style.display = 'block';

            document.getElementById('t-operator').innerText = data.operator;
            document.getElementById('t-route').innerText = `${data.from_city} to ${data.to_city}`;
            document.getElementById('t-pnr').innerText = `AB-${data.id}${new Date(data.created_at || Date.now()).getFullYear()}`; // Fake PNR
            document.getElementById('t-date').innerText = data.travel_date;
            document.getElementById('t-time').innerText = data.departure_time;
            document.getElementById('t-amount').innerText = data.total_amount;

            const pList = document.getElementById('t-passengers');
            pList.innerHTML = '';

            let passengers = data.passengers;
            if (typeof passengers === 'string') passengers = JSON.parse(passengers);

            passengers.forEach(p => {
                const row = document.createElement('div');
                row.className = 'passenger-row';
                row.innerHTML = `
                    <span>${p.name} (${p.gender}, ${p.age}y)</span>
                    <strong>Seat ${p.seat}</strong>
                `;
                pList.appendChild(row);
                pList.appendChild(row);
            });

            // --- QR Code Generation ---
            const pnr = document.getElementById('t-pnr').innerText;
            let qrData = `PNR: ${pnr}\nRoute: ${data.from_city} to ${data.to_city}\nDate: ${data.travel_date}\n\nPassengers:\n`;

            passengers.forEach(p => {
                const contact = p.phone ? `Ph: ${p.phone}` : (p.email || '');
                qrData += `- ${p.name} (${p.age}, ${p.gender}) | Seat: ${p.seat} | ${contact}\n`;
            });

            document.getElementById('qrcode').innerHTML = ""; // Clear prev
            new QRCode(document.getElementById("qrcode"), {
                text: qrData,
                width: 128,
                height: 128
            });

        } catch (e) {
            console.error(e);
        }
    }
    loadTicket();
}

// Init
checkAuth();
