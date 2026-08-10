import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [email, setEmail] = useState("doctor@vitalsignai.com");
  const [password, setPassword] = useState("Demo@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Login failed. Make sure the backend is running and the database has been seeded."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center text-white mb-3">
            <HeartPulse size={24} />
          </div>
          <h1 className="text-xl font-semibold text-brand-700">VitalSignAI</h1>
          <p className="text-sm text-slate-500">Early Disease Prediction Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              className="input-field mt-1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              className="input-field mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Login"}
          </button>

          <div className="text-xs text-slate-400 border-t border-slate-100 pt-3">
            Demo credentials (after running <code>seed_db.py</code>):<br />
            <span className="font-medium text-slate-600">doctor@vitalsignai.com</span> /{" "}
            <span className="font-medium text-slate-600">Demo@123</span>
          </div>
        </form>
      </div>
    </div>
  );
}
