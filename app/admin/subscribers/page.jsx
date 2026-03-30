"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, Mailbox, UserCheck, Ghost, Trash2 } from "lucide-react";

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, CONVERTED, GUEST

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      } else {
        toast.error("Failed to fetch subscribers");
      }
    } catch (error) {
       console.error(error);
       toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id, email) => {
     if (!confirm(`Are you sure you want to remove ${email} from the mailing list?`)) return;

     try {
       const res = await fetch("/api/admin/subscribers", {
         method: "DELETE",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ id })
       });
       
       if (res.ok) {
         toast.success("Subscriber removed successfully");
         setSubscribers(prev => prev.filter(s => s.id !== id));
       } else {
         toast.error("Failed to delete subscriber");
       }
     } catch (error) {
       console.error(error);
       toast.error("Network error");
     }
  };

  // derived metrics
  const totalSubs = subscribers.length;
  const convertedCount = subscribers.filter(s => s.isRegistered).length;
  const guestCount = totalSubs - convertedCount;
  const conversionRate = totalSubs > 0 ? Math.round((convertedCount / totalSubs) * 100) : 0;

  const filteredSubs = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "ALL" 
                          ? true 
                          : filterType === "CONVERTED" 
                             ? sub.isRegistered 
                             : !sub.isRegistered;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Metrics */}
      <div className="flex flex-col gap-6 ">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 text-gray-900">Mailing List</h1>
            <p className="text-gray-500">Track newsletter sign-ups from the storefront footer.</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center justify-between group hover:border-[#c3a2ab] transition-all">
            <div>
              <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">Total Audience</p>
              <p className="text-3xl font-display font-bold text-gray-900">{totalSubs}</p>
            </div>
            <div className="w-12 h-12 bg-[#c3a2ab]/10 rounded-2xl flex items-center justify-center transition-colors">
              <Mailbox className="w-5 h-5 text-[#c3a2ab]" />
            </div>
          </div>
          
          <div className="bg-[#161314] text-white p-6 rounded-3xl border border-black shadow-xl shadow-black/20 flex items-center justify-between relative overflow-hidden group">
             <div className="absolute -right-10 -top-10 w-24 h-24 bg-green-500/20 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">Registered</p>
              <p className="text-3xl font-display font-bold">{convertedCount}</p>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative z-10">
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center justify-between group hover:border-gray-300 transition-all">
            <div>
              <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">Guest Emails</p>
              <p className="text-3xl font-display font-bold text-gray-900">{guestCount}</p>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center transition-colors">
              <Ghost className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center justify-between group hover:border-blue-200 transition-all">
            <div>
              <p className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-1">Conversion Rate</p>
              <p className="text-3xl font-display font-bold text-gray-900">{conversionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-blue-500">monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border-none bg-gray-50 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c3a2ab] sm:text-sm transition-shadow"
            placeholder="Search email addresses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
           {["ALL", "CONVERTED", "GUEST"].map((type) => (
             <button
               key={type}
               onClick={() => setFilterType(type)}
               className={`px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all duration-300 ${
                  filterType === type 
                   ? "bg-[#161314] text-white shadow-md shadow-black/10" 
                   : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
               }`}
             >
               {type}
             </button>
           ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-gray-400 space-y-4">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#c3a2ab] rounded-full animate-spin"></div>
              <p className="font-medium tracking-wider uppercase text-sm">Scanning Inbox...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 text-gray-400 text-xs uppercase tracking-widest font-bold">
                <tr>
                  <th className="py-5 px-8">Email Address</th>
                  <th className="py-5 px-8">Sign Up Date</th>
                  <th className="py-5 px-8 text-center">Connection Status</th>
                  <th className="py-5 px-8 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSubs.length > 0 ? (
                  filteredSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#fdf2f4]/30 transition-colors group">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center text-[#c3a2ab]">
                             <Mailbox className="w-4 h-4"/>
                          </div>
                          <span className="font-bold text-gray-900">{sub.email}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-gray-900">{new Date(sub.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                           <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{new Date(sub.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-center">
                         {sub.isRegistered ? (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-[10px] uppercase font-black tracking-widest">
                               <UserCheck className="w-3.5 h-3.5" />
                               Registered User
                             </span>
                         ) : (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                               <Ghost className="w-3.5 h-3.5" />
                               Guest Only
                             </span>
                         )}
                      </td>
                      <td className="py-5 px-8 text-right">
                         <button 
                           onClick={() => handleDelete(sub.id, sub.email)}
                           className="inline-flex items-center justify-center p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all focus:outline-none"
                           title="Remove from mailing list"
                         >
                           <Trash2 className="w-5 h-5"/>
                         </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                       <div className="flex flex-col items-center justify-center text-gray-400 space-y-3">
                          <Mailbox className="w-12 h-12 text-gray-200" />
                          <p className="text-lg font-medium text-gray-500">No subscribers found</p>
                          <p className="text-sm">Try adjusting your filters.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
