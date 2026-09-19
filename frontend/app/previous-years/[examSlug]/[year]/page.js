"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import { useAuth } from "@/context/AuthContext";
import ExamLogoBadge from "@/components/ExamLogoBadge";
import { getExamBySlug } from "@/lib/previousYearsData";

export default function ExamShiftsListPage({ params }) {
  const resolvedParams = use(params);
  const examSlug = resolvedParams.examSlug;
  const year = resolvedParams.year;

  const staticExam = getExamBySlug(examSlug);
  const [exam, setExam] = useState(staticExam);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [shiftSearch, setShiftSearch] = useState("");
  const [liveExams, setLiveExams] = useState([]);

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.get("/api/exams");
        const allExams = res.data?.exams || [];

        // Normalize matching logic for examSlug (e.g. avnl-junior-manager)
        const examSlugClean = examSlug.toLowerCase();
        const matching = allExams.filter((le) => {
          const auth = (le.authority || "").toLowerCase();
          const pos = (le.position || "").toLowerCase();
          const slug = (
            le.examSlug ||
            `${auth} ${pos}`.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
          ).toLowerCase();
          const title = (le.title || "").toLowerCase();

          return (
            slug === examSlugClean ||
            examSlugClean.includes(slug) ||
            slug.includes(examSlugClean) ||
            (auth && pos && title.includes(auth) && title.includes(pos))
          );
        });

        // Filter by the year requested
        const yearMatching = matching.filter(
          (m) => String(m.examYear || "2026") === String(year)
        );

        setLiveExams(yearMatching.length > 0 ? yearMatching : matching);

        if (staticExam) {
          setExam(staticExam);
        } else if (matching.length > 0) {
          const first = matching[0];
          const examName =
            first.authority && first.position
              ? `${first.authority} ${first.position}`
              : first.title;
          const dynamicExam = {
            slug: examSlug,
            name: examName,
            fullName: `${examName} Examination`,
            category: (first.examCategory || "engineering").toLowerCase(),
            categoryLabel: `${first.examCategory || "Engineering"} Exams`,
            organization: first.authority || "Exam Board",
            logoType: "defence",
            description:
              first.description ||
              `Official previous year question papers and shift practice for ${examName}.`,
            totalShiftsCount: matching.length,
            years: [year],
            conductingBody: first.authority || "Exam Board",
            shiftsByYear: {},
          };
          setExam(dynamicExam);
        } else {
          setNotFoundState(true);
        }
      } catch (err) {
        console.warn("Could not load dynamic exam data:", err.message);
        if (!staticExam) setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [examSlug, year, staticExam]);

  // Merge live database exams with template shifts
  const shiftsList = useMemo(() => {
    if (!exam) return [];
    const rawShifts = exam.shiftsByYear?.[year] || [];

    const liveFormatted = liveExams.map((le) => ({
      id: le._id,
      title: le.title,
      tier: le.position || "CBT",
      date: le.examDate
        ? new Date(le.examDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : `Official ${year}`,
      shift: le.shift || "Official Shift",
      totalQuestions: le.totalQuestions || 100,
      totalDurationMinutes: le.totalDurationMinutes || 120,
      totalMarks: le.totalMarks || 100,
      negativeMarking: le.negativeMarkingEnabled ? 0.25 : 0.0,
      language: le.medium || "Bilingual (English / Hindi)",
      status: "Live Test Available",
      isLiveDb: true,
      liveExamId: le._id,
      subject: le.subject || "",
    }));

    // Avoid duplicate if liveExamId is already matched
    const filteredRaw = rawShifts.filter(
      (rs) => !liveFormatted.some((lf) => lf.liveExamId === rs.liveExamId)
    );

    const combined = [...liveFormatted, ...filteredRaw];
    if (combined.length > 0) return combined;

    // Fallback template shifts so candidates can always practice shifts for any year
    return [
      {
        id: `${exam.slug}-${year}-shift1`,
        title: `${exam.name} ${year} Tier-1 (Official Shift 1)`,
        tier: "Tier-1",
        date: `Official ${year} Shift 1`,
        shift: "Shift 1 (09:00 AM - 11:00 AM)",
        totalQuestions: 100,
        totalDurationMinutes: 120,
        totalMarks: 100,
        negativeMarking: 0.25,
        language: "Bilingual (English / Hindi)",
        status: "Available",
        liveExamId: "6aa5798a6d95008aa13f4884",
      },
    ];
  }, [liveExams, exam, year]);

  const filteredShifts = useMemo(() => {

    if (!shiftSearch.trim()) return shiftsList;
    const q = shiftSearch.toLowerCase();
    return shiftsList.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.shift && s.shift.toLowerCase().includes(q)) ||
        (s.date && s.date.toLowerCase().includes(q)) ||
        (s.subject && s.subject.toLowerCase().includes(q))
    );
  }, [shiftsList, shiftSearch]);

  const handleStartPractice = (paper) => {
    // Open dedicated Exam Details & Instructions page
    const examTargetId = paper.liveExamId || "6aa5798a6d95008aa13f4884";
    router.push(`/exam/${examTargetId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-[#F8FAFC]">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading shift question papers...</p>
      </div>
    );
  }

  if (notFoundState || !exam) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900">Examination Papers Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            Could not locate question papers for &ldquo;{examSlug}&rdquo; ({year}).
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
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/previous-years" className="hover:text-blue-600 transition-colors">
            Previous Years
          </Link>
          <span>/</span>
          <Link href={`/previous-years/${exam.slug}`} className="hover:text-blue-600 transition-colors">
            {exam.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{year} Papers</span>
        </nav>

        {/* Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ExamLogoBadge type={exam.logoType} className="h-12 w-12 shrink-0" size={48} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    {year} Official Shifts
                  </span>
                  <span className="text-xs text-slate-400">TCS iON Simulation</span>
                  {loadingLive && (
                    <span className="text-[10px] text-blue-600 animate-pulse font-medium">
                      Syncing live papers...
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {exam.name} {year} - Previous Year Question Papers
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Shift-wise real question papers across all specialisations/trades with negative scoring, instant All India rank prediction, and complete solutions.
                </p>
              </div>
            </div>

            {/* Total Shifts Count Badge */}
            <div className="shrink-0 flex items-center sm:flex-col justify-between sm:justify-center p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[130px]">
              <span className="text-[11px] font-semibold text-slate-500">Available Papers</span>
              <span className="text-xl font-black text-blue-600 sm:mt-0.5">
                {filteredShifts.length} Shifts
              </span>
            </div>
          </div>
        </div>

        {/* Filter / Search for shifts */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 self-start sm:self-center">
            Shift-Wise Question Papers
          </h2>

          <div className="relative w-full sm:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search trade, shift or date…"
              value={shiftSearch}
              onChange={(e) => setShiftSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Shifts Cards List */}
        <div className="space-y-3.5">
          {filteredShifts.map((paper, index) => (
            <div
              key={paper.id || index}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-xs transition-all gap-4"
            >
              {/* Left Details */}
              <div className="min-w-0 space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {paper.isLiveDb ? (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Live Test Paper
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Official Paper
                    </span>
                  )}

                  {paper.subject && (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                      {paper.subject}
                    </span>
                  )}

                  <span className="text-xs font-semibold text-slate-600">
                    {paper.date}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">
                    {paper.shift}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {paper.title}
                </h3>

                {/* Exam Meta row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1 font-medium">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {paper.totalQuestions} Questions
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {paper.totalDurationMinutes} Mins
                  </span>
                  <span className="font-medium">
                    {paper.totalMarks} Marks
                  </span>
                  {paper.negativeMarking > 0 && (
                    <span className="text-red-600 font-semibold text-[11px] bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                      -{paper.negativeMarking} Neg. Marking
                    </span>
                  )}
                  <span className="text-slate-400">
                    {paper.language}
                  </span>
                </div>
              </div>

              {/* Right CTA Button: Practice Now */}
              <div className="shrink-0 flex items-center justify-end">
                <button
                  onClick={() => handleStartPractice(paper)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                >
                  <span>Practice Now</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {filteredShifts.length === 0 && (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-semibold text-slate-700">No shift papers found matching &ldquo;{shiftSearch}&rdquo;</p>
              <button
                onClick={() => setShiftSearch("")}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-center">
          <Link
            href={`/previous-years/${exam.slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            &larr; Back to all {exam.name} Years
          </Link>
        </div>
      </div>
    </div>
  );
}
