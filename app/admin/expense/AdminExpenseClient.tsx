'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Receipt, Clock, CheckCircle2, XCircle, Download, ChevronDown,
  ChevronUp, Loader2, Search, Filter, User, Building2, CreditCard,
  Check, X, Trash2
} from 'lucide-react';

interface ExpenseItem {
  no: string;
  description: string;
  purpose: string;
  amount: string | number;
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
  user: { id: string; name: string | null; email: string | null };
}

const statusConfig = {
  PENDING: { label: 'รอดำเนินการ', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  APPROVED: { label: 'อนุมัติแล้ว', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  REJECTED: { label: 'ไม่อนุมัติ', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
};

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdminExpenseClient() {
  const [requests, setRequests] = useState<ExpenseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state for approve/reject
  const [actionModal, setActionModal] = useState<{ id: string; action: 'APPROVED' | 'REJECTED' } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/expense');
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch {
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/expense')
      .then((r) => r.json())
      .then((data) => { if (!cancelled && data.success) setRequests(data.requests); })
      .catch(() => toast.error('ไม่สามารถโหลดข้อมูลได้'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = requests.filter(req => {
    const matchStatus = filterStatus === 'ALL' || req.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || req.employeeName.toLowerCase().includes(q) || req.user?.email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  };

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
      toast.success('ดาวน์โหลดสำเร็จ', { id: toastId });
    } catch {
      toast.error('ดาวน์โหลดไม่สำเร็จ', { id: toastId });
    }
  };

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

  const openActionModal = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setActionModal({ id, action });
    setAdminNote('');
  };

  const handleStatusUpdate = async () => {
    if (!actionModal) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/expense/${actionModal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: actionModal.action, adminNote }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(actionModal.action === 'APPROVED' ? 'อนุมัติใบเบิกแล้ว' : 'ปฏิเสธใบเบิกแล้ว');
        setActionModal(null);
        fetchRequests();
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSaving(false);
    }
  };

  const totalPending = counts.PENDING;
  const totalApprovedAmount = requests
    .filter(r => r.status === 'APPROVED')
    .reduce((s, r) => s + Number(r.totalAmount), 0);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen font-sans">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#c3a2ab] mb-2">
          <Receipt size={12} />
          Expense Management System
        </div>
        <h1 className="text-[40px] font-display font-black text-gray-900 tracking-tight leading-none">
          จัดการใบเบิก
        </h1>
        <p className="text-gray-400 mt-2 font-medium">อนุมัติหรือปฏิเสธใบเบิกค่าใช้จ่าย และดาวน์โหลดเอกสาร</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'ทั้งหมด', value: counts.ALL, color: 'from-gray-50 to-gray-100', text: 'text-gray-900', border: 'border-gray-200' },
          { label: 'รอดำเนินการ', value: counts.PENDING, color: 'from-amber-50 to-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
          { label: 'อนุมัติแล้ว', value: counts.APPROVED, color: 'from-emerald-50 to-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
          { label: 'ไม่อนุมัติ', value: counts.REJECTED, color: 'from-red-50 to-red-100', text: 'text-red-600', border: 'border-red-200' },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 border ${card.border}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{card.label}</p>
            <p className={`text-[32px] font-black ${card.text} leading-none`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Total approved amount */}
      {totalApprovedAmount > 0 && (
        <div className="mb-6 bg-gradient-to-r from-[#161314] to-[#2a2526] rounded-2xl px-6 py-4 flex justify-between items-center">
          <div>
            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">ยอดรวมที่อนุมัติ</p>
            <p className="text-white font-black text-[28px]">฿{totalApprovedAmount.toLocaleString('th-TH')}</p>
          </div>
          {totalPending > 0 && (
            <div className="bg-amber-400 text-black rounded-2xl px-4 py-2 font-black text-sm">
              รอ {totalPending} รายการ
            </div>
          )}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]/20 text-[14px] font-medium transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as FilterStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 rounded-2xl text-[12px] font-bold transition-all ${
                filterStatus === s
                  ? 'bg-gray-900 text-white shadow-lg shadow-black/10'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {s === 'ALL' ? 'ทั้งหมด' : statusConfig[s as keyof typeof statusConfig].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#c3a2ab]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Receipt size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">ไม่พบรายการใบเบิก</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const cfg = statusConfig[req.status];
            const Icon = cfg.icon;
            const isExpanded = expandedId === req.id;

            return (
              <div key={req.id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
                {/* Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={cfg.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-gray-900 text-[15px]">{req.employeeName}</p>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                      {req.position} · ฿{Number(req.totalAmount).toLocaleString('th-TH')} · {' '}
                      {new Date(req.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'PENDING' && (
                      <>
                        <button
                          onClick={e => { e.stopPropagation(); openActionModal(req.id, 'APPROVED'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[12px] font-bold transition-all border border-emerald-200"
                          title="อนุมัติ"
                        >
                          <Check size={13} /> อนุมัติ
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); openActionModal(req.id, 'REJECTED'); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-[12px] font-bold transition-all border border-red-200"
                          title="ปฏิเสธ"
                        >
                          <X size={13} /> ปฏิเสธ
                        </button>
                      </>
                    )}
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
                    {/* Staff info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'ชื่อ', value: req.employeeName, icon: User },
                        { label: 'ตำแหน่ง', value: req.position, icon: User },
                        { label: 'ธนาคาร', value: req.bankName, icon: Building2 },
                        { label: 'เลขบัญชี', value: req.accountNumber, icon: CreditCard },
                      ].map(f => (
                        <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{f.label}</p>
                          <p className="text-[13px] font-bold text-gray-900">{f.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Items */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-2 px-2 text-[9px] font-black uppercase tracking-widest text-gray-400 w-8">#</th>
                            <th className="text-left py-2 px-2 text-[9px] font-black uppercase tracking-widest text-gray-400">รายการ</th>
                            <th className="text-left py-2 px-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hidden sm:table-cell">วัตถุประสงค์</th>
                            <th className="text-right py-2 px-2 text-[9px] font-black uppercase tracking-widest text-gray-400">จำนวน (฿)</th>
                            <th className="text-left py-2 px-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hidden md:table-cell">หมายเหตุ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(req.items as ExpenseItem[]).map((item, i) => (
                            <tr key={i} className="border-b border-gray-50">
                              <td className="py-2 px-2 text-gray-400 font-bold">{i + 1}</td>
                              <td className="py-2 px-2 font-medium text-gray-900">{item.description}</td>
                              <td className="py-2 px-2 text-gray-500 hidden sm:table-cell">{item.purpose}</td>
                              <td className="py-2 px-2 text-right font-bold text-gray-900">{Number(item.amount).toLocaleString('th-TH')}</td>
                              <td className="py-2 px-2 text-gray-400 hidden md:table-cell">{item.note}</td>
                            </tr>
                          ))}
                          <tr className="font-black">
                            <td colSpan={2} />
                            <td className="py-3 px-2 text-right text-[14px] text-gray-900" colSpan={3}>
                              รวมทั้งหมด ฿{Number(req.totalAmount).toLocaleString('th-TH')}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Admin note */}
                    {req.adminNote && (
                      <div className={`p-3 rounded-xl text-[13px] font-medium ${req.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        <span className="font-black">หมายเหตุ Admin: </span>{req.adminNote}
                      </div>
                    )}

                    {/* Image receipts */}
                    {req.imageUrls?.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">หลักฐาน / สลิป</p>
                        <div className="flex flex-wrap gap-2">
                          {req.imageUrls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-xl overflow-hidden border border-gray-200 hover:scale-105 transition-transform">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={`receipt-${i + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Approve / Reject Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/20 w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
              actionModal.action === 'APPROVED' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
            }`}>
              {actionModal.action === 'APPROVED' ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
            </div>
            <h2 className="text-[22px] font-black text-gray-900 text-center mb-2">
              {actionModal.action === 'APPROVED' ? 'ยืนยันการอนุมัติ' : 'ยืนยันการปฏิเสธ'}
            </h2>
            <p className="text-center text-gray-400 text-[14px] mb-6">
              {actionModal.action === 'APPROVED'
                ? 'ใบเบิกนี้จะถูกอนุมัติและพนักงานจะได้รับการแจ้ง'
                : 'ใบเบิกนี้จะถูกปฏิเสธ'}
            </p>
            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                หมายเหตุ (ถ้ามี)
              </label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={3}
                placeholder={actionModal.action === 'REJECTED' ? 'ระบุเหตุผลที่ปฏิเสธ...' : 'หมายเหตุเพิ่มเติม...'}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none text-[14px] font-medium transition-all resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={saving}
                className={`flex-1 py-3.5 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                  actionModal.action === 'APPROVED'
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                    : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20'
                }`}
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" /> กำลังบันทึก...</>
                ) : (
                  <>{actionModal.action === 'APPROVED' ? <><Check size={16} /> อนุมัติ</> : <><X size={16} /> ปฏิเสธ</>}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
