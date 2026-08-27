'use client';

import { useState, useEffect } from 'react';
import SalaryReportModal from '@/app/components/SalaryReportModal';
import { startLiveSession, endLiveSession, getLiveSessionsHistory, updateLiveSessionSales } from '@/app/actions/live';
import { submitLeaveRequest, createTicket, getPersonalAnalytics, bookShift, cancelShift } from '@/app/actions/portal';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface LiveTrackerProps {
  initialSession: ExtendedSession | null;
  history: ExtendedSession[];
  analytics: {
    totalSales: number;
    totalHours: number;
    sessionCount: number;
    platformStats: Record<string, { sales: number; count: number; minutes: number }>;
    estimatedCommission?: number;
  } | null;
  leaves: unknown[];
  tickets: unknown[];
  monthlyTrend?: { monthName: string; totalSales: number; totalComm: number }[];
  schedules?: any[];
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
  leaves,
  tickets,
  monthlyTrend = [],
  schedules = []
}: LiveTrackerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics' | 'schedule' | 'support'>('tracker');

  // Tracker State
  const [historyData, setHistoryData] = useState<ExtendedSession[]>(history);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  // Analytics Calendar Filter State
  const [analyticsData, setAnalyticsData] = useState(analytics);
  const [analyticsStartDate, setAnalyticsStartDate] = useState('');
  const [analyticsEndDate, setAnalyticsEndDate] = useState('');

  // New visual and helper states
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pre-live checklist state
  const [chkCamera, setChkCamera] = useState(false);
  const [chkMic, setChkMic] = useState(false);
  const [chkSpeed, setChkSpeed] = useState(false);

  // Speedtest states
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const [speedProgress, setSpeedProgress] = useState(0);
  const [speedResult, setSpeedResult] = useState<{ download: string; upload: string; ping: string } | null>(null);

  // AI Hook states
  const [selectedHookCategory, setSelectedHookCategory] = useState('skincare');
  const [generatedHook, setGeneratedHook] = useState('');

  // Visual Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShiftForSwap, setSelectedShiftForSwap] = useState<any | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapTargetUser, setSwapTargetUser] = useState('สตรีมเมอร์ มินท์');
  const [swapReason, setSwapReason] = useState('');

  // Shift Booking State
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookPlatform, setBookPlatform] = useState('TikTok');
  const [bookDate, setBookDate] = useState('');
  const [bookStartTime, setBookStartTime] = useState('');
  const [bookEndTime, setBookEndTime] = useState('');

  const runSpeedTest = () => {
    setIsTestingSpeed(true);
    setSpeedProgress(0);
    setSpeedResult(null);
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setSpeedProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setSpeedResult({
          download: (Math.random() * 50 + 80).toFixed(1) + ' Mbps',
          upload: (Math.random() * 30 + 40).toFixed(1) + ' Mbps',
          ping: (Math.random() * 10 + 5).toFixed(0) + ' ms'
        });
        setIsTestingSpeed(false);
        setChkSpeed(true);
        toast.success('ทดสอบความเร็วอินเทอร์เน็ตสำเร็จ! ⚡');
      }
    }, 100);
  };

  const hooksData: Record<string, string[]> = {
    skincare: [
      "📌 '3 ความเชื่อผิดๆ ที่ทำให้หน้าพังแบบไม่รู้ตัว...' ใครมีปัญหาผิวแพ้ง่ายต้องฟัง!",
      "📌 'ทำยังไงให้ผิวฟูเหมือนนอนครบ 8 ชั่วโมงใน 3 วัน?' วันนี้เรามีเคล็ดลับกู้ผิวโทรมเร่งด่วนมาบอกครับ",
      "📌 'กู้ผิวโทรมเร่งด่วนด้วยเซรั่มขวดนี้ตัวเดียว' ขวดเดียวเอาอยู่ ท้าพิสูจน์ผลลัพธ์ในไลฟ์นี้เลย!",
      "📌 'ผิวใสแบบไม่ต้องพึ่งฟิลเตอร์' เผยผิวจริงหน้ากล้องพร้อมแนะนำรูทีนที่ใช้เองทุกวัน!"
    ],
    cosmetics: [
      "📌 'แต่งหน้ายังไงให้ติดทน 12 ชั่วโมง หน้าไม่ดรอป ไม่เป็นคราบ?' ใครที่แต่งหน้าแล้วหลุดระหว่างวันห้ามพลาด!",
      "📌 'ลิปสติกโทนนี้ทาแล้วขับผิวสุดๆ หน้าดูไบร์ทขึ้นทันที' ทาโชว์สดๆ ในไลฟ์นี้เลยค่ะ",
      "📌 'เทคนิคปัดแก้มแบบหน้าเด็กที่ช่างแต่งหน้าไม่เคยบอก' ทำตามง่ายๆ ใน 1 นาที"
    ],
    sunscreen: [
      "📌 'รู้ไหมว่าทากันแดดไม่ถึง 2 ข้อนิ้ว เหมือนไม่ได้ทา?' วันนี้มาสอนวิธีทาที่ถูกต้องกันค่ะ",
      "📌 'กันแดดเนื้อน้ำซึมไว ไม่เหนอะหนะ ไม่เป็นคราบขาวระหว่างวัน' ทาทับเมคอัพได้ทันที!",
      "📌 'ทำไมต้องทากันแดดแม้อยู่ในร่ม?' ปัญหาฝ้า กระ จุดด่างดำที่หลายคนมองข้าม"
    ],
    promotion: [
      "📌 'ชิ้นที่สอง 1 บาท เฉพาะ 10 นาทีแรกของการไลฟ์นี้เท่านั้น!' ใครกดทันคือคุ้มมาก",
      "📌 'ลดแรงที่สุดในรอบปี หมดแล้วหมดเลยไม่มีเติมตะกร้า!' ช้าหมดอดนะคะสินค้ามีจำนวนจำกัด",
      "📌 'ของแถมมูลค่ามากกว่าราคาตัวหลัก!' ซื้อขวดนี้แถมฟรีของแถม 3 ชิ้นทันทีในชั่วโมงนี้"
    ]
  };

  const handleGenerateHook = (category: string) => {
    const list = hooksData[category];
    const random = list[Math.floor(Math.random() * list.length)];
    setGeneratedHook(random);
  };

  const handleBookShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookPlatform || !bookDate || !bookStartTime || !bookEndTime) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    const startStr = `${bookDate}T${bookStartTime}`;
    const endStr = `${bookDate}T${bookEndTime}`;
    
    setIsLoading(true);
    const res = await bookShift({
      platform: bookPlatform,
      startTime: new Date(startStr),
      endTime: new Date(endStr),
    });
    
    if (res.success) {
      toast.success('จองช่วงเวลาไลฟ์สำเร็จแล้ว! 📅');
      setShowBookModal(false);
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      toast.error(res.error || 'จองคิวไม่สำเร็จ');
    }
    setIsLoading(false);
  };

  const handleCancelShiftSubmit = async (shiftId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกกะไลฟ์นี้?')) return;
    setIsLoading(true);
    const res = await cancelShift(shiftId);
    if (res.success) {
      toast.success('ยกเลิกกะไลฟ์สำเร็จ');
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      toast.error(res.error || 'ยกเลิกไม่สำเร็จ');
    }
    setIsLoading(false);
  };

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftForSwap) return;
    toast.success(`ส่งคำขอสลับเวรกะ ${selectedShiftForSwap.platform} ไปยัง ${swapTargetUser} สำเร็จ! รอแอดมินหรือผู้รับสลับยอมรับ`);
    setShowSwapModal(false);
    setSelectedShiftForSwap(null);
    setSwapReason('');
  };

  const startConfetti = () => {
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#c3a2ab', '#a07882', '#ffd700', '#c0c0c0', '#4169e1', '#228b22'];
    const particles: any[] = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 15;

        if (p.y < canvas.height) {
          active = true;
        } else {
          p.x = Math.random() * canvas.width;
          p.y = -20;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      if (active) {
        animationFrameId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    draw();

    setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 6000);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDay = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    return { startDay, numDays };
  };

  const handleAnalyticsDateChange = (start: string, end: string) => {
  setAnalyticsStartDate(start);
  setAnalyticsEndDate(end);
  if (start && end) {
    handleFetchAnalytics(start, end);
  }
};

const handleFetchAnalytics = async (start: string, end: string) => {
  setIsLoading(true);
  const res = await getPersonalAnalytics(start, end);
  if (res.success && res.analytics) {
    setAnalyticsData(res.analytics);
  } else {
    toast.error(res.error || 'ไม่สามารถดึงข้อมูลวิเคราะห์ได้');
  }
  setIsLoading(false);
};

  const applyAnalyticsPreset = (preset: 'today' | '7days' | 'thisMonth' | 'clear') => {
    const today = new Date();
    const formatLocal = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    if (preset === 'today') {
      const dateStr = formatLocal(today);
      handleAnalyticsDateChange(dateStr, dateStr);
    } else if (preset === '7days') {
      const start = new Date();
      start.setDate(today.getDate() - 6);
      handleAnalyticsDateChange(formatLocal(start), formatLocal(today));
    } else if (preset === 'thisMonth') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      handleAnalyticsDateChange(formatLocal(start), formatLocal(end));
    } else if (preset === 'clear') {
      setAnalyticsStartDate('');
      setAnalyticsEndDate('');
      setAnalyticsData(analytics);
    }
  };
  const [showEndModal, setShowEndModal] = useState(false);
  const [salesAmount, setSalesAmount] = useState('');
  const [salesImage, setSalesImage] = useState<File | null>(null);
  const [salesImagePreview, setSalesImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // New edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [platform, setPlatform] = useState<string>('TikTok');
  const [editSessionId, setEditSessionId] = useState<string>('');
  const [editSalesAmount, setEditSalesAmount] = useState('');
  const [editSalesImage, setEditSalesImage] = useState<File | null>(null);
  const [editSalesImagePreview, setEditSalesImagePreview] = useState<string | null>(null);
  const [issueType, setIssueType] = useState('EQUIPMENT');
  const [issueDesc, setIssueDesc] = useState('');
  const [session, setSession] = useState<ExtendedSession | null>(initialSession);
  const [elapsed, setElapsed] = useState('00:00:00');
  const [isLoading, setIsLoading] = useState(false);

  // Leave State

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [leaveType, setLeaveType] = useState('SICK');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const platforms = ['TikTok', 'Shopee', 'Facebook', 'Instagram', 'Lazada'];

  const fetchHistory = async (month?: string, year?: string) => {
    const monthNum = month ? Number(month) : undefined;
    const yearNum = year ? Number(year) : undefined;
    const res = await getLiveSessionsHistory(monthNum, yearNum);
    if (res.success && res.history) {
      setHistoryData(res.history);
    } else {
      toast.error(res.error || 'ไม่สามารถดึงประวัติได้');
    }
  };

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
      try {
        const fd = new FormData();
        fd.append('file', salesImage);

        const uploadRes = await fetch('/api/upload/live-image', {
          method: 'POST',
          body: fd,
        });

        // Try to get response data even if it fails
        let uploadData;
        try {
          uploadData = await uploadRes.json();
        } catch {
          uploadData = { error: `Server Error (${uploadRes.status}): ไม่สามารถอ่านข้อมูลจากเซิร์ฟเวอร์ได้แจ้งแอดมิน` };
        }

        if (!uploadRes.ok || !uploadData.url) {
          toast.error(uploadData.error || 'อัปโหลดรูปไม่สำเร็จ (ไม่ทราบสาเหตุ)');
          setIsLoading(false);
          setIsUploading(false);
          return;
        }
        imageUrl = uploadData.url;
      } catch (err: unknown) {
        console.error("End session error:", err);
        const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
        toast.error(errorMessage);
        setIsLoading(false);
        setIsUploading(false);
        return;
      }
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
      if (Number(salesAmount) > 0) {
        setTimeout(() => {
          startConfetti();
        }, 300);
      }
      router.refresh();
    } else {
      toast.error(res.error || 'เกิดข้อผิดพลาด');
    }
    setIsLoading(false);
  };

  // New handler for editing a completed session's sales data
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSessionId || !editSalesAmount || isNaN(Number(editSalesAmount))) {
      toast.error('กรุณากรอกยอดขายเป็นตัวเลข');
      return;
    }
    setIsLoading(true);
    let imageUrl: string | undefined;
    if (editSalesImage) {
      setIsUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', editSalesImage);
        const uploadRes = await fetch('/api/upload/live-image', {
          method: 'POST',
          body: fd,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          toast.error(uploadData.error || 'อัปโหลดรูปภาพไม่สำเร็จ');
          setIsLoading(false);
          setIsUploading(false);
          return;
        }
        imageUrl = uploadData.url;
      } catch {
        toast.error('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        setIsLoading(false);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }
    const finalImageUrl = (editSalesImage || editSalesImagePreview) ? imageUrl : undefined;
    const res = await updateLiveSessionSales(editSessionId, Number(editSalesAmount), finalImageUrl);
    if (res.success) {
      toast.success('อัปเดตข้อมูลสำเร็จ');
      setShowEditModal(false);
      setEditSessionId('');
      setEditSalesAmount('');
      setEditSalesImage(null);
      setEditSalesImagePreview(null);
      router.refresh();
    } else {
      toast.error(res.error || 'อัปเดตข้อมูลไม่สำเร็จ');
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
            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm tracking-widest uppercase transition-all whitespace-nowrap ${activeTab === tab.id
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Tracker & Pre-live Checklist */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Tracker Card */}
                <div className="bg-gradient-to-br from-white to-[#f9f5f6] rounded-[32px] p-8 md:p-10 border border-[#e0cfd3]/30 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
                  {session?.status === 'ONGOING' && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-400 to-red-500 animate-pulse" />
                  )}

                  {session?.status === 'ONGOING' ? (
                    <div className="flex flex-col items-center text-center space-y-6 w-full">
                      <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold text-xs tracking-widest uppercase animate-pulse border border-red-100">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        LIVE ON {session.platform}
                      </div>

                      <div>
                        <p className="text-gray-400 font-bold text-xs mb-1 uppercase tracking-widest">Time Elapsed</p>
                        <h2 className="text-5xl md:text-6xl font-black text-[#161314] font-mono tracking-tighter">
                          {elapsed}
                        </h2>
                      </div>

                      <button
                        onClick={() => setShowEndModal(true)}
                        disabled={isLoading}
                        className="w-full md:w-auto px-10 py-4.5 bg-[#161314] hover:bg-[#2a2526] text-white rounded-2xl font-bold text-base transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xl">stop_circle</span>
                        END LIVE & SAVE
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center w-full max-w-md space-y-6">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gray-50">
                        <span className="material-symbols-outlined text-3xl text-[#c3a2ab]">videocam</span>
                      </div>
                      
                      <div className="w-full space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Platform</label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all outline-none font-bold text-gray-700 text-base appearance-none bg-[url('https://api.iconify.design/heroicons:chevron-down.svg')] bg-[length:1.2rem_1.2rem] bg-[right_1.2rem_center] bg-no-repeat shadow-sm"
                        >
                          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>

                      <button
                        onClick={handleStartLive}
                        disabled={isLoading || !chkCamera || !chkMic || !chkSpeed}
                        className={`w-full px-8 py-4.5 text-white rounded-2xl font-bold text-base transition-all active:scale-95 shadow-lg cursor-pointer ${
                          (chkCamera && chkMic && chkSpeed)
                            ? 'bg-[#c3a2ab] hover:bg-[#b08b96] shadow-[#c3a2ab]/30'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        }`}
                      >
                        {isLoading ? 'Starting...' : 'START LIVE NOW'}
                      </button>

                      {!(chkCamera && chkMic && chkSpeed) && (
                        <p className="text-[11px] text-[#a07882] font-bold text-center flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">info</span>
                          กรุณาเช็คความพร้อมอุปกรณ์ด้านล่างให้ครบเพื่อเปิดปุ่มเริ่มไลฟ์
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Pre-Live Checklist Card (Visible only when not ongoing) */}
                {session?.status !== 'ONGOING' && (
                  <div className="bg-gradient-to-br from-white/95 to-[#f9f5f6]/50 backdrop-blur-md rounded-[28px] p-6 border border-white/40 shadow-lg space-y-5">
                    <div className="flex items-center gap-2 text-[#a07882]">
                      <span className="material-symbols-outlined text-2xl">fact_check</span>
                      <h3 className="font-bold text-base text-[#161314]">Pre-Live Checklist (เช็คความพร้อมก่อนสตรีม)</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 p-4 bg-white/60 border border-gray-100 rounded-2xl cursor-pointer hover:bg-white transition-all shadow-sm">
                        <input type="checkbox" checked={chkCamera} onChange={(e) => setChkCamera(e.target.checked)} className="w-5 h-5 rounded text-[#c3a2ab] focus:ring-[#c3a2ab] border-gray-300" />
                        <div>
                          <p className="text-sm font-bold text-gray-700">กล้อง & แสงไฟพร้อม</p>
                          <p className="text-[10px] text-gray-400">มุมกล้องหน้าสวยงามและจัดแสงสว่างเคลียร์</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-white/60 border border-gray-100 rounded-2xl cursor-pointer hover:bg-white transition-all shadow-sm">
                        <input type="checkbox" checked={chkMic} onChange={(e) => setChkMic(e.target.checked)} className="w-5 h-5 rounded text-[#c3a2ab] focus:ring-[#c3a2ab] border-gray-300" />
                        <div>
                          <p className="text-sm font-bold text-gray-700">ไมค์ & เสียงดังฟังชัด</p>
                          <p className="text-[10px] text-gray-400">เทสเสียงไมค์แล้วว่าชัดเจน ไม่มีเสียงซ่าช็อต</p>
                        </div>
                      </label>

                      <div className="flex flex-col gap-2 p-4 bg-white/60 border border-gray-100 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={chkSpeed} readOnly className="w-5 h-5 rounded text-[#c3a2ab] focus:ring-[#c3a2ab] pointer-events-none border-gray-300" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-700">ความเร็วอินเทอร์เน็ต</p>
                            <p className="text-[10px] text-gray-400">ต้องการอย่างน้อย Upload 15+ Mbps</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={runSpeedTest} 
                            disabled={isTestingSpeed}
                            className="px-3 py-1.5 bg-[#161314] hover:bg-[#2a2526] text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                          >
                            {isTestingSpeed ? 'ทดสอบ...' : 'เริ่มทดสอบ'}
                          </button>
                        </div>
                        {isTestingSpeed && (
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-[#c3a2ab] h-full transition-all duration-150 animate-pulse" style={{ width: `${speedProgress}%` }} />
                          </div>
                        )}
                        {speedResult && (
                          <div className="flex gap-4 text-[10px] font-black text-[#a07882] mt-1 border-t border-gray-100/50 pt-1">
                            <span>⬇️ Download: {speedResult.download}</span>
                            <span>⬆️ Upload: {speedResult.upload}</span>
                            <span>⚡ Ping: {speedResult.ping}</span>
                          </div>
                        )}
                      </div>


                    </div>
                  </div>
                )}

              </div>

              {/* AI Hooks Panel */}
              {session?.status !== 'ONGOING' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-white to-[#f9f5f6]/50 backdrop-blur-md rounded-[28px] p-6 border border-[#e0cfd3]/30 shadow-lg space-y-4">
                    <div className="flex items-center gap-2 text-[#a07882]">
                      <span className="material-symbols-outlined text-2xl font-bold">psychology</span>
                      <h3 className="font-bold text-base text-[#161314]">AI Opening Hooks</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">สุ่มประโยคเปิดตัวไลฟ์เด็ดๆ ด้วย AI เพื่อดึงดูดคนดูให้อยู่หมัดตั้งแต่ 3 วินาทีแรก!</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">หมวดหมู่ไลฟ์</label>
                        <select 
                          value={selectedHookCategory} 
                          onChange={(e) => {
                            setSelectedHookCategory(e.target.value);
                            handleGenerateHook(e.target.value);
                          }} 
                          className="w-full mt-1.5 px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none text-xs font-bold text-gray-600 appearance-none bg-[url('https://api.iconify.design/heroicons:chevron-down.svg')] bg-[length:1.2rem_1.2rem] bg-[right_1rem_center] bg-no-repeat"
                        >
                          <option value="skincare">เซรั่ม / สกินแคร์</option>
                          <option value="cosmetics">เครื่องสำอาง</option>
                          <option value="sunscreen">ครีมกันแดด</option>
                          <option value="promotion">โปรโมชันลดกระหน่ำ</option>
                        </select>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleGenerateHook(selectedHookCategory)}
                        className="w-full py-3 bg-[#161314] hover:bg-[#2a2526] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">autorenew</span>
                        สุ่มไอเดียเปิดตัวไลฟ์
                      </button>

                      {generatedHook && (
                        <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl animate-in zoom-in-95 mt-2">
                          <p className="text-xs font-bold text-amber-900/80 leading-relaxed font-mono">
                            {generatedHook}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedHook);
                              toast.success('คัดลอกลงบอร์ดเรียบร้อย!');
                            }}
                            className="mt-2 text-[10px] font-black text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[12px]">content_copy</span>
                            คัดลอกข้อความ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* History Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">เดือน</label>
                <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); fetchHistory(e.target.value, filterYear); }} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c3a2ab] outline-none">
                  <option value="">ทั้งหมด</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">ปี</label>
                <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); fetchHistory(filterMonth, e.target.value); }} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c3a2ab] outline-none">
                  <option value="">ทั้งหมด</option>
                  {Array.from({length:5}, (_,i)=>{ const yr = new Date().getFullYear()-i; return <option key={yr} value={yr}>{yr}</option>; })}
                </select>
              </div>
              <button onClick={()=>{ setFilterMonth(''); setFilterYear(''); fetchHistory(); }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 cursor-pointer">รีเซ็ต</button>
            </div>

            {/* History Table */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#161314]">ประวัติการไลฟ์ของคุณ</h3>
              {historyData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-4 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest rounded-l-xl">Date</th>
                        <th className="px-4 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest">Platform</th>
                        <th className="px-4 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest">Duration</th>
                        <th className="px-4 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-right">Sales (THB)</th>
                        <th className="px-4 py-4 text-[12px] font-bold text-gray-400 uppercase tracking-widest text-center rounded-r-xl">Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {historyData.map((h) => (
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
                          <td className="px-4 py-4 font-black text-[#161314] text-right font-mono">
                            ฿{h.salesAmount?.toLocaleString() || 0}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button type="button" onClick={() => {
                              setEditSessionId(h.id);
                              setEditSalesAmount(h.salesAmount?.toString() ?? '');
                              setEditSalesImage(null);
                              setEditSalesImagePreview(h.salesImageUrl || null);
                              setShowEditModal(true);
                            }} className="text-[#c3a2ab] hover:text-[#b08b96] cursor-pointer">
                              <span className="material-symbols-outlined text-xl">create</span>
                            </button>
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
        {activeTab === 'analytics' && analyticsData && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-2">
              <div>
                <h3 className="text-xl font-bold text-[#161314]">
                  {analyticsStartDate && analyticsEndDate 
                    ? `ผลงานช่วง ${format(new Date(analyticsStartDate), 'dd/MM/yyyy')} - ${format(new Date(analyticsEndDate), 'dd/MM/yyyy')}`
                    : 'ภาพรวมผลงานเดือนนี้ (This Month)'
                  }
                </h3>
              </div>
            </div>

            {/* Date Filters inside Analytics Tab */}
            <div className="bg-gradient-to-br from-white to-[#f9f5f6] p-5 rounded-3xl border border-[#e0cfd3]/30 flex flex-col gap-4 shadow-sm">
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">เริ่มวันที่ (Start Date)</label>
                  <input
                    type="date"
                    value={analyticsStartDate}
                    onChange={(e) => handleAnalyticsDateChange(e.target.value, analyticsEndDate)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none font-bold text-gray-700 text-sm focus:ring-2 focus:ring-[#c3a2ab] focus:border-[#c3a2ab] transition-all shadow-sm"
                  />
                </div>
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">ถึงวันที่ (End Date)</label>
                  <input
                    type="date"
                    value={analyticsEndDate}
                    onChange={(e) => handleAnalyticsDateChange(analyticsStartDate, e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none font-bold text-gray-700 text-sm focus:ring-2 focus:ring-[#c3a2ab] focus:border-[#c3a2ab] transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* แสดงจำนวนวันที่เลือก - ตัวโตๆ */}
              {analyticsStartDate && analyticsEndDate && (() => {
                const days = Math.round((new Date(analyticsEndDate).getTime() - new Date(analyticsStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#f9f5f6] to-white border border-[#e0cfd3] rounded-2xl py-3 px-5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#c3a2ab]">ช่วงที่เลือก</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-[#161314] leading-none tabular-nums">{days}</span>
                      <span className="text-base font-bold text-gray-400">วัน</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex flex-wrap items-center gap-2 border-t border-gray-200/50 pt-3">
                <span className="text-xs font-bold text-gray-400 mr-2">เลือกช่วงเวลาด่วน:</span>
                <button
                  onClick={() => applyAnalyticsPreset('today')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  วันนี้
                </button>
                <button
                  onClick={() => applyAnalyticsPreset('7days')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  7 วันล่าสุด
                </button>
                <button
                  onClick={() => applyAnalyticsPreset('thisMonth')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  เดือนนี้
                </button>
                {(analyticsStartDate || analyticsEndDate) && (
                  <button
                    onClick={() => applyAnalyticsPreset('clear')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 ml-auto cursor-pointer"
                  >
                    ล้างค่าการค้นหา
                  </button>
                )}
                
                {/* ปุ่มคำนวณเงินเดือน */}
                <button
                  onClick={() => setShowSalaryModal(true)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    !analyticsStartDate || !analyticsEndDate 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed ml-auto' 
                      : 'bg-[#161314] text-white hover:bg-[#2a2526] ml-auto'
                  }`}
                  disabled={!analyticsStartDate || !analyticsEndDate}
                >
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">calculate</span>
                    คำนวณเงินเดือน
                  </span>
                </button>
              </div>
            </div>

            {/* Gamification Progress Bar & Target */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Target progress card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-white/95 to-[#f9f5f6]/80 backdrop-blur-md rounded-[24px] p-6 border border-[#e0cfd3]/30 shadow-lg space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-[#161314] text-base">เป้าหมายยอดขายเดือนนี้</h4>
                    <p className="text-xs text-gray-500">ความคืบหน้าการสะสมยอดขายรวมของเดือนนี้</p>
                  </div>
                  <span className="bg-[#161314] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md">
                    {analyticsData.totalSales < 10000 && "🥉 Bronze Streamer"}
                    {analyticsData.totalSales >= 10000 && analyticsData.totalSales < 30000 && "🥈 Silver Streamer"}
                    {analyticsData.totalSales >= 30000 && analyticsData.totalSales < 80000 && "🥇 Gold Streamer"}
                    {analyticsData.totalSales >= 80000 && "💎 Platinum Streamer"}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>ความสำเร็จ: {Math.min(100, Math.round((analyticsData.totalSales / 50000) * 100))}%</span>
                    <span>เป้าหมาย ฿50,000</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-[#c3a2ab] to-[#a07882] h-full rounded-full transition-all duration-1000 shadow-md"
                      style={{ width: `${Math.min(100, Math.round((analyticsData.totalSales / 50000) * 100))}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-1">
                  <p className="text-xs text-gray-400 italic">
                    {analyticsData.totalSales >= 50000 
                      ? "🎉 สุดยอด! ยอดสตรีมเกินเป้าหมายเดือนนี้แล้ว!" 
                      : `อีกเพียง ฿${(50000 - analyticsData.totalSales).toLocaleString()} จะบรรลุเป้าหมายเดือนนี้`}
                  </p>
                  {analyticsData.totalSales >= 10000 && (
                    <button
                      type="button"
                      onClick={() => {
                        startConfetti();
                        toast.success('ยินดีด้วยกับการบรรลุเป้าหมายสตรีมเมอร์! 🎉');
                      }}
                      className="px-3.5 py-1.5 bg-[#c3a2ab] hover:bg-[#b08b96] text-white font-bold text-[10px] rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      ฉลองความสำเร็จ 🎊
                    </button>
                  )}
                </div>
              </div>

              {/* Quick stats mini card */}
              <div className="bg-[#161314] text-white p-6 rounded-[24px] shadow-lg flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Sales</p>
                  <h2 className="text-4.5xl font-black font-mono">฿{analyticsData.totalSales.toLocaleString()}</h2>
                </div>
                <div className="border-t border-white/10 pt-3 mt-3 flex justify-between items-center text-xs text-gray-400">
                  <span>ประมาณการค่าคอมฯสะสม:</span>
                  <span className="font-bold text-emerald-400">
                    ฿{analyticsData.estimatedCommission !== undefined
                      ? Math.round(analyticsData.estimatedCommission).toLocaleString()
                      : Math.round(analyticsData.totalSales * 0.04).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#c3a2ab] text-white p-6 rounded-[24px] shadow-lg">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2">Total Hours</p>
                <h2 className="text-4xl font-black">{analyticsData.totalHours} <span className="text-xl font-bold opacity-80">hrs</span></h2>
              </div>
              <div className="bg-gray-100 text-[#161314] p-6 rounded-[24px]">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Sessions</p>
                <h2 className="text-4xl font-black">{analyticsData.sessionCount} <span className="text-xl font-bold text-gray-400">times</span></h2>
              </div>
            </div>

            {/* Interactive Area Chart */}
            {isMounted && monthlyTrend && monthlyTrend.length > 0 && (
              <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-4">
                <h4 className="font-bold text-[#161314] uppercase tracking-widest text-sm">แนวโน้มผลงานย้อนหลัง (Last 6 Months)</h4>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c3a2ab" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#c3a2ab" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffd700" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ffd700" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="monthName" stroke="#999" fontSize={11} tickLine={false} />
                      <YAxis stroke="#999" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }} 
                        labelStyle={{ fontWeight: 'bold', color: '#161314' }}
                      />
                      <Area type="monotone" name="ยอดขาย (Sales)" dataKey="totalSales" stroke="#c3a2ab" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      <Area type="monotone" name="ค่าคอมมิชชัน (Comm)" dataKey="totalComm" stroke="#ffd700" strokeWidth={3} fillOpacity={1} fill="url(#colorComm)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-[24px]">
              <h4 className="font-bold text-[#161314] mb-4 uppercase tracking-widest text-sm">Performance by Platform</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(analyticsData.platformStats).length > 0 ? (
                  Object.entries(analyticsData.platformStats).map(([plat, stat]) => {
                    const s = stat;
                    const hours = Math.floor(s.minutes / 60);
                    const mins = s.minutes % 60;
                    return (
                      <div key={plat} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center">
                          <p className="font-black text-[#161314] text-lg">{plat}</p>
                          <span className="bg-[#f9f5f6] text-[#c3a2ab] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">{s.count} sessions</span>
                        </div>
                        <div className="flex justify-between items-end border-t border-gray-50 pt-2">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Spend</p>
                            <p className="font-bold text-gray-700">
                              {hours > 0 && `${hours}h `}{mins}m
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Revenue</p>
                            <p className="font-black text-[#c3a2ab] text-xl">฿{s.sales.toLocaleString()}</p>
                          </div>
                        </div>
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

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-black text-[#161314]">ตาราง & การลา</h3>
                <p className="text-xs text-gray-400 mt-0.5">จัดการกะไลฟ์, ยื่นลา, และดูตารางของคุณ</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBookModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#161314] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#2a2526] transition-all shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">add_circle</span>
                  จองกะไลฟ์
                </button>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">event_busy</span>
                  ยื่นใบลา
                </button>
              </div>
            </div>

            {/* Visual Calendar */}
            <div className="bg-gradient-to-br from-white to-[#f9f5f6]/40 rounded-[28px] p-6 border border-[#e0cfd3]/30 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); }}
                  className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-gray-600">chevron_left</span>
                </button>
                <h4 className="font-black text-[#161314] text-base">
                  {currentDate.toLocaleString('th-TH', { month: 'long', year: 'numeric' })}
                </h4>
                <button
                  onClick={() => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); }}
                  className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-gray-600">chevron_right</span>
                </button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 mb-2">
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest py-1">{d}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const { startDay, numDays } = getDaysInMonth(currentDate);
                  const today = new Date();
                  const cells = [];
                  for (let i = 0; i < startDay; i++) {
                    cells.push(<div key={`empty-${i}`} />);
                  }
                  for (let d = 1; d <= numDays; d++) {
                    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                    const isToday = today.getDate() === d && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
                    const shiftsOnDay = schedules.filter((s: any) => {
                      const sd = new Date(s.startTime);
                      return sd.getDate() === d && sd.getMonth() === currentDate.getMonth() && sd.getFullYear() === currentDate.getFullYear();
                    });
                    const hasShift = shiftsOnDay.length > 0;
                    cells.push(
                      <div
                        key={d}
                        className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all cursor-default ${
                          isToday
                            ? 'bg-[#161314] text-white shadow-lg'
                            : hasShift
                            ? 'bg-[#f9f5f6] text-[#c3a2ab] border-2 border-[#c3a2ab]/40'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {d}
                        {hasShift && (
                          <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isToday ? 'bg-[#c3a2ab]' : 'bg-[#c3a2ab]'}`} />
                        )}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-[#161314]" /> วันนี้
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-[#c3a2ab]/60 border border-[#c3a2ab]" /> มีกะไลฟ์
                </div>
              </div>
            </div>

            {/* Upcoming Shifts */}
            <div>
              <h4 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">กะไลฟ์ที่จองไว้ (Upcoming Shifts)</h4>
              {schedules && schedules.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {schedules.slice(0, 6).map((s: any) => (
                    <div key={s.id} className="bg-white rounded-[20px] border border-gray-100 p-5 flex items-start justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#f9f5f6] rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[20px] text-[#c3a2ab]">stream</span>
                        </div>
                        <div>
                          <p className="font-black text-[#161314] text-sm">{s.platform}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {format(new Date(s.startTime), 'dd MMM yyyy')} &bull; {format(new Date(s.startTime), 'HH:mm')} – {format(new Date(s.endTime), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          s.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          s.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {s.status || 'PENDING'}
                        </span>
                        {s.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancelShiftSubmit(s.id)}
                            className="text-[10px] text-red-400 hover:text-red-600 font-bold transition-colors cursor-pointer"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-[20px]">
                  <span className="material-symbols-outlined text-5xl text-gray-200">calendar_today</span>
                  <p className="mt-3 text-gray-400 font-bold text-sm">ยังไม่มีกะไลฟ์ที่จองไว้</p>
                  <button
                    onClick={() => setShowBookModal(true)}
                    className="mt-4 px-5 py-2.5 bg-[#161314] text-white text-xs font-bold rounded-xl hover:bg-[#2a2526] transition-all cursor-pointer"
                  >
                    จองกะเลย
                  </button>
                </div>
              )}
            </div>

            {/* Leave History */}
            <div>
              <h4 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">ประวัติการลา (Leave Requests)</h4>
              {leaves.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(leaves as unknown[]).map((lv) => {
                    const l = lv as { id: string; leaveType: string; startDate: string; endDate: string; reason: string; status: string };
                    const leaveIcons: Record<string, string> = { SICK: 'medical_services', PERSONAL: 'person', VACATION: 'beach_access' };
                    const leaveColors: Record<string, string> = { SICK: 'text-red-500 bg-red-50', PERSONAL: 'text-blue-500 bg-blue-50', VACATION: 'text-teal-500 bg-teal-50' };
                    return (
                      <div key={l.id} className="bg-white rounded-[20px] border border-gray-100 p-5 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${leaveColors[l.leaveType] || 'text-gray-400 bg-gray-50'}`}>
                          <span className="material-symbols-outlined text-[20px]">{leaveIcons[l.leaveType] || 'event_note'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-black text-[#161314] text-sm">{l.leaveType}</p>
                            <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                              l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                              l.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {l.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(new Date(l.startDate), 'dd MMM')} – {format(new Date(l.endDate), 'dd MMM yyyy')}
                          </p>
                          {l.reason && <p className="text-xs text-gray-500 mt-1 truncate">{l.reason}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-[20px]">
                  <span className="material-symbols-outlined text-5xl text-gray-200">event_available</span>
                  <p className="mt-3 text-gray-400 font-bold text-sm">ไม่มีประวัติการลา</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. SUPPORT TAB */}
        {activeTab === 'support' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-black text-[#161314]">Support Tickets</h3>
                <p className="text-xs text-gray-400 mt-0.5">แจ้งปัญหาเร่งด่วน — ทีมซัพพอร์ตรับทราบทันที</p>
              </div>
              <button
                onClick={() => setShowSOSModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">sos</span>
                แจ้งปัญหาด่วน
              </button>
            </div>

            {/* Quick Issue Type Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { type: 'EQUIPMENT', icon: 'videocam_off', label: 'อุปกรณ์พัง', color: 'from-purple-50 to-purple-100/50 border-purple-200/60 text-purple-600' },
                { type: 'NETWORK', icon: 'wifi_off', label: 'เน็ตมีปัญหา', color: 'from-blue-50 to-blue-100/50 border-blue-200/60 text-blue-600' },
                { type: 'BANNED', icon: 'block', label: 'ช่องโดนแบน', color: 'from-red-50 to-red-100/50 border-red-200/60 text-red-600' },
                { type: 'OTHER', icon: 'help', label: 'ปัญหาอื่นๆ', color: 'from-gray-50 to-gray-100/50 border-gray-200/60 text-gray-500' },
              ].map(item => (
                <button
                  key={item.type}
                  onClick={() => { setIssueType(item.type); setShowSOSModal(true); }}
                  className={`flex flex-col items-center gap-2 p-4 bg-gradient-to-br ${item.color} border rounded-[20px] hover:scale-105 transition-all shadow-sm cursor-pointer`}
                >
                  <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                  <p className="text-[11px] font-bold text-center">{item.label}</p>
                </button>
              ))}
            </div>

            {/* Tickets Timeline */}
            <div>
              <h4 className="font-bold text-gray-400 uppercase tracking-widest text-xs mb-4">ประวัติ Tickets ของคุณ</h4>
              {tickets.length > 0 ? (
                <div className="space-y-3">
                  {(tickets as unknown[]).map((tick, idx) => {
                    const t = tick as { id: string; issueType: string; createdAt: string; description: string; status: string };
                    const typeConfig: Record<string, { icon: string; color: string; bg: string }> = {
                      EQUIPMENT: { icon: 'videocam_off', color: 'text-purple-600', bg: 'bg-purple-100' },
                      NETWORK: { icon: 'wifi_off', color: 'text-blue-600', bg: 'bg-blue-100' },
                      BANNED: { icon: 'block', color: 'text-red-600', bg: 'bg-red-100' },
                      OTHER: { icon: 'help', color: 'text-gray-500', bg: 'bg-gray-100' },
                    };
                    const cfg = typeConfig[t.issueType] || typeConfig.OTHER;
                    return (
                      <div key={t.id} className="bg-white rounded-[20px] border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-all">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <span className={`material-symbols-outlined text-[22px] ${cfg.color}`}>{cfg.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <p className="font-black text-[#161314] text-sm">{t.issueType}</p>
                              <span className="text-[10px] text-gray-400">{format(new Date(t.createdAt), 'dd MMM HH:mm')}</span>
                            </div>
                            <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                              t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                              t.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {t.status === 'RESOLVED' ? '✓ Resolved' : t.status === 'IN_PROGRESS' ? '⚡ In Progress' : '🔴 Open'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{t.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-[24px] border border-gray-100">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-emerald-500">check_circle</span>
                  </div>
                  <p className="font-bold text-gray-600">ทุกอย่างดูเรียบร้อย!</p>
                  <p className="text-sm text-gray-400 mt-1">ไม่มีปัญหาที่ถูกรายงาน</p>
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
              <p className="text-gray-500 mt-2 text-sm">กรุณากรอกยอดขายที่ทำได้จากไลฟ์นี้<br />เพื่อนำไปคำนวณค่าคอมมิชชั่น</p>
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
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
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

      {/* Edit Session Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#161314]">แก้ไขข้อมูลไลฟ์</h2>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-5">
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
                    value={editSalesAmount}
                    onChange={(e) => setEditSalesAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#c3a2ab] transition-all outline-none font-bold text-gray-700 text-xl"
                  />
                </div>
              </div>
              {/* Image Upload */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">แนบรูปยอดขาย (optional)</label>
                <div className="mt-2">
                  {editSalesImagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editSalesImagePreview} alt="Sales screenshot" className="w-full h-48 object-cover" />
                      <button
                        type="button"
                        onClick={() => { setEditSalesImage(null); setEditSalesImagePreview(null); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="edit-sales-image-upload" className="flex flex-col items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-[#f9f5f6] hover:border-[#c3a2ab] transition-all group">
                      <span className="material-symbols-outlined text-3xl text-gray-300 group-hover:text-[#c3a2ab] transition-colors mb-1">add_photo_alternate</span>
                      <p className="text-xs text-gray-400 font-medium">คลิกเพื่อแนบรูปสกรีนช็อตยอดขาย</p>
                      <p className="text-[10px] text-gray-300">JPG, PNG, WEBP • max 10MB</p>
                      <input
                        id="edit-sales-image-upload"
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
                          setEditSalesImage(file);
                          setEditSalesImagePreview(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setShowEditModal(false); setEditSalesImage(null); setEditSalesImagePreview(null); }} disabled={isLoading} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all">
                  ยกเลิก
                </button>
                <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-[#161314] text-white rounded-xl font-bold hover:bg-[#252122] transition-all flex justify-center items-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {isUploading ? 'อัปโหลดรูป...' : 'กำลังบันทึก...'}
                    </>
                  ) : (
                    'บันทึกข้อมูล'
                  )}
                </button>
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

      {/* Salary Report Modal */}
      <SalaryReportModal
        show={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        startDate={analyticsStartDate}
        endDate={analyticsEndDate}
      />

      {/* Book Shift Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#f9f5f6] rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#c3a2ab]">calendar_add_on</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-[#161314]">จองกะไลฟ์</h2>
                <p className="text-xs text-gray-400">กำหนดช่วงเวลาไลฟ์ของคุณล่วงหน้า</p>
              </div>
            </div>
            <form onSubmit={handleBookShiftSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">แพลตฟอร์ม</label>
                <select
                  value={bookPlatform}
                  onChange={(e) => setBookPlatform(e.target.value)}
                  className="w-full mt-1.5 px-4 py-3 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 border border-gray-100 focus:ring-2 focus:ring-[#c3a2ab] transition-all"
                >
                  {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">วันที่</label>
                <input
                  type="date"
                  required
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  className="w-full mt-1.5 px-4 py-3 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 border border-gray-100 focus:ring-2 focus:ring-[#c3a2ab] transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    required
                    value={bookStartTime}
                    onChange={(e) => setBookStartTime(e.target.value)}
                    className="w-full mt-1.5 px-4 py-3 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 border border-gray-100 focus:ring-2 focus:ring-[#c3a2ab] transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    required
                    value={bookEndTime}
                    onChange={(e) => setBookEndTime(e.target.value)}
                    className="w-full mt-1.5 px-4 py-3 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700 border border-gray-100 focus:ring-2 focus:ring-[#c3a2ab] transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBookModal(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all cursor-pointer">ยกเลิก</button>
                <button type="submit" disabled={isLoading} className="flex-[2] py-3.5 bg-[#161314] text-white rounded-2xl font-bold hover:bg-[#252122] transition-all flex justify-center items-center gap-2 cursor-pointer">
                  {isLoading ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : null}
                  {isLoading ? 'กำลังบันทึก...' : 'ยืนยันการจองกะ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confetti Canvas */}
      <canvas
        id="confetti-canvas"
        className="fixed inset-0 pointer-events-none z-[100] w-full h-full"
      />

    </div>
  );
}
