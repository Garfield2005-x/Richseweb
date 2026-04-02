"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

type OrderItem = {
  id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  order_number?: string;
  total: number;
  status: string;
  tracking_number?: string;
  created_at: string;
  order_items: OrderItem[];
};

export default function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/account/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "PROCESSING":
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c3a2ab]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[36px] font-display font-medium text-gray-900 uppercase tracking-widest border-b border-gray-200 pb-4">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <h3 className="text-[26px] font-medium text-gray-900">No orders yet</h3>
          <p className="mt-1 text-[22px] text-gray-500">Looks like you haven&apos;t made your first purchase yet.</p>
          <div className="mt-6">
            <Link
              href="/ProductAll"
              className="inline-flex items-center px-4 py-2 border border-transparent text-[22px] font-medium rounded-md shadow-sm text-white bg-[#c3a2ab] hover:bg-[#b08c95] uppercase tracking-wider transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-[22px]">
                    <div>
                      <dt className="font-medium text-gray-900">Order</dt>
                      <dd className="mt-1 text-gray-500">#{order.order_number || order.id.slice(-8).toUpperCase()}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Date</dt>
                      <dd className="mt-1 text-gray-500">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Total</dt>
                      <dd className="mt-1 font-medium text-gray-900">฿{order.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-col items-end gap-2 mt-4 sm:mt-0">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[20px] font-bold uppercase tracking-wider ${getStatusColor(order.status || "PENDING")}`}
                    >
                      {order.status || "PENDING"}
                    </span>
                    {order.tracking_number && (
                      <div className="flex items-center gap-1.5 text-[20px] text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md font-mono">
                        <span className="material-symbols-outlined notranslate text-[14px]">local_shipping</span>
                        Tracking: <span className="font-bold text-gray-900">{order.tracking_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items list */}
              <ul className="divide-y divide-gray-100">
                {order.order_items.map((item) => (
                  <li key={item.id} className="p-4 sm:p-6 flex justify-between items-center gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-[22px] text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <p className="font-medium text-gray-900 whitespace-nowrap">
                        ฿{item.price.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </p>
                      {["SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status.toUpperCase()) && (
                        <Link
                          href={`/account/orders/review?orderId=${order.id}&productId=${item.product_id}&productName=${encodeURIComponent(item.product_name)}`}
                          className="text-[20px] font-bold text-[#c3a2ab] hover:text-[#b08c95] border border-[#c3a2ab] px-2 py-1 rounded transition-colors"
                        >
                          Write Review
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
