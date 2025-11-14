import random
import csv
from datetime import datetime, timedelta

BASE_RATE = 5
LUNCH_START, LUNCH_END = 12, 15
DINNER_START, DINNER_END = 19, 22
LUNCH_MULTIPLIER = 5
DINNER_MULTIPLIER = 7

ENDPOINTS = [
    "/restaurants",
    "/foods",
    "/orders",
    "/users"
]

def traffic_rate(hour):
    rate = BASE_RATE

    if LUNCH_START <= hour < LUNCH_END:
        rate *= LUNCH_MULTIPLIER
    if DINNER_START <= hour < DINNER_END:
        rate *= DINNER_MULTIPLIER

    return max(1, int(rate * random.uniform(0.8, 1.2)))

def generate_range(start_date, end_date):
    rows = []
    
    current_day = start_date
    while current_day <= end_date:
        start = datetime(current_day.year, current_day.month, current_day.day, 0, 0)
        end = start + timedelta(days=1)
        current = start

        while current < end:
            hour = current.hour
            rpm = traffic_rate(hour)

            rows.append({
                "timestamp": current.replace(microsecond=0).isoformat(),
                "requests": rpm,
                "endpoint": random.choice(ENDPOINTS)
            })

            current += timedelta(minutes=1)

        current_day += timedelta(days=1)

    return rows

def save_csv(rows, filename="traffic_5days.csv"):
    with open(filename, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"Saved {len(rows)} rows to {filename}")

if __name__ == "__main__":
    start_date = datetime(2025, 11, 8).date()
    end_date   = datetime(2025, 11, 12).date()

    data = generate_range(start_date, end_date)
    save_csv(data)
