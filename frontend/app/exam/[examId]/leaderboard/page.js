"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

function ExamLeaderboardContent({ params }) {
  const unwrappedParams = use(params);
  const { examId } = unwrappedParams;

  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [examId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/exams/${examId}/leaderboard`);
      if (res.data) {
        setLeaderboardData(res.data);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError(
        err.response?.data?.message || "Failed to load examination leaderboard."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-semibold text-gray-600">
          Loading rankings & leaderboard standing...
        </p>
      </div>
    );
  }

  if (error || !leaderboardData) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-bold">{error || "Leaderboard data not available."}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { examTitle, examCategory, totalParticipants, leaderboard = [] } =
    leaderboardData;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Leaderboard Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-100">
                {examCategory || "General"}
              </span>
              <span className="text-xs text-gray-500">Official Leaderboard</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {examTitle || "Exam Standings"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Rankings computed by Score (DESC) and Time Taken (ASC)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-50 p-3 border border-gray-200 text-center">
              <span className="text-[11px] text-gray-500 block">Total Participants</span>
              <span className="text-xl font-extrabold text-gray-900">
                {totalParticipants || leaderboard.length}
              </span>
            </div>
            <Link
              href={`/exam/${examId}`}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Practice This Exam
            </Link>
          </div>
        </div>

        {/* Leaderboard Table Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              No students have completed this exam yet. Be the first to take it!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 font-bold uppercase tracking-wider text-gray-600">
                  <tr>
                    <th className="px-6 py-3.5 text-center">Rank</th>
                    <th className="px-6 py-3.5">Candidate Name</th>
                    <th className="px-6 py-3.5">Score</th>
                    <th className="px-6 py-3.5">Accuracy</th>
                    <th className="px-6 py-3.5">Time Taken</th>
                    <th className="px-6 py-3.5 text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {leaderboard.map((entry) => {
                    const isTop1 = entry.rank === 1;
                    const isTop2 = entry.rank === 2;
                    const isTop3 = entry.rank === 3;

                    const totalAttempted =
                      (entry.correctCount || 0) + (entry.wrongCount || 0);
                    const accuracy =
                      totalAttempted > 0
                        ? Math.round(
                            ((entry.correctCount || 0) / totalAttempted) * 100
                          )
                        : 0;

                    const mins = Math.floor((entry.timeTakenSeconds || 0) / 60);
                    const secs = (entry.timeTakenSeconds || 0) % 60;

                    return (
                      <tr
                        key={entry.rank}
                        className={`transition-colors ${
                          isTop1
                            ? "bg-amber-50/50 font-medium"
                            : isTop2
                            ? "bg-slate-50/50"
                            : isTop3
                            ? "bg-amber-50/30"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {isTop1 ? (
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-extrabold text-xs shadow-xs">
                              🥇 1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-slate-900 font-extrabold text-xs shadow-xs">
                              🥈 2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-600/30 text-amber-900 font-extrabold text-xs shadow-xs">
                              🥉 3
                            </span>
                          ) : (
                            <span className="font-bold text-gray-500">
                              #{entry.rank}
                            </span>
                          )}
                        </td>

                        {/* Candidate Name */}
                        <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                              {entry.userName.charAt(0).toUpperCase()}
                            </div>
                            <span>{entry.userName}</span>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-extrabold text-blue-700 text-sm">
                            {entry.score}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {" "}
                            / {entry.totalMarks}
                          </span>
                        </td>

                        {/* Correct / Wrong / Accuracy */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          <span className="text-green-600 font-semibold">
                            +{entry.correctCount || 0}
                          </span>{" "}
                          /{" "}
                          <span className="text-red-600 font-semibold">
                            -{entry.wrongCount || 0}
                          </span>{" "}
                          <span className="text-gray-400 text-[10px]">
                            ({accuracy}%)
                          </span>
                        </td>

                        {/* Time Taken */}
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-mono">
                          {mins}m {secs}s
                        </td>

                        {/* Submission Date */}
                        <td className="px-6 py-4 text-right whitespace-nowrap text-gray-500 text-[11px]">
                          {entry.submitTime
                            ? new Date(entry.submitTime).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExamLeaderboardPage({ params }) {
  return (
    <ProtectedRoute>
      <ExamLeaderboardContent params={params} />
    </ProtectedRoute>
  );
}
