/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';

// Helper: fetch รูป URL → base64
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const headers: Record<string, string> = {};
    if (process.env.BLOB_READ_WRITE_TOKEN && url.includes('vercel-storage.com')) {
      headers['Authorization'] = `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`;
    }
    const res = await fetch(url, { headers, cache: 'no-store' });
    if (!res.ok) {
      console.error(`Failed to fetch image from ${url}: ${res.status} ${res.statusText}`);
      return null;
    }
    const buf = await res.arrayBuffer();
    return Buffer.from(buf).toString('base64');
  } catch (e) {
    console.error(`Error fetching image ${url}:`, e);
    return null;
  }
}

// GET /api/expense/[id]/docx
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const expense = await prisma.expenseRequest.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (dbUser.role !== 'ADMIN' && expense.userId !== dbUser.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // รับ imageUrls จาก query string (?img=url1&img=url2) หรือจาก DB (ถ้ามี)
  const queryImages = request.nextUrl.searchParams.getAll('img').filter(Boolean);
  const imageUrlsToUse = queryImages.length > 0 ? queryImages : (expense.imageUrls as string[]);

  // โหลด template
  const templatePath = join(process.cwd(), 'public', 'templates', 'expense_template.docx');
  let templateContent: Buffer;
  try {
    templateContent = readFileSync(templatePath);
  } catch {
    return NextResponse.json({ error: 'Template file not found on server' }, { status: 500 });
  }

  // ดึงรูปภาพเป็น base64
  const imageData: string[] = [];
  for (const url of imageUrlsToUse) {
    const b64 = await fetchImageAsBase64(url);
    if (b64) imageData.push(b64);
  }

  // เตรียม items
  const items = (expense.items as any[]).map((item: any, index: number) => ({
    no: String(index + 1),
    description: item.description || '',
    purpose: item.purpose || '',
    amount: Number(item.amount || 0).toLocaleString('th-TH'),
    note: item.note || '',
  }));

  // วันที่ภาษาไทย
  const thaiDate = new Date(expense.date).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Bangkok',
  });

  const templateData = {
    date: thaiDate,
    employeeName: expense.employeeName,
    position: expense.position,
    accountNumber: expense.accountNumber,
    bankName: expense.bankName,
    items,
    totalAmount: expense.totalAmount.toLocaleString('th-TH'),
    images: imageData.map((b64) => ({ image: b64 })),
  };

  // Generate docx
  const zip = new PizZip(templateContent);
  const imageModule = new ImageModule({
    centered: true,
    getImage: (tagValue: string) => Buffer.from(tagValue, 'base64'),
    getSize: () => [350, 480],
  });
  const doc = new Docxtemplater(zip, {
    modules: [imageModule],
    paragraphLoop: true,
    linebreaks: true,
  });
  doc.render(templateData);

  const outputBuffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  const safeAsciiName = `expense_${id.slice(-6)}.docx`;
  const encodedFilename = encodeURIComponent(
    `expense_${expense.employeeName.replace(/\s+/g, '_')}_${id.slice(-6)}.docx`
  );

  return new NextResponse(new Uint8Array(outputBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeAsciiName}"; filename*=UTF-8''${encodedFilename}`,
    },
  });
}
