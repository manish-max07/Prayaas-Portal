"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-300 group-hover:text-blue-500 transition-colors">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ClockIcon = () => (
  <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

// ─── Organization Logo Badge ───────────────────────────────────────────────────
// Maps known organizations/sectors to a styled initials badge with brand colors
// This mimics how Testbook shows exam logos next to each exam name
const ORG_LOGO_MAP = {
  // SSC
  SSC: { abbr: "SSC", bg: "#c0392b", text: "#fff" },
  // Banking
  IBPS: { abbr: "IBPS", bg: "#1a5276", text: "#fff" },
  SBI: { abbr: "SBI", bg: "#0d4f8b", text: "#fff" },
  RBI: { abbr: "RBI", bg: "#1a3a6b", text: "#fff" },
  LIC: { abbr: "LIC", bg: "#8e44ad", text: "#fff" },
  // Railways
  RRB: { abbr: "RRB", bg: "#1a6b3a", text: "#fff" },
  // PSUs / Engineering
  IOCL: { abbr: "IOCL", bg: "#e67e22", text: "#fff" },
  ONGC: { abbr: "ONGC", bg: "#2e4057", text: "#fff" },
  NTPC: { abbr: "NTPC", bg: "#16a085", text: "#fff" },
  ISRO: { abbr: "ISRO", bg: "#2c3e50", text: "#fff" },
  BARC: { abbr: "BARC", bg: "#c0392b", text: "#fff" },
  DRDO: { abbr: "DRDO", bg: "#2c3e50", text: "#fff" },
  BEL: { abbr: "BEL", bg: "#1e8449", text: "#fff" },
  BHEL: { abbr: "BHEL", bg: "#1f618d", text: "#fff" },
  HAL: { abbr: "HAL", bg: "#76448a", text: "#fff" },
  AAI: { abbr: "AAI", bg: "#2471a3", text: "#fff" },
  COAL: { abbr: "CIL", bg: "#6e2f1a", text: "#fff" },
  // Defence
  NDA: { abbr: "NDA", bg: "#1b4f72", text: "#fff" },
  CDS: { abbr: "CDS", bg: "#154360", text: "#fff" },
  CAPF: { abbr: "CAPF", bg: "#1e8449", text: "#fff" },
  // Civil Services
  UPSC: { abbr: "UPSC", bg: "#7d6608", text: "#fff" },
  // Teaching
  CTET: { abbr: "CTET", bg: "#6c3483", text: "#fff" },
  KVS: { abbr: "KVS", bg: "#145a32", text: "#fff" },
  // Default
  DEFAULT: { abbr: "GOV", bg: "#5d6d7e", text: "#fff" },
};

function getOrgLogo(article) {
  const org = (article.organization || "").toUpperCase();
  const sector = (article.sector || "").toUpperCase();
  const title = (article.title || "").toUpperCase();

  // Try to match by key in the order of priority
  for (const key of Object.keys(ORG_LOGO_MAP)) {
    if (key === "DEFAULT") continue;
    if (org.includes(key) || title.includes(key) || sector.includes(key)) {
      return ORG_LOGO_MAP[key];
    }
  }

  // Auto-generate from first letters of organization name
  if (article.organization) {
    const words = article.organization.trim().split(/\s+/);
    const abbr = words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : article.organization.slice(0, 3).toUpperCase();
    return { abbr, bg: "#2e4057", text: "#fff" };
  }

  return ORG_LOGO_MAP.DEFAULT;
}

function OrgLogoBadge({ article }) {
  const logo = getOrgLogo(article);
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-extrabold tracking-wide shadow-sm border border-white/20"
      style={{ backgroundColor: logo.bg, color: logo.text }}
    >
      {logo.abbr.length > 4 ? logo.abbr.slice(0, 4) : logo.abbr}
    </div>
  );
}

