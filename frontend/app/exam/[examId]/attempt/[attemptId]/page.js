"use client";

import React, { useState, useEffect, useRef, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function LiveExamContent({ params }) {
  const unwrappedParams = use(params);
  const { examId, attemptId } = unwrappedParams;

  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active navigation state
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0); // Index within active section

  // User answers map: questionId -> { selectedOption: number|null, status: string }
  const [answersState, setAnswersState] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);

  const { user } = useAuth();
  const router = useRouter();
  const timerRef = useRef(null);

  useEffect(() => {
    fetchExamAndAttempt();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examId, attemptId]);

  const fetchExamAndAttempt = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start or resume attempt to get questions & initial state
      const res = await api.post("/api/attempts/start", {
        examPaperId: examId,
      });

      if (!res.data || !res.data.examPaper || !res.data.attempt) {
        throw new Error("Invalid response from test server.");
      }

      const examData = res.data.examPaper;
      const attemptData = res.data.attempt;

      setExam(examData);
      setAttempt(attemptData);

      // Populate local answers map
      const initialMap = {};
      if (attemptData.answers && Array.isArray(attemptData.answers)) {
        attemptData.answers.forEach((ans) => {
          const qId = ans.question?._id || ans.question;
          initialMap[qId] = {
            selectedOption: ans.selectedOption,
            status: ans.status || "not-visited",
          };
        });
      }
      setAnswersState(initialMap);

      // Compute total timer duration (duration - elapsed)
      const totalSeconds = (examData.totalDurationMinutes || 60) * 60;
      const elapsed = attemptData.elapsedSeconds || 0;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeRemainingSeconds(remaining);

      // Start countdown timer
      startTimer(remaining);
    } catch (err) {
      console.error("Error loading live exam:", err);
      setError(
        err.response?.data?.message || "Failed to load examination session."
      );
    } finally {
      setLoading(false);
    }
  };

  // Timer Countdown and auto-submit trigger
  const startTimer = (initialRemaining) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let currentSec = initialRemaining;
    timerRef.current = setInterval(() => {
      currentSec -= 1;
      if (currentSec <= 0) {
        clearInterval(timerRef.current);
        setTimeRemainingSeconds(0);
        handleAutoSubmit();
      } else {
        setTimeRemainingSeconds(currentSec);
      }
    }, 1000);
  };

  const handleAutoSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/api/attempts/${attemptId}/submit`, {
        autoSubmitted: true,
      });
      if (res.data) {
        router.replace(`/exam/${examId}/result/${attemptId}`);
      }
    } catch (err) {
      console.error("Auto-submit failed:", err);
      router.replace(`/exam/${examId}/result/${attemptId}`);
    }
  };

  const handleManualSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/api/attempts/${attemptId}/submit`, {
        autoSubmitted: false,
      });
      if (res.data) {
        router.push(`/exam/${examId}/result/${attemptId}`);
      }
    } catch (err) {
      console.error("Submit failed:", err);
      alert(
        err.response?.data?.message || "Failed to submit test. Please try again."
      );
      setSubmitting(false);
    }
  };

  // Sections & Active Question helpers
  const activeSection = exam?.sections?.[activeSectionIndex] || null;
  const activeQuestions = activeSection?.questions || [];
  const currentQuestion = activeQuestions[activeQuestionIndex] || null;
  const currentQuestionId = currentQuestion?._id;

  const currentAnswer = currentQuestionId
    ? answersState[currentQuestionId] || { selectedOption: null, status: "not-visited" }
    : { selectedOption: null, status: "not-visited" };

  // Sync answer to backend
  const syncAnswerToBackend = async (qId, selectedOption, status) => {
    try {
      await api.put(`/api/attempts/${attemptId}/answer`, {
        questionId: qId,
        selectedOption: selectedOption !== undefined ? selectedOption : null,
        status,
      });
    } catch (err) {
      console.error("Failed to autosave answer:", err);
    }
  };

  // Option selection handler
  const handleSelectOption = (optionIndex) => {
    if (!currentQuestionId) return;
    setAnswersState((prev) => ({
      ...prev,
      [currentQuestionId]: {
        ...prev[currentQuestionId],
        selectedOption: optionIndex,
      },
    }));
  };

  // Save & Next Action
  const handleSaveAndNext = async () => {
    if (!currentQuestionId) return;

    const hasSelection =
      currentAnswer.selectedOption !== null &&
      currentAnswer.selectedOption !== undefined;
    const newStatus = hasSelection ? "answered" : "not-answered";

    setAnswersState((prev) => ({
      ...prev,
      [currentQuestionId]: {
        selectedOption: currentAnswer.selectedOption,
        status: newStatus,
      },
    }));

    syncAnswerToBackend(currentQuestionId, currentAnswer.selectedOption, newStatus);
    goToNextQuestion();
  };

  // Mark for Review & Next Action
  const handleMarkForReviewAndNext = async () => {
    if (!currentQuestionId) return;

    const hasSelection =
      currentAnswer.selectedOption !== null &&
      currentAnswer.selectedOption !== undefined;
    const newStatus = hasSelection ? "answered-and-marked" : "marked-for-review";

    setAnswersState((prev) => ({
      ...prev,
      [currentQuestionId]: {
        selectedOption: currentAnswer.selectedOption,
        status: newStatus,
      },
    }));

    syncAnswerToBackend(currentQuestionId, currentAnswer.selectedOption, newStatus);
    goToNextQuestion();
  };

  // Clear Response Action
  const handleClearResponse = async () => {
    if (!currentQuestionId) return;

    const newStatus = "not-answered";

    setAnswersState((prev) => ({
      ...prev,
      [currentQuestionId]: {
        selectedOption: null,
        status: newStatus,
      },
    }));

    syncAnswerToBackend(currentQuestionId, null, newStatus);
  };

  const goToNextQuestion = () => {
    if (activeQuestionIndex < activeQuestions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    } else if (activeSectionIndex < (exam?.sections?.length || 1) - 1) {
      // Advance to next section's 1st question
      setActiveSectionIndex((prev) => prev + 1);
      setActiveQuestionIndex(0);
    }
  };

  const goToPrevQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    } else if (activeSectionIndex > 0) {
      // Go to previous section's last question
      const prevSecIndex = activeSectionIndex - 1;
      setActiveSectionIndex(prevSecIndex);
      const prevSecQuestions = exam.sections[prevSecIndex]?.questions || [];
      setActiveQuestionIndex(Math.max(0, prevSecQuestions.length - 1));
    }
  };

  // Clicking on question in palette (marks not-visited -> not-answered if first time visiting)
  const handlePaletteClick = (secIdx, qIdx) => {
    setActiveSectionIndex(secIdx);
    setActiveQuestionIndex(qIdx);

    const targetQuestion = exam?.sections?.[secIdx]?.questions?.[qIdx];
    if (targetQuestion) {
      const qId = targetQuestion._id;
      const existing = answersState[qId];
      if (!existing || existing.status === "not-visited") {
        setAnswersState((prev) => ({
          ...prev,
          [qId]: {
            selectedOption: existing?.selectedOption ?? null,
            status: "not-answered",
          },
        }));
        syncAnswerToBackend(qId, existing?.selectedOption ?? null, "not-answered");
      }
    }
  };

  // Live Counts for Palette Summary
  const summaryCounts = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let notVisited = 0;
    let markedForReview = 0;
    let answeredAndMarked = 0;

    if (exam && exam.sections) {
      exam.sections.forEach((sec) => {
        (sec.questions || []).forEach((q) => {
          const state = answersState[q._id]?.status || "not-visited";
          if (state === "answered") answered++;
          else if (state === "not-answered") notAnswered++;
          else if (state === "marked-for-review") markedForReview++;
          else if (state === "answered-and-marked") answeredAndMarked++;
          else notVisited++;
        });
      });
    }

    return { answered, notAnswered, notVisited, markedForReview, answeredAndMarked };
  }, [exam, answersState]);

  // Format timer as HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[85vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-semibold text-gray-700">
          Entering secure examination environment...
        </p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-bold">{error || "Failed to load test session."}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans select-none">
      
      {/* 1. TOP BAR: Exam Name, Timer, Candidate Info */}
      <header className="sticky top-0 z-30 border-b border-gray-300 bg-blue-900 px-4 py-2.5 text-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Prayaas Portal"
            width={34}
            height={34}
            className="h-8.5 w-8.5 object-contain rounded-full bg-white/10 p-0.5"
            priority
          />
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight line-clamp-1">
              {exam.title}
            </h1>
            <span className="text-[10px] text-blue-200">
              {exam.examCategory} CBT Practice Mode
            </span>
          </div>
        </div>

        {/* Center Countdown Clock */}
        <div className="flex items-center gap-2 rounded-lg bg-blue-950 px-4 py-1.5 border border-blue-800 shadow-inner">
          <span className="text-xs text-blue-300 font-medium">Time Left:</span>
          <span
            className={`font-mono text-base sm:text-lg font-bold tracking-wider ${
              timeRemainingSeconds < 300 ? "text-red-400 animate-pulse" : "text-amber-300"
            }`}
          >
            {formatTime(timeRemainingSeconds)}
          </span>
        </div>

        {/* Candidate Profile Pill */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right text-xs">
            <div className="font-bold text-white">{user?.name || "Candidate"}</div>
            <div className="text-[10px] text-blue-300">
              ID: {user?.id ? user.id.slice(-6).toUpperCase() : "PRY-892"}
            </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
          </div>
        </div>
      </header>

      {/* 2. SECTION TABS ROW */}
      <div className="bg-gray-200 border-b border-gray-300 px-4 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider mr-2 shrink-0">
          Sections:
        </span>
        {exam.sections.map((section, sIdx) => {
          const isActive = sIdx === activeSectionIndex;
          const qCount = section.questions?.length || 0;
          return (
            <button
              key={section._id}
              onClick={() => {
                setActiveSectionIndex(sIdx);
                setActiveQuestionIndex(0);
              }}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-white text-blue-700 border-blue-700 shadow-xs"
                  : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-50"
              }`}
            >
              {section.name}{" "}
              <span className="text-[10px] ml-1 px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-700">
                {qCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE (Question Left + Palette Right) */}
      <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-300 overflow-hidden">
        
        {/* LEFT COLUMN: Question Display & Answer Controls */}
        <div className="flex-1 flex flex-col justify-between bg-white overflow-y-auto max-h-[calc(100vh-140px)]">
          
          {/* Question Metadata Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">
                Question No. {activeQuestionIndex + 1}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 font-medium">
                {activeSection?.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded bg-green-50 px-2 py-0.5 font-semibold text-green-700 border border-green-200">
                +{currentQuestion?.marksForCorrect || 1.0}
              </span>
              {exam.negativeMarkingEnabled && (
                <span className="rounded bg-red-50 px-2 py-0.5 font-semibold text-red-700 border border-red-200">
                  -{currentQuestion?.negativeMarks || 0.25}
                </span>
              )}
            </div>
          </div>

          {/* Question Body */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {currentQuestion ? (
              <>
                {/* Long paragraph question text container */}
                <div className="text-sm sm:text-base text-gray-900 leading-relaxed font-medium whitespace-pre-wrap break-words bg-gray-50/50 p-4 rounded-lg border border-gray-200">
                  {currentQuestion.questionText}
                </div>

                {/* Optional Attached Image */}
                {currentQuestion.imageUrl && (
                  <div className="my-4 rounded-lg border border-gray-200 bg-gray-50 p-2 max-w-xl">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question Diagram"
                      className="max-h-72 w-auto object-contain rounded"
                    />
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Options:
                  </div>

                  {currentQuestion.options?.map((optionText, optIndex) => {
                    const isSelected = currentAnswer.selectedOption === optIndex;
                    const optionLetter = ["A", "B", "C", "D"][optIndex];

                    return (
                      <label
                        key={optIndex}
                        onClick={() => handleSelectOption(optIndex)}
                        className={`flex items-start gap-3.5 rounded-lg border p-3.5 text-sm transition-all cursor-pointer ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/80 ring-1 ring-blue-600 shadow-xs"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${currentQuestionId}`}
                          checked={isSelected}
                          onChange={() => handleSelectOption(optIndex)}
                          className="mt-0.5 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <span className="font-bold text-gray-700">
                            ({optionLetter})
                          </span>
                          <span className="text-gray-900 leading-snug break-words">
                            {optionText}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500 text-sm">
                No questions found in this section.
              </div>
            )}
          </div>

          {/* Bottom Action Controls Bar */}
          <div className="sticky bottom-0 border-t border-gray-300 bg-gray-50 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkForReviewAndNext}
                className="rounded-lg border border-purple-300 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-900 hover:bg-purple-100 transition-colors cursor-pointer"
              >
                Mark for Review & Next
              </button>
              <button
                type="button"
                onClick={handleClearResponse}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrevQuestion}
                disabled={activeSectionIndex === 0 && activeQuestionIndex === 0}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                &larr; Previous
              </button>
              <button
                type="button"
                onClick={handleSaveAndNext}
                className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Save & Next</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TCS iON Palette & Status Summary */}
        <div className="w-full lg:w-84 bg-gray-50 flex flex-col justify-between p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="space-y-4">
            
            {/* Legend & Summary Counts */}
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-xs space-y-2.5">
              <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-1.5">
                Palette Legend
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-6 rounded-b bg-green-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {summaryCounts.answered}
                  </div>
                  <span className="text-gray-700">Answered</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-5 w-6 rounded-t bg-red-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {summaryCounts.notAnswered}
                  </div>
                  <span className="text-gray-700">Not Answered</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-5 w-6 rounded bg-gray-200 border border-gray-400 text-gray-800 font-bold flex items-center justify-center text-[10px]">
                    {summaryCounts.notVisited}
                  </div>
                  <span className="text-gray-700">Not Visited</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-[10px]">
                    {summaryCounts.markedForReview}
                  </div>
                  <span className="text-gray-700">Marked Review</span>
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <div className="relative h-5 w-5 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-[10px]">
                    {summaryCounts.answeredAndMarked}
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-white"></span>
                  </div>
                  <span className="text-purple-950 font-medium">
                    Answered & Marked (Evaluated)
                  </span>
                </div>
              </div>
            </div>

            {/* Question Palette Grid for Active Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                <span className="text-xs font-bold text-gray-800">
                  {activeSection?.name}
                </span>
                <span className="text-[10px] text-gray-500 font-semibold">
                  {activeQuestions.length} Questions
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
                {activeQuestions.map((q, qIndex) => {
                  const state = answersState[q._id]?.status || "not-visited";
                  const isCurrent =
                    activeSectionIndex === activeSectionIndex &&
                    activeQuestionIndex === qIndex;

                  let shapeClasses = "bg-gray-200 text-gray-800 border border-gray-400"; // not-visited default
                  let badgeDot = false;

                  if (state === "answered") {
                    shapeClasses = "rounded-b bg-green-600 text-white";
                  } else if (state === "not-answered") {
                    shapeClasses = "rounded-t bg-red-600 text-white";
                  } else if (state === "marked-for-review") {
                    shapeClasses = "rounded-full bg-purple-700 text-white";
                  } else if (state === "answered-and-marked") {
                    shapeClasses = "rounded-full bg-purple-700 text-white";
                    badgeDot = true;
                  }

                  return (
                    <button
                      key={q._id}
                      onClick={() => handlePaletteClick(activeSectionIndex, qIndex)}
                      className={`relative h-8 w-8 text-xs font-bold flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${shapeClasses} ${
                        isCurrent ? "ring-2 ring-blue-500 ring-offset-2" : ""
                      }`}
                    >
                      {qIndex + 1}
                      {badgeDot && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border border-white"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Test Button */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="w-full rounded-lg bg-green-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-green-700 transition-colors cursor-pointer"
            >
              Submit Examination
            </button>
          </div>
        </div>
      </div>

      {/* 4. SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Submit Examination Confirmation
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Review your test summary before final submission.
              </p>
            </div>

            {/* Per Section Summary Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
                <thead className="bg-gray-50 font-semibold text-gray-700">
                  <tr>
                    <th className="px-3 py-2">Section</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2 text-green-700">Ans</th>
                    <th className="px-3 py-2 text-red-700">Not Ans</th>
                    <th className="px-3 py-2 text-purple-700">Marked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {exam.sections.map((sec) => {
                    let secAns = 0;
                    let secNotAns = 0;
                    let secMarked = 0;
                    const qList = sec.questions || [];

                    qList.forEach((q) => {
                      const st = answersState[q._id]?.status || "not-visited";
                      if (st === "answered" || st === "answered-and-marked") secAns++;
                      else if (st === "not-answered") secNotAns++;
                      else if (st === "marked-for-review") secMarked++;
                    });

                    return (
                      <tr key={sec._id}>
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {sec.name}
                        </td>
                        <td className="px-3 py-2">{qList.length}</td>
                        <td className="px-3 py-2 font-bold text-green-700">{secAns}</td>
                        <td className="px-3 py-2 font-bold text-red-700">{secNotAns}</td>
                        <td className="px-3 py-2 font-bold text-purple-700">{secMarked}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
              <strong>Caution:</strong> Once submitted, you will not be able to re-enter or modify your answers for this exam attempt.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Return to Test
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleManualSubmit}
                className="rounded-lg bg-green-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-green-700 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? "Submitting..." : "Yes, Submit Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveExamPage({ params }) {
  return (
    <ProtectedRoute>
      <LiveExamContent params={params} />
    </ProtectedRoute>
  );
}
