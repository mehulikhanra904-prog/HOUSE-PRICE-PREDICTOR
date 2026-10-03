
# 🏠 House Price Predictor

<p align="center">
  <strong>AI-powered Indian House Price Prediction Web Application</strong><br/>
  Predict property prices from area, bedrooms, bathrooms, property age, and location.
</p>

<p align="center">
  <a href="https://house-price-predictor-4fsg.vercel.app/"><strong>🚀 Live Demo</strong></a>
  •
  <a href="https://github.com/mehulikhanra904-prog/HOUSE-PRICE-PREDICTOR"><strong>💻 GitHub Repository</strong></a>
</p>

## 📌 Project Overview

**House Price Predictor** is a full-stack Machine Learning project that predicts the estimated price of an Indian residential property from practical property attributes.

The project combines:

- 🤖 Machine Learning
- 🐍 Python
- ⚡ FastAPI
- ⚛️ React
- ⚡ Vite
- 🌳 Random Forest Regression
- 🐼 Pandas
- 🔢 NumPy
- 🧠 Scikit-learn
- 💾 Joblib
- ☁️ Vercel deployment
- 🔌 REST API integration

The goal is to demonstrate an **end-to-end ML application** rather than only a standalone notebook or model.

---

## ✨ Key Features

### 🏡 House Price Prediction

Users provide:

| Input | Description |
|---|---|
| 📐 Area | Property area in square feet |
| 🛏️ Bedrooms | Number of bedrooms |
| 🛁 Bathrooms | Number of bathrooms |
| 🕰️ Age | Approximate property age |
| 📍 Location | City/location of the property |

The application returns:

- 💰 Estimated house price
- 📊 Estimated price per square foot
- 📍 Selected location
- 🧠 Model version

### 📊 Analytics

The backend provides:

- Total number of listings
- Number of cities
- Average price
- Minimum price
- Maximum price
- Average area
- City-wise listing statistics
- City-wise average/minimum/maximum prices

### 🏙️ Location Discovery

The API can return the available locations from the dataset.

### 📦 Batch Prediction

The API supports predicting up to **100 houses in one request**.

### 🛡️ Input Validation

FastAPI/Pydantic validation protects the prediction endpoint from invalid values such as negative area, invalid bedroom/bathroom counts, invalid property age, empty locations, and excessively large inputs.

### 🧠 Model Information

The API exposes information about the trained model, input features, dataset size, estimator count when available, and feature importance when available.

---

## 🧠 Machine Learning Pipeline

~~~text
Housing Dataset
      │
      ▼
Data Loading
      │
      ▼
Feature Selection
      │
      ├── area_sqft
      ├── bedrooms
      ├── bathrooms
      ├── age
      └── location
      │
      ▼
Train / Test Split
      │
      ▼
One-Hot Encoding
for Location
      │
      ▼
Random Forest Regressor
      │
      ▼
Model Evaluation
      │
      ▼
Serialized ML Pipeline
      │
      ▼
FastAPI Prediction API
      │
      ▼
React Frontend
~~~

---

## 🌳 Machine Learning Model

The project uses a Scikit-learn **RandomForestRegressor** with:

~~~text
n_estimators = 300
max_depth = 20
min_samples_split = 2
random_state = 42
n_jobs = -1
~~~

The model is wrapped inside a Scikit-learn Pipeline with preprocessing.

### Categorical Processing

The location feature is categorical and is transformed using OneHotEncoder with unknown-category handling enabled.

### Why a Pipeline?

The pipeline keeps preprocessing and prediction together so that the transformations used during training are also applied during inference.

---

## 📊 Model Evaluation

The training script evaluates the model using:

- **MAE — Mean Absolute Error**
- **RMSE — Root Mean Squared Error**
- **R² — R-squared Score**

Run the training script to reproduce the current evaluation:

~~~bash
python backend/train_model.py
~~~

> Evaluation metrics depend on the dataset and train/test split. They should be regenerated whenever the dataset or model configuration changes.

---

## 🗂️ Project Structure

~~~text
HOUSE-PRICE-PREDICTOR/
│
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── train_model.py
│   └── test_api.py
│
├── dataset/
│   └── housing.csv
│
├── models/
│   └── house_price_model.pkl
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   └── hero.png
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── combine_housing.py
├── pyrightconfig.json
├── requirements.txt
├── vercel.json
└── README.md
~~~

---

# 🔌 API Documentation

The backend is powered by **FastAPI**.

## Base API

When running locally:

~~~text
http://127.0.0.1:8000
~~~

Interactive Swagger documentation:

~~~text
http://127.0.0.1:8000/docs
~~~

---

## 🟢 GET /

Returns API status, version, and supported features.

---

## ❤️ GET /health

Returns API and model health information.

Example:

~~~json
{
  "status": "healthy",
  "model_loaded": true,
  "dataset_rows": 100
}
~~~

