import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        variants: true,
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // --- Analytics Data ---
    const orderItemsAggr = await prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: { product_id: parseInt(id) }
    });
    const totalSold = orderItemsAggr._sum.quantity || 0;

    // Pseudo-random viewers for FOMO (between 8 and 35) based on time hash to keep it stable per minute
    const currentMinute = new Date().getMinutes();
    const viewers = (parseInt(id) + currentMinute) % 27 + 8;

    return NextResponse.json({
      ...product,
      totalSold,
      viewers
    });
  } catch (error) {
    console.error("Public Single Product API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
