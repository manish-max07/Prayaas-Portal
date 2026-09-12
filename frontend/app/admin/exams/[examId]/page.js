"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const CATEGORIES = ["SSC", "Banking", "Railway", "State PSC", "UPSC", "Defence", "Teaching", "Other"];

export default function AdminExamDetailPage({ params }) {
  const unwrappedParams = use(params);
  const examId = unwrappedParams.examId;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  // Exam-level editable form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examCategory, setExamCategory] = useState("SSC");
  const [totalDurationMinutes, setTotalDurationMinutes] = useState(60);
  const [negativeMarkingEnabled, setNegativeMarkingEnabled] = useState(true);
  const [savingMeta, setSavingMeta] = useState(false);

  // New section form state
  const [newSectionName, setNewSectionName] = useState("");
  const [addingSection, setAddingSection] = useState(false);

  // Bulk Excel Upload state
  const [excelFile, setExcelFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null);

  const router = useRouter();

  useEffect(() => {
    fetchExamDetail();
  }, [examId]);

  const fetchExamDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/admin/exams/${examId}`);
      if (res.data && res.data.examPaper) {
        const ep = res.data.examPaper;
        setExam(ep);
        setTitle(ep.title || "");
        setDescription(ep.description || "");
        setExamCategory(ep.examCategory || "SSC");
        setTotalDurationMinutes(ep.totalDurationMinutes || 60);
        setNegativeMarkingEnabled(ep.negativeMarkingEnabled !== false);
      }
    } catch (err) {
      console.error("Error loading exam:", err);
      setError("Failed to load exam paper details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExamMeta = async (e) => {
    e.preventDefault();
    setSaveSuccess(null);
    try {
      setSavingMeta(true);
      const res = await api.put(`/api/admin/exams/${examId}`, {
        title: title.trim(),
        description: description.trim(),
        examCategory,
        totalDurationMinutes: Number(totalDurationMinutes),
        negativeMarkingEnabled,
      });

      if (res.data && res.data.examPaper) {
        setExam((prev) => ({ ...prev, ...res.data.examPaper }));
        setSaveSuccess("Exam parameters updated successfully.");
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Failed to update exam:", err);
      alert(err.response?.data?.message || "Failed to update exam.");
    } finally {
      setSavingMeta(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = exam.status === "live" ? "draft" : "live";
    const msg =
      nextStatus === "live"
        ? "Publish this exam as LIVE?\n\nIt will immediately become visible to candidates on the homepage."
        : "Revert this exam to DRAFT?\n\nCandidates will no longer see or start new attempts for this exam.";

    if (!window.confirm(msg)) return;

    try {
      const res = await api.put(`/api/admin/exams/${examId}/status`, {
        status: nextStatus,
      });
      if (res.data) {
        setExam((prev) => ({ ...prev, status: res.data.status }));
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      alert(err.response?.data?.message || "Failed to change status.");
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    try {
      setAddingSection(true);
      const res = await api.post(`/api/admin/exams/${examId}/sections`, {
        name: newSectionName.trim(),
      });

      if (res.data && res.data.section) {
        setExam((prev) => ({
          ...prev,
          sections: [...(prev.sections || []), { ...res.data.section, questions: [] }],
        }));
        setNewSectionName("");
      }
    } catch (err) {
      console.error("Failed to add section:", err);
      alert(err.response?.data?.message || "Failed to add section.");
    } finally {
      setAddingSection(false);
    }
  };

  const handleBulkExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      alert("Please select a valid .xlsx Excel file.");
      return;
    }

    try {
      setUploadingExcel(true);
      setUploadSummary(null);

      const formData = new FormData();
      formData.append("file", excelFile);

      const res = await api.post(
        `/api/admin/exams/${examId}/upload-questions`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data) {
        setUploadSummary(res.data);
        setExcelFile(null);
        // Refresh exam sections & questions
        fetchExamDetail();
      }
    } catch (err) {
      console.error("Excel upload error:", err);
      alert(
        err.response?.data?.message || "Failed to upload and parse Excel spreadsheet."
      );
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

  if (error || !exam) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center text-red-600">
        <p className="font-bold">{error || "Exam not found"}</p>
        <Link href="/admin/dashboard" className="text-xs text-blue-600 underline mt-2 block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isLive = exam.status === "live";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* 1. Header & Live Status Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            &larr; Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {exam.title}
            </h1>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                isLive
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              {isLive ? "● LIVE" : "○ DRAFT"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/exam/${examId}/leaderboard`}
            target="_blank"
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1"
          >
            <span>Live Standings</span>
            <span className="text-gray-400">↗</span>
          </Link>

          <button
            type="button"
            onClick={handleToggleStatus}
            className={`rounded-lg px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer transition-colors ${
              isLive
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLive ? "Revert to Draft" : "Publish to Live"}
          </button>
        </div>
      </div>

      {/* 2. Exam Parameters Form (Duration, Title, Category) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="border-b border-gray-100 pb-3 mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            Exam Configuration & Timing Limit
          </h2>
          {saveSuccess && (
            <span className="text-xs font-bold text-green-600 animate-fade-in">
              ✓ {saveSuccess}
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateExamMeta} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Exam Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category
              </label>
              <select
                value={examCategory}
                onChange={(e) => setExamCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Total Duration (Minutes) — Editable Anytime
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalDurationMinutes}
                onChange={(e) => setTotalDurationMinutes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Negative Marking Rule
              </label>
              <div className="flex items-center h-9">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={negativeMarkingEnabled}
                    onChange={(e) => setNegativeMarkingEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Enable Negative Marks Deduction</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingMeta}
              className="rounded-lg bg-gray-900 px-5 py-2 text-xs font-bold text-white hover:bg-black disabled:opacity-50 transition-colors cursor-pointer"
            >
              {savingMeta ? "Saving..." : "Save Exam Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Bulk Exam Questions Upload via Excel (.xlsx) */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-blue-950">
            Bulk Upload Questions via Excel (.xlsx)
          </h2>
          <p className="text-xs text-blue-800 mt-0.5">
            Upload an entire test spreadsheet. The parser will read the <strong>Section</strong> column (e.g. <em>"General Awareness"</em>, <em>"Quantitative Aptitude"</em>) and automatically group and create sections!
          </p>
        </div>

        <form onSubmit={handleBulkExcelUpload} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setExcelFile(e.target.files[0] || null)}
            className="w-full sm:w-auto text-xs text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />

          <button
            type="submit"
            disabled={!excelFile || uploadingExcel}
            className="rounded-lg bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
          >
            {uploadingExcel ? "Parsing & Uploading..." : "Upload & Parse Excel"}
          </button>
        </form>

        {uploadSummary && (
          <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-xs space-y-2">
            <div className="font-bold text-green-900 text-sm">
              ✓ {uploadSummary.message}
            </div>
            <div className="text-green-800">
              Inserted: <strong>{uploadSummary.insertedCount} questions</strong> | Skipped: <strong>{uploadSummary.skippedCount} rows</strong>
            </div>

            {uploadSummary.skippedRows?.length > 0 && (
              <div className="mt-2 rounded bg-white p-2 border border-red-200 text-red-700 max-h-32 overflow-y-auto">
                <span className="font-bold text-[11px] block mb-1">Skipped Rows Details:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {uploadSummary.skippedRows.map((sr, idx) => (
                    <li key={idx}>
                      Row {sr.rowNumber}: {sr.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Sections & Questions Architecture */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Sections in this Examination
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Each section holds questions and individual marking schemes
            </p>
          </div>

          {/* Add Section Form */}
          <form onSubmit={handleAddSection} className="flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="New Section Name (e.g. Reasoning)"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={addingSection}
              className="rounded-lg bg-gray-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-gray-900 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {addingSection ? "Adding..." : "+ Add Section"}
            </button>
          </form>
        </div>

        {/* Section List */}
        {exam.sections?.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg">
            No sections created yet. Add a section above or upload an Excel file to generate sections automatically.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {exam.sections?.map((section, idx) => {
              const qCount = section.questions?.length || 0;
              return (
                <div
                  key={section._id}
                  className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 flex flex-col justify-between hover:border-gray-300 transition-all shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        Section {idx + 1}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                        {qCount} Questions
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mt-2">
                      {section.name}
                    </h3>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-200/80 flex items-center justify-end">
                    <Link
                      href={`/admin/sections/${section._id}`}
                      className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <span>Manage Questions</span>
                      <span>&rarr;</span>
                    </Link>
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
