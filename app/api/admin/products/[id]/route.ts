import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // DEMO MODE
    // const session = await getServerSession();
    // if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    // if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, price, image, description, stock, isActive, flashSalePrice, flashSaleStart, flashSaleEnd } = body;

    const { id } = await context.params;

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
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

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // DEMO MODE
    // const session = await getServerSession();
    // if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    // if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await context.params;

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
