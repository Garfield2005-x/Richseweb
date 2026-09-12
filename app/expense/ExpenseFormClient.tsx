'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  Plus, Trash2, Download, FileText, Clock, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, Upload, X, Loader2, Receipt,
  Building2, CreditCard, User, Briefcase
} from 'lucide-react';

// ---- Types ----
interface ExpenseItem {
  description: string;
  purpose: string;
  amount: string;
  note: string;
}

interface ExpenseRequest {
  id: string;
  date: string;
  employeeName: string;
  position: string;
  accountNumber: string;
  bankName: string;
  items: ExpenseItem[];
  totalAmount: number;
  imageUrls: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote: string | null;
  createdAt: string;
}

const BANKS = [
  'ธนาคารกรุงเทพ (BBL)',
  'ธนาคารกสิกรไทย (KBANK)',
  'ธนาคารกรุงไทย (KTB)',
  'ธนาคารไทยพาณิชย์ (SCB)',
  'ธนาคารกรุงศรีอยุธยา (BAY)',
  'ธนาคารออมสิน (GSB)',
  'ธนาคารอาคารสงเคราะห์ (GHB)',
  'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)',
  'ธนาคารทหารไทยธนชาต (TTB)',
  'ธนาคารซีไอเอ็มบีไทย (CIMB)',
  'ธนาคารยูโอบี (UOB)',
  'ธนาคารแลนด์แอนด์เฮ้าส์ (LH Bank)',
];

const emptyItem = (): ExpenseItem => ({ description: '', purpose: '', amount: '', note: '' });

