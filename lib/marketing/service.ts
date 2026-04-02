import { prisma } from "@/lib/prisma";
import { signToken } from "./crypto";
import nodemailer from "nodemailer";

export interface CampaignAudience {
  id: string; // email as ID (normalized)
  email: string;
  name?: string;
}

export async function getAudience(type: string): Promise<CampaignAudience[]> {
  let audience: CampaignAudience[] = [];

  if (type === "ALL" || type === "REGISTERED") {
    const users = await prisma.user.findMany({
      where: { email: { not: null } },
      select: { email: true, name: true }
    });
    audience.push(...users.map(u => ({ id: u.email!.toLowerCase(), email: u.email!.toLowerCase(), name: u.name || undefined })));
  }

  if (type === "ALL" || type === "SUB_UNREG") {
    const subscribers = await prisma.subscriber.findMany({
      select: { email: true }
    });
    const subAudience = subscribers.map(s => ({ id: s.email.toLowerCase(), email: s.email.toLowerCase() }));
    
    if (type === "SUB_UNREG") {
      // Filter out those who are already users
      const userEmails = new Set(audience.map(a => a.email));
      audience = subAudience.filter(s => !userEmails.has(s.email));
    } else {
      audience.push(...subAudience);
    }
  }

  // Final deduplication by email (lowercase)
  const uniqueAudience = new Map<string, CampaignAudience>();
  audience.forEach(item => uniqueAudience.set(item.email, item));
  
  // Filter out unsubscribed emails
  const unsubscribed = await prisma.unsubscribedEmail.findMany({
    select: { email: true }
  });
  const unsubSet = new Set(unsubscribed.map((u: { email: string }) => u.email.toLowerCase()));
  
  return Array.from(uniqueAudience.values()).filter(a => !unsubSet.has(a.email));
}

export function renderTemplate(html: string, variables: Record<string, string>): string {
  let rendered = html;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, value);
  }
  return rendered;
}

export function injectTracking(html: string, token: string, baseUrl: string): string {
  let rendered = html;
  
  // 1. Click Tracking: Wrap absolute links in <a> tags
  // Matches <a ... href="http..."> but avoids already tracked links
  const linkRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
  rendered = rendered.replace(linkRegex, (match: string, url: string) => {
    if (url.includes("/api/marketing/track")) return match;
    
    const trackingUrl = `${baseUrl}/api/marketing/track/click?t=${token}&u=${encodeURIComponent(url)}`;
    return `href="${trackingUrl}"`;
  });

  // 2. Open Tracking: Inject hidden 1x1 GIF
  const openUrl = `${baseUrl}/api/marketing/track/open?t=${token}`;
  const pixelTag = `<img src="${openUrl}" width="1" height="1" style="display:none !important;" alt="" />`;
  
  if (rendered.toLowerCase().includes("</body>")) {
    rendered = rendered.replace(/<\/body>/i, `${pixelTag}</body>`);
  } else {
    rendered += pixelTag;
  }

  return rendered;
}

export async function createRecipientsSnapshot(campaignId: string, audience: CampaignAudience[]) {
  // Create recipients with unique tokens
  const data = audience.map(a => ({
    campaignId,
    email: a.email,
    token: signToken({ c: campaignId, e: a.email })
  }));

  // Batch insert to avoid DB timeouts
  const BATCH_SIZE = 1000;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    await prisma.campaignRecipient.createMany({
      data: batch,
      skipDuplicates: true // Idempotency safeguard
    });
  }
}

export async function logMarketingAction(adminEmail: string, action: string, campaignId?: string, before?: unknown, after?: unknown) {
  await prisma.marketingAuditLog.create({
    data: {
      adminEmail,
      action,
      campaignId,
      beforeData: (before as any) || undefined, // eslint-disable-line @typescript-eslint/no-explicit-any
      afterData: (after as any) || undefined    // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  });
}

export function getTransporters() {
   const primary = nodemailer.createTransport({
     host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
     port: Number(process.env.EMAIL_SERVER_PORT) || 587,
     auth: {
       user: process.env.EMAIL_SERVER_USER,
       pass: process.env.EMAIL_SERVER_PASSWORD,
     },
   });

   const secondary = process.env.FALLBACK_EMAIL_SERVER_HOST ? nodemailer.createTransport({
     host: process.env.FALLBACK_EMAIL_SERVER_HOST,
     port: Number(process.env.FALLBACK_EMAIL_SERVER_PORT),
     auth: {
       user: process.env.FALLBACK_EMAIL_SERVER_USER,
       pass: process.env.FALLBACK_EMAIL_SERVER_PASSWORD,
     }
   }) : primary;

   return { primary, secondary };
}

export async function sendTestEmail(to: string, subject: string, html: string) {
  const { primary } = getTransporters();
  await primary.sendMail({
    from: `"Richse Official" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
    to,
    subject: `[TEST] ${subject}`,
    html
  });
}
