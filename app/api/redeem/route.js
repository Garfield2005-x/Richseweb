import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const { code } = await req.json();

  // 1️⃣ เช็ค Subscriber
  const subscriber = await prisma.subscriber.updateMany({
    where: {
      discountCode: code,
      used: false,
    },
    data: {
      used: true,
    },
  });

  if (subscriber.count > 0) {
    return Response.json({ success: true });
  }

  // 2️⃣ เช็ค User
  const user = await prisma.user.updateMany({
    where: {
      discountCode: code,
      discountUsed: false,
      discountExpiresAt: {
        gt: new Date(),
      },
    },
    data: {
      discountUsed: true,
    },
  });

  if (user.count > 0) {
    return Response.json({ success: true });
  }

  return Response.json(
    { error: "โค้ดไม่ถูกต้อง หรือ ถูกใช้แล้ว" },
    { status: 400 }
  );
}