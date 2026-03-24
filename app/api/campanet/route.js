import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, order } = body;

    if (!name || !phone || !order) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const campanetForm = await prisma.campanetForm.create({
      data: {
        name,
        phone,
        order,
      },
    });

    return NextResponse.json({ success: true, data: campanetForm }, { status: 201 });
  } catch (error) {
    console.error("Error saving Campanet form:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
