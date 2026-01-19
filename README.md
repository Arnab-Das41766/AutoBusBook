# AutoBusBook

A premium intercity bus booking platform built with **Python (Flask)** and **Vanilla JavaScript**.

## 🚀 Features

### 🚌 Bus Search & Booking
- **Wide Network**: Search buses between major Indian cities (Delhi, Manali, Mumbai, Pune, Bangalore, Goa, etc.).
- **Smart Simulation**: 
  - Dynamic scheduling for the next 10 days.
  - Realistic availability with 8+ operators (Zingbus, IntrCity, NueGo, etc.).
  - Simulates sold-out days and varying prices.
- **Seat Selection**: Interactive seat map (40-seater layout) with dynamic pricing.
- **Ticket Cancellation**: 
  - Users can cancel upcoming trips.
  - Seats are automatically released back to the pool.
  - Email notifications for cancellations.

### 👤 User Dashboard
- **My Bookings**: View history of all past and upcoming trips.
- **Smart Profile**: Dropdown menu for quick access to bookings and logout.
- **Authentication**: Secure Login/Registration with OTP (Mock/Email) verification.

### 🛡️ Admin Panel
- **Dashboard**: Visual stats for Total Revenue, Bookings, and Routes.
- **Route Management**: Add new city-to-city routes.
- **Schedule Management**: Assign buses to routes for specific dates.
- **Booking Overview**: View all user bookings in a comprehensive list.

### 🛠️ Tech Stack
- **Backend**: Python 3, Flask, SQLite.
- **Frontend**: HTML5, CSS3 (Custom Glassmorphism Design), Vanilla JS, GSAP Animations.
- **Database**: SQLite (`autobus.db`).

---

## 🛠️ Setup & Run

### 1. Prerequisites
- Python 3.8+ installed.

### 2. Initial Setup
1.  **Clone/Navigate** to the project folder:
    ```bash
    cd AutoBusBook
    ```
2.  **Install Dependencies**:
    ```bash
    pip install flask python-dotenv
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory for Email functionality:
    ```env
    SMTP_SERVER=smtp.gmail.com
    SMTP_PORT=587
    SMTP_EMAIL=your-email@gmail.com
    SMTP_PASSWORD=your-app-password
    # Optional: Set server to 'localhost' to mock emails in terminal logs
    ```

### 3. Initialize Database
Run the app once to create the database, or use the refresh script to populate initial simulated data:

```bash
python refresh_data.py
```

### 4. Admin Access
The default admin user is seeded automatically:
- **Email**: `testuser@gmail.com`
- **Login**: Use the OTP login flow. The system recognizes the admin email and grants access to the `/admin` panel.

### 5. Run Application
Start the Flask server:

```bash
python app.py
```
Access the app at **http://localhost:5000**

---

## 📂 Project Structure

- `app.py`: Main Flask application (Routes, API, Database Logic).
- `refresh_data.py`: Script to seed/reset database with simulated bus data.
- `static/`: CSS and Client-side JavaScript.
- `templates/`: HTML Templates (Jinja2).
- `autobus.db`: SQLite Database file.

---
**Developed by AutoBusBook Team**
