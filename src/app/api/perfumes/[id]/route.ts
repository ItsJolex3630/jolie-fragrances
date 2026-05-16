import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { verifyOrigin } from "@/lib/csrf";

// Input sanitization
function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

// Valid values for gender
const VALID_GENDERS = ["Dama", "Caballero", "Unisex"];
// Valid brands
const VALID_BRANDS = [
  "Armaf", "Al Haramain", "Lattafa", "French Avenue",
  "Afnan", "Rave", "Maison Alhambra", "Dumont", "Rasasi",
];

// PUT update perfume (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ─── CSRF Protection ───
    const csrfError = verifyOrigin(req);
    if (csrfError) {
      return NextResponse.json({ error: csrfError }, { status: 403 });
    }

    const session = await getServerSession(authOptions);

    if (!session || (session.user as { role: string })?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado — se requieren permisos de administrador" },
        { status: 403 }
      );
    }

    // ─── Rate limiting ───
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(clientIp, RATE_LIMITS.admin);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
        { status: 429 }
      );
    }

    const { id } = await params;

    // Validate ID
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updateData: Record<string, unknown> = {};

    // Validate and sanitize each field if provided
    if (body.name !== undefined) {
      const name = sanitizeInput(String(body.name));
      if (name.length < 2 || name.length > 200) {
        return NextResponse.json(
          { error: "El nombre debe tener entre 2 y 200 caracteres" },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (body.brand !== undefined) {
      if (!VALID_BRANDS.includes(body.brand)) {
        return NextResponse.json(
          { error: "Marca inválida" },
          { status: 400 }
        );
      }
      updateData.brand = body.brand;
    }

    if (body.gender !== undefined) {
      if (!VALID_GENDERS.includes(body.gender)) {
        return NextResponse.json(
          { error: "Género inválido" },
          { status: 400 }
        );
      }
      updateData.gender = body.gender;
    }

    if (body.size !== undefined) {
      updateData.size = sanitizeInput(String(body.size));
    }

    if (body.fragranticaId !== undefined) {
      const fid = Number(body.fragranticaId);
      if (!Number.isInteger(fid) || fid < 1) {
        return NextResponse.json(
          { error: "Fragrantica ID inválido" },
          { status: 400 }
        );
      }
      updateData.fragranticaId = fid;
    }

    if (body.brandSlug !== undefined) {
      updateData.brandSlug = sanitizeInput(String(body.brandSlug));
    }

    if (body.perfumeSlug !== undefined) {
      updateData.perfumeSlug = sanitizeInput(String(body.perfumeSlug));
    }

    if (body.fragranticaSearchUrl !== undefined) {
      updateData.fragranticaSearchUrl = body.fragranticaSearchUrl ? sanitizeInput(String(body.fragranticaSearchUrl)) : null;
    }

    if (body.notes !== undefined) {
      updateData.notes = Array.isArray(body.notes) ? body.notes.join(",") : sanitizeInput(String(body.notes));
    }

    if (body.price !== undefined) {
      if (body.price !== null && body.price !== "") {
        const p = Number(body.price);
        if (isNaN(p) || p < 0 || p > 999999) {
          return NextResponse.json(
            { error: "Precio inválido" },
            { status: 400 }
          );
        }
        updateData.price = p;
      } else {
        updateData.price = null;
      }
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron campos para actualizar" },
        { status: 400 }
      );
    }

    const perfume = await db.perfume.update({
      where: { id: numericId },
      data: updateData,
    });

    return NextResponse.json(perfume);
  } catch (error) {
    console.error("Error updating perfume:", error);
    return NextResponse.json(
      { error: "Error al actualizar perfume" },
      { status: 500 }
    );
  }
}

// DELETE perfume (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ─── CSRF Protection ───
    const csrfError = verifyOrigin(req);
    if (csrfError) {
      return NextResponse.json({ error: csrfError }, { status: 403 });
    }

    const session = await getServerSession(authOptions);

    if (!session || (session.user as { role: string })?.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado — se requieren permisos de administrador" },
        { status: 403 }
      );
    }

    // ─── Rate limiting ───
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(clientIp, RATE_LIMITS.admin);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
        { status: 429 }
      );
    }

    const { id } = await params;

    // Validate ID
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Delete favorites first
    await db.favorite.deleteMany({
      where: { perfumeId: numericId },
    });

    await db.perfume.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting perfume:", error);
    return NextResponse.json(
      { error: "Error al eliminar perfume" },
      { status: 500 }
    );
  }
}
