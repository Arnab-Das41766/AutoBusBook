import sqlite3
import json
from flask import Flask, render_template, request, jsonify, g
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = 'super_secret_dev_key_123' # Required for session
DB_NAME = "autobus.db"

# --- Database Setup ---
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DB_NAME)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
        

def init_db():
    with app.app_context():
        db = get_db()
        # Create Tables
        db.executescript('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                age INTEGER,
                phone TEXT UNIQUE,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                otp_code TEXT,
                otp_expiry TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS bus_operators (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                rating REAL DEFAULT 4.0
            );

            CREATE TABLE IF NOT EXISTS buses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operator_id INTEGER NOT NULL,
                bus_number TEXT NOT NULL,
                bus_type TEXT NOT NULL,
                total_seats INTEGER DEFAULT 40,
                FOREIGN KEY (operator_id) REFERENCES bus_operators (id)
            );

            CREATE TABLE IF NOT EXISTS routes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_city TEXT NOT NULL,
                to_city TEXT NOT NULL,
                duration TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bus_id INTEGER NOT NULL,
                route_id INTEGER NOT NULL,
                departure_time TEXT NOT NULL,
                arrival_time TEXT NOT NULL,
                travel_date TEXT NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (bus_id) REFERENCES buses (id),
                FOREIGN KEY (route_id) REFERENCES routes (id)
            );

            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                schedule_id INTEGER NOT NULL,
                seats TEXT NOT NULL, -- JSON list of seat numbers
                passengers TEXT, -- JSON list of passenger details
                total_amount REAL NOT NULL,
                status TEXT DEFAULT 'confirmed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (schedule_id) REFERENCES schedules (id)
            );
        ''')
        
        # Migration 1: Check if otp_code exists in users (for existing DBs)
        try:
            db.execute("SELECT otp_code FROM users LIMIT 1")
        except sqlite3.OperationalError:
            print("Migrating DB: Adding OTP columns...")
            db.execute("ALTER TABLE users ADD COLUMN otp_code TEXT")
            db.execute("ALTER TABLE users ADD COLUMN otp_expiry TIMESTAMP")
            
        # Migration 2: Check if age exists
        try:
            db.execute("SELECT age FROM users LIMIT 1")
        except sqlite3.OperationalError:
            print("Migrating DB: Adding Age column...")
            db.execute("ALTER TABLE users ADD COLUMN age INTEGER")

        # Migration 3: Check if passengers exists in bookings
        try:
            db.execute("SELECT passengers FROM bookings LIMIT 1")
        except sqlite3.OperationalError:
            print("Migrating DB: Adding Passengers column...")
            db.execute("ALTER TABLE bookings ADD COLUMN passengers TEXT")
        
        db.commit()

# --- Seeding Data ---
def seed_data():
    with app.app_context():
        db = get_db()
        
        # 1. Seed Users if empty
        cur = db.execute("SELECT count(*) FROM users")
        if cur.fetchone()[0] == 0:
            print("Seeding Users...")
            db.execute("INSERT INTO users (email, name, phone) VALUES (?, ?, ?)", 
                       ('demo@example.com', 'Demo User', '555-0123'))
        
        # 2. Seed Bus Data if empty OR if extending dates
        # Use a flag to track if we need to insert core data
        cur = db.execute("SELECT count(*) FROM buses")
        buses_exist = cur.fetchone()[0] > 0
        
        bus_ids = []
        route_ids = []
        
        if not buses_exist:
            print("Seeding Initial Bus Data...")
            # Operators
            operators = [
                ('Zingbus', 4.8), ('IntrCity SmartBus', 4.6), ('NueGo', 4.2),
                ('City Express', 3.9), ('Royal Travels', 4.5), ('Metro Glider', 4.1),
                ('Skyline Coaches', 4.7), ('BlueDot Bus', 3.8)
            ]
            op_ids = []
            for name, rating in operators:
                cur = db.execute("INSERT INTO bus_operators (name, rating) VALUES (?, ?)", (name, rating))
                op_ids.append(cur.lastrowid)
            
            # Buses (Pool of 30)
            bus_types = ['Volvo Multi-Axle AC Sleeper', 'Scania AC Seater/Sleeper', 'Electric AC Seater', 'Luxury Sleeper Non-AC', 'BharatBenz Glider']
            for i in range(30):
                op_id = random.choice(op_ids)
                b_type = random.choice(bus_types)
                num = f"BUS-{random.randint(1000, 9999)}"
                cur = db.execute("INSERT INTO buses (operator_id, bus_number, bus_type) VALUES (?, ?, ?)", (op_id, num, b_type))
                bus_ids.append(cur.lastrowid)
            
            # Routes
            routes_data = [
                ('Delhi', 'Manali', '12h 30m'),
                ('Mumbai', 'Pune', '3h 15m'),
                ('Bangalore', 'Goa', '10h 45m'),
                ('Chennai', 'Bangalore', '6h 00m'),
                ('Hyderabad', 'Vijayawada', '5h 30m'),
                ('Delhi', 'Jaipur', '5h 45m'),
                ('Pune', 'Goa', '9h 15m')
            ]
            for f, t, d in routes_data:
                cur = db.execute("INSERT INTO routes (from_city, to_city, duration) VALUES (?, ?, ?)", (f, t, d))
                route_ids.append(cur.lastrowid)
        else:
            # Fetch existing IDs for schedule generation
            cur = db.execute("SELECT id FROM buses")
            bus_ids = [row[0] for row in cur.fetchall()]
            cur = db.execute("SELECT id FROM routes")
            route_ids = [row[0] for row in cur.fetchall()]

        # --- Efficient Schedule Seeding (Ensure 30 Days) ---
        today = datetime.now().date()
        
        # Get existing schedule dates
        cur = db.execute("SELECT DISTINCT travel_date FROM schedules")
        existing_dates = {row[0] for row in cur.fetchall()}
        
        print("Checking schedules for next 30 days...")
        for day_offset in range(30):
            current_date = (today + timedelta(days=day_offset)).strftime("%Y-%m-%d")
            
            if current_date in existing_dates:
                continue # Skip if already exists
                
            print(f"Generating schedules for {current_date}...")
            
            for r_idx, route_id in enumerate(route_ids):
                # 10% Chance of NO BUSES (Off Day) - Reduced from 20%
                if random.random() < 0.1:
                    continue
                
                # 3-6 Trips per day (Increased availability)
                num_trips = random.randint(3, 6)
                for _ in range(num_trips):
                    bus_id = random.choice(bus_ids)
                    hour = random.randint(5, 23) # Extended hours
                    minute = random.choice([0, 15, 30, 45])
                    dep_time = f"{hour:02}:{minute:02}"
                    arr_time = f"{(hour+5)%24:02}:{minute:02}" # Simple +5h logic
                    price = random.randint(400, 2500)
                    
                    db.execute('''
                        INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, travel_date, price) 
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (bus_id, route_id, dep_time, arr_time, current_date, price))
        
        db.commit()

