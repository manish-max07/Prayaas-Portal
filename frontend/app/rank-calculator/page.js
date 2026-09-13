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
            {/* Input Mode Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Response Sheet Source
                </label>
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setInputMode("url")}
                    className={`rounded-md px-3 py-1 transition-all cursor-pointer ${
                      inputMode === "url"
                        ? "bg-white text-blue-600 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Paste Link (URL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("html")}
                    className={`rounded-md px-3 py-1 transition-all cursor-pointer ${
                      inputMode === "html"
                        ? "bg-white text-blue-600 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Paste HTML Source
                  </button>
                </div>
              </div>

              {inputMode === "url" ? (
                <div>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://cdn.digialm.com//per/g01/pub/.../assessment.html"
                      value={responseUrl}
                      onChange={(e) => setResponseUrl(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 py-3 pl-4 pr-24 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handlePasteDemoLink}
                      className="absolute right-2 top-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      Sample Link
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Supports any official TCS iON / Digialm candidate response sheet link (SSC, RRB, DFCCIL, GATE, etc.).
                  </p>
                </div>
              ) : (
                <div>
                  <textarea
                    rows={4}
                    placeholder="Right click response sheet in browser -> View Page Source -> Copy all and paste here..."
                    value={rawHtml}
                    onChange={(e) => setRawHtml(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Use this option if your link has expired or is blocked by CORS/VPN.
                  </p>
                </div>
              )}
            </div>

            {/* Exam Selection Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Examination / Agency
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-3 px-3.5 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {exams.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Marking Scheme (+ve / -ve Marks) */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                    Marking Scheme Customization
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Default is <strong>+1</strong> for correct & <strong>0</strong> for wrong. You can customize them below if needed.
                  </p>
                </div>
                {/* Preset Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold text-slate-500">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMarksForCorrect(1.0);
                      setNegativeMarks(0.0);
                    }}
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold border transition-colors cursor-pointer ${
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
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold border transition-colors cursor-pointer ${
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
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold border transition-colors cursor-pointer ${
                      marksForCorrect === 2.0 && negativeMarks === 0.5
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    +2 / -0.5
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Marks For Correct (+ve)
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Negative Penalty Per Wrong (-ve)
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

            {/* Demographics Grid: Category, State, Gender, Horizontal Category */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Reservation Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="UR">UR (Unreserved / General)</option>
                  <option value="OBC">OBC (Other Backward Class - NCL)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Home State / UT
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horizontal Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Horizontal Category
                </label>
                <select
                  value={horizontalCategory}
                  onChange={(e) => setHorizontalCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="None">None (General)</option>
                  <option value="PwD">PwD (Persons with Disabilities)</option>
                  <option value="Ex-Servicemen">Ex-Servicemen (ESM)</option>
                  <option value="Female">Women Reservation</option>
                  <option value="Other">Other Sub-Category</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Transgender</option>
                </select>
              </div>
            </div>

            {/* Security PIN / Password for returning */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  4-Digit Security PIN
                </label>
                <p className="text-[11px] text-slate-500">
                  Remember this PIN to re-view or modify your submission anytime.
                </p>
              </div>
              <input
                type="text"
                maxLength={4}
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                className="w-28 rounded-xl border border-slate-300 py-2 px-3 text-center text-sm font-mono font-bold tracking-widest text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{statusMessage || "Evaluating Response Sheet..."}</span>
                  </>
                ) : (
                  <>
                    <span>Calculate Marks & Predict Rank</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
      </main>
    </div>
  );
}
