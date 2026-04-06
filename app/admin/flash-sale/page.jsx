"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { 
  Bolt, 
  Search, 
  TrendingDown, 
  Calendar, 
  Package, 
  Clock, 
  Trash2,
  CheckCircle,
  Zap,
  Percent,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import LoadingRichse from "@/app/components/LoadingRichse";

export default function FlashSaleManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // ID of product being saved
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, scheduled

  // Global Control State
  const [globalStart, setGlobalStart] = useState("");
  const [globalEnd, setGlobalEnd] = useState("");
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleUpdate = async (product) => {
    setSaving(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          flashSalePrice: product.flashSalePrice === "" ? null : Number(product.flashSalePrice),
          flashSaleStart: product.flashSaleStart === "" ? null : product.flashSaleStart,
          flashSaleEnd: product.flashSaleEnd === "" ? null : product.flashSaleEnd,
        }),
      });

      if (res.ok) {
        toast.success(`Updated ${product.name}`);
        // Refresh local product data to maintain consistency
        const updatedData = await res.json();
        setProducts(products.map(p => p.id === product.id ? updatedData : p));
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setSaving(null);
    }
  };

  const applyGlobalSchedule = () => {
    if (!globalStart || !globalEnd) {
      toast.error("Please set both start and end times");
      return;
    }
    const updated = products.map(p => ({
      ...p,
      flashSaleStart: globalStart,
      flashSaleEnd: globalEnd
    }));
    setProducts(updated);
    toast.success("Schedule applied to all products. (Click Save on items to commit)");
  };

  const applyBulkDiscount = () => {
    const percent = parseFloat(bulkDiscountPercent);
    if (isNaN(percent) || percent <= 0 || percent > 100) {
      toast.error("Enter a valid percentage (1-100)");
      return;
    }
    const updated = products.map(p => {
      const discountAmount = p.price * (percent / 100);
      const newPrice = Math.floor(p.price - discountAmount);
      return {
        ...p,
        flashSalePrice: newPrice
      };
    });
    setProducts(updated);
    toast.success(`Applied ${percent}% discount locally. Remember to save!`);
  };

  const clearAllSales = async () => {
    if (!confirm("Are you sure you want to CLEAR ALL flash sale data for ALL products? This cannot be undone.")) return;
    
    toast.loading("Clearing all sales...");
    try {
      // For safety, we do it sequentially or tell user to do it per item. 
      // For this UI, we just clear local state and let them save.
      const updated = products.map(p => ({
        ...p,
        flashSalePrice: null,
        flashSaleStart: null,
        flashSaleEnd: null
      }));
      setProducts(updated);
      toast.dismiss();
      toast.success("All fields cleared locally. Save items to commit to database.");
    } catch {
      toast.error("Clear failed");
    }
  };

  // --- Statistics ---
  const stats = useMemo(() => {
    const now = new Date();
    const active = products.filter(p => p.flashSaleStart && p.flashSaleEnd && now >= new Date(p.flashSaleStart) && now <= new Date(p.flashSaleEnd));
    const scheduled = products.filter(p => p.flashSaleStart && p.flashSaleEnd && now < new Date(p.flashSaleStart));
    
    let avgDiscount = 0;
    if (active.length > 0) {
      const totalDisc = active.reduce((acc, p) => acc + ((p.price - (p.flashSalePrice || p.price)) / p.price * 100), 0);
      avgDiscount = totalDisc / active.length;
    }

    return {
      activeCount: active.length,
      scheduledCount: scheduled.length,
      avgDiscount: avgDiscount.toFixed(1)
    };
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    
    const now = new Date();
    const isScheduled = p.flashSaleStart && p.flashSaleEnd;
    const isActive = isScheduled && now >= new Date(p.flashSaleStart) && now <= new Date(p.flashSaleEnd);
    
    if (filter === "active") return matchesSearch && isActive;
    if (filter === "scheduled") return matchesSearch && isScheduled && !isActive;
    return matchesSearch;
  });

  if (loading && products.length === 0) {
    return <LoadingRichse fullScreen message="Synchronizing campaign data..." />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header & Main Stats */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                <Zap size={24} />
             </div>
             <h1 className="text-[44px] font-display font-bold text-gray-900 tracking-tight">Campaign Dashboard</h1>
          </div>
          <p className="text-gray-500 max-w-lg">Manage seasonal flash sales, dynamic pricing, and scheduled promotions for your entire catalog.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 flex-1 max-w-2xl">
           <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active Now</p>
              <p className="text-[36px] font-bold text-emerald-600 font-display">{stats.activeCount}</p>
           </div>
           <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Scheduled</p>
              <p className="text-[36px] font-bold text-blue-600 font-display">{stats.scheduledCount}</p>
           </div>
           <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg. Discount</p>
              <p className="text-[36px] font-bold text-rose-500 font-display">{stats.avgDiscount}%</p>
           </div>
        </div>
      </div>

      {/* Campaign Controls (Bulk Tools) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk Schedule */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-[22px] font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={16} className="text-[#c3a2ab]" /> 1. Bulk Scheduling
          </h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Start Time</label>
                <input 
                  type="datetime-local" 
                  value={globalStart}
                  onChange={(e) => setGlobalStart(e.target.value)}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl text-[22px] focus:ring-[#c3a2ab]"
                />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">End Time</label>
                <input 
                  type="datetime-local" 
                  value={globalEnd}
                  onChange={(e) => setGlobalEnd(e.target.value)}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl text-[22px] focus:ring-[#c3a2ab]"
                />
             </div>
          </div>
          <button 
            onClick={applyGlobalSchedule}
            className="w-full py-3 bg-gray-900 text-white rounded-xl text-[20px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            Apply Schedule to All Items
          </button>
        </div>

        {/* Bulk Pricing */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-[22px] font-bold text-gray-900 flex items-center gap-2">
            <TrendingDown size={16} className="text-rose-500" /> 2. Bulk Price Adjustment
          </h3>
          <div className="flex items-center gap-4">
             <div className="flex-1 relative">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="number" 
                  placeholder="Enter discount percent (e.g. 20)"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-[22px] focus:ring-rose-500 outline-none"
                  value={bulkDiscountPercent}
                  onChange={(e) => setBulkDiscountPercent(e.target.value)}
                />
             </div>
             <button 
               onClick={applyBulkDiscount}
               className="bg-rose-500 text-white px-6 py-3 rounded-xl text-[20px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
             >
               Apply Discount
             </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center italic">This calculates the Flash Price based on the Base Price for all products.</p>
        </div>
      </div>

      {/* Main Product Table Section */}
      <div className="space-y-4">
         <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="bg-gray-100/50 p-1 rounded-xl flex items-center w-full md:w-auto">
              {["all", "active", "scheduled"].map(m => (
                <button
                  key={m}
                  onClick={() => setFilter(m)}
                  className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                    filter === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {m === "all" ? "All Products" : m}
                </button>
              ))}
           </div>

           <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#c3a2ab] transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#c3a2ab]/20 transition-all text-[22px] shadow-sm"
                />
             </div>
             <button 
                onClick={clearAllSales}
                className="p-2.5 bg-gray-100 text-gray-400 hover:text-rose-500 rounded-xl transition-all"
                title="Clear All Fields"
              >
                <Trash2 size={20} />
              </button>
           </div>
         </div>

         <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">Product Info</th>
                      <th className="py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Price Dynamics</th>
                      <th className="py-5 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Timeline</th>
                      <th className="py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((p) => {
                      const now = new Date();
                      const active = p.flashSaleStart && p.flashSaleEnd && now >= new Date(p.flashSaleStart) && now <= new Date(p.flashSaleEnd);
                      const discountPercent = p.flashSalePrice ? Math.round((p.price - p.flashSalePrice) / p.price * 100) : 0;
                      
                      return (
                        <tr key={p.id} className={`group transition-all hover:bg-gray-50/50 ${active ? "bg-emerald-50/30" : ""}`}>
                          <td className="py-6 px-8">
                             <div className="flex items-center gap-4">
                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm flex-shrink-0">
                                   <Image src={p.image || "/placeholder.jpg"} alt={p.name} fill className="object-cover" />
                                </div>
                                <div className="space-y-1">
                                   <p className="font-bold text-gray-900 leading-tight">{p.name}</p>
                                   <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: {p.id}</span>
                                      {active && (
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-white border border-emerald-100 px-2 py-0.5 rounded-full shadow-sm">
                                          <Bolt size={10} className="fill-emerald-600" /> LIVE
                                        </span>
                                      )}
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="py-6 px-6">
                             <div className="flex items-center justify-center gap-4">
                                <div className="text-right">
                                   <p className="text-[10px] font-bold text-gray-400 uppercase">Original</p>
                                   <p className="text-[22px] font-medium text-gray-500 line-through">฿{p.price.toLocaleString()}</p>
                                </div>
                                <ArrowRight size={16} className="text-gray-300" />
                                <div className="space-y-1">
                                   <p className="text-[10px] font-bold text-rose-500 uppercase">Flash Price</p>
                                   <div className="flex items-center gap-2">
                                      <input 
                                        type="number" 
                                        value={p.flashSalePrice || ""}
                                        onChange={(e) => {
                                          const updated = products.map(item => item.id === p.id ? { ...item, flashSalePrice: e.target.value } : item);
                                          setProducts(updated);
                                        }}
                                        className="w-24 bg-rose-50/50 border border-rose-100 rounded-xl px-3 py-2 text-[22px] font-bold text-rose-600 focus:ring-2 focus:ring-rose-500 outline-none text-center"
                                      />
                                      {discountPercent > 0 && (
                                        <div className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-1 rounded-lg">
                                          -{discountPercent}%
                                        </div>
                                      )}
                                   </div>
                                </div>
                             </div>
                          </td>
                          <td className="py-6 px-6">
                             <div className="flex flex-col gap-2 max-w-[180px] mx-auto">
                                <div className="relative group/input">
                                   <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                   <input 
                                      type="datetime-local" 
                                      value={p.flashSaleStart ? new Date(new Date(p.flashSaleStart).getTime() - (new Date(p.flashSaleStart).getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                                      onChange={(e) => {
                                        const updated = products.map(item => item.id === p.id ? { ...item, flashSaleStart: e.target.value } : item);
                                        setProducts(updated);
                                      }}
                                      className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg text-[10px] font-medium text-gray-700 outline-none"
                                   />
                                </div>
                                <div className="relative group/input">
                                   <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                   <input 
                                      type="datetime-local" 
                                      value={p.flashSaleEnd ? new Date(new Date(p.flashSaleEnd).getTime() - (new Date(p.flashSaleEnd).getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                                      onChange={(e) => {
                                        const updated = products.map(item => item.id === p.id ? { ...item, flashSaleEnd: e.target.value } : item);
                                        setProducts(updated);
                                      }}
                                      className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-transparent hover:border-gray-200 rounded-lg text-[10px] font-medium text-gray-700 outline-none"
                                   />
                                </div>
                             </div>
                          </td>
                          <td className="py-6 px-8 text-right">
                             <div className="flex justify-end items-center gap-3">
                                <button 
                                  onClick={() => handleUpdate(p)}
                                  disabled={saving === p.id}
                                  className="px-6 py-2.5 bg-[#161314] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50 flex items-center gap-2"
                                >
                                  {saving === p.id ? (
                                     <LoadingRichse inline message="Saving" />
                                  ) : (
                                     <>
                                        <CheckCircle size={12} /> Commit Changes
                                     </>
                                  )}
                                </button>
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
               {filteredProducts.length === 0 && (
                 <div className="py-32 flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <Package size={48} className="opacity-20 translate-y-2" />
                    <p className="text-[20px] font-bold uppercase tracking-widest">The collection is hidden or empty</p>
                    <button onClick={() => {setSearch(""); setFilter("all");}} className="text-rose-500 text-[10px] font-bold uppercase tracking-widest border-b border-rose-200">Reset View</button>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
