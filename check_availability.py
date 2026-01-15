
import sqlite3
from collections import defaultdict

DB_NAME = "autobus.db"

def check_availability():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Get all routes
    cursor.execute("SELECT id, from_city, to_city FROM routes")
    routes = {row[0]: f"{row[1]} -> {row[2]}" for row in cursor.fetchall()}
    
    # Get all schedules
    cursor.execute("SELECT route_id, travel_date FROM schedules ORDER BY travel_date")
    schedules = cursor.fetchall()
    
    availability = defaultdict(set)
    for route_id, date in schedules:
        if route_id in routes:
            availability[routes[route_id]].add(date)
            
    with open("availability_report.txt", "w") as f:
        f.write("\n--- Bus Availability Report ---\n\n")
        for route, dates in availability.items():
            sorted_dates = sorted(list(dates))
            f.write(f"**{route}**\n")
            f.write(f"Available Dates: {', '.join(sorted_dates)}\n")
            f.write("-" * 30 + "\n")
    
    print("Report written to availability_report.txt")

    conn.close()

if __name__ == "__main__":
    check_availability()
