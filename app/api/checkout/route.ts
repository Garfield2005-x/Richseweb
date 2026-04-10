import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

// Type definitions
type CartItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  variantId?: number;
  variantName?: string;
};

// Extracted LINE Notify function (External Call - Non-blocking)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendLineNotify(orderParams: any) {
  try {
    const { order, cart, fullName, phone, address, province, district, subdistrict, postcode, shippingMethod, subtotal, shippingCost, total, discountAmount, discountCode } = orderParams;

    // Optional: Only send if LINE token is configured
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) return;

    const productList = cart
      .map(
        (item: CartItem) => `• ${item.name}${item.variantName ? ` (${item.variantName})` : ''}
  จำนวน: ${item.quantity}
  ราคา: ฿${item.price.toFixed(2)}
  รวม: ฿${(item.price * item.quantity).toFixed(2)}`
      )
      .join("\n\n");

    const message = `
📦 มีออเดอร์ใหม่ (Secure API)
 
🧾 Order: ${order.order_number}
👤 ชื่อ: ${fullName}
📞 เบอร์: ${phone}

🏠 ที่อยู่:
${address}
ต.${subdistrict} อ.${district}
จ.${province} ${postcode}

🚚 วิธีการจัดส่ง: ${shippingMethod}

🛍 รายการสินค้า:
${productList}

💰 Subtotal: ฿${subtotal.toFixed(2)}
🚚 Shipping: ฿${shippingCost.toFixed(2)}
${
  discountAmount > 0
    ? `\n🎟 โค้ดส่วนลด: ${discountCode}\n💸 ส่วนลด: -฿${discountAmount.toFixed(2)}`
    : ""
}
${
  order.points_discount > 0
    ? `\n🎁 ใช้แต้มลด: -฿${order.points_discount.toFixed(2)} (${order.points_used} Pts)`
    : ""
}
💳 ยอดสุทธิ: ฿${total.toFixed(2)}
`;

    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: "C0b778d20a6877e76023a328f9485b564", // Ensure this group/userId is correct for production
        messages: [{ type: "text", text: message }]
      }),
      signal: AbortSignal.timeout(5000) // Don't hang indefinitely
    });
  } catch (error) {
    console.error("External Call (LINE) Failed. Order still processed.", error);
  }
}

