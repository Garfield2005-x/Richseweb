import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "affiliate@richse.com";
  const password = "Affiliate@Richse25"; // <-- เปลี่ยนรหัสผ่านได้ที่นี่
  const name = "Affiliate Manager";

  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role: "AFFILIATE", name },
    });
    console.log("✅ อัปเดตแล้ว:", email);
    console.log("   Role: AFFILIATE");
    console.log("   🔑 Password:", password);
    return;
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "AFFILIATE",
    },
  });

  console.log("✅ สร้าง Affiliate user สำเร็จ!");
  console.log("   📧 Email:   ", email);
  console.log("   🔑 Password:", password);
  console.log("   🛡️  Role:    AFFILIATE");
  console.log("   🔗 เข้าได้แค่: /admin/affiliate");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
