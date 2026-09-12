"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES = [
  { id: "All", label: "All Exams", icon: "📚" },
  { id: "SSC", label: "SSC", icon: "🏛️" },
  { id: "Banking", label: "Banking & Insurance", icon: "🏦" },
  { id: "Railway", label: "Railways (RRB)", icon: "🚆" },
  { id: "State PSC", label: "State PSC", icon: "🗺️" },
  { id: "UPSC", label: "UPSC Civil Services", icon: "🇮🇳" },
  { id: "Defence", label: "Defence (NDA/CDS)", icon: "🛡️" },
  { id: "Other", label: "Other Exams", icon: "📝" },
];

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
      router.push(`/login?redirect=/exam/${examId}/login`);
    } else {
      router.push(`/exam/${examId}/login`);
    }
  };

  // Quick stats
  const totalExamsCount = exams.length;
  const totalQuestionsSum = useMemo(() => {
    return exams.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);
  }, [exams]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white border-b border-slate-800">
        {/* Subtle decorative background glow and grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.18),transparent_60%)]" />
        <div className="pointer-events-none absolute -top-40 right-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-20 -left-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-md shadow-xs mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>Official TCS iON Exam Engine & Shift-wise Papers</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
              Ace Your Competitive Exams with{" "}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Real Exam Papers Just After the Official Exam
              </span>
            </h1>

            {/* Subtitle & Value Proposition */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
              Practice tests modelled directly after official exam portals. After the official exam, practice latest question papers with real exam conditions and exhaustive previous years — featuring real-time timers, negative marking, and instant AI analytics.
            </p>

            {/* Search Input In Hero */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900/90 backdrop-blur-md focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
                <div className="pl-4 text-slate-400 pointer-events-none">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search exam by name, shift, or agency (e.g. SSC CGL, RRB NTPC, IBPS)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-3.5 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mr-3 text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Trust Metrics Strip */}
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl mx-auto pt-6 border-t border-slate-800/80">
              <div className="p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-blue-400">Just After Exam</div>
                <div className="text-xs text-slate-400 mt-0.5">Latest Shift Papers</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-sky-400">100% CBT</div>
                <div className="text-xs text-slate-400 mt-0.5">TCS iON Simulation</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-indigo-400">{totalExamsCount || "Active"}</div>
                <div className="text-xs text-slate-400 mt-0.5">Live Mock Papers</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-400">Real-Time</div>
                <div className="text-xs text-slate-400 mt-0.5">All-India Rankings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURE PILLARS BANNER */}
      <section className="mx-auto max-w-7xl px-4 -mt-6 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-lg">
                ⚡
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Post-Exam Rapid Release</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Solve real question papers right after official exam shifts conclude.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-lg">
                🖥️
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Authentic TCS iON Environment</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Exact question palette, section switching, timer clock & negative scoring.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold text-lg">
                📈
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Previous Years & Shift Archive</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Full access to verified previous year papers and latest exam cycles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN WORKSPACE / EXAMS BROWSER */}
      <main className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* Category Filter Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Select Exam Category</h2>
              <p className="text-xs text-slate-500">Filter official practice papers by agency and domain</p>
            </div>

            {(selectedCategory !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>Reset All Filters</span>
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 pt-3">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              // Count available for this category
              const count = cat.id === "All"
                ? exams.length
                : exams.filter((e) => e.examCategory === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30"
                      : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isSelected ? "bg-blue-800 text-blue-100" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content: Loading / Error / Empty / Exam Grids */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse space-y-4">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 bg-slate-200 rounded"></div>
                  <div className="h-4 w-16 bg-slate-200 rounded"></div>
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-4 w-full bg-slate-200 rounded"></div>
                <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
                <div className="h-10 w-full bg-slate-200 rounded mt-4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700 max-w-xl mx-auto shadow-xs">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="font-bold text-base text-red-800">Connection Error</h3>
            <p className="font-medium text-xs mt-1 text-red-600">{error}</p>
            <button
              onClick={fetchExams}
              className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center max-w-2xl mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-2xl mb-4">
              🔍
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No matching examination papers found
            </h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {searchQuery || selectedCategory !== "All"
                ? "No exam papers matched your current search keywords or selected category filter."
                : "There are currently no active exam papers published by the examination board."}
            </p>
            {(searchQuery || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Clear Search & Filters
              </button>
            )}
          </div>
        ) : (
          /* Grouped Exam Cards */
          <div className="space-y-12">
            {Object.entries(groupedExams).map(([category, items]) => (
              <section key={category} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-1.5 rounded-full bg-blue-600"></span>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                      {category} Official Practice Tests
                    </h2>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-100">
                      {items.length} {items.length === 1 ? "Paper" : "Papers"} Available
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((exam) => (
                    <div
                      key={exam._id}
                      className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-xl hover:border-blue-400/80 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div>
                        {/* Top row: Category badge & Duration */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
                            <span>🏛️</span>
                            <span>{exam.examCategory}</span>
                          </span>

                          <span className="flex items-center text-xs font-semibold text-slate-600 gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                            <svg
                              className="h-3.5 w-3.5 text-blue-600"
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
                            <span>{exam.totalDurationMinutes} mins</span>
                          </span>
                        </div>

                        {/* Exam Title */}
                        <h3 className="mt-3.5 text-base font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {exam.title}
                        </h3>

                        {/* Exam Description */}
                        <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {exam.description ||
                            "Simulated CBT practice paper with official timing, negative marking, and question pattern."}
                        </p>

                        {/* Specs Strip */}
                        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="text-slate-400">Questions:</span>
                            <span className="font-bold text-slate-800">
                              {exam.totalQuestions || 0}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="text-slate-400">Sections:</span>
                            <span className="font-bold text-slate-800">
                              {exam.sectionsCount || 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="text-slate-400">Total Marks:</span>
                            <span className="font-bold text-slate-800">
                              {exam.totalMarks || exam.totalQuestions || 100}
                            </span>
                          </div>

                          <div>
                            {exam.negativeMarkingEnabled ? (
                              <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                -ve Marking
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                No Negative
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Start Exam CTA Button */}
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <button
                          onClick={() => handleStartPractice(exam._id)}
                          className="w-full rounded-lg bg-blue-600 py-2.5 text-center text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer flex items-center justify-center gap-2 group-hover:bg-blue-700"
                        >
                          <span>Start Real Exam Practice</span>
                          <svg
                            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
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
      </main>
    </div>
  );
}

