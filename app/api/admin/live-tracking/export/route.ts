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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const completed = await prisma.liveSession.findMany({
      where: { status: "COMPLETED" },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { endTime: "desc" },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "Richse Official";
    wb.created = new Date();

    // --- DATA PROCESSING ---
    const userStats = completed.reduce((acc: Record<string, { name: string; email: string; totalMins: number; totalSales: number; sessionsCount: number }>, curr) => {
      const c = curr as unknown as { user: { email: string; name: string | null }; durationMin: number | null; salesAmount: number | null };
      const email = c.user.email;
      if (!acc[email]) {
        acc[email] = {
          name: curr.user.name || email,
          email: email,
          totalMins: 0,
          totalSales: 0,
          sessionsCount: 0
        };
      }
      acc[email].totalMins += (c.durationMin || 0);
      acc[email].totalSales += (c.salesAmount || 0);
      acc[email].sessionsCount += 1;
      return acc;
    }, {});

    const statsArray = Object.values(userStats).sort((a, b) => b.totalSales - a.totalSales);

    // --- SHEET 1: PERFORMANCE SUMMARY ---
    const wsSummary = wb.addWorksheet("Performance Summary", {
      views: [{ state: "frozen", ySplit: 5 }],
    });

    wsSummary.mergeCells("A1:F1");
    wsSummary.getRow(1).height = 40;
    const title = wsSummary.getCell("A1");
    title.value = "RICHSE OFFICIAL — Live Streamer Performance";
    title.font = { name: FONT_BASE, size: 16, bold: true, color: color(C.white) };
    title.fill = fill(C.brandDark);
    title.alignment = { horizontal: "center", vertical: "middle" };

    wsSummary.mergeCells("A2:F2");
    wsSummary.getRow(2).height = 20;
    const dateCell = wsSummary.getCell("A2");
    dateCell.value = `Report Generated: ${new Date().toLocaleString("th-TH")}`;
    dateCell.font = { name: FONT_BASE, size: 9, italic: true, color: color(C.white) };
    dateCell.fill = fill(C.brandPink);
    dateCell.alignment = { horizontal: "center", vertical: "middle" };

    const HEADERS = [
      { label: "Employee Name", width: 30 },
      { label: "Sessions", width: 12 },
      { label: "Total Hours", width: 18 },
      { label: "Total Sales (THB)", width: 22 },
      { label: "Commission (5%)", width: 22 },
      { label: "Email", width: 35 },
    ];

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
      const s = stat as { totalMins: number; totalSales: number; name: string; email: string; sessionsCount: number };
      const hours = Math.floor(s.totalMins / 60);
      const mins = stat.totalMins % 60;
      const commission = stat.totalSales * 0.05;

      const row = wsSummary.addRow([
        stat.name,
        stat.sessionsCount,
        `${hours}h ${mins}m`,
        stat.totalSales,
        commission,
        stat.email,
      ]);

      const rowBg = idx % 2 === 0 ? C.white : C.rowAlt;
      row.eachCell((cell, colIdx) => {
        cell.fill = fill(rowBg);
        cell.border = hairBorder();
        cell.font = { name: FONT_BASE, size: 10, color: color(C.textDark) };
        if (colIdx === 4 || colIdx === 5) {
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
      { header: "ID", key: "id", width: 5 },
      { header: "Date", key: "date", width: 15 },
      { header: "Employee", key: "employee", width: 25 },
      { header: "Platform", key: "platform", width: 15 },
      { header: "Start", key: "start", width: 10 },
      { header: "End", key: "end", width: 10 },
      { header: "Duration", key: "duration", width: 15 },
      { header: "Sales (THB)", key: "sales", width: 15 },
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
