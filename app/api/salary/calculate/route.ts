/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { sendLineMessage } from '@/lib/line';
import { getAdminLiveSessions } from '@/app/actions/live';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// Helper to get days in a month from a YYYY-MM string
function daysInMonth(monthStr: string): number {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

// Helper to count leave days between two dates for a user in a date range
async function getApprovedLeaveDays(userId: string, startDate: string, endDate: string): Promise<number> {
  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);
  rangeEnd.setHours(23, 59, 59, 999);

  const leaves = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: 'APPROVED',
      startDate: { lte: rangeEnd },
      endDate: { gte: rangeStart },
    },
  });

  let totalDays = 0;
  for (const leave of leaves) {
    const leaveStart = new Date(Math.max(leave.startDate.getTime(), rangeStart.getTime()));
    const leaveEnd = new Date(Math.min(leave.endDate.getTime(), rangeEnd.getTime()));
    const diff = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    totalDays += Math.max(0, diff);
  }
  return totalDays;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as { role?: string })?.role;
  const userEmail = session.user.email;

  const { searchParams } = new URL(request.url);

  // Support both ?month=YYYY-MM and ?startDate=...&endDate=...
  const month = searchParams.get('month');
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  let startDate: string;
  let endDate: string;
  let monthLabel: string;
  let dim: number; // days used for leave deduction calculation

  if (startDateParam && endDateParam) {
    startDate = startDateParam;
    endDate = endDateParam;
    monthLabel = `${startDate} ถึง ${endDate}`;
    // Calculate number of days in the range for leave deduction ratio
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    dim = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  } else if (month) {
    startDate = `${month}-01`;
    endDate = `${month}-${daysInMonth(month)}`;
    monthLabel = month;
    dim = daysInMonth(month);
  } else {
    return NextResponse.json(
      { error: 'Missing parameters. Use ?month=YYYY-MM or ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD' },
      { status: 400 }
    );
  }

  // Pull completed live-sessions from the admin endpoint
  const sessionsRes = await getAdminLiveSessions(startDate, endDate);
  if (!sessionsRes.success || !sessionsRes.completed) {
    return NextResponse.json({ error: sessionsRes.error || 'Failed to fetch sessions' }, { status: 500 });
  }
  let completed = sessionsRes.completed as any[];

  // If user is not admin, filter to only see their own sessions
  if (role !== 'ADMIN') {
    completed = completed.filter((s) => s.user?.email === userEmail);
  }

  // Aggregate per-employee data
  const employeeMap: Record<string, any> = {};
  completed.forEach((s) => {
    const email = s.user?.email || 'unknown';
    const userId = s.userId || s.user?.id || '';
    if (!employeeMap[email]) {
      employeeMap[email] = {
        name: s.user?.name || email,
        email,
        userId,
        baseSalary: s.user?.baseSalary || 0,
        totalSales: 0,
        commission: 0,
        leaveDays: 0,
      };
    }
    const emp = employeeMap[email];
    const sales = s.salesAmount || 0;
    emp.totalSales += sales;
    // commission rate per platform (Shopee 3%, otherwise 5%)
    const rate = s.platform?.toLowerCase() === 'shopee' ? 0.03 : 0.05;
    emp.commission += sales * rate;
  });

  // Fetch leave data for each employee
  for (const emp of Object.values(employeeMap) as any[]) {
    if (emp.userId) {
      emp.leaveDays = await getApprovedLeaveDays(emp.userId, startDate, endDate);
    }
  }

  // Final calculations per employee
  const report = Object.values(employeeMap).map((emp: any) => {
    const leaveDeduction = dim > 0 ? (emp.baseSalary / dim) * emp.leaveDays : 0;
    const gross = emp.baseSalary + emp.commission - leaveDeduction;
    const tax = gross * 0.03; // 3% tax as final step
    const netPay = gross - tax;
    return {
      name: emp.name,
      email: emp.email,
      baseSalary: Math.round(emp.baseSalary),
      totalSales: Math.round(emp.totalSales),
      commission: Math.round(emp.commission),
      leaveDays: emp.leaveDays,
      leaveDeduction: Math.round(leaveDeduction),
      tax: Math.round(tax),
      netPay: Math.round(netPay),
      period: monthLabel,
    };
  });

  return NextResponse.json({ success: true, period: monthLabel, report });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { period, report } = await request.json();
    if (!period || !report) {
      return NextResponse.json({ error: 'period and report required' }, { status: 400 });
    }

    // Build Thai-language message for LINE
    let message = `📋 สรุปเงินเดือน\n`;
    message += `📅 ช่วง: ${period}\n`;
    message += `${'─'.repeat(20)}\n`;

    for (const r of report) {
      message += `\n👤 ${r.name}\n`;
      message += `💰 เงินเดือนพื้นฐาน: ฿${r.baseSalary.toLocaleString()}\n`;
      message += `📊 ยอดขายรวม: ฿${r.totalSales.toLocaleString()}\n`;
      message += `💎 ค่าคอมมิชชั่น: +฿${r.commission.toLocaleString()}\n`;
      if (r.leaveDays > 0) {
        message += `🏥 วันลา: ${r.leaveDays} วัน (-฿${r.leaveDeduction.toLocaleString()})\n`;
      }
      message += `📝 หัก 3%: -฿${r.tax.toLocaleString()}\n`;
      message += `✅ รับสุทธิ: ฿${r.netPay.toLocaleString()}\n`;
    }

    const lineResult = await sendLineMessage(message);
    if (!lineResult.success) {
      return NextResponse.json({ error: lineResult.error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
