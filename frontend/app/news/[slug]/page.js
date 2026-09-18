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

export async function generateStaticParams() {
  const articles = await getAllNewsArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
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
      authors: [article.author?.name || "Prayaas Portal Exam Desk"],
      tags: article.tags || [],
      images: [
        {
          url: "https://prayaas-portal.vercel.app/logo.png",
          width: 512,
          height: 512,
          alt: article.shortTitle || article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle || article.title,
      description: article.metaDescription,
      images: ["https://prayaas-portal.vercel.app/logo.png"],
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
      name: article.author?.name || "Prayaas Portal Exam Desk",
      jobTitle: article.author?.role || "Senior Exam Analyst",
    },
    publisher: {
      "@type": "Organization",
      name: "Prayaas Portal",
      logo: {
        "@type": "ImageObject",
        url: "https://prayaas-portal.vercel.app/logo.png",
      },
    },
    image: "https://prayaas-portal.vercel.app/logo.png",
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
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-blue-600 transition">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/news" className="hover:text-blue-600 transition">
                    Exam Updates
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <span className="text-blue-600">{article.category}</span>
                </li>
                <li>/</li>
                <li className="text-slate-800 line-clamp-1 max-w-xs">{article.shortTitle}</li>
              </ol>
            </nav>

            {/* Category and Status Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {article.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {article.badge}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Advt. No: {article.advtNumber}
              </span>
            </div>

            {/* H1 Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {article.title}
            </h1>

            {/* Author Byline and Timestamp */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/80 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                  PP
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">
                    {article.author?.name || "Prayaas Portal Exam Desk"}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {article.author?.role || "Senior Exam Analyst"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Published:</span>
                  <time
                    dateTime={toIsoStringSafe(article.publishDate)}
                    itemProp="datePublished"
                    className="font-bold text-slate-800 bg-slate-100/90 px-2 py-0.5 rounded-md"
                  >
                    {formatIndianDateTime(article.publishDate)}
                  </time>
                </div>
                {article.lastUpdated && (
                  <>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Updated:</span>
                      <time
                        dateTime={toIsoStringSafe(article.lastUpdated)}
                        itemProp="dateModified"
                        className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70"
                      >
                        {formatIndianDateTime(article.lastUpdated)}
                      </time>
                    </div>
                  </>
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
