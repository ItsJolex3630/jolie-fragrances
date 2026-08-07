import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateDiscountPayload } from "@/lib/predictionSecurity";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

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
    const { email, predictionId } = await request.json();

    // The caller can only generate a code for their OWN email
    if (
      !email ||
      email.trim().toLowerCase() !== session.user.email.trim().toLowerCase()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!predictionId) {
      return NextResponse.json({ error: "Missing predictionId" }, { status: 400 });
    }

    if (!isRawDbAvailable()) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const prediction = await rawDb.prediction.findById(predictionId);
    if (!prediction) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
    }

    const sessionEmail = email.trim().toLowerCase();
    const user = await rawDb.user.findUniqueByEmail(sessionEmail);
    if (!user || prediction.userId !== user.id) {
       return NextResponse.json({ error: "Forbidden: Not your prediction" }, { status: 403 });
    }

    let actualDiscountPct = 0;
    if (prediction.exactScore) {
      actualDiscountPct = 10;
    } else if (prediction.correct) {
      actualDiscountPct = 5;
    }

    if (actualDiscountPct === 0) {
      return NextResponse.json({ error: "No discount won for this prediction" }, { status: 400 });
    }

    const code = generateDiscountPayload(sessionEmail, predictionId, actualDiscountPct);
    return NextResponse.json({ code });
  } catch (err) {
    console.error("[generate-code] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
