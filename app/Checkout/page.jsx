"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useCart } from "@/context/CartContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useRef } from "react"
import ReCAPTCHA from "react-google-recaptcha"

export default function Checkout() {
  const [verified,setVerified] = useState(false)
  const recaptchaRef = useRef(null)
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const tax = 0
  const [loading, setLoading] = useState(false)
  
 const handleCaptcha = (token) => {
  if(token){
   setVerified(true)
  }
 }

 const [shippingInfo, setShippingInfo] = useState({
  fullName: "",
  address: "",
  city: "",
  postalCode: "",
  phone: ""
})

const handlePurchase = async () => {
  await handleCheckout()
}
  const [shipping, setShipping] = useState("Bank Transfer (Free Shipping)")

  // ===== คำนวณราคา =====
const subtotal = cart.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
)

const shippingCost =
  shipping === "Cash on Delivery (+$30 Fee)" ? 30 : 0

const totalBeforeDiscount = subtotal + shippingCost

const finalTotal = Math.max(
  totalBeforeDiscount - discountAmount,
  0
)
const checkDiscount = async () => {
  if (!discountCode || !shippingInfo.phone) {
    alert("กรุณากรอกเบอร์โทรและโค้ด")
    return
  }

  const cleanCode = discountCode.trim().toUpperCase()
  const cleanPhone = shippingInfo.phone.trim()

  console.log("===== CHECK DISCOUNT =====")
  console.log("Code:", cleanCode)
  console.log("Phone:", cleanPhone)

  // 🔎 1. เช็คโค้ดว่ามีและ active ไหม
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", cleanCode)
    .eq("active", true)
    .maybeSingle()

  if (error) {
    console.log("DB ERROR:", error)
    alert("เกิดข้อผิดพลาด ดู console")
    return
  }

  if (!data) {
    alert("โค้ดไม่ถูกต้อง")
    return
  }

  // 🔎 2. เช็คว่าเบอร์นี้เคยใช้โค้ดนี้หรือยัง
  const { data: usage, error: usageError } = await supabase
    .from("discount_usage")
    .select("*")
    .eq("phone", cleanPhone)
    .eq("code", cleanCode)
    .maybeSingle()

  if (usageError) {
    console.log("USAGE ERROR:", usageError)
    alert("เกิดข้อผิดพลาด ดู console")
    return
  }

  if (usage) {
    alert("เบอร์นี้ใช้โค้ดไปแล้ว")
    return
  }

  // 💰 3. คำนวณส่วนลด
  const discount =
    (totalBeforeDiscount * data.discount_percent) / 100

  setDiscountAmount(discount)

  alert("ใช้โค้ดสำเร็จ 🎉")
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
        !shippingInfo.city ||
        !shippingInfo.postalCode ||
        !shippingInfo.phone
      ) {
        alert("Please fill in all shipping information")
        return
      }
     
      setLoading(true)

      // 1️⃣ สร้าง order
      const { data: order, error } = await supabase
  .from("orders")
  .insert([
    {
      full_name: shippingInfo.fullName,
      address: shippingInfo.address,
      city: shippingInfo.city,
      postal_code: shippingInfo.postalCode,
      phone: shippingInfo.phone,
      shipping_method: shipping,
      subtotal,
      tax,
      total: finalTotal 
    }
  ])
  .select()
  .single()

if (error) {
  console.error("Order insert error:", error)
  alert(error.message)
  return
}
      // 2️⃣ สร้าง order_items
      const items = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase
  .from("order_items")
  .insert(items)

if (itemsError) {
  console.error("Order items error:", itemsError)
  alert(itemsError.message)
  return
}
if (discountAmount > 0) {
  await supabase.from("discount_usage").insert([
    {
      phone: shippingInfo.phone,
      code: discountCode
    }
  ])
}
const lineRes = await fetch("/api/line", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fullName: shippingInfo.fullName,
    address: shippingInfo.address,
    city: shippingInfo.city,
    postalCode: shippingInfo.postalCode,
    phone: shippingInfo.phone,
    shippingMethod: shipping,
    subtotal,
    shippingCost,
    total: finalTotal,
    cart,
    discountAmount,
    discountCode
  })
})

if (!lineRes.ok) {
  const errText = await lineRes.text()
  console.error("LINE notify failed:", errText)
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

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl mb-10 font-serif">Checkout</h1>

        <div className="grid lg:grid-cols-12 gap-12">

          {/* LEFT */}
          <section className="lg:col-span-7">

            {/* Shipping */}
            <div className="mb-12">
              <h2 className="text-2xl mb-6 font-serif">Shipping Address</h2>

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
                    placeholder="City"
                    value={shippingInfo.city}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, city: e.target.value })
                    }
                    className="border rounded-lg px-4 py-3 w-full"
                  />

                  <input
                    placeholder="Postal Code"
                    value={shippingInfo.postalCode}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
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
                  className="border rounded-lg px-4 py-3 w-full"
                />
              </div>
            </div>

            {/* Shipping Method */}
            <div className="mb-12">
              <h2 className="text-2xl mb-6 font-serif">Shipping Method</h2>

              <div className="space-y-3">
                {/* <label className="flex justify-between border p-4 rounded-lg cursor-pointer">
                  <span>
                    <input
                      type="radio"
                      checked={shipping === "Bank Transfer (Free Shipping)"}
                      onChange={() => setShipping("Bank Transfer (Free Shipping)")}
                    />{" "}
                    Bank Transfer (Free Shipping)
                  </span>
                  <span>฿0</span>
                </label> */}

                <label className="flex justify-between border p-4 rounded-lg cursor-pointer">
                  <span>
                    <input
                      type="radio"
                      checked={shipping === "Cash on Delivery (+$30 Fee)"}
                      onChange={() => setShipping("Cash on Delivery (+$30 Fee)")}
                    />{" "}
                    Cash on Delivery (+$30 Fee)
                  </span>
                  <span>฿30</span>
                </label>
              </div>
            </div>
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
      <span>Discount</span>
      <span>- ฿{discountAmount.toFixed(2)}</span>
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

              <div>

   {!verified && (
    <ReCAPTCHA
     sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
     onChange={handleCaptcha}
    />
   )}

   {verified && (
  <button
    onClick={handlePurchase}
    className="w-full mt-6 bg-[#c3a2ab] text-white py-4 rounded-xl"
  >
    Complete Purchase
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