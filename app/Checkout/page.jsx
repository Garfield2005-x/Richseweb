"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
// import { supabase } from "@/lib/supabase" // Removed since we moved to backend API
import { useCart } from "@/context/CartContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ReCAPTCHA from "react-google-recaptcha"
import thaiAddress from "@/data/sub_district_with_district_and_province.json";

export default function Checkout() {
  const { data: session, status } = useSession()
  const [verified, setVerified] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [shipping, setShipping] = useState("Bank Transfer (Free Shipping)")
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
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const tax = 0

  const provinces = [...new Set(thaiAddress.map(i => i.district.province.name_th))]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/Checkout")
    } else if (status === "authenticated") {
      // Fetch available points
      fetch("/api/account/points")
        .then(res => res.json())
        .then(data => setAvailablePoints(data.points || 0))
        .catch(err => console.error("Error fetching points:", err))
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c3a2ab]"></div>
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
  if(token){
   setVerified(true)
  }
 }

 

const handlePurchase = async () => {
  await handleCheckout()
}



  // ===== คำนวณราคา =====
const subtotal = cart.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
)

const shippingCost =
  shipping === "Cash on Delivery (+$30 Fee)" ? 30 : 0

const totalBeforeDiscount = subtotal + shippingCost

const parsedPoints = Math.min(Number(pointsToUse) || 0, availablePoints, totalBeforeDiscount - discountAmount);
const pointsDiscountAmount = parsedPoints; // 1 Point = 1 Baht

const finalTotal = Math.max(
  totalBeforeDiscount - discountAmount - pointsDiscountAmount,
  0
)
const checkDiscount = async () => {
  if (!discountCode || !shippingInfo.phone) {
    alert("กรุณากรอกเบอร์โทรและโค้ด")
    return
  }

  try {
    const res = await fetch("/api/checkout/validate-discount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: discountCode,
        phone: shippingInfo.phone,
        totalBeforeDiscount
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
      return;
    }

    setDiscountAmount(data.discountAmount);
    alert("ใช้โค้ดสำเร็จ 🎉");
  } catch (error) {
    console.error(error);
    alert("เกิดข้อผิดพลาดในการตรวจสอบโค้ด");
  }
}
  // ===== กดสั่งซื้อ =====
  const handleCheckout = async () => {
    try {
      if (cart.length === 0) {
        alert("Your cart is empty")
        return
      }

     if (
  !shippingInfo.fullName ||
  !shippingInfo.address ||
  !shippingInfo.province ||
  !shippingInfo.district ||
  (shippingCountry === "Thailand" && !shippingInfo.subdistrict) || // Subdistrict optional for Int
  !shippingInfo.postcode ||
  !shippingInfo.phone ||
  (shippingCountry === "International" && !shippingInfo.country)
) {
  alert("Please fill in all required shipping information")
  return
}
     
      setLoading(true)

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

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed. Please try again.");
      }

      // 3️⃣ สำเร็จ
      clearCart()
      alert("Order completed successfully 🎉")
      router.push("/")

    } catch (err) {
  console.error("Checkout error:", err)
  alert(err.message)
} finally {
      setLoading(false)
    }
  }
 

  return (
    <div>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-32 pb-10 md:pt-40">
        <h1 className="text-4xl mb-10 font-serif">Checkout</h1>

        <div className="grid lg:grid-cols-12 gap-12">

          {/* LEFT */}
          <section className="lg:col-span-7">

            {/* Shipping */}
            <div className="mb-12">
              <div className="flex items-center gap-6 mb-6">
  <h2 className="text-2xl font-serif">Shipping Address</h2>

  <label className="flex items-center gap-2">
    <input
      type="radio"
      value="thailand"
      checked={country === "thailand"}
      onChange={(e) => setCountry(e.target.value)}
    />
    Thailand
  </label>

  <label className="flex items-center gap-2">
    <input
      type="radio"
      value="international"
      checked={country === "international"}
      onChange={(e) => setCountry(e.target.value)}
    />
    International
  </label>
</div>
 
 {country === "thailand" && (
  <div>
        <div className="space-y-4">
                <input
                  placeholder="Full Name"
                  value={shippingInfo.fullName}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                  }
                  className="border rounded-lg px-4 py-3 w-full"
                />

                <input
                  placeholder="Street Address"
                  value={shippingInfo.address}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, address: e.target.value })
                  }
                  className="border rounded-lg px-4 py-3 w-full"
                />

                <div className="grid grid-cols-2 gap-4">
                  <select
  value={shippingInfo.province}
  onChange={(e) =>
    setShippingInfo({
      ...shippingInfo,
      province: e.target.value,
      district: "",
      subdistrict: "",
      postcode: ""
    })
  }
  className="border rounded-lg px-4 py-3 w-full"
