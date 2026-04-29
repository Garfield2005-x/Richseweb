'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { updateLeaveStatus, updateTicketStatus } from '@/app/actions/portal';
import { toast } from 'react-hot-toast';

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
  const [completed] = useState(initialCompleted);
  const [leaves] = useState(initialLeaves);
  const [schedules] = useState(initialSchedules);
  const [tickets] = useState(initialTickets);
  
  const [activeTab, setActiveTab] = useState<'live' | 'timesheet' | 'schedule' | 'support'>('live');
  const [now, setNow] = useState(new Date());
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

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

  const userTimesheets = (completed as unknown as ExtendedSession[]).reduce((acc: Record<string, { name: string; email: string; totalMins: number; totalSales: number; sessionsCount: number }>, curr) => {
    const email = curr.user.email || 'unknown';
    if (!acc[email]) {
      acc[email] = {
        name: curr.user.name || email,
        email: email,
        totalMins: 0,
        totalSales: 0,
        sessionsCount: 0
      };
    }
    acc[email].totalMins += (curr.durationMin || 0);
    acc[email].totalSales += (curr.salesAmount || 0);
    acc[email].sessionsCount += 1;
    return acc;
  }, {});

  const timesheetArray = Object.values(userTimesheets).sort((a, b) => b.totalSales - a.totalSales);

  const handleUpdateLeave = async (id: string, status: string) => {
    const res = await updateLeaveStatus(id, status);
    if (res.success) {
      toast.success('อัปเดตสถานะการลาสำเร็จ');
      router.refresh();
    } else {
      toast.error('เกิดข้อผิดพลาด');
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
      const response = await fetch('/api/admin/live-tracking/export');
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-[#161314]">สรุปเวลาทำงานและยอดขายพนักงานไลฟ์</h3>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-[#161314] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#252122] transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Export
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest rounded-l-xl">Employee</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-center">Sessions</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-center">Total Hours</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-right">Total Sales (THB)</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-right rounded-r-xl">Est. Comm (5%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {timesheetArray.map((sheet, index: number) => {
                      const hours = Math.floor(sheet.totalMins / 60);
                      const mins = sheet.totalMins % 60;
                      const commission = sheet.totalSales * 0.05;

                      return (
                        <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-bold text-[#161314]">{sheet.name || sheet.email}</div>
                            <div className="text-xs text-gray-500">{sheet.email}</div>
                          </td>
                          <td className="px-6 py-5 text-center font-bold text-gray-600">{sheet.sessionsCount}</td>
                          <td className="px-6 py-5 text-center">
                            <span className="bg-[#c3a2ab]/10 text-[#c3a2ab] px-3 py-1 rounded-full font-bold text-sm">
                              {hours}h {mins}m
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right font-black text-lg text-[#161314]">
                            ฿{sheet.totalSales.toLocaleString()}
                          </td>
                          <td className="px-6 py-5 text-right font-bold text-emerald-600">
                            ฿{commission.toLocaleString()}
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
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center rounded-r-xl">Receipt</th>
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
                                src={s.salesImageUrl}
                                alt="Sales receipt"
                                className="w-12 h-12 object-cover rounded-xl border border-gray-200 group-hover:scale-110 group-hover:shadow-lg transition-all duration-200 cursor-zoom-in"
                              />
                              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all" />
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
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
          </div>
        )}

        {/* 3. SCHEDULES & LEAVES TAB */}
        {activeTab === 'schedule' && (
          <div className="space-y-12 animate-in fade-in">
            {/* Leaves Review */}
            <div>
              <h3 className="text-xl font-bold text-[#161314] mb-4">Pending Leave Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest rounded-l-lg">Employee</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Reason</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {leaves.length > 0 ? (
                      (leaves as unknown[]).map((l) => {
                        const leave = l as { id: string; user: { name: string }; leaveType: string; startDate: string; endDate: string; reason: string; status: string };
                        return (
                          <tr key={leave.id}>
                            <td className="px-4 py-4 font-bold text-gray-700">{leave.user.name}</td>
                            <td className="px-4 py-4 font-bold text-gray-700">{leave.leaveType}</td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {format(new Date(leave.startDate), 'dd MMM')} - {format(new Date(leave.endDate), 'dd MMM')}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 max-w-[200px] truncate">{leave.reason || '-'}</td>
                            <td className="px-4 py-4 text-right">
                              {leave.status === 'PENDING' ? (
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleUpdateLeave(leave.id, 'APPROVED')} className="px-3 py-1 bg-emerald-500 text-white rounded font-bold text-xs hover:bg-emerald-600">Approve</button>
                                  <button onClick={() => handleUpdateLeave(leave.id, 'REJECTED')} className="px-3 py-1 bg-gray-200 text-gray-700 rounded font-bold text-xs hover:bg-gray-300">Reject</button>
                                </div>
                              ) : (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {leave.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">ไม่มีคำขอลา</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
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
              src={lightboxImg}
              alt="Sales receipt full view"
              className="w-full rounded-[24px] shadow-2xl object-contain max-h-[80vh]"
            />
            <a
              href={lightboxImg}
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

    </div>
  );
}
