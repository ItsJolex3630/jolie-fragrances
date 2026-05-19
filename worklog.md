# Jolie Fragrances - Performance Optimization Worklog

**Date:** 2025-03-04
**Commit:** `perf: optimize app performance and fix similar perfumes back button`
**Result:** 52 files changed, 5716 insertions, 10685 deletions (net reduction of ~5000 lines)

---

## Task 1: Fix Similar Perfumes Back Button Bug (CRITICAL)

**Problem:** When a user opened a perfume from the SimilarPerfumesModal, viewed it, and clicked "Volver a similares", the entire view closed instead of returning to the modal.

**Root Cause:** The `onReturn` handler for `similarViewPerfume` (when `similarBackStack.length === 0`) only called `setSimilarViewPerfume(null)`, which cleared the perfume view but didn't re-open the SimilarPerfumesModal.

**Fix:** Changed the else branch of `onReturn` from:
```tsx
() => setSimilarViewPerfume(null)
```
to:
```tsx
() => {
  setSimilarViewPerfume(null);
  setShowSimilar(true);  // Re-open the modal
}
```

The `returnLabel` already correctly showed "Volver a similares" when the back stack was empty.

---

## Task 2: Extract PerfumeDetail Data (6300 lines → 641 lines)

**Problem:** `PerfumeDetail.tsx` was 6300 lines because `NOTE_PYRAMIDS` (~3500 lines) and `PERFUME_ACCORDS` (~2100 lines) were inlined.

**Changes:**
- Created `src/lib/notePyramids.ts` — Contains `NoteWithPercentage` interface, `NotePyramidDetailed` interface, and `NOTE_PYRAMIDS` data
- Created `src/lib/perfumeAccords.ts` — Contains `PERFUME_ACCORDS` data
- Updated `PerfumeDetail.tsx` to import from new files
- Updated `CompareModal.tsx` to import from new files (was importing from `@/components/PerfumeDetail`)
- Updated `src/lib/similarity.ts` to import from new files (was importing from `@/components/PerfumeDetail`)

**Result:** `PerfumeDetail.tsx` reduced from 6300 → 641 lines. Data is still code-split with the component since PerfumeDetail is dynamically imported.

---

## Task 3: Remove Unused shadcn/ui Components

**Problem:** 47 unused shadcn/ui components were in `src/components/ui/` taking up disk space and potentially increasing build analysis time.

**Analysis:** Only `toast.tsx` and `toaster.tsx` were actually imported by application code (via `layout.tsx` and `hooks/use-toast.ts`). No other application components used any shadcn/ui components.

**Deleted:** 47 files including accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, form, hover-card, input-otp, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle-group, toggle, tooltip.

**Kept:** `toast.tsx`, `toaster.tsx`

---

## Task 4: Optimize Framer Motion Usage (Hero Parallax → CSS)

**Problem:** The hero section used `useScroll()` + `useTransform()` from framer-motion, which runs a continuous scroll listener and creates JS-driven animations. This is unnecessary overhead for a parallax effect.

**Changes:**
- Removed `useScroll` and `useTransform` from framer-motion imports
- Removed `scrollYProgress`, `heroOpacity`, `heroScale`, `heroParallaxY` motion values
- Replaced `<motion.header style={{ opacity: heroOpacity, scale: heroScale }}>` with `<header>`
- Replaced `<motion.div style={{ y: heroParallaxY }} className="hero-aurora">` with `<div className="hero-aurora">`
- Replaced `<motion.div style={{ y: heroParallaxY }}>` (particles container) with plain `<div>`
- Kept `motion` and `AnimatePresence` for entry animations and modals (lightweight, appropriate)

**Result:** Eliminated continuous scroll listener. Hero section no longer triggers JS on every scroll frame.

---

## Task 5: Optimize brandCounts/genderCounts Computation

**Problem:** `brandCounts` was O(n*m) — iterating all brands and filtering all perfumes for each brand. Same pattern for `genderCounts`.

**Before:**
```tsx
const brandCounts = useMemo(() => {
  const counts: Record<string, number> = { Todas: allPerfumes.length };
  allBrands.forEach((brand) => {
    counts[brand] = allPerfumes.filter((p) => p.brand === brand).length;
  });
  return counts;
}, [allPerfumes, allBrands]);
```

**After:**
```tsx
const brandCounts = useMemo(() => {
  const counts: Record<string, number> = { Todas: allPerfumes.length };
  allPerfumes.forEach((p) => {
    counts[p.brand] = (counts[p.brand] || 0) + 1;
  });
  return counts;
}, [allPerfumes]);
```

Same optimization applied to `genderCounts`. Also removed `allBrands` from dependency array since it's no longer needed.

---

## Task 6: Image Optimization in PerfumeCard

**Changes to `<img>` tags:**
- Added `decoding="async"` — Allows the browser to decode the image off the main thread
- Added `style={{ color: 'transparent' }}` — Prevents FOUC (Flash of Unstyled Content) by hiding alt text flash
- `loading="lazy"` was already present — Good

Applied to both the main PerfumeCard image and the autocomplete suggestion image.

---

## Task 7: Optimize CursorGlow

**Problem:** The original implementation ran `requestAnimationFrame` continuously even when the mouse wasn't moving, wasting CPU cycles on every frame.

**Before:** rAF loop + left/top positioning (not GPU-composited)
**After:** Direct update on `mousemove` event + `transform: translate()` (GPU-composited)

**Changes:**
- Removed `posRef`, `rafRef`, and the `animate()` rAF loop
- `handleMove` now directly sets `glowRef.current.style.transform` instead of updating a ref for the rAF loop
- Added CSS for `.cursor-glow` in `globals.css` using `will-change: transform` and proper positioning with `margin` offsets for centering
- `.cursor-glow.visible` class controls opacity with CSS transition

**Result:** Zero CPU usage when mouse is idle. GPU-composited positioning via `transform` instead of layout-triggering `left/top`.

---

## Task 8: Clean Unused lucide-react Imports

**Analysis:** Checked all 18 imported icons against JSX usage:
- Search, X, MessageCircle, Sparkles, Filter, ExternalLink, Instagram, Phone, Crown, Star, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Heart, Gem, Clock, ArrowLeftRight

**Result:** All 18 icons are actively used in the JSX. No unused imports found. No changes needed.

---

## Build Verification

- `bun run build` completed successfully
- All routes compiled without errors
- Pushed to `ItsJolex3630/jolie-fragrances` on `main` branch
