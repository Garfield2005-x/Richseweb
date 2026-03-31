import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// Simple in-memory rate limit: 30 requests per minute per IP
const rateLimiter = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: Request) {
  try {
    const { phone, shippingMethod, cartSubtotal: rawCartSubtotal } = await req.json();
    const cartSubtotal = parseFloat(rawCartSubtotal || "0");

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
    let freeShippingReason = "";

    // Retrieve active session securely inside API
    const session = await getServerSession(authOptions);
    const isLoggedIn = !!session?.user;

    // Fetch all relevant automation settings in one query
    const allRules = await prisma.siteSetting.findMany({
      where: { key: { in: [
        "auto_free_shipping_first_order",
        "auto_min_order_free_shipping",
        "auto_min_order_threshold",
      ]}}
    });
    const ruleMap: Record<string, string> = {};
    for (const r of allRules) ruleMap[r.key] = r.value;

    // Rule 1: First Order Free Shipping (Members Only)
    if (ruleMap["auto_free_shipping_first_order"] === "true" && phone && phone.trim().length >= 9 && isLoggedIn) {
       const prevOrders = await prisma.order.count({
          where: { phone: phone.trim() }
       });
       if (prevOrders === 0) {
          shippingCost = 0;
          isFreeShippingApplied = true;
          freeShippingReason = "first_order";
       }
    }

    // Rule 2: Min Order Free Shipping
    if (!isFreeShippingApplied && ruleMap["auto_min_order_free_shipping"] === "true") {
      const threshold = parseFloat(ruleMap["auto_min_order_threshold"] || "300");
      if (cartSubtotal >= threshold) {
        shippingCost = 0;
        isFreeShippingApplied = true;
        freeShippingReason = "min_order";
      }
    }

    return NextResponse.json({ 
        shippingCost,
        isFreeShippingApplied,
        freeShippingReason,
        message: isFreeShippingApplied 
          ? freeShippingReason === "first_order" 
            ? "First Order Free Shipping applied!" 
            : "Free Shipping — Min Order reached!"
          : ""
    });
  } catch (error) {
    console.error("Evaluate shipping error:", error);
    return NextResponse.json({ shippingCost: 0, isFreeShippingApplied: false }); // Fallback
  }
}
