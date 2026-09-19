"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function AdminRankPredictorPage() {
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [examsError, setExamsError] = useState(null);

  // Active view: either an examId (string) or "overview"
  const [selectedExamId, setSelectedExamId] = useState(null);

  // Leaderboard data for selected exam
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filters for active leaderboard
  const [selectedTrade, setSelectedTrade] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedShift, setSelectedShift] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  // 1. Fetch exams summary on mount
  useEffect(() => {
    fetchExamsSummary();
  }, []);

  const fetchExamsSummary = async () => {
    try {
      setLoadingExams(true);
      setExamsError(null);
      const res = await api.get("/api/rank-calculator/admin/exams-summary");
      if (res.data && res.data.exams) {
        const examList = res.data.exams.filter(
          (e) =>
            e.slug !== "avnl-recruitment-2026" &&
            e.name?.toLowerCase() !== "avnl recruitment 2026"
        );
        setExams(examList);

        const urlParams =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : null;
        const requestedExam = urlParams ? urlParams.get("exam") : null;

        if (requestedExam && examList.some((e) => e._id === requestedExam || e.slug === requestedExam)) {
          const match = examList.find((e) => e._id === requestedExam || e.slug === requestedExam);
          setSelectedExamId(match._id);
        } else if (!selectedExamId && examList.length > 0) {
          const withSubmissions = examList.find((e) => (e.submissionCount || 0) > 0);
          setSelectedExamId(withSubmissions ? withSubmissions._id : examList[0]._id);
        }
      } else {
        throw new Error(res.data?.message || "Failed to load exams summary.");
      }
    } catch (err) {
      console.error("Admin Rank Exams fetch error:", err);
      setExamsError(err.response?.data?.message || err.message || "Failed to load rank exams summary.");
    } finally {
      setLoadingExams(false);
    }
  };

  // 2. Fetch Leaderboard when selectedExamId or filters change
  const fetchLeaderboard = useCallback(async () => {
    if (!selectedExamId || selectedExamId === "overview") return;

    try {
      setLoadingLeaderboard(true);
      setLeaderboardError(null);

      const queryParams = new URLSearchParams({
        trade: selectedTrade,
        category: selectedCategory,
        shift: selectedShift,
        state: selectedState,
        page: String(page),
        limit: "50",
      });

      const res = await api.get(
        `/api/rank-calculator/leaderboard/${selectedExamId}?${queryParams.toString()}`
      );

      if (res.data && res.data.success) {
        setLeaderboardData(res.data);
      } else {
        throw new Error(res.data?.message || "Failed to fetch leaderboard.");
      }
    } catch (err) {
      console.error("Admin Leaderboard fetch error:", err);
      setLeaderboardError(
        err.response?.data?.message || err.message || "Failed to load candidate leaderboard."
      );
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [selectedExamId, selectedTrade, selectedCategory, selectedShift, selectedState, page]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleSelectExam = (id) => {
    setSelectedExamId(id);
    setSelectedTrade("all");
    setSelectedCategory("all");
    setSelectedShift("all");
    setSelectedState("all");
    setSearchTerm("");
    setPage(1);
    setLeaderboardData(null);
  };

  const resetFilters = () => {
    setSelectedTrade("all");
    setSelectedCategory("all");
    setSelectedShift("all");
    setSelectedState("all");
    setSearchTerm("");
    setPage(1);
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
        setLeaderboardData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            submissions: prev.submissions.filter((s) => s._id !== submissionId),
            totalCount: Math.max(0, (prev.totalCount || 1) - 1),
          };
        });

        // Also decrement in exams summary
        setExams((prev) =>
          prev.map((e) =>
            e._id === selectedExamId
              ? { ...e, submissionCount: Math.max(0, (e.submissionCount || 1) - 1) }
              : e
          )
        );
      }
    } catch (err) {
      console.error("Failed to delete submission:", err);
      alert(err.response?.data?.message || "Failed to delete submission.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (!leaderboardData?.submissions || leaderboardData.submissions.length === 0) {
      alert("No applicant records to export for this view.");
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

    const rows = leaderboardData.submissions.map((sub, idx) => {
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
    link.setAttribute("download", `admin_leaderboard_${selectedExamId}_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSubmissions = exams.reduce((acc, curr) => acc + (curr.submissionCount || 0), 0);
  const overallTopperScore = exams.reduce((max, curr) => Math.max(max, curr.maxScore || 0), 0);

  const currentExam = exams.find((e) => e._id === selectedExamId);

  const filteredSubmissions =
    leaderboardData?.submissions?.filter((sub) => {
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
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
              <span>⚡</span>
              <span>Admin Module</span>
            </span>
            <span className="text-xs text-gray-500 font-medium">Evaluation & Cutoff Engine</span>
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Rank Predictor & Global Leaderboards
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-2xl">
            Live All-India rankings, candidate answer key marks, normalization difficulty, and full applicant registries for all competitive recruitment exams.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              fetchExamsSummary();
              if (selectedExamId !== "overview") fetchLeaderboard();
            }}
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
          <Link
            href="/rank-calculator"
            target="_blank"
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <span>🔗</span>
            <span>Candidate Portal ↗</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Benchmark Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Configured Rank Exams
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-gray-900">{exams.length}</div>
            <div className="text-xs text-emerald-600 font-medium">Evaluation models</div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total Submissions Recorded
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-indigo-600">{totalSubmissions}</div>
            <div className="text-xs text-gray-500 font-medium">Candidates in database</div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Overall Highest Score
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-amber-600">
              {overallTopperScore.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 font-medium">All-India Topper Marks</div>
          </div>
        </div>
      </div>

      {/* Errors & Alerts */}
      {examsError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          ⚠️ {examsError}
        </div>
      )}

      {/* 3. Examination Selector Navigation Strip */}
      <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-xs">
        <div className="flex items-center justify-between gap-3 px-2 py-1.5 border-b border-gray-100 sm:border-0 sm:pb-0">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Select Examination:
          </div>

          {/* Mobile Select dropdown */}
          <div className="sm:hidden flex-1 max-w-[200px]">
            <select
              value={selectedExamId || "overview"}
              onChange={(e) => handleSelectExam(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-800"
            >
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.name} ({exam.submissionCount || 0})
                </option>
              ))}
              <option value="overview">📋 All Exams Overview</option>
            </select>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:flex flex-wrap items-center gap-1.5 pt-1">
          {exams.map((exam) => {
            const isSelected = selectedExamId === exam._id;
            return (
              <button
                key={exam._id}
                onClick={() => handleSelectExam(exam._id)}
                className={`group flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/80"
                }`}
              >
                <span>🏆</span>
                <span className="truncate max-w-[220px]">{exam.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isSelected
                      ? "bg-indigo-800 text-indigo-100"
                      : "bg-gray-200 text-gray-700 group-hover:bg-gray-300"
                  }`}
                >
                  {exam.submissionCount || 0}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setSelectedExamId("overview")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ml-auto ${
              selectedExamId === "overview"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span>📋</span>
            <span>All Exams Overview</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN VIEW: Leaderboard View OR All Exams Overview */}
      {selectedExamId === "overview" ? (
        /* Overview Table of all examinations */
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="border-b border-gray-200 bg-gray-50/70 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                All Configured Competitive Examinations
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Summary of all active exam models, marking schemes, and submission metrics
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {exams.length} Active Models
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Exam Name & Category</th>
                  <th className="px-4 py-3.5">Marking Scheme</th>
                  <th className="px-4 py-3.5 text-center">Submissions</th>
                  <th className="px-4 py-3.5 text-center">Avg Score</th>
                  <th className="px-4 py-3.5 text-center">Top Score</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {exams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">{exam.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500">
                        <span className="rounded bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
                          {exam.examCategory}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-gray-400">{exam.slug}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-semibold">
                        +{exam.marksForCorrect} / -{exam.negativeMarks}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {exam.totalExpectedQuestions} Questions total
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                        {exam.submissionCount} candidates
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center whitespace-nowrap font-bold text-gray-800">
                      {exam.avgScore > 0 ? exam.avgScore : "N/A"}
                    </td>

                    <td className="px-4 py-4 text-center whitespace-nowrap font-bold text-emerald-600">
                      {exam.maxScore > 0 ? exam.maxScore : "N/A"}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleSelectExam(exam._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
                      >
                        <span>🏆</span>
                        <span>Open Leaderboard</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Selected Exam's Complete Live Leaderboard */
        <div className="space-y-5">
          {/* Active Exam Metadata Banner */}
          {currentExam && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {currentExam.examCategory || "Competitive Exam"}
                  </span>
                  <span className="text-xs text-indigo-800 font-mono">
                    Model: {currentExam.slug}
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {currentExam.name} - All-India Leaderboard
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Marking: +{currentExam.marksForCorrect} per correct, -{currentExam.negativeMarks} per wrong • Total Questions: {currentExam.totalExpectedQuestions}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[11px] text-gray-500 uppercase font-semibold">
                    Live Candidates
                  </div>
                  <div className="text-xl font-extrabold text-indigo-600">
                    {currentExam.submissionCount || 0}
                  </div>
                </div>
                <div className="h-8 w-px bg-indigo-200" />
                <div className="text-right">
                  <div className="text-[11px] text-gray-500 uppercase font-semibold">
                    Top Score
                  </div>
                  <div className="text-xl font-extrabold text-emerald-600">
                    {currentExam.maxScore ? currentExam.maxScore.toFixed(2) : "0.00"}
                  </div>
                </div>
                <div className="h-8 w-px bg-indigo-200" />
                <Link
                  href={`/admin/rank-predictor/leaderboard/${selectedExamId}`}
                  target="_blank"
                  className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-2xs"
                >
                  Standalone View ↗
                </Link>
              </div>
            </div>
          )}

          {/* Shift Difficulty Matrix (if available) */}
          {leaderboardData?.shiftStats && leaderboardData.shiftStats.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📊</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Shift-wise Difficulty & Normalization Matrix
                  </h3>
                </div>
                <span className="text-[11px] text-gray-400">
                  Toughest shift first (lowest average marks)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {leaderboardData.shiftStats.map((st, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-gray-100 bg-gray-50/60 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 truncate">
                        {st._id?.date || "Date N/A"}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          idx === 0
                            ? "bg-red-100 text-red-700"
                            : idx === leaderboardData.shiftStats.length - 1
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {idx === 0
                          ? "🔥 Toughest"
                          : idx === leaderboardData.shiftStats.length - 1
                          ? "⚡ Easiest"
                          : "Shift " + (idx + 1)}
                      </span>
                    </div>
                    <div className="text-gray-500 font-medium truncate text-[11px]">
                      {st._id?.time || "Time N/A"}
                    </div>
                    <div className="pt-1.5 border-t border-gray-200/70 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Candidates:</span>
                      <strong className="text-gray-800">{st.candidatesCount}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
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

          {/* Leaderboard Controls & Filters */}
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

              {/* Action Buttons: Export & Refresh */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={!leaderboardData?.submissions?.length}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>📥</span>
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={fetchLeaderboard}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>🔄</span>
                  <span>Reload</span>
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              {/* Trade Filter */}
              {leaderboardData?.filters?.trades?.length > 0 && (
                <select
                  value={selectedTrade}
                  onChange={(e) => {
                    setSelectedTrade(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="all">All Subjects/Trades</option>
                  {leaderboardData.filters.trades.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}

              {/* Category Filter */}
              {leaderboardData?.filters?.categories?.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {leaderboardData.filters.categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              {/* Shift Filter */}
              {leaderboardData?.filters?.shifts?.length > 0 && (
                <select
                  value={selectedShift}
                  onChange={(e) => {
                    setSelectedShift(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="all">All Shifts</option>
                  {leaderboardData.filters.shifts.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}

              {/* State Filter */}
              {leaderboardData?.filters?.states?.length > 0 && (
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="all">All States</option>
                  {leaderboardData.filters.states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={resetFilters}
                className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>

              <div className="ml-auto text-[11px] text-gray-500">
                Found <strong>{leaderboardData?.totalCount || 0}</strong> candidates
              </div>
            </div>
          </div>

          {/* Leaderboard Error */}
          {leaderboardError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
              ⚠️ {leaderboardError}
            </div>
          )}

          {/* Leaderboard Table */}
          {loadingLeaderboard ? (
            <div className="flex min-h-[35vh] flex-col items-center justify-center gap-3 bg-white rounded-xl border border-gray-200">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <p className="text-xs font-medium text-gray-600">
                Fetching live applicant standings...
              </p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500">
              <div className="text-2xl mb-1">📭</div>
              <p className="font-semibold text-gray-700">No applicant submissions found</p>
              <p className="mt-0.5 text-gray-400">
                {searchTerm || selectedTrade !== "all" || selectedCategory !== "all"
                  ? "Try clearing your search query or filter selections."
                  : "No candidates have evaluated their response sheets for this examination yet."}
              </p>
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
                          {/* AIR Rank with Podium Badges */}
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                                globalRank === 1
                                  ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs"
                                  : globalRank === 2
                                  ? "bg-slate-200 text-slate-800 border border-slate-400 shadow-2xs"
                                  : globalRank === 3
                                  ? "bg-orange-100 text-orange-800 border border-orange-300 shadow-2xs"
                                  : "bg-gray-50 text-gray-700 border border-gray-200"
                              }`}
                            >
                              {globalRank === 1
                                ? "🥇"
                                : globalRank === 2
                                ? "🥈"
                                : globalRank === 3
                                ? "🥉"
                                : globalRank}
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
                              className="inline-block rounded bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                              Scorecard ↗
                            </Link>
                            <button
                              onClick={() =>
                                handleDeleteSubmission(
                                  sub._id,
                                  sub.participantName,
                                  sub.participantId
                                )
                              }
                              disabled={deletingId === sub._id}
                              className="rounded bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
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
              {leaderboardData?.totalPages > 1 && (
                <div className="border-t border-gray-200 bg-gray-50/70 px-4 py-3 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded border border-gray-300 bg-white px-3 py-1 font-semibold text-gray-700 disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {page} of {leaderboardData.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(leaderboardData.totalPages, p + 1))}
                    disabled={page >= leaderboardData.totalPages}
                    className="rounded border border-gray-300 bg-white px-3 py-1 font-semibold text-gray-700 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
