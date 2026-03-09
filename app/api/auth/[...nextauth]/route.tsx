import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { UAParser } from "ua-parser-js";
import { headers } from "next/headers";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

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
const forwarded = headerList.get("x-forwarded-for")

const ip = forwarded?.split(",")[0]?.trim() ?? "Unknown"
        

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
              <h2>New Login Detected</h2>
              <p>Device: ${device}</p>
              <p>Browser: ${browser}</p>
              <p>OS: ${os}</p>
              <p>IP: ${ip}</p>
              <p>Location: ${location}</p>
              <p>Time: ${new Date().toLocaleString()}</p>
            `,
          });
        }

        return true;
      } catch (error) {
        console.error("LOGIN SECURITY ERROR:", error);
        return true;
      }
    },
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
          html: `<h2>Welcome ${user.name || ""}</h2>
                 <p>Thank you for joining Richse Official</p>`,
        });
      } catch (err) {
        console.error("WELCOME EMAIL ERROR:", err);
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
});

export { handler as GET, handler as POST };
// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";
// import nodemailer from "nodemailer";
// import { UAParser } from "ua-parser-js";
// import { headers } from "next/headers";

// const handler = NextAuth({
//   adapter: PrismaAdapter(prisma),

//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],

//   callbacks: {
//     async signIn({ user }) {
//       try {

//         if (!user?.email) return true;

//         // ดึง user จริงจาก DB
//         const dbUser = await prisma.user.findUnique({
//           where: { email: user.email },
//         });

//         if (!dbUser) return true;

//         const headerList = headers();

//         const userAgent = headerList.get("user-agent") || "Unknown";
//         const forwarded = headerList.get("x-forwarded-for");
//         const ip = forwarded ? forwarded.split(",")[0] : "Unknown";

//         const parser = new UAParser(userAgent);

//         const device = parser.getDevice().model || "Desktop";
//         const browser = parser.getBrowser().name || "Unknown";
//         const os = parser.getOS().name || "Unknown";

//         // location
//         let location = "Unknown";

//         try {
//           const geo = await fetch(`https://ipapi.co/${ip}/json/`);
//           const geoData = await geo.json();
//           location = `${geoData.city || "Unknown"}, ${geoData.country_name || ""}`;
//         } catch {}

//         // ตรวจสอบ device เดิม
//         const existingDevice = await prisma.loginDevice.findFirst({
//           where: {
//             userId: dbUser.id,
//             device,
//             browser,
//             os,
//           },
//         });

//         if (!existingDevice) {

//           await prisma.loginDevice.create({
//             data: {
//               userId: dbUser.id,
//               ip,
//               device,
//               browser,
//               os,
//             },
//           });

//           // email transporter
//           const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//               user: process.env.EMAIL_USER,
//               pass: process.env.EMAIL_PASS,
//             },
//           });

//           await transporter.sendMail({
//             from: `"Richse Official" <${process.env.EMAIL_USER}>`,
//             to: user.email,
//             subject: "⚠️ New Login Detected",
//             html: `
//               <h2>New Login Detected</h2>
//               <p>Device: ${device}</p>
//               <p>Browser: ${browser}</p>
//               <p>OS: ${os}</p>
//               <p>IP: ${ip}</p>
//               <p>Location: ${location}</p>
//               <p>Time: ${new Date().toLocaleString()}</p>
//             `,
//           });

//         }

//         return true;

//       } catch (error) {

//         console.error("LOGIN SECURITY ERROR:", error);
//         return true;

//       }
//     },
//   },

//   events: {
//     async createUser({ user }) {

//       try {

//         const transporter = nodemailer.createTransport({
//           service: "gmail",
//           auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//           },
//         });

//         await transporter.sendMail({
//           from: `"Richse Official" <${process.env.EMAIL_USER}>`,
//           to: user.email,
//           subject: "🎉 Welcome to Richse Official",
//           html: `<div style="margin:0;padding:0;background-color:#f8f6f4;font-family:Arial,Helvetica,sans-serif;">
//             <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
//               <tr>
//                 <td align="center">
//                   <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.05);">
                    
//                     <tr>
//                       <td align="center" style="background:#c3a2ab;padding:30px;">
//                         <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:1px;">
//                           Welcome to Richse Official ✨
//                         </h1>
//                       </td>
//                     </tr>

//                     <tr>
//                       <td style="padding:40px 30px;color:#333333;line-height:1.8;">
//                         <h2 style="margin-top:0;">ยินดีต้อนรับคุณ ${user.name || ""} 🤍</h2>
                         
//                         <p>
//                           การเข้าสู่ระบบของคุณเสร็จสมบูรณ์แล้ว  
//                           เรารู้สึกยินดีอย่างยิ่งที่คุณเป็นส่วนหนึ่งของครอบครัว 
//                           <strong>Richse Official</strong>
//                         </p>

//                         <h3 style="margin-bottom:10px;">🎁 Welcome Gift สำหรับคุณ</h3>

//                         <div style="margin:25px 0;padding:20px;background:#f3ecef;border-radius:12px;text-align:center;">
//                           <span style="font-size:26px;font-weight:bold;color:#c3a2ab;letter-spacing:2px;">
//                             RICHSE10
//                           </span>
//                           <p style="margin:10px 0 0 0;font-size:14px;color:#666;">
//                             รับส่วนลด 10% สำหรับคำสั่งซื้อแรกของคุณ
//                           </p>
//                         </div>

//                         <div style="text-align:center;margin:30px 0;">
//                           <a href="https://www.richseofficial.com"
//                              style="background:#c3a2ab;color:#ffffff;text-decoration:none;
//                                     padding:14px 28px;border-radius:30px;font-weight:bold;
//                                     display:inline-block;">
//                             เลือกชมสินค้าเลย
//                           </a>
//                         </div>

//                         <hr style="border:none;border-top:1px solid #eee;margin:40px 0;">

//                         <p style="font-size:14px;color:#777;">
//                           หากนี่ไม่ใช่คุณที่ทำการเข้าสู่ระบบ กรุณาติดต่อทีมงานทันที
//                         </p>

//                         <p style="font-size:13px;color:#aaa;">
//                           Login Time: ${new Date().toLocaleString()}
//                         </p>
//                         <hr style="border:none;border-top:1px solid #eee;margin:35px 0;">

//               <h3>🔐 ข้อมูลการเข้าสู่ระบบ</h3>

//               <p>📱 Device: ${device}</p>
//               <p>🌐 Browser: ${browser}</p>
//               <p>💻 OS: ${os}</p>
//               <p>📍 IP Address: ${ip}</p>
//               <p>⏰ Time: ${new Date().toLocaleString()}</p>
//               <p>📍 Location: ${location}</p>

//               <p style="margin-top:30px;font-size:14px;color:#777;">
//                 หากนี่ไม่ใช่คุณที่ทำการเข้าสู่ระบบ กรุณาติดต่อทีมงานทันที
//               </p>
//                       </td>
//                     </tr>

//                     <tr>
//                       <td align="center" style="background:#fafafa;padding:20px;font-size:12px;color:#999;">
//                         © ${new Date().getFullYear()} Richse Official. All rights reserved.
//                       </td>
//                     </tr>

//                   </table>
//                 </td>
//               </tr>
//             </table>
//           </div>`,
//         });

//       } catch (err) {
//         console.error("WELCOME EMAIL ERROR:", err);
//       }

//     },
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// });

// export { handler as GET, handler as POST };