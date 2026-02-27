import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import nodemailer from "nodemailer";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generateCodeFromEmail(email) {
  const username = email.split("@")[0];

  const cleaned = username
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6);

  const hash = crypto
    .createHash("md5")
    .update(email)
    .digest("hex")
    .slice(0, 4)
    .toUpperCase();

  return `RICHSE-${cleaned}${hash}`;
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      try {
        console.log("🔥 SignIn callback triggered");

        if (!user?.email) {
          console.log("❌ No email found");
          return true;
        }

        // ดึง user ล่าสุดจาก DB
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          console.log("❌ User not found in DB");
          return true;
        }

        // ถ้ามีโค้ดแล้ว = ไม่ต้องสร้างใหม่
        if (dbUser.discountCode) {
          console.log("ℹ️ User already has discount code");
          return true;
        }

        // 🔥 สร้างโค้ด
        const code = generateCodeFromEmail(user.email);

        console.log("Generated Code:", code);

        // อัปเดต user
        await prisma.user.update({
          where: { email: user.email },
          data: {
            discountCode: code,
            discountExpiresAt: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
          },
        });

        console.log("✅ Discount code saved to DB");

        // 🔐 เช็ค env
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          throw new Error("Email environment variables missing");
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
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

                <div style="margin:25px 0;padding:20px;background:#f3ecef;border-radius:12px;text-align:center;">
  <span style="font-size:26px;font-weight:bold;color:#c3a2ab;letter-spacing:2px;">
    ${discountCode}
  </span>
  <p style="margin:10px 0 0 0;font-size:14px;color:#666;">
    รับส่วนลด 10% สำหรับคำสั่งซื้อแรกของคุณ
  </p>
</div>
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

   console.log("📧 Email sent successfully");

        return true;
      } catch (error) {
        console.error("🚨 SignIn Error:", error);
        return true; // ไม่ block login
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };