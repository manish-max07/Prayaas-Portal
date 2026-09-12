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

  const { admin } = useAuth();

  useEffect(() => {
    fetchAdminExams();
  }, []);

  const fetchAdminExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/admin/exams");
      if (res.data && res.data.examPapers) {
        setExams(res.data.examPapers);
      }
    } catch (err) {
      console.error("Failed to load admin exams:", err);
      setError("Unable to load exam repository. Ensure backend is running.");
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
            Exam Papers Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Create, configure, upload questions via Excel, and manage CBT exam papers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminExams}
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            ↻ Refresh
          </button>
          <Link
            href="/admin/exams/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <span>+ Create New Exam</span>
          </Link>
        </div>
      </div>

      {/* 3. Summary Counters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-gray-500">Total Exams Created</span>
          <div className="mt-1 text-2xl font-extrabold text-gray-900">{exams.length}</div>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-green-700">Live & Active Exams</span>
          <div className="mt-1 text-2xl font-extrabold text-green-800">{liveCount}</div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <span className="text-xs font-semibold text-amber-700">Draft Exams</span>
          <div className="mt-1 text-2xl font-extrabold text-amber-800">{draftCount}</div>
        </div>
      </div>

      {/* 4. Exams Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
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
    </div>
  );
}
