import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const MAX_SIZE_MB = 10;
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "live-sales");

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type — รองรับ HEIC/HEIF (iPhone), AVIF (Android), image/jpg (บาง browser)
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/heic": "jpg",   // iPhone screenshot — แปลงเป็น jpg เพื่อให้ browser เปิดได้
      "image/heif": "jpg",   // HEIF variant
      "image/avif": "jpg",   // Android modern screenshot
    };
    if (!(file.type in mimeToExt)) {
      return NextResponse.json(
        { error: "ไฟล์รูปไม่รองรับ กรุณาส่งเป็น JPG, PNG, WEBP หรือ GIF" },
        { status: 400 }
      );
    }

    // Validate file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      return NextResponse.json(
        { error: `File must be under ${MAX_SIZE_MB}MB` },
        { status: 400 }
      );
    }

    // Build a safe filename — ใช้ extension จาก MIME type ไม่ใช่จากชื่อไฟล์ (มือถืออาจไม่มี extension)
    const safeExt = mimeToExt[file.type] ?? "jpg";
    const filename = `${userId}_${Date.now()}.${safeExt}`;

    // Ensure the upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(UPLOAD_DIR, filename), buffer);

    // Return a public URL (served by Next.js static file handling)
    return NextResponse.json({ url: `/uploads/live-sales/${filename}` });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
