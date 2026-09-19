"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export default function AdminSecurityDashboard() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalActiveBlocked: 0,
    activeDomains: 0,
    activeEmails: 0,
    activeIps: 0,
    totalUnblocked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [selectedType, setSelectedType] = useState("all"); // "all" | "domain" | "email" | "ip"
  const [selectedStatus, setSelectedStatus] = useState("all"); // "all" | "blocked" | "unblocked"
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Form state for new entry
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState("domain");
  const [newValue, setNewValue] = useState("");
  const [newReason, setNewReason] = useState("");
  const [formError, setFormError] = useState(null);

  const fetchBlocklist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedType !== "all") params.type = selectedType;
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get("/api/admin/security/blocklist", { params });
      if (res.data?.success) {
        setItems(res.data.data || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load blocklist:", err);
      setError(err.response?.data?.message || "Failed to load security blocklist.");
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchBlocklist();
  }, [fetchBlocklist]);

  const handleToggleEntry = async (item) => {
    const isBlocking = item.status === "unblocked";
    const promptText = isBlocking
      ? `Re-block ${item.type.toUpperCase()} '${item.value}'?`
      : `Remove ${item.type.toUpperCase()} '${item.value}' from the active blocklist? It will remain in history as unblocked.`;

    if (!window.confirm(promptText)) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await api.patch(`/api/admin/security/blocklist/${item._id}/toggle`);
      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        await fetchBlocklist();
      }
    } catch (err) {
      console.error("Toggle error:", err);
      setError(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!newValue.trim()) {
      setFormError("Please enter a value to block.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post("/api/admin/security/blocklist", {
        type: newType,
        value: newValue.trim(),
        reason: newReason.trim(),
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        setShowAddModal(false);
        setNewValue("");
        setNewReason("");
        await fetchBlocklist();
      }
    } catch (err) {
      console.error("Add entry error:", err);
      setFormError(err.response?.data?.message || "Failed to add blocklist entry.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (
      !window.confirm(
        "Sync standard high-confidence disposable email domains into the database?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await api.post("/api/admin/security/seed-defaults");
      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        await fetchBlocklist();
      }
    } catch (err) {
      console.error("Seed error:", err);
      setError(err.response?.data?.message || "Failed to seed default domains.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Security & Access Control Dashboard
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Manage blocked disposable email domains, abusive email addresses, and malicious IP networks with complete audit logs and re-block capabilities.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSeedDefaults}
            disabled={actionLoading}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
            title="Populate common disposable domains into database"
          >
            <span>⚡</span>
            <span>Seed Standard Domains</span>
          </button>
          <button
            onClick={() => {
              setFormError(null);
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Block New Entry</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span className="font-medium">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-900 font-bold ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-medium uppercase text-gray-400">Total Active Blocks</span>
          <div className="mt-1 text-2xl font-bold text-red-600">{stats.totalActiveBlocked}</div>
          <div className="text-[11px] text-gray-400 mt-1">Actively enforced</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-medium uppercase text-gray-400">Blocked Domains</span>
          <div className="mt-1 text-2xl font-bold text-amber-600">{stats.activeDomains}</div>
          <div className="text-[11px] text-gray-400 mt-1">Disposable/temporary</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-medium uppercase text-gray-400">Blocked Emails</span>
          <div className="mt-1 text-2xl font-bold text-blue-600">{stats.activeEmails}</div>
          <div className="text-[11px] text-gray-400 mt-1">Targeted user blocks</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-medium uppercase text-gray-400">Blocked IPs</span>
          <div className="mt-1 text-2xl font-bold text-purple-600">{stats.activeIps}</div>
          <div className="text-[11px] text-gray-400 mt-1">Network restrictions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-medium uppercase text-gray-400">Unblocked History</span>
          <div className="mt-1 text-2xl font-bold text-slate-500">{stats.totalUnblocked}</div>
          <div className="text-[11px] text-gray-400 mt-1">Available to re-block</div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                selectedType === "all"
                  ? "bg-white text-gray-900 shadow-2xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType("domain")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                selectedType === "domain"
                  ? "bg-white text-gray-900 shadow-2xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Domains ({stats.activeDomains})
            </button>
            <button
              onClick={() => setSelectedType("email")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                selectedType === "email"
                  ? "bg-white text-gray-900 shadow-2xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Emails ({stats.activeEmails})
            </button>
            <button
              onClick={() => setSelectedType("ip")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                selectedType === "ip"
                  ? "bg-white text-gray-900 shadow-2xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              IPs ({stats.activeIps})
            </button>
          </div>

          {/* Status Filter & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded-lg border border-gray-300 py-1.5 px-2.5 bg-white text-gray-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Status: All (Active & History)</option>
              <option value="blocked">Status: Actively Blocked Only</option>
              <option value="unblocked">Status: Removed / Unblocked History</option>
            </select>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search domain, email, IP..."
                className="text-xs rounded-lg border border-gray-300 py-1.5 pl-7 pr-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 w-44 sm:w-56"
              />
              <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔍</span>
            </div>

            <button
              onClick={fetchBlocklist}
              disabled={loading}
              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs cursor-pointer"
              title="Refresh table"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-500">
            <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto mb-2" />
            Loading security entries...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500">
            <span className="text-3xl block mb-2">🛡️</span>
            <p className="font-semibold text-gray-700">No blocklist entries found.</p>
            <p className="text-gray-400 mt-1">
              {searchQuery || selectedType !== "all" || selectedStatus !== "all"
                ? "Try adjusting your filters or search query."
                : "Click 'Seed Standard Domains' to populate known disposable domains, or add an entry above."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Blocked Value</th>
                  <th className="px-4 py-3">Reason / Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Audit Details</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const isBlocked = item.status === "blocked";
                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-gray-50/70 transition-colors ${
                        !isBlocked ? "bg-gray-50/30 opacity-75" : ""
                      }`}
                    >
                      {/* Type Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.type === "domain" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Domain
                          </span>
                        )}
                        {item.type === "email" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Email
                          </span>
                        )}
                        {item.type === "ip" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            IP
                          </span>
                        )}
                      </td>

                      {/* Value */}
                      <td className="px-4 py-3.5 font-mono font-semibold text-gray-900">
                        {item.value}
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3.5 text-gray-600 max-w-xs truncate">
                        {item.reason || <span className="text-gray-400 italic">No notes provided</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-300">
                            Removed from Blocklist
                          </span>
                        )}
                      </td>

                      {/* Audit Details */}
                      <td className="px-4 py-3.5 text-[11px] text-gray-500 whitespace-nowrap">
                        <div>
                          Added by: <span className="font-semibold text-gray-700">{item.addedBy || "admin"}</span>
                        </div>
                        {!isBlocked && item.unblockedAt && (
                          <div className="text-gray-400">
                            Removed: {new Date(item.unblockedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {isBlocked ? (
                          <button
                            onClick={() => handleToggleEntry(item)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[11px] border border-gray-300 transition cursor-pointer"
                            title="Remove from active blocklist while preserving history"
                          >
                            Remove from Blocklist
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleEntry(item)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px] border border-red-200 transition cursor-pointer"
                            title="Re-block this item"
                          >
                            Re-block
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Add Blocklist Entry</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddEntry} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Block Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="domain">Email Domain (e.g. spamdomain.xyz)</option>
                  <option value="email">Specific Email Address (e.g. baduser@example.com)</option>
                  <option value="ip">IP Address (e.g. 192.168.1.100)</option>
                </select>
                <p className="mt-1 text-[11px] text-gray-400">
                  {newType === "domain" && "Blocks all candidate registrations from this email domain."}
                  {newType === "email" && "Blocks registration and sign-in attempts for this specific email address."}
                  {newType === "ip" && "Restricts all signup and login requests originating from this client IP address."}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {newType === "domain" && "Domain Name"}
                  {newType === "email" && "Email Address"}
                  {newType === "ip" && "IP Address"}
                </label>
                <input
                  type="text"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={
                    newType === "domain"
                      ? "e.g. tempmailservice.com"
                      : newType === "email"
                      ? "e.g. spammer@spammydomain.com"
                      : "e.g. 203.0.113.42"
                  }
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Reason / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. Automated bot registration, disposable service"
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Enforcing Block..." : "Block Immediately"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
