import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// PATCH /api/expense/[id] — อัปเดต status (ADMIN เท่านั้น)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (dbUser?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { status, adminNote } = await request.json();

  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const updated = await prisma.expenseRequest.update({
    where: { id },
    data: { status, adminNote: adminNote || null },
  });

  return NextResponse.json({ success: true, expense: updated });
}

// GET /api/expense/[id] — ดึงใบเบิกเดี่ยว
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const expense = await prisma.expenseRequest.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // ถ้าไม่ใช่ admin ต้องเป็นเจ้าของ
  if (dbUser.role !== 'ADMIN' && expense.userId !== dbUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ success: true, expense });
}

// DELETE /api/expense/[id] — ลบใบเบิก (ADMIN หรือ เจ้าของใบเบิก)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const expense = await prisma.expenseRequest.findUnique({
    where: { id },
  });

  if (!expense) {
    return NextResponse.json({ error: 'ไม่พบรายการใบเบิก' }, { status: 404 });
  }

  // อนุญาตให้ Admin หรือ เจ้าของใบเบิกสามารถลบได้
  if (dbUser.role !== 'ADMIN' && expense.userId !== dbUser.id) {
    return NextResponse.json({ error: 'คุณไม่มีสิทธิ์ลบรายการนี้' }, { status: 403 });
  }

  await prisma.expenseRequest.delete({
    where: { id },
  });

  return NextResponse.json({ success: true, message: 'ลบใบเบิกเรียบร้อยแล้ว' });
}
