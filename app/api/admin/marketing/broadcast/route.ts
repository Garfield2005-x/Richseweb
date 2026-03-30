import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { subject, content, testEmail } = await req.json();

    if (!subject || !content) {
      return NextResponse.json({ error: "Missing subject or content" }, { status: 400 });
    }

    // Configure Nodemailer transporter using logic from next-auth/SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Check configuration
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
       return NextResponse.json({ 
           error: "SMTP Credentials are not configured in the server environment (.env)" 
       }, { status: 500 });
    }

    const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER;

    if (testEmail) {
      // Send single test email
      await transporter.sendMail({
        from: `"Richse Official" <${senderEmail}>`,
        to: testEmail,
        subject: `[TEST] ${subject}`,
        html: content,
      });

      return NextResponse.json({ success: true, count: 1, message: "Test email sent" });
    } else {
      // Broadcast to ALL users AND newsletter subscribers
      const [users, subscribers] = await Promise.all([
        prisma.user.findMany({ where: { email: { not: null } }, select: { email: true } }),
        prisma.subscriber.findMany({ select: { email: true } })
      ]);

      // Combine and deduplicate emails using a Set
      const allEmails = new Set([
        ...users.map(u => u.email).filter(Boolean),
        ...subscribers.map(s => s.email).filter(Boolean)
      ]);

      const finalEmailList = Array.from(allEmails);

      if (finalEmailList.length === 0) {
        return NextResponse.json({ error: "No users or subscribers with valid emails found" }, { status: 400 });
      }

      // We use BCC to send to all recipients efficiently without exposing their emails to each other
      const bccList = finalEmailList.join(", ");

      await transporter.sendMail({
        from: `"Richse Official" <${senderEmail}>`,
        to: senderEmail, // Primary recipient is the sender
        bcc: bccList,    // All customers are blind carbon copied
        subject: subject,
        html: content,
      });

      return NextResponse.json({ 
          success: true, 
          count: finalEmailList.length, 
          message: "Broadcast sent successfully" 
      });
    }
  } catch (error: any) {
    console.error("Broadcast Error:", error);
    return NextResponse.json({ error: error.message || "Failed to broadcast email" }, { status: 500 });
  }
}
