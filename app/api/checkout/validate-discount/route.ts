import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { code, phone, totalBeforeDiscount } = await req.json();

    if (!code || !phone) {
      return NextResponse.json({ error: "กรุณากรอกเบอร์โทรและโค้ด" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanPhone = phone.trim();

    const discountDb = await prisma.discountCode.findUnique({
      where: { code: cleanCode }
    });

    if (!discountDb || !discountDb.active) {
      return NextResponse.json({ error: "โค้ดไม่ถูกต้อง" }, { status: 400 });
    }
    if (discountDb.max_usage && discountDb.current_usage >= discountDb.max_usage) {
      return NextResponse.json({ error: "โค้ดนี้ถูกใช้งานครบตามจำนวนแล้ว" }, { status: 400 });
    }
    if (discountDb.min_purchase && totalBeforeDiscount < discountDb.min_purchase) {
      return NextResponse.json({ error: `โค้ดนี้ใช้ได้เมื่อสั่งซื้อครบ ฿${discountDb.min_purchase.toLocaleString()} ขึ้นไป` }, { status: 400 });
    }

    const usageExist = await prisma.discountUsage.findUnique({
      where: { phone_code: { phone: cleanPhone, code: cleanCode } }
    });

    if (usageExist) {
        return NextResponse.json({ error: "เบอร์นี้ใช้โค้ดไปแล้ว" }, { status: 400 });
    }

    let discountAmount = (totalBeforeDiscount * discountDb.discount_percent) / 100;
    if (discountDb.max_discount && discountAmount > discountDb.max_discount) {
      discountAmount = discountDb.max_discount;
    }

    return NextResponse.json({ success: true, discountAmount });

  } catch (error) {
    console.error("Discount Validate Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" }, { status: 500 });
  }
}
