/**
 * src/lib/dbClient.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Raw @libsql/client wrapper that REPLACES Prisma for all DB operations.
 *
 * Why this exists:
 *   On Vercel, Prisma keeps failing with `URL_INVALID: The URL 'undefined'`
 *   even with `driverAdapters` enabled, `@prisma/adapter-libsql` installed,
 *   matching versions, and `binaryTargets` set. The raw @libsql/client
 *   connection works perfectly (rawLibsqlSuccess=true in /api/db-health), so
 *   the most robust fix is to bypass Prisma entirely and use @libsql/client
 *   directly with hand-written, SQLite-compatible SQL.
 *
 * Design:
 *   - Module-level singleton Client (cached across requests in serverless).
 *   - Returns `null` for not-found (matches Prisma's `findUnique` behavior).
 *   - Typed row interfaces mirror the Prisma models 1:1 (same field names,
 *     same nullability, Date objects instead of ISO strings).
 *   - SQLite stores DateTime as TEXT (ISO 8601) and Boolean as INTEGER (0/1).
 *     The mappers below convert libsql's raw values back to JS types.
 *   - For findMany with relations (Prediction+Match, Prediction+User), we use
 *     a two-query approach (predictions first, then related rows by id IN (...))
 *     which is simpler than aliased JOINs and avoids column-name collisions.
 *
 * Migration note for callers:
 *   Prisma throws `P2002` on unique-constraint violations. libsql throws a
 *   generic Error whose `message` contains "UNIQUE constraint failed: ...".
 *   Routes that previously checked `error.code === "P2002"` should instead
 *   check the error message for "UNIQUE constraint".
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient, type Client } from "@libsql/client";

// ─── Row type definitions (mirror Prisma models) ─────────────────────────────

export interface UserRow {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  image: string | null;
  ipHash: string | null;
  deviceFingerprint: string | null;
  authProvider: string;
  banned: boolean;
  bannedReason: string | null;
  createdAt: Date;
  phone: string | null;
  instagram: string | null;
}

export interface MatchRow {
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
  matchDate: Date;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
  shortStatus: string | null;
  round: string | null;
  lastSyncedAt: Date;
  createdAt: Date;
}

export interface PredictionRow {
  id: string;
  userId: string;
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  extraTimeHome: number | null;
  extraTimeAway: number | null;
  penaltiesHome: number | null;
  penaltiesAway: number | null;
  correct: boolean | null;
  exactScore: boolean | null;
  createdAt: Date;
}

export interface PredictionWithMatch extends PredictionRow {
  match: MatchRow;
}

export interface PredictionWithUser extends PredictionRow {
  user: UserRow;
}

export interface DiscountCodeRow {
  id: string;
  userId: string;
  predictionId: string | null;
  code: string;
  discountPct: number;
  verified: boolean;
  verifiedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface CartItemRow {
  id: string;
  userId: string;
  itemType: string; // "perfume" | "combo"
  itemId: string; // perfume.id (as string) or combo.id (string)
  price: number;
  quantity: number;
  discountCodeId: string | null; // which DiscountCode is assigned (null = none)
  createdAt: Date;
  updatedAt: Date;
}

// ─── CRM Row types (mirror Prisma CRM models 1:1) ────────────────────────────

export interface CustomerRow {
  id: string;
  userId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  channel: string;
  preferences: string | null;
  notes: string | null;
  tags: string | null;
  isVip: boolean;
  isBlocked: boolean;
  blockReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemRow {
  id: string;
  name: string;
  brand: string | null;
  olfativeProfile: string | null;
  size: string | null;
  cost: number | null;
  price: number;
  status: string;
  customerInterest: string | null;
  notes: string | null;
  acquiredAt: Date;
  soldAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DecantRow {
  id: string;
  sourcePerfume: string;
  sourceBrand: string | null;
  olfativeProfile: string | null;
  sizeMl: number;
  cost: number | null;
  price: number;
  status: string;
  filledAt: Date | null;
  soldAt: Date | null;
  customerId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleRow {
  id: string;
  customerId: string;
  inventoryItemId: string | null;
  decantId: string | null;
  itemType: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paid: number;
  pending: number;
  paymentMethod: string | null;
  paymentStatus: string;
  deliveryMethod: string | null;
  deliveryCost: number | null;
  saleDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DmRow {
  id: string;
  customerId: string | null;
  platform: string;
  username: string | null;
  fragranceInterest: string | null;
  inquiryType: string;
  status: string;
  nextStep: string | null;
  followUpDate: Date | null;
  closedAt: Date | null;
  result: string | null;
  notes: string | null;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DecantDropRow {
  id: string;
  name: string;
  description: string | null;
  comboPrice: number;
  regularPrice: number;
  targetAudience: string | null;
  status: string;
  launchedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DecantDropItemRow {
  id: string;
  dropId: string;
  decantId: string;
  sortOrder: number;
}

// ─── PerfumeCatalog row ─────────────────────────────────────────────────────
// One row per perfume in the storefront catalog. Mirrors the `perfumes` array
// in src/lib/perfumes.ts plus the price + availability + temporal-discount
// fields that the admin can edit at runtime via /admin → Catálogo tab.
// `price = null` means "No Disponible" (shown as such in the catalog).

export interface PerfumeCatalogRow {
  id: string; // TEXT PRIMARY KEY, format: "perf_123"
  perfumeId: number; // INTEGER UNIQUE — matches perfumes[].id
  name: string; // TEXT
  brand: string; // TEXT
  price: number | null; // REAL, nullable — null = No Disponible
  available: boolean; // INTEGER 0/1
  temporalDiscountPct: number; // INTEGER 0/5/10
  temporalDiscountLabel: string | null; // TEXT, nullable — e.g. "Oferta del día"
  notes: string | null; // TEXT, nullable
  updatedAt: Date; // DATETIME
  // ── Extended fields (added in Task 30 for admin perfume management) ──
  gender: string | null; // TEXT — "Dama" | "Caballero" | "Unisex"
  size: string | null; // TEXT — "100ml", "105ml", etc.
  fragranticaId: number | null; // INTEGER — for image fetching
  concentration: string | null; // TEXT, nullable — "EDP", "EDT", etc.
  brandSlug: string | null; // TEXT — for URL slugs
  perfumeSlug: string | null; // TEXT — for URL slugs
  isActive: boolean; // INTEGER 1=show in catalog, 0=hidden (soft delete)
}

// ─── Input types (mirror Prisma's `data:` shape for create/update) ───────────

export interface UserCreateInput {
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  authProvider?: string;
  ipHash?: string | null;
  deviceFingerprint?: string | null;
}

export interface UserUpdateInput {
  email?: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
  authProvider?: string;
  ipHash?: string | null;
  deviceFingerprint?: string | null;
  banned?: boolean;
  bannedReason?: string | null;
  phone?: string | null;
  instagram?: string | null;
}

export interface MatchCreateInput {
  externalId?: string | null;
  homeTeam: string;
  awayTeam: string;
  homeFlag?: string | null;
  awayFlag?: string | null;
  homeLogo?: string | null;
  awayLogo?: string | null;
  competition: string;
  competitionLogo?: string | null;
  matchDate: Date;
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  winner?: string | null;
  shortStatus?: string | null;
  round?: string | null;
}

export interface MatchUpsertInput extends MatchCreateInput {
  // externalId is used as the upsert key (must be set)
  externalId: string;
}

export interface MatchUpdateInput {
  externalId?: string | null;
  status?: string;
  winner?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  shortStatus?: string | null;
  homeTeam?: string;
  awayTeam?: string;
  homeFlag?: string | null;
  awayFlag?: string | null;
  homeLogo?: string | null;
  awayLogo?: string | null;
  competition?: string;
  competitionLogo?: string | null;
  matchDate?: Date;
  round?: string | null;
  lastSyncedAt?: Date;
}

export interface PredictionCreateInput {
  userId: string;
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  extraTimeHome?: number | null;
  extraTimeAway?: number | null;
  penaltiesHome?: number | null;
  penaltiesAway?: number | null;
}

export interface PredictionUpdateInput {
  correct?: boolean | null;
  exactScore?: boolean | null;
  homeGoals?: number;
  awayGoals?: number;
  extraTimeHome?: number | null;
  extraTimeAway?: number | null;
  penaltiesHome?: number | null;
  penaltiesAway?: number | null;
}

export interface DiscountCodeCreateInput {
  userId: string;
  predictionId?: string | null;
  code: string;
  discountPct?: number;
  verified?: boolean;
  verifiedAt?: Date | null;
  expiresAt: Date;
}

// ─── CRM Input types ──────────────────────────────────────────────────────────

export interface CustomerCreateInput {
  userId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
  channel?: string;
  preferences?: string | null;
  notes?: string | null;
  tags?: string | null;
  isVip?: boolean;
  isBlocked?: boolean;
  blockReason?: string | null;
}

export interface CustomerUpdateInput {
  userId?: string | null;
  name?: string;
  email?: string | null;
  phone?: string | null;
  instagram?: string | null;
  channel?: string;
  preferences?: string | null;
  notes?: string | null;
  tags?: string | null;
  isVip?: boolean;
  isBlocked?: boolean;
  blockReason?: string | null;
}

export interface InventoryItemCreateInput {
  name: string;
  brand?: string | null;
  olfativeProfile?: string | null;
  size?: string | null;
  cost?: number | null;
  price: number;
  status?: string;
  customerInterest?: string | null;
  notes?: string | null;
  acquiredAt?: Date | null;
}

export interface InventoryItemUpdateInput {
  name?: string;
  brand?: string | null;
  olfativeProfile?: string | null;
  size?: string | null;
  cost?: number | null;
  price?: number;
  status?: string;
  customerInterest?: string | null;
  notes?: string | null;
  soldAt?: Date | null;
}

export interface DecantCreateInput {
  sourcePerfume: string;
  sourceBrand?: string | null;
  olfativeProfile?: string | null;
  sizeMl?: number;
  cost?: number | null;
  price?: number;
  status?: string;
  filledAt?: Date | null;
  soldAt?: Date | null;
  customerId?: string | null;
  notes?: string | null;
}

export interface DecantUpdateInput {
  sourcePerfume?: string;
  sourceBrand?: string | null;
  olfativeProfile?: string | null;
  sizeMl?: number;
  cost?: number | null;
  price?: number;
  status?: string;
  filledAt?: Date | null;
  soldAt?: Date | null;
  customerId?: string | null;
  notes?: string | null;
}

export interface SaleCreateInput {
  customerId: string;
  inventoryItemId?: string | null;
  decantId?: string | null;
  itemType: string;
  itemName: string;
  quantity?: number;
  unitPrice: number;
  totalPrice: number;
  paid: number;
  pending?: number;
  paymentMethod?: string | null;
  paymentStatus?: string;
  deliveryMethod?: string | null;
  deliveryCost?: number | null;
  saleDate?: Date;
  notes?: string | null;
}

export interface SaleUpdateInput {
  notes?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: string;
  deliveryMethod?: string | null;
  deliveryCost?: number | null;
  paid?: number;
  pending?: number;
}

export interface DmCreateInput {
  customerId?: string | null;
  platform: string;
  username?: string | null;
  fragranceInterest?: string | null;
  inquiryType: string;
  status?: string;
  nextStep?: string | null;
  followUpDate?: Date | null;
  notes?: string | null;
  receivedAt?: Date;
}

export interface DmUpdateInput {
  customerId?: string | null;
  platform?: string;
  username?: string | null;
  fragranceInterest?: string | null;
  inquiryType?: string;
  status?: string;
  nextStep?: string | null;
  followUpDate?: Date | null;
  closedAt?: Date | null;
  result?: string | null;
  notes?: string | null;
}

export interface DecantDropCreateInput {
  name: string;
  description?: string | null;
  comboPrice: number;
  regularPrice: number;
  targetAudience?: string | null;
  status?: string;
  launchedAt?: Date | null;
}

export interface DecantDropUpdateInput {
  name?: string;
  description?: string | null;
  comboPrice?: number;
  regularPrice?: number;
  targetAudience?: string | null;
  status?: string;
  launchedAt?: Date | null;
}

// ─── PerfumeCatalog input types ──────────────────────────────────────────────

export interface PerfumeCatalogUpdateInput {
  price?: number | null; // null = No Disponible
  available?: boolean;
  temporalDiscountPct?: number; // 0 / 5 / 10
  temporalDiscountLabel?: string | null;
  notes?: string | null;
  // ── Extended fields (Task 30) ──
  name?: string;
  brand?: string;
  gender?: string | null;
  size?: string | null;
  fragranticaId?: number | null;
  concentration?: string | null;
  brandSlug?: string | null;
  perfumeSlug?: string | null;
  isActive?: boolean;
}

export interface PerfumeCatalogBulkUpdateItem extends PerfumeCatalogUpdateInput {
  perfumeId: number;
}

export interface PerfumeCatalogCreateInput {
  perfumeId: number;
  name: string;
  brand: string;
  price?: number | null;
  available?: boolean;
  temporalDiscountPct?: number;
  temporalDiscountLabel?: string | null;
  notes?: string | null;
  gender?: string | null;
  size?: string | null;
  fragranticaId?: number | null;
  concentration?: string | null;
  brandSlug?: string | null;
  perfumeSlug?: string | null;
  isActive?: boolean;
}

// ─── Match findMany options ───────────────────────────────────────────────────

export interface MatchFindManyOptions {
  where?: {
    status?: string;
    externalIdIn?: string[];
  };
  orderBy?: {
    matchDate?: "asc" | "desc";
    createdAt?: "asc" | "desc";
  };
  limit?: number;
}

// ─── Singleton libsql client ─────────────────────────────────────────────────

let _client: Client | null = null;
let _isAvailable = false;
let _lastInitAttempt = 0;
const RETRY_INTERVAL_MS = 30_000; // retry init every 30s after a failure

/**
 * Get the cached libsql Client, initializing on first call.
 * Returns null if env vars are missing or the URL is invalid — the caller
 * should then fall back to demo mode (mirrors `getDb()` returning null).
 */
