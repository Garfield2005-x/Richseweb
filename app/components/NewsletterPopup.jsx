"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user has opted out
    const isDismissed = localStorage.getItem('hideNewsletterPopup');
    if (!isDismissed) {
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideNewsletterPopup', 'true');
    }
    setIsVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("ขอบคุณที่ติดตาม! เช็คอีเมลรับโค้ดลด 10% ได้เลย 🎉");
        localStorage.setItem('hideNewsletterPopup', 'true'); // Hide if subscribed
        setTimeout(() => setIsVisible(false), 3000);
      } else {
        setMessage(data.message || "Email นี้เคยสมัครแล้ว 💌");
      }
    } catch {
      setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 100 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed bottom-6 right-6 z-[100] w-[320px] md:w-[380px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden"
        >
          {/* Decorative Top Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#c3a2ab] via-[#E5E7EB] to-[#c3a2ab]" />
          
          <div className="p-8 space-y-5">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[#c3a2ab] font-bold tracking-[0.2em] text-[10px] uppercase">Join Our Ritual</span>
                <h3 className="font-serif text-2xl text-[#161314] leading-tight">Get 10% Off</h3>
              </div>
              <button onClick={handleClose} className="text-gray-300 hover:text-gray-600 transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed italic">
              "ลงทะเบียนรับข่าวสาร และโค้ดส่วนลดพิเศษสำหรับคำสั่งซื้อแรกของคุณ"
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#c3a2ab]/30 transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#161314] text-white text-[11px] font-bold uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-[#c3a2ab] transition-all duration-500 shadow-lg shadow-black/10 disabled:opacity-50"
              >
                {loading ? "Discovering..." : "Subscribe Now"}
              </button>

              <div className="flex items-center gap-2 pt-1 transition-opacity group">
                <input
                  type="checkbox"
                  id="dont-show-again"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#c3a2ab] focus:ring-[#c3a2ab]"
                />
                <label htmlFor="dont-show-again" className="text-[10px] text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-600">
                  ไม่ต้องแสดงป๊อปอัพนี้อีก
                </label>
              </div>
            </form>

            {message && (
              <motion.p 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-[11px] text-center font-medium ${message.includes('ขอบคุณ') ? 'text-green-600' : 'text-red-500'}`}
              >
                {message}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