>
  <option value="">Province</option>

  {provinces.map((p) => (
    <option key={p} value={p}>
      {p}
    </option>
  ))}
</select>

<select
  value={shippingInfo.district}
  onChange={(e) =>
    setShippingInfo({
      ...shippingInfo,
      district: e.target.value,
      subdistrict: "",
      postcode: ""
    })
  }
  disabled={!shippingInfo.province}
  className="border rounded-lg px-4 py-3 w-full"
>
  <option value="">District</option>

  {districts.map((d) => (
    <option key={d} value={d}>
      {d}
    </option>
  ))}
</select>
<select
  value={shippingInfo.subdistrict}
  onChange={(e) => {
    const selected = subdistricts.find(
      s => s.name_th === e.target.value
    )

    setShippingInfo({
      ...shippingInfo,
      subdistrict: e.target.value,
      postcode: selected.zip_code
    })
  }}
  disabled={!shippingInfo.district}
  className="border rounded-lg px-4 py-3 w-full"
>
  <option value="" >Subdistrict</option>

  {subdistricts.map((s) => (
    <option key={s.id} value={s.name_th}>
      {s.name_th}
    </option>
  ))}
</select>
                 <input
  value={shippingInfo.postcode}
  readOnly
  className="border rounded-lg px-4 py-3 w-full bg-gray-100"
  placeholder="Postal Code"
/>
                
</div>
                <input
                  placeholder="Phone"
                  value={shippingInfo.phone}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, phone: e.target.value })
                  }
                  className="border rounded-lg px-4 py-3 w-full mb-12"
                />
                
              </div>
<div className="mb-12">
              <h2 className="text-2xl mb-6 font-serif">Shipping Method</h2>

              <div className="space-y-3">
                <label className="flex justify-between border p-4 rounded-lg cursor-pointer">
                  <span>
                    <input
                      type="radio"
                      checked={shipping === "Bank Transfer (Free Shipping)"}
                      onChange={() => setShipping("Bank Transfer (Free Shipping)")}
                    />{" "}
                    Bank Transfer (Free Shipping)
                  </span>
                  <span>฿0</span>
                </label>

                <label className="flex justify-between border p-4 rounded-lg cursor-pointer">
                  <span>
                    <input
                      type="radio"
                      checked={shipping === "Cash on Delivery (+$30 Fee)"}
                      onChange={() => setShipping("Cash on Delivery (+$30 Fee)")}
                    />{" "}
                    Cash on Delivery (+฿30 Fee)
                  </span>
                  <span>฿30</span>
                </label>
              </div>
            </div>
              </div>
              
      )}

      {country === "international" && (
        <div>
        <div className="space-y-4">
                <input
                  placeholder="Full Name"
                  value={shippingInfo.fullName}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                  }
                  className="border rounded-lg px-4 py-3 w-full"
                />

                <input
                  placeholder="Street Address"
                  value={shippingInfo.address}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, address: e.target.value })
                  }
                  className="border rounded-lg px-4 py-3 w-full"
                />

               <div className="grid grid-cols-2 gap-4">
  <input
    placeholder="Province / State"
    value={shippingInfo.province}
    onChange={(e) =>
      setShippingInfo({ ...shippingInfo, province: e.target.value })
    }
    className="border rounded-lg px-4 py-3 w-full"
  />

  <input
    placeholder="City"
    value={shippingInfo.district}
    onChange={(e) =>
      setShippingInfo({ ...shippingInfo, district: e.target.value })
    }
    className="border rounded-lg px-4 py-3 w-full"
  />

  <input
    placeholder="Address / Area"
    value={shippingInfo.subdistrict}
    onChange={(e) =>
      setShippingInfo({ ...shippingInfo, subdistrict: e.target.value })
    }
    className="border rounded-lg px-4 py-3 w-full"
  />

  <input
    placeholder="Postal Code"
    value={shippingInfo.postcode}
    onChange={(e) =>
      setShippingInfo({ ...shippingInfo, postcode: e.target.value })
    }
    className="border rounded-lg px-4 py-3 w-full"
  />
</div>
                <input
                  placeholder="Phone"
                  value={shippingInfo.phone}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, phone: e.target.value })
                  }
                  className="border rounded-lg px-4 py-3 w-full mb-12"
                />
                
              </div>