# --- Routes ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/seats')
def seat_selection():
    return render_template('seats.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/booking-details')
def booking_details_page():
    return render_template('booking_details.html')

@app.route('/ticket/<path:path>')
def ticket_page(path):
    return render_template('ticket.html')

# --- Auth APIs ---
from flask import session
import random
from datetime import timedelta
from dotenv import load_dotenv
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from fpdf import FPDF
import io

load_dotenv()

# --- PDF Generation ---
import qrcode
import tempfile

def generate_ticket_pdf(booking_data):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Header
    pdf.set_font("Arial", 'B', 20)
    pdf.set_text_color(209, 46, 46) # Primary Red
    pdf.cell(200, 10, txt="AutoBusBook Ticket", ln=1, align='C')
    pdf.ln(5)
    
    # Booking Checkmark Style
    pdf.set_font("Arial", 'B', 14)
    pdf.set_text_color(0, 128, 0) # Green
    pdf.cell(200, 10, txt="Booking Confirmed", ln=1, align='C')
    pdf.ln(5)
    
    pdf.set_text_color(0, 0, 0) # Reset
    
    # Details Box
    pdf.set_fill_color(245, 245, 245)
    pdf.rect(10, 40, 190, 80, 'F')
    
    pdf.set_font("Arial", 'B', 16)
    pdf.set_xy(15, 45)
    pdf.cell(100, 10, txt=booking_data['operator'])
    
    pdf.set_font("Arial", 'B', 12)
    pdf.set_xy(150, 45)
    pdf.cell(40, 10, txt=f"PNR: AB-{booking_data['id']}", border=1, align='C')
    
    pdf.set_xy(15, 60)
    pdf.set_font("Arial", '', 12)
    pdf.cell(0, 10, txt=f"Route: {booking_data['from_city']} to {booking_data['to_city']}", ln=1)
    
    pdf.set_xy(15, 70)
    pdf.cell(0, 10, txt=f"Date: {booking_data['travel_date']} | Time: {booking_data['departure_time']}", ln=1)
    
    # Passengers
    pdf.set_xy(15, 90)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, txt="Passengers:", ln=1)
    
    pdf.set_font("Arial", '', 11)
    passengers = booking_data['passengers']
    if isinstance(passengers, str):
        passengers = json.loads(passengers)
        
    y = 100
    for p in passengers:
        pdf.set_xy(20, y)
        contact = p.get('phone') or p.get('email', '')
        pdf.cell(0, 8, txt=f"- {p['name']} ({p['gender']}, {p['age']}y) | Seat: {p['seat']} | {contact}", ln=1)
        y += 8
        
    # Total
    pdf.set_xy(15, y + 10)
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, txt=f"Total Paid: Rs. {booking_data['total_amount']}", ln=1, align='R')
    
    # --- Backend QR Code Generation ---
    try:
        qr_data = f"PNR: AB-{booking_data['id']}\nRoute: {booking_data['from_city']} to {booking_data['to_city']}\nDate: {booking_data['travel_date']}\n\nPassengers:\n"
        for p in passengers:
            contact = p.get('phone') or p.get('email', '')
            qr_data += f"- {p['name']} ({p.get('age','')}y) | Seat: {p['seat']} | {contact}\n"
            
        qr = qrcode.make(qr_data)
        
        # Create a temp file for the image
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            qr.save(tmp.name)
            tmp_path = tmp.name
            
        # Add Image to PDF
        # Center the QR code at the bottom
        pdf.image(tmp_path, x=85, y=y+25, w=40, h=40)
        
        # Cleanup
        try:
            os.remove(tmp_path)
        except:
            pass
            
    except Exception as e:
        print(f"PDF QR Error: {e}")
        # fallback text if QR fails
        pdf.set_xy(15, y + 30)
        pdf.set_font("Arial", 'I', 10)
        pdf.cell(0, 10, txt="(QR Code generation failed, please use PNR)", ln=1, align='C')
    # ----------------------------------
    
    pdf.ln(50) # Spacer for QR
    pdf.set_font("Arial", 'I', 10)
    pdf.cell(0, 10, txt="Thank you for choosing AutoBusBook!", ln=1, align='C')
    
    return pdf.output(dest='S').encode('latin-1') # Return bytes

