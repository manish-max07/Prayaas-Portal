"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// ─── SVG Icon Library ──────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg className="h-4.5 w-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: "18px", height: "18px" }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BoltIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const MonitorIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ArchiveIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const AlertIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const CalculatorIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const AcademicCapIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ─── Category Icon Map ─────────────────────────────────────────────────────────
const CategoryBadgeIcon = ({ category }) => {
  const icons = {
    SSC: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
    Banking: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9-4 9 4v2H3V6zm0 0h18M6 10v8M10 10v8M14 10v8M18 10v8M3 18h18" />
      </svg>
    ),
    Railway: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H15M8 9H16M12 3V21M8 21H16M5 6H3M21 6H19M5 18H3M21 18H19" />
      </svg>
    ),
    default: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };
  return icons[category] || icons.default;
};

// ─── Categories Config ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "All", label: "All Exams" },
  { id: "SSC", label: "SSC" },
  { id: "Banking", label: "Banking" },
  { id: "Railway", label: "Railways (RRB)" },
  { id: "State PSC", label: "State PSC" },
  { id: "UPSC", label: "UPSC" },
  { id: "Defence", label: "Defence" },
  { id: "Other", label: "Other" },
];

// ─── Exam Row Component ────────────────────────────────────────────────────────
function ExamRow({ exam, onStartPractice }) {
  return (
    <div
      className="group flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-blue-50/60 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
      onClick={() => onStartPractice(exam._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onStartPractice(exam._id)}
    >
      {/* Left: Icon + Info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Exam Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
          <AcademicCapIcon className="h-4.5 w-4.5" style={{ width: "18px", height: "18px" }} />
        </div>

        {/* Exam Details */}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {exam.title}
          </h3>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <ClockIcon className="h-3 w-3" style={{ width: "12px", height: "12px" }} />
              {exam.totalDurationMinutes} min
            </span>
            <span className="text-xs text-gray-400">
              {exam.totalQuestions || 0} Qs
            </span>
            <span className="text-xs text-gray-400">
              {exam.totalMarks || exam.totalQuestions || 100} Marks
            </span>
            {exam.negativeMarkingEnabled && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                -ve Marking
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Category badge + Arrow */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          <CategoryBadgeIcon category={exam.examCategory} />
          {exam.examCategory}
        </span>
        <ChevronRightIcon
          className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors"
          style={{ width: "16px", height: "16px" }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
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
      setError("Unable to connect. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const groupedExams = useMemo(() => {
    const groups = {};
    filteredExams.forEach((exam) => {
      const cat = exam.examCategory || "Other";
      if (!groups[cat]) groups[cat] = [];
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

  const totalExamsCount = exams.length;
  const totalQuestionsSum = useMemo(() => {
    return exams.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);
  }, [exams]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

            {/* Left: Headline */}
            <div className="max-w-2xl">
              {/* Live pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 mb-5">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600"></span>
                </span>
                Official TCS iON Exam Papers · Updated After Every Exam
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Practice Real Exam Papers{" "}
                <span className="text-blue-600">Just After the Official Exam</span>
              </h1>

              <p className="mt-4 text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl">
                Authentic CBT experience with real question papers, shift-wise practice, negative marking, and instant All-India rank prediction.
              </p>

              {/* CTA Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Start Practising Free
                  <ArrowRightIcon className="h-4 w-4" style={{ width: "16px", height: "16px" }} />
                </Link>
                <Link
                  href="/rank-calculator"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <CalculatorIcon className="h-4 w-4" style={{ width: "16px", height: "16px" }} />
                  Rank Calculator
                </Link>
              </div>
            </div>

            {/* Right: Stats grid */}
            <div className="grid grid-cols-2 gap-3 lg:w-80 shrink-0">
              {[
                { label: "Post-Exam Release", sub: "Papers live within hours", highlight: true },
                { label: "100% CBT Simulation", sub: "Authentic TCS iON interface", highlight: false },
                {
                  label: `${totalExamsCount || "-"} Papers`,
                  sub: "Live mock tests available",
                  highlight: false,
                },
                { label: "Real-Time Rank", sub: "All India ranking engine", highlight: false },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl border p-4 ${
                    stat.highlight
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-100 bg-gray-50"
                  }`}
                >
                  <p className={`text-sm font-bold ${stat.highlight ? "text-blue-700" : "text-gray-900"}`}>
                    {stat.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE PILLARS ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: BoltIcon,
                color: "blue",
                title: "Post-Exam Rapid Release",
                desc: "Real question papers published right after official shifts conclude.",
              },
              {
                icon: MonitorIcon,
                color: "indigo",
                title: "Authentic TCS iON Interface",
                desc: "Question palette, section switching, timer, and negative scoring, exactly as in the real exam.",
              },
              {
                icon: ArchiveIcon,
                color: "green",
                title: "Previous Year Archive",
                desc: "Full access to verified previous year papers and latest exam cycles.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    color === "blue"
                      ? "bg-blue-50 text-blue-600"
                      : color === "indigo"
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" style={{ width: "18px", height: "18px" }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXAM ALERT BANNER ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3.5">
          <div className="flex items-start sm:items-center gap-3">
            <AlertIcon className="h-4.5 w-4.5 text-orange-500 mt-0.5 sm:mt-0 shrink-0" style={{ width: "18px", height: "18px" }} />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-200">
                Latest Alert · Sep 17, 2026
              </span>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                IOCL Admit Card 2026 Released: Direct Download Link Active for 470 Engineer &amp; Officer Posts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pl-7 sm:pl-0">
            <Link
              href="/news/iocl-engineer-officer-admit-card-2026"
              className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3.5 py-2 rounded-lg transition-colors"
            >
              View Details
            </Link>
            <Link href="/news" className="text-xs font-semibold text-orange-700 hover:text-orange-900 px-3 py-2 rounded-lg hover:bg-orange-100 transition-colors">
              All Updates
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAIN EXAMS SECTION ────────────────────────────────────────────── */}
      <main id="exams" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-16">

        {/* Rank Calc Promo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <CalculatorIcon className="h-5 w-5" style={{ width: "20px", height: "20px" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">TCS iON Response Sheet Rank Predictor</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Paste your Digialm response URL to get exact marks, negative deductions, and All India Rank instantly.
              </p>
            </div>
          </div>
          <Link
            href="/rank-calculator"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shrink-0"
          >
            Calculate Rank
            <ArrowRightIcon className="h-3.5 w-3.5" style={{ width: "14px", height: "14px" }} />
          </Link>
        </div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Practice Papers</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select a category and start your real exam simulation</p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search exam name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <CloseIcon className="h-4 w-4" style={{ width: "16px", height: "16px" }} />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === "All"
              ? exams.length
              : exams.filter((e) => e.examCategory === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                {cat.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isSelected ? "bg-blue-500 text-blue-100" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
          {(selectedCategory !== "All" || searchQuery) && (
            <button
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1.5 cursor-pointer ml-1"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Exam List Content ──────────────────────────────────────────── */}
        {loading ? (
          /* Skeleton */
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 animate-pulse">
                <div className="h-9 w-9 rounded-lg bg-gray-200 shrink-0"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-3/5 rounded bg-gray-200"></div>
                  <div className="h-3 w-2/5 rounded bg-gray-100"></div>
                </div>
                <div className="h-6 w-16 rounded-md bg-gray-100 hidden sm:block"></div>
                <div className="h-4 w-4 rounded bg-gray-100"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center max-w-md mx-auto">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-100 text-red-500">
                <RefreshIcon className="h-5 w-5" style={{ width: "20px", height: "20px" }} />
              </div>
            </div>
            <h3 className="text-sm font-bold text-red-800">Connection Error</h3>
            <p className="text-xs text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchExams}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
            >
              <RefreshIcon className="h-3.5 w-3.5" style={{ width: "14px", height: "14px" }} />
              Retry
            </button>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center max-w-md mx-auto">
            <div className="flex justify-center mb-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <SearchIcon />
              </div>
            </div>
            <h3 className="text-sm font-bold text-gray-900">No papers found</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {searchQuery || selectedCategory !== "All"
                ? "No exam papers matched your filter. Try clearing them."
                : "No active exam papers are currently published."}
            </p>
            {(searchQuery || selectedCategory !== "All") && (
              <button
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Grouped Exam Lists */
          <div className="space-y-6">
            {Object.entries(groupedExams).map(([category, items]) => (
              <section key={category}>
                {/* Category section header */}
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-sm font-bold text-gray-800">{category} Practice Papers</h2>
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-600">
                    {items.length} {items.length === 1 ? "paper" : "papers"}
                  </span>
                </div>

                {/* Exam rows container */}
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                  {items.map((exam) => (
                    <ExamRow key={exam._id} exam={exam} onStartPractice={handleStartPractice} />
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
