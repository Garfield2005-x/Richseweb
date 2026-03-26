import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { code, discount_percent, min_purchase, max_usage, max_discount, active } = body;

    const { id } = await context.params;

    const data: {
      code?: string;
      discount_percent?: number;
      min_purchase?: number | null;
      max_usage?: number | null;
      max_discount?: number | null;
      active?: boolean;
    } = {};
    if (code !== undefined) data.code = code.trim().toUpperCase();
    if (discount_percent !== undefined) data.discount_percent = Number(discount_percent);
    if (min_purchase !== undefined) data.min_purchase = min_purchase === "" ? null : Number(min_purchase);
    if (max_usage !== undefined) data.max_usage = max_usage === "" ? null : Number(max_usage);
    if (max_discount !== undefined) data.max_discount = max_discount === "" ? null : Number(max_discount);
    if (active !== undefined) data.active = Boolean(active);

    const updatedDiscount = await prisma.discountCode.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedDiscount);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await context.params;

    await prisma.discountCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
