"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function RankResultPage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResult();
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-700">Computing Live Ranks & Shift Analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-xs">
          <div className="text-3xl mb-2">⚠️</div>
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

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
          <Link
            href="/rank-calculator"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>&larr;</span>
            <span>Check Another Response Sheet</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Print Scorecard</span>
            </button>
          </div>
        </div>

        {/* 1. CANDIDATE PROFILE & EXAM HEADER BANNER */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 border border-blue-100 uppercase tracking-wide">
                {submission.examName}
              </span>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black text-slate-900">
                {submission.participantName || "Candidate Scorecard"}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span>Roll: <strong className="text-slate-800 font-mono">{submission.participantId}</strong></span>
                <span>•</span>
                <span>Category: <strong className="text-slate-800">{submission.category}</strong></span>
                <span>•</span>
                <span>State: <strong className="text-slate-800">{submission.state}</strong></span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1 md:text-right shrink-0">
              <div>Subject / Trade: <strong className="text-slate-900">{submission.subject}</strong></div>
              <div>Test Date: <strong className="text-slate-900">{submission.testDate || "N/A"}</strong></div>
              <div>Shift Timing: <strong className="text-slate-900">{submission.testTime || "N/A"}</strong></div>
              <div className="text-[11px] text-slate-400 truncate max-w-xs">{submission.testCenterName}</div>
            </div>
          </div>

          {/* 2. DYNAMIC LIVE RANKS TILES */}
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Live Comparative Standing Across Submissions
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {/* All India Rank */}
              <div className="rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50/80 to-white p-4 shadow-xs text-center">
                <span className="text-lg">🏆</span>
                <div className="text-xs font-bold text-amber-900 mt-1">All India Rank (AIR)</div>
                <div className="text-2xl font-black text-amber-600 mt-0.5">
                  #{ranks.air.rank}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  out of {ranks.air.total}
                </div>
                <div className="mt-1.5 text-[10px] font-bold text-amber-700 bg-amber-100/60 rounded px-1.5 py-0.5 inline-block">
                  {ranks.percentile}%ile
                </div>
              </div>

              {/* Category Rank */}
              <div className="rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50/80 to-white p-4 shadow-xs text-center">
                <span className="text-lg">🏷️</span>
                <div className="text-xs font-bold text-blue-900 mt-1">{submission.category} Category Rank</div>
                <div className="text-2xl font-black text-blue-600 mt-0.5">
                  #{ranks.category.rank}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  out of {ranks.category.total}
                </div>
              </div>

              {/* Trade/Subject Rank */}
              <div className="rounded-xl border border-purple-200 bg-gradient-to-b from-purple-50/80 to-white p-4 shadow-xs text-center">
                <span className="text-lg">🛠️</span>
                <div className="text-xs font-bold text-purple-900 mt-1">Trade / Branch Rank</div>
                <div className="text-2xl font-black text-purple-600 mt-0.5">
                  #{ranks.trade.rank}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  out of {ranks.trade.total}
                </div>
              </div>

              {/* Shift Rank */}
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white p-4 shadow-xs text-center">
                <span className="text-lg">⏱️</span>
                <div className="text-xs font-bold text-emerald-900 mt-1">Shift Rank</div>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">
                  #{ranks.shift.rank}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  out of {ranks.shift.total}
                </div>
              </div>

              {/* State Rank */}
              <div className="rounded-xl border border-rose-200 bg-gradient-to-b from-rose-50/80 to-white p-4 shadow-xs text-center col-span-2 sm:col-span-1">
                <span className="text-lg">📍</span>
                <div className="text-xs font-bold text-rose-900 mt-1">State Rank ({submission.state})</div>
                <div className="text-2xl font-black text-rose-600 mt-0.5">
                  #{ranks.state.rank}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  out of {ranks.state.total}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SCORE & ACCURACY SUMMARY CARDS */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Net Calculated Score</span>
            <div className="mt-1 text-3xl font-black text-slate-900">
              {submission.totalScore}
              <span className="text-sm font-semibold text-slate-400 ml-1">/ {submission.totalQuestions}</span>
            </div>
            <div className="mt-2 text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span>+{submission.positiveMarks} positive</span>
              <span className="text-slate-300">•</span>
              <span className="text-rose-600">-{submission.negativeMarks} penalty</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Overall Accuracy</span>
            <div className="mt-1 text-3xl font-black text-blue-600">
              {submission.accuracy}%
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {submission.correct} correct out of {submission.attempted} answered
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Attempted Questions</span>
            <div className="mt-1 text-3xl font-black text-slate-900">
              {submission.attempted}
              <span className="text-sm font-semibold text-slate-400 ml-1">/ {submission.totalQuestions}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {submission.unattempted} questions left unattempted
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Shift Benchmark</span>
            <div className="mt-1 text-xl font-bold text-slate-800">
              Avg: {ranks.benchmarks?.examAverage || submission.totalScore}
            </div>
            <div className="mt-2 text-xs text-amber-700 font-semibold">
              Topper Score: {ranks.benchmarks?.topperScore || submission.totalScore}
            </div>
          </div>
        </div>

        {/* 4. SECTION-WISE BREAKDOWN TABLE */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Section-wise Marks & Question Breakdown
            </h3>
            <span className="text-xs text-slate-500">
              {submission.sectionBreakdown?.length || 0} Sections Evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-6">Section Name</th>
                  <th className="py-3 px-4 text-center">Questions</th>
                  <th className="py-3 px-4 text-center text-emerald-700">Correct</th>
                  <th className="py-3 px-4 text-center text-rose-700">Wrong</th>
                  <th className="py-3 px-4 text-center text-slate-500">Left</th>
                  <th className="py-3 px-4 text-center text-rose-600">Penalty</th>
                  <th className="py-3 px-6 text-right font-black">Net Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submission.sectionBreakdown?.map((sec, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">{sec.sectionName}</td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-700">{sec.questions}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                      +{sec.correct}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-600">
                      -{sec.incorrect}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400">{sec.unanswered}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-rose-600">
                      -{sec.negativeMarks}
                    </td>
                    <td className="py-3.5 px-6 text-right font-black text-slate-900 text-sm">
                      {sec.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. FOOTER ACTION BANNER */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Compare with Other Shift Candidates</h3>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              See who topped your subject, view shift difficulty rankings to predict normalization impact, and check full filtered leaderboards.
            </p>
          </div>

          <Link
            href={`/rank-calculator/leaderboard/${submission.rankExam?._id || submission.rankExam}`}
            className="shrink-0 rounded-xl bg-white px-6 py-3 text-xs font-bold text-blue-700 shadow-md hover:bg-blue-50 transition-colors text-center"
          >
            Explore Live Leaderboard &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
