import os
import pandas as pd
from india_housing_datasets import load_housing

cities = [
    "mumbai",
    "delhi",
    "bangalore",
    "hyderabad",
    "chennai",
    "pune",
    "ahmedabad",
    "kolkata",
    "jaipur",
    "chandigarh",
]
frames = []

for city in cities:
    print(f"Loading {city}...")

    df = load_housing(city)

    converted = pd.DataFrame({
        "area_sqft": df["area_sqft"],
        "bedrooms": df["bhk"],
        "bathrooms": df["bath"],
        "age": df["age_years"],
        "parking": 0,
        "location": df["city"].str.title(),
        "price": df["price_lakhs"] * 100000,
    })

    frames.append(converted)

combined = pd.concat(frames, ignore_index=True)

os.makedirs("dataset", exist_ok=True)

combined.to_csv(
    "dataset/housing.csv",
    index=False
)

print("\nCombined dataset created successfully!")

print("Shape:", combined.shape)

print("\nCities:")
print(combined["location"].value_counts())

print("\nColumns:")
print(combined.columns.tolist())

print("\nFirst 5 rows:")
print(combined.head())