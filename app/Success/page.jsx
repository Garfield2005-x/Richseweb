"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { CheckCircle2, Package, Truck, Lock, ShieldCheck, Copy, ArrowLeft } from "lucide-react"

export default function Success() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const router = useRouter()
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!orderId) {
      router.push("/")
      return
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (!res.ok) throw new Error("Order not found")
        const data = await res.json()
        setOrder(data)
      } catch (error) {
        console.error("Error fetching order:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, router])

  const copyOrderId = () => {
    if (order?.order_number || order?.id) {
      navigator.clipboard.writeText(order.order_number || order.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#c3a2ab]/20 border-t-[#c3a2ab] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Retrieving order details...</p>
        </div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-[#c3a2ab] selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-[1400px] mx-auto w-full pt-28 md:pt-36 pb-20 px-4 md:px-10">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-50 border-8 border-emerald-50 text-emerald-500 mb-2">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 tracking-tight">Order Successful</h1>
          <p className="text-gray-500 font-medium text-lg">Thank you for your premium purchase at Richse Official.</p>
          
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 mt-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={copyOrderId}>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Order No.</span>
            <span className="text-xl font-bold text-gray-900 font-mono tracking-wider">{order.order_number || order.id.slice(0, 8)}</span>
            {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} className="text-gray-400" />}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start max-w-6xl mx-auto">
          
          {/* LEFT: Order Details */}
          <div className="lg:col-span-7 space-y-8">
            
            <section className="bg-gray-50/50 rounded-[3rem] p-8 md:p-10 border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#c3a2ab]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
               
               <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight mb-8">Items Ordered</h2>
               
               <div className="space-y-6">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                       <div className="w-20 h-24 bg-white rounded-2xl border border-gray-100 shrink-0 shadow-sm overflow-hidden flex items-center justify-center relative">
                          <Package className="text-gray-200" size={28} />
                       </div>
                       <div className="flex-1 space-y-1 flex flex-col justify-center">
                          <p className="text-base font-bold text-gray-900 leading-snug">{item.product_name}</p>
                          <p className="text-sm text-gray-400 font-medium">Qty: {item.quantity}</p>
                       </div>
                       <div className="flex flex-col justify-center items-end">
                          <p className="text-base font-bold text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-400">฿{item.price.toLocaleString()} each</p>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section className="bg-gray-50/50 rounded-[3rem] p-8 md:p-10 border border-gray-100">
               <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight mb-8">Shipping Information</h2>
               
               <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Delivery Address</h3>
                    <p className="text-sm font-bold text-gray-900 mb-1">{order.full_name}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {order.address}<br />
                      {order.subdistrict && order.district ? `${order.subdistrict}, ${order.district}` : ""}<br />
                      {order.province} {order.postal_code}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 font-mono">{order.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Shipping Method</h3>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                        <Truck size={20} className="text-gray-900" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{order.shipping_method}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Estimated 2-3 business days</p>
                      </div>
                    </div>
                  </div>
               </div>
            </section>

          </div>

          {/* RIGHT: Payment Summary */}
          <div className="lg:col-span-5">
             <div className="sticky top-32 space-y-8">
                <div className="bg-black text-white rounded-[3rem] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-black/20">
                   
                   {/* Abstract dark detail */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                   <h3 className="text-2xl font-display font-bold tracking-tight mb-8">Payment Details</h3>
                   
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-white/60 font-medium">Subtotal</span>
                         <span className="font-bold">฿{order.subtotal.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-white/60 font-medium">Shipping Fee</span>
                         <span className="font-bold">
                           {order.total - order.subtotal > 0 && order.points_discount === 0 ? `฿${(order.total - order.subtotal).toLocaleString()}` : "Free"}
                         </span>
                      </div>

                      {order.points_discount > 0 && (
                        <div className="flex justify-between items-center text-sm text-[#c3a2ab]">
                           <span className="font-medium">Points Discount</span>
                           <span className="font-bold">- ฿{order.points_discount.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="pt-6 border-t border-white/10 mt-6">
                         <div className="flex justify-between items-end">
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Total Paid</p>
                               <p className="text-4xl font-display font-bold">฿{order.total.toLocaleString()}</p>
                            </div>
                            <Lock size={20} className="text-white/20 mb-2" />
                         </div>
                      </div>
                   </div>

                </div>

                <Link
                  href="/ProductAll"
                  className="w-full py-6 bg-white border-2 border-gray-100 text-gray-900 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:border-black transition-all flex items-center justify-center gap-3 group"
                >
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Continue Shopping
                </Link>

                <div className="flex items-center justify-center gap-4 py-4 md:px-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                   <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <ShieldCheck size={14} className="text-emerald-500" /> Secure Payment
                   </div>
                </div>

             </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  )
}
