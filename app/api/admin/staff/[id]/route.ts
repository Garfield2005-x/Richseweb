import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

// PATCH /api/admin/staff/[id] — update name, email, or password
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const { name, email, password } = await req.json();

    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "ไม่มีข้อมูลที่ต้องการแก้ไข" }, { status: 400 });
    }

    // Check email conflict if changing email
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "อีเมลนี้มีในระบบแล้ว" }, { status: 409 });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/staff/[id] — delete a STAFF user
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    if (target.role !== "STAFF") {
      return NextResponse.json({ error: "ลบได้เฉพาะบัญชีพนักงานเท่านั้น" }, { status: 403 });
    }

    await prisma.$transaction([
      // clear all related records before deleting the user
      prisma.loginDevice.deleteMany({ where: { userId: id } }),
      prisma.session.deleteMany({ where: { userId: id } }),
      prisma.account.deleteMany({ where: { userId: id } }),
      prisma.leaveRequest.deleteMany({ where: { userId: id } }),
      prisma.liveSchedule.deleteMany({ where: { userId: id } }),
      prisma.liveSession.deleteMany({ where: { userId: id } }),
      prisma.supportTicket.deleteMany({ where: { userId: id } }),
      prisma.userCookiePreference.deleteMany({ where: { user_id: id } }),
      prisma.rewardRedemption.deleteMany({ where: { userId: id } }),
      prisma.productReview.deleteMany({ where: { userId: id } }),
      prisma.wishlist.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
