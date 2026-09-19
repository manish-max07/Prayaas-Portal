"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboardPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Rank examinations state
  const [rankExams, setRankExams] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("cbt"); // "cbt" | "rank" | "analytics"

  const { admin } = useAuth();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cbtRes, rankRes, analyticsRes] = await Promise.allSettled([
        api.get("/api/admin/exams"),
        api.get("/api/rank-calculator/admin/exams-summary"),
        api.get("/api/analytics/admin/summary"),
      ]);

      if (cbtRes.status === "fulfilled" && cbtRes.value.data?.examPapers) {
        setExams(cbtRes.value.data.examPapers);
      } else if (cbtRes.status === "rejected") {
        console.error("CBT exams fetch error:", cbtRes.reason);
      }

      if (rankRes.status === "fulfilled" && rankRes.value.data?.exams) {
        setRankExams(rankRes.value.data.exams);
      } else if (rankRes.status === "rejected") {
        console.error("Rank exams fetch error:", rankRes.reason);
      }

      if (analyticsRes.status === "fulfilled" && analyticsRes.value.data) {
        setAnalytics(analyticsRes.value.data);
      } else if (analyticsRes.status === "rejected") {
        console.error("Analytics fetch error:", analyticsRes.reason);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError("Unable to load repository data. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (examId, currentStatus, examTitle) => {
    const nextStatus = currentStatus === "live" ? "draft" : "live";
    const confirmMsg =
      nextStatus === "live"
        ? `Make "${examTitle}" LIVE?\n\nThis exam will become immediately visible and attemptable by all registered candidates.`
        : `Revert "${examTitle}" to DRAFT?\n\nThis exam will be hidden from normal candidates.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setTogglingId(examId);
      const res = await api.put(`/api/admin/exams/${examId}/status`, {
        status: nextStatus,
      });

      if (res.data) {
        setExams((prev) =>
          prev.map((ex) =>
            ex._id === examId ? { ...ex, status: res.data.status } : ex
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle exam status:", err);
      alert(err.response?.data?.message || "Failed to update exam status.");
    } finally {
      setTogglingId(null);
    }
  };

  const liveCount = exams.filter((e) => e.status === "live").length;
  const draftCount = exams.filter((e) => e.status === "draft").length;
  const totalRankSubmissions = rankExams.reduce(
    (acc, curr) => acc + (curr.submissionCount || 0),
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* 1. Default Password Warning Alert */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-amber-600 font-bold text-lg">⚠️</div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Security Notice: Default Administrator Account Active
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              If you are still using the default seeded password ("admin"), please update your password immediately to protect administrative routes.
            </p>
          </div>
        </div>
        <Link
          href="/admin/change-password"
          className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors shrink-0 text-center"
        >
          Change Password Now
        </Link>
      </div>

      {/* 2. Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Administrative Control Center
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage CBT exam papers, monitor live candidate answer key submissions, and inspect All-India leaderboards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/security"
            className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3.5 py-2 text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5"
          >
            <span>🛡️</span>
            <span>Security Dashboard</span>
          </Link>
          <button
            onClick={fetchAllData}
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            ↻ Refresh All
          </button>
          <Link
            href="/admin/exams/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <span>+ Create New Exam</span>
          </Link>
        </div>
      </div>

      {/* 3. Summary Counters Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-gray-500">CBT Exam Papers</span>
          <div className="mt-1 text-2xl font-extrabold text-gray-900">{exams.length}</div>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-green-700">Live CBT Exams</span>
          <div className="mt-1 text-2xl font-extrabold text-green-800">{liveCount}</div>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-indigo-700">Rank Submissions</span>
          <div className="mt-1 text-2xl font-extrabold text-indigo-800">{totalRankSubmissions}</div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-blue-700">🌐 Website Visits</span>
          <div className="mt-1 text-2xl font-extrabold text-blue-900">
            {analytics?.metrics?.totalSiteVisits ? analytics.metrics.totalSiteVisits.toLocaleString() : "0"}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700">📅 Visits Today (IST)</span>
          <div className="mt-1 text-2xl font-extrabold text-emerald-900">
            {analytics?.metrics?.todayVisits ? analytics.metrics.todayVisits.toLocaleString() : "0"}
          </div>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-purple-700">👁️ Article Reads</span>
          <div className="mt-1 text-2xl font-extrabold text-purple-900">
            {analytics?.metrics?.totalArticleViews ? analytics.metrics.totalArticleViews.toLocaleString() : "0"}
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation Switcher between CBT Exams, Rank Examinations, and Traffic Analytics */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-4 sm:space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab("cbt")}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 transition-colors cursor-pointer ${
              activeTab === "cbt"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <span>📝</span>
            <span>CBT Practice Exam Papers ({exams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("rank")}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 transition-colors cursor-pointer ${
              activeTab === "rank"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <span>⚡</span>
            <span>Rank Predictor & Live Leaderboards ({rankExams.length})</span>
            {totalRankSubmissions > 0 && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                {totalRankSubmissions} applicants
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 border-b-2 py-3 px-1 transition-colors cursor-pointer ${
              activeTab === "analytics"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <span>📊</span>
            <span>Website Traffic & Article Views</span>
            {analytics?.metrics?.todayVisits > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                +{analytics.metrics.todayVisits} today
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* 5. TAB 1: CBT Exams Table */}
      {activeTab === "cbt" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="border-b border-gray-200 bg-gray-50/70 px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              CBT Practice Exam Papers Repository
            </h2>
            <span className="text-xs text-gray-500">{exams.length} Exams Created</span>
          </div>

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-800 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-red-600">{error}</div>
          ) : exams.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <h3 className="text-sm font-bold text-gray-800">No exam papers created yet</h3>
              <p className="text-xs text-gray-500 mt-1">
                Click the button below to create your first CBT exam paper.
              </p>
              <Link
                href="/admin/exams/new"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
              >
                + Create First Exam
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="px-6 py-3.5">Exam Title</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Sections / Qs</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {exams.map((exam) => {
                    const isLive = exam.status === "live";
                    const isToggling = togglingId === exam._id;

                    return (
                      <tr key={exam._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">
                          <Link
                            href={`/admin/exams/${exam._id}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {exam.title}
                          </Link>
                          {exam.description && (
                            <p className="text-[11px] font-normal text-gray-500 line-clamp-1 mt-0.5">
                              {exam.description}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                            {exam.examCategory}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-600 font-mono">
                          {exam.totalDurationMinutes} mins
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          <span className="font-semibold text-gray-800">
                            {exam.sectionsCount || 0}
                          </span>{" "}
                          Secs /{" "}
                          <span className="font-semibold text-blue-700">
                            {exam.totalQuestions || 0}
                          </span>{" "}
                          Qs
                        </td>

                        <td className="px-6 py-4">
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleStatus(exam._id, exam.status, exam.title)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors ${
                              isLive
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isLive ? "bg-green-600" : "bg-amber-600"
                              }`}
                            />
                            <span>{isLive ? "LIVE" : "DRAFT"}</span>
                          </button>
                        </td>

                        <td className="px-6 py-4 text-gray-500 text-[11px]">
                          {exam.createdAt
                            ? new Date(exam.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          <Link
                            href={`/admin/exams/${exam._id}`}
                            className="rounded bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-200"
                          >
                            Configure & Sections
                          </Link>
                          <Link
                            href={`/exam/${exam._id}/leaderboard`}
                            target="_blank"
                            className="rounded bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Leaderboard ↗
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 2: Rank Examinations & Live Leaderboards Table */}
      {activeTab === "rank" && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="border-b border-gray-200 bg-indigo-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Rank Calculator Examinations & Live All-India Leaderboards
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Inspect applicant response sheets, calculate normalization difficulty, and view ranked candidate rosters.
              </p>
            </div>
            <Link
              href="/admin/rank-predictor"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900"
            >
              <span>⚡ Open Rank Predictor Hub</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : rankExams.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <h3 className="text-sm font-bold text-gray-800">No rank examinations active yet</h3>
              <p className="text-xs text-gray-500 mt-1">
                Default exams (AVNL Recruitment & CIL MT) seed automatically when students submit response sheets.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="px-6 py-3.5">Examination Name</th>
                    <th className="px-4 py-3.5">Marking Scheme</th>
                    <th className="px-4 py-3.5 text-center">Submissions</th>
                    <th className="px-4 py-3.5 text-center">Avg Score</th>
                    <th className="px-4 py-3.5 text-center">Top Score</th>
                    <th className="px-6 py-3.5 text-right">Leaderboard Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {rankExams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-gray-50 transition-colors">
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

                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        <Link
                          href={`/admin/rank-predictor?exam=${exam._id}`}
                          className="inline-flex items-center gap-1 rounded bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
                        >
                          <span>🏆</span>
                          <span>View Leaderboard</span>
                        </Link>
                        <Link
                          href={`/admin/rank-predictor/leaderboard/${exam._id}`}
                          target="_blank"
                          className="rounded bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-200"
                        >
                          Direct Link ↗
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. TAB 3: Website Traffic & Article Views Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Key Traffic Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">All-Time Website Views</span>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {analytics?.metrics?.totalSiteVisits ? analytics.metrics.totalSiteVisits.toLocaleString() : "0"}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Total browser page hits</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Today's Visits (IST)</span>
              <p className="text-3xl font-black text-emerald-600 mt-2">
                {analytics?.metrics?.todayVisits ? analytics.metrics.todayVisits.toLocaleString() : "0"}
              </p>
              <span className="text-[11px] text-emerald-700 mt-1 block">
                {analytics?.metrics?.todayUnique || 0} unique device(s) today
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Yesterday's Traffic</span>
              <p className="text-3xl font-black text-blue-600 mt-2">
                {analytics?.metrics?.yesterdayVisits ? analytics.metrics.yesterdayVisits.toLocaleString() : "0"}
              </p>
              <span className="text-[11px] text-blue-700 mt-1 block">Previous day total</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-xs">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Total Article Reads</span>
              <p className="text-3xl font-black text-purple-600 mt-2">
                {analytics?.metrics?.totalArticleViews ? analytics.metrics.totalArticleViews.toLocaleString() : "0"}
              </p>
              <span className="text-[11px] text-purple-700 mt-1 block">Cumulative views across all articles</span>
            </div>
          </div>

          {/* Top Read Articles Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>🏆</span>
                  <span>Top Read News Articles & Exam Alerts</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Articles ranked by total reader view count in database.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/articles"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Manage Articles CMS →
                </Link>
                <Link
                  href="/news"
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                >
                  Public News Hub ↗
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Article Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4 text-center">Views</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics?.topArticles && analytics.topArticles.length > 0 ? (
                    analytics.topArticles.map((art, idx) => (
                      <tr key={art._id || idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 text-center font-bold">
                          <span
                            className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-black ${
                              idx === 0
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : idx === 1
                                ? "bg-slate-200 text-slate-800"
                                : idx === 2
                                ? "bg-amber-50 text-amber-800"
                                : "text-slate-400"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 max-w-md">
                          <Link
                            href={`/news/${art.slug}`}
                            target="_blank"
                            className="hover:text-blue-600 transition line-clamp-1"
                          >
                            {art.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {art.category || "News"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {art.sector || "Central Govt"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs">
                            👁️ {(art.views || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/news/${art.slug}`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 transition"
                          >
                            Open ↗
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No articles viewed yet. Reader visits will appear here automatically.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popular Sections / Routes Breakdown */}
          {analytics?.popularRoutes && analytics.popularRoutes.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>📍</span>
                <span>Most Visited Website Sections</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {analytics.popularRoutes.map((route, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-slate-700 font-semibold">{route.path}</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {route.count.toLocaleString()} hits
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
