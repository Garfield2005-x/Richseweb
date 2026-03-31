import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

// ─── Colour Palette ──────────────────────────────────────────────────────────
const C = {
  brandDark: "1E1826", // deep plum header
  brandPink: "C3A2AB", // Richse rose
  brandPinkSoft: "F3ECEF",
  accent: "A07882", // deeper rose
  white: "FFFFFF",
  offWhite: "FAFAFA",
  rowAlt: "FDF7F9", // very soft pink for alternating rows
  border: "EDE8EA",
  textDark: "1E1826",
  textMid: "6B5B63",
  textLight: "B0A0A8",

  // Status badge combos
  st: {
    NEW: { bg: "FEF9C3", fg: "78350F" },
    CONTACTED: { bg: "DBEAFE", fg: "1E3A8A" },
    SUCCESS: { bg: "DCFCE7", fg: "14532D" },
    CANCELLED: { bg: "FFE4E6", fg: "881337" },
  },
};

const FONT_BASE = "Calibri";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fill = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const color = (argb) => ({ argb });
const thinBorder = (argb = C.border) => ({
  top: { style: "thin", color: color(argb) },
  bottom: { style: "thin", color: color(argb) },
  left: { style: "thin", color: color(argb) },
  right: { style: "thin", color: color(argb) },
});
const hairBorder = (argb = C.border) => ({
  top: { style: "hair", color: color(argb) },
  bottom: { style: "hair", color: color(argb) },
  left: { style: "hair", color: color(argb) },
  right: { style: "hair", color: color(argb) },
});

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const leads = await prisma.campanetForm.findMany({
      orderBy: { createdAt: "desc" },
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "Richse Official";
    wb.company = "Richse Official";
    wb.created = new Date();
    wb.modified = new Date();

    const ws = wb.addWorksheet("CRM Leads", {
      pageSetup: {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
      },
      headerFooter: {
        oddHeader: "&C&\"Calibri,Bold\"&14RICHSE OFFICIAL — Campanet CRM",
        oddFooter: "&L&\"Calibri\"&9Confidential — Internal Use Only&R&\"Calibri\"&9Page &P of &N",
      },
      views: [{ state: "frozen", ySplit: 5 }], // freeze rows above data
    });



    // ═══════════════════════════════════════════════════════════════
    //  ROW 1 — Brand bar (full width, dark plum)
    // ═══════════════════════════════════════════════════════════════
    ws.mergeCells("A1:G1");
    const r1 = ws.getRow(1);
    r1.height = 48;
    const brandCell = ws.getCell("A1");
    brandCell.value = "RICHSE OFFICIAL";
    brandCell.font = { name: FONT_BASE, size: 20, bold: true, color: color(C.white), charset: 1 };
    brandCell.fill = fill(C.brandDark);
    brandCell.alignment = { horizontal: "center", vertical: "middle", indent: 0 };

    // ═══════════════════════════════════════════════════════════════
    //  ROW 2 — Sub-title bar (Richse rose)
    // ═══════════════════════════════════════════════════════════════
    ws.mergeCells("A2:G2");
    const r2 = ws.getRow(2);
    r2.height = 22;
    const subtitleCell = ws.getCell("A2");
    subtitleCell.value = "Richse Campaign CRM · Lead Management Report";
    subtitleCell.font = { name: FONT_BASE, size: 10, italic: true, color: color("F3ECEF") };
    subtitleCell.fill = fill(C.brandPink);
    subtitleCell.alignment = { horizontal: "center", vertical: "middle" };

    // ═══════════════════════════════════════════════════════════════
    //  ROW 3 — Summary stats strip
    // ═══════════════════════════════════════════════════════════════
    const total = leads.length;
    const nNew = leads.filter(l => l.status === "NEW").length;
    const nContact = leads.filter(l => l.status === "CONTACTED").length;
    const nSuccess = leads.filter(l => l.status === "SUCCESS").length;
    const nCancel = leads.filter(l => l.status === "CANCELLED").length;
    const rate = total > 0 ? ((nSuccess / total) * 100).toFixed(1) : "0.0";

    const summaryPairs = [
      ["A3:B3", `📋  Total Leads: ${total}`, C.brandDark, C.offWhite],
      ["C3:C3", `🟡  ใหม่: ${nNew}`, "78350F", C.st.NEW.bg],
      ["D3:D3", `🔵  ติดต่อแล้ว: ${nContact}`, "1E3A8A", C.st.CONTACTED.bg],
      ["E3:E3", `🟢  สำเร็จ: ${nSuccess}`, "14532D", C.st.SUCCESS.bg],
      ["F3:F3", `🔴  ยกเลิก: ${nCancel}`, "881337", C.st.CANCELLED.bg],
      ["G3:G3", `📈  Conversion: ${rate}%`, C.accent, C.brandPinkSoft],
    ];

    ws.getRow(3).height = 28;
    summaryPairs.forEach(([range, val, fg, bg]) => {
      ws.mergeCells(range);
      const cell = ws.getCell(range.split(":")[0]);
      cell.value = val;
      cell.font = { name: FONT_BASE, size: 10, bold: true, color: color(fg) };
      cell.fill = fill(bg);
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = thinBorder(C.white);
    });

    // ═══════════════════════════════════════════════════════════════
    //  ROW 4 — Spacer
    // ═══════════════════════════════════════════════════════════════
    ws.getRow(4).height = 6;
    ws.mergeCells("A4:G4");
    ws.getCell("A4").fill = fill(C.brandPinkSoft);

    // ═══════════════════════════════════════════════════════════════
    //  ROW 5 — Column headers
    // ═══════════════════════════════════════════════════════════════
    const HEADERS = [
      { key: "date", label: "วันที่", width: 14, align: "center" },
      { key: "time", label: "เวลา", width: 10, align: "center" },
      { key: "name", label: "ชื่อ-นามสกุล", width: 22, align: "left" },
      { key: "phone", label: "เบอร์โทรศัพท์", width: 18, align: "center" },
      { key: "ref", label: "หมายเลขอ้างอิง", width: 20, align: "center" },
      { key: "status", label: "สถานะ", width: 14, align: "center" },
      { key: "notes", label: "หมายเหตุ", width: 36, align: "left" },
    ];

    ws.columns = HEADERS.map(h => ({ key: h.key, width: h.width }));

    const hdrRow = ws.getRow(5);
    hdrRow.height = 32;
    HEADERS.forEach((h, i) => {
      const cell = hdrRow.getCell(i + 1);
      cell.value = h.label;
      cell.font = { name: FONT_BASE, size: 11, bold: true, color: color(C.white) };
      cell.fill = fill(C.accent);
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: false };
      cell.border = thinBorder(C.brandPinkSoft);
    });

    // ═══════════════════════════════════════════════════════════════
    //  DATA ROWS (starting row 6)
    // ═══════════════════════════════════════════════════════════════
    leads.forEach((lead, idx) => {
      const d = new Date(lead.createdAt);
      const dateStr = d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
      const timeStr = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
      const st = C.st[lead.status] ?? { bg: "F3F4F6", fg: C.textMid };
      const stTH = { NEW: "ใหม่", CONTACTED: "ติดต่อแล้ว", SUCCESS: "สำเร็จ", CANCELLED: "ยกเลิก" };
      const rowBg = idx % 2 === 0 ? C.white : C.rowAlt;

      const row = ws.addRow({
        date: dateStr,
        time: timeStr,
        name: lead.name || "—",
        phone: lead.phone || "—",
        ref: lead.order || "—",
        status: stTH[lead.status] || lead.status,
        notes: lead.notes || "",
      });
      row.height = 24;

      row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
        const hdr = HEADERS[colIdx - 1];
        // Status column — badge colours
        if (colIdx === 6) {
          cell.font = { name: FONT_BASE, size: 10, bold: true, color: color(st.fg) };
          cell.fill = fill(st.bg);
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else {
          cell.font = { name: FONT_BASE, size: 11, color: color(C.textDark) };
          cell.fill = fill(rowBg);
          cell.alignment = { horizontal: hdr?.align ?? "left", vertical: "middle", wrapText: colIdx === 7 };
        }
        cell.border = hairBorder();
      });
    });

    // ═══════════════════════════════════════════════════════════════
    //  FOOTER ROW
    // ═══════════════════════════════════════════════════════════════
    const spacer = ws.addRow([]);
    ws.mergeCells(`A${spacer.number}:G${spacer.number}`);
    spacer.getCell(1).fill = fill(C.brandPinkSoft);
    spacer.height = 6;

    const footerRow = ws.addRow([]);
    ws.mergeCells(`A${footerRow.number}:G${footerRow.number}`);
    const footerCell = footerRow.getCell(1);
    footerCell.value = `Generated by Richse Data System · ${new Date().toLocaleString("th-TH")} · Total ${total} records · Confidential`;
    footerCell.font = { name: FONT_BASE, size: 9, italic: true, color: color(C.textLight) };
    footerCell.fill = fill(C.brandDark);
    footerCell.alignment = { horizontal: "center", vertical: "middle" };
    footerRow.height = 22;

    // ═══════════════════════════════════════════════════════════════
    //  Auto-fit widths (clamp 12–52)
    // ═══════════════════════════════════════════════════════════════
    ws.columns.forEach((col, i) => {
      let max = HEADERS[i]?.width ?? 12;
      col.eachCell({ includeEmpty: false }, (cell) => {
        const len = cell.value ? String(cell.value).replace(/[^\x00-\x7F]/g, "xx").length : 0;
        if (len > max) max = len;
      });
      col.width = Math.min(Math.max(max + 2, 12), 52);
    });

    // ═══════════════════════════════════════════════════════════════
    //  Stream buffer → browser
    // ═══════════════════════════════════════════════════════════════
    const buffer = await wb.xlsx.writeBuffer();
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const filename = `Richse_CRM_${stamp}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Excel export error:", err);
    return NextResponse.json({ error: "Export failed", detail: String(err) }, { status: 500 });
  }
}
