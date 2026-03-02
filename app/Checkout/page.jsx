"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useCart } from "@/context/CartContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function Checkout() {
  const router = useRouter()
  const { cart, clearCart } = useCart()

  const [loading, setLoading] = useState(false)

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: ""
  })

  const [shipping, setShipping] = useState("standard")

  // ===== คำนวณราคา =====
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const tax = subtotal * 0.08
  const shippingCost = shipping === "express" ? 25 : 0
  const total = subtotal + tax + shippingCost

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
      total
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
                <label className="flex justify-between border p-4 rounded-lg cursor-pointer">
                  <span>
                    <input
                      type="radio"
                      checked={shipping === "standard"}
                      onChange={() => setShipping("standard")}
                    />{" "}
                    Standard Shipping (Free)
                  </span>
                  <span>$0</span>
                </label>

                <label className="flex justify-between border p-4 rounded-lg cursor-pointer">
                  <span>
                    <input
                      type="radio"
                      checked={shipping === "express"}
                      onChange={() => setShipping("express")}
                    />{" "}
                    Express (Next Day)
                  </span>
                  <span>$25</span>
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
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full mt-8 bg-[#c3a2ab] hover:bg-[#c3a2ab]/90 text-white py-4 rounded-xl font-bold uppercase text-sm disabled:opacity-50"
              >
                {loading ? "Processing..." : "Complete Purchase"}
              </button>

            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  )
}