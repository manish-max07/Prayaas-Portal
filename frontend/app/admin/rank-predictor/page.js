"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function AdminRankPredictorPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExamsSummary();
  }, []);

  const fetchExamsSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/rank-calculator/admin/exams-summary");
      if (res.data && res.data.exams) {
        setExams(res.data.exams);
      } else {
        throw new Error(res.data?.message || "Failed to load exams summary.");
      }
    } catch (err) {
      console.error("Admin Rank Exams fetch error:", err);
      setError(err.response?.data?.message || err.message || "Failed to load rank exams summary.");
    } finally {
      setLoading(false);
    }
  };

  const totalSubmissions = exams.reduce((acc, curr) => acc + (curr.submissionCount || 0), 0);
  const overallTopperScore = exams.reduce((max, curr) => Math.max(max, curr.maxScore || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
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
            Monitor applicant submissions, inspect All-India rankings, analyze shift-wise normalization difficulty, and inspect full candidate records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchExamsSummary}
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔄</span>
            <span>Refresh Stats</span>
          </button>
          <Link
            href="/rank-calculator"
            target="_blank"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <span>🔗</span>
            <span>Candidate Portal View</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Configured Rank Exams
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-gray-900">{exams.length}</div>
            <div className="text-xs text-emerald-600 font-medium">Active evaluation models</div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total Applicant Submissions
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-indigo-600">{totalSubmissions}</div>
            <div className="text-xs text-gray-500 font-medium">across all shifts</div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Highest Score Recorded
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-amber-600">{overallTopperScore.toFixed(2)}</div>
            <div className="text-xs text-gray-500 font-medium">Marks benchmark</div>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-medium text-gray-600">Loading Rank Predictor examinations...</p>
        </div>
      ) : (
        /* Exams Table */
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="border-b border-gray-200 bg-gray-50/70 px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Competitive Examinations & Global Leaderboards
            </h2>
            <span className="text-xs text-gray-500">
              Showing {exams.length} active exam models
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
                  <th className="px-6 py-3.5 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {exams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-sm">
                        {exam.name}
                      </div>
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
                      <Link
                        href={`/admin/rank-predictor/leaderboard/${exam._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                      >
                        <span>🏆</span>
                        <span>Global Leaderboard</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
