import crypto from "crypto";

// ─── Secret key for HMAC signing (CHANGE IN PRODUCTION) ───
const HMAC_SECRET = process.env.QR_HMAC_SECRET || "jolie-fragrances-prediction-secret-2026";

/**
 * Hash an IP address with SHA-256 for privacy-compliant storage
 */
export function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip + "-jolie-salt-ip").digest("hex");
}

/**
 * Hash a device fingerprint with SHA-256
 * This is used to detect multi-account from the same device/browser
 */
export function hashFingerprint(fp: string): string {
  return crypto.createHash("sha256").update(fp + "-jolie-salt-fp").digest("hex");
}

/**
 * Generate a cryptographic signature for a discount code payload
 * This makes QR codes impossible to forge without the secret key
 */
export function signPayload(payload: string): string {
  return crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("hex").substring(0, 16);
}

/**
 * Verify a cryptographic signature
 */
export function verifySignature(payload: string, signature: string): boolean {
  const expected = signPayload(payload);
  // Length-safe comparison
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}

/**
 * Generate a discount code payload
 * Format: EMAIL:PREDICTION_ID:TIMESTAMP:DISCOUNT_PCT:SIGNATURE
 */
export function generateDiscountPayload(email: string, predictionId: string, discountPct: number): string {
  const timestamp = Date.now();
  const rawPayload = `${email}:${predictionId}:${timestamp}:${discountPct}`;
  const signature = signPayload(rawPayload);
  return `${rawPayload}:${signature}`;
}

/**
 * Parse and verify a discount code payload
 * Returns null if signature is invalid
 */
export function verifyDiscountPayload(payload: string): {
  email: string;
  predictionId: string;
  timestamp: number;
  discountPct: number;
  isValid: boolean;
} | null {
  const parts = payload.split(":");
  if (parts.length !== 5) return null;

  const [email, predictionId, timestampStr, discountStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  const discountPct = parseInt(discountStr, 10);

  if (isNaN(timestamp) || isNaN(discountPct)) return null;

  const rawPayload = `${email}:${predictionId}:${timestamp}:${discountPct}`;
  const isValid = verifySignature(rawPayload, signature);

  return { email, predictionId, timestamp, discountPct, isValid };
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
