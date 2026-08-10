import React from "react";
import {
  Activity,
  Brain,
  ShieldCheck,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function About() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HERO */}
        <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-8 md:p-12">

          <div className="max-w-3xl">

            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-5">
              <Activity size={25} className="text-cyan-300" />
            </div>

            <p className="text-sm font-semibold text-cyan-300 uppercase tracking-wider">
              About VitalSignAI
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">
              Making early health-risk awareness simpler with machine learning.
            </h1>

            <p className="text-slate-300 mt-5 leading-relaxed">
              Many people may not realize that they are at risk of a disease
              until symptoms become serious. VitalSignAI explores how
              machine-learning models can use health data to provide a quick
              early risk prediction.
            </p>

          </div>

        </section>

        {/* PROBLEM */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-7">

            <div className="text-sm font-semibold text-red-500 uppercase tracking-wide">
              The problem
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mt-2">
              Disease is often discovered too late.
            </h2>

            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
              Traditional health checks can require time, clinical
              consultations and multiple medical tests. This can make early
              awareness difficult for some people.
            </p>

          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-7">

            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              The approach
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mt-2">
              Use health data to identify possible risk earlier.
            </h2>

            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
              VitalSignAI applies trained machine-learning models to selected
              health information and provides a quick prediction that can
              support awareness and encourage appropriate medical follow-up.
            </p>

          </div>

        </section>

        {/* HOW IT WORKS */}
        <section>

          <div className="text-center mb-6">

            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              How it works
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mt-2">
              From health data to an understandable result
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <ProcessCard
              number="01"
              icon={FileText}
              title="Provide Data"
              description="Enter health measurements or upload a supported report."
            />

            <ProcessCard
              number="02"
              icon={Brain}
              title="Process"
              description="The system prepares the available information for the trained model."
            />

            <ProcessCard
              number="03"
              icon={Activity}
              title="Predict"
              description="The machine-learning model estimates the selected disease risk."
            />

            <ProcessCard
              number="04"
              icon={ShieldCheck}
              title="Understand"
              description="The result presents risk level, confidence and an explanation."
            />

          </div>

        </section>

        {/* WHY ML */}
        <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 p-7">

          <div className="flex gap-4">

            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
              <Brain className="text-blue-600" size={24} />
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-800">
                Why machine learning?
              </h2>

              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Machine learning can identify patterns in health datasets that
                may be difficult to evaluate manually at scale. A trained
                model can then use those learned patterns to estimate risk for
                new health information.
              </p>

            </div>

          </div>

        </section>

        {/* IMPORTANT */}
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-7">

          <h2 className="text-xl font-bold text-slate-800">
            Important information
          </h2>

          <div className="mt-4 space-y-3 text-sm text-slate-600 leading-relaxed">

            <p>
              VitalSignAI is an early health-risk prediction project. Its
              predictions are intended for educational and awareness purposes.
            </p>

            <p>
              A prediction does not confirm that a person has a disease.
              Medical diagnosis should be performed by a qualified healthcare
              professional using appropriate clinical evaluation and testing.
            </p>

            <p>
              If you are concerned about your health or experience symptoms,
              seek appropriate professional medical care.
            </p>

          </div>

        </section>

        {/* CTA */}
        <section className="text-center py-4">

          <h2 className="text-2xl font-bold text-slate-800">
            Ready to check your health risk?
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Start with your available health information.
          </p>

          <button
            onClick={() => navigate("/health-assessment")}
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
          >
            Start Health Assessment
            <ArrowRight size={18} />
          </button>

        </section>

      </div>
    </Layout>
  );
}

function ProcessCard({
  number,
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">

      <div className="flex items-center justify-between">

        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Icon size={20} className="text-blue-600" />
        </div>

        <span className="text-xs font-bold text-slate-300">
          {number}
        </span>

      </div>

      <h3 className="font-bold text-slate-800 mt-5">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        {description}
      </p>

    </div>
  );
}