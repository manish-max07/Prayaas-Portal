"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ArticleClient({ article }) {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(0); // first open by default
  const [citySearch, setCitySearch] = useState("");

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://prayaas-portal.vercel.app/news/${article.slug}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.metaDescription,
          url: pageUrl,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const overviewList = Array.isArray(article.overview)
    ? article.overview
    : Object.entries(article.overview || {}).map(([label, value]) => ({
        label,
        value,
      }));

  const filteredCities = (article.examCities || []).filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase().trim())
  );

  const hasDirectLink = Boolean(article.directAdmitCardLink || article.officialWebsite);
  const hasOverview = overviewList.length > 0;
  const hasCredentials = Boolean(article.loginCredentialsRequired?.length);
  const hasSteps = Boolean(article.stepsToDownload?.length);
  const hasDetails = Boolean(article.detailsOnAdmitCard?.length);
  const hasGuidelines = Boolean(
    article.documentsToCarry?.length || article.prohibitedItems?.length
  );
  const hasPattern = Boolean(article.examPattern?.sections?.length || article.examPattern?.duration);
  const hasCities = Boolean(article.examCities?.length);
  const hasContent = Boolean(article.content?.trim());
  const hasFaqs = Boolean(article.faqs?.length);

  return (
    <div className="space-y-10 text-slate-800">
      {/* 1. SHARE & ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2 font-semibold text-slate-700">
          <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share:</span>
          </span>

          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `${article.shortTitle || article.title} - Read here: ${pageUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span>WhatsApp</span>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(
              pageUrl
            )}&text=${encodeURIComponent(article.shortTitle || article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white font-bold hover:bg-sky-600 transition"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z" />
            </svg>
            <span>Telegram</span>
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* Native Web Share for Mobile */}
          <button
            onClick={handleNativeShare}
            className="inline-flex md:hidden items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            <span>More</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-500 font-medium text-[11px] sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{article.readingTime || "3 min read"}</span>
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verified Notice</span>
          </span>
        </div>
      </div>

      {/* 2. DIRECT ACTION / DOWNLOAD CALLOUT BANNER (if links exist) */}
      {hasDirectLink && (
        <div
          id="direct-link"
          className="rounded-2xl bg-blue-600 p-6 text-white shadow-xs"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white text-blue-900 mb-2.5">
                <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>OFFICIAL PORTAL ACTIVE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {article.shortTitle || article.title}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl leading-relaxed">
                {article.organization
                  ? `${article.organization} has activated the direct link. Check official details and access below.`
                  : "Direct official action link is active. Access the verified portal below."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              {article.directAdmitCardLink && (
                <a
                  href={article.directAdmitCardLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-blue-900 font-bold text-xs sm:text-sm transition cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>
                    {article.category === "Answer Key"
                      ? "Check Answer Key"
                      : article.category === "Result"
                      ? "Check Result"
                      : "Direct Download Link"}
                  </span>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {article.officialWebsite && (
                <a
                  href={article.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs transition border border-blue-500"
                >
                  <svg className="w-3.5 h-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span>Visit Official Website</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. TABLE OF CONTENTS */}
      <nav aria-label="Table of contents" className="bg-slate-50 rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>Table of Contents</span>
          </h3>
          <span className="text-[11px] font-semibold text-blue-600">Quick Navigation</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700">
          {hasOverview && (
            <li>
              <a href="#overview" className="hover:text-blue-600 flex items-center gap-1.5 py-1 transition">
                <span className="text-blue-600">•</span> Recruitment Overview
              </a>
            </li>
          )}
          {hasDirectLink && (
            <li>
              <a href="#direct-link" className="hover:text-blue-600 flex items-center gap-1.5 py-1 transition">
                <span className="text-blue-600">•</span> Direct Official Link
              </a>
            </li>
          )}
          {hasCredentials && (
            <li>
              <a href="#login-credentials" className="hover:text-blue-600 flex items-center gap-1.5 py-1 transition">
                <span className="text-blue-600">•</span> Login Credentials Required
              </a>
            </li>
          )}
          {hasSteps && (
            <li>
              <a href="#steps-to-download" className="hover:text-blue-600 flex items-center gap-1.5 py-1 transition">
                <span className="text-blue-600">•</span> Step-by-Step Guide
              </a>
            </li>
          )}
          {hasDetails && (
            <li>
              <a href="#details-mentioned" className="hover:text-blue-600 flex items-center gap-1.5 py-1 transition">
                <span className="text-blue-600">•</span> Details Mentioned
              </a>
            </li>
          )}
          {hasGuidelines && (
            <li>
              <a href="#exam-guidelines" className="hover:text-blue-600 flex items-center gap-1.5 py-1 transition">
                <span className="text-blue-600">•</span> Exam Day Rules &amp; Guidelines
              </a>
            </li>
          )}
          {hasPattern && (
            <li>
              <a href="#exam-pattern" className="hover:text-blue-600 flex items-center gap-1.5 py-1 transition">
                <span className="text-blue-600">•</span> Exam Pattern &amp; Marking Scheme
              </a>
            </li>
          )}
          {hasCities && (
            <li>
              <a href="#exam-centres" className="hover:text-blue-600 flex items-center gap-1.5 py-1 transition">
                <span className="text-blue-600">•</span> Examination Cities
              </a>
            </li>
          )}
          {hasContent && (
            <li>
              <a href="#article-body" className="hover:text-blue-600 flex items-center gap-1.5 py-1 transition">
                <span className="text-blue-600">•</span> Detailed Information
              </a>
            </li>
          )}
          {hasFaqs && (
            <li>
              <a href="#faqs" className="hover:text-blue-600 flex items-center gap-1.5 py-1 transition">
                <span className="text-blue-600">•</span> Frequently Asked Questions (FAQs)
              </a>
            </li>
          )}
        </ul>
      </nav>

      {/* 4. OVERVIEW TABLE SECTION */}
      {hasOverview && (
        <section id="overview" className="scroll-mt-24 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            {article.shortTitle || article.title}: Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {article.metaDescription || "Key recruitment and examination highlights are summarized below:"}
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-1/3">Particulars</th>
                  <th className="py-3 px-4 w-2/3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {overviewList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 bg-slate-50/50">
                      {item.label}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 5. CBT MOCK TEST CTA BANNER */}
      <div className="p-4 sm:p-5 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shrink-0 border border-blue-200">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              Practice CBT Tests for {article.organization || article.shortTitle || "Competitive Exams"}
            </h4>
            <p className="text-xs text-slate-600">
              Practice full-length CBT mock tests with instant percentile, negative marking simulator, and rank predictor.
            </p>
          </div>
        </div>
        <Link
          href="/#exams"
          className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
        >
          <span>Practice Mock Tests</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* 6. LOGIN CREDENTIALS SECTION */}
      {hasCredentials && (
        <section id="login-credentials" className="scroll-mt-24 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Login Credentials Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Candidates must keep their original application documents handy. The following credentials are required on the candidate login portal:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {article.loginCredentialsRequired.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 shadow-2xs">
                <span className="h-5 w-5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs text-slate-800 font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. STEPS TO DOWNLOAD */}
      {hasSteps && (
        <section id="steps-to-download" className="scroll-mt-24 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Step-by-Step Guide
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Follow these verified steps to access and download your document without errors:
          </p>

          <div className="space-y-2.5">
            {article.stepsToDownload.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
              >
                <span className="h-5 w-5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. FREEFORM ARTICLE CONTENT (MARKDOWN / BODY) */}
      {hasContent && (
        <section id="article-body" className="scroll-mt-24 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Detailed Guide &amp; Information
          </h2>
          <div
            className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed bg-white p-6 rounded-xl border border-slate-200"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </section>
      )}

      {/* 9. DETAILS MENTIONED ON ADMIT CARD */}
      {hasDetails && (
        <section id="details-mentioned" className="scroll-mt-24 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Details Mentioned on Document
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Candidates must cross-check every piece of information printed on their document immediately upon downloading:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {article.detailsOnAdmitCard.map((detail, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-800">
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 10. EXAM GUIDELINES & WHAT TO CARRY */}
      {hasGuidelines && (
        <section id="exam-guidelines" className="scroll-mt-24 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Exam Day Guidelines &amp; Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {article.documentsToCarry?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>Mandatory Documents to Carry</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {article.documentsToCarry.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {article.prohibitedItems?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    <svg className="w-3 h-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <span>Prohibited / Barred Items</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {article.prohibitedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 11. EXAM PATTERN & MARKING SCHEME */}
      {hasPattern && (
        <section id="exam-pattern" className="scroll-mt-24 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Exam Pattern &amp; Marking Scheme
          </h2>
          {article.examPattern?.duration && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Total Duration: <strong>{article.examPattern.duration}</strong> | Total Questions:{" "}
              <strong>{article.examPattern.totalQuestions}</strong> | Total Marks:{" "}
              <strong>{article.examPattern.totalMarks}</strong>
            </p>
          )}

          {article.examPattern?.sections?.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">Subject &amp; Scope</th>
                    <th className="py-3 px-4 text-center">Questions</th>
                    <th className="py-3 px-4 text-center">Marks</th>
                    <th className="py-3 px-4 text-center">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {article.examPattern.sections.map((sec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900">{sec.sectionName}</td>
                      <td className="py-3 px-4 text-slate-600">{sec.topics}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {sec.questions}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{sec.marks}</td>
                      <td className="py-3 px-4 text-center font-medium text-blue-700 bg-blue-50/30">
                        {sec.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {article.examPattern?.negativeMarking && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span><strong>Negative Marking:</strong> {article.examPattern.negativeMarking}</span>
            </div>
          )}
        </section>
      )}

      {/* 12. EXAM CITIES LIST */}
      {hasCities && (
        <section id="exam-centres" className="scroll-mt-24 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              Examination Cities
            </h2>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="Search your city..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs text-slate-700">
              {filteredCities.length > 0 ? (
                filteredCities.map((city, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium truncate">{city}</span>
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
      )}

      {/* 13. FAQ ACCORDION */}
      {hasFaqs && (
        <section id="faqs" className="scroll-mt-24 space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
            Frequently Asked Questions (FAQs)
          </h2>

          <div className="space-y-2.5">
            {article.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full py-3 px-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-blue-600 font-extrabold">Q{idx + 1}.</span>
                      <span>{faq.question}</span>
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "transform rotate-180 text-blue-600" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3.5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 14. BOTTOM CALLOUT / RANK CALCULATOR PROMOTION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-3 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 mx-auto">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
          Preparing for Competitive &amp; PSU Exams?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Prayaas Portal offers smart CBT test series, real TCS iON response sheet score calculation, and real-time rank predictions.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/rank-calculator"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <span>Calculate Response Sheet Score</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            href="/#exams"
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
          >
            Explore Exam Tests
          </Link>
        </div>
      </div>
    </div>
  );
}