function getRawClient(): Client | null {
  if (_client && _isAvailable) return _client;

  const now = Date.now();
  if (!_isAvailable && _lastInitAttempt > 0 && now - _lastInitAttempt < RETRY_INTERVAL_MS) {
    return null; // throttled retry
  }
  _lastInitAttempt = now;

  try {
    const tursoUrl = (process.env.TURSO_DATABASE_URL || "").trim();
    const dbUrl = (process.env.DATABASE_URL || "").trim();

    // Prefer TURSO_DATABASE_URL, fall back to DATABASE_URL if it's a libsql:// URL
    let url = "";
    let authToken = "";

    if (tursoUrl.startsWith("libsql://")) {
      url = tursoUrl;
      authToken = (process.env.TURSO_AUTH_TOKEN || "").trim();
    } else if (dbUrl.startsWith("libsql://")) {
      url = dbUrl;
      authToken = (process.env.TURSO_AUTH_TOKEN || "").trim();
    } else if (dbUrl.startsWith("file:")) {
      // Local SQLite file for development (no auth token needed)
      url = dbUrl;
      authToken = "";
    } else {
      // No usable URL
      _client = null;
      _isAvailable = false;
      return null;
    }

    if (url.startsWith("libsql://") && !authToken) {
      console.warn("[rawDb] TURSO_AUTH_TOKEN not set — cannot connect to Turso");
      _client = null;
      _isAvailable = false;
      return null;
    }

    _client = createClient(authToken ? { url, authToken } : { url });
    _isAvailable = true;
    console.log(
      "[rawDb] Connected via @libsql/client to:",
      url.substring(0, 50) + (url.length > 50 ? "..." : "")
    );
    return _client;
  } catch (err) {
    console.warn("[rawDb] libsql client initialization failed:", err);
    _client = null;
    _isAvailable = false;
    return null;
  }
}

/**
 * Check if the raw libsql client is available (env vars set + init succeeded).
 * Triggers a (throttled) init attempt if not yet available.
 */
export function isRawDbAvailable(): boolean {
  if (_isAvailable && _client) return true;
  return getRawClient() !== null;
}

/**
 * Get the underlying libsql Client (or null). Exposed so callers can run
 * custom SQL or `batch()` calls if needed.
 */
export function getRawDbClient(): Client | null {
  return getRawClient();
}

/**
 * Reset cached state (useful after env var changes or in tests).
 */
export function resetRawDbClient(): void {
  _client = null;
  _isAvailable = false;
  _lastInitAttempt = 0;
}

// ─── Value conversion helpers ────────────────────────────────────────────────
// libsql returns: string | number | bigint | boolean | null | Uint8Array
// Prisma's SQLite stores DateTime as TEXT (ISO 8601) and Boolean as INTEGER (0/1).

function toDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "bigint") {
    const d = new Date(Number(value));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function toBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "bigint") return value !== BigInt(0);
  if (typeof value === "string") {
    if (value === "1" || value.toLowerCase() === "true") return true;
    if (value === "0" || value.toLowerCase() === "false") return false;
    return Boolean(value);
  }
  return Boolean(value);
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const n = Number(value);
    return isNaN(n) ? null : n;
  }
  if (typeof value === "boolean") return value ? 1 : 0;
  return null;
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  return String(value);
}

function toNonNullString(value: unknown, fallback = ""): string {
  const s = toStringOrNull(value);
  return s ?? fallback;
}

/**
 * Convert a Date | string | null to an ISO string for SQL binding.
 * Returns null if the input is null/undefined.
 */
function dateToSqlValue(value: Date | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  return value.toISOString();
}

// ─── Row mappers ─────────────────────────────────────────────────────────────

type DbRow = Record<string, unknown>;

function mapUserRow(row: DbRow): UserRow {
  return {
    id: toNonNullString(row.id),
    email: toNonNullString(row.email),
    emailVerified: toDate(row.emailVerified),
    name: toStringOrNull(row.name),
    image: toStringOrNull(row.image),
    ipHash: toStringOrNull(row.ipHash),
    deviceFingerprint: toStringOrNull(row.deviceFingerprint),
    authProvider: toNonNullString(row.authProvider, "otp"),
    banned: toBoolean(row.banned) ?? false,
    bannedReason: toStringOrNull(row.bannedReason),
    createdAt: toDate(row.createdAt) ?? new Date(),
    phone: toStringOrNull(row.phone),
    instagram: toStringOrNull(row.instagram),
  };
}

function mapMatchRow(row: DbRow): MatchRow {
  return {
    id: toNonNullString(row.id),
    externalId: toStringOrNull(row.externalId),
    homeTeam: toNonNullString(row.homeTeam),
    awayTeam: toNonNullString(row.awayTeam),
    homeFlag: toStringOrNull(row.homeFlag),
    awayFlag: toStringOrNull(row.awayFlag),
    homeLogo: toStringOrNull(row.homeLogo),
    awayLogo: toStringOrNull(row.awayLogo),
    competition: toNonNullString(row.competition),
    competitionLogo: toStringOrNull(row.competitionLogo),
    matchDate: toDate(row.matchDate) ?? new Date(),
    status: toNonNullString(row.status, "upcoming"),
    homeScore: toNumber(row.homeScore),
    awayScore: toNumber(row.awayScore),
    winner: toStringOrNull(row.winner),
    shortStatus: toStringOrNull(row.shortStatus),
    round: toStringOrNull(row.round),
    lastSyncedAt: toDate(row.lastSyncedAt) ?? new Date(),
    createdAt: toDate(row.createdAt) ?? new Date(),
  };
}

function mapPredictionRow(row: DbRow): PredictionRow {
  return {
    id: toNonNullString(row.id),
    userId: toNonNullString(row.userId),
    matchId: toNonNullString(row.matchId),
    homeGoals: toNumber(row.homeGoals) ?? 0,
    awayGoals: toNumber(row.awayGoals) ?? 0,
    extraTimeHome: toNumber(row.extraTimeHome),
    extraTimeAway: toNumber(row.extraTimeAway),
    penaltiesHome: toNumber(row.penaltiesHome),
    penaltiesAway: toNumber(row.penaltiesAway),
    correct: toBoolean(row.correct),
    exactScore: toBoolean(row.exactScore),
    createdAt: toDate(row.createdAt) ?? new Date(),
  };
}

function mapDiscountCodeRow(row: DbRow): DiscountCodeRow {
  return {
    id: toNonNullString(row.id),
    userId: toNonNullString(row.userId),
    predictionId: toStringOrNull(row.predictionId),
    code: toNonNullString(row.code),
    discountPct: toNumber(row.discountPct) ?? 10,
    verified: toBoolean(row.verified) ?? false,
    verifiedAt: toDate(row.verifiedAt),
    expiresAt: toDate(row.expiresAt) ?? new Date(),
    createdAt: toDate(row.createdAt) ?? new Date(),
  };
}

function mapCartItemRow(row: DbRow): CartItemRow {
  return {
    id: toNonNullString(row.id),
    userId: toNonNullString(row.userId),
    itemType: toNonNullString(row.itemType, "perfume"),
    itemId: toNonNullString(row.itemId),
    price: toNumber(row.price) ?? 0,
    quantity: toNumber(row.quantity) ?? 1,
    discountCodeId: toStringOrNull(row.discountCodeId),
    createdAt: toDate(row.createdAt) ?? new Date(),
    updatedAt: toDate(row.updatedAt) ?? new Date(),
  };
}

// ─── CRM Row mappers ──────────────────────────────────────────────────────────

function mapCustomerRow(row: DbRow): CustomerRow {
  return {
    id: toNonNullString(row.id),
    userId: toStringOrNull(row.userId),
    name: toNonNullString(row.name),
    email: toStringOrNull(row.email),
    phone: toStringOrNull(row.phone),
    instagram: toStringOrNull(row.instagram),
    channel: toNonNullString(row.channel, "whatsapp"),
    preferences: toStringOrNull(row.preferences),
    notes: toStringOrNull(row.notes),
    tags: toStringOrNull(row.tags),
    isVip: toBoolean(row.isVip) ?? false,
    isBlocked: toBoolean(row.isBlocked) ?? false,
    blockReason: toStringOrNull(row.blockReason),
    createdAt: toDate(row.createdAt) ?? new Date(),
    updatedAt: toDate(row.updatedAt) ?? new Date(),
  };
}

function mapInventoryItemRow(row: DbRow): InventoryItemRow {
  return {
    id: toNonNullString(row.id),
    name: toNonNullString(row.name),
    brand: toStringOrNull(row.brand),
    olfativeProfile: toStringOrNull(row.olfativeProfile),
    size: toStringOrNull(row.size),
    cost: row.cost === null || row.cost === undefined ? null : toNumber(row.cost),
    price: toNumber(row.price) ?? 0,
    status: toNonNullString(row.status, "available"),
    customerInterest: toStringOrNull(row.customerInterest),
    notes: toStringOrNull(row.notes),
    acquiredAt: toDate(row.acquiredAt) ?? new Date(),
    soldAt: toDate(row.soldAt),
    createdAt: toDate(row.createdAt) ?? new Date(),
    updatedAt: toDate(row.updatedAt) ?? new Date(),
  };
}

function mapDecantRow(row: DbRow): DecantRow {
  return {
    id: toNonNullString(row.id),
    sourcePerfume: toNonNullString(row.sourcePerfume),
    sourceBrand: toStringOrNull(row.sourceBrand),
    olfativeProfile: toStringOrNull(row.olfativeProfile),
    sizeMl: toNumber(row.sizeMl) ?? 10,
    cost: row.cost === null || row.cost === undefined ? null : toNumber(row.cost),
    price: toNumber(row.price) ?? 12,
    status: toNonNullString(row.status, "pending"),
    filledAt: toDate(row.filledAt),
    soldAt: toDate(row.soldAt),
    customerId: toStringOrNull(row.customerId),
    notes: toStringOrNull(row.notes),
    createdAt: toDate(row.createdAt) ?? new Date(),
    updatedAt: toDate(row.updatedAt) ?? new Date(),
  };
}

function mapSaleRow(row: DbRow): SaleRow {
  return {
    id: toNonNullString(row.id),
    customerId: toNonNullString(row.customerId),
    inventoryItemId: toStringOrNull(row.inventoryItemId),
    decantId: toStringOrNull(row.decantId),
    itemType: toNonNullString(row.itemType),
    itemName: toNonNullString(row.itemName),
    quantity: toNumber(row.quantity) ?? 1,
    unitPrice: toNumber(row.unitPrice) ?? 0,
    totalPrice: toNumber(row.totalPrice) ?? 0,
    paid: toNumber(row.paid) ?? 0,
    pending: toNumber(row.pending) ?? 0,
    paymentMethod: toStringOrNull(row.paymentMethod),
    paymentStatus: toNonNullString(row.paymentStatus, "paid"),
    deliveryMethod: toStringOrNull(row.deliveryMethod),
    deliveryCost:
      row.deliveryCost === null || row.deliveryCost === undefined
        ? null
        : toNumber(row.deliveryCost),
    saleDate: toDate(row.saleDate) ?? new Date(),
    notes: toStringOrNull(row.notes),
    createdAt: toDate(row.createdAt) ?? new Date(),
    updatedAt: toDate(row.updatedAt) ?? new Date(),
  };
}

function mapDmRow(row: DbRow): DmRow {
  return {
    id: toNonNullString(row.id),
    customerId: toStringOrNull(row.customerId),
    platform: toNonNullString(row.platform),
    username: toStringOrNull(row.username),
    fragranceInterest: toStringOrNull(row.fragranceInterest),
    inquiryType: toNonNullString(row.inquiryType),
    status: toNonNullString(row.status, "new"),
    nextStep: toStringOrNull(row.nextStep),
    followUpDate: toDate(row.followUpDate),
    closedAt: toDate(row.closedAt),
    result: toStringOrNull(row.result),
    notes: toStringOrNull(row.notes),
    receivedAt: toDate(row.receivedAt) ?? new Date(),
    createdAt: toDate(row.createdAt) ?? new Date(),
    updatedAt: toDate(row.updatedAt) ?? new Date(),
  };
}

function mapDecantDropRow(row: DbRow): DecantDropRow {
  return {
    id: toNonNullString(row.id),
    name: toNonNullString(row.name),
    description: toStringOrNull(row.description),
    comboPrice: toNumber(row.comboPrice) ?? 0,
    regularPrice: toNumber(row.regularPrice) ?? 0,
    targetAudience: toStringOrNull(row.targetAudience),
    status: toNonNullString(row.status, "draft"),
    launchedAt: toDate(row.launchedAt),
    createdAt: toDate(row.createdAt) ?? new Date(),
    updatedAt: toDate(row.updatedAt) ?? new Date(),
  };
}

