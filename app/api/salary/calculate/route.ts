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

// Helper to count leave days between two dates for a user in a date range by platform
// NOTE: SICK leave (ลาป่วย) is excluded — it does NOT deduct salary
interface LeaveDaysResult {
  tiktokDays: number;
  shopeeDays: number;
  totalDays: number;
}

async function getApprovedLeaveDaysByPlatform(userId: string, startDate: string, endDate: string): Promise<LeaveDaysResult> {
  const rangeStart = new Date(`${startDate}T00:00:00+07:00`);
  const rangeEnd = new Date(`${endDate}T23:59:59.999+07:00`);

  const leaves = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: 'APPROVED',
      leaveType: { not: 'SICK' }, // ลาป่วยไม่หักเงินเดือน
      startDate: { lte: rangeEnd },
      endDate: { gte: rangeStart },
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

  const getDaysArray = (startStr: string, endStr: string): string[] => {
    const dates: string[] = [];
    const curr = new Date(`${startStr}T00:00:00+07:00`);
    const end = new Date(`${endStr}T00:00:00+07:00`);
    while (curr <= end) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const toTHDateString = (date: Date): string => {
    const thTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return thTime.toISOString().split('T')[0];
  };

  let tiktokDays = 0;
  let shopeeDays = 0;

  for (const leave of leaves) {
    const leaveStartStr = toTHDateString(leave.startDate);
    const leaveEndStr = toTHDateString(leave.endDate);
    const leaveDays = getDaysArray(leaveStartStr, leaveEndStr);
    const overlapping = leaveDays.filter(day => day >= startDate && day <= endDate);
    
    const isShopeeSalary = (leave.user?.baseSalaryShopee ?? 0) > 0;
    const isTikTokSalary = (leave.user?.baseSalary ?? 0) > 0;
    const targetPlatform = leave.platform
      ? leave.platform
      : (isShopeeSalary && !isTikTokSalary ? 'Shopee' : 'TikTok');

    if (targetPlatform.toLowerCase() === 'shopee') {
      shopeeDays += overlapping.length;
    } else {
      tiktokDays += overlapping.length;
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
    const d1 = new Date(`${startDate}T00:00:00+07:00`);
    const d2 = new Date(`${endDate}T00:00:00+07:00`);
    dim = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
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
        baseSalaryShopee: s.user?.baseSalaryShopee || 0,
        totalSales: 0,
        commission: 0,
        leaveDays: 0,
      };
    }
    const emp = employeeMap[email];
    const sales = s.salesAmount || 0;
    emp.totalSales += sales;
    const isShopee = s.platform?.toLowerCase() === 'shopee';
    const userRate = s.user?.commissionRate ?? 0.05;
    const userRateShopee = s.user?.commissionRateShopee ?? 0.03;
    const rate = isShopee ? userRateShopee : userRate;
    emp.commission += sales * rate;
  });

  // Fetch leave data for each employee
  for (const emp of Object.values(employeeMap) as any[]) {
    if (emp.userId) {
      const leaveResult = await getApprovedLeaveDaysByPlatform(emp.userId, startDate, endDate);
      emp.tiktokLeaveDays = leaveResult.tiktokDays;
      emp.shopeeLeaveDays = leaveResult.shopeeDays;
      emp.leaveDays = leaveResult.totalDays;
    } else {
      emp.tiktokLeaveDays = 0;
      emp.shopeeLeaveDays = 0;
      emp.leaveDays = 0;
    }
  }

  // Final calculations per employee
  const report = Object.values(employeeMap).map((emp: any) => {
    const tiktokDeduction = dim > 0 ? (emp.baseSalary / dim) * emp.tiktokLeaveDays : 0;
    const shopeeDeduction = dim > 0 ? (emp.baseSalaryShopee / dim) * emp.shopeeLeaveDays : 0;
    const leaveDeduction = tiktokDeduction + shopeeDeduction;
    
    const netTikTokSalary = Math.max(0, emp.baseSalary - tiktokDeduction);
    const netShopeeSalary = Math.max(0, emp.baseSalaryShopee - shopeeDeduction);
    
    const totalBaseSalaryPaid = netTikTokSalary + netShopeeSalary;
    const gross = totalBaseSalaryPaid + emp.commission;
    const tax = gross * 0.03; // 3% tax as final step
    const netPay = gross - tax;
    return {
      name: emp.name,
      email: emp.email,
      baseSalary: Math.round(emp.baseSalary + emp.baseSalaryShopee),
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
        message += `📅 วันลา (กิจ/พักร้อน): ${r.leaveDays} ครั้ง (-฿${r.leaveDeduction.toLocaleString()})\n`;
        message += `ℹ️ หมายเหตุ: ลาป่วยไม่หักเงินเดือน\n`;
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
