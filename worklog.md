# Work Log - Jolie Fragrances Predictions System

---
Task ID: 1
Agent: Main Agent
Task: Fix Gmail verification security and prepare for Vercel deployment

Work Log:
- Added Google Sign-In via NextAuth.js v4 with PrismaAdapter
- Created /api/auth/[...nextauth] route for Google OAuth
- Created /api/predictions/google-register endpoint for Google-authenticated registration
- Created /predicciones/auth callback page for Google Sign-In flow
- Updated Prisma schema with NextAuth models (Account, Session, VerificationToken)
- Changed User.emailVerified from Boolean to DateTime (NextAuth standard)
- Added User.authProvider field ("google" or "otp")
- Built emailValidator.ts with 200+ disposable email domain blocking
- Updated register route with strict Gmail validation (format, disposable check)
- Updated verify-otp route with emailVerified as DateTime
- Rebuilt frontend with Google Sign-In as primary auth method
- Google button with hd=gmail.com param (ONLY allows real Gmail accounts)
- OTP as secondary fallback (collapsed by default)
- Installed @libsql/client and @prisma/adapter-libsql for Turso cloud DB
- Updated db.ts to support both local SQLite (dev) and Turso/libSQL (prod)
- Created setup-deploy.sh script for guided deployment
- All builds passing, all browser tests passing

