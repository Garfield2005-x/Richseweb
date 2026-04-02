import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET /api/admin/marketing/settings - Get global settings
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email: string; role: string } | null;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { startsWith: "marketing_" } }
    });
    
    // Add global pause if missing
    const globalPause = await prisma.siteSetting.findUnique({ where: { key: "global_marketing_pause" } });
    
    return NextResponse.json({
       global_marketing_pause: globalPause?.value === "true",
       config: settings.reduce((acc: Record<string, string>, s) => ({ ...acc, [s.key]: s.value }), {})
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/admin/marketing/settings - Update global settings
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { email: string; role: string } | null;
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, value } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) }
    });

    return NextResponse.json(setting);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
