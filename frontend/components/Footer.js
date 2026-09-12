import React from "react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">
              Prayaas<span className="text-blue-600">Portal</span>
            </span>
            <span className="text-xs text-gray-500">
              | Online Exam Practice Portal
            </span>
          </div>

          <p className="text-xs text-gray-500 text-center sm:text-right">
            &copy; {new Date().getFullYear()} Prayaas-Portal. Designed for competitive exam practice & TCS iON simulations.
          </p>
        </div>
      </div>
    </footer>
  );
}
