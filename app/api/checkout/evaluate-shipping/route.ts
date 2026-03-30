import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    let shippingCost = 30; // Default COD fee
    let isFreeShippingApplied = false;

    // Check if the global rule is enabled
    const rule = await prisma.siteSetting.findUnique({
      where: { key: "auto_free_shipping_first_order" }
    });

    if (rule?.value === "true" && phone && phone.trim().length >= 9) {
       // Check if this phone number has any previous orders
       const prevOrders = await prisma.order.count({
          where: { phone: phone.trim() }
       });
       if (prevOrders === 0) {
          shippingCost = 0;
          isFreeShippingApplied = true;
       }
    }

    return NextResponse.json({ 
        shippingCost,
        isFreeShippingApplied,
        message: isFreeShippingApplied ? "First Order Free Shipping applied!" : ""
    });
  } catch (error) {
    console.error("Evaluate shipping error:", error);
    return NextResponse.json({ shippingCost: 30, isFreeShippingApplied: false }); // Fallback
  }
}
