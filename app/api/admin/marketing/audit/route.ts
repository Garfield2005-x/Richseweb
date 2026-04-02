import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET /api/admin/marketing/audit - Get recent audit logs
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email: string; role: string } | null;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.marketingAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { campaign: { select: { subject: true } } }
    });
    return NextResponse.json(logs);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