The dataset row count is returned dynamically by the API.

---

## 📍 GET /locations

Returns available locations from the dataset.

Example response:

~~~json
{
  "count": 5,
  "locations": [
    "Bangalore",
    "Chennai",
    "Delhi",
    "Kolkata",
    "Mumbai"
  ]
}
~~~

The actual list depends on the current dataset.

---

## 📊 GET /analytics

Returns overall dataset statistics and city-wise statistics.

Includes:

~~~text
dataset
├── rows
├── cities
├── average_price
├── minimum_price
├── maximum_price
└── average_area_sqft

cities[]
├── location
├── listings
├── average_price
├── minimum_price
└── maximum_price
~~~

---

## 🧠 GET /model-info

Returns:

- Model type
- Input features
- Dataset size
- Number of estimators when available
- Feature importance

---

## 💰 POST /predict

Predicts the price of one property.

### Query parameters

~~~text
area_sqft
bedrooms
bathrooms
age
location
~~~

### Example request

~~~text
POST /predict?area_sqft=1500&bedrooms=3&bathrooms=2&age=5&location=Kolkata
~~~

### Example response

~~~json
{
  "location": "Kolkata",
  "predicted_price": 12345678.9,
  "estimated_price_per_sqft": 8223.79,
  "currency": "INR",
  "model_version": "3.0.0"
}
~~~

The numeric prediction above is only an example; the real value is generated by the trained model.

---

## 📦 POST /predict/batch

Predict multiple properties in one request.

Maximum: **100 houses per request**.

Example:

~~~json
[
  {
    "area_sqft": 1500,
    "bedrooms": 3,
    "bathrooms": 2,
    "age": 5,
    "location": "Kolkata"
  },
  {
    "area_sqft": 1000,
    "bedrooms": 2,
    "bathrooms": 2,
    "age": 10,
    "location": "Mumbai"
  }
]
~~~

---

# ⚛️ Frontend

The frontend is built with:

- React 19
- Vite
- JavaScript / JSX
- CSS
- ESLint

### Frontend responsibilities

~~~text
User Input
   │
   ▼
React UI
   │
   ▼
API Request
   │
   ▼
FastAPI Backend
   │
   ▼
ML Model
   │
   ▼
Prediction
   │
   ▼
React Result UI
~~~

---

# ⚡ Backend

The backend uses:

- FastAPI
- Pydantic
- Pandas
- Scikit-learn
- Joblib
- NumPy
- Uvicorn

### Backend responsibilities

1. Load the trained model.
2. Load the housing dataset.
3. Validate user input.
4. Convert request data into a Pandas DataFrame.
5. Run ML inference.
6. Calculate estimated price per square foot.
7. Return structured JSON.
8. Provide analytics and model information.
9. Support batch inference.
10. Provide health-check endpoints.

---

# 🔐 CORS

The FastAPI backend is configured for browser-based requests from the deployed frontend and local development environments.

Credentials are disabled because this public prediction API does not use cookie-based authentication.

For a production application with authentication, CORS should be restricted to known frontend origins.

---

# 🚀 Run Locally

## 1. Clone the repository

~~~bash
git clone https://github.com/mehulikhanra904-prog/HOUSE-PRICE-PREDICTOR.git
cd HOUSE-PRICE-PREDICTOR
~~~

## 2. Create a Python virtual environment

### Windows PowerShell

~~~powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
~~~

### macOS / Linux

~~~bash
python3 -m venv venv
source venv/bin/activate
~~~

## 3. Install Python dependencies

~~~bash
pip install -r requirements.txt
~~~

## 4. Start the FastAPI backend

From the project root:

~~~bash
uvicorn backend.main:app --reload
~~~

Backend:

~~~text
http://127.0.0.1:8000
~~~

Swagger:

~~~text
http://127.0.0.1:8000/docs
~~~

## 5. Start the React frontend

Open another terminal:

~~~bash
cd frontend
npm install
npm run dev
~~~

Vite will provide the local frontend URL, normally:

~~~text
http://localhost:5173
~~~

---

# 🧪 Testing

The project includes API tests using FastAPI TestClient.

Run:

~~~bash
pytest backend/test_api.py -v
~~~

The suite covers:

- ❤️ Health endpoint
- 📍 Location endpoint
- 💰 Single prediction
- 📦 Batch prediction
- 🛡️ Invalid-input rejection

---

# 🔄 Retraining the Model

To train a new model from the current dataset:

~~~bash
python backend/train_model.py
~~~

The script:

1. Loads dataset/housing.csv
2. Selects prediction features
3. Splits data into training and testing sets
4. One-hot encodes location
5. Builds the Random Forest model
6. Trains the model
7. Generates predictions
8. Calculates MAE, RMSE and R²
9. Saves the trained model to models/house_price_model.pkl

