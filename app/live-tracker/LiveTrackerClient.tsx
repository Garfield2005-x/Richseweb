'use client';

import { useState, useEffect } from 'react';
import { startLiveSession, endLiveSession } from '@/app/actions/live';
import { submitLeaveRequest, bookShift, createTicket, cancelShift } from '@/app/actions/portal';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface LiveTrackerProps {
  initialSession: ExtendedSession | null;
  history: ExtendedSession[];
  analytics: {
    totalSales: number;
    totalHours: number;
    sessionCount: number;
    platformStats: Record<string, unknown>;
  } | null;
  schedules: unknown[];
  leaves: unknown[];
  tickets: unknown[];
  currentUserId: string;
}

interface ExtendedSession {
  id: string;
  status?: string;
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
  };
}


export default function LiveTrackerClient({ 
  initialSession, 
  history, 
  analytics, 
  schedules, 
  leaves, 
  tickets,
  currentUserId 
}: LiveTrackerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics' | 'schedule' | 'support'>('tracker');
  
  // Tracker State
  const [session, setSession] = useState<ExtendedSession | null>(initialSession);
  const [platform, setPlatform] = useState('TikTok');
  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState('00:00:00');
  const [showEndModal, setShowEndModal] = useState(false);
  const [salesAmount, setSalesAmount] = useState('');
  const [salesImage, setSalesImage] = useState<File | null>(null);
  const [salesImagePreview, setSalesImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // SOS State
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [issueType, setIssueType] = useState('EQUIPMENT');
  const [issueDesc, setIssueDesc] = useState('');

  // Schedule & Leave State
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftPlatform, setShiftPlatform] = useState('TikTok');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftStartTime, setShiftStartTime] = useState('');
  const [shiftEndTime, setShiftEndTime] = useState('');

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState('SICK');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const platforms = ['TikTok', 'Shopee', 'Facebook', 'Instagram', 'Lazada'];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session && session.status === 'ONGOING') {
      interval = setInterval(() => {
        const start = new Date(session.startTime as string).getTime();
        const now = new Date().getTime();
        const diff = now - start;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        setElapsed(
          `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session]);

  // ================= ACTIONS =================

  const handleStartLive = async () => {
    setIsLoading(true);
    const res = await startLiveSession(platform);
    if (res.success) {
      setSession(res.liveSession as unknown as ExtendedSession);
      toast.success('เริ่มบันทึกเวลาไลฟ์แล้ว! 🎉');
      router.refresh();
    } else {
      toast.error(res.error || 'เกิดข้อผิดพลาด');
    }
    setIsLoading(false);
  };

  const handleEndLiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !salesAmount || isNaN(Number(salesAmount))) {
      toast.error('กรุณากรอกยอดขายเป็นตัวเลขให้ถูกต้อง');
      return;
    }
    setIsLoading(true);

    let imageUrl: string | undefined;

    // Upload image first if one was selected
    if (salesImage) {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('file', salesImage);
      const uploadRes = await fetch('/api/upload/live-image', { method: 'POST', body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        toast.error(uploadData.error || 'อัปโหลดรูปไม่สำเร็จ ลองใหม่อีกครั้ง');
        setIsLoading(false);
        setIsUploading(false);
        return;
      }
      imageUrl = uploadData.url;
      setIsUploading(false);
    }

    const res = await endLiveSession(session.id, Number(salesAmount), imageUrl);
    if (res.success) {
      setSession(null);
      setShowEndModal(false);
      setSalesAmount('');
      setSalesImage(null);
      setSalesImagePreview(null);
      toast.success('บันทึกเวลาและยอดขายเรียบร้อยแล้ว! 👏');
      router.refresh();
    } else {
      toast.error(res.error || 'เกิดข้อผิดพลาด');
    }
    setIsLoading(false);
  };

  const handleBookShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const start = new Date(`${shiftDate}T${shiftStartTime}`);
    const end = new Date(`${shiftDate}T${shiftEndTime}`);
    
    if (start >= end) {
      toast.error('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
      setIsLoading(false);
      return;
    }

    const res = await bookShift({ platform: shiftPlatform, startTime: start, endTime: end });
    if (res.success) {
      setShowShiftModal(false);
      toast.success('จองกะเวลาไลฟ์สำเร็จ');
      router.refresh();
    } else {
      toast.error(res.error || 'จองกะไม่สำเร็จ');
    }
    setIsLoading(false);
  };

  const handleLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await submitLeaveRequest({
      leaveType,
      startDate: new Date(leaveStartDate),
      endDate: new Date(leaveEndDate),
      reason: leaveReason
    });
    if (res.success) {
      setShowLeaveModal(false);
      toast.success('ยื่นคำขอลาสำเร็จ รอแอดมินอนุมัติ');
      router.refresh();
    } else {
      toast.error(res.error || 'ไม่สามารถยื่นใบลาได้');
    }
    setIsLoading(false);
  };

  const handleSOSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await createTicket({ issueType, description: issueDesc });
    if (res.success) {
      setShowSOSModal(false);
      setIssueDesc('');
      toast.success('ส่งแจ้งปัญหาด่วนไปที่แอดมินแล้ว โปรดรอการติดต่อกลับ');
      router.refresh();
    } else {
      toast.error(res.error || 'เกิดข้อผิดพลาดในการแจ้งปัญหา');
    }
    setIsLoading(false);
  };

  // ================= UI COMPONENTS =================

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar bg-white rounded-t-[32px] px-4 pt-4">
        {[
          { id: 'tracker', label: 'Live Tracker', icon: 'videocam' },
          { id: 'analytics', label: 'My Analytics', icon: 'bar_chart' },
          { id: 'schedule', label: 'Schedule & Leave', icon: 'calendar_month' },
          { id: 'support', label: 'Support Tickets', icon: 'support_agent' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'tracker' | 'analytics' | 'schedule' | 'support')}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm tracking-widest uppercase transition-all whitespace-nowrap ${
              activeTab === tab.id 
              ? 'border-b-2 border-[#c3a2ab] text-[#c3a2ab]' 
              : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-b-[32px] rounded-tl-none rounded-tr-none md:rounded-tr-[32px] p-6 md:p-8 shadow-sm border border-t-0 border-gray-100">
        
        {/* 1. TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            {/* Tracker Card */}
            <div className="bg-[#f9f5f6] rounded-[24px] p-8 md:p-12 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
              {session?.status === 'ONGOING' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-400 to-red-500 animate-pulse" />
              )}

              {session?.status === 'ONGOING' ? (
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold text-sm tracking-widest uppercase animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    LIVE ON {session.platform}
                  </div>
                  
                  <div>
                    <p className="text-gray-400 font-medium text-sm mb-2 uppercase tracking-widest">Time Elapsed</p>
                    <h2 className="text-6xl md:text-7xl font-black text-[#161314] font-mono tracking-tighter">
                      {session?.status === 'ONGOING' ? elapsed : '00:00:00'}
                    </h2>
                  </div>

                  <div className="flex gap-4 w-full md:w-auto mt-4">
                    <button
                      onClick={() => setShowEndModal(true)}
                      disabled={isLoading}
                      className="flex-1 px-8 py-5 bg-[#161314] text-white rounded-2xl font-bold text-lg hover:bg-[#252122] transition-all active:scale-95 shadow-lg"
                    >
                      END LIVE & SAVE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full max-w-md space-y-6">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-4xl text-[#c3a2ab]">videocam</span>
                  </div>
                  <div className="w-full space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest ml-1">Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-6 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all outline-none font-bold text-gray-700 text-lg appearance-none bg-[url('https://api.iconify.design/heroicons:chevron-down.svg')] bg-[length:1.5rem_1.5rem] bg-[right_1.5rem_center] bg-no-repeat shadow-sm"
                    >
                      {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={handleStartLive}
                    disabled={isLoading}
                    className="w-full px-8 py-5 bg-[#c3a2ab] text-white rounded-2xl font-bold text-lg hover:bg-[#b08b96] transition-all active:scale-95 shadow-lg shadow-[#c3a2ab]/30"
                  >
                    {isLoading ? 'Starting...' : 'START LIVE NOW'}
                  </button>
                </div>
              )}
            </div>

            {/* History Table */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#161314]">ประวัติการไลฟ์ของคุณ</h3>
              {history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-4 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest rounded-l-xl">Date</th>
                        <th className="px-4 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest">Platform</th>
                        <th className="px-4 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest">Duration</th>
                        <th className="px-4 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-right rounded-r-xl">Sales (THB)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {history.map((h) => (
                        <tr key={h.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-4 py-4 font-medium text-gray-600">
                            {format(new Date(h.startTime), 'dd MMM yyyy HH:mm')}
                          </td>
                          <td className="px-4 py-4">
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                              {h.platform}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-bold text-[#c3a2ab]">
                            {h.durationMin} mins
                          </td>
                          <td className="px-4 py-4 font-black text-[#161314] text-right">
                            ฿{h.salesAmount?.toLocaleString() || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl">
                  ยังไม่มีประวัติการไลฟ์
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. ANALYTICS TAB */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold text-[#161314] mb-6">ภาพรวมผลงานเดือนนี้ (This Month)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#161314] text-white p-6 rounded-[24px] shadow-lg">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Sales</p>
                <h2 className="text-4xl font-black">฿{analytics.totalSales.toLocaleString()}</h2>
              </div>
              <div className="bg-[#c3a2ab] text-white p-6 rounded-[24px] shadow-lg">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2">Total Hours</p>
                <h2 className="text-4xl font-black">{analytics.totalHours} <span className="text-xl font-bold opacity-80">hrs</span></h2>
              </div>
              <div className="bg-gray-100 text-[#161314] p-6 rounded-[24px]">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Sessions</p>
                <h2 className="text-4xl font-black">{analytics.sessionCount} <span className="text-xl font-bold text-gray-400">times</span></h2>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-[24px]">
              <h4 className="font-bold text-[#161314] mb-4 uppercase tracking-widest text-sm">Performance by Platform</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(analytics.platformStats).length > 0 ? (
                  Object.entries(analytics.platformStats).map(([plat, stat]) => {
                    const s = stat as { sales: number; count: number };
                    return (
                      <div key={plat} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-800">{plat}</p>
                          <p className="text-xs text-gray-500">{s.count} sessions</p>
                        </div>
                        <p className="font-black text-[#c3a2ab]">฿{s.sales.toLocaleString()}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">No platform data available this month.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. SCHEDULE & LEAVE TAB */}
        {activeTab === 'schedule' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <h3 className="text-xl font-bold text-[#161314]">ตารางกะงานและวันหยุด</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowShiftModal(true)}
                  className="px-4 py-2 bg-[#161314] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#252122] transition-all"
                >
                  Book Shift
                </button>
                <button 
                  onClick={() => setShowLeaveModal(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Request Leave
                </button>
              </div>
            </div>

            {/* Schedules Section */}
            <div>
              <h4 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">Upcoming Shifts (All Creators)</h4>
              <div className="grid gap-3">
                {schedules.length > 0 ? (
                  (schedules as unknown[]).map((s) => {
                    const shift = s as { id: string; platform: string; startTime: string; endTime: string; userId: string; user: { name: string } };
                    return (
                      <div key={shift.id} className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${shift.userId === currentUserId ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center font-bold text-gray-400">
                            {shift.platform[0]}
                          </div>
                          <div>
                            <p className="font-bold text-[#161314]">{shift.platform}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(shift.startTime), 'dd MMM yyyy • HH:mm')} - {format(new Date(shift.endTime), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-100">
                            {shift.user.name}
                          </span>
                          {shift.userId === currentUserId && (
                            <button 
                              onClick={() => cancelShift(shift.id)}
                              className="text-red-500 hover:text-red-700 p-2"
                            >
                              <span className="material-symbols-outlined text-[18px]">cancel</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-sm">ยังไม่มีคิวงานที่จองไว้</p>
                )}
              </div>
            </div>

            {/* Leaves Section */}
            <div>
              <h4 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">My Leave Requests</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest rounded-l-lg">Type</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Reason</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {leaves.length > 0 ? (
                      (leaves as unknown[]).map((lv) => {
                        const l = lv as { id: string; leaveType: string; startDate: string; endDate: string; reason: string; status: string };
                        return (
                          <tr key={l.id}>
                            <td className="px-4 py-4 font-bold text-gray-700">{l.leaveType}</td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {format(new Date(l.startDate), 'dd MMM')} - {format(new Date(l.endDate), 'dd MMM yyyy')}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 max-w-[200px] truncate">{l.reason || '-'}</td>
                            <td className="px-4 py-4 text-right">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                l.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {l.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">ไม่มีประวัติการลา</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. SUPPORT TAB */}
        {activeTab === 'support' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#161314]">Support Tickets</h3>
              <button 
                onClick={() => setShowSOSModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
              >
                <span className="material-symbols-outlined text-[16px]">sos</span>
                Report Issue
              </button>
            </div>

            <div className="grid gap-4">
              {tickets.length > 0 ? (
                (tickets as unknown[]).map((tick) => {
                  const t = tick as { id: string; issueType: string; createdAt: string; description: string; status: string };
                  return (
                    <div key={t.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            t.issueType === 'EQUIPMENT' ? 'bg-purple-100 text-purple-700' :
                            t.issueType === 'NETWORK' ? 'bg-blue-100 text-blue-700' :
                            t.issueType === 'BANNED' ? 'bg-red-100 text-red-700' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {t.issueType}
                          </span>
                          <span className="text-xs text-gray-400">{format(new Date(t.createdAt), 'dd MMM HH:mm')}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                          t.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{t.description}</p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-400 font-medium bg-gray-50 rounded-2xl">
                  ไม่มีปัญหาที่ถูกรายงาน
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}

      {/* End Live Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">task_alt</span>
              </div>
              <h2 className="text-2xl font-bold text-[#161314]">ทำได้เยี่ยมมาก!</h2>
              <p className="text-gray-500 mt-2 text-sm">กรุณากรอกยอดขายที่ทำได้จากไลฟ์นี้<br/>เพื่อนำไปคำนวณค่าคอมมิชชั่น</p>
            </div>

            <form onSubmit={handleEndLiveSubmit} className="space-y-5">
              {/* Sales Amount */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">ยอดขายรวม (บาท)</label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={salesAmount}
                    onChange={(e) => setSalesAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all outline-none font-bold text-gray-700 text-xl"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">แนบรูปยอดขาย (optional)</label>
                <div className="mt-2">
                  {salesImagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={salesImagePreview}
                        alt="Sales screenshot"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => { setSalesImage(null); setSalesImagePreview(null); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="sales-image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-[#f9f5f6] hover:border-[#c3a2ab] transition-all group"
                    >
                      <span className="material-symbols-outlined text-3xl text-gray-300 group-hover:text-[#c3a2ab] transition-colors mb-1">add_photo_alternate</span>
                      <p className="text-xs text-gray-400 font-medium">คลิกเพื่อแนบรูปสกรีนช็อตยอดขาย</p>
                      <p className="text-[10px] text-gray-300">JPG, PNG, WEBP • max 10MB</p>
                      <input
                        id="sales-image-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error('รูปต้องไม่เกิน 10MB');
                            return;
                          }
                          setSalesImage(file);
                          setSalesImagePreview(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowEndModal(false); setSalesImage(null); setSalesImagePreview(null); }} disabled={isLoading} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all">ยกเลิก</button>
                <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-[#161314] text-white rounded-xl font-bold hover:bg-[#252122] transition-all flex justify-center items-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      {isUploading ? 'อัปโหลดรูป...' : 'กำลังบันทึก...'}
                    </>
                  ) : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-bold text-[#161314] mb-6">Book a Shift</h2>
            <form onSubmit={handleBookShift} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Platform</label>
                <select value={shiftPlatform} onChange={(e) => setShiftPlatform(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold">
                  {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Date</label>
                <input type="date" required value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-gray-700" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Start Time</label>
                  <input type="time" required value={shiftStartTime} onChange={(e) => setShiftStartTime(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-gray-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">End Time</label>
                  <input type="time" required value={shiftEndTime} onChange={(e) => setShiftEndTime(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-gray-700" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowShiftModal(false)} className="flex-1 py-4 bg-gray-100 rounded-xl font-bold text-gray-500">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-[#c3a2ab] text-white rounded-xl font-bold">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-bold text-[#161314] mb-6">Request Leave</h2>
            <form onSubmit={handleLeaveRequest} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Leave Type</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold">
                  <option value="SICK">ป่วย (Sick Leave)</option>
                  <option value="PERSONAL">ลากิจ (Personal Leave)</option>
                  <option value="VACATION">พักร้อน (Vacation)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Start Date</label>
                  <input type="date" required value={leaveStartDate} onChange={(e) => setLeaveStartDate(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-gray-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">End Date</label>
                  <input type="date" required value={leaveEndDate} onChange={(e) => setLeaveEndDate(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold text-gray-700" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Reason</label>
                <textarea required rows={3} value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="Please provide a reason..." className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none text-sm resize-none"></textarea>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowLeaveModal(false)} className="flex-1 py-4 bg-gray-100 rounded-xl font-bold text-gray-500">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-[#161314] text-white rounded-xl font-bold">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOS Modal */}
      {showSOSModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 border-t-8 border-red-500">
            <div className="flex items-center gap-3 mb-6 text-red-500">
              <span className="material-symbols-outlined text-4xl">warning</span>
              <h2 className="text-2xl font-bold text-[#161314]">Report Issue</h2>
            </div>
            <form onSubmit={handleSOSSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Issue Type</label>
                <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none font-bold">
                  <option value="EQUIPMENT">อุปกรณ์พัง (ไมค์, กล้อง, ไฟ)</option>
                  <option value="NETWORK">อินเทอร์เน็ตมีปัญหา</option>
                  <option value="BANNED">ช่องโดนแบน / ปลิว</option>
                  <option value="OTHER">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Details</label>
                <textarea required rows={4} value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} placeholder="Describe the issue..." className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-xl outline-none text-sm resize-none"></textarea>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowSOSModal(false)} className="flex-1 py-4 bg-gray-100 rounded-xl font-bold text-gray-500">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold">Send SOS</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating SOS Button during Live */}
      {session?.status === 'ONGOING' && (
        <button 
          onClick={() => setShowSOSModal(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-red-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-red-600 transition-all hover:scale-105 animate-pulse z-40"
        >
          <span className="material-symbols-outlined text-3xl">sos</span>
        </button>
      )}

    </div>
  );
}
