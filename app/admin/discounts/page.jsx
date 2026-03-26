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
    active: true,
  });
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  if (loading && discounts.length === 0) {
    return <div className="p-8">Loading discounts...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Discount Codes</h1>
          <p className="text-gray-500">Create and manage promotion codes for your customers.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#c3a2ab] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create Code
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="py-4 px-6 font-medium">Code</th>
                <th className="py-4 px-6 font-medium">Discount (%)</th>
                <th className="py-4 px-6 font-medium">Min. Purchase</th>
                <th className="py-4 px-6 font-medium">Usage / Limit</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {discounts.length > 0 ? (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold bg-gray-100 px-3 py-1 rounded text-gray-800 tracking-wider">
                        {discount.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">{discount.discount_percent}%</td>
                    <td className="py-4 px-6">
                      {discount.min_purchase ? `฿${discount.min_purchase.toLocaleString()}` : <span className="text-gray-400">None</span>}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`${discount.max_usage && discount.current_usage >= discount.max_usage ? "text-red-500 font-bold" : "text-gray-600"}`}>
                        {discount.current_usage}
                      </span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-gray-600">
                        {discount.max_usage ? discount.max_usage : "∞"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => handleToggleActive(discount.id, discount.active)}
                        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider transition-colors ${discount.active ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}
                      >
                        {discount.active ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-3 text-gray-500">
                        <button onClick={() => handleOpenModal(discount)} className="hover:text-[#c3a2ab] transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDelete(discount.id)} className="hover:text-red-600 transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-sm">delete</span>
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
              <h2 className="text-xl font-bold">{editMode ? "Edit Discount Code" : "Create Discount Code"}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined notranslate">close</span>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Code Name</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                    placeholder="e.g. SUMMER20"
                  />
                  <p className="text-xs text-gray-500 mt-1">Codes will be uppercase without spaces.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Discount (%)</label>
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">Min. Purchase (฿)</label>
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.max_usage}
                      onChange={(e) => setFormData({ ...formData, max_usage: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab]"
                      placeholder="Infinite"
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
    </div>
  );
}
