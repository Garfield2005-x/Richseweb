"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, User, MapPin, Package, Heart, Laptop, Calendar } from "lucide-react";
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading customer profile...</div>;
  if (!customer) return <div className="p-8 text-center text-red-500">Customer not found.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Customer Profile</h1>
            <p className="text-gray-500 text-sm">Detailed view for {customer.name || customer.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${customer.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                {customer.role}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Profile & Address */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#c3a2ab]/20 text-[#c3a2ab] border-2 border-gray-100 shadow-sm rounded-full overflow-hidden flex items-center justify-center mb-4 relative">
              {customer.image ? (
                <Image src={customer.image} alt={customer.name} fill className="object-cover" />
              ) : (
                <User className="w-12 h-12" />
              )}
            </div>
            <h2 className="text-xl font-bold">{customer.name || "N/A"}</h2>
            <p className="text-gray-500 text-sm mb-4">{customer.email}</p>
            <div className="w-full bg-gray-50 rounded-xl p-4 flex justify-between items-center text-left">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Richse Points</p>
                <p className="text-lg font-bold text-[#c3a2ab]">{customer.points?.toLocaleString() || 0} pts</p>
              </div>
            </div>
          </div>

          {/* Contact & Shipping */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <MapPin className="w-5 h-5 text-gray-400"/>
                <h3 className="font-bold text-gray-900">Contact & Shipping</h3>
             </div>
             <div className="space-y-4">
                <div>
                   <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                   <p className="text-sm font-medium">{customer.phone || "Not provided"}</p>
                </div>
                <div>
                   <p className="text-xs text-gray-500 mb-1">Address</p>
                   {customer.address ? (
                      <p className="text-sm text-gray-700 leading-relaxed">
                          {customer.address}<br/>
                          {customer.subdistrict} {customer.district}<br/>
                          {customer.province} {customer.postal_code}
                      </p>
                   ) : (
                      <p className="text-sm italic text-gray-400">No address on file</p>
                   )}
                 </div>
              </div>
           </div>

           {/* Quick Actions (CRM) */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
              <h3 className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">Admin CRM Actions</h3>
              
              <button 
                onClick={() => setShowPointsModal(true)}
                disabled={isUpdating}
                className="w-full bg-[#161314] hover:bg-black text-white font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                 <span className="material-symbols-outlined text-sm">stars</span>
                 Adjust Loyalty Points
              </button>

              <button 
                onClick={handleRoleToggle}
                disabled={isUpdating}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                 <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                 {customer.role === "ADMIN" ? "Demote to USER" : "Promote to ADMIN"}
              </button>
           </div>
           
           {/* Security & Devices */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                 <Laptop className="w-5 h-5 text-gray-400"/>
                 <h3 className="font-bold text-gray-900">Security & Devices</h3>
              </div>
              <div className="space-y-4">
                 <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Registered On</p>
                    <p className="text-sm font-medium">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "Unknown"}</p>
                 </div>
                 
                 <div>
                    <p className="text-xs text-gray-500 mb-1">Latest Device & IP</p>
                    {customer.loginDevices && customer.loginDevices.length > 0 ? (
                       <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <p className="font-medium text-gray-900">{customer.loginDevices[0].device} ({customer.loginDevices[0].os})</p>
                          <p className="text-gray-500 text-xs mt-1">{customer.loginDevices[0].browser}</p>
                          {customer.loginDevices[0].ip && (
                              <p className="text-gray-500 text-xs mt-1 border-t border-gray-200 pt-1">
                                  {customer.loginDevices[0].ip}
                              </p>
                          )}
                       </div>
                    ) : (
                       <p className="text-sm italic text-gray-400">No device history tracked</p>
                    )}
                 </div>
              </div>
           </div>
           
        </div>

        {/* Right Col: Orders & Wishlist */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order History Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <Package className="w-5 h-5 text-gray-400"/>
                <h3 className="font-bold text-gray-900">Order History ({customer.orders?.length || 0})</h3>
             </div>
             
             <div className="overflow-x-auto">
                {customer.orders?.length > 0 ? (
                    <table className="w-full text-left">
                        <thead className="bg-white text-gray-500 text-xs border-b border-gray-100">
                            <tr>
                                <th className="py-3 px-6 font-medium">Order#</th>
                                <th className="py-3 px-6 font-medium">Date</th>
                                <th className="py-3 px-6 font-medium">Items</th>
                                <th className="py-3 px-6 font-medium">Total</th>
                                <th className="py-3 px-6 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {customer.orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-900">
                                        <Link href={`/admin/orders`} className="hover:text-blue-600 hover:underline">{order.order_number}</Link>
                                    </td>
                                    <td className="py-4 px-6 text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        {order.order_items?.length || 0} items
                                    </td>
                                    <td className="py-4 px-6 font-medium">
                                        ฿{order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider
                                            ${order.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                                            order.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                                            order.status === "PENDING" ? "bg-orange-100 text-orange-800" :
                                            "bg-gray-100 text-gray-800"}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-gray-500">This customer has not placed any orders yet.</div>
                )}
             </div>
          </div>

          {/* Wishlist Box */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <Heart className="w-5 h-5 text-[#c3a2ab]"/>
                <h3 className="font-bold text-gray-900">Wishlist Items ({customer.wishlist?.length || 0})</h3>
             </div>
             
             <div className="p-6">
                {customer.wishlist?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {customer.wishlist.map((item) => (
                            <div key={item.id} className="border border-gray-100 rounded-xl p-3 flex flex-col items-center text-center gap-2 group hover:border-[#c3a2ab] transition-colors">
                                <div className="w-16 h-16 relative">
                                  <Image 
                                      src={item.product?.image || "/placeholder.jpg"} 
                                      alt={item.product?.name}
                                      fill
                                      className="object-cover rounded-lg group-hover:scale-105 transition-transform"
                                  />
                                </div>
                                <span className="text-xs font-medium text-gray-900 line-clamp-2">{item.product?.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-4">No wishlisted items.</div>
                )}
             </div>
          </div>

        </div>
      </div>

      {/* Points Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowPointsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
            >
              <span className="material-symbols-outlined notranslate">close</span>
            </button>
            <h2 className="text-xl font-bold mb-4">Adjust Loyalty Points</h2>
            <p className="text-sm text-gray-500 mb-6">Current Balance: <strong className="text-gray-900">{customer.points || 0} pts</strong></p>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <select 
                     value={pointsAction} 
                     onChange={e => setPointsAction(e.target.value)}
                     className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-black font-medium"
                  >
                     <option value="add">Add Points (+)</option>
                     <option value="deduct">Deduct Points (-)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input 
                     type="number" 
                     placeholder="e.g. 500" 
                     value={pointsAmount}
                     onChange={e => setPointsAmount(e.target.value)}
                     className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:border-black font-bold text-lg"
                     min="1"
                  />
               </div>
            </div>

            <div className="mt-8 flex gap-3">
               <button 
                 onClick={() => setShowPointsModal(false)}
                 className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
               >
                 Cancel
               </button>
               <button 
                 onClick={handlePointsUpdate}
                 disabled={isUpdating}
                 className="flex-1 px-4 py-2 bg-[#161314] text-white rounded-lg font-medium hover:bg-black disabled:opacity-50"
               >
                 {isUpdating ? "Saving..." : "Confirm"}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
