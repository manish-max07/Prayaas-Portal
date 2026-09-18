import React from "react";
import Link from "next/link";
import NewsListClient from "./NewsListClient";
import { getAllNewsArticles, getNewsCategories } from "@/lib/newsData";

export const metadata = {
  title: "Exam News, Admit Cards & Govt Job Notifications 2026",
  description:
    "Get instant official updates on latest competitive exams, admit card release dates, answer key downloads, scorecards, and government job recruitments 2026.",
  alternates: {
    canonical: "https://prayaas-portal.vercel.app/news",
  },
  openGraph: {
    title: "Exam News & Admit Card Updates | Prayaas Portal",
    description:
      "Latest government exam notifications, hall tickets, exam dates, answer keys, and syllabus.",
    url: "https://prayaas-portal.vercel.app/news",
    siteName: "Prayaas Portal",
    type: "website",
  },
};

export default function NewsPage() {
  const articles = getAllNewsArticles();
  const categories = getNewsCategories();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/60 pb-20">
      {/* 1. Header & Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-inner">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute top-10 right-10 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4 text-xs font-medium text-slate-400">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-blue-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-white font-semibold">Exam News & Alerts</li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 mb-3 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Live Exam Updates 2026
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Exam News & Admit Cards Hub
              </h1>
              <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Stay updated with verified exam schedules, direct admit card download links, answer key releases, and real-time alerts for top government and competitive examinations.
              </p>
            </div>

            {/* Quick Links Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-xs text-xs space-y-2.5 shrink-0">
              <span className="text-slate-200 font-bold uppercase tracking-wider block">
                ⚡ Quick Actions
              </span>
              <Link
                href="/rank-calculator"
                className="flex items-center justify-between p-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-white font-semibold"
              >
                <span>Calculate Exam Rank</span>
                <span>→</span>
              </Link>
              <Link
                href="/#exams"
                className="flex items-center justify-between p-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 transition text-white font-semibold"
              >
                <span>Practice CBT Mock Tests</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Client-Side Searchable List & Category Filter */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-6">
        <NewsListClient articles={articles} categories={categories} />
      </div>
    </main>
  );
}
