"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ExamLogoBadge from "@/components/ExamLogoBadge";
import { EXAM_CATEGORIES, POPULAR_EXAMS } from "@/lib/previousYearsData";

export default function PreviousYearsPage() {
  const [selectedCategory, setSelectedCategory] = useState("ssc");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveExams, setLiveExams] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    async function loadLiveExams() {
      try {
        const res = await api.get("/api/exams");
        if (res.data && res.data.exams) {
          setLiveExams(res.data.exams);
        }
      } catch (err) {
        console.warn("Could not fetch live exams for previous years catalog:", err.message);
      }
    }
    loadLiveExams();
  }, []);

  // Merge static popular exams with any admin-created exams
  const allExams = useMemo(() => {
    const list = [...POPULAR_EXAMS];

    // Group live exams by authority + position (or slug)
    liveExams.forEach((le) => {
      const auth = le.authority || "";
      const pos = le.position || "";
      const year = le.examYear || "2026";
      const slug = le.examSlug || `${auth} ${pos}`.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

      if (!slug) return;

      const existingIndex = list.findIndex((e) => e.slug === slug);
      if (existingIndex >= 0) {
        // Add year to existing exam if missing
        if (!list[existingIndex].years.includes(year)) {
          list[existingIndex].years.unshift(year);
        }
      } else {
        // Map category
        let cat = "engineering";
        const ec = (le.examCategory || "").toLowerCase();
        if (ec.includes("ssc")) cat = "ssc";
        else if (ec.includes("bank")) cat = "banking";
        else if (ec.includes("railway")) cat = "railways";
        else if (ec.includes("teach")) cat = "teaching";
        else if (ec.includes("upsc") || ec.includes("civil") || ec.includes("psc")) cat = "civil-services";
        else if (ec.includes("defence") || ec.includes("police")) cat = "defence";

        let logo = "engineering";
        if (cat === "ssc") logo = "ssc";
        else if (cat === "defence") logo = "defence";
        else if (cat === "railways") logo = "railway";
        else if (cat === "banking") logo = "banking";
        else if (cat === "teaching") logo = "teaching";

        const examName = auth && pos ? `${auth} ${pos}` : (le.title || "Custom Exam");

        list.push({
          slug,
          name: examName,
          fullName: `${examName} Examination`,
          category: cat,
          categoryLabel: `${cat.toUpperCase()} Exams`,
          organization: auth || "Public Authority",
          logoType: logo,
          description: le.description || `Official CBT question papers and mock tests for ${examName}.`,
          totalShiftsCount: 6,
          years: [year],
          conductingBody: auth || "Exam Authority",
          isDynamic: true
        });
      }
    });

    return list;
  }, [liveExams]);

  const filteredExams = useMemo(() => {
    return allExams.filter((exam) => {
      const matchesCategory =
        selectedCategory === "all" || exam.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allExams, selectedCategory, searchQuery]);

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Previous Years</span>
        </nav>

        {/* Section Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Popular Exams
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-500">
            Get exam-ready with concepts, questions and study notes as per the latest pattern
          </p>
        </div>

        {/* Category Pills & Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          {/* Horizontal scrollable pills */}
          <div className="relative w-full md:w-auto flex-1 max-w-4xl flex items-center">
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth pr-10"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {EXAM_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                      isActive
                        ? "bg-[#00BCD4] text-white border-[#00BCD4] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Right arrow scroll button */}
            <button
              onClick={handleScrollRight}
              aria-label="Scroll categories right"
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64 shrink-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search exam…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 3-Column Exams Grid (matching screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredExams.map((exam) => (
            <Link
              key={exam.slug}
              href={`/previous-years/${exam.slug}`}
              className="group flex items-center justify-between p-4 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-sm transition-all duration-200"
            >
              {/* Left: Organization Badge + Exam Name */}
              <div className="flex items-center gap-3.5 min-w-0">
                <ExamLogoBadge type={exam.logoType} className="h-10 w-10 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {exam.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {exam.years.join(", ")} Papers • {exam.totalShiftsCount}+ Shifts
                  </p>
                </div>
              </div>

              {/* Right: Chevron arrow */}
              <div className="shrink-0 pl-2">
                <svg
                  className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}

          {/* Explore all exams tile (bottom-right tile like screenshot) */}
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="flex items-center justify-center p-4 rounded-xl border border-slate-200/90 bg-white hover:bg-cyan-50/40 hover:border-cyan-300 transition-all text-sm font-bold text-[#00BCD4] cursor-pointer"
          >
            <span>Explore all exams</span>
            <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {filteredExams.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 mt-4 p-8">
            <p className="text-sm font-semibold text-slate-700">No exams found matching &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-3 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Clear filters &amp; view all exams
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
