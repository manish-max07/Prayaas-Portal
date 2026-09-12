"use client";

import React from "react";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
        <AdminNavbar />
        <main className="flex-1 w-full">{children}</main>
      </div>
    </AdminProtectedRoute>
  );
}
