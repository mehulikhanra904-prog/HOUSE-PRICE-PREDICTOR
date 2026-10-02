from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import os

app = FastAPI(
    title="House Price Prediction API",
    description="Indian House Price Prediction using Machine Learning",
    version="2.0.0"
)

# ==============================
# CORS
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# Load Model
# ==============================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

model_path = os.path.join(
    BASE_DIR,
    "models",
    "house_price_model.pkl"
)

model = joblib.load(model_path)


# ==============================
# Home
# ==============================

@app.get("/")
def home():
    return {
        "message": "Indian House Price Prediction API is running!"
    }


# ==============================
# Prediction
# ==============================

@app.post("/predict")
def predict_price(
    area_sqft: float,
    bedrooms: int,
    bathrooms: int,
    age: int,
    location: str
):

    house_data = pd.DataFrame([{
        "area_sqft": area_sqft,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "age": age,
        "location": location
    }])

    prediction = model.predict(house_data)

    return {
        "location": location,
        "predicted_price": round(float(prediction[0]), 2)
    }