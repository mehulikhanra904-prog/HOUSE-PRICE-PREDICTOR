import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "https://house-price-predictor-4-3oap.onrender.com";

const cities = [
  "Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Pune",
  "Ahmedabad","Kolkata","Jaipur","Chandigarh"
];

const emptyForm = {
  area_sqft: "", bedrooms: "", bathrooms: "", age: "", location: "Kolkata"
};

function readUsers() {
  try { return JSON.parse(localStorage.getItem("hpp_users") || "{}"); }
  catch { return {}; }
}

function readSession() {
  try { return JSON.parse(localStorage.getItem("hpp_session") || "null"); }
  catch { return null; }
}

function App() {
  const [formData, setFormData] = useState(emptyForm);
  const [prediction, setPrediction] = useState(null);
  const [predictionMeta, setPredictionMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(readSession);
  const [users, setUsers] = useState(readUsers);
  const [authMode, setAuthMode] = useState(null);
  const [authData, setAuthData] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [view, setView] = useState("predict");
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [emi, setEmi] = useState({ amount: "", rate: "8.5", years: "20" });

  useEffect(() => {
    if (!session) {
      setHistory([]);
      return;
    }
    try {
      setHistory(JSON.parse(localStorage.getItem(`hpp_history_${session.email}`) || "[]"));
    } catch {
      setHistory([]);
    }
  }, [session]);

  useEffect(() => {
    if (view === "analytics" && !analytics) {
      fetch(`${API_URL}/analytics`)
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then(setAnalytics)
        .catch(() => setAnalytics(null));
    }
  }, [view, analytics]);

  const saveHistory = (entry) => {
    if (!session) return;
    const next = [entry, ...history].slice(0, 30);
    setHistory(next);
    localStorage.setItem(`hpp_history_${session.email}`, JSON.stringify(next));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    setPredictionMeta(null);
    setError("");

    try {
      const params = new URLSearchParams(formData);
      const response = await fetch(`${API_URL}/predict?${params.toString()}`, { method: "POST" });
      if (!response.ok) throw new Error("Prediction request failed");
      const data = await response.json();

      setPrediction(data.predicted_price);
      setPredictionMeta(data);

      saveHistory({
        id: Date.now(),
        date: new Date().toISOString(),
        ...formData,
        predicted_price: data.predicted_price,
        price_per_sqft: data.estimated_price_per_sqft
      });
    } catch {
      setError("Unable to connect to the prediction server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitAuth = (e) => {
    e.preventDefault();
    setAuthError("");
    const email = authData.email.trim().toLowerCase();

    if (!email || !authData.password) {
      setAuthError("Email and password are required.");
      return;
    }

    if (authMode === "signup") {
      if (!authData.name.trim()) {
        setAuthError("Please enter your name.");
        return;
      }
      if (users[email]) {
        setAuthError("An account with this email already exists.");
        return;
      }
      const nextUsers = { ...users, [email]: { name: authData.name.trim(), password: authData.password } };
      setUsers(nextUsers);
      localStorage.setItem("hpp_users", JSON.stringify(nextUsers));
      const nextSession = { name: authData.name.trim(), email };
      setSession(nextSession);
      localStorage.setItem("hpp_session", JSON.stringify(nextSession));
      setAuthMode(null);
      setAuthData({ name: "", email: "", password: "" });
      return;
    }

    if (!users[email] || users[email].password !== authData.password) {
      setAuthError("Invalid email or password.");
      return;
    }

    const nextSession = { name: users[email].name, email };
    setSession(nextSession);
    localStorage.setItem("hpp_session", JSON.stringify(nextSession));
    setAuthMode(null);
    setAuthData({ name: "", email: "", password: "" });
  };

  const logout = () => {
    localStorage.removeItem("hpp_session");
    setSession(null);
    setView("predict");
    setPrediction(null);
  };

  const emiResult = useMemo(() => {
    const p = Number(emi.amount);
    const annual = Number(emi.rate);
    const months = Number(emi.years) * 12;
    if (!p || !annual || !months) return null;
    const r = annual / 12 / 100;
    const monthly = (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return { monthly, total: monthly * months, interest: monthly * months - p };
  }, [emi]);

  const clearHistory = () => {
    if (!session) return;
    setHistory([]);
    localStorage.removeItem(`hpp_history_${session.email}`);
  };

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setView("predict")}>🏠 Indian House Price Predictor</button>
        <nav className="nav">
          <button className={view === "predict" ? "active" : ""} onClick={() => setView("predict")}>Predict</button>
          <button className={view === "history" ? "active" : ""} onClick={() => setView("history")}>History</button>
          <button className={view === "analytics" ? "active" : ""} onClick={() => setView("analytics")}>Analytics</button>
          <button className={view === "emi" ? "active" : ""} onClick={() => setView("emi")}>EMI Calculator</button>
        </nav>
        <div className="account">
          {session ? (
            <>
              <span className="welcome">Hi, {session.name}</span>
              <button className="account-btn" onClick={logout}>Sign out</button>
            </>
          ) : (
            <>
              <button className="account-btn ghost" onClick={() => { setAuthMode("signin"); setAuthError(""); }}>Sign in</button>
              <button className="account-btn" onClick={() => { setAuthMode("signup"); setAuthError(""); }}>Create account</button>
            </>
          )}
        </div>
      </header>

      <div className="container">
        {view === "predict" && (
          <>
            <div className="header">
              <h1>🏠 Indian House Price Predictor</h1>
              <p>Predict house prices across major Indian cities using Machine Learning</p>
            </div>

            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="grid">
                  <div className="input-group">
                    <label>Area (sq ft)</label>
                    <input type="number" name="area_sqft" value={formData.area_sqft} onChange={handleChange} placeholder="e.g. 1500" min="100" required />
                  </div>
                  <div className="input-group">
                    <label>Bedrooms</label>
                    <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} placeholder="e.g. 3" min="1" required />
                  </div>
                  <div className="input-group">
                    <label>Bathrooms</label>
                    <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} placeholder="e.g. 2" min="1" required />
                  </div>
                  <div className="input-group">
                    <label>Property Age (years)</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 5" min="0" required />
                  </div>
                  <div className="input-group full-width">
                    <label>City</label>
                    <select name="location" value={formData.location} onChange={handleChange}>
                      {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={loading}>{loading ? "Predicting..." : "Predict House Price"}</button>
              </form>

              {prediction !== null && (
                <div className="result">
                  <p>Estimated House Price</p>
                  <h2>₹{Number(prediction).toLocaleString("en-IN")}</h2>
                  <span>{formData.location} · ₹{Number(predictionMeta?.estimated_price_per_sqft || 0).toLocaleString("en-IN")}/sq ft</span>
                  {!session && <small>Create an account to save this prediction to your history.</small>}
                </div>
              )}
              {error && <div className="error">{error}</div>}
            </div>
          </>
        )}

        {view === "history" && (
          <section className="feature-card">
            <div className="section-head">
              <div><h2>Prediction History</h2><p>Keep track of your recent property estimates.</p></div>
              {session && history.length > 0 && <button className="small-btn danger" onClick={clearHistory}>Clear history</button>}
            </div>
            {!session ? (
              <div className="empty"><h3>Sign in to view your history</h3><p>Your predictions are saved privately to your account on this device.</p><button onClick={() => setAuthMode("signin")}>Sign in</button></div>
            ) : history.length === 0 ? (
              <div className="empty"><h3>No predictions yet</h3><p>Make your first prediction and it will appear here.</p><button onClick={() => setView("predict")}>Make a prediction</button></div>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <div className="history-item" key={item.id}>
                    <div><strong>{item.location}</strong><span>{item.area_sqft} sq ft · {item.bedrooms} bed · {item.bathrooms} bath · {item.age} yrs</span></div>
                    <div className="history-price">₹{Number(item.predicted_price).toLocaleString("en-IN")}<small>{new Date(item.date).toLocaleDateString("en-IN")}</small></div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {view === "analytics" && (
          <section className="feature-card">
            <div className="section-head"><div><h2>Market Analytics</h2><p>Statistics calculated from the model's housing dataset.</p></div></div>
            {analytics ? (
              <>
                <div className="stats-grid">
                  <div className="stat"><span>Total listings</span><strong>{analytics.dataset.rows.toLocaleString("en-IN")}</strong></div>
                  <div className="stat"><span>Cities</span><strong>{analytics.dataset.cities}</strong></div>
                  <div className="stat"><span>Average price</span><strong>₹{analytics.dataset.average_price.toLocaleString("en-IN")}</strong></div>
                  <div className="stat"><span>Average area</span><strong>{analytics.dataset.average_area_sqft.toLocaleString("en-IN")} sq ft</strong></div>
                </div>
                <div className="city-table">
                  <div className="table-row table-head"><span>City</span><span>Listings</span><span>Average</span><span>Range</span></div>
                  {analytics.cities.map((city) => <div className="table-row" key={city.location}><span>{city.location}</span><span>{city.listings}</span><span>₹{city.average_price.toLocaleString("en-IN")}</span><span>₹{city.minimum_price.toLocaleString("en-IN")} – ₹{city.maximum_price.toLocaleString("en-IN")}</span></div>)}
                </div>
              </>
            ) : <div className="empty"><h3>Analytics unavailable</h3><p>Wake the Render API and refresh this page.</p></div>}
          </section>
        )}

        {view === "emi" && (
          <section className="feature-card">
            <div className="section-head"><div><h2>Home Loan EMI Calculator</h2><p>Estimate your monthly payment from a property budget.</p></div></div>
            <div className="emi-grid">
              <div className="grid">
                <div className="input-group"><label>Loan amount (₹)</label><input type="number" value={emi.amount} onChange={(e) => setEmi({...emi, amount: e.target.value})} placeholder="e.g. 5000000" /></div>
                <div className="input-group"><label>Interest rate (% p.a.)</label><input type="number" step="0.1" value={emi.rate} onChange={(e) => setEmi({...emi, rate: e.target.value})} /></div>
                <div className="input-group full-width"><label>Loan tenure (years)</label><input type="number" value={emi.years} onChange={(e) => setEmi({...emi, years: e.target.value})} min="1" max="40" /></div>
              </div>
              {emiResult && <div className="emi-result"><p>Estimated monthly EMI</p><h2>₹{Math.round(emiResult.monthly).toLocaleString("en-IN")}</h2><span>Total interest: ₹{Math.round(emiResult.interest).toLocaleString("en-IN")}</span><span>Total payment: ₹{Math.round(emiResult.total).toLocaleString("en-IN")}</span></div>}
            </div>
          </section>
        )}
      </div>

      {authMode && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setAuthMode(null)}>
          <div className="auth-modal">
            <button className="close" onClick={() => setAuthMode(null)}>×</button>
            <h2>{authMode === "signup" ? "Create your account" : "Welcome back"}</h2>
            <p>{authMode === "signup" ? "Save predictions and access your property dashboard." : "Sign in to access your saved predictions."}</p>
            <form onSubmit={submitAuth}>
              {authMode === "signup" && <div className="input-group"><label>Full name</label><input value={authData.name} onChange={(e) => setAuthData({...authData, name: e.target.value})} placeholder="Your name" autoComplete="name" /></div>}
              <div className="input-group"><label>Email</label><input type="email" value={authData.email} onChange={(e) => setAuthData({...authData, email: e.target.value})} placeholder="you@example.com" autoComplete="email" required /></div>
              <div className="input-group"><label>Password</label><input type="password" value={authData.password} onChange={(e) => setAuthData({...authData, password: e.target.value})} placeholder="••••••••" autoComplete={authMode === "signup" ? "new-password" : "current-password"} required /></div>
              {authError && <div className="auth-error">{authError}</div>}
              <button type="submit">{authMode === "signup" ? "Create account" : "Sign in"}</button>
            </form>
            <button className="switch-auth" onClick={() => { setAuthMode(authMode === "signup" ? "signin" : "signup"); setAuthError(""); }}>
              {authMode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;