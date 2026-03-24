import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // DEMO MODE
    // const session = await getServerSession();
    // if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    // if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { status, tracking_number } = body;

    const { id } = await context.params;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(tracking_number !== undefined && { tracking_number }),
      },
      include: { user: true } // Fetch user to get email
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
