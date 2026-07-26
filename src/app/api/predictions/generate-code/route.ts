import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateDiscountPayload } from "@/lib/predictionSecurity";

/**
 * POST /api/predictions/generate-code
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a cryptographically signed discount code payload.
 *
 * SECURITY: The HMAC signing key (QR_HMAC_SECRET) must NEVER appear in
 * client-side code. This endpoint keeps the secret server-side and returns
 * only the signed payload to the authenticated caller.
 *
 * Auth: requires a valid NextAuth session (user must be logged in).
 * ─────────────────────────────────────────────────────────────────────────────
 */
export async function POST(request: NextRequest) {
  // Must be authenticated
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, predictionId, discountPct } = await request.json();

    // The caller can only generate a code for their OWN email
    if (
      !email ||
      email.trim().toLowerCase() !== session.user.email.trim().toLowerCase()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!predictionId || typeof discountPct !== "number") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const code = generateDiscountPayload(email.trim().toLowerCase(), predictionId, discountPct);
    return NextResponse.json({ code });
  } catch (err) {
    console.error("[generate-code] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
