import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    const customer = await prisma.user.findUnique({
      where: { id: id },
      include: {
        orders: {
          include: {
            order_items: true
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        wishlist: {
          include: {
            product: true
          },
          orderBy: {
            createdAt: "desc"
          }
        },
        loginDevices: {
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    // Standardize object payload 
    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      role: customer.role,
      address: customer.address,
      province: customer.province,
      district: customer.district,
      subdistrict: customer.subdistrict,
      postal_code: customer.postal_code,
      points: customer.points,
      image: customer.image,
      orders: customer.orders,
      wishlist: customer.wishlist,
      loginDevices: customer.loginDevices,
      createdAt: customer.emailVerified // A proxy for creation date since base User doesn't have it natively unless using next-auth custom adapters
    });

  } catch (error) {
    console.error("Customer GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
