"use client";

import React from "react";
import ArticleForm from "../ArticleForm";

export default function NewArticlePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ArticleForm isEdit={false} />
    </div>
  );
}
