"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

const CATEGORIES = [
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

const STATUSES = ["Published", "Draft"];

export default function ArticleForm({ initialData = {}, isEdit = false, articleId = null }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    slug: initialData.slug || "",
    shortTitle: initialData.shortTitle || "",
    seoTitle: initialData.seoTitle || "",
    metaDescription: initialData.metaDescription || "",
    category: initialData.category || "Admit Card",
    sector: initialData.sector || "Central Govt",
    state: initialData.state || "All India",
    status: initialData.status || "Published",
    badge: initialData.badge || "🔴 Out Now",
    readingTime: initialData.readingTime || "4 min read",
    authorName: initialData.author?.name || "Prayaas Portal Exam Desk",
    authorRole: initialData.author?.role || "Senior Exam Analyst",

    // Exam-specific fields
    organization: initialData.organization || "",
    postName: initialData.postName || "",
    totalVacancies: initialData.totalVacancies || "",
    advtNumber: initialData.advtNumber || "",
    examDate: initialData.examDate || "",
    admitCardReleaseDate: initialData.admitCardReleaseDate || "",
    admitCardLastDate: initialData.admitCardLastDate || "",
    officialWebsite: initialData.officialWebsite || "",
    directAdmitCardLink: initialData.directAdmitCardLink || "",

    // Dynamic Overview Key-Value pairs
    overview: Array.isArray(initialData.overview)
      ? initialData.overview
      : initialData.overview
      ? Object.entries(initialData.overview).map(([label, value]) => ({ label, value }))
      : [
          { label: "Conducting Body", value: "" },
          { label: "Post Names", value: "" },
          { label: "Total Vacancies", value: "" },
          { label: "Exam Date", value: "" },
        ],

    // Guidance lists
    loginCredentialsRequired: initialData.loginCredentialsRequired || [
      "Registration Number / Roll Number",
      "Password / Date of Birth (DD-MM-YYYY)",
      "Security Captcha Verification Code",
    ],
    stepsToDownload: initialData.stepsToDownload || [
      "Visit the official website.",
      "Click on the Admit Card / Notification link.",
      "Enter your login credentials.",
      "Download and take a printout of the hall ticket.",
    ],
    documentsToCarry: initialData.documentsToCarry || [
      "Printed hard copy of Admit Card.",
      "Original Photo Identity Proof (Aadhaar Card, PAN Card, etc.).",
      "Passport size photographs.",
    ],
    prohibitedItems: initialData.prohibitedItems || [
      "Mobile phones, smartwatches, or pagers.",
      "Calculators or electronic gadgets.",
    ],

    // FAQs
    faqs: initialData.faqs || [
      {
        question: "When will the exam be conducted?",
        answer: "Check the official exam date mentioned above in this notification.",
      },
    ],

    // Freeform body content
    content: initialData.content || "",

    // Tags
    tags: initialData.tags ? initialData.tags.join(", ") : "",
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Content Dual-View Editing Mode ("visual" or "code")
  const [contentMode, setContentMode] = useState("visual");
  const visualEditorRef = useRef(null);

  useEffect(() => {
    if (activeTab === "content" && contentMode === "visual" && visualEditorRef.current) {
      if (visualEditorRef.current.innerHTML !== formData.content) {
        visualEditorRef.current.innerHTML = formData.content || "";
      }
    }
  }, [activeTab, contentMode]);

  const execEditorCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (visualEditorRef.current) {
      setFormData((prev) => ({
        ...prev,
        content: visualEditorRef.current.innerHTML,
      }));
    }
  };

  const handleAddLink = () => {
    const url = window.prompt("Enter URL (e.g. https://upsc.gov.in):");
    if (url) {
      execEditorCommand("createLink", url);
    }
  };

  const handleCleanCompetitors = () => {
    if (!formData.content) return;
    const cleaned = formData.content
      .replace(/Testbook/gi, "Prayaas Karo")
      .replace(/testbook\.com/gi, "prayaaskaro.in")
      .replace(/Adda247/gi, "Prayaas Karo")
      .replace(/adda247\.com/gi, "prayaaskaro.in")
      .replace(/Sarkari\s*Result/gi, "Prayaas Karo");
    setFormData((prev) => ({ ...prev, content: cleaned }));
    if (visualEditorRef.current) {
      visualEditorRef.current.innerHTML = cleaned;
    }
  };

  // Auto slug generation from title
  const handleTitleChange = (e) => {
    const val = e.target.value;
    const updates = { title: val };
    if (!isEdit && (!formData.slug || formData.slug === slugify(formData.title))) {
      updates.slug = slugify(val);
    }
    if (!formData.shortTitle || formData.shortTitle === formData.title) {
      updates.shortTitle = val;
    }
    if (!formData.seoTitle || formData.seoTitle === formData.title) {
      updates.seoTitle = val;
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 100);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Overview handlers
  const handleOverviewChange = (index, field, value) => {
    const updated = [...formData.overview];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, overview: updated }));
  };

  const addOverviewRow = () => {
    setFormData((prev) => ({
      ...prev,
      overview: [...prev.overview, { label: "", value: "" }],
    }));
  };

  const removeOverviewRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      overview: prev.overview.filter((_, i) => i !== index),
    }));
  };

  // List field handlers (steps, credentials, documents, prohibited)
  const handleListChange = (listName, index, value) => {
    const updated = [...formData[listName]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [listName]: updated }));
  };

  const addListItem = (listName) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: [...prev[listName], ""],
    }));
  };

  const removeListItem = (listName, index) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index),
    }));
  };

  // FAQ handlers
  const handleFaqChange = (index, field, value) => {
    const updated = [...formData.faqs];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, faqs: updated }));
  };

  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const removeFaq = (index) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.title.trim()) {
      setError("Please provide an article title.");
      setActiveTab("basic");
      return;
    }

    if (!formData.slug.trim()) {
      setError("Please provide a valid URL slug.");
      setActiveTab("basic");
      return;
    }

    try {
      setSubmitting(true);

      // Clean payload
      const payload = {
        title: formData.title.trim(),
        slug: slugify(formData.slug),
        shortTitle: formData.shortTitle.trim() || formData.title.trim(),
        seoTitle: formData.seoTitle.trim() || formData.title.trim(),
        metaDescription: formData.metaDescription.trim(),
        category: formData.category,
        sector: formData.sector,
        state: formData.state,
        status: formData.status,
        badge: formData.badge.trim(),
        readingTime: formData.readingTime.trim(),
        author: {
          name: formData.authorName.trim(),
          role: formData.authorRole.trim(),
          avatar: "/PrayaasKaroLogoWithoutText.png",
        },
        organization: formData.organization.trim(),
        postName: formData.postName.trim(),
        totalVacancies: formData.totalVacancies.trim(),
        advtNumber: formData.advtNumber.trim(),
        examDate: formData.examDate.trim(),
        admitCardReleaseDate: formData.admitCardReleaseDate.trim(),
        admitCardLastDate: formData.admitCardLastDate.trim(),
        officialWebsite: formData.officialWebsite.trim(),
        directAdmitCardLink: formData.directAdmitCardLink.trim(),

        overview: formData.overview.filter(
          (row) => row.label.trim() !== "" || row.value.trim() !== ""
        ),

        loginCredentialsRequired: formData.loginCredentialsRequired.filter(
          (item) => item.trim() !== ""
        ),
        stepsToDownload: formData.stepsToDownload.filter((item) => item.trim() !== ""),
        documentsToCarry: formData.documentsToCarry.filter((item) => item.trim() !== ""),
        prohibitedItems: formData.prohibitedItems.filter((item) => item.trim() !== ""),

        faqs: formData.faqs.filter(
          (f) => f.question.trim() !== "" && f.answer.trim() !== ""
        ),

        content: formData.content,

        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      if (isEdit) {
        await api.put(`/api/admin/articles/${articleId}`, payload);
        setSuccess("Article updated successfully!");
      } else {
        await api.post("/api/admin/articles", payload);
        setSuccess("Article created and published successfully!");
      }

      setTimeout(() => {
        router.push("/admin/articles");
      }, 1200);
    } catch (err) {
      console.error("Save article error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to save article"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {/* Alert Notices */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>✅ {success}</span>
        </div>
      )}

      {/* Action Header Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-16 z-20">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/articles"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              ← Back to Articles
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500">
              {isEdit ? "Edit Article" : "New Article"}
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1">
            {formData.title || (isEdit ? "Edit Article" : "Create New Article")}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <span>💾 {isEdit ? "Update Article" : "Publish Article"}</span>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: "basic", label: "1. Core & Status", icon: "📌" },
          { id: "exam", label: "2. Exam Details & Links", icon: "🏛️" },
          { id: "overview", label: "3. Overview Table", icon: "📊" },
          { id: "guides", label: "4. Steps & Rules", icon: "📋" },
          { id: "content", label: "5. Body / Content", icon: "✍️" },
          { id: "faqs", label: "6. FAQs", icon: "❓" },
          { id: "seo", label: "7. SEO & Tags", icon: "🔍" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-blue-600 text-white font-bold shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: CORE & STATUS */}
      {activeTab === "basic" && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            Basic Post Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Article Main Headline (H1) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. IOCL Admit Card 2026 Out, Direct Download Link for Engineer Posts Active"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 text-xs bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-mono">
                    /news/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="iocl-admit-card-2026"
                    className="w-full px-3 py-2 text-xs rounded-r-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Title (for sharing & cards)
                </label>
                <input
                  type="text"
                  name="shortTitle"
                  value={formData.shortTitle}
                  onChange={handleChange}
                  placeholder="e.g. IOCL Admit Card 2026 Released"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-semibold"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Exam Sector
                </label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-semibold"
                >
                  {SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State / Region
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-semibold"
                >
                  {STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Publication Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-semibold"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pill Badge
                </label>
                <input
                  type="text"
                  name="badge"
                  value={formData.badge}
                  onChange={handleChange}
                  placeholder="🔴 Out Now / ⚡ New / Live"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reading Time
                </label>
                <input
                  type="text"
                  name="readingTime"
                  value={formData.readingTime}
                  onChange={handleChange}
                  placeholder="e.g. 5 min read"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Author Signature
                </label>
                <input
                  type="text"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  placeholder="Prayaas Portal Exam Desk"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXAM DETAILS & DOWNLOAD LINKS */}
      {activeTab === "exam" && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800">
              Exam Details & Action Links
            </h3>
            <p className="text-[11px] text-slate-500">
              These fields automatically populate the hero download button, official portal links, and fast facts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Conducting Organization / Board
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="e.g. Indian Oil Corporation Limited (IOCL)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Post Names / Role
              </label>
              <input
                type="text"
                name="postName"
                value={formData.postName}
                onChange={handleChange}
                placeholder="e.g. Engineer, Officer & Executive Posts"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Vacancies
              </label>
              <input
                type="text"
                name="totalVacancies"
                value={formData.totalVacancies}
                onChange={handleChange}
                placeholder="e.g. 470 Vacancies"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Advertisement / Notification Number
              </label>
              <input
                type="text"
                name="advtNumber"
                value={formData.advtNumber}
                onChange={handleChange}
                placeholder="e.g. IOCL/CO-HR/RECTT/2026/01"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Exam Date
              </label>
              <input
                type="text"
                name="examDate"
                value={formData.examDate}
                onChange={handleChange}
                placeholder="e.g. 24th September 2026"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admit Card Release Date
              </label>
              <input
                type="text"
                name="admitCardReleaseDate"
                value={formData.admitCardReleaseDate}
                onChange={handleChange}
                placeholder="e.g. 17th September 2026"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Direct Download / Result Action URL
              </label>
              <input
                type="url"
                name="directAdmitCardLink"
                value={formData.directAdmitCardLink}
                onChange={handleChange}
                placeholder="https://ibpsreg.ibps.in/... or official direct link"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Website URL
              </label>
              <input
                type="url"
                name="officialWebsite"
                value={formData.officialWebsite}
                onChange={handleChange}
                placeholder="https://iocl.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OVERVIEW TABLE BUILDER */}
      {activeTab === "overview" && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Quick Highlights / Overview Table
              </h3>
              <p className="text-[11px] text-slate-500">
                Key-value rows displayed in the high-converting overview table.
              </p>
            </div>
            <button
              type="button"
              onClick={addOverviewRow}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
            >
              + Add Row
            </button>
          </div>

          <div className="space-y-2.5">
            {formData.overview.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => handleOverviewChange(idx, "label", e.target.value)}
                  placeholder="Particular (e.g. Negative Marking)"
                  className="w-1/3 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-bold"
                />
                <input
                  type="text"
                  value={row.value}
                  onChange={(e) => handleOverviewChange(idx, "value", e.target.value)}
                  placeholder="Details (e.g. 0.25 Mark deduction)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
                <button
                  type="button"
                  onClick={() => removeOverviewRow(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  title="Remove row"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STEPS & GUIDES */}
      {activeTab === "guides" && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6">
          {/* Steps to Download */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Step-by-Step Instructions
              </h4>
              <button
                type="button"
                onClick={() => addListItem("stepsToDownload")}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Add Step
              </button>
            </div>
            {formData.stepsToDownload.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleListChange("stepsToDownload", idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("stepsToDownload", idx)}
                  className="p-1.5 text-slate-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Login Credentials Required */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Login Credentials Required
              </h4>
              <button
                type="button"
                onClick={() => addListItem("loginCredentialsRequired")}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Add Credential
              </button>
            </div>
            {formData.loginCredentialsRequired.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleListChange("loginCredentialsRequired", idx, e.target.value)
                  }
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("loginCredentialsRequired", idx)}
                  className="p-1.5 text-slate-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Documents to Carry */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Documents to Carry to Exam Hall
              </h4>
              <button
                type="button"
                onClick={() => addListItem("documentsToCarry")}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Add Document
              </button>
            </div>
            {formData.documentsToCarry.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleListChange("documentsToCarry", idx, e.target.value)
                  }
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
                <button
                  type="button"
                  onClick={() => removeListItem("documentsToCarry", idx)}
                  className="p-1.5 text-slate-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BODY / CONTENT DUAL-MODE EDITOR */}
      {activeTab === "content" && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Article Body Content
              </h3>
              <p className="text-[11px] text-slate-500">
                Switch between visual text view (edit text directly on the page) and HTML code view.
              </p>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => {
                  setContentMode("visual");
                  setTimeout(() => {
                    if (visualEditorRef.current) {
                      visualEditorRef.current.innerHTML = formData.content || "";
                    }
                  }, 0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  contentMode === "visual"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📝 Visual Text View
              </button>
              <button
                type="button"
                onClick={() => setContentMode("code")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  contentMode === "code"
                    ? "bg-white text-blue-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                💻 HTML Code View
              </button>
            </div>
          </div>

          {/* VISUAL TEXT VIEW */}
          {contentMode === "visual" && (
            <div className="space-y-2">
              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => execEditorCommand("bold")}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 font-black text-slate-800 cursor-pointer"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => execEditorCommand("italic")}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 italic font-serif text-slate-800 cursor-pointer"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => execEditorCommand("underline")}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 underline text-slate-800 cursor-pointer"
                  title="Underline"
                >
                  U
                </button>
                <span className="text-slate-300 mx-1">|</span>
                <button
                  type="button"
                  onClick={() => execEditorCommand("formatBlock", "<h2>")}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-[11px] cursor-pointer"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => execEditorCommand("formatBlock", "<h3>")}
                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 font-bold text-slate-800 text-[11px] cursor-pointer"
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => execEditorCommand("formatBlock", "<p>")}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] cursor-pointer"
                  title="Paragraph"
                >
                  Paragraph
                </button>
                <span className="text-slate-300 mx-1">|</span>
                <button
                  type="button"
                  onClick={() => execEditorCommand("insertUnorderedList")}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] cursor-pointer"
                  title="Bullet List"
                >
                  • Bullet List
                </button>
                <button
                  type="button"
                  onClick={() => execEditorCommand("insertOrderedList")}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] cursor-pointer"
                  title="Numbered List"
                >
                  1. Number List
                </button>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-blue-600 font-semibold text-[11px] cursor-pointer"
                  title="Insert Link"
                >
                  🔗 Link
                </button>
                <span className="text-slate-300 mx-1">|</span>
                <button
                  type="button"
                  onClick={handleCleanCompetitors}
                  className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] cursor-pointer ml-auto"
                  title="Replace competitor names (Testbook/Adda247) with Prayaas Karo"
                >
                  🧹 Clean Brand Mentions
                </button>
              </div>

              {/* Editable Visual Canvas */}
              <div className="relative">
                <div
                  ref={visualEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      content: e.currentTarget.innerHTML,
                    }));
                  }}
                  onBlur={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      content: e.currentTarget.innerHTML,
                    }));
                  }}
                  className="article-prose min-h-[420px] max-h-[700px] overflow-y-auto p-5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-inner"
                />
                {!formData.content && (
                  <div className="pointer-events-none absolute top-5 left-5 text-slate-400 text-xs italic">
                    Type your article text here or paste rich content...
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                💡 Tip: Click anywhere to edit headings, paragraphs, or table cells directly. To edit raw tags, switch to HTML Code View.
              </p>
            </div>
          )}

          {/* CODE EDIT VIEW */}
          {contentMode === "code" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold">HTML Source Editor</span>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const formatted = formData.content
                        .replace(/></g, ">\n<")
                        .replace(/<\/p>/g, "</p>\n")
                        .replace(/<\/tr>/g, "</tr>\n")
                        .replace(/<\/h2>/g, "</h2>\n")
                        .replace(/<\/h3>/g, "</h3>\n");
                      setFormData((prev) => ({ ...prev, content: formatted }));
                    } catch (e) {}
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Format HTML Spacing
                </button>
              </div>
              <textarea
                name="content"
                rows={16}
                value={formData.content}
                onChange={(e) => {
                  handleChange(e);
                  if (visualEditorRef.current) {
                    visualEditorRef.current.innerHTML = e.target.value;
                  }
                }}
                placeholder="Write or edit raw HTML tags here..."
                className="w-full p-4 text-xs font-mono rounded-xl border border-slate-800 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 6: FAQS */}
      {activeTab === "faqs" && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Frequently Asked Questions (FAQs)
              </h3>
              <p className="text-[11px] text-slate-500">
                Rendered on the page and embedded as Google Rich Snippet FAQ Schema.
              </p>
            </div>
            <button
              type="button"
              onClick={addFaq}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
            >
              + Add FAQ
            </button>
          </div>

          <div className="space-y-4">
            {formData.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">
                    FAQ #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFaq(idx)}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Delete FAQ
                  </button>
                </div>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                  placeholder="Question: e.g. What is the exam date?"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                  placeholder="Answer: e.g. The exam will be held on 24th September 2026."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SEO & TAGS */}
      {activeTab === "seo" && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800">
              Search Engine Optimization (SEO) & Tags
            </h3>
            <p className="text-[11px] text-slate-500">
              Optimize how this article appears in Google Search, Discover, and Social Shares.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                SEO Meta Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                placeholder="e.g. IOCL Admit Card 2026 Out: Direct Download Link Active"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 font-semibold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Meta Description
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formData.metaDescription.length} characters
                </span>
              </div>
              <textarea
                name="metaDescription"
                rows={3}
                value={formData.metaDescription}
                onChange={handleChange}
                placeholder="A compelling 140-160 character summary for Google search result snippets..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Keywords & Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="IOCL Admit Card, Hall Ticket 2026, PSU Recruitment, Exam Alert"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
