"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * useBannedCheck
 * ─────────────────────────────────────────────────────────────────────────────
 * Defense-in-depth hook that polls `/api/auth/me` to detect if the current
 * session user has been banned AFTER they logged in.
 *
 * Why this exists:
 *   The primary ban enforcement is in `auth.ts::signIn` — banned users are
 *   rejected at login time. But a user can be banned while they already have
 *   a valid JWT session cookie (which lives up to 30 days). This hook lets
 *   pages detect the ban and show a "cuenta suspendida" notice instead of
 *   the normal UI.
 *
 * Returns:
 *   - `loading`  → true while the session is loading or the check is in flight
 *   - `banned`   → true if the user is currently banned (DB-backed)
 *   - `reason`   → the optional ban reason (string | null)
 *
 * Notes:
 *   - Only runs the check for AUTHENTICATED sessions (no point checking
 *     anonymous visitors).
 *   - On DB errors, fails OPEN (banned=false) — same policy as the sign-in
 *     check, to avoid locking everyone out during a DB outage.
 *   - Re-checks when the session email changes (e.g. after logout/login).
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function useBannedCheck(): {
  loading: boolean;
  banned: boolean;
  reason: string | null;
} {
  const { data: session, status } = useSession();
  const email = session?.user?.email;

  const [loading, setLoading] = useState(true);
  const [banned, setBanned] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    // Only check authenticated sessions
    if (status !== "authenticated" || !email) {
      setLoading(false);
      setBanned(false);
      setReason(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function check() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.authenticated) {
          setBanned(!!data.banned);
          setReason(data.bannedReason ?? null);
        } else {
          // Not authenticated (session expired mid-flight) — treat as not banned.
          setBanned(false);
          setReason(null);
        }
      } catch (err) {
        console.warn("[useBannedCheck] error (failing open):", err);
        if (!cancelled) {
          setBanned(false);
          setReason(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [status, email]);

  return { loading, banned, reason };
}
