'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface EmployeeReport {
  name: string;
  email: string;
  baseSalary: number;
  totalSales: number;
  commission: number;
  leaveDays: number;
  tiktokLeaveDays: number;
  shopeeLeaveDays: number;
  leaveDeduction: number;
  tiktokLeaveDeduction: number;
  shopeeLeaveDeduction: number;
  tax: number;
  netPay: number;
  period: string;
}

interface SalaryReportModalProps {
  show: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
}

export default function SalaryReportModal({ show, onClose, startDate, endDate }: SalaryReportModalProps) {
  const [report, setReport] = useState<EmployeeReport[] | null>(null);
  const [period, setPeriod] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  if (!show) return null;

  const handleCalculate = async () => {
    if (!startDate || !endDate) {
      toast.error('กรุณาเลือกช่วงวันที่ก่อน');
      return;
    }

    setIsFetching(true);
    setReport(null);
    try {
      const res = await fetch(`/api/salary/calculate?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        setPeriod(data.period);
        toast.success('คำนวณเงินเดือนเสร็จสิ้น');
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการคำนวณ');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsFetching(false);
    }
  };

  const handleDownloadFile = () => {
    if (!report || !period) return;

    let content = `📋 สรุปเงินเดือน\n📅 ช่วง: ${period}\n${'─'.repeat(20)}\n`;

    for (const r of report) {
      content += `\n👤 ${r.name}\n`;
      content += `💰 เงินเดือนพื้นฐาน: ฿${r.baseSalary.toLocaleString()}\n`;
      content += `📊 ยอดขายรวม: ฿${r.totalSales.toLocaleString()}\n`;
      content += `💎 ค่าคอมมิชชั่น: +฿${r.commission.toLocaleString()}\n`;
      if (r.leaveDays > 0) {
        content += `🏥 หักลารวม: ${r.leaveDays} ครั้ง (-฿${r.leaveDeduction.toLocaleString()})\n`;
        if (r.tiktokLeaveDays > 0) {
          content += `   ↳ TikTok: ${r.tiktokLeaveDays} ครั้ง (-฿${r.tiktokLeaveDeduction.toLocaleString()})\n`;
        }
        if (r.shopeeLeaveDays > 0) {
          content += `   ↳ Shopee: ${r.shopeeLeaveDays} ครั้ง (-฿${r.shopeeLeaveDeduction.toLocaleString()})\n`;
        }
      }
      content += `📝 หัก 3%: -฿${r.tax.toLocaleString()}\n`;
      content += `✅ รับสุทธิ: ฿${r.netPay.toLocaleString()}\n`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary_report_${period.replace(/ /g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('ดาวน์โหลดไฟล์สำเร็จ');
  };

  const handleClose = () => {
    setReport(null);
    setPeriod('');
    onClose();
  };

  const totalNetPay = report ? report.reduce((sum, r) => sum + r.netPay, 0) : 0;

  // คำนวณจำนวนวันที่เลือก
  const selectedDays = startDate && endDate
    ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-[#c3a2ab] to-[#a07882] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="material-symbols-outlined text-2xl">calculate</span>
          </div>
          <h2 className="text-xl font-bold text-[#161314]">คำนวณเงินเดือน</h2>
          <p className="text-gray-400 text-xs mt-1">
            ช่วงวันที่: {startDate || '...'} ถึง {endDate || '...'}
          </p>

          {/* จำนวนวันที่เลือก - แสดงตัวโตๆ */}
          {selectedDays > 0 && (
            <div className="mt-4 bg-gradient-to-br from-[#f9f5f6] to-white border-2 border-[#e0cfd3] rounded-2xl py-4 px-6 inline-flex flex-col items-center gap-1 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c3a2ab]">จำนวนวันที่เลือก</span>
              <div className="flex items-end gap-2">
                <span
                  className="text-6xl font-black text-[#161314] leading-none"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {selectedDays}
                </span>
                <span className="text-lg font-bold text-gray-400 mb-1">วัน</span>
              </div>
            </div>
          )}
        </div>

        {/* Calculate Button */}
        {!report && (
          <button
            onClick={handleCalculate}
            disabled={isFetching || !startDate || !endDate}
            className="w-full py-4 bg-gradient-to-r from-[#161314] to-[#2a2526] text-white rounded-2xl font-bold hover:opacity-90 transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isFetching ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                กำลังคำนวณ...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">play_arrow</span>
                คำนวณเงินเดือน
              </>
            )}
          </button>
        )}

        {/* Report Results */}
        {report && report.length > 0 && (
          <div className="space-y-4 mt-2">
            {report.map((r, idx) => (
              <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#c3a2ab] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#161314] text-sm">{r.name}</p>
                    <p className="text-[10px] text-gray-400">{r.email}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">💰 เงินเดือนพื้นฐาน</span>
                    <span className="font-bold text-[#161314]">฿{r.baseSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">📊 ยอดขายรวม</span>
                    <span className="font-bold text-[#161314]">฿{r.totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">💎 ค่าคอมมิชชั่น</span>
                    <span className="font-bold text-emerald-600">+฿{r.commission.toLocaleString()}</span>
                  </div>

                  {/* Leave breakdown */}
                  {r.leaveDays > 0 && (
                    <div className="bg-red-50/60 rounded-xl p-2.5 space-y-1 border border-red-100/60">
                      {/* Summary row */}
                      <div className="flex justify-between items-center">
                        <span className="text-red-600 font-bold">🏥 หักลารวม ({r.leaveDays} ครั้ง)</span>
                        <span className="font-bold text-red-600">-฿{r.leaveDeduction.toLocaleString()}</span>
                      </div>
                      {/* TikTok breakdown */}
                      {r.tiktokLeaveDays > 0 && (
                        <div className="flex justify-between items-center pl-3 text-[10px]">
                          <span className="text-gray-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c3a2ab] inline-block" />
                            TikTok · {r.tiktokLeaveDays} ครั้ง
                          </span>
                          <span className="text-red-400 font-bold">-฿{r.tiktokLeaveDeduction.toLocaleString()}</span>
                        </div>
                      )}
                      {/* Shopee breakdown */}
                      {r.shopeeLeaveDays > 0 && (
                        <div className="flex justify-between items-center pl-3 text-[10px]">
                          <span className="text-gray-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
                            Shopee · {r.shopeeLeaveDays} ครั้ง
                          </span>
                          <span className="text-red-400 font-bold">-฿{r.shopeeLeaveDeduction.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500">📝 หัก 3%</span>
                    <span className="font-bold text-red-500">-฿{r.tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                    <span className="font-bold text-[#161314]">✅ รับสุทธิ</span>
                    <span className="font-black text-lg text-[#161314]">฿{r.netPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Total Summary */}
            <div className="bg-[#161314] text-white rounded-2xl p-4 flex justify-between items-center">
              <span className="font-bold text-sm">รวมทั้งหมด ({report.length} คน)</span>
              <span className="font-black text-xl">฿{totalNetPay.toLocaleString()}</span>
            </div>

            {/* Download File Button */}
            <button
              onClick={handleDownloadFile}
              className="w-full py-3.5 bg-[#0066ff] text-white rounded-2xl font-bold hover:bg-[#0055dd] transition-all flex justify-center items-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              ดาวน์โหลดสลิปเงินเดือน (.txt)
            </button>
          </div>
        )}

        {/* No data found */}
        {report && report.length === 0 && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">search_off</span>
            <p className="text-gray-400 font-medium">ไม่พบข้อมูลพนักงานในช่วงวันที่ที่เลือก</p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full mt-4 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}
