import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    // Basic session fetch
    const session = await (getServerSession as () => Promise<{ user?: { email?: string } }>)();
    if (!session?.user?.email) {
      return NextResponse.json({ points: 0 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { points: true }
    });
    
    return NextResponse.json({ points: user?.points || 0 });
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json({ points: 0 });
  }
}