def send_email(to_email, subject, body, attachment=None):
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    if attachment:
        filename, content = attachment
        part = MIMEApplication(content, Name=filename)
        part['Content-Disposition'] = f'attachment; filename="{filename}"'
        msg.attach(part)
    
    try:
        if smtp_server == 'localhost':
            # Debug Server
            # with smtplib.SMTP(smtp_server, smtp_port) as server:
            #     server.send_message(msg)
            print(f"DEBUG: Sent email to {to_email} (Local Mock)")
        else:
            # Real SMTP
            context = ssl.create_default_context()
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(sender_email, sender_password)
                server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    name = data.get('name')
    age = data.get('age')
    phone = data.get('phone')
    
    if not all([email, name, age, phone]):
        return jsonify({"error": "All fields (email, name, age, phone) are required"}), 400
        
    db = get_db()
    
    # Check if exists
    cur = db.execute("SELECT id FROM users WHERE email = ? OR phone = ?", (email, phone))
    if cur.fetchone():
        return jsonify({"error": "User with this Email or Phone already exists"}), 409
        
    try:
        db.execute("INSERT INTO users (email, name, age, phone) VALUES (?, ?, ?, ?)", 
                   (email, name, age, phone))
        db.commit()
        return jsonify({"message": "Registration successful. Please login."})
    except sqlite3.IntegrityError:
        return jsonify({"error": "Database error: Duplicate entry"}), 409

