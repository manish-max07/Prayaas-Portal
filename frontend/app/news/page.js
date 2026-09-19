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

export const revalidate = 60;

export default async function NewsPage() {
  const articles = await getAllNewsArticles();
  const categories = getNewsCategories();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Clean white header */}
      <section className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-gray-400">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-700 font-semibold">Exam Updates</li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 mb-3">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                </span>
                Live Exam Updates 2026
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Exam News &amp; Alerts Hub
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 max-w-xl leading-relaxed">
                Verified exam schedules, admit card downloads, answer keys, and real-time recruitment alerts.
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/rank-calculator"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                Rank Calculator
              </Link>
              <Link
                href="/#exams"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Practice Mock Tests
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Client component with all filters + article list */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6">
        <NewsListClient articles={articles} categories={categories} />
      </div>
    </main>
  );
}
