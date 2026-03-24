import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, tracking_number } = await req.json();

    const redemption = await prisma.rewardRedemption.update({
      where: { id },
      data: { 
        status,
        ...(tracking_number !== undefined && { tracking_number })
      }
    });

    return NextResponse.json({ success: true, redemption });
  } catch (error) {
    console.error("Update redemption error:", error);
    return NextResponse.json({ error: "Failed to update redemption status" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.rewardRedemption.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete redemption error:", error);
    return NextResponse.json({ error: "Failed to delete redemption" }, { status: 500 });
  }
}
