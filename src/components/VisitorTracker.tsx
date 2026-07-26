"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const hasTrackedInitial = useRef(false);

  useEffect(() => {
    // Only run in the browser
    if (typeof window === "undefined") return;

    // To prevent double tracking in StrictMode / dev
    if (!pathname) return;

    let visitorId = window.localStorage.getItem("jolie-visitor-id");
    if (!visitorId) {
      visitorId = generateUUID();
      window.localStorage.setItem("jolie-visitor-id", visitorId);
    }

    // Fire the tracking request without blocking
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        path: pathname,
        userAgent: window.navigator.userAgent,
      }),
    }).catch(() => {
      // Ignore network errors silently (adblockers, privacy extensions)
    });

  }, [pathname]);

  return null; // This component doesn't render anything
}
