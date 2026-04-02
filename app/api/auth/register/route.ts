import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, campaignId } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        signupCampaignId: campaignId || null,
      },
    });

    // Mark as converted in the marketing system
    if (campaignId) {
       await prisma.$transaction([
          prisma.campaignRecipient.updateMany({
            where: { campaignId, email: email.toLowerCase() },
            data: { 
              status: "SENT" as const, // In case it wasn't marked sent yet
              convertedAt: new Date() 
            }
          }),
          prisma.marketingCampaign.update({
            where: { id: campaignId },
            data: { conversionCount: { increment: 1 } }
          })
       ]);
    }

    return NextResponse.json(
      { message: "User registered successfully", user: { id: newUser.id, name: newUser.name, email: newUser.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
