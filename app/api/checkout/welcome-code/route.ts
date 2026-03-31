import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

/**
 * GET /api/checkout/welcome-code
 * Returns the active welcome discount code for new members if the automation is enabled.
 * Only returns a code if:
 *  1. The automation setting "auto_new_member_discount" is "true"
 *  2. The user is logged in
 *  3. The user has never placed an order before
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ code: null });
    }

    // Fetch automation settings
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: { in: ["auto_new_member_discount", "auto_new_member_code"] },
      },
    });
    const settingMap: Record<string, string> = {};
    for (const s of settings) settingMap[s.key] = s.value;

    if (settingMap["auto_new_member_discount"] !== "true") {
      return NextResponse.json({ code: null });
    }

    const code = settingMap["auto_new_member_code"];
    if (!code) return NextResponse.json({ code: null });

    // Check if this user has placed any orders before
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!dbUser) return NextResponse.json({ code: null });

    const orderCount = await prisma.order.count({
      where: { userId: dbUser.id },
    });

    // Only show the welcome code if they have 0 previous orders
    if (orderCount > 0) return NextResponse.json({ code: null });

    return NextResponse.json({ code });
  } catch (error) {
    console.error("Welcome code API error:", error);
    return NextResponse.json({ code: null });
  }
}
