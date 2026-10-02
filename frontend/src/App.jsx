import { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    area_sqft: "",
    bedrooms: "",
    bathrooms: "",
    age: "",
    location: "Kolkata",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Ahmedabad",
    "Kolkata",
    "Jaipur",
    "Chandigarh",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setPrediction(null);
    setError("");

    try {
      const params = new URLSearchParams({
        area_sqft: formData.area_sqft,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        age: formData.age,
        location: formData.location,
      });

      const response = await fetch(
        `${(import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "")}/predict?${params.toString()}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();

      setPrediction(data.predicted_price);
    } catch (err) {
      setError("Unable to connect to the prediction server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">

        <div className="header">
          <h1>🏠 Indian House Price Predictor</h1>
          <p>
            Predict house prices across major Indian cities using Machine Learning
          </p>
        </div>

        <div className="card">

          <form onSubmit={handleSubmit}>

            <div className="grid">

              <div className="input-group">
                <label>Area (sq ft)</label>

                <input
                  type="number"
                  name="area_sqft"
                  value={formData.area_sqft}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  min="100"
                  required
                />
              </div>


              <div className="input-group">
                <label>Bedrooms</label>

                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  min="1"
                  required
                />
              </div>


              <div className="input-group">
                <label>Bathrooms</label>

                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                  min="1"
                  required
                />
              </div>


              <div className="input-group">
                <label>Property Age (years)</label>

                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  min="0"
                  required
                />
              </div>


              <div className="input-group full-width">
                <label>City</label>

                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

            </div>


            <button type="submit" disabled={loading}>
              {loading
                ? "Predicting..."
                : "Predict House Price"}
            </button>

          </form>


          {prediction !== null && (
            <div className="result">

              <p>Estimated House Price</p>

              <h2>
                ₹{prediction.toLocaleString("en-IN")}
              </h2>

              <span>
                {formData.location}
              </span>

            </div>
          )}


          {error && (
            <div className="error">
              {error}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default App;