<div className="mb-12">
              <h2 className="text-2xl mb-6 font-serif">Shipping Method</h2>

              <div className="space-y-3">
                <label className="flex justify-between border p-4 rounded-lg cursor-pointer">
                  <span>
                    <input
                      type="radio"
                      checked={shipping === "Bank Transfer (Free Shipping)"}
                      onChange={() => setShipping("Bank Transfer (Free Shipping)")}
                    />{" "}
                    Bank Transfer (Free Shipping)
                  </span>
                  <span>฿0</span>
                </label>

                
              </div>
            </div>
              </div>
      )}
                
              {/* <div className="space-y-4">
                <input
                  placeholder="Full Name"
                  value={shippingInfo.fullName}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                  }
                  className="border rounded-lg px-4 py-3 w-full"
                />

                <input
                  placeholder="Street Address"
                  value={shippingInfo.address}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, address: e.target.value })
                  }
                  className="border rounded-lg px-4 py-3 w-full"
                />

                <div className="flex gap-4 mb-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setShippingCountry("Thailand");
                      setShippingInfo({ ...shippingInfo, country: "Thailand", province: "", district: "", subdistrict: "", postcode: "" });
                    }}
                    className={`flex-1 py-3 rounded-lg font-bold border transition-colors ${shippingCountry === "Thailand" ? "bg-[#c3a2ab] text-white border-[#c3a2ab]" : "bg-white text-gray-500 border-gray-200"}`}
                  >
                    Thailand
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShippingCountry("International");
                      setShippingInfo({ ...shippingInfo, country: "", province: "", district: "", subdistrict: "", postcode: "" });
                    }}
                    className={`flex-1 py-3 rounded-lg font-bold border transition-colors ${shippingCountry === "International" ? "bg-[#c3a2ab] text-white border-[#c3a2ab]" : "bg-white text-gray-500 border-gray-200"}`}
                  >
                    International
                  </button>
                </div>

                {shippingCountry === "International" && (
                  <input
                    placeholder="Country"
                    value={shippingInfo.country}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, country: e.target.value })
                    }
                    className="border rounded-lg px-4 py-3 w-full"
                  />
                )}

                {shippingCountry === "Thailand" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <select
    value={shippingInfo.province}
    onChange={(e) =>
      setShippingInfo({
        ...shippingInfo,
        province: e.target.value,
        district: "",
        subdistrict: "",
        postcode: ""
      })
    }
    className="border rounded-lg px-4 py-3 w-full"
  >
    <option value="">Province</option>

    {provinces.map((p) => (
      <option key={p} value={p}>
        {p}
      </option>
    ))}
  </select>

  <select
    value={shippingInfo.district}
    onChange={(e) =>
      setShippingInfo({
        ...shippingInfo,
        district: e.target.value,
        subdistrict: "",
        postcode: ""
      })
    }
    disabled={!shippingInfo.province}
    className="border rounded-lg px-4 py-3 w-full"
  >
    <option value="">District</option>

    {districts.map((d) => (
      <option key={d} value={d}>
        {d}
      </option>
    ))}
  </select>
  <select
    value={shippingInfo.subdistrict}
    onChange={(e) => {
      const selected = subdistricts.find(
        s => s.name_th === e.target.value
      )

      setShippingInfo({
        ...shippingInfo,
        subdistrict: e.target.value,
        postcode: selected.zip_code
      })
    }}
    disabled={!shippingInfo.district}
    className="border rounded-lg px-4 py-3 w-full"
  >
    <option value="" >Subdistrict</option>

    {subdistricts.map((s) => (
      <option key={s.id} value={s.name_th}>
        {s.name_th}
      </option>
    ))}
  </select>
                  <input
    value={shippingInfo.postcode}
    readOnly
    className="border rounded-lg px-4 py-3 w-full bg-gray-100"
    placeholder="Postal Code"
  />
  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="State / Province"
                      value={shippingInfo.province}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, province: e.target.value })}
                      className="border rounded-lg px-4 py-3 w-full"
                    />
                    <input
                      placeholder="City / District"
                      value={shippingInfo.district}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, district: e.target.value })}
                      className="border rounded-lg px-4 py-3 w-full"
                    />
                    <input
                      placeholder="Area / Subdistrict (Optional)"
                      value={shippingInfo.subdistrict}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, subdistrict: e.target.value })}
                      className="border rounded-lg px-4 py-3 w-full"
                    />
                    <input
                      placeholder="Postal / Zip Code"
                      value={shippingInfo.postcode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, postcode: e.target.value })}
                      className="border rounded-lg px-4 py-3 w-full"
                    />
                  </div>
                )}
                <input
                  placeholder="Phone"
                  value={shippingInfo.phone}
                  onChange={(e) =>
                    setShippingInfo({ ...shippingInfo, phone: e.target.value })
                  }
                  className="border rounded-lg px-4 py-3 w-full"
                />
                
              </div> */}
            </div>

            {/* Shipping Method */}
            {/* <div className="mb-12">
              <h2 className="text-2xl mb-6 font-serif">Shipping Method</h2>

              <div className="space-y-3">
                <label className="flex justify-between border p-4 rounded-lg cursor-pointer">
                  <span>
                    <input
                      type="radio"
                      checked={shipping === "Bank Transfer (Free Shipping)"}
                      onChange={() => setShipping("Bank Transfer (Free Shipping)")}
                    />{" "}
                    Bank Transfer (Free Shipping)
                  </span>
                  <span>฿0</span>
                </label>

                <label className="flex justify-between border p-4 rounded-lg cursor-pointer">
                  <span>
                    <input
                      type="radio"
                      checked={shipping === "Cash on Delivery (+$30 Fee)"}
                      onChange={() => setShipping("Cash on Delivery (+$30 Fee)")}
                    />{" "}
                    Cash on Delivery (+฿30 Fee)
                  </span>
                  <span>฿30</span>
                </label>
              </div>
            </div> */}
          </section>

          {/* RIGHT - SUMMARY */}
          <aside className="lg:col-span-5">
            <div className="bg-gray-50 p-8 rounded-xl border sticky top-8">

              <h2 className="text-2xl mb-6 font-serif">Order Summary</h2>

              <div className="space-y-3 text-sm mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>฿{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

             <div className="space-y-2 mt-6">

  <div className="flex justify-between">
    <span>Subtotal</span>
    <span>฿{subtotal.toFixed(2)}</span>
  </div>

  <div className="flex justify-between">
    <span>Shipping</span>
    <span>฿{shippingCost.toFixed(2)}</span>
  </div>

  <div className="flex justify-between">
    <span>Tax</span>
    <span>฿{tax.toFixed(2)}</span>
  </div>

  {discountAmount > 0 && (
    <div className="flex justify-between text-green-600">
      <span>Discount Code</span>
      <span>- ฿{discountAmount.toFixed(2)}</span>
    </div>
  )}
  
  {pointsDiscountAmount > 0 && (
    <div className="flex justify-between text-[#c3a2ab]">
      <span>Points Used ({parsedPoints} Pts)</span>
      <span>- ฿{pointsDiscountAmount.toFixed(2)}</span>
    </div>
  )}

  <div className="border-t pt-4 flex justify-between font-bold text-lg">
    <span>Total</span>
    <span>฿{finalTotal.toFixed(2)}</span>
  </div>

