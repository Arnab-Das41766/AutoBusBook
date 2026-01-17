
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

// --- Theme Logic ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Inject Toggle into Header for ALL pages
    const header = document.querySelector('header .header-content');
    if (header) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle';
        toggleBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
        toggleBtn.onclick = toggleTheme;
        toggleBtn.title = "Toggle Theme";

        // Insert before nav or append
        const nav = header.querySelector('nav');
        if (nav) {
            header.insertBefore(toggleBtn, nav);
        } else {
            header.appendChild(toggleBtn);
        }
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);

    // Update Icon
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.innerHTML = target === 'dark' ? '☀️' : '🌙';
}

// Check on load
document.addEventListener('DOMContentLoaded', initTheme);

// --- Page: Search (Index) ---
async function loadCitySuggestions() {
    try {
        const res = await fetch('/api/cities');
        if (res.ok) {
            const cities = await res.json();
            const dataList = document.getElementById('city-list');
            if (dataList) {
                dataList.innerHTML = cities.map(city => `<option value="${city}">`).join('');
            }
        }
    } catch (e) {
        console.error("Failed to load city suggestions", e);
    }
}

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
        div.className = 'passenger-row-form passenger-card';

        div.innerHTML = `
            <div class="passenger-header">
                <h4>Passenger ${index + 1}</h4>
                <span class="seat-badge">Seat ${seat}</span>
            </div>
            <div class="form-grid">
                <div class="input-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="e.g. John Doe" required minlength="3" class="p-name" data-seat="${seat}">
                </div>
                <div class="input-group">
                    <label>Age</label>
                    <input type="number" placeholder="18+" required min="1" max="120" class="p-age">
                </div>
                <div class="input-group">
                    <label>Email ID</label>
                    <input type="email" placeholder="john@example.com" required class="p-email">
                </div>
                <div class="input-group">
                    <label>Phone (Optional)</label>
                    <input type="tel" placeholder="+91 98765..." class="p-phone">
                </div>
            </div>
            <div class="gender-selection">
                <span class="label">Gender:</span>
                <div class="radio-group">
                    <label class="radio-label">
                        <input type="radio" name="g-${seat}" value="Male" checked>
                        <span>Male</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="g-${seat}" value="Female">
                        <span>Female</span>
                    </label>
                </div>
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
        console.log("Starting submitBooking...");

        try {
            // Validation: Ensure Booking Data Exists
            if (!selectedSeats || selectedSeats.length === 0) {
                alert("Error: No seats selected. Please go back and select seats.");
                console.error("Validation Failed: No seats");
                return;
            }
            if (!pricePerSeat) {
                alert("Error: Invalid price data. Please search again.");
                console.error("Validation Failed: No price");
                return;
            }

            const passengers = [];
            const rows = document.querySelectorAll('.passenger-row-form');

            if (rows.length === 0) {
                alert("Error: No passenger forms found.");
                console.error("Validation Failed: No passenger rows");
                return;
            }

            // Collect Passenger Data
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const name = row.querySelector('.p-name').value;
                const age = row.querySelector('.p-age').value;
                const email = row.querySelector('.p-email').value;
                const phone = row.querySelector('.p-phone').value;
                const seat = row.querySelector('.p-name').dataset.seat;

                // Radio buttons need careful handling
                const genderInput = row.querySelector(`input[name="g-${seat}"]:checked`);
                const gender = genderInput ? genderInput.value : 'Male';

                if (!name || !age || !email) {
                    alert(`Please fill all required fields for Seat ${seat}`);
                    console.warn(`Validation Failed: Missing fields for seat ${seat}`);
                    return;
                }

                passengers.push({ name, age, email, phone, gender, seat });
            }

            console.log("Passengers collected:", passengers);

            // --- Auth Check on Payment ---
            console.log("Checking Auth...");
            const isAuth = await checkAuth();
            console.log("Auth Status:", isAuth);

            if (!isAuth) {
                // Save state and redirect
                alert("Please login to complete your booking.");
                sessionStorage.setItem('pendingPassengers', JSON.stringify(passengers));
                window.location.href = `/login?redirect=/booking-details`;
                return;
            }

            // --- SHOW PAYMENT MODAL ---
            const totalAmount = selectedSeats.length * pricePerSeat;
            console.log("Total Amount:", totalAmount);

            const payAmountEl = document.getElementById('pay-amount');
            const modalEl = document.getElementById('payment-modal');

            if (payAmountEl) payAmountEl.innerText = formatMoney(totalAmount);
            if (modalEl) {
                modalEl.style.display = 'flex';
            } else {
                console.error("Payment Modal element not found!");
                alert("Internal Error: Payment screen missing.");
                return;
            }

            // Store for verify step
            window.pendingBookingData = {
                scheduleId,
                seats: selectedSeats,
                passengers
            };
            console.log("Payment Modal Shown. Pending Data:", window.pendingBookingData);

        } catch (err) {
            console.error("CRITICAL ERROR inside submitBooking:", err);
            alert("An unexpected error occurred during booking: " + err.message);
        }
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
if (document.getElementById('from')) {
    loadCitySuggestions();
}
