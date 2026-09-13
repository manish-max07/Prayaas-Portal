"use client";

import React from "react";
import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      {/* Header Banner */}
      <header className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_70%)]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md mb-4">
            <span>🛡️ Legal &amp; User Privacy Compliance</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Prayaas Portal Answer Key Analysis
          </h1>
          <p className="mt-2 text-base sm:text-lg font-semibold text-indigo-300">
            Terms &amp; Conditions &amp; User Data Policy (उपयोग के नियम एवं डेटा नीति)
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span>Published Date: <strong>06 अगस्त 2026</strong></span>
            <span>•</span>
            <span>Last Updated: <strong>14 सितम्बर 2026</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">DPDP Act, 2023 Compliant</span>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              href="/rank-calculator"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-bold text-white transition-all shadow-xs backdrop-blur-md"
            >
              <span>&larr;</span>
              <span>Back to Rank Predictor</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10">
        {/* Intro Alert Box */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 sm:p-6 mb-8 text-xs sm:text-sm text-indigo-950 leading-relaxed space-y-2.5 shadow-xs">
          <p className="font-semibold text-indigo-900">
            <strong>Prayaas Portal</strong> द्वारा उपलब्ध कराया गया Answer Key Score Calculator और Exam Analysis Tool एक स्वतंत्र शैक्षिक माध्यम है। Prayaas Portal का उपयोग करने से पहले कृपया इन <strong>Terms and Conditions</strong> तथा <strong>User Data Policy</strong> को ध्यानपूर्वक पढ़ें।
          </p>
          <p className="text-indigo-800">
            Prayaas Portal पर अपनी Answer Sheet Link / URL जमा करने, <strong className="text-indigo-950">&ldquo;I Agree&rdquo; (सहमति)</strong> विकल्प चुनने या Result Generate करने पर यह माना जाएगा कि आपने इन नियमों को पूरी तरह पढ़ लिया है और आप इनसे सहमत हैं।
          </p>
        </div>

        {/* Legal Sections Container */}
        <div className="space-y-6">
          {/* Section 1 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">1</span>
              <span>Prayaas Portal क्या है?</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
              Prayaas Portal एक स्वतंत्र educational और exam-analysis platform है, जिसकी सहायता से उम्मीदवार अपनी उपलब्ध Answer Sheet Link/URL का analysis कर सकते हैं।
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-2">
              Prayaas Portal निम्न प्रकार की सुविधाएँ प्रदान करता है:
            </p>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700 list-disc list-inside">
              <li>Answer Key Score Calculation</li>
              <li>Correct, Wrong और Unattempted Questions Analysis</li>
              <li>Section-wise Performance &amp; Accuracy</li>
              <li>Real-time Community Rank (AIR, Category, Shift)</li>
              <li>Total Participating Candidates Count</li>
              <li>Normalized Score Estimations</li>
              <li>Estimated Equivalent Percentile</li>
              <li>Expected Cutoff Trends</li>
              <li>Official PSU / Conducting Body Header Score Card</li>
              <li>Full Answer Review &amp; Question Paper Breakdown</li>
              <li>Permanent / Shareable Result Link</li>
            </ul>
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 font-medium">
              ⚠️ <strong>महत्वपूर्ण सूचना:</strong> Prayaas Portal किसी सरकारी विभाग, Staff Selection Commission (SSC), Railway Recruitment Board (RRB), Coal India Limited (CIL), AVNL, परीक्षा संस्था या Answer Key जारी करने वाली official agency की आधिकारिक वेबसाइट नहीं है।
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">2</span>
              <span>Official Result के संबंध में महत्वपूर्ण Disclaimer</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
              Prayaas Portal द्वारा दिखाया गया Score, Rank, Normalization, Percentile और Expected Cutoff केवल educational तथा informational purpose के लिए है।
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-disc list-inside leading-relaxed">
              <li>
                <strong>Raw Score:</strong> submitted Answer Sheet और उपलब्ध official answer key data पर आधारित होता है।
              </li>
              <li>
                <strong>Community Rank:</strong> केवल Prayaas Portal पर उस exam के लिए data submit करने वाले candidates पर आधारित होती है। यह Rank पूरे exam में शामिल सभी candidates की official rank नहीं मानी जाएगी।
              </li>
              <li>
                <strong>Expected Cutoff:</strong> एक सांख्यिकीय अनुमान है, official cutoff नहीं।
              </li>
              <li>
                किसी भी अंतर की स्थिति में examination authority द्वारा जारी Official Answer Key, Result, Score Card, Normalization, Rank और Cutoff अंतिम एवं मान्य होंगे।
              </li>
              <li>
                Prayaas Portal किसी selection, rejection, qualification, document verification या appointment की कोई कानूनी गारंटी नहीं देता।
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">3</span>
              <span>Answer Sheet जमा करने के नियम</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
              उपयोगकर्ता केवल अपनी Answer Sheet या ऐसी Answer Sheet submit करे, जिसके उपयोग की उसे विधिवत अनुमति प्राप्त हो। उपयोगकर्ता सहमत है कि वह:
            </p>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-disc list-inside leading-relaxed">
              <li>किसी दूसरे candidate की private Answer Sheet बिना अनुमति submit नहीं करेगा।</li>
              <li>किसी दूसरे व्यक्ति का नाम, Roll Number या personal data गलत तरीके से उपयोग नहीं करेगा।</li>
              <li>Prayaas Portal के parser या scoring system को manipulate करने का प्रयास नहीं करेगा।</li>
              <li>Bot, automated script, malicious request या excessive duplicate submission नहीं करेगा।</li>
              <li>ऐसी URL submit नहीं करेगा जिसमें malware, harmful code या unauthorized content हो।</li>
              <li>
                <strong>Password / OTP सुरक्षा:</strong> Prayaas Portal कभी भी candidate से official exam portal का password, login PIN या OTP साझा करने के लिए नहीं कहता। केवल publicly generated response sheet link का उपयोग किया जाता है।
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">4</span>
              <span>Prayaas Portal कौन-सा User Data प्राप्त कर सकता है?</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
              आपकी Answer Sheet और आपके द्वारा भरी गई जानकारी के आधार पर Prayaas Portal निम्न data process या store कर सकता है:
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <h3 className="text-xs font-bold text-slate-900">1. Candidate &amp; Exam Data</h3>
                <ul className="text-[11px] text-slate-600 space-y-0.5">
                  <li>• Candidate Name</li>
                  <li>• Roll No. / Participant ID</li>
                  <li>• Exam Name &amp; Subject</li>
                  <li>• Exam Date &amp; Shift</li>
                  <li>• Category, State &amp; Gender</li>
                  <li>• Section-wise Marks</li>
                  <li>• Raw Score &amp; Accuracy</li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <h3 className="text-xs font-bold text-slate-900">2. Answer Sheet Data</h3>
                <ul className="text-[11px] text-slate-600 space-y-0.5">
                  <li>• Submitted Sheet URL</li>
                  <li>• Questions &amp; Selected Responses</li>
                  <li>• Correct / Incorrect Status</li>
                  <li>• Temporary Parser Verification</li>
                  <li>• Duplicate-detection hash</li>
                  <li>• Conducting Header Image</li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                <h3 className="text-xs font-bold text-slate-900">3. Technical Data</h3>
                <ul className="text-[11px] text-slate-600 space-y-0.5">
                  <li>• IP Address (for rate limits)</li>
                  <li>• Browser &amp; Device Information</li>
                  <li>• Submission Timestamp</li>
                  <li>• Security &amp; Error logs</li>
                  <li>• Score Card Download Timestamps</li>
                  <li>• Session information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">5</span>
              <span>User Data का उपयोग क्यों किया जाता है?</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
              Prayaas Portal user data का उपयोग केवल निम्नलिखित वास्तविक उद्देश्यों के लिए करता है:
            </p>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-disc list-inside leading-relaxed">
              <li>Answer Sheet fetch और parse करके सटीक Score calculate करने के लिए।</li>
              <li>Correct/Wrong Questions Analysis और sectional performance तैयार करने के लिए।</li>
              <li>Community Rank (AIR, Category Rank, Shift Rank) तैयार करने के लिए।</li>
              <li>Score Card और Share Card (PNG) generate करने के लिए।</li>
              <li>एक ही Roll Number की duplicate submissions रोकने और database को clean रखने के लिए।</li>
              <li>High Traffic के दौरान server को सुरक्षित रखने और service reliability सुधारने के लिए।</li>
            </ul>
            <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-semibold">
              🔒 <strong>डेटा सुरक्षा प्रतिज्ञा:</strong> Prayaas Portal user data को बेचने का कोई उद्देश्य नहीं रखता और किसी भी personal data को third-party advertisers या telemarketers को नहीं बेचता।
            </div>
          </section>

          {/* Section 6 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">6</span>
              <span>Consent और Data Processing (DPDP Act, 2023)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
              User द्वारा Answer Sheet URL submit करने से पहले स्पष्ट सहमति (affirmative consent) प्राप्त की जाती है। भारत के <strong>Digital Personal Data Protection Act, 2023</strong> के अनुसार consent informed, specific, unambiguous और clear affirmative action पर आधारित है।
            </p>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs text-indigo-950 font-medium">
              ✅ <strong>अनिवार्य सहमति चेकबॉक्स:</strong> &ldquo;मैं Prayaas Portal की Terms &amp; Conditions और User Data Policy से सहमत हूँ 🤩 तथा Score और Exam Analysis तैयार करने के लिए अपनी Answer Sheet और संबंधित data को process करने की अनुमति देता/देती हूँ। 👍&rdquo;
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Consent (सहमति) न देने पर Answer Sheet analysis service उपलब्ध नहीं कराई जा सकती।
            </p>
          </section>

          {/* Section 7 & 8 */}
          <div className="grid sm:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">7</span>
                <span>Answer Sheet HTML Retention</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Answer Sheet से प्राप्त raw HTML को parsing और score calculation के दौरान temporarily process किया जाता है। स्कोर और एनालिसिस निकलने के बाद raw HTML को सुरक्षित रूप से discard किया जा सकता है। Parsed result और score record सुरक्षित रहते हैं।
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">8</span>
                <span>Original Answer Sheet Link</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                External Answer Sheet URL (TCS iON / Digialm) परीक्षा संस्था द्वारा निर्धारित समय के बाद स्वतः expire हो सकती है। Prayaas Portal यह guarantee नहीं देता कि third-party response sheet link हमेशा open रहेगी।
              </p>
            </section>
          </div>

          {/* Section 9 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">9</span>
              <span>Public Result Link और Score Card Privacy</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-2">
              Prayaas Portal उम्मीदवार के लिए एक shareable Result Link बनाता है। उम्मीदवार को समझना चाहिए कि:
            </p>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-disc list-inside leading-relaxed">
              <li>Result Link share करने पर वह link प्राप्त करने वाला व्यक्ति आपका result card देख सकता है।</li>
              <li>Score Card में candidate name, score, rank, category और exam details प्रदर्शित होती हैं।</li>
              <li>Social media या Telegram/WhatsApp पर card share करने के बाद उम्मीदवार को स्वयं उसकी गोपनीयता का ध्यान रखना चाहिए।</li>
              <li>अपने रिजल्ट को सुरक्षित रखने के लिए उम्मीदवार 4-Digit Security PIN सेट कर सकता है।</li>
            </ul>
          </section>

          {/* Section 10 & 11 */}
          <div className="grid sm:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">10</span>
                <span>High Traffic व Processing Queue</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Answer Key जारी होने के समय हजारों छात्र एक साथ स्कोर चेक करते हैं। सर्वर ओवरलोड से बचने के लिए तेज एल्गोरिदम का प्रयोग किया जाता है। किसी तकनीकी व्यवधान की स्थिति में कुछ समय बाद पुनः प्रयास करें।
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">11</span>
                <span>Dynamic Rank Updates</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                जैसे-जैसे नए उम्मीदवार अपना डेटा सबमिट करते हैं, Community Rank और Total Candidates की संख्या वास्तविक समय में बदल सकती है। नवीनतम रैंक देखने के लिए अपना रिजल्ट लिंक रिफ्रेश करें।
              </p>
            </section>
          </div>

          {/* Section 12, 13, 14 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">12</span>
                <span>Data Security</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prayaas Portal personal data को unauthorized access, alteration या misuse से बचाने के लिए standard technical encryption, HTTPS secure channels और rate limiting का उपयोग करता है।
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">13</span>
                <span>Third-Party Services</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                हम Web Hosting, CDN, Database security और Analytics के लिए स्थापित क्लाउड प्रदाताओं का उपयोग करते हैं, जो लागू डेटा सुरक्षा मानकों का पालन करते हैं।
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">14</span>
                <span>Cookies &amp; Local Preferences</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prayaas Portal user preferences (जैसे dark/light mode, exam selection, session state) और abuse prevention के लिए आवश्यक cookies का उपयोग कर सकता है।
              </p>
            </div>
          </section>

          {/* Section 15: User Rights */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">15</span>
              <span>User के Data Rights (DPDP Act, 2023)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
              Digital Personal Data Protection Act, 2023 के तहत उपयोगकर्ताओं को अपने डेटा के संबंध में निम्नलिखित अधिकार प्राप्त हैं:
            </p>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-disc list-inside leading-relaxed">
              <li><strong>Right to Access:</strong> अपने सबमिट किए गए परिणाम और डेटा की जानकारी प्राप्त करना।</li>
              <li><strong>Right to Correction:</strong> किसी अशुद्धि की स्थिति में सुधार का अनुरोध करना।</li>
              <li><strong>Right to Erasure / Deletion:</strong> अपना डेटा या पब्लिक रिजल्ट लिंक हटाने का अनुरोध करना।</li>
              <li><strong>Right of Grievance Redressal:</strong> किसी भी डेटा शिकायत के निवारण हेतु संपर्क करना।</li>
            </ul>
          </section>

          {/* Section 18: Prohibited Activities */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">18</span>
              <span>प्रतिबंधित गतिविधियाँ (Prohibited Activities)</span>
            </h2>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-disc list-inside leading-relaxed">
              <li>बिना अनुमति अन्य उम्मीदवार की गोपनीय उत्तर कुंजी जमा करना।</li>
              <li>सर्वर, API या डेटाबेस पर DoS/DDoS या अनधिकृत स्क्रिप्ट्स चलाना।</li>
              <li>रैंक या स्कोर में धोखाधड़ी से हेरफेर करने का प्रयास करना।</li>
              <li>Prayaas Portal के स्कोर कार्ड का किसी भी प्रकार का अनधिकृत या फर्जी उपयोग करना।</li>
              <li>इस शैक्षिक उपकरण को आधिकारिक सरकारी पोर्टल के रूप में प्रस्तुत करना।</li>
            </ul>
          </section>

          {/* Section 20 & 21: Liability & IP */}
          <div className="grid sm:grid-cols-2 gap-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">20</span>
                <span>Limitation of Liability</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prayaas Portal केवल एक प्रारंभिक अनुमान और विश्लेषण प्रदान करता है। उम्मीदवार को परीक्षा, कटऑफ या भर्ती से जुड़े सभी महत्वपूर्ण निर्णय आधिकारिक अधिसूचना और परीक्षा बोर्ड के परिणाम के आधार पर ही लेने चाहिए।
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">21</span>
                <span>Intellectual Property</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prayaas Portal का सॉफ्टवेयर, स्कोरकार्ड लेआउट और डिजाइन Prayaas Portal की बौद्धिक संपदा हैं। परीक्षा प्रश्न और लोगो संबंधित परीक्षा प्राधिकरणों के स्वामित्व में रहते हैं।
              </p>
            </section>
          </div>

          {/* Section 23 & 24: Jurisdiction & Grievance */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">24</span>
              <span>Contact &amp; Grievance Redressal (संपर्क एवं सहायता)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
              Terms &amp; Conditions, Data Privacy या Deletion Request से संबंधित किसी भी सहायता अथवा शिकायत के लिए आप संपर्क कर सकते हैं:
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-1.5 text-slate-700">
              <p><strong>Service:</strong> Prayaas Portal Answer Key Score Calculator</p>
              <p><strong>Platform:</strong> Prayaas Education Portal</p>
              <p><strong>Website:</strong> <Link href="/" className="text-blue-600 underline">prayaas-portal.in</Link></p>
              <p><strong>Grievance Email:</strong> <span className="font-mono text-indigo-700 font-semibold">support@prayaas.org.in</span></p>
              <p><strong>Response Timeline:</strong> Within 7 working days (Digital Personal Data Protection Act compliance)</p>
            </div>
          </section>

          {/* Section 25: User Acceptance */}
          <section className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-2 mb-2">
              <span className="text-emerald-600 text-xl">✅</span>
              <span>25. User Acceptance (उपयोगकर्ता स्वीकृति)</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed mb-3">
              Prayaas Portal Answer Key Analyzer का उपयोग करके, उपयोगकर्ता पुष्टि करता है कि:
            </p>
            <ul className="space-y-1.5 text-xs sm:text-sm text-emerald-900 list-disc list-inside leading-relaxed mb-4">
              <li>उसने इन Terms and Conditions को पूरा पढ़ लिया है।</li>
              <li>उसने User Data Policy को समझ लिया है।</li>
              <li>वह अपनी Answer Sheet submit करने के लिए अधिकृत है।</li>
              <li>वह Score, Rank और Expected Cutoff की सामुदायिक/अनुमानित प्रकृति को समझता है।</li>
              <li>वह स्कोर और रैंक गणना के लिए डेटा प्रोसेसिंग हेतु अपनी स्पष्ट सहमति देता है।</li>
              <li>वह परीक्षा संस्था द्वारा जारी आधिकारिक परिणाम को ही अंतिम और मान्य मानेगा।</li>
            </ul>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-white/80 rounded-xl p-3 border border-emerald-300">
              <span>🌟</span>
              <span>&ldquo;मैं Prayaas Portal की Terms &amp; Conditions और User Data Policy से सहमत हूँ।&rdquo; 🤩</span>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <Link
            href="/rank-calculator"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm py-3 px-6 shadow-md transition-all cursor-pointer"
          >
            <span>&larr;</span>
            <span>Return to Rank Predictor &amp; Calculate Score</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
