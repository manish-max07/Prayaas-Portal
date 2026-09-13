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
  const [marksForCorrect, setMarksForCorrect] = useState(1.0);
  const [negativeMarks, setNegativeMarks] = useState(0.0);
  const [category, setCategory] = useState("OBC");
  const [state, setState] = useState("Delhi NCR");
  const [horizontalCategory, setHorizontalCategory] = useState("None");
  const [gender, setGender] = useState("Male");
  const [securityPin, setSecurityPin] = useState("1234");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
        if (res.data.exams.length > 0) {
          setSelectedExamId(res.data.exams[0]._id);
          // Set defaults to +1 and 0 as requested
          setMarksForCorrect(res.data.exams[0].marksForCorrect ?? 1.0);
          setNegativeMarks(res.data.exams[0].negativeMarks ?? 0.0);
        }
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
    setCategory("OBC");
  };

  const handleSubmit = async (e) => {
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

    if (!agreedToTerms) {
      setError("Please agree to the Terms and Conditions and Privacy-Policy to proceed (tick the checkbox).");
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage("Connecting to examination response server...");

      const payload = {
        responseUrl: inputMode === "url" ? responseUrl.trim() : "",
        rawHtml: inputMode === "html" ? rawHtml : "",
        examId: selectedExamId,
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
            <span>Instant TCS iON & Digialm Response Sheet Evaluation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Official Exam <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">Rank & Marks Calculator</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Paste your post-exam response sheet link to calculate exact normalized marks, sectional accuracy, and check your real-time <strong>AIR, Category, Trade & Shift Ranks</strong> against thousands of candidates.
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
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {exams.map((ex) => (
                    <option key={ex._id} value={ex._id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
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
    </div>
  );
}
