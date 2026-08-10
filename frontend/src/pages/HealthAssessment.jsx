import React, { useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import client from "../api/client";
import Layout from "../components/Layout";


const DISEASES = {
  diabetes: {
    name: "Diabetes",
    description: "Check your early diabetes risk using a few key health values.",
    fields: [
      {
        name: "Glucose",
        label: "Blood Glucose",
        placeholder: "Example: 120",
        unit: "mg/dL",
        description: "Your blood glucose level",
      },
      {
        name: "BloodPressure",
        label: "Blood Pressure",
        placeholder: "Example: 80",
        unit: "mmHg",
        description: "Your diastolic blood pressure",
      },
      {
        name: "BMI",
        label: "BMI",
        placeholder: "Example: 24.5",
        unit: "kg/m²",
        description: "Your body mass index",
      },
    ],
  },

  heart: {
    name: "Heart",
    description: "Check your early heart disease risk using important heart-health values.",
    fields: [
      {
        name: "cp",
        label: "Chest Pain Type",
        placeholder: "0 - 3",
        unit: "",
        description: "Enter the chest pain category from your health record",
      },
      {
        name: "trestbps",
        label: "Resting Blood Pressure",
        placeholder: "Example: 120",
        unit: "mmHg",
        description: "Blood pressure while resting",
      },
      {
        name: "chol",
        label: "Cholesterol",
        placeholder: "Example: 200",
        unit: "mg/dL",
        description: "Serum cholesterol level",
      },
      {
        name: "thalach",
        label: "Maximum Heart Rate",
        placeholder: "Example: 150",
        unit: "bpm",
        description: "Maximum heart rate recorded",
      },
    ],
  },

  kidney: {
    name: "Kidney",
    description: "Check your early kidney disease risk using key kidney indicators.",
    fields: [
      {
        name: "bp",
        label: "Blood Pressure",
        placeholder: "Example: 80",
        unit: "mmHg",
        description: "Your blood pressure",
      },
      {
        name: "sg",
        label: "Specific Gravity",
        placeholder: "Example: 1.020",
        unit: "",
        description: "Specific gravity from your urine test",
      },
      {
        name: "al",
        label: "Albumin",
        placeholder: "Example: 0",
        unit: "",
        description: "Albumin level from your urine test",
      },
      {
        name: "sc",
        label: "Serum Creatinine",
        placeholder: "Example: 1.0",
        unit: "mg/dL",
        description: "Serum creatinine level",
      },
      {
        name: "hemo",
        label: "Hemoglobin",
        placeholder: "Example: 13.5",
        unit: "g/dL",
        description: "Hemoglobin level",
      },
    ],
  },

  liver: {
    name: "Liver",
    description: "Check your early liver disease risk using important liver-function values.",
    fields: [
      {
        name: "Total_Bilirubin",
        label: "Total Bilirubin",
        placeholder: "Example: 1.0",
        unit: "mg/dL",
        description: "Total bilirubin level",
      },
      {
        name: "Alkaline_Phosphotase",
        label: "Alkaline Phosphatase",
        placeholder: "Example: 200",
        unit: "IU/L",
        description: "Alkaline phosphatase level",
      },
      {
        name: "Alamine_Aminotransferase",
        label: "ALT",
        placeholder: "Example: 30",
        unit: "IU/L",
        description: "Alanine aminotransferase level",
      },
      {
        name: "Aspartate_Aminotransferase",
        label: "AST",
        placeholder: "Example: 30",
        unit: "IU/L",
        description: "Aspartate aminotransferase level",
      },
      {
        name: "Albumin",
        label: "Albumin",
        placeholder: "Example: 4.0",
        unit: "g/dL",
        description: "Albumin level",
      },
    ],
  },
};


export default function HealthAssessment() {

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [selectedDisease, setSelectedDisease] = useState("");

  const [values, setValues] = useState({});

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");


  const disease = DISEASES[selectedDisease];


  function handleDiseaseChange(diseaseName) {

    setSelectedDisease(diseaseName);

    setValues({});

    setResult(null);

    setError("");
  }


  function handleValueChange(field, value) {

    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  }


  function validateForm() {

    if (!name.trim()) {
      return "Please enter your name.";
    }

    if (!age) {
      return "Please enter your age.";
    }

    if (!gender) {
      return "Please select your gender.";
    }

    if (!selectedDisease) {
      return "Please select a health check.";
    }

    for (const field of disease.fields) {

      if (
        values[field.name] === undefined ||
        values[field.name] === ""
      ) {
        return `Please enter ${field.label}.`;
      }
    }

    return "";
  }


  async function handleSubmit(e) {

    e.preventDefault();

    setError("");
    setResult(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {

      const features = {
        ...values,

        age: Number(age),
        Age: Number(age),

        gender: gender,
        Gender: gender,
      };


      /*
       * The backend predictor expects the complete
       * training feature set.
       *
       * The user sees only important health values.
       * Missing model fields are given neutral/default
       * values internally.
       */

      if (selectedDisease === "diabetes") {

        features.Pregnancies = 0;
        features.SkinThickness = 20;
        features.Insulin = 0;
        features.DiabetesPedigreeFunction = 0.47;

      }


      if (selectedDisease === "heart") {

        features.sex =
          gender.toLowerCase() === "male" ? 1 : 0;

        features.fbs = 0;
        features.restecg = 0;
        features.exang = 0;
        features.oldpeak = 0;
        features.slope = 1;
        features.ca = 0;
        features.thal = 2;
      }


      if (selectedDisease === "kidney") {

        features.age = Number(age);

        features.bgr = 100;
        features.bu = 30;
        features.sod = 140;
        features.pot = 4.5;
        features.wbcc = 8000;
        features.rbcc = 4.5;
        features.htn = "no";
        features.dm = "no";
        features.cad = "no";
        features.appet = "good";
        features.pe = "no";
        features.ane = "no";
      }


      if (selectedDisease === "liver") {

        features.Age = Number(age);

        features.Gender =
          gender.toLowerCase() === "male"
            ? "Male"
            : "Female";

        features.Direct_Bilirubin = 0.3;
        features.Total_Protiens = 6.5;
        features.Albumin_and_Globulin_Ratio = 1.0;
      }


      const response = await client.post(
        "/predictions",
        {
          disease: selectedDisease,
          patient_name: name,
          patient_age: Number(age),
          patient_gender: gender,
          features,
        }
      );


      setResult(response.data);

    } catch (err) {

      console.error("Prediction error:", err);

      setError(
        err?.response?.data?.detail ||
        "Unable to complete the health assessment. Please try again."
      );

    } finally {

      setLoading(false);

    }
  }


  function getRiskClass(level) {

    const value = (level || "").toLowerCase();

    if (value.includes("high")) {
      return {
        container: "border-red-200 bg-red-50",
        text: "text-red-700",
        bar: "bg-red-500",
      };
    }

    if (value.includes("medium")) {
      return {
        container: "border-amber-200 bg-amber-50",
        text: "text-amber-700",
        bar: "bg-amber-500",
      };
    }

    return {
      container: "border-emerald-200 bg-emerald-50",
      text: "text-emerald-700",
      bar: "bg-emerald-500",
    };
  }


  return (
    <Layout>

      <div className="max-w-6xl mx-auto pb-10">

        {/* HEADER */}

        <div className="mb-7">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">

              <Activity
                size={22}
                className="text-white"
              />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900">
                Health Assessment
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Check your early health risk using a few important health values.
              </p>

            </div>

          </div>

        </div>


        {/* BASIC INFORMATION */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">

              <Stethoscope
                size={19}
                className="text-blue-600"
              />

            </div>

            <div>

              <h2 className="font-semibold text-slate-900">
                Basic Information
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                This information is used across your health assessment.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* NAME */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Your Name
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>


            {/* AGE */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Age
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>


            {/* GENDER */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Gender
                <span className="text-red-500 ml-1">*</span>
              </label>

              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="">
                  Select gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* DISEASE SELECTION */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">

          <div className="mb-5">

            <h2 className="font-semibold text-slate-900">
              Choose Your Health Check
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Select the condition you want to check for early risk.
            </p>

          </div>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            {Object.entries(DISEASES).map(
              ([key, item]) => {

                const active =
                  selectedDisease === key;

                return (

                  <button
                    type="button"
                    key={key}
                    onClick={() =>
                      handleDiseaseChange(key)
                    }
                    className={`
                      text-left rounded-xl p-4 border transition-all
                      ${
                        active
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                      }
                    `}
                  >

                    <div
                      className={`
                        w-9 h-9 rounded-lg flex items-center justify-center mb-3
                        ${
                          active
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }
                      `}
                    >

                      <HeartPulse size={18} />

                    </div>


                    <div
                      className={`
                        font-semibold text-sm
                        ${
                          active
                            ? "text-blue-700"
                            : "text-slate-800"
                        }
                      `}
                    >
                      {item.name}
                    </div>


                    <div className="text-xs text-slate-500 mt-1">
                      Early risk assessment
                    </div>

                  </button>

                );
              }
            )}

          </div>

        </div>


        {/* DISEASE-SPECIFIC QUESTIONS */}

        {disease && (

          <form onSubmit={handleSubmit}>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5">

              <div className="flex items-start justify-between gap-4 mb-6">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">

                      <Activity
                        size={19}
                        className="text-indigo-600"
                      />

                    </div>

                    <h2 className="font-semibold text-slate-900">
                      {disease.name} Health Information
                    </h2>

                  </div>

                  <p className="text-sm text-slate-500 mt-2 ml-11">
                    {disease.description}
                  </p>

                </div>


                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">

                  <ShieldCheck size={16} />

                  Key indicators only

                </div>

              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {disease.fields.map(
                  (field) => (

                    <div key={field.name}>

                      <label className="block text-sm font-medium text-slate-700 mb-1.5">

                        {field.label}

                        <span className="text-red-500 ml-1">
                          *
                        </span>

                      </label>


                      <div className="relative">

                        <input
                          type="number"
                          step="any"
                          value={
                            values[field.name] || ""
                          }
                          onChange={(e) =>
                            handleValueChange(
                              field.name,
                              e.target.value
                            )
                          }
                          placeholder={
                            field.placeholder
                          }
                          className="w-full h-12 px-3.5 pr-20 rounded-xl border border-slate-200 bg-white text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                        />


                        {field.unit && (

                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            {field.unit}
                          </span>

                        )}

                      </div>


                      <p className="text-xs text-slate-400 mt-1.5">
                        {field.description}
                      </p>

                    </div>

                  )
                )}

              </div>


              {/* ERROR */}

              {error && (

                <div className="mt-5 p-4 rounded-xl border border-red-200 bg-red-50">

                  <p className="text-sm text-red-700">
                    {error}
                  </p>

                </div>

              )}


              {/* SUBMIT */}

              <div className="mt-7 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">

                <div className="flex items-center gap-2 text-xs text-slate-400">

                  <ShieldCheck
                    size={16}
                    className="text-emerald-500"
                  />

                  Your result is intended for early risk awareness.

                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full sm:w-auto
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-6
                    h-11
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    text-sm
                    font-semibold
                    shadow-lg
                    shadow-blue-200
                    transition
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >

                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Run Early Prediction
                      <ArrowRight size={17} />
                    </>
                  )}

                </button>

              </div>

            </div>

          </form>

        )}


        {/* RESULT */}

        {result && (

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-6 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">

                  <CheckCircle2
                    size={21}
                    className="text-emerald-600"
                  />

                </div>

                <div>

                  <h2 className="font-semibold text-slate-900">
                    Your Assessment Result
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Your health data has been evaluated by the trained machine-learning model.
                  </p>

                </div>

              </div>

            </div>


            {(() => {

              const styles =
                getRiskClass(
                  result.risk_level
                );

              return (

                <div className="p-6">

                  <div
                    className={`
                      rounded-2xl
                      border
                      p-6
                      ${styles.container}
                    `}
                  >

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                      <div>

                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Health Check
                        </p>

                        <p className="text-2xl font-bold text-slate-900 mt-1 capitalize">
                          {result.disease}
                        </p>

                      </div>


                      <div>

                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Risk Level
                        </p>

                        <p
                          className={`
                            text-2xl
                            font-bold
                            mt-1
                            ${styles.text}
                          `}
                        >
                          {result.risk_level}
                        </p>

                      </div>


                      <div>

                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Model Confidence
                        </p>

                        <p
                          className={`
                            text-2xl
                            font-bold
                            mt-1
                            ${styles.text}
                          `}
                        >
                          {result.confidence}%
                        </p>

                      </div>

                    </div>


                    {/* CONFIDENCE BAR */}

                    <div className="mt-6">

                      <div className="flex justify-between text-xs text-slate-500 mb-2">

                        <span>
                          Prediction confidence
                        </span>

                        <span>
                          {result.confidence}%
                        </span>

                      </div>

                      <div className="h-2 rounded-full bg-white/80 overflow-hidden">

                        <div
                          className={`h-full rounded-full ${styles.bar}`}
                          style={{
                            width: `${Math.min(
                              Number(result.confidence) || 0,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>


                    {/* EXPLANATION */}

                    <div className="mt-6 pt-5 border-t border-black/5">

                      <p className="text-sm font-semibold text-slate-700">
                        What the prediction means
                      </p>

                      <p className="text-sm text-slate-600 mt-1.5 leading-6">
                        {result.explanation}
                      </p>

                    </div>

                  </div>


                  {/* DISCLAIMER */}

                  <div className="mt-5 flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">

                    <ShieldCheck
                      size={18}
                      className="text-slate-400 flex-shrink-0 mt-0.5"
                    />

                    <p className="text-xs text-slate-500 leading-5">
                      {result.disclaimer ||
                        "This result is an AI-based risk prediction for educational purposes and is not a medical diagnosis."}
                    </p>

                  </div>

                </div>

              );

            })()}

          </div>

        )}

      </div>

    </Layout>
  );
}