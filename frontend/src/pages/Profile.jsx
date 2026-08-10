import React, { useState } from "react";
import { User, Lock, LogOut, Save, ShieldCheck } from "lucide-react";
import client from "../api/client";
import Layout from "../components/Layout";
import Topbar from "../components/Topbar";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveProfile() {
    setMessage("");
    setError("");

    try {
      const res = await client.put("/settings/profile", {
        name,
        age,
        gender,
      });

      setMessage(res.data.message || "Profile updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        "Unable to update your profile."
      );
    }
  }

  async function changePassword() {
    setMessage("");
    setError("");

    if (!currentPassword || !newPassword) {
      setError("Please enter both passwords.");
      return;
    }

    try {
      const res = await client.put("/settings/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setMessage(
        res.data.message || "Password updated successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        "Unable to change password."
      );
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <Layout>
      <Topbar
        title="My Profile"
        subtitle="Manage your personal information and account settings."
      />

      <div className="max-w-4xl mx-auto space-y-5">

        {/* Success / Error */}
        {message && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="card">
          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center">
              <User
                size={30}
                className="text-brand-600"
              />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {name || "Your Profile"}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your personal VitalSignAI account
              </p>
            </div>

          </div>
        </div>

        {/* Personal Information */}
        <div className="card">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
              <User
                size={18}
                className="text-brand-600"
              />
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Personal Information
              </h3>

              <p className="text-xs text-slate-400">
                Keep your basic information up to date.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                className="input-field mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            {/* Age */}
            <div>
              <label className="text-sm font-medium text-slate-700">
                Age
              </label>

              <input
                type="number"
                className="input-field mt-1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                min="1"
                max="120"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-sm font-medium text-slate-700">
                Gender
              </label>

              <select
                className="input-field mt-1"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">
                  Prefer not to say
                </option>
              </select>
            </div>

          </div>

          <div className="mt-5">
            <button
              onClick={saveProfile}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>

        </div>

        {/* Account Security */}
        <div className="card">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <ShieldCheck
                size={18}
                className="text-green-600"
              />
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Account Security
              </h3>

              <p className="text-xs text-slate-400">
                Change your password to keep your account secure.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm font-medium text-slate-700">
                Current Password
              </label>

              <input
                type="password"
                className="input-field mt-1"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                New Password
              </label>

              <input
                type="password"
                className="input-field mt-1"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Enter new password"
              />
            </div>

          </div>

          <div className="mt-5">
            <button
              onClick={changePassword}
              className="btn-primary flex items-center gap-2"
            >
              <Lock size={16} />
              Update Password
            </button>
          </div>

        </div>

        {/* Sign Out */}
        <div className="card">

          <h3 className="font-semibold text-slate-800 mb-1">
            Account
          </h3>

          <p className="text-sm text-slate-500 mb-4">
            Sign out from your VitalSignAI account.
          </p>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition"
          >
            <LogOut size={16} />
            Sign Out
          </button>

        </div>

        {/* Privacy note */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500">
            VitalSignAI provides AI-based health risk predictions for
            educational and awareness purposes. Predictions are not
            medical diagnoses.
          </p>
        </div>

      </div>
    </Layout>
  );
}