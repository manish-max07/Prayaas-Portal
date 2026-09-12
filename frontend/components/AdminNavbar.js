"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminNavbar() {
  const { admin, logoutAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutAdmin();
    router.push("/admin-secret-login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-gray-900 text-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Admin Brand */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Prayaas Portal"
            width={32}
            height={32}
            className="h-8 w-8 object-contain rounded-full"
          />
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-800 text-gray-300 font-mono font-bold text-[10px] border border-gray-700">
            ADM
          </div>
          <div>
            <Link
              href="/admin/dashboard"
              className="text-sm font-bold tracking-wider text-gray-100 uppercase hover:text-white"
            >
              Prayaas Portal <span className="text-gray-400 font-normal">| Admin Console</span>
            </Link>
          </div>
        </div>

        {/* Admin Navigation */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs">
          <Link
            href="/admin/dashboard"
            className="font-medium text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
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
      </div>
    </header>
  );
}
