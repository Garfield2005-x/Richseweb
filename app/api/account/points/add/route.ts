import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, totalSpent } = await req.json();

    if (!userId || !totalSpent || typeof totalSpent !== "number") {
      return NextResponse.json(
        { message: "Missing required fields or invalid totalSpent" },
        { status: 400 }
      );
    }

    // Calculation:
    // 1 point for every 100 THB spent
    const basePoints = Math.floor(totalSpent / 100);
    
    // Bonus: 2 points for every 10 points earned (which means every 1,000 THB spent get an extra 2 points)
    const bonusPoints = Math.floor(basePoints / 10) * 2;

    const totalPointsEarned = basePoints + bonusPoints;

    if (totalPointsEarned > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: totalPointsEarned,
          },
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      earned: totalPointsEarned,
      base: basePoints,
      bonus: bonusPoints
    });
  } catch (error) {
    console.error("Error adding points:", error);
    return NextResponse.json(
      { message: "Interval server error" },
      { status: 500 }
    );
  }
}
