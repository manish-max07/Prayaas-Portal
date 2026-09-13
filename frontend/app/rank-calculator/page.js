"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi NCR", "Jammu and Kashmir",
  "Ladakh", "Chandigarh", "Other"
];

export default function RankCalculatorPage() {
  const router = useRouter();

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);

  // Form State
  const [responseUrl, setResponseUrl] = useState("");
  const [rawHtml, setRawHtml] = useState("");
  const [inputMode, setInputMode] = useState("url"); // 'url' or 'html'
  const [selectedExamId, setSelectedExamId] = useState("");
  const [customExamName, setCustomExamName] = useState("");
  const [marksForCorrect, setMarksForCorrect] = useState(1.0);
  const [negativeMarks, setNegativeMarks] = useState(0.0);
  const [category, setCategory] = useState("UR");
  const [state, setState] = useState("");
  const [horizontalCategory, setHorizontalCategory] = useState("None");
  const [gender, setGender] = useState("Male");
  const [securityPin, setSecurityPin] = useState("1234");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Processing & Error State
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  const fetchAvailableExams = async () => {
    try {
      setLoadingExams(true);
      const res = await api.get("/api/rank-calculator/exams");
      if (res.data && res.data.exams) {
        setExams(res.data.exams);
        // Default stays on '-- Select Your Examination --' with standard +1 / 0 marking scheme
        setMarksForCorrect(1.0);
        setNegativeMarks(0.0);
      }
    } catch (err) {
      console.error("Failed to load rank exams:", err);
    } finally {
      setLoadingExams(false);
    }
  };

  const handlePasteDemoLink = () => {
    setResponseUrl("https://cdn.digialm.com//per/g01/pub/1258/touchstone/AssessmentQPHTMLMode1/1258O26337/1258O26337S2D531/17892129203014769/12492000001_1258O26337S2D531E1.html");
    setMarksForCorrect(1.0);
    setNegativeMarks(0.0);
    setCategory("UR");
    setState("Delhi NCR");
  };

  const handleExamChange = (val) => {
    setSelectedExamId(val);
    if (val !== "other") {
      const found = exams.find((e) => e._id === val);
      if (found) {
        setMarksForCorrect(found.marksForCorrect ?? 1.0);
        setNegativeMarks(found.negativeMarks ?? 0.0);
      }
    }
  };

  const displayExamName =
    selectedExamId === "other"
      ? customExamName.trim() || "Custom Examination"
      : exams.find((e) => e._id === selectedExamId)?.name || "Selected Examination";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (inputMode === "url" && !responseUrl.trim()) {
      setError("Please enter your official TCS iON / Digialm Response Sheet URL.");
      return;
    }

    if (inputMode === "html" && !rawHtml.trim()) {
      setError("Please paste the raw HTML source of your response sheet.");
      return;
    }

    if (!selectedExamId) {
      setError("Please select your examination from the dropdown (or choose 'Other').");
      return;
    }

    if (selectedExamId === "other" && !customExamName.trim()) {
      setError("Please enter the name of your examination in the box provided.");
      return;
    }

    if (!state) {
      setError("Please select your Domicile / State from the dropdown.");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms and Conditions and Privacy-Policy to proceed (tick the checkbox).");
      return;
    }

    // Open confirmation modal for candidate to recheck exam name, category, and marking scheme
    setShowConfirmModal(true);
  };

  const handleConfirmedSubmit = async () => {
    try {
      setSubmitting(true);
      setStatusMessage("Connecting to examination response server...");

      const payload = {
        responseUrl: inputMode === "url" ? responseUrl.trim() : "",
        rawHtml: inputMode === "html" ? rawHtml : "",
        examId: selectedExamId === "other" ? "" : selectedExamId,
        customExamName: selectedExamId === "other" ? customExamName.trim() : "",
        marksForCorrect: Number(marksForCorrect),
        negativeMarks: Number(negativeMarks),
        category,
        state,
        horizontalCategory,
        gender,
        securityPin,
      };

      setStatusMessage("Parsing 100+ questions, marking schemes and negative penalties...");
      const res = await api.post("/api/rank-calculator/calculate", payload);

      if (res.data && res.data.success && res.data.submission) {
        setStatusMessage("Calculating All-India, Category, and Shift Ranks...");
        router.push(`/rank-calculator/result/${res.data.submission._id}`);
      } else {
        throw new Error(res.data?.message || "Calculation failed.");
      }
    } catch (err) {
      console.error("Calculation submission error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not parse the response sheet. Please verify the URL or paste the HTML directly.";
      setError(msg);
      setShowConfirmModal(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2),transparent_65%)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-200 backdrop-blur-md shadow-xs mb-4">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>AVNL &amp; CIL MT 2026 Response Sheet Evaluation &amp; Cutoff</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            AVNL Rank Calculator &amp; <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">CIL MT 2026 Cutoff</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Paste your official <strong>AVNL response sheet</strong> or <strong>CIL MT</strong> link to calculate marks from the <strong>AVNL answer key 2026</strong>, check <strong>AVNL cutoff 2026</strong>, <strong>AVNL trade wise cutoff</strong>, and evaluate your expected <strong>AVNL result 2026</strong> position.
          </p>

          {/* Quick Pillars */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              🏆 Real-time All India Rank (AIR)
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              🏷️ Category & Trade/Subject Rank
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              📊 Shift Difficulty Analyzer
            </span>
          </div>
        </div>
      </section>

      {/* Main Form Container */}
      <main className="mx-auto max-w-3xl px-4 -mt-6 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-3">
              <span className="text-base">⚠️</span>
              <div>
                <div className="font-bold text-red-800">Calculation Error</div>
                <div className="mt-0.5">{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: RESPONSE SHEET INPUT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    1
                  </span>
                  <h2 className="text-sm font-bold text-slate-900">
                    Official Response Sheet Source
                  </h2>
                </div>

                {/* Input Mode Selector Tabs */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setInputMode("url")}
                    className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
                      inputMode === "url"
                        ? "bg-white text-blue-700 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>🔗</span>
                    <span>Response Sheet URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("html")}
                    className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
                      inputMode === "html"
                        ? "bg-white text-blue-700 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>📄</span>
                    <span>Paste HTML Source</span>
                  </button>
                </div>
              </div>

              {inputMode === "url" ? (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    TCS iON / Digialm Response Sheet Link
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://cdn.digialm.com//per/g01/pub/.../assessment.html"
                      value={responseUrl}
                      onChange={(e) => setResponseUrl(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 py-3 pl-3.5 pr-28 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handlePasteDemoLink}
                      className="absolute right-2 top-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Sample Link
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span>💡</span>
                    <span>Copy the response sheet URL from your browser address bar or click Sample Link to test.</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Raw HTML Source Code
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Right-click on your response sheet page -> Select 'View Page Source' -> Press Ctrl+A, Ctrl+C -> Paste here..."
                    value={rawHtml}
                    onChange={(e) => setRawHtml(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-[11px] text-slate-500">
                    Useful if your response sheet link has expired or is blocked by network firewalls.
                  </p>
                </div>
              )}
            </div>

            {/* STEP 2: TARGET EXAM & MARKING SCHEME */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  2
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Target Examination & Scoring Rules
                </h2>
              </div>

              {/* Exam Selection Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Your Examination
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">-- Select Your Examination --</option>
                  {exams.map((ex) => (
                    <option key={ex._id} value={ex._id}>
                      {ex.name}
                    </option>
                  ))}
                  <option value="other">➕ Other (Enter New Exam Name)</option>
                </select>

                {/* Custom Exam Name Field when 'Other' is selected */}
                {selectedExamId === "other" && (
                  <div className="mt-3 space-y-1.5 rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-blue-950">
                        Enter Examination Name *
                      </label>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                        Will be added to dropdown
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. SSC CGL 2026 Tier 1, RRB NTPC CBT 1, etc."
                      value={customExamName}
                      onChange={(e) => setCustomExamName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-blue-300 bg-white py-2 px-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <p className="text-[11px] text-blue-800/80">
                      Once your marks are calculated, this exam will automatically be added to the dropdown for you and all other aspirants.
                    </p>
                  </div>
                )}
              </div>

              {/* Custom Marking Scheme */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                      Scoring & Negative Penalty Scheme
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Default is <strong>+1</strong> for correct & <strong>0</strong> negative penalty. Click a preset or edit numbers.
                    </p>
                  </div>
                  {/* Preset Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setMarksForCorrect(1.0);
                        setNegativeMarks(0.0);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
                        marksForCorrect === 1.0 && negativeMarks === 0.0
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      +1 / 0 (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMarksForCorrect(1.0);
                        setNegativeMarks(0.25);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
                        marksForCorrect === 1.0 && negativeMarks === 0.25
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      +1 / -0.25
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMarksForCorrect(2.0);
                        setNegativeMarks(0.5);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${
                        marksForCorrect === 2.0 && negativeMarks === 0.5
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      +2 / -0.5
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Marks per Correct Answer
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={marksForCorrect}
                        onChange={(e) => setMarksForCorrect(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-emerald-600">
                        +pts
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Negative Penalty per Wrong
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="5"
                        value={negativeMarks}
                        onChange={(e) => setNegativeMarks(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-red-600">
                        -pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: CANDIDATE DEMOGRAPHICS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  3
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Candidate Profile & Category
                </h2>
              </div>

              {/* Reservation Category - Interactive Visual Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Social Category (Used for Category Rank calculation)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {["UR", "OBC", "EWS", "SC", "ST"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`rounded-xl py-2.5 text-center text-xs font-bold transition-all cursor-pointer border ${
                        category === cat
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-[1.02]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender & State Grid */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Male", "Female", "Other"].map((gen) => (
                      <button
                        key={gen}
                        type="button"
                        onClick={() => setGender(gen)}
                        className={`rounded-xl py-2 text-center text-xs font-bold transition-all cursor-pointer border ${
                          gender === gen
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {gen}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Domicile / State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">-- Select Your State --</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horizontal Category (Clearly Marked Optional) */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Horizontal / Sub-Category
                  </label>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                    Optional
                  </span>
                </div>
                <select
                  value={horizontalCategory}
                  onChange={(e) => setHorizontalCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="None">None (Not Applicable)</option>
                  <option value="PwD">PwD (Persons with Benchmark Disabilities)</option>
                  <option value="Ex-Servicemen">Ex-Servicemen (ESM)</option>
                  <option value="Female">Women Reservation</option>
                  <option value="Other">Other Specific Quota</option>
                </select>
              </div>

              {/* 4-Digit Security PIN (Optional with Clear Explanation) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🔒</span>
                    <span className="text-xs font-bold text-slate-800">
                      4-Digit Security PIN
                    </span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 uppercase">
                      Optional (Default: 1234)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Protects your scorecard privacy so others cannot alter your submission. You can keep the default 1234 or change it.
                  </p>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  placeholder="1234"
                  className="w-24 rounded-xl border border-slate-300 bg-white py-1.5 px-3 text-center text-sm font-mono font-bold tracking-widest text-slate-900 focus:border-blue-600 focus:outline-none shrink-0"
                />
              </div>
            </div>

            {/* TERMS & CONDITIONS & PRIVACY POLICY CONSENT */}
            <div
              className={`rounded-2xl border p-4 transition-all ${
                !agreedToTerms && error && error.includes("Terms")
                  ? "border-rose-400 bg-rose-50/90 ring-2 ring-rose-300"
                  : agreedToTerms
                  ? "border-emerald-300 bg-emerald-50/60 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
              }`}
            >
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (e.target.checked && error && error.includes("Terms")) {
                      setError(null);
                    }
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                />
                <div className="text-xs sm:text-sm text-slate-700 leading-normal font-medium">
                  <span>I agree with </span>
                  <Link
                    href="/rank-calculator/terms-conditions"
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-blue-600 hover:text-blue-800 underline transition-colors"
                  >
                    Terms and Conditions
                  </Link>
                  <span> and </span>
                  <Link
                    href="/rank-calculator/terms-conditions"
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-blue-600 hover:text-blue-800 underline transition-colors"
                  >
                    Privacy-Policy
                  </Link>
                </div>
              </label>
            </div>

            {/* SUBMIT BUTTON CTA */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-3.5 text-sm font-black text-white shadow-md hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{statusMessage || "Evaluating Questions & Ranking..."}</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Calculate Marks & Generate Smart Score Card</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Instructions Card: How to get Response Sheet URL */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>ℹ️</span>
            <span>How to Copy Your TCS iON / Digialm Response Sheet Link</span>
          </h2>

          <ol className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed list-decimal list-inside">
            <li>
              Log into your official recruitment portal (e.g. <strong>TCS iON candidate login</strong>) using your credentials.
            </li>
            <li>
              Go to the <strong>"Candidate Response"</strong> or <strong>"Question Paper"</strong> tab.
            </li>
            <li>
              Click on the text that says: <em>"Click here to generate your Assessment Question Paper"</em>.
            </li>
            <li>
              Copy the URL from your browser address bar (it starts with <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">https://cdn.digialm.com/...</code>).
            </li>
            <li>
              Paste the link in the box above to immediately calculate your marks and see where you rank!
            </li>
          </ol>
        </div>

        {/* SEO CONTENT SECTION: AVNL & CIL EXAM INSIGHTS */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200 mb-1.5">
              <span>🎯</span>
              <span>Trending Exam Cutoffs &amp; Rank Analysis</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              AVNL Rank Calculator, Answer Key 2026 &amp; Cutoff Insights
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Real-time score calculation and expected cutoffs for Armoured Vehicles Nigam Limited (AVNL) Recruitment 2026 and Coal India Limited (CIL) Management Trainee (MT) 2026.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs text-slate-600">
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>🛡️</span>
                <span>AVNL Rank Calculator &amp; Response Sheet</span>
              </h3>
              <p className="leading-relaxed text-[11px]">
                Enter your official <strong>AVNL response sheet</strong> link to calculate accurate raw marks, negative deductions, and overall accuracy. Check where you stand among all candidates with real-time All India Rank (AIR) and shift difficulty metrics.
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 pt-1">
                <li>Instant evaluation of 100 questions from Digialm link</li>
                <li>Preview official AVNL answer key 2026 with correct &amp; wrong question markers</li>
                <li>Estimated AVNL result 2026 readiness and merit position</li>
              </ul>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>📊</span>
                <span>AVNL Cutoff 2026 &amp; Trade-Wise Cutoff</span>
              </h3>
              <p className="leading-relaxed text-[11px]">
                Compare your scores against community benchmarks to analyze expected <strong>AVNL cutoff 2026</strong>. View competitive score ranges by discipline and reservation category:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-700 pt-1">
                <li><strong>AVNL trade wise cutoff</strong>: Mechanical, Electrical, Metallurgy, Civil &amp; Ordnance</li>
                <li>Category cutoff trends for UR, OBC, SC, ST, and EWS</li>
                <li>Shift-wise difficulty normalization comparison</li>
              </ul>
            </div>
          </div>

          {/* CIL MT 2026 Section */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1.5 text-xs text-slate-600">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span>⛏️</span>
              <span>CIL MT 2026 Cutoff &amp; Score Predictor</span>
            </h3>
            <p className="leading-relaxed text-[11px]">
              Evaluate your Coal India Limited response sheet to project the <strong>CIL MT 2026 cutoff</strong> across Systems, Mining, Mechanical, Electrical, Civil, HR, and Finance disciplines. Download your high-resolution Smart Scorecard with official PSU headers.
            </p>
          </div>

          {/* Search Keywords Tags */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Popular Search Topics:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "AVNL rank calculator",
                "AVNL Answer key 2026",
                "AVNL cutoff",
                "AVNL cutoff 2026",
                "CIL MT 2026 cutoff",
                "AVNL trade wise cutoff",
                "AVNL response sheet",
                "AVNL result 2026",
                "TCS iON response sheet calculator",
                "Digialm score calculator",
              ].map((kw) => (
                <span
                  key={kw}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Legal Links */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 Prayaas Portal. Educational &amp; Community Exam Analysis Tool.</p>
          <div className="flex items-center gap-3">
            <Link
              href="/rank-calculator/terms-conditions"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Terms &amp; Conditions
            </Link>
            <span>•</span>
            <Link
              href="/rank-calculator/terms-conditions"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              User Data Policy
            </Link>
            <span>•</span>
            <Link
              href="/rank-calculator/terms-conditions"
              className="text-slate-500 hover:text-slate-700"
            >
              Disclaimer
            </Link>
          </div>
        </div>
      </main>

      {/* RECHECK & CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 text-xl font-bold">
                  🔍
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Recheck &amp; Confirm Your Details
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Please verify your exam and marks before generating scorecard
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setShowConfirmModal(false)}
                disabled={submitting}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Candidate Details Summary Card */}
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Target Examination:</span>
                  <span className="font-bold text-slate-900 text-right max-w-[240px] truncate">
                    {displayExamName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-200/70 pt-2">
                  <span className="font-semibold text-slate-500">Social Category:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md">
                    {category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-200/70 pt-2">
                  <span className="font-semibold text-slate-500">State / Domicile:</span>
                  <span className="font-bold text-slate-900">
                    {state || "Not Selected"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 border-t border-slate-200/70 pt-2.5">
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200 text-center shadow-2xs">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                      Positive Mark (Correct)
                    </span>
                    <span className="text-lg font-black text-emerald-600">
                      +{Number(marksForCorrect)}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200 text-center shadow-2xs">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                      Negative Penalty (Wrong)
                    </span>
                    <span className="text-lg font-black text-rose-600">
                      -{Number(negativeMarks)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advisory Callout */}
              <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <span className="text-sm">⚠️</span>
                  <span>Enter Marks Strictly According to Your Question Paper:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/90">
                  Please confirm that the <strong>Positive (+{marksForCorrect})</strong> and <strong>Negative (-{negativeMarks})</strong> marks match your exam rules (e.g. <em>+1 / 0</em>, <em>+1 / -0.25</em>, <em>+2 / -0.5</em>).
                </p>
                <p className="text-[11px] font-semibold text-amber-950 pt-0.5">
                  यदि आपके पेपर में नेगेटिव मार्किंग है या अंक अलग हैं, तो &ldquo;Edit / Go Back&rdquo; दबाकर सही अंक भरें।
                </p>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
              >
                ✏️ Edit / Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmedSubmit}
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 px-4 text-xs font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Evaluating Marks...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Calculate Now</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
