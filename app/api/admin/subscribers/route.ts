import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Enable for auth check in production
    // const session = await getServerSession();
    // if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" }
    });

    // We want to know if these subscribers have actually created an account
    const users = await prisma.user.findMany({
      where: { 
        email: { in: subscribers.map(s => s.email) } 
      },
      select: { email: true }
    });
    
    // Create a Set for fast lookup
    const registeredEmails = new Set(users.map(u => u.email));

    const enrichedSubscribers = subscribers.map(sub => ({
      id: sub.id,
      email: sub.email,
      createdAt: sub.createdAt,
      isRegistered: registeredEmails.has(sub.email) // Did they convert to a real User?
    }));

    return NextResponse.json(enrichedSubscribers);
  } catch (error: unknown) {
    console.error("Fetch Subscribers Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 });

    await prisma.subscriber.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Subscriber removed securely" });
  } catch (error: unknown) {
    console.error("Delete Subscriber Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
