import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/orders/deduct-stock
// Body: { items: [{ productId: number, quantity: number }] }
export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    await Promise.all(
      items.map(({ productId, quantity }: { productId: number; quantity: number }) =>
        prisma.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Deduct stock error:", error);
    return NextResponse.json({ message: "Failed to update stock" }, { status: 500 });
  }
}
