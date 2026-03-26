"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, BarChart3, Target } from "lucide-react";
import { CookieConsent } from "@/lib/cookie-utils";

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  consent: CookieConsent | null;
  onSave: (consent: Partial<CookieConsent>) => void;
}

export default function CookieSettingsModal({
  isOpen,
  onClose,
  consent,
  onSave
}: CookieSettingsModalProps) {
  const [localConsent, setLocalConsent] = React.useState<Partial<CookieConsent>>({
    analytics: consent?.analytics ?? false,
    marketing: consent?.marketing ?? false
  });

  React.useEffect(() => {
    if (isOpen) {
      setLocalConsent({
        analytics: consent?.analytics ?? false,
        marketing: consent?.marketing ?? false
      });
    }
  }, [isOpen, consent]);

  const handleToggle = (category: keyof CookieConsent) => {
    if (category === "essential") return;
    setLocalConsent(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSave = () => {
    onSave(localConsent);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-[#1c191a] text-[#1c191a] dark:text-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-xl font-bold tracking-tight">การตั้งค่าคุกกี้ (Cookie Settings)</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                เราใช้คุกกี้เพื่อเพิ่มประสิทธิภาพ และประสบการณ์ที่ดีในการใช้งานเว็บไซต์ คุณสามารถเลือกความยินยอมการใช้คุกกี้แต่ละประเภทได้
              </p>

              {/* Essential */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                <div className="bg-[#c3a2ab] p-2 rounded-lg text-white">
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">คุกกี้ที่จำเป็น (Essential Cookies)</h3>
                    <span className="text-[10px] bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 px-2 py-1 rounded uppercase font-bold">
                      จำเป็นเสมอ
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    คุกกี้เหล่านี้จำเป็นสำหรับการทำงานของเว็บไซต์ และไม่สามารถปิดการใช้งานได้ในระบบของเรา
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div 
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => handleToggle("analytics")}
              >
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-500">
                  <BarChart3 size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">คุกกี้เพื่อการวิเคราะห์ (Analytics Cookies)</h3>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${localConsent.analytics ? 'bg-[#c3a2ab]' : 'bg-gray-300 dark:bg-white/20'}`}>
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localConsent.analytics ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ช่วยให้เรานับจำนวนผู้เข้าชมและแหล่งที่มาของทราฟฟิก เพื่อวัดผลและปรับปรุงประสิทธิภาพของเว็บไซต์
                  </p>
                </div>
              </div>

              {/* Marketing */}
              <div 
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => handleToggle("marketing")}
              >
                <div className="bg-purple-500/20 p-2 rounded-lg text-purple-500">
                  <Target size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">คุกกี้เพื่อการตลาด (Marketing Cookies)</h3>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${localConsent.marketing ? 'bg-[#c3a2ab]' : 'bg-gray-300 dark:bg-white/20'}`}>
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${localConsent.marketing ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ใช้เพื่อแสดงเนื้อหาและโฆษณาที่ตรงตามความต้องการของคุณมากขึ้น
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-white/10 flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 text-sm font-semibold rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSave}
                className="flex-[2] py-3 text-sm font-semibold rounded-xl bg-[#c3a2ab] text-white hover:bg-[#b08e97] transition-colors shadow-lg shadow-[#c3a2ab]/20"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
