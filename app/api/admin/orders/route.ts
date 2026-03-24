import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth";

export async function GET() {
  try {
    // DEMO MODE
    // const session = await getServerSession();
    // if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    // if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const orders = await prisma.order.findMany({
      orderBy: { created_at: "desc" },
      include: {
        order_items: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
