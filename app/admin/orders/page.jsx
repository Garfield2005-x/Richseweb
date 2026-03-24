"use client";

import { useState, useEffect } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating order");
    }
  };

  if (loading && orders.length === 0) {
    return <div className="p-8">Loading orders...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Orders Management</h1>
          <p className="text-gray-500">Track and update the status of customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="py-4 px-6 font-medium">Order Details</th>
                <th className="py-4 px-6 font-medium">Customer Information</th>
                <th className="py-4 px-6 font-medium">Items</th>
                <th className="py-4 px-6 font-medium">Total</th>
                <th className="py-4 px-6 font-medium">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors align-top">
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">{order.shipping_method}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900">{order.full_name}</p>
                      <p className="text-sm text-gray-500 block max-w-[200px] truncate">{order.phone}</p>
                      <p className="text-sm text-gray-400 mt-1 max-w-[250px] leading-snug">
                        {order.address}, {order.subdistrict}, {order.district}, {order.province} {order.postal_code}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2 max-w-[250px]">
                        {order.order_items.map(item => (
                          <div key={item.id} className="text-sm">
                            <span className="font-medium">{item.quantity}x</span> {item.product_name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold">฿{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2 w-max">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            if (newStatus === "SHIPPED") {
                              const tracking = prompt("Please enter the tracking number (optional):", order.tracking_number || "");
                              if (tracking !== null) {
                                handleStatusChange(order.id, newStatus, tracking);
                              }
                            } else {
                              handleStatusChange(order.id, newStatus);
                            }
                          }}
                          className={`border rounded-lg px-4 py-2 text-sm font-semibold tracking-wider outline-none
                            ${order.status === "COMPLETED" ? "border-green-200 text-green-700 bg-green-50" :
                              order.status === "SHIPPED" ? "border-blue-200 text-blue-700 bg-blue-50" :
                              order.status === "PENDING" ? "border-orange-200 text-orange-700 bg-orange-50" :
                              order.status === "CANCELLED" ? "border-red-200 text-red-700 bg-red-50" :
                              "bg-white"
                            }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        {order.tracking_number && (
                          <div className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono border border-gray-200 mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                            {order.tracking_number}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
