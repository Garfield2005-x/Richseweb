'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { updateLeaveStatus, updateTicketStatus, deleteLeaveRequest, updateBaseSalary, updateBaseSalaryShopee } from '@/app/actions/portal';
import { deleteLiveSession, getAdminLiveSessions } from '@/app/actions/live';
import { toast } from 'react-hot-toast';
import SalaryReportModal from '@/app/components/SalaryReportModal';

interface AdminLiveTrackingProps {
  initialOngoing: ExtendedSession[];
  initialCompleted: ExtendedSession[];
  initialLeaves: unknown[];
  initialSchedules: unknown[];
  initialTickets: unknown[];
}

// Defining internal types to avoid 'any'
interface ExtendedSession {
  id: string;
  startTime: string | Date;
  endTime?: string | Date | null;
  platform: string;
  durationMin?: number | null;
  salesAmount?: number | null;
  salesImageUrl?: string | null;
  user: {
    name?: string | null;
    email: string | null;
    image?: string | null;
    baseSalary?: number | null;
    baseSalaryShopee?: number | null;
    commissionRate?: number | null;
    commissionRateShopee?: number | null;
  };
}

export default function AdminLiveTrackingClient({ 
  initialOngoing, 
  initialCompleted,
  initialLeaves,
  initialSchedules,
  initialTickets
}: AdminLiveTrackingProps) {
  const router = useRouter();
  const [ongoing] = useState(initialOngoing);
  const [completed, setCompleted] = useState(initialCompleted);
  const [leaves] = useState(initialLeaves);
  const [schedules] = useState(initialSchedules);
  const [tickets] = useState(initialTickets);
// ---------- EDIT‑TIME STATE ----------
const [editSessionId, setEditSessionId] = useState<string>('');
const [editStartTime, setEditStartTime] = useState<string>('');
const [editEndTime, setEditEndTime] = useState<string>('');
const [showEditModal, setShowEditModal] = useState(false);
// Date range filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showSalaryModal, setShowSalaryModal] = useState(false);

  const handleFilter = async (start: string, end: string) => {
    const loadingToast = toast.loading('กำลังโหลดข้อมูลช่วงเวลา...');
    const res = await getAdminLiveSessions(start, end);
    if (res.success && res.completed) {
      setCompleted(res.completed as unknown as ExtendedSession[]);
      toast.success('โหลดข้อมูลช่วงเวลาเรียบร้อยแล้ว', { id: loadingToast });
    } else {
      toast.error(res.error || 'ดึงข้อมูลไม่สำเร็จ', { id: loadingToast });
    }
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      handleFilter(start, end);
    }
  };

  const applyPreset = (preset: 'today' | '7days' | 'thisMonth' | 'clear') => {
    const today = new Date();
    const formatLocal = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    if (preset === 'today') {
      const dateStr = formatLocal(today);
      handleDateChange(dateStr, dateStr);
    } else if (preset === '7days') {
      const start = new Date();
      start.setDate(today.getDate() - 6);
      handleDateChange(formatLocal(start), formatLocal(today));
    } else if (preset === 'thisMonth') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      handleDateChange(formatLocal(start), formatLocal(end));
    } else if (preset === 'clear') {
      setStartDate('');
      setEndDate('');
      handleFilter('', '');
    }
  };
  
  const [activeTab, setActiveTab] = useState<'live' | 'timesheet' | 'schedule' | 'support'>('live');
  const [now, setNow] = useState(new Date());
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [selectedLeaveStaff, setSelectedLeaveStaff] = useState<string | null>(null);
  const [selectedLeaveMonth, setSelectedLeaveMonth] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getDuration = (startTime: string | Date) => {
    const diff = now.getTime() - new Date(startTime).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours}h ${mins}m`;
  };

  const getProxyUrl = (url: string | null | undefined) => {
    if (!url) return "";
    // If it's already a blob URL, wrap it in our proxy
    if (url.includes('vercel-storage.com')) {
      return `/api/images/live-receipt?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const userTimesheets = (completed as unknown as ExtendedSession[]).reduce((acc: Record<string, { 
    name: string; 
    email: string; 
    totalMins: number; 
    totalSales: number; 
    sessionsCount: number;
    baseSalary: number;
    baseSalaryShopee: number;
    commissionRate: number;
    commissionRateShopee: number;
    platforms: Record<string, { mins: number; sales: number; count: number }>
  }>, curr) => {
    const email = curr.user.email || 'unknown';
    if (!acc[email]) {
      acc[email] = {
        name: curr.user.name || email,
        email: email,
        totalMins: 0,
        totalSales: 0,
        sessionsCount: 0,
        baseSalary: curr.user.baseSalary || 0,
        baseSalaryShopee: curr.user.baseSalaryShopee || 0,
        commissionRate: curr.user.commissionRate ?? 0.05,
        commissionRateShopee: curr.user.commissionRateShopee ?? 0.03,
        platforms: {}
      };
    }
    
    const plat = curr.platform;
    if (!acc[email].platforms[plat]) {
      acc[email].platforms[plat] = { mins: 0, sales: 0, count: 0 };
    }

    acc[email].totalMins += (curr.durationMin || 0);
    acc[email].totalSales += (curr.salesAmount || 0);
    acc[email].sessionsCount += 1;
    
    acc[email].platforms[plat].mins += (curr.durationMin || 0);
    acc[email].platforms[plat].sales += (curr.salesAmount || 0);
    acc[email].platforms[plat].count += 1;
    
    return acc;
  }, {});

  const timesheetArray = Object.values(userTimesheets).sort((a, b) => b.totalSales - a.totalSales);
  const handleDeleteSession = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการไลฟ์นี้? การลบจะไม่สามารถย้อนกลับได้')) return;
    
    const res = await deleteLiveSession(id);
    if (res.success) {
      toast.success('ลบประวัติการไลฟ์เรียบร้อยแล้ว');
      router.refresh();
    } else {
      toast.error(res.error || 'เกิดข้อผิดพลาดในการลบ');
    }
  };

  const [selectedLeavePlatforms, setSelectedLeavePlatforms] = useState<Record<string, string>>({});

  const handleUpdateLeave = async (id: string, status: string, platform?: string) => {
    const res = await updateLeaveStatus(id, status, platform);
    if (res.success) {
      toast.success('อัปเดตสถานะการลาสำเร็จ');
      router.refresh();
    } else {
      toast.error(res.error || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteLeave = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคำขอลานี้? การลบจะไม่สามารถย้อนกลับได้')) return;
    
    const loadingToast = toast.loading('กำลังลบข้อมูล...');
    const res = await deleteLeaveRequest(id);
    if (res.success) {
      toast.success('ลบคำขอลาสำเร็จ', { id: loadingToast });
      router.refresh();
    } else {
      toast.error(res.error || 'เกิดข้อผิดพลาดในการลบคำขอลา', { id: loadingToast });
    }
  };

  const handleUpdateSalary = async (email: string, amount: string) => {
    const num = Number(amount);
    if (isNaN(num)) return;
    
    const loadingToast = toast.loading('กำลังบันทึกเงินเดือน TikTok/อื่นๆ...');
    const res = await updateBaseSalary(email, num);
    if (res.success) {
      toast.success('บันทึกเงินเดือนสำเร็จ', { id: loadingToast });
      router.refresh();
    } else {
      toast.error('เกิดข้อผิดพลาด', { id: loadingToast });
    }
  };

  const handleUpdateSalaryShopee = async (email: string, amount: string) => {
    const num = Number(amount);
    if (isNaN(num)) return;
    
    const loadingToast = toast.loading('กำลังบันทึกเงินเดือน Shopee...');
    const res = await updateBaseSalaryShopee(email, num);
    if (res.success) {
      toast.success('บันทึกเงินเดือน Shopee สำเร็จ', { id: loadingToast });
      router.refresh();
    } else {
      toast.error('เกิดข้อผิดพลาด', { id: loadingToast });
    }
  };

  const handleUpdateTicket = async (id: string, status: string) => {
    const res = await updateTicketStatus(id, status);
    if (res.success) {
      toast.success('อัปเดตสถานะแจ้งปัญหาสำเร็จ');
      router.refresh();
    } else {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleExport = async () => {
    const loadingToast = toast.loading('กำลังจัดเตรียมไฟล์ Export...');
    try {
      let query = '';
      if (startDate && endDate) {
        query = `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(`/api/admin/live-tracking/export${query}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Richse_Live_Performance_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('ดาวน์โหลดไฟล์สรุปเวลาทำงานสำเร็จ', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาดในการ Export ข้อมูล', { id: loadingToast });
    }
  };

  // ---------- EDIT‑TIME HANDLERS ----------
const openEditTimeModal = (session: ExtendedSession) => {
  setEditSessionId(session.id);
  setEditStartTime(session.startTime ? format(new Date(session.startTime), "yyyy-MM-dd'T'HH:mm") : '');
  setEditEndTime(session.endTime ? format(new Date(session.endTime), "yyyy-MM-dd'T'HH:mm") : '');
  setShowEditModal(true);
};

const handleSaveTimeEdit = async () => {
  if (!editSessionId) return;
  const loading = toast.loading('กำลังบันทึกเวลา...');
  try {
    // Build payload with only non‑empty fields
    const payload: Record<string, string> = {};
    if (editStartTime) payload.startTime = editStartTime;
    if (editEndTime) payload.endTime = editEndTime;
    console.log('PATCH payload:', payload);

    const res = await fetch(`/api/admin/live-tracking/${editSessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      toast.success('บันทึกเวลาเรียบร้อย', { id: loading });
      router.refresh();
      setShowEditModal(false);
    } else {
      throw new Error(data.error || 'บันทึกล้มเหลว');
    }
  } catch (err) {
    console.error(err);
    toast.error('เกิดข้อผิดพลาดในการบันทึก', { id: loading });
  }
};

return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar bg-white rounded-t-[32px] px-4 pt-4">
        {[
          { id: 'live', label: 'Live Now', icon: 'videocam', count: ongoing.length },
          { id: 'timesheet', label: 'Timesheet & Comm', icon: 'payments', count: 0 },
          { id: 'schedule', label: 'Schedules & Leaves', icon: 'calendar_month', count: (leaves as { status: string }[]).filter((l) => l.status === 'PENDING').length },
          { id: 'support', label: 'Support Tickets', icon: 'support_agent', count: tickets.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'live' | 'timesheet' | 'schedule' | 'support')}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm tracking-widest uppercase transition-all whitespace-nowrap ${
              activeTab === tab.id 
              ? 'border-b-2 border-[#c3a2ab] text-[#c3a2ab]' 
              : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
            {tab.count > 0 && tab.id !== 'timesheet' && (
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.id ? 'bg-[#c3a2ab] text-white' : 'bg-gray-200 text-gray-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-b-[32px] p-6 md:p-8 shadow-sm border border-t-0 border-gray-100 min-h-[500px]">
        
        {/* 1. LIVE NOW TAB */}
        {activeTab === 'live' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
            {ongoing.length > 0 ? (
              (ongoing as unknown as ExtendedSession[]).map((session) => (
                <div key={session.id} className="bg-white p-6 rounded-[24px] border border-red-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-400 to-red-500 animate-pulse" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                        {session.user.name?.[0] || 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#161314]">{session.user.name || session.user.email}</h3>
                        <p className="text-xs text-gray-500">Started {format(new Date(session.startTime), 'HH:mm')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold tracking-wider uppercase animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      LIVE
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Platform</p>
                      <p className="font-bold text-[#c3a2ab]">{session.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                      <p className="font-black text-2xl text-[#161314]">{getDuration(session.startTime)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">videocam_off</span>
                <p className="text-gray-400 font-medium">ไม่มีพนักงานไลฟ์อยู่ในขณะนี้</p>
              </div>
            )}
          </div>
        )}

        {/* 2. TIMESHEET TAB */}
        {activeTab === 'timesheet' && (
          <div className="animate-in fade-in space-y-10">
            {/* Summary Table */}
            <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
              <div>
                <h3 className="font-bold text-xl text-[#161314]">สรุปเวลาทำงานและยอดขายพนักงานไลฟ์</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {startDate && endDate ? `แสดงข้อมูลระหว่างวันที่ ${format(new Date(startDate), 'dd/MM/yyyy')} ถึง ${format(new Date(endDate), 'dd/MM/yyyy')}` : 'แสดงข้อมูลย้อนหลัง 60 วัน (ภาพรวม)'}
                </p>
              </div>
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-[#161314] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#252122] transition-all self-start md:self-auto"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export
              </button>
            </div>

            {/* Calendar Date Selector Bar */}
            <div className="bg-[#f9f5f6] p-4 rounded-2xl border border-gray-100 flex flex-col gap-4 mb-8">
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">เริ่มวันที่ (Start Date)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange(e.target.value, endDate)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none font-bold text-gray-700 text-sm focus:ring-2 focus:ring-[#c3a2ab] focus:border-[#c3a2ab] transition-all shadow-sm"
                  />
                </div>
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">ถึงวันที่ (End Date)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange(startDate, e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none font-bold text-gray-700 text-sm focus:ring-2 focus:ring-[#c3a2ab] focus:border-[#c3a2ab] transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* แสดงจำนวนวันที่เลือก - ตัวโตๆ */}
              {startDate && endDate && (() => {
                const days = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-white to-[#f9f5f6] border border-[#e0cfd3] rounded-2xl py-3 px-5 shadow-sm flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#c3a2ab]">ช่วงที่เลือก</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-[#161314] leading-none tabular-nums">{days}</span>
                      <span className="text-base font-bold text-gray-400">วัน</span>
                    </div>
                    {days > 30 && (
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-3 py-1">
                        <span className="text-[10px]">⚠️</span>
                        <span className="text-[10px] font-black">เกิน 30 วัน — ฐานคำนวณยึดที่ 30 วัน</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex flex-wrap items-center gap-2 border-t border-gray-200/50 pt-3">
                <span className="text-xs font-bold text-gray-400 mr-2">เลือกช่วงเวลาด่วน:</span>
                <button
                  onClick={() => applyPreset('today')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  วันนี้
                </button>
                <button
                  onClick={() => applyPreset('7days')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  7 วันล่าสุด
                </button>
                <button
                  onClick={() => applyPreset('thisMonth')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  เดือนนี้
                </button>
                {(startDate || endDate) && (
                  <button
                    onClick={() => applyPreset('clear')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 ml-auto"
                  >
                    ล้างค่าการค้นหา
                  </button>
                )}
                
                {/* ปุ่มคำนวณเงินเดือน */}
                <button
                  onClick={() => setShowSalaryModal(true)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    !startDate || !endDate 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed ml-auto' 
                      : 'bg-[#161314] text-white hover:bg-[#2a2526] ml-auto'
                  }`}
                  disabled={!startDate || !endDate}
                >
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calculate</span>
                    คำนวณเงินเดือน
                  </span>
                </button>
              </div>
            </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest rounded-l-xl">Employee</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-center">Sessions</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-center">Total Hours</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-right">Base Salary (THB)</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-right">Total Sales (THB)</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-right rounded-r-xl">Est. Comm (5%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {timesheetArray.map((sheet, index: number) => {
                      const hours = Math.floor(sheet.totalMins / 60);
                      const mins = sheet.totalMins % 60;
                      const totalComm = Object.entries(sheet.platforms).reduce((acc, [pName, pStat]) => {
                        const rate = pName.toLowerCase() === 'shopee' 
                          ? sheet.commissionRateShopee 
                          : sheet.commissionRate;
                        return acc + (pStat.sales * rate);
                      }, 0);

                      return (
                        <tr key={index} className="hover:bg-gray-50/30 transition-colors border-b border-gray-50">
                          <td className="px-6 py-5">
                            <div className="font-bold text-[#161314]">{sheet.name || sheet.email}</div>
                            <div className="text-xs text-gray-500">{sheet.email}</div>
                            
                            {/* Platform Breakdown */}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {Object.entries(sheet.platforms).map(([pName, pStat]) => {
                                const rate = pName.toLowerCase() === 'shopee' 
                                  ? sheet.commissionRateShopee 
                                  : sheet.commissionRate;
                                return (
                                  <div key={pName} className="flex flex-col bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 min-w-[100px]">
                                    <div className="flex justify-between items-center mb-0.5">
                                      <span className="text-[9px] font-black text-[#c3a2ab] uppercase tracking-tighter">{pName}</span>
                                      <span className="text-[8px] font-bold text-gray-400">({(rate * 100).toFixed(0)}%)</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-4">
                                      <span className="text-[10px] font-bold text-gray-500">{Math.floor(pStat.mins / 60)}h {pStat.mins % 60}m</span>
                                      <span className="text-[10px] font-black text-gray-700">฿{pStat.sales.toLocaleString()}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center font-bold text-gray-600 align-top">
                            <div className="mt-1">{sheet.sessionsCount}</div>
                          </td>
                          <td className="px-6 py-5 text-center align-top">
                            <div className="mt-1">
                              <span className="bg-[#c3a2ab]/10 text-[#c3a2ab] px-3 py-1 rounded-full font-bold text-sm">
                                {hours}h {mins}m
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right align-top">
                            <div className="mt-1 flex flex-col gap-2 items-end">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-gray-400">TikTok:</span>
                                <input 
                                  type="number" 
                                  defaultValue={sheet.baseSalary}
                                  onBlur={(e) => {
                                    if (Number(e.target.value) !== sheet.baseSalary) {
                                      handleUpdateSalary(sheet.email, e.target.value);
                                    }
                                  }}
                                  className="w-20 text-right px-2 py-1 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#c3a2ab] text-xs font-bold text-gray-700 shadow-sm"
                                  placeholder="0"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-gray-400">Shopee:</span>
                                <input 
                                  type="number" 
                                  defaultValue={sheet.baseSalaryShopee}
                                  onBlur={(e) => {
                                    if (Number(e.target.value) !== sheet.baseSalaryShopee) {
                                      handleUpdateSalaryShopee(sheet.email, e.target.value);
                                    }
                                  }}
                                  className="w-20 text-right px-2 py-1 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#c3a2ab] text-xs font-bold text-gray-700 shadow-sm"
                                  placeholder="0"
                                />
                              </div>
                              <div className="text-[10px] font-black text-gray-500 border-t border-gray-100 pt-1 mt-1">
                                รวม: ฿{(sheet.baseSalary + sheet.baseSalaryShopee).toLocaleString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right font-black text-lg text-[#161314] align-top">
                            <div className="mt-1 font-mono">฿{sheet.totalSales.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-5 text-right font-bold text-emerald-600 align-top">
                            <div className="mt-1 font-mono">฿{totalComm.toLocaleString()}</div>
                          </td>
                        </tr>
                      );
                    })}
                    {timesheetArray.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">ไม่มีข้อมูลสรุปเวลาทำงาน</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Session Logs with Images */}
            <div>
              <h4 className="font-bold text-[12px] text-gray-400 uppercase tracking-widest mb-4">ประวัติเซสชันทั้งหมด</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest rounded-l-xl">Date</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Platform</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Duration</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Sales</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Receipt</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {completed.length > 0 ? (completed as unknown as ExtendedSession[]).map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-4 py-4 text-sm text-gray-500 font-medium">
                          {format(new Date(s.startTime), 'dd MMM yy HH:mm')}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-bold text-sm text-[#161314]">{s.user.name || s.user.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold uppercase">{s.platform}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-sm font-bold text-[#c3a2ab]">{s.durationMin || 0} m</span>
                        </td>
                        <td className="px-4 py-4 text-right font-black text-[#161314]">
                          ฿{(s.salesAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {s.salesImageUrl ? (
                            <button
                              onClick={() => setLightboxImg(s.salesImageUrl || null)}
                              className="group relative inline-block"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getProxyUrl(s.salesImageUrl)}
                                alt="Sales receipt"
                                className="w-10 h-10 object-cover rounded-xl border border-gray-200 group-hover:scale-110 group-hover:shadow-lg transition-all duration-200 cursor-zoom-in"
                              />
                              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all" />
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center flex gap-2 justify-center">
                          <button onClick={() => openEditTimeModal(s)} className="text-blue-500 hover:text-blue-700 transition-colors p-2" title="แก้ไขเวลา">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteSession(s.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-2"
                            title="ลบเซสชัน"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-gray-400 text-sm">ยังไม่มีเซสชันที่เสร็จสิ้น</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Edit Time Modal */}
            {showEditModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h3 className="font-bold mb-4">แก้ไขเวลาเซสชัน</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input type="datetime-local" value={editStartTime} onChange={e => setEditStartTime(e.target.value)} className="w-full border rounded px-3 py-2"/>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input type="datetime-local" value={editEndTime} onChange={e => setEditEndTime(e.target.value)} className="w-full border rounded px-3 py-2"/>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button onClick={handleSaveTimeEdit} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. SCHEDULES & LEAVES TAB */}
        {activeTab === 'schedule' && (
          <div className="space-y-12 animate-in fade-in">
            {/* Leaves Review */}
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#161314]">Leave Requests</h3>
                  <p className="text-sm text-gray-400 mt-0.5">คำขอลาทั้งหมดของพนักงาน</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"></span>
                  {leaves.filter((l) => (l as {status:string}).status === 'PENDING').length} รออนุมัติ
                </span>
              </div>

              {/* ── Month Tab Bar ── */}
              {(() => {
                type LeaveRow = { startDate: string };
                const monthSet = new Set<string>();
                (leaves as unknown as LeaveRow[]).forEach((lv) => {
                  const d = new Date(lv.startDate);
                  monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                });
                const months = Array.from(monthSet).sort((a, b) => b.localeCompare(a));
                if (months.length === 0) return null;
                const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
                return (
                  <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                    <button
                      onClick={() => { setSelectedLeaveMonth(null); setSelectedLeaveStaff(null); }}
                      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                        !selectedLeaveMonth
                          ? 'bg-[#161314] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      ทั้งหมด
                    </button>
                    {months.map((m) => {
                      const [y, mo] = m.split('-');
                      const label = `${thMonths[parseInt(mo) - 1]} ${parseInt(y) + 543}`;
                      const isActive = selectedLeaveMonth === m;
                      return (
                        <button
                          key={m}
                          onClick={() => { setSelectedLeaveMonth(isActive ? null : m); setSelectedLeaveStaff(null); }}
                          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                            isActive
                              ? 'bg-[#F07098] text-white shadow-sm'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* ── Staff Summary Grid ── */}
              {(() => {
                type LeaveRow = { id: string; user: { name: string }; leaveType: string; startDate: string; endDate: string; reason: string; status: string };
                const staffMap: Record<string, { name: string; sick: number; personal: number; vacation: number; other: number; pending: number; total: number }> = {};
                (leaves as unknown as LeaveRow[])
                  .filter((lv) => {
                    if (!selectedLeaveMonth) return true;
                    const d = new Date(lv.startDate);
                    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    return m === selectedLeaveMonth;
                  })
                  .forEach((lv) => {
                  const n = lv.user.name || 'Unknown';
                  if (!staffMap[n]) staffMap[n] = { name: n, sick: 0, personal: 0, vacation: 0, other: 0, pending: 0, total: 0 };
                  const days = Math.round((new Date(lv.endDate).getTime() - new Date(lv.startDate).getTime()) / 86400000) + 1;
                  if (lv.leaveType === 'SICK') staffMap[n].sick += days;
                  else if (lv.leaveType === 'PERSONAL') staffMap[n].personal += days;
                  else if (lv.leaveType === 'VACATION') staffMap[n].vacation += days;
                  else staffMap[n].other += days;
                  if (lv.status === 'PENDING') staffMap[n].pending += 1;
                  staffMap[n].total += days;
                });
                const staffList = Object.values(staffMap);
                if (staffList.length === 0) return null;
                return (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">สรุปวันลาแต่ละคน — คลิกเพื่อดูรายละเอียด</p>
                      {selectedLeaveStaff && (
                        <button
                          onClick={() => setSelectedLeaveStaff(null)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                          ดูทั้งหมด
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {staffList.map((s) => {
                        const isSelected = selectedLeaveStaff === s.name;
                        return (
                          <button
                            key={s.name}
                            onClick={() => setSelectedLeaveStaff(isSelected ? null : s.name)}
                            className={`relative text-left p-4 rounded-2xl border transition-all duration-200 ${
                              isSelected
                                ? 'bg-[#F07098]/10 border-[#F07098]/40 shadow-md ring-2 ring-[#F07098]/20'
                                : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                            }`}
                          >
                            {/* Avatar + name */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${
                                isSelected ? 'bg-[#F07098]' : 'bg-gradient-to-br from-[#F07098] to-[#c3a2ab]'
                              }`}>
                                {s.name.charAt(0)}
                              </div>
                              <span className="text-[13px] font-bold text-[#161314] leading-tight line-clamp-1">{s.name}</span>
                            </div>
                            {/* Total days big number */}
                            <div className="flex items-end gap-1 mb-2">
                              <span className="text-2xl font-black text-[#161314]">{s.total}</span>
                              <span className="text-xs text-gray-400 mb-0.5">วัน</span>
                            </div>
                            {/* Type breakdown pills */}
                            <div className="flex flex-wrap gap-1">
                              {s.sick > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">ป่วย {s.sick}ว.</span>}
                              {s.personal > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">กิจ {s.personal}ว.</span>}
                              {s.vacation > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">พักร้อน {s.vacation}ว.</span>}
                              {s.other > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">อื่นๆ {s.other}ว.</span>}
                            </div>
                            {/* Pending badge */}
                            {s.pending > 0 && (
                              <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-400 text-white text-[10px] font-black flex items-center justify-center">
                                {s.pending}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Filter label when staff selected */}
              {selectedLeaveStaff && (
                <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-[#F07098]/5 border border-[#F07098]/20 rounded-xl">
                  <span className="material-symbols-outlined text-[16px] text-[#F07098]">filter_alt</span>
                  <span className="text-sm font-bold text-[#F07098]">แสดงเฉพาะ: {selectedLeaveStaff}</span>
                </div>
              )}

              {leaves.length > 0 ? (
                <div className="grid gap-3">
                  {(leaves as unknown[])
                    .filter((l) => {
                      const lv = l as { user: { name: string }; startDate: string };
                      if (selectedLeaveStaff && lv.user.name !== selectedLeaveStaff) return false;
                      if (selectedLeaveMonth) {
                        const d = new Date(lv.startDate);
                        const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                        if (m !== selectedLeaveMonth) return false;
                      }
                      return true;
                    })
                    .map((l) => {
                    const leave = l as { id: string; user: { name: string; baseSalary?: number; baseSalaryShopee?: number }; leaveType: string; startDate: string; endDate: string; reason: string; status: string; platform?: string | null };
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    const diffMs = end.getTime() - start.getTime();
                    const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

                    const typeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
                      SICK:     { label: 'ลาป่วย',    color: 'text-rose-600',   bg: 'bg-rose-50 border-rose-200',   icon: 'medical_services' },
                      PERSONAL: { label: 'ลากิจ',     color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', icon: 'person' },
                      VACATION: { label: 'ลาพักร้อน', color: 'text-sky-600',    bg: 'bg-sky-50 border-sky-200',     icon: 'beach_access' },
                    };
                    const type = typeConfig[leave.leaveType] ?? { label: leave.leaveType, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: 'event_busy' };

                    const statusBadge = leave.status === 'APPROVED'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : leave.status === 'REJECTED'
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700';

                    const worksOnTikTok = (leave.user.baseSalary ?? 0) > 0;
                    const worksOnShopee = (leave.user.baseSalaryShopee ?? 0) > 0;
                    const isDualPlatform = worksOnTikTok && worksOnShopee;
                    const singlePlatformName = worksOnTikTok ? 'TikTok' : worksOnShopee ? 'Shopee' : null;

                    return (
                      <div key={leave.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">

                          {/* Avatar + Name */}
                          <div className="flex items-center gap-3 min-w-[160px]">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F07098] to-[#c3a2ab] flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {leave.user.name?.charAt(0) ?? '?'}
                            </div>
                            <div>
                              <div className="font-bold text-[#161314] text-sm">{leave.user.name}</div>
                              <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                                <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${type.bg} ${type.color}`}>
                                  <span className="material-symbols-outlined text-[11px]">{type.icon}</span>
                                  {type.label}
                                </div>
                                <select
                                  value={selectedLeavePlatforms[leave.id] || leave.platform || singlePlatformName || 'TikTok'}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSelectedLeavePlatforms({
                                      ...selectedLeavePlatforms,
                                      [leave.id]: val
                                    });
                                    if (leave.status !== 'PENDING') {
                                      handleUpdateLeave(leave.id, leave.status, val);
                                    }
                                  }}
                                  className="px-2 py-0.5 text-[10px] border border-[#F07098] rounded-full bg-white font-bold text-[#F07098] focus:outline-none cursor-pointer hover:bg-[#F07098]/5 transition-all"
                                >
                                  <option value="TikTok">TikTok</option>
                                  <option value="Shopee">Shopee</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Days Badge */}
                          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-center min-w-[90px]">
                            <span className="material-symbols-outlined text-[18px] text-gray-400">calendar_month</span>
                            <div>
                              <div className="text-lg font-black text-[#161314] leading-none">{days}</div>
                              <div className="text-[10px] text-gray-400 font-medium">ครั้ง</div>
                            </div>
                          </div>

                          {/* Date Range */}
                          <div className="flex-1">
                            <div className="text-xs text-gray-400 font-medium mb-1">ช่วงวันลา</div>
                            <div className="flex items-center gap-2 text-sm font-bold text-[#161314]">
                              <span>{format(start, 'dd MMM yyyy')}</span>
                              <span className="material-symbols-outlined text-[14px] text-gray-300">arrow_forward</span>
                              <span>{format(end, 'dd MMM yyyy')}</span>
                            </div>
                          </div>

                          {/* Reason */}
                          {leave.reason && (
                            <div className="flex-1 hidden md:block">
                              <div className="text-xs text-gray-400 font-medium mb-1">เหตุผล</div>
                              <div className="text-sm text-gray-600 line-clamp-2">{leave.reason}</div>
                            </div>
                          )}

                          {/* Status / Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {leave.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => handleUpdateLeave(leave.id, 'APPROVED', selectedLeavePlatforms[leave.id] || leave.platform || singlePlatformName || 'TikTok')}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs transition-all duration-150 active:scale-95"
                                >
                                  <span className="material-symbols-outlined text-[14px]">check</span>
                                  อนุมัติ
                                </button>
                                <button
                                  onClick={() => handleUpdateLeave(leave.id, 'REJECTED')}
                                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-all duration-150 active:scale-95"
                                >
                                  <span className="material-symbols-outlined text-[14px]">close</span>
                                  ปฏิเสธ
                                </button>
                                <button
                                  onClick={() => handleDeleteLeave(leave.id)}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-150"
                                  title="ลบ"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusBadge}`}>
                                  <span className="material-symbols-outlined text-[12px]">
                                    {leave.status === 'APPROVED' ? 'check_circle' : 'cancel'}
                                  </span>
                                  {leave.status === 'APPROVED' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'}
                                </span>
                                <button
                                  onClick={() => handleDeleteLeave(leave.id)}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-150"
                                  title="ลบ"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Bottom accent bar for PENDING */}
                        {leave.status === 'PENDING' && (
                          <div className="h-0.5 w-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <span className="material-symbols-outlined text-[48px] text-gray-300 mb-3">event_available</span>
                  <p className="text-gray-400 font-medium">ไม่มีคำขอลาในขณะนี้</p>
                </div>
              )}
            </div>

            {/* Schedules Table */}
            <div>
              <h3 className="text-xl font-bold text-[#161314] mb-4">All Upcoming Shifts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                { (schedules as unknown[]).map((s) => {
                  const shift = s as { id: string; platform: string; user: { name: string }; startTime: string; endTime: string };
                  return (
                    <div key={shift.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-[#161314]">{shift.platform}</div>
                        <span className="text-xs font-bold text-[#c3a2ab] bg-white px-2 py-0.5 rounded border border-[#c3a2ab]/20">
                          {shift.user.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(shift.startTime), 'dd MMM yyyy')}
                      </div>
                      <div className="font-mono text-[#161314] font-bold mt-1">
                        {format(new Date(shift.startTime), 'HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. SUPPORT TICKETS TAB */}
        {activeTab === 'support' && (
          <div className="animate-in fade-in">
            <h3 className="text-xl font-bold text-[#161314] mb-6">Active Support Tickets (SOS)</h3>
            <div className="grid gap-4">
              {tickets.length > 0 ? (
                (tickets as unknown[]).map((tick) => {
                  const t = tick as { id: string; issueType: string; user: { name: string }; createdAt: string; description: string; status: string };
                  return (
                    <div key={t.id} className="p-6 rounded-[24px] border border-gray-100 bg-white shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            t.issueType === 'EQUIPMENT' ? 'bg-purple-100 text-purple-700' :
                            t.issueType === 'NETWORK' ? 'bg-blue-100 text-blue-700' :
                            t.issueType === 'BANNED' ? 'bg-red-100 text-red-700' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {t.issueType}
                          </span>
                          <span className="text-xs font-bold text-gray-500">{t.user.name}</span>
                          <span className="text-xs text-gray-400">{format(new Date(t.createdAt), 'dd MMM HH:mm')}</span>
                        </div>
                        <p className="text-gray-700 text-sm font-medium">{t.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {t.status === 'OPEN' ? (
                          <button onClick={() => handleUpdateTicket(t.id, 'IN_PROGRESS')} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">Acknowledge</button>
                        ) : t.status === 'IN_PROGRESS' ? (
                          <button onClick={() => handleUpdateTicket(t.id, 'RESOLVED')} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all">Mark Resolved</button>
                        ) : (
                          <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-xs font-bold uppercase tracking-widest">Resolved</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl">
                  ไม่มีปัญหาแจ้งเตือน
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Image Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white text-gray-800 rounded-full flex items-center justify-center shadow-xl hover:bg-gray-100 transition-all z-10"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getProxyUrl(lightboxImg)}
              alt="Sales receipt full view"
              className="w-full rounded-[24px] shadow-2xl object-contain max-h-[80vh]"
            />
            <a
              href={getProxyUrl(lightboxImg)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/20 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              เปิดรูปขนาดเต็ม
            </a>
          </div>
        </div>
      )}

      {/* Salary Report Modal */}
      <SalaryReportModal
        show={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        startDate={startDate}
        endDate={endDate}
      />

    </div>
  );
}
