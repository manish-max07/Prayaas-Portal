"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import api from "@/lib/api";
import QuestionOptionDisplay from "@/components/QuestionOptionDisplay";
import { isImageUrl } from "@/lib/imageHelper";

export default function AdminSectionQuestionsPage({ params }) {
  const unwrappedParams = use(params);
  const sectionId = unwrappedParams.sectionId;

  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Question Form State (for both Add and Edit)
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [marksForCorrect, setMarksForCorrect] = useState(1.0);
  const [negativeMarks, setNegativeMarks] = useState(0.25);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [formMsg, setFormMsg] = useState(null);

  // Excel Upload State
  const [excelFile, setExcelFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null);

  useEffect(() => {
    fetchSectionDetails();
  }, [sectionId]);

  const fetchSectionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/admin/exams/sections/${sectionId}`);
      if (res.data && res.data.section) {
        setSection(res.data.section);
      }
    } catch (err) {
      console.error("Error loading section:", err);
      setError("Failed to load section and questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setFormMsg(null);

    if (!questionText.trim()) {
      alert("Question text is required.");
      return;
    }

    if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      alert("All 4 options (A, B, C, D) are required.");
      return;
    }

    const payload = {
      questionText: questionText.trim(),
      imageUrl: imageUrl.trim() || null,
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
      correctOptionIndex: Number(correctOptionIndex),
      marksForCorrect: Number(marksForCorrect),
      negativeMarks: Number(negativeMarks),
    };

    try {
      setSavingQuestion(true);

      if (editingQuestionId) {
        // Update existing question
        const res = await api.put(`/api/admin/exams/questions/${editingQuestionId}`, payload);
        if (res.data) {
          setFormMsg({ type: "success", text: "Question updated successfully." });
          resetForm();
          fetchSectionDetails();
        }
      } else {
        // Create new question
        const res = await api.post(`/api/admin/exams/sections/${sectionId}/questions`, payload);
        if (res.data && res.data.question) {
          setFormMsg({ type: "success", text: "Question added to section successfully." });
          resetForm();
          fetchSectionDetails();
        }
      }
    } catch (err) {
      console.error("Failed to save question:", err);
      setFormMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to save question.",
      });
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleEditClick = (q) => {
    setEditingQuestionId(q._id);
    setQuestionText(q.questionText || "");
    setImageUrl(q.imageUrl || "");
    setOptA(q.options?.[0] || "");
    setOptB(q.options?.[1] || "");
    setOptC(q.options?.[2] || "");
    setOptD(q.options?.[3] || "");
    setCorrectOptionIndex(q.correctOptionIndex ?? 0);
    setMarksForCorrect(q.marksForCorrect ?? 1.0);
    setNegativeMarks(q.negativeMarks ?? 0.25);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await api.delete(`/api/admin/exams/questions/${qId}`);
      setSection((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q._id !== qId),
      }));
    } catch (err) {
      console.error("Failed to delete question:", err);
      alert(err.response?.data?.message || "Failed to delete question.");
    }
  };

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionText("");
    setImageUrl("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrectOptionIndex(0);
    setMarksForCorrect(1.0);
    setNegativeMarks(0.25);
  };

  const handleSectionExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      alert("Please select an Excel (.xlsx) file.");
      return;
    }

    try {
      setUploadingExcel(true);
      setUploadSummary(null);

      const formData = new FormData();
      formData.append("file", excelFile);

      const res = await api.post(
        `/api/admin/exams/sections/${sectionId}/upload-questions`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data) {
        setUploadSummary(res.data);
        setExcelFile(null);
        fetchSectionDetails();
      }
    } catch (err) {
      console.error("Excel upload error:", err);
      alert(err.response?.data?.message || "Failed to upload Excel file.");
    } finally {
      setUploadingExcel(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-800 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !section) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center text-red-600">
        <p className="font-bold">{error || "Section not found."}</p>
        <Link href="/admin/dashboard" className="text-xs text-blue-600 underline mt-2 block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const exam = section.examPaper;
  const questionsList = section.questions || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link
            href={exam?._id ? `/admin/exams/${exam._id}` : "/admin/dashboard"}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            &larr; Back to Exam Details ({exam?.title || "Exam"})
          </Link>
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Section: {section.name}
            </h1>
            <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-800">
              {questionsList.length} Questions
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Manual Add/Edit Question Form) + Right Column (Excel Upload) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Manual Question Form (2 cols on lg) */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              {editingQuestionId ? "✏️ Edit Question" : "➕ Add Single Question"}
            </h2>
            {editingQuestionId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                Cancel Edit Mode
              </button>
            )}
          </div>

          {formMsg && (
            <div
              className={`rounded-lg p-3 text-xs font-semibold ${
                formMsg.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {formMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveQuestion} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Question Text (Rich paragraphs & case studies supported) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="4"
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type or paste the complete question text / reading comprehension passage here..."
                className="w-full rounded-lg border border-gray-300 p-3 text-xs text-gray-900 focus:border-blue-500 focus:outline-none leading-relaxed font-medium"
              />
            </div>

            {/* Optional Image URL Input & Live Preview */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Image / Diagram URL (Optional Hosted Link)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/diagram.png"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
              />

              {/* Live Image Preview */}
              {imageUrl && (
                <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2 max-w-sm">
                  <span className="text-[10px] font-bold text-gray-500 block mb-1">Live Image Preview:</span>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                    onLoad={(e) => {
                      e.target.style.display = "block";
                    }}
                    className="max-h-40 w-auto object-contain rounded"
                  />
                </div>
              )}
            </div>

            {/* 4 Options */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                4 Options:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 mb-0.5 block">Option A</label>
                  <input
                    type="text"
                    required
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Option A text or image URL"
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                  {isImageUrl(optA) && (
                    <div className="mt-1 rounded border border-gray-200 bg-white p-1 max-w-[150px]">
                      <img src={optA} alt="Option A Preview" className="max-h-16 w-auto object-contain rounded" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 mb-0.5 block">Option B</label>
                  <input
                    type="text"
                    required
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Option B text or image URL"
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                  {isImageUrl(optB) && (
                    <div className="mt-1 rounded border border-gray-200 bg-white p-1 max-w-[150px]">
                      <img src={optB} alt="Option B Preview" className="max-h-16 w-auto object-contain rounded" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 mb-0.5 block">Option C</label>
                  <input
                    type="text"
                    required
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Option C text or image URL"
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                  {isImageUrl(optC) && (
                    <div className="mt-1 rounded border border-gray-200 bg-white p-1 max-w-[150px]">
                      <img src={optC} alt="Option C Preview" className="max-h-16 w-auto object-contain rounded" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600 mb-0.5 block">Option D</label>
                  <input
                    type="text"
                    required
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Option D text or image URL"
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                  {isImageUrl(optD) && (
                    <div className="mt-1 rounded border border-gray-200 bg-white p-1 max-w-[150px]">
                      <img src={optD} alt="Option D Preview" className="max-h-16 w-auto object-contain rounded" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Correct Option, Marks & Negative Marks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Correct Option <span className="text-red-500">*</span>
                </label>
                <select
                  value={correctOptionIndex}
                  onChange={(e) => setCorrectOptionIndex(Number(e.target.value))}
                  className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 font-bold bg-green-50/50 focus:border-blue-500 focus:outline-none"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Marks (+ve)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  required
                  value={marksForCorrect}
                  onChange={(e) => setMarksForCorrect(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Penalty (-ve)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  required
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={savingQuestion}
                className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {savingQuestion
                  ? "Saving Question..."
                  : editingQuestionId
                  ? "Update Question"
                  : "+ Add Question to Section"}
              </button>
            </div>
          </form>
        </div>

        {/* Section-Specific Excel Upload (1 col on lg) */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide">
              Excel Upload (Section)
            </h3>
            <p className="text-xs text-blue-800 mt-1">
              Bulk upload questions directly into <strong>{section.name}</strong>.
            </p>

            <form onSubmit={handleSectionExcelUpload} className="mt-4 space-y-3">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files[0] || null)}
                className="w-full text-xs text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer"
              />

              <button
                type="submit"
                disabled={!excelFile || uploadingExcel}
                className="w-full rounded bg-blue-700 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {uploadingExcel ? "Parsing..." : "Upload into This Section"}
              </button>
            </form>

            {uploadSummary && (
              <div className="mt-4 rounded-lg border border-green-300 bg-white p-3 text-xs space-y-1.5">
                <div className="font-bold text-green-900 text-[11px]">
                  ✓ {uploadSummary.message}
                </div>
                <div className="text-gray-700 text-[11px]">
                  Inserted: <strong>{uploadSummary.insertedCount}</strong> | Skipped: <strong>{uploadSummary.skippedCount}</strong>
                </div>

                {uploadSummary.skippedRows?.length > 0 && (
                  <div className="mt-1 text-red-700 text-[10px] max-h-24 overflow-y-auto">
                    {uploadSummary.skippedRows.map((sr, i) => (
                      <div key={i}>
                        Row {sr.rowNumber}: {sr.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-[11px] text-gray-500 border-t border-blue-100 pt-3">
            Supported columns: <em>Question, Option 1-4, Correct Answer (or Correct Option), Image URL, Marks, Negative Marks</em>.
          </div>
        </div>
      </div>

      {/* Existing Questions List in this Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900">
            Questions in Section ({questionsList.length})
          </h2>
        </div>

        {questionsList.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No questions in this section yet. Use the form above or upload an Excel file.
          </div>
        ) : (
          <div className="space-y-4">
            {questionsList.map((q, qIndex) => {
              return (
                <div
                  key={q._id}
                  className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 space-y-3 hover:border-gray-300 transition-colors shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="font-bold text-xs text-gray-800">
                      Q{qIndex + 1}.
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                        +{q.marksForCorrect || 1.0} Marks
                      </span>
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                        -{q.negativeMarks || 0.25} Penalty
                      </span>
                      <button
                        onClick={() => handleEditClick(q)}
                        className="ml-2 rounded bg-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-800 hover:bg-gray-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="rounded bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-xs sm:text-sm text-gray-900 font-medium whitespace-pre-wrap leading-relaxed">
                    {q.questionText}
                  </div>

                  {/* Optional Image */}
                  {q.imageUrl && (
                    <div className="rounded border border-gray-200 bg-white p-2 max-w-xs">
                      <img
                        src={q.imageUrl}
                        alt="Question Diagram"
                        className="max-h-36 w-auto object-contain rounded"
                      />
                    </div>
                  )}

                  {/* 4 Options with Correct Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {q.options?.map((opt, oIdx) => {
                      const isCorrect = q.correctOptionIndex === oIdx;
                      const letter = ["A", "B", "C", "D"][oIdx];

                      return (
                        <div
                          key={oIdx}
                          className={`rounded-lg border p-2.5 flex items-center justify-between gap-3 overflow-hidden ${
                            isCorrect
                              ? "border-green-400 bg-green-50/70 text-green-950 font-semibold"
                              : "border-gray-200 bg-white text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="shrink-0 font-bold">({letter})</span>
                            <QuestionOptionDisplay
                              optionText={opt}
                              letter={letter}
                              imageClassName="max-h-20 sm:max-h-24"
                            />
                          </div>
                          {isCorrect && (
                            <span className="shrink-0 rounded bg-green-200/90 px-2 py-0.5 text-[10px] font-extrabold text-green-800">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
