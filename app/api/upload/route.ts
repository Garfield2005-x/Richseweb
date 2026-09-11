import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const MAX_SIZE_MB = 10;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as { id?: string })?.id || 'user';

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์ที่ส่งมา" }, { status: 400 });
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      return NextResponse.json(
        { error: `รูปมีขนาดใหญ่เกินไป (${sizeMB.toFixed(2)}MB) จำกัดไม่เกิน ${MAX_SIZE_MB}MB` },
        { status: 413 }
      );
    }

    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/heic": "jpg",
      "image/heif": "jpg",
      "image/avif": "jpg",
    };

    const ext = mimeToExt[file.type] || "jpg";
    const filename = `expenses/${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

    // 1. พยายามอัปโหลดไปที่ Vercel Blob (ถ้ามี Token)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      try {
        const blob = await put(filename, file, {
          access: "public",
          contentType: file.type || "image/jpeg",
          token: blobToken,
        });
        return NextResponse.json({ url: blob.url });
      } catch (blobErr) {
        console.warn("Vercel Blob upload failed, falling back to local filesystem:", blobErr);
      }
    }

    // 2. Fallback สำรอง: บันทึกลง public/uploads/expenses/
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = join(process.cwd(), "public", "uploads", "expenses");
      await mkdir(uploadDir, { recursive: true });

      const localFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const localFilePath = join(uploadDir, localFileName);
      await writeFile(localFilePath, buffer);

      return NextResponse.json({ url: `/uploads/expenses/${localFileName}` });
    } catch (localErr) {
      console.error("Local storage error:", localErr);
      return NextResponse.json(
        { error: "ไม่สามารถบันทึกไฟล์ได้ กรุณาลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    console.error("Upload API Error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด: " + errorMessage }, { status: 500 });
  }
}
