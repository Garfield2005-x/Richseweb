import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

/**
 * POST /api/admin/abandoned/nudge
 * Body: { logId: string }
 */
export async function POST(req: Request) {
  try {
    const { logId } = await req.json();

    if (!logId) {
      return NextResponse.json({ error: "Missing log ID" }, { status: 400 });
    }

    // 1. Fetch the log and settings
    const [log, settings] = await Promise.all([
      prisma.advancedTrackingLog.findUnique({ where: { id: logId } }),
      prisma.siteSetting.findMany({
        where: {
          key: { in: ["auto_abandoned_recovery_msg", "auto_abandoned_recovery_delay"] }
        }
      })
    ]);

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
    const template = settingsMap["auto_abandoned_recovery_msg"] || "Hi {{name}}, we noticed you left something in your cart! Continue here: {{link}}";
    
    // 2. Prepare message
    const checkoutLink = `${new URL(req.url).origin}/Checkout`;
    const message = template
      .replace(/{{name}}/g, log.name)
      .replace(/{{link}}/g, checkoutLink);

    // 3. Try to find user email for recovery
    const user = await prisma.user.findFirst({
      where: { phone: log.phone, email: { not: null } },
      select: { email: true }
    });

    let emailSent = false;
    if (user?.email && process.env.EMAIL_SERVER_USER) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
          port: Number(process.env.EMAIL_SERVER_PORT) || 587,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: `"Richse Official" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER}>`,
          to: user.email,
          subject: "Exclusive Offer for You! ✨",
          html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Hello ${log.name},</h2>
            <p>${message.replace(checkoutLink, `<a href="${checkoutLink}">${checkoutLink}</a>`)}</p>
            <hr />
            <p style="font-size: 12px; color: #999;">Richse Official - Premium Beauty Care</p>
          </div>`,
        });
        emailSent = true;
      } catch (err) {
        console.error("Failed to send recovery email:", err);
      }
    }

    // 4. Notify Admin via LINE
    if (process.env.LINE_CHANNEL_ACCESS_TOKEN) {
      const adminMsg = `⚡ [GOD-TIER RECOVERY]\n\nAdmin nudged ${log.name} (${log.phone})\n\nMessage: ${message}\n\n${emailSent ? "✅ Email Sent" : "❌ Email Not Sent (No email found)"}`;
      
      fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: "C0b778d20a6877e76023a328f9485b564",
          messages: [{ type: "text", text: adminMsg }],
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ 
      success: true, 
      method: emailSent ? "EMAIL" : "LOGGED",
      message: "Nudge processed successfully" 
    });

  } catch (error) {
    console.error("Nudge API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
