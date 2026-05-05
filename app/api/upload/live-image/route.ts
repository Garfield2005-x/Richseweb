import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { put } from "@vercel/blob";

// Vercel Serverless Function Limit is 4.5MB
// We set it to 4MB to be safe.
const MAX_SIZE_MB = 4;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    
    if (!userId) {
      console.error("Upload error: Unauthorized - No session found");
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง (Session Expired)" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์ที่ส่งมา" }, { status: 400 });
    }

    // Validate file size early (Vercel limit is 4.5MB)
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      return NextResponse.json(
        { error: `รูปมีขนาดใหญ่เกินไป (${sizeMB.toFixed(2)}MB) Vercel จำกัดไว้ไม่เกิน 4MB` },
        { status: 413 }
      );
    }

    // Validate MIME type
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
        { error: `ไม่รองรับไฟล์ประเภท ${file.type} กรุณาใช้ไฟล์รูปปกติ` },
        { status: 400 }
      );
    }

    const safeExt = mimeToExt[file.type] ?? "jpg";
    const filename = `live-sales/${userId}_${Date.now()}.${safeExt}`;

    try {
      const blob = await put(filename, file, {
        access: "private", 
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return NextResponse.json({ url: blob.url });
    } catch (blobError: unknown) {
      console.error("Vercel Blob Storage Error:", blobError);
      const errorMessage = blobError instanceof Error ? blobError.message : "Unknown Blob Error";
      return NextResponse.json({ 
        error: "ระบบ Storage มีปัญหา: " + errorMessage
      }, { status: 500 });
    }

  } catch (err: unknown) {
    console.error("Upload API Error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ: " + errorMessage }, { status: 500 });
  }
}
