from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os
from typing import List

app = FastAPI(
    title="Indian House Price Prediction API",
    description="Machine-learning API for Indian house price prediction, analytics and batch inference.",
    version="3.0.0"
)

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

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "house_price_model.pkl")
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "housing.csv")

model = joblib.load(MODEL_PATH)
dataset = pd.read_csv(DATASET_PATH)

FEATURES = ["area_sqft", "bedrooms", "bathrooms", "age", "location"]


class HouseInput(BaseModel):
    area_sqft: float = Field(gt=0, le=100000)
    bedrooms: int = Field(ge=1, le=20)
    bathrooms: int = Field(ge=1, le=20)
    age: int = Field(ge=0, le=200)
    location: str = Field(min_length=2, max_length=50)


def make_dataframe(item: HouseInput) -> pd.DataFrame:
    return pd.DataFrame([{
        "area_sqft": item.area_sqft,
        "bedrooms": item.bedrooms,
        "bathrooms": item.bathrooms,
        "age": item.age,
        "location": item.location.strip()
    }])


def prediction_details(item: HouseInput) -> dict:
    house_data = make_dataframe(item)
    prediction = float(model.predict(house_data)[0])
    price_per_sqft = prediction / item.area_sqft

    return {
        "location": item.location.strip(),
        "predicted_price": round(prediction, 2),
        "estimated_price_per_sqft": round(price_per_sqft, 2),
        "currency": "INR",
        "model_version": "3.0.0"
    }


@app.get("/")
def home():
    return {
        "message": "Indian House Price Prediction API is running!",
        "version": "3.0.0",
        "features": [
            "single prediction",
            "batch prediction",
            "input validation",
            "city analytics",
            "dataset statistics",
            "model information"
        ]
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "dataset_rows": len(dataset)
    }


@app.get("/locations")
def locations():
    cities = sorted(dataset["location"].dropna().astype(str).unique().tolist())
    return {"count": len(cities), "locations": cities}


@app.get("/analytics")
def analytics():
    grouped = (
        dataset.groupby("location")["price"]
        .agg(["count", "mean", "min", "max"])
        .round(2)
        .reset_index()
    )

    city_stats = [
        {
            "location": row["location"],
            "listings": int(row["count"]),
            "average_price": float(row["mean"]),
            "minimum_price": float(row["min"]),
            "maximum_price": float(row["max"])
        }
        for _, row in grouped.iterrows()
    ]

    return {
        "dataset": {
            "rows": int(len(dataset)),
            "cities": int(dataset["location"].nunique()),
            "average_price": round(float(dataset["price"].mean()), 2),
            "minimum_price": round(float(dataset["price"].min()), 2),
            "maximum_price": round(float(dataset["price"].max()), 2),
            "average_area_sqft": round(float(dataset["area_sqft"].mean()), 2)
        },
        "cities": city_stats
    }


@app.get("/model-info")
def model_info():
    regressor = getattr(model, "named_steps", {}).get("regressor")
    info = {
        "model_type": type(regressor).__name__ if regressor else type(model).__name__,
        "features": FEATURES,
        "dataset_rows": len(dataset)
    }

    if regressor is not None and hasattr(regressor, "n_estimators"):
        info["n_estimators"] = int(regressor.n_estimators)

    try:
        preprocessor = model.named_steps["preprocessor"]
        feature_names = preprocessor.get_feature_names_out().tolist()
        importances = regressor.feature_importances_.tolist()

        ranked = sorted(
            zip(feature_names, importances),
            key=lambda x: x[1],
            reverse=True
        )

        info["feature_importance"] = [
            {"feature": name, "importance": round(float(value), 6)}
            for name, value in ranked
        ]
    except (KeyError, AttributeError, ValueError):
        info["feature_importance"] = []

    return info


@app.post("/predict")
def predict_price(
    area_sqft: float = Query(gt=0, le=100000),
    bedrooms: int = Query(ge=1, le=20),
    bathrooms: int = Query(ge=1, le=20),
    age: int = Query(ge=0, le=200),
    location: str = Query(min_length=2, max_length=50)
):
    item = HouseInput(
        area_sqft=area_sqft,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        age=age,
        location=location
    )

    try:
        return prediction_details(item)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@app.post("/predict/batch")
def predict_batch(houses: List[HouseInput]):
    if not houses:
        raise HTTPException(status_code=400, detail="At least one house is required.")
    if len(houses) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 houses per batch.")

    try:
        return {
            "count": len(houses),
            "predictions": [prediction_details(item) for item in houses]
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {exc}") from exc
