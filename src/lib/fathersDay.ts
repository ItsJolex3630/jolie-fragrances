/**
 * Father's Day detection utility for Venezuela (America/Caracas timezone)
 *
 * In Venezuela, Father's Day (Día del Padre) is celebrated on the
 * 3rd Sunday of June, same as the United States.
 *
 * This module provides:
 * - `getFathersDayDate(year)`: Returns the exact Date for Father's Day of a given year
 * - `getFathersDayInfo()`: Returns current status relative to Father's Day
 *   - "exact_day": It's Father's Day today! Show full decorations
 *   - "fathers_month": It's June (Father's Day month). Show subtle decorations
 *   - null: Outside the month, show normal page
 */

export type FathersDayStatus = "exact_day" | "fathers_month" | null;

export interface FathersDayInfo {
  status: FathersDayStatus;
  /** The exact Father's Day date for the current year */
  fathersDayDate: Date;
  /** Human-readable date string in Spanish */
  fathersDayLabel: string;
  /** Days until Father's Day (negative if already passed) */
  daysUntil: number;
  /** Current year */
  year: number;
}

/**
 * Calculate the 3rd Sunday of June for a given year.
 * Uses America/Caracas timezone.
 */
export function getFathersDayDate(year: number): Date {
  // Find the first day of June
  const june1 = new Date(year, 5, 1); // Month is 0-indexed, 5 = June
  const dayOfWeek = june1.getDay(); // 0 = Sunday

  // Calculate the 3rd Sunday
  // If June 1 is Sunday (0), then 1st Sunday = June 1, 3rd Sunday = June 15
  // If June 1 is Monday (1), then 1st Sunday = June 7, 3rd Sunday = June 21
  // General formula: 1st Sunday = June (1 + (7 - dayOfWeek) % 7), 3rd = 1st + 14
  const firstSunday = dayOfWeek === 0 ? 1 : 1 + (7 - dayOfWeek);
  const thirdSunday = firstSunday + 14;

  return new Date(year, 5, thirdSunday);
}

/**
 * Format a date as a Spanish readable string for Venezuela
 */
function formatDateSpanish(date: Date): string {
  const months = [
    "", "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  return `${date.getDate()} de ${months[date.getMonth() + 1]}`;
}

/**
 * Get the current Father's Day information based on the user's local time.
 * Since this is a client-side app, we use the browser's timezone.
 * We assume the target audience is in America/Caracas (UTC-4).
 *
 * Returns:
 * - status: "exact_day" | "fathers_month" | null
 * - fathersDayDate: The Date object for this year's Father's Day
 * - fathersDayLabel: Human-readable Spanish date
 * - daysUntil: Days until Father's Day (0 = today, negative = passed)
 */
export function getFathersDayInfo(): FathersDayInfo {
  const now = new Date();
  const year = now.getFullYear();
  const fathersDayDate = getFathersDayDate(year);
  const fathersDayLabel = formatDateSpanish(fathersDayDate);

  // Calculate days until Father's Day
  const today = new Date(year, now.getMonth(), now.getDate());
  const fathersDay = new Date(year, fathersDayDate.getMonth(), fathersDayDate.getDate());
  const diffTime = fathersDay.getTime() - today.getTime();
  const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Check if today IS Father's Day
  if (daysUntil === 0) {
    return {
      status: "exact_day",
      fathersDayDate,
      fathersDayLabel,
      daysUntil,
      year,
    };
  }

  // Check if we're in June (Father's Day month)
  if (now.getMonth() === 5) { // 5 = June (0-indexed)
    return {
      status: "fathers_month",
      fathersDayDate,
      fathersDayLabel,
      daysUntil,
      year,
    };
  }

  return {
    status: null,
    fathersDayDate,
    fathersDayLabel,
    daysUntil,
    year,
  };
}
