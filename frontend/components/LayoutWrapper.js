"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // Hide portal Navbar & Footer on:
  // 1. Live CBT test attempt pages: /exam/[examId]/attempt/[attemptId]
  // 2. Exam login gate: /exam/[examId]/login
  // 3. Exam instructions page: /exam/[examId]
  // 4. Admin console and admin secret login (which have dedicated admin navigation)
  const isExamAttempt = pathname ? /\/exam\/[^/]+\/attempt(\/|$)/.test(pathname) : false;
  const isExamLogin = pathname ? /\/exam\/[^/]+\/login(\/|$)/.test(pathname) : false;
  const isExamInstructions = pathname ? /^\/exam\/[^/]+$/.test(pathname) : false;
  const isAdmin = pathname ? pathname.startsWith("/admin") : false;
  const isAdminSecret = pathname === "/admin-secret-login";

  const hideNavbarAndFooter =
    isExamAttempt || isExamLogin || isExamInstructions || isAdmin || isAdminSecret;

  return (
    <>
      {!hideNavbarAndFooter && <Navbar />}
      <main className="flex-1 w-full">{children}</main>
      {!hideNavbarAndFooter && <Footer />}
    </>
  );
}
