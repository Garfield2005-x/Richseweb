import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, points_required, stock, image } = await req.json();
    const reward = await prisma.reward.create({
      data: { 
        name, 
        points_required: Number(points_required), 
        stock: Number(stock), 
        image: image || "🎁" 
      }
    });
    return NextResponse.json(reward);
  } catch {
    return NextResponse.json({ error: "Failed to create reward" }, { status: 400 });
  }
}

export async function GET() {
  try {
    const redemptions = await prisma.rewardRedemption.findMany({
      include: { 
        user: { 
          select: { 
            email: true, 
            name: true,
            phone: true,
            address: true,
            subdistrict: true,
            district: true,
            province: true,
            postal_code: true
          } 
        }, 
        reward: true 
      },
      orderBy: { created_at: "desc" }
    });
    return NextResponse.json(redemptions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch redemptions" }, { status: 500 });
  }
}
