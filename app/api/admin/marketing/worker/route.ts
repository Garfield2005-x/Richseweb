import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTransporters, renderTemplate, injectTracking } from "@/lib/marketing/service";

const BATCH_SIZE = 50; // Reduced for dev reliability
const MAX_RETRIES = 3;

export async function POST() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    // 1. Global Kill Switch Check
    const globalPause = await prisma.siteSetting.findUnique({
      where: { key: "global_marketing_pause" }
    });
    if (globalPause?.value === "true") {
      return NextResponse.json({ message: "Global marketing is paused" }, { status: 200 });
    }

    // 2. Fetch PENDING or RETRYING recipients
    const recipients = await prisma.campaignRecipient.findMany({
      where: {
        status: { in: ["PENDING", "RETRYING"] as const },
        campaign: { status: "SENDING" }
      },
      take: BATCH_SIZE,
      include: { campaign: true }
    });

    if (recipients.length === 0) {
      return NextResponse.json({ message: "No pending recipients", sent: 0, failed: 0 });
    }

    // 3. Mark as SENDING (Locking)
    const recipientIds = recipients.map(r => r.id);
    await prisma.campaignRecipient.updateMany({
      where: { id: { in: recipientIds } },
      data: { status: "SENDING" as const }
    });

    const { primary, secondary } = getTransporters();
    let sentCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
      // Re-check global kill switch every 5 sends
      if (sentCount % 5 === 0) {
        const checkPause = await prisma.siteSetting.findUnique({
          where: { key: "global_marketing_pause" }
        });
        if (checkPause?.value === "true") break;
      }

      try {
        // Render per-recipient variables
        let personalizedHtml = renderTemplate(recipient.campaign.snapshotHtml || "", {
          "email": recipient.email,
        });

        // Inject link and open tracking
        personalizedHtml = injectTracking(personalizedHtml, recipient.token, baseUrl);

        const mailOptions = {
          from: `"Richse Official" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
          to: recipient.email,
          subject: recipient.campaign.subject,
          html: personalizedHtml
        };

        let deliverySuccess = false;
        try {
          await primary.sendMail(mailOptions);
          deliverySuccess = true;
        } catch {
          console.warn(`Primary failed for ${recipient.email}, trying secondary...`);
          await secondary.sendMail(mailOptions);
          deliverySuccess = true;
        }

        if (deliverySuccess) {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { 
              status: "SENT" as const, 
              sentAt: new Date() 
            }
          });
          
          await prisma.marketingCampaign.update({
            where: { id: recipient.campaignId },
            data: { sentCount: { increment: 1 } }
          });
          sentCount++;
        }
      } catch (err: unknown) {
        const mailErr = err as { responseCode?: number; message?: string };
        const isHardError = mailErr.responseCode === 550 || mailErr.responseCode === 553 || mailErr.message?.includes("not exist");
        
        if (isHardError || recipient.retryCount >= MAX_RETRIES) {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { status: "DROPPED" as const, lastError: mailErr.message }
          });
          
          if (isHardError) {
            await prisma.unsubscribedEmail.upsert({
              where: { email: recipient.email },
              create: { email: recipient.email, reason: "HARD_BOUNCE" },
              update: {}
            });
          }
        } else {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: { 
              status: "RETRYING" as const, 
              retryCount: { increment: 1 },
              lastError: mailErr.message
            }
          });
        }
        failCount++;
      }
    }

    return NextResponse.json({ sent: sentCount, failed: failCount });
  } catch (error: unknown) {
    console.error("Worker Global Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