Stage Summary:
- Google Sign-In = bulletproof Gmail verification (Google verifies it's real)
- OTP system = strict validation, no disposable emails, rate limited
- Database ready for Vercel (Turso cloud SQLite)
- API-Football key configured and working (valid until 2027)
- Deployment requires: Google OAuth credentials + Turso account + Vercel project

---
Task ID: 2
Agent: Main Agent
Task: Switch to Turso, make Google Sign-In the ONLY visible method, prepare for Vercel

Work Log:
- Updated .env with Turso credentials provided by Joel
- Updated db.ts to auto-detect Turso (TURSO_DATABASE_URL) vs local SQLite
- Removed OTP as visible registration method — now ONLY Google Sign-In shown
- Updated frontend (page.tsx): removed OTP form, only Google button visible
- Added Suspense wrapper for useSearchParams compatibility with Next.js 16
- Updated auth.ts: improved redirect flow to /predicciones/auth after Google sign-in
- Updated auth callback page with better UX (loading/creating/success/error states)
- Updated next.config.ts: removed "output: standalone", added media.api-sports.io for team logos
- Created scripts/init-turso.ts to initialize Turso database tables
- Successfully pushed all tables to Turso (Account, Session, User, Match, Prediction, DiscountCode, OtpCode, VerificationToken)
- Build test passed successfully

Stage Summary:
- Turso database initialized and working with all 8 tables
- Google Sign-In is the ONLY registration method (guarantees real Gmail)
- Build compiles without errors
- Ready for Vercel deployment (needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
- Joel needs to create Google OAuth credentials before deploy

---
Task ID: 25
Agent: CRM Integration Agent
Task: Integrate the complete CRM (Customers, Sales, Decants, Inventory, DMs, Export) from the uploaded workspace-extracted into the existing Jolie Fragrances project, migrating every API route from Prisma to rawDb (@libsql/client) and from crmAdminAuth to adminAuth.

Work Log:

Step 1 — Turso CRM tables (DONE)
- Discovered the existing project already had CRM table types and rawDb methods in src/lib/dbClient.ts (Customer/InventoryItem/Decant/Sale/Dm/DecantDrop + createMany/count helpers), but no canonical .ts migration script (only a .cjs mirror).
- Wrote scripts/create-crm-tables.ts (canonical, run with `bun`) that creates the 8 CRM tables (Customer, InventoryItem, Decant, Sale, Dm, DecantDrop, DecantDropItem, Post) with CREATE TABLE IF NOT EXISTS plus 13 indexes for the dashboard/join queries (Customer.email, Customer.userId, InventoryItem.status, Decant.status, Decant.customerId, Sale.customerId, Sale.saleDate, Sale.inventoryItemId, Sale.decantId, Dm.customerId, Dm.status, Dm.followUpDate, DecantDropItem.dropId).
- Deleted the redundant scripts/create-crm-tables.cjs to satisfy ESLint's no-require-imports rule.
- Ran `bun scripts/create-crm-tables.ts` successfully — all 8 tables + 13 indexes verified present in Turso.

Step 2 — dbClient.ts CRM methods (already present)
- Verified src/lib/dbClient.ts already exports `rawDb.customer`, `rawDb.inventoryItem`, `rawDb.decant`, `rawDb.sale`, `rawDb.dm`, `rawDb.decantDrop` with findMany/findById/findByEmail/create/createMany/update/delete/count methods (lines 2081–3188). Also exports `getRawDbClient()` for raw batch() calls (used by sales POST and sales/[id] DELETE for atomic transactions replacing Prisma's `db.$transaction`).
- No changes needed — Step 2 was already complete.

Step 3 — CRM API routes (migrated Prisma → rawDb, crmAdminAuth → adminAuth)
- Existing migrated routes (verified, no changes): customers/, customers/[id]/, dms/, dms/[id]/, inventory/, inventory/[id]/, decants/, decants/[id]/, sales/.
- NEW: src/app/api/admin/crm/sales/[id]/route.ts — PUT (update sale notes/payment/delivery) + DELETE (atomic batch: delete sale + revert inventory/decant status to "available").
- NEW: src/app/api/admin/crm/stats/route.ts — dashboard KPIs (totals, revenue, conversion DM→Sale, decantsByStatus, inventoryByStatus, dmsByStatus). Aggregates everything client-side from the findMany() results (no Prisma `_count` needed).
- NEW: src/app/api/admin/crm/export/route.ts — full CRM Excel export with 6 sheets (Resumen, Clientes, Ventas, Decants, Inventario, DMs y Consultas). Uses xlsx (SheetJS) — installed xlsx@0.18.5. Pre-fetches customer names into a Map for sales/decants/dms enrichment.
- NEW: src/app/api/admin/crm/inventory/sync/route.ts — POST endpoint that syncs the CRM inventory with the perfumes catalog (Step 6). Builds a single atomic `client.batch()` of INSERT OR IGNORE + UPDATE statements (one per perfume with a retail price). Uses deterministic id `cat-{perfumeId}` for catalog items so re-running sync doesn't duplicate. Updates existing items' price/size/olfativeProfile (computed from PERFUME_NOTES) without touching status (so sold items stay sold).

Step 4 — CRM UI page (src/app/admin/crm/page.tsx, 2401 lines)
- Copied the uploaded workspace CRM page verbatim, then adapted:
  • Added `useSession` + `useRouter` imports (next-auth/react + next/navigation).
  • Added the ADMIN_EMAIL constant (mirrors src/lib/adminAuth.ts).
  • Added `RefreshCw` to the lucide-react imports (used by the new "Sincronizar con catálogo" button).
  • Added an access-control useEffect that redirects unauthenticated/non-admin users to "/" (mirrors src/app/admin/page.tsx behavior).
  • Added a `status === "loading"` splash (gold spinner on black) so the CRM UI doesn't flash to non-admins before the redirect fires.
  • Changed the "Volver" link to point to "/admin" (instead of "/") since CRM is now accessed from the admin panel.
- The page is a "use client" component with 7 tabs (Dashboard, Clientes, Ventas, Decants, Inventario, DMs, Exportar) — all fetch from /api/admin/crm/*.

Step 5 — CRM link in admin panel (src/app/admin/page.tsx)
- Added Briefcase + ArrowUpRight icons to the lucide-react imports.
- Inserted a CRM banner at the top of <main> — a clickable card (gold gradient) with a Briefcase icon, "CRM · Clientes, ventas, decants e inventario" title, and a clear call-to-action "Abrir CRM →" that links to /admin/crm.
- Banner is rendered above the existing Tab navigation, visible to the admin immediately upon opening /admin.

Step 6 — Sync inventory with catalog (implemented in InventoryTab + /api/admin/crm/inventory/sync)
- Added a "Sincronizar con catálogo" button to the InventoryTab toolbar (with RefreshCw icon, spinning state during sync).
- Button calls POST /api/admin/crm/inventory/sync, then displays a green success banner showing: catalog total, created count, updated count, and "sin precio" (skipped) count.
- Backend (sync route) iterates the `perfumes` array from src/lib/perfumes.ts, looks up the retail price in RETAIL_PRICES from src/lib/priceMapping.ts, computes the olfative profile from PERFUME_NOTES, and:
  • If an InventoryItem with the same lowercase name|brand|size already exists → UPDATE price/size/brand/olfativeProfile (status preserved so sold items stay sold).
  • Otherwise → INSERT OR IGNORE with id `cat-{perfumeId}`, status "available", and a note indicating the source perfume id + gender.

Verification
- `bun run lint` — passes with 0 errors, 0 warnings.
- `bun scripts/create-crm-tables.ts` — creates all 8 tables + 13 indexes (idempotent).
- `curl /admin/crm` — 200 OK, renders the loading splash.
- `curl /admin` — 200 OK, renders the admin panel with the new CRM banner.
- `curl /api/admin/crm/{stats,export,inventory,decants,dms}` (GET) — 403 Forbidden (unauthenticated).
- `curl -X PUT/DELETE /api/admin/crm/sales/test-id` — 403 Forbidden.
- `curl -X POST /api/admin/crm/inventory/sync` — 403 Forbidden.
- Dev server log shows clean compiles for /admin/crm (1.2s first compile, 40ms cached) and /admin (1.1s first compile).
- All CRM API routes use `import { rawDb, getRawDbClient } from "@/lib/dbClient"` (NOT Prisma).
- All CRM API routes use `import { requireAdmin } from "@/lib/adminAuth"` (NOT crmAdminAuth).

Stage Summary:
- 7 CRM tables already existed in Turso (verified via the new .ts script which adds Post + 13 indexes on top of the original .cjs run).
- 4 new API routes created (sales/[id], stats, export, inventory/sync); 9 existing routes verified already migrated.
- CRM UI page (2401 lines) ported with proper NextAuth session gating + ADMIN_EMAIL check.
- Admin panel now links to /admin/crm via a gold gradient banner.
- InventoryTab has a "Sincronizar con catálogo" button that ingests the entire perfume catalog (~250+ perfumes with prices) into the CRM inventory in a single atomic batch.
- Lint clean, dev server compiles all routes without errors, all routes correctly return 403 for non-admins.

---
Task ID: 26
Agent: CRM Improvements Agent
Task: 4 CRM improvements — (1) aesthetic upgrade, (2) sort DMs and Sales newest-first, (3) add edit functionality for Decants and DMs, (4) email autocomplete in the Customer form from /api/admin/users.

Work Log:

Step 0 — Context review
- Read worklog.md (Task 25 set up the CRM with rawDb + adminAuth).
- Read src/app/admin/crm/page.tsx (2402 lines) end-to-end.
- Read the 4 API routes (customers, sales, dms, decants) + the [id] PUT routes for sales/dms/decants/customers.
- Read /api/admin/users/route.ts (returns {users:[{email,name,...}]}) for the autocomplete endpoint.
- Verified dbClient.ts already sorts Sale by `saleDate DESC` and Dm by `receivedAt DESC` — no SQL/API changes were needed for sorting.
- Created /home/z/my-project/agent-ctx/ directory for the work record.

Step 1 — Aesthetics (CRM page, src/app/admin/crm/page.tsx)
- Added 3 shared helpers:
  • Gold({children}) — gold gradient text (`from-[#d4af37] to-[#f0d060] bg-clip-text text-transparent`).
  • SectionTitle({icon,title,subtitle,action}) — Playfair section header with a subtle `border-b border-[#d4af37]/10` divider and an optional action button slot.
  • EmptyState({icon,title,hint}) — large 64px gradient-backed icon tile + title + hint line, used everywhere a list is empty.
- Rewrote StatusBadge to render a colored dot + label, with a refreshed palette (rose/emerald/sky/amber/yellow/orange instead of red/green/blue).
- Header: bigger gold logo tile (`w-10 h-10 rounded-xl` with `shadow-lg shadow-[#d4af37]/20`), `font-[family-name:var(--font-playfair)]` title, `shadow-lg shadow-black/30`.
- Tab bar: `shadow-lg shadow-black/20`.
- Root `<div>` uses `font-[family-name:var(--font-inter)]` so body text is Inter everywhere; section titles use Playfair.
- All section titles use `font-[family-name:var(--font-playfair)]` and `tracking-wide`.
- All cards: `p-4 → p-5`, `hover:shadow-lg hover:shadow-[#d4af37]/5`, `rounded-xl` consistent everywhere.
- All list rows: alternating backgrounds `idx % 2 === 0 ? "bg-white/[0.02]" : "bg-white/[0.035]"` for Customers, Sales, Inventory, DMs.
- All prices rendered with `<Gold>` (Dashboard KPIs, customer totalSpent, sale totalPrice, decant price, inventory price, dashboard totals).
- Dashboard KPIs: each card is now bigger (text-2xl sm:text-3xl), has a colored icon tile (bg + border in matching color), and a trend indicator using `ArrowUpRight`/`ArrowDownRight` with contextual labels (e.g. "X% cobrado", "Requiere seguimiento", "Buena conversión").
- Modal headers/footers updated to `border-b border-[#d4af37]/15` and `border-t border-[#d4af37]/15`, `shadow-2xl shadow-black/50`, Playfair titles, gold hover shadows on primary buttons, `rounded-xl` everywhere.
- ExportTab: bigger icon tile (64px gradient tile), `text-2xl` Playfair title, `shadow-2xl shadow-black/30`, `rounded-xl` button with hover shadow.

Step 2 — Sorting (DMs newest first, Sales newest first)
- Verified the existing API already sorts:
  • GET /api/admin/crm/sales calls rawDb.sale.findMany({ orderBy: { saleDate: "desc" } }) → SQL is `ORDER BY saleDate DESC`.
  • GET /api/admin/crm/dms calls rawDb.dm.findMany() → SQL is `ORDER BY receivedAt DESC`.
- No SQL or route changes needed.
- Added frontend safety sort:
  • SalesTab: `const sortedSales = [...sales].sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());` then renders `sortedSales.map(...)`.
  • DmsTab: `const sortedDms = [...filtered].sort((a,b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());` then renders `sortedDms.map(...)`.
- All DMs/Sales stay in the same flat list; the most recent entry is always at the top regardless of when it arrived.

Step 3 — Edit functionality for Decants and DMs
- Decants:
  • Added `editingDecant: Decant | null` state to DecantsTab.
  • Each decant card now has a pencil button (with hover bg/border) next to the trash button.
  • DecantFormModal rewritten to accept `decant?: Decant | null`:
    - If `decant` is set → isEditing=true, all fields pre-filled from the decant (sourcePerfume, sourceBrand, olfativeProfile, sizeMl, price, cost, status, notes), title becomes "Editar decant", submit reads "Guardar cambios", sends `PUT /api/admin/crm/decants/{id}`.
    - In edit mode the "Cantidad a crear" field is hidden (only relevant for batch create), and the "Estado" select shows all 5 statuses (pending/filled/available/reserved/sold) instead of just 2.
    - PUT body sends {sourcePerfume, sourceBrand, olfativeProfile, sizeMl, price, cost, status, notes} which exactly matches the [id]/route.ts PUT handler.
- DMs:
  • Added `editingDm: Dm | null` state to DmsTab.
  • Each DM card now has a pencil button next to the trash button.
  • DmFormModal rewritten to accept `dm?: Dm | null`:
    - If `dm` is set → isEditing=true, all fields pre-filled. ISO date strings (`receivedAt`, `followUpDate`) are converted to `YYYY-MM-DD` for the `<input type="date">` controls via `.split("T")[0]`.
    - Title becomes "Editar DM / Consulta", submit reads "Guardar cambios", sends `PUT /api/admin/crm/dms/{id}`.
    - The "Fecha de recepción" field is hidden in edit mode because the PUT route doesn't accept `receivedAt` (preserves the original arrival date — important for sort consistency).
    - On create, the POST still sends `receivedAt` so the API stamps the new DM.

Step 4 — Email autocomplete in CustomerFormModal
- Added state `registeredUsers: Array<{email, name}>` and `showSuggestions: boolean`.
- On mount, fetches `GET /api/admin/users` (admin-gated endpoint returning `{users: [{email, name, ...}]}`) and stores only `{email, name}` per user.
- Wrapped the email `<input>` in a `relative` div. As the user types, the component filters `registeredUsers` by `email.toLowerCase().includes(q)`, excludes exact matches (already-typed email), and slices to 6 suggestions.
- Renders a dropdown below the input (absolute, z-20, gold border, shadowed, max-h-52 overflow-y-auto) with one button per suggestion. Each button shows the email + name (if any) with a `Mail` icon.
- Uses `onMouseDown` (not `onClick`) on the suggestions so the click fires before the input's `onBlur` closes the dropdown.
- Clicking a suggestion sets `form.email = u.email` and `form.name = u.name` only if the name field is empty (doesn't overwrite a manually typed name).
- A small helper text below the input shows how many registered users are available for autocomplete.
- The fetch is best-effort: any error is logged and silently ignored — the email field still works as a normal free-text input.

Verification
- `bun run lint` → 0 errors, 0 warnings.
- `curl /admin/crm` → 200 OK (compiled in ~1.5s first time, ~33ms cached).
- `curl /api/admin/crm/{dms,decants,sales,customers}` → 403 (admin gate intact).
- `curl /api/admin/users` → 403 (admin gate intact — autocomplete endpoint correctly protected).
- Dev server log shows clean compiles with no warnings/errors.

Stage Summary
- CRM page grew from 2402 → 2764 lines (+362).
- 3 new shared helpers (Gold, SectionTitle, EmptyState) give the whole CRM a consistent, more premium look (Playfair titles, gold-gradient prices, alternating rows, hover shadows, bigger KPI cards with trend arrows, illustrated empty states).
- DMs and Sales now sort newest-first both in the API (already there) and in the frontend (new safety sort).
- Decants and DMs gained full edit functionality — the existing form modals now support a `decant`/`dm` prop that switches them to PUT mode with pre-filled values.
- Customer form now offers email autocomplete from the registered user base (/api/admin/users) and auto-fills the name when the admin picks a suggestion.
- No API changes were needed; no DB schema changes; no new dependencies.
- Work record written to /home/z/my-project/agent-ctx/26-crm-improvements.md.

---
Task ID: 27
Agent: Dual Currency Agent
Task: Implement a dual currency system (USD / Bolívares) for Jolie Fragrances — base prices always in USD, optional display of a BCV-equivalent USD price + the actual Bs. payment amount when the user toggles to "Bolívares" mode.

Work Log:

Step 0 — Context review
- Read worklog.md (Tasks 1, 2, 25, 26 set up Google auth, Turso, the CRM, and CRM improvements).
- Read src/lib/dbClient.ts (rawDb.exchangeRate.get()/update() already implemented as a singleton 'default' row).
- Read src/lib/priceMapping.ts (roundPrice, applyDiscount, formatPrice, RETAIL_PRICES all in USD).
- Read src/app/page.tsx (PerfumeCard + filter bar + price display).
- Read src/components/CartDrawer.tsx (CartItemRow + footer with subtotal/discountSavings/totalSavings/discountedSubtotal).
- Read src/components/TopBar.tsx (no changes needed).
- Read src/context/CartContext.tsx (subtotal/getItemDiscountedPrice work in USD internally).
- Read src/app/admin/page.tsx (access-control + tabs + CRM banner — good insertion point for the exchange-rate section).
- Read src/lib/adminAuth.ts (requireAdmin returns { ok, email, reason }).
- Read src/app/layout.tsx (CartProvider wraps children + CartDrawer).
- Created /home/z/my-project/agent-ctx/ for the work record.

Step 1 — API /api/exchange-rates/route.ts (NEW)
- GET (public): calls rawDb.exchangeRate.get(); returns { usdtRate, bcvRate, updatedAt, fallback }.
  - If DB unavailable or row missing → returns fallback defaults { usdtRate: 832.73, bcvRate: 701, updatedAt: epoch, fallback: true } with HTTP 200.
- PUT (admin only): requireAdmin() gate; parses { usdtRate, bcvRate } from JSON body; validates both are finite positive numbers; calls rawDb.exchangeRate.update(usd, bcv, email); re-reads the row and returns the canonical stored values.
- 403 Forbidden when not authenticated as admin. 400 on invalid body. 500 on DB write failure.

Step 2 — Hook src/hooks/useCurrency.tsx (NEW)
- CurrencyProvider (React Context):
  - On mount, fetches /api/exchange-rates (cache: no-store), stores the rates in state.
  - Reads the initial mode from localStorage["jolie-currency"] inside a useEffect (avoids SSR hydration mismatch).
  - toggleCurrency() flips "usd" ↔ "bs" and persists to localStorage.
  - formatPrice(usdPrice) returns { primary, secondary }:
    • USD mode → { primary: "$38", secondary: "" }.
    • Bs. mode → { primary: "$45", secondary: "Bs. 31.643,74" }.
      primary = roundPrice((usdPrice * usdtRate) / bcvRate) formatted via formatUsd.
      secondary = "Bs. " + Intl.NumberFormat("es-VE", { min 2, max 2 decimals }).format(usdPrice * usdtRate).
    • Negative amounts (cart savings) produce "-$X" / "-Bs. X" (sign placed before the prefix).
- useCurrency() hook (throws if used outside the provider).
- CurrencyToggle component:
  • variant="full" → "💵 USD | 🇻🇪 Bs." (filter bar).
  • variant="compact" → just "💵" / "🇻🇪" icons (per-card).
  • Sliding gold-gradient (from-[#d4af37] to-[#f0d060]) background animates between the two options. Active = black text, inactive = text-white/45.
- formatBsFromUsd(usdPrice, usdtRate) convenience export.

Step 3 — layout.tsx (MODIFIED)
- Imported CurrencyProvider from "@/hooks/useCurrency".
- Wrapped {children} + <CartDrawer /> inside <CurrencyProvider> (inside <CartProvider>).

Step 4 — page.tsx (MODIFIED)
- Imported useCurrency + CurrencyToggle.
- Removed unused ExternalLink import (the Fragrantica link indicator it powered was replaced by the compact currency toggle).
- Added PerfumePriceBlock helper component (above PerfumeCard) with 4 layouts:
  • USD + no discount → "$38" (gold gradient).
  • USD + discount → strikethrough "$38" + -X% badge + "$34".
  • Bs. + no discount → BCV equivalent (gold, large) + Bs. amount (white/60, small).
  • Bs. + discount → strikethrough "$38" + badge + "→ $34" + BCV equivalent + Bs. amount.
- PerfumeCard: replaced the inline price JSX with <PerfumePriceBlock retailPrice={...} highestAvailableDiscountPct={...} />.
- PerfumeCard: replaced the Fragrantica link indicator (top-right of the image, hover-only) with a compact <CurrencyToggle variant="compact" /> (top-right, always visible). Wrapped in a div with onClick={stopPropagation} so toggling doesn't open the perfume detail.
- Added a centered full <CurrencyToggle variant="full" /> between the search bar and the filter toggle button (mobile + desktop).

Step 5 — CartDrawer.tsx (MODIFIED)
- Imported useCurrency.
- Added CartDualPrice helper component:
  • USD mode → renders just the USD price.
  • Bs. mode → renders BCV equivalent (primary) stacked over Bs. amount (secondary), right-aligned.
  • Accepts primaryClassName + secondaryClassName so each call site keeps its existing color/size styling.
- Replaced every ${...} price interpolation with <CartDualPrice usd={...} />:
  • Perfume items: original (no discount) or strikethrough USD original + discounted CartDualPrice (with discount).
  • Combo items: same pattern.
  • Combo suggestion card: combo price (CartDualPrice) next to strikethrough original USD.
  • Footer Subtotal / Descuentos aplicados / Ahorro por combos / Total — all CartDualPrice.
  • Savings rows pass usd={-discountSavings} / usd={-totalSavings} so the output is "-$X" / "-Bs. X".
- Cart logic (subtotal, discountedSubtotal, getItemDiscountedPrice, etc.) is UNTOUCHED — still works in USD internally. Conversion is purely display-time.

Step 6 — admin/page.tsx (MODIFIED)
- Added RefreshCw, Coins, Save to the lucide-react imports.
- Added ExchangeRateSection component (rendered between the CRM banner and the tab navigation):
  • GET /api/exchange-rates on mount → prefills two number inputs:
    - "Tasa USDT (Bs./USDT) · mercado"
    - "Tasa BCV (Bs./USD) · referencia"
  • Live preview: shows what a $38 perfume would look like with the current input values (BCV equivalent + Bs. amount), updating in real time as the admin types.
  • Actualizar button (gold gradient) → PUT /api/exchange-rates with { usdtRate, bcvRate }.
    - Validates both are finite positive numbers (accepts "," or "." as decimal separator).
    - 403 → "Sesión expirada o sin permisos." / non-OK → error message from JSON.
    - Success → green banner "Tasas actualizadas. Recarga el catálogo para ver los nuevos precios." (auto-dismiss 4s).
  • Recargar button (top-right) re-fetches rates (spinning RefreshCw).
  • Shows last update timestamp (es-VE locale, short date + time).
  • Yellow "Usando valores por defecto" pill when fallback: true.
- Section is inside the admin page (already gated by useSession + ADMIN_EMAIL), so it's only visible to the admin.

Step 7 — Database setup
- Created scripts/create-exchange-rate-table.ts (Turso) and scripts/seed-local-exchange-rate.ts (local SQLite file).
- Ran bun scripts/seed-local-exchange-rate.ts → created the ExchangeRate table in db/custom.db + seeded the default row (usdtRate=832.73, bcvRate=701). It's now the 17th table alongside Account, CartItem, Customer, Decant, DecantDrop, DecantDropItem, DiscountCode, Dm, InventoryItem, Match, OtpCode, Prediction, Sale, Session, User, VerificationToken.
- Ran bun scripts/create-exchange-rate-table.ts → verified Turso also has the table + default row.
- Verified: curl /api/exchange-rates now returns { usdtRate: 832.73, bcvRate: 701, updatedAt: "2026-07-10T00:11:44.264Z", fallback: false }.

Verification
- bun run lint → 0 errors, 0 warnings.
- curl / → 200 OK. HTML contains role="group", "Selector de moneda", "USD", "Bs." (currency toggle rendered).
- curl /admin → 200 OK. ExchangeRateSection is client-gated behind the session check.
- curl /api/exchange-rates (GET, unauthenticated) → 200 OK with real DB values.
- curl -X PUT /api/exchange-rates (unauthenticated) → 403 Forbidden (admin gate working).
- Dev log shows no compile errors after all changes (only typical browser ChunkLoadError HMR warnings during dev).

Stage Summary
- 2 new files: src/app/api/exchange-rates/route.ts (47 lines), src/hooks/useCurrency.tsx (~310 lines).
- 4 modified files: src/app/layout.tsx (+2 lines), src/app/page.tsx (+98 lines, -8 lines), src/components/CartDrawer.tsx (+50 lines, -10 lines), src/app/admin/page.tsx (+285 lines).
- 2 new migration scripts: scripts/create-exchange-rate-table.ts (Turso), scripts/seed-local-exchange-rate.ts (local SQLite).
- CurrencyProvider wraps the entire app inside CartProvider; all prices in catalog, perfume cards, and cart drawer re-render instantly when the user toggles USD ↔ Bs.
- Cart logic is untouched — conversion happens only at display time via useCurrency().formatPrice.
- Admin panel has a new "Tasas de cambio · Doble moneda" section with live preview and PUT-to-/api/exchange-rates functionality.
- Lint clean, dev server compiles all routes without errors, all API routes correctly return 403 for unauthenticated admin writes.
- Work record written to /home/z/my-project/agent-ctx/27-dual-currency.md.

---
Task ID: 28
Agent: Profile Capture Agent
Task: Implement a customer profile capture system — phone + Instagram capture after login (non-blocking modal) + at checkout (blocking inline form for logged-in users), stored on the User table and synced to the CRM Customer table, with the customer's phone + name appended to the WhatsApp order/quote message.

Work Log:

Step 0 — Context review
- Read worklog.md (Tasks 1, 2, 25, 26, 27 cover Google auth, Turso, CRM, CRM improvements, dual currency).
- Read src/lib/dbClient.ts (UserRow / mapUserRow / UserUpdateInput / user.update already in place, customer table has findByEmail but no findByUserId).
- Read src/lib/auth.ts (signIn callback auto-registers users via rawDb.user.create/update).
- Read src/app/layout.tsx (provider nesting: AuthProvider > CurrencyProvider > CartProvider > children + CartDrawer).
- Read src/components/CartDrawer.tsx (two <a href={whatsappCheckoutUrl}> / <a href={whatsappQuoteUrl}> buttons at the bottom of the footer).
- Read src/context/CartContext.tsx (buildWhatsAppCheckoutUrl/QuoteUrl build the wa.me URL from items + email + currency).
- Read src/components/GoogleLoginButton.tsx (handleSignOut — insertion point for clearing the skip flag).
- Read src/app/api/admin/crm/customers/route.ts (rawDb.customer.create shape — channel field, etc.).
- Read src/app/admin/crm/page.tsx (CustomerFormModal — already includes phone/instagram/channel fields).
- Created /home/z/my-project/agent-ctx/ for the work record.

Step 1 — Turso schema migration
- Wrote a one-off scripts/add-user-cols.cjs using @libsql/client + the Turso URL/authToken provided.
- Ran it: PRAGMA table_info(User) showed 11 columns; ALTER TABLE added `phone` and `instagram` (both TEXT, nullable). Final columns: id, email, emailVerified, name, image, ipHash, deviceFingerprint, authProvider, createdAt, banned, bannedReason, phone, instagram.
- Deleted the .cjs file because ESLint's no-require-imports rule fails on require() — the script was a one-shot migration, not production code.

Step 2 — dbClient.ts
- UserRow interface: added `phone: string | null` and `instagram: string | null`.
- UserUpdateInput: added `phone?: string | null` and `instagram?: string | null`.
- mapUserRow: reads phone + instagram (via toStringOrNull).
- user.update: pushes `phone = ?` and `instagram = ?` SET clauses when those fields are supplied.
- customer: added `findByUserId(userId)` (SELECT * FROM Customer WHERE userId = ? LIMIT 1) — needed by /api/profile to find the CRM Customer linked to a User.

Step 3 — /api/profile/route.ts (NEW)
- GET: getServerSession(authOptions); 401 if no session. Returns { authenticated, hasPhone, name, email, phone, instagram, dbAvailable, registered }. hasPhone = !!user.phone && user.phone.trim().length > 0.
- PUT: same auth gate. Parses { phone?, instagram? }. Normalizes phone to digits-only (strips +58, spaces, dashes, parens). Calls rawDb.user.update(user.id, { phone, instagram }) for whichever fields are defined. Then best-effort CRM sync:
  • rawDb.customer.findByUserId(user.id) → if found, rawDb.customer.update(id, { phone, instagram, name }).
  • Otherwise rawDb.customer.create({ userId, name, email, phone, instagram, channel: "web" }).
  • CRM sync errors are caught + logged (non-fatal) — the User update stands because the storefront phone-capture flow reads from User.

Step 4 — ProfileModal.tsx (NEW, src/components/ProfileModal.tsx)
- "use client" component. Uses useSession + framer-motion AnimatePresence.
- On mount + on auth state change: fetches GET /api/profile.
  • If hasPhone === true → render nothing.
  • If hasPhone === false → check localStorage["jolie-profile-skipped"]; show the modal unless that flag is "1".
- Design: dark #0a0a0a background, gold gradient title (Playfair), Inter body, 2xl rounded modal with gold top accent bar.
- Title: "¡Bienvenido a Jolie Fragrances! 👋" (brand name in gold gradient).
- Subtitle explaining why we need the data.
- Three trust badges (Lock / Phone / Zap icons): "Tus datos están seguros con nosotros" / "Solo te contactaremos sobre tu pedido o descuentos ganados" / "Sin spam — solo mensajes importantes".
- Email input is read-only (shows the Google account email).
- Phone input is highlighted (2px gold border + gold ring shadow) with a "+58" prefix and an "424 555 1234" placeholder.
- Instagram input is optional with an Instagram icon + "@tu_usuario" placeholder.
- "Guardar" button: gold gradient, disabled until phone has ≥7 digits, shows a Loader2 spinner while saving.
- "Saltar por ahora" link: subtle, sets the localStorage flag and closes the modal (non-blocking).
- handleSave: PUT /api/profile with normalized phone digits + (optional) instagram. On success: clears the skip flag, closes the modal, fires a "¡Perfil guardado! ✨" toast. On error: shows a destructive toast.
- Clicking the backdrop also closes the modal (same as Skip).

Step 5 — layout.tsx + GoogleLoginButton.tsx
- Imported ProfileModal in layout.tsx and rendered <ProfileModal /> inside <CartProvider> alongside <CartDrawer />. Modal has access to useSession because AuthProvider wraps everything.
- Updated GoogleLoginButton.handleSignOut to localStorage.removeItem("jolie-profile-skipped") before signOut(). This ensures the modal reappears next time the user logs in (they may have skipped it last session).

Step 6 — CartContext.tsx (WhatsApp enrichment + UserProfile)
- Extended OrderLinesContext with `phone?: string | null` and `name?: string | null`.
- buildWhatsAppCheckoutUrl + buildWhatsAppQuoteUrl now push a customer profile block AFTER the order lines (and BEFORE the closing "¡Gracias! ✨" / "Quedo atent@…" line):
    📧 Cuenta: <email>
    📱 Teléfono: +58 <phone>
    👤 Nombre: <name>
  Each line is included only if the field is set; the whole block is pushed only if at least one field exists. Email comes from session.user.email (already wired). Phone + name come from the new userProfile state.
- Added a UserProfile interface (hasPhone, phone, name, email, instagram) + exposed `userProfile: UserProfile | null` and `refreshUserProfile: () => Promise<void>` on CartContextType.
- CartProvider holds userProfile state. refreshUserProfile() fetches GET /api/profile and stores the result (or null). It's called on mount + whenever sessionStatus or session.user.email changes. On unauthenticated, userProfile is cleared.
- The two useMemo'd URLs (whatsappCheckoutUrl, whatsappQuoteUrl) now pass `phone: userProfile?.phone ?? null` and `name: userProfile?.name ?? null` into the builders, with `userProfile` added to the dep array so the URLs recompute the moment the profile is saved.
- refreshUserProfile is exposed so the CartDrawer can await it after the inline phone-capture save (so the URL is rebuilt with the new phone before the WhatsApp tab opens).

Step 7 — CartDrawer.tsx (inline phone capture)
- Added useSession, useState, useEffect, plus Phone/Lock/Loader2 icons and the toast hook.
- New state: phoneCaptureMode ("none" | "checkout" | "quote"), phoneInput, phoneSaving.
- New derived flag: needsPhone = isAuthenticated && userProfile !== null && !userProfile.hasPhone. Anonymous users (not logged in) skip the phone requirement entirely (transparent checkout). Logged-in users WITH a phone skip it too. Logged-in users WITHOUT a phone are blocked.
- Replaced the two <a href={whatsapp*Url}> tags with two <button onClick={() => handleCheckoutClick(mode)}> elements.
- handleCheckoutClick(mode): if needsPhone, set phoneCaptureMode = mode (renders the inline form). Otherwise window.open(url, "_blank", "noopener,noreferrer").
- The inline form is rendered via <AnimatePresence mode="wait"> in place of the buttons (when phoneCaptureMode !== "none"):
  • Phone icon tile + title "Necesitamos tu número para confirmar tu pedido 📱" + subtitle "Joel te escribirá a este WhatsApp para coordinar la entrega."
  • "+58" prefix + autofocus phone input (Enter submits).
  • Lock icon + "Sin spam — solo te escribiremos sobre tu pedido." trust microcopy.
  • Gold "Continuar" button (disabled while saving or phone < 7 digits; spinner shown while saving).
  • Cancel X button restores the normal checkout buttons.
- handlePhoneSubmit:
  • Validates digits ≥ 7 (else destructive toast).
  • PUT /api/profile with { phone: digits }.
  • Awaits refreshUserProfile() (so the WhatsApp URL is rebuilt with the new phone + name).
  • window.open(url, "_blank", "noopener,noreferrer") — uses whatsappCheckoutUrl or whatsappQuoteUrl based on phoneCaptureMode.
  • Resets phoneCaptureMode + phoneInput.
- useEffect resets phoneCaptureMode/phoneInput/phoneSaving to defaults whenever the drawer closes (no stale form on next open).

Verification
- bun run lint → 0 errors, 0 warnings.
- GET /api/profile (no session) → 401 { authenticated: false } ✅
- PUT /api/profile (no session) → 401 { error: "No autenticado" } ✅
- GET / → 200 OK (ProfileModal + CartDrawer wiring compiles cleanly) ✅
- GET /api/admin/crm/customers (no session) → 403 Forbidden (admin gate intact) ✅
- Dev server (Next.js 16.2.9 Turbopack) compiles all routes in <1s with no errors.

Stage Summary
- User table extended with phone + instagram columns (Turso).
- /api/profile GET returns the user's profile; PUT updates User + syncs CRM Customer (create-or-update by userId, channel="web").
- ProfileModal (non-blocking) welcomes new logins and asks for phone (required) + Instagram (optional) with three trust badges. Skippable via "Saltar por ahora" → localStorage flag (cleared on logout so it reappears next session).
- CartDrawer blocks checkout for logged-in users without a phone: clicking either WhatsApp button replaces the buttons with an inline phone-capture form. After saving, the WhatsApp URL is rebuilt with phone + name and opened automatically.
- Anonymous users can checkout without any prompt.
- WhatsApp order + quote messages now include a customer profile block (📧 Cuenta / 📱 Teléfono / 👤 Nombre) so Joel can call them directly.
- CRM Customer table is auto-synced on every profile save, so /admin/crm shows the new phone/instagram immediately.
- Work record written to /home/z/my-project/agent-ctx/28-profile-capture.md.

---
Task ID: 29
Agent: Catalog Admin Agent
Task: Build a catalog management interface in the admin panel — store perfume prices + availability + temporal discounts in the PerfumeCatalog table, expose them via admin API routes, render a new "Catálogo" tab in /admin with inline editing + bulk actions, and wire the public /api/prices endpoint to read from the DB.

Work Log:

Step 0 — Context review
- Read worklog.md (Tasks 1, 2, 25, 26, 27, 28 cover Google auth, Turso, CRM, CRM improvements, dual currency, profile capture).
- Read src/lib/dbClient.ts (rawDb object with user/match/customer/inventoryItem/exchangeRate already implemented; uses @libsql/client singleton with throttled init).
- Read src/lib/perfumes.ts (Perfume type, perfumes[] array with 259 entries, BRANDS list of 17 brands).
- Read src/lib/priceMapping.ts (RETAIL_PRICES Record<number, number|null> + roundPrice/applyDiscount/formatPrice helpers).
- Read src/app/api/prices/route.ts (was reading static RETAIL_PRICES with in-memory cache).
- Read src/app/admin/page.tsx (1,767 lines — uses Tab type "users" | "stats" | "predictions"; has ExchangeRateSection, TabButton, UsersTab, StatsTab, PredictionsTab patterns to mirror).
- Read src/lib/adminAuth.ts (requireAdmin returns { ok, email, reason } — admin = joelmedina2009@gmail.com).
- Read src/hooks/usePrices.ts (PriceData interface, getPrice, refresh).
- Read src/app/page.tsx (PerfumeCard + PerfumePriceBlock helpers — uses perfume.available from static catalog).
- Created /home/z/my-project/agent-ctx/ for the work record.

Step 1 — dbClient.ts: add PerfumeCatalog methods
- Added PerfumeCatalogRow interface (id, perfumeId, name, brand, price, available, temporalDiscountPct, temporalDiscountLabel, notes, updatedAt) near the other row types.
- Added PerfumeCatalogUpdateInput and PerfumeCatalogBulkUpdateItem interfaces near the other input types.
- Added mapPerfumeCatalogRow() mapper near the other mappers.
- Added a new perfumeCatalog object to rawDb with five methods:
  • findAll() — SELECT * FROM PerfumeCatalog ORDER BY brand ASC, name ASC — returns PerfumeCatalogRow[] ordered by brand then name (matches storefront ordering).
  • findByPerfumeId(perfumeId) — SELECT * FROM PerfumeCatalog WHERE perfumeId = ? — returns one row or null.
  • update(perfumeId, data) — dynamically builds UPDATE PerfumeCatalog SET ... WHERE perfumeId = ? from the supplied fields; coerces temporalDiscountPct to 0–99 integer; trims temporalDiscountLabel and notes; always bumps updatedAt.
  • bulkUpdate(updates) — uses libsql batch() to issue all UPDATEs in one round-trip. Skips rows with no fields to update (emits a no-op SELECT 1). Returns { executed }.
  • syncFromCatalog() — imports/updates all perfumes from @/lib/perfumes + @/lib/priceMapping:
    - Lazy-imports both modules so they aren't pulled into memory on every cold start.
    - For each perfume, INSERT OR IGNORE a new row with price and available from RETAIL_PRICES + the perfume's static available flag.
    - For existing rows with a static price in RETAIL_PRICES, UPDATE price = ? (doesn't touch admin-controlled fields like available / temporalDiscount / notes).
    - Returns { inserted, updated, total }.

Step 2 — Database setup
- Wrote scripts/create-perfume-catalog-table.ts (idempotent — CREATE TABLE IF NOT EXISTS PerfumeCatalog (...) + seed via INSERT OR IGNORE from perfumes.ts + RETAIL_PRICES).
- Ran bun scripts/create-perfume-catalog-table.ts against the local SQLite DB → created the table + seeded 259 perfume rows.
- Verified the table: PRAGMA table_info shows all 10 columns; SELECT COUNT(*) = 259.

Step 3 — API: /api/admin/catalog/route.ts (NEW)
- GET /api/admin/catalog (admin only):
  • requireAdmin() gate → 403 if not admin.
  • Calls rawDb.perfumeCatalog.findAll().
  • Returns { items, stats: { total, priced, unpriced, unavailable, temporalDiscounts } }.
- POST /api/admin/catalog (admin only):
  • requireAdmin() gate → 403 if not admin.
  • Calls rawDb.perfumeCatalog.syncFromCatalog().
  • Returns { ok, inserted, updated, total, message } with a Spanish summary message.

Step 4 — API: /api/admin/catalog/[perfumeId]/route.ts (NEW)
- PUT /api/admin/catalog/:perfumeId (admin only):
  • requireAdmin() gate → 403 if not admin.
  • Parses perfumeId from URL params, validates positive integer → 400 if invalid.
  • Calls rawDb.perfumeCatalog.findByPerfumeId(perfumeId) → 404 if not found.
  • Reads JSON body and validates each optional field:
    - price: number | null (null = "No Disponible"); validated ≥ 0; rounded to cents.
    - available: boolean.
    - temporalDiscountPct: integer 0–99; if 0, also clears the label.
    - temporalDiscountLabel: string (trimmed, null if empty).
    - notes: string (trimmed, null if empty).
  • Calls rawDb.perfumeCatalog.update(perfumeId, update) and returns { item: updated }.

Step 5 — API: /api/prices/route.ts (REWRITTEN)
- Now reads from rawDb.perfumeCatalog.findAll() as the primary source.
- Falls back to the static RETAIL_PRICES map if the DB is unavailable or returns 0 rows (backward compatibility).
- 15-second in-process memory cache (read-heavy endpoint, hit on every catalog page load).
- Response shape (kept backward compatible + new fields):
  {
    "prices": { "3": 43, "5": 41, ... },
    "available": { "3": true, "5": true, ... },        // NEW
    "temporalDiscount": { "3": 0, "5": 10, ... },       // NEW
    "temporalDiscountLabel": { "5": "Oferta del día", ... }, // NEW
    "stats": { "total": 259, "priced": 163, "unpriced": 96 },
    "source": "db" | "static",
    "lastUpdated": ISO string,
    "cached": boolean
  }
- In static-fallback mode, available[id] is derived from the price (null = false, otherwise true) and temporalDiscount[id] is always 0 (no temporal discounts in the static map).

Step 6 — usePrices hook (REWRITTEN)
- Added available, temporalDiscount, temporalDiscountLabel to the PriceData interface.
- Added four new methods to UsePricesReturn:
  • isAvailable(perfumeId) — returns true by default if the field is missing, otherwise the DB flag.
  • getTemporalDiscount(perfumeId) — returns 0 if the perfume isn't available (so an unavailable perfume can't show a discount).
  • getTemporalDiscountLabel(perfumeId) — returns the label string or null.
- Exposed available, temporalDiscount, temporalDiscountLabel records on the return object for callers that want raw access.

Step 7 — page.tsx (catalog page) updates
- Destructured isAvailable, getTemporalDiscount, getTemporalDiscountLabel from usePrices().
- Passed three new props to PerfumeCard:
  • dbAvailable: boolean (live DB availability flag)
  • temporalDiscountPct: number (live DB temporal discount)
  • temporalDiscountLabel: string | null
- Inside PerfumeCard:
  • effectiveAvailable = perfume.available !== false && dbAvailable — combines the static and DB availability flags. If either is false, the perfume is shown as "No disponible".
  • effectiveDiscountPct = max(temporalPct, predictionPct) — the temporal discount overrides the prediction discount when it's higher.
  • useTemporal = temporalPct > predictionPct — used to color the discount badge (amber for temporal, emerald for prediction).
  • If !effectiveAvailable → shows "No Disponible" text in the price block instead of a price.
  • If effectiveAvailable && useTemporal && temporalPct > 0 → shows an amber/orange badge in the top-left of the image with the label and percentage.
  • All add-to-cart buttons gated by effectiveAvailable (not just perfume.available).
- Inside PerfumePriceBlock:
  • Replaced highestAvailableDiscountPct prop with discountPct + useTemporal + temporalLabel.
  • Discount badge is now amber (bg-amber-500/15 text-amber-300 border-amber-500/30) when useTemporal is true, emerald otherwise.
  • In Bs. mode, the secondary Bs. line is amber when temporal discount is active, emerald otherwise.
  • Added title tooltip on the badge explaining the discount type ("Oferta temporal" vs "Descuento por predicción").

Step 8 — admin/page.tsx: add "Catálogo" tab
- Imported 6 new icons from lucide-react: Package, Tag, CircleDot, Pencil, X.
- Updated type Tab to include "catalog".
- Added 2 new types near the top: CatalogItem (mirrors PerfumeCatalogRow) and CatalogStats.
- Added 7 new state variables to AdminPage: catalog, catalogStats, catalogLoading, catalogError, catalogSearch, catalogBrand, catalogSyncing.
- Added 4 new handlers in AdminPage:
  • loadCatalog() — GET /api/admin/catalog → sets items + stats.
  • handleCatalogSync() — POST /api/admin/catalog → triggers syncFromCatalog, then reloads.
  • updateCatalogItem(perfumeId, patch) — updates one row locally + recomputes stats in-place so the header reflects the change immediately.
  • bulkUpdateCatalog(updates) — issues N parallel PUTs to /api/admin/catalog/:id, waits for all, then reloads the full list.
- Added the 4th TabButton (Package icon, label "Catálogo") after the Predicciones button.
- Added flex-wrap to the tab container so the 4 tabs wrap on small screens.
- Added the CatalogTab render branch in the tab content conditional.

Step 9 — CatalogTab + CatalogItemCard components (appended to admin/page.tsx)
- CatalogTab component (the main tab body):
  • Header row with 4 stat pills (priced / unpriced / unavailable / temporalDiscounts) + total, and a "Sincronizar con catálogo" button (gold gradient, shows spinner while syncing).
  • Search bar (filters by name, brand, or perfumeId) + count badge.
  • Brand filter pills (horizontal scroll, derived from items, "Todas" + 17 brands).
  • Bulk actions panel (only visible when at least 1 row is selected):
    - 4-column grid: bulk price / bulk availability / bulk temporal discount / Apply button.
    - All fields are optional — only the supplied ones are sent in the bulk PUT.
    - Result banner (green for success, red for failure).
  • "Seleccionar todo" row with a checkbox that selects/deselects all filtered rows.
  • Empty state with a hint to sync if the catalog is empty.
  • Scrollable list (max-h-[calc(100vh-380px)] overflow-y-auto) of CatalogItemCard components.
- CatalogItemCard component (one row, inline editing):
  • Header row: checkbox + name + brand + ID + (optional) "Sin guardar" badge + Save button.
  • 4-column grid: Price input (number, empty = null = "No Disponible") / Available toggle button (green/red dot + label) / Temporal discount % select (None/5%/10%) / Temporal discount label input (disabled when % = 0).
  • Collapsible notes textarea.
  • Error message line.
  • Local state initialized from the item and reset via useEffect when the item changes externally (e.g. after bulk update + reload).
  • dirty flag computed via useMemo comparing all local fields to the saved item.
  • Save button: disabled when not dirty, shows spinner while saving, check icon on success (auto-clears after 2.5s).
  • PUT request to /api/admin/catalog/:id with only the changed fields.
  • On success, calls onUpdate(perfumeId, patch) which updates the parent state + recomputes stats locally.

Verification
- bun scripts/create-perfume-catalog-table.ts → ✓ created PerfumeCatalog table + seeded 259 rows.
- Direct DB tests via bun -e:
  • rawDb.perfumeCatalog.findAll() → 259 rows, sorted by brand then name.
  • rawDb.perfumeCatalog.findByPerfumeId(3) → "Club de Nuit Woman" $43.
  • rawDb.perfumeCatalog.update(3, { temporalDiscountPct: 5, temporalDiscountLabel: "Oferta del día" }) → ✓ updated + returned the new row.
  • rawDb.perfumeCatalog.bulkUpdate([...]) → ✓ 3 statements executed, all three rows updated correctly with different fields per row.
  • rawDb.perfumeCatalog.syncFromCatalog() → ✓ 0 inserted (all exist), 259 prices updated to match RETAIL_PRICES.
- API tests via curl:
  • GET /api/prices?refresh=true → 200, source: "db", stats: { total: 259, priced: 163, unpriced: 96 }, all 4 maps (prices/available/temporalDiscount/temporalDiscountLabel) populated.
  • GET /api/admin/catalog (unauthenticated) → 403 ✓ (admin gate working).
  • POST /api/admin/catalog (unauthenticated) → 403 ✓.
  • PUT /api/admin/catalog/3 (unauthenticated) → 403 ✓.
- Page tests via curl:
  • GET / → 200 OK (catalog renders).
  • GET /admin → 200 OK (admin page compiles, ~36ms cached).
- bun run lint → 0 errors, 0 warnings.
- Dev server log: no compile errors (only typical browser ChunkLoadError HMR warnings).

Stage Summary
- 2 new API routes: src/app/api/admin/catalog/route.ts (51 lines), src/app/api/admin/catalog/[perfumeId]/route.ts (106 lines).
- 1 rewritten API route: src/app/api/prices/route.ts (155 lines — was 47).
- 1 rewritten hook: src/hooks/usePrices.ts (155 lines — was 94).
- 2 modified React files: src/app/page.tsx (PerfumeCard + PerfumePriceBlock reworked for live availability + temporal discount + amber badge), src/app/admin/page.tsx (grew from 1,767 → 2,653 lines = +886; added CatalogTab + CatalogItemCard + bulk actions + sync + state).
- 1 new migration script: scripts/create-perfume-catalog-table.ts (idempotent — CREATE TABLE IF NOT EXISTS + INSERT OR IGNORE seed).
- DB schema addition: PerfumeCatalog table (10 columns: id, perfumeId, name, brand, price, available, temporalDiscountPct, temporalDiscountLabel, notes, updatedAt). 259 rows seeded from perfumes.ts + priceMapping.ts.
- All admin routes (GET/POST/PUT) are gated by requireAdmin().
- /api/prices reads from the DB live, with a 15-second cache, and falls back to RETAIL_PRICES if the DB is unavailable — full backward compatibility.
- Admin can edit price, availability, temporal discount %, temporal discount label, and notes per perfume. Changes are visible to all devices immediately (since /api/prices reads from Turso).
- Temporal discount overrides the prediction discount when it's higher, and shows in amber/orange (vs emerald for prediction discount).
- Unavailable perfumes (available=false in DB OR perfume.available=false in static catalog) show "No Disponible" instead of a price and the add-to-cart button is hidden.
- Work record written to /home/z/my-project/agent-ctx/29-catalog-admin.md.

---
Task ID: 30
Agent: Main Agent
Task: Add a perfume & brand management interface in the admin panel (store new perfumes in BD, merge with static catalog at runtime)

Work Log:
- Extended the PerfumeCatalog table with 7 new columns: gender, size, fragranticaId, concentration, brandSlug, perfumeSlug, isActive (INTEGER NOT NULL DEFAULT 1). Ran ALTER TABLE on BOTH the local dev SQLite (file:.../custom.db) and the production Turso DB (libsql://joliefragrances-itsjolex3630.aws-us-east-1.turso.io). Backfilled all 259 existing rows from the static perfumes.ts data so every static perfume now has its gender/size/fragranticaId/concentration/brandSlug/perfumeSlug populated and isActive=1.
- Updated src/lib/dbClient.ts:
  - Extended PerfumeCatalogRow with the 7 new fields.
  - Extended PerfumeCatalogUpdateInput with name/brand/gender/size/fragranticaId/concentration/brandSlug/perfumeSlug/isActive (in addition to the legacy price/available/temporal*/notes).
  - Added new PerfumeCatalogCreateInput interface for full-row inserts.
  - Updated mapPerfumeCatalogRow() to read the new columns from the libsql ResultSet.
  - Added 3 new perfumeCatalog methods: create(data) for inserts, findActive() that filters isActive=1 (used by /api/prices), delete(perfumeId) for soft-delete (isActive=0), plus hardDelete(perfumeId) for permanent removal.
  - Extended update() to support all new fields.
  - Extended syncFromCatalog() so newly-inserted static perfumes get the extended fields populated too (not just the legacy price/available).
- Updated /api/prices/route.ts (readFromDb):
  - Switched from findAll() to findActive() so soft-deleted perfumes disappear from the storefront catalog.
  - Added a `perfumeDetails` map to the response containing {name, brand, gender, size, fragranticaId, concentration, brandSlug, perfumeSlug} for every BD-only perfume (perfumeId NOT in the static perfumes.ts catalog and with a fragranticaId). Lazy-loads the static perfume id set once per process.
  - Response is backward-compatible: existing clients see the same prices/available/temporalDiscount/temporalDiscountLabel shape, plus the optional new perfumeDetails map.
- Created /api/admin/catalog/perfumes/route.ts (admin-only via requireAdmin):
  - GET: returns all perfumes (active + soft-deleted) with all extended fields.
  - POST: creates a new perfume. Accepts {name, brand, gender, size, fragranticaUrl, price, available, concentration, notes}. Extracts the fragranticaId from the URL (regex match on -<digits>.html$), generates brandSlug/perfumeSlug via slugify, picks perfumeId = MAX(perfumeId)+1 (starting at 10000 so admin-added perfumes never collide with static ids 1-273), and inserts via rawDb.perfumeCatalog.create().
- Created /api/admin/catalog/perfumes/[perfumeId]/route.ts (admin-only):
  - PUT: updates any subset of all fields (name, brand, gender, size, fragranticaUrl/fragranticaId, price, available, concentration, notes, temporalDiscountPct/Label, isActive, brandSlug/perfumeSlug). Auto-regenerates slugs from name/brand unless explicit overrides are passed.
  - DELETE: soft-deletes by default (isActive=0); pass ?hard=true to permanently remove the row (only meaningful for admin-added perfumes with id >= 10000).
- Updated src/hooks/usePrices.ts:
  - Added PerfumeDetail interface (exported, mirrors the server-side shape).
  - Added perfumeDetails to the PriceData interface and the UsePricesReturn contract.
  - The hook now exposes `perfumeDetails` so the catalog page can merge BD-only perfumes into the listing.
- Updated src/app/page.tsx (storefront catalog):
  - Imports the Concentration type.
  - Reads `perfumeDetails` from usePrices().
  - New useEffect that watches perfumeDetails + allPerfumes, and for every BD perfume id not already in the static list, constructs a Perfume object (brand/gender cast to the strict union types, concentration optional) and appends it to allPerfumes + allBrands. Functional updaters + existing-id check inside the updater guard against React Strict Mode double-invocation and against the static /api/perfumes fetch later replacing the array.
- Added a new "Perfumes" tab to the admin panel (src/app/admin/page.tsx):
  - New Tab type entry "perfumes", new TabButton with FlaskConical icon.
  - Renders <PerfumesTab /> (extracted to src/app/admin/PerfumesTab.tsx to keep page.tsx manageable).
- Created src/app/admin/PerfumesTab.tsx (≈900 lines, fully self-contained):
  - List view: every BD perfume with image thumbnail, name, brand, gender/size/concentration badges, ID, price, available toggle, isActive (Visible/Oculto) toggle, edit & delete buttons, link to Fragrantica page. Search by name/brand/ID, brand filter pills, "show inactive" toggle, and a stats header (active / hidden / added / total).
  - Add new perfume modal: Name*, Brand* (with <datalist> autocomplete from existing brands + free text), Gender* select (Dama/Caballero/Unisex), Size* text, Fragrantica URL* with LIVE image preview (extracts the ID as the user types and shows the 375x500 dark avif image with .jpg fallback), Price USD (empty = Consultar), Available toggle, Concentration select (EDP/EDT/Parfum/Elixir/EdC/EdF), Notes textarea. For edit mode: also shows an isActive toggle.
  - Edit perfume modal: same form, pre-filled from the existing row, PUT on save.
  - Delete confirm dialog: shows TWO options — soft-delete (recommended, hides from catalog but keeps the row) and hard-delete (permanent, only offered for admin-added perfumes with id >= 10000).
  - Image preview uses the SAME URL format the storefront uses (fimgs.net/mdimg/perfume-thumbs/dark-375x500.{id}.avif) so what the admin sees is exactly what customers will see. onError fallback swaps to the .jpg variant.
- All admin routes use requireAdmin() from src/lib/adminAuth and return 403 for non-admin sessions.
- All DB operations use rawDb (no Prisma client).
- Ran `bun run lint` — passes with 0 errors and 0 warnings.
- Verified the new SQL + API logic end-to-end against the local SQLite: schema migration applied, 259 rows backfilled, fragranticaId extraction works, new-perfumeId generation starts at 10000, INSERT with all fields succeeds, soft-delete (isActive=0) excludes the row from findActive(), hard-delete removes it. Cleaned up the test row afterwards.

Stage Summary:
- Joel can now add new perfumes and brands from /admin → "Perfumes" tab without touching code.
- New perfumes are stored in PerfumeCatalog with id >= 10000 and merged with the static perfumes.ts catalog at runtime via /api/prices → perfumeDetails + the catalog page's merge effect.
- Soft-delete (isActive=0) hides a perfume from the storefront without losing the row.
- The Fragrantica image preview lets Joel verify he picked the right perfume before saving.
- Backward-compatible: existing CatalogTab (price/availability editing for static perfumes) still works; existing /api/prices clients see the same shape plus an optional perfumeDetails map.

---
Task ID: 31
Agent: Subagent (Fullstack — Auto-update exchange rates)
Task: Auto-update exchange rates from external APIs (usdt.com.ve + Binance P2P fallback), Vercel Cron, admin "Auto-actualizar" button.

Work Log:
- Extended `rawDb.exchangeRate.get()` in `src/lib/dbClient.ts` to also return `updatedBy: string | null` (uses existing `toStringOrNull` mapper; column already exists in the ExchangeRate table).
- Updated `src/app/api/exchange-rates/route.ts` GET + PUT to include `updatedBy` in their JSON responses (null on fallback path, admin email on manual PUT).
- Created `src/app/api/exchange-rates/auto-update/route.ts`:
  - **GET** (public — for Vercel Cron): fetches live rates, writes `updatedBy="auto"`.
  - **POST** (admin only — `requireAdmin()`): same logic, used by the manual "Auto-actualizar" button.
  - Both share `runAutoUpdate()`:
    1. Try `GET https://www.usdt.com.ve/api/rates` → `data.binance.buyRate` (USDT) + `data.bcv.rate` (BCV).
    2. Fallback: `POST https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search` with `{fiat:"VES",asset:"USDT",page:1,rows:1,tradeType:"BUY"}` → `data[0].adv.price` (USDT only; BCV kept from DB).
  - 8-second AbortController timeout (under Vercel's 10s serverless limit).
  - On total failure returns HTTP 502 and leaves existing rates untouched (never overwrites with 0/null).
  - Returns `{ success, usdtRate, bcvRate, source: "usdt.com.ve" | "binance_p2p", updatedAt }`.
- Created `vercel.json` with a daily cron job: `{ "crons": [{ "path": "/api/exchange-rates/auto-update", "schedule": "0 9 * * *" }] }` → 09:00 UTC = 05:00 Venezuela (rates are fresh before customers wake up). Fits Vercel Hobby's 1-cron-per-day budget.
- Updated `ExchangeRateSection` in `src/app/admin/page.tsx`:
  - Added `updatedBy` to the `ExchangeRatesData` interface.
  - Added `🔄 Auto-actualizar` button next to the manual "Actualizar" button (calls POST `/api/exchange-rates/auto-update`).
  - On success: shows toast "Tasas actualizadas automáticamente ✨" with source description, displays a gold "Fuente: usdt.com.ve / Binance P2P" badge, and re-fetches `/api/exchange-rates` to reflect the canonical stored state.
  - On error: shows toast (destructive) + inline error panel.
  - Added `🤖 Automática` badge (sky-blue) when `updatedBy === "auto"`, else `✋ Manual` badge (white/neutral).
  - Imported `toast` from `@/hooks/use-toast` (Toaster already mounted in `layout.tsx`).
- Ran `bun scripts/seed-local-exchange-rate.ts` because the local SQLite was missing the `ExchangeRate` table (table now created + seeded).
- Verified end-to-end with curl:
  - `GET /api/exchange-rates/auto-update` → HTTP 200, `{success:true, usdtRate:864.6745, bcvRate:737.2321, source:"usdt.com.ve", updatedAt:"..."}`.
  - `GET /api/exchange-rates` → now returns `updatedBy:"auto"`.
  - `POST /api/exchange-rates/auto-update` without auth → HTTP 403 (correct).
  - `GET /admin` → HTTP 200 (page compiles).

Stage Summary:
- Exchange rates are now auto-refreshed daily by Vercel Cron (09:00 UTC) without Joel lifting a finger.
- Manual fallback: Joel can click "🔄 Auto-actualizar" in `/admin` to refresh on demand.
- The admin panel clearly shows whether the last update was automatic (🤖) or manual (✋), plus the data source.
- Two-tier external API fallback (usdt.com.ve → Binance P2P) means a single API outage won't break the refresh.
- The local dev SQLite was missing the ExchangeRate table — re-seeded via the existing script. The Turso (prod) table already exists from a previous task.
- Lint: the only `bun run lint` error is pre-existing in `scripts/create-crm-tables.cjs` (CommonJS `require()`). All four files touched by this task pass ESLint cleanly.
