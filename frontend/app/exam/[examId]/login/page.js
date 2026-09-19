"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const DEMO_USER = "demo";
const DEMO_PASS = "demo";

export default function ExamLoginGate({ params }) {
  const unwrappedParams = use(params);
  const examId = unwrappedParams.examId;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [exam, setExam] = useState(null);
  const [candidateId, setCandidateId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/exam/${examId}/login`);
    }
  }, [authLoading, isAuthenticated, examId, router]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/api/exams/${examId}`);
        if (res.data?.examPaper) setExam(res.data.examPaper);
      } catch (e) {}
    };
    if (isAuthenticated) fetchExam();
  }, [examId, isAuthenticated]);

  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }, []);

  const handleSignIn = (e) => {
    e.preventDefault();
    setError("");
    if (!candidateId.trim() || !password.trim()) {
      setError("Please enter both Candidate ID and Password.");
      return;
    }
    if (
      candidateId.trim().toLowerCase() !== DEMO_USER ||
      password.trim().toLowerCase() !== DEMO_PASS
    ) {
      setError("Invalid credentials. Use: demo / demo");
      return;
    }
    setSigningIn(true);
    setTimeout(() => router.push(`/exam/${examId}`), 1200);
  };

  const rollNumber = user?.id
    ? "C" + user.id.slice(-3).toUpperCase().padStart(3, "0")
    : "C001";
  const candidateName = user?.name || "John Smith";
  const subjectLabel = exam?.title
    ? exam.title.length > 30 ? exam.title.slice(0, 30) + "..." : exam.title
    : "Mock Exam";

  if (authLoading || (!isAuthenticated && !authLoading)) return null;

  return (
    <div style={s.page}>
      {/* TOP HEADER - matches TCS iON exactly */}
      <div style={s.topBar}>
        <div style={s.topLeft}>
          <div style={s.systemLabel}>System Name :</div>
          <div style={s.systemValue}>{rollNumber}</div>
          <div style={s.disclaimer}>
            Kindly contact the invigilator if there are any discrepancies in the
            Name and Photograph displayed on the screen or if the photograph is
            not yours
          </div>
        </div>
        <div style={s.topRight}>
          <div style={s.candidateInfo}>
            <div style={s.candidateLabel}>Candidate Name :</div>
            <div style={s.candidateValue}>{candidateName}</div>
            <div style={s.subjectRow}>
              <span style={s.subjectLabelTxt}>Subject :</span>
              <span style={s.subjectValue}>&nbsp;{subjectLabel}</span>
            </div>
          </div>
          <div style={s.photoBox}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#b0b8c8" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#b0b8c8" strokeWidth="2" fill="none" />
              <circle cx="12" cy="12" r="11" stroke="#8a94a6" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={s.body}>
        <div style={s.card}>
          <div style={s.cardTitle}>Login</div>
          <form onSubmit={handleSignIn} style={s.form}>
            {/* Candidate ID */}
            <div style={s.inputRow}>
              <div style={s.iconBox}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#555" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#555" />
                </svg>
              </div>
              <input
                type="text"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                placeholder="Candidate ID"
                style={s.input}
                autoComplete="off"
                autoFocus
              />
              <div style={s.kbdIcon}>
                <svg width="18" height="12" viewBox="0 0 30 20" fill="none">
                  <rect width="30" height="20" rx="3" fill="#888" />
                  <rect x="2" y="4" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="8" y="4" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="14" y="4" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="20" y="4" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="2" y="11" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="8" y="11" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="14" y="11" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="20" y="11" width="4" height="4" rx="1" fill="#eee" />
                </svg>
              </div>
            </div>

            {/* Password */}
            <div style={s.inputRow}>
              <div style={s.iconBox}>
                <svg width="20" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="10" rx="2" fill="#555" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#555" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={s.input}
              />
              <div style={s.kbdIcon}>
                <svg width="18" height="12" viewBox="0 0 30 20" fill="none">
                  <rect width="30" height="20" rx="3" fill="#888" />
                  <rect x="2" y="4" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="8" y="4" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="14" y="4" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="20" y="4" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="2" y="11" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="8" y="11" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="14" y="11" width="4" height="4" rx="1" fill="#eee" />
                  <rect x="20" y="11" width="4" height="4" rx="1" fill="#eee" />
                </svg>
              </div>
            </div>

            {error && <div style={s.error}>{error}</div>}

            <div style={s.hint}>
              Use &nbsp;<strong>demo</strong>&nbsp;/&nbsp;<strong>demo</strong>
            </div>

            <button
              type="submit"
              disabled={signingIn}
              style={{ ...s.signInBtn, opacity: signingIn ? 0.75 : 1, cursor: signingIn ? "not-allowed" : "pointer" }}
            >
              {signingIn ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <div style={s.footer}>Version 1/ 05.21</div>
    </div>
  );
}

