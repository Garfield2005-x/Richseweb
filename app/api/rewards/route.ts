import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rewards = await prisma.reward.findMany({
      where: { active: true },
      orderBy: { points_required: "asc" }
    });
    return NextResponse.json(rewards);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
