import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const redemptions = await prisma.rewardRedemption.findMany({
      where: { userId: user.id },
      include: { reward: true },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json(redemptions);
  } catch (error) {
    console.error("Error fetching user redemptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
