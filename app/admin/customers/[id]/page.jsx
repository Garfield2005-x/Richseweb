"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Package, Heart, Laptop, Calendar, ShieldAlert, KeyRound, Award, Shield } from "lucide-react";
import Image from "next/image";

export default function CustomerDetail(props) {
  const params = use(props.params);
  const id = params.id;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // CRM Actions State
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsAction, setPointsAction] = useState("add");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await fetch(`/api/admin/customers/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCustomer(data);
        } else {
          toast.error("Failed to fetch customer data");
        }
      } catch (error) {
        toast.error("An error occurred loading the customer");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [id]);

  const handlePointsUpdate = async () => {
    if (!pointsAmount || isNaN(pointsAmount) || Number(pointsAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: pointsAction, amount: Number(pointsAmount) })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setCustomer(prev => ({ ...prev, points: data.points }));
        setShowPointsModal(false);
        setPointsAmount("");
      } else {
        toast.error(data.message || "Failed to update points");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRoleToggle = async () => {
    const newRole = customer.role === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setCustomer(prev => ({ ...prev, role: data.role }));
      } else {
        toast.error(data.message || "Failed to update role");
      }
    } catch (error) {
       console.error(error);
       toast.error("Network error");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#c3a2ab] rounded-full animate-spin"></div>
    </div>
  );
  
  if (!customer) return <div className="p-8 text-center font-display text-[36px] text-red-500">Customer Profile Not Found</div>;

  const isAdmin = customer.role === "ADMIN";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers" className="group p-3 bg-white border border-gray-100 rounded-2xl hover:border-[#c3a2ab] hover:shadow-lg hover:shadow-[#c3a2ab]/10 transition-all">
            <ArrowLeft className="h-5 w-5 text-gray-500 group-hover:text-[#c3a2ab] transition-colors" />
          </Link>
          <div>
            <h1 className="text-[44px] font-display font-bold text-gray-900 tracking-tight">Customer Dossier</h1>
            <p className="text-gray-500 text-[22px] mt-1 flex items-center gap-2">
              <KeyRound className="w-3 h-3"/> Internal ID: <span className="font-mono text-[20px] bg-gray-100 px-2 py-0.5 rounded-md">{customer.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[20px] font-black tracking-widest uppercase border shadow-sm ${
               isAdmin 
               ? "bg-red-50 text-red-600 border-red-200 shadow-red-500/10" 
               : "bg-gray-50 text-gray-700 border-gray-200"
            }`}>
                {isAdmin ? <ShieldAlert className="w-4 h-4"/> : <Shield className="w-4 h-4"/>}
                {customer.role}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Identity & CRM (Span 4) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Hero Profile Card */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 p-8 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#c3a2ab]/20 to-transparent rounded-t-[2.5rem] -z-10 group-hover:scale-105 transition-transform duration-700"></div>
            
            <div className="flex justify-center mb-6 pt-4">
              <div className="w-28 h-28 bg-white shadow-lg border-4 border-white rounded-full overflow-hidden flex items-center justify-center relative">
                {customer.image ? (
                  <Image src={customer.image} alt={customer.name} fill className="object-cover" />
                ) : (
                  <span className="material-symbols-outlined notranslate text-[#c3a2ab]/30 text-5xl">person</span>
                )}
              </div>
            </div>
            
            <div className="text-center space-y-2 mb-8 relative">
               <h2 className="text-[36px] font-display font-bold text-gray-900 flex items-center justify-center gap-2">
                 {customer.name || "Anonymous User"}
                 {customer.accounts && customer.accounts.some(a => a.provider === 'google') && (
                    <span className="text-[10px] bg-red-50 text-red-500 border border-red-100 font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm align-middle">Google Auth</span>
                 )}
               </h2>
               <p className="text-gray-500 text-[22px]">{customer.email}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-[#fdf2f4] rounded-2xl p-5 border border-purple-100/50 flex justify-between items-center text-left">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-[#c3a2ab]">
                    <Award className="w-5 h-5"/>
                 </div>
                 <div>
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Loyalty Balance</p>
                    <p className="text-[30px] font-display font-bold text-gray-900">{customer.points?.toLocaleString() || 0} <span className="text-[22px] font-medium text-gray-500">pts</span></p>
                 </div>
              </div>
            </div>
          </div>

          {/* Contact & Logistics */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"><MapPin className="w-4 h-4"/></div>
                <h3 className="font-bold text-gray-900 font-display text-[26px]">Logistics</h3>
             </div>
             <div className="space-y-6">
                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Primary Phone</p>
                   <p className="text-[22px] font-medium text-gray-900 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 inline-block">
                     {customer.phone || "Not provided"}
                   </p>
                </div>
                <div>
                   <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-2">Shipping Address</p>
                   {customer.address ? (
                      <div className="text-[22px] text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="font-medium text-gray-900 mb-1">{customer.name}</p>
                          {customer.address}<br/>
                          {customer.subdistrict} {customer.district}<br/>
                          {customer.province} {customer.postal_code}
                      </div>
                   ) : (
                      <p className="text-[22px] italic text-gray-400 bg-gray-50 p-4 rounded-xl border border-gray-50 text-center">No address on file</p>
                   )}
                 </div>
              </div>
           </div>

           {/* Security Footprint */}
           <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                 <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"><Laptop className="w-4 h-4"/></div>
                 <h3 className="font-bold text-gray-900 font-display text-[26px]">System Data</h3>
              </div>
              <div className="space-y-5">
                 <div className="flex items-center justify-between">
                    <p className="text-[20px] text-gray-500 font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Registered</p>
                    <p className="text-[22px] font-bold text-gray-900">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "Unknown"}</p>
                 </div>

                 <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <p className="text-[20px] text-gray-500 font-medium flex items-center gap-1.5"><Shield className="w-3.5 h-3.5"/> Authentication</p>
                    <p className="text-[22px] font-bold text-gray-900 text-right">
                       {customer.accounts && customer.accounts.some(a => a.provider === 'google') ? "Google SSO" : "Email / Password"}
                    </p>
                 </div>
                 
                 <div className="border-t border-gray-50 pt-3">
                    <p className="text-[20px] text-gray-500 font-medium mb-2">Latest Login Environment</p>
                    {customer.loginDevices && customer.loginDevices.length > 0 ? (
                       <div className="bg-[#f8f9fa] rounded-xl p-4 text-[20px] font-mono space-y-2 border border-gray-100">
                          <div className="flex justify-between items-center text-gray-900 font-bold">
                             <span>{customer.loginDevices[0].device}</span>
                             <span>{customer.loginDevices[0].os}</span>
                          </div>
                          <p className="text-gray-500 text-[10px]">{customer.loginDevices[0].browser}</p>
                          {customer.loginDevices[0].ip && (
                              <p className="text-blue-600/70 pt-2 border-t border-gray-200/50 mt-2">
                                  IP: {customer.loginDevices[0].ip}
                              </p>
                          )}
                       </div>
                    ) : (
                       <p className="text-[22px] italic text-gray-400 bg-gray-50 p-3 rounded-lg text-center">No device history tracked</p>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: App Data & Transactions (Span 8) */}
        <div className="lg:col-span-8 space-y-8 flex flex-col">
          
          {/* CRM Control Panel */}
          <div className="bg-[#161314] text-white rounded-[2rem] shadow-xl p-8 flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden">
             <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
             <div>
                <h3 className="font-display text-[36px] font-bold mb-2">CRM Controls</h3>
                <p className="text-gray-400 text-[22px] max-w-sm">Manage loyalty privileges and system access levels for this user account.</p>
             </div>
             <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setShowPointsModal(true)}
                  disabled={isUpdating}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-3 px-6 rounded-xl transition-all text-[22px] flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                   <span className="material-symbols-outlined text-[18px]">stars</span>
                   Adjust Loyalty
                </button>

                <button 
                  onClick={handleRoleToggle}
                  disabled={isUpdating}
                  className={`${isAdmin ? 'bg-red-500/20 text-red-100 hover:bg-red-500/30 border-red-500/30' : 'bg-white hover:bg-gray-100 text-black border-transparent'} border font-bold py-3 px-6 rounded-xl transition-all text-[22px] flex items-center justify-center gap-2`}
                >
                   <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                   {isAdmin ? "Demote to User" : "Make Admin"}
                </button>
             </div>
          </div>

          {/* Order History Table */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
             <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Package className="w-5 h-5"/></div>
                   <h3 className="font-bold text-gray-900 font-display text-[30px]">Order Ledger</h3>
                </div>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[20px] font-bold leading-none">{customer.orders?.length || 0} Total</span>
             </div>
             
             <div className="overflow-x-auto flex-1">
                {customer.orders?.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-8">Order Ref</th>
                                <th className="py-4 px-8">Placed On</th>
                                <th className="py-4 px-8 text-center">Volume</th>
                                <th className="py-4 px-8 text-right">Value</th>
                                <th className="py-4 px-8 text-center">Fulfillment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[22px]">
                            {customer.orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-5 px-8 font-mono text-gray-900 font-medium">
                                        <Link href={`/admin/orders`} className="group-hover:text-[#c3a2ab] transition-colors">{order.order_number}</Link>
                                    </td>
                                    <td className="py-5 px-8 text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="py-5 px-8 text-gray-500 text-center font-medium">
                                        {order.order_items?.length || 0}
                                    </td>
                                    <td className="py-5 px-8 font-bold text-gray-900 text-right">
                                        ฿{order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-5 px-8 flex justify-center">
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border
                                            ${order.status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200" :
                                            order.status === "SHIPPED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                            order.status === "PENDING" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                            "bg-gray-50 text-gray-700 border-gray-200"}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="h-full min-h-[250px] flex flex-col items-center justify-center p-8 text-center">
                       <Package className="w-12 h-12 text-gray-200 mb-3"/>
                       <p className="text-gray-500 font-medium">No transactions recorded yet.</p>
                       <p className="text-[22px] text-gray-400">Order history will appear here once the customer purchases.</p>
                    </div>
                )}
             </div>
          </div>

          {/* Wishlist Gallery */}
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#c3a2ab]"><Heart className="w-5 h-5"/></div>
                   <h3 className="font-bold text-gray-900 font-display text-[30px]">Saved Impressions</h3>
                </div>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[20px] font-bold leading-none">{customer.wishlist?.length || 0} Items</span>
             </div>
             
             <div className="p-8 bg-gray-50/30">
                {customer.wishlist?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {customer.wishlist.map((item) => (
                            <Link href={`/product/${item.product?.id}`} key={item.id} className="bg-white border border-gray-100/50 rounded-2xl p-4 flex flex-col items-center text-center gap-4 group hover:border-[#c3a2ab] hover:shadow-xl hover:shadow-[#c3a2ab]/5 transition-all">
                                <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                                  <Image 
                                      src={item.product?.image || "/placeholder.jpg"} 
                                      alt={item.product?.name || "Product"}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                                  />
                                </div>
                                <span className="text-[22px] font-bold text-gray-900 line-clamp-2 group-hover:text-[#c3a2ab] transition-colors">{item.product?.name}</span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                       <Heart className="w-8 h-8 text-gray-200 mb-3"/>
                       <p className="text-gray-400 text-[22px]">Customer hasn&apos;t saved any items to their wishlist.</p>
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>

      {/* Modern Points Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowPointsModal(false)}></div>
          
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowPointsModal(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined notranslate text-[22px]">close</span>
            </button>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
               <Award className="w-6 h-6"/>
            </div>
            <h2 className="text-[36px] font-display font-bold text-gray-900 mb-2">Modify Ledger</h2>
            <p className="text-[22px] text-gray-500 mb-8">Update loyalty points manually. Current Balance: <strong className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{customer.points || 0} pts</strong></p>
            
            <div className="space-y-5">
               <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Ledger Action</label>
                  <select 
                     value={pointsAction} 
                     onChange={e => setPointsAction(e.target.value)}
                     className="w-full border-none bg-gray-50 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-500 font-bold text-gray-900 cursor-pointer appearance-none"
                  >
                     <option value="add">Deposit Points (+)</option>
                     <option value="deduct">Withdraw Points (-)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Absolute Amount</label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[26px]">tag</span>
                     <input 
                        type="number" 
                        placeholder="e.g. 500" 
                        value={pointsAmount}
                        onChange={e => setPointsAmount(e.target.value)}
                        className="w-full border-none bg-gray-50 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-purple-500 font-bold text-[36px] text-gray-900 placeholder:text-gray-300 placeholder:font-normal"
                        min="1"
                     />
                  </div>
               </div>
            </div>

            <div className="mt-10 flex gap-4">
               <button 
                 onClick={() => setShowPointsModal(false)}
                 className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
               >
                 Abort
               </button>
               <button 
                 onClick={handlePointsUpdate}
                 disabled={isUpdating}
                 className="flex-1 py-4 bg-[#161314] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
               >
                 {isUpdating ? "Executing..." : "Confirm Execution"}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
