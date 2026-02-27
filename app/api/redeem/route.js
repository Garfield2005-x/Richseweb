export async function POST(req) {
  try {
    const { code } = await req.json();

    const result = await prisma.subscriber.updateMany({
      where: {
        discountCode: code,
        used: false,   // 👈 เงื่อนไขสำคัญ
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    if (result.count === 0) {
      return Response.json(
        { error: "โค้ดไม่ถูกต้อง หรือ ถูกใช้ไปแล้ว" },
        { status: 400 }
      );
    }

    return Response.json({ success: true });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}