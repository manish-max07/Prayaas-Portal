"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import Image from "next/image";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="Prayaas Portal Logo"
            width={44}
            height={44}
            className="h-10 w-10 object-contain rounded-full transition-transform group-hover:scale-105"
            priority
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
              Prayaas<span className="text-blue-600">Portal</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium -mt-1">
              Exam Practice Suite
            </span>
          </div>
        </Link>

        {/* Navigation items (Strictly NO admin links) */}
        <nav className="flex items-center gap-4 sm:gap-6">
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
              <div className="h-4 w-px bg-gray-300 hidden sm:block" />
              <span className="hidden sm:inline-block text-sm font-medium text-gray-900">
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
      </div>
    </header>
  );
}
