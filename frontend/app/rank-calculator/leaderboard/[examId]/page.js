"use client";

import React, { useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function CandidateRestrictedLeaderboardPage({ params }) {
  const unwrappedParams = use(params);
  const { examId } = unwrappedParams;
  const router = useRouter();

  useEffect(() => {
    // If admin is logged in, redirect them to admin rank predictor leaderboard
    const adminToken = Cookies.get("prayaas_admin_token");
    if (adminToken) {
      router.replace(`/admin/rank-predictor/leaderboard/${examId}`);
    }
  }, [examId, router]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-slate-50/70">
      <div className="mx-auto max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-600 border border-amber-200 mb-4">
          🔒
        </div>

        <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          Global Leaderboard Restricted
        </h1>

        <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
          The centralized All-India candidate leaderboard and applicant database are confidential and restricted strictly to the <strong>Administrator Console</strong>.
        </p>

        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Candidates can evaluate their individual response sheet to view personal scores, sectional accuracy, and calculated All-India and Category ranks directly on their private scorecard.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/rank-calculator"
            className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            Check My Scorecard
          </Link>

          <Link
            href={`/admin/rank-predictor/leaderboard/${examId}`}
            className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Admin Sign-in
          </Link>
        </div>
      </div>
    </div>
  );
}
