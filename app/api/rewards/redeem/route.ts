import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await (getServerSession as () => Promise<{ user: { email: string } }>)();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rewardId } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { email: session.user.email } });
      const reward = await tx.reward.findUnique({ where: { id: rewardId } });

      if (!user || !reward || !reward.active) {
        throw new Error("Invalid reward or user.");
      }

      if (reward.stock <= 0) {
        throw new Error("Reward is out of stock.");
      }

      if (user.points < reward.points_required) {
        throw new Error("Not enough points to redeem this item.");
      }

      // Deduct points
      await tx.user.update({
        where: { id: user.id },
        data: { points: { decrement: reward.points_required } }
      });

      // Deduct stock
      await tx.reward.update({
        where: { id: reward.id },
        data: { stock: { decrement: 1 } }
      });

      // Create redemption record for admin to see
      const redemption = await tx.rewardRedemption.create({
        data: {
          userId: user.id,
          rewardId: reward.id,
          status: "PENDING"
        }
      });

      return redemption;
    });

    return NextResponse.json({ success: true, redemption: result });
  } catch (error) {
    console.error("Redemption error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to redeem reward" }, { status: 400 });
  }
}
