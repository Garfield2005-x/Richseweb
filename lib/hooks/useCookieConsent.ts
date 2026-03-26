"use client";

import { useCookieConsent as useCookieConsentFromContext } from "@/context/CookieConsentContext";

/**
 * Re-exporting the useCookieConsent hook from the context
 * to maintain backward compatibility with components already using it.
 */
export function useCookieConsent() {
  return useCookieConsentFromContext();
}
