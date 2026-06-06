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
      cutoffStart = new Date(paramStart);
      cutoffEnd = new Date(paramEnd);
      // Ensure the end date covers the full day up to 23:59:59.999
      cutoffEnd.setHours(23, 59, 59, 999);
    } else {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const date = currentDate.getDate();

      if (date >= 29) {
        // e.g. Jun 29 => we show cycle: May 29 to Jun 28
        cutoffStart = new Date(year, month - 1, 29, 0, 0, 0);
        cutoffEnd = new Date(year, month, 28, 23, 59, 59, 999);
      } else if (date <= 5) {
        // e.g. Jul 3 => still showing cycle: May 29 to Jun 28
        cutoffStart = new Date(year, month - 2, 29, 0, 0, 0);
        cutoffEnd = new Date(year, month - 1, 28, 23, 59, 59, 999);
      } else {
        // e.g. Jul 15 => ongoing cycle: Jun 29 to Jul 28
        cutoffStart = new Date(year, month - 1, 29, 0, 0, 0);
        cutoffEnd = new Date(year, month, 28, 23, 59, 59, 999);
      }
    }

    const completed = await prisma.liveSession.findMany({
      where: { 
        status: "COMPLETED",
        startTime: { gte: cutoffStart, lte: cutoffEnd }
      },
      include: {
        user: {
          select: { name: true, email: true, baseSalary: true }
        }
      },
      orderBy: { endTime: "desc" },
    });

    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        status: "APPROVED",
        startDate: { gte: cutoffStart, lte: cutoffEnd }
      },
      include: {
        user: { select: { email: true } }
      }
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "Richse Official";
    wb.created = new Date();

    // --- DATA PROCESSING ---
    const userStats = completed.reduce((acc: Record<string, { name: string; email: string; totalMins: number; totalSales: number; shopeeSales: number; otherSales: number; sessionsCount: number; leaveDeductions: number; baseSalary: number }>, curr) => {
      const c = curr as unknown as { user: { email: string; name: string | null; baseSalary: number | null }; durationMin: number | null; salesAmount: number | null; platform: string };
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
          baseSalary: c.user.baseSalary || 0
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

    // Calculate Leave Deductions
    // VACATION deducts 250 per day, PERSONAL deducts 500 per day
    approvedLeaves.forEach((leave) => {
      const email = leave.user.email;
      if (email && userStats[email]) {
        // approximate days
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
        
        if (leave.leaveType === "VACATION") {
          userStats[email].leaveDeductions += (days * 250);
        } else if (leave.leaveType === "PERSONAL") {
          userStats[email].leaveDeductions += (days * 500);
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
      const s = stat as { totalMins: number; totalSales: number; shopeeSales: number; otherSales: number; name: string; email: string; sessionsCount: number; leaveDeductions: number; baseSalary: number };
      const hours = Math.floor(s.totalMins / 60);
      const mins = s.totalMins % 60;
      const r = idx + 6;
      const commissionValue = (s.shopeeSales * 0.03) + (s.otherSales * 0.05);
      const grossEarnings = s.baseSalary + commissionValue;
      const netSalaryValue = grossEarnings - s.leaveDeductions;

      const row = wsSummary.addRow([
        s.name,
        s.sessionsCount,
        `${hours}h ${mins}m`,
        s.shopeeSales,
        s.otherSales,
        { formula: `D${r}+E${r}`, result: s.totalSales },
        s.baseSalary,
        { formula: `D${r}*0.03 + E${r}*0.05`, result: commissionValue },
        { formula: `G${r}+H${r}`, result: grossEarnings },
        s.leaveDeductions,
        { formula: `I${r}-J${r}`, result: netSalaryValue },
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
