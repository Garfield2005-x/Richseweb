"use client";

import { useState, useEffect } from "react";

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    code: "",
    discount_percent: "",
    min_purchase: "",
    max_usage: "",
    max_discount: "",
    usage_limit_per_user: 1,
    active: true,
  });
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [usageHistory, setUsageHistory] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [selectedDiscountId, setSelectedDiscountId] = useState(null);
  const [fetchingUsage, setFetchingUsage] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  async function fetchDiscounts() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/discounts");
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data);
      }
    } catch (error) {
      console.error("Failed to load discounts", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleOpenModal = (discount = null) => {
    if (discount) {
      setFormData({
        code: discount.code,
        discount_percent: discount.discount_percent,
        min_purchase: discount.min_purchase || "",
        max_usage: discount.max_usage || "",
        max_discount: discount.max_discount || "",
        usage_limit_per_user: discount.usage_limit_per_user || 1,
        active: discount.active,
      });
      setEditMode(true);
      setEditingId(discount.id);
    } else {
      setFormData({
        code: "",
        discount_percent: "",
        min_purchase: "",
        max_usage: "",
        max_discount: "",
        usage_limit_per_user: 1,
        active: true,
      });
      setEditMode(false);
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editMode ? `/api/admin/discounts/${editingId}` : "/api/admin/discounts";
      const method = editMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchDiscounts();
        handleCloseModal();
      } else {
        alert(`Failed to ${editMode ? "update" : "create"} discount code`);
      }
    } catch (error) {
      console.error(error);
      alert(`Error ${editMode ? "updating" : "saving"} discount code`);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (res.ok) {
         setDiscounts(discounts.map(d => d.id === id ? { ...d, active: !currentActive } : d));
      }
    } catch(err) {
      console.error(err);
      alert("Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this code?")) return;

    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchDiscounts();
      } else {
        alert("Failed to delete discount");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting discount");
    }
  };

  const handleFetchUsage = async (discount) => {
    try {
      setFetchingUsage(true);
      setSelectedCode(discount.code);
      setSelectedDiscountId(discount.id);
      setIsUsageModalOpen(true);
      setUsageHistory([]);
      const res = await fetch(`/api/admin/discounts/${discount.id}/usage`);
      if (res.ok) {
        const data = await res.json();
        setUsageHistory(data);
      }
    } catch (error) {
       console.error("Failed to fetch usage history", error);
    } finally {
       setFetchingUsage(false);
    }
  };

  const handleDeleteUsage = async (usageId, discountId) => {
    if (!confirm("Are you sure you want to delete this usage record? This will allow the user to use the code again.")) return;
    
    try {
      const res = await fetch(`/api/admin/discounts/${discountId}/usage?usageId=${usageId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        // 1. Refresh the local usage list (modal)
        setUsageHistory(usageHistory.filter(u => u.id !== usageId));
        // 2. Decrement the count in the main table
        setDiscounts(discounts.map(d => d.id === discountId 
          ? { ...d, current_usage: Math.max(0, d.current_usage - 1) } 
          : d
        ));
      } else {
        alert("Failed to delete usage record");
      }
    } catch (error) {
       console.error("Error deleting usage", error);
       alert("Error deleting record");
    }
  };

  const handleSyncCounts = async () => {
    if (!confirm("Recalculate all usage counts based on historical records? This will fix count discrepancies.")) return;
    
    try {
      setIsSyncing(true);
      const res = await fetch("/api/admin/discounts/sync", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully synced! Updated ${data.syncedCount} discount codes.`);
        fetchDiscounts();
      } else {
        alert("Failed to sync counts");
      }
    } catch (error) {
       console.error("Sync error", error);
       alert("Error syncing counts");
    } finally {
       setIsSyncing(false);
    }
  };

  if (loading && discounts.length === 0) {
    return <div className="p-8">Loading discounts...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[48px] font-display font-bold mb-2">Discount Codes</h1>
          <p className="text-[18px] text-gray-500">Create and manage promotion codes for your customers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncCounts}
            disabled={isSyncing}
            className={`px-6 py-3.5 rounded-xl font-bold border transition-all flex items-center gap-2 ${isSyncing ? "bg-gray-100 text-gray-400 border-gray-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 active:scale-95"}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isSyncing ? "animate-spin" : ""}`}>sync</span>
            <span className="text-[17px]">{isSyncing ? "Syncing..." : "Sync Counts"}</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-[#c3a2ab] text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm text-[18px]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create Code
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-[16px] uppercase tracking-wider">
              <tr>
                <th className="py-5 px-6 font-bold">Code</th>
                <th className="py-5 px-6 font-bold">Discount</th>
                <th className="py-5 px-6 font-bold">Min. Purchase</th>
                <th className="py-5 px-6 font-bold">Max. Discount</th>
                <th className="py-5 px-6 font-bold">Limit / User</th>
                <th className="py-5 px-6 font-bold">Usage / Total</th>
                <th className="py-5 px-6 font-bold">Status</th>
                <th className="py-5 px-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {discounts.length > 0 ? (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-5 px-6">
                      <span className="font-mono font-bold bg-gray-100 px-3 py-1.5 rounded text-[18px] text-gray-800 tracking-wider">
                        {discount.code}
                      </span>
                    </td>
                    <td className="py-5 px-6 font-bold text-gray-900 text-[20px]">{discount.discount_percent}%</td>
                    <td className="py-5 px-6 text-[18px] text-gray-900">
                      {discount.min_purchase ? `฿${discount.min_purchase.toLocaleString()}` : <span className="text-gray-300">None</span>}
                    </td>
                    <td className="py-5 px-6 text-red-600 font-bold text-[18px]">
                      {discount.max_discount ? `฿${discount.max_discount.toLocaleString()}` : <span className="text-gray-300">None</span>}
                    </td>
                    <td className="py-5 px-6 font-bold text-gray-700 text-[18px]">
                      {discount.usage_limit_per_user || 1} <span className="text-[12px] text-gray-400 font-normal ml-1">times</span>
                    </td>
                    <td className="py-5 px-6 text-[18px]">
                      <span className={`${discount.max_usage && discount.current_usage >= discount.max_usage ? "text-red-500 font-bold" : "text-gray-600"}`}>
                        {discount.current_usage}
                      </span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-gray-600">
                        {discount.max_usage ? discount.max_usage : "∞"}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <button 
                        onClick={() => handleToggleActive(discount.id, discount.active)}
                        className={`px-4 py-1.5 rounded-full text-[15px] font-bold tracking-wider transition-colors ${discount.active ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                      >
                        {discount.active ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-end gap-3 text-gray-500">
                        {/* 1. ปุ่มประวัติ */}
                        <button 
                          onClick={() => handleFetchUsage(discount)} 
                          className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
                          title="View Usage History"
                        >
                          <span className="material-symbols-outlined text-[20px]">history</span>
                          <span className="text-[13px] font-bold uppercase tracking-tighter">Usage</span>
                        </button>

                        {/* 2. ปุ่มแก้ไข */}
                        <button onClick={() => handleOpenModal(discount)} className="hover:text-[#c3a2ab] transition-colors p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-100" title="Edit">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        
                        {/* 3. ปุ่มลบ */}
                        <button onClick={() => handleDelete(discount.id)} className="hover:text-red-600 transition-colors p-2.5 bg-red-50/50 rounded-lg hover:bg-red-50 border border-red-100" title="Delete">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">No discount codes found. Create one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-[30px] font-bold">{editMode ? "Edit Discount Code" : "Create Discount Code"}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined notranslate">close</span>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-[22px] font-bold text-gray-700 mb-2">Code Name</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                    placeholder="e.g. SUMMER20"
                  />
                  <p className="text-[20px] text-gray-500 mt-1">Codes will be uppercase without spaces.</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[22px] font-bold text-gray-700 mb-2">Discount (%)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                      placeholder="e.g. 15"
                    />
                  </div>
                  <div>
                    <label className="block text-[22px] font-bold text-gray-700 mb-2">Min. Purchase (฿)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.min_purchase}
                      onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                      placeholder="e.g. 1000"
                    />
                  </div>
                  <div>
                    <label className="block text-[22px] font-bold text-gray-700 mb-2">Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_usage}
                      onChange={(e) => setFormData({ ...formData, max_usage: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                      placeholder="Infinite"
                    />
                  </div>
                  <div>
                    <label className="block text-[22px] font-bold text-gray-700 mb-2">Max. Discount (฿)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_discount}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                      />
                  </div>
                  <div>
                    <label className="block text-[22px] font-bold text-gray-700 mb-2">Limit Per User</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.usage_limit_per_user}
                      onChange={(e) => setFormData({ ...formData, usage_limit_per_user: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 text-[#c3a2ab] rounded border-gray-300 focus:ring-[#c3a2ab]"
                  />
                  <label htmlFor="active" className="text-gray-700 font-medium">Code is active immediately</label>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#c3a2ab] text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity"
                  >
                    {editMode ? "Save Changes" : "Create Code"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Usage History Modal */}
      {isUsageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-y-auto max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-[30px] font-bold">Usage History</h2>
                <p className="text-[20px] text-gray-400 font-mono">Code: {selectedCode}</p>
              </div>
              <button onClick={() => setIsUsageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined notranslate">close</span>
              </button>
            </div>
            <div className="p-6">
               {fetchingUsage ? (
                 <div className="py-20 text-center text-gray-400 animate-pulse font-black uppercase tracking-widest text-[20px]">Fetching Usage Data...</div>
               ) : usageHistory.length > 0 ? (
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                     <tr>
                       <th className="py-3 px-4">User Phone</th>
                       <th className="py-3 px-4">Date Used</th>
                       <th className="py-3 px-4 text-right">Delete</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 italic">
                     {usageHistory.map((u, i) => (
                       <tr key={u.id || i} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-[22px] font-bold text-gray-900">{u.phone}</td>
                          <td className="py-3 px-4 text-[20px] text-gray-500">
                             {new Date(u.created_at).toLocaleString("th-TH")}
                          </td>
                          <td className="py-3 px-4 text-right">
                             <button 
                               onClick={() => handleDeleteUsage(u.id, selectedDiscountId)}
                               className="text-red-300 hover:text-red-600 transition-colors"
                               title="Remove Usage Record"
                             >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                             </button>
                          </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               ) : (
                 <div className="py-20 text-center text-gray-400 italic">No usage records found for this code.</div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
