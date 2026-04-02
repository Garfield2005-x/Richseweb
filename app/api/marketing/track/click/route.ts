import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/marketing/crypto";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("t");
    const targetUrl = url.searchParams.get("u");

    if (!token || !targetUrl) {
      return NextResponse.redirect(process.env.NEXTAUTH_URL || "/");
    }

    const payload = verifyToken(token);
    if (!payload?.c || !payload?.e) {
      console.warn("Invalid token for click tracking");
      return NextResponse.redirect(targetUrl);
    }

    // 1. Click Deduplication (5-minute cooldown)
    const recipient = await prisma.campaignRecipient.findUnique({
      where: { campaignId_email: { campaignId: payload.c, email: payload.e } }
    });

    if (recipient) {
      const now = new Date();
      const fiveMinsAgo = new Date(now.getTime() - 5 * 60000);
      
      const isRapidClick = recipient.clickedAt && recipient.clickedAt > fiveMinsAgo;

      if (!isRapidClick) {
         await prisma.$transaction([
            prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: { clickedAt: now }
            }),
            prisma.marketingCampaign.update({
              where: { id: payload.c },
              data: { clickCount: { increment: 1 } }
            })
         ]);
      }
    }

    // 2. Redirect with UTM params
    const redirectUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    redirectUrl.searchParams.set("utm_source", "richse_marketing");
    redirectUrl.searchParams.set("utm_medium", "email");
    redirectUrl.searchParams.set("utm_campaign", payload.c);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Click Tracking Error:", error);
    return NextResponse.redirect(process.env.NEXTAUTH_URL || "/");
  }
}
