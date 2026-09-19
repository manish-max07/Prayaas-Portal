import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Main grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <Image
                src="/logo.png"
                alt="Prayaas Portal Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain rounded-full"
              />
              <span className="text-base font-bold text-gray-900">
                Prayaas<span className="text-blue-600">Portal</span>
              </span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              India&apos;s trusted competitive exam practice platform. Real papers, real conditions — right after the official exam.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Home</Link></li>
              <li><Link href="/news" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Exam Updates</Link></li>
              <li><Link href="/rank-calculator" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Rank Calculator</Link></li>
              <li><Link href="/my-attempts" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">My Attempts</Link></li>
            </ul>
          </div>

          {/* Exams */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Exams</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-gray-600">SSC CGL / CHSL</span></li>
              <li><span className="text-sm text-gray-600">IBPS / SBI PO</span></li>
              <li><span className="text-sm text-gray-600">RRB NTPC / Group D</span></li>
              <li><span className="text-sm text-gray-600">UPSC / State PSC</span></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/terms-conditions" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/privacy-policy#cookies-adsense" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Cookie &amp; Ad Policy</Link></li>
              <li><a href="mailto:contact@prayaaskaro.in" className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium">contact@prayaaskaro.in</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>&copy; {year} Prayaas Portal. All Rights Reserved. New Delhi, India 110012.</p>
          <p className="text-gray-400">Powered by TCS iON Simulation Engine</p>
        </div>
      </div>
    </footer>
  );
}
