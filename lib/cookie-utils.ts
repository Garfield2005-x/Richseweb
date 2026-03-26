/**
 * Cookie Consent Categories
 */
export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  essential: boolean; // Always true
}

export const COOKIE_CONSENT_KEY = "richse-cookie-consent";

/**
 * Get consent from localStorage
 */
export const getLocalConsent = (): CookieConsent | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

/**
 * Set consent to localStorage
 */
export const setLocalConsent = (consent: Partial<CookieConsent>) => {
  if (typeof window === "undefined") return;
  const current = getLocalConsent() || { analytics: false, marketing: false, essential: true };
  const updated = { ...current, ...consent, essential: true };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(updated));
  
  // Trigger a custom event so other components know consent changed
  window.dispatchEvent(new Event("cookie-consent-changed"));
};

/**
 * Check if a specific category is accepted
 */
export const hasConsent = (category: keyof CookieConsent): boolean => {
  if (category === "essential") return true;
  const consent = getLocalConsent();
  return consent ? !!consent[category] : false;
};
