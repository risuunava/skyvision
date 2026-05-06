import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
import os

# Create data directory
os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)

# Reproducibility
random.seed(42)
np.random.seed(42)

# Generate 1 year of hourly data
start_date = datetime(2024, 1, 1, 0, 0, 0)
hours = 8760  # 365 days * 24 hours

rows = []
for i in range(hours):
    current_dt = start_date + timedelta(hours=i)
    hour = current_dt.hour
    day_of_week = current_dt.weekday()
    month = current_dt.month

    # Seasonal temperature variation (Indonesia: tropical, 24-35°C)
    base_temp = 28 + 3 * np.sin(2 * np.pi * (month - 3) / 12)
    # Daily variation
    daily_temp = base_temp + 4 * np.sin(2 * np.pi * (hour - 6) / 24)
    temperature = float(np.clip(daily_temp + np.random.normal(0, 1.5), 18, 40))

    # Humidity (60-95%)
    base_humidity = 75 - 5 * np.sin(2 * np.pi * (hour - 6) / 24)
    humidity = float(np.clip(base_humidity + np.random.normal(0, 5), 40, 100))

    # Wind speed (0-60 km/h)
    wind_speed = float(np.clip(abs(np.random.normal(12, 8)), 0, 70))

    # Cloud cover (0-100%)
    cloud_cover = float(np.clip(np.random.beta(2, 3) * 100, 0, 100))

    # Rainfall (0-50 mm) — correlated with cloud cover and humidity
    rain_prob = (cloud_cover / 100) * (humidity / 100)
    rainfall = float(np.random.exponential(5) if random.random() < rain_prob * 0.3 else 0)

    # Weather condition
    if rainfall > 10:
        condition = "Heavy Rain"
    elif rainfall > 0:
        condition = "Light Rain"
    elif cloud_cover > 75:
        condition = "Cloudy"
    elif cloud_cover > 40:
        condition = "Partly Cloudy"
    else:
        condition = "Clear"

    rows.append({
        'timestamp': current_dt.strftime('%Y-%m-%d %H:%M:%S'),
        'hour': hour,
        'day_of_week': day_of_week,
        'month': month,
        'temperature': round(temperature, 2),
        'humidity': round(humidity, 2),
        'wind_speed': round(wind_speed, 2),
        'cloud_cover': round(cloud_cover, 2),
        'rainfall': round(rainfall, 2),
        'weather_condition': condition,
    })

df = pd.DataFrame(rows)
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sample.csv')
df.to_csv(output_path, index=False)
print(f"✅ Generated {len(df)} rows → {output_path}")
print(df.describe())
