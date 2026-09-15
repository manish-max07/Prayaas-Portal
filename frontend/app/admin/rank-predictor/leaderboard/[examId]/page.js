"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function AdminRankLeaderboardPage({ params }) {
  const unwrappedParams = use(params);
  const { examId } = unwrappedParams;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
      console.error("Admin Leaderboard fetch error:", err);
      setError(err.response?.data?.message || err.message || "Failed to load admin leaderboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submissionId, candidateName, rollNumber) => {
    const confirmDelete = window.confirm(
      `Delete submission for candidate "${candidateName || rollNumber}" (Roll: ${rollNumber})?\n\nThis will permanently remove this record from calculations.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(submissionId);
      const res = await api.delete(`/api/rank-calculator/submission/${submissionId}`);
      if (res.data && res.data.success) {
        setData((prev) => ({
          ...prev,
          submissions: prev.submissions.filter((s) => s._id !== submissionId),
          totalCount: Math.max(0, (prev.totalCount || 1) - 1),
        }));
      }
    } catch (err) {
      console.error("Failed to delete submission:", err);
      alert(err.response?.data?.message || "Failed to delete submission.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (!data?.submissions || data.submissions.length === 0) {
      alert("No applicant records to export.");
      return;
    }

    const headers = [
      "AIR Rank",
      "Candidate Name",
      "Roll Number / Participant ID",
      "Category",
      "State",
      "Subject / Trade",
      "Test Date",
      "Test Time",
      "Test Center",
      "Total Score",
      "Attempted",
      "Correct",
      "Incorrect",
      "Accuracy (%)",
      "Submission Date",
    ];

    const rows = data.submissions.map((sub, idx) => {
      const rank = (page - 1) * 50 + idx + 1;
      return [
        rank,
        `"${(sub.participantName || "").replace(/"/g, '""')}"`,
        `"${(sub.participantId || "").replace(/"/g, '""')}"`,
        `"${sub.category || ""}"`,
        `"${sub.state || ""}"`,
        `"${(sub.subject || "").replace(/"/g, '""')}"`,
        `"${sub.testDate || ""}"`,
        `"${sub.testTime || ""}"`,
        `"${(sub.testCenterName || "").replace(/"/g, '""')}"`,
        sub.totalScore,
        sub.attempted,
        sub.correct,
        sub.incorrect,
        sub.accuracy,
        `"${new Date(sub.createdAt).toLocaleString()}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_leaderboard_${examId}_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSelectedTrade("all");
    setSelectedCategory("all");
    setSelectedShift("all");
    setSelectedState("all");
    setSearchTerm("");
    setPage(1);
  };

  const filteredSubmissions =
    data?.submissions?.filter((sub) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (sub.participantName && sub.participantName.toLowerCase().includes(term)) ||
        (sub.participantId && sub.participantId.toLowerCase().includes(term)) ||
        (sub.subject && sub.subject.toLowerCase().includes(term))
      );
    }) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Navigation Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link href="/admin/dashboard" className="hover:text-gray-700 transition-colors">
              Admin
            </Link>
            <span>/</span>
            <Link href="/admin/rank-predictor" className="hover:text-gray-700 transition-colors">
              Rank Predictor
            </Link>
            <span>/</span>
            <span className="text-indigo-600 font-bold">Global Leaderboard</span>
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            {data?.exam?.name ? `${data.exam.name} — All-India Leaderboard` : "Official All-India Leaderboard & Applicant Database"}
          </h1>
          <p className="mt-0.5 text-xs text-gray-500">
            {data?.exam?.marksForCorrect !== undefined
              ? `Marking: +${data.exam.marksForCorrect} / -${data.exam.negativeMarks} • Category: ${data.exam.examCategory} • Full applicant database`
              : "Admin console view • Full candidate identities, negative penalties, and comparative metrics"}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchLeaderboard}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>

          <Link
            href="/admin/rank-predictor"
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            &larr; Back to Exams
          </Link>
        </div>
      </div>

      {/* Shift Difficulty & Exam Stats Overview */}
      {data?.shiftStats && data.shiftStats.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Shift-wise Difficulty & Normalization Matrix
              </h2>
            </div>
            <span className="text-[11px] text-gray-400">
              Sorted by lowest average score (toughest shift first)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.shiftStats.map((st, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-100 bg-gray-50/60 p-3.5 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 truncate">
                    {st._id?.date || "Date N/A"}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      idx === 0
                        ? "bg-red-100 text-red-700"
                        : idx === data.shiftStats.length - 1
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {idx === 0 ? "🔥 Toughest" : idx === data.shiftStats.length - 1 ? "⚡ Easiest" : "Shift " + (idx + 1)}
                  </span>
                </div>
                <div className="text-gray-500 font-medium truncate">{st._id?.time || "Time N/A"}</div>
                <div className="pt-2 border-t border-gray-200/70 flex items-center justify-between">
                  <span className="text-gray-500">Candidates:</span>
                  <strong className="text-gray-800">{st.candidatesCount}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Avg Marks:</span>
                  <strong className="text-indigo-600 font-mono">
                    {st.avgScore ? st.avgScore.toFixed(2) : "0"}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Controls Strip */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search candidate name, roll number, or trade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 pl-9 text-xs text-gray-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2 text-[10px] text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Trade Filter */}
            {data?.filters?.trades?.length > 0 && (
              <select
                value={selectedTrade}
                onChange={(e) => {
                  setSelectedTrade(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Subjects/Trades</option>
                {data.filters.trades.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            {/* Category Filter */}
            {data?.filters?.categories?.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {data.filters.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {/* Shift Filter */}
            {data?.filters?.shifts?.length > 0 && (
              <select
                value={selectedShift}
                onChange={(e) => {
                  setSelectedShift(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Shifts</option>
                {data.filters.shifts.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}

            {/* State Filter */}
            {data?.filters?.states?.length > 0 && (
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All States</option>
                {data.filters.states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={resetFilters}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
          <span>
            Total Submissions Recorded: <strong>{data?.totalCount || 0}</strong> candidates
          </span>
          <span>
            Page {data?.page || 1} of {data?.totalPages || 1}
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Submissions Table */}
      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-medium text-gray-600">Loading candidate records...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500">
          No candidate submissions match your selected filter criteria.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3.5 text-center">AIR</th>
                  <th className="px-5 py-3.5">Candidate Details</th>
                  <th className="px-4 py-3.5">Trade / Subject</th>
                  <th className="px-4 py-3.5">Category & State</th>
                  <th className="px-4 py-3.5">Shift & Date</th>
                  <th className="px-4 py-3.5 text-center">Attempt / Acc.</th>
                  <th className="px-4 py-3.5 text-center">Total Score</th>
                  <th className="px-4 py-3.5 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredSubmissions.map((sub, idx) => {
                  const globalRank = (page - 1) * 50 + idx + 1;
                  return (
                    <tr key={sub._id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Rank */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                            globalRank === 1
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : globalRank === 2
                              ? "bg-slate-200 text-slate-800 border border-slate-400"
                              : globalRank === 3
                              ? "bg-orange-100 text-orange-800 border border-orange-300"
                              : "bg-gray-50 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {globalRank === 1 ? "🥇" : globalRank === 2 ? "🥈" : globalRank === 3 ? "🥉" : globalRank}
                        </span>
                      </td>

                      {/* Candidate Name & Roll */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900 text-xs">
                          {sub.participantName || "Candidate"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
                          <span>Roll: {sub.participantId}</span>
                        </div>
                      </td>

                      {/* Trade / Subject */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-gray-800 font-semibold">{sub.subject || "N/A"}</div>
                      </td>

                      {/* Category & State */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-block rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-100 mr-1.5">
                          {sub.category}
                        </span>
                        <span className="text-[11px] text-gray-600">{sub.state}</span>
                      </td>

                      {/* Shift & Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="text-gray-900 font-medium">{sub.testDate || "N/A"}</div>
                        <div className="text-[10px] text-gray-400">{sub.testTime || "N/A"}</div>
                      </td>

                      {/* Attempt & Accuracy */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="text-gray-900 font-semibold">
                          <span className="text-emerald-600">+{sub.correct}</span> /{" "}
                          <span className="text-red-500">-{sub.incorrect}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-semibold">
                          {sub.accuracy}% acc
                        </div>
                      </td>

                      {/* Total Score */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="text-sm font-black text-indigo-600 font-mono">
                          {sub.totalScore.toFixed(2)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                        <Link
                          href={`/rank-calculator/result/${sub._id}`}
                          target="_blank"
                          className="inline-block rounded bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Scorecard
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteSubmission(sub._id, sub.participantName, sub.participantId)
                          }
                          disabled={deletingId === sub._id}
                          className="rounded bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === sub._id ? "..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="border-t border-gray-200 bg-gray-50/70 px-4 py-3 flex items-center justify-between text-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-gray-300 bg-white px-3 py-1 font-semibold text-gray-700 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="rounded border border-gray-300 bg-white px-3 py-1 font-semibold text-gray-700 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
