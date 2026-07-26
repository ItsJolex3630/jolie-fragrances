"use client";

import { useState } from "react";
import { Shield, CheckCircle2, XCircle, ScanLine, AlertTriangle } from "lucide-react";

export default function VerifyCodePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/predictions/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, error: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 mb-4">
            <Shield className="w-8 h-8 text-[#d4af37]" />
          </div>
          <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-playfair)]">
            Verificar Código
          </h1>
          <p className="text-white/40 text-sm mt-2 font-[family-name:var(--font-inter)]">
            Escanea o pega el código para verificar su autenticidad
          </p>
        </div>

        {/* Input area */}
        <div className="bg-[#111] border border-[rgba(212,175,55,0.12)] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <ScanLine className="w-5 h-5 text-[#d4af37]/60" />
            <span className="text-sm text-white/60 font-[family-name:var(--font-inter)]">
              Código de descuento
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Pega aquí el código del QR..."
            className="w-full h-24 bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white text-sm font-mono resize-none focus:border-[#d4af37]/40 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none"
          />
          <button
            onClick={handleVerify}
            disabled={loading || !code.trim()}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8941e] text-black font-bold text-sm font-[family-name:var(--font-inter)] shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verificando..." : "Verificar Código"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-2xl p-6 border ${
              result.valid
                ? result.alreadyUsed
                  ? "bg-yellow-500/5 border-yellow-500/20"
                  : "bg-green-500/5 border-green-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            {/* Status icon */}
            <div className="flex items-center gap-3 mb-4">
              {result.valid ? (
                result.alreadyUsed ? (
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <h3 className="text-white font-semibold font-[family-name:var(--font-inter)]">
                  {result.valid
                    ? result.alreadyUsed
                      ? "Código ya canjeado"
                      : "¡Código válido!"
                    : "Código inválido"}
                </h3>
                <p className="text-white/50 text-xs">
                  {(result.error as string) || (result.message as string)}
                </p>
              </div>
            </div>

            {/* Details */}
            {result.valid && result.user && (
              <div className="space-y-2 bg-black/30 rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Email:</span>
                  <span className="text-white font-medium">{(result.user as { email: string }).email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Nombre:</span>
                  <span className="text-white">{(result.user as { name: string }).name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Descuento:</span>
                  <span className="text-[#d4af37] font-bold">{result.discountPct as number}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Expira:</span>
                  <span className="text-white/70">
                    {result.expiresAt
                      ? new Date(result.expiresAt as string).toLocaleDateString("es-VE")
                      : "N/A"}
                  </span>
                </div>
                {result.alreadyUsed && result.verifiedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Canjeado:</span>
                    <span className="text-yellow-400">
                      {new Date(result.verifiedAt as string).toLocaleDateString("es-VE")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Fraud warning */}
            {!result.valid && result.detail && (
              <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-xs">
                  ⚠️ {result.detail as string}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
