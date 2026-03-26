"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { 
  CookieConsent, 
  getLocalConsent, 
  setLocalConsent 
} from "@/lib/cookie-utils";

interface CookieConsentContextType {
  consent: CookieConsent | null;
  isInitialized: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  updateConsent: (newConsent: Partial<CookieConsent>) => Promise<void>;
  acceptAll: () => void;
  rejectAll: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage and mark as initialized on mount
  useEffect(() => {
    const stored = getLocalConsent();
    if (stored) {
      setTimeout(() => setConsent(stored), 0);
    }
    setTimeout(() => setIsInitialized(true), 0);
  }, []);

  // Sync with Database via API if logged in
  useEffect(() => {
    if (session?.user && isInitialized) {
      const syncWithDB = async () => {
        try {
          const res = await fetch("/api/cookie-preferences");
          if (res.ok) {
            const data = await res.json();
            const dbConsent: CookieConsent = {
              analytics: !!data.analytics,
              marketing: !!data.marketing,
              essential: true
            };
            
            const local = getLocalConsent();
            if (!local || local.analytics !== dbConsent.analytics || local.marketing !== dbConsent.marketing) {
              setLocalConsent(dbConsent);
              setConsent(dbConsent);
            }
          }
        } catch (err) {
          console.error("Error syncing cookie preferences:", err);
        }
      };

      syncWithDB();
    }
  }, [session?.user, isInitialized]);

  const updateConsent = useCallback(async (newConsent: Partial<CookieConsent>) => {
    const updated = {
      analytics: newConsent.analytics ?? (consent?.analytics || false),
      marketing: newConsent.marketing ?? (consent?.marketing || false),
      essential: true
    };

    setConsent(updated);
    setLocalConsent(updated);

    if (session?.user) {
      try {
        await fetch("/api/cookie-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
      } catch (err) {
        console.error("Error saving cookie preferences to DB:", err);
      }
    }
  }, [consent, session?.user]);

  const acceptAll = useCallback(() => {
    updateConsent({ analytics: true, marketing: true });
  }, [updateConsent]);

  const rejectAll = useCallback(() => {
    updateConsent({ analytics: false, marketing: false });
  }, [updateConsent]);

  return (
    <CookieConsentContext.Provider value={{
      consent,
      isInitialized,
      isOpen,
      setIsOpen,
      updateConsent,
      acceptAll,
      rejectAll
    }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}
