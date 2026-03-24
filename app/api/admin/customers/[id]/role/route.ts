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

    const { role } = await req.json();

    if (!role || !['ADMIN', 'USER'].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { role: role }
    });

    return NextResponse.json({ role: updatedUser.role, message: `User role successfully changed to ${role}.` });

  } catch (error) {
    console.error("Role API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
