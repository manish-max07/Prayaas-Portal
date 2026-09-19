"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ExamLogoBadge from "@/components/ExamLogoBadge";

export default function ExamDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const examId = unwrappedParams.examId;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/exams/${examId}`);
      if (res.data && res.data.examPaper) {
        setExam(res.data.examPaper);
      } else {
        setError("Exam not found or is currently unavailable.");
      }
    } catch (err) {
      console.error("Error fetching exam details:", err);
      setError(
        err.response?.data?.message || "Failed to load examination details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    const destination = `/exam/${examId}/login`;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(destination)}`);
    } else {
      router.push(destination);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-3 bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-semibold text-gray-600">
          Loading exam details &amp; question structure...
        </p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-xs">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
            !
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Unable to Load Test Paper</h2>
          <p className="text-xs text-red-600 mb-5">{error || "Exam not found"}</p>
          <Link
            href="/previous-years"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            &larr; Back to Previous Years
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total questions & section details
  let totalQuestions = 0;
  const sections = exam.sections || [];
  sections.forEach((s) => {
    totalQuestions += s.questions ? s.questions.length : 0;
  });

  const totalMarks = totalQuestions * 1.0;
  const penaltyPerWrong = exam.negativeMarkingEnabled ? "0.25" : "0.00";

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/previous-years" className="hover:text-blue-600 transition-colors">
            Previous Years
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-md">
            {exam.title}
          </span>
        </nav>

        {/* Hero Header Card */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <ExamLogoBadge
                  examSlug={exam.examSlug || exam.authority || ""}
                  examName={exam.authority || exam.title}
                  category={exam.examCategory}
                  size="lg"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                    {exam.authority || "Official"}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                    {exam.examCategory || "Government"} Exams
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live CBT Paper
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-gray-950">
                  {exam.title}
                </h1>

                <p className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-y-1 gap-x-3">
                  {exam.shift && (
                    <span>
                      <strong className="text-gray-700">Shift:</strong> {exam.shift}
                    </span>
                  )}
                  {exam.examDate && (
                    <>
                      <span>•</span>
                      <span>
                        <strong className="text-gray-700">Exam Date:</strong>{" "}
                        {new Date(exam.examDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </>
                  )}
                  {exam.medium && (
                    <>
                      <span>•</span>
                      <span>
                        <strong className="text-gray-700">Medium:</strong> {exam.medium}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons on Desktop */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleStartExam}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Start Test Now</span>
                <span className="text-base">&rarr;</span>
              </button>

              <Link
                href={`/exam/${examId}/leaderboard`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                <span>🏆 View Leaderboard</span>
              </Link>
            </div>
          </div>

          {/* 4 Core Metrics Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-gray-100 pt-6">
            <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Total Duration
              </span>
              <span className="text-lg sm:text-xl font-black text-gray-900 mt-1 block">
                {exam.totalDurationMinutes} Mins
              </span>
              <span className="text-[11px] text-gray-500">Continuous timer</span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Total Questions
              </span>
              <span className="text-lg sm:text-xl font-black text-gray-900 mt-1 block">
                {totalQuestions} Qs
              </span>
              <span className="text-[11px] text-gray-500">Across {sections.length} sections</span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Maximum Marks
              </span>
              <span className="text-lg sm:text-xl font-black text-gray-900 mt-1 block">
                {totalMarks} Marks
              </span>
              <span className="text-[11px] text-gray-500">+1.0 mark per correct</span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-slate-50/70 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Negative Marking
              </span>
              <span className={`text-lg sm:text-xl font-black mt-1 block ${exam.negativeMarkingEnabled ? "text-amber-700" : "text-emerald-700"}`}>
                {exam.negativeMarkingEnabled ? `-${penaltyPerWrong} Mark` : "None"}
              </span>
              <span className="text-[11px] text-gray-500">
                {exam.negativeMarkingEnabled ? "Penalty for wrong answers" : "Zero penalty"}
              </span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid: Instructions Left + Sections & Checklist Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (2 Cols): Written Instructions & Guidelines */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Essential Guidelines Card */}
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider">
                  Important Exam Instructions &amp; Guidelines
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Please review these guidelines carefully to make the most of your authentic CBT practice session.
                </p>
              </div>

              {/* 1. Full Screen Mode Alert */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4.5 flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-xs">
                  🖥️
                </div>
                <div>
                  <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                    Full-Screen Exam Hall Simulation
                  </h3>
                  <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                    When you click <strong>Start Test Now</strong>, the test will launch in strict full-screen mode to mirror the exact TCS iON test center terminal. Do not press Esc or exit full screen during the exam.
                  </p>
                </div>
              </div>

              {/* 2. One-Sitting Practice Rule */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4.5 flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-xs">
                  🪑
                </div>
                <div>
                  <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                    Attempt in One Single Sitting
                  </h3>
                  <p className="text-xs text-indigo-900 mt-1 leading-relaxed">
                    Try to give this test in one sitting without taking pauses, checking notes, or switching tabs. This helps you build real competitive exam temperament, practice pacing under clock pressure, and accurately assess your test readiness.
                  </p>
                </div>
              </div>

              {/* 3. Real-Time All-India Leaderboard */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4.5 flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white font-bold text-sm shadow-xs">
                  📊
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                    Instant All-India Leaderboard &amp; Percentile
                  </h3>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    Immediately after submitting your test, you will see the <strong>All-India Leaderboard</strong> displaying where you stand among thousands of aspirants nationwide, along with category rank, shift percentile, accuracy percentage, and full question-by-question solutions.
                  </p>
                </div>
              </div>

              {/* 4. Question Palette Symbol Guide */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  TCS iON Question Palette Indicators
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="h-6 w-6 rounded bg-gray-200 border border-gray-400 flex items-center justify-center font-bold text-xs text-gray-800 shrink-0">
                      1
                    </div>
                    <span className="text-gray-700 font-medium">You have not visited the question yet.</span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-red-50 border border-red-200">
                    <div className="h-6 w-6 rounded-t-lg bg-red-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                      2
                    </div>
                    <span className="text-red-900 font-medium">You have not answered the question.</span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-green-50 border border-green-200">
                    <div className="h-6 w-6 rounded-b-lg bg-green-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                      3
                    </div>
                    <span className="text-green-900 font-medium">You have answered the question.</span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                    <div className="h-6 w-6 rounded-full bg-purple-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                      4
                    </div>
                    <span className="text-purple-900 font-medium">Marked for Review (Not Answered).</span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-50 border border-purple-300 sm:col-span-2">
                    <div className="relative h-6 w-6 rounded-full bg-purple-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                      5
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
                    </div>
                    <span className="text-purple-950 font-medium">
                      Answered &amp; Marked for Review (<strong className="text-green-700 font-bold">Evaluated in Scorecard</strong>).
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. General Exam Navigation & Timer Policies */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600 leading-relaxed">
                <p>
                  • <strong>Saving Answers:</strong> To save your response, select an option and click <strong>Save &amp; Next</strong>. Clicking question numbers on the palette directly without clicking Save &amp; Next will NOT record your answer.
                </p>
                <p>
                  • <strong>Auto-Submission:</strong> The examination timer is synchronized with the server. When the timer reaches 0:00:00, your test will automatically submit.
                </p>
                <p>
                  • <strong>Network Resiliency:</strong> If your internet connection briefly hiccups, your responses are safely cached and synced upon reconnection.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Sections Breakdown & Quick Action Sidebar */}
          <div className="space-y-6">
            
            {/* Sections & Pattern Box */}
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                Section-wise Paper Breakdown
              </h2>

              {sections.length > 0 ? (
                <div className="space-y-2.5">
                  {sections.map((section, idx) => {
                    const qCount = section.questions?.length || 0;
                    return (
                      <div
                        key={section._id || idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/70 text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                            Section {idx + 1}
                          </span>
                          <span className="font-bold text-gray-900 truncate block">
                            {section.name}
                          </span>
                        </div>
                        <span className="shrink-0 font-mono font-bold text-gray-700 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                          {qCount} Qs
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Standard official multi-section CBT question paper.
                </p>
              )}
            </div>

            {/* Test Readiness Checklist */}
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Pre-Test Checklist
              </h2>

              <ul className="space-y-2.5 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Stable internet connection for continuous autosave.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Desktop or laptop recommended for authentic CBT experience.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Rough sheet &amp; pen ready for calculations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Dedicated {exam.totalDurationMinutes} minutes uninterrupted block.</span>
                </li>
              </ul>

              <div className="pt-2 border-t border-gray-100 space-y-2">
                <button
                  type="button"
                  onClick={handleStartExam}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Start Test in CBT Mode</span>
                  <span>&rarr;</span>
                </button>

                <Link
                  href={`/exam/${examId}/leaderboard`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  <span>🏆 View Leaderboard Standings</span>
                </Link>
              </div>
            </div>

            {/* Back to Previous Years Link */}
            <div className="text-center">
              <Link
                href="/previous-years"
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                &larr; Back to Previous Years Papers
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

