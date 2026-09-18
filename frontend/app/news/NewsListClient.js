"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";

const SECTORS = [
  { id: "All", label: "All Sectors", icon: "🌐", desc: "All Govt & Competitive Exams" },
  { id: "Central Govt", label: "Central Govt", icon: "🏛️", desc: "Central Ministries & UPSC" },
  { id: "SSC", label: "SSC Exams", icon: "📑", desc: "CGL, CHSL, MTS, GD, CPO" },
  { id: "Banking & Insurance", label: "Banking & Insurance", icon: "🏦", desc: "IBPS, SBI, RBI, LIC" },
  { id: "Railways", label: "Railways (RRB)", icon: "🚆", desc: "NTPC, ALP, Group D, JE" },
  { id: "Defence & Police", label: "Defence & Police", icon: "🛡️", desc: "Army, Navy, NDA, Police" },
  { id: "Teaching", label: "Teaching", icon: "🎓", desc: "CTET, KVS, DSSSB, State TET" },
  { id: "Engineering & PSU", label: "Engineering & PSUs", icon: "⚙️", desc: "GATE, IOCL, ONGC, NTPC" },
  { id: "Civil Services / UPSC", label: "Civil Services / UPSC", icon: "🇮🇳", desc: "IAS, IPS, State PSC" },
  { id: "State Govt", label: "State Govt Jobs", icon: "🏢", desc: "State Board Recruitments" },
];

const STATES = [
  { id: "All", label: "All Regions" },
  { id: "All India", label: "🇮🇳 All India / Central" },
  { id: "Delhi", label: "Delhi (DSSSB)" },
  { id: "Uttar Pradesh", label: "Uttar Pradesh (UPSSSC/UPP)" },
  { id: "Bihar", label: "Bihar (BPSC/BSSC)" },
  { id: "Rajasthan", label: "Rajasthan (RSMSSB/RPSC)" },
  { id: "Madhya Pradesh", label: "Madhya Pradesh (MPESB)" },
  { id: "Haryana", label: "Haryana (HSSC/HPSC)" },
  { id: "Maharashtra", label: "Maharashtra (MPSC)" },
  { id: "West Bengal", label: "West Bengal (WBPSC)" },
];

function formatCardDate(dateVal) {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  return (
    d
      .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase()) + " IST"
  );
}

export default function NewsListClient({ articles: initialArticles = [], categories = [] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Re-sync if SSR initialArticles updates
  useEffect(() => {
    if (initialArticles && initialArticles.length > 1) {
      setArticles(initialArticles);
    }
  }, [initialArticles]);

  // Client-side hydration safety: if SSR only returned the single static fallback article, fetch the live 21+ articles
  useEffect(() => {
    if (articles.length <= 1) {
      const fetchLiveArticles = async () => {
        try {
          const baseUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL ||
            (process.env.NODE_ENV === "production"
              ? "https://prayaas-portal.onrender.com"
              : "http://localhost:5000");
          const res = await fetch(`${baseUrl}/api/articles?limit=100`);
          if (res.ok) {
            const data = await res.json();
            if (data?.articles && Array.isArray(data.articles) && data.articles.length > 0) {
              setArticles(data.articles);
            }
          }
        } catch (err) {
          console.warn("[NewsListClient] Live articles fetch failed:", err);
        }
      };
      fetchLiveArticles();
    }
  }, [articles.length]);

  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      const matchCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const matchSector =
        selectedSector === "All" ||
        item.sector === selectedSector ||
        (!item.sector && selectedSector === "Central Govt");

      const matchState =
        selectedState === "All" ||
        item.state === selectedState ||
        (!item.state && selectedState === "All India");

      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.shortTitle?.toLowerCase().includes(query) ||
        item.organization?.toLowerCase().includes(query) ||
        item.metaDescription?.toLowerCase().includes(query) ||
        item.sector?.toLowerCase().includes(query) ||
        item.state?.toLowerCase().includes(query);

      return matchCategory && matchSector && matchState && matchSearch;
    });
  }, [articles, selectedCategory, selectedSector, selectedState, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedSector("All");
    setSelectedState("All");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedSector !== "All" ||
    selectedState !== "All" ||
    Boolean(searchQuery.trim());

  return (
    <div className="space-y-8">
      {/* 1. SECTOR BOXES SELECTION GRID */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>🎯</span> Browse Updates by Exam Sector
            </h2>
            <p className="text-xs text-slate-500">
              Select your examination field to filter notifications instantly.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 self-start sm:self-auto bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
            >
              ✕ Reset All Filters
            </button>
          )}
        </div>

        {/* Sector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SECTORS.map((sec) => {
            const isSelected = selectedSector === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSector(sec.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-md transform -translate-y-0.5"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-800"
                }`}
              >
                <div>
                  <span className="text-2xl block mb-2">{sec.icon}</span>
                  <div
                    className={`font-bold text-xs sm:text-sm line-clamp-1 ${
                      isSelected ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {sec.label}
                  </div>
                </div>
                <div
                  className={`text-[10px] mt-1.5 line-clamp-1 ${
                    isSelected ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {sec.desc}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. REGION / STATE FILTER PILLS */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>📍</span> Filter by State / Region:
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            Active: <span className="text-blue-600 font-bold">{selectedState}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {STATES.map((st) => {
            const isSelected = selectedState === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedState(st.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. SEARCH & CATEGORY BAR */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by exam, post, or board (e.g. DSSSB, SSC, HPSC, IOCL, Admit Card)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Quick Counter */}
          <div className="text-xs font-semibold text-slate-500 shrink-0 self-center bg-slate-100 px-3 py-2 rounded-xl">
            Showing <span className="text-blue-600 font-black">{filteredArticles.length}</span> update(s)
          </div>
        </div>

        {/* Category Pills (Admit Card, Result, Answer Key, etc.) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100 no-scrollbar text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. ARTICLES FEED GRID */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <article
              key={article.slug}
              className="group relative flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-blue-400 transition duration-200 overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Category, Sector & State Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                        {article.category}
                      </span>
                      {article.sector && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                          {article.sector}
                        </span>
                      )}
                      {article.state && article.state !== "All India" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          📍 {article.state}
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                      {article.badge || "🔴 Live"}
                    </span>
                  </div>

                  {/* Title Link */}
                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                    <Link href={`/news/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>

                  {/* Organization & Vacancies if available */}
                  {(article.organization || article.totalVacancies) && (
                    <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs border border-slate-100">
                      {article.organization && (
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Authority
                          </span>
                          <strong className="text-slate-800 line-clamp-1">
                            {article.organization}
                          </strong>
                        </div>
                      )}
                      {article.totalVacancies && (
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                            Vacancies
                          </span>
                          <strong className="text-slate-800">
                            {article.totalVacancies}
                          </strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Meta Description */}
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {article.metaDescription}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-600 text-[11px]">
                      🕒 {formatCardDate(article.lastUpdated || article.publishDate)}
                    </span>
                    <span>•</span>
                    <span className="text-[11px]">{article.readingTime || "4 min read"}</span>
                  </div>

                  <Link
                    href={`/news/${article.slug}`}
                    className="font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <span className="text-4xl block">🔍</span>
          <h3 className="text-base font-bold text-slate-800">
            No updates found matching your criteria
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your sector or state filters to view all available government exam alerts.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
