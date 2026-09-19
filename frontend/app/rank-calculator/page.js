"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
        const filtered = res.data.exams.filter(
          (e) =>
            e.slug !== "avnl-recruitment-2026" &&
            e.name?.toLowerCase() !== "avnl recruitment 2026"
        );
        setExams(filtered);
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

      setStatusMessage("Parsing questions, marking schemes and negative penalties...");
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Clean White Hero Header */}
      <section className="border-b border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span>TCS iON &amp; Digialm Response Sheet Evaluation</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            All India Rank Predictor &amp; <span className="text-blue-600">Smart Scorecard</span>
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Evaluate your official response sheet to calculate accurate raw marks, negative deductions, All India Rank (AIR), category standing, and shift difficulty analysis.
          </p>

          {/* Quick Feature Pillars with Professional SVG Icons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Real-Time All India Rank (AIR)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Category &amp; Trade Rank</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-medium">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Shift Difficulty Analyzer</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Form Container */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <div className="font-bold text-red-800">Calculation Error</div>
                <div className="mt-0.5">{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: RESPONSE SHEET INPUT */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    1
                  </span>
                  <h2 className="text-sm font-bold text-slate-900">
                    Official Response Sheet Source
                  </h2>
                </div>

                {/* Input Mode Selector Tabs */}
                <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setInputMode("url")}
                    className={`rounded-md px-3 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${inputMode === "url"
                        ? "bg-white text-blue-600 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Response Sheet URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("html")}
                    className={`rounded-md px-3 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${inputMode === "html"
                        ? "bg-white text-blue-600 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
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
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-3.5 pr-28 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handlePasteDemoLink}
                      className="absolute right-1.5 top-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Sample Link
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  2
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Target Examination &amp; Scoring Rules
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
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">-- Select Your Examination --</option>
                  {exams.map((ex) => (
                    <option key={ex._id} value={ex._id}>
                      {ex.name}
                    </option>
                  ))}
                  <option value="other">+ Other (Enter New Exam Name)</option>
                </select>

                {/* Custom Exam Name Field when 'Other' is selected */}
                {selectedExamId === "other" && (
                  <div className="mt-3 space-y-1.5 rounded-xl border border-blue-200 bg-blue-50/50 p-3.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-blue-900">
                        Enter Examination Name *
                      </label>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Will be added to platform
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. SSC CGL 2026 Tier 1, RRB NTPC CBT 1, etc."
                      value={customExamName}
                      onChange={(e) => setCustomExamName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-blue-300 bg-white py-2 px-3 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <p className="text-[11px] text-blue-800">
                      Once your marks are calculated, this exam will automatically be added to the dropdown for future scorecards.
                    </p>
                  </div>
                )}
              </div>

              {/* Custom Marking Scheme */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Scoring &amp; Negative Penalty Scheme
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Default is <strong>+1</strong> for correct &amp; <strong>0</strong> negative penalty. Click a preset or edit numbers.
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
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${marksForCorrect === 1.0 && negativeMarks === 0.0
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
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
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${marksForCorrect === 1.0 && negativeMarks === 0.25
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
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
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors cursor-pointer ${marksForCorrect === 2.0 && negativeMarks === 0.5
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
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
                        className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                        className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-rose-600">
                        -pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: CANDIDATE DEMOGRAPHICS */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  3
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Candidate Profile &amp; Category
                </h2>
              </div>

              {/* Reservation Category */}
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
                      className={`rounded-xl py-2.5 text-center text-xs font-bold transition-all cursor-pointer border ${category === cat
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
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
                        className={`rounded-xl py-2 text-center text-xs font-bold transition-all cursor-pointer border ${gender === gen
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
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

              {/* Horizontal Category */}
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

              {/* 4-Digit Security PIN */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs font-bold text-slate-800">
                      4-Digit Security PIN
                    </span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
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
              className={`rounded-xl border p-4 transition-all ${!agreedToTerms && error && error.includes("Terms")
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
                    href="/terms-conditions"
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-blue-600 hover:text-blue-800 underline transition-colors"
                  >
                    Terms and Conditions
                  </Link>
                  <span> and </span>
                  <Link
                    href="/terms-conditions"
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
                className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{statusMessage || "Evaluating Questions & Ranking..."}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Calculate Marks &amp; Generate Smart Scorecard</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Instructions Card: How to get Response Sheet URL */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>How to Copy Your TCS iON / Digialm Response Sheet Link</span>
          </h2>

          <div className="mt-4 space-y-3">
            {[
              {
                step: "1",
                text: "Log into your official recruitment portal (e.g. TCS iON candidate login) using your credentials.",
              },
              {
                step: "2",
                text: "Navigate to the Candidate Response or Question Paper tab.",
              },
              {
                step: "3",
                text: "Click on the text that says: \"Click here to generate your Assessment Question Paper\".",
              },
              {
                step: "4",
                text: "Copy the URL from your browser address bar (it starts with https://cdn.digialm.com/...).",
                hasCode: true,
              },
              {
                step: "5",
                text: "Paste the link in the box above to immediately calculate your marks and see where you rank!",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 text-xs text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-700 border border-blue-200">
                  {item.step}
                </span>
                <div className="pt-0.5 leading-relaxed">
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO CONTENT SECTION: AVNL & CIL EXAM INSIGHTS */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200 mb-1.5">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
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
                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
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
                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
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
              <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
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
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
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
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Candidate Details Summary Card */}
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Target Examination:</span>
                  <span className="font-bold text-slate-900 text-right max-w-[240px] truncate">
                    {displayExamName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2">
                  <span className="font-semibold text-slate-500">Social Category:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md">
                    {category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2">
                  <span className="font-semibold text-slate-500">State / Domicile:</span>
                  <span className="font-bold text-slate-900">
                    {state || "Not Selected"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 border-t border-slate-200 pt-2.5">
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200 text-center shadow-2xs">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                      Positive Mark (Correct)
                    </span>
                    <span className="text-lg font-bold text-emerald-600">
                      +{Number(marksForCorrect)}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-2.5 border border-slate-200 text-center shadow-2xs">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                      Negative Penalty (Wrong)
                    </span>
                    <span className="text-lg font-bold text-rose-600">
                      -{Number(negativeMarks)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advisory Callout */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Enter Marks Strictly According to Your Question Paper:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Please confirm that the <strong>Positive (+{marksForCorrect})</strong> and <strong>Negative (-{negativeMarks})</strong> marks match your exam rules (e.g. <em>+1 / 0</em>, <em>+1 / -0.25</em>, <em>+2 / -0.5</em>).
                </p>
                <p className="text-[11px] font-semibold text-amber-900 pt-0.5">
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
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Edit / Go Back</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmedSubmit}
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 py-2.5 px-4 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:bg-blue-800 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Evaluating Marks...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Calculate Now</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
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
