"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ExamLogoBadge from "@/components/ExamLogoBadge";
import { getExamBySlug } from "@/lib/previousYearsData";

export default function ExamYearSelectionPage({ params }) {
  const resolvedParams = use(params);
  const examSlug = resolvedParams.examSlug;
  const staticExam = getExamBySlug(examSlug);

  const [exam, setExam] = useState(staticExam);
  const [loading, setLoading] = useState(!staticExam);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    async function loadDynamicExam() {
      try {
        const res = await api.get("/api/exams");
        if (res.data && res.data.exams) {
          const matching = res.data.exams.filter((le) => {
            const slug = le.examSlug || `${le.authority || ""} ${le.position || ""}`.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
            return slug === examSlug;
          });

          if (matching.length > 0) {
            const first = matching[0];
            const years = Array.from(new Set(matching.map((m) => m.examYear || "2026"))).filter(Boolean);

            const examName = first.authority && first.position ? `${first.authority} ${first.position}` : first.title;
            const dynamicExam = {
              slug: examSlug,
              name: examName,
              fullName: `${examName} Examination`,
              category: "engineering",
              categoryLabel: `${first.examCategory || "General"} Exams`,
              organization: first.authority || "Exam Board",
              logoType: "defence",
              description: first.description || `Official previous year question papers and shift practice for ${examName}.`,
              totalShiftsCount: matching.length * 2,
              years: years.length > 0 ? years : ["2026"],
              conductingBody: first.authority || "Exam Board",
            };
            setExam(dynamicExam);
          } else if (!staticExam) {
            setNotFoundState(true);
          }
        } else if (!staticExam) {
          setNotFoundState(true);
        }
      } catch (e) {
        if (!staticExam) setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    }

    if (!staticExam) {
      loadDynamicExam();
    }
  }, [examSlug, staticExam]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading exam year options...</p>
      </div>
    );
  }

  if (notFoundState || !exam) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900">Examination Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            Could not locate exam matching &ldquo;{examSlug}&rdquo;.
          </p>
          <Link
            href="/previous-years"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
          >
            &larr; Back to Popular Exams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/previous-years" className="hover:text-blue-600 transition-colors">
            Previous Years
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{exam.name}</span>
        </nav>

        {/* Exam Hero Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <ExamLogoBadge type={exam.logoType} className="h-16 w-16 text-xl shrink-0" size={56} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {exam.categoryLabel}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {exam.conductingBody}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {exam.fullName || exam.name}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                {exam.description}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400">Total Years</p>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">{exam.years.length} Years</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400">Total Shifts</p>
              <p className="text-base sm:text-lg font-black text-blue-600 mt-0.5">{exam.totalShiftsCount}+ Shifts</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400">Simulation</p>
              <p className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">TCS iON CBT</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400">Solution &amp; Rank</p>
              <p className="text-base sm:text-lg font-black text-purple-600 mt-0.5">All India AIR</p>
            </div>
          </div>
        </div>

        {/* Section Heading: Select Exam Year */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Select Exam Year
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose a previous year to practice all official shift papers under real timed conditions
          </p>
        </div>

        {/* Year Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {exam.years.map((year) => {
            const shiftList = exam.shiftsByYear?.[year] || [];
            const shiftCount = shiftList.length || Math.floor(exam.totalShiftsCount / exam.years.length) || 12;

            return (
              <Link
                key={year}
                href={`/previous-years/${exam.slug}/${year}`}
                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Accent top gradient stripe on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                      Official Papers
                    </span>
                    <span className="text-xs text-slate-400">TCS iON CBT</span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {exam.name} {year}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Shift-wise real question papers with full solutions, sectional scoring, and negative marking.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {shiftCount} Shift Papers Available
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    View Papers &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Back Link */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-center">
          <Link
            href="/previous-years"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            &larr; Back to all Popular Exams
          </Link>
        </div>
      </div>
    </div>
  );
}
