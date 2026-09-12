"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

function ExamResultContent({ params }) {
  const unwrappedParams = use(params);
  const { examId, attemptId } = unwrappedParams;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState("all"); // 'all', 'correct', 'wrong', 'unanswered'

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/attempts/${attemptId}/result`);
      if (res.data && res.data.result) {
        setResult(res.data.result);
      }
    } catch (err) {
      console.error("Error fetching attempt result:", err);
      setError(
        err.response?.data?.message || "Failed to retrieve examination score."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-sm font-semibold text-gray-600">
          Calculating final score & test diagnostics...
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-bold">{error || "Result unavailable."}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const {
    score,
    totalMarks,
    correctCount,
    wrongCount,
    unansweredCount,
    timeTakenSeconds,
    submitTime,
    examPaper,
    answers = [],
  } = result;

  const totalAttempted = correctCount + wrongCount;
  const accuracy =
    totalAttempted > 0
      ? Math.round((correctCount / totalAttempted) * 100)
      : 0;

  const minutesTaken = Math.floor(timeTakenSeconds / 60);
  const secondsTaken = timeTakenSeconds % 60;

  // Filter questions for detailed solution review
  const filteredAnswers = answers.filter((ans) => {
    if (filterMode === "correct") return ans.isCorrect === true;
    if (filterMode === "wrong") return ans.isCorrect === false;
    if (filterMode === "unanswered") return ans.isCorrect === null;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Top Header Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                {examPaper?.examCategory || "Competitive"} Exam Result
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                {examPaper?.title || "Examination Performance Summary"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Completed on {submitTime ? new Date(submitTime).toLocaleString() : "N/A"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/exam/${examId}/leaderboard`}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>View Leaderboard</span>
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Practice More Exams
              </Link>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-6">
            <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
              <span className="text-xs font-medium text-blue-700">Total Score</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-blue-900">{score}</span>
                <span className="text-xs font-medium text-blue-600">/ {totalMarks}</span>
              </div>
            </div>

            <div className="rounded-xl bg-green-50 p-4 border border-green-100">
              <span className="text-xs font-medium text-green-700">Correct Answers</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-green-900">{correctCount}</span>
                <span className="text-xs font-medium text-green-600">Q's</span>
              </div>
            </div>

            <div className="rounded-xl bg-red-50 p-4 border border-red-100">
              <span className="text-xs font-medium text-red-700">Wrong Answers</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-red-900">{wrongCount}</span>
                <span className="text-xs font-medium text-red-600">Q's</span>
              </div>
            </div>

            <div className="rounded-xl bg-purple-50 p-4 border border-purple-100">
              <span className="text-xs font-medium text-purple-700">Time Taken</span>
              <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-purple-900">
                {minutesTaken}m {secondsTaken}s
              </div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            <div>
              <span className="font-semibold text-gray-700">Unanswered Questions:</span> {unansweredCount}
            </div>
            <div>
              <span className="font-semibold text-gray-700">Accuracy:</span> {accuracy}%
            </div>
            <div>
              <span className="font-semibold text-gray-700">Negative Marking:</span>{" "}
              {examPaper?.negativeMarkingEnabled ? "Applied" : "None"}
            </div>
          </div>
        </div>

        {/* Detailed Solutions & Question Analysis Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                Question-by-Question Solution Review
              </h2>
              <p className="text-xs text-gray-500">
                Review your responses against the verified answer key
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: `All (${answers.length})` },
                { id: "correct", label: `Correct (${correctCount})` },
                { id: "wrong", label: `Wrong (${wrongCount})` },
                { id: "unanswered", label: `Skipped (${unansweredCount})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilterMode(pill.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    filterMode === pill.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Questions Review List */}
          <div className="space-y-4">
            {filteredAnswers.map((item, index) => {
              const q = item.question;
              if (!q) return null;

              const isCorrect = item.isCorrect === true;
              const isWrong = item.isCorrect === false;
              const isSkipped = item.isCorrect === null;

              return (
                <div
                  key={index}
                  className={`rounded-xl border bg-white p-6 shadow-xs space-y-4 ${
                    isCorrect
                      ? "border-green-200"
                      : isWrong
                      ? "border-red-200"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="font-bold text-xs text-gray-700">
                      Question {index + 1}
                    </span>

                    <div className="flex items-center gap-2 text-xs">
                      {isCorrect && (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 font-bold text-green-800 flex items-center gap-1">
                          ✓ Correct (+{item.marksAwarded})
                        </span>
                      )}
                      {isWrong && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-bold text-red-800 flex items-center gap-1">
                          ✗ Incorrect ({item.marksAwarded})
                        </span>
                      )}
                      {isSkipped && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-semibold text-gray-600">
                          Not Answered (0.0)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Paragraph */}
                  <div className="text-sm text-gray-900 font-medium whitespace-pre-wrap leading-relaxed">
                    {q.questionText}
                  </div>

                  {/* Optional Image */}
                  {q.imageUrl && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 max-w-md">
                      <img
                        src={q.imageUrl}
                        alt="Question Diagram"
                        className="max-h-60 w-auto object-contain rounded"
                      />
                    </div>
                  )}

                  {/* 4 Options Comparison */}
                  <div className="space-y-2 pt-2">
                    {q.options?.map((opt, oIdx) => {
                      const isRealCorrect = q.correctOptionIndex === oIdx;
                      const isCandidateChoice = item.selectedOption === oIdx;
                      const optionLetter = ["A", "B", "C", "D"][oIdx];

                      let optionStyle = "border-gray-200 bg-gray-50/50 text-gray-700";

                      if (isRealCorrect) {
                        optionStyle =
                          "border-green-400 bg-green-50 text-green-950 font-semibold ring-1 ring-green-400";
                      } else if (isCandidateChoice && !isRealCorrect) {
                        optionStyle =
                          "border-red-400 bg-red-50 text-red-950 font-semibold ring-1 ring-red-400";
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`flex items-center justify-between rounded-lg border p-3 text-xs ${optionStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold">({optionLetter})</span>
                            <span>{opt}</span>
                          </div>

                          <div className="flex items-center gap-2 font-bold text-[11px]">
                            {isCandidateChoice && (
                              <span className={isRealCorrect ? "text-green-700" : "text-red-700"}>
                                [Your Answer]
                              </span>
                            )}
                            {isRealCorrect && (
                              <span className="text-green-700 font-extrabold">
                                ✓ Correct Option
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExamResultPage({ params }) {
  return (
    <ProtectedRoute>
      <ExamResultContent params={params} />
    </ProtectedRoute>
  );
}
