import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyToken, COOKIE_NAME, verifyAdminFromDB } from '@/lib/auth'
import { perfumes, PERFUME_NOTES } from '@/lib/perfumes'
import { addSecurityHeaders } from '@/lib/security-headers'

export async function POST(req: NextRequest) {
  try {
    // VULNERABILITY FIX #8: Always require admin auth, even on empty DB
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return addSecurityHeaders(NextResponse.json(
        { error: "No autorizado — inicia sesión como administrador primero" },
        { status: 401 }
      ))
    }
    const payload = await verifyToken(token)
    if (!payload) {
      return addSecurityHeaders(NextResponse.json(
        { error: "Token inválido — inicia sesión de nuevo" },
        { status: 401 }
      ))
    }

    // VULNERABILITY FIX #4: Verify admin role from DB, not from JWT
    const isAdmin = await verifyAdminFromDB(payload.userId)
    if (!isAdmin) {
      return addSecurityHeaders(NextResponse.json(
        { error: "No autorizado — se requieren permisos de administrador" },
        { status: 403 }
      ))
    }

    // Check if already seeded
    const count = await db.perfume.count()
    if (count > 0) {
      return addSecurityHeaders(NextResponse.json({
        message: "La base de datos ya tiene datos. Usa DELETE /api/perfumes primero para reiniciar.",
        count,
      }))
    }

    // Seed perfumes
    let seeded = 0
    for (const perfume of perfumes) {
      const notes = PERFUME_NOTES[perfume.id] || []
      await db.perfume.create({
        data: {
          id: perfume.id,
          name: perfume.name,
          brand: perfume.brand,
          gender: perfume.gender,
          size: perfume.size,
          price: 0,
          fragranticaId: perfume.fragranticaId,
          brandSlug: perfume.brandSlug,
          perfumeSlug: perfume.perfumeSlug,
          fragranticaSearchUrl: perfume.fragranticaSearchUrl || null,
          notes: notes.join(","),
        },
      })
      seeded++
    }

    // VULNERABILITY FIX #2: Admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'jolie@fragrances.com'
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return addSecurityHeaders(NextResponse.json(
        { error: "ADMIN_PASSWORD no está configurado en variables de entorno" },
        { status: 500 }
      ))
    }

    const existingAdmin = await db.user.findUnique({
      where: { email: adminEmail },
    })

    if (!existingAdmin) {
      const hashedPassword = await hashPassword(adminPassword)
      await db.user.create({
        data: {
          name: "Jolie Fragrances",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
        },
      })
    }

    return addSecurityHeaders(NextResponse.json({
      message: "Base de datos inicializada correctamente",
      perfumes: seeded,
      adminCreated: !existingAdmin,
    }))
  } catch (error) {
    console.error('Seed error:', error)
    return addSecurityHeaders(NextResponse.json(
      { error: "Error al inicializar la base de datos" },
      { status: 500 }
    ))
  }
}
