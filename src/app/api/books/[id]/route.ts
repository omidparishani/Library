import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getWeekInfo } from "@/lib/utils";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().optional().nullable(),
  borrowedAt: z.string().optional(),
  returnedAt: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isRead: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!book) {
      return NextResponse.json({ error: "کتاب پیدا نشد" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updateData: any = { ...data };
    if (data.borrowedAt) {
      const date = new Date(data.borrowedAt);
      const { weekNumber, year } = getWeekInfo(date);
      updateData.borrowedAt = date;
      updateData.weekNumber = weekNumber;
      updateData.year = year;
    }
    if (data.returnedAt !== undefined) {
      updateData.returnedAt = data.returnedAt ? new Date(data.returnedAt) : null;
    }

    const book = await prisma.book.update({
      where: { id },
      data: updateData,
      include: { images: true },
    });

    return NextResponse.json(book);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "خطا در به‌روزرسانی" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.book.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطا در حذف" }, { status: 500 });
  }
}
