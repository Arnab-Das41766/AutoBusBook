
import sqlite3
import datetime

conn = sqlite3.connect('autobus.db')
cursor = conn.cursor()

# Check schedules
print("--- Current Schedules ---")
cursor.execute("SELECT id, travel_date, departure_time FROM schedules")
schedules = cursor.fetchall()
for s in schedules:
    print(s)

# Check routes
print("\n--- Available Routes ---")
cursor.execute("SELECT * FROM routes")
routes = cursor.fetchall()
for r in routes:
    print(r)

conn.close()
