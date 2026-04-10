import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/abandoned
 * Finds users who have tracking logs but no completed orders within a similar timeframe.
 * These are "Missed Opportunities" for the sales team.
 */
export async function GET() {
  try {
    // 1. Get all tracking logs that are marked as "Abandoned" and are at least 10 minutes old
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    const trackingLogs = await prisma.advancedTrackingLog.findMany({
      where: {
        order: { contains: "Abandoned" },
        createdAt: { lte: tenMinutesAgo }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    if (trackingLogs.length === 0) {
      return NextResponse.json({ abandoned: [] });
    }

    // 2. Identify unique phones from logs and normalize them
    const logPhones = [...new Set(trackingLogs.map(log => log.phone.replace(/[^\d]/g, '')))];

    // 3. Find if any of these normalized phones HAVE placed a successful order recently (within last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const successfulOrders = await prisma.order.findMany({
      where: {
        created_at: { gte: threeDaysAgo },
        status: { not: "CANCELLED" }
      },
      select: { phone: true }
    });

    const successPhoneSet = new Set(successfulOrders.map(o => o.phone.replace(/[^\d]/g, '')));

    // 4. Filter out logs that eventually became orders (normalized match)
    const result = trackingLogs.filter(log => {
      const normalizedLogPhone = log.phone.replace(/[^\d]/g, '');
      return !successPhoneSet.has(normalizedLogPhone);
    });

    // Dedup by phone, keeping latest
    const seen = new Set();
    const uniqueResult = [];
    for (const log of result) {
      const normalizedPhone = log.phone.replace(/[^\d]/g, '');
      if (!seen.has(normalizedPhone)) {
        seen.add(normalizedPhone);
        uniqueResult.push(log);
      }
    }

    return NextResponse.json({ abandoned: uniqueResult });
  } catch (error) {
    console.error("Abandoned API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
