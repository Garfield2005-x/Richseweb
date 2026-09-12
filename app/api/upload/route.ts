import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { put } from "@vercel/blob";

const MAX_SIZE_MB = 10;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง (Session Expired)" }, { status: 401 });
    }
    const userId = (session.user as { id?: string })?.id || "user";

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
      "image/jpg":  "jpg",
      "image/png":  "png",
      "image/webp": "webp",
      "image/gif":  "gif",
      "image/heic": "jpg",
      "image/heif": "jpg",
      "image/avif": "jpg",
    };

    if (!(file.type in mimeToExt)) {
      return NextResponse.json(
        { error: `ไม่รองรับไฟล์ประเภท ${file.type} กรุณาใช้ไฟล์รูปภาพ` },
        { status: 400 }
      );
    }

    const ext = mimeToExt[file.type] ?? "jpg";
    const filename = `expenses/${userId}_${Date.now()}.${ext}`;

    try {
      const blob = await put(filename, file, {
        access: "public",
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return NextResponse.json({ url: blob.url });
    } catch (blobError: unknown) {
      console.error("Vercel Blob Storage Error:", blobError);
      const errorMessage = blobError instanceof Error ? blobError.message : "Unknown error";
      return NextResponse.json(
        { error: "ระบบ Storage มีปัญหา: " + errorMessage },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    console.error("Upload API Error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด: " + errorMessage }, { status: 500 });
  }
}
