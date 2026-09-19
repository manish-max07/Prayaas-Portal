"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function ExamInstructionsContent({ params }) {
  const unwrappedParams = use(params);
  const examId = unwrappedParams.examId;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // Step 1: General Instructions, Step 2: Other Important Instructions
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [starting, setStarting] = useState(false);

  const { user } = useAuth();
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
      }
    } catch (err) {
      console.error("Error fetching exam:", err);
      setError(
        err.response?.data?.message || "Failed to load examination instructions."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!declarationChecked) return;
    try {
      setStarting(true);
      const res = await api.post("/api/attempts/start", {
        examPaperId: examId,
      });

      if (res.data && res.data.attempt) {
        const attemptId = res.data.attempt._id;
        router.push(`/exam/${examId}/attempt/${attemptId}`);
      }
    } catch (err) {
      console.error("Error starting exam attempt:", err);
      alert(
        err.response?.data?.message || "Could not start the exam. Please try again."
      );
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-medium text-gray-600">Loading exam guidelines & configuration...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-semibold text-sm">{error || "Exam not found"}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            Back to Available Exams
          </Link>
        </div>
      </div>
    );
  }

  // Compute total questions
  let totalQuestions = 0;
  if (exam.sections && Array.isArray(exam.sections)) {
    exam.sections.forEach((s) => {
      totalQuestions += s.questions ? s.questions.length : 0;
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden flex flex-col min-h-[85vh]">
        
        {/* Top Header Bar */}
        <div className="border-b border-gray-200 bg-blue-900 px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/PrayaasKaroLogoWithoutText.png"
              alt="Prayaas Karo"
              width={42}
              height={42}
              className="h-10 w-10 object-contain rounded-xl bg-white/10 p-0.5 shrink-0"
              priority
            />
            <div>
              <span className="inline-block rounded bg-blue-800 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-blue-200">
                {exam.examCategory} Exam Simulation
              </span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
                {exam.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-blue-950/60 px-3 py-1.5 rounded border border-blue-800">
              <span className="text-blue-300">Duration:</span>{" "}
              <strong className="text-white">{exam.totalDurationMinutes} Minutes</strong>
            </div>
            <div className="bg-blue-950/60 px-3 py-1.5 rounded border border-blue-800">
              <span className="text-blue-300">Questions:</span>{" "}
              <strong className="text-white">{totalQuestions}</strong>
            </div>
          </div>
        </div>

        {/* Main Content Layout (Split Left Instructions + Right Candidate Profile) */}
        <div className="flex flex-1 flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          
          {/* Left Column: Instructions Scrollbox */}
          <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto max-h-[68vh]">
            {step === 1 ? (
              <div className="space-y-6 text-sm text-gray-700 leading-relaxed pr-2">
                <div className="border-b border-gray-200 pb-3">
                  <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                    General Instructions
                  </h2>
                  <p className="text-xs text-gray-500">
                    Please read the following instructions carefully before proceeding.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="font-semibold text-gray-900">
                    1. Examination Clock & Timer:
                  </p>
                  <p className="pl-4 text-xs text-gray-600">
                    The clock has been set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination manually at 0:00:00.
                  </p>

                  <p className="font-semibold text-gray-900 mt-4">
                    2. Question Palette Symbols & Status Guide:
                  </p>
                  <p className="pl-4 text-xs text-gray-600 mb-3">
                    The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="h-7 w-7 rounded bg-gray-200 border border-gray-400 flex items-center justify-center font-bold text-xs text-gray-800">
                        1
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        You have not visited the question yet.
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg bg-red-50 border border-red-200">
                      <div className="h-7 w-7 rounded-t-lg bg-red-600 flex items-center justify-center font-bold text-xs text-white">
                        2
                      </div>
                      <span className="text-xs font-medium text-red-900">
                        You have not answered the question.
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-200">
                      <div className="h-7 w-7 rounded-b-lg bg-green-600 flex items-center justify-center font-bold text-xs text-white">
                        3
                      </div>
                      <span className="text-xs font-medium text-green-900">
                        You have answered the question.
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="h-7 w-7 rounded-full bg-purple-700 flex items-center justify-center font-bold text-xs text-white">
                        4
                      </div>
                      <span className="text-xs font-medium text-purple-900">
                        Marked for Review (Not Answered).
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 border border-purple-300 sm:col-span-2">
                      <div className="relative h-7 w-7 rounded-full bg-purple-700 flex items-center justify-center font-bold text-xs text-white">
                        5
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                      </div>
                      <span className="text-xs font-medium text-purple-950">
                        Answered & Marked for Review (<strong className="text-green-700 font-bold">WILL be considered for evaluation</strong>).
                      </span>
                    </div>
                  </div>

                  <p className="font-semibold text-gray-900 mt-4">
                    3. Navigating to a Question:
                  </p>
                  <ul className="list-disc list-inside pl-4 text-xs text-gray-600 space-y-1">
                    <li>Click on the question number in the Question Palette to go to that question directly. Note: Using this option does NOT save your answer.</li>
                    <li>Click on <strong className="text-gray-800">Save & Next</strong> to save your answer for the current question and then go to the next question.</li>
                    <li>Click on <strong className="text-gray-800">Mark for Review & Next</strong> to save your answer (if selected) or mark it for review, and then go to the next question.</li>
                  </ul>

                  <p className="font-semibold text-gray-900 mt-4">
                    4. Sections & Marking Scheme:
                  </p>
                  <div className="pl-4 text-xs text-gray-600 space-y-1">
                    <p>
                      • Sections in this test:{" "}
                      <strong>
                        {exam.sections?.map((s) => s.name).join(" | ")}
                      </strong>
                    </p>
                    <p>
                      • Negative Marking:{" "}
                      <strong>
                        {exam.negativeMarkingEnabled
                          ? "Active (Penalty deducted for wrong answers per question scheme)"
                          : "Disabled (No negative marks)"}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Step 2: Other Important Instructions & Declaration */
              <div className="space-y-6 text-sm text-gray-700 leading-relaxed pr-2">
                <div className="border-b border-gray-200 pb-3">
                  <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                    Other Important Instructions
                  </h2>
                  <p className="text-xs text-gray-500">
                    Final confirmation before entering the test environment.
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
                  <p className="font-bold text-sm text-amber-950">
                    Important Exam Policies:
                  </p>
                  <p>
                    1. Do not refresh the page or navigate away during the examination session. Your progress is autosaved continuously.
                  </p>
                  <p>
                    2. If the network disconnects briefly, your timer and current progress are preserved on the server. Simply reload to resume the attempt.
                  </p>
                  <p>
                    3. The total duration of <strong>{exam.totalDurationMinutes} minutes</strong> applies to the overall test across all sections.
                  </p>
                </div>

                {/* Candidate Declaration */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-5 mt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationChecked}
                      onChange={(e) => setDeclarationChecked(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-gray-800 leading-relaxed font-medium">
                      I have read and understood all the instructions given above. I declare that I am not in possession of any unauthorized materials or electronic devices. I agree that in case of any violation, I will be liable for disqualification from the test.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Bottom Stepper Buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50"
                >
                  &larr; Previous Instructions
                </button>
              ) : (
                <Link
                  href="/"
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  Cancel & Return Home
                </Link>
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <span>&rarr;</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!declarationChecked || starting}
                  onClick={handleStartExam}
                  className="rounded-lg bg-green-600 px-7 py-2.5 text-xs font-bold text-white shadow-md hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
                >
                  {starting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Initializing Test...</span>
                    </>
                  ) : (
                    <span>I am ready to begin</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Candidate Info Profile Panel */}
          <div className="w-full lg:w-80 bg-gray-50 p-6 flex flex-col items-center justify-start text-center border-t lg:border-t-0 border-gray-200">
            <div className="h-28 w-28 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-blue-700 text-3xl font-extrabold shadow-sm overflow-hidden mb-4">
              {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
            </div>

            <h3 className="text-base font-bold text-gray-900">
              {user?.name || "Candidate"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email || "candidate@prayaas.org"}</p>

            <div className="mt-6 w-full rounded-lg bg-white p-4 border border-gray-200 text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Roll / Candidate ID:</span>
                <span className="font-mono font-semibold text-gray-800">
                  {user?.id ? user.id.slice(-8).toUpperCase() : "PRY-8921"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Language:</span>
                <span className="font-semibold text-gray-800">English (Default)</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Total Sections:</span>
                <span className="font-semibold text-gray-800">
                  {exam.sections?.length || 1}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Exam Mode:</span>
                <span className="font-semibold text-green-700">Online CBT</span>
              </div>
            </div>

            <div className="mt-6 text-[11px] text-gray-400">
              Session secured via Prayaas TCS iON Engine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExamInstructionsPage({ params }) {
  return (
    <ProtectedRoute>
      <ExamInstructionsContent params={params} />
    </ProtectedRoute>
  );
}
