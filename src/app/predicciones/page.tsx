"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense, memo } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import QRCode from "qrcode";
import { useBannedCheck } from "@/hooks/useBannedCheck";
import BannedNotice from "@/components/BannedNotice";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  X,
  Loader2,
  RefreshCw,
  Lock,
  Minus,
  Plus,
  ArrowLeft,
  ShoppingBag,
  Shield,
  MessageCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserData {
  userId: string;
  email: string;
  name: string;
}

interface MatchDisplayData {
  id: string;
  externalId: string | null;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string | null;
  awayFlag: string | null;
  homeLogo: string | null;
  awayLogo: string | null;
  competition: string;
  competitionLogo: string | null;
  matchDate: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
  shortStatus: string | null;
  round: string | null;
  homeVotes: number;
  awayVotes: number;
  drawVotes: number;
  totalVotes: number;
  canPredict: boolean;
  timeVzla: string;
}

interface LocalPrediction {
  id: string;
  matchId: string;
  userId: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  homeGoals: number;
  awayGoals: number;
  extraTimeHome: number | null;
  extraTimeAway: number | null;
  penaltiesHome: number | null;
  penaltiesAway: number | null;
  correct: boolean | null;
  exactScore: boolean | null;
  evaluatedAt: string | null;
  createdAt: string;
}

interface LocalDiscountCode {
  id: string;
  userId: string;
  predictionId: string;
  code: string;
  discountPct: number;
  homeTeam: string;
  awayTeam: string;
  expiresAt: string;
  createdAt: string;
}

interface GoalInputState {
  homeGoals: number;
  awayGoals: number;
  extraTimeHome: number;
  extraTimeAway: number;
  penaltiesHome: number;
  penaltiesAway: number;
  showExtraTime: boolean;
  showPenalties: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const JOLIE_WHATSAPP = "584244055386"; // Jolie Fragrances official WhatsApp
const PREDICTIONS_KEY_PREFIX = "jolie_preds_";
const DISCOUNTS_KEY_PREFIX = "jolie_discs_";
const USER_KEY = "jolie_user";

// ─── Email-based localStorage keys ───
function predictionsKey(email: string) { return PREDICTIONS_KEY_PREFIX + email; }
function discountsKey(email: string) { return DISCOUNTS_KEY_PREFIX + email; }

// ─── Number Stepper Component ────────────────────────────────────────────────

const NumberStepper = memo(function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 15,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const btnClass = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  const numClass = size === "sm" ? "w-8 text-lg" : "w-10 text-2xl";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(Math.max(min, value - 1)); }}
        disabled={value <= min}
        className={`${btnClass} rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 flex items-center justify-center`}
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className={`${numClass} text-center font-bold text-white select-none`}>
        {value}
      </span>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(Math.min(max, value + 1)); }}
        disabled={value >= max}
        className={`${btnClass} rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30 flex items-center justify-center`}
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
});

// ─── LocalStorage Helpers ────────────────────────────────────────────────────

function loadLocalPredictions(email?: string): LocalPrediction[] {
  if (typeof window === "undefined") return [];
  try {
    // If email provided, load from email-specific key; otherwise try legacy key
    const key = email ? predictionsKey(email) : "jolie_predictions";
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    // Fallback: try legacy key if email-specific not found
    if (email) {
      const legacy = localStorage.getItem("jolie_predictions");
      if (legacy) {
        const preds = JSON.parse(legacy);
        // Migrate to email-specific key
        localStorage.setItem(predictionsKey(email), legacy);
        localStorage.removeItem("jolie_predictions");
        return preds;
      }
    }
    return [];
  } catch { return []; }
}

function saveLocalPredictions(predictions: LocalPrediction[], email?: string) {
  if (typeof window === "undefined") return;
  const key = email ? predictionsKey(email) : "jolie_predictions";
  localStorage.setItem(key, JSON.stringify(predictions));
}

function loadLocalDiscounts(email?: string): LocalDiscountCode[] {
  if (typeof window === "undefined") return [];
  try {
    const key = email ? discountsKey(email) : "jolie_discounts";
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    if (email) {
      const legacy = localStorage.getItem("jolie_discounts");
      if (legacy) {
        const discs = JSON.parse(legacy);
        localStorage.setItem(discountsKey(email), legacy);
        localStorage.removeItem("jolie_discounts");
        return discs;
      }
    }
    return [];
  } catch { return []; }
}

function saveLocalDiscounts(discounts: LocalDiscountCode[], email?: string) {
  if (typeof window === "undefined") return;
  const key = email ? discountsKey(email) : "jolie_discounts";
  localStorage.setItem(key, JSON.stringify(discounts));
}

// ─── Discount Code Generation (server-side via API) ──────────────────────────
// SECURITY: The HMAC secret must NEVER exist in client-side code.
// This function calls a secure server endpoint that does the signing server-side.
async function generateDiscountCode(
  email: string,
  predictionId: string,
  discountPct: number
): Promise<string> {
  const res = await fetch("/api/predictions/generate-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, predictionId, discountPct }),
  });
  if (!res.ok) throw new Error("No se pudo generar el código de descuento");
  const data = await res.json();
  return data.code as string;
}

// ─── WhatsApp Message Builder ────────────────────────────────────────────────

function buildWhatsAppMessage(pred: LocalPrediction, email: string, matchDate?: string): string {
  const dateStr = matchDate
    ? new Date(matchDate).toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" })
    : new Date(pred.createdAt).toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" });

  let scoreLine = `${pred.homeTeam} ${pred.homeGoals} - ${pred.awayGoals} ${pred.awayTeam}`;
  const details: string[] = [];

  if (pred.extraTimeHome !== null) {
    details.push(`Prórroga: ${pred.extraTimeHome}-${pred.extraTimeAway}`);
  }
  if (pred.penaltiesHome !== null) {
    details.push(`Penales: ${pred.penaltiesHome}-${pred.penaltiesAway}`);
  }

  let winnerLine = "";
  if (pred.homeGoals > pred.awayGoals) winnerLine = `Gana ${pred.homeTeam}`;
  else if (pred.awayGoals > pred.homeGoals) winnerLine = `Gana ${pred.awayTeam}`;
  else winnerLine = "Empate";

  const msg = `🇻🇪 *Jolie Fragrances — Predicción del Mundial* 🇻🇪\n\n` +
    `¡Hola, Jolie Fragrances! Les comparto mi predicción para el partido de hoy:\n\n` +
    `⚽ *${pred.homeTeam} vs ${pred.awayTeam}*\n` +
    `📅 ${dateStr}\n\n` +
    `📊 *Mi predicción:*\n` +
    `Marcador: ${scoreLine}\n` +
    `${details.length > 0 ? details.join(" | ") + "\n" : ""}` +
    `Resultado: ${winnerLine}\n\n` +
    `🔐 *Datos de verificación:*\n` +
    `Correo: ${email}\n` +
    `ID: ${pred.id}\n` +
    `Fecha de registro: ${new Date(pred.createdAt).toLocaleString("es-VE")}\n\n` +
    `¡Gracias por la oportunidad de ganar descuentos en sus perfumes! ✨\n\n` +
    `_Predicción realizada a través del sistema oficial de Jolie Fragrances_`;

  return encodeURIComponent(msg);
}

