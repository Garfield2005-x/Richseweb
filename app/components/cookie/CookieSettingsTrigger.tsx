"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/lib/hooks/useCookieConsent";

export default function CookieSettingsTrigger() {
  const pathname = usePathname();
  const { consent, setIsOpen, isInitialized } = useCookieConsent();

  // Don't show until initialized, only if consent is already decided, and hide on biorichse page
  if (!isInitialized || consent === null || pathname === "/biorichse") return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setIsOpen(true)}
      id="cookie-settings-trigger"
      className="fixed bottom-6 left-6 z-[80] w-12 h-12 bg-white text-[#c3a2ab] rounded-full shadow-2xl flex items-center justify-center border border-gray-100 hover:shadow-[#c3a2ab]/20 transition-all group"
      title="Cookie Settings"
    >
      <Cookie size={24} className="group-hover:rotate-12 transition-transform" />
    </motion.button>
  );
}
