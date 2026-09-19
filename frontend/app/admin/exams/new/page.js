"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const CATEGORIES = [
  "SSC",
  "Banking",
  "Railway",
  "Engineering",
  "Defence",
  "Teaching",
  "Civil Services / UPSC",
  "State PSC",
  "Other",
];

const POPULAR_AUTHORITIES = [
  "AVNL",
  "SSC",
  "RRB",
  "Coal India Limited",
  "Delhi Police",
  "IBPS",
  "SBI",
  "UPSC",
  "CBSE / CTET",
  "DSSSB",
  "ISRO",
  "DRDO",
  "IOCL",
  "BHEL",
];

export default function CreateExamPage() {
  // Response Sheet / Digialm Link State
  const [responseSheetUrl, setResponseSheetUrl] = useState("");
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [metadataSuccess, setMetadataSuccess] = useState(null);
  const [metadataError, setMetadataError] = useState(null);
  const [extractedMeta, setExtractedMeta] = useState(null);
  const [autoImportQuestions, setAutoImportQuestions] = useState(true);

  // Structured Exam Parameters
  const [authority, setAuthority] = useState("");
  const [position, setPosition] = useState("");
  const [subject, setSubject] = useState("");
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [shift, setShift] = useState("Shift 1");
  const [examDate, setExamDate] = useState("");
  const [medium, setMedium] = useState("Bilingual (English / Hindi)");

  // Legacy / Common fields
  const [title, setTitle] = useState("");
  const [isTitleManual, setIsTitleManual] = useState(false);
  const [description, setDescription] = useState("");
  const [examCategory, setExamCategory] = useState("SSC");
  const [totalDurationMinutes, setTotalDurationMinutes] = useState(60);
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);

  const router = useRouter();

  // Auto-compose title if not manually overwritten
  useEffect(() => {
    if (!isTitleManual) {
      const parts = [authority, position, subject, examYear, shift]
        .map((s) => (s || "").trim())
        .filter(Boolean);
      if (parts.length > 0) {
        setTitle(parts.join(" "));
      }
    }
  }, [authority, position, subject, examYear, shift, isTitleManual]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsTitleManual(true);
  };

  const handleResetAutoTitle = () => {
    setIsTitleManual(false);
    const parts = [authority, position, subject, examYear, shift]
      .map((s) => (s || "").trim())
      .filter(Boolean);
    setTitle(parts.join(" "));
  };

  // Inspect Response Sheet URL to extract metadata
  const handleFetchMetadata = async () => {
    if (!responseSheetUrl || !responseSheetUrl.trim()) {
      setMetadataError("Please enter a valid Digialm / TCS iON Response Sheet URL.");
      return;
    }

    setFetchingMetadata(true);
    setMetadataError(null);
    setMetadataSuccess(null);

    try {
      const res = await api.post("/api/admin/exams/inspect-response-sheet", {
        url: responseSheetUrl.trim(),
      });

      if (res.data && res.data.metadata) {
        const meta = res.data.metadata;
        setExtractedMeta(meta);
        setMetadataSuccess("Response Sheet detected! Exam parameters have been pre-filled below.");

        // Pre-fill structured fields
        if (meta.examDate) setExamDate(meta.examDate);
        if (meta.examYear) setExamYear(meta.examYear);
        if (meta.shift) setShift(meta.shift);
        if (meta.position) setPosition(meta.position);
        if (meta.subject) setSubject(meta.subject);
        if (meta.duration && meta.duration > 0) setTotalDurationMinutes(meta.duration);
        if (meta.medium) setMedium(meta.medium);
        if (meta.examCategory && CATEGORIES.includes(meta.examCategory)) {
          setExamCategory(meta.examCategory);
        }

        // Allow auto-composer to compute fresh canonical title
        setIsTitleManual(false);
      }
    } catch (err) {
      console.error("Inspect response sheet error:", err);
      setMetadataError(
        err.response?.data?.message || "Failed to inspect response sheet URL. Please verify the link is accessible."
      );
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleClearResponseSheet = () => {
    setResponseSheetUrl("");
    setExtractedMeta(null);
    setMetadataSuccess(null);
    setMetadataError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const finalTitle = title.trim();
    if (!finalTitle) {
      setError("Please provide an examination title or fill in the structured exam fields.");
      return;
    }

    if (!totalDurationMinutes || Number(totalDurationMinutes) <= 0) {
      setError("Duration must be at least 1 minute.");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Creating exam paper in database...");

      const res = await api.post("/api/admin/exams", {
        title: finalTitle,
        authority: authority.trim(),
        position: position.trim(),
        subject: subject.trim(),
        examYear: examYear.trim(),
        examDate: examDate.trim(),
        shift: shift.trim(),
        medium: medium.trim(),
        description: description.trim(),
        examCategory,
        totalDurationMinutes: Number(totalDurationMinutes),
        negativeMarkingEnabled,
      });

      if (res.data && res.data.examPaper) {
        const examId = res.data.examPaper._id;

        // Auto-import questions if requested and URL was analyzed
        if (autoImportQuestions && responseSheetUrl.trim()) {
          setLoadingMessage(`Importing questions from response sheet into ${finalTitle}...`);
          try {
            await api.post(`/api/admin/exams/${examId}/import-digialm`, {
              digialmUrl: responseSheetUrl.trim(),
            });
          } catch (importErr) {
            console.warn("Question auto-import notice:", importErr);
          }
        }

        router.push(`/admin/exams/${examId}`);
      }
    } catch (err) {
      console.error("Create exam error:", err);
      setError(
        err.response?.data?.message || "Failed to create exam. Please verify inputs."
      );
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Breadcrumb & Title */}
      <div className="border-b border-gray-200 pb-4">
        <Link
          href="/admin/dashboard"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mt-2">
          Create New Exam Paper
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Paste the official response sheet link to auto-fill details, or configure parameters manually.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 shadow-xs">
          {error}
        </div>
      )}

      {/* STEP 1: Response Sheet Link Auto-Fill Hero Card */}
      <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-xs">
              ⚡
            </span>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Auto-Fill from Response Sheet Link (Recommended)
              </h2>
              <p className="text-xs text-gray-600">
                Paste the official Digialm / TCS iON question paper link to auto-fill Date, Shift, Trade, Duration, and Language.
              </p>
            </div>
          </div>
          {responseSheetUrl && (
            <button
              type="button"
              onClick={handleClearResponseSheet}
              className="text-xs text-gray-500 hover:text-gray-800 underline font-semibold shrink-0 cursor-pointer"
            >
              Clear Link
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-col sm:flex-row gap-2.5">
          <input
            type="url"
            value={responseSheetUrl}
            onChange={(e) => setResponseSheetUrl(e.target.value)}
            placeholder="https://cdn.digialm.com//per/g01/pub/1258/touchstone/AssessmentQPHTMLMode1/.../assessment.html"
            className="flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs font-mono"
          />
          <button
            type="button"
            onClick={handleFetchMetadata}
            disabled={fetchingMetadata || !responseSheetUrl.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
          >
            {fetchingMetadata ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing Link...</span>
              </>
            ) : (
              <>
                <span>⚡ Fetch &amp; Auto-Fill Details</span>
              </>
            )}
          </button>
        </div>

        {metadataError && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
            ⚠️ {metadataError}
          </div>
        )}

        {metadataSuccess && extractedMeta && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                ✅ Response Sheet Detected &amp; Analyzed
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                {extractedMeta.totalQuestions} Questions · {extractedMeta.sections?.length || 0} Sections
              </span>
            </div>

            {/* Extracted Parameter Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Exam Date</span>
                <span className="font-bold text-gray-900">{extractedMeta.rawTestDate || extractedMeta.examDate || "N/A"}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Shift &amp; Time</span>
                <span className="font-bold text-gray-900">{extractedMeta.shift} {extractedMeta.rawTestTime ? `(${extractedMeta.rawTestTime})` : ""}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Test Duration</span>
                <span className="font-bold text-gray-900">{extractedMeta.duration} Minutes</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Language</span>
                <span className="font-bold text-gray-900">{extractedMeta.medium}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 col-span-2">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Detected Post / Vacancy</span>
                <span className="font-bold text-gray-900">{extractedMeta.position || "N/A"}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 col-span-2">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Trade / Specialisation</span>
                <span className="font-bold text-gray-900">{extractedMeta.subject || "N/A"}</span>
              </div>
            </div>

            {/* Auto-import questions toggle */}
            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoImportQuestions}
                  onChange={(e) => setAutoImportQuestions(e.target.checked)}
                  className="h-4 w-4 rounded border-emerald-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-emerald-950">
                  Auto-import all {extractedMeta.totalQuestions} questions into this exam immediately upon creation
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Structured Exam Parameters */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-600 mb-3">
              1. Authority, Post &amp; Specialisation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Authority */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Authority / Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="authorities-list"
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                  placeholder="e.g. AVNL, SSC, RRB, CIL"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <datalist id="authorities-list">
                  {POPULAR_AUTHORITIES.map((auth) => (
                    <option key={auth} value={auth} />
                  ))}
                </datalist>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  e.g. AVNL, SSC, Coal India Limited
                </span>
              </div>

              {/* Position / Post */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Position / Post / Vacancy <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Junior Manager, Junior Fitter"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  e.g. Junior Manager, Junior Fitter, CGL
                </span>
              </div>

              {/* Subject / Trade / Specialisation */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subject / Trade / Specialisation
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Mechanical"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  e.g. IT, Mechanical Engineering, Civil
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Year, Shift, Date & Medium */}
          <div className="pt-2 border-t border-gray-100">
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-600 mb-3">
              2. Year, Shift, Exam Date &amp; Medium
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Year */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Exam Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                  placeholder="e.g. 2026, 2024"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Shift */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Shift
                </label>
                <input
                  type="text"
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  placeholder="e.g. Shift 1, Shift 2"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Exam Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Medium */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Medium / Language
                </label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Bilingual (English / Hindi)">Bilingual (English / Hindi)</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Regional / Multi-lingual">Regional / Multi-lingual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Generated Full Title */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Full Exam Title (Auto-Composed) <span className="text-red-500">*</span>
              </label>
              {isTitleManual && (
                <button
                  type="button"
                  onClick={handleResetAutoTitle}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  ↺ Re-compose from parameters
                </button>
              )}
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. AVNL Junior Manager Artificial Intelligence 2026 Shift 2"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
            />
            <div className="mt-2 p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="text-blue-700 font-bold uppercase text-[10px] tracking-wide block">
                  Candidate Display Preview
                </span>
                <span className="text-slate-900 font-bold truncate block">
                  {title || "Please enter authority and position details..."}
                </span>
              </div>
              <span className="shrink-0 text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                {medium}
              </span>
            </div>
          </div>

          {/* Section 4: Category, Duration & Negative Marking */}
          <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Portal Exam Category <span className="text-red-500">*</span>
              </label>
              <select
                value={examCategory}
                onChange={(e) => setExamCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Total Duration (Minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalDurationMinutes}
                onChange={(e) => setTotalDurationMinutes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Short Description / Syllabus Summary
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Official shift question paper for AVNL Junior Manager in Artificial Intelligence stream."
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Negative Marking Toggle */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={negativeMarkingEnabled}
                onChange={(e) => setNegativeMarkingEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-gray-900">
                  Enable Negative Marking
                </span>
                <p className="text-[11px] text-gray-500">
                  When enabled, questions with negative mark values will deduct penalties for wrong candidate answers.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin/dashboard"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading
                ? loadingMessage || "Creating Exam..."
                : autoImportQuestions && responseSheetUrl.trim()
                ? "Save & Auto-Import Questions →"
                : "Save & Proceed to Sections →"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
