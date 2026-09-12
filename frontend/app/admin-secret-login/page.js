"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminSecretLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/admin/login", {
        username,
        password,
      });

      if (res.data && res.data.token) {
        // Store admin token & profile distinctly
        login(res.data.token, res.data.admin, "admin");
        router.push("/admin/dashboard");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      const msg =
        err.response?.data?.message || "Invalid administrative credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-gray-100 px-4 py-12">
      {/* Intentionally plain, austere, unbranded admin portal aesthetic */}
      <div className="w-full max-w-sm rounded-lg border border-gray-300 bg-white p-6 shadow-xs">
        <div className="border-b border-gray-200 pb-3 mb-5">
          <h1 className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
            System Console Authorization
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Restricted access. Internal administrative terminal.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 uppercase tracking-wider mb-1">
              Operator ID
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-gray-600 focus:outline-none focus:ring-0 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-600 uppercase tracking-wider mb-1">
              Passkey
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-gray-600 focus:outline-none focus:ring-0 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded bg-gray-800 py-2 text-xs font-semibold text-white hover:bg-gray-900 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? "Authenticating..." : "Authorize"}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-3 text-center">
          <span className="text-[10px] text-gray-400 font-mono">
            IP and terminal sessions logged.
          </span>
        </div>
      </div>
    </div>
  );
}
