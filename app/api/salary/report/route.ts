/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getAdminLiveSessions } from '@/app/actions/live';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from '@/lib/prisma';

// Helper to get days in a month — supports (YYYY-MM string) or (year, month) numbers
function daysInMonth(yearOrStr: number | string, monthNum?: number): number {
  if (typeof yearOrStr === 'string') {
    const [y, m] = yearOrStr.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }
  return new Date(yearOrStr, monthNum!, 0).getDate();
}

interface LeaveDaysResult {
  tiktokDays: number;
  shopeeDays: number;
  totalDays: number;
}

// นับจำนวนครั้งลา (non-SICK) ที่ตรงกับช่วงที่เลือก แยกตาม platform
// ลาป่วย (SICK) ไม่หักเงินเดือน
async function getDeductibleLeaveDaysByPlatform(
  userId: string,
  startDate: string,
  endDate: string
): Promise<LeaveDaysResult> {
  const rangeStart = new Date(`${startDate}T00:00:00+07:00`);
  const rangeEnd   = new Date(`${endDate}T23:59:59.999+07:00`);

  const leaves = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: 'APPROVED',
      leaveType: { not: 'SICK' },
      startDate: { lte: rangeEnd },
      endDate:   { gte: rangeStart },
    },
    include: {
      user: { select: { baseSalary: true, baseSalaryShopee: true } }
    }
  });

  const toTHDateStr = (d: Date) => {
    const th = new Date(d.getTime() + 7 * 3600 * 1000);
    return th.toISOString().split('T')[0];
  };

  const getDaysArray = (s: string, e: string) => {
    const dates: string[] = [];
    const curr = new Date(`${s}T00:00:00+07:00`);
    const end  = new Date(`${e}T00:00:00+07:00`);
    while (curr <= end) {
      dates.push(toTHDateStr(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  let tiktokDays = 0;
  let shopeeDays = 0;

  for (const lv of leaves) {
    const days       = getDaysArray(toTHDateStr(lv.startDate), toTHDateStr(lv.endDate));
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

  return { tiktokDays, shopeeDays, totalDays: tiktokDays + shopeeDays };
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role      = (session.user as { role?: string })?.role;
  const userEmail = session.user.email;

  const { searchParams } = new URL(request.url);
  const monthParam     = searchParams.get('month');     // YYYY-MM
  const startDateParam = searchParams.get('startDate'); // YYYY-MM-DD
  const endDateParam   = searchParams.get('endDate');   // YYYY-MM-DD

  let startDate: string;
  let endDate: string;
  let periodLabel: string;
  let dim: number;       // วันในเดือน (ใช้หาอัตราหักต่อวัน)
  let rangedays: number; // วันจริงที่เลือก (ใช้ prorate เงินเดือนพื้นฐาน)

  if (startDateParam && endDateParam) {
    startDate   = startDateParam;
    endDate     = endDateParam;
    periodLabel = `${startDate} ถึง ${endDate}`;
    const [sy, sm] = startDate.split('-');
    dim       = daysInMonth(`${sy}-${sm}`);
    const d1  = new Date(`${startDate}T00:00:00+07:00`);
    const d2  = new Date(`${endDate}T00:00:00+07:00`);
    rangedays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  } else if (monthParam) {
    const [yearStr, monthStr] = monthParam.split('-');
    const year  = Number(yearStr);
    const month = Number(monthStr);
    if (isNaN(year) || isNaN(month)) {
      return NextResponse.json({ error: 'Invalid month format' }, { status: 400 });
    }
    startDate   = `${yearStr}-${monthStr.padStart(2, '0')}-01`;
    endDate     = `${yearStr}-${monthStr.padStart(2, '0')}-${daysInMonth(year, month)}`;
    periodLabel = monthParam;
    dim         = daysInMonth(year, month);
    rangedays   = dim; // เต็มเดือน — ไม่ prorate
  } else {
    return NextResponse.json(
      { error: 'Missing parameter: use ?month=YYYY-MM or ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD' },
      { status: 400 }
    );
  }

  // ดึง session ที่เสร็จแล้วในช่วงที่เลือก
  const sessionsRes = await getAdminLiveSessions(startDate, endDate);
  if (!sessionsRes.success || !sessionsRes.completed) {
    return NextResponse.json({ error: sessionsRes.error || 'Failed to fetch sessions' }, { status: 500 });
  }
  let completed = sessionsRes.completed as any[];

  // Non-admin เห็นเฉพาะของตัวเอง
  if (role !== 'ADMIN') {
    completed = completed.filter((s) => s.user?.email === userEmail);
  }

  // รวมข้อมูลแต่ละพนักงาน
  const employeeMap: Record<string, any> = {};
  completed.forEach((s) => {
    const email  = s.user?.email || 'unknown';
    const userId = s.userId || s.user?.id || '';
    if (!employeeMap[email]) {
      employeeMap[email] = {
        name: s.user?.name || email,
        email,
        userId,
        baseSalary:           s.user?.baseSalary           || 0,
        baseSalaryShopee:     s.user?.baseSalaryShopee     || 0,
        commissionRate:       s.user?.commissionRate        ?? 0.05,
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

  // ดึงจำนวนวันลาแต่ละคน
  for (const emp of Object.values(employeeMap) as any[]) {
    if (emp.userId) {
      const leaveResult = await getDeductibleLeaveDaysByPlatform(emp.userId, startDate, endDate);
      emp.tiktokLeaveDays = leaveResult.tiktokDays;
      emp.shopeeLeaveDays = leaveResult.shopeeDays;
      emp.leaveDays       = leaveResult.totalDays;
    } else {
      emp.tiktokLeaveDays = 0;
      emp.shopeeLeaveDays = 0;
      emp.leaveDays       = 0;
    }
  }

  // คำนวณสรุปเงินเดือน พร้อม prorate ตามช่วงวันที่เลือก
  const report = Object.values(employeeMap).map((emp: any) => {
    // Prorate เงินเดือนพื้นฐาน: ได้เงินเฉพาะวันที่เลือก
    const proratedBase       = dim > 0 ? (emp.baseSalary / dim) * rangedays : emp.baseSalary;
    const proratedBaseShopee = dim > 0 ? (emp.baseSalaryShopee / dim) * rangedays : emp.baseSalaryShopee;

    // อัตราหักต่อวัน = เงินเดือนเต็มเดือน / วันในเดือน (ไม่ใช้ proratedBase)
    const tiktokDeduction = dim > 0 ? (emp.baseSalary / dim) * emp.tiktokLeaveDays : 0;
    const shopeeDeduction = dim > 0 ? (emp.baseSalaryShopee / dim) * emp.shopeeLeaveDays : 0;
    const leaveDeduction  = tiktokDeduction + shopeeDeduction;

    const netTikTokSalary     = Math.max(0, proratedBase - tiktokDeduction);
    const netShopeeSalary     = Math.max(0, proratedBaseShopee - shopeeDeduction);
    const totalBaseSalaryPaid = netTikTokSalary + netShopeeSalary;

    const gross  = totalBaseSalaryPaid + emp.commission;
    const tax    = gross * 0.03;
    const netPay = gross - tax;

    return {
      name:                 emp.name,
      email:                emp.email,
      baseSalary:           Math.round(proratedBase + proratedBaseShopee),
      totalSales:           Math.round(emp.totalSales),
      commission:           Math.round(emp.commission),
      leaveDays:            emp.leaveDays,
      tiktokLeaveDays:      emp.tiktokLeaveDays,
      shopeeLeaveDays:      emp.shopeeLeaveDays,
      leaveDeduction:       Math.round(leaveDeduction),
      tiktokLeaveDeduction: Math.round(tiktokDeduction),
      shopeeLeaveDeduction: Math.round(shopeeDeduction),
      tax:                  Math.round(tax),
      netPay:               Math.round(netPay),
    };
  });

  return NextResponse.json({ success: true, period: periodLabel, report });
}
