"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

/**
 * Google Sign-In callback page.
 * After Google authenticates the user, NextAuth redirects here.
 * We:
 * 1. Use the NextAuth session to get the verified Gmail
 * 2. Find or create the user in our DB
 * 3. Save to localStorage and redirect to /predicciones
 */
export default function AuthCallbackPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"loading" | "creating" | "success" | "error">("loading");

  useEffect(() => {
    // Wait for session to load
    if (sessionStatus === "loading") return;

    async function handleCallback() {
      try {
        setStatus("loading");

        // Check if we have a valid session with a Gmail address
        if (!session?.user?.email) {
          console.error("[Auth] No session or email found", session);
          setError("No se pudo verificar tu cuenta de Google. Intenta de nuevo.");
          setStatus("error");
          return;
        }

        const email = session.user.email;
        if (!email.endsWith("@gmail.com")) {
          setError("Solo se permiten cuentas de Gmail reales.");
          setStatus("error");
          return;
        }

        // Generate device fingerprint
        let deviceFingerprint = "";
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          let canvasHash = "";
          if (ctx) {
            ctx.textBaseline = "top";
            ctx.font = "14px Arial";
            ctx.fillText("JolieFP", 2, 2);
            canvasHash = canvas.toDataURL().slice(-50);
          }
          const components = [
            navigator.userAgent,
            navigator.language,
            screen.width + "x" + screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency || "",
            canvasHash,
            navigator.platform || "",
          ];
          deviceFingerprint = components.join("|");
        } catch { /* fingerprint not critical */ }

        setStatus("creating");

        // Register or update user via Google-auth endpoint
        const createRes = await fetch("/api/predictions/google-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: session.user.name || email.split("@")[0],
            image: session.user.image || null,
            deviceFingerprint,
          }),
        });
        const createData = await createRes.json();

        if (!createRes.ok) {
          console.error("[Auth] Register failed:", createData);
          setError(createData.error || "Error al crear cuenta. Intenta de nuevo.");
          setStatus("error");
          return;
        }

        const userId = createData.user?.id;
        if (!userId) {
          setError("Error: No se recibió el ID de usuario.");
          setStatus("error");
          return;
        }

        // Save to localStorage
        const userData = {
          userId,
          email,
          name: session.user.name || email.split("@")[0],
        };
        localStorage.setItem("jolie_user", JSON.stringify(userData));

        setStatus("success");

        // Small delay to show success message
        setTimeout(() => {
          window.location.href = "/predicciones";
        }, 500);
      } catch (err) {
        console.error("[Auth] Callback error:", err);
        setError("Error de conexión. Intenta de nuevo.");
        setStatus("error");
      }
    }

    handleCallback();
  }, [session, sessionStatus]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center max-w-sm mx-auto px-4">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin mx-auto" />
            <p className="text-white/70 text-sm font-medium">Verificando tu cuenta de Google...</p>
            <p className="text-white/30 text-xs">Google confirma que tu Gmail es real</p>
          </div>
        )}

        {status === "creating" && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin mx-auto" />
            <p className="text-white/70 text-sm font-medium">Creando tu cuenta...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-emerald-400 text-sm font-medium">¡Cuenta verificada con Google!</p>
            <p className="text-white/30 text-xs">Redirigiendo...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-red-400 text-sm">{error}</p>
            <a
              href="/predicciones"
              className="inline-block mt-4 px-6 py-2.5 bg-[#d4af37] text-black font-bold rounded-xl text-sm hover:bg-[#d4af37]/90 transition-all"
            >
              Volver a intentar
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
