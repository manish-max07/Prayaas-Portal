"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ContactUsPage() {
  const [openFaq, setOpenFaq] = useState(0); // first item open by default
  const [copied, setCopied] = useState(false);

  const supportEmail = "contact@prayaaskaro.in";

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const faqs = [
    {
      q: "How does the Prayaas Karo Answer Key & Rank Predictor work?",
      a: "When you paste your official candidate response sheet URL (e.g. from TCS iON or examination portal), our automated engine parses your responses question by question. It calculates your raw marks, applies correct positive and negative marking rules for your specific exam, and estimates your real-time community rank and percentile among participating aspirants.",
    },
    {
      q: "Are the CBT mock tests on Prayaas Karo completely free?",
      a: "Yes. All full-length Computer-Based Tests (CBTs), sectional practice papers, and answer key rank predictors on Prayaas Karo are 100% free of charge. Our mission is to provide accessible, high-quality exam practice for every aspirant across India.",
    },
    {
      q: "Is Prayaas Karo affiliated with any government recruitment body?",
      a: "No. Prayaas Karo is an independent educational platform. We are not affiliated, associated, or endorsed by any government ministry or recruiting agency (such as UPSC, SSC, RRB, IOCL, ISRO, or State PSCs). All trademarks, examination titles, and official circulars belong to their respective authorities and are used strictly for educational and identification purposes.",
    },
    {
      q: "How is the community rank and percentile calculated?",
      a: "Community Rank is dynamically computed in real-time based on all verified candidates who submit their answer keys on Prayaas Karo for that specific exam. Your percentile reflects the percentage of participating aspirants whose total score is equal to or lower than yours. As more candidates check their scores, the rank updates automatically.",
    },
    {
      q: "Is my candidate response sheet data secure and private?",
      a: "Yes, completely. Prayaas Karo never asks for your official candidate passwords, login PINs, or SMS OTPs. We only read publicly viewable response sheet links. Raw HTML is processed in temporary memory and securely discarded. We comply with India's Digital Personal Data Protection Act, 2023.",
    },
    {
      q: "What should I do if my response sheet URL shows an error or doesn't calculate?",
      a: "Ensure you are copying the full URL directly from your browser's address bar while viewing your official response sheet. If your exam has multiple shifts or newly released question keys, our team actively deploys parser updates within hours. If you continue experiencing issues, email us the response sheet link at contact@prayaaskaro.in and we will inspect it right away.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Banner */}
      <header className="border-b border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-3">
          {/* Breadcrumb */}
          <nav className="inline-flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Contact Us</span>
          </nav>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mx-auto">
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Aspirant Support &amp; Help Desk</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How can we help you?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Find answers to commonly asked questions regarding our CBT mock exams, answer key score calculation, and rank predictions. Need direct assistance? Reach out to us below.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* FAQ Section */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quick solutions to common queries about Prayaas Karo services
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-extrabold text-xs shrink-0">
                        Q{idx + 1}
                      </span>
                      <span>{item.q}</span>
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
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Us Card */}
        <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50/60 p-6 sm:p-10 shadow-xs text-center relative overflow-hidden">
          <div className="relative max-w-xl mx-auto space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md mx-auto">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Have any doubts or facing any issues?
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If you have any questions, encounter a parsing issue with your answer key, notice a discrepancy, or have suggestions to improve the platform, feel free to contact us:
            </p>

            {/* Email Contact Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Official Support &amp; Grievance Email
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-mono text-sm sm:text-base font-bold text-blue-600 hover:text-blue-800 transition underline underline-offset-4"
                >
                  {supportEmail}
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
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
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                We review every inquiry and aim to reply within <strong>24 to 48 hours</strong>.
              </div>
            </div>

            {/* Direct Mailto CTA button */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${supportEmail}?subject=Prayaas%20Karo%20Assistance%20Request`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3 px-6 shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Write to Us via Email</span>
              </a>

              <Link
                href="/rank-calculator"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm py-3 px-5 transition shadow-2xs"
              >
                <span>Open Rank Predictor</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* Location & Address footer note */}
            <div className="text-center text-[11px] text-slate-500 pt-4 border-t border-blue-200/60">
              <p><strong>Operational Address:</strong> New Delhi, India 110012</p>
              <p className="mt-0.5 text-slate-400">Prayaas Karo · Making Every Attempt Count</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
