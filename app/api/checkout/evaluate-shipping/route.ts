import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// Simple in-memory rate limit: 30 requests per minute per IP
const rateLimiter = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: Request) {
  try {
    const { phone, shippingMethod } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    
    // Rate Limit Check
    const now = Date.now();
    const limit = 30; // 30 requests per minute
    const windowMs = 60 * 1000;
    
    const baseShippingRate = shippingMethod === "Cash on Delivery (+$30 Fee)" ? 30 : 0;
    
    if (ip !== "unknown") {
      const userRecord = rateLimiter.get(ip);
      if (!userRecord || now > userRecord.resetTime) {
        rateLimiter.set(ip, { count: 1, resetTime: now + windowMs });
      } else {
        if (userRecord.count >= limit) {
          return NextResponse.json({ shippingCost: baseShippingRate, isFreeShippingApplied: false, error: "Too many requests" }, { status: 429 });
        }
        userRecord.count++;
        rateLimiter.set(ip, userRecord);
      }
    }

    let shippingCost = baseShippingRate; 
    let isFreeShippingApplied = false;

    // Retrieve active session securely inside API
    const session = await getServerSession(authOptions);
    const isLoggedIn = !!session?.user;

    // Check if the global rule is enabled
    const rule = await prisma.siteSetting.findUnique({
      where: { key: "auto_free_shipping_first_order" }
    });

    // Enforce Member-Only (must be logged in) for First Order Shipping
    if (rule?.value === "true" && phone && phone.trim().length >= 9 && isLoggedIn) {
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
    return NextResponse.json({ shippingCost: 0, isFreeShippingApplied: false }); // Fallback
  }
}
