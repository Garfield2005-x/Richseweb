import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * GET /api/admin/discounts/[id]/usage
 * Returns the usage logs for a specific discount code.
 */
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: discountId } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const discount = await prisma.discountCode.findUnique({
      where: { id: discountId },
      select: { code: true }
    });

    if (!discount) {
      return NextResponse.json({ error: "Discount not found" }, { status: 404 });
    }

    const history = await prisma.discountUsage.findMany({
      where: { code: discount.code },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        phone: true,
        created_at: true
      }
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Discount Usage GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/discounts/[id]/usage?usageId=xxx
 * Deletes a usage record and DECREMENTS the current_usage count.
 */
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: discountId } = await context.params; 

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const usageId = searchParams.get("usageId");

    if (!usageId) {
      return NextResponse.json({ error: "Missing usageId" }, { status: 400 });
    }

    // 1. Double check usage exists and get code
    const usage = await prisma.discountUsage.findUnique({
      where: { id: usageId }
    });

    if (!usage) {
      return NextResponse.json({ error: "Usage record not found" }, { status: 404 });
    }

    // 2. Perform Atomic Transaction: Delete usage + Decrement count
    await prisma.$transaction([
      // Delete the usage record
      prisma.discountUsage.delete({
        where: { id: usageId }
      }),
      // Decrement the current_usage counter in DiscountCode
      prisma.discountCode.update({
        where: { id: discountId },
        data: { current_usage: { decrement: 1 } }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Discount Usage DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
