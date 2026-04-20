import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

// ─── Colour Palette (Consistent with Brand System) ──────────────────────────
const C = {
  brandDark: "1E1826",
  brandPink: "C3A2AB",
  brandPinkSoft: "F3ECEF",
  accent: "A07882",
  white: "FFFFFF",
  offWhite: "FAFAFA",
  rowAlt: "FDF7F9",
  border: "EDE8EA",
  textDark: "1E1826",
  textMid: "6B5B63",
  textLight: "B0A0A8",

  // Status Colors
  st: {
    pending: { bg: "FEF9C3", fg: "78350F" },
    approved: { bg: "DCFCE7", fg: "14532D" },
    rejected: { bg: "FFE4E6", fg: "881337" },
  },
};

const FONT_BASE = "Calibri";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fill = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const color = (argb) => ({ argb });
const hairBorder = (argb = C.border) => ({
  top: { style: "hair", color: color(argb) },
  bottom: { style: "hair", color: color(argb) },
  left: { style: "hair", color: color(argb) },
  right: { style: "hair", color: color(argb) },
});

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const clips = await prisma.affiliateClip.findMany({
      orderBy: { created_at: "desc" },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "Richse Official";
    wb.company = "Richse Official";
    wb.created = new Date();
    wb.modified = new Date();

    // ─── DATA PROCESSING ──────────────────────────────────────────────────────
    const clipsByChannel = clips.reduce((acc, clip) => {
      if (!acc[clip.channel_name]) acc[clip.channel_name] = [];
      acc[clip.channel_name].push(clip);
      return acc;
    }, {});

    const sortedChannels = Object.keys(clipsByChannel).sort();

    // ─── SHEET 1: OVERVIEW ────────────────────────────────────────────────────
    const wsSummary = wb.addWorksheet("Overview", {
      views: [{ state: "frozen", ySplit: 5 }],
    });

    // Brand and Title (Summary)
    wsSummary.mergeCells("A1:E1");
    wsSummary.getRow(1).height = 40;
    const brandSummary = wsSummary.getCell("A1");
    brandSummary.value = "RICHSE OFFICIAL — Affiliate Overview";
    brandSummary.font = { name: FONT_BASE, size: 16, bold: true, color: color(C.white) };
    brandSummary.fill = fill(C.brandDark);
    brandSummary.alignment = { horizontal: "center", vertical: "middle" };

    wsSummary.mergeCells("A2:E2");
    wsSummary.getRow(2).height = 20;
    const dateSummary = wsSummary.getCell("A2");
    dateSummary.value = `Exported on: ${new Date().toLocaleString("th-TH")}`;
    dateSummary.font = { name: FONT_BASE, size: 9, italic: true, color: color("E3DCE0") };
    dateSummary.fill = fill(C.brandPink);
    dateSummary.alignment = { horizontal: "center", vertical: "middle" };

    // Summary Headers
    const SUM_HEADERS = [
      { label: "Channel Name", width: 30 },
      { label: "Total Clips", width: 15 },
      { label: "Approved", width: 15 },
      { label: "Pending", width: 15 },
      { label: "Rejected", width: 15 },
    ];
    wsSummary.getRow(4).height = 25;
    SUM_HEADERS.forEach((h, i) => {
      const cell = wsSummary.getCell(4, i + 1);
      cell.value = h.label;
      cell.font = { name: FONT_BASE, size: 10, bold: true, color: color(C.white) };
      cell.fill = fill(C.accent);
      cell.alignment = { horizontal: "center", vertical: "middle" };
      wsSummary.getColumn(i + 1).width = h.width;
    });

    // Summary Data
    sortedChannels.forEach((name, idx) => {
      const channelClips = clipsByChannel[name];
      const row = wsSummary.addRow([
        name,
        channelClips.length,
        channelClips.filter(c => c.status === "approved").length,
        channelClips.filter(c => c.status === "pending").length,
        channelClips.filter(c => c.status === "rejected").length,
      ]);
      const rowBg = idx % 2 === 0 ? C.white : C.rowAlt;
      row.eachCell((cell) => {
        cell.fill = fill(rowBg);
        cell.border = hairBorder();
        cell.font = { name: FONT_BASE, size: 10 };
      });
    });

    // ─── PER-CHANNEL SHEETS ───────────────────────────────────────────────────
    const sanitize = (s) => s.replace(/[\\\/\?\*\[\]\:]/g, "").substring(0, 31) || "Channel";

    sortedChannels.forEach((channelName) => {
      const channelClips = clipsByChannel[channelName];
      const ws = wb.addWorksheet(sanitize(channelName), {
        views: [{ state: "frozen", ySplit: 5 }],
      });

      // Headers (Same as before but localized to this channel)
      ws.mergeCells("A1:F1");
      ws.getRow(1).height = 36;
      const chTitle = ws.getCell("A1");
      chTitle.value = `Channel: ${channelName}`;
      chTitle.font = { name: FONT_BASE, size: 14, bold: true, color: color(C.white) };
      chTitle.fill = fill(C.brandDark);
      chTitle.alignment = { horizontal: "center", vertical: "middle" };

      ws.mergeCells("A2:F2");
      ws.getRow(2).height = 18;
      const chStats = ws.getCell("A2");
      const nApp = channelClips.filter(c => c.status === "approved").length;
      chStats.value = `Total Clips: ${channelClips.length} | Approved: ${nApp} | Pending: ${channelClips.length - nApp}`;
      chStats.font = { name: FONT_BASE, size: 9, color: color(C.white) };
      chStats.fill = fill(C.brandPink);
      chStats.alignment = { horizontal: "center", vertical: "middle" };

      const HEADERS = [
        { key: "date", label: "วันที่/เวลา", width: 18, align: "center" },
        { key: "clip_url", label: "ลิงก์คลิป", width: 45, align: "left" },
        { key: "affiliate_url", label: "โค้ดเจน", width: 20, align: "center" },
        { key: "status", label: "สถานะ", width: 14, align: "center" },
        { key: "id", label: "ID", width: 12, align: "center" },
      ];
      ws.columns = HEADERS.map(h => ({ key: h.key, width: h.width }));

      const hdrRow = ws.getRow(5);
      hdrRow.height = 28;
      HEADERS.forEach((h, i) => {
        const cell = hdrRow.getCell(i + 1);
        cell.value = h.label;
        cell.font = { name: FONT_BASE, size: 10, bold: true, color: color(C.white) };
        cell.fill = fill(C.accent);
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });

      channelClips.forEach((clip, idx) => {
        const d = new Date(clip.created_at);
        const dateStr = d.toLocaleString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
        const st = C.st[clip.status] ?? { bg: "F3F4F6", fg: C.textMid };
        const stTH = { pending: "รอดำเนินการ", approved: "อนุมัติแล้ว", rejected: "ปฏิเสธ" };
        const rowBg = idx % 2 === 0 ? C.white : C.rowAlt;

        const row = ws.addRow({
          date: dateStr,
          clip_url: clip.clip_url,
          affiliate_url: clip.affiliate_url,
          status: stTH[clip.status] || clip.status,
          id: clip.id.substring(0, 8),
        });
        row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
          if (colIdx === 4) {
            cell.font = { name: FONT_BASE, size: 9, bold: true, color: color(st.fg) };
            cell.fill = fill(st.bg);
          } else {
            cell.font = { name: FONT_BASE, size: 10, color: color(C.textDark) };
            cell.fill = fill(rowBg);
          }
          cell.alignment = { horizontal: HEADERS[colIdx - 1]?.align ?? "left", vertical: "middle" };
          cell.border = hairBorder();
        });
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const filename = `Richse_Affiliate_${stamp}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Affiliate export error:", err);
    return NextResponse.json({ error: "Export failed", detail: String(err) }, { status: 500 });
  }
}