</div>
              <div className="flex gap-2 mt-4">
  <input
  type="text"
  placeholder="ใส่โค้ดส่วนลด"
  value={discountCode}
  onChange={(e) => setDiscountCode(e.target.value)}
  className="border p-2 rounded w-full"
/>

<button
  onClick={checkDiscount}
  className="bg-black text-white px-4 py-2 mt-2 rounded"
>
  Apply Code
</button>
</div>

<div className="mt-6 border-t pt-6">
  <h3 className="text-lg font-serif mb-2 flex items-center gap-2">
    🎁 Richse Rewards
  </h3>
  <p className="text-sm text-gray-500 mb-4">
    You have <strong className="text-[#c3a2ab] font-bold">{availablePoints} Points</strong> available. <br/>
    <span className="text-xs">(10 Baht spent = 1 Point | 1 Point = ฿1 Discount)</span>
  </p>
  
  <div className="flex gap-2">
    <input
      type="number"
      placeholder="Enter points to use"
      value={pointsToUse}
      min="0"
      max={availablePoints}
      onChange={(e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 0) setPointsToUse("");
        else if (val > availablePoints) setPointsToUse(availablePoints.toString());
        else setPointsToUse(val.toString());
      }}
      className="border p-2 rounded w-full"
    />
    <button
      onClick={() => setPointsToUse(Math.floor(Math.min(availablePoints, totalBeforeDiscount - discountAmount)).toString())}
      className="bg-[#c3a2ab]/10 text-[#c3a2ab] font-medium px-4 py-2 whitespace-nowrap rounded hover:bg-[#c3a2ab]/20 transition-colors"
    >
      Max
    </button>
  </div>
</div>

              <div>

   {!verified && (
    <ReCAPTCHA
     sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
     onChange={handleCaptcha}
    />
   )}

   {cart.length === 0 && (
     <div className="w-full mt-6 bg-gray-200 text-gray-500 text-center py-4 rounded-xl">
       Your cart is empty
     </div>
   )}

   {cart.length > 0 && verified && (
  <button
    onClick={handlePurchase}
    disabled={loading}
    className="w-full mt-6 bg-[#c3a2ab] text-white py-4 rounded-xl disabled:opacity-50"
  >
    {loading ? "Processing..." : "Complete Purchase"}
  </button>
)}

  </div>

            </div>
          </aside>

        </div>
      </main>
      

      <Footer />
    </div>
  )
}