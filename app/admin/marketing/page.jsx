"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, Send, AlertCircle, Users, FlaskConical } from "lucide-react";

export default function MarketingBroadcast() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const handleSend = async (isTest = false) => {
    if (!subject.trim() || !content.trim()) {
      toast.error("Please provide both subject and content.");
      return;
    }
    if (isTest && !testEmail.trim()) {
      toast.error("Please provide a test email address.");
      return;
    }

    if (!isTest) {
      if (!confirm("Are you sure you want to broadcast this email to ALL registered customers? This action cannot be undone.")) {
        return;
      }
    }

    setIsSending(true);
    const toastId = toast.loading(isTest ? "Sending test email..." : "Broadcasting to all customers...");

    try {
      const res = await fetch("/api/admin/marketing/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          content,
          testEmail: isTest ? testEmail : null
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(isTest ? "Test email sent successfully" : `Broadcast sent to ${data.count} customers!`, { id: toastId });
        if (!isTest) {
          setSubject("");
          setContent("");
        }
      } else {
        toast.error(data.error || "Failed to send email", { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error occurred", { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Mail className="w-8 h-8 text-[#c3a2ab]" />
            Email Broadcast
          </h1>
          <p className="text-gray-500 mt-2">Send promotional campaigns, newsletters, and announcements directly to all registered users.</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
         <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
            <AlertCircle className="w-5 h-5"/>
         </div>
         <div>
            <h3 className="font-bold text-amber-800 text-sm">SMTP Configuration Required</h3>
            <p className="text-amber-700 text-sm mt-1 leading-relaxed">
               To successfully deliver emails, ensure your server environment (e.g. <code>.env</code> file) is configured with valid SMTP credentials: <br/>
               <code className="bg-amber-100/50 px-1 py-0.5 rounded text-amber-900 font-mono text-xs">EMAIL_SERVER_HOST</code>, 
               <code className="bg-amber-100/50 px-1 py-0.5 rounded text-amber-900 font-mono text-xs ml-1">EMAIL_SERVER_PORT</code>,
               <code className="bg-amber-100/50 px-1 py-0.5 rounded text-amber-900 font-mono text-xs ml-1">EMAIL_SERVER_USER</code>,
               <code className="bg-amber-100/50 px-1 py-0.5 rounded text-amber-900 font-mono text-xs ml-1">EMAIL_SERVER_PASSWORD</code>.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Editor Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/20 border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-gray-50 p-6 border-b border-gray-100">
               <h2 className="font-bold text-gray-900 flex items-center gap-2">
                 <span className="material-symbols-outlined text-[20px] text-gray-400">edit_document</span>
                 Compose Campaign
               </h2>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
               <div>
                 <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">Subject Line</label>
                 <input 
                   type="text" 
                   value={subject}
                   onChange={e => setSubject(e.target.value)}
                   placeholder="e.g. 🌟 Flash Sale: 20% Off All Serums Today Only!" 
                   className="w-full border border-gray-200 rounded-xl p-4 text-gray-900 font-medium focus:ring-2 focus:ring-[#c3a2ab] focus:border-transparent outline-none transition-shadow"
                 />
               </div>
               
               <div className="flex-1 flex flex-col">
                 <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-2 flex items-center justify-between">
                    Email Body (HTML Supported)
                 </label>
                 <textarea 
                   value={content}
                   onChange={e => setContent(e.target.value)}
                   placeholder="<h1>Hi there,</h1><br/><p>We have a special offer for you!</p>" 
                   className="w-full flex-1 min-h-[300px] border border-gray-200 rounded-xl p-4 text-gray-900 font-mono text-sm focus:ring-2 focus:ring-[#c3a2ab] focus:border-transparent outline-none transition-shadow bg-gray-50/50"
                 />
               </div>
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Test Email Box */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 space-y-4">
             <div className="flex items-center gap-2 text-gray-900 font-bold mb-2">
                <FlaskConical className="w-5 h-5 text-blue-500"/>
                <h3>Test Flight</h3>
             </div>
             <p className="text-gray-500 text-xs">Send a test copy to yourself before broadcasting to the entire user base.</p>
             
             <input 
                 type="email" 
                 value={testEmail}
                 onChange={e => setTestEmail(e.target.value)}
                 placeholder="admin@example.com" 
                 className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
             />
             <button 
                 onClick={() => handleSend(true)}
                 disabled={isSending || !subject || !content}
                 className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
             >
                 Send Test Only
             </button>
          </div>

          {/* Broadcast Launch Box */}
          <div className="bg-[#161314] rounded-[2rem] shadow-xl p-6 space-y-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#c3a2ab]/20 rounded-full blur-2xl pointer-events-none"></div>
             
             <div className="relative z-10">
                 <div className="flex items-center gap-2 font-bold mb-2 text-xl">
                    <Send className="w-5 h-5 text-[#c3a2ab]"/>
                    <h3>Broadcast</h3>
                 </div>
                 <p className="text-gray-400 text-sm mb-6">Instantly deliver this campaign to all users who have an email address associated with their account.</p>

                 <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Audience</span>
                    <span className="flex items-center gap-1.5 font-bold text-[#c3a2ab]">
                       <Users className="w-4 h-4"/>
                       All Users
                    </span>
                 </div>
                 
                 <button 
                     onClick={() => handleSend(false)}
                     disabled={isSending || !subject || !content}
                     className="w-full bg-[#c3a2ab] hover:bg-[#b08d96] text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-[#c3a2ab]/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                 >
                     <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                     {isSending ? "Transmitting..." : "Launch Campaign"}
                 </button>
                 
                 <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-widest">
                    Double check content before sending
                 </p>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