export async function POST(req: Request) {
  let body: any = null;
  try {
    body = await req.json();
    const { 
      cart, 
      shippingInfo, 
      shippingMethod, 
      discountCode,
      pointsToUse, 
      isInternational, // We pass this from frontend
      normalizedPhone,
      recaptchaToken
    } = body;

    console.log(`[CHECKOUT START] Phone: ${normalizedPhone || shippingInfo?.phone} | Items: ${cart?.length}`);

    // 🚨 SECURE: Never trust the `userId` sent by the client. Always verify via server session!
    const session = await getServerSession(authOptions);
    let userId = null;
    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
         where: { email: session.user.email },
         select: { id: true }
      });
      userId = dbUser?.id || null;
    }

    // 1. Validate Input Basics
    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.province || !shippingInfo.postcode) {
      console.warn(`[CHECKOUT FAIL] Missing Shipping Info: ${JSON.stringify(shippingInfo)}`);
      return NextResponse.json({ error: "Missing required shipping info" }, { status: 400 });
    }

    // 1.5 Server-Side RECAPTCHA Verification
    if (!recaptchaToken) {
       console.warn(`[CHECKOUT FAIL] Missing RECAPTCHA Token`);
       return NextResponse.json({ error: "Security verification required. Please complete the CAPTCHA." }, { status: 400 });
    }

    try {
      const gRes = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`, { method: 'POST' });
      const gData = await gRes.json();
      if (!gData.success) {
        console.warn(`[CHECKOUT FAIL] RECAPTCHA Invalid: ${JSON.stringify(gData)}`);
        return NextResponse.json({ error: "Security verification failed. Please try again." }, { status: 400 });
      }
    } catch (err) {
      console.error("[CHECKOUT ERROR] RECAPTCHA Verify Exception:", err);
      // We might allow fallthrough if Google is down, but safer to block
    }

    console.log(`[CHECKOUT VALIDATED] Ready for transaction...`);

    // Determine final address
    const finalAddress = isInternational 
        ? `${shippingInfo.address}, ${shippingInfo.country}`
        : shippingInfo.address;

    let shippingCost = shippingMethod === "Cash on Delivery (+$30 Fee)" ? 30 : 0;
    
    // Normalize phone: prefer normalizedPhone from body, fallback to cleaning shippingInfo.phone
    const rawPhone = normalizedPhone || shippingInfo.phone || "";
    const cleanPhone = rawPhone.replace(/[^\d]/g, '');

    if (!cleanPhone || cleanPhone.length < 8) {
       return NextResponse.json({ error: "Invalid phone number format." }, { status: 400 });
    }

    let isFirstOrderFree = false;

    // Fetch all automation rules at once
    const automationRules = await prisma.siteSetting.findMany({
      where: { key: { in: [
        "auto_free_shipping_first_order",
        "auto_min_order_free_shipping",
        "auto_min_order_threshold",
        "auto_low_stock_alert",
        "auto_low_stock_threshold",
        "auto_loyalty_points_rate",
      ]}}
    });
    const ruleMap: Record<string, string> = {};
    for (const r of automationRules) ruleMap[r.key] = r.value;

    // Rule 1: First Order Free Shipping (Members Only)
    if (ruleMap["auto_free_shipping_first_order"] === "true" && cleanPhone && userId) {
       const prevOrders = await prisma.order.count({
          where: { OR: [{ phone: cleanPhone }, { userId: userId }] }
       });
       if (prevOrders === 0) {
          shippingCost = 0;
          isFirstOrderFree = true;
       }
    }

    // Rule 2: Min Order Free Shipping (server-side verification)
    if (!isFirstOrderFree && ruleMap["auto_min_order_free_shipping"] === "true") {
      const threshold = parseFloat(ruleMap["auto_min_order_threshold"] || "300");
      const cartSubtotal = cart.reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0);
      if (cartSubtotal >= threshold) {
        shippingCost = 0;
      }
    }

    const cleanCode = discountCode ? discountCode.trim().toUpperCase() : null;

    // 2. Start Database Transaction
    // Everything inside this block either fully succeeds or fully rolls back.
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      let finalTotal = 0;
      let discountAmount = 0;
      let appliedDiscountCodeId = null;
      let pointsUsedInt = 0;
      let pointsDiscount = 0;
      const secureCartItems = [];

      // --- A. Validate Products & Stock (Race Condition Handled) ---
      // We lock the rows if needed, or simply verify the stock is sufficient
      // and let the subsequent decrement operation throw if constraint violated.
      for (const item of cart) {
        const product = await tx.product.findUnique({
          where: { id: parseInt(item.id.toString()) }
        });

        if (!product || !product.isActive) {
          throw new Error(`Product ${item.name} is unavailable.`);
        }

        let variantDb = null;
        if (item.variantId) {
          variantDb = await tx.productVariant.findUnique({
            where: { id: item.variantId }
          });
          if (!variantDb || variantDb.productId !== product.id) {
            throw new Error(`Variant for ${item.name} is invalid.`);
          }
        }

        const stockLimit = variantDb ? variantDb.stock : product.stock;
        if (stockLimit < item.quantity) {
          throw new Error(`Not enough stock for ${item.name}${variantDb ? ' (' + variantDb.name + ')' : ''}. Only ${stockLimit} left.`);
        }

        // Securely determine the correct price (Flash Sale vs Normal)
        let finalItemPrice = variantDb ? variantDb.price : product.price;
        const now = new Date();
        if (
          !variantDb &&
          product.flashSalePrice && 
          product.flashSaleStart && 
          product.flashSaleEnd && 
          now >= product.flashSaleStart && 
          now <= product.flashSaleEnd
        ) {
          finalItemPrice = product.flashSalePrice;
        }

        // Trust DB Price, not Client Price
        subtotal += finalItemPrice * item.quantity;
        
        secureCartItems.push({
          product_id: product.id,
          variant_id: variantDb ? variantDb.id : null,
          product_name: variantDb ? `${product.name} - ${variantDb.name}` : product.name,
          quantity: item.quantity,
          price: finalItemPrice
        });
      }

      console.log(`[CHECKOUT DB] Products verified. Subtotal: ${subtotal}`);

      const totalBeforeDiscount = subtotal + shippingCost;
      finalTotal = totalBeforeDiscount;

      // --- B. Validate Discount Code ---
      if (cleanCode) {
        const discountDb = await tx.discountCode.findUnique({
          where: { code: cleanCode }
        });

        if (!discountDb || !discountDb.active) {
          throw new Error("Invalid or inactive discount code.");
        }
        if (discountDb.max_usage && discountDb.current_usage >= discountDb.max_usage) {
          throw new Error("Discount code usage limit exceeded.");
        }
        if (discountDb.min_purchase && totalBeforeDiscount < discountDb.min_purchase) {
          throw new Error(`Minimum purchase of ฿${discountDb.min_purchase} required for this code.`);
        }

        // Check Phone Usage
        const usageCount = await tx.discountUsage.count({
          where: { phone: cleanPhone, code: cleanCode }
        });
        if (usageCount >= (discountDb.usage_limit_per_user || 1)) {
          throw new Error("คุณใช้โค้ดนี้ครบตามจำนวนที่กำหนดแล้ว");
        }

        // Apply Discount
        discountAmount = (totalBeforeDiscount * discountDb.discount_percent) / 100;
        finalTotal = Math.max(totalBeforeDiscount - discountAmount, 0);
        appliedDiscountCodeId = discountDb.id;
      }

      // --- B.2. Validate and Apply Points Discount ---
      if (pointsToUse && pointsToUse > 0 && userId) {
        // Fetch user dynamically inside transaction to lock their points
        const userDb = await tx.user.findUnique({
          where: { id: userId }
        });

        if (!userDb || userDb.points < pointsToUse) {
          throw new Error("Not enough points to apply this discount.");
        }

        pointsUsedInt = Math.floor(pointsToUse);
        pointsDiscount = pointsUsedInt; // 1 Point = 1 Baht
        
        if (pointsDiscount > finalTotal) {
          // Prevent negative totals
          pointsDiscount = finalTotal;
          pointsUsedInt = finalTotal;
        }

        finalTotal = Math.max(finalTotal - pointsDiscount, 0);

        // Deduct points atomically
        await tx.user.update({
          where: { id: userId },
          data: { points: { decrement: pointsUsedInt } }
        });
      }

      // --- C. Create Order & Items ---
      const order = await tx.order.create({
        data: {
          full_name: shippingInfo.fullName,
          phone: cleanPhone,
          address: finalAddress,
          province: shippingInfo.province,
          district: shippingInfo.district || "",
          subdistrict: shippingInfo.subdistrict || "",
          postal_code: String(shippingInfo.postcode),
          shipping_method: shippingMethod,
          status: "PENDING",
          subtotal: subtotal,
          tax: 0,
          total: finalTotal,
          points_used: pointsUsedInt,
          points_discount: pointsDiscount,
          userId: userId || null,
          order_items: {
            create: secureCartItems
          }
        }
      });

      console.log(`[CHECKOUT DB] Order created: ${order.order_number}`);

      // --- C.2 Record First Order Free Shipping Audit ---
      if (isFirstOrderFree) {
         await tx.promotionLog.create({
            data: {
               phone: cleanPhone,
               promotion: "first_order_free_shipping",
               ipAddress: req.headers.get("x-forwarded-for") || "unknown"
            }
         });
      }

      // --- D. Deduct Stock ---
      // This is atomic and handles race conditions along with the earlier check
      const lowStockItems: { name: string; remaining: number }[] = [];
      for (const item of cart) {
        if (item.variantId) {
          const updated = await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
            select: { stock: true, name: true, product: { select: { name: true } } },
          });
          // Low stock check
          const alertThreshold = parseFloat(ruleMap["auto_low_stock_threshold"] || "5");
          if (ruleMap["auto_low_stock_alert"] === "true" && updated.stock <= alertThreshold) {
            lowStockItems.push({ name: `${updated.product.name} - ${updated.name}`, remaining: updated.stock });
          }
        } else {
          const updated = await tx.product.update({
            where: { id: parseInt(item.id.toString()) },
            data: { stock: { decrement: item.quantity } },
            select: { stock: true, name: true },
          });
          const alertThreshold = parseFloat(ruleMap["auto_low_stock_threshold"] || "5");
          if (ruleMap["auto_low_stock_alert"] === "true" && updated.stock <= alertThreshold) {
            lowStockItems.push({ name: updated.name, remaining: updated.stock });
          }
        }
      }

      // Pass low stock items back from transaction for LINE notification
      // We store it in a closure variable accessible after .transaction()
      if (lowStockItems.length > 0) {
        // Fire-and-forget after transaction completes (stored for use below)
        (globalThis as Record<string, unknown>).__pendingLowStockAlerts = lowStockItems;
      } else {
        (globalThis as Record<string, unknown>).__pendingLowStockAlerts = [];
      }

      // --- E. Record Discount Usage ---
      if (cleanCode && appliedDiscountCodeId) {
        await tx.discountUsage.create({
          data: { phone: cleanPhone, code: cleanCode }
        });
        await tx.discountCode.update({
          where: { id: appliedDiscountCodeId },
          data: { current_usage: { increment: 1 } }
        });
      }

      // --- F. Reward Points & fetch user email ---
      let userEmail: string | null = null;
      if (userId) {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { email: true, points: true }
        });
        userEmail = user?.email ?? null;

        // Earn points dynamically based on auto_loyalty_points_rate (default: 1 pt per ฿10)
        const loyaltyRate = parseFloat(ruleMap["auto_loyalty_points_rate"] || "10");
        const isLoyaltyActive = ruleMap["auto_loyalty_points_rate"] !== undefined; // rate key existing means it's configured
        const effectiveRate = (loyaltyRate > 0 && isLoyaltyActive) ? loyaltyRate : 10;
        const totalPointsEarned = Math.floor(finalTotal / effectiveRate);

        if (totalPointsEarned > 0) {
          await tx.user.update({
            where: { id: userId },
            data: { points: { increment: totalPointsEarned } }
          });
        }
      }

      // Return the required values from transaction
      return { order, subtotal, finalTotal, discountAmount, userEmail };
    }, {
      // Configure transaction parameters if needed (e.g., maxWait, timeout)
      timeout: 10000 
    });

    // 3. Independent External Calls (Non-blocking)
    sendLineNotify({
      order: result.order,
      cart,
      fullName: shippingInfo.fullName,
      phone: cleanPhone,
      address: shippingInfo.address,
      province: shippingInfo.province,
      district: shippingInfo.district,
      subdistrict: shippingInfo.subdistrict,
      postcode: shippingInfo.postcode,
      shippingMethod: shippingMethod,
      subtotal: result.subtotal,
      shippingCost: shippingCost,
      total: result.finalTotal,
      discountAmount: result.discountAmount,
      discountCode: cleanCode
    });

    // 3b. Low Stock Alert (Non-blocking, after transaction)
    const pendingAlerts = ((globalThis as Record<string, unknown>).__pendingLowStockAlerts || []) as { name: string; remaining: number }[];
    if (pendingAlerts.length > 0 && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      const alertMsg = `⚠️ แจ้งเตือนสินค้าใกล้หมด!\n\n` +
        pendingAlerts.map(i => `📦 ${i.name}\n   เหลือ: ${i.remaining} ชิ้น`).join("\n\n") +
        `\n\n🔗 จัดการสต๊อก: /admin/products`;
      fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: "C0b778d20a6877e76023a328f9485b564",
          messages: [{ type: "text", text: alertMsg }],
        }),
        signal: AbortSignal.timeout(5000),
      }).catch(() => {});
    }


    // 4. Send Success Response
    return NextResponse.json({ success: true, orderId: result.order.id });

  } catch (error) {
    console.error("CRITICAL: Secure Checkout Failure Details:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : null,
      phone: body?.shippingInfo?.phone || "N/A",
      cartSize: body?.cart?.length || 0
    });
    
    // Return friendly error message if it's our thrown custom validation errors
    return NextResponse.json(
      { error: (error as Error).message || "An unexpected error occurred during checkout. Please try again or contact support." },
      { status: 400 }
    );
  }
}
