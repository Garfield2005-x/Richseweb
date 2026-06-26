import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import ExcelJS from "exceljs";

// --- Colour Palette (Richse Brand) ---
const C = {
  brandDark: "161314",
  brandPink: "C3A2AB",
  brandPinkSoft: "F9F5F6",
  accent: "A07882",
  white: "FFFFFF",
  border: "EDE8EA",
  textDark: "161314",
  textMid: "6B5B63",
  rowAlt: "FDF7F9",
};

const FONT_BASE = "Calibri";

const fill = (argb: string) => ({ type: "pattern" as const, pattern: "solid" as const, fgColor: { argb } });
const color = (argb: string) => ({ argb });
const hairBorder = (argb = C.border) => ({
  top: { style: "hair" as const, color: color(argb) },
  bottom: { style: "hair" as const, color: color(argb) },
  left: { style: "hair" as const, color: color(argb) },
  right: { style: "hair" as const, color: color(argb) },
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const paramStart = url.searchParams.get("startDate");
    const paramEnd = url.searchParams.get("endDate");

    let cutoffStart: Date;
    let cutoffEnd: Date;

    if (paramStart && paramEnd) {
      cutoffStart = new Date(`${paramStart}T00:00:00+07:00`);
      cutoffEnd = new Date(`${paramEnd}T23:59:59.999+07:00`);
    } else {
      const now = new Date();
      const thDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const year = thDate.getUTCFullYear();
      const month = thDate.getUTCMonth(); // 0-11
      const date = thDate.getUTCDate();

      const startYear = year;
      let startMonth = month;
      const endYear = year;
      let endMonth = month + 1;

      if (date >= 29) {
        startMonth = month;
        endMonth = month + 1;
      } else if (date <= 5) {
        startMonth = month - 1;
        endMonth = month;
      } else {
        startMonth = month;
        endMonth = month + 1;
      }

      const adjustYearMonth = (y: number, m: number) => {
        let adjY = y;
        let adjM = m;
        while (adjM < 1) {
          adjM += 12;
          adjY -= 1;
        }
        while (adjM > 12) {
          adjM -= 12;
          adjY += 1;
        }
        return { year: adjY, month: adjM };
      };

      const startAdjusted = adjustYearMonth(startYear, startMonth);
      const endAdjusted = adjustYearMonth(endYear, endMonth);

      const pad = (n: number) => String(n).padStart(2, '0');
      cutoffStart = new Date(`${startAdjusted.year}-${pad(startAdjusted.month)}-29T00:00:00+07:00`);
      cutoffEnd = new Date(`${endAdjusted.year}-${pad(endAdjusted.month)}-28T23:59:59.999+07:00`);
    }

    // จำนวนวันจริงในช่วงที่เลือก (ใช้ prorate เงินเดือนพื้นฐาน)
    const rangedays = Math.round((cutoffEnd.getTime() - cutoffStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    // จำนวนวันในเดือนของ cutoffStart (ใช้หาอัตราหักลาต่อวัน)
    const cutoffStartTH = new Date(cutoffStart.getTime() + 7 * 60 * 60 * 1000);
    const dimMonth = new Date(cutoffStartTH.getUTCFullYear(), cutoffStartTH.getUTCMonth() + 1, 0).getDate();

    const completed = await prisma.liveSession.findMany({
      where: { 
        status: "COMPLETED",
        startTime: { gte: cutoffStart, lte: cutoffEnd }
      },
      include: {
        user: {
          select: { name: true, email: true, baseSalary: true, commissionRate: true, baseSalaryShopee: true, commissionRateShopee: true }
        }
      },
      orderBy: { endTime: "desc" },
    });

    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        status: "APPROVED",
        leaveType: { not: "SICK" }, // ลาป่วยไม่หักเงินเดือน
        startDate: { gte: cutoffStart, lte: cutoffEnd }
      },
      include: {
        user: { select: { email: true, baseSalary: true, baseSalaryShopee: true } }
      }
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "Richse Official";
    wb.created = new Date();

    // --- DATA PROCESSING ---
    const userStats = completed.reduce((acc: Record<string, { name: string; email: string; totalMins: number; totalSales: number; shopeeSales: number; otherSales: number; sessionsCount: number; leaveDeductions: number; leaveDeductionsTikTok: number; leaveDeductionsShopee: number; baseSalary: number; baseSalaryShopee: number; commissionRate: number; commissionRateShopee: number }>, curr) => {
      const c = curr as unknown as { user: { email: string; name: string | null; baseSalary: number | null; commissionRate: number | null; baseSalaryShopee: number | null; commissionRateShopee: number | null }; durationMin: number | null; salesAmount: number | null; platform: string };
      const email = c.user.email;
      if (!acc[email]) {
        acc[email] = {
          name: curr.user.name || email,
          email: email,
          totalMins: 0,
          totalSales: 0,
          shopeeSales: 0,
          otherSales: 0,
          sessionsCount: 0,
          leaveDeductions: 0,
          leaveDeductionsTikTok: 0,
          leaveDeductionsShopee: 0,
          baseSalary: c.user.baseSalary || 0,
          baseSalaryShopee: c.user.baseSalaryShopee || 0,
          commissionRate: c.user.commissionRate ?? 0.05,
          commissionRateShopee: c.user.commissionRateShopee ?? 0.03
        };
      }
      acc[email].totalMins += (c.durationMin || 0);
      const sales = c.salesAmount || 0;
      acc[email].totalSales += sales;
      if (c.platform.toLowerCase() === 'shopee') {
        acc[email].shopeeSales += sales;
      } else {
        acc[email].otherSales += sales;
      }
      
      acc[email].sessionsCount += 1;
      return acc;
    }, {});

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

    // Calculate Leave Deductions
    // VACATION deducts 250 per day, PERSONAL deducts 500 per day
    approvedLeaves.forEach((leave) => {
      const email = leave.user.email;
      if (email && userStats[email]) {
        const leaveStartStr = toTHDateString(leave.startDate);
        const leaveEndStr = toTHDateString(leave.endDate);
        const leaveDays = getDaysArray(leaveStartStr, leaveEndStr);
        
        const cycleStartStr = toTHDateString(cutoffStart);
        const cycleEndStr = toTHDateString(cutoffEnd);
        const overlapping = leaveDays.filter(day => day >= cycleStartStr && day <= cycleEndStr);
        const days = overlapping.length;
        
        if (days > 0) {
          let deduction = 0;
          if (leave.leaveType === "VACATION") {
            deduction = days * 250;
          } else if (leave.leaveType === "PERSONAL") {
            deduction = days * 500;
          }
          
          const isShopeeSalary = ((leave.user as any)?.baseSalaryShopee ?? 0) > 0;
          const isTikTokSalary = ((leave.user as any)?.baseSalary ?? 0) > 0;
          const targetPlatform = leave.platform
            ? leave.platform
            : (isShopeeSalary && !isTikTokSalary ? 'Shopee' : 'TikTok');

          if (targetPlatform.toLowerCase() === 'shopee') {
            userStats[email].leaveDeductionsShopee += deduction;
          } else {
            userStats[email].leaveDeductionsTikTok += deduction;
          }
          userStats[email].leaveDeductions += deduction;
        }
      }
    });

    const statsArray = Object.values(userStats).sort((a, b) => b.totalSales - a.totalSales);

    // --- SHEET 1: PERFORMANCE SUMMARY ---
    const wsSummary = wb.addWorksheet("Performance Summary", {
      views: [{ state: "frozen", ySplit: 5 }],
    });

    const HEADERS = [
      { label: "ชื่อพนักงาน", width: 30 },
      { label: "จำนวนเซสชัน", width: 14 },
      { label: "ชั่วโมงทำงาน", width: 18 },
      { label: "ยอดขาย Shopee", width: 20 },
      { label: "ยอดขาย TikTok", width: 20 },
      { label: "ยอดขายรวม", width: 22 },
      { label: "เงินเดือน", width: 22 },
      { label: "ค่าคอมมิชชัน", width: 22 },
      { label: "รายได้รวม", width: 22 },
      { label: "หักลา", width: 22 },
      { label: "เงินสุทธิ", width: 22 },
      { label: "อีเมล", width: 35 },
    ];

    wsSummary.mergeCells("A1:L1");
    wsSummary.mergeCells("A2:L2");

    wsSummary.getRow(5).height = 25;
    HEADERS.forEach((h, i) => {
      const cell = wsSummary.getCell(5, i + 1);
      cell.value = h.label;
      cell.font = { name: FONT_BASE, size: 10, bold: true, color: color(C.white) };
      cell.fill = fill(C.accent);
      cell.alignment = { horizontal: "center", vertical: "middle" };
      wsSummary.getColumn(i + 1).width = h.width;
    });

    statsArray.forEach((stat, idx: number) => {
      const s = stat as { totalMins: number; totalSales: number; shopeeSales: number; otherSales: number; name: string; email: string; sessionsCount: number; leaveDeductions: number; leaveDeductionsTikTok: number; leaveDeductionsShopee: number; baseSalary: number; baseSalaryShopee: number; commissionRate: number; commissionRateShopee: number };
      const hours = Math.floor(s.totalMins / 60);
      const mins = s.totalMins % 60;
      const r = idx + 6;
      
      const userRate = s.commissionRate;
      const userRateShopee = s.commissionRateShopee;
      const commissionValue = (s.shopeeSales * userRateShopee) + (s.otherSales * userRate);

      // Prorate เงินเดือนพื้นฐานตามวันจริงที่เลือก
      const proratedBase       = dimMonth > 0 ? (s.baseSalary / dimMonth) * rangedays : s.baseSalary;
      const proratedBaseShopee = dimMonth > 0 ? (s.baseSalaryShopee / dimMonth) * rangedays : s.baseSalaryShopee;
      const totalBaseSalary    = proratedBase + proratedBaseShopee;

      // อัตราหักต่อวัน = เงินเดือนเต็ม / วันในเดือน
      const netTikTokSalary = Math.max(0, proratedBase - s.leaveDeductionsTikTok);
      const netShopeeSalary = Math.max(0, proratedBaseShopee - s.leaveDeductionsShopee);
      const netSalaryValue  = netTikTokSalary + netShopeeSalary + commissionValue;
      const grossEarnings   = totalBaseSalary + commissionValue;

      const netFormula = `MAX(0,${Math.round(proratedBase)}-${s.leaveDeductionsTikTok})+MAX(0,${Math.round(proratedBaseShopee)}-${s.leaveDeductionsShopee})+H${r}`;

      const row = wsSummary.addRow([
        s.name,
        s.sessionsCount,
        `${hours}h ${mins}m`,
        s.shopeeSales,
        s.otherSales,
        { formula: `D${r}+E${r}`, result: s.totalSales },
        totalBaseSalary,
        { formula: `D${r}*${userRateShopee} + E${r}*${userRate}`, result: commissionValue },
        { formula: `G${r}+H${r}`, result: grossEarnings },
        s.leaveDeductions,
        { formula: netFormula, result: netSalaryValue },
        s.email,
      ]);

      const rowBg = idx % 2 === 0 ? C.white : C.rowAlt;
      row.eachCell((cell, colIdx) => {
        cell.fill = fill(rowBg);
        cell.border = hairBorder();
        cell.font = { name: FONT_BASE, size: 10, color: color(C.textDark) };
        if (colIdx >= 4 && colIdx <= 11) {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: "right" };
        } else if (colIdx === 2 || colIdx === 3) {
          cell.alignment = { horizontal: "center" };
        }
      });
    });

    // --- SHEET 2: SESSION LOGS ---
    const wsLogs = wb.addWorksheet("Session Logs", {
      views: [{ state: "frozen", xSplit: 0, ySplit: 1 }]
    });

    wsLogs.columns = [
      { header: "ลำดับ", key: "id", width: 8 },
      { header: "วันที่", key: "date", width: 15 },
      { header: "พนักงาน", key: "employee", width: 25 },
      { header: "แพลตฟอร์ม", key: "platform", width: 15 },
      { header: "เวลาเริ่ม", key: "start", width: 10 },
      { header: "เวลาจบ", key: "end", width: 10 },
      { header: "ระยะเวลา", key: "duration", width: 15 },
      { header: "ยอดขาย (บาท)", key: "sales", width: 15 },
    ];

    // Header styling
    wsLogs.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    wsLogs.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC3A2AB" } };

    wsLogs.columns.forEach((h, i) => {
      wsLogs.getColumn(i + 1).width = h.width as number;
    });

    completed.forEach((session, idx: number) => {
      const s = session as { startTime: Date; endTime: Date | null; durationMin: number | null; salesAmount: number | null; platform: string; user: { name: string | null; email: string } };
      const start = new Date(s.startTime);
      const end = s.endTime ? new Date(s.endTime) : null;
      const hours = Math.floor((s.durationMin || 0) / 60);
      const mins = (s.durationMin || 0) % 60;

      const row = wsLogs.addRow([
        idx + 1,
        start.toLocaleDateString("th-TH"),
        s.user.name || s.user.email,
        s.platform,
        start.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' }),
        end ? end.toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' }) : "-",
        `${hours}h ${mins}m`,
        s.salesAmount || 0,
      ]);

      const rowBg = idx % 2 === 0 ? C.white : C.rowAlt;
      row.eachCell((cell, colIdx) => {
        cell.fill = fill(rowBg);
        cell.border = hairBorder();
        cell.font = { name: FONT_BASE, size: 10, color: color(C.textDark) };
        if (colIdx === 8) {
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: "right" };
        } else {
          cell.alignment = { horizontal: "center" };
        }
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const filename = `Richse_Live_Performance_${stamp}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Live tracking export error:", err);
    return NextResponse.json({ error: "Export failed", detail: String(err) }, { status: 500 });
  }
}
