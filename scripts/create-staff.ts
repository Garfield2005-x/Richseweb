import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const staffList = [
  {
    name: "คุณจอย",
    email: "joy@richse-staff.com",
    password: "Joy@Richse25",
    note: "TikTok | ค่าคอม 3% | ไลฟ์ 04:00-10:00",
  },
  {
    name: "คุณโฟน",
    email: "fon@richse-staff.com",
    password: "Fon@Richse25",
    note: "TikTok | ค่าคอม 3% | ไลฟ์ 10:00-15:00",
  },
  {
    name: "คุณอี๊ด",
    email: "eed@richse-staff.com",
    password: "Eed@Richse25",
    note: "TikTok | ค่าคอม 5% | ไลฟ์ 15:00-18:30",
  },
  {
    name: "คุณเพียส",
    email: "pias@richse-staff.com",
    password: "Pias@Richse25",
    note: "TikTok+Shopee | ค่าคอม 5%/3% | ไลฟ์ 00:00-04:00 | เงินเดือน 13,000",
  },
  {
    name: "คุณกานต์",
    email: "karn@richse-staff.com",
    password: "Karn@Richse25",
    note: "Shopee | ค่าคอม 3% | ไลฟ์ 00:00-05:00",
  },
  {
    name: "คุณเครป",
    email: "krep@richse-staff.com",
    password: "Krep@Richse25",
    note: "TikTok | ค่าคอม 5% | ไลฟ์ 19:00-23:00",
  },
];

async function main() {
  console.log("🚀 สร้างบัญชีพนักงานไลฟ์...\n");

  for (const staff of staffList) {
    const hashedPassword = await bcrypt.hash(staff.password, 10);
    const existing = await prisma.user.findUnique({ where: { email: staff.email } });

    if (existing) {
      await prisma.user.update({
        where: { email: staff.email },
        data: { password: hashedPassword, role: "STAFF", name: staff.name },
      });
      console.log(`✅ อัปเดตแล้ว: ${staff.name} (${staff.email})`);
    } else {
      await prisma.user.create({
        data: {
          name: staff.name,
          email: staff.email,
          password: hashedPassword,
          role: "STAFF",
        },
      });
      console.log(`✅ สร้างใหม่: ${staff.name} (${staff.email})`);
    }

    console.log(`   📌 ${staff.note}`);
    console.log(`   🔑 Password: ${staff.password}\n`);
  }

  console.log("✨ เสร็จสิ้น! บัญชีพนักงานทั้งหมดพร้อมใช้งานแล้ว");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
