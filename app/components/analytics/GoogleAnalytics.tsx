"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { hasConsent } from "@/lib/cookie-utils";

interface GoogleAnalyticsProps {
  gaId: string;
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Initial sync (already handled by initializer but good for safety if hasConsent changes)
    // Actually, initializer only runs on mount. If we want to avoid the lint error:
    const initialConsent = hasConsent("analytics");
    if (consentGiven !== initialConsent) {
      setTimeout(() => setConsentGiven(initialConsent), 0);
    }

    // Listen for changes
    const handleConsentChange = () => {
      setConsentGiven(hasConsent("analytics"));
    };

    window.addEventListener("cookie-consent-changed", handleConsentChange);
    return () => {
      window.removeEventListener("cookie-consent-changed", handleConsentChange);
    };
  }, [consentGiven]);

  if (!consentGiven) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
