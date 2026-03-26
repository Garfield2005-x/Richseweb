import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  props: { params: Promise<{ key: string }> }
) {
  const params = await props.params;
  const { key } = params;

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 });
    }

    // Attempt to parse JSON if possible, otherwise return as string
    let value = setting.value;
    try {
      value = JSON.parse(setting.value);
    } catch {
      // Not JSON, stay as string
    }

    return NextResponse.json({ key: setting.key, value });
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
