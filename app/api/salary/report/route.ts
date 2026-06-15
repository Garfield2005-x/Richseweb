/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getAdminLiveSessions } from '@/app/actions/live';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// Helper to get days in a month
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
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
  const endDate = `${yearStr}-${monthStr.padStart(2, '0')}-${daysInMonth(year, month)}`;

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
    const email = s.user?.email || 'unknown';
    if (!employeeMap[email]) {
      employeeMap[email] = {
        name: s.user?.name || email,
        email,
        baseSalary: s.user?.baseSalary || 0,
        totalSales: 0,
        commission: 0,
        leaveDays: 0 // placeholder, not calculated currently
      };
    }
    const emp = employeeMap[email];
    const sales = s.salesAmount || 0;
    emp.totalSales += sales;
    // commission rate: 3% for Shopee, otherwise 5%
    const rate = s.platform?.toLowerCase() === 'shopee' ? 0.03 : 0.05;
    emp.commission += sales * rate;
  });

  // Compute final figures
  const report = Object.values(employeeMap).map((emp: any) => {
    const daysInThisMonth = daysInMonth(year, month);
    const leaveDeduction = emp.baseSalary / daysInThisMonth * (emp.leaveDays || 0);
    const gross = emp.baseSalary + emp.totalSales + emp.commission - leaveDeduction;
    const tax = gross * 0.03; // 3% tax
    const net = gross - tax;
    return {
      name: emp.name,
      email: emp.email,
      baseSalary: emp.baseSalary,
      totalSales: emp.totalSales,
      commission: emp.commission,
      leaveDeduction,
      tax,
      netPay: net
    };
  });

  return NextResponse.json({ success: true, month: monthParam, report });
}
