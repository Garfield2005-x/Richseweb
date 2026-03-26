import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    // Convert array to record for easier frontend usage
    const settingsMap = settings.reduce((acc: Record<string, string>, current: { key: string; value: string }) => {
      acc[current.key] = current.value;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: typeof value === "string" ? value : JSON.stringify(value) },
      create: { 
        key, 
        value: typeof value === "string" ? value : JSON.stringify(value) 
      },
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error updating site setting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
