"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

function MyAttemptsContent() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/users/me/attempts");
      if (res.data && res.data.attempts) {
        setAttempts(res.data.attempts);
      }
    } catch (err) {
      console.error("Failed to load attempt history:", err);
      setError("Unable to retrieve your examination history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          My Exam Practice History
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review your submitted practice exams, scores, and performance breakdowns
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : attempts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h3 className="text-base font-semibold text-gray-900">
            No exam attempts found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't completed any practice exams yet.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            Browse Practice Tests
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Exam Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Correct / Wrong</th>
                <th className="px-6 py-3">Time Taken</th>
                <th className="px-6 py-3">Submitted On</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {attempts.map((att) => (
                <tr key={att.attemptId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {att.exam?.title || "Exam Paper"}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {att.exam?.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-blue-600">
                      {att.score}
                    </span>
                    <span className="text-xs text-gray-400">
                      {" "}
                      / {att.totalMarks}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="text-green-600 font-semibold">
                      +{att.correctCount}
                    </span>{" "}
                    /{" "}
                    <span className="text-red-600 font-semibold">
                      -{att.wrongCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {Math.floor(att.timeTakenSeconds / 60)}m{" "}
                    {att.timeTakenSeconds % 60}s
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {att.submitTime
                      ? new Date(att.submitTime).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/exam/${att.exam?._id || 'view'}/result/${att.attemptId}`}
                      className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      View Analysis
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function MyAttemptsPage() {
  return (
    <ProtectedRoute>
      <MyAttemptsContent />
    </ProtectedRoute>
  );
}
