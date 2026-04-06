"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

import LoadingRichse from "@/app/components/LoadingRichse";
import toast from "react-hot-toast";

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
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/account/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "PROCESSING":
      case "SHIPPED":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  if (loading) {
    return <LoadingRichse message="Syncing your ritual history..." />;
  }

  return (
    <div className="space-y-12">
      <div className="border-b border-white/5 pb-8">
        <h1 className="text-[32px] md:text-[44px] font-luxury font-bold text-white uppercase tracking-tight">
          My <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-[#F07098] to-[#F8E1EB]">Orders</span>
        </h1>
        <p className="mt-4 text-white/30 font-light tracking-[0.2em] text-[12px] uppercase">Review your collection ritual</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 space-y-8">
          <div className="space-y-2">
            <h3 className="text-[24px] font-display font-bold text-white">Your collection is empty</h3>
            <p className="text-white/30 font-light tracking-wide text-[16px]">Manifest your first ritual today.</p>
          </div>
          <Link
            href="/ProductAll"
            className="inline-flex items-center px-12 py-5 border border-transparent text-[12px] font-bold rounded-2xl shadow-xl text-white bg-[#F07098] hover:bg-[#F394B8] hover:shadow-[0_10px_40px_rgba(240,112,152,0.3)] transition-all duration-500 uppercase tracking-[0.2em]"
          >
            Start Discovery
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] overflow-hidden group hover:border-[#F07098]/30 transition-all duration-500">
              {/* Order Header */}
              <div className="bg-white/5 border-b border-white/5 p-6 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F07098]/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/2 pointer-events-none" />
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 relative z-10">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                    <div className="space-y-2">
                      <dt className="text-[10px] font-bold text-[#F07098] uppercase tracking-[0.3em]">Order Identifier</dt>
                      <dd className="text-white font-bold tracking-tight">#{order.order_number || order.id.slice(-8).toUpperCase()}</dd>
                    </div>
                    <div className="space-y-2">
                      <dt className="text-[10px] font-bold text-[#F07098] uppercase tracking-[0.3em]">Ritual Date</dt>
                      <dd className="text-white/70 font-medium">
                        {format(new Date(order.created_at), "MMMM d, yyyy")}
                      </dd>
                    </div>
                    <div className="space-y-2">
                      <dt className="text-[10px] font-bold text-[#F07098] uppercase tracking-[0.3em]">Total Investment</dt>
                      <dd className="text-white font-black text-xl tracking-tighter">฿{order.total.toLocaleString("th-TH")}</dd>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row xl:flex-col items-start xl:items-end gap-3 mt-4 sm:mt-0">
                    <span
                      className={`inline-flex items-center px-4 py-2 border rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${getStatusColor(order.status || "PENDING")}`}
                    >
                      {order.status || "PENDING"}
                    </span>
                    {order.tracking_number && (
                      <div className="flex items-center gap-3 text-[11px] text-white/50 bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl font-mono tracking-widest group-hover:border-[#F07098]/30 transition-colors">
                        <span className="material-symbols-outlined notranslate text-[14px] text-[#F07098]">local_shipping</span>
                        TRACK: <span className="font-bold text-white">{order.tracking_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items list */}
              <ul className="divide-y divide-white/5 px-6 sm:px-10">
                {order.order_items.map((item) => (
                  <li key={item.id} className="py-8 flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-white text-lg tracking-tight group-hover:text-[#F07098] transition-colors">{item.product_name}</p>
                      <p className="text-[12px] text-white/30 font-light uppercase tracking-widest">Quantity: <span className="text-white font-bold">{item.quantity}</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-4 text-right">
                      <p className="font-black text-white text-xl tracking-tighter whitespace-nowrap">
                        ฿{item.price.toLocaleString("th-TH")}
                      </p>
                      {["SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status.toUpperCase()) && (
                        <Link
                          href={`/account/orders/review?orderId=${order.id}&productId=${item.product_id}&productName=${encodeURIComponent(item.product_name)}`}
                          className="text-[10px] font-bold text-[#F07098] hover:text-[#F8E1EB] border border-[#F07098]/30 px-5 py-2 rounded-xl transition-all hover:bg-[#F07098]/10 tracking-[0.2em] uppercase"
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
