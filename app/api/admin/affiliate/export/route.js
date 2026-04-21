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
      include: { campaign: true }
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

    const clipsByCampaign = clips.reduce((acc, clip) => {
      const key = clip.campaign?.name || "General/Unassigned";
      if (!acc[key]) acc[key] = { clips: [], campaign: clip.campaign };
      acc[key].clips.push(clip);
      return acc;
    }, {});

    const sortedChannels = Object.keys(clipsByChannel).sort();
    const sortedCampaigns = Object.keys(clipsByCampaign).sort((a, b) => {
      if (a === "General/Unassigned") return 1;
      if (b === "General/Unassigned") return -1;
      return a.localeCompare(b);
    });

    // ─── SHEET 1: OVERVIEW ────────────────────────────────────────────────────
    const wsSummary = wb.addWorksheet("Overview", {
      views: [{ state: "frozen", ySplit: 5 }],
    });

    // Brand and Title (Summary)
    wsSummary.mergeCells("A1:G1");
    wsSummary.getRow(1).height = 40;
    const brandSummary = wsSummary.getCell("A1");
    brandSummary.value = "RICHSE OFFICIAL — System-Wide Affiliate Insights";
    brandSummary.font = { name: FONT_BASE, size: 16, bold: true, color: color(C.white) };
    brandSummary.fill = fill(C.brandDark);
    brandSummary.alignment = { horizontal: "center", vertical: "middle" };

    wsSummary.mergeCells("A2:G2");
    wsSummary.getRow(2).height = 20;
    const dateSummary = wsSummary.getCell("A2");
    dateSummary.value = `Full Platform Export • Produced on: ${new Date().toLocaleString("th-TH")}`;
    dateSummary.font = { name: FONT_BASE, size: 9, italic: true, color: color("E3DCE0") };
    dateSummary.fill = fill(C.brandPink);
    dateSummary.alignment = { horizontal: "center", vertical: "middle" };

    // SECTION 1: CHANNEL LEADERBOARD
    wsSummary.getCell("A4").value = "SECTION 1: CREATOR LEADERBOARD (CHANNEL SUMMARY)";
    wsSummary.getCell("A4").font = { name: FONT_BASE, size: 11, bold: true, color: color(C.accent) };
    
    const CH_HEADERS = [
      { label: "Creator Channel", width: 30 },
      { label: "Lifetime Clips", width: 15 },
      { label: "Total Approved", width: 15 },
      { label: "Total Pending", width: 15 },
      { label: "Campaigns Joined", width: 25 },
    ];
    
    wsSummary.getRow(5).height = 25;
    CH_HEADERS.forEach((h, i) => {
      const cell = wsSummary.getCell(5, i + 1);
      cell.value = h.label;
      cell.font = { name: FONT_BASE, size: 10, bold: true, color: color(C.white) };
      cell.fill = fill(C.accent);
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    let currentCursor = 6;
    sortedChannels.forEach((name, idx) => {
      const channelClips = clipsByChannel[name];
      const campaigns = [...new Set(channelClips.filter(c => c.campaign).map(c => c.campaign.name))].join(", ");
      const row = wsSummary.addRow([
        name,
        channelClips.length,
        channelClips.filter(c => c.status === "approved").length,
        channelClips.filter(c => c.status === "pending").length,
        campaigns || "-",
      ]);
      const rowBg = idx % 2 === 0 ? C.white : C.rowAlt;
      row.eachCell((cell) => {
        cell.fill = fill(rowBg);
        cell.border = hairBorder();
        cell.font = { name: FONT_BASE, size: 10 };
      });
      currentCursor++;
    });

    // SECTION 2: CAMPAIGN CATEGORY SUMMARY
    currentCursor += 2;
    wsSummary.getCell(`A${currentCursor}`).value = "SECTION 2: CAMPAIGN CATEGORY PERFORMANCE (DETAILED)";
    wsSummary.getCell(`A${currentCursor}`).font = { name: FONT_BASE, size: 11, bold: true, color: color(C.accent) };
    currentCursor++;
    
    const CP_HEADERS = [
      { label: "Campaign / Category Name", width: 35 },
      { label: "Product Assigned", width: 25 },
      { label: "Total Submissions", width: 18 },
      { label: "Approved Clips", width: 18 },
      { label: "Unique Participants", width: 18 },
    ];
    
    wsSummary.getRow(currentCursor).height = 25;
    CP_HEADERS.forEach((h, i) => {
      const cell = wsSummary.getCell(currentCursor, i + 1);
      cell.value = h.label;
      cell.font = { name: FONT_BASE, size: 10, bold: true, color: color(C.white) };
      cell.fill = fill(C.brandPink);
      cell.alignment = { horizontal: "center", vertical: "middle" };
      wsSummary.getColumn(i + 1).width = h.width;
    });
    
    currentCursor++;
    sortedCampaigns.forEach((campName, idx) => {
      const data = clipsByCampaign[campName];
      const uniqueCreators = new Set(data.clips.map(c => c.channel_name)).size;
      const row = wsSummary.addRow([
        campName,
        data.campaign?.product_name || "-",
        data.clips.length,
        data.clips.filter(c => c.status === "approved").length,
        uniqueCreators,
      ]);
      const rowBg = idx % 2 === 0 ? C.white : C.rowAlt;
      row.eachCell((cell) => {
        cell.fill = fill(rowBg);
        cell.border = hairBorder();
        cell.font = { name: FONT_BASE, size: 10 };
      });
      currentCursor++;
    });

    // ─── CATEGORY SHEETS (BY CAMPAIGN) ────────────────────────────────────────
    const sanitize = (s) => s.replace(/[\\\/\?\*\[\]\:]/g, "").substring(0, 31) || "Category";

    sortedCampaigns.forEach((campName) => {
      const data = clipsByCampaign[campName];
      const sheetName = campName === "General/Unassigned" ? "GENERAL" : `CAT_${sanitize(campName)}`;
      const ws = wb.addWorksheet(sheetName, {
        views: [{ state: "frozen", ySplit: 5 }],
      });

      ws.mergeCells("A1:G1");
      ws.getRow(1).height = 36;
      const cpTitle = ws.getCell("A1");
      cpTitle.value = `Category: ${campName}`;
      cpTitle.font = { name: FONT_BASE, size: 14, bold: true, color: color(C.white) };
      cpTitle.fill = fill(C.brandDark);
      cpTitle.alignment = { horizontal: "center", vertical: "middle" };

      ws.mergeCells("A2:G2");
      ws.getRow(2).height = 24;
      const cpSub = ws.getCell("A2");
      cpSub.value = `Product: ${data.campaign?.product_name || "General"} | Total Clips: ${data.clips.length} | Unique Creators: ${new Set(data.clips.map(c => c.channel_name)).size}`;
      cpSub.font = { name: FONT_BASE, size: 10, color: color(C.white) };
      cpSub.fill = fill(C.brandPink);
      cpSub.alignment = { horizontal: "center", vertical: "middle" };

      const HEADERS = [
        { key: "date", label: "วันที่/เวลา", width: 18, align: "center" },
        { key: "creator", label: "ผู้ส่ง (Creator)", width: 25, align: "left" },
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

      data.clips.forEach((clip, idx) => {
        const d = new Date(clip.created_at);
        const dateStr = d.toLocaleString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
        const st = C.st[clip.status] ?? { bg: "F3F4F6", fg: C.textMid };
        const stTH = { pending: "รอดำเนินการ", approved: "อนุมัติแล้ว", rejected: "ปฏิเสธ" };
        const rowBg = idx % 2 === 0 ? C.white : C.rowAlt;

        const row = ws.addRow({
          date: dateStr,
          creator: clip.channel_name,
          clip_url: clip.clip_url,
          affiliate_url: clip.affiliate_url,
          status: stTH[clip.status] || clip.status,
          id: clip.id.substring(0, 8),
        });
        row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
          if (colIdx === 5) {
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

    // ─── PER-CHANNEL SHEETS ───────────────────────────────────────────────────
    sortedChannels.forEach((channelName) => {
      const channelClips = clipsByChannel[channelName];
      const ws = wb.addWorksheet(`USER_${sanitize(channelName)}`, {
        views: [{ state: "frozen", ySplit: 5 }],
      });

      ws.mergeCells("A1:G1");
      ws.getRow(1).height = 36;
      const chTitle = ws.getCell("A1");
      chTitle.value = `Creator Log: ${channelName}`;
      chTitle.font = { name: FONT_BASE, size: 14, bold: true, color: color(C.white) };
      chTitle.fill = fill(C.brandDark);
      chTitle.alignment = { horizontal: "center", vertical: "middle" };

      ws.mergeCells("A2:G2");
      ws.getRow(2).height = 18;
      const chStats = ws.getCell("A2");
      const nApp = channelClips.filter(c => c.status === "approved").length;
      chStats.value = `Total Clips: ${channelClips.length} | Approved: ${nApp} | Campaigns Participated: ${new Set(channelClips.map(c => c.campaign_id)).size}`;
      chStats.font = { name: FONT_BASE, size: 9, color: color(C.white) };
      chStats.fill = fill(C.brandPink);
      chStats.alignment = { horizontal: "center", vertical: "middle" };

      const HEADERS = [
        { key: "date", label: "วันที่/เวลา", width: 18, align: "center" },
        { key: "campaign", label: "แคมเปญ (Category)", width: 20, align: "left" },
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
          campaign: clip.campaign?.name || "-",
          clip_url: clip.clip_url,
          affiliate_url: clip.affiliate_url,
          status: stTH[clip.status] || clip.status,
          id: clip.id.substring(0, 8),
        });
        row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
          if (colIdx === 5) {
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
