import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, order } = body;

    // Validate request body
    if (!name || !phone || !order) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Capture device/network context
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "unknown";
    
    // Extract IP address from various standard headers
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : (realIp || "unknown");

    // Create the DB record
    const record = await prisma.advancedTrackingLog.create({
      data: {
        name,
        phone,
        order,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error("[Advanced Tracking Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