const statusConfig = {
  PENDING: { label: 'รอดำเนินการ', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  APPROVED: { label: 'อนุมัติแล้ว', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  REJECTED: { label: 'ไม่อนุมัติ', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
};

export default function ExpenseFormClient() {
  // Form state
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [employeeName, setEmployeeName] = useState('');
  const [position, setPosition] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [items, setItems] = useState<ExpenseItem[]>([emptyItem()]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // List state
  const [requests, setRequests] = useState<ExpenseRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Computed
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);


  // Fetch requests helper (used after submit to refresh list)
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/expense');
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch {
      toast.error('ไม่สามารถโหลดรายการได้');
    }
  };

  // Load profile & history
  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [profRes, reqRes] = await Promise.all([
          fetch('/api/expense/profile'),
          fetch('/api/expense'),
        ]);
        const profData = await profRes.json().catch(() => ({}));
        const reqData = await reqRes.json().catch(() => ({}));
        if (ignore) return;
        if (profData?.success && profData.user) {
          setEmployeeName(profData.user.name || '');
          setPosition(profData.user.position || '');
          setBankName(profData.user.bankName || '');
          setAccountNumber(profData.user.accountNumber || '');
        }
        if (reqData?.success) {
          setRequests(reqData.requests);
        }
      } catch {
        // ignore
      } finally {
        if (!ignore) setLoadingRequests(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newUrls: string[] = [];
    let errorMsg = '';

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json().catch(() => ({}));
        
        if (res.ok && data.url) {
          newUrls.push(data.url);
        } else {
          errorMsg = data.error || `อัปโหลดไฟล์ ${file.name} ไม่สำเร็จ`;
          break;
        }
      }

      if (newUrls.length > 0) {
        setImageUrls(prev => [...prev, ...newUrls]);
        toast.success(`อัปโหลดสำเร็จ ${newUrls.length} ไฟล์`);
      }
      
      if (errorMsg) {
        toast.error(errorMsg);
      }
    } catch (err: unknown) {
      console.error('Upload error:', err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Items handlers
  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof ExpenseItem, value: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // Submit → บันทึก + ดาวน์โหลด docx ทันที
  const handleSubmit = async () => {
    if (!employeeName.trim() || !position.trim() || !accountNumber.trim() || !bankName.trim()) {
      toast.error('กรุณากรอกข้อมูลส่วนตัวให้ครบ');
      return;
    }
    if (items.some(item => !item.description.trim() || !item.amount)) {
      toast.error('กรุณากรอกรายการและจำนวนเงินให้ครบ');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('กำลังสร้างเอกสาร...');
    try {
      // 1. บันทึกลง DB (ไม่ต้องเก็บภาพแล้ว)
      const res = await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          employeeName,
          position,
          accountNumber,
          bankName,
          items: items.map((item, idx) => ({ no: String(idx + 1), ...item })),
          totalAmount,
          imageUrls: [], // ไม่เก็บภาพใน DB
        }),
      });

      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || 'เกิดข้อผิดพลาด', { id: toastId });
        return;
      }

      const expenseId = data.expense.id;

      // 2. ดาวน์โหลด docx พร้อมภาพ (ส่ง imageUrls ไปใน query)
      const urlParams = new URLSearchParams();
      imageUrls.forEach(u => urlParams.append('img', u));
      const docxRes = await fetch(
        `/api/expense/${expenseId}/docx?${urlParams.toString()}`
      );

      if (!docxRes.ok) throw new Error('สร้างเอกสารไม่สำเร็จ');

      const blob = await docxRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense_${employeeName.replace(/\s+/g, '_')}.docx`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('ส่งใบเบิกและดาวน์โหลดเอกสารสำเร็จ!', { id: toastId });

      // 3. Reset form
      setItems([emptyItem()]);
      setImageUrls([]);
      setDate(new Date().toISOString().split('T')[0]);
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการสร้างเอกสาร', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Download docx
  const handleDownload = async (id: string, name: string) => {
    const toastId = toast.loading('กำลังสร้างเอกสาร...');
    try {
      const res = await fetch(`/api/expense/${id}/docx`);
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense_${name}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('ดาวน์โหลดเอกสารสำเร็จ', { id: toastId });
    } catch {
      toast.error('ไม่สามารถดาวน์โหลดเอกสารได้', { id: toastId });
    }
  };

  // Delete expense
  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณต้องการลบใบเบิกค่าใช้จ่ายนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }
    const toastId = toast.loading('กำลังลบใบเบิก...');
    try {
      const res = await fetch(`/api/expense/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id));
        toast.success('ลบใบเบิกเรียบร้อยแล้ว', { id: toastId });
      } else {
        toast.error(data.error || 'ไม่สามารถลบใบเบิกได้', { id: toastId });
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf8f9] via-white to-[#f8f5f9] p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#c3a2ab] mb-2">
            <Receipt size={12} />
            Expense Request System
          </div>
          <h1 className="text-[36px] sm:text-[44px] font-black text-gray-900 tracking-tight leading-none">
            ใบเบิกค่าใช้จ่าย
          </h1>
          <p className="text-gray-400 mt-2 font-medium text-sm">
            กรอกรายการค่าใช้จ่ายที่ต้องการเบิก แล้วดาวน์โหลดเป็นเอกสาร
          </p>
        </div>

        {/* ═══════════════════════════════════ FORM CARD ═══════════════════════════════════ */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-black/[0.04] border border-gray-100 overflow-hidden">

          {/* Form Header */}
          <div className="bg-gradient-to-r from-[#161314] to-[#2a2526] px-6 py-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-[18px]">กรอกใบเบิกใหม่</h2>
              <p className="text-white/50 text-xs font-medium">บริษัท ริชเซ สกิน8 จำกัด</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* วันที่ */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">วันที่</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]/20 text-[15px] font-medium transition-all"
              />
            </div>

            {/* ข้อมูลพนักงาน */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">ชื่อพนักงาน</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={employeeName}
                    onChange={e => setEmployeeName(e.target.value)}
                    placeholder="ชื่อ-นามสกุล..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]/20 text-[15px] font-medium transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">ตำแหน่ง</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    placeholder="ตำแหน่งงาน..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]/20 text-[15px] font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ข้อมูลธนาคาร */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">ธนาคาร</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                  <select
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]/20 text-[15px] font-medium transition-all appearance-none bg-white"
                  >
                    <option value="">-- เลือกธนาคาร --</option>
                    {BANKS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">เลขที่บัญชี</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="000-0-00000-0"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]/20 text-[15px] font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {/* ═══ รายการ ═══ */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">รายการค่าใช้จ่าย</label>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-[12px] font-bold hover:bg-black transition-all"
                >
                  <Plus size={13} />
                  เพิ่มรายการ
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative group">
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <span className="text-[10px] font-black text-gray-300">#{idx + 1}</span>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(idx)}
                          className="w-6 h-6 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-all"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-12">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">รายการ / ชื่อสินค้า</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateItem(idx, 'description', e.target.value)}
                          placeholder="เช่น ค่าน้ำมัน, ค่าอาหาร..."
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none text-[14px] font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">วัตถุประสงค์</label>
                        <input
                          type="text"
                          value={item.purpose}
                          onChange={e => updateItem(idx, 'purpose', e.target.value)}
                          placeholder="เพื่ออะไร..."
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none text-[14px] font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">จำนวนเงิน (บาท)</label>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={e => updateItem(idx, 'amount', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none text-[14px] font-medium transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-1">หมายเหตุ</label>
                        <input
                          type="text"
                          value={item.note}
                          onChange={e => updateItem(idx, 'note', e.target.value)}
                          placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none text-[14px] font-medium transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 bg-gradient-to-r from-[#161314] to-[#2a2526] text-white rounded-2xl px-6 py-4 flex justify-between items-center">
                <span className="font-bold text-sm text-white/70">ยอดรวมทั้งหมด</span>
                <span className="font-black text-[24px]">฿{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* ═══ รูปภาพหลักฐาน ═══ */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">รูปสลิป / หลักฐาน</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-[#c3a2ab] rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 bg-gray-50 group-hover:bg-[#f9f5f6] rounded-2xl flex items-center justify-center transition-all">
                  {uploadingImages ? (
                    <Loader2 size={20} className="text-[#c3a2ab] animate-spin" />
                  ) : (
                    <Upload size={20} className="text-gray-400 group-hover:text-[#c3a2ab] transition-colors" />
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-500 group-hover:text-[#c3a2ab] transition-colors">
                  {uploadingImages ? 'กำลังอัปโหลด...' : 'คลิกเพื่ออัปโหลดรูป'}
                </p>
                <p className="text-[11px] text-gray-400">JPG, PNG, WEBP (สูงสุด 5 ไฟล์)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />

              {imageUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`slip-${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-[#c3a2ab] to-[#a07882] text-white rounded-2xl font-black text-[16px] hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#c3a2ab]/30 disabled:opacity-60"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> กำลังส่ง...</>
              ) : (
                <><FileText size={18} /> ส่งใบเบิก</>
              )}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════ HISTORY ═══════════════════════════════════ */}
        <div>
          <h2 className="text-[22px] font-black text-gray-900 mb-4">ประวัติใบเบิก</h2>

          {loadingRequests ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-[#c3a2ab]" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Receipt size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">ยังไม่มีรายการใบเบิก</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => {
                const cfg = statusConfig[req.status];
                const Icon = cfg.icon;
                const isExpanded = expandedId === req.id;

                return (
                  <div key={req.id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    {/* Row header */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={18} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900 text-[15px]">
                            ฿{Number(req.totalAmount).toLocaleString('th-TH')}
                          </p>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                          {' · '}{(req.items as ExpenseItem[]).length} รายการ
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); handleDownload(req.id, req.employeeName); }}
                          className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                          title="ดาวน์โหลด .docx"
                        >
                          <Download size={15} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(req.id); }}
                          className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all"
                          title="ลบใบเบิก"
                        >
                          <Trash2 size={15} />
                        </button>
                        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
                        {/* Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: 'ชื่อ', value: req.employeeName },
                            { label: 'ตำแหน่ง', value: req.position },
                            { label: 'ธนาคาร', value: req.bankName },
                            { label: 'เลขบัญชี', value: req.accountNumber },
                          ].map(f => (
                            <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{f.label}</p>
                              <p className="text-[13px] font-bold text-gray-900">{f.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Items table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-[13px]">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="text-left py-2 px-2 text-[9px] font-black uppercase tracking-widest text-gray-400 w-8">#</th>
                                <th className="text-left py-2 px-2 text-[9px] font-black uppercase tracking-widest text-gray-400">รายการ</th>
                                <th className="text-left py-2 px-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hidden sm:table-cell">วัตถุประสงค์</th>
                                <th className="text-right py-2 px-2 text-[9px] font-black uppercase tracking-widest text-gray-400">จำนวน (฿)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(req.items as ExpenseItem[]).map((item, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                  <td className="py-2 px-2 text-gray-400 font-bold">{i + 1}</td>
                                  <td className="py-2 px-2 font-medium text-gray-900">{item.description}</td>
                                  <td className="py-2 px-2 text-gray-500 hidden sm:table-cell">{item.purpose}</td>
                                  <td className="py-2 px-2 text-right font-bold text-gray-900">{Number(item.amount).toLocaleString('th-TH')}</td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={2} />
                                <td className="py-2 px-2 text-right font-black text-[14px] text-gray-900" colSpan={2}>
                                  รวม ฿{Number(req.totalAmount).toLocaleString('th-TH')}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Admin note */}
                        {req.adminNote && (
                          <div className={`p-3 rounded-xl text-[13px] font-medium ${req.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            <span className="font-black">หมายเหตุจาก Admin: </span>{req.adminNote}
                          </div>
                        )}

                        {/* ภาพแนบอยู่ในไฟล์ .docx ที่ดาวน์โหลดแล้ว */}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