function mapDecantDropItemRow(row: DbRow): DecantDropItemRow {
  return {
    id: toNonNullString(row.id),
    dropId: toNonNullString(row.dropId),
    decantId: toNonNullString(row.decantId),
    sortOrder: toNumber(row.sortOrder) ?? 0,
  };
}

function mapPerfumeCatalogRow(row: DbRow): PerfumeCatalogRow {
  return {
    id: toNonNullString(row.id),
    perfumeId: toNumber(row.perfumeId) ?? 0,
    name: toNonNullString(row.name),
    brand: toNonNullString(row.brand),
    price:
      row.price === null || row.price === undefined
        ? null
        : toNumber(row.price),
    available: toBoolean(row.available) ?? true,
    temporalDiscountPct: toNumber(row.temporalDiscountPct) ?? 0,
    temporalDiscountLabel: toStringOrNull(row.temporalDiscountLabel),
    notes: toStringOrNull(row.notes),
    updatedAt: toDate(row.updatedAt) ?? new Date(),
    // ── Extended fields (Task 30) ──
    gender: toStringOrNull(row.gender),
    size: toStringOrNull(row.size),
    fragranticaId:
      row.fragranticaId === null || row.fragranticaId === undefined
        ? null
        : toNumber(row.fragranticaId) ?? null,
    concentration: toStringOrNull(row.concentration),
    brandSlug: toStringOrNull(row.brandSlug),
    perfumeSlug: toStringOrNull(row.perfumeSlug),
    isActive: toBoolean(row.isActive) ?? true,
  };
}

// ─── ID generation ───────────────────────────────────────────────────────────

/**
 * Generate a unique ID to replace Prisma's `@default(cuid())`.
 * Uses crypto.randomUUID() when available (Node 19+, all modern browsers,
 * and all Vercel serverless runtimes), with a time+random fallback.
 */
function generateId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // crypto may be undefined in some runtimes — fall through
  }
  return (
    "id_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 12)
  );
}

// ─── Query result extraction helpers ─────────────────────────────────────────

/**
 * Extract a single row from a libsql ResultSet, or null if empty.
 */
function extractOne(rows: readonly DbRow[]): DbRow | null {
  return rows.length > 0 ? (rows[0] as DbRow) : null;
}

// ─── rawDb: the typed client object ──────────────────────────────────────────

