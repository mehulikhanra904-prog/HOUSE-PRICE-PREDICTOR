import pandas as pd
import joblib
import os
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==============================
# 1. Load Dataset
# ==============================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

dataset_path = os.path.join(
    BASE_DIR,
    "dataset",
    "housing.csv"
)

model_path = os.path.join(
    BASE_DIR,
    "models",
    "house_price_model.pkl"
)

df = pd.read_csv(dataset_path)

print("Dataset loaded successfully!")

print("\nDataset shape:")
print(df.shape)

print("\nCities:")
print(df["location"].value_counts())


# ==============================
# 2. Select Features
# ==============================

X = df[
    [
        "area_sqft",
        "bedrooms",
        "bathrooms",
        "age",
        "location"
    ]
]

y = df["price"]

print("\nFeatures:")
print(X.head())

print("\nTarget:")
print(y.head())


# ==============================
# 3. Split Dataset
# ==============================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==============================
# 4. Preprocessing
# ==============================

categorical_features = ["location"]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "location",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        )
    ],
    remainder="passthrough"
)


# ==============================
# 5. Create Random Forest Model
# ==============================

model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        (
            "regressor",
            RandomForestRegressor(
                n_estimators=300,
                max_depth=20,
                min_samples_split=2,
                random_state=42,
                n_jobs=-1
            )
        )
    ]
)


# ==============================
# 6. Train Model
# ==============================

print("\nTraining Random Forest model...")

model.fit(X_train, y_train)

print("Random Forest model trained successfully!")


# ==============================
# 7. Make Predictions
# ==============================

predictions = model.predict(X_test)

print("\nFirst 10 predictions:")
print(predictions[:10])

print("\nFirst 10 actual prices:")
print(y_test.values[:10])


# ==============================
# 8. Model Evaluation
# ==============================

mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = np.sqrt(
    mean_squared_error(
        y_test,
        predictions
    )
)

r2 = r2_score(
    y_test,
    predictions
)

print("\n==============================")
print("RANDOM FOREST MODEL EVALUATION")
print("==============================")

print("MAE:", mae)
print("RMSE:", rmse)
print("R² Score:", r2)


# ==============================
# 9. Save Model
# ==============================

joblib.dump(
    model,
    model_path
)

print("\nRandom Forest model saved successfully!")
print("Model path:", model_path)