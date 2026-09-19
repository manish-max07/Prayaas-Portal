import React from "react";

export default function ExamLogoBadge({ type, className = "h-9 w-9", size = 36 }) {
  switch (type) {
    case "ssc":
      return (
        <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-amber-50 to-red-50 border border-amber-200 shadow-2xs shrink-0 ${className}`}>
          <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
            {/* Circular rim */}
            <circle cx="24" cy="24" r="21" stroke="#DC2626" strokeWidth="2.5" fill="#FEF2F2" />
            <circle cx="24" cy="24" r="17" stroke="#D97706" strokeWidth="1.2" strokeDasharray="2 2" />
            {/* Center Ashoka/Star motif */}
            <polygon points="24,10 27,18 36,18 29,23 32,31 24,26 16,31 19,23 12,18 21,18" fill="#B91C1C" />
            <circle cx="24" cy="23" r="3.5" fill="#F59E0B" />
          </svg>
        </div>
      );

    case "police":
      return (
        <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-blue-50 border border-red-200 shadow-2xs shrink-0 ${className}`}>
          <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
            <path d="M24 6L11 12V23C11 31.5 16.5 39.5 24 42C31.5 39.5 37 31.5 37 23V12L24 6Z" fill="#1E3A8A" stroke="#DC2626" strokeWidth="2" />
            <circle cx="24" cy="23" r="7" fill="#FBBF24" />
            <path d="M24 18L25.5 21.5L29 22L26.5 24.5L27 28L24 26L21 28L21.5 24.5L19 22L22.5 21.5L24 18Z" fill="#991B1B" />
          </svg>
        </div>
      );

    case "emblem":
      return (
        <div className={`relative flex items-center justify-center rounded-full bg-slate-50 border border-slate-300 shadow-2xs shrink-0 ${className}`}>
          <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
            <circle cx="24" cy="24" r="21" stroke="#0F172A" strokeWidth="2" fill="#F8FAFC" />
            {/* Lion pillar stylized */}
            <path d="M19 14C19 11 24 10 24 10C24 10 29 11 29 14C29 17 27 19 27 21H21C21 19 19 17 19 14Z" fill="#0F172A" />
            <rect x="18" y="22" width="12" height="3" rx="1" fill="#334155" />
            <rect x="20" y="26" width="8" height="6" fill="#0F172A" />
            <rect x="16" y="33" width="16" height="3.5" rx="1.5" fill="#334155" />
            <circle cx="24" cy="30" r="1.5" fill="#F8FAFC" />
          </svg>
        </div>
      );

    case "railway":
      return (
        <div className={`relative flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 shadow-2xs shrink-0 ${className}`}>
          <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
            <circle cx="24" cy="24" r="21" stroke="#059669" strokeWidth="2" fill="#ECFDF5" />
            <rect x="15" y="14" width="18" height="18" rx="4" stroke="#047857" strokeWidth="2" fill="#FFFFFF" />
            <circle cx="19" cy="27" r="2" fill="#047857" />
            <circle cx="29" cy="27" r="2" fill="#047857" />
            <rect x="18" y="17" width="12" height="6" rx="1.5" fill="#A7F3D0" />
            <path d="M14 36L20 32M34 36L28 32" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case "banking":
      return (
        <div className={`relative flex items-center justify-center rounded-full bg-sky-50 border border-sky-200 shadow-2xs shrink-0 ${className}`}>
          <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
            <circle cx="24" cy="24" r="21" stroke="#0284C7" strokeWidth="2" fill="#F0F9FF" />
            <path d="M14 19L24 12L34 19H14Z" fill="#0369A1" />
            <rect x="16" y="21" width="3" height="9" rx="0.5" fill="#0284C7" />
            <rect x="22.5" y="21" width="3" height="9" rx="0.5" fill="#0284C7" />
            <rect x="29" y="21" width="3" height="9" rx="0.5" fill="#0284C7" />
            <rect x="13" y="31" width="22" height="3" rx="1" fill="#0369A1" />
          </svg>
        </div>
      );

    case "teaching":
      return (
        <div className={`relative flex items-center justify-center rounded-full bg-purple-50 border border-purple-200 shadow-2xs shrink-0 ${className}`}>
          <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
            <circle cx="24" cy="24" r="21" stroke="#7C3AED" strokeWidth="2" fill="#FAF5FF" />
            <path d="M24 13L12 19L24 25L36 19L24 13Z" fill="#6D28D9" />
            <path d="M16 22V29C16 32 20 34 24 34C28 34 32 32 32 29V22" stroke="#6D28D9" strokeWidth="2" fill="none" />
            <path d="M36 20V28" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case "defence":
      return (
        <div className={`relative flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-300 shadow-2xs shrink-0 ${className}`}>
          <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
            <circle cx="24" cy="24" r="21" stroke="#065F46" strokeWidth="2" fill="#ECFDF5" />
            <path d="M24 8L12 14V23C12 32 17 38 24 40C31 38 36 32 36 23V14L24 8Z" fill="#065F46" />
            <path d="M24 14L26 20H32L27 24L29 30L24 26L19 30L21 24L16 20H22L24 14Z" fill="#F59E0B" />
          </svg>
        </div>
      );

    case "engineering":
    default:
      return (
        <div className={`relative flex items-center justify-center rounded-full bg-indigo-50 border border-indigo-200 shadow-2xs shrink-0 ${className}`}>
          <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
            <circle cx="24" cy="24" r="21" stroke="#4F46E5" strokeWidth="2" fill="#EEF2FF" />
            <path d="M24 14V17M24 31V34M34 24H31M17 24H14M31.07 16.93L28.95 19.05M19.05 28.95L16.93 31.07M31.07 31.07L28.95 28.95M19.05 19.05L16.93 16.93" stroke="#4338CA" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="24" r="5" stroke="#4338CA" strokeWidth="2.5" fill="#C7D2FE" />
          </svg>
        </div>
      );
  }
}
