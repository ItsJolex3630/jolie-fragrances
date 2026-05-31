import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, COOKIE_NAME, verifyAdminFromDB } from "@/lib/auth";
import { checkRateLimit, ADMIN_RATE_LIMIT, sanitizeString, getClientIp } from "@/lib/security";
import { verifyOrigin } from "@/lib/csrf";
import { addSecurityHeaders } from "@/lib/security-headers";

// ─── Helper: verify admin from DB (not JWT) ───
async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  // Verify role from DB
  const isAdmin = await verifyAdminFromDB(payload.userId);
  if (!isAdmin) return null;
  return payload;
}

// PUT update perfume (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return addSecurityHeaders(NextResponse.json(
      { error: "No autorizado — se requieren permisos de administrador" },
      { status: 403 }
    ));
  }

  // CSRF Protection
  const csrfError = verifyOrigin(req);
  if (csrfError) {
    return addSecurityHeaders(NextResponse.json({ error: csrfError }, { status: 403 }));
  }

  // Rate limiting
  const clientIp = getClientIp(req);
  const rateLimit = await checkRateLimit(`admin:${clientIp}`, ADMIN_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return addSecurityHeaders(NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${rateLimit.retryAfter}s.` },
      { status: 429 }
    ));
  }

  try {
    const { id } = await params;

    // Validate ID
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1) {
      return addSecurityHeaders(NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      ));
    }

    const existing = await db.perfume.findUnique({ where: { id: numericId } });
    if (!existing) {
      return addSecurityHeaders(NextResponse.json(
        { error: `No existe un perfume con ID ${numericId}` },
        { status: 404 }
      ));
    }

    const body = await req.json();

    const updateData: Record<string, unknown> = {};

    // Validate and sanitize each field if provided
    if (body.name !== undefined) {
      const name = sanitizeString(String(body.name), 200);
      if (name.length < 2) {
        return addSecurityHeaders(NextResponse.json(
          { error: "El nombre debe tener al menos 2 caracteres" },
          { status: 400 }
        ));
      }
      updateData.name = name;
    }

    if (body.brand !== undefined) {
      updateData.brand = sanitizeString(String(body.brand), 100);
    }

    if (body.gender !== undefined) {
      updateData.gender = body.gender;
    }

    if (body.size !== undefined) {
      updateData.size = sanitizeString(String(body.size), 50);
    }

    if (body.fragranticaId !== undefined) {
      const fid = Number(body.fragranticaId);
      if (!Number.isInteger(fid) || fid < 1) {
        return addSecurityHeaders(NextResponse.json(
          { error: "Fragrantica ID inválido" },
          { status: 400 }
        ));
      }
      updateData.fragranticaId = fid;
    }

    if (body.brandSlug !== undefined) {
      updateData.brandSlug = sanitizeString(String(body.brandSlug), 100);
    }

    if (body.perfumeSlug !== undefined) {
      updateData.perfumeSlug = sanitizeString(String(body.perfumeSlug), 200);
    }

    if (body.fragranticaSearchUrl !== undefined) {
      updateData.fragranticaSearchUrl = body.fragranticaSearchUrl
        ? sanitizeString(String(body.fragranticaSearchUrl), 500)
        : null;
    }

    if (body.notes !== undefined) {
      updateData.notes = Array.isArray(body.notes)
        ? body.notes.join(",").slice(0, 500)
        : (body.notes ? sanitizeString(String(body.notes), 500) : null);
    }

    if (body.price !== undefined) {
      const p = Number(body.price);
      if (isNaN(p) || p < 0) {
        return addSecurityHeaders(NextResponse.json(
          { error: "Precio inválido" },
          { status: 400 }
        ));
      }
      updateData.price = p;
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return addSecurityHeaders(NextResponse.json(
        { error: "No se proporcionaron campos para actualizar" },
        { status: 400 }
      ));
    }

    const perfume = await db.perfume.update({
      where: { id: numericId },
      data: updateData,
    });

    return addSecurityHeaders(NextResponse.json({
      message: "Perfume actualizado correctamente",
      perfume,
    }));
  } catch (error) {
    console.error("Error updating perfume:", error);
    return addSecurityHeaders(NextResponse.json(
      { error: "Error al actualizar perfume" },
      { status: 500 }
    ));
  }
}

// DELETE perfume (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return addSecurityHeaders(NextResponse.json(
      { error: "No autorizado — se requieren permisos de administrador" },
      { status: 403 }
    ));
  }

  // CSRF Protection
  const csrfError = verifyOrigin(req);
  if (csrfError) {
    return addSecurityHeaders(NextResponse.json({ error: csrfError }, { status: 403 }));
  }

  // Rate limiting
  const clientIp = getClientIp(req);
  const rateLimit = await checkRateLimit(`admin:${clientIp}`, ADMIN_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return addSecurityHeaders(NextResponse.json(
      { error: `Demasiadas solicitudes. Intenta en ${rateLimit.retryAfter}s.` },
      { status: 429 }
    ));
  }

  try {
    const { id } = await params;

    // Validate ID
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId < 1) {
      return addSecurityHeaders(NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      ));
    }

    const existing = await db.perfume.findUnique({ where: { id: numericId } });
    if (!existing) {
      return addSecurityHeaders(NextResponse.json(
        { error: `No existe un perfume con ID ${numericId}` },
        { status: 404 }
      ));
    }

    // Delete favorites first, then the perfume
    await db.favorite.deleteMany({ where: { perfumeId: numericId } });
    await db.perfume.delete({ where: { id: numericId } });

    return addSecurityHeaders(NextResponse.json({
      message: "Perfume eliminado correctamente",
      deleted: { id: numericId, name: existing.name },
    }));
  } catch (error) {
    console.error("Error deleting perfume:", error);
    return addSecurityHeaders(NextResponse.json(
      { error: "Error al eliminar perfume" },
      { status: 500 }
    ));
  }
}
