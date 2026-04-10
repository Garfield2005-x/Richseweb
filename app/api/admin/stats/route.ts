import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Build the date filter condition for Prisma
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDateParam) {
      dateFilter.gte = new Date(startDateParam);
    }
    if (endDateParam) {
      const end = new Date(endDateParam);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    // Include the date filter only if there are parameters
    const hasDateFilter = startDateParam || endDateParam;
    const baseWhere = hasDateFilter ? { created_at: dateFilter } : {};

    const totalOrders = await prisma.order.count({
      where: {
        ...baseWhere,
        status: { not: "CANCELLED" }
      }
    });

    const totalSalesAggr = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        ...baseWhere,
        status: {
          not: "CANCELLED",
        },
      },
    });

    const totalSales = totalSalesAggr._sum.total || 0;

    const totalProducts = await prisma.product.count({
      where: baseWhere
    });
    
    // Count actual newsletter subscribers instead of just users
    const totalSubscribers = await prisma.subscriber.count();

    const recentOrders = await prisma.order.findMany({
      where: baseWhere,
      orderBy: { created_at: "desc" },
      take: 5,
    });

    // --- NEW: Abandoned Checkout Stats (Normalized & Filtered) ---
    // Tracking logs that start with "Abandoned"
    const abandonedLogs = await prisma.advancedTrackingLog.findMany({
      where: {
        order: { contains: "Abandoned" },
        ...baseWhere
      },
      select: { phone: true }
    });
    
    // 1. Identify unique normalized phones from logs
    const uniqueAbandonedPhones = [...new Set(abandonedLogs.map(l => l.phone.replace(/[^\d]/g, '')))];

    // 2. Find if any of these phones HAVE placed a successful order
    const successfulOrderPhones = await prisma.order.findMany({
      where: { 
        status: { not: "CANCELLED" }
      },
      select: { phone: true }
    });
    const successPhoneSet = new Set(successfulOrderPhones.map(o => o.phone.replace(/[^\d]/g, '')));

    // 3. Count only those who haven't ordered yet
    const filteredPotential = uniqueAbandonedPhones.filter(p => !successPhoneSet.has(p));
    const totalPotentialCustomers = filteredPotential.length;
    
    // Conversion Rate calculation
    const conversionRate = totalPotentialCustomers > 0 
      ? Math.round((totalOrders / (totalOrders + totalPotentialCustomers)) * 100) 
      : (totalOrders > 0 ? 100 : 0);

    // --- NEW: Chart Data Aggregation ---
    // If a custom date range is provided, group by Day. Otherwise, default to last 6 Months.
    let chartData = [];
    
    if (hasDateFilter) {
      // Group by Day within the selected range
      const ordersForChart = await prisma.order.findMany({
        where: {
          ...baseWhere,
          status: { not: "CANCELLED" },
        },
        select: { created_at: true, total: true }
      });

      const dailyDataMap = new Map();
      const start = dateFilter.gte || dateFilter.lte || new Date();
      const end = dateFilter.lte || dateFilter.gte || new Date();
      
      // Initialize map with all days in range
      for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        const key = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); // e.g., "15 Nov"
        dailyDataMap.set(key, { name: key, total: 0, orders: 0 });
      }

      ordersForChart.forEach(order => {
        const key = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        if (dailyDataMap.has(key)) {
          const current = dailyDataMap.get(key);
          current.total += order.total;
          current.orders += 1;
        } else {
            // Handle edge case where order dates fall slightly outside the initialized loop due to timezone differences
            dailyDataMap.set(key, { name: key, total: order.total, orders: 1 });
        }
      });

      chartData = Array.from(dailyDataMap.values());

    } else {
      // Default: Last 7 Days grouping
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      
      const ordersForChart = await prisma.order.findMany({
        where: {
          status: { not: "CANCELLED" },
          created_at: { gte: sevenDaysAgo }
        },
        select: { created_at: true, total: true }
      });

      const dailyDataMap = new Map();
      const end = new Date();
      
      for (let dt = new Date(sevenDaysAgo); dt <= end; dt.setDate(dt.getDate() + 1)) {
        const key = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); 
        dailyDataMap.set(key, { name: key, total: 0, orders: 0 });
      }

      ordersForChart.forEach(order => {
        const key = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        if (dailyDataMap.has(key)) {
          const current = dailyDataMap.get(key);
          current.total += order.total;
          current.orders += 1;
        } else {
          dailyDataMap.set(key, { name: key, total: order.total, orders: 1 });
        }
      });
      
      chartData = Array.from(dailyDataMap.values());
    }

    // --- NEW: Best Sellers Aggregation ---
    // Fetch all applicable orders first, then aggregate order items to support the date filter
    const filteredOrders = await prisma.order.findMany({
      where: {
        ...baseWhere,
        status: { not: "CANCELLED" }
      },
      select: { id: true }
    });
    
    const validOrderIds = filteredOrders.map(o => o.id);

    const rawOrderItems = await prisma.orderItem.findMany({
      where: { order_id: { in: validOrderIds } },
      select: { product_id: true, product_name: true, quantity: true, price: true }
    });

    const bestSellersMap = new Map();
    for (const item of rawOrderItems) {
      if (!bestSellersMap.has(item.product_id)) {
        bestSellersMap.set(item.product_id, {
          id: item.product_id,
          name: item.product_name,
          sold: 0,
          revenue: 0
        });
      }
      const existing = bestSellersMap.get(item.product_id);
      existing.sold += item.quantity;
      existing.revenue += (item.quantity * item.price);
    }

    const bestSellers = Array.from(bestSellersMap.values())
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    return NextResponse.json({
      totalOrders,
      totalSales,
      totalProducts,
      totalSubscribers,
      totalPotentialCustomers, // Abandoned
      conversionRate,
      recentOrders,
      monthlySales: chartData,
      bestSellers
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
