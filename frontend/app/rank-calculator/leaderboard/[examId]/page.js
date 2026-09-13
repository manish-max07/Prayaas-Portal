"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function RankLeaderboardPage({ params }) {
  const unwrappedParams = use(params);
  const { examId } = unwrappedParams;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedTrade, setSelectedTrade] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedShift, setSelectedShift] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLeaderboard();
  }, [examId, selectedTrade, selectedCategory, selectedShift, selectedState, page]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({
        trade: selectedTrade,
        category: selectedCategory,
        shift: selectedShift,
        state: selectedState,
        page: String(page),
        limit: "50",
      });

      const res = await api.get(`/api/rank-calculator/leaderboard/${examId}?${queryParams.toString()}`);
      if (res.data && res.data.success) {
        setData(res.data);
      } else {
        throw new Error(res.data?.message || "Failed to fetch leaderboard.");
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError(err.response?.data?.message || err.message || "Failed to load leaderboard.");
    } finally {
      setLoading(false);
    }
  };

  const maskName = (name) => {
    if (!name) return "Candidate";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].slice(0, 3) + "***";
    }
    return parts[0] + " " + parts[1].slice(0, 1) + "***";
  };

  const maskRoll = (roll) => {
    if (!roll || roll.length < 5) return roll;
    return roll.slice(0, 3) + "****" + roll.slice(-2);
  };

  const resetFilters = () => {
    setSelectedTrade("all");
    setSelectedCategory("all");
    setSelectedShift("all");
    setSelectedState("all");
    setSearchTerm("");
    setPage(1);
  };

  // Client-side search within current page of submissions
  const filteredSubmissions = data?.submissions?.filter((sub) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (sub.participantName && sub.participantName.toLowerCase().includes(term)) ||
      (sub.participantId && sub.participantId.toLowerCase().includes(term)) ||
      (sub.subject && sub.subject.toLowerCase().includes(term))
    );
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Examination Standing</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
              All-India Marks & Rank Leaderboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative shift-wise rankings, category percentiles, and subject standings.
            </p>
          </div>

          <Link
            href="/rank-calculator"
            className="self-start sm:self-auto rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Calculate Your Rank</span>
          </Link>
        </div>

        {/* 1. SHIFT DIFFICULTY ANALYZER WIDGET */}
        {data?.shiftStats && data.shiftStats.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">📊</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Shift Difficulty & Average Marks Analyzer
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Sorted from Toughest to Easiest
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.shiftStats.map((shift, sIdx) => {
                const isToughest = sIdx === 0;
                return (
                  <div
                    key={sIdx}
                    className={`rounded-xl border p-3.5 text-xs ${
                      isToughest
                        ? "border-purple-300 bg-purple-50/50"
                        : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {shift._id.date || "Exam Shift"} • {shift._id.time || "Shift"}
                      </span>
                      {isToughest && (
                        <span className="rounded bg-purple-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          Toughest Shift
                        </span>
                      )}
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-1 text-[11px] text-slate-600 pt-2 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Avg Score</span>
                        <strong className="text-slate-900 text-xs">{shift.avgScore?.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Highest</span>
                        <strong className="text-emerald-700 text-xs">{shift.maxScore}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Candidates</span>
                        <strong className="text-slate-800 text-xs">{shift.candidatesCount}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. FILTER STRIP */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search candidate name, roll no, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
              />
              <svg className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {(selectedTrade !== "all" || selectedCategory !== "all" || selectedShift !== "all" || selectedState !== "all" || searchTerm) && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer self-start sm:self-auto"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-2 border-t border-slate-100 text-xs">
            {/* Subject/Trade Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject / Trade</label>
              <select
                value={selectedTrade}
                onChange={(e) => {
                  setSelectedTrade(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none"
              >
                <option value="all">All Subjects / Branches</option>
                {data?.filters?.trades?.map((tr) => (
                  <option key={tr} value={tr}>
                    {tr}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {data?.filters?.categories?.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Shift Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Shift</label>
              <select
                value={selectedShift}
                onChange={(e) => {
                  setSelectedShift(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none"
              >
                <option value="all">All Shifts</option>
                {data?.filters?.shifts?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none"
              >
                <option value="all">All States</option>
                {data?.filters?.states?.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. RANKINGS TABLE */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-xs text-slate-500 font-semibold">Updating Live Ranks...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-700 text-xs">
              <p>{error}</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <div className="text-3xl mb-2">🔍</div>
              <p className="font-bold text-slate-700">No submissions found matching filters.</p>
              <p className="mt-1">Try resetting the filters or submit your response sheet first.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Subject / Trade</th>
                    <th className="py-3 px-3 text-center">Category</th>
                    <th className="py-3 px-3">State</th>
                    <th className="py-3 px-3 text-center">Shift</th>
                    <th className="py-3 px-3 text-center text-emerald-700">Correct</th>
                    <th className="py-3 px-3 text-center text-rose-700">Wrong</th>
                    <th className="py-3 px-3 text-center">Accuracy</th>
                    <th className="py-3 px-6 text-right font-black">Raw Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((sub, idx) => {
                    const rankNum = (page - 1) * 50 + idx + 1;
                    const isTop1 = rankNum === 1;
                    const isTop2 = rankNum === 2;
                    const isTop3 = rankNum === 3;

                    return (
                      <tr key={sub._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-center font-bold">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black shadow-xs">
                              1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-200 text-slate-800 text-xs font-black">
                              2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-black">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-600 font-mono">#{rankNum}</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{maskName(sub.participantName)}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{maskRoll(sub.participantId)}</div>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-700 max-w-xs truncate" title={sub.subject}>
                          {sub.subject}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                            {sub.category}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-600 truncate max-w-[100px]" title={sub.state}>
                          {sub.state}
                        </td>

                        <td className="py-3 px-3 text-center text-[11px] text-slate-500 whitespace-nowrap">
                          {sub.testTime || "Shift 1"}
                        </td>

                        <td className="py-3 px-3 text-center font-bold text-emerald-600">
                          +{sub.correct}
                        </td>

                        <td className="py-3 px-3 text-center font-bold text-rose-600">
                          -{sub.incorrect}
                        </td>

                        <td className="py-3 px-3 text-center text-slate-600 font-semibold">
                          {sub.accuracy}%
                        </td>

                        <td className="py-3 px-6 text-right font-black text-slate-900 text-sm">
                          {sub.totalScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {data?.totalPages > 1 && (
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page {data.page} of {data.totalPages} ({data.totalCount} Candidates)
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  &larr; Prev
                </button>
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold text-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
