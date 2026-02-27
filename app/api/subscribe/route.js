import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);

  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return `RICHSE-${result}`;
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ message: "กรุณากรอกอีเมล" }, { status: 400 });
    }

    // เช็ค email ซ้ำก่อน
    const existingEmail = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return Response.json(
        { message: "Email นี้เคยสมัครแล้ว 💌" },
        { status: 400 }
      );
    }

    // 🔥 สร้าง subscriber พร้อม retry กัน code ซ้ำ
    let subscriber;
    let attempts = 0;

    while (!subscriber && attempts < 5) {
      try {
        const discountCode = generateCode();

        subscriber = await prisma.subscriber.create({
          data: {
            email,
            discountCode,
          },
        });
      } catch (err) {
        // ถ้า code ซ้ำ จะเข้า catch
        attempts++;
        if (attempts >= 5) {
          throw new Error("Failed to generate unique discount code");
        }
      }
    }

    console.log("Created subscriber:", subscriber);

    // 🔐 เช็ค env ก่อนส่งเมล
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email environment variables not set");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Richse Official" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 ยินดีต้อนรับสู่ Richse Official – รับส่วนลดพิเศษทันที!",
      html: `
        <h2>ขอบคุณที่สมัคร 💌</h2>
        <p>นี่คือโค้ดส่วนลดของคุณ:</p>
        <h1>${subscriber.discountCode}</h1>
        <p>รับส่วนลด 10% สำหรับคำสั่งซื้อแรกของคุณ</p>
      `,
    });

    console.log("Email sent to:", email);

    return Response.json({ success: true });

  } catch (err) {
    console.error("ERROR:", err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}