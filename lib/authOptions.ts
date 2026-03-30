import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { UAParser } from "ua-parser-js";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";

interface ExtendedUser extends User {
  role?: string;
}

interface ExtendedJWT extends JWT {
  id?: string;
  role?: string;
}

export const authOptions: NextAuthOptions = {
  
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            password: true,
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        // Return only essential fields to prevent session cookie overflow (HTTP 431)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          // Only return image if it's a URL, not a large Base64 string
          image: user.image && !user.image.startsWith("data:") ? user.image : null
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user }) {
      try {
        if (!user?.email) return true;

        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) return true;

        const headerList = await headers() 

const userAgent = headerList.get("user-agent") ?? "Unknown"
const forwarded = headerList.get("x-forwarded-for") || ""

const ip = forwarded ? forwarded.split(",")[0]?.trim() : "Unknown"
        

        const parser = new UAParser(userAgent);

        const device = parser.getDevice().model || "Desktop";
        const browser = parser.getBrowser().name || "Unknown";
        const os = parser.getOS().name || "Unknown";

        let location = "Unknown";

        try {
          const geo = await fetch(`https://ipapi.co/${ip}/json/`);
          const geoData = await geo.json();
          location = `${geoData.city || "Unknown"}, ${geoData.country_name || ""}`;
        } catch {}

        const existingDevice = await prisma.loginDevice.findFirst({
          where: {
            userId: dbUser.id,
            device,
            browser,
            os,
          },
        });

        if (!existingDevice) {
          await prisma.loginDevice.create({
            data: {
              userId: dbUser.id,
              ip,
              device,
              browser,
              os,
            },
          });

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER!,
              pass: process.env.EMAIL_PASS!,
            },
          });

          await transporter.sendMail({
            from: `"Richse Official" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "⚠️ New Login Detected",
            html: `
              <!-- Header --> <tr> <td align="center" style="background:#c9a1aa;padding:30px;"> 
              <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:2px;"> RICHSE </h1> 
              <p style="color:#f5e9ec;margin:8px 0 0 0;font-size:13px;"> Security Notification </p> 
              </td> 
              </tr> 
              <!-- Content -->
               <tr> 
               <td style="padding:40px 35px;color:#333;line-height:1.7;"> 
               <h2 style="margin-top:0;color:#c9a1aa;"> ⚠️ New Login Detected </h2>
                <p> เราตรวจพบการเข้าสู่ระบบใหม่ในบัญชี <strong>RICHSE</strong> ของคุณ หากนี่เป็นคุณ คุณไม่จำเป็นต้องดำเนินการใด ๆ </p>
                 <!-- Login Info Card -->
                  <div style="margin:30px 0;padding:25px;background:#f6eef1;border-radius:12px;">
                   <table width="100%" style="font-size:14px;color:#444;"> 
                   <tr>
                    <td style="padding:6px 0;"><strong>📱 Device</strong>
                    </td> <td style="text-align:right;">${device}</td> 
                    </tr>
                     <tr> 
                     <td style="padding:6px 0;"><strong>🌐 Browser</strong>
                     </td> 
                     <td style="text-align:right;">${browser}</td>
                      </tr> 
                      <tr> 
                      <td style="padding:6px 0;"><strong>💻 OS</strong>
                      </td>
                       <td style="text-align:right;">${os}</td> 
                       </tr> 
                       <tr> 
                       <td style="padding:6px 0;"><strong>📍 IP Address</strong></td>
                        <td style="text-align:right;">${ip}</td>
                         </tr>
                          <tr> 
                          <td style="padding:6px 0;"><strong>🌏 Location</strong></td>
                          <td style="text-align:right;">${location}</td>
                           </tr> 
                           <tr> 
                           <td style="padding:6px 0;"><strong>⏰ Time</strong></td>
                            <td style="text-align:right;">${new Date().toLocaleString()}</td> 
                            </tr> 
                            </table>
                             </div> 
                             <p style="font-size:14px;color:#666;"> 
                             หากนี่ไม่ใช่คุณ กรุณาติดต่อทีมงานของเราทันทีเพื่อความปลอดภัยของบัญชี 
                             </p>
                              <!-- Button --> 
                              <div style="text-align:center;margin:35px 0;"> 
                              <a href="https://www.richseofficial.com" style="background:#c9a1aa;color:#ffffff;text-decoration:none; padding:14px 32px;border-radius:30px; font-weight:bold;font-size:14px;display:inline-block;"> 
                              Visit Richse 
                              </a> 
                              </div>
                               </td> 
                               </tr> 
                               <!-- Footer -->
                                <tr> 
                                <td align="center" style="background:#fafafa;padding:20px;font-size:12px;color:#999;"> © ${new Date().getFullYear()} Richse Official. All rights reserved. 
                                </td>
                                 </tr> 
                                 </table>
                                  </td> 
                                  </tr>
            `,
          });
        }

        return true;
      } catch (error) {
        console.error("LOGIN SECURITY ERROR:", error);
        return true;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        const extUser = user as ExtendedUser;
        (token as ExtendedJWT).id = extUser.id;
        (token as ExtendedJWT).role = extUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const extToken = token as ExtendedJWT;
        (session.user as ExtendedUser).id = extToken.id ?? '';
        (session.user as ExtendedUser).role = extToken.role;
      }
      return session;
    }
  },

  events: {
    async createUser({ user }) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER!,
            pass: process.env.EMAIL_PASS!,
          },
        });

        await transporter.sendMail({
          from: `"Richse Official" <${process.env.EMAIL_USER}>`,
          to: user.email!,
          subject: "🎉 Welcome to Richse Official",
          html: `<div style="margin:0;padding:0;background-color:#f8f6f4;font-family:Arial,Helvetica,sans-serif;">
         <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
              <tr>
                <td align="center">
                 <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">
                    
                     <tr>
                       <td align="center" style="background:#c3a2ab;padding:30px;">
                                                <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:1px;">
                          Welcome to Richse Official ✨
                         </h1>
                       </td>
                     </tr>

                     <tr>
                      <td style="padding:40px 30px;color:#333333;line-height:1.8;">
                         <h2 style="margin-top:0;">ยินดีต้อนรับคุณ ${user.name || ""} 🤍</h2>
                         
                         <p>
                           การเข้าสู่ระบบของคุณเสร็จสมบูรณ์แล้ว  
                           เรารู้สึกยินดีอย่างยิ่งที่คุณเป็นส่วนหนึ่งของครอบครัว 
                           <strong>Richse Official</strong>
                         </p>

                        <h3 style="margin-bottom:10px;">🎁 Welcome Gift สำหรับคุณ</h3>

                         <div style="margin:25px 0;padding:20px;background:#f3ecef;border-radius:12px;text-align:center;">
                           <span style="font-size:26px;font-weight:bold;color:#c3a2ab;letter-spacing:2px;">
                             RICHSE10
                           </span>
                           <p style="margin:10px 0 0 0;font-size:14px;color:#666;">
                             รับส่วนลด 10% สำหรับคำสั่งซื้อแรกของคุณ
                          </p>
                         </div>

                        <div style="text-align:center;margin:30px 0;">
                           <a href="https://www.richseofficial.com"
                              style="background:#c3a2ab;color:#ffffff;text-decoration:none;
                                     padding:14px 28px;border-radius:30px;font-weight:bold;
                                     display:inline-block;">
                             เลือกชมสินค้าเลย
                           </a>
                         </div>

                         <hr style="border:none;border-top:1px solid #eee;margin:40px 0;">

                         <p style="font-size:14px;color:#777;">
                           หากนี่ไม่ใช่คุณที่ทำการเข้าสู่ระบบ กรุณาติดต่อทีมงานทันที
                         </p>

                         <p style="font-size:13px;color:#aaa;">
                           Login Time: ${new Date().toLocaleString()}
                         </p>
                         <hr style="border:none;border-top:1px solid #eee;margin:35px 0;">

                       </td>
                     </tr>

                     <tr>
                       <td align="center" style="background:#fafafa;padding:20px;font-size:12px;color:#999;">
                         © ${new Date().getFullYear()} Richse Official. All rights reserved.
                       </td>
                     </tr>

                   </table>
                 </td>
               </tr>
             </table>
           </div>`,
        });
      } catch (err) {
        console.error("WELCOME EMAIL ERROR:", err);
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
};