---

# 🛠️ Technologies Used

| Category | Technology |
|---|---|
| Language | Python, JavaScript |
| Frontend | React |
| Build Tool | Vite |
| Backend | FastAPI |
| API Server | Uvicorn |
| ML | Scikit-learn |
| Model | Random Forest Regressor |
| Data Processing | Pandas |
| Numerical Computing | NumPy |
| Model Serialization | Joblib |
| Validation | Pydantic |
| Version Control | Git + GitHub |
| Frontend Deployment | Vercel |

---

# ☁️ Deployment

## Frontend — Vercel

### Live URL

👉 **https://house-price-predictor-4fsg.vercel.app/**

The repository includes vercel.json configured for the Vite frontend.

Production build:

~~~bash
cd frontend
npm install
npm run build
~~~

The Vite production output is generated in frontend/dist.

---

# 📁 Important Files

### backend/main.py

Main FastAPI application containing API routes, CORS configuration, model loading, validation, prediction logic, analytics, health checks, and batch inference.

### backend/train_model.py

Machine Learning training and evaluation script.

### backend/test_api.py

Automated API tests.

### dataset/housing.csv

Housing data used by the project.

### models/house_price_model.pkl

Serialized trained Scikit-learn pipeline.

### frontend/src/App.jsx

Main React application.

### frontend/src/App.css

Main application styling.

### vercel.json

Vercel configuration for the Vite frontend.

---

# 🧩 Complete System Architecture

~~~text
                    ┌─────────────────────┐
                    │       User          │
                    │  Property Details   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    React + Vite     │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                         HTTP Request
                               │
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
                       Validate Input
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Scikit-learn      │
                    │      Pipeline       │
                    │                     │
                    │  OneHotEncoder      │
                    │        +            │
                    │ Random Forest       │
                    └──────────┬──────────┘
                               │
                          Prediction
                               │
                               ▼
                    ┌─────────────────────┐
                    │   JSON Response     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Prediction Result   │
                    │    in React UI      │
                    └─────────────────────┘
~~~

---

# 🎯 Project Objectives

This project demonstrates practical understanding of:

- Machine Learning regression
- Feature preprocessing
- Categorical encoding
- Random Forest
- Model serialization
- REST API development
- FastAPI
- Pydantic validation
- React frontend development
- Frontend/backend integration
- CORS configuration
- API testing
- Cloud deployment
- Git/GitHub workflow

---

# 🚧 Future Improvements

Possible next steps:

- 📈 Historical price-trend visualization
- 🗺️ Interactive city/map analytics
- 📊 Advanced feature engineering
- 🧪 Larger and more representative datasets
- 🔬 Hyperparameter tuning
- 🤖 Model comparison dashboard
- 📉 Prediction intervals / uncertainty estimates
- 🔐 Authentication and user accounts
- 🗃️ Prediction history
- 📱 More responsive mobile UX
- 🧪 Frontend automated tests
- ⚙️ CI/CD pipeline
- 🐳 Dockerized backend deployment
- 📊 ML experiment tracking

---

# ⚠️ Disclaimer

This application provides **machine-learning estimates** based on the available dataset and selected input features.

It should not be treated as:

- A certified property valuation
- Financial advice
- A replacement for a real-estate professional
- A guarantee of an actual sale price

Actual property prices can depend on many additional factors, including exact locality, road access, construction quality, floor level, amenities, market conditions, demand, legal status, and other variables.

---

# 🤝 Contributing

Contributions are welcome.

### Suggested workflow

1. Fork the repository.
2. Create a feature branch.

~~~bash
git checkout -b feature/your-feature
~~~

3. Make your changes.
4. Test the application.
5. Commit your changes.

~~~bash
git add .
git commit -m "feat: describe your change"
~~~

6. Push your branch.

~~~bash
git push origin feature/your-feature
~~~

7. Open a Pull Request.

---

# 🐛 Reporting Issues

If you find a bug or have a feature request, open an issue in the GitHub repository and include:

- What happened
- Expected behavior
- Steps to reproduce
- Browser / OS
- Relevant error message
- Screenshot, if useful

---

# 📜 License

No separate license file is currently included in the repository.

If this project is intended for open-source distribution, adding an explicit license such as MIT is recommended.

---

# 👨‍💻 Author

**Mehuli Khanra**

B.Tech CSE Student • Aspiring AI Engineer • Full-Stack Developer

# ⭐ Support the Project

If you find this project useful for learning Machine Learning, FastAPI, React, or deployment:

⭐ Star the repository  
🍴 Fork the repository  
🐛 Report issues  
💡 Suggest improvements  
🤝 Contribute

---

<p align="center">
  <strong>🏠 House Price Predictor</strong><br/>
  Built with Python • FastAPI • Scikit-learn • React • Vite
</p>
