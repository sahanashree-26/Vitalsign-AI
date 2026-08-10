import React from "react";
import {
  ArrowRight,
  FileText,
  Activity,
  ShieldCheck,
  HeartPulse,
  Brain,
  ClipboardCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white p-8 lg:p-12 min-h-[390px]">

        {/* Decorative circles */}
        <div className="absolute w-[420px] h-[420px] rounded-full border border-white/10 -right-24 -top-24" />

        <div className="absolute w-[300px] h-[300px] rounded-full border border-white/10 right-10 top-10" />

        <div className="absolute right-20 bottom-16 w-3 h-3 rounded-full bg-cyan-300/70" />

        <div className="relative z-10 max-w-3xl">

          {/* Small heading */}
          <div className="flex items-center gap-2 mb-6">

            <Activity size={20} />

            <span className="text-sm font-medium text-blue-100">
              Early Health Risk Prediction
            </span>

          </div>

          {/* Main heading */}
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">

            Understand your health

            <br />

            <span className="text-cyan-300">
              before it becomes serious.
            </span>

          </h1>

          {/* Description */}
          <p className="mt-6 text-blue-100 text-base lg:text-lg leading-relaxed max-w-2xl">

            VitalSignAI uses machine learning to analyze your
            health information and provide an early indication
            of possible disease risk.

          </p>

          <p className="mt-3 text-sm text-blue-200">

            Quick screening support for awareness.
            Results are not a medical diagnosis.

          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mt-8">

            <button
              onClick={() => navigate("/health-assessment")}
              className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition shadow-sm"
            >
              Start Health Assessment

              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate("/upload-report")}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition"
            >
              Upload Medical Report

              <FileText size={18} />
            </button>

          </div>

        </div>

        {/* Right-side AI visual */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden lg:flex">

          <div className="w-44 h-44 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center shadow-xl">

            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">

              <Activity
                size={34}
                className="text-cyan-300"
              />

            </div>

            <p className="font-semibold text-lg">
              VitalSignAI
            </p>

            <p className="text-xs text-blue-200 mt-1">
              AI Health Screening
            </p>

          </div>

        </div>

      </section>

      {/* ================= HOW IT HELPS ================= */}
      <section className="py-12 text-center">

        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
          How VitalSignAI Helps
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-800">
          A simple way to check your health risk
        </h2>

        <p className="mt-4 text-slate-500 max-w-2xl mx-auto leading-relaxed">

          Enter your health information or upload an existing
          medical report. Our trained machine-learning models
          analyze the information and provide an understandable
          risk prediction.

        </p>

      </section>

      {/* ================= FEATURES ================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition">

          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">

            <ClipboardCheck
              size={24}
              className="text-blue-600"
            />

          </div>

          <h3 className="font-semibold text-lg text-slate-800">
            Quick Assessment
          </h3>

          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Enter only the important health information
            required for the selected health assessment.
          </p>

        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition">

          <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-4">

            <Brain
              size={24}
              className="text-cyan-600"
            />

          </div>

          <h3 className="font-semibold text-lg text-slate-800">
            Machine Learning
          </h3>

          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Trained machine-learning models analyze your
            health values and estimate possible health risk.
          </p>

        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition">

          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">

            <ShieldCheck
              size={24}
              className="text-green-600"
            />

          </div>

          <h3 className="font-semibold text-lg text-slate-800">
            Early Awareness
          </h3>

          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Get an early indication of possible risk so you
            can be more aware of your health.
          </p>

        </div>

      </section>

      {/* ================= HEALTH AREAS ================= */}
      <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">

        <div className="flex items-center gap-3 mb-5">

          <HeartPulse
            size={22}
            className="text-blue-600"
          />

          <div>

            <h3 className="font-semibold text-slate-800">
              Available Health Assessments
            </h3>

            <p className="text-sm text-slate-400">
              Choose a health area to begin your assessment.
            </p>

          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {[
            "Diabetes",
            "Heart",
            "Kidney",
            "Liver",
          ].map((item) => (

            <button
              key={item}
              onClick={() => navigate("/health-assessment")}
              className="border border-slate-200 rounded-xl p-4 text-left hover:border-blue-400 hover:bg-blue-50/50 transition"
            >

              <p className="font-medium text-slate-700">
                {item}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Risk assessment
              </p>

            </button>

          ))}

        </div>

      </section>

      {/* ================= DISCLAIMER ================= */}
      <div className="mt-6 text-center">

        <p className="text-xs text-slate-400 max-w-2xl mx-auto">

          VitalSignAI provides AI-based health risk predictions
          for awareness and educational purposes only. It does
          not replace professional medical advice, diagnosis,
          or treatment.

        </p>

      </div>

    </Layout>
  );
}