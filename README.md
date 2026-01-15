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

### 🔐 Authentication
- **Secure Login**: OTP-based login via Email.
- **Registration**: Captures Name, Age, Phone (Unique constraints enforced).
- **Split-Screen UI**: Modern OYO-inspired design for Login/Register pages.

### 🛠️ Tech Stack
- **Backend**: Python 3, Flask, SQLite.
- **Frontend**: HTML5, CSS3 (Custom Design System), Vanilla JS.
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
2.  **Install Dependencies** (Using standard libs + Flask):
    ```bash
    pip install flask python-dotenv
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory for Email OTP functionality:
    ```env
    SMTP_SERVER=smtp.gmail.com
    SMTP_PORT=587
    SMTP_EMAIL=your-email@gmail.com
    SMTP_PASSWORD=your-app-password
    ```

### 3. Initialize Database
Run the app once to create the database, or use the refresh script to populate initial simulated data (Routes, Schedules, Buses):

```bash
python refresh_data.py
```
*Note: This script generates schedules for the next 10 days.*

### 4. Run Application
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
