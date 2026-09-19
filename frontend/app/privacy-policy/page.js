"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const lastUpdated = "September 19, 2026";

  const navItems = [
    { id: "overview", label: "1. Overview & Scope" },
    { id: "info-collected", label: "2. Information We Collect" },
    { id: "how-we-use", label: "3. How We Use Information" },
    { id: "log-files", label: "4. Log Files & Diagnostics" },
    { id: "cookies-adsense", label: "5. Cookies & Google AdSense" },
    { id: "advertising-partners", label: "6. Advertising Partners" },
    { id: "dpdp-gdpr-rights", label: "7. Data Protection Rights" },
    { id: "children-privacy", label: "8. Children's Privacy" },
    { id: "data-security", label: "9. Data Security & Storage" },
    { id: "contact-info", label: "10. Grievance Officer & Contact" },
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
            <span className="text-slate-900 font-semibold">Privacy Policy</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2.5">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Legal Compliance • DPDP Act 2023 &amp; AdSense Compliant</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Last revised: <span className="font-semibold text-slate-700">{lastUpdated}</span>
              </p>
            </div>

            {/* Quick Switcher Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
              <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-blue-600 shadow-2xs">
                Privacy Policy
              </span>
              <Link
                href="/terms-conditions"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Terms of Service
              </Link>
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
                  <span>Data Inquiries</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  For data access, correction, or deletion requests, contact our team directly.
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

          {/* Policy Text Articles */}
          <main className="lg:col-span-3 space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {/* 1. Overview */}
            <section id="overview" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                1. Overview &amp; Scope
              </h2>
              <p>
                At <strong>PrayaasKaro</strong> (accessible from <Link href="https://prayaaskaro.in" className="text-blue-600 underline">https://prayaaskaro.in</Link>), accessible via web and mobile browsers, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information collected and recorded by PrayaasKaro and how we use and safeguard it.
              </p>
              <p>
                This policy applies exclusively to our online activities and is valid for visitors to our website regarding information shared and collected through PrayaasKaro. This policy does not apply to any information collected offline or via channels other than this website.
              </p>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-xs">
                <strong>Consent:</strong> By using our website, you hereby consent to our Privacy Policy and agree to its terms and conditions.
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section id="info-collected" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                2. Information We Collect
              </h2>
              <p>
                The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 mb-1">A. Account &amp; Registration Information</h3>
                  <p className="text-slate-600 text-xs">
                    When you create an account on Prayaas Portal, we may ask for your contact information, including your full name, email address, and an encrypted password hash. We never store passwords in plaintext.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 mb-1">B. Response Sheet &amp; Exam Performance Data</h3>
                  <p className="text-slate-600 text-xs">
                    When using the Answer Key Score Calculator &amp; Rank Predictor, users voluntarily provide their publicly viewable candidate response sheet URL. From this document, our automated parser extracts exam marks, correct/incorrect responses, category, exam shift, and participant roll number to calculate estimated scores and community percentiles. Raw response HTML is processed temporarily and discarded safely.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 mb-1">C. Direct Communications</h3>
                  <p className="text-slate-600 text-xs">
                    If you contact us directly at <span className="font-mono text-blue-600">contact@prayaaskaro.in</span>, we may receive additional information such as your name, email address, the contents of your message, attachments, and any other information you choose to provide.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. How We Use Information */}
            <section id="how-we-use" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                3. How We Use Your Information
              </h2>
              <p>We use the information we collect in various ways, including to:</p>
              <ul className="space-y-2 list-disc list-inside text-slate-700 pl-1">
                <li>Provide, operate, and maintain our exam testing platform and CBT simulation tools.</li>
                <li>Improve, personalize, and expand our educational articles and exam analysis features.</li>
                <li>Understand and analyze how visitors utilize our platform to optimize server performance.</li>
                <li>Compute community rank percentiles, answer key scorecards, and historical cutoff trends.</li>
                <li>Communicate with you for customer support, service updates, and security notices.</li>
                <li>Detect and prevent fraud, duplicate submissions, and automated crawler abuses.</li>
                <li>Comply with statutory legal obligations under applicable Indian and international regulations.</li>
              </ul>
            </section>

            {/* 4. Log Files */}
            <section id="log-files" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                4. Log Files &amp; Diagnostics
              </h2>
              <p>
                Prayaas Portal follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services&apos; analytics.
              </p>
              <p>
                The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and optionally the number of clicks. These are not linked to any personally identifiable information. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, and gathering demographic information.
              </p>
            </section>

            {/* 5. Cookies & Google AdSense */}
            <section id="cookies-adsense" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                5. Cookies, Web Beacons &amp; Google AdSense Compliance
              </h2>
              <p>
                Like any modern web portal, Prayaas Portal uses &ldquo;cookies&rdquo;. These cookies are used to store information including visitors&apos; preferences and the pages on the website that the visitor accessed or visited. The information is used to optimize the users&apos; experience by customizing our web page content based on visitors&apos; browser type and other information.
              </p>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-950 space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Google DoubleClick DART Cookie Disclosure</span>
                </h3>
                <p className="text-xs leading-relaxed text-amber-900">
                  Google is one of our third-party vendors. Google uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to <span className="font-semibold">prayaaskaro.in</span> and other sites on the internet.
                </p>
                <p className="text-xs leading-relaxed text-amber-900">
                  Visitors may choose to decline the use of DART cookies by visiting the Google Ad and Content Network Privacy Policy at the following URL:{" "}
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold underline text-blue-700 hover:text-blue-900"
                  >
                    https://policies.google.com/technologies/ads
                  </a>
                </p>
              </div>

              <p>
                You can choose to disable cookies through your individual browser options. Detailed information about cookie management with specific web browsers can be found at the browsers&apos; respective websites.
              </p>
            </section>

            {/* 6. Advertising Partners */}
            <section id="advertising-partners" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                6. Third-Party Advertising Partners
              </h2>
              <p>
                Some advertisers on our site may use cookies and web beacons. Our advertising partners include:
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1 text-slate-800 font-medium">
                <li><strong>Google AdSense</strong> (<a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Privacy Policy</a>)</li>
              </ul>
              <p>
                Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Prayaas Portal, which are sent directly to users&apos; browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
              </p>
              <p className="text-xs text-slate-500">
                Note that Prayaas Portal has no access to or control over these cookies that are used by third-party advertisers.
              </p>
            </section>

            {/* 7. Data Protection Rights */}
            <section id="dpdp-gdpr-rights" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                7. Data Protection Rights (DPDP Act 2023, GDPR &amp; CCPA)
              </h2>
              <p>
                We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-slate-900 mb-1">Right to Access &amp; Summary</h4>
                  <p className="text-slate-600">You have the right to request copies of your personal data and a summary of activities processed.</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-slate-900 mb-1">Right to Rectification</h4>
                  <p className="text-slate-600">You have the right to request correction of any inaccurate information or completion of incomplete records.</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-slate-900 mb-1">Right to Erasure (Right to be Forgotten)</h4>
                  <p className="text-slate-600">You have the right to request deletion of your submitted response sheet link and calculated scorecard records.</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="font-bold text-slate-900 mb-1">Right of Grievance Redressal</h4>
                  <p className="text-slate-600">Under the Digital Personal Data Protection Act, 2023, you have the right of readily accessible grievance redressal.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                If you make a request, we will respond to you within <strong>7 business days</strong>. If you would like to exercise any of these statutory rights, please contact us at <a href="mailto:contact@prayaaskaro.in" className="text-blue-600 font-bold underline">contact@prayaaskaro.in</a>.
              </p>
            </section>

            {/* 8. Children's Privacy */}
            <section id="children-privacy" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                8. Children&apos;s Information (COPPA Compliance)
              </h2>
              <p>
                Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
              </p>
              <p>
                Prayaas Portal does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately, and we will use our best efforts to promptly remove such information from our records.
              </p>
            </section>

            {/* 9. Data Security */}
            <section id="data-security" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                9. Data Security &amp; Retention
              </h2>
              <p>
                We implement robust physical, technical, and operational security safeguards to protect user data against unauthorized access, alteration, disclosure, or destruction. All communication between your device and our servers is secured with 256-bit TLS/SSL encryption.
              </p>
              <p>
                We retain user account records and performance analysis records only for as long as necessary to provide examination mock tests and rank prediction services, or as required by law.
              </p>
            </section>

            {/* 10. Grievance Officer & Contact */}
            <section id="contact-info" className="scroll-mt-24 p-6 sm:p-7 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                10. Grievance Officer &amp; Contact Information
              </h2>
              <p>
                In accordance with the Information Technology Act, 2000, and rules made thereunder, as well as the Digital Personal Data Protection Act, 2023, the contact details of the Grievance Desk are provided below:
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
                <p><strong>Platform:</strong> PrayaasKaro</p>
                <p><strong>Operational Address:</strong> New Delhi, India 110012</p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:contact@prayaaskaro.in" className="text-blue-600 font-bold underline font-mono">
                    contact@prayaaskaro.in
                  </a>
                </p>
                <p><strong>Website:</strong> <Link href="https://prayaaskaro.in" className="text-blue-600 underline">https://prayaaskaro.in</Link></p>
                <p><strong>Response Timeline:</strong> Within 7 business days</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