// ─── Sector config with SVG icon paths ────────────────────────────────────────
const SECTORS = [
  {
    id: "All",
    label: "All Updates",
    desc: "All govt & competitive exams",
    iconPath: "M4 6h16M4 10h16M4 14h16M4 18h16",
    color: "gray",
  },
  {
    id: "SSC",
    label: "SSC Exams",
    desc: "CGL, CHSL, MTS, GD, CPO",
    iconPath: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
    color: "red",
  },
  {
    id: "Banking & Insurance",
    label: "Banking",
    desc: "IBPS, SBI, RBI, LIC",
    iconPath: "M3 6l9-4 9 4v2H3V6zm0 0h18M6 10v8M10 10v8M14 10v8M18 10v8M3 18h18",
    color: "blue",
  },
  {
    id: "Railways",
    label: "Railways",
    desc: "NTPC, ALP, Group D",
    iconPath: "M9 3H15M8 9H16M12 3V21M8 21H16",
    color: "green",
  },
  {
    id: "Engineering & PSU",
    label: "PSU / Engg",
    desc: "IOCL, ISRO, ONGC, NTPC",
    iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    color: "orange",
  },
  {
    id: "Defence & Police",
    label: "Defence",
    desc: "Army, Navy, NDA, Police",
    iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    color: "indigo",
  },
  {
    id: "Civil Services / UPSC",
    label: "UPSC / PSC",
    desc: "IAS, IPS, State PSC",
    iconPath: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9",
    color: "yellow",
  },
  {
    id: "Teaching",
    label: "Teaching",
    desc: "CTET, KVS, DSSSB",
    iconPath: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222",
    color: "purple",
  },
  {
    id: "State Govt",
    label: "State Jobs",
    desc: "State board recruitments",
    iconPath: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    color: "teal",
  },
];

