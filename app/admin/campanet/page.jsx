"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { 
  Search, 
  Trash2, 
  User, 
  Phone, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  XCircle, 
  MessageSquare,
  ChevronRight,
  Download,
  PhoneCall,
  ExternalLink,
  Copy,
  Edit3,
  X,
  PieChart,
  Users,
  TrendingUp,
  Zap
} from "lucide-react";

export default function AdminCampanet() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/campanet");
      if (res.ok) {
        const data = await res.json();
        setForms(data);
      } else {
        toast.error("Failed to fetch registrations");
      }
    } catch (error) {
      toast.error("An error occurred while loading registrations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this registration?")) return;
    
    try {
      const res = await fetch(`/api/admin/campanet?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setForms(forms.filter(f => f.id !== id));
        toast.success("Registration deleted");
        if (selectedLead?.id === id) setIsModalOpen(false);
      } else {
        toast.error("Failed to delete registration");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const handleUpdate = async (id, status, notes) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/campanet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, notes })
      });
      if (res.ok) {
        const updated = await res.json();
        setForms(forms.map(f => f.id === id ? updated : f));
        setSelectedLead(updated);
        toast.success("Lead updated successfully");
      } else {
        toast.error("Failed to update lead");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLeads = forms.filter(f => new Date(f.createdAt) >= today).length;
    const successLeads = forms.filter(f => f.status === "SUCCESS").length;
    const conversionRate = forms.length > 0 ? (successLeads / forms.length * 100).toFixed(1) : 0;

    return {
      total: forms.length,
      today: todayLeads,
      success: successLeads,
      rate: conversionRate
    };
  }, [forms]);

  const filteredForms = forms.filter(form => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (form.name && form.name.toLowerCase().includes(term)) ||
      (form.phone && form.phone.includes(term)) ||
      (form.order && form.order.includes(term));
    
    const matchesStatus = statusFilter === "ALL" || form.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "SUCCESS": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "CONTACTED": return "bg-blue-50 text-blue-700 border-blue-100";
      case "CANCELLED": return "bg-rose-50 text-rose-700 border-rose-100";
      case "NEW": return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const openDetail = (lead) => {
    setSelectedLead(lead);
    setEditingNotes(lead.notes || "");
    setIsModalOpen(true);
  };

  const exportCSV = () => {
    const headers = ["Date", "Name", "Phone", "Order", "Status", "Notes"];
    const rows = filteredForms.map(f => [
      new Date(f.createdAt).toLocaleString(),
      f.name,
      f.phone,
      f.order,
      f.status,
      f.notes || ""
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campanet_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading && forms.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
       <div className="w-10 h-10 border-4 border-[#c3a2ab] border-t-transparent rounded-full animate-spin mb-4"></div>
       <p className="text-gray-500 font-medium">Initializing CRM Dashboard...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gray-900 text-white rounded-2xl shadow-xl">
                 <Users size={24} />
              </div>
              <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight">Campanet CRM</h1>
           </div>
           <p className="text-gray-500 max-w-md">Professional lead management and conversion tracking system.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
           <button 
             onClick={exportCSV}
             className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-700 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm"
           >
             <Download size={16} /> Export CSV
           </button>
           <button 
             onClick={fetchForms}
             className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all shadow-sm"
           >
             <TrendingUp size={18} />
           </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Users size={120} />
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Total Leads</p>
           <p className="text-4xl font-display font-bold text-gray-900">{stats.total}</p>
           <div className="mt-2 text-[10px] text-gray-500">Lifetime registrations</div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 opacity-5 text-amber-500 group-hover:scale-110 transition-transform duration-500">
              <Clock size={120} />
           </div>
           <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">New Today</p>
           <p className="text-4xl font-display font-bold text-gray-900">{stats.today}</p>
           <div className="mt-2 text-[10px] text-amber-600 font-bold">Expect high response time</div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute -right-4 -bottom-4 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform duration-500">
              <CheckCircle size={120} />
           </div>
           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Success Deals</p>
           <p className="text-4xl font-display font-bold text-gray-900">{stats.success}</p>
           <div className="mt-2 text-[10px] text-emerald-600 font-bold">Closed successfully</div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group text-white bg-gradient-to-br from-gray-900 to-gray-800">
           <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <PieChart size={120} />
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Conversion</p>
           <p className="text-4xl font-display font-bold">{stats.rate}%</p>
           <div className="mt-2 text-[10px] text-gray-400">Target: 15% minimum</div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
         <div className="relative flex-1 group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#c3a2ab] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Deep search by customer name, phone prefix or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-[#c3a2ab]/10 transition-all text-sm shadow-sm font-medium"
            />
         </div>
         <div className="bg-gray-100/50 p-1.5 rounded-[2rem] flex items-center w-full lg:w-auto overflow-x-auto whitespace-nowrap">
            {["ALL", "NEW", "CONTACTED", "SUCCESS", "CANCELLED"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-[1.5rem] transition-all ${
                  statusFilter === status 
                    ? "bg-white text-gray-900 shadow-md" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {status}
              </button>
            ))}
         </div>
      </div>

      {/* CRM Table */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Acquisition Date</th>
                <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Customer Details</th>
                <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Reference</th>
                <th className="py-6 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredForms.length > 0 ? (
                filteredForms.map((form) => (
                  <tr key={form.id} className="group hover:bg-gray-50/80 transition-all duration-300">
                    <td className="py-7 px-8">
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-900">
                             {new Date(form.createdAt).toLocaleDateString("en-US", { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                             <Clock size={10} /> {new Date(form.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </td>
                    <td className="py-7 px-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#c3a2ab]/10 rounded-2xl flex items-center justify-center text-[#c3a2ab] font-bold text-lg group-hover:scale-110 transition-transform duration-500 shadow-inner">
                             {form.name?.charAt(0) || <User size={20} />}
                          </div>
                          <div>
                             <p className="font-bold text-gray-900 group-hover:text-[#c3a2ab] transition-colors">{form.name}</p>
                             <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-gray-500 font-medium">{form.phone}</p>
                                <button onClick={() => {navigator.clipboard.writeText(form.phone); toast.success("Copied phone");}} className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-gray-900 transition-all">
                                   <Copy size={12} />
                                </button>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="py-7 px-6">
                       <div className="inline-flex items-center gap-2 bg-gray-100/80 px-3 py-1.5 rounded-xl border border-gray-50 shadow-sm text-xs font-bold text-gray-700">
                          <ClipboardList size={14} className="text-gray-400" />
                          {form.order}
                       </div>
                    </td>
                    <td className="py-7 px-6">
                       <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border ${getStatusStyle(form.status)} uppercase shadow-sm`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                             form.status === "SUCCESS" ? "bg-emerald-500" : 
                             form.status === "NEW" ? "bg-amber-500" :
                             form.status === "CONTACTED" ? "bg-blue-500" : "bg-rose-500"
                          } animate-pulse`} />
                          {form.status}
                       </span>
                    </td>
                    <td className="py-7 px-8 text-center">
                       <div className="flex justify-center items-center gap-2">
                          <button 
                            onClick={() => openDetail(form)}
                            className="p-3 bg-white border border-gray-100 text-[#c3a2ab] hover:bg-gray-900 hover:text-white rounded-2xl transition-all shadow-sm group/btn"
                          >
                             <ChevronRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                          <a 
                             href={`tel:${form.phone}`}
                             className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-emerald-500 rounded-2xl transition-all shadow-sm"
                          >
                             <PhoneCall size={18} />
                          </a>
                          <button 
                            onClick={() => handleDelete(form.id)}
                            className="p-3 bg-white border border-gray-100 text-gray-300 hover:text-rose-500 rounded-2xl transition-all shadow-sm"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-400 grayscale opacity-40">
                       <Search size={64} />
                       <p className="text-sm font-bold uppercase tracking-widest text-gray-300">No leads match your criteria</p>
                       <button onClick={() => {setSearchTerm(""); setStatusFilter("ALL");}} className="px-6 py-2 border border-gray-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all text-gray-400">Clear Search View</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal / CRM Sidebar */}
      {isModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end md:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-xl h-full md:h-[95vh] md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 relative">
              
              {/* Profile Header */}
              <div className="p-8 md:p-10 bg-gradient-to-br from-gray-900 to-[#161314] text-white relative">
                 <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all">
                    <X size={24} />
                 </button>
                 
                 <div className="flex items-end gap-6 mb-8 mt-4">
                    <div className="w-24 h-24 bg-[#c3a2ab] rounded-[2rem] flex items-center justify-center text-4xl font-bold shadow-2xl border-4 border-white/10">
                       {selectedLead.name?.charAt(0)}
                    </div>
                    <div className="pb-2">
                       <h2 className="text-3xl font-display font-bold leading-tight uppercase tracking-tight">{selectedLead.name}</h2>
                       <p className="text-[#c3a2ab] font-bold text-sm mt-1">{selectedLead.phone}</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <a href={`tel:${selectedLead.phone}`} className="flex-1 bg-white text-gray-900 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all">
                       <PhoneCall size={14} /> Start Call
                    </a>
                    <a href={`https://wa.me/${selectedLead.phone}`} target="_blank" className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                       <MessageSquare size={14} /> WhatsApp
                    </a>
                 </div>
              </div>

              {/* Status Control */}
              <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10">
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                       <TrendingUp size={12} /> Pipeline Status
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                       {["NEW", "CONTACTED", "SUCCESS", "CANCELLED"].map(s => (
                          <button
                            key={s}
                            onClick={() => handleUpdate(selectedLead.id, s, editingNotes)}
                            className={`px-4 py-4 rounded-[1.5rem] text-[10px] font-bold tracking-widest border-2 transition-all flex flex-col items-center gap-2 ${
                               selectedLead.status === s 
                               ? "bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-900/10 scale-105 z-10" 
                               : "bg-gray-50 text-gray-400 border-transparent hover:border-gray-100"
                            }`}
                          >
                             {s === "SUCCESS" && <CheckCircle size={18} />}
                             {s === "CONTACTED" && <Phone size={18} />}
                             {s === "NEW" && <Zap size={18} />}
                             {s === "CANCELLED" && <XCircle size={18} />}
                             {s}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
                       <Edit3 size={12} /> CRM Notes
                    </h3>
                    <textarea 
                       className="w-full h-40 bg-gray-50 border-none rounded-[2rem] p-6 text-sm text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-[#c3a2ab]/10 outline-none transition-all resize-none shadow-inner"
                       placeholder="Log customer response, preferences or specific requests here..."
                       value={editingNotes}
                       onChange={(e) => setEditingNotes(e.target.value)}
                    />
                    <div className="flex justify-end">
                       <button 
                         disabled={saving || editingNotes === (selectedLead.notes || "")}
                         onClick={() => handleUpdate(selectedLead.id, selectedLead.status, editingNotes)}
                         className="px-8 py-3 bg-[#c3a2ab] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#c3a2ab]/20 hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100"
                       >
                          {saving ? "Saving Changes..." : "Save Notes"}
                       </button>
                    </div>
                 </div>

                 <div className="bg-gray-50 rounded-[2.5rem] p-8 space-y-6 shadow-inner border border-gray-100/50">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-400 font-bold uppercase">Registration Source</span>
                       <span className="font-bold text-gray-900 flex items-center gap-2">Campanet LP <ExternalLink size={10} /></span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-400 font-bold uppercase">Client IP Address</span>
                       <span className="font-bold text-gray-900 opacity-20 italic">Encrypted Point</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-400 font-bold uppercase">Internal Ref</span>
                       <span className="font-mono bg-white px-2 py-1 rounded border border-gray-100">{selectedLead.order}</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center text-[10px]">
                       <span className="text-gray-300 font-bold uppercase">Acquisition Timestamp</span>
                       <span className="text-gray-400 italic">{new Date(selectedLead.createdAt).toLocaleString()}</span>
                    </div>
                 </div>
              </div>
              
              {/* Footer Actions */}
              <div className="p-8 border-t border-gray-50 flex gap-4">
                 <button 
                   onClick={() => handleDelete(selectedLead.id)}
                   className="p-4 bg-rose-50 text-rose-500 rounded-3xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                 >
                    <Trash2 size={24} />
                 </button>
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
                    Close Terminal
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
