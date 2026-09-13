"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <Image
            src="/logo.png"
            alt="Prayaas Portal Logo"
            width={38}
            height={38}
            className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-full transition-transform group-hover:scale-105"
            priority
          />
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors leading-none">
              Prayaas<span className="text-blue-600">Portal</span>
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-0.5 hidden xs:inline-block">
              Exam Practice Suite
            </span>
          </div>
        </Link>

        {/* Desktop Navigation items */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Home
          </Link>

          <Link
            href="/rank-calculator"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors shadow-2xs"
          >
            <span>⚡ Rank Predictor</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/my-attempts"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                My Attempts
              </Link>
              <div className="h-4 w-px bg-gray-300" />
              <span className="text-sm font-medium text-gray-900">
                {user?.name || "Student"}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Action Pill & Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/rank-calculator"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-full"
          >
            <span>⚡ Rank</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <span className="text-xl leading-none">✕</span>
            ) : (
              <span className="text-xl leading-none">☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-gray-800 hover:text-blue-600 border-b border-gray-100"
          >
            🏠 Home
          </Link>

          <Link
            href="/rank-calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-sm font-bold text-indigo-700 border-b border-gray-100"
          >
            <span>⚡ Rank & Marks Calculator</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full uppercase">New</span>
          </Link>

          {isAuthenticated ? (
            <div className="pt-2 space-y-2.5">
              <Link
                href="/my-attempts"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-gray-800 hover:text-blue-600"
              >
                📊 My Exam Attempts
              </Link>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <span>Signed in as: <strong className="text-gray-900">{user?.name || "Student"}</strong></span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-center rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center rounded-lg border border-gray-300 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center rounded-lg bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
