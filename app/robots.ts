import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/account"],
      },
    ],
    sitemap: "https://www.richseofficial.com/sitemap.xml",
  };
}