export const rawDb = {
  // ─── User operations ──────────────────────────────────────────────────────
  user: {
    /**
     * Find a user by email (case-sensitive — callers should normalize first).
     * Mirrors `db.user.findUnique({ where: { email } })`.
     */
    async findUniqueByEmail(email: string): Promise<UserRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM User WHERE email = ? LIMIT 1",
        args: [email],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapUserRow(row) : null;
    },

    /**
     * Find a user by id. Mirrors `db.user.findUnique({ where: { id } })`.
     */
    async findById(id: string): Promise<UserRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM User WHERE id = ? LIMIT 1",
        args: [id],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapUserRow(row) : null;
    },

    /**
     * Find the first user matching the given ipHash (excluding the sentinel
     * "pending" value). Used by /api/predictions/google-register for
     * anti-multi-account detection.
     */
    async findFirstByIpHash(ipHash: string): Promise<UserRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM User WHERE ipHash = ? AND ipHash != 'pending' LIMIT 1",
        args: [ipHash],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapUserRow(row) : null;
    },

    /**
     * Find the first user matching the given deviceFingerprint.
     * Used by /api/predictions/google-register for anti-multi-account detection.
     */
    async findFirstByDeviceFingerprint(fingerprint: string): Promise<UserRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM User WHERE deviceFingerprint = ? LIMIT 1",
        args: [fingerprint],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapUserRow(row) : null;
    },

    /**
     * Create a new user. Generates a UUID id (replaces Prisma's cuid()).
     * Mirrors `db.user.create({ data })`.
     * Throws on UNIQUE constraint violation (e.g. duplicate email).
     */
    async create(data: UserCreateInput): Promise<UserRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot create user");
      const id = generateId();
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO User
          (id, email, emailVerified, name, image, ipHash, deviceFingerprint, authProvider, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.email,
          dateToSqlValue(data.emailVerified ?? null),
          data.name ?? null,
          data.image ?? null,
          data.ipHash ?? null,
          data.deviceFingerprint ?? null,
          data.authProvider ?? "otp",
          now,
        ],
      });
      // Re-read to get canonical row (in case of default-value differences)
      const created = await this.findById(id);
      if (!created) {
        // Should never happen — return a constructed row as fallback
        return {
          id,
          email: data.email,
          emailVerified: data.emailVerified ?? null,
          name: data.name ?? null,
          image: data.image ?? null,
          ipHash: data.ipHash ?? null,
          deviceFingerprint: data.deviceFingerprint ?? null,
          authProvider: data.authProvider ?? "otp",
          banned: false,
          bannedReason: null,
          phone: null,
          instagram: null,
          createdAt: new Date(now),
        };
      }
      return created;
    },

    /**
     * Update a user by id. Only the supplied fields are updated.
     * Mirrors `db.user.update({ where: { id }, data })`.
     * Returns the updated row (or null if id not found).
     */
    async update(id: string, data: UserUpdateInput): Promise<UserRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot update user");
      const setClauses: string[] = [];
      const args: (string | number | null)[] = [];

      if (data.email !== undefined) {
        setClauses.push("email = ?");
        args.push(data.email);
      }
      if (data.emailVerified !== undefined) {
        setClauses.push("emailVerified = ?");
        args.push(dateToSqlValue(data.emailVerified));
      }
      if (data.name !== undefined) {
        setClauses.push("name = ?");
        args.push(data.name);
      }
      if (data.image !== undefined) {
        setClauses.push("image = ?");
        args.push(data.image);
      }
      if (data.authProvider !== undefined) {
        setClauses.push("authProvider = ?");
        args.push(data.authProvider);
      }
      if (data.ipHash !== undefined) {
        setClauses.push("ipHash = ?");
        args.push(data.ipHash);
      }
      if (data.deviceFingerprint !== undefined) {
        setClauses.push("deviceFingerprint = ?");
        args.push(data.deviceFingerprint);
      }
      if (data.banned !== undefined) {
        setClauses.push("banned = ?");
        args.push(data.banned ? 1 : 0);
      }
      if (data.bannedReason !== undefined) {
        setClauses.push("bannedReason = ?");
        args.push(data.bannedReason);
      }
      if (data.phone !== undefined) {
        setClauses.push("phone = ?");
        args.push(data.phone);
      }
      if (data.instagram !== undefined) {
        setClauses.push("instagram = ?");
        args.push(data.instagram);
      }

      if (setClauses.length === 0) {
        // Nothing to update — just return the current row
        return this.findById(id);
      }

      args.push(id);
      await client.execute({
        sql: `UPDATE User SET ${setClauses.join(", ")} WHERE id = ?`,
        args,
      });

      return this.findById(id);
    },

    /**
     * Count all users. Mirrors `db.user.count()`.
     */
    async count(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute("SELECT COUNT(*) AS cnt FROM User");
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },

    /**
     * Find all users, newest first. Mirrors
     * `db.user.findMany({ orderBy: { createdAt: "desc" } })`.
     * Used by the /admin panel to list every registered user.
     * Optional `limit` caps the result count (defaults to 500).
     */
    async findMany(limit = 500): Promise<UserRow[]> {
      const client = getRawClient();
      if (!client) return [];
      const rs = await client.execute({
        sql: "SELECT * FROM User ORDER BY createdAt DESC LIMIT ?",
        args: [Math.max(1, Math.min(5000, Number(limit) || 500))],
      });
      return (rs.rows as DbRow[]).map(mapUserRow);
    },
  },

  // ─── Match operations ─────────────────────────────────────────────────────
  match: {
    /**
     * Find a match by id.
     */
    async findById(id: string): Promise<MatchRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM Match WHERE id = ? LIMIT 1",
        args: [id],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapMatchRow(row) : null;
    },

    /**
     * Find a match by externalId (API-Football / ESPN fixture id).
     * Mirrors `db.match.findUnique({ where: { externalId } })`.
     */
    async findByExternalId(externalId: string): Promise<MatchRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM Match WHERE externalId = ? LIMIT 1",
        args: [externalId],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapMatchRow(row) : null;
    },

    /**
     * Create a new match. Generates a UUID id.
     */
    async create(data: MatchCreateInput): Promise<MatchRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot create match");
      const id = generateId();
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO Match
          (id, externalId, homeTeam, awayTeam, homeFlag, awayFlag, homeLogo, awayLogo,
           competition, competitionLogo, matchDate, status, homeScore, awayScore,
           winner, shortStatus, round, lastSyncedAt, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.externalId ?? null,
          data.homeTeam,
          data.awayTeam,
          data.homeFlag ?? null,
          data.awayFlag ?? null,
          data.homeLogo ?? null,
          data.awayLogo ?? null,
          data.competition,
          data.competitionLogo ?? null,
          dateToSqlValue(data.matchDate) ?? now,
          data.status ?? "upcoming",
          data.homeScore ?? null,
          data.awayScore ?? null,
          data.winner ?? null,
          data.shortStatus ?? null,
          data.round ?? null,
          now, // lastSyncedAt
          now, // createdAt
        ],
      });
      const created = await this.findById(id);
      if (!created) {
        return {
          id,
          externalId: data.externalId ?? null,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam,
          homeFlag: data.homeFlag ?? null,
          awayFlag: data.awayFlag ?? null,
          homeLogo: data.homeLogo ?? null,
          awayLogo: data.awayLogo ?? null,
          competition: data.competition,
          competitionLogo: data.competitionLogo ?? null,
          matchDate: data.matchDate,
          status: data.status ?? "upcoming",
          homeScore: data.homeScore ?? null,
          awayScore: data.awayScore ?? null,
          winner: data.winner ?? null,
          shortStatus: data.shortStatus ?? null,
          round: data.round ?? null,
          lastSyncedAt: new Date(now),
          createdAt: new Date(now),
        };
      }
      return created;
    },

    /**
     * Upsert a match by externalId. If a match with the given externalId
     * exists, return it; otherwise create a new one.
     * Mirrors the findOrCreate pattern used in submit/route.ts and sync/route.ts.
     */
    async upsert(data: MatchUpsertInput): Promise<MatchRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot upsert match");
      const existing = await this.findByExternalId(data.externalId);
      if (existing) return existing;
      return this.create(data);
    },

    /**
     * Update a match by id. Used by /api/predictions/results to set the
     * final score, winner, and status="finished".
     */
    async update(id: string, data: MatchUpdateInput): Promise<MatchRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot update match");
      const setClauses: string[] = [];
      const args: (string | number | null)[] = [];

      if (data.externalId !== undefined) {
        setClauses.push("externalId = ?");
        args.push(data.externalId);
      }
      if (data.homeTeam !== undefined) {
        setClauses.push("homeTeam = ?");
        args.push(data.homeTeam);
      }
      if (data.awayTeam !== undefined) {
        setClauses.push("awayTeam = ?");
        args.push(data.awayTeam);
      }
      if (data.homeFlag !== undefined) {
        setClauses.push("homeFlag = ?");
        args.push(data.homeFlag);
      }
      if (data.awayFlag !== undefined) {
        setClauses.push("awayFlag = ?");
        args.push(data.awayFlag);
      }
      if (data.homeLogo !== undefined) {
        setClauses.push("homeLogo = ?");
        args.push(data.homeLogo);
      }
      if (data.awayLogo !== undefined) {
        setClauses.push("awayLogo = ?");
        args.push(data.awayLogo);
      }
      if (data.competition !== undefined) {
        setClauses.push("competition = ?");
        args.push(data.competition);
      }
      if (data.competitionLogo !== undefined) {
        setClauses.push("competitionLogo = ?");
        args.push(data.competitionLogo);
      }
      if (data.matchDate !== undefined) {
        setClauses.push("matchDate = ?");
        args.push(dateToSqlValue(data.matchDate));
      }
      if (data.status !== undefined) {
        setClauses.push("status = ?");
        args.push(data.status);
      }
      if (data.homeScore !== undefined) {
        setClauses.push("homeScore = ?");
        args.push(data.homeScore);
      }
      if (data.awayScore !== undefined) {
        setClauses.push("awayScore = ?");
        args.push(data.awayScore);
      }
      if (data.winner !== undefined) {
        setClauses.push("winner = ?");
        args.push(data.winner);
      }
      if (data.shortStatus !== undefined) {
        setClauses.push("shortStatus = ?");
        args.push(data.shortStatus);
      }
      if (data.round !== undefined) {
        setClauses.push("round = ?");
        args.push(data.round);
      }
      if (data.lastSyncedAt !== undefined) {
        setClauses.push("lastSyncedAt = ?");
        args.push(dateToSqlValue(data.lastSyncedAt));
      }

      if (setClauses.length === 0) {
        return this.findById(id);
      }

      args.push(id);
      await client.execute({
        sql: `UPDATE Match SET ${setClauses.join(", ")} WHERE id = ?`,
        args,
      });

      return this.findById(id);
    },

    /**
     * Count all matches.
     */
    async count(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute("SELECT COUNT(*) AS cnt FROM Match");
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },

    /**
     * Find many matches with optional filtering.
     * Mirrors `db.match.findMany({ where, orderBy, take })`.
     */
    async findMany(options: MatchFindManyOptions = {}): Promise<MatchRow[]> {
      const client = getRawClient();
      if (!client) return [];

      const where: string[] = [];
      const args: (string | number)[] = [];

      if (options.where?.status) {
        where.push("status = ?");
        args.push(options.where.status);
      }
      if (options.where?.externalIdIn && options.where.externalIdIn.length > 0) {
        const placeholders = options.where.externalIdIn.map(() => "?").join(",");
        where.push(`externalId IN (${placeholders})`);
        args.push(...options.where.externalIdIn);
      }

      const sql = [
        "SELECT * FROM Match",
        where.length > 0 ? `WHERE ${where.join(" AND ")}` : "",
        options.orderBy?.matchDate
          ? `ORDER BY matchDate ${options.orderBy.matchDate.toUpperCase()}`
          : options.orderBy?.createdAt
            ? `ORDER BY createdAt ${options.orderBy.createdAt.toUpperCase()}`
            : "",
        options.limit ? `LIMIT ${Number(options.limit)}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const rs = await client.execute({ sql, args });
      return (rs.rows as DbRow[]).map(mapMatchRow);
    },
  },

  // ─── Prediction operations ────────────────────────────────────────────────
  prediction: {
    /**
     * Find all predictions for a user, with the related Match row joined.
     * Mirrors `db.prediction.findMany({ where: { userId }, include: { match: true }, orderBy: { createdAt: "desc" } })`.
     *
     * Uses a two-query approach: fetch predictions first, then fetch their
     * matches by id IN (...). This avoids column-name collisions (id,
     * createdAt exist on both tables) that an aliased JOIN would require.
     */
    async findByUserId(userId: string): Promise<PredictionWithMatch[]> {
      const client = getRawClient();
      if (!client) return [];

      const predRs = await client.execute({
        sql: "SELECT * FROM Prediction WHERE userId = ? ORDER BY createdAt DESC",
        args: [userId],
      });

      if (predRs.rows.length === 0) return [];

      const matchIds = [
        ...new Set(predRs.rows.map((r) => String((r as DbRow).matchId))),
      ];
      const placeholders = matchIds.map(() => "?").join(",");
      const matchRs = await client.execute({
        sql: `SELECT * FROM Match WHERE id IN (${placeholders})`,
        args: matchIds,
      });

      const matchMap = new Map<string, MatchRow>();
      for (const row of matchRs.rows as DbRow[]) {
        const m = mapMatchRow(row);
        matchMap.set(m.id, m);
      }

      return (predRs.rows as DbRow[]).map((row) => {
        const p = mapPredictionRow(row);
        const match = matchMap.get(p.matchId);
        if (!match) {
          // Shouldn't happen (FK), but guard against orphaned predictions
          throw new Error(
            `[rawDb] Prediction ${p.id} references missing Match ${p.matchId}`
          );
        }
        return { ...p, match };
      });
    },

    /**
     * Find all predictions for a given match, with the related User row joined.
     * Mirrors `db.prediction.findMany({ where: { matchId }, include: { user: true } })`.
     * Used by /api/predictions/results to evaluate all predictions after a match.
     */
    async findByMatchIdWithUser(matchId: string): Promise<PredictionWithUser[]> {
      const client = getRawClient();
      if (!client) return [];

      const predRs = await client.execute({
        sql: "SELECT * FROM Prediction WHERE matchId = ?",
        args: [matchId],
      });

      if (predRs.rows.length === 0) return [];

      const userIds = [
        ...new Set(predRs.rows.map((r) => String((r as DbRow).userId))),
      ];
      const placeholders = userIds.map(() => "?").join(",");
      const userRs = await client.execute({
        sql: `SELECT * FROM User WHERE id IN (${placeholders})`,
        args: userIds,
      });

      const userMap = new Map<string, UserRow>();
      for (const row of userRs.rows as DbRow[]) {
        const u = mapUserRow(row);
        userMap.set(u.id, u);
      }

      return (predRs.rows as DbRow[]).map((row) => {
        const p = mapPredictionRow(row);
        const user = userMap.get(p.userId);
        if (!user) {
          throw new Error(
            `[rawDb] Prediction ${p.id} references missing User ${p.userId}`
          );
        }
        return { ...p, user };
      });
    },

    /**
     * Find a single prediction by (userId, matchId) — the unique constraint.
     * Mirrors `db.prediction.findUnique({ where: { userId_matchId: { userId, matchId } } })`.
     */
    async findByUserIdAndMatchId(
      userId: string,
      matchId: string
    ): Promise<PredictionRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM Prediction WHERE userId = ? AND matchId = ? LIMIT 1",
        args: [userId, matchId],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapPredictionRow(row) : null;
    },

    /**
     * Create a new prediction. Generates a UUID id.
     * Mirrors `db.prediction.create({ data })`.
     * Throws on UNIQUE constraint violation (duplicate userId+matchId).
     */
    async create(data: PredictionCreateInput): Promise<PredictionRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot create prediction");
      const id = generateId();
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO Prediction
          (id, userId, matchId, homeGoals, awayGoals, extraTimeHome, extraTimeAway,
           penaltiesHome, penaltiesAway, correct, exactScore, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.userId,
          data.matchId,
          data.homeGoals,
          data.awayGoals,
          data.extraTimeHome ?? null,
          data.extraTimeAway ?? null,
          data.penaltiesHome ?? null,
          data.penaltiesAway ?? null,
          null, // correct — null until results are evaluated
          null, // exactScore — null until results are evaluated
          now,
        ],
      });

      return {
        id,
        userId: data.userId,
        matchId: data.matchId,
        homeGoals: data.homeGoals,
        awayGoals: data.awayGoals,
        extraTimeHome: data.extraTimeHome ?? null,
        extraTimeAway: data.extraTimeAway ?? null,
        penaltiesHome: data.penaltiesHome ?? null,
        penaltiesAway: data.penaltiesAway ?? null,
        correct: null,
        exactScore: null,
        createdAt: new Date(now),
      };
    },

    /**
     * Update a prediction by id. Typically used to set `correct`/`exactScore`
     * after a match finishes (see /api/predictions/results).
     * Mirrors `db.prediction.update({ where: { id }, data })`.
     */
    async update(id: string, data: PredictionUpdateInput): Promise<PredictionRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot update prediction");
      const setClauses: string[] = [];
      const args: (string | number | null)[] = [];

      if (data.homeGoals !== undefined) {
        setClauses.push("homeGoals = ?");
        args.push(data.homeGoals);
      }
      if (data.awayGoals !== undefined) {
        setClauses.push("awayGoals = ?");
        args.push(data.awayGoals);
      }
      if (data.extraTimeHome !== undefined) {
        setClauses.push("extraTimeHome = ?");
        args.push(data.extraTimeHome);
      }
      if (data.extraTimeAway !== undefined) {
        setClauses.push("extraTimeAway = ?");
        args.push(data.extraTimeAway);
      }
      if (data.penaltiesHome !== undefined) {
        setClauses.push("penaltiesHome = ?");
        args.push(data.penaltiesHome);
      }
      if (data.penaltiesAway !== undefined) {
        setClauses.push("penaltiesAway = ?");
        args.push(data.penaltiesAway);
      }
      if (data.correct !== undefined) {
        setClauses.push("correct = ?");
        args.push(data.correct === null ? null : data.correct ? 1 : 0);
      }
      if (data.exactScore !== undefined) {
        setClauses.push("exactScore = ?");
        args.push(data.exactScore === null ? null : data.exactScore ? 1 : 0);
      }

      if (setClauses.length === 0) {
        const rs = await client.execute({
          sql: "SELECT * FROM Prediction WHERE id = ? LIMIT 1",
          args: [id],
        });
        const row = extractOne(rs.rows as DbRow[]);
        return row ? mapPredictionRow(row) : null;
      }

      args.push(id);
      await client.execute({
        sql: `UPDATE Prediction SET ${setClauses.join(", ")} WHERE id = ?`,
        args,
      });

      const rs = await client.execute({
        sql: "SELECT * FROM Prediction WHERE id = ? LIMIT 1",
        args: [id],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapPredictionRow(row) : null;
    },

    /**
     * Find ALL predictions (for the admin panel), with the related User + Match
     * rows joined. Returns the newest first.
     * Uses a three-query approach: predictions → users → matches.
     */
    async findAll(): Promise<Array<PredictionRow & { user: UserRow; match: MatchRow }>> {
      const client = getRawClient();
      if (!client) return [];

      const predRs = await client.execute(
        "SELECT * FROM Prediction ORDER BY createdAt DESC"
      );
      if (predRs.rows.length === 0) return [];

      // Fetch related users
      const userIds = [...new Set(predRs.rows.map((r) => String((r as DbRow).userId)))];
      const userPlaceholders = userIds.map(() => "?").join(",");
      const userRs = await client.execute({
        sql: `SELECT * FROM User WHERE id IN (${userPlaceholders})`,
        args: userIds,
      });
      const userMap = new Map<string, UserRow>();
      for (const row of userRs.rows as DbRow[]) {
        const u = mapUserRow(row);
        userMap.set(u.id, u);
      }

      // Fetch related matches
      const matchIds = [...new Set(predRs.rows.map((r) => String((r as DbRow).matchId)))];
      const matchPlaceholders = matchIds.map(() => "?").join(",");
      const matchRs = await client.execute({
        sql: `SELECT * FROM Match WHERE id IN (${matchPlaceholders})`,
        args: matchIds,
      });
      const matchMap = new Map<string, MatchRow>();
      for (const row of matchRs.rows as DbRow[]) {
        const m = mapMatchRow(row);
        matchMap.set(m.id, m);
      }

      const result: Array<PredictionRow & { user: UserRow; match: MatchRow }> = [];
      for (const row of predRs.rows as DbRow[]) {
        const p = mapPredictionRow(row);
        const user = userMap.get(p.userId);
        const match = matchMap.get(p.matchId);
        if (user && match) {
          result.push({ ...p, user, match });
        }
      }
      return result;
    },

    /**
     * Count all predictions.
     */
    async count(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute("SELECT COUNT(*) AS cnt FROM Prediction");
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },

    /**
     * Count all predictions belonging to a specific user.
     * Used by the /admin panel to show per-user prediction counts.
     */
    async countByUserId(userId: string): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute({
        sql: "SELECT COUNT(*) AS cnt FROM Prediction WHERE userId = ?",
        args: [userId],
      });
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },
  },

  // ─── DiscountCode operations ──────────────────────────────────────────────
  discountCode: {
    /**
     * Find a single discount code by id. Used by the /admin panel to verify
     * a discount exists before deleting it (and to re-read after operations).
     */
    async findById(id: string): Promise<DiscountCodeRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM DiscountCode WHERE id = ? LIMIT 1",
        args: [id],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapDiscountCodeRow(row) : null;
    },

    /**
     * Find a discount code by predictionId (to avoid duplicates).
     */
    async findByPredictionId(predictionId: string): Promise<DiscountCodeRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM DiscountCode WHERE predictionId = ? LIMIT 1",
        args: [predictionId],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapDiscountCodeRow(row) : null;
    },

    /**
     * Find all discount codes for a user, newest first.
     * Mirrors `db.discountCode.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })`.
     */
    async findByUserId(userId: string): Promise<DiscountCodeRow[]> {
      const client = getRawClient();
      if (!client) return [];
      const rs = await client.execute({
        sql: "SELECT * FROM DiscountCode WHERE userId = ? ORDER BY createdAt DESC",
        args: [userId],
      });
      return (rs.rows as DbRow[]).map(mapDiscountCodeRow);
    },

    /**
     * Create a new discount code. Generates a UUID id.
     * Mirrors `db.discountCode.create({ data })`.
     * Throws on UNIQUE constraint violation (duplicate `code`).
     */
    async create(data: DiscountCodeCreateInput): Promise<DiscountCodeRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot create discount code");
      const id = generateId();
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO DiscountCode
          (id, userId, predictionId, code, discountPct, verified, verifiedAt,
           expiresAt, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.userId,
          data.predictionId ?? null,
          data.code,
          data.discountPct ?? 10,
          (data.verified ?? false) ? 1 : 0,
          dateToSqlValue(data.verifiedAt ?? null),
          dateToSqlValue(data.expiresAt) ?? now,
          now,
        ],
      });

      return {
        id,
        userId: data.userId,
        predictionId: data.predictionId ?? null,
        code: data.code,
        discountPct: data.discountPct ?? 10,
        verified: data.verified ?? false,
        verifiedAt: data.verifiedAt ?? null,
        expiresAt: data.expiresAt,
        createdAt: new Date(now),
      };
    },

    /**
     * Count all discount codes.
     */
    async count(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute("SELECT COUNT(*) AS cnt FROM DiscountCode");
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },

    /**
     * Count all discount codes belonging to a specific user.
     * Used by the /admin panel to show per-user discount counts.
     */
    async countByUserId(userId: string): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute({
        sql: "SELECT COUNT(*) AS cnt FROM DiscountCode WHERE userId = ?",
        args: [userId],
      });
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },

    /**
     * Count all active discount codes (not verified + not expired).
     * Used by the /admin stats endpoint.
     */
    async countActive(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const now = new Date().toISOString();
      const rs = await client.execute({
        sql: "SELECT COUNT(*) AS cnt FROM DiscountCode WHERE verified = 0 AND expiresAt > ?",
        args: [now],
      });
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },

    /**
     * Delete a discount code by id. Used by the /admin panel to remove
     * a discount assigned to a user.
     * Returns true if a row was deleted, false otherwise.
     */
    async deleteById(id: string): Promise<boolean> {
      const client = getRawClient();
      if (!client) return false;
      await client.execute({
        sql: "DELETE FROM DiscountCode WHERE id = ?",
        args: [id],
      });
      return true;
    },
  },

  // ─── CartItem operations (cross-device cart sync) ─────────────────────────
  // Stores only reference keys (perfumeId/comboId) + quantity + price.
  // The full Perfume/Combo objects are re-hydrated client-side from the
  // local catalog data (perfumes.ts / combosData.ts) on load.
  cartItem: {
    /**
     * Find all cart items for a user. Mirrors
     * `db.cartItem.findMany({ where: { userId }, orderBy: { createdAt: "asc" } })`.
     */
    async findByUserId(userId: string): Promise<CartItemRow[]> {
      const client = getRawClient();
      if (!client) return [];
      const rs = await client.execute({
        sql: "SELECT * FROM CartItem WHERE userId = ? ORDER BY createdAt ASC",
        args: [userId],
      });
      return (rs.rows as DbRow[]).map(mapCartItemRow);
    },

    /**
     * Find a single cart item by (userId, itemType, itemId) — the unique key.
     * Returns null if not found.
     */
    async findUnique(
      userId: string,
      itemType: string,
      itemId: string
    ): Promise<CartItemRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM CartItem WHERE userId = ? AND itemType = ? AND itemId = ? LIMIT 1",
        args: [userId, itemType, itemId],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapCartItemRow(row) : null;
    },

    /**
     * Upsert a cart item by (userId, itemType, itemId).
     * If the item exists, set its quantity to the given value (overwrite).
     * If not, create it. Used by the cart sync to reconcile server state.
     */
    async upsert(
      userId: string,
      itemType: string,
      itemId: string,
      price: number,
      quantity: number,
      discountCodeId: string | null = null
    ): Promise<CartItemRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot upsert cart item");
      const existing = await this.findUnique(userId, itemType, itemId);
      if (existing) {
        await client.execute({
          sql: "UPDATE CartItem SET price = ?, quantity = ?, discountCodeId = ?, updatedAt = ? WHERE id = ?",
          args: [price, quantity, discountCodeId, new Date().toISOString(), existing.id],
        });
        return { ...existing, price, quantity, discountCodeId, updatedAt: new Date() };
      }
      // Create new
      const id = generateId();
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO CartItem (id, userId, itemType, itemId, price, quantity, discountCodeId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, userId, itemType, itemId, price, quantity, discountCodeId, now, now],
      });
      return {
        id,
        userId,
        itemType,
        itemId,
        price,
        quantity,
        discountCodeId,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
    },

    /**
     * Increment the quantity of an existing item, or create it if it doesn't exist.
     * Mirrors the client-side addPerfume/addCombo behavior.
     */
    async incrementOrAdd(
      userId: string,
      itemType: string,
      itemId: string,
      price: number,
      quantityDelta: number = 1
    ): Promise<CartItemRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable");
      const existing = await this.findUnique(userId, itemType, itemId);
      if (existing) {
        const newQty = existing.quantity + quantityDelta;
        await client.execute({
          sql: "UPDATE CartItem SET quantity = ?, price = ?, updatedAt = ? WHERE id = ?",
          args: [newQty, price, new Date().toISOString(), existing.id],
        });
        return { ...existing, quantity: newQty, price, updatedAt: new Date() };
      }
      return this.upsert(userId, itemType, itemId, price, quantityDelta);
    },

    /**
     * Update the quantity of a cart item (set absolute value).
     * If quantity <= 0, the item is deleted.
     */
    async updateQuantity(
      userId: string,
      itemType: string,
      itemId: string,
      quantity: number
    ): Promise<CartItemRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable");
      if (quantity <= 0) {
        await this.delete(userId, itemType, itemId);
        return null;
      }
      const existing = await this.findUnique(userId, itemType, itemId);
      if (!existing) return null;
      await client.execute({
        sql: "UPDATE CartItem SET quantity = ?, updatedAt = ? WHERE id = ?",
        args: [quantity, new Date().toISOString(), existing.id],
      });
      return { ...existing, quantity, updatedAt: new Date() };
    },

    /**
     * Delete a single cart item by (userId, itemType, itemId).
     */
    async delete(
      userId: string,
      itemType: string,
      itemId: string
    ): Promise<boolean> {
      const client = getRawClient();
      if (!client) return false;
      await client.execute({
        sql: "DELETE FROM CartItem WHERE userId = ? AND itemType = ? AND itemId = ?",
        args: [userId, itemType, itemId],
      });
      return true;
    },

    /**
     * Delete all cart items for a user (clear cart).
     */
    async deleteAllByUserId(userId: string): Promise<boolean> {
      const client = getRawClient();
      if (!client) return false;
      await client.execute({
        sql: "DELETE FROM CartItem WHERE userId = ?",
        args: [userId],
      });
      return true;
    },

    /**
     * Replace the entire cart for a user in a single batch.
     * Uses INSERT OR REPLACE (upsert) so that existing CartItem rows are
     * updated in-place rather than deleted + re-created. This PRESERVES the
     * discountCodeId of items that already exist (so discount assignments
     * made via PATCH are not wiped out by a subsequent full-cart PUT sync).
     * Items in the DB that are NOT in the new list are deleted.
     */
    async replaceAll(
      userId: string,
      items: Array<{ itemType: string; itemId: string; price: number; quantity: number; discountCodeId?: string | null }>
    ): Promise<boolean> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable");
      const now = new Date().toISOString();
      const stmts: Array<{ sql: string; args: (string | number | null)[] }> = [];

      // Delete items that are no longer in the cart (by composite key).
      // We compute the set of (itemType, itemId) pairs to keep, and delete the rest.
      const keepKeys = items.map((i) => `${i.itemType}:${i.itemId}`);
      if (keepKeys.length > 0) {
        // Delete rows whose (itemType, itemId) is NOT in the keep set.
        // SQLite doesn't support tuples in IN, so we use a subquery pattern.
        // Simpler: build a placeholder list and use NOT IN on a concatenation.
        const placeholders = keepKeys.map(() => "?").join(",");
        stmts.push({
          sql: `DELETE FROM CartItem WHERE userId = ? AND (itemType || ':' || itemId) NOT IN (${placeholders})`,
          args: [userId, ...keepKeys],
        });
      } else {
        // No items to keep → delete all
        stmts.push({
          sql: "DELETE FROM CartItem WHERE userId = ?",
          args: [userId],
        });
      }

      // Upsert each item. INSERT OR REPLACE preserves the existing row's
      // discountCodeId ONLY if we pass the existing value. Since we don't know
      // the existing value here, we use a COALESCE approach: if the item already
      // exists, keep its discountCodeId; if new, use the provided one (or null).
      for (const item of items) {
        const id = generateId();
        // Use INSERT OR IGNORE to create the row if it doesn't exist (with null
        // discountCodeId), then UPDATE price/quantity. This way, if the row
        // already exists, we DON'T touch discountCodeId at all.
        stmts.push({
          sql: `INSERT OR IGNORE INTO CartItem (id, userId, itemType, itemId, price, quantity, discountCodeId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [id, userId, item.itemType, item.itemId, item.price, item.quantity, item.discountCodeId ?? null, now, now],
        });
        // Update price + quantity (but NOT discountCodeId — preserve existing)
        stmts.push({
          sql: `UPDATE CartItem SET price = ?, quantity = ?, updatedAt = ? WHERE userId = ? AND itemType = ? AND itemId = ?`,
          args: [item.price, item.quantity, now, userId, item.itemType, item.itemId],
        });
      }
      await client.batch(stmts.map((s) => ({ sql: s.sql, args: s.args })));
      return true;
    },

    /**
     * Update only the discountCodeId of a cart item.
     * Pass null to remove the discount assignment.
     * Used by the discount cascade sync — when a user assigns a discount to
     * an item on one device, this updates the DB so other devices see it.
     */
    async updateDiscountAssignment(
      userId: string,
      itemType: string,
      itemId: string,
      discountCodeId: string | null
    ): Promise<CartItemRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable");
      const existing = await this.findUnique(userId, itemType, itemId);
      if (!existing) return null;
      await client.execute({
        sql: "UPDATE CartItem SET discountCodeId = ?, updatedAt = ? WHERE id = ?",
        args: [discountCodeId, new Date().toISOString(), existing.id],
      });
      return { ...existing, discountCodeId, updatedAt: new Date() };
    },

    /**
     * Count all cart items.
     */
    async count(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute("SELECT COUNT(*) AS cnt FROM CartItem");
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },
  },

  // ─── CRM: Customer operations ──────────────────────────────────────────────
  customer: {
    /**
     * Find all customers, newest first.
     * Mirrors `db.customer.findMany({ orderBy: { createdAt: "desc" } })`.
     */
    async findMany(limit = 1000): Promise<CustomerRow[]> {
      const client = getRawClient();
      if (!client) return [];
      const rs = await client.execute({
        sql: "SELECT * FROM Customer ORDER BY createdAt DESC LIMIT ?",
        args: [Math.max(1, Math.min(10000, Number(limit) || 1000))],
      });
      return (rs.rows as DbRow[]).map(mapCustomerRow);
    },

    /**
     * Find a customer by id.
     */
    async findById(id: string): Promise<CustomerRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: 'SELECT * FROM "Customer" WHERE id = ? LIMIT 1',
        args: [id],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapCustomerRow(row) : null;
    },

    /**
     * Find a customer by email (case-insensitive via LOWER()).
     * Mirrors `db.customer.findFirst({ where: { email } })`.
     */
    async findByEmail(email: string): Promise<CustomerRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM Customer WHERE LOWER(email) = LOWER(?) LIMIT 1",
        args: [email],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapCustomerRow(row) : null;
    },

    /**
     * Find a customer by userId (the User.id of the logged-in account).
     * Used by /api/profile to sync the CRM Customer record when a user
     * saves their phone/instagram from the storefront.
     */
    async findByUserId(userId: string): Promise<CustomerRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM Customer WHERE userId = ? LIMIT 1",
        args: [userId],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapCustomerRow(row) : null;
    },

    /**
     * Create a new customer. Generates a UUID id (replaces Prisma's cuid()).
     * Mirrors `db.customer.create({ data })`.
     */
    async create(data: CustomerCreateInput): Promise<CustomerRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot create customer");
      const id = generateId();
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO Customer
          (id, userId, name, email, phone, instagram, channel, preferences, notes, tags,
           isVip, isBlocked, blockReason, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.userId ?? null,
          data.name,
          data.email ?? null,
          data.phone ?? null,
          data.instagram ?? null,
          data.channel ?? "whatsapp",
          data.preferences ?? null,
          data.notes ?? null,
          data.tags ?? null,
          (data.isVip ?? false) ? 1 : 0,
          (data.isBlocked ?? false) ? 1 : 0,
          data.blockReason ?? null,
          now,
          now,
        ],
      });
      const created = await this.findById(id);
      if (!created) {
        return {
          id,
          userId: data.userId ?? null,
          name: data.name,
          email: data.email ?? null,
          phone: data.phone ?? null,
          instagram: data.instagram ?? null,
          channel: data.channel ?? "whatsapp",
          preferences: data.preferences ?? null,
          notes: data.notes ?? null,
          tags: data.tags ?? null,
          isVip: data.isVip ?? false,
          isBlocked: data.isBlocked ?? false,
          blockReason: data.blockReason ?? null,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        };
      }
      return created;
    },

    /**
     * Update a customer by id. Only the supplied fields are updated.
     * Mirrors `db.customer.update({ where: { id }, data })`.
     */
    async update(id: string, data: CustomerUpdateInput): Promise<CustomerRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot update customer");
      const setClauses: string[] = [];
      const args: (string | number | null)[] = [];

      if (data.userId !== undefined) {
        setClauses.push("userId = ?");
        args.push(data.userId);
      }
      if (data.name !== undefined) {
        setClauses.push("name = ?");
        args.push(data.name);
      }
      if (data.email !== undefined) {
        setClauses.push("email = ?");
        args.push(data.email);
      }
      if (data.phone !== undefined) {
        setClauses.push("phone = ?");
        args.push(data.phone);
      }
      if (data.instagram !== undefined) {
        setClauses.push("instagram = ?");
        args.push(data.instagram);
      }
      if (data.channel !== undefined) {
        setClauses.push("channel = ?");
        args.push(data.channel);
      }
      if (data.preferences !== undefined) {
        setClauses.push("preferences = ?");
        args.push(data.preferences);
      }
      if (data.notes !== undefined) {
        setClauses.push("notes = ?");
        args.push(data.notes);
      }
      if (data.tags !== undefined) {
        setClauses.push("tags = ?");
        args.push(data.tags);
      }
      if (data.isVip !== undefined) {
        setClauses.push("isVip = ?");
        args.push(data.isVip ? 1 : 0);
      }
      if (data.isBlocked !== undefined) {
        setClauses.push("isBlocked = ?");
        args.push(data.isBlocked ? 1 : 0);
      }
      if (data.blockReason !== undefined) {
        setClauses.push("blockReason = ?");
        args.push(data.blockReason);
      }

      setClauses.push("updatedAt = ?");
      args.push(new Date().toISOString());

      args.push(id);
      await client.execute({
        sql: `UPDATE Customer SET ${setClauses.join(", ")} WHERE id = ?`,
        args,
      });
      return this.findById(id);
    },

    /**
     * Delete a customer by id. Mirrors `db.customer.delete({ where: { id } })`.
     * NOTE: foreign-key RESTRICT on Sale.customerId will throw if the customer
     * has sales. Callers should check `countSalesByCustomerId` first.
     */
    async delete(id: string): Promise<boolean> {
      const client = getRawClient();
      if (!client) return false;
      await client.execute({
        sql: "DELETE FROM Customer WHERE id = ?",
        args: [id],
      });
      return true;
    },

    /**
     * Count all customers. Mirrors `db.customer.count()`.
     */
    async count(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute("SELECT COUNT(*) AS cnt FROM Customer");
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },

    /**
     * Count sales for a customer. Used by DELETE /customers/:id to refuse
     * deletion when the customer has sales history.
     */
    async countSalesByCustomerId(customerId: string): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute({
        sql: "SELECT COUNT(*) AS cnt FROM Sale WHERE customerId = ?",
        args: [customerId],
      });
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },

    /**
     * Count DMs for a customer. Used to enrich the customer list response.
     */
    async countDmsByCustomerId(customerId: string): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute({
        sql: "SELECT COUNT(*) AS cnt FROM Dm WHERE customerId = ?",
        args: [customerId],
      });
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },
  },

  // ─── CRM: InventoryItem operations ─────────────────────────────────────────
  inventoryItem: {
    /**
     * Find all inventory items, ordered by status then newest first.
     * Mirrors `db.inventoryItem.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] })`.
     */
    async findMany(limit = 2000): Promise<InventoryItemRow[]> {
      const client = getRawClient();
      if (!client) return [];
      const rs = await client.execute({
        sql: "SELECT * FROM InventoryItem ORDER BY status ASC, createdAt DESC LIMIT ?",
        args: [Math.max(1, Math.min(20000, Number(limit) || 2000))],
      });
      return (rs.rows as DbRow[]).map(mapInventoryItemRow);
    },

    /**
     * Find an inventory item by id.
     */
    async findById(id: string): Promise<InventoryItemRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM InventoryItem WHERE id = ? LIMIT 1",
        args: [id],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapInventoryItemRow(row) : null;
    },

    /**
     * Create a new inventory item.
     */
    async create(data: InventoryItemCreateInput): Promise<InventoryItemRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot create inventory item");
      const id = generateId();
      const now = new Date().toISOString();
      const acquiredAt = dateToSqlValue(data.acquiredAt ?? null) ?? now;
      await client.execute({
        sql: `INSERT INTO InventoryItem
          (id, name, brand, olfativeProfile, size, cost, price, status, customerInterest,
           notes, acquiredAt, soldAt, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.name,
          data.brand ?? null,
          data.olfativeProfile ?? null,
          data.size ?? null,
          data.cost ?? null,
          data.price,
          data.status ?? "available",
          data.customerInterest ?? null,
          data.notes ?? null,
          acquiredAt,
          null,
          now,
          now,
        ],
      });
      const created = await this.findById(id);
      if (!created) {
        return {
          id,
          name: data.name,
          brand: data.brand ?? null,
          olfativeProfile: data.olfativeProfile ?? null,
          size: data.size ?? null,
          cost: data.cost ?? null,
          price: data.price,
          status: data.status ?? "available",
          customerInterest: data.customerInterest ?? null,
          notes: data.notes ?? null,
          acquiredAt: new Date(acquiredAt),
          soldAt: null,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        };
      }
      return created;
    },

    /**
     * Update an inventory item by id.
     */
    async update(id: string, data: InventoryItemUpdateInput): Promise<InventoryItemRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot update inventory item");
      const setClauses: string[] = [];
      const args: (string | number | null)[] = [];

      if (data.name !== undefined) {
        setClauses.push("name = ?");
        args.push(data.name);
      }
      if (data.brand !== undefined) {
        setClauses.push("brand = ?");
        args.push(data.brand);
      }
      if (data.olfativeProfile !== undefined) {
        setClauses.push("olfativeProfile = ?");
        args.push(data.olfativeProfile);
      }
      if (data.size !== undefined) {
        setClauses.push("size = ?");
        args.push(data.size);
      }
      if (data.cost !== undefined) {
        setClauses.push("cost = ?");
        args.push(data.cost);
      }
      if (data.price !== undefined) {
        setClauses.push("price = ?");
        args.push(data.price);
      }
      if (data.status !== undefined) {
        setClauses.push("status = ?");
        args.push(data.status);
      }
      if (data.customerInterest !== undefined) {
        setClauses.push("customerInterest = ?");
        args.push(data.customerInterest);
      }
      if (data.notes !== undefined) {
        setClauses.push("notes = ?");
        args.push(data.notes);
      }
      if (data.soldAt !== undefined) {
        setClauses.push("soldAt = ?");
        args.push(dateToSqlValue(data.soldAt));
      }

      setClauses.push("updatedAt = ?");
      args.push(new Date().toISOString());

      args.push(id);
      await client.execute({
        sql: `UPDATE InventoryItem SET ${setClauses.join(", ")} WHERE id = ?`,
        args,
      });
      return this.findById(id);
    },

    /**
     * Delete an inventory item by id.
     */
    async delete(id: string): Promise<boolean> {
      const client = getRawClient();
      if (!client) return false;
      await client.execute({
        sql: "DELETE FROM InventoryItem WHERE id = ?",
        args: [id],
      });
      return true;
    },

    /**
     * Count all inventory items.
     */
    async count(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute("SELECT COUNT(*) AS cnt FROM InventoryItem");
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },
  },

  // ─── CRM: Decant operations ────────────────────────────────────────────────
  decant: {
    /**
     * Find all decants, ordered by status then newest first.
     * Mirrors `db.decant.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }] })`.
     */
    async findMany(limit = 5000): Promise<DecantRow[]> {
      const client = getRawClient();
      if (!client) return [];
      const rs = await client.execute({
        sql: "SELECT * FROM Decant ORDER BY status ASC, createdAt DESC LIMIT ?",
        args: [Math.max(1, Math.min(50000, Number(limit) || 5000))],
      });
      return (rs.rows as DbRow[]).map(mapDecantRow);
    },

    /**
     * Find a decant by id.
     */
    async findById(id: string): Promise<DecantRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM Decant WHERE id = ? LIMIT 1",
        args: [id],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapDecantRow(row) : null;
    },

    /**
     * Create a new decant.
     */
    async create(data: DecantCreateInput): Promise<DecantRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot create decant");
      const id = generateId();
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO Decant
          (id, sourcePerfume, sourceBrand, olfativeProfile, sizeMl, cost, price, status,
           filledAt, soldAt, customerId, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.sourcePerfume,
          data.sourceBrand ?? null,
          data.olfativeProfile ?? null,
          data.sizeMl ?? 10,
          data.cost ?? null,
          data.price ?? 12,
          data.status ?? "pending",
          dateToSqlValue(data.filledAt ?? null),
          dateToSqlValue(data.soldAt ?? null),
          data.customerId ?? null,
          data.notes ?? null,
          now,
          now,
        ],
      });
      const created = await this.findById(id);
      if (!created) {
        return {
          id,
          sourcePerfume: data.sourcePerfume,
          sourceBrand: data.sourceBrand ?? null,
          olfativeProfile: data.olfativeProfile ?? null,
          sizeMl: data.sizeMl ?? 10,
          cost: data.cost ?? null,
          price: data.price ?? 12,
          status: data.status ?? "pending",
          filledAt: data.filledAt ?? null,
          soldAt: data.soldAt ?? null,
          customerId: data.customerId ?? null,
          notes: data.notes ?? null,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        };
      }
      return created;
    },

    /**
     * Create multiple decants at once (bulk insert).
     * Mirrors `db.decant.createMany({ data: [...] })`.
     * Returns the count of inserted rows.
     */
    async createMany(items: DecantCreateInput[]): Promise<number> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot createMany decants");
      if (items.length === 0) return 0;
      const now = new Date().toISOString();
      const stmts = items.map((data) => ({
        sql: `INSERT INTO Decant
          (id, sourcePerfume, sourceBrand, olfativeProfile, sizeMl, cost, price, status,
           filledAt, soldAt, customerId, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          generateId(),
          data.sourcePerfume,
          data.sourceBrand ?? null,
          data.olfativeProfile ?? null,
          data.sizeMl ?? 10,
          data.cost ?? null,
          data.price ?? 12,
          data.status ?? "pending",
          dateToSqlValue(data.filledAt ?? null),
          dateToSqlValue(data.soldAt ?? null),
          data.customerId ?? null,
          data.notes ?? null,
          now,
          now,
        ],
      }));
      await client.batch(stmts);
      return items.length;
    },

    /**
     * Update a decant by id.
     */
    async update(id: string, data: DecantUpdateInput): Promise<DecantRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot update decant");
      const setClauses: string[] = [];
      const args: (string | number | null)[] = [];

      if (data.sourcePerfume !== undefined) {
        setClauses.push("sourcePerfume = ?");
        args.push(data.sourcePerfume);
      }
      if (data.sourceBrand !== undefined) {
        setClauses.push("sourceBrand = ?");
        args.push(data.sourceBrand);
      }
      if (data.olfativeProfile !== undefined) {
        setClauses.push("olfativeProfile = ?");
        args.push(data.olfativeProfile);
      }
      if (data.sizeMl !== undefined) {
        setClauses.push("sizeMl = ?");
        args.push(data.sizeMl);
      }
      if (data.cost !== undefined) {
        setClauses.push("cost = ?");
        args.push(data.cost);
      }
      if (data.price !== undefined) {
        setClauses.push("price = ?");
        args.push(data.price);
      }
      if (data.status !== undefined) {
        setClauses.push("status = ?");
        args.push(data.status);
      }
      if (data.filledAt !== undefined) {
        setClauses.push("filledAt = ?");
        args.push(dateToSqlValue(data.filledAt));
      }
      if (data.soldAt !== undefined) {
        setClauses.push("soldAt = ?");
        args.push(dateToSqlValue(data.soldAt));
      }
      if (data.customerId !== undefined) {
        setClauses.push("customerId = ?");
        args.push(data.customerId);
      }
      if (data.notes !== undefined) {
        setClauses.push("notes = ?");
        args.push(data.notes);
      }

      setClauses.push("updatedAt = ?");
      args.push(new Date().toISOString());

      args.push(id);
      await client.execute({
        sql: `UPDATE Decant SET ${setClauses.join(", ")} WHERE id = ?`,
        args,
      });
      return this.findById(id);
    },

    /**
     * Delete a decant by id.
     */
    async delete(id: string): Promise<boolean> {
      const client = getRawClient();
      if (!client) return false;
      await client.execute({
        sql: "DELETE FROM Decant WHERE id = ?",
        args: [id],
      });
      return true;
    },

    /**
     * Count all decants.
     */
    async count(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute("SELECT COUNT(*) AS cnt FROM Decant");
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },
  },

  // ─── CRM: Sale operations ──────────────────────────────────────────────────
  sale: {
    /**
     * Find all sales (optionally filtered by customerId), newest saleDate first.
     * Mirrors `db.sale.findMany({ where, orderBy: { saleDate: "desc" }, take })`.
     */
    async findMany(options: {
      where?: { customerId?: string };
      orderBy?: { saleDate?: "asc" | "desc" };
      limit?: number;
    } = {}): Promise<SaleRow[]> {
      const client = getRawClient();
      if (!client) return [];

      const where: string[] = [];
      const args: (string | number)[] = [];

      if (options.where?.customerId) {
        where.push("customerId = ?");
        args.push(options.where.customerId);
      }

      const order = options.orderBy?.saleDate?.toUpperCase() === "ASC" ? "ASC" : "DESC";

      let sql = "SELECT * FROM Sale";
      if (where.length > 0) sql += ` WHERE ${where.join(" AND ")}`;
      sql += ` ORDER BY saleDate ${order}`;
      if (options.limit) sql += ` LIMIT ${Math.max(1, Math.min(10000, Number(options.limit)))}`;

      const rs = await client.execute({ sql, args });
      return (rs.rows as DbRow[]).map(mapSaleRow);
    },

    /**
     * Find a sale by id.
     */
    async findById(id: string): Promise<SaleRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM Sale WHERE id = ? LIMIT 1",
        args: [id],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapSaleRow(row) : null;
    },

    /**
     * Create a new sale.
     */
    async create(data: SaleCreateInput): Promise<SaleRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot create sale");
      const id = generateId();
      const now = new Date().toISOString();
      const saleDate = dateToSqlValue(data.saleDate ?? null) ?? now;
      await client.execute({
        sql: `INSERT INTO Sale
          (id, customerId, inventoryItemId, decantId, itemType, itemName, quantity,
           unitPrice, totalPrice, paid, pending, paymentMethod, paymentStatus,
           deliveryMethod, deliveryCost, saleDate, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.customerId,
          data.inventoryItemId ?? null,
          data.decantId ?? null,
          data.itemType,
          data.itemName,
          data.quantity ?? 1,
          data.unitPrice,
          data.totalPrice,
          data.paid,
          data.pending ?? 0,
          data.paymentMethod ?? null,
          data.paymentStatus ?? "paid",
          data.deliveryMethod ?? null,
          data.deliveryCost ?? null,
          saleDate,
          data.notes ?? null,
          now,
          now,
        ],
      });
      const created = await this.findById(id);
      if (!created) {
        return {
          id,
          customerId: data.customerId,
          inventoryItemId: data.inventoryItemId ?? null,
          decantId: data.decantId ?? null,
          itemType: data.itemType,
          itemName: data.itemName,
          quantity: data.quantity ?? 1,
          unitPrice: data.unitPrice,
          totalPrice: data.totalPrice,
          paid: data.paid,
          pending: data.pending ?? 0,
          paymentMethod: data.paymentMethod ?? null,
          paymentStatus: data.paymentStatus ?? "paid",
          deliveryMethod: data.deliveryMethod ?? null,
          deliveryCost: data.deliveryCost ?? null,
          saleDate: new Date(saleDate),
          notes: data.notes ?? null,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        };
      }
      return created;
    },

    /**
     * Update a sale by id.
     */
    async update(id: string, data: SaleUpdateInput): Promise<SaleRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot update sale");
      const setClauses: string[] = [];
      const args: (string | number | null)[] = [];

      if (data.notes !== undefined) {
        setClauses.push("notes = ?");
        args.push(data.notes);
      }
      if (data.paymentMethod !== undefined) {
        setClauses.push("paymentMethod = ?");
        args.push(data.paymentMethod);
      }
      if (data.paymentStatus !== undefined) {
        setClauses.push("paymentStatus = ?");
        args.push(data.paymentStatus);
      }
      if (data.deliveryMethod !== undefined) {
        setClauses.push("deliveryMethod = ?");
        args.push(data.deliveryMethod);
      }
      if (data.deliveryCost !== undefined) {
        setClauses.push("deliveryCost = ?");
        args.push(data.deliveryCost);
      }
      if (data.paid !== undefined) {
        setClauses.push("paid = ?");
        args.push(data.paid);
      }
      if (data.pending !== undefined) {
        setClauses.push("pending = ?");
        args.push(data.pending);
      }

      setClauses.push("updatedAt = ?");
      args.push(new Date().toISOString());

      args.push(id);
      await client.execute({
        sql: `UPDATE Sale SET ${setClauses.join(", ")} WHERE id = ?`,
        args,
      });
      return this.findById(id);
    },

    /**
     * Delete a sale by id.
     */
    async delete(id: string): Promise<boolean> {
      const client = getRawClient();
      if (!client) return false;
      await client.execute({
        sql: "DELETE FROM Sale WHERE id = ?",
        args: [id],
      });
      return true;
    },

    /**
     * Count all sales.
     */
    async count(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute("SELECT COUNT(*) AS cnt FROM Sale");
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },
  },

  // ─── CRM: Dm operations ────────────────────────────────────────────────────
  dm: {
    /**
     * Find all DMs/consultas, newest receivedAt first.
     * Mirrors `db.dm.findMany({ orderBy: { receivedAt: "desc" } })`.
     */
    async findMany(limit = 5000): Promise<DmRow[]> {
      const client = getRawClient();
      if (!client) return [];
      const rs = await client.execute({
        sql: "SELECT * FROM Dm ORDER BY receivedAt DESC LIMIT ?",
        args: [Math.max(1, Math.min(50000, Number(limit) || 5000))],
      });
      return (rs.rows as DbRow[]).map(mapDmRow);
    },

    /**
     * Find a DM by id.
     */
    async findById(id: string): Promise<DmRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM Dm WHERE id = ? LIMIT 1",
        args: [id],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapDmRow(row) : null;
    },

    /**
     * Create a new DM.
     */
    async create(data: DmCreateInput): Promise<DmRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot create dm");
      const id = generateId();
      const now = new Date().toISOString();
      const receivedAt = dateToSqlValue(data.receivedAt ?? null) ?? now;
      await client.execute({
        sql: `INSERT INTO Dm
          (id, customerId, platform, username, fragranceInterest, inquiryType, status,
           nextStep, followUpDate, closedAt, result, notes, receivedAt, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.customerId ?? null,
          data.platform,
          data.username ?? null,
          data.fragranceInterest ?? null,
          data.inquiryType,
          data.status ?? "new",
          data.nextStep ?? null,
          dateToSqlValue(data.followUpDate ?? null),
          null,
          null,
          data.notes ?? null,
          receivedAt,
          now,
          now,
        ],
      });
      const created = await this.findById(id);
      if (!created) {
        return {
          id,
          customerId: data.customerId ?? null,
          platform: data.platform,
          username: data.username ?? null,
          fragranceInterest: data.fragranceInterest ?? null,
          inquiryType: data.inquiryType,
          status: data.status ?? "new",
          nextStep: data.nextStep ?? null,
          followUpDate: data.followUpDate ?? null,
          closedAt: null,
          result: null,
          notes: data.notes ?? null,
          receivedAt: new Date(receivedAt),
          createdAt: new Date(now),
          updatedAt: new Date(now),
        };
      }
      return created;
    },

    /**
     * Update a DM by id.
     */
    async update(id: string, data: DmUpdateInput): Promise<DmRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot update dm");
      const setClauses: string[] = [];
      const args: (string | number | null)[] = [];

      if (data.customerId !== undefined) {
        setClauses.push("customerId = ?");
        args.push(data.customerId);
      }
      if (data.platform !== undefined) {
        setClauses.push("platform = ?");
        args.push(data.platform);
      }
      if (data.username !== undefined) {
        setClauses.push("username = ?");
        args.push(data.username);
      }
      if (data.fragranceInterest !== undefined) {
        setClauses.push("fragranceInterest = ?");
        args.push(data.fragranceInterest);
      }
      if (data.inquiryType !== undefined) {
        setClauses.push("inquiryType = ?");
        args.push(data.inquiryType);
      }
      if (data.status !== undefined) {
        setClauses.push("status = ?");
        args.push(data.status);
      }
      if (data.nextStep !== undefined) {
        setClauses.push("nextStep = ?");
        args.push(data.nextStep);
      }
      if (data.followUpDate !== undefined) {
        setClauses.push("followUpDate = ?");
        args.push(dateToSqlValue(data.followUpDate));
      }
      if (data.closedAt !== undefined) {
        setClauses.push("closedAt = ?");
        args.push(dateToSqlValue(data.closedAt));
      }
      if (data.result !== undefined) {
        setClauses.push("result = ?");
        args.push(data.result);
      }
      if (data.notes !== undefined) {
        setClauses.push("notes = ?");
        args.push(data.notes);
      }

      setClauses.push("updatedAt = ?");
      args.push(new Date().toISOString());

      args.push(id);
      await client.execute({
        sql: `UPDATE Dm SET ${setClauses.join(", ")} WHERE id = ?`,
        args,
      });
      return this.findById(id);
    },

    /**
     * Delete a DM by id.
     */
    async delete(id: string): Promise<boolean> {
      const client = getRawClient();
      if (!client) return false;
      await client.execute({
        sql: "DELETE FROM Dm WHERE id = ?",
        args: [id],
      });
      return true;
    },

    /**
     * Count all DMs.
     */
    async count(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute("SELECT COUNT(*) AS cnt FROM Dm");
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },
  },

  // ─── CRM: DecantDrop operations ────────────────────────────────────────────
  decantDrop: {
    /**
     * Find all decant drops, newest first.
     */
    async findMany(limit = 500): Promise<DecantDropRow[]> {
      const client = getRawClient();
      if (!client) return [];
      const rs = await client.execute({
        sql: "SELECT * FROM DecantDrop ORDER BY createdAt DESC LIMIT ?",
        args: [Math.max(1, Math.min(5000, Number(limit) || 500))],
      });
      return (rs.rows as DbRow[]).map(mapDecantDropRow);
    },

    /**
     * Find a decant drop by id.
     */
    async findById(id: string): Promise<DecantDropRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM DecantDrop WHERE id = ? LIMIT 1",
        args: [id],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapDecantDropRow(row) : null;
    },

    /**
     * Create a new decant drop.
     */
    async create(data: DecantDropCreateInput): Promise<DecantDropRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot create decant drop");
      const id = generateId();
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO DecantDrop
          (id, name, description, comboPrice, regularPrice, targetAudience, status,
           launchedAt, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.name,
          data.description ?? null,
          data.comboPrice,
          data.regularPrice,
          data.targetAudience ?? null,
          data.status ?? "draft",
          dateToSqlValue(data.launchedAt ?? null),
          now,
          now,
        ],
      });
      const created = await this.findById(id);
      if (!created) {
        return {
          id,
          name: data.name,
          description: data.description ?? null,
          comboPrice: data.comboPrice,
          regularPrice: data.regularPrice,
          targetAudience: data.targetAudience ?? null,
          status: data.status ?? "draft",
          launchedAt: data.launchedAt ?? null,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        };
      }
      return created;
    },

    /**
     * Update a decant drop by id.
     */
    async update(id: string, data: DecantDropUpdateInput): Promise<DecantDropRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot update decant drop");
      const setClauses: string[] = [];
      const args: (string | number | null)[] = [];

      if (data.name !== undefined) {
        setClauses.push("name = ?");
        args.push(data.name);
      }
      if (data.description !== undefined) {
        setClauses.push("description = ?");
        args.push(data.description);
      }
      if (data.comboPrice !== undefined) {
        setClauses.push("comboPrice = ?");
        args.push(data.comboPrice);
      }
      if (data.regularPrice !== undefined) {
        setClauses.push("regularPrice = ?");
        args.push(data.regularPrice);
      }
      if (data.targetAudience !== undefined) {
        setClauses.push("targetAudience = ?");
        args.push(data.targetAudience);
      }
      if (data.status !== undefined) {
        setClauses.push("status = ?");
        args.push(data.status);
      }
      if (data.launchedAt !== undefined) {
        setClauses.push("launchedAt = ?");
        args.push(dateToSqlValue(data.launchedAt));
      }

      setClauses.push("updatedAt = ?");
      args.push(new Date().toISOString());

      args.push(id);
      await client.execute({
        sql: `UPDATE DecantDrop SET ${setClauses.join(", ")} WHERE id = ?`,
        args,
      });
      return this.findById(id);
    },

    /**
     * Delete a decant drop by id. (Cascade will delete DecantDropItem rows.)
     */
    async delete(id: string): Promise<boolean> {
      const client = getRawClient();
      if (!client) return false;
      await client.execute({
        sql: "DELETE FROM DecantDrop WHERE id = ?",
        args: [id],
      });
      return true;
    },

    /**
     * Count all decant drops.
     */
    async count(): Promise<number> {
      const client = getRawClient();
      if (!client) return 0;
      const rs = await client.execute("SELECT COUNT(*) AS cnt FROM DecantDrop");
      const v = (rs.rows[0] as DbRow | undefined)?.cnt;
      return toNumber(v) ?? 0;
    },
  },

  // ─── ExchangeRate operations ──────────────────────────────────────────────
  exchangeRate: {
    /**
     * Get the current exchange rates (USDT and BCV).
     * Returns the single row with id='default'.
     *
     * `updatedBy` is included so the admin UI can show whether the last update
     * was made automatically ("auto") or manually (the admin's email / null).
     */
    async get(): Promise<{
      usdtRate: number;
      bcvRate: number;
      updatedAt: Date;
      updatedBy: string | null;
    } | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM ExchangeRate WHERE id = ? LIMIT 1",
        args: ["default"],
      });
      const row = extractOne(rs.rows as DbRow[]);
      if (!row) return null;
      return {
        usdtRate: toNumber(row.usdtRate) ?? 832.73,
        bcvRate: toNumber(row.bcvRate) ?? 701,
        updatedAt: toDate(row.updatedAt) ?? new Date(),
        updatedBy: toStringOrNull(row.updatedBy),
      };
    },

    /**
     * Update the exchange rates (admin only).
     */
    async update(usdtRate: number, bcvRate: number, updatedBy?: string): Promise<boolean> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable");
      const now = new Date().toISOString();
      // Try update first
      const existing = await client.execute({
        sql: "SELECT id FROM ExchangeRate WHERE id = ?",
        args: ["default"],
      });
      if (existing.rows.length > 0) {
        await client.execute({
          sql: "UPDATE ExchangeRate SET usdtRate = ?, bcvRate = ?, updatedBy = ?, updatedAt = ? WHERE id = ?",
          args: [usdtRate, bcvRate, updatedBy || null, now, "default"],
        });
      } else {
        await client.execute({
          sql: "INSERT INTO ExchangeRate (id, usdtRate, bcvRate, updatedBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
          args: ["default", usdtRate, bcvRate, updatedBy || null, now, now],
        });
      }
      return true;
    },
  },

  // ─── PerfumeCatalog operations ────────────────────────────────────────────
  // The storefront catalog. One row per perfume in perfumes.ts.
  // `price = null` means "No Disponible".
  // `available = false` overrides the price and shows the perfume as
  // "No Disponible" in the catalog.
  // `temporalDiscountPct` is 0 (no discount) / 5 / 10 and overrides the
  // prediction-based discount when it is higher (handled in the frontend).
  perfumeCatalog: {
    /**
     * Find all perfume catalog entries, ordered by brand then name (matches
     * the storefront catalog ordering so the admin sees them grouped the
     * same way customers do).
     *
     * Includes ALL rows (active + soft-deleted). Use `findActive()` to get
     * only the rows shown in the storefront catalog.
     */
    async findAll(): Promise<PerfumeCatalogRow[]> {
      const client = getRawClient();
      if (!client) return [];
      const rs = await client.execute(
        "SELECT * FROM PerfumeCatalog ORDER BY brand ASC, name ASC"
      );
      return (rs.rows as DbRow[]).map(mapPerfumeCatalogRow);
    },

    /**
     * Find only active (isActive=1) perfume catalog entries, ordered by
     * brand then name. This is what the storefront `/api/prices` uses so
     * soft-deleted perfumes disappear from the catalog without losing
     * their data.
     */
    async findActive(): Promise<PerfumeCatalogRow[]> {
      const client = getRawClient();
      if (!client) return [];
      const rs = await client.execute(
        "SELECT * FROM PerfumeCatalog WHERE isActive = 1 ORDER BY brand ASC, name ASC"
      );
      return (rs.rows as DbRow[]).map(mapPerfumeCatalogRow);
    },

    /**
     * Find a single perfume catalog entry by its perfumeId (the numeric id
     * used in perfumes.ts and across the storefront/cart).
     */
    async findByPerfumeId(perfumeId: number): Promise<PerfumeCatalogRow | null> {
      const client = getRawClient();
      if (!client) return null;
      const rs = await client.execute({
        sql: "SELECT * FROM PerfumeCatalog WHERE perfumeId = ? LIMIT 1",
        args: [perfumeId],
      });
      const row = extractOne(rs.rows as DbRow[]);
      return row ? mapPerfumeCatalogRow(row) : null;
    },

    /**
     * Create a new perfume catalog entry. Used by the admin "Perfumes" tab
     * to add perfumes that don't exist in the static perfumes.ts catalog.
     *
     * Throws if a row with the same perfumeId already exists (UNIQUE
     * constraint). Callers should pick a perfumeId that doesn't collide
     * (admin-added perfumes use ids >= 10000).
     */
    async create(
      data: PerfumeCatalogCreateInput
    ): Promise<PerfumeCatalogRow> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot create perfume catalog row");
      const id = `perf_${data.perfumeId}`;
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO PerfumeCatalog
          (id, perfumeId, name, brand, price, available,
           temporalDiscountPct, temporalDiscountLabel, notes, updatedAt,
           gender, size, fragranticaId, concentration, brandSlug, perfumeSlug, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.perfumeId,
          data.name,
          data.brand,
          data.price ?? null,
          data.available === false ? 0 : 1,
          Math.max(0, Math.min(99, Math.round(data.temporalDiscountPct ?? 0))),
          data.temporalDiscountLabel?.trim() || null,
          data.notes?.trim() || null,
          now,
          data.gender ?? null,
          data.size ?? null,
          data.fragranticaId ?? null,
          data.concentration ?? null,
          data.brandSlug ?? null,
          data.perfumeSlug ?? null,
          data.isActive === false ? 0 : 1,
        ],
      });
      const created = await this.findByPerfumeId(data.perfumeId);
      if (!created) {
        throw new Error("[rawDb] perfume catalog insert succeeded but row not found");
      }
      return created;
    },

    /**
     * Soft-delete a perfume (set isActive=0). The row stays in the DB
     * (so the admin can re-enable it later) but disappears from the
     * storefront catalog and /api/prices.
     *
     * Returns the updated row (or null if not found).
     */
    async delete(perfumeId: number): Promise<PerfumeCatalogRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot soft-delete perfume");
      await client.execute({
        sql: "UPDATE PerfumeCatalog SET isActive = 0, updatedAt = ? WHERE perfumeId = ?",
        args: [new Date().toISOString(), perfumeId],
      });
      return this.findByPerfumeId(perfumeId);
    },

    /**
     * Hard-delete a perfume (DELETE FROM). Used when the admin wants to
     * permanently remove a perfume that was added by mistake. Returns
     * true if a row was deleted.
     */
    async hardDelete(perfumeId: number): Promise<boolean> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot hard-delete perfume");
      const rs = await client.execute({
        sql: "DELETE FROM PerfumeCatalog WHERE perfumeId = ?",
        args: [perfumeId],
      });
      return ((rs as unknown as { rowsAffected?: number }).rowsAffected ?? 0) > 0;
    },

    /**
     * Update a perfume catalog entry by perfumeId. Only the supplied fields
     * are updated. `price = null` is allowed and means "No Disponible".
     *
     * Supports both the legacy fields (price / available / temporal
     * discount / notes) and the extended fields added in Task 30 (name /
     * brand / gender / size / fragranticaId / concentration / brandSlug /
     * perfumeSlug / isActive).
     */
    async update(
      perfumeId: number,
      data: PerfumeCatalogUpdateInput
    ): Promise<PerfumeCatalogRow | null> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot update perfume catalog");
      const setClauses: string[] = [];
      const args: (string | number | null)[] = [];

      if (data.price !== undefined) {
        setClauses.push("price = ?");
        args.push(data.price);
      }
      if (data.available !== undefined) {
        setClauses.push("available = ?");
        args.push(data.available ? 1 : 0);
      }
      if (data.temporalDiscountPct !== undefined) {
        const pct = Math.max(0, Math.min(99, Math.round(data.temporalDiscountPct)));
        setClauses.push("temporalDiscountPct = ?");
        args.push(pct);
      }
      if (data.temporalDiscountLabel !== undefined) {
        setClauses.push("temporalDiscountLabel = ?");
        args.push(data.temporalDiscountLabel?.trim() || null);
      }
      if (data.notes !== undefined) {
        setClauses.push("notes = ?");
        args.push(data.notes?.trim() || null);
      }
      // ── Extended fields (Task 30) ──
      if (data.name !== undefined) {
        setClauses.push("name = ?");
        args.push(data.name);
      }
      if (data.brand !== undefined) {
        setClauses.push("brand = ?");
        args.push(data.brand);
      }
      if (data.gender !== undefined) {
        setClauses.push("gender = ?");
        args.push(data.gender || null);
      }
      if (data.size !== undefined) {
        setClauses.push("size = ?");
        args.push(data.size || null);
      }
      if (data.fragranticaId !== undefined) {
        setClauses.push("fragranticaId = ?");
        args.push(data.fragranticaId);
      }
      if (data.concentration !== undefined) {
        setClauses.push("concentration = ?");
        args.push(data.concentration || null);
      }
      if (data.brandSlug !== undefined) {
        setClauses.push("brandSlug = ?");
        args.push(data.brandSlug || null);
      }
      if (data.perfumeSlug !== undefined) {
        setClauses.push("perfumeSlug = ?");
        args.push(data.perfumeSlug || null);
      }
      if (data.isActive !== undefined) {
        setClauses.push("isActive = ?");
        args.push(data.isActive ? 1 : 0);
      }

      if (setClauses.length === 0) {
        return this.findByPerfumeId(perfumeId);
      }

      setClauses.push("updatedAt = ?");
      args.push(new Date().toISOString());
      args.push(perfumeId);

      await client.execute({
        sql: `UPDATE PerfumeCatalog SET ${setClauses.join(", ")} WHERE perfumeId = ?`,
        args,
      });
      return this.findByPerfumeId(perfumeId);
    },

    /**
     * Batch update many perfume catalog entries in a single round-trip.
     * Uses libsql `batch()` so all updates succeed or fail together (atomic
     * at the API level — each individual UPDATE is its own statement).
     *
     * Returns the number of statements executed (not necessarily rows
     * changed, since some updates may be no-ops if the values match).
     */
    async bulkUpdate(
      updates: PerfumeCatalogBulkUpdateItem[]
    ): Promise<{ executed: number }> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot bulk update");
      if (!updates || updates.length === 0) return { executed: 0 };

      const stmts = updates.map((u) => {
        const setClauses: string[] = [];
        const args: (string | number | null)[] = [];

        if (u.price !== undefined) {
          setClauses.push("price = ?");
          args.push(u.price);
        }
        if (u.available !== undefined) {
          setClauses.push("available = ?");
          args.push(u.available ? 1 : 0);
        }
        if (u.temporalDiscountPct !== undefined) {
          const pct = Math.max(0, Math.min(99, Math.round(u.temporalDiscountPct)));
          setClauses.push("temporalDiscountPct = ?");
          args.push(pct);
        }
        if (u.temporalDiscountLabel !== undefined) {
          setClauses.push("temporalDiscountLabel = ?");
          args.push(u.temporalDiscountLabel?.trim() || null);
        }
        if (u.notes !== undefined) {
          setClauses.push("notes = ?");
          args.push(u.notes?.trim() || null);
        }

        if (setClauses.length === 0) {
          // No fields to update for this row — emit a no-op
          return {
            sql: "SELECT 1",
            args: [] as (string | number | null)[],
          };
        }

        setClauses.push("updatedAt = ?");
        args.push(new Date().toISOString());
        args.push(u.perfumeId);

        return {
          sql: `UPDATE PerfumeCatalog SET ${setClauses.join(", ")} WHERE perfumeId = ?`,
          args,
        };
      });

      await client.batch(stmts);
      return { executed: stmts.length };
    },

    /**
     * Sync the PerfumeCatalog table from the in-code catalog
     * (`perfumes.ts` + `priceMapping.ts`).
     *
     * For each perfume in perfumes.ts:
     *   - INSERT OR IGNORE a new row (price + available from RETAIL_PRICES,
     *     or null/false if not in RETAIL_PRICES).
     *   - For existing rows, UPDATE the price to match RETAIL_PRICES so the
     *     admin always sees the latest static price baseline. We do NOT
     *     touch available / temporalDiscount / notes on existing rows — those
     *     are admin-controlled fields and shouldn't be reset by a sync.
     *
     * Returns { inserted, updated, total } counts.
     */
    async syncFromCatalog(): Promise<{
      inserted: number;
      updated: number;
      total: number;
    }> {
      const client = getRawClient();
      if (!client) throw new Error("[rawDb] client unavailable — cannot sync");

      // Lazy import to avoid pulling the full perfume catalog into memory
      // on every cold start of the API route module.
      const { perfumes } = await import("@/lib/perfumes");
      const { RETAIL_PRICES } = await import("@/lib/priceMapping");

      const now = new Date().toISOString();
      let inserted = 0;
      let updated = 0;

      // Build a single batch of INSERT OR IGNORE statements so the whole
      // sync is one round-trip. We include the extended fields (gender,
      // size, fragranticaId, brandSlug, perfumeSlug, concentration) so a
      // newly-inserted static perfume is fully populated and ready to show
      // in the storefront catalog without a second pass.
      const insertStmts = perfumes.map((p) => {
        const price = RETAIL_PRICES[p.id] ?? null;
        const available = (p.available ?? true) ? 1 : 0;
        return {
          sql: `INSERT OR IGNORE INTO PerfumeCatalog
            (id, perfumeId, name, brand, price, available,
             temporalDiscountPct, temporalDiscountLabel, notes, updatedAt,
             gender, size, fragranticaId, concentration, brandSlug, perfumeSlug, isActive)
            VALUES (?, ?, ?, ?, ?, ?, 0, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, 1)`,
          args: [
            `perf_${p.id}`,
            p.id,
            p.name,
            p.brand,
            price,
            available,
            now,
            p.gender,
            p.size,
            p.fragranticaId,
            p.concentration ?? null,
            p.brandSlug,
            p.perfumeSlug,
          ] as (string | number | null)[],
        };
      });

      const insertRes = await client.batch(insertStmts);
      for (const r of insertRes) {
        // rowsAffected is the number of rows actually inserted (0 if IGNORE hit)
        const ra = (r as { rowsAffected?: number }).rowsAffected ?? 0;
        if (ra > 0) inserted++;
      }

      // For existing rows: UPDATE price = RETAIL_PRICES[id], but only when
      // the static price is defined (non-undefined). We deliberately skip
      // null/undefined prices so we don't accidentally clobber a price the
      // admin has set on a perfume that wasn't in RETAIL_PRICES.
      const updateStmts: {
        sql: string;
        args: (string | number | null)[];
      }[] = [];
      for (const p of perfumes) {
        const staticPrice = RETAIL_PRICES[p.id];
        if (staticPrice === undefined) continue;
        updateStmts.push({
          sql: "UPDATE PerfumeCatalog SET price = ?, updatedAt = ? WHERE perfumeId = ?",
          args: [staticPrice, now, p.id],
        });
      }
      if (updateStmts.length > 0) {
        const updateRes = await client.batch(updateStmts);
        for (const r of updateRes) {
          const ra = (r as { rowsAffected?: number }).rowsAffected ?? 0;
          if (ra > 0) updated++;
        }
      }

      return { inserted, updated, total: perfumes.length };
    },
  },
};

export type RawDb = typeof rawDb;
