import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

async function getAdminSession() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") return null;
  return user;
}

// POST /api/admin/staff/[id]/restore — restore a soft-deleted STAFF user
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true, isDeleted: true } });
    if (!target) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });

    const restored = await prisma.user.update({
      where: { id },
      data: { isDeleted: false },
      select: { id: true, name: true, email: true, isDeleted: true },
    });

    return NextResponse.json(restored);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
