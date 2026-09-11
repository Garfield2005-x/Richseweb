import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/expense — ดึงรายการใบเบิก (ADMIN เห็นทั้งหมด, STAFF เห็นของตัวเอง)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const isAdmin = dbUser.role === 'ADMIN';

  const requests = await prisma.expenseRequest.findMany({
    where: isAdmin ? {} : { userId: dbUser.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, requests });
}

// POST /api/expense — สร้างใบเบิกใหม่ + อัปเดตข้อมูล bank ของ user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await request.json();
  const { date, employeeName, position, accountNumber, bankName, items, totalAmount, imageUrls } = body;

  if (!date || !employeeName || !position || !accountNumber || !bankName || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
  }

  // อัปเดตข้อมูล bank ของ user เพื่อระบบจำในครั้งต่อไป
  await prisma.user.update({
    where: { id: dbUser.id },
    data: { position, bankName, accountNumber },
  });

  const expense = await prisma.expenseRequest.create({
    data: {
      userId: dbUser.id,
      date: new Date(date),
      employeeName,
      position,
      accountNumber,
      bankName,
      items,
      totalAmount,
      imageUrls: imageUrls || [],
      status: 'PENDING',
    },
  });

  return NextResponse.json({ success: true, expense }, { status: 201 });
}
