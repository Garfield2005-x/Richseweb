import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, orderId, rating, comment } = await req.json();

    if (!productId || !orderId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify user's order and product
    const order = await prisma.order.findUnique({
      where: { 
        id: orderId,
        userId: (session.user as { id: string }).id,
        status: { in: ["SHIPPED", "DELIVERED", "COMPLETED"] } 
      },
      include: {
        order_items: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found or not eligible for review" }, { status: 404 });
    }

    const hasProduct = order.order_items.some(item => item.product_id === productId);
    if (!hasProduct) {
      return NextResponse.json({ error: "Product not found in this order" }, { status: 400 });
    }

    // 2. Create review
    const review = await prisma.productReview.create({
      data: {
        productId,
        userId: (session.user as { id: string }).id,
        orderId,
        rating: Number(rating),
        comment
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: "You have already reviewed this product for this order" }, { status: 400 });
    }
    console.error("REVIEW_POST_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET reviews for a product
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
        return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    try {
        const reviews = await prisma.productReview.findMany({
            where: { productId: parseInt(productId), isHidden: false },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: { created_at: "desc" }
        });
        return NextResponse.json(reviews);
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
