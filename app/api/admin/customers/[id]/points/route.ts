import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Disable in DEMO mode if needed, but for real app:
    // const session = await getServerSession();
    // if (!session || !session.user?.email) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    // const currentUser = await prisma.user.findUnique({
    //   where: { email: session.user.email },
    // });

    // if (currentUser?.role !== "ADMIN") {
    //   return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    // }

    const { action, amount } = await req.json();

    if (!action || !['add', 'deduct'].includes(action) || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: "Invalid action or amount" }, { status: 400 });
    }

    // Get current user points
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: { points: true }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let newPoints = user.points || 0;

    if (action === 'add') {
      newPoints += amount;
    } else if (action === 'deduct') {
      newPoints -= amount;
      if (newPoints < 0) newPoints = 0; // Floor to 0
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { points: newPoints }
    });

    return NextResponse.json({ points: updatedUser.points, message: `Points successfully ${action}ed.` });

  } catch (error) {
    console.error("Points API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
