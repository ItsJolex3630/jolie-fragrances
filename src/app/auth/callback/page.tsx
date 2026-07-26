"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

/**
 * /auth/callback — Google Sign-In callback for the CATALOG.
 *
 * When a user clicks "Iniciar sesión" on the catalog TopBar, Google
 * redirects here after authentication. This page:
 * 1. Reads the NextAuth session to get the verified Gmail
 * 2. Calls /api/predictions/google-register to create/update the user
 *    in the database (so they appear in the admin panel + can sync
 *    cart/predictions/discounts across devices)
 * 3. Redirects back to the page they came from (default: "/")
 */
function AuthCallbackContent() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (sessionStatus === "loading") return;

    async function handleCallback() {
      try {
        setStatus("loading");

        if (!session?.user?.email) {
          setError("No se pudo verificar tu cuenta de Google.");
          setStatus("error");
          return;
        }

        const email = session.user.email;
        if (!email.endsWith("@gmail.com")) {
          setError("Solo se permiten cuentas de Gmail.");
          setStatus("error");
          return;
        }

        // Register or update user in the DB
        const createRes = await fetch("/api/predictions/google-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: session.user.name || email.split("@")[0],
            image: session.user.image || null,
          }),
        });

        if (!createRes.ok) {
          console.error("[Auth Callback] Register failed:", await createRes.json());
        }

        setStatus("success");

        setTimeout(() => {
          window.location.href = redirectTo;
        }, 400);
      } catch (err) {
        console.error("[Auth Callback] Error:", err);
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 800);
      }
    }

    handleCallback();
  }, [session, sessionStatus, redirectTo]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-4">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin mx-auto" />
            <p className="text-white/70 text-sm font-medium">
              Verificando tu cuenta de Google...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-emerald-400 text-sm font-medium">
              ¡Cuenta verificada!
            </p>
            <p className="text-white/30 text-xs">Redirigiendo...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-red-400 text-sm">{error}</p>
            <a
              href="/"
              className="inline-block mt-4 px-6 py-2.5 bg-[#d4af37] text-black font-bold rounded-xl text-sm hover:bg-[#d4af37]/90 transition-all"
            >
              Volver
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
