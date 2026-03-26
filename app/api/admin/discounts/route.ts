import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const discounts = await prisma.discountCode.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { code, discount_percent, max_usage, min_purchase, max_discount, active } = body;

    const newDiscount = await prisma.discountCode.create({
      data: {
        code: code.trim().toUpperCase(),
        discount_percent: Number(discount_percent),
        min_purchase: min_purchase ? Number(min_purchase) : null,
        max_usage: max_usage ? Number(max_usage) : null,
        max_discount: max_discount ? Number(max_discount) : null,
        active: Boolean(active),
      },
    });

    return NextResponse.json(newDiscount);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
