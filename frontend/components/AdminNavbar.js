"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminNavbar() {
  const { admin, logoutAdmin } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutAdmin();
    setMobileMenuOpen(false);
    router.push("/admin-secret-login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-900 text-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Admin Brand */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Prayaas Portal"
            width={30}
            height={30}
            className="h-7 w-7 sm:h-8 sm:w-8 object-contain rounded-full"
          />
          <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded bg-gray-800 text-gray-300 font-mono font-bold text-[9px] sm:text-[10px] border border-gray-700">
            ADM
          </div>
          <div>
            <Link
              href="/admin/dashboard"
              className="text-xs sm:text-sm font-bold tracking-wider text-gray-100 uppercase hover:text-white"
            >
              Prayaas <span className="text-gray-400 font-normal">| Admin</span>
            </Link>
          </div>
        </div>

        {/* Desktop Admin Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs">
          <Link
            href="/admin/dashboard"
            className="font-medium text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/rank-predictor"
            className="font-medium text-indigo-300 hover:text-white transition-colors flex items-center gap-1 bg-gray-800/80 px-2.5 py-1 rounded-md border border-gray-700"
          >
            <span>⚡</span>
            <span>Rank Predictor</span>
          </Link>
          <Link
            href="/admin/exams/new"
            className="font-medium text-gray-300 hover:text-white transition-colors"
          >
            + New Exam
          </Link>
          <Link
            href="/admin/change-password"
            className="font-medium text-gray-300 hover:text-white transition-colors"
          >
            Security / Password
          </Link>

          <div className="h-4 w-px bg-gray-700" />

          <div className="flex items-center gap-3">
            <span className="font-mono text-gray-400 text-[11px]">
              [{admin?.username || "Admin"}]
            </span>
            <button
              onClick={handleLogout}
              className="rounded bg-gray-800 px-2.5 py-1 text-[11px] font-semibold text-gray-300 hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
            >
              Exit Console
            </button>
          </div>
        </nav>

        {/* Mobile Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none"
            aria-label="Toggle Admin Menu"
          >
            {mobileMenuOpen ? (
              <span className="text-lg leading-none">✕</span>
            ) : (
              <span className="text-lg leading-none">☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Admin Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 pt-3 pb-5 space-y-2.5 text-xs">
          <Link
            href="/admin/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-gray-300 hover:text-white font-medium"
          >
            📊 Admin Dashboard
          </Link>
          <Link
            href="/admin/rank-predictor"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-indigo-300 hover:text-white font-bold"
          >
            ⚡ Rank Predictor & Leaderboards
          </Link>
          <Link
            href="/admin/exams/new"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-gray-300 hover:text-white font-medium"
          >
            ➕ Create New Exam
          </Link>
          <Link
            href="/admin/change-password"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-gray-300 hover:text-white font-medium"
          >
            🔒 Security & Password
          </Link>

          <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
            <span className="font-mono text-gray-400 text-[11px]">
              [{admin?.username || "Admin"}]
            </span>
            <button
              onClick={handleLogout}
              className="rounded bg-red-900/80 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800 transition-colors"
            >
              Exit Console
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
