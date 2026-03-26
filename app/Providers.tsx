"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { CookieConsentProvider } from "@/context/CookieConsentContext";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <CookieConsentProvider>
        {children}
        <Toaster position="bottom-right" />
      </CookieConsentProvider>
    </SessionProvider>
  );
}