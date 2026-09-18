import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
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
            <span className="text-xs text-gray-500">
              | Online Exam Practice Portal
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-600">
            <a href="/" className="hover:text-blue-600 transition">Home</a>
            <span>•</span>
            <a href="/news" className="hover:text-blue-600 transition text-blue-600 font-bold">Exam Updates 2026</a>
            <span>•</span>
            <a href="/news/iocl-engineer-officer-admit-card-2026" className="hover:text-blue-600 transition">IOCL Admit Card 2026</a>
            <span>•</span>
            <a href="/rank-calculator" className="hover:text-blue-600 transition">Rank Calculator</a>
            <span>•</span>
            <a href="/rank-calculator/terms-conditions" className="hover:text-blue-600 transition">Terms & Privacy</a>
          </div>

          <p className="text-xs text-gray-500 text-center sm:text-right">
            &copy; {new Date().getFullYear()} Prayaas-Portal. Official Examination Suite & Competitive Alerts.
          </p>
        </div>
      </div>
    </footer>
  );
}
