"use client";
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CustomerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      // Save to our DB
      const res = await fetch('/api/campanet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        throw new Error("Failed to save to database");
      }

      // Send to Google Sheets (silent)
      await fetch("https://script.google.com/a/macros/richseofficial.com/s/AKfycbz5J4aFQq2U8VqYGU8vuKPNDfSBXB8XZ6heKzo2kOcTen4GcyBRUJnVtSU1N9Lf1qaO/exec", {
        method: "POST",
        body: formData,
        mode: "no-cors"
      });

      alert("ลงทะเบียนสำเร็จ ✅");
      e.target.reset(); // clear form
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }
    
  return (
    <div className="bg-brand-beige  min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-125 bg-white  rounded-xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.08)] overflow-hidden border border-stone-100/50 ">
        
        <div className="px-8 pt-12 pb-10 flex flex-col items-center">

          <div className="mb-8 text-center">
            <span className="text-stone-400 tracking-[0.4em] uppercase text-[10px] font-bold block mb-3">
              Richse Official
            </span>

            <h1 className="text-stone-800  text-3xl font-medium tracking-tight brand-heading">
              Customer Information
            </h1>

            <p className="text-stone-500  text-sm mt-2">
              Please provide your details to process your request
            </p>
          </div>

          <form 
            onSubmit={handleSubmit}
            className="w-full space-y-6">


            {/* Name */}
            <div className="space-y-2">
              <label className="block text-stone-500  text-[11px] font-bold tracking-widest uppercase">
                Full Name (ชื่อ-นามสกุล)
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined notranslate text-stone-400 group-focus-within:text-primary transition-colors">
                    person
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  name="name"
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-white  border border-stone-200  text-stone-900  placeholder-stone-300 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-stone-500  text-[11px] font-bold tracking-widest uppercase">
                Phone Number (เบอร์โทรศัพท์)
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined notranslate text-stone-400 group-focus-within:text-primary transition-colors">
                    call
                  </span>
                </div>

                <input
                  type="tel"
                  placeholder="08X-XXX-XXXX"
                  name="phone"
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-white  border-stone-200  text-stone-900  placeholder-stone-300 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Order Number */}
            <div className="space-y-2">
              <label className="block text-stone-500  text-[11px] font-bold tracking-widest uppercase">
                Order Number (เลขที่คำสั่งซื้อ)
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined notranslate text-stone-400 group-focus-within:text-primary transition-colors">
                    shopping_bag
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="#12345"
                  name="order"
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-white  border border-stone-200  text-stone-900  placeholder-stone-300 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Button */}
            <div className="pt-6">
             
<button
  type="submit"
  disabled={isSubmitting}
  className={`w-full bg-[#c3a2ab] text-white font-medium py-5 rounded-lg
  transition-all duration-300 ease-out flex items-center justify-center gap-3 group
  ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#c3a2ab]/30 active:scale-[0.97]"}`}
>
  <span className="tracking-wide">
    {isSubmitting ? "Submitting..." : "Submit Information"}
  </span>

  {!isSubmitting && (
    <span className="material-symbols-outlined notranslate text-[20px] transition-all duration-300 group-hover:translate-x-2">
      arrow_forward
    </span>
  )}
</button>
            </div>

            <div className="flex items-center justify-center gap-2 mt-8 opacity-40">
              <span className="h-px w-8 bg-stone-400"></span>
              <span className="text-[10px] tracking-widest uppercase font-bold text-stone-900 ">
                Secure Form
              </span>
              <span className="h-px w-8 bg-stone-400"></span>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