const COLOR_MAP = {
  gray: { bg: "bg-gray-100", icon: "text-gray-500", selectedBg: "bg-gray-700" },
  red: { bg: "bg-red-50", icon: "text-red-500", selectedBg: "bg-red-600" },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", selectedBg: "bg-blue-700" },
  green: { bg: "bg-green-50", icon: "text-green-600", selectedBg: "bg-green-700" },
  orange: { bg: "bg-orange-50", icon: "text-orange-500", selectedBg: "bg-orange-600" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", selectedBg: "bg-indigo-700" },
  yellow: { bg: "bg-yellow-50", icon: "text-yellow-600", selectedBg: "bg-yellow-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", selectedBg: "bg-purple-700" },
  teal: { bg: "bg-teal-50", icon: "text-teal-600", selectedBg: "bg-teal-700" },
};

// ─── Date Formatter ────────────────────────────────────────────────────────────
function formatDate(dateVal) {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Category type → color ─────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  "Admit Card": "bg-blue-50 text-blue-700 border-blue-200",
  "Exam Date": "bg-purple-50 text-purple-700 border-purple-200",
  "Answer Key": "bg-green-50 text-green-700 border-green-200",
  "Result": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Recruitment": "bg-orange-50 text-orange-700 border-orange-200",
  "Syllabus": "bg-teal-50 text-teal-700 border-teal-200",
};

// ─── Article Row Component ─────────────────────────────────────────────────────
function ArticleRow({ article }) {
  const categoryColorClass = CATEGORY_COLORS[article.category] || "bg-gray-100 text-gray-600 border-gray-200";
  const date = formatDate(article.lastUpdated || article.publishDate);

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex items-center gap-3 sm:gap-4 px-4 py-3.5 hover:bg-blue-50/50 border-b border-gray-100 last:border-b-0 transition-colors"
    >
      {/* Org Logo Badge */}
      <OrgLogoBadge article={article} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColorClass}`}>
            {article.category}
          </span>
          {article.totalVacancies && (
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {article.totalVacancies}
            </span>
          )}
          {article.examDate && (
            <span className="text-[10px] font-semibold text-gray-500">
              Exam: {article.examDate}
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <ClockIcon />
            {date}
          </span>
          {article.organization && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-[11px] text-gray-400 truncate max-w-[160px]">{article.organization}</span>
            </>
          )}
        </div>
      </div>

      {/* Right arrow */}
      <ChevronRightIcon />
    </Link>
  );
}

// ─── Sector Card Component ─────────────────────────────────────────────────────
function SectorCard({ sector, isSelected, onClick }) {
  const colors = COLOR_MAP[sector.color] || COLOR_MAP.gray;
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border text-center cursor-pointer transition-all duration-150 ${
        isSelected
          ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-200"
          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      {/* Icon circle */}
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
        isSelected ? "bg-white/20" : colors.bg
      }`}>
        <svg
          style={{ width: 20, height: 20 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className={isSelected ? "text-white" : colors.icon}
        >
          {sector.iconPath.includes("M") && sector.iconPath.split("M").length > 2 ? (
            // Multi-path icon (split by M, re-add M)
            sector.iconPath.split(" M").map((p, i) => (
              <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={(i === 0 ? "" : "M") + p} />
            ))
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={sector.iconPath} />
          )}
        </svg>
      </div>

      <div>
        <p className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-gray-800"}`}>
          {sector.label}
        </p>
        <p className={`text-[10px] mt-0.5 leading-tight ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
          {sector.desc}
        </p>
      </div>
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function NewsListClient({ articles: initialArticles = [], categories = [] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (initialArticles && initialArticles.length > 1) {
      setArticles(initialArticles);
    }
  }, [initialArticles]);

  // Fallback: fetch live articles if SSR only returned static fallback
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
      const matchCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchSector =
        selectedSector === "All" ||
        item.sector === selectedSector ||
        (!item.sector && selectedSector === "Central Govt");
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.shortTitle?.toLowerCase().includes(query) ||
        item.organization?.toLowerCase().includes(query) ||
        item.metaDescription?.toLowerCase().includes(query) ||
        item.sector?.toLowerCase().includes(query);
      return matchCategory && matchSector && matchSearch;
    });
  }, [articles, selectedCategory, selectedSector, searchQuery]);

  const hasActiveFilters = selectedCategory !== "All" || selectedSector !== "All" || Boolean(searchQuery.trim());
  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedSector("All");
    setSearchQuery("");
  };

  return (
    <div className="space-y-5">

      {/* ── SECTOR GRID (Testbook-style) ───────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Browse by Exam Sector</h2>
            <p className="text-xs text-gray-500 mt-0.5">Select your field to filter updates</p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              <FilterIcon />
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {SECTORS.map((sec) => (
            <SectorCard
              key={sec.id}
              sector={sec}
              isSelected={selectedSector === sec.id}
              onClick={() => setSelectedSector(sec.id)}
            />
          ))}
        </div>
      </section>

      {/* ── SEARCH + CATEGORY FILTER BAR ──────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 space-y-3">
        {/* Search row */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by exam, org, or keyword (e.g. IOCL, SSC CGL, Admit Card)…"
              className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <CloseIcon />
              </button>
            )}
          </div>
          <div className="shrink-0 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-lg text-center">
            <span className="text-blue-600 font-black">{filteredArticles.length}</span> update(s)
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  isActive
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ARTICLE LIST ─────────────────────────────────────────────── */}
      {filteredArticles.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Section header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              {selectedSector !== "All"
                ? `${SECTORS.find((s) => s.id === selectedSector)?.label || selectedSector} Updates`
                : selectedCategory !== "All"
                ? `${selectedCategory} Alerts`
                : "Latest Exam Updates"}
            </h3>
            <span className="text-xs text-gray-400">{filteredArticles.length} articles</span>
          </div>

          {filteredArticles.map((article) => (
            <ArticleRow key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <SearchIcon />
            </div>
          </div>
          <h3 className="text-sm font-bold text-gray-800">No updates found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Try resetting your sector or category filters to view all available alerts.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
