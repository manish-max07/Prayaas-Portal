"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const CATEGORIES = ["SSC", "Banking", "Railway", "State PSC", "UPSC", "Defence", "Teaching", "Other"];

export default function CreateExamPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examCategory, setExamCategory] = useState("SSC");
  const [totalDurationMinutes, setTotalDurationMinutes] = useState(60);
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide an examination title.");
      return;
    }

    if (!totalDurationMinutes || Number(totalDurationMinutes) <= 0) {
      setError("Duration must be at least 1 minute.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/admin/exams", {
        title: title.trim(),
        description: description.trim(),
        examCategory,
        totalDurationMinutes: Number(totalDurationMinutes),
        negativeMarkingEnabled,
      });

      if (res.data && res.data.examPaper) {
        const examId = res.data.examPaper._id;
        router.push(`/admin/exams/${examId}`);
      }
    } catch (err) {
      console.error("Create exam error:", err);
      setError(
        err.response?.data?.message || "Failed to create exam. Please verify inputs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Breadcrumb & Title */}
      <div className="border-b border-gray-200 pb-4">
        <Link
          href="/admin/dashboard"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mt-2">
          Create New Exam Paper
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Step 1: Define exam metadata and duration (created in Draft status).
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Exam Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SSC CGL 2026 Tier-1 Full Mock Test #01"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Exam Category <span className="text-red-500">*</span>
              </label>
              <select
                value={examCategory}
                onChange={(e) => setExamCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Total Duration (Minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalDurationMinutes}
                onChange={(e) => setTotalDurationMinutes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Can be updated anytime later as well.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Short Description / Syllabus Summary
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Contains 4 sections: General Intelligence, Quantitative Aptitude, General Awareness, and English Comprehension."
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Negative Marking Toggle */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={negativeMarkingEnabled}
                onChange={(e) => setNegativeMarkingEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-gray-900">
                  Enable Negative Marking
                </span>
                <p className="text-[11px] text-gray-500">
                  When enabled, questions with negative mark values will deduct penalties for wrong candidate answers.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              href="/admin/dashboard"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? "Creating Exam..." : "Save & Proceed to Sections →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
