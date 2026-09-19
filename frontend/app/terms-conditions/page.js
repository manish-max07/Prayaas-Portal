"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function TermsConditionsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  const lastUpdated = "September 19, 2026";

  const navItems = [
    { id: "acceptance", label: "1. Acceptance of Terms" },
    { id: "platform-services", label: "2. Platform & Services" },
    { id: "non-affiliation", label: "3. Non-Affiliation Disclaimer" },
    { id: "user-accounts", label: "4. User Accounts & Security" },
    { id: "user-conduct", label: "5. User Conduct & Guidelines" },
    { id: "rank-calculator", label: "6. Answer Key & Rank Calculator" },
    { id: "intellectual-property", label: "7. Intellectual Property" },
    { id: "third-party-ads", label: "8. Third-Party Ads & Links" },
    { id: "limitation-liability", label: "9. Limitation of Liability" },
    { id: "governing-law", label: "10. Governing Law & Jurisdiction" },
    { id: "contact-info", label: "11. Contact & Notices" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header Banner */}
      <header className="border-b border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4 font-medium">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Terms &amp; Conditions</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2.5">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Legal Agreement • Terms of Service</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Terms &amp; Conditions
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Last revised: <span className="font-semibold text-slate-700">{lastUpdated}</span>
              </p>
            </div>

            {/* Quick Switcher Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
              <Link
                href="/privacy-policy"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Privacy Policy
              </Link>
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-blue-600 shadow-2xs">
                Terms of Service
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sticky Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Contents
                </h3>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setActiveSection(item.id)}
                      className={`block py-1.5 px-2.5 rounded-lg text-xs transition font-medium ${
                        activeSection === item.id
                          ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Direct Support Card */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-xs space-y-2">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Need Help?</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Have questions regarding these Terms or our services? Get in touch with our team.
                </p>
                <a
                  href="mailto:contact@prayaaskaro.in"
                  className="inline-block text-blue-600 hover:text-blue-800 font-bold break-all transition underline"
                >
                  contact@prayaaskaro.in
                </a>
              </div>
            </div>
          </aside>

          {/* Policy Articles */}
          <main className="lg:col-span-3 space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {/* 1. Acceptance */}
            <section id="acceptance" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                1. Acceptance of Terms
              </h2>
              <p>
                These Terms and Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Candidate&rdquo;, or &ldquo;You&rdquo;) and <strong>Prayaas Portal</strong> (accessible at <Link href="/" className="text-blue-600 underline">https://prayaas-portal.vercel.app</Link> and <Link href="https://prayaaskaro.in" className="text-blue-600 underline">https://prayaaskaro.in</Link>).
              </p>
              <p>
                By accessing, browsing, registering on, or using any feature of Prayaas Portal, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <Link href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</Link>. If you do not agree to these Terms, please do not use our services.
              </p>
            </section>

            {/* 2. Platform & Services */}
            <section id="platform-services" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                2. Platform &amp; Services
              </h2>
              <p>
                Prayaas Portal is an independent educational technology and exam-preparation platform designed to assist candidates preparing for competitive, central government, state government, banking, engineering, and PSU recruitment examinations across India.
              </p>
              <p className="font-semibold text-slate-800">Our services include, but are not limited to:</p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700 pl-1">
                <li>Timed Computer-Based Test (CBT) mock exam series with realistic TCS iON interface simulation.</li>
                <li>Candidate response sheet parsing and automated answer key score calculation.</li>
                <li>Community-wide real-time rank predictions, percentile estimation, and sectional analysis.</li>
                <li>Verified exam recruitment notices, admit card download guides, syllabus, and examination updates.</li>
              </ul>
            </section>

            {/* 3. Non-Affiliation Disclaimer */}
            <section id="non-affiliation" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-amber-300 bg-amber-50/50 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-200 text-amber-900">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <h2 className="text-base sm:text-lg font-bold text-amber-950">
                  3. Official Government Non-Affiliation Disclaimer
                </h2>
              </div>
              <p className="text-amber-900 leading-relaxed">
                <strong>Prayaas Portal is an independent preparation and educational platform.</strong> We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with any government body, ministry, or recruiting agency, including but not limited to the Union Public Service Commission (UPSC), Staff Selection Commission (SSC), Railway Recruitment Boards (RRB), Institute of Banking Personnel Selection (IBPS), Indian Oil Corporation Limited (IOCL), Indian Space Research Organisation (ISRO), or any state public service commissions.
              </p>
              <p className="text-amber-900 leading-relaxed">
                All official recruitment names, exam titles, logos, and trademarks displayed on this portal remain the intellectual property of their respective official conducting authorities and are used strictly for informational, identification, and fair-use educational guidance only.
              </p>
            </section>

            {/* 4. User Accounts & Security */}
            <section id="user-accounts" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                4. User Accounts &amp; Security
              </h2>
              <p>
                To access certain features such as timed test series, score history, and personalized rank reports, you may be required to register for an account. You agree to:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700 pl-1">
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain the confidentiality of your password and account credentials.</li>
                <li>Notify us immediately at <span className="font-mono text-blue-600">contact@prayaaskaro.in</span> of any unauthorized use or security breach.</li>
                <li>Take full responsibility for all activities that occur under your account.</li>
              </ul>
            </section>

            {/* 5. User Conduct */}
            <section id="user-conduct" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                5. User Conduct &amp; Prohibited Uses
              </h2>
              <p>While using Prayaas Portal, you agree that you will not:</p>
              <ul className="space-y-2 list-disc list-inside text-slate-700 pl-1">
                <li>Submit fraudulent, forged, or unauthorized third-party candidate response sheet links.</li>
                <li>Use automated scripts, bots, spiders, or scrapers to overwhelm, exploit, or disrupt our servers and APIs.</li>
                <li>Attempt to bypass authentication, reverse-engineer proprietary algorithms, or manipulate community rank metrics.</li>
                <li>Transmit any viruses, worms, malware, or destructive code.</li>
                <li>Misrepresent Prayaas Portal as an official government agency or recruitment board.</li>
              </ul>
            </section>

            {/* 6. Answer Key & Rank Calculator */}
            <section id="rank-calculator" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                6. Answer Key Analysis &amp; Rank Predictor Terms
              </h2>
              <p>
                The scores, community ranks, normalization estimates, and cutoff projections generated by Prayaas Portal are <strong>statistical estimates for educational purposes only</strong>.
              </p>
              <ul className="space-y-2 list-disc list-inside text-slate-700 pl-1">
                <li>
                  <strong>Community Rank:</strong> Ranks are computed exclusively among participating candidates who voluntarily submit their response sheets on Prayaas Portal. They do not represent the final all-India rank of the official conducting authority.
                </li>
                <li>
                  <strong>Official Finality:</strong> In the event of any discrepancy, the official answer keys, scorecards, normalizations, and merit lists published on the respective official examination portals are final, definitive, and legally binding.
                </li>
                <li>
                  <strong>Zero Password Sharing:</strong> Prayaas Portal never asks candidates for their official exam passwords, login PINs, or SMS OTPs. Only public response sheet URLs are parsed.
                </li>
              </ul>
            </section>

            {/* 7. Intellectual Property */}
            <section id="intellectual-property" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                7. Intellectual Property Rights
              </h2>
              <p>
                The platform design, scoring algorithms, test engine software, layout, graphics, text articles, and branding of Prayaas Portal are the intellectual property of Prayaas Portal and are protected by Indian copyright and intellectual property laws.
              </p>
              <p>
                You may access, view, and print score reports and mock test results solely for your own personal, non-commercial educational use. Commercial reproduction, scraping, or redistribution without express written consent is strictly prohibited.
              </p>
            </section>

            {/* 8. Third-Party Ads & Links */}
            <section id="third-party-ads" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                8. Third-Party Advertisements &amp; External Links
              </h2>
              <p>
                Prayaas Portal may display advertisements provided by third-party ad networks, including <strong>Google AdSense</strong>, and may contain links to third-party websites (such as official exam conducting boards, PDF circulars, and educational resources).
              </p>
              <p>
                We do not endorse, guarantee, or assume responsibility for the accuracy or practices of any third-party advertisements or external websites. We encourage you to review the terms and privacy practices of any third-party website you visit.
              </p>
            </section>

            {/* 9. Limitation of Liability */}
            <section id="limitation-liability" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                9. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by applicable law, Prayaas Portal, its founders, operators, and contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or preparation time, resulting from:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700 pl-1">
                <li>Your access to, use of, or inability to access our services.</li>
                <li>Any temporary downtime, server delays, or network latency during peak result release hours.</li>
                <li>Any reliance placed on estimated score metrics, percentiles, or expected cutoffs.</li>
                <li>Any third-party examination body decisions regarding official selection, qualification, or document verification.</li>
              </ul>
            </section>

            {/* 10. Governing Law */}
            <section id="governing-law" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                10. Governing Law &amp; Jurisdiction
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Republic of India, including the Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023. Any legal disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in <strong>New Delhi, India</strong>.
              </p>
            </section>

            {/* 11. Contact & Notices */}
            <section id="contact-info" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                11. Contact &amp; Legal Notices
              </h2>
              <p>
                If you have any questions, concerns, or legal notices regarding these Terms &amp; Conditions, please contact us at:
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
                <p><strong>Platform:</strong> Prayaas Portal</p>
                <p><strong>Operational Address:</strong> New Delhi, India 110012</p>
                <p>
                  <strong>Official Email:</strong>{" "}
                  <a href="mailto:contact@prayaaskaro.in" className="text-blue-600 font-bold underline font-mono">
                    contact@prayaaskaro.in
                  </a>
                </p>
                <p><strong>Website:</strong> <Link href="/" className="text-blue-600 underline">https://prayaas-portal.vercel.app</Link> | <Link href="https://prayaaskaro.in" className="text-blue-600 underline">https://prayaaskaro.in</Link></p>
                <p><strong>Response Timeline:</strong> Within 7 business days</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
