"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Zap, Truck, CheckCircle2, Save, Activity } from "lucide-react";

export default function AutomationsDashboard() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      toast.error("Failed to load automation rules.");
    } finally {
      setLoading(false);
    }
  }

  const toggleSetting = async (key) => {
    const currentValue = settings[key] === "true";
    const newValue = !currentValue;
    
    // Optimistic UI update
    setSettings(prev => ({ ...prev, [key]: newValue ? "true" : "false" }));
    
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newValue ? "true" : "false" })
      });
      
      if (!res.ok) throw new Error("Failed to save");
      toast.success(newValue ? "Rule activated" : "Rule deactivated");
    } catch (error) {
      // Revert on failure
      setSettings(prev => ({ ...prev, [key]: currentValue ? "true" : "false" }));
      toast.error("Failed to update rule");
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex justify-center text-gray-400">
        <Activity className="animate-pulse w-8 h-8" />
      </div>
    );
  }

  const isFirstOrderFree = settings["auto_free_shipping_first_order"] === "true";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight flex items-center gap-3">
          <Zap className="w-8 h-8 text-[#c3a2ab]" fill="currentColor" />
          Sales Automations
        </h1>
        <p className="text-gray-500 mt-2">Configure smart rules to automatically boost conversions and manage promotions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Rule 1: First Order Free Shipping */}
        <div className={`relative overflow-hidden rounded-[2.5rem] border transition-all duration-500 ${isFirstOrderFree ? "bg-[#161314] text-white border-black shadow-2xl shadow-black/20" : "bg-white text-gray-900 border-gray-100 shadow-xl shadow-gray-200/20 hover:border-gray-200"}`}>
          
          {isFirstOrderFree && (
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#c3a2ab]/20 rounded-full blur-3xl pointer-events-none"></div>
          )}

          <div className="p-8 space-y-6 relative z-10">
            <div className="flex justify-between items-start gap-4">
               <div className={`p-4 rounded-2xl ${isFirstOrderFree ? "bg-white/10 text-[#c3a2ab]" : "bg-gray-50 border border-gray-100 text-gray-400"}`}>
                 <Truck className="w-8 h-8" />
               </div>
               
               {/* Toggle Switch */}
               <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isFirstOrderFree} 
                    onChange={() => toggleSetting("auto_free_shipping_first_order")} 
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#c3a2ab]"></div>
               </label>
            </div>

            <div>
               <div className="flex items-center gap-2 mb-2">
                 <h2 className={`text-xl font-bold ${isFirstOrderFree ? "text-white" : "text-gray-900"}`}>First Order Ships Free</h2>
                 {isFirstOrderFree && <CheckCircle2 className="w-4 h-4 text-[#c3a2ab]" />}
               </div>
               <p className={isFirstOrderFree ? "text-gray-400 leading-relaxed text-sm" : "text-gray-500 leading-relaxed text-sm"}>
                  Automatically waive the standard delivery fee (฿30) for customers placing their very first order. The system checks their phone number against previous order history dynamically at checkout.
               </p>
            </div>

            <div className="pt-4 border-t border-white/10">
               <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-bold text-gray-500">Status</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl ${isFirstOrderFree ? "bg-[#c3a2ab] text-white" : "bg-gray-100 text-gray-400"}`}>
                     {isFirstOrderFree ? "Active" : "Disabled"}
                  </span>
               </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="rounded-[2.5rem] border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center p-8 text-center space-y-3 min-h-[300px]">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm mb-2">
              <span className="material-symbols-outlined text-gray-300">add</span>
           </div>
           <h3 className="font-bold text-gray-400">More Automations Coming Soon</h3>
           <p className="text-sm text-gray-400 max-w-xs">Features like abandoned cart recovery and birthday campaigns will be added here.</p>
        </div>

      </div>
    </div>
  );
}