const s = {
  page: { fontFamily: "Arial, sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", background: "#e4e4e4", margin: 0, padding: 0 },
  topBar: { background: "#5a5a5a", display: "flex", justifyContent: "space-between", alignItems: "stretch", borderBottom: "3px solid #f0a500", minHeight: "84px" },
  topLeft: { padding: "10px 18px", display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 },
  systemLabel: { color: "#d4d4d4", fontSize: "12px", marginBottom: "2px" },
  systemValue: { color: "#f0c000", fontSize: "28px", fontWeight: "bold", lineHeight: 1.1, marginBottom: "5px" },
  disclaimer: { color: "#cccccc", fontSize: "11px", maxWidth: "520px", lineHeight: 1.45 },
  topRight: { display: "flex", alignItems: "stretch" },
  candidateInfo: { padding: "10px 16px", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "right" },
  candidateLabel: { color: "#d4d4d4", fontSize: "12px", marginBottom: "2px" },
  candidateValue: { color: "#f0c000", fontSize: "20px", fontWeight: "bold" },
  subjectRow: { marginTop: "4px", fontSize: "12px" },
  subjectLabelTxt: { color: "#cccccc" },
  subjectValue: { color: "#f0c000", fontWeight: 600, fontSize: "11px" },
  photoBox: { width: "90px", background: "#d0d4dc", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "2px solid #888", flexShrink: 0 },
  body: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", background: "#e4e4e4" },
  card: { background: "#ececec", border: "1px solid #c0c0c0", borderRadius: "3px", width: "100%", maxWidth: "275px", padding: "18px 20px 24px 20px", boxShadow: "0 1px 5px rgba(0,0,0,0.13)" },
  cardTitle: { fontSize: "14px", fontWeight: 500, color: "#444", marginBottom: "16px", borderBottom: "1px solid #ccc", paddingBottom: "8px" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  inputRow: { display: "flex", alignItems: "center", background: "#fff", border: "1px solid #b8b8b8", borderRadius: "2px", overflow: "hidden" },
  iconBox: { padding: "7px 8px", display: "flex", alignItems: "center", background: "#e0e0e0", borderRight: "1px solid #b8b8b8", flexShrink: 0 },
  input: { flex: 1, border: "none", outline: "none", padding: "8px 10px", fontSize: "13px", color: "#333", background: "#fff", fontFamily: "Arial, sans-serif" },
  kbdIcon: { padding: "7px 8px", display: "flex", alignItems: "center", background: "#e0e0e0", borderLeft: "1px solid #b8b8b8", flexShrink: 0, cursor: "pointer" },
  error: { background: "#fde8e8", border: "1px solid #f5c6c6", borderRadius: "2px", color: "#c0392b", fontSize: "11px", padding: "6px 8px", lineHeight: 1.4 },
  hint: { fontSize: "11px", color: "#888", textAlign: "center" },
  signInBtn: { marginTop: "4px", background: "#3bb3e8", color: "#fff", border: "none", borderRadius: "2px", padding: "10px", fontSize: "14px", fontWeight: "bold", width: "100%", fontFamily: "Arial, sans-serif", letterSpacing: "0.3px" },
  footer: { textAlign: "center", padding: "10px", fontSize: "11px", color: "#666", background: "#d8d8d8", borderTop: "1px solid #c0c0c0" },
};