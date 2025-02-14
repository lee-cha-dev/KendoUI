import random
from datetime import datetime, timedelta
import csv
import numpy as np

# Global data pools
CUSTOMS_OFFICES = [
    "Port Terminal A", "Port Terminal B", "Airport Main", "Airport Cargo",
    "Land Border North", "Land Border South", "Central Processing",
    "Warehouse District", "Special Economic Zone", "Express Cargo Hub"
]

BUILDING_TYPES = [
    "Office Complex", "Warehouse", "Inspection Facility",
    "Cold Storage", "Data Center", "Laboratory"
]

EQUIPMENT_TYPES = [
    "X-ray Scanner", "HVAC System", "Lighting", "Computer Systems",
    "Security Systems", "Refrigeration Units", "Conveyor Systems"
]

DEPARTMENTS = [
    "Passenger Processing", "Cargo Inspection", "Administration",
    "Risk Assessment", "Special Operations", "Document Verification"
]

def generate_timestamp(start_date, end_date):
    """Generate a random timestamp between start and end date"""
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + timedelta(days=random_number_of_days)

    # Add random hour and minute
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    return random_date.replace(hour=hour, minute=minute)

def generate_consumption_data(base_value, variation_percentage=0.2):
    """Generate realistic consumption data with seasonal and daily patterns"""
    # Add random variation
    variation = random.uniform(-variation_percentage, variation_percentage)
    consumption = base_value * (1 + variation)

    # Add some noise for realism
    noise = np.random.normal(0, base_value * 0.05)
    return max(0, consumption + noise)

def generate_cost(consumption, base_rate=0.12):
    """Calculate cost based on consumption with varying rates"""
    # Add some rate variation based on time of day and season
    rate_variation = random.uniform(-0.03, 0.05)
    rate = base_rate + rate_variation
    return consumption * rate

def generate_dataset(num_records):
    """Generate the complete dataset"""
    # Initialize output list
    data = []

    # Set date range (past 2 years)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=730)

    # Base consumption values for different building types
    building_base_consumption = {
        "Office Complex": 500,
        "Warehouse": 800,
        "Inspection Facility": 1200,
        "Cold Storage": 1500,
        "Data Center": 2000,
        "Laboratory": 1000
    }

    # Generate records
    for _ in range(num_records):
        # Generate basic record data
        office = random.choice(CUSTOMS_OFFICES)
        building = random.choice(BUILDING_TYPES)
        equipment = random.choice(EQUIPMENT_TYPES)
        department = random.choice(DEPARTMENTS)
        timestamp = generate_timestamp(start_date, end_date)

        # Generate consumption based on building type
        base_consumption = building_base_consumption[building]

        # Adjust consumption based on time patterns
        hour_multiplier = 1.0
        if timestamp.hour >= 9 and timestamp.hour <= 17:  # Business hours
            hour_multiplier = 1.3
        elif timestamp.hour >= 23 or timestamp.hour <= 4:  # Night hours
            hour_multiplier = 0.6

        # Seasonal adjustment (higher in summer and winter months)
        month = timestamp.month
        season_multiplier = 1.2 if month in [1, 2, 7, 8] else 1.0

        # Calculate final consumption
        consumption = generate_consumption_data(
            base_consumption * hour_multiplier * season_multiplier
        )

        # Calculate cost
        cost = generate_cost(consumption)

        # Create record
        record = {
            'timestamp': timestamp.strftime('%Y-%m-%d %H:%M'),
            'customs_office': office,
            'building_type': building,
            'equipment_type': equipment,
            'department': department,
            'consumption_kwh': round(consumption, 2),
            'cost_usd': round(cost, 2),
            'peak_load': consumption > base_consumption * 1.2,
            'efficiency_score': round(random.uniform(0.7, 1.0), 2)
        }

        data.append(record)

    return data

def save_to_csv(data, filename='data/customs_electricity_data.csv'):
    """Save the generated data to a CSV file"""
    with open(filename, 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

if __name__ == "__main__":
    # Generate 150,000 records
    print("Generating dataset...")
    dataset = generate_dataset(150000)

    # Save to CSV
    print("Saving to CSV...")
    save_to_csv(dataset)

    print("Dataset generation complete!")

    # Print sample statistics
    print("\nSample Statistics:")
    total_consumption = sum(record['consumption_kwh'] for record in dataset)
    total_cost = sum(record['cost_usd'] for record in dataset)
    print(f"Total Consumption: {total_consumption:,.2f} kWh")
    print(f"Total Cost: ${total_cost:,.2f}")
    print(f"Average Consumption per Record: {total_consumption/len(dataset):,.2f} kWh")
    print(f"Average Cost per Record: ${total_cost/len(dataset):,.2f}")