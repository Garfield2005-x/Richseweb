"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Check,
  AlertCircle,
  Mail,
  Lock,
  User,
  Loader2,
  RotateCcw,
  Archive,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  isDeleted?: boolean;
}

interface FormData {
  name: string;
  email: string;
  password: string;
}

const emptyForm: FormData = { name: "", email: "", password: "" };

export default function StaffManageClient() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");

  // Modal state: null = closed, "add" = add modal, staffId = edit modal
  const [modal, setModal] = useState<null | "add" | string>(null);
  const [confirmDelete, setConfirmDelete] = useState<StaffMember | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff?status=all");
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const openAdd = () => {
    setForm(emptyForm);
    setError("");
    setShowPassword(false);
    setModal("add");
  };

  const openEdit = (member: StaffMember) => {
    setForm({ name: member.name, email: member.email, password: "" });
    setError("");
    setShowPassword(false);
    setModal(member.id);
  };

  const closeModal = () => {
    setModal(null);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("กรุณากรอกชื่อและอีเมล");
      return;
    }
    if (modal === "add" && !form.password.trim()) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    setSaving(true);
    try {
      const isAdd = modal === "add";
      const url = isAdd ? "/api/admin/staff" : `/api/admin/staff/${modal}`;
      const method = isAdd ? "POST" : "PATCH";

      const body: Partial<FormData> = { name: form.name, email: form.email };
      if (form.password.trim()) body.password = form.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      setSuccessMsg(isAdd ? `เพิ่ม ${data.name} สำเร็จ` : `อัปเดต ${data.name} สำเร็จ`);
      setTimeout(() => setSuccessMsg(""), 3000);
      closeModal();
      fetchStaff();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    try {
      const res = await fetch(`/api/admin/staff/${confirmDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg(`ปิดใช้งาน ${confirmDelete.name} แล้ว (ประวัติยังอยู่ครบ)`);
        setTimeout(() => setSuccessMsg(""), 3000);
        setConfirmDelete(null);
        fetchStaff();
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } finally {
      setDeleting(null);
    }
  };

  const handleRestore = async (member: StaffMember) => {
    setRestoring(member.id);
    try {
      const res = await fetch(`/api/admin/staff/${member.id}/restore`, { method: "POST" });
      if (res.ok) {
        setSuccessMsg(`กู้คืนบัญชี ${member.name} สำเร็จแล้ว`);
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchStaff();
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาดในการกู้คืน");
      }
    } finally {
      setRestoring(null);
    }
  };

  const editingMember = modal && modal !== "add" ? staff.find((s) => s.id === modal) : null;
  const activeStaff = staff.filter((s) => !s.isDeleted);
  const deletedStaff = staff.filter((s) => s.isDeleted);
  const displayStaff = activeTab === "active" ? activeStaff : deletedStaff;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#c3a2ab] mb-2">
            <Users size={12} />
            Live Streamer Management (Soft Delete Protected)
          </div>
          <h1 className="text-[40px] font-display font-black text-gray-900 tracking-tight leading-none">
            จัดการพนักงานไลฟ์
          </h1>
          <p className="text-gray-400 mt-2 font-medium">
            เพิ่ม แก้ไข หรือปิดใช้งานบัญชีพนักงานไลฟ์ โดยประวัติการขึ้นไลฟ์และการลาจะไม่สูญหาย
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-[14px] hover:bg-black transition-all shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <Plus size={18} />
          เพิ่มพนักงานใหม่
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-2xl font-semibold text-[14px]">
          <Check size={18} className="shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-[14px] transition-all ${
            activeTab === "active"
              ? "bg-gray-900 text-white shadow-lg shadow-black/10"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Users size={16} />
          พนักงานใช้งานอยู่ ({activeStaff.length})
        </button>
        <button
          onClick={() => setActiveTab("deleted")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-[14px] transition-all ${
            activeTab === "deleted"
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          <Archive size={16} />
          ปิดใช้งาน / ถังขยะ ({deletedStaff.length})
        </button>
      </div>

      {/* Staff table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/[0.03] border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4 text-gray-400">
            <Loader2 size={32} className="animate-spin text-[#c3a2ab]" />
            <p className="font-medium">กำลังโหลด...</p>
          </div>
        ) : displayStaff.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-4 text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
              {activeTab === "active" ? <Users size={28} className="text-gray-300" /> : <Archive size={28} className="text-amber-300" />}
            </div>
            <p className="font-semibold">
              {activeTab === "active" ? "ยังไม่มีพนักงานในระบบ" : "ไม่มีพนักงานที่ถูกปิดใช้งาน"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/60">
                <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  #
                </th>
                <th className="text-left px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  ชื่อ
                </th>
                <th className="text-left px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 hidden md:table-cell">
                  อีเมล
                </th>
                <th className="text-left px-4 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  สถานะ
                </th>
                <th className="text-right px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayStaff.map((member, index) => (
                <tr
                  key={member.id}
                  className="group hover:bg-[#faf8f9] transition-colors"
                >
                  <td className="px-8 py-5 text-[13px] font-black text-gray-300">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${member.isDeleted ? 'bg-amber-100 text-amber-600' : 'bg-[#c3a2ab]/10 text-[#c3a2ab]'} flex items-center justify-center font-black text-[16px] shrink-0`}>
                        {member.name.slice(-1)}
                      </div>
                      <span className={`font-bold text-[15px] ${member.isDeleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-5 hidden md:table-cell">
                    <span className="text-[13px] text-gray-500 font-medium">
                      {member.email}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    {member.isDeleted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                        <Archive size={12} /> ปิดใช้งาน
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <Check size={12} /> ใช้งานอยู่
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      {member.isDeleted ? (
                        <button
                          onClick={() => handleRestore(member)}
                          disabled={restoring === member.id}
                          className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all border border-amber-200"
                        >
                          {restoring === member.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <RotateCcw size={13} />
                          )}
                          กู้คืนบัญชี
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => openEdit(member)}
                            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                          >
                            <Pencil size={13} />
                            แก้ไข
                          </button>
                          <button
                            onClick={() => setConfirmDelete(member)}
                            className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                          >
                            <Trash2 size={13} />
                            ปิดใช้งาน
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/20 w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-[26px] font-display font-black text-gray-900">
                  {modal === "add" ? "เพิ่มพนักงานใหม่" : "แก้ไขข้อมูล"}
                </h2>
                {editingMember && (
                  <p className="text-[13px] text-gray-400 mt-1">{editingMember.name}</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  ชื่อ
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="คุณชื่อ..."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]/20 text-[15px] font-medium transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  อีเมล
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="email@richse-staff.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]/20 text-[15px] font-medium transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  รหัสผ่าน{modal !== "add" && <span className="normal-case font-normal ml-1">(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</span>}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={modal === "add" ? "ตั้งรหัสผ่าน..." : "ใส่รหัสใหม่ (ถ้าต้องการเปลี่ยน)"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:border-[#c3a2ab] focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]/20 text-[15px] font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-[13px] font-semibold bg-red-50 px-4 py-3 rounded-xl">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={closeModal}
                className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-bold text-[14px] hover:bg-gray-50 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3.5 rounded-2xl bg-gray-900 text-white font-bold text-[14px] hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-black/10"
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" /> กำลังบันทึก...</>
                ) : (
                  <><Check size={16} /> {modal === "add" ? "เพิ่มพนักงาน" : "บันทึก"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/20 w-full max-w-sm p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-6">
              <Archive size={26} />
            </div>
            <h2 className="text-[22px] font-display font-black text-gray-900 text-center mb-2">
              ยืนยันการปิดใช้งาน?
            </h2>
            <p className="text-center text-gray-500 text-[14px] font-medium mb-6">
              คุณกำลังจะปิดใช้งานบัญชีของ{" "}
              <span className="font-black text-gray-900">{confirmDelete.name}</span>
            </p>
            <div className="p-4 bg-emerald-50 rounded-2xl text-[12px] text-emerald-800 font-medium mb-6 border border-emerald-100 flex items-start gap-2">
              <Check size={16} className="shrink-0 text-emerald-600 mt-0.5" />
              <span>ประวัติการขึ้นไลฟ์และการลาทั้งหมดจะถูกบันทึกไว้อย่างปลอดภัย และคุณสามารถกดกู้คืนบัญชีได้ตลอดเวลา</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-[14px] hover:bg-gray-50 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deleting}
                className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-bold text-[14px] hover:bg-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-amber-500/20"
              >
                {deleting ? (
                  <><Loader2 size={15} className="animate-spin" /> กำลังย้าย...</>
                ) : (
                  <><Archive size={15} /> ปิดใช้งาน</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
