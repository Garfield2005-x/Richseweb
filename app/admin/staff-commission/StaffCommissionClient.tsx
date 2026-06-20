'use client';

import { useEffect, useState } from 'react';

interface StaffUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  baseSalary: number;
  commissionRate: number;
  baseSalaryShopee: number;
  commissionRateShopee: number;
}

interface EditState {
  commissionRate: string;
  baseSalary: string;
  commissionRateShopee: string;
  baseSalaryShopee: string;
}

export default function StaffCommissionClient() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMap, setEditMap] = useState<Record<string, EditState>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [successMap, setSuccessMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff-commission');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        const initial: Record<string, EditState> = {};
        for (const u of data.users) {
          initial[u.id] = {
            commissionRate: (u.commissionRate * 100).toFixed(1),
            baseSalary: u.baseSalary.toString(),
            commissionRateShopee: (u.commissionRateShopee * 100).toFixed(1),
            baseSalaryShopee: u.baseSalaryShopee.toString(),
          };
        }
        setEditMap(initial);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  function handleChange(userId: string, field: keyof EditState, value: string) {
    setEditMap((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
    setSuccessMap((prev) => ({ ...prev, [userId]: false }));
    setErrorMap((prev) => ({ ...prev, [userId]: '' }));
  }

  async function handleSave(user: StaffUser) {
    const edit = editMap[user.id];
    const commissionRate = parseFloat(edit.commissionRate) / 100;
    const baseSalary = parseFloat(edit.baseSalary);
    const commissionRateShopee = parseFloat(edit.commissionRateShopee) / 100;
    const baseSalaryShopee = parseFloat(edit.baseSalaryShopee);

    if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 1) {
      setErrorMap((prev) => ({ ...prev, [user.id]: 'ค่าคอม TikTok/อื่นๆ ต้องอยู่ระหว่าง 0–100%' }));
      return;
    }
    if (isNaN(baseSalary) || baseSalary < 0) {
      setErrorMap((prev) => ({ ...prev, [user.id]: 'เงินเดือน TikTok/อื่นๆ ต้องมากกว่าหรือเท่ากับ 0' }));
      return;
    }
    if (isNaN(commissionRateShopee) || commissionRateShopee < 0 || commissionRateShopee > 1) {
      setErrorMap((prev) => ({ ...prev, [user.id]: 'ค่าคอม Shopee ต้องอยู่ระหว่าง 0–100%' }));
      return;
    }
    if (isNaN(baseSalaryShopee) || baseSalaryShopee < 0) {
      setErrorMap((prev) => ({ ...prev, [user.id]: 'เงินเดือน Shopee ต้องมากกว่าหรือเท่ากับ 0' }));
      return;
    }

    setSaving((prev) => ({ ...prev, [user.id]: true }));
    setErrorMap((prev) => ({ ...prev, [user.id]: '' }));

    try {
      const res = await fetch('/api/admin/staff-commission', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, commissionRate, baseSalary, commissionRateShopee, baseSalaryShopee }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMap((prev) => ({ ...prev, [user.id]: true }));
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, commissionRate, baseSalary, commissionRateShopee, baseSalaryShopee } : u
          )
        );
        setTimeout(() => setSuccessMap((prev) => ({ ...prev, [user.id]: false })), 2500);
      } else {
        setErrorMap((prev) => ({ ...prev, [user.id]: data.error || 'เกิดข้อผิดพลาด' }));
      }
    } catch {
      setErrorMap((prev) => ({ ...prev, [user.id]: 'เกิดข้อผิดพลาดในการบันทึก' }));
    } finally {
      setSaving((prev) => ({ ...prev, [user.id]: false }));
    }
  }

  function isDirty(user: StaffUser) {
    const edit = editMap[user.id];
    if (!edit) return false;
    return (
      Math.abs(parseFloat(edit.commissionRate) / 100 - user.commissionRate) > 0.0001 ||
      Math.abs(parseFloat(edit.baseSalary) - user.baseSalary) > 0.01 ||
      Math.abs(parseFloat(edit.commissionRateShopee) / 100 - user.commissionRateShopee) > 0.0001 ||
      Math.abs(parseFloat(edit.baseSalaryShopee) - user.baseSalaryShopee) > 0.01
    );
  }

  const PRESET_OTHER = [3, 5, 8, 10];
  const PRESET_SHOPEE = [3, 5, 8];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-[32px] text-indigo-600">percent</span>
          <h1 className="text-2xl font-bold text-gray-900">จัดการค่าคอมพนักงาน</h1>
        </div>
        <p className="text-gray-500 text-sm">
          ตั้งค่าอัตราค่าคอมมิชชั่นและเงินเดือนพื้นฐานแยกตามแพลตฟอร์มสำหรับพนักงานแต่ละคน
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <span className="material-symbols-outlined text-indigo-500 mt-0.5">info</span>
        <div className="text-sm text-indigo-800 space-y-1">
          <p className="font-semibold mb-1">วิธีคำนวณ</p>
          <p>① หักลา = (เงินเดือน TikTok ÷ จำนวนวัน) × จำนวนวันลา</p>
          <p>② เงินเดือนสุทธิ = (เงินเดือน TikTok − หักลา, ไม่ต่ำกว่า 0) + เงินเดือน Shopee</p>
          <p>③ รวม = เงินเดือนสุทธิ + ค่าคอม Shopee + ค่าคอม TikTok/อื่นๆ</p>
          <p>④ หัก 3% ภาษี (ขั้นตอนสุดท้าย) → เงินสุทธิ = รวม − (รวม × 3%)</p>
          <p className="pt-1 text-indigo-600 font-medium">ค่าคอม Shopee = ยอดขาย Shopee × อัตรา Shopee</p>
          <p className="text-indigo-600 font-medium">ค่าคอม TikTok/อื่นๆ = ยอดขาย TikTok/อื่นๆ × อัตรา TikTok/อื่นๆ</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">กำลังโหลดข้อมูล...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-3 block">group_off</span>
          ไม่พบพนักงานในระบบ
        </div>
      ) : (
        <div className="space-y-5">
          {users.map((user) => {
            const edit = editMap[user.id] || { commissionRate: '0', baseSalary: '0', commissionRateShopee: '0', baseSalaryShopee: '0' };
            const isSaving = saving[user.id];
            const isSuccess = successMap[user.id];
            const error = errorMap[user.id];
            const changed = isDirty(user);

            const totalBaseSalary = user.baseSalary + user.baseSalaryShopee;

            return (
              <div
                key={user.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 overflow-hidden ${
                  isSuccess ? 'border-green-300 shadow-green-100' : changed ? 'border-indigo-300 shadow-indigo-50' : 'border-gray-200'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg select-none">
                      {(user.name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name || '(ไม่มีชื่อ)'}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-900 text-white">
                      ฿{totalBaseSalary.toLocaleString()} รวม
                    </span>
                  </div>
                </div>

                {/* Two-Column Platform Settings */}
                <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* ── TikTok / Other ── */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-gray-700">🎵 TikTok & อื่นๆ</span>
                    </div>

                    {/* Commission Rate Other */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        ค่าคอม (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={edit.commissionRate}
                            onChange={(e) => handleChange(user.id, 'commissionRate', e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm bg-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                        </div>
                        <div className="flex gap-1">
                          {PRESET_OTHER.map((rate) => (
                            <button
                              key={rate}
                              onClick={() => handleChange(user.id, 'commissionRate', rate.toString())}
                              className={`text-xs px-2 py-1.5 rounded-lg font-semibold transition-colors ${
                                parseFloat(edit.commissionRate) === rate
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
                              }`}
                            >
                              {rate}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Base Salary Other */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        เงินเดือน (฿)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">฿</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={edit.baseSalary}
                          onChange={(e) => handleChange(user.id, 'baseSalary', e.target.value)}
                          className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm bg-white"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400">
                      ปัจจุบัน: {(user.commissionRate * 100).toFixed(1)}% · ฿{user.baseSalary.toLocaleString()}
                    </p>
                  </div>

                  {/* ── Shopee ── */}
                  <div className="bg-orange-50 rounded-xl p-4 space-y-3 border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-bold text-orange-700">🛒 Shopee</span>
                    </div>

                    {/* Commission Rate Shopee */}
                    <div>
                      <label className="block text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1.5">
                        ค่าคอม Shopee (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={edit.commissionRateShopee}
                            onChange={(e) => handleChange(user.id, 'commissionRateShopee', e.target.value)}
                            className="w-full border border-orange-200 rounded-xl px-4 py-2.5 pr-8 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 text-sm font-bold">%</span>
                        </div>
                        <div className="flex gap-1">
                          {PRESET_SHOPEE.map((rate) => (
                            <button
                              key={rate}
                              onClick={() => handleChange(user.id, 'commissionRateShopee', rate.toString())}
                              className={`text-xs px-2 py-1.5 rounded-lg font-semibold transition-colors ${
                                parseFloat(edit.commissionRateShopee) === rate
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-white border border-orange-200 text-orange-600 hover:bg-orange-100'
                              }`}
                            >
                              {rate}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Base Salary Shopee */}
                    <div>
                      <label className="block text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1.5">
                        เงินเดือน Shopee (฿)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 text-sm font-bold">฿</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={edit.baseSalaryShopee}
                          onChange={(e) => handleChange(user.id, 'baseSalaryShopee', e.target.value)}
                          className="w-full border border-orange-200 rounded-xl pl-8 pr-4 py-2.5 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm bg-white"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-orange-500">
                      ปัจจุบัน: {(user.commissionRateShopee * 100).toFixed(1)}% · ฿{user.baseSalaryShopee.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Error + Save Footer */}
                <div className="px-6 pb-5 space-y-3">
                  {error && (
                    <p className="text-xs text-red-600 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      {error}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-400">
                      เงินเดือนรวม: <span className="font-semibold text-gray-700">฿{(user.baseSalary + user.baseSalaryShopee).toLocaleString()}</span>
                    </p>
                    <button
                      onClick={() => handleSave(user)}
                      disabled={isSaving || !changed}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                        isSuccess
                          ? 'bg-green-500 text-white cursor-default'
                          : changed
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          กำลังบันทึก...
                        </>
                      ) : isSuccess ? (
                        <>
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          บันทึกแล้ว!
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          บันทึก
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
