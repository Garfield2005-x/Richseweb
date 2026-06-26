/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getAdminLiveSessions } from '@/app/actions/live';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from '@/lib/prisma';

// Helper to get days in a month
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Helper: count approved non-SICK leave days overlapping the given range
// ลาป่วย (SICK) ไม่หักเงินเดือน
interface LeaveDaysResult {
  tiktokDays: number;
  shopeeDays: number;
  totalDays: number;
}

// Helper: count approved non-SICK leave days overlapping the given range by platform
// ลาป่วย (SICK) ไม่หักเงินเดือน
async function getDeductibleLeaveDaysByPlatform(userId: string, startDate: string, endDate: string): Promise<LeaveDaysResult> {
  const rangeStart = new Date(`${startDate}T00:00:00+07:00`);
  const rangeEnd   = new Date(`${endDate}T23:59:59.999+07:00`);

  const leaves = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: 'APPROVED',
      leaveType: { not: 'SICK' }, // ลาป่วยไม่หักเงินเดือน
      startDate: { lte: rangeEnd },
      endDate:   { gte: rangeStart },
    },
    include: {
      user: {
        select: {
          baseSalary: true,
          baseSalaryShopee: true,
        }
      }
    }
  });

  const toTHDateStr = (d: Date) => {
    const th = new Date(d.getTime() + 7 * 3600 * 1000);
    return th.toISOString().split('T')[0];
  };

  const getDaysArray = (s: string, e: string) => {
    const dates: string[] = [];
    const curr = new Date(`${s}T00:00:00+07:00`);
    const end = new Date(`${e}T00:00:00+07:00`);
    while (curr <= end) {
      dates.push(toTHDateStr(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  let tiktokDays = 0;
  let shopeeDays = 0;

  for (const lv of leaves) {
    const days = getDaysArray(toTHDateStr(lv.startDate), toTHDateStr(lv.endDate));
    const overlapping = days.filter(d => d >= startDate && d <= endDate).length;
    
    const isShopeeSalary = (lv.user?.baseSalaryShopee ?? 0) > 0;
    const isTikTokSalary = (lv.user?.baseSalary ?? 0) > 0;
    const targetPlatform = lv.platform
      ? lv.platform
      : (isShopeeSalary && !isTikTokSalary ? 'Shopee' : 'TikTok');

    if (targetPlatform.toLowerCase() === 'shopee') {
      shopeeDays += overlapping;
    } else {
      tiktokDays += overlapping;
    }
  }

  return {
    tiktokDays,
    shopeeDays,
    totalDays: tiktokDays + shopeeDays
  };
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = (session.user as { role?: string })?.role;
  const userEmail = session.user.email;

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get('month'); // format YYYY-MM
  if (!monthParam) {
    return NextResponse.json({ error: 'Missing month parameter (YYYY-MM)' }, { status: 400 });
  }
  const [yearStr, monthStr] = monthParam.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (isNaN(year) || isNaN(month)) {
    return NextResponse.json({ error: 'Invalid month format' }, { status: 400 });
  }

  // Determine start and end dates for the month
  const startDate = `${yearStr}-${monthStr.padStart(2, '0')}-01`;
  const endDate   = `${yearStr}-${monthStr.padStart(2, '0')}-${daysInMonth(year, month)}`;

  // Fetch completed sessions in the month
  const sessionsRes = await getAdminLiveSessions(startDate, endDate);
  if (!sessionsRes.success || !sessionsRes.completed) {
    return NextResponse.json({ error: sessionsRes.error || 'Failed to fetch sessions' }, { status: 500 });
  }
  let completed = sessionsRes.completed as any[];

  // If user is not admin, filter to only see their own sessions
  if (role !== 'ADMIN') {
    completed = completed.filter((s) => s.user?.email === userEmail);
  }

  // Aggregate per employee
  const employeeMap: Record<string, any> = {};
  completed.forEach((s) => {
    const email  = s.user?.email || 'unknown';
    const userId = s.userId || s.user?.id || '';
    if (!employeeMap[email]) {
      employeeMap[email] = {
        name: s.user?.name || email,
        email,
        userId,
        baseSalary:         s.user?.baseSalary        || 0,
        baseSalaryShopee:   s.user?.baseSalaryShopee  || 0,
        commissionRate:     s.user?.commissionRate     ?? 0.05,
        commissionRateShopee: s.user?.commissionRateShopee ?? 0.03,
        totalSales: 0,
        commission: 0,
        leaveDays:  0,
      };
    }
    const emp   = employeeMap[email];
    const sales = s.salesAmount || 0;
    emp.totalSales += sales;
    const isShopee = s.platform?.toLowerCase() === 'shopee';
    const rate = isShopee ? emp.commissionRateShopee : emp.commissionRate;
    emp.commission += sales * rate;
  });

  // Fetch deductible leave days (excludes SICK) for each employee
  for (const emp of Object.values(employeeMap) as any[]) {
    if (emp.userId) {
      const leaveResult = await getDeductibleLeaveDaysByPlatform(emp.userId, startDate, endDate);
      emp.tiktokLeaveDays = leaveResult.tiktokDays;
      emp.shopeeLeaveDays = leaveResult.shopeeDays;
      emp.leaveDays = leaveResult.totalDays;
    } else {
      emp.tiktokLeaveDays = 0;
      emp.shopeeLeaveDays = 0;
      emp.leaveDays = 0;
    }
  }

  // Compute final figures
  const dim = daysInMonth(year, month);
  const report = Object.values(employeeMap).map((emp: any) => {
    const tiktokDeduction = dim > 0 ? (emp.baseSalary / dim) * emp.tiktokLeaveDays : 0;
    const shopeeDeduction = dim > 0 ? (emp.baseSalaryShopee / dim) * emp.shopeeLeaveDays : 0;
    const leaveDeduction = tiktokDeduction + shopeeDeduction;

    const netTikTokSalary = Math.max(0, emp.baseSalary - tiktokDeduction);
    const netShopeeSalary = Math.max(0, emp.baseSalaryShopee - shopeeDeduction);

    const totalBaseSalaryPaid = netTikTokSalary + netShopeeSalary;
    const gross  = totalBaseSalaryPaid + emp.commission;
    const tax    = gross * 0.03; // 3% tax as final step
    const netPay = gross - tax;

    return {
      name:           emp.name,
      email:          emp.email,
      baseSalary:     Math.round(emp.baseSalary + emp.baseSalaryShopee),
      totalSales:     Math.round(emp.totalSales),
      commission:     Math.round(emp.commission),
      leaveDays:      emp.leaveDays,
      leaveDeduction: Math.round(leaveDeduction),
      tax:            Math.round(tax),
      netPay:         Math.round(netPay),
    };
  });

  return NextResponse.json({ success: true, month: monthParam, report });
}