@app.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    email = request.json.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    db = get_db()
    # Find User
    cur = db.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cur.fetchone()
    
    if not user:
        return jsonify({"error": "User not found. Please register first."}), 404
    
    # Generate OTP
    otp = str(random.randint(100000, 999999))
    expiry = (datetime.now() + timedelta(minutes=5)).strftime('%Y-%m-%d %H:%M:%S')
    
    db.execute("UPDATE users SET otp_code = ?, otp_expiry = ? WHERE email = ?", (otp, expiry, email))
    db.commit()
    
    # SEND EMAIL
    subject = "Your AutoBusBook OTP"
    body = f"Hello,\n\nYour OTP for AutoBusBook login is: {otp}\n\nThis code expires in 5 minutes.\n\nRegards,\nAutoBusBook Team"
    
    # Run in background (simplification: just run it, blocking is fine for demo)
    if not send_email(email, subject, body):
        # Fallback to mock if email fails (optional, but good for stability)
        print(f"[FALLBACK] OTP for {email} is: {otp}")
        return jsonify({"message": "OTP sent (fallback mode)"})
    
    return jsonify({"message": "OTP sent to email"})

@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    
    db = get_db()
    cur = db.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cur.fetchone()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    if user['otp_code'] != otp:
        return jsonify({"error": "Invalid OTP"}), 400
    
    if not user['otp_expiry']:
        return jsonify({"error": "No OTP found"}), 400

    try:
        expiry = datetime.strptime(str(user['otp_expiry']), '%Y-%m-%d %H:%M:%S')
        if expiry < datetime.now():
            return jsonify({"error": "OTP expired"}), 400
    except ValueError:
        # Fallback for legacy generic fallback
         return jsonify({"error": "Invalid OTP Format"}), 500
        
    # Success - Login
    session['user_id'] = user['id']
    session['user_email'] = user['email']
    session['user_name'] = user['name']
    
    # Clear OTP
    db.execute("UPDATE users SET otp_code = NULL WHERE id = ?", (user['id'],))
    db.commit()
    
    return jsonify({"message": "Login successful", "user": {"name": user['name'], "email": user['email']}})


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})

@app.route('/api/me')
def get_current_user():
    if 'user_id' in session:
        return jsonify({
            "authenticated": True, 
            "id": session['user_id'],
            "name": session['user_name'],
            "email": session['user_email']
        })
    return jsonify({"authenticated": False})


@app.route('/api/search')
def api_search():
    from_city = request.args.get('from')
    to_city = request.args.get('to')
    date = request.args.get('date')
    
    query = '''
        SELECT s.id, b.bus_type, bo.name as operator, bo.rating, 
               s.departure_time, s.arrival_time, r.duration, s.price,
               r.from_city, r.to_city
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN bus_operators bo ON b.operator_id = bo.id
        JOIN routes r ON s.route_id = r.id
        WHERE r.from_city LIKE ? AND r.to_city LIKE ? AND s.travel_date = ?
    '''
    
    db = get_db()
    # Flexible search with %
    cur = db.execute(query, (f'%{from_city}%', f'%{to_city}%', date))
    results = [dict(row) for row in cur.fetchall()]
    
    return jsonify(results)

@app.route('/api/schedule/<int:id>')
def api_schedule_details(id):
    query = '''
        SELECT s.id, b.bus_type, bo.name as operator, bo.rating, 
               s.departure_time, s.arrival_time, r.duration, s.price,
               r.from_city, r.to_city, s.travel_date
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN bus_operators bo ON b.operator_id = bo.id
        JOIN routes r ON s.route_id = r.id
        WHERE s.id = ?
    '''
    db = get_db()
    cur = db.execute(query, (id,))
    row = cur.fetchone()
    if row:
        return jsonify(dict(row))
    return jsonify({"error": "Not found"}), 404

@app.route('/api/seats/<int:schedule_id>')
def api_seats(schedule_id):
    # Mock seat availability
    # In a real app, query 'bookings' to find taken seats for this schedule
    db = get_db()
    cur = db.execute("SELECT seats FROM bookings WHERE schedule_id = ?", (schedule_id,))
    data = cur.fetchall()
    
    booked_seats = []
    for row in data:
        booked_seats.extend(json.loads(row['seats']))
        
    return jsonify({"booked": booked_seats})

