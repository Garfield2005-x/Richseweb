"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/lib/hooks/useCookieConsent";
import CookieSettingsModal from "./CookieSettingsModal";

export default function CookieBanner() {
  const pathname = usePathname();
  const { consent, isInitialized, acceptAll, rejectAll, updateConsent, isOpen, setIsOpen } = useCookieConsent();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Don't show on biorichse page
    if (pathname === "/biorichse") {
      if (shouldShow) setTimeout(() => setShouldShow(false), 0);
      return;
    }

    // Only show if consent is null (not set yet) and script is initialized
    if (isInitialized && consent === null) {
      // Delay slightly for better UX
      const timer = setTimeout(() => setShouldShow(true), 1000);
      return () => clearTimeout(timer);
    } else if (shouldShow) {
      setTimeout(() => setShouldShow(false), 0);
    }
  }, [consent, isInitialized, shouldShow, pathname]);

  if (!isInitialized || pathname === "/biorichse") return null;

  return (
    <>
      <AnimatePresence>
        {shouldShow && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-6 right-6 z-[90] flex justify-center pointer-events-none"
          >
            <div className="bg-white text-[#1c191a] w-full max-w-4xl p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-100 pointer-events-auto flex flex-col md:flex-row items-center gap-6">
              <div className="hidden md:flex bg-[#c3a2ab]/20 p-4 rounded-full text-[#c3a2ab]">
                <Cookie size={32} />
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold">เราใช้คุกกี้เพื่อมอบประสบการณ์ที่ดีที่สุด</h3>
                <p className="text-sm text-gray-500 leading-relaxed text-balance">
                  เว็บไซต์ของเราใช้งานคุกกี้เพื่อวิเคราะห์การเข้าชม พัฒนาประสบการณ์การใช้งาน และแสดงโฆษณาที่ตรงตามความสนใจของคุณ 
                  คุณสามารถอ่านข้อมูลเพิ่มเติมได้ที่{" "}
                  <Link href="/privacy" className="text-[#c3a2ab] hover:underline font-medium">
                    นโยบายความเป็นส่วนตัว
                  </Link>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto min-w-fit">
                <button
                  onClick={() => setIsOpen(true)}
                  className="px-6 py-2.5 text-xs font-bold tracking-widest uppercase rounded-full border border-gray-200 hover:bg-gray-50 transition-all text-center"
                >
                  ตั้งค่าคุกกี้
                </button>
                <button
                  onClick={rejectAll}
                  className="px-8 py-2.5 text-xs font-bold tracking-widest uppercase rounded-full bg-gray-100 hover:bg-gray-200 transition-all text-center"
                >
                  ปฏิเสธ
                </button>
                <button
                  onClick={acceptAll}
                  className="px-8 py-2.5 text-xs font-bold tracking-widest uppercase rounded-full bg-[#c3a2ab] text-white hover:bg-[#b08e97] transition-all shadow-lg shadow-[#c3a2ab]/20 text-center"
                >
                  ยอมรับทั้งหมด
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CookieSettingsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        consent={consent}
        onSave={updateConsent}
      />
    </>
  );
}
