"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/context/CartContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ReCAPTCHA from "react-google-recaptcha"
import thaiAddress from "@/data/sub_district_with_district_and_province.json";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  MapPin, 
  ChevronRight, 
  Package, 
  Gift, 
  ArrowLeft,
  Loader2,
  Lock,
  Globe,
  CheckCircle2,
  Info
} from "lucide-react";

export default function Checkout() {
  const { data: session, status } = useSession()
  const [verified, setVerified] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [shipping, setShipping] = useState("Cash on Delivery (+$30 Fee)")
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    phone: "",
    province: "",
    district: "",
    subdistrict: "",
    postcode: "",
    country: "Thailand"
  })
  const [shippingCountry, setShippingCountry] = useState("Thailand")
  const [availablePoints, setAvailablePoints] = useState(0)
  const [pointsToUse, setPointsToUse] = useState("")
  const [shippingCost, setShippingCost] = useState(30)
  const [isFreeShippingPromo, setIsFreeShippingPromo] = useState(false)
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const tax = 0

  const provinces = [...new Set(thaiAddress.map(i => i.district.province.name_th))]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/Checkout")
    } else if (status === "authenticated") {
      fetch("/api/account/points")
        .then(res => res.json())
        .then(data => setAvailablePoints(data.points || 0))
        .catch(err => console.error("Error fetching points:", err))
    }
  }, [status, router])

  useEffect(() => {
    const baseShipping = shipping === "Cash on Delivery (+$30 Fee)" ? 30 : 0;
    
    if (shippingInfo.phone && shippingInfo.phone.length >= 9) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch("/api/checkout/evaluate-shipping", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: shippingInfo.phone })
          });
          if (res.ok) {
            const data = await res.json();
            setShippingCost(data.shippingCost);
            setIsFreeShippingPromo(data.isFreeShippingApplied || false);
          }
        } catch (e) {
          setShippingCost(baseShipping);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShippingCost(baseShipping);
      setIsFreeShippingPromo(false);
    }
  }, [shippingInfo.phone, shipping]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#c3a2ab] animate-spin" />
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Securing your session...</p>
        </div>
      </div>
    )
  }

  const districts = [
    ...new Set(
      thaiAddress
        .filter(i => i.district.province.name_th === shippingInfo.province)
        .map(i => i.district.name_th)
    )
  ]
  const subdistricts = thaiAddress.filter(
    i =>
      i.district.province.name_th === shippingInfo.province &&
      i.district.name_th === shippingInfo.district
  )
  
  const handleCaptcha = (token) => {
    if(token) setVerified(true);
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalBeforeDiscount = subtotal + shippingCost
  const parsedPoints = Math.min(Number(pointsToUse) || 0, availablePoints, totalBeforeDiscount - discountAmount);
  const pointsDiscountAmount = parsedPoints; 
  const finalTotal = Math.max(totalBeforeDiscount - discountAmount - pointsDiscountAmount, 0)

  const checkDiscount = async () => {
    if (!discountCode || !shippingInfo.phone) {
      toast.error("Please provide phone and valid code");
      return;
    }
    try {
      const res = await fetch("/api/checkout/validate-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, phone: shippingInfo.phone, totalBeforeDiscount })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Invalid code");
        return;
      }
      setDiscountAmount(data.discountAmount);
      alert("Promo code applied! ✨");
    } catch (error) {
      console.error(error);
      alert("Error validating code");
    }
  }

  const handleCheckout = async () => {
    try {
      if (cart.length === 0) {
        alert("Your cart is empty");
        return;
      }
      if (
        !shippingInfo.fullName ||
        !shippingInfo.address ||
        !shippingInfo.province ||
        !shippingInfo.district ||
        (shippingCountry === "Thailand" && !shippingInfo.subdistrict) ||
        !shippingInfo.postcode ||
        !shippingInfo.phone
      ) {
        alert("Please complete the shipping information");
        return;
      }
      
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          shippingInfo,
          shippingMethod: shipping,
          discountCode: discountCode || null,
          pointsToUse: parsedPoints,
          userId: session?.user?.id || null,
          isInternational: shippingCountry === "International"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      clearCart();
      router.push("/Success?orderId=" + data.orderId);

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-[#c3a2ab] selection:text-white">
      <Navbar />

      <main className="max-w-[1400px] mx-auto pt-24 md:pt-32 pb-20">
        <div className="grid lg:grid-cols-12 gap-0 lg:gap-16 items-start">
          
          {/* LEFT: Checkout Forms */}
          <div className="lg:col-span-12 xl:col-span-7 px-4 md:px-10 space-y-12">
            
            <header className="space-y-4">
               <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors group">
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
               </button>
               <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 tracking-tight">Checkout</h1>
               <p className="text-gray-500 font-medium">Securing your premium collection at Richse Official.</p>
            </header>

            {/* Step 1: Destination Selection */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">1</div>
                 <h2 className="text-xl font-display font-bold tracking-tight">Shipping Destination</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setShippingCountry("Thailand")}
                   className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                     shippingCountry === "Thailand" 
                     ? "border-black bg-black text-white shadow-xl shadow-black/10 scale-[1.02]" 
                     : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                   }`}
                 >
                    <MapPin size={24} />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Thailand</span>
                 </button>
                 <button 
                   onClick={() => setShippingCountry("International")}
                   className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                     shippingCountry === "International" 
                     ? "border-black bg-black text-white shadow-xl shadow-black/10 scale-[1.02]" 
                     : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                   }`}
                 >
                    <Globe size={24} />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">International</span>
                 </button>
              </div>
            </section>

            {/* Step 2: Customer & Shipping Details */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">2</div>
                 <h2 className="text-xl font-display font-bold tracking-tight">Shipping Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="md:col-span-2 relative group">
                    <input
                      type="text"
                      placeholder="Receiver's Full Name"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#c3a2ab]/10 focus:bg-white transition-all text-sm font-medium placeholder:text-gray-300"
                    />
                 </div>

                 <div className="md:col-span-2 relative group">
                    <input
                      type="text"
                      placeholder="Street Address, Building, Floor..."
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#c3a2ab]/10 focus:bg-white transition-all text-sm font-medium placeholder:text-gray-300"
                    />
                 </div>

                 {shippingCountry === "Thailand" ? (
                   <>
                    <select
                      value={shippingInfo.province}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, province: e.target.value, district: "", subdistrict: "", postcode: "" })}
                      className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#c3a2ab]/10 focus:bg-white transition-all text-sm font-medium appearance-none"
                    >
                      <option value="">Province</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <select
                      value={shippingInfo.district}
                      disabled={!shippingInfo.province}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, district: e.target.value, subdistrict: "", postcode: "" })}
                      className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#c3a2ab]/10 focus:bg-white transition-all text-sm font-medium appearance-none disabled:opacity-30"
                    >
                      <option value="">District</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <select
                      value={shippingInfo.subdistrict}
                      disabled={!shippingInfo.district}
                      onChange={(e) => {
                        const selected = subdistricts.find(s => s.name_th === e.target.value);
                        setShippingInfo({ ...shippingInfo, subdistrict: e.target.value, postcode: selected.zip_code });
                      }}
                      className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#c3a2ab]/10 focus:bg-white transition-all text-sm font-medium appearance-none disabled:opacity-30"
                    >
                      <option value="">Subdistrict</option>
                      {subdistricts.map(s => <option key={s.id} value={s.name_th}>{s.name_th}</option>)}
                    </select>

                    <input
                      type="text"
                      readOnly
                      placeholder="Postal Code"
                      value={shippingInfo.postcode}
                      className="w-full px-6 py-5 bg-gray-100/50 border border-transparent rounded-[1.5rem] text-sm font-medium text-gray-500"
                    />
                   </>
                 ) : (
                   <>
                    <input
                      type="text"
                      placeholder="Province / State"
                      value={shippingInfo.province}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, province: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#c3a2ab]/10 focus:bg-white transition-all text-sm font-medium"
                    />
                    <input
                      type="text"
                      placeholder="City / Zip Code"
                      value={shippingInfo.district}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, district: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#c3a2ab]/10 focus:bg-white transition-all text-sm font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#c3a2ab]/10 focus:bg-white transition-all text-sm font-medium"
                    />
                   </>
                 )}

                 <div className="md:col-span-2">
                    <input
                      type="tel"
                      placeholder="Mobile Number (Wait for delivery confirmation)"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-[#c3a2ab]/10 focus:bg-white transition-all text-sm font-medium placeholder:text-gray-300"
                    />
                 </div>
              </div>
            </section>

            {/* Step 3: Shipping Method */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">3</div>
                 <h2 className="text-xl font-display font-bold tracking-tight">Shipping Method</h2>
              </div>
              
              <div className="space-y-4">
                 {[
                   { id: "Cash on Delivery (+$30 Fee)", label: "Cash on Delivery", desc: "Pay at your doorstep. Special fee applied.", price: "฿30", icon: <Truck size={18} /> }
                 ].map(method => (
                   <label 
                     key={method.id}
                     className={`flex items-center justify-between p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${
                       shipping === method.id 
                       ? "border-black bg-gray-50 shadow-sm" 
                       : "border-gray-50 bg-white hover:border-gray-100"
                     }`}
                   >
                     <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${shipping === method.id ? "bg-black text-white" : "bg-gray-50 text-gray-400"}`}>
                           {method.icon}
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                checked={shipping === method.id}
                                onChange={() => setShipping(method.id)}
                                className="w-4 h-4 accent-black"
                              />
                              <span className="font-bold text-gray-900">{method.label}</span>
                           </div>
                           <p className="text-xs text-gray-400 mt-1">{method.desc}</p>
                        </div>
                     </div>
                     <span className="text-sm font-bold text-gray-900">
                        {isFreeShippingPromo ? <span className="text-green-500 uppercase text-xs tracking-widest">Free</span> : method.price}
                     </span>
                   </label>
                 ))}
              </div>
            </section>

            {/* Step 4: Security Verification */}
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">4</div>
                 <h2 className="text-xl font-display font-bold tracking-tight">One last thing...</h2>
              </div>
              
              <div className="p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-50 space-y-6">
                  <div className="flex items-start gap-4">
                     <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-500">
                        <ShieldCheck size={24} />
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-900">Security Verification</h4>
                        <p className="text-sm text-gray-400">Please confirm you are human to finalize your secure transaction.</p>
                     </div>
                  </div>
                  
                  <div className="flex justify-center">
                    {!verified ? (
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                        onChange={handleCaptcha}
                        className="scale-90 md:scale-100"
                      />
                    ) : (
                      <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold text-sm">
                         <CheckCircle2 size={18} /> Human Verified
                      </div>
                    )}
                  </div>
              </div>
            </section>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-12 xl:col-span-5 px-4 md:px-10 lg:pl-0">
             <div className="sticky top-32 space-y-8">
                <div className="bg-gray-50/50 rounded-[3rem] p-8 md:p-10 border border-gray-100 backdrop-blur-sm relative overflow-hidden">
                   
                   {/* Abstract background detail */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-[#c3a2ab]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                   <h3 className="text-2xl font-display font-bold text-gray-900 tracking-tight mb-8">Order Summary</h3>
                   
                   {/* Products List */}
                   <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4 scrollbar-hide mb-10">
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-4 group">
                           <div className="w-16 h-20 bg-white rounded-2xl border border-gray-100 shrink-0 shadow-sm overflow-hidden flex items-center justify-center relative">
                              {item.image ? (
                                <Image src={item.image} alt={item.name} fill className="object-cover rounded-xl" />
                              ) : (
                                <Package className="text-gray-200" size={24} />
                              )}
                           </div>
                           <div className="flex-1 space-y-1">
                               <p className="text-sm font-bold text-gray-900 leading-snug">
                                 {item.name} {item.variantName ? <span className="text-xs text-gray-500 font-normal">({item.variantName})</span> : ""}
                               </p>
                              <p className="text-xs text-gray-400 font-medium">Quantity: {item.quantity}</p>
                           </div>
                           <p className="text-sm font-bold text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                   </div>

                   {/* Points & Discounts */}
                   <div className="space-y-4 pt-10 border-t border-gray-100">
                      <div className="flex flex-col gap-3">
                         <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#c3a2ab]">Rewards available</label>
                            <span className="text-[10px] font-black text-gray-900">{availablePoints} Points</span>
                         </div>
                         <div className="flex gap-2">
                            <input 
                              type="number"
                              placeholder="Apply points..."
                              value={pointsToUse}
                              onChange={(e) => setPointsToUse(e.target.value)}
                              className="flex-1 bg-white border border-gray-100 px-4 py-3 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-[#c3a2ab]/5"
                            />
                            <button 
                              onClick={() => setPointsToUse(Math.floor(Math.min(availablePoints, totalBeforeDiscount - discountAmount)).toString())}
                              className="px-4 py-3 bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm"
                            >Max</button>
                         </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                         <input 
                           type="text"
                           placeholder="Discount code"
                           value={discountCode}
                           onChange={(e) => setDiscountCode(e.target.value)}
                           className="flex-1 bg-white border border-gray-100 px-4 py-3 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-[#c3a2ab]/5"
                         />
                         <button 
                          onClick={checkDiscount}
                          className="px-6 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-lg shadow-black/10"
                         >Apply</button>
                      </div>
                   </div>

                   {/* Pricing Totals */}
                   <div className="mt-10 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-400 font-medium">Subtotal</span>
                         <span className="text-gray-900 font-bold">฿{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-400 font-medium">Shipping Fee
                            {isFreeShippingPromo && <span className="ml-2 bg-green-50 text-green-600 border border-green-100 px-1.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">1st Order Free</span>}
                         </span>
                         <span className={isFreeShippingPromo ? "text-green-500 font-bold uppercase tracking-widest textxs" : "text-gray-900 font-bold"}>
                            {shippingCost === 0 ? "Free" : `฿${shippingCost}`}
                         </span>
                      </div>
                      {tax > 0 && (
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-gray-400 font-medium">VAT (Included)</span>
                           <span className="text-gray-900 font-bold">฿{tax.toLocaleString()}</span>
                        </div>
                      )}
                      {(discountAmount > 0 || pointsDiscountAmount > 0) && (
                        <div className="flex justify-between items-center text-sm text-[#c3a2ab] font-bold">
                           <span className="flex items-center gap-2"><Gift size={16} /> Total Savings</span>
                           <span>- ฿{(discountAmount + pointsDiscountAmount).toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="pt-6 border-t border-gray-900/5 mt-6">
                         <div className="flex justify-between items-end">
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Total Payable</p>
                               <p className="text-4xl font-display font-bold text-gray-900">฿{finalTotal.toLocaleString()}</p>
                            </div>
                            <Lock size={20} className="text-gray-200 mb-2" />
                         </div>
                      </div>
                   </div>

                   <button
                     disabled={loading || !verified || cart.length === 0}
                     onClick={handleCheckout}
                     className="w-full mt-10 py-6 bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-black/20 disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center gap-3 group"
                   >
                     {loading ? (
                       <Loader2 className="animate-spin" size={20} />
                     ) : (
                       <>Complete Purchase <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                     )}
                   </button>

                   <div className="mt-8 flex items-center justify-center gap-4 py-4 md:px-6 bg-white/50 rounded-2xl border border-gray-100/50">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                         <ShieldCheck size={14} className="text-emerald-500" /> Secure Checkout
                      </div>
                      <div className="w-px h-3 bg-gray-200" />
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                         Official Richse Quality
                      </div>
                   </div>

                </div>

                {/* Secondary Trust Badges */}
                <div className="grid grid-cols-2 gap-4 px-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-50 flex flex-col items-center text-center gap-2">
                       <Truck className="text-[#c3a2ab]" size={20} />
                       <p className="text-[10px] font-black uppercase tracking-tighter">Fast Delivery</p>
                       <p className="text-[10px] text-gray-400 italic">Within 2-3 business days</p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-50 flex flex-col items-center text-center gap-2">
                       <Info className="text-gray-300" size={20} />
                       <p className="text-[10px] font-black uppercase tracking-tighter">Support 24/7</p>
                       <p className="text-[10px] text-gray-400 italic">hello@richse.com</p>
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
