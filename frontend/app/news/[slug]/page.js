import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllNewsArticles,
  getNewsArticleBySlug,
  getRelatedNews,
} from "@/lib/newsData";
import ArticleClient from "./ArticleClient";

export const dynamicParams = true;
export const revalidate = 60;

function formatIndianDateTime(dateVal) {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
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

function toIsoStringSafe(dateVal) {
  if (!dateVal) return new Date().toISOString();
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function generateStaticParams() {
  return [{ slug: "iocl-engineer-officer-admit-card-2026" }];
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const article = await getNewsArticleBySlug(resolvedParams.slug);

  if (!article) {
    return {
      title: "Article Not Found | Prayaas Portal",
    };
  }

  const pageUrl = `https://prayaas-portal.vercel.app/news/${article.slug}`;

  return {
    title: article.seoTitle || article.title,
    description: article.metaDescription,
    keywords: article.tags || [],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.metaDescription,
      url: pageUrl,
      siteName: "Prayaas Portal",
      type: "article",
      publishedTime: toIsoStringSafe(article.publishDate),
      modifiedTime: toIsoStringSafe(article.lastUpdated || article.publishDate),
      authors: [article.author?.name || "Prayaas Karo Exam Desk"],
      tags: article.tags || [],
      images: [
        {
          url: "https://prayaas-portal.vercel.app/PrayaasKaroBgremoved.png",
          width: 800,
          height: 250,
          alt: article.shortTitle || article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle || article.title,
      description: article.metaDescription,
      images: ["https://prayaas-portal.vercel.app/PrayaasKaroBgremoved.png"],
    },
  };
}

export default async function NewsArticlePage({ params }) {
  const resolvedParams = await params;
  const article = await getNewsArticleBySlug(resolvedParams.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedNews(article.slug);
  const pageUrl = `https://prayaas-portal.vercel.app/news/${article.slug}`;

  // Structured Data (Schema.org JSON-LD)
  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.metaDescription,
    datePublished: toIsoStringSafe(article.publishDate),
    dateModified: toIsoStringSafe(article.lastUpdated || article.publishDate),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    author: {
      "@type": "Person",
      name: article.author?.name || "Prayaas Karo Exam Desk",
      jobTitle: article.author?.role || "Senior Exam Analyst",
    },
    publisher: {
      "@type": "Organization",
      name: "Prayaas Karo",
      logo: {
        "@type": "ImageObject",
        url: "https://prayaas-portal.vercel.app/PrayaasKaroBgremoved.png",
      },
    },
    image: "https://prayaas-portal.vercel.app/PrayaasKaroBgremoved.png",
  };

  const faqSchema = article.faqs && article.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://prayaas-portal.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Exam News",
        item: "https://prayaas-portal.vercel.app/news",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.category,
        item: "https://prayaas-portal.vercel.app/news",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.shortTitle,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      {/* Schema.org JSON-LD for Google Search & Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="min-h-screen bg-white pb-20">
        {/* 1. ARTICLE HERO HEADER */}
        <header className="border-b border-slate-200 bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="text-xs font-semibold text-slate-500 mb-4">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-blue-600 transition">
                    Home
                  </Link>
                </li>
                <li className="text-slate-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li>
                  <Link href="/news" className="hover:text-blue-600 transition">
                    Exam Updates
                  </Link>
                </li>
                <li className="text-slate-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li>
                  <span className="text-blue-600">{article.category}</span>
                </li>
                <li className="text-slate-400">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li className="text-slate-800 line-clamp-1 max-w-xs">{article.shortTitle}</li>
              </ol>
            </nav>

            {/* Category and Status Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {article.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {article.badge}
              </span>
              {article.advtNumber && (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Advt. No: {article.advtNumber}
                </span>
              )}
            </div>

            {/* H1 Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {article.title}
            </h1>

            {/* Author Byline and Timestamp */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                  PP
                </div>
                <div>
                  <span className="font-bold text-slate-800 block leading-tight">
                    {article.author?.name || "Prayaas Portal Exam Desk"}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {article.author?.role || "Senior Exam Analyst"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
                <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-slate-700">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium text-slate-500">Published:</span>
                  <time
                    dateTime={toIsoStringSafe(article.publishDate)}
                    itemProp="datePublished"
                    className="font-bold text-slate-900"
                  >
                    {formatIndianDateTime(article.publishDate)}
                  </time>
                </div>
                {article.lastUpdated && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md text-emerald-800 border border-emerald-200">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="font-medium text-emerald-700">Updated:</span>
                    <time
                      dateTime={toIsoStringSafe(article.lastUpdated)}
                      itemProp="dateModified"
                      className="font-bold text-emerald-900"
                    >
                      {formatIndianDateTime(article.lastUpdated)}
                    </time>
                  </div>
                )}
                {article.views > 0 && (
                  <div className="flex items-center gap-1.5 font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{article.views.toLocaleString()} reads</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 2. MAIN ARTICLE CONTENT */}
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8">
          <ArticleClient article={article} />

          {/* Tags */}
          <div className="mt-12 pt-6 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Related Search Queries
            </h4>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-10 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Other Recent Exam Updates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/news/${rel.slug}`}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition bg-slate-50/50 block"
                  >
                    <span className="text-[11px] font-bold text-blue-600 block mb-1">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {rel.shortTitle}
                    </h4>
                    <span className="text-xs text-slate-400 mt-2 block">
                      {new Date(rel.publishDate).toLocaleDateString("en-IN")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </article>
    </>
  );
}
