/* eslint-disable @next/next/no-page-custom-font */

import type { ReactNode } from "react";
import { Noto_Serif, Noto_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./Providers"
import { CartProvider } from "@/context/CartContext"

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
  openGraph: {
    title: "Richse Official",
    description:
      "Luxury fashion and skincare curated for modern elegance.",
    url: "https://www.richseofficial.com",
    siteName: "Richse Official",
    images: [
      {
        url: "/og-image.png", // ต้องมีไฟล์นี้ใน public
        width: 1200,
        height: 630,
        alt: "Richse Official",
      },
    ],
    type: "website",
  },
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
      </head>
      <body className={`${notoSerif.variable} ${notoSans.variable} antialiased`}>
        <CartProvider>
        <Providers>
          {children}
        </Providers>
        </CartProvider>
      </body>
    </html>
  );
}
