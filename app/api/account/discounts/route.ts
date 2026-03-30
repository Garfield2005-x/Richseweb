import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
       where: { email: session.user.email },
       select: { phone: true }
    });

    const activeCodes = await prisma.discountCode.findMany({
      where: { active: true },
      orderBy: { created_at: "desc" }
    });

    // We must check if the code is exhausted globally or by this specific user
    const phone = user?.phone || "";
    
    const availableCodes = [];
    for (const code of activeCodes) {
       let canUse = true;
       
       if (code.max_usage && code.current_usage >= code.max_usage) {
          canUse = false; // Globally exhausted
       }

       if (canUse && phone) {
          const usageCount = await prisma.discountUsage.count({
             where: { phone: phone, code: code.code }
          });
          if (usageCount >= code.usage_limit_per_user) {
             canUse = false; // User has exhausted their limit
          }
       }

       if (canUse) {
          availableCodes.push({
             code: code.code,
             discount_percent: code.discount_percent,
             min_purchase: code.min_purchase,
             max_discount: code.max_discount,
             description: `ลด ${code.discount_percent}% ${code.min_purchase ? `เมื่อครบ ฿${code.min_purchase}` : ""} ${code.max_discount ? `(ลดสูงสุด ฿${code.max_discount})` : ""}`
          });
       }
    }

    return NextResponse.json(availableCodes);
  } catch (error) {
    console.error("Fetch User Discounts Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
