"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";

const CATEGORIES = [
  "All",
  "Admit Card",
  "Exam Date",
  "Answer Key",
  "Result",
  "Recruitment",
  "Syllabus",
  "Cutoff",
  "General",
];

const SECTORS = [
  "All",
  "Central Govt",
  "SSC",
  "Banking & Insurance",
  "Railways",
  "Defence & Police",
  "Teaching",
  "Engineering & PSU",
  "Civil Services / UPSC",
  "State Govt",
];

const STATES = [
  "All",
  "All India",
  "Delhi",
  "Uttar Pradesh",
  "Bihar",
  "Rajasthan",
  "Madhya Pradesh",
  "Haryana",
  "Maharashtra",
  "West Bengal",
];

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sector, setSector] = useState("All");
  const [state, setState] = useState("All");
  const [status, setStatus] = useState(""); // "" (All), "Draft", "Published"

  // Auto Ingest Sync State
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  // Status Toggle & Bulk Operations State
  const [togglingId, setTogglingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (category && category !== "All") params.category = category;
      if (sector && sector !== "All") params.sector = sector;
      if (state && state !== "All") params.state = state;
      if (status) params.status = status;
      if (search.trim()) params.q = search.trim();

      const res = await api.get("/api/admin/articles", { params });
      if (res.data && res.data.articles) {
        setArticles(res.data.articles);
      }
    } catch (err) {
      console.error("Failed to load articles:", err);
      setError(err.response?.data?.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [category, sector, state, status, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleTriggerSync = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);
      const res = await api.post("/api/admin/articles/sync");
      if (res.data && res.data.stats) {
        setSyncResult(res.data.stats);
        await fetchArticles();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Sync failed. Check console.");
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleStatus = async (id, targetStatus) => {
    try {
      setTogglingId(id);
      const res = await api.patch(`/api/admin/articles/${id}/status`, {
        status: targetStatus,
      });

      if (res.data && res.data.article) {
        setArticles((prev) =>
          prev.map((a) =>
            a._id === id
              ? {
                  ...a,
                  status: targetStatus,
                  publishDate:
                    targetStatus === "Published" ? new Date() : a.publishDate,
                  lastUpdated: new Date(),
                }
              : a
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update article status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleBulkStatus = async (targetStatus) => {
    if (!selectedIds.length) return;
    try {
      setBulkUpdating(true);
      const res = await api.post("/api/admin/articles/bulk-status", {
        ids: selectedIds,
        status: targetStatus,
      });

      if (res.data && res.data.success) {
        setArticles((prev) =>
          prev.map((a) =>
            selectedIds.includes(a._id)
              ? {
                  ...a,
                  status: targetStatus,
                  publishDate:
                    targetStatus === "Published" ? new Date() : a.publishDate,
                  lastUpdated: new Date(),
                }
              : a
          )
        );
        setSelectedIds([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Bulk update failed");
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map((a) => a._id));
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await api.delete(`/api/admin/articles/${id}`);
      setArticles((prev) => prev.filter((a) => a._id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete article");
    } finally {
      setDeletingId(null);
    }
  };

  // Stats
  const totalArticles = articles.length;
  const publishedCount = articles.filter((a) => a.status === "Published").length;
  const draftCount = articles.filter((a) => a.status === "Draft").length;
  const autoCount = articles.filter((a) => a.isAutoGenerated).length;
  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📰</span>
            <h1 className="text-2xl font-black text-slate-900">
              Exam Articles &amp; News CMS
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Auto-ingested articles enter <strong>Draft</strong> mode first for review. Inspect and make them live with one click.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Auto Ingest Button */}
          <button
            onClick={handleTriggerSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {syncing ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Crawling Live Sites...</span>
              </>
            ) : (
              <>
                <span>⚡ Run Auto-Ingest</span>
              </>
            )}
          </button>

          {/* New Custom Article */}
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
          >
            <span>+ Write Article</span>
          </Link>
        </div>
      </div>

      {/* Sync Result Alert Banner */}
      {syncResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div>
            <span className="font-bold">Sync Completed Successfully!</span>
            <span className="ml-2">
              Scanned: <strong>{syncResult.scanned}</strong> | Ingested to Drafts:{" "}
              <strong>{syncResult.created}</strong> | Enriched:{" "}
              <strong>{syncResult.updated}</strong> | Duplicates Skipped:{" "}
              <strong>{syncResult.duplicatesSkipped}</strong>
            </span>
          </div>
          <button
            onClick={() => setSyncResult(null)}
            className="text-emerald-700 hover:text-emerald-950 text-base font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total in DB</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalArticles}</p>
        </div>
        <button
          onClick={() => setStatus("Draft")}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            status === "Draft"
              ? "border-amber-400 bg-amber-100/60 ring-2 ring-amber-400/30"
              : "border-amber-200 bg-amber-50/30 hover:bg-amber-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Drafts to Review</span>
            {draftCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{draftCount}</p>
        </button>
        <button
          onClick={() => setStatus("Published")}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            status === "Published"
              ? "border-emerald-400 bg-emerald-100/60 ring-2 ring-emerald-400/30"
              : "border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50"
          }`}
        >
          <span className="text-xs font-bold text-emerald-800">Live / Published</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{publishedCount}</p>
        </button>
        <div className="bg-white p-4 rounded-2xl border border-teal-200 bg-teal-50/20 shadow-xs">
          <span className="text-xs font-semibold text-teal-700">⚡ Auto-Ingested</span>
          <p className="text-2xl font-black text-teal-600 mt-1">{autoCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-indigo-700">👁️ Total Reads</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setStatus("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                status === ""
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Articles ({totalArticles})
            </button>
            <button
              onClick={() => setStatus("Draft")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                status === "Draft"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <span>📝 Drafts Pending Review ({draftCount})</span>
            </button>
            <button
              onClick={() => setStatus("Published")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                status === "Published"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <span>🟢 Live / Published ({publishedCount})</span>
            </button>
          </div>

          {/* Bulk Action Bar (Visible when rows selected) */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs animate-fade-in">
              <span className="font-bold">{selectedIds.length} Selected</span>
              <button
                onClick={() => handleBulkStatus("Published")}
                disabled={bulkUpdating}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {bulkUpdating ? "..." : "🚀 Publish"}
              </button>
              <button
                onClick={() => handleBulkStatus("Draft")}
                disabled={bulkUpdating}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {bulkUpdating ? "..." : "Move to Draft"}
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Search & Dropdown Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles by title, slug, sector, or organization..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-semibold"
            >
              {SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  Sector: {sec}
                </option>
              ))}
            </select>

            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-semibold"
            >
              {STATES.map((st) => (
                <option key={st} value={st}>
                  State: {st}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-semibold"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Type: {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="inline-block h-7 w-7 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mb-3" />
            <p className="text-xs font-semibold">Loading articles from database...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600 space-y-2">
            <p className="text-sm font-bold">⚠️ {error}</p>
            <button
              onClick={fetchArticles}
              className="px-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <span className="text-4xl block">📝</span>
            <p className="text-sm font-semibold text-slate-700">No articles found</p>
            <p className="text-xs text-slate-400">
              Run the auto-ingest crawler or create a custom article.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleTriggerSync}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
              >
                ⚡ Run Auto-Ingest Now
              </button>
              <Link
                href="/admin/articles/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
              >
                + Write Custom Article
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={
                        articles.length > 0 && selectedIds.length === articles.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title="Select all"
                    />
                  </th>
                  <th className="py-3.5 px-4">Article Title &amp; Sector</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">State</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Published (IST)</th>
                  <th className="py-3.5 px-4 text-center">Views 👁️</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((item) => {
                  const isDraft = item.status === "Draft";
                  const isRowToggling = togglingId === item._id;
                  const isSelected = selectedIds.includes(item._id);

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/60 transition ${
                        isSelected ? "bg-blue-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item._id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Title & Sector */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-blue-600 font-bold">
                            🏛️ {item.sector || "Central Govt"}
                          </span>
                          {item.isAutoGenerated && (
                            <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/50">
                              ⚡ Auto-Crawled
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      </td>

                      {/* State */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          {item.state || "All India"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {isDraft ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Live
                          </span>
                        )}
                      </td>

                      {/* Published Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {item.publishDate ? (
                          <div>
                            <div className="font-semibold text-slate-700">
                              {new Date(item.publishDate)
                                .toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                                .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase())}{" "}
                              IST
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* Views */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs">
                          👁️ {(item.views || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Fast Make Live (Draft) / Move to Draft (Published) Button */}
                          {isDraft ? (
                            <button
                              onClick={() => handleToggleStatus(item._id, "Published")}
                              disabled={isRowToggling}
                              className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-2xs transition disabled:opacity-50 cursor-pointer"
                              title="Publish this article to make it live for candidates"
                            >
                              {isRowToggling ? "Publishing..." : "🚀 Make Live"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(item._id, "Draft")}
                              disabled={isRowToggling}
                              className="px-2 py-1 rounded-md text-[10px] font-semibold text-amber-700 hover:bg-amber-50 border border-amber-200 transition disabled:opacity-50 cursor-pointer"
                              title="Unpublish this article and return it to Draft"
                            >
                              {isRowToggling ? "..." : "To Draft"}
                            </button>
                          )}

                          {/* Preview Button */}
                          <Link
                            href={`/admin/articles/preview/${item._id}`}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
                            title="Preview article as it appears to candidates"
                          >
                            👁️ Preview
                          </Link>

                          {/* Public Live Link (only if published) */}
                          {!isDraft && (
                            <Link
                              href={`/news/${item.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-md text-[11px] font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 transition"
                              title="Open live URL"
                            >
                              Live ↗
                            </Link>
                          )}

                          {/* Edit Button */}
                          <Link
                            href={`/admin/articles/edit/${item._id}`}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition"
                            title="Edit content"
                          >
                            ✎
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteConfirm(item)}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
                            title="Delete article"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Article Deletion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">
                &ldquo;{deleteConfirm.title}&rdquo;
              </span>
              ?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deletingId === deleteConfirm._id}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={deletingId === deleteConfirm._id}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs cursor-pointer"
              >
                {deletingId === deleteConfirm._id ? "Deleting..." : "Yes, Delete Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
