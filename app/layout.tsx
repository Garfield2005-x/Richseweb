/* eslint-disable @next/next/no-page-custom-font */

import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./Providers";
import { CartProvider } from "@/context/CartContext";
import { Analytics } from "@vercel/analytics/react";
import CookieBanner from "./components/cookie/CookieBanner";
import CookieSettingsTrigger from "./components/cookie/CookieSettingsTrigger";
import GoogleAnalytics from "./components/analytics/GoogleAnalytics";

/**
 * 🖋️ Montserrat for Branding & Headers
 */
const montserrat = localFont({
  src: [
    {
      path: "../public/fonts/Montserrat-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Montserrat-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
});

/**
 * 🖋️ DB Heavent for Interface & Content
 */
const dbHeavent = localFont({
  src: [
    {
      path: "../public/fonts/DB Heavent v3.2.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/DB Heavent Med v3.2.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/DB Heavent Bd v3.2.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/DB Heavent Blk v3.2.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});

export const metadata = {
  title: {
    default: "Richse Official",
    template: "%s | Richse Official",
  },
  description:
    "Discover timeless elegance with Richse Official. Premium fashion, skincare, and exclusive collections designed for modern confidence.",
  metadataBase: new URL("https://www.richseofficial.com"),
  keywords: ["Richse", "skincare", "luxury", "fashion", "Thailand"],
  openGraph: {
    title: "Richse Official",
    description: "Luxury fashion and skincare curated for modern elegance.",
    url: "https://www.richseofficial.com",
    siteName: "Richse Official",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Richse Official",
      },
    ],
    type: "website",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Richse Official",
    description: "Luxury fashion and skincare curated for modern elegance.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Richse",
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="th">
      <head />
      <body className={`${montserrat.variable} ${dbHeavent.variable} font-sans antialiased`}>
        <CartProvider>
        <Providers>
          {children}
          <Analytics />
          <GoogleAnalytics gaId="G-MLP06JQZSJ" />
          <CookieBanner />
          <CookieSettingsTrigger />
        </Providers>
        </CartProvider>
      </body>
    </html>
  );
}
