import React, { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import Layout from "../components/Layout";

export default function MyAssessments() {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function loadAssessments() {
    setLoading(true);
    setError("");

    client
      .get("/predictions/recent")
      .then((res) => {
        setAssessments(res.data || []);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.detail ||
            "Unable to load your assessments."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadAssessments();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-3"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Activity className="text-indigo-600" size={25} />
              </div>

              <div>

                <h1 className="text-2xl font-bold text-slate-800">
                  My Assessments
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  Review your previous health-risk predictions.
                </p>

              </div>

            </div>

            <button
              onClick={loadAssessments}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

          </div>

        </div>

        {/* INFO */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-5">

          <div className="flex gap-3">

            <Clock
              size={21}
              className="text-indigo-600 flex-shrink-0"
            />

            <div>

              <div className="font-semibold text-slate-800">
                Your assessment history
              </div>

              <p className="text-sm text-slate-500 mt-1">
                These are previous AI-based risk predictions generated from
                your health information.
              </p>

            </div>

          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 text-red-700 p-4 text-sm">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (

          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">

            <RefreshCw
              className="mx-auto text-blue-500 animate-spin"
              size={28}
            />

            <p className="text-sm text-slate-500 mt-3">
              Loading your assessments...
            </p>

          </div>

        ) : assessments.length === 0 ? (

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-12 text-center">

            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">

              <Activity
                size={26}
                className="text-blue-600"
              />

            </div>

            <h2 className="text-lg font-bold text-slate-800 mt-5">
              No assessments yet
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Complete your first health assessment to see your result here.
            </p>

            <button
              onClick={() => navigate("/health-assessment")}
              className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold"
            >
              Start Health Assessment
            </button>

          </div>

        ) : (

          <div className="space-y-4">

            {assessments.map((assessment) => (

              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
              />

            ))}

          </div>

        )}

        {/* DISCLAIMER */}
        <div className="text-center text-xs text-slate-400 px-5">
          Previous results are AI-based risk predictions and should not be
          interpreted as medical diagnoses.
        </div>

      </div>
    </Layout>
  );
}

function AssessmentCard({ assessment }) {

  const risk = (assessment.risk_level || "").toLowerCase();

  const high = risk.includes("high");
  const medium = risk.includes("medium");

  const style = high
    ? {
        border: "border-red-200",
        background: "bg-red-50",
        icon: "bg-red-100 text-red-600",
        text: "text-red-700",
      }
    : medium
    ? {
        border: "border-amber-200",
        background: "bg-amber-50",
        icon: "bg-amber-100 text-amber-600",
        text: "text-amber-700",
      }
    : {
        border: "border-emerald-200",
        background: "bg-emerald-50",
        icon: "bg-emerald-100 text-emerald-600",
        text: "text-emerald-700",
      };

  return (
    <div
      className={`rounded-2xl border ${style.border} ${style.background} p-5`}
    >

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

        {/* LEFT */}
        <div className="flex items-center gap-4">

          <div
            className={`w-12 h-12 rounded-2xl ${style.icon} flex items-center justify-center`}
          >
            {high || medium ? (
              <AlertTriangle size={23} />
            ) : (
              <CheckCircle size={23} />
            )}
          </div>

          <div>

            <div className="text-xs uppercase tracking-wide text-slate-400">
              Health Assessment
            </div>

            <h3 className="text-lg font-bold text-slate-800 capitalize mt-1">
              {assessment.disease}
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              {assessment.patient_name} ·{" "}
              {assessment.date
                ? new Date(assessment.date).toLocaleString()
                : "Date unavailable"}
            </p>

          </div>

        </div>

        {/* RIGHT */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

          <MiniResult
            label="Risk"
            value={assessment.risk_level}
            className={style.text}
          />

          <MiniResult
            label="Confidence"
            value={`${assessment.confidence?.toFixed(1) || 0}%`}
            className={style.text}
          />

          <MiniResult
            label="Assessment"
            value={`#${assessment.id}`}
          />

        </div>

      </div>

    </div>
  );
}

function MiniResult({ label, value, className = "text-slate-800" }) {
  return (
    <div className="bg-white/70 rounded-xl px-4 py-3 min-w-[110px]">

      <div className="text-[10px] uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className={`text-sm font-bold mt-1 ${className}`}>
        {value}
      </div>

    </div>
  );
}