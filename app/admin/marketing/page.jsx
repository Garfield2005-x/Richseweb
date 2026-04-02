"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { 
  Mail, Send, Users, Activity, 
  Play, Pause, XCircle, Trash2, Clock, 
  CheckCircle2, AlertTriangle, ShieldCheck,
  History, Settings, Eye
} from "lucide-react";

export default function MarketingDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("campaigns");

  // Create/Edit Form State
  const [editingId, setEditingId] = useState(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [audienceType, setAudienceType] = useState("ALL");
  const [isCreating, setIsCreating] = useState(false);

  // Testing State
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [activeTestId, setActiveTestId] = useState(null);

  // Stats
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [cRes, sRes, aRes] = await Promise.all([
        fetch("/api/admin/marketing/campaigns"),
        fetch("/api/admin/marketing/settings"),
        fetch("/api/admin/marketing/audit")
      ]);
      
      if (cRes.ok && sRes.ok && aRes.ok) {
        setCampaigns(await cRes.json());
        setSettings(await sRes.json());
        setAuditLogs(await aRes.json());
      }
    } catch {
      console.error("Fetch error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling for progress
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSave = async () => {
    if (!subject || !content) return toast.error("Please fill all fields");
    setIsCreating(true);
    try {
      const url = editingId ? `/api/admin/marketing/campaigns/${editingId}` : "/api/admin/marketing/campaigns";
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? {
        action: "UPDATE",
        updateSubject: subject,
        updateContent: content,
        updateAudienceType: audienceType
      } : { subject, content, audienceType };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        toast.success(editingId ? "Campaign updated" : "Campaign created as Draft");
        resetForm();
        setActiveTab("campaigns");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save campaign");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (campaign) => {
    if (campaign.status !== "DRAFT") return toast.error("Only Drafts can be edited");
    setEditingId(campaign.id);
    setSubject(campaign.subject);
    setContent(campaign.content);
    setAudienceType(campaign.audienceType);
    setActiveTab("create");
  };

  const resetForm = () => {
    setEditingId(null);
    setSubject("");
    setContent("");
    setAudienceType("ALL");
  };

  const handleAction = async (id, action) => {
    if (action === "DELETE" && !confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const url = `/api/admin/marketing/campaigns/${id}`;
      const method = action === "DELETE" ? "DELETE" : "PATCH";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: action === "DELETE" ? null : JSON.stringify({ action })
      });
      
      if (res.ok) {
        toast.success(`Action successful`);
        fetchData();
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const handleTestSend = async (id) => {
    if (!testEmail) return toast.error("Enter a test email address");
    setIsTesting(true);
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/${id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail })
      });
      if (res.ok) {
        toast.success("Test email sent!");
        setActiveTestId(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send test");
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setIsTesting(false);
    }
  };

  const toggleGlobalPause = async () => {
    const newValue = !settings.global_marketing_pause;
    try {
      const res = await fetch("/api/admin/marketing/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "global_marketing_pause", value: String(newValue) })
      });
      if (res.ok) {
        toast.success(`Global pause ${newValue ? "Enabled" : "Disabled"}`);
        fetchData();
      }
    } catch {
      toast.error("Failed to update settings");
    }
  };

  const runWorker = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Worker processing batch...");
    try {
      const res = await fetch("/api/admin/marketing/worker", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Batch complete: Sent ${data.sent}, Failed ${data.failed}`, { id: toastId });
        fetchData();
      }
    } catch {
      toast.error("Worker process failed", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Initializing Marketing Engine...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header & Global Kill Switch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-[48px] font-display font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Activity className="w-10 h-10 text-[#c3a2ab]" />
            Marketing Center
          </h1>
          <p className="text-gray-500 text-[20px]">Enterprise Campaign Management & Attribution Analytics</p>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={toggleGlobalPause}
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm ${
               settings.global_marketing_pause 
               ? "bg-red-600 text-white shadow-red-200" 
               : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
             }`}
           >
             <ShieldCheck className={`w-5 h-5 ${settings.global_marketing_pause ? "animate-pulse" : ""}`} />
             {settings.global_marketing_pause ? "SYSTEM PAUSED" : "SYSTEM ARMED"}
           </button>

           <button 
             onClick={runWorker}
             disabled={isProcessing || settings.global_marketing_pause}
             className="bg-[#161314] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all disabled:opacity-50"
           >
             <Play className="w-4 h-4 fill-current" />
             {isProcessing ? "Processing..." : "Trigger Worker"}
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-px overflow-x-auto">
        {[
          { id: "campaigns", label: "Campaigns", icon: Mail },
          { id: "create", label: editingId ? "Edit Campaign" : "New Campaign", icon: editingId ? Eye : Send },
          { id: "audit", label: "Audit Logs", icon: History },
          { id: "settings", label: "Config", icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
               setActiveTab(tab.id);
               if (tab.id !== "create" && editingId) resetForm();
            }}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-[20px] transition-all relative ${
              activeTab === tab.id ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c3a2ab] rounded-full scale-x-75"></div>
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            {campaigns.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-20 text-center">
                 <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                 <p className="text-gray-500 font-medium text-[20px]">No campaigns deployed yet.</p>
                 <button onClick={() => setActiveTab("create")} className="text-[#c3a2ab] mt-2 font-bold">Launch your first campaign</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {campaigns.map(c => (
                  <div key={c.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden relative group">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                      {/* Left: Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1 rounded-full text-[18px] font-bold uppercase tracking-widest ${
                                    c.status === "SENDING" ? "bg-blue-50 text-blue-600" :
                                    c.status === "COMPLETED" ? "bg-green-50 text-green-600" :
                                    c.status === "PAUSED" ? "bg-amber-50 text-amber-600" :
                                    "bg-gray-100 text-gray-600"
                                }`}>
                                    {c.status}
                                </span>
                                <span className="text-gray-400 font-mono text-[18px]">{c.id.substring(0, 8)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {c.status === "DRAFT" && (
                                    <button onClick={() => handleEdit(c)} className="p-2 hover:bg-gray-100 rounded-full text-blue-500" title="Edit">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => setActiveTestId(activeTestId === c.id ? null : c.id)} className="p-2 hover:bg-gray-100 rounded-full text-teal-500" title="Test Send">
                                    <Send className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleAction(c.id, "DELETE")} className="p-2 hover:bg-gray-100 rounded-full text-red-500" title="Delete">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-[32px] font-display font-medium text-gray-900 leading-tight">{c.subject}</h3>
                        
                        <div className="flex items-center gap-6 text-[20px] text-gray-500">
                          <div className="flex items-center gap-2">
                             <Users className="w-5 h-5"/>
                             {c.totalRecipients} Target ({c.audienceType})
                          </div>
                          <div className="flex items-center gap-2">
                             <Clock className="w-5 h-5"/>
                             {new Date(c.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Test Send Panel */}
                        {activeTestId === c.id && (
                           <div className="bg-teal-50 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                              <input 
                                type="email" 
                                placeholder="Enter test email..." 
                                value={testEmail}
                                onChange={e => setTestEmail(e.target.value)}
                                className="flex-1 bg-white border border-teal-100 rounded-xl px-4 py-2 outline-none"
                              />
                              <button 
                                onClick={() => handleTestSend(c.id)}
                                disabled={isTesting}
                                className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50"
                              >
                                {isTesting ? "Sending..." : "Send Test"}
                              </button>
                           </div>
                        )}

                        {/* Progress Bar */}
                        <div className="space-y-2 pt-4">
                           <div className="flex items-center justify-between text-[18px] font-bold uppercase">
                              <span className="text-gray-400">Delivery Progress</span>
                              <span className="text-gray-900">{c.totalRecipients > 0 ? Math.round((c.sentCount / c.totalRecipients) * 100) : 0}%</span>
                           </div>
                           <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all duration-1000" 
                                style={{ width: `${c.totalRecipients > 0 ? (c.sentCount / c.totalRecipients) * 100 : 0}%` }}
                              ></div>
                           </div>
                        </div>
                      </div>

                      {/* Right: Stats Grid */}
                      <div className="w-full md:w-[400px] grid grid-cols-2 gap-4">
                         <StatBox label="Opens" value={c.openCount} rate={c.sentCount > 0 ? Math.round((c.openCount / c.sentCount) * 100) : 0} color="text-teal-600" bg="bg-teal-50" />
                         <StatBox label="Clicks" value={c.clickCount} rate={c.openCount > 0 ? Math.round((c.clickCount / c.openCount) * 100) : 0} color="text-indigo-600" bg="bg-indigo-50" />
                         <StatBox label="Conversions" value={c.conversionCount} rate={c.clickCount > 0 ? Math.round((c.conversionCount / c.clickCount) * 100) : 0} color="text-[#c3a2ab]" bg="bg-[#f8f5f6]" />
                         <div className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-between">
                            <span className="text-[14px] uppercase tracking-widest font-bold text-gray-400">Controls</span>
                            <div className="flex items-center gap-2">
                               {c.status === "DRAFT" && (
                                 <ActionButton icon={Play} label="Schedule" onClick={() => handleAction(c.id, "SCHEDULE")} color="bg-[#161314] text-white" />
                               )}
                               {c.status === "SENDING" && (
                                 <ActionButton icon={Pause} label="Pause" onClick={() => handleAction(c.id, "PAUSE")} color="bg-amber-100 text-amber-700" />
                               )}
                               {c.status === "PAUSED" && (
                                 <ActionButton icon={Play} label="Resume" onClick={() => handleAction(c.id, "RESUME")} color="bg-green-100 text-green-700" />
                               )}
                               {(c.status === "SENDING" || c.status === "PAUSED") && (
                                 <ActionButton icon={XCircle} label="Cancel" onClick={() => handleAction(c.id, "CANCEL")} color="bg-red-100 text-red-700" />
                               )}
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "create" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
             <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12 space-y-10">
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[32px] font-display font-medium text-gray-900">
                            {editingId ? "Edit Campaign Draft" : "Compose New Campaign"}
                        </h2>
                        {editingId && (
                            <button onClick={resetForm} className="text-red-500 font-bold flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> Cancel Edit
                            </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[20px] uppercase tracking-widest font-bold text-gray-400 mb-2">Campaign Subject</label>
                        <input 
                          type="text" 
                          value={subject}
                          onChange={_e => setSubject(_e.target.value)}
                          placeholder="e.g. ✨ Experience the New Richse Glow"
                          className="w-full text-[32px] font-display font-medium border-b-2 border-gray-100 focus:border-[#c3a2ab] outline-none py-2 transition-colors placeholder:text-gray-200"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="block text-[20px] uppercase tracking-widest font-bold text-gray-400">Target Audience</label>
                        <div className="flex items-center gap-3">
                           {[
                             { id: "ALL", label: "Everyone", desc: "All users + subscribers" },
                             { id: "REGISTERED", label: "Registered Users", desc: "Members only" },
                             { id: "SUB_UNREG", label: "Subscribers Only", desc: "Unregistered prospects" },
                           ].map(aud => (
                             <button 
                               key={aud.id}
                               onClick={() => setAudienceType(aud.id)}
                               className={`flex-1 text-left p-4 rounded-2xl border-2 transition-all ${
                                 audienceType === aud.id 
                                 ? "border-[#c3a2ab] bg-[#f8f5f6]" 
                                 : "border-gray-100 hover:border-gray-200"
                               }`}
                             >
                               <div className={`font-bold text-[20px] ${audienceType === aud.id ? "text-[#c3a2ab]" : "text-gray-700"}`}>{aud.label}</div>
                               <div className="text-gray-400 text-[14px] uppercase tracking-tighter">{aud.desc}</div>
                             </button>
                           ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                           <label className="block text-[20px] uppercase tracking-widest font-bold text-gray-400">HTML Content</label>
                           <span className="text-[14px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono">Supports Variables: &#123;&#123;email&#125;&#125;</span>
                        </div>
                        <textarea 
                          value={content}
                          onChange={_e => setContent(_e.target.value)}
                          placeholder="<h1>Hello {{email}}...</h1>"
                          className="w-full min-h-[400px] p-6 bg-gray-50 rounded-[2rem] border-none focus:ring-4 focus:ring-[#c3a2ab]/10 outline-none text-[22px] font-mono leading-relaxed"
                        />
                      </div>
                   </div>

                   <button 
                     onClick={handleSave}
                     disabled={isCreating}
                     className="w-full bg-[#161314] text-white py-6 rounded-3xl text-[24px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                   >
                     {isCreating ? "Saving..." : editingId ? "Update Campaign Details" : "Create Campaign Snapshot"}
                   </button>
                </div>
             </div>

             <div className="space-y-6">
                {editingId && (
                   <div className="bg-teal-50 p-8 rounded-[2.5rem] border border-teal-200 space-y-4">
                      <div className="flex items-center gap-3 text-teal-600">
                        <Send className="w-6 h-6" />
                        <h3 className="font-bold text-[24px]">Test Before Sync</h3>
                      </div>
                      <p className="text-teal-700 text-[18px]">Send a test fire to check your edits before re-saving.</p>
                      <input 
                        type="email" 
                        placeholder="Test email..." 
                        value={testEmail}
                        onChange={_e => setTestEmail(_e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-teal-100 outline-none"
                      />
                      <button 
                        onClick={() => handleTestSend(editingId)}
                        disabled={isTesting}
                        className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50"
                      >
                        {isTesting ? "Firing..." : "Fire Test Email"}
                      </button>
                   </div>
                )}

                <div className="bg-[#f8f5f6] p-8 rounded-[2.5rem] border border-[#c3a2ab]/20 space-y-6">
                  <div className="flex items-center gap-3 text-[#c3a2ab]">
                    <ShieldCheck className="w-6 h-6" />
                    <h3 className="font-bold text-[24px]">Safety First</h3>
                  </div>
                  <p className="text-[#a5868e] text-[20px] leading-relaxed">
                    Once created, your campaign moves to <b>Draft</b>. You must <b>Schedule</b> it to begin the delivery process.
                  </p>
                  <ul className="space-y-4 text-[18px] text-[#a5868e]">
                     <li className="flex gap-2">
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-1" />
                        <span>Tracking pixels and HMAC links are injected automatically.</span>
                     </li>
                     <li className="flex gap-2">
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-1" />
                        <span>HTML snapshot is frozen upon scheduling for peak consistency.</span>
                     </li>
                  </ul>
                </div>
             </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-6 text-[18px] uppercase tracking-widest font-bold text-gray-400">Time</th>
                    <th className="p-6 text-[18px] uppercase tracking-widest font-bold text-gray-400">Action</th>
                    <th className="p-6 text-[18px] uppercase tracking-widest font-bold text-gray-400">Admin</th>
                    <th className="p-6 text-[18px] uppercase tracking-widest font-bold text-gray-400">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="p-6 text-[18px] text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-6">
                        <span className="font-bold text-gray-900 border-b-2 border-[#c3a2ab]/20">{log.action}</span>
                      </td>
                      <td className="p-6 text-[18px] font-medium">{log.adminEmail}</td>
                      <td className="p-6 text-[18px] text-gray-400">{log.campaign?.subject || "-"}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === "settings" && (
           <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 space-y-8">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-blue-500" />
                    <h2 className="text-[32px] font-display font-medium">Enterprise Guard</h2>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                       <div>
                          <h3 className="font-bold text-[24px] text-gray-900">Global Marketing Pause</h3>
                          <p className="text-gray-500 text-[18px]">Instantly halt ALL workers and active campaigns across the entire platform.</p>
                       </div>
                       <button 
                         onClick={toggleGlobalPause}
                         className={`w-16 h-8 rounded-full relative transition-colors ${
                           settings.global_marketing_pause ? "bg-red-600" : "bg-gray-300"
                         }`}
                       >
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            settings.global_marketing_pause ? "left-9" : "left-1"
                          }`}></div>
                       </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <ConfigInput label="Batch Size" value={settings.config?.marketing_batch_size || "100"} />
                       <ConfigInput label="Retry Attempts" value={settings.config?.marketing_retry_limit || "3"} />
                       <ConfigInput label="Rate Limit (req/min)" value={settings.config?.marketing_rate_limit || "60"} />
                       <ConfigInput label="Failover Grace (min)" value={settings.config?.marketing_failover_grace || "15"} />
                    </div>
                 </div>
              </div>

               <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 flex gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                  <p className="text-amber-800 text-[20px] leading-snug">
                     <b>Warning:</b> Changes to the configuration layer affect processing logic immediately. System administrators should monitor the <b>Marketing Queue</b> closely after adjusting batch or rate parameters.
                  </p>
               </div>
           </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, rate, color, bg }) {
  return (
    <div className={`${bg} rounded-3xl p-5 border border-white flex flex-col justify-between`}>
       <div className="flex items-center justify-between">
          <span className="text-[14px] uppercase tracking-widest font-bold text-gray-400">{label}</span>
          <span className={`text-[18px] font-bold ${color}`}>{rate}%</span>
       </div>
       <div className={`text-[32px] font-display font-medium ${color}`}>{value.toLocaleString()}</div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, color }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-xl transition-all hover:scale-105 active:scale-95 ${color}`}
      title={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

function ConfigInput({ label, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-2">
       <label className="text-[14px] uppercase tracking-widest font-bold text-gray-400">{label}</label>
       <input 
         type="text" 
         defaultValue={value} 
         className="w-full text-[24px] font-bold text-gray-900 outline-none"
       />
    </div>
  );
}
