import React, { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  Brain,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import Layout from "../components/Layout";

export default function UploadReport() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  const fileRef = useRef(null);

  function loadReports() {
    client
      .get("/reports")
      .then((res) => setReports(res.data))
      .catch(() => {
        setError("Unable to load your uploaded reports.");
      });
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleUpload(file) {
    if (!file) return;

    setError("");
    setAnalysisResult(null);

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowed.includes(file.type)) {
      setError("Please upload a PDF, JPG or PNG file.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("The maximum file size is 50MB.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await client.post("/reports/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      loadReports();

    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Report upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze(reportId) {
    setError("");
    setAnalysisResult(null);
    setAnalyzingId(reportId);

    try {
      const response = await client.post(
        `/reports/${reportId}/analyze`
      );

      setAnalysisResult(response.data);
      loadReports();

    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Unable to analyze the report."
      );
    } finally {
      setAnalyzingId(null);
    }
  }

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

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
              <FileText className="text-violet-600" size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Upload Health Report
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Upload your report and use it as a starting point for AI-based
                health-risk analysis.
              </p>
            </div>

          </div>

        </div>

        {/* MAIN */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* UPLOAD */}
          <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl shadow-sm p-6">

            <div
              className="border-2 border-dashed border-slate-200 rounded-2xl min-h-[330px] flex flex-col items-center justify-center text-center px-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();

                const file = e.dataTransfer.files?.[0];

                if (file) {
                  handleUpload(file);
                }
              }}
            >

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center mb-5">
                <UploadCloud
                  size={32}
                  className="text-blue-600"
                />
              </div>

              <h2 className="text-lg font-bold text-slate-800">
                Upload your health report
              </h2>

              <p className="text-sm text-slate-500 mt-2 max-w-md">
                Drag and drop your report here or choose a file from your
                device.
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Supported formats: PDF, JPG, PNG · Maximum 50MB
              </p>

              <button
                type="button"
                className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
              >
                Choose Report
              </button>

              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    handleUpload(file);
                  }

                  e.target.value = "";
                }}
              />

            </div>

            {uploading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                <Brain size={17} />
                Uploading your report...
              </div>
            )}

            {error && (
              <div className="mt-4 flex gap-2 items-start rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                <XCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-5">

              <InfoCard
                title="Report processing"
                value="Supported"
                icon={FileText}
              />

              <InfoCard
                title="AI risk analysis"
                value="Available"
                icon={Brain}
              />

            </div>

          </div>

          {/* HOW IT WORKS */}
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6">

            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-5">
              <Activity size={22} />
            </div>

            <h2 className="text-xl font-bold">
              From report to insight
            </h2>

            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Your report can be processed to identify supported health values
              and send them to the trained machine-learning model.
            </p>

            <div className="space-y-5 mt-7">

              <Step number="01" title="Upload">
                Select a supported medical report.
              </Step>

              <Step number="02" title="Extract">
                Available health information is read from the report.
              </Step>

              <Step number="03" title="Predict">
                The trained model evaluates the extracted information.
              </Step>

              <Step number="04" title="Understand">
                View the predicted risk and confidence.
              </Step>

            </div>

          </div>

        </div>

        {/* REPORT HISTORY */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Your Uploaded Reports
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Review reports you have uploaded for analysis.
              </p>
            </div>

          </div>

          {reports.length === 0 ? (

            <div className="text-center py-12 text-sm text-slate-400">
              No reports uploaded yet.
            </div>

          ) : (

            <div className="space-y-3">

              {reports.map((report) => (

                <div
                  key={report.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition"
                >

                  <div className="flex items-center gap-3 min-w-0">

                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileText
                        size={20}
                        className="text-blue-600"
                      />
                    </div>

                    <div className="min-w-0">

                      <div className="font-medium text-slate-800 truncate">
                        {report.filename}
                      </div>

                      <div className="text-xs text-slate-400 mt-1">
                        {report.file_type?.toUpperCase()} ·{" "}
                        {report.status} ·{" "}
                        {new Date(report.created_at).toLocaleString()}
                      </div>

                    </div>

                  </div>

                  <button
                    onClick={() => handleAnalyze(report.id)}
                    disabled={
                      analyzingId === report.id ||
                      report.status === "Analyzed"
                    }
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-40"
                  >
                    {report.status === "Analyzed"
                      ? "Analyzed"
                      : analyzingId === report.id
                      ? "Analyzing..."
                      : "Analyze Report"}
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* RESULT */}
        {analysisResult && (
          <AnalysisResult result={analysisResult} />
        )}

      </div>
    </Layout>
  );
}

function InfoCard({ title, value, icon: Icon }) {
  return (
    <div className="border border-slate-100 rounded-xl p-4">

      <Icon size={18} className="text-blue-600 mb-3" />

      <div className="text-xs text-slate-400">
        {title}
      </div>

      <div className="text-sm font-semibold text-emerald-600 mt-1">
        {value}
      </div>

    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div className="flex gap-3">

      <div className="text-xs font-bold text-indigo-300 pt-1">
        {number}
      </div>

      <div>
        <div className="font-semibold">
          {title}
        </div>

        <div className="text-xs text-slate-400 mt-1">
          {children}
        </div>
      </div>

    </div>
  );
}

function AnalysisResult({ result }) {

  const risk = (result.risk_level || "").toLowerCase();

  const high = risk.includes("high");
  const medium = risk.includes("medium");

  const style = high
    ? {
        box: "from-red-50 to-orange-50 border-red-200",
        text: "text-red-700",
        icon: "bg-red-100 text-red-600",
      }
    : medium
    ? {
        box: "from-amber-50 to-yellow-50 border-amber-200",
        text: "text-amber-700",
        icon: "bg-amber-100 text-amber-600",
      }
    : {
        box: "from-emerald-50 to-teal-50 border-emerald-200",
        text: "text-emerald-700",
        icon: "bg-emerald-100 text-emerald-600",
      };

  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br ${style.box} p-6 md:p-8`}
    >

      <div className="flex items-center gap-3 mb-6">

        <div className={`w-12 h-12 rounded-2xl ${style.icon} flex items-center justify-center`}>
          {high || medium ? (
            <AlertTriangle size={24} />
          ) : (
            <CheckCircle size={24} />
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Analysis Complete
          </h2>

          <p className="text-sm text-slate-500">
            Your uploaded report has been analyzed.
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

        <ResultItem
          label="Health Check"
          value={result.disease}
        />

        <ResultItem
          label="Risk Level"
          value={result.risk_level}
          className={style.text}
        />

        <ResultItem
          label="Confidence"
          value={`${result.confidence}%`}
          className={style.text}
        />

        <ResultItem
          label="Report"
          value={`#${result.report_id}`}
        />

      </div>

      {result.extracted_values &&
        Object.keys(result.extracted_values).length > 0 && (
          <div className="mt-5">

            <h3 className="font-semibold text-slate-700 mb-3">
              Extracted Health Values
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

              {Object.entries(result.extracted_values).map(
                ([key, value]) => (

                  <div
                    key={key}
                    className="bg-white/70 border border-white rounded-xl p-3"
                  >

                    <div className="text-xs text-slate-400">
                      {key}
                    </div>

                    <div className="font-semibold text-slate-800 mt-1">
                      {value}
                    </div>

                  </div>

                )
              )}

            </div>

          </div>
        )}

      <div className="mt-5 bg-white/70 border border-white rounded-2xl p-5">

        <div className="font-semibold text-slate-700">
          What the result means
        </div>

        <p className="text-sm text-slate-600 mt-1">
          {result.explanation}
        </p>

      </div>

      <p className="text-xs text-slate-500 mt-4">
        {result.disclaimer}
      </p>

    </div>
  );
}

function ResultItem({ label, value, className = "text-slate-800" }) {
  return (
    <div className="bg-white/70 border border-white rounded-xl p-4">

      <div className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className={`text-lg font-bold mt-2 capitalize ${className}`}>
        {value}
      </div>

    </div>
  );
}