"use client";

import React, { useState, useEffect, use } from "react";
import ArticleForm from "../../ArticleForm";
import api from "@/lib/api";
import Link from "next/link";

export default function EditArticlePage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadArticle() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/api/admin/articles/${id}`);
        if (res.data && res.data.article) {
          setArticle(res.data.article);
        } else {
          setError("Article data not found");
        }
      } catch (err) {
        console.error("Failed to load article for edit:", err);
        setError(err.response?.data?.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadArticle();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent mb-3" />
        <p className="text-xs font-semibold text-slate-500">
          Loading article editor...
        </p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold inline-block">
          ⚠️ {error || "Article not found"}
        </div>
        <div>
          <Link
            href="/admin/articles"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
          >
            ← Back to Articles List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ArticleForm initialData={article} isEdit={true} articleId={id} />
    </div>
  );
}
