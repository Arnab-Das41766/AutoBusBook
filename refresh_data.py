
import sqlite3
import random
from datetime import datetime, timedelta

DB_NAME = "autobus.db"

def refresh_db():
    print(f"Connecting to {DB_NAME}...")
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # 1. Clear Bus Related Tables (Keep Users)
    print("Clearing bus tables...")
    cursor.execute("DELETE FROM bookings")
    cursor.execute("DELETE FROM schedules")
    cursor.execute("DELETE FROM routes")
    cursor.execute("DELETE FROM buses")
    cursor.execute("DELETE FROM bus_operators")

    # 2. Seed Operators
    print("Seeding Operators...")
    operators = [
        ('Zingbus', 4.8), ('IntrCity SmartBus', 4.6), ('NueGo', 4.2),
        ('City Express', 3.9), ('Royal Travels', 4.5), ('Metro Glider', 4.1),
        ('Skyline Coaches', 4.7), ('BlueDot Bus', 3.8)
    ]
    
    op_ids = []
    for name, rating in operators:
        cursor.execute("INSERT INTO bus_operators (name, rating) VALUES (?, ?)", (name, rating))
        op_ids.append(cursor.lastrowid)

    # 3. Seed Routes
    print("Seeding Routes...")
    routes_data = [
        ('Delhi', 'Manali', '12h 30m'),
        ('Mumbai', 'Pune', '3h 15m'),
        ('Bangalore', 'Goa', '10h 45m'),
        ('Chennai', 'Bangalore', '6h 00m'),
        ('Hyderabad', 'Vijayawada', '5h 30m'),
        ('Delhi', 'Jaipur', '5h 45m'),
        ('Pune', 'Goa', '9h 15m')
    ]
    
    route_ids = []
    for f, t, d in routes_data:
        cursor.execute("INSERT INTO routes (from_city, to_city, duration) VALUES (?, ?, ?)", (f, t, d))
        route_ids.append(cursor.lastrowid)

    # 4. Seed Buses & Schedules
    print("Seeding Buses & Schedules (Next 10 days)...")
    
    bus_types = ['Volvo Multi-Axle AC Sleeper', 'Scania AC Seater/Sleeper', 'Electric AC Seater', 'Luxury Sleeper Non-AC', 'BharatBenz Glider']
    
    today = datetime.now().date()
    
    # Create a pool of buses
    bus_ids = []
    for i in range(30):
        op_id = random.choice(op_ids)
        b_type = random.choice(bus_types)
        num = f"BUS-{random.randint(1000, 9999)}"
        cursor.execute("INSERT INTO buses (operator_id, bus_number, bus_type) VALUES (?, ?, ?)", (op_id, num, b_type))
        bus_ids.append(cursor.lastrowid)

    count_schedules = 0
    
    for day_offset in range(10): # Next 10 days
        current_date = (today + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        
        for r_idx, route_id in enumerate(route_ids):
            # 20% Chance of NO BUSES for this route on this day (Off day)
            if random.random() < 0.2:
                continue
            
            # 2 to 4 buses per route
            num_trips = random.randint(2, 4)
            
            for _ in range(num_trips):
                bus_id = random.choice(bus_ids)
                
                # Randomize time
                hour = random.randint(6, 22)
                minute = random.choice([0, 15, 30, 45])
                dep_time = f"{hour:02}:{minute:02}"
                
                # Calculate arr time dummy (+5h approx)
                arr_time = f"{(hour+5)%24:02}:{minute:02}" 
                
                price = random.randint(400, 2500)
                
                cursor.execute('''
                    INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, travel_date, price) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (bus_id, route_id, dep_time, arr_time, current_date, price))
                count_schedules += 1

    conn.commit()
    print(f"Database refreshed! Created {len(op_ids)} operators, {len(routes_data)} routes, {len(bus_ids)} buses, {count_schedules} schedules.")
    conn.close()

if __name__ == "__main__":
    refresh_db()
