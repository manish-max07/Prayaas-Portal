"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://prayaas-portal.onrender.com"
    : "http://localhost:5000");

function getOrCreateVisitorId() {
  if (typeof window === "undefined") return null;
  try {
    let vid = localStorage.getItem("prayaas_vid");
    if (!vid) {
      vid = "v_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem("prayaas_vid", vid);
    }
    return vid;
  } catch (e) {
    return null;
  }
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastRecordedRef = useRef("");

  useEffect(() => {
    if (!pathname) return;

    // Avoid duplicate logging for exact same page in rapid succession (< 10 seconds)
    const currentPath = pathname;
    const now = Date.now();
    const sessionKey = `pv_${currentPath}`;

    try {
      const lastVisitTime = sessionStorage.getItem(sessionKey);
      if (lastVisitTime && now - parseInt(lastVisitTime, 10) < 10000) {
        return;
      }
      sessionStorage.setItem(sessionKey, now.toString());
    } catch (e) {
      // ignore storage errors
    }

    if (lastRecordedRef.current === currentPath) return;
    lastRecordedRef.current = currentPath;

    // Detect if this is an article slug page: /news/<slug>
    let slug = null;
    const newsMatch = currentPath.match(/^\/news\/([^\/]+)$/);
    if (newsMatch && newsMatch[1] && newsMatch[1] !== "news") {
      slug = newsMatch[1];
    }

    const visitorId = getOrCreateVisitorId();

    const payload = JSON.stringify({
      path: currentPath,
      slug: slug,
      visitorId: visitorId,
    });

    // Send asynchronously without blocking navigation or rendering
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(`${API_BASE_URL}/api/analytics/visit`, blob);
      } else {
        fetch(`${API_BASE_URL}/api/analytics/visit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (err) {
      // Non-critical logging; never disrupt user experience
    }
  }, [pathname]);

  return null;
}
