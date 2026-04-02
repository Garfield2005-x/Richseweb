"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Eye, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  CreditCard,
  ClipboardList,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to load orders", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus, trackingNumber = "") => {
    try {
      const payload = { status: newStatus };
      if (trackingNumber) {
        payload.tracking_number = trackingNumber;
      }

      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus, tracking_number: trackingNumber || o.tracking_number } : o));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus, tracking_number: trackingNumber || selectedOrder.tracking_number });
        }
        toast.success(`Order ${newStatus.toLowerCase()} successfully`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating order");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setOrders(orders.filter(o => o.id !== id));
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(null);
        }
        toast.success("Order deleted successfully");
      } else {
        toast.error("Failed to delete order");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting order");
    }
  };


  // --- Statistics ---
  const stats = useMemo(() => {
    return {
      totalRevenue: orders.filter(o => o.status === "COMPLETED").reduce((acc, o) => acc + o.total, 0),
      pendingCount: orders.filter(o => o.status === "PENDING").length,
      shippedCount: orders.filter(o => o.status === "SHIPPED").length,
      totalCount: orders.length
    };
  }, [orders]);

  // --- Filtering ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      const matchesSearch = 
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.includes(searchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "SHIPPED": return "bg-blue-50 text-blue-700 border-blue-100";
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-100";
      case "CANCELLED": return "bg-rose-50 text-rose-700 border-rose-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle className="w-3.5 h-3.5" />;
      case "SHIPPED": return <Truck className="w-3.5 h-3.5" />;
      case "PENDING": return <AlertCircle className="w-3.5 h-3.5" />;
      case "CANCELLED": return <XCircle className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#c3a2ab] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading orders data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[44px] font-display font-bold text-gray-900 mb-1">Orders Management</h1>
          <p className="text-gray-500 text-[22px]">Monitor sales, track shipments and manage customer fulfillment.</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={fetchOrders} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
             <span className="material-symbols-outlined notranslate text-[22px]">refresh</span>
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[22px] font-medium text-gray-500">Total Revenue</span>
          </div>
          <p className="text-[36px] font-bold text-gray-900">฿{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className="mt-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">From completed orders</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-[22px] font-medium text-gray-500">Pending</span>
          </div>
          <p className="text-[36px] font-bold text-gray-900">{stats.pendingCount}</p>
          <div className="mt-1 text-[10px] text-amber-600 font-bold uppercase tracking-wider">Wait for fulfillment</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-[22px] font-medium text-gray-500">Shipped</span>
          </div>
          <p className="text-[36px] font-bold text-gray-900">{stats.shippedCount}</p>
          <div className="mt-1 text-[10px] text-blue-600 font-bold uppercase tracking-wider">In transit</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[22px] font-medium text-gray-500">All Orders</span>
          </div>
          <p className="text-[36px] font-bold text-gray-900">{stats.totalCount}</p>
          <div className="mt-1 text-[10px] text-purple-600 font-bold uppercase tracking-wider">Lifetime total</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by order #, customer name or phone..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-[22px] focus:ring-2 focus:ring-[#c3a2ab] outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center p-1 bg-gray-50 rounded-xl">
          {["ALL", "PENDING", "SHIPPED", "COMPLETED", "CANCELLED"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                statusFilter === status 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Order ID</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Items</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-6">
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                          {order.order_number}
                          {new Date() - new Date(order.created_at) < 86400000 && (
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" title="New Order" />
                          )}
                        </p>
                        <p className="text-[20px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 underline-offset-4 decoration-[#c3a2ab]/30 group-hover:underline">{order.full_name}</p>
                        <p className="text-[20px] text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {order.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="text-[22px] font-medium text-gray-700">{order.order_items.length} สินค้า</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right lg:text-left">
                      <p className="font-bold text-gray-900 text-[26px]">฿{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider border ${getStatusStyle(order.status)} uppercase`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-gray-200 bg-gray-100 text-gray-600 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (newStatus === "SHIPPED") {
                              const tracking = prompt("Enter tracking number (optional):", order.tracking_number || "");
                              if (tracking !== null) handleStatusChange(order.id, newStatus, tracking);
                            } else {
                              handleStatusChange(order.id, newStatus);
                            }
                          }}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold outline-none bg-white cursor-pointer hover:border-[#c3a2ab]"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 hover:bg-rose-100 bg-gray-100 text-rose-500 rounded-lg transition-all"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Search className="w-10 h-10 opacity-20" />
                      <p className="text-[22px] font-medium">No matches found for your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl scale-in-center">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-[30px] font-bold text-gray-900 flex items-center gap-2">
                  Order Details
                  <span className="text-[22px] font-normal text-gray-400">#{selectedOrder.order_number}</span>
                </h2>
                <p className="text-[20px] text-gray-500 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-200 bg-gray-100 text-gray-500 rounded-xl transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Status Section */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[20px] font-bold border ${getStatusStyle(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
                {selectedOrder.tracking_number && (
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tracking Number</span>
                    <p className="font-mono font-bold text-gray-900">{selectedOrder.tracking_number}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-[22px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Info
                  </h3>
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Full Name</p>
                      <p className="font-semibold">{selectedOrder.full_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Phone Number</p>
                      <p className="font-semibold">{selectedOrder.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-4">
                  <h3 className="text-[22px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Shipping Address
                  </h3>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                     <p className="text-[22px] text-gray-700 leading-relaxed font-medium">
                       {selectedOrder.address}<br />
                       {selectedOrder.subdistrict}, {selectedOrder.district}<br />
                       {selectedOrder.province} {selectedOrder.postal_code}
                     </p>
                     <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase italic tracking-widest">{selectedOrder.shipping_method}</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="text-[22px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Order Items ({selectedOrder.order_items.length})
                </h3>
                <div className="space-y-2">
                  {selectedOrder.order_items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-[#c3a2ab] shadow-sm border border-gray-50">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.product_name}</p>
                          <p className="text-[20px] text-gray-500">฿{item.price.toLocaleString()} / ชิ้น</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900 font-display">฿{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
                 <div className="flex justify-between text-[22px] opacity-60">
                   <span>Subtotal</span>
                   <span>฿{selectedOrder.subtotal.toLocaleString()}</span>
                 </div>
                 {selectedOrder.points_discount > 0 && (
                   <div className="flex justify-between text-[22px] text-emerald-400 font-medium">
                     <span>Points Discount</span>
                     <span>- ฿{selectedOrder.points_discount.toLocaleString()}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-[22px] opacity-60">
                   <span>Shipping & Tax</span>
                   <span>฿{selectedOrder.tax.toLocaleString()}</span>
                 </div>
                 <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="font-bold uppercase tracking-widest text-[20px]">Total Amount</span>
                    <span className="text-[36px] font-bold font-display tracking-tight text-[#c3a2ab]">฿{selectedOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
              </div>
            </div>

            {/* Modal Footer (Quick Actions) */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between gap-4">
               <div className="flex items-center gap-2">
                 <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-[20px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
                 >
                   <span className="material-symbols-outlined notranslate text-[22px]">print</span> Print Invoice
                 </button>
               </div>
               <div className="flex items-center gap-2">
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-[20px] font-bold uppercase tracking-widest outline-none"
                  >
                    <option value="PENDING">SET PENDING</option>
                    <option value="SHIPPED">SET SHIPPED</option>
                    <option value="COMPLETED">SET COMPLETED</option>
                    <option value="CANCELLED">SET CANCELLED</option>
                  </select>
                  <button 
                    onClick={() => {
                        const tracking = prompt("Enter tracking number:", selectedOrder.tracking_number || "");
                        if (tracking !== null) handleStatusChange(selectedOrder.id, selectedOrder.status, tracking);
                    }}
                    className="px-6 py-2 bg-[#c3a2ab] text-white rounded-xl text-[20px] font-bold uppercase tracking-widest shadow-lg shadow-[#c3a2ab]/20 hover:scale-105 transition-all"
                  >
                    Update Tracking
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