@app.route('/api/cities')
def api_cities():
    db = get_db()
    # Get uniue cities from both origin and destination
    cur = db.execute("SELECT DISTINCT from_city FROM routes UNION SELECT DISTINCT to_city FROM routes")
    cities = [row[0] for row in cur.fetchall()]
    cities.sort()
    return jsonify(cities)

@app.route('/api/book', methods=['POST'])
def api_book():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized. Please login."}), 401

    data = request.json
    try:
        schedule_id = data.get('scheduleId')
        seat_numbers = data.get('seats') # List of strings e.g. ['2A', '2B']
        passengers = data.get('passengers') # List of dicts
        
        user_id = session['user_id']

        # Calculate Amount
        db = get_db()
        cur = db.execute("SELECT price FROM schedules WHERE id = ?", (schedule_id,))
        sch = cur.fetchone()
        if not sch:
            return jsonify({"error": "Schedule not found"}), 404
        
        total = sch['price'] * len(seat_numbers)
        
        # Verify passenger count matches seats
        if passengers and len(passengers) != len(seat_numbers):
             return jsonify({"error": "Passenger details missing for some seats"}), 400

        # --- CRITICAL: Check for Double Booking ---
        # Get all currently booked seats for this schedule
        cur = db.execute("SELECT seats FROM bookings WHERE schedule_id = ? AND status = 'confirmed'", (schedule_id,))
        rows = cur.fetchall()
        booked_seats = set()
        for row in rows:
            booked_seats.update(json.loads(row['seats']))
        
        # Check if any requested seat is in booked_seats
        for seat in seat_numbers:
            if seat in booked_seats:
                return jsonify({"error": f"Seat {seat} has just been booked by someone else. Please select another seat."}), 409
        # ------------------------------------------

        cur = db.execute('''
            INSERT INTO bookings (user_id, schedule_id, seats, passengers, total_amount, status)
            VALUES (?, ?, ?, ?, ?, 'confirmed')
        ''', (user_id, schedule_id, json.dumps(seat_numbers), json.dumps(passengers) if passengers else None, total))
        db.commit()
        
        booking_id = cur.lastrowid
        
        # --- Send Ticket Email ---
        try:
            # Re-fetch full details for PDF
            query = '''
                SELECT bk.id, bk.total_amount, bk.passengers, bk.seats,
                       s.departure_time, s.travel_date,
                       r.from_city, r.to_city, bo.name as operator
                FROM bookings bk
                JOIN schedules s ON bk.schedule_id = s.id
                JOIN routes r ON s.route_id = r.id
                JOIN buses b ON s.bus_id = b.id
                JOIN bus_operators bo ON b.operator_id = bo.id
                WHERE bk.id = ?
            '''
            cur = db.execute(query, (booking_id,))
            booking_data = dict(cur.fetchone())
            
            pdf_bytes = generate_ticket_pdf(booking_data)
            
            user_email = session.get('user_email')
            if user_email:
                subject = f"Your Ticket - {booking_data['from_city']} to {booking_data['to_city']}"
                body = "Please find attached your ticket."
                send_email(user_email, subject, body, attachment=(f"ticket_{booking_id}.pdf", pdf_bytes))
        except Exception as ex:
            print(f"Email failed: {ex}")
            
        return jsonify({"message": "Booking successful", "ticketId": booking_id})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ticket/<int:id>')
def api_ticket(id):
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    query = '''
        SELECT bk.id, bk.total_amount, bk.passengers, bk.seats,
               s.departure_time, s.travel_date,
               r.from_city, r.to_city, bo.name as operator
        FROM bookings bk
        JOIN schedules s ON bk.schedule_id = s.id
        JOIN routes r ON s.route_id = r.id
        JOIN buses b ON s.bus_id = b.id
        JOIN bus_operators bo ON b.operator_id = bo.id
        WHERE bk.id = ? AND bk.user_id = ?
    '''
    db = get_db()
    cur = db.execute(query, (id, session['user_id']))
    row = cur.fetchone()
    if row:
        data = dict(row)
        # Parse passengers if stored as string
        if isinstance(data['passengers'], str):
            data['passengers'] = json.loads(data['passengers'])
        return jsonify(data)
    return jsonify({"error": "Ticket not found"}), 404

if __name__ == '__main__':
    init_db() # Ensure tables/columns exist
    seed_data()
    print("Starting app...")
    app.run(debug=True, port=5000)
