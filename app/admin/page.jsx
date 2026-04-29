"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { 
  TrendingUp, 
  ShoppingBag, 
  ArrowUpRight, 
  Clock, 
  Zap,
  Target,
  AlertCircle,
  ChevronRight,
  Star,
  Activity,
  History,
  CheckCircle2
} from "lucide-react";

import LoadingRichse from "@/app/components/LoadingRichse";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [abandoned, setAbandoned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [nudging, setNudging] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        let url = "/api/admin/stats";
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (params.toString()) url += `?${params.toString()}`;

        const [sRes, aRes] = await Promise.all([
          fetch(url),
          fetch("/api/admin/abandoned")
        ]);

        if (sRes.ok) {
          const sData = await sRes.json();
          setStats(sData);
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          setAbandoned(aData.abandoned || []);
        }
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [startDate, endDate]);

  const handleNudge = async (logId) => {
    try {
      setNudging((prev) => ({ ...prev, [logId]: true }));
      const res = await fetch("/api/admin/abandoned/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId })
      });
      if (res.ok) {
        alert("✅ Nudge notification sent!");
      } else {
        const errorData = await res.json();
        alert(`❌ Failed to nudge: ${errorData.error || "Unknown error"}`);
      }
    } catch (e) {
      console.error(e);
      alert("❌ Error sending nudge");
    } finally {
      setNudging((prev) => ({ ...prev, [logId]: false }));
    }
  };

  if (loading) {
    return <LoadingRichse fullScreen message="Initializing War Room..." />;
  }

  if (!stats) return <div className="p-8 text-red-500">Failed to load statistics.</div>;

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto bg-[#fafafa] min-h-screen font-sans">
      
      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#c3a2ab]">
            <Activity size={12} /> Live Operations Center
          </div>
          <h1 className="text-[48px] font-display font-black text-gray-900 tracking-tight">RICHSE Intelligence Hub</h1>
          <p className="text-gray-500 font-medium">Real-time conversion insights and performance analytics.</p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.02]">
          <div className="flex items-center gap-2 group px-4">
            <Clock size={16} className="text-gray-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-[20px] font-bold focus:outline-none bg-transparent"
            />
            <span className="text-[10px] font-black text-gray-300">TO</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-[20px] font-bold focus:outline-none bg-transparent"
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full hover:bg-black transition-all shadow-lg shadow-black/10"
            >Reset</button>
          )}
        </div>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Total Sales */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-gray-100 group hover:border-[#c3a2ab]/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#c3a2ab]/10 text-[#c3a2ab] flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <div className="flex items-center gap-1 text-green-500 font-black text-[10px] uppercase tracking-widest">
              <ArrowUpRight size={14} /> Live
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Gross Revenue</p>
          <h3 className="text-[44px] font-display font-black text-gray-900 tracking-tight">
            ฿{stats.totalSales.toLocaleString()}
          </h3>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-gray-100 group hover:border-black/10 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} />
            </div>
            <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
              Completed
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Total Orders</p>
          <h3 className="text-[44px] font-display font-black text-gray-900 tracking-tight uppercase">
            {stats.totalOrders}
          </h3>
        </div>

        {/* Abandoned Recovery Potential */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-black/[0.1] border border-[#c3a2ab]/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 font-black">
             <Zap size={40} className="text-[#c3a2ab]/5 group-hover:text-[#c3a2ab]/10 transition-colors" />
          </div>
          <div className="flex justify-between items-start mb-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#c3a2ab] text-white flex items-center justify-center">
              <Target size={24} />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c3a2ab] mb-1">Abandoned Checkouts</p>
          <h3 className="text-[44px] font-display font-black text-gray-900 tracking-tight">
            {stats.totalPotentialCustomers || 0}
          </h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium italic">Potential missed revenue detectable</p>
        </div>

        {/* Conversion Efficiency */}
        <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl shadow-black/20 text-white flex flex-col justify-between group hover:scale-[1.02] transition-transform">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center backdrop-blur-md">
                <Zap size={24} className="text-[#c3a2ab]" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Conversion Efficiency</p>
            <h3 className="text-[48px] font-display font-black text-white tracking-tight">
              {stats.conversionRate}%
            </h3>
          </div>
          <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-[#c3a2ab] transition-all duration-1000" style={{ width: `${stats.conversionRate}%` }}></div>
          </div>
        </div>

      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10">
        
        {/* Main Sales Analytics */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
               <div className="w-1 h-8 bg-[#c3a2ab] rounded-full"></div>
               <h2 className="text-[36px] font-display font-bold text-gray-900">Revenue Analytics</h2>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#c3a2ab]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Revenue</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Volume</span>
               </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlySales}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c3a2ab" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#c3a2ab" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f9fafb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}}
                  tickFormatter={(val) => `฿${val >= 1000 ? val/1000 + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#c3a2ab" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Performance Funnel */}
        <div className="lg:col-span-4 bg-white p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-gray-100 flex flex-col">
           <h2 className="text-[30px] font-display font-bold text-gray-900 mb-2">Sales Funnel</h2>
           <p className="text-[20px] text-gray-400 font-medium mb-10">Conversion of checkout starts into orders.</p>
           
           <div className="flex-1 flex flex-col justify-center gap-12">
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Checkout Started</span>
                    <span className="text-[26px] font-display font-black">{stats.totalOrders + (stats.totalPotentialCustomers || 0)}</span>
                 </div>
                 <div className="h-12 w-full bg-gray-50 rounded-2xl relative overflow-hidden">
                    <div className="h-full bg-gray-200 w-full animate-pulse"></div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c3a2ab]">Orders Completed</span>
                    <span className="text-[26px] font-display font-black">{stats.totalOrders}</span>
                 </div>
                 <div className="h-12 w-full bg-[#f9f5f6] rounded-2xl relative overflow-hidden">
                    <div 
                      className="h-full bg-[#c3a2ab] transition-all duration-1000" 
                      style={{ width: `${stats.conversionRate}%` }}
                    ></div>
                 </div>
              </div>

              <div className="pt-10 border-t border-gray-50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                       <Target size={20} />
                    </div>
                    <div>
                       <p className="text-[20px] font-bold text-gray-900 italic">You lost {stats.totalPotentialCustomers || 0} customers this period.</p>
                       <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Activate Recovery Automation</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* BOTTOM SECTION: LIVE FEED & BEST SELLERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Abandoned Recovery Feed */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-[3rem] shadow-xl shadow-black/[0.02] border border-gray-100 overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                 <AlertCircle size={20} />
              </div>
              <div>
                <h2 className="text-[30px] font-display font-bold text-gray-900">Abandoned Discovery</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Recover these potential orders</p>
              </div>
            </div>
            <button className="p-3 hover:bg-gray-100 rounded-full transition-colors"><History size={20} className="text-gray-400"/></button>
          </div>
          
          <div className="p-4">
             <div className="space-y-2">
                {abandoned.length > 0 ? (
                  abandoned.map((log) => (
                    <div key={log.id} className="group flex items-center justify-between p-6 bg-white border border-gray-50 rounded-[2rem] hover:border-[#c3a2ab]/30 hover:shadow-xl hover:shadow-black/[0.02] transition-all">
                       <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-[20px] uppercase group-hover:bg-[#c3a2ab] group-hover:text-white transition-all">
                             {log.name.charAt(0)}
                          </div>
                          <div>
                             <p className="text-[22px] font-bold text-gray-900">{log.name}</p>
                             <div className="flex items-center gap-3 mt-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#c3a2ab]">{log.phone}</p>
                                <span className="text-[8px] text-gray-300">•</span>
                                <p className="text-[10px] font-medium text-gray-400">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="hidden md:block text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Cart Content</p>
                             <p className="text-[10px] font-bold text-gray-900 max-w-[200px] truncate">{log.order}</p>
                          </div>
                          <button 
                            onClick={() => handleNudge(log.id)}
                            disabled={nudging[log.id]}
                            className="bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-black transition-all flex items-center gap-2 group-hover:scale-105 shadow-lg shadow-black/5 disabled:opacity-50"
                          >
                             {nudging[log.id] ? "Wait..." : "Nudge"} <ChevronRight size={12} />
                          </button>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-4">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <CheckCircle2 size={32} />
                     </div>
                     <p className="text-[22px] font-bold text-gray-400">No abandoned sessions detected recently.</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Global Best Sellers Rendering */}
        <div className="lg:col-span-12 xl:col-span-5 bg-gray-900 rounded-[3rem] shadow-2xl shadow-black/20 p-10 text-white relative overflow-hidden">
           <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-[#c3a2ab]/10 rounded-full blur-[100px]"></div>
           
           <div className="relative">
             <div className="flex items-center justify-between mb-10">
               <div>
                  <h2 className="text-[36px] font-display font-black tracking-tight text-white">Top Sellers</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#c3a2ab]">Live Ranking</p>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Star size={20} className="text-amber-400" />
               </div>
             </div>

             <div className="space-y-8">
                {stats.bestSellers && stats.bestSellers.length > 0 ? (
                  stats.bestSellers.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between group">
                       <div className="flex items-center gap-5">
                          <div className="text-[36px] font-display font-black text-white/10 italic group-hover:text-[#c3a2ab]/40 transition-colors w-8">
                             0{index + 1}
                          </div>
                          <div>
                             <p className="text-[22px] font-bold text-white group-hover:text-[#c3a2ab] transition-colors">{product.name}</p>
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">{product.sold} UNITS SOLD</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[22px] font-black">฿{product.revenue.toLocaleString()}</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-20">Data processing...</p>
                )}
             </div>

             <button className="w-full mt-12 py-5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5">
                Promote Top Sellers
             </button>
           </div>
        </div>

      </div>

    </div>
  );
}
