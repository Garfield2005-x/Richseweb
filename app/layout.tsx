/* eslint-disable @next/next/no-page-custom-font */

import type { ReactNode } from "react";
import { Noto_Serif, Noto_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./Providers"
import { CartProvider } from "@/context/CartContext"
import { Analytics } from "@vercel/analytics/react";
import CookieBanner from "./components/cookie/CookieBanner";
import CookieSettingsTrigger from "./components/cookie/CookieSettingsTrigger";
import GoogleAnalytics from "./components/analytics/GoogleAnalytics";

const notoSerif = Noto_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["100","300","400","500","600","700","900"],
  style: ["normal", "italic"],
});


const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "900"],
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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#c3a2ab" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${notoSerif.variable} ${notoSans.variable} antialiased`}>
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
