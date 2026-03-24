import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth";

export async function GET() {
  try {
    // For GET products, we might not need admin auth if we want to reuse it, 
    // but this is /api/admin/products so let's auth it, or just use another route for public space
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // DEMO MODE
    // const session = await getServerSession();
    // if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    // if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, price, image, description, stock, isActive, flashSalePrice, flashSaleStart, flashSaleEnd } = body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        image,
        description,
        stock: Number(stock),
        isActive: Boolean(isActive),
        flashSalePrice: flashSalePrice && flashSalePrice !== "" ? Number(flashSalePrice) : null,
        flashSaleStart: flashSaleStart && flashSaleStart !== "" ? new Date(flashSaleStart) : null,
        flashSaleEnd: flashSaleEnd && flashSaleEnd !== "" ? new Date(flashSaleEnd) : null,
      },
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
