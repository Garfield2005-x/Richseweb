import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, points_required, stock, image, active } = await req.json();

    const reward = await prisma.reward.update({
      where: { id },
      data: {
        name,
        points_required: points_required !== undefined ? Number(points_required) : undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        image,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    return NextResponse.json(reward);
  } catch (error) {
    console.error("Update reward error:", error);
    return NextResponse.json({ error: "Failed to update reward" }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if there are redemptions
    const redemptionsCount = await prisma.rewardRedemption.count({
      where: { rewardId: id },
    });

    if (redemptionsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete reward with existing redemptions. Please deactivate it instead." },
        { status: 400 }
      );
    }

    await prisma.reward.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete reward error:", error);
    return NextResponse.json({ error: "Failed to delete reward" }, { status: 400 });
  }
}
