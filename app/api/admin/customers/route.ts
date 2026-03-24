import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    
    // Disable in DEMO mode if needed, but for real app:
    // const session = await getServerSession();
    // if (!session || !session.user?.email) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    // const currentUser = await prisma.user.findUnique({
    //   where: { email: session.user.email },
    // });

    // if (currentUser?.role !== "ADMIN") {
    //   return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    // }

    const customers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        province: true,
        district: true,
        subdistrict: true,
        postal_code: true,
        points: true,
        image: true
      },
      orderBy: {
        role: "asc" // Admins first
      }
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
