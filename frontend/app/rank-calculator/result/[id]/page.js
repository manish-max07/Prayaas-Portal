"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toPng } from "html-to-image";
import QRCode from "qrcode";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RankResultPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const { isAdmin } = useAuth();
  const router = useRouter();
  const scorecardRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    fetchResult();
  }, [id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      QRCode.toDataURL(url, {
        width: 130,
        margin: 1,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      })
        .then((dataUrl) => setQrCodeDataUrl(dataUrl))
        .catch((err) => console.error("QR Generation error:", err));

      const now = new Date();
      const formatted =
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        ", " +
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }) +
        " (IST)";
      setCurrentDateTime(formatted);
    }
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/rank-calculator/submission/${id}`);
      if (res.data && res.data.success) {
        setData(res.data);
      } else {
        throw new Error(res.data?.message || "Submission details not found.");
      }
    } catch (err) {
      console.error("Failed to fetch submission:", err);
      setError(err.response?.data?.message || err.message || "Failed to load scorecard.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!scorecardRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(scorecardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
        style: {
          overflow: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        },
      });

      const participant = data?.submission?.participantId || "Candidate";
      const link = document.createElement("a");
      link.download = `Smart_Score_Card_${participant}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Scorecard PNG export error:", err);
      alert("Could not generate PNG automatically. Opening print preview instead.");
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-700">Computing Live Ranks & Scorecard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-xs">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-bold text-base">{error || "Scorecard unavailable"}</h2>
          <p className="text-xs text-red-600 mt-1">
            Could not locate or calculate ranks for this submission ID.
          </p>
          <Link
            href="/rank-calculator"
            className="mt-5 inline-block rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
          >
            Go to Rank Calculator
          </Link>
        </div>
      </div>
    );
  }

  const { submission, ranks } = data;

  // Marking & Percentage calculations
  const marksPerCorrect = submission.marksForCorrectScheme || 1.0;
  const maxScore = (submission.totalQuestions || 100) * marksPerCorrect;
  const attemptPct =
    submission.totalQuestions > 0
      ? ((submission.attempted / submission.totalQuestions) * 100).toFixed(1)
      : "0.0";
  const scorePct = maxScore > 0 ? ((submission.totalScore / maxScore) * 100).toFixed(2) : "0.00";

  // Proxied header logo to guarantee zero CORS issues when exporting to PNG
  const apiBase = api.defaults.baseURL || "http://localhost:5000";
  const proxiedBannerUrl = submission.headerImageUrl
    ? `${apiBase}/api/rank-calculator/proxy-image?url=${encodeURIComponent(submission.headerImageUrl)}`
    : null;

  return (
    <div className="min-h-screen bg-slate-100/70 py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Top Actions Bar (Hidden on print) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 print:hidden">
          <Link
            href="/rank-calculator"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Check Another Response Sheet</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {isAdmin && submission?.rankExam && (
              <Link
                href={`/admin/rank-predictor/leaderboard/${submission.rankExam._id || submission.rankExam}`}
                target="_blank"
                className="rounded-lg bg-blue-50 border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Admin Leaderboard ↗</span>
              </Link>
            )}

            <button
              onClick={handleDownloadPng}
              disabled={downloading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{downloading ? "Generating PNG..." : "Download Scorecard (PNG)"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal View Wrapper with gentle hint */}
        <div className="block md:hidden text-[11px] text-blue-800 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-center font-medium shadow-2xs">
          <strong>Mobile View:</strong> Swipe horizontally on the scorecard below to inspect all columns, or tap <strong>Download Scorecard (PNG)</strong> to get the high-res image.
        </div>

        {/* Scrollable Container for Mobile Viewports */}
        <div className="w-full overflow-x-auto pb-4 -mx-1 px-1">
          <div
            ref={scorecardRef}
            className="min-w-[720px] max-w-5xl mx-auto rounded-2xl border border-slate-300/80 bg-white p-6 sm:p-8 shadow-sm space-y-6 text-slate-800 overflow-hidden"
          >
          {/* 1. TOP HEADER BANNER (With Department / PSU Logo) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
            {/* Left: Department / PSU Header Banner Image */}
            <div className="flex items-center justify-center sm:justify-start min-w-[180px] max-w-xs">
              {proxiedBannerUrl ? (
                <img
                  src={proxiedBannerUrl}
                  alt="Exam Conducting Authority"
                  crossOrigin="anonymous"
                  className="max-h-16 max-w-full object-contain rounded"
                />
              ) : (
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2 text-left">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800 leading-tight">
                      {submission.examName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Official Candidate Assessment
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Center: Title */}
            <div className="text-center">
              <div className="text-xs font-black tracking-widest text-blue-600 uppercase">
                PRAYAAS PORTAL
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-0.5">
                SMART SCORE CARD
              </h1>
              <div className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">
                Live • Version-aware • Community Analysis
              </div>
            </div>

            {/* Right: Subject & Verification Pills */}
            <div className="text-center sm:text-right shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SUBJECT
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 max-w-[220px] truncate">
                {submission.subject}
              </div>
              <div className="mt-1 flex items-center justify-center sm:justify-end gap-2 text-[10px] font-bold">
                <span className="inline-flex items-center gap-1 text-blue-600">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>RANK READY</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>QR VERIFIED</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2. CANDIDATE PROFILE & HIGHLIGHT RANK BOX */}
          <div className="rounded-xl border border-slate-300/80 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-row items-stretch justify-between gap-4">
              {/* Profile Details (3 Columns) */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-2.5 text-xs flex-1">
                {/* Column 1 */}
                <div className="space-y-2">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Candidate Name</div>
                    <div className="text-xs font-black uppercase text-slate-900 mt-0.5 truncate">
                      {submission.participantName || "Candidate"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Gender</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {submission.gender || "Male"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Trade / Post</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5 line-clamp-2">
                      {submission.subject}
                    </div>
                    {ranks?.trade && (
                      <div className="inline-block mt-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200">
                        Trade Rank: #{ranks.trade.rank} / {ranks.trade.total}
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-2">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Roll Number</div>
                    <div className="text-xs font-black font-mono text-slate-900 mt-0.5">
                      {submission.participantId}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Exam Date</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {submission.testDate || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Exam Language</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {submission.examLanguage || "English"}
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-2">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Category</div>
                    <div className="text-xs font-black text-slate-900 mt-0.5">
                      {submission.category}
                    </div>
                    {ranks?.category && (
                      <div className="inline-block mt-1 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-extrabold text-purple-700 border border-purple-200">
                        Cat. Rank: #{ranks.category.rank} / {ranks.category.total}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Shift / Time</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                      {submission.testTime || "N/A"}
                    </div>
                    {ranks?.shift && (
                      <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                        Shift Rank: #{ranks.shift.rank} / {ranks.shift.total}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Exam Centre</div>
                    <div className="text-xs font-medium text-slate-700 mt-0.5 line-clamp-2">
                      {submission.testCenterName || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Far Right: Royal Purple "YOUR RANK" Highlight Box */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-[#342478] via-[#3E2B92] to-[#452FA0] text-white p-4 text-center w-[150px] shrink-0 shadow-sm">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                  ALL INDIA RANK
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1 leading-none">
                  #{ranks.air.rank}
                </div>
                <div className="text-[10px] text-purple-200 mt-1 font-medium">
                  Out of {ranks.air.total}
                </div>
                {ranks.percentile !== undefined && (
                  <div className="mt-1.5 rounded bg-white/20 px-2 py-0.5 text-[9px] font-black tracking-wide text-amber-200">
                    {ranks.percentile}%ile
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. DYNAMIC RANKINGS & BENCHMARKS STRIP */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                OFFICIAL RANKINGS &amp; COMPARATIVE STANDINGS
              </h2>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Real-time Dynamic Standings</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Card 1: All India Rank */}
              <div className="rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-3.5 text-center shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>All India Rank</span>
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-blue-950 font-mono">
                  #{ranks.air?.rank || 1}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-blue-700">
                  Out of {ranks.air?.total || 1} candidates
                </div>
                <div className="mt-1 text-[9px] font-bold text-blue-500 uppercase">
                  National Standing
                </div>
              </div>

              {/* Card 2: Category Rank */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/70 to-white p-3.5 text-center shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Category Rank</span>
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  #{ranks.category?.rank || 1}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-slate-700">
                  Out of {ranks.category?.total || 1} in {ranks.category?.name || submission.category}
                </div>
                <div className="mt-1 text-[9px] font-bold text-slate-500 uppercase">
                  Category Quota
                </div>
              </div>

              {/* Card 3: Trade / Subject Rank */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/70 to-white p-3.5 text-center shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                  <span className="truncate max-w-[130px]">Trade Rank</span>
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  #{ranks.trade?.rank || 1}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-slate-700 truncate" title={submission.subject}>
                  Out of {ranks.trade?.total || 1} in Trade
                </div>
                <div className="mt-1 text-[9px] font-bold text-slate-500 uppercase truncate" title={submission.subject}>
                  {submission.subject}
                </div>
              </div>

              {/* Card 4: Shift Rank & Percentile */}
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/70 to-white p-3.5 text-center shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Shift Standing</span>
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
                  #{ranks.shift?.rank || 1}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-emerald-700">
                  Out of {ranks.shift?.total || 1} ({ranks.percentile}%ile)
                </div>
                <div className="mt-1 text-[9px] font-bold text-emerald-600 uppercase">
                  Shift Normalization
                </div>
              </div>
            </div>
          </div>

          {/* 4. PERFORMANCE OVERVIEW */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              PERFORMANCE OVERVIEW
            </h2>

            <div className="grid grid-cols-4 gap-3">
              {/* Raw Score */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Raw Score</div>
                <div className="mt-1 text-lg sm:text-xl font-black text-[#6B21A8]">
                  {submission.totalScore.toFixed(2)}/{maxScore.toFixed(2)}
                </div>
              </div>

              {/* Accuracy */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Accuracy</div>
                <div className="mt-1 text-lg sm:text-xl font-black text-emerald-600">
                  {submission.accuracy}%
                </div>
              </div>

              {/* Attempt */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Attempt</div>
                <div className="mt-1 text-lg sm:text-xl font-black text-amber-600">
                  {attemptPct}%
                </div>
              </div>

              {/* Correct / Wrong */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Correct / Wrong</div>
                <div className="mt-1 text-lg sm:text-xl font-black text-slate-900">
                  {submission.correct} / {submission.incorrect}
                </div>
              </div>
            </div>

            <div className="mt-1.5 text-[10px] text-slate-500">
              Score {scorePct}% • Attempted {submission.attempted}/{submission.totalQuestions} • Analysis based on up to {ranks.air.total} candidates
            </div>
          </div>

          {/* 4. SECTION-WISE PERFORMANCE (No scrollbars, perfectly fitted columns) */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              SECTION-WISE PERFORMANCE
            </h2>

            <div className="overflow-hidden rounded-xl border border-slate-300 bg-white">
              <table className="w-full table-fixed text-left text-[11px] text-slate-700">
                <thead className="bg-[#0B57D0] text-white font-bold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="w-[36%] px-3.5 py-2.5">Section</th>
                    <th className="w-[8%] px-2 py-2.5 text-center">Total</th>
                    <th className="w-[9%] px-2 py-2.5 text-center">Correct</th>
                    <th className="w-[9%] px-2 py-2.5 text-center">Wrong</th>
                    <th className="w-[12%] px-2 py-2.5 text-center">Unattempted</th>
                    <th className="w-[9%] px-2 py-2.5 text-center">Score</th>
                    <th className="w-[9%] px-2 py-2.5 text-center">Maximum</th>
                    <th className="w-[8%] px-2 py-2.5 text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {submission.sectionBreakdown && submission.sectionBreakdown.length > 0 ? (
                    submission.sectionBreakdown.map((sec, idx) => {
                      const secMax = (sec.questions || 0) * marksPerCorrect;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-3.5 py-2 font-bold text-slate-900 truncate">
                            {sec.sectionName}
                          </td>
                          <td className="px-2 py-2 text-center font-semibold">
                            {sec.questions}
                          </td>
                          <td className="px-2 py-2 text-center font-bold text-emerald-600">
                            {sec.correct}
                          </td>
                          <td className="px-2 py-2 text-center font-bold text-red-600">
                            {sec.incorrect}
                          </td>
                          <td className="px-2 py-2 text-center text-slate-500">
                            {sec.unanswered}
                          </td>
                          <td className="px-2 py-2 text-center font-bold text-slate-900">
                            {sec.score.toFixed(2)}
                          </td>
                          <td className="px-2 py-2 text-center font-semibold text-slate-600">
                            {secMax.toFixed(2)}
                          </td>
                          <td className="px-2 py-2 text-center text-slate-500 font-semibold">
                            Main
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="px-3.5 py-2 font-bold text-slate-900">General Paper</td>
                      <td className="px-2 py-2 text-center font-semibold">{submission.totalQuestions}</td>
                      <td className="px-2 py-2 text-center font-bold text-emerald-600">{submission.correct}</td>
                      <td className="px-2 py-2 text-center font-bold text-red-600">{submission.incorrect}</td>
                      <td className="px-2 py-2 text-center text-slate-500">{submission.unattempted}</td>
                      <td className="px-2 py-2 text-center font-bold text-slate-900">{submission.totalScore.toFixed(2)}</td>
                      <td className="px-2 py-2 text-center font-semibold text-slate-600">{maxScore.toFixed(2)}</td>
                      <td className="px-2 py-2 text-center text-slate-500 font-semibold">Main</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. IMPORTANT NOTE / महत्वपूर्ण सूचना (With QR Code) */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-left flex-1">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-900">
                  IMPORTANT NOTE / महत्वपूर्ण सूचना
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Raw score and live rank are ready. Normalization and Expected Cutoff may still be processing. Reopen the same Result Link later for the latest Smart Score Card.
                </p>
                <p className="text-[11px] font-medium text-slate-800 pt-1">
                  यह computer-generated Smart Score Card आधिकारिक score card नहीं है।
                </p>
              </div>

              {/* QR Code Verification */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>SCAN TO VERIFY - v2.1</span>
                </div>
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Scan to verify Smart Scorecard"
                    className="h-24 w-24 rounded-lg border border-slate-300 bg-white p-1 shadow-2xs"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-lg border border-slate-300 bg-white flex items-center justify-center text-[10px] text-slate-400">
                    QR Ready
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6. SCORECARD FOOTER BAR */}
          <div className="rounded-xl bg-[#0B2559] text-white py-3 px-4 text-center text-xs space-y-0.5">
            <div className="font-bold tracking-wide">
              Prayaas Portal (prayaas-portal.com) • Smart Score Card System
            </div>
            <div className="text-[11px] text-slate-300">
              Date & Time: {currentDateTime || "14 Sept 2026, 01:04 AM (IST)"}
            </div>
          </div>
        </div>
        </div>

        {/* Outer Legal Links */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 max-w-4xl mx-auto">
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
          </div>
        </div>
      </div>
    </div>
  );
}
