import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * POST /api/admin/discounts/sync
 * Recalculates current_usage for all discount codes based on actual records in DiscountUsage.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 1. Get all discount codes
    const codes = await prisma.discountCode.findMany();

    // 2. Perform background sync (await all or run sequentially)
    // For large databases, consider batching, but for a typical store, this is fast enough.
    const results = [];
    for (const code of codes) {
      const actualUsage = await prisma.discountUsage.count({
        where: { code: code.code }
      });

      if (code.current_usage !== actualUsage) {
        await prisma.discountCode.update({
          where: { id: code.id },
          data: { current_usage: actualUsage }
        });
        results.push({ code: code.code, old: code.current_usage, new: actualUsage });
      }
    }

    return NextResponse.json({
       success: true,
       syncedCount: results.length,
       updates: results
    });
  } catch (error) {
    console.error("Discount Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
