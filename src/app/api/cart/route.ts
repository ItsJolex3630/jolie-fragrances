import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

/**
 * Cart API — cross-device sync for the shopping cart.
 *
 * All endpoints identify the user by their NextAuth Google session (NOT
 * localStorage). The cart is stored in the DB as CartItem rows keyed by
 * (userId, itemType, itemId). Only reference data is stored (perfumeId /
 * comboId + price + quantity); the full Perfume/Combo objects are
 * re-hydrated client-side from the local catalog on load.
 *
 * Endpoints:
 *   GET    /api/cart          → load all cart items for the logged-in user
 *   POST   /api/cart          → add/update a single item (upsert by quantity)
 *   PUT    /api/cart          → replace the entire cart (full sync)
 *   PATCH  /api/cart          → update discount assignment for one item
 *   DELETE /api/cart          → clear all items  (or ?itemType=&itemId= to delete one)
 */

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const email = session.user.email.trim().toLowerCase();
  if (!email.endsWith("@gmail.com")) return null;
  if (!isRawDbAvailable()) return null;
  const user = await rawDb.user.findUniqueByEmail(email);
  return user;
}

// ─── GET: load cart ──────────────────────────────────────────────────────────
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        items: [],
        message: "No autenticado",
      });
    }

    const cartItems = await rawDb.cartItem.findByUserId(user.id);

    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      email: user.email,
      items: cartItems.map((ci) => ({
        id: ci.id,
        itemType: ci.itemType,
        itemId: ci.itemId,
        price: ci.price,
        quantity: ci.quantity,
        discountCodeId: ci.discountCodeId,
        updatedAt: ci.updatedAt.toISOString(),
      })),
      count: cartItems.reduce((sum, ci) => sum + ci.quantity, 0),
    });
  } catch (error) {
    console.error("[/api/cart GET] Error:", error);
    return NextResponse.json(
      { authenticated: false, items: [], error: "Error interno" },
      { status: 500 }
    );
  }
}

// ─── POST: add or update a single item ───────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: "No autenticado — inicia sesión con Google" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemType, itemId, price, quantity, mode } = body as {
      itemType: "perfume" | "combo";
      itemId: string;
      price: number;
      quantity?: number;
      mode?: "increment" | "set"; // default: increment
    };

    if (!itemType || !itemId || typeof price !== "number") {
      return NextResponse.json(
        { error: "Faltan campos requeridos: itemType, itemId, price" },
        { status: 400 }
      );
    }

    if (itemType !== "perfume" && itemType !== "combo") {
      return NextResponse.json(
        { error: "itemType debe ser 'perfume' o 'combo'" },
        { status: 400 }
      );
    }

    const qty = typeof quantity === "number" && quantity > 0 ? quantity : 1;
    const useIncrement = mode !== "set"; // default = increment

    let result;
    if (useIncrement) {
      result = await rawDb.cartItem.incrementOrAdd(
        user.id,
        itemType,
        String(itemId),
        price,
        qty
      );
    } else {
      result = await rawDb.cartItem.upsert(
        user.id,
        itemType,
        String(itemId),
        price,
        qty
      );
    }

    return NextResponse.json({
      authenticated: true,
      success: true,
      item: {
        id: result.id,
        itemType: result.itemType,
        itemId: result.itemId,
        price: result.price,
        quantity: result.quantity,
      },
    });
  } catch (error) {
    console.error("[/api/cart POST] Error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

// ─── PUT: replace entire cart (full sync) ────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items } = body as {
      items: Array<{
        itemType: "perfume" | "combo";
        itemId: string;
        price: number;
        quantity: number;
      }>;
    };

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Se esperaba un array 'items'" },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (
        (item.itemType !== "perfume" && item.itemType !== "combo") ||
        !item.itemId ||
        typeof item.price !== "number" ||
        typeof item.quantity !== "number" ||
        item.quantity < 1
      ) {
        return NextResponse.json(
          { error: "Item inválido en el carrito" },
          { status: 400 }
        );
      }
    }

    await rawDb.cartItem.replaceAll(
      user.id,
      items.map((i) => ({
        itemType: i.itemType,
        itemId: String(i.itemId),
        price: i.price,
        quantity: i.quantity,
      }))
    );

    return NextResponse.json({
      authenticated: true,
      success: true,
      syncedCount: items.length,
    });
  } catch (error) {
    console.error("[/api/cart PUT] Error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

// ─── DELETE: clear all OR delete one item ────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get("itemType");
    const itemId = searchParams.get("itemId");

    if (itemType && itemId) {
      // Delete a single item
      if (itemType !== "perfume" && itemType !== "combo") {
        return NextResponse.json(
          { error: "itemType debe ser 'perfume' o 'combo'" },
          { status: 400 }
        );
      }
      await rawDb.cartItem.delete(user.id, itemType, itemId);
      return NextResponse.json({
        authenticated: true,
        success: true,
        deleted: { itemType, itemId },
      });
    } else {
      // Clear entire cart
      await rawDb.cartItem.deleteAllByUserId(user.id);
      return NextResponse.json({
        authenticated: true,
        success: true,
        cleared: true,
      });
    }
  } catch (error) {
    console.error("[/api/cart DELETE] Error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

// ─── PATCH: update discount assignment for a single item ─────────────────────
// Body: { itemType, itemId, discountCodeId }
// Sets discountCodeId on the cart item (pass null to remove the assignment).
// This is how discount assignments sync across devices: when a user assigns
// a discount to a cart item on device A, this endpoint updates the DB, and
// device B picks it up on the next cart fetch.
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemType, itemId, discountCodeId } = body as {
      itemType: "perfume" | "combo";
      itemId: string;
      discountCodeId: string | null;
    };

    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: itemType, itemId" },
        { status: 400 }
      );
    }

    if (itemType !== "perfume" && itemType !== "combo") {
      return NextResponse.json(
        { error: "itemType debe ser 'perfume' o 'combo'" },
        { status: 400 }
      );
    }

    const updated = await rawDb.cartItem.updateDiscountAssignment(
      user.id,
      itemType,
      itemId,
      discountCodeId
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Item no encontrado en el carrito" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      success: true,
      item: {
        id: updated.id,
        itemType: updated.itemType,
        itemId: updated.itemId,
        discountCodeId: updated.discountCodeId,
      },
    });
  } catch (error) {
    console.error("[/api/cart PATCH] Error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
