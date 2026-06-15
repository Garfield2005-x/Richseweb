import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// GET /api/admin/staff-commission
// Returns all STAFF + ADMIN users with their salary and commission fields (both standard and Shopee)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as { role?: string })?.role;
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: { in: ['STAFF', 'ADMIN'] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      baseSalary: true,
      commissionRate: true,
      baseSalaryShopee: true,
      commissionRateShopee: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ success: true, users });
}

// PATCH /api/admin/staff-commission
// Body: { userId, commissionRate?, baseSalary?, commissionRateShopee?, baseSalaryShopee? }
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as { role?: string })?.role;
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { userId, commissionRate, baseSalary, commissionRateShopee, baseSalaryShopee } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const updateData: {
    commissionRate?: number;
    baseSalary?: number;
    commissionRateShopee?: number;
    baseSalaryShopee?: number;
  } = {};

  if (commissionRate !== undefined) {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 1) {
      return NextResponse.json(
        { error: 'commissionRate must be between 0 and 1 (e.g. 0.03 for 3%)' },
        { status: 400 }
      );
    }
    updateData.commissionRate = rate;
  }

  if (baseSalary !== undefined) {
    const sal = parseFloat(baseSalary);
    if (isNaN(sal) || sal < 0) {
      return NextResponse.json({ error: 'baseSalary must be >= 0' }, { status: 400 });
    }
    updateData.baseSalary = sal;
  }

  if (commissionRateShopee !== undefined) {
    const rate = parseFloat(commissionRateShopee);
    if (isNaN(rate) || rate < 0 || rate > 1) {
      return NextResponse.json(
        { error: 'commissionRateShopee must be between 0 and 1 (e.g. 0.03 for 3%)' },
        { status: 400 }
      );
    }
    updateData.commissionRateShopee = rate;
  }

  if (baseSalaryShopee !== undefined) {
    const sal = parseFloat(baseSalaryShopee);
    if (isNaN(sal) || sal < 0) {
      return NextResponse.json({ error: 'baseSalaryShopee must be >= 0' }, { status: 400 });
    }
    updateData.baseSalaryShopee = sal;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      commissionRate: true,
      baseSalary: true,
      commissionRateShopee: true,
      baseSalaryShopee: true,
    },
  });

  return NextResponse.json({ success: true, user: updated });
}
