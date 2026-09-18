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

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("");

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (category && category !== "All") params.category = category;
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
  }, [category, status, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await api.delete(`/api/admin/articles/${id}`);
      setArticles((prev) => prev.filter((a) => a._id !== id));
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
  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📰</span>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Exam News & Article CMS
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage exam notifications, admit cards, answer keys, and syllabus articles for students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchArticles}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            🔄 Refresh
          </button>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
          >
            <span>+ Write New Article</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Posts</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalArticles}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700">Published</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{publishedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-xs font-semibold text-amber-700">Drafts</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{draftCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <span className="text-xs font-semibold text-indigo-700">Total Reads</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {totalViews.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title, slug, or organization..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          {/* Status dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-medium"
          >
            <option value="">Status: All</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
              className="px-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <span className="text-4xl block">📝</span>
            <p className="text-sm font-semibold text-slate-700">No articles found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search filters or create a new article.
            </p>
            <Link
              href="/admin/articles/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
            >
              + Create First Article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Article Title & Slug</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Reads</th>
                  <th className="py-3.5 px-4">Publish Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 line-clamp-1 mt-0.5">
                        /news/{item.slug}
                      </div>
                      {item.organization && (
                        <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                          🏛️ {item.organization}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.status === "Published"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {item.status === "Published" ? "● Live" : "○ Draft"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      👁️ {item.views || 0}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {item.publishDate
                        ? new Date(item.publishDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Live Link */}
                        <Link
                          href={`/news/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 transition"
                          title="View on live website"
                        >
                          Live ↗
                        </Link>

                        {/* Edit Button */}
                        <Link
                          href={`/admin/articles/edit/${item._id}`}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition"
                        >
                          Edit ✎
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteConfirm(item)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Confirm Article Deletion
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">
                &ldquo;{deleteConfirm.title}&rdquo;
              </span>
              ? This action cannot be undone and the URL{" "}
              <span className="font-mono text-red-600">/news/{deleteConfirm.slug}</span> will
              stop working.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deletingId === deleteConfirm._id}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={deletingId === deleteConfirm._id}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
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
