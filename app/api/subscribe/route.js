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

async function generateUniqueCode() {
  while (true) {
    const code = generateCode();

    const existing = await prisma.subscriber.findUnique({
      where: { discountCode: code },
    });

    if (!existing) return code;
  }
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ message: "กรุณากรอกอีเมล" }, { status: 400 });
    }

    // เช็ค email ซ้ำ
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      return Response.json(
        { message: "Email นี้เคยสมัครแล้ว 💌" },
        { status: 400 }
      );
    }

    // สุ่มโค้ด
    const discountCode = await generateUniqueCode();

    // บันทึกลง DB
    await prisma.subscriber.create({
      data: {
        email,
        discountCode,
      },
    });

    // สร้าง transporter
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
  <div style="margin:0;padding:0;background-color:#f8f6f4;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background:#c3a2ab;padding:30px;">
                <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:1px;">
                  Welcome to Richse Official ✨
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 30px;color:#333333;line-height:1.8;">
                <h2 style="margin-top:0;">ขอบคุณที่สมัครรับข่าวสาร 💌</h2>

                <p>
                  เรารู้สึกยินดีเป็นอย่างยิ่งที่คุณเข้าร่วมเป็นส่วนหนึ่งของครอบครัว
                  <strong>Richse Official</strong> 🤍  
                  จากนี้ไปคุณจะไม่พลาดข่าวสาร คอลเลกชันใหม่ และสิทธิพิเศษเฉพาะสมาชิก
                </p>

                <h3 style="margin-bottom:10px;">🎁 ของขวัญต้อนรับสำหรับคุณ</h3>
                <p>
                  ใช้โค้ดส่วนลดด้านล่างสำหรับการสั่งซื้อครั้งแรกของคุณ
                </p>

                <span style="
  font-size:26px;
  font-weight:bold;
  color:#c3a2ab;
  letter-spacing:3px;
  background:#fff;
  padding:12px 20px;
  border-radius:8px;
  display:inline-block;
">
  ${discountCode}
</span>
                <p>
                  รีบใช้ก่อนหมดเขต และติดตามโปรโมชั่นพิเศษ Flash Sale,
                  Exclusive Drop และสิทธิ์ Early Access สำหรับสมาชิกเท่านั้น
                </p>

                <div style="text-align:center;margin:30px 0;">
                  <a href="https://richseofficial.com" 
                     style="background:#c3a2ab;color:#ffffff;text-decoration:none;
                            padding:14px 28px;border-radius:30px;font-weight:bold;
                            display:inline-block;">
                    เลือกชมสินค้าเลย
                  </a>
                </div>

                <hr style="border:none;border-top:1px solid #eee;margin:40px 0;">

                <p style="font-size:14px;color:#777;">
                  หากมีคำถามเกี่ยวกับสินค้า การสั่งซื้อ หรือโปรโมชั่น  
                  สามารถติดต่อทีมงานของเราได้ที่
                  <a href="mailto:info@richseofficial.com" style="color:#c3a2ab;">
                    info@richseofficial.com
                  </a>
                </p>

                <p style="font-size:13px;color:#aaa;">
                  คุณได้รับอีเมลฉบับนี้เนื่องจากได้สมัครรับข่าวสารผ่านเว็บไซต์ของเรา  
                  หากคุณไม่ได้ทำรายการนี้ สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background:#fafafa;padding:20px;font-size:12px;color:#999;">
                © ${new Date().getFullYear()} Richse Official. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
      `,
    });

     return Response.json({ success: true });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}