"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";

export default function AdminRewards() {
  const [redemptions, setRedemptions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [formData, setFormData] = useState({ name: "", points_required: "", stock: "", image: "🎁" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("PENDING");

  const filteredRedemptions = redemptions.filter(r => r.status === filter);

  async function fetchData() {
    fetch("/api/admin/rewards").then(r => r.json()).then(setRedemptions);
    fetch("/api/rewards").then(r => r.json()).then(setRewards);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const addReward = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const url = editingId ? `/api/admin/rewards/${editingId}` : "/api/admin/rewards";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, { 
      method, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData) 
    });
    
    setLoading(false);
    if (res.ok) {
      alert(editingId ? "Reward Updated Successfully!" : "Reward Added Successfully!");
      setFormData({ name: "", points_required: "", stock: "", image: "🎁" });
      setEditingId(null);
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to process reward.");
    }
  };

  const handleEdit = (reward) => {
    setEditingId(reward.id);
    setFormData({
      name: reward.name,
      points_required: reward.points_required,
      stock: reward.stock,
      image: reward.image
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;
    
    setLoading(true);
    const res = await fetch(`/api/admin/rewards/${id}`, { method: "DELETE" });
    setLoading(false);
    
    if (res.ok) {
      alert("Reward Deleted!");
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete reward.");
    }
  };

  const handleMarkAsShipped = async (id) => {
    const trackingNumber = prompt("Enter tracking number (optional):", "");
    if (trackingNumber === null) return; // User cancelled prompt

    try {
      const res = await fetch(`/api/admin/rewards/redemptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "SHIPPED", 
          tracking_number: trackingNumber || undefined 
        })
      });
      if (res.ok) {
        alert("Marked as shipped successfully!");
        fetchData();
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    }
  };

  const handleDeleteRedemption = async (id) => {
    if (!confirm("Are you sure you want to delete this redemption? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/rewards/redemptions/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Redemption deleted successfully!");
        fetchData();
      } else {
        alert("Failed to delete redemption");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-serif text-gray-800 mb-8 border-b pb-4">Loyalty Rewards Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT COMPONENT */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="bg-[#c3a2ab] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            {editingId ? "Update Reward" : "Create New Reward"}
          </h2>
          <form onSubmit={addReward} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reward Name</label>
              <input className="w-full border-2 border-gray-100 p-3 rounded-lg focus:outline-none focus:border-[#c3a2ab] transition-colors" placeholder="e.g. Richse Night Cream (Travel Size)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Points Required</label>
                <input type="number" min="1" className="w-full border-2 border-gray-100 p-3 rounded-lg focus:outline-none focus:border-[#c3a2ab] transition-colors" placeholder="e.g. 500" value={formData.points_required} onChange={e => setFormData({...formData, points_required: e.target.value})} required />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" min="0" className="w-full border-2 border-gray-100 p-3 rounded-lg focus:outline-none focus:border-[#c3a2ab] transition-colors" placeholder="e.g. 100" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
              </div>
            </div>
            
            <div className="flex gap-4 items-end">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji / Image Link</label>
                <input className="w-full border-2 border-gray-100 p-3 rounded-lg focus:outline-none focus:border-[#c3a2ab] transition-colors" placeholder="e.g. 💄 or https://... " value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>
              <div className="w-16 h-16 bg-gray-50 border-2 border-gray-100 rounded-lg flex items-center justify-center text-3xl overflow-hidden shrink-0 mb-[2px]">
                {formData.image && (formData.image.startsWith("http") || formData.image.startsWith("/")) ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span>{formData.image || "🎁"}</span>
                )}
              </div>
            </div>
            
            <button disabled={loading} className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-3.5 rounded-lg w-full transition-colors disabled:opacity-50">
              {loading ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Reward Details" : "Launch Reward into Catalog")}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setFormData({ name: "", points_required: "", stock: "", image: "🎁" }); }} className="text-gray-500 hover:text-gray-700 w-full text-sm font-medium mt-2">
                Cancel Edit
              </button>
            )}
          </form>

          <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center gap-2">
            <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            Active Catalog
          </h2>
          {rewards.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 p-8 rounded-2xl text-center text-gray-500">No active rewards. Add one above.</div>
          ) : (
            <ul className="space-y-3">
              {rewards.map(r => (
                 <li key={r.id} className="border border-gray-100 p-4 rounded-xl bg-white shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-4xl overflow-hidden shrink-0">
                       {r.image && (r.image.startsWith("http") || r.image.startsWith("/")) ? (
                         <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                       ) : (
                         <span>{r.image || "🎁"}</span>
                       )}
                     </div>
                     <div>
                       <p className="font-bold text-gray-800">{r.name}</p>
                       <p className="text-sm text-[#c3a2ab] font-bold">{r.points_required} Pts</p>
                     </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                     <div className="text-right">
                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${r.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         Stock: {r.stock}
                       </span>
                       <p className="text-xs text-gray-400 mt-1">ID: {r.id.slice(-4)}</p>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={() => handleEdit(r)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit">
                         <span className="material-symbols-outlined text-xl">edit</span>
                       </button>
                       <button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete">
                         <span className="material-symbols-outlined text-xl">delete</span>
                       </button>
                     </div>
                   </div>
                 </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT COMPONENT */}
        <div>
          <div className="flex justify-between items-center mb-6 border-b pb-2 pt-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
              Recent Redemptions
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter("PENDING")} 
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                To Ship ({redemptions.filter(r => r.status === "PENDING").length})
              </button>
              <button 
                onClick={() => setFilter("SHIPPED")} 
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === "SHIPPED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                Shipped ({redemptions.filter(r => r.status === "SHIPPED").length})
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {filteredRedemptions.map(r => (
              <div key={r.id} className="bg-white border hover:border-[#c3a2ab] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg text-gray-800 mb-1">{r.reward.name}</p>
                    <p className="text-sm text-gray-600">Claimed by: <strong className="text-black">{r.user.name || "Unknown"}</strong> <span className="text-xs text-gray-400">({r.user.email})</span></p>
                    {/* Shipping Address */}
                    <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                       <p className="mb-1"><strong className="text-gray-800 font-medium">Phone:</strong> {r.user.phone || "-"}</p>
                       <p className="leading-relaxed"><strong className="text-gray-800 font-medium">Address:</strong> {r.user.address ? `${r.user.address} ${r.user.subdistrict || ''} ${r.user.district || ''} ${r.user.province || ''} ${r.user.postal_code || ''}`.trim() : "No address provided"}</p>
                    </div>
                    {r.tracking_number && (
                      <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 border border-blue-100">
                        <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                        Tracking: <span className="tracking-wider uppercase">{r.tracking_number}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-wider ${r.status === "PENDING" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                      {r.status}
                    </span>
                    <button onClick={() => handleDeleteRedemption(r.id)} className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Delete Redemption">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-4 mt-2">
                  <p>🗓 {new Date(r.created_at).toLocaleString()}</p>
                  {r.status === "PENDING" && (
                    <button 
                      onClick={() => handleMarkAsShipped(r.id)}
                      className="text-[#c3a2ab] hover:underline font-bold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">local_shipping</span>
                      Mark as Shipped
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredRedemptions.length === 0 && (
              <div className="bg-gray-50 border border-dashed border-gray-300 p-12 rounded-2xl text-center text-gray-500 mt-6">
                <p>No {filter.toLowerCase()} redemptions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
