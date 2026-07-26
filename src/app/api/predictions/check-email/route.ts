import { NextRequest, NextResponse } from "next/server";
import { getDb, isDbAvailable } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  }

  if (!isDbAvailable()) {
    return NextResponse.json({ exists: false, userId: null });
  }

  try {
    const user = await getDb()!.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (user) {
      return NextResponse.json({
        exists: true,
        userId: user.id,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
      });
    }

    return NextResponse.json({ exists: false, userId: null });
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