// ─── MatchCard Component (EXTRACTED — fixes re-render) ───────────────────────

interface MatchCardProps {
  match: MatchDisplayData;
  existingPred: LocalPrediction | undefined;
  goalInput: GoalInputState;
  isPredicting: boolean;
  onGoalChange: (matchId: string, updates: Partial<GoalInputState>) => void;
  onPredict: (match: MatchDisplayData) => void;
  getStatusBadge: (match: MatchDisplayData) => React.ReactNode;
  userEmail: string;
}

const MatchCard = memo(function MatchCard({
  match,
  existingPred,
  goalInput,
  isPredicting,
  onGoalChange,
  onPredict,
  getStatusBadge,
  userEmail,
}: MatchCardProps) {
  const isFinished = match.status === "finished" || match.shortStatus === "FT" || match.shortStatus === "PEN" || match.shortStatus === "AET";
  const isLive = match.status === "live";
  const isLocked = !match.canPredict || isFinished || isLive;

  const getPredictedLabel = () => {
    if (goalInput.homeGoals > goalInput.awayGoals) return `Gana ${match.homeTeam}`;
    if (goalInput.awayGoals > goalInput.homeGoals) return `Gana ${match.awayTeam}`;
    return "Empate";
  };

  // WhatsApp link for existing prediction
  const whatsappLink = existingPred
    ? `https://wa.me/${JOLIE_WHATSAPP}?text=${buildWhatsAppMessage(existingPred, userEmail, match.matchDate)}`
    : "";

  return (
    <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden hover:border-[#d4af37]/30 transition-colors duration-300">
      {/* Competition Header */}
      <div className="px-4 py-2 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {match.competitionLogo && (
            <img src={match.competitionLogo} alt="" className="w-4 h-4 object-contain" />
          )}
          <span className="text-[10px] text-white/50 uppercase tracking-wider font-medium">
            {match.competition}
          </span>
          {match.round && (
            <span className="text-[10px] text-white/30">• {match.round}</span>
          )}
        </div>
        {getStatusBadge(match)}
      </div>

      {/* Teams & Score */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex flex-col items-center gap-2">
            {match.homeLogo ? (
              <img src={match.homeLogo} alt={match.homeTeam} className="w-10 h-10 object-contain" />
            ) : (
              <span className="text-2xl">{match.homeFlag || "⚽"}</span>
            )}
            <span className="text-white text-sm font-medium text-center leading-tight max-w-[100px] truncate">
              {match.homeTeam}
            </span>
            {isFinished && match.homeScore !== null && (
              <span className="text-2xl font-bold text-white">{match.homeScore}</span>
            )}
          </div>

          <div className="px-4 flex flex-col items-center">
            {isFinished || isLive ? (
              <span className="text-white/40 text-lg">-</span>
            ) : (
              <span className="text-[#d4af37]/60 text-xs font-bold tracking-widest">VS</span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-2">
            {match.awayLogo ? (
              <img src={match.awayLogo} alt={match.awayTeam} className="w-10 h-10 object-contain" />
            ) : (
              <span className="text-2xl">{match.awayFlag || "⚽"}</span>
            )}
            <span className="text-white text-sm font-medium text-center leading-tight max-w-[100px] truncate">
              {match.awayTeam}
            </span>
            {isFinished && match.awayScore !== null && (
              <span className="text-2xl font-bold text-white">{match.awayScore}</span>
            )}
          </div>
        </div>

        {/* Winner indicator */}
        {isFinished && match.winner && (
          <div className="mt-3 text-center">
            <span className="text-[#d4af37] text-xs font-medium">
              {match.winner === "home" ? `Ganó ${match.homeTeam}` : match.winner === "away" ? `Ganó ${match.awayTeam}` : "Empate"}
            </span>
          </div>
        )}

        {/* ─── Goal Prediction UI ─── */}
        <div className="mt-4">
          {isLocked ? (
            <div className="flex items-center justify-center gap-2 text-white/30 text-xs py-2">
              <Lock className="w-3 h-3" />
              {isFinished ? "Partido terminado" : isLive ? "Partido en vivo" : "Predicciones cerradas"}
            </div>
          ) : existingPred ? (
            <div className="space-y-3">
              <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl p-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-[#d4af37]" />
                  <span className="text-[#d4af37] text-sm font-medium">Tu predicción</span>
                </div>
                <div className="text-center">
                  <span className="text-white text-lg font-bold">
                    {match.homeFlag} {existingPred.homeGoals} - {existingPred.awayGoals} {match.awayFlag}
                  </span>
                  {existingPred.extraTimeHome !== null && (
                    <p className="text-white/40 text-xs mt-1">
                      Prórroga: {existingPred.extraTimeHome}-{existingPred.extraTimeAway}
                      {existingPred.penaltiesHome !== null && (
                        <> • Penales: {existingPred.penaltiesHome}-{existingPred.penaltiesAway}</>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* WhatsApp Secure Button */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#25D366] text-white font-bold text-sm rounded-xl hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/10"
              >
                <MessageCircle className="w-4 h-4" />
                Asegura tu predicción por WhatsApp
              </a>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/30">
                <Shield className="w-2.5 h-2.5 text-[#25D366]/60" />
                <span>Envía tu predicción por WhatsApp para validar tu posible descuento</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Goal Steppers */}
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-3 text-center">
                  ¿Cuántos goles hará cada equipo?
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-white/60 max-w-[80px] truncate">{match.homeTeam}</span>
                    <NumberStepper
                      value={goalInput.homeGoals}
                      onChange={(v) => onGoalChange(match.id, { homeGoals: v })}
                    />
                  </div>
                  <div className="px-3">
                    <span className="text-white/20 text-sm font-bold">—</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-white/60 max-w-[80px] truncate">{match.awayTeam}</span>
                    <NumberStepper
                      value={goalInput.awayGoals}
                      onChange={(v) => onGoalChange(match.id, { awayGoals: v })}
                    />
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    goalInput.homeGoals > goalInput.awayGoals ? "bg-emerald-500/10 text-emerald-400" :
                    goalInput.homeGoals < goalInput.awayGoals ? "bg-rose-500/10 text-rose-400" :
                    "bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {getPredictedLabel()}
                  </span>
                </div>
              </div>

              {/* Extra Time */}
              {goalInput.showExtraTime && (
                <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-3">
                  <p className="text-yellow-400/60 text-[10px] uppercase tracking-wider mb-2 text-center flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Si van a prórroga, ¿cuántos goles más?
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-white/40">{match.homeTeam}</span>
                      <NumberStepper
                        value={goalInput.extraTimeHome}
                        onChange={(v) => onGoalChange(match.id, { extraTimeHome: v })}
                        max={5}
                        size="sm"
                      />
                    </div>
                    <span className="text-white/20 text-sm px-2">—</span>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-white/40">{match.awayTeam}</span>
                      <NumberStepper
                        value={goalInput.extraTimeAway}
                        onChange={(v) => onGoalChange(match.id, { extraTimeAway: v })}
                        max={5}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Penalties */}
              {goalInput.showPenalties && (
                <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-3">
                  <p className="text-rose-400/60 text-[10px] uppercase tracking-wider mb-2 text-center">
                    Si van a penales, ¿cuántos anota cada uno?
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-white/40">{match.homeTeam}</span>
                      <NumberStepper
                        value={goalInput.penaltiesHome}
                        onChange={(v) => onGoalChange(match.id, { penaltiesHome: v })}
                        max={10}
                        size="sm"
                      />
                    </div>
                    <span className="text-white/20 text-sm px-2">—</span>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-white/40">{match.awayTeam}</span>
                      <NumberStepper
                        value={goalInput.penaltiesAway}
                        onChange={(v) => onGoalChange(match.id, { penaltiesAway: v })}
                        max={10}
                        size="sm"
                      />
                    </div>
                  </div>
                  {goalInput.penaltiesHome === goalInput.penaltiesAway && goalInput.penaltiesHome > 0 && (
                    <p className="text-rose-400/40 text-[10px] text-center mt-2">
                      En penales alguien debe ganar
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={() => onPredict(match)}
                disabled={
                  isPredicting ||
                  (goalInput.showPenalties && goalInput.penaltiesHome === goalInput.penaltiesAway)
                }
                className="w-full py-3 bg-[#d4af37] text-black font-bold text-sm rounded-xl hover:bg-[#e5c34b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPredicting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Confirmar: {goalInput.homeGoals} - {goalInput.awayGoals}</span>
                    {goalInput.showExtraTime && (
                      <span className="text-[10px] opacity-70">
                        (ET: {goalInput.extraTimeHome}-{goalInput.extraTimeAway}
                        {goalInput.showPenalties && `, Pen: ${goalInput.penaltiesHome}-${goalInput.penaltiesAway}`}
                        )
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Discount info */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-white/25">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400/50" /> Ganador = 5%
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-2.5 h-2.5 text-[#d4af37]/50" /> Exacto = 10%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ─── Default Goal Input ──────────────────────────────────────────────────────

const DEFAULT_GOAL_INPUT: GoalInputState = {
  homeGoals: 0,
  awayGoals: 0,
  extraTimeHome: 0,
  extraTimeAway: 0,
  penaltiesHome: 0,
  penaltiesAway: 0,
  showExtraTime: false,
  showPenalties: false,
};

// ─── Main Component ──────────────────────────────────────────────────────────

type Step = "register" | "matches";

function PrediccionesContent() {
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  // ─── Banned-account check (defense-in-depth) ───
  // The primary enforcement is in auth.ts::signIn — banned users are rejected
  // at login. But if a user is banned WHILE they already have a valid session,
  // we detect it here and show a "cuenta suspendida" notice instead of the
  // predictions UI. The conditional return is placed AFTER all other hooks
  // (right before the main return) to respect React's rules-of-hooks.
  const { banned, reason: bannedReason } = useBannedCheck();

  const [step, setStep] = useState<Step>("register");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Matches
  const [todayMatches, setTodayMatches] = useState<MatchDisplayData[]>([]);
  const [tomorrowMatches, setTomorrowMatches] = useState<MatchDisplayData[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow">("today");

  // Predictions & discounts (localStorage-backed, server-synced)
  const [localPredictions, setLocalPredictions] = useState<LocalPrediction[]>([]);
  const [localDiscounts, setLocalDiscounts] = useState<LocalDiscountCode[]>([]);

  // Goal prediction state per match
  const [predictingMatchId, setPredictingMatchId] = useState<string | null>(null);
  const [goalInputs, setGoalInputs] = useState<Record<string, GoalInputState>>({});

  // QR codes
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});

  // Auto-refresh
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  const serverLoadedRef = useRef(false);

  // Check for error param from Google Sign-In redirect
  useEffect(() => {
    const errParam = searchParams.get("error");
    if (errParam) {
      if (errParam === "not_gmail") {
        setError("Solo se permiten cuentas de Gmail reales.");
      } else if (errParam === "google") {
        setError("Google rechazó la conexión.");
      } else if (["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "OAuthAccountNotLinked"].includes(errParam)) {
        setError(`Error de Google OAuth: ${errParam}.`);
      } else if (errParam === "AccessDenied") {
        setError("Acceso denegado por Google.");
      } else {
        setError(`Error de autenticación: ${errParam}`);
      }
    }
  }, [searchParams]);

  // ─── Load saved user from localStorage OR recover from Google session ───
  // This is the CROSS-DEVICE SYNC mechanism:
  // 1. First try localStorage (fast path, same device)
  // 2. If no localStorage OR demo user, check the Google session via
  //    /api/predictions/me — this recovers the user's account from the DB
  //    by email, so switching devices/browsers just works.
  useEffect(() => {
    let cancelled = false;

    async function initUser() {
      // Wait for the NextAuth session to load before deciding what to do.
      // sessionStatus: "loading" | "authenticated" | "unauthenticated"
      if (sessionStatus === "loading") return;

      // ─── Fast path: user already in localStorage (same device) ───
      const saved = localStorage.getItem(USER_KEY);
      if (saved) {
        try {
          let parsed = JSON.parse(saved) as UserData;

          // ─── Fix demo users: re-register with Google to get a real DB userId ───
          if (String(parsed.userId).startsWith("demo_")) {
            console.log("[Init] Detected demo user, attempting to recover real account...", parsed.email);
            try {
              const regRes = await fetch("/api/predictions/google-register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: parsed.email, name: parsed.name }),
              });
              const regData = await regRes.json();
              if (regRes.ok && regData.user?.id && !String(regData.user.id).startsWith("demo_")) {
                parsed = { userId: regData.user.id, email: parsed.email, name: regData.user.name || parsed.name };
                localStorage.setItem(USER_KEY, JSON.stringify(parsed));
                console.log("[Init] ✅ Recovered real account:", parsed.userId);
              } else {
                console.warn("[Init] Could not recover account, DB may still be down:", regData);
              }
            } catch (regErr) {
              console.warn("[Init] Account recovery failed:", regErr);
            }
          }

          if (cancelled) return;

          setUser(parsed);
          setStep("matches");
          const emailPreds = loadLocalPredictions(parsed.email);
          setLocalPredictions(emailPreds);
          const emailDiscs = loadLocalDiscounts(parsed.email);
          setLocalDiscounts(emailDiscs);
          fetchMatches();
          fetchServerPredictions(parsed.userId, parsed.email, emailPreds);

          // Even with localStorage, if there's a Google session, also check
          // /api/predictions/me to pick up any cross-device updates.
          if (sessionStatus === "authenticated" && session?.user?.email) {
            recoverFromServerSession(session.user.email, parsed);
          }
          return;
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      // ─── Slow path: no localStorage → check Google session (cross-device) ───
      if (sessionStatus === "authenticated" && session?.user?.email) {
        console.log("[Init] No localStorage user but Google session active — recovering account from server...");
        await recoverFromServerSession(session.user.email, null);
      } else {
        // No localStorage, no Google session → show registration page
        setLocalPredictions([]);
        setLocalDiscounts([]);
      }
    }

    /**
     * Recover the user's account + predictions + discounts from the server
     * using their Google session. This is called when:
     * - No localStorage user exists (new device/browser) but Google session is active
     * - localStorage user exists but we want to pick up cross-device updates
     */
    async function recoverFromServerSession(email: string, existingUser: UserData | null) {
      try {
        const res = await fetch("/api/predictions/me", { cache: "no-store" });
        if (!res.ok) {
          console.warn("[Init] /api/predictions/me returned", res.status);
          return;
        }
        const data = await res.json();

        if (cancelled) return;

        if (data.authenticated && data.user?.id) {
          // ✅ Successfully recovered account from server!
          const recoveredUser: UserData = {
            userId: data.user.id,
            email: data.user.email || email,
            name: data.user.name || email.split("@")[0],
          };
          console.log("[Init] ✅ Recovered account from Google session:", recoveredUser.userId);

          localStorage.setItem(USER_KEY, JSON.stringify(recoveredUser));
          setUser(recoveredUser);
          setStep("matches");

          // Load server predictions + discounts directly (cross-device sync!)
          const serverPreds: LocalPrediction[] = (data.predictions || []).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            matchId: (p.externalMatchId as string) || (p.matchId as string) || (p.internalMatchId as string),
            userId: recoveredUser.userId,
            homeTeam: (p.homeTeam as string) || "Home",
            awayTeam: (p.awayTeam as string) || "Away",
            homeFlag: (p.homeFlag as string) || "⚽",
            awayFlag: (p.awayFlag as string) || "⚽",
            homeGoals: p.homeGoals as number,
            awayGoals: p.awayGoals as number,
            extraTimeHome: p.extraTimeHome as number | null,
            extraTimeAway: p.extraTimeAway as number | null,
            penaltiesHome: p.penaltiesHome as number | null,
            penaltiesAway: p.penaltiesAway as number | null,
            correct: p.correct as boolean | null,
            exactScore: p.exactScore as boolean | null,
            evaluatedAt: null,
            createdAt: p.createdAt as string,
          }));

          // Merge with any local predictions (in case this device had offline ones)
          const localPreds = loadLocalPredictions(email);
          const localOnly = localPreds.filter(
            (lp) => !serverPreds.some((sp) => sp.matchId === lp.matchId)
          );
          const merged = [...serverPreds, ...localOnly];
          if (merged.length > 0) {
            saveLocalPredictions(merged, email);
            setLocalPredictions(merged);
          } else {
            setLocalPredictions([]);
          }

          // Load server discounts
          const serverDiscounts: LocalDiscountCode[] = (data.discountCodes || []).map((dc: Record<string, unknown>) => ({
            id: dc.id as string,
            userId: recoveredUser.userId,
            predictionId: (dc.predictionId as string) || "",
            code: dc.code as string,
            discountPct: dc.discountPct as number,
            homeTeam: "",
            awayTeam: "",
            expiresAt: dc.expiresAt as string,
            createdAt: dc.createdAt as string,
          }));

          const localDisc = loadLocalDiscounts(email);
          const localOnlyDisc = localDisc.filter(
            (ld) => !serverDiscounts.some((sd) => sd.code === ld.code)
          );
          const mergedDisc = [...serverDiscounts, ...localOnlyDisc];
          if (mergedDisc.length > 0) {
            saveLocalDiscounts(mergedDisc, email);
            setLocalDiscounts(mergedDisc);
          }

          // Generate QR codes for recovered discounts
          for (const dc of serverDiscounts) {
            if (dc.code && !qrDataUrls[dc.id]) {
              try {
                const qr = await QRCode.toDataURL(dc.code, {
                  width: 200,
                  margin: 2,
                  color: { dark: "#000000", light: "#ffffff" },
                });
                if (!cancelled) setQrDataUrls((prev) => ({ ...prev, [dc.id]: qr }));
              } catch {
                /* */
              }
            }
          }

          // Sync any local-only predictions to the server
          if (localOnly.length > 0) {
            console.log(`[Init] Syncing ${localOnly.length} local-only predictions to server...`);
            try {
              await fetch("/api/predictions/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: recoveredUser.userId,
                  predictions: localOnly.map((lp) => ({
                    matchId: lp.matchId,
                    homeGoals: lp.homeGoals,
                    awayGoals: lp.awayGoals,
                    extraTimeHome: lp.extraTimeHome,
                    extraTimeAway: lp.extraTimeAway,
                    penaltiesHome: lp.penaltiesHome,
                    penaltiesAway: lp.penaltiesAway,
                    matchInfo: {
                      homeTeam: lp.homeTeam,
                      awayTeam: lp.awayTeam,
                      homeFlag: lp.homeFlag,
                      awayFlag: lp.awayFlag,
                    },
                  })),
                }),
              });
            } catch (syncErr) {
              console.warn("[Init] Sync failed:", syncErr);
            }
          }

          fetchMatches();
        } else if (data.authenticated && !data.user) {
          // Google session exists but user not registered in DB yet
          console.log("[Init] Google session active but not registered — showing registration");
          if (existingUser) {
            // We have a localStorage user, keep using it
            return;
          }
          // No localStorage user either — prompt to complete registration
          setLocalPredictions([]);
          setLocalDiscounts([]);
        }
      } catch (err) {
        console.error("[Init] recoverFromServerSession error:", err);
      }
    }

    initUser();
    return () => {
      cancelled = true;
    };
  }, [sessionStatus, session?.user?.email]);

  // Auto-refresh matches
  useEffect(() => {
    if (step === "matches" && user) {
      refreshInterval.current = setInterval(() => { fetchMatches(); }, 120000);
    }
    return () => { if (refreshInterval.current) clearInterval(refreshInterval.current); };
  }, [step, user]);

  // ─── Fetch predictions from server (cross-device sync) ───
  const fetchServerPredictions = useCallback(async (userId: string, userEmail?: string, localPreds?: LocalPrediction[]) => {
    try {
      // Skip for demo users (they can't have server predictions)
      if (String(userId).startsWith("demo_")) {
        console.log("[Sync] Demo user — skipping server fetch");
        return;
      }

      const res = await fetch(`/api/predictions/submit?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();

      const serverPreds: LocalPrediction[] = (data.predictions && Array.isArray(data.predictions) ? data.predictions : []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        matchId: (p.externalMatchId as string) || (p.matchId as string),
        userId,
        homeTeam: (p.homeTeam as string) || "Home",
        awayTeam: (p.awayTeam as string) || "Away",
        homeFlag: (p.homeFlag as string) || "⚽",
        awayFlag: (p.awayFlag as string) || "⚽",
        homeGoals: p.homeGoals as number,
        awayGoals: p.awayGoals as number,
        extraTimeHome: p.extraTimeHome as number | null,
        extraTimeAway: p.extraTimeAway as number | null,
        penaltiesHome: p.penaltiesHome as number | null,
        penaltiesAway: p.penaltiesAway as number | null,
        correct: p.correct as boolean | null,
        exactScore: p.exactScore as boolean | null,
        evaluatedAt: null,
        createdAt: p.createdAt as string,
      }));

      const email = userEmail || user?.email;
      const currentLocal = localPreds || loadLocalPredictions(email);

      // Find local predictions that don't exist on the server (by matchId)
      const localOnly = currentLocal.filter(
        (lp) => !serverPreds.some((sp) => sp.matchId === lp.matchId || (sp.homeTeam === lp.homeTeam && sp.awayTeam === lp.awayTeam))
      );

      // Sync local-only predictions to the server
      if (localOnly.length > 0 && !String(userId).startsWith("demo_")) {
        console.log(`[Sync] Found ${localOnly.length} local-only predictions, syncing to server...`);
        try {
          const syncBody = {
            userId,
            predictions: localOnly.map((lp) => ({
              matchId: lp.matchId,
              homeGoals: lp.homeGoals,
              awayGoals: lp.awayGoals,
              extraTimeHome: lp.extraTimeHome,
              extraTimeAway: lp.extraTimeAway,
              penaltiesHome: lp.penaltiesHome,
              penaltiesAway: lp.penaltiesAway,
              matchInfo: {
                homeTeam: lp.homeTeam,
                awayTeam: lp.awayTeam,
                homeFlag: lp.homeFlag,
                awayFlag: lp.awayFlag,
              },
            })),
          };
          const syncRes = await fetch("/api/predictions/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(syncBody),
          });
          const syncData = await syncRes.json();
          if (syncData.synced > 0) {
            console.log(`[Sync] ✅ Synced ${syncData.synced} predictions to server`);
          }
        } catch (syncErr) {
          console.warn("[Sync] Failed to sync local predictions:", syncErr);
        }
      }

      // Merge server + local predictions (server takes priority for same match)
      const merged = [...serverPreds, ...localOnly];
      if (merged.length > 0) {
        saveLocalPredictions(merged, email);
        setLocalPredictions(merged);
      }
      serverLoadedRef.current = true;

      if (data.discountCodes && Array.isArray(data.discountCodes) && data.discountCodes.length > 0) {
        const serverDiscounts: LocalDiscountCode[] = data.discountCodes.map((dc: Record<string, unknown>) => ({
          id: dc.id as string,
          userId,
          predictionId: dc.predictionId as string || "",
          code: dc.code as string,
          discountPct: dc.discountPct as number,
          homeTeam: "",
          awayTeam: "",
          expiresAt: dc.expiresAt as string,
          createdAt: dc.createdAt as string,
        }));

        const localDisc = loadLocalDiscounts(email);
        const localOnlyDisc = localDisc.filter(
          (ld) => !serverDiscounts.some((sd) => sd.predictionId === ld.predictionId || sd.code === ld.code)
        );
        const mergedDisc = [...serverDiscounts, ...localOnlyDisc];
        saveLocalDiscounts(mergedDisc, email);
        setLocalDiscounts(mergedDisc);

        for (const dc of serverDiscounts) {
          if (dc.code && !qrDataUrls[dc.id]) {
            try {
              const qr = await QRCode.toDataURL(dc.code, { width: 200, margin: 2, color: { dark: "#000000", light: "#ffffff" } });
              setQrDataUrls((prev) => ({ ...prev, [dc.id]: qr }));
            } catch { /* */ }
          }
        }
      }
    } catch (err) {
      console.error("Fetch server predictions error:", err);
    }
  }, []);

  // ─── Evaluate Predictions Against Match Results ───
  const evaluatePredictions = useCallback(async (predictions: LocalPrediction[], matches: MatchDisplayData[]) => {
    let updated = false;
    const newDiscounts: { predId: string; userId: string; discountPct: number; homeTeam: string; awayTeam: string }[] = [];

    const evaluated = predictions.map((pred) => {
      if (pred.correct !== null) return pred;

      const match = matches.find((m) => m.homeTeam === pred.homeTeam && m.awayTeam === pred.awayTeam);
      if (!match || match.status !== "finished" || match.homeScore === null || match.awayScore === null) return pred;

      let predWinner: string;
      if (pred.homeGoals > pred.awayGoals) predWinner = "home";
      else if (pred.awayGoals > pred.homeGoals) predWinner = "away";
      else predWinner = "draw";

      let actualWinner: string;
      if (match.homeScore > match.awayScore) actualWinner = "home";
      else if (match.awayScore > match.homeScore) actualWinner = "away";
      else actualWinner = "draw";

      const gotWinnerRight = predWinner === actualWinner;
      const gotExactScore = gotWinnerRight && pred.homeGoals === match.homeScore && pred.awayGoals === match.awayScore;

      updated = true;

      if (gotWinnerRight && pred.userId) {
        const existingDiscounts = loadLocalDiscounts(user?.email);
        if (!existingDiscounts.find((d) => d.predictionId === pred.id)) {
          newDiscounts.push({
            predId: pred.id,
            userId: pred.userId,
            discountPct: gotExactScore ? 10 : 5,
            homeTeam: pred.homeTeam,
            awayTeam: pred.awayTeam,
          });
        }
      }

      return { ...pred, correct: gotWinnerRight, exactScore: gotExactScore, evaluatedAt: new Date().toISOString() };
    });

    if (updated) {
      saveLocalPredictions(evaluated, user?.email);
      setLocalPredictions(evaluated);

      if (newDiscounts.length > 0) {
        const existingDiscounts = loadLocalDiscounts(user?.email);
        const toAdd: LocalDiscountCode[] = [];

        for (const disc of newDiscounts) {
          if (!existingDiscounts.find((d) => d.predictionId === disc.predId)) {
            const code = await generateDiscountCode(disc.userId, disc.predId, disc.discountPct);
            toAdd.push({
              id: `disc_${disc.predId}_${disc.discountPct}`,
              userId: disc.userId,
              predictionId: disc.predId,
              code,
              discountPct: disc.discountPct,
              homeTeam: disc.homeTeam,
              awayTeam: disc.awayTeam,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date().toISOString(),
            });
          }
        }

        if (toAdd.length > 0) {
          const allDiscounts = [...existingDiscounts, ...toAdd];
          saveLocalDiscounts(allDiscounts, user?.email);
          setLocalDiscounts(allDiscounts);

          for (const dc of toAdd) {
            try {
              const qr = await QRCode.toDataURL(dc.code, { width: 200, margin: 2, color: { dark: "#000000", light: "#ffffff" } });
              setQrDataUrls((prev) => ({ ...prev, [dc.id]: qr }));
            } catch { /* */ }
          }

          // Save evaluation to server
          if (user) {
            try {
              await fetch("/api/predictions/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  evaluations: newDiscounts.map((d) => ({
                    predictionId: d.predId,
                    userId: d.userId,
                    correct: true,
                    exactScore: d.discountPct === 10,
                    discountPct: d.discountPct,
                    homeTeam: d.homeTeam,
                    awayTeam: d.awayTeam,
                    email: user.email,
                  })),
                }),
              });
            } catch { /* server sync is best-effort */ }
          }
        }
      }
    }
  }, [user]);

  // ─── API Calls ───

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/predictions/matches");
      const data = await res.json();
      const allMatches = [...(data.today || []), ...(data.tomorrow || [])];
      if (data.today) setTodayMatches(data.today);
      if (data.tomorrow) setTomorrowMatches(data.tomorrow);
      if (data.isLive !== undefined) setIsLive(data.isLive);

      const currentPreds = loadLocalPredictions(user?.email);
      if (currentPreds.length > 0) evaluatePredictions(currentPreds, allMatches);
    } catch (err) {
      console.error("Fetch matches error:", err);
    }
  }, [evaluatePredictions]);

  // Generate QR codes for existing discounts on load
  useEffect(() => {
    const generateQRCodes = async () => {
      const discounts = loadLocalDiscounts(user?.email);
      for (const dc of discounts) {
        if (!qrDataUrls[dc.id] && dc.code) {
          try {
            const qr = await QRCode.toDataURL(dc.code, { width: 200, margin: 2, color: { dark: "#000000", light: "#ffffff" } });
            setQrDataUrls((prev) => ({ ...prev, [dc.id]: qr }));
          } catch { /* */ }
        }
      }
    };
    generateQRCodes();
  }, []);

  // ─── Google Sign-In ───

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("google", { callbackUrl: "/predicciones/auth", redirect: false });
      if (result?.error) {
        setError(`Error de Google: ${result.error}`);
        setLoading(false);
      } else if (result?.ok) {
        window.location.href = result?.url || "/predicciones/auth";
      }
    } catch {
      setError("Error al conectar con Google.");
      setLoading(false);
    }
  };

  // ─── Goal Input Management ───

  const getGoalInput = useCallback((matchId: string): GoalInputState => {
    return goalInputs[matchId] || DEFAULT_GOAL_INPUT;
  }, [goalInputs]);

  const updateGoalInput = useCallback((matchId: string, updates: Partial<GoalInputState>) => {
    setGoalInputs(prev => {
      const current = prev[matchId] || { ...DEFAULT_GOAL_INPUT };
      const updated = { ...current, ...updates };
      if (updated.homeGoals === updated.awayGoals && updated.homeGoals >= 0) {
        updated.showExtraTime = true;
      } else {
        updated.showExtraTime = false;
        updated.extraTimeHome = 0;
        updated.extraTimeAway = 0;
        updated.showPenalties = false;
        updated.penaltiesHome = 0;
        updated.penaltiesAway = 0;
      }
      if (updated.showExtraTime && updated.extraTimeHome === updated.extraTimeAway) {
        updated.showPenalties = true;
      } else if (updated.showExtraTime) {
        updated.showPenalties = false;
        updated.penaltiesHome = 0;
        updated.penaltiesAway = 0;
      }
      return { ...prev, [matchId]: updated };
    });
  }, []);

  // ─── Submit Prediction ───

  const handlePredict = useCallback(async (match: MatchDisplayData) => {
    if (!user) return;
    setError("");
    setPredictingMatchId(match.id);
    const input = getGoalInput(match.id);

    const existing = localPredictions.find(
      (p) => p.matchId === match.id || (p.homeTeam === match.homeTeam && p.awayTeam === match.awayTeam)
    );
    if (existing) {
      setError("Ya hiciste una predicción para este partido");
      setPredictingMatchId(null);
      return;
    }

    try {
      const body: Record<string, unknown> = {
        userId: user.userId,
        matchId: match.id,
        homeGoals: input.homeGoals,
        awayGoals: input.awayGoals,
        matchDate: match.matchDate,
        matchInfo: {
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          homeFlag: match.homeFlag,
          awayFlag: match.awayFlag,
          homeLogo: match.homeLogo,
          awayLogo: match.awayLogo,
          competition: match.competition,
          competitionLogo: match.competitionLogo,
          round: match.round,
        },
      };

      if (input.homeGoals === input.awayGoals) {
        body.extraTimeHome = input.extraTimeHome;
        body.extraTimeAway = input.extraTimeAway;
        if (input.extraTimeHome === input.extraTimeAway) {
          body.penaltiesHome = input.penaltiesHome;
          body.penaltiesAway = input.penaltiesAway;
        }
      }

      const res = await fetch("/api/predictions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      // The API now always returns success (never 500), but check for validation errors
      if (!res.ok && res.status !== 200) {
        setError(data.error || "Error al predecir");
        return;
      }

      const newPrediction: LocalPrediction = {
        id: data.prediction?.id || `pred_${match.id}_${Date.now()}`,
        matchId: data.prediction?.externalMatchId || data.prediction?.matchId || match.id,
        userId: user.userId,
        homeTeam: data.prediction?.match?.homeTeam || match.homeTeam,
        awayTeam: data.prediction?.match?.awayTeam || match.awayTeam,
        homeFlag: data.prediction?.match?.homeFlag || match.homeFlag || "⚽",
        awayFlag: data.prediction?.match?.awayFlag || match.awayFlag || "⚽",
        homeGoals: input.homeGoals,
        awayGoals: input.awayGoals,
        extraTimeHome: input.showExtraTime ? input.extraTimeHome : null,
        extraTimeAway: input.showExtraTime ? input.extraTimeAway : null,
        penaltiesHome: input.showPenalties ? input.penaltiesHome : null,
        penaltiesAway: input.showPenalties ? input.penaltiesAway : null,
        correct: null,
        exactScore: null,
        evaluatedAt: null,
        createdAt: new Date().toISOString(),
      };

      const updatedPredictions = [...localPredictions, newPrediction];
      saveLocalPredictions(updatedPredictions, user?.email);
      setLocalPredictions(updatedPredictions);

      setSuccess("¡Predicción registrada! Asegúrala por WhatsApp ↓");
      setTimeout(() => setSuccess(""), 5000);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setPredictingMatchId(null);
    }
  }, [user, localPredictions, getGoalInput]);

  // ─── Logout ───

  const handleLogout = () => {
    // Only remove the user session — predictions and discounts PERSIST per email
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setStep("register");
    setLocalPredictions([]);
    setLocalDiscounts([]);
    setQrDataUrls({});
  };

  // ─── Render Helpers ───

  const getStatusBadge = useCallback((match: MatchDisplayData) => {
    if (match.status === "finished" || match.shortStatus === "FT" || match.shortStatus === "PEN" || match.shortStatus === "AET") {
      return <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 text-xs font-medium">Fin ({match.shortStatus})</span>;
    }
    if (match.status === "live") {
      return (
        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          EN VIVO
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
        {match.timeVzla}
      </span>
    );
  }, []);

  // ─── Render ───

  // Banned-account gate (after all hooks, to respect rules-of-hooks).
  if (banned) {
    return <BannedNotice reason={bannedReason} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-white/30 hover:text-[#d4af37] transition-colors" title="Volver al catálogo">
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚽</span>
              <h1 className="text-sm font-bold tracking-tight">
                <span className="text-[#d4af37]">JOLIE</span> Predicciones
              </h1>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <a href="/" className="text-white/30 hover:text-[#d4af37] transition-colors flex items-center gap-1 text-xs" title="Catálogo de perfumes">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Catálogo</span>
              </a>
              <span className="text-[10px] text-white/40 truncate max-w-[100px]">{user.email}</span>
              <button onClick={handleLogout} className="text-white/30 hover:text-white/60 text-xs transition-colors">Salir</button>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <AnimatePresence>
        {(error || success) && (
          <div className={`mx-4 mt-3 p-3 rounded-xl text-sm flex items-center gap-2 ${
            error ? "bg-red-500/10 border border-red-500/20 text-red-400"
                   : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          }`}>
            {error ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{error || success}</span>
            <button onClick={() => { setError(""); setSuccess(""); }} className="shrink-0"><X className="w-3 h-3" /></button>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* ─── STEP: Register ─── */}
        {step === "register" && (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-[#d4af37]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Predicciones del Mundial</h2>
              <p className="text-white/40 text-sm max-w-xs mx-auto">
                Predice los goles y gana descuentos exclusivos en Jolie Fragrances
              </p>
            </div>

            {/* Google Sign-In */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 text-sm shadow-lg shadow-white/5 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Iniciar sesión con Google
                  </>
                )}
              </button>
            </div>

            {/* Discount Info */}
            <div className="bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#d4af37] text-center uppercase tracking-wider">
                ¿Cómo ganar descuentos?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-400 text-sm font-bold">5% de descuento</p>
                    <p className="text-white/40 text-xs mt-0.5">Si aciertas qué equipo gana el partido</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="text-[#d4af37] text-sm font-bold">10% de descuento</p>
                    <p className="text-white/40 text-xs mt-0.5">Si aciertas el marcador exacto del partido</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/5 pt-3 space-y-2">
                <p className="text-white/30 text-[11px] leading-relaxed">
                  <span className="text-white/50 font-medium">Descuentos por unidad:</span> Cada acierto te da descuento en una unidad de perfume. Si aciertas 3 veces, tienes 3 unidades con descuento.
                </p>
                <p className="text-white/30 text-[11px] leading-relaxed">
                  <span className="text-white/50 font-medium">Descuentos variados:</span> Si ganas 2 aciertos de 5% y 1 de 10%, tienes 2 unidades con 5% y 1 unidad con 10% de descuento.
                </p>
                <p className="text-white/30 text-[11px] leading-relaxed">
                  <span className="text-white/50 font-medium">No acumulable en una compra:</span> Los descuentos no se suman sobre un mismo perfume, se aplican por unidad individual.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP: Matches ─── */}
        {step === "matches" && (
          <div className="space-y-4">
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-xs font-medium">Partidos en vivo ahora</span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("today")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "today" ? "bg-[#d4af37] text-black" : "text-white/40 hover:text-white/60"}`}
              >Hoy</button>
              <button
                onClick={() => setActiveTab("tomorrow")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "tomorrow" ? "bg-[#d4af37] text-black" : "text-white/40 hover:text-white/60"}`}
              >Mañana</button>
            </div>

            {/* Match List */}
            <div className="space-y-3">
              <LayoutGroup>
                {(activeTab === "today" ? todayMatches : tomorrowMatches).length > 0 ? (
                  (activeTab === "today" ? todayMatches : tomorrowMatches).map((match) => {
                    const existingPred = localPredictions.find(
                      (p) => p.matchId === match.id || (p.homeTeam === match.homeTeam && p.awayTeam === match.awayTeam)
                    );
                    const goalInput = getGoalInput(match.id);
                    return (
                      <MatchCard
                        key={match.id}
                        match={match}
                        existingPred={existingPred}
                        goalInput={goalInput}
                        isPredicting={predictingMatchId === match.id}
                        onGoalChange={updateGoalInput}
                        onPredict={handlePredict}
                        getStatusBadge={getStatusBadge}
                        userEmail={user?.email || ""}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-white/30">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No hay partidos del Mundial programados</p>
                  </div>
                )}
              </LayoutGroup>
            </div>

            <button
              onClick={() => fetchMatches()}
              className="w-full py-2 text-white/20 text-xs hover:text-white/40 transition-colors flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Actualizar
            </button>

            {/* My Predictions */}
            {localPredictions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Trophy className="w-3 h-3 text-[#d4af37]" /> Mis Predicciones
                </h3>
                <div className="space-y-2">
                  {localPredictions.map((pred) => {
                    const isExact = pred.exactScore === true;
                    const isCorrect = pred.correct === true;
                    const isWrong = pred.correct === false;
                    const waLink = `https://wa.me/${JOLIE_WHATSAPP}?text=${buildWhatsAppMessage(pred, user?.email || "")}`;
                    return (
                      <div key={pred.id} className={`p-3 rounded-xl border ${
                        isExact ? "bg-[#d4af37]/5 border-[#d4af37]/20"
                        : isCorrect ? "bg-emerald-500/5 border-emerald-500/20"
                        : isWrong ? "bg-red-500/5 border-red-500/20"
                        : "bg-white/[0.02] border-white/5"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/70 truncate">
                              {pred.homeFlag || ""} {pred.homeTeam} vs {pred.awayFlag || ""} {pred.awayTeam}
                            </p>
                            <p className="text-xs text-white/30 mt-0.5">
                              Tu predicción: <span className="text-white/60 font-medium">{pred.homeGoals} - {pred.awayGoals}</span>
                              {pred.extraTimeHome !== null && (
                                <span className="text-yellow-400/60"> (ET: {pred.extraTimeHome}-{pred.extraTimeAway})</span>
                              )}
                              {pred.penaltiesHome !== null && (
                                <span className="text-rose-400/60"> (Pen: {pred.penaltiesHome}-{pred.penaltiesAway})</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isExact && <span className="flex items-center gap-1 text-[#d4af37] text-xs font-bold"><Trophy className="w-4 h-4" /> 10%</span>}
                            {isCorrect && !isExact && <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 className="w-4 h-4" /> 5%</span>}
                            {isWrong && <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-4 h-4" /> Fallaste</span>}
                            {pred.correct === null && <span className="flex items-center gap-1 text-white/30 text-xs"><Clock className="w-3 h-3" /> Pendiente</span>}
                          </div>
                        </div>
                        {/* WhatsApp secure button for each prediction */}
                        {pred.correct === null && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 w-full py-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] font-medium text-xs rounded-lg hover:bg-[#25D366]/20 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Asegurar por WhatsApp
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Discount Codes */}
            {localDiscounts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <QrCode className="w-3 h-3 text-[#d4af37]" /> Mis Descuentos
                </h3>
                <div className="space-y-3">
                  {localDiscounts.map((dc) => (
                    <div key={dc.id} className="p-4 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#d4af37] font-bold text-lg">{dc.discountPct}% DESCUENTO</span>
                        {(dc.homeTeam || dc.awayTeam) && (
                          <span className="text-white/30 text-xs">{dc.homeTeam} vs {dc.awayTeam}</span>
                        )}
                      </div>
                      {qrDataUrls[dc.id] && (
                        <div className="flex justify-center"><img src={qrDataUrls[dc.id]} alt="QR" className="w-40 h-40 rounded-lg" /></div>
                      )}
                      <p className="text-[10px] text-white/30 text-center mt-2">Muestra este QR en tienda para validar tu descuento</p>
                      <p className="text-[10px] text-white/20 text-center">Expira: {new Date(dc.expiresAt).toLocaleDateString("es-VE")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Back to catalog */}
            <div className="mt-6">
              <a
                href="/"
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm font-medium hover:bg-white/10 hover:text-[#d4af37] transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Ver catálogo de perfumes
              </a>
            </div>

            <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
              <Lock className="w-4 h-4 text-[#d4af37] mx-auto mb-1" />
              <p className="text-[10px] text-white/30">Las predicciones se guardan en tu cuenta de Google y se sincronizan entre dispositivos.</p>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-8 py-4 border-t border-white/5 text-center">
        <p className="text-[10px] text-white/20">Jolie Fragrances © 2026 — Sistema de Predicciones del Mundial</p>
      </footer>
    </div>
  );
}

// Wrap with Suspense because useSearchParams requires it
export default function PrediccionesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
        </div>
      }
    >
      <PrediccionesContent />
    </Suspense>
  );
}
