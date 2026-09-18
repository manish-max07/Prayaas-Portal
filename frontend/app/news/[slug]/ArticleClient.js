"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ArticleClient({ article }) {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(0); // first open by default
  const [citySearch, setCitySearch] = useState("");

  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://prayaas-portal.vercel.app/news/${article.slug}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.metaDescription,
        url: pageUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const filteredCities = article.examCities.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase().trim())
  );

  return (
    <div className="space-y-10">
      {/* 1. SHARE & ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <span>📤 Share Update:</span>
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `${article.shortTitle} - Download here: ${pageUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
          >
            <span>WhatsApp</span>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(article.shortTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500 text-white font-bold hover:bg-sky-600 transition"
          >
            <span>Telegram</span>
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
          >
            <span>{copied ? "✓ Copied!" : "🔗 Copy Link"}</span>
          </button>

          {/* Native Web Share for Mobile */}
          <button
            onClick={handleNativeShare}
            className="inline-flex md:hidden items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition cursor-pointer"
          >
            <span>More...</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <span>⏱️ {article.readingTime}</span>
          <span>•</span>
          <span>Verified Notification</span>
        </div>
      </div>

      {/* 2. DIRECT ADMIT CARD DOWNLOAD CALLOUT BANNER */}
      <div
        id="direct-link"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 text-white shadow-md"
      >
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-400 text-slate-950 mb-2">
              ✓ OFFICIAL LINK ACTIVE
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Download IOCL Admit Card 2026
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              Candidates can log in using their Registration Number and Password / Date of Birth. The link is active from 17th September to 24th September 2026.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <a
              href={article.directAdmitCardLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition transform hover:-translate-y-0.5 shadow-md cursor-pointer"
            >
              <span>📥 Download Hall Ticket</span>
              <span>↗</span>
            </a>
            <a
              href={article.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition"
            >
              <span>Visit iocl.com Portal</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. TABLE OF CONTENTS */}
      <nav aria-label="Table of contents" className="bg-slate-50/90 rounded-2xl border border-slate-200 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 pb-2.5">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>📑</span> Table of Contents
          </h3>
          <span className="text-[11px] font-semibold text-blue-600">Quick Jump Links</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700">
          <li>
            <a href="#overview" className="hover:text-blue-600 hover:underline flex items-center gap-1.5 py-1">
              <span className="text-blue-500 font-bold">1.</span> IOCL Hall Ticket 2026 Overview
            </a>
          </li>
          <li>
            <a href="#direct-link" className="hover:text-blue-600 hover:underline flex items-center gap-1.5 py-1">
              <span className="text-blue-500 font-bold">2.</span> Direct Admit Card Download Link
            </a>
          </li>
          <li>
            <a href="#login-credentials" className="hover:text-blue-600 hover:underline flex items-center gap-1.5 py-1">
              <span className="text-blue-500 font-bold">3.</span> Login Credentials Required
            </a>
          </li>
          <li>
            <a href="#steps-to-download" className="hover:text-blue-600 hover:underline flex items-center gap-1.5 py-1">
              <span className="text-blue-500 font-bold">4.</span> How to Download IOCL Admit Card
            </a>
          </li>
          <li>
            <a href="#details-mentioned" className="hover:text-blue-600 hover:underline flex items-center gap-1.5 py-1">
              <span className="text-blue-500 font-bold">5.</span> Details Mentioned on Hall Ticket
            </a>
          </li>
          <li>
            <a href="#exam-guidelines" className="hover:text-blue-600 hover:underline flex items-center gap-1.5 py-1">
              <span className="text-blue-500 font-bold">6.</span> What to Carry & Exam Day Rules
            </a>
          </li>
          <li>
            <a href="#exam-pattern" className="hover:text-blue-600 hover:underline flex items-center gap-1.5 py-1">
              <span className="text-blue-500 font-bold">7.</span> CBT Exam Pattern & Marking Scheme
            </a>
          </li>
          <li>
            <a href="#exam-centres" className="hover:text-blue-600 hover:underline flex items-center gap-1.5 py-1">
              <span className="text-blue-500 font-bold">8.</span> List of Examination Cities
            </a>
          </li>
          <li>
            <a href="#faqs" className="hover:text-blue-600 hover:underline flex items-center gap-1.5 py-1">
              <span className="text-blue-500 font-bold">9.</span> Frequently Asked Questions (FAQs)
            </a>
          </li>
        </ul>
      </nav>

      {/* 4. OVERVIEW TABLE SECTION */}
      <section id="overview" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
          IOCL Admit Card 2026: Recruitment Overview
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Indian Oil Corporation Limited (IOCL) is conducting the national-level Computer Based Test (CBT) for recruitment across 470 Executive positions including Engineers, Officers, Law Officers, and AQCOs under Advt. No. IOCL/CO-HR/RECTT/2026/01. Below are the key recruitment highlights:
        </p>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-1/3">Particulars</th>
                <th className="py-3 px-4 w-2/3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {Object.entries(article.overview).map(([key, value]) => (
                <tr key={key} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/40">{key}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. CBT MOCK TEST CTA BANNER (Internal link juice) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-indigo-950">
              Boost Your Score for IOCL 2026 CBT Exam
            </h4>
            <p className="text-xs text-indigo-800">
              Practice full-length CBT mock tests with instant percentile, negative marking simulator, and rank predictor.
            </p>
          </div>
        </div>
        <Link
          href="/#exams"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
        >
          Practice Mock Tests Now →
        </Link>
      </div>

      {/* 6. LOGIN CREDENTIALS SECTION */}
      <section id="login-credentials" className="scroll-mt-24 space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
          Login Credentials Required to Download IOCL Admit Card
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Candidates must keep their original application documents handy. The following credentials are required on the IBPS login portal to access and download the hall ticket:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {article.loginCredentialsRequired.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="h-6 w-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs text-slate-800 font-semibold">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. STEPS TO DOWNLOAD */}
      <section id="steps-to-download" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
          Step-by-Step Guide: How to Download IOCL Admit Card 2026
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Follow these simple steps to download and print your call letter without any errors:
        </p>

        <div className="space-y-2.5">
          {article.stepsToDownload.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs"
            >
              <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. DETAILS MENTIONED ON ADMIT CARD */}
      <section id="details-mentioned" className="scroll-mt-24 space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
          Details Mentioned on IOCL Hall Ticket 2026
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Candidates must cross-check every piece of information printed on their admit card immediately upon downloading. If any typographical discrepancy is noticed, inform IOCL immediately:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          {article.detailsOnAdmitCard.map((detail, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-800">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 9. EXAM GUIDELINES & WHAT TO CARRY */}
      <section id="exam-guidelines" className="scroll-mt-24 space-y-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
          IOCL Exam Day Guidelines & Documents Required
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Documents to Carry */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <span>✅</span> Mandatory Documents to Carry
            </h3>
            <ul className="space-y-2 text-xs text-emerald-900">
              {article.documentsToCarry.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prohibited Items */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <span>🚫</span> Prohibited / Barred Items
            </h3>
            <ul className="space-y-2 text-xs text-rose-900">
              {article.prohibitedItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 10. EXAM PATTERN & MARKING SCHEME */}
      <section id="exam-pattern" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
          IOCL CBT Exam Pattern & Marking Scheme 2026
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          The IOCL Online Examination consists of 100 Objective Multiple Choice Questions (MCQs) for a total of 100 marks with a total allotted time of 150 minutes (2 Hours and 30 Minutes).
        </p>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Subject & Scope</th>
                <th className="py-3 px-4 text-center">Questions</th>
                <th className="py-3 px-4 text-center">Marks</th>
                <th className="py-3 px-4 text-center">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {article.examPattern.sections.map((sec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{sec.sectionName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{sec.topics}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">{sec.questions}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">{sec.marks}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-blue-700 bg-blue-50/40">
                    {sec.duration}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100/70 font-extrabold text-slate-900">
                <td className="py-3.5 px-4">Total</td>
                <td className="py-3.5 px-4">Complete CBT Examination</td>
                <td className="py-3.5 px-4 text-center">100</td>
                <td className="py-3.5 px-4 text-center">100</td>
                <td className="py-3.5 px-4 text-center text-blue-700">150 Minutes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 font-medium">
          ⚠️ <strong>Negative Marking Note:</strong> There will be a negative marking of <strong>0.25 (1/4 mark)</strong> for each wrong response. Unanswered questions will not attract any penalty.
        </div>
      </section>

      {/* 11. EXAM CITIES LIST */}
      <section id="exam-centres" className="scroll-mt-24 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            IOCL Examination Cities 2026
          </h2>

          <input
            type="text"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Search your exam city..."
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-56"
          />
        </div>

        <p className="text-xs sm:text-sm text-slate-700">
          The exact examination center address, shift timings, and reporting guidelines are printed on your individual admit card. Below are the verified test cities:
        </p>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs text-slate-700">
            {filteredCities.length > 0 ? (
              filteredCities.map((city, idx) => (
                <div key={idx} className="p-2 bg-white rounded-lg border border-slate-100 flex items-center gap-1.5">
                  <span className="text-slate-400">📍</span>
                  <span className="font-medium">{city}</span>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-4 text-slate-400">
                No city found matching "{citySearch}"
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 12. FAQ ACCORDION */}
      <section id="faqs" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
          Frequently Asked Questions (FAQs)
        </h2>

        <div className="space-y-3">
          {article.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full py-3.5 px-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-600 font-extrabold">Q{idx + 1}.</span>
                    {faq.question}
                  </span>
                  <span className="text-slate-400 text-lg leading-none shrink-0 font-light">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 13. BOTTOM CALLOUT / RANK CALCULATOR PROMOTION */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-6 text-white text-center space-y-3 shadow-lg">
        <span className="text-2xl">⚡</span>
        <h3 className="text-lg sm:text-xl font-bold">
          Preparing for Competitive & PSU Exams?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Prayaas Portal offers smart CBT test series, real TCS iON response sheet score calculation, and real-time rank predictions.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/rank-calculator"
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-xs transition"
          >
            Calculate Response Sheet Score
          </Link>
          <Link
            href="/#exams"
            className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition"
          >
            Explore Exam Tests
          </Link>
        </div>
      </div>
    </div>
  );
}
