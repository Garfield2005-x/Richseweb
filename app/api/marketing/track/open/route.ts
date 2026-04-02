import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/marketing/crypto";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("t");

    if (!token) {
       return new Response(null, { status: 400 });
    }

    const payload = verifyToken(token);
    if (!payload?.c || !payload?.e) {
      return new Response(null, { status: 403 });
    }

    // 1. Bot Filtering (Simplified - check basic bot strings)
    const ua = req.headers.get("user-agent") || "";
    if (/bot|crawler|spider|google|bing|yahoo/i.test(ua)) {
       // Just return the image without tracking
       return new Response(
         Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"),
         { headers: { "Content-Type": "image/gif" } }
       );
    }

    // 2. Performance: Non-blocking or fast update
    const recipient = await prisma.campaignRecipient.findUnique({
      where: { campaignId_email: { campaignId: payload.c, email: payload.e } }
    });

    if (recipient && !recipient.openedAt) {
       await prisma.$transaction([
          prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { openedAt: new Date() }
          }),
          prisma.marketingCampaign.update({
            where: { id: payload.c },
            data: { openCount: { increment: 1 } }
          })
       ]);
    }

    // Return 1x1 transparent GIF
    return new Response(
      Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"),
      { headers: { "Content-Type": "image/gif", "Cache-Control": "no-store, no-cache" } }
    );
  } catch {
    return new Response(null, { status: 500 });
  }
}
