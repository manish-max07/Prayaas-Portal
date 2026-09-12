"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = ["All", "SSC", "Banking", "Railway", "State PSC", "UPSC", "Defence", "Other"];

export default function HomePage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/exams");
      if (res.data && res.data.exams) {
        setExams(res.data.exams);
      }
    } catch (err) {
      console.error("Failed to load exams:", err);
      setError("Unable to connect to the exam server. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Filter exams by category and search text
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesCategory =
        selectedCategory === "All" || exam.examCategory === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [exams, selectedCategory, searchQuery]);

  // Group filtered exams by examCategory
  const groupedExams = useMemo(() => {
    const groups = {};
    filteredExams.forEach((exam) => {
      const cat = exam.examCategory || "Other";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(exam);
    });
    return groups;
  }, [filteredExams]);

  const handleStartPractice = (examId) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/exam/${examId}`);
    } else {
      router.push(`/exam/${examId}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <div className="mb-10 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 sm:p-12 text-white shadow-md">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-blue-200 backdrop-blur-sm border border-blue-400/30">
            TCS iON Examination Simulation
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Ace Your Competitive Exams with Real Practice Tests
          </h1>
          <p className="mt-3 text-base sm:text-lg text-blue-100">
            Practice tests modelled directly after official exam portals. Time limits, negative marking, section navigation, and instant score breakdowns.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="mb-8 space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search exams by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <svg
              className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Clear Filters button */}
          {(selectedCategory !== "All" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 underline cursor-pointer self-start sm:self-center"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Category Pill Badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading available exam papers...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={fetchExams}
            className="mt-3 inline-block rounded-md bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-gray-900">
            No live exams found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || selectedCategory !== "All"
              ? "No exam papers match your current search or category filter."
              : "There are currently no active exams published by the administrator."}
          </p>
        </div>
      ) : (
        /* Grouped Category Sections */
        <div className="space-y-12">
          {Object.entries(groupedExams).map(([category, items]) => (
            <section key={category} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <span className="h-6 w-1.5 rounded-full bg-blue-600"></span>
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                  {category} Practice Tests
                </h2>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                  {items.length} {items.length === 1 ? "Test" : "Tests"}
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((exam) => (
                  <div
                    key={exam._id}
                    className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                          {exam.examCategory}
                        </span>
                        <span className="flex items-center text-xs font-medium text-gray-500 gap-1">
                          <svg
                            className="h-3.5 w-3.5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {exam.totalDurationMinutes} mins
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-bold text-gray-900 line-clamp-2">
                        {exam.title}
                      </h3>

                      <p className="mt-2 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {exam.description || "Comprehensive mock examination prepared according to official exam syllabus and timing rules."}
                      </p>

                      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                        <div>
                          <span className="font-semibold text-gray-700">
                            {exam.totalQuestions || 0}
                          </span>{" "}
                          Questions
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">
                            {exam.sectionsCount || 0}
                          </span>{" "}
                          Sections
                        </div>
                        {exam.negativeMarkingEnabled && (
                          <div className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-amber-200">
                            -ve Marking
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => handleStartPractice(exam._id)}
                        className="w-full rounded-lg bg-blue-600 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Start Practice</span>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
