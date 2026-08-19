import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeekInfo } from "@/lib/utils";
import { z } from "zod";

const bookSchema = z.object({
  title: z.string().min(1, "عنوان کتاب الزامی است"),
  author: z.string().optional().nullable(),
  borrowedAt: z.string().optional(),
  returnedAt: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isRead: z.boolean().default(false),
  rating: z.number().min(1).max(5).optional().nullable(),
  tags: z.array(z.string()).default([]),
  images: z
    .array(
      z.object({
        url: z.string(),
        publicId: z.string().optional().default(""),
      })
    )
    .default([]),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const isRead = searchParams.get("isRead");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const dueSoon = searchParams.get("dueSoon");

    const where: any = {};

    if (year) where.year = parseInt(year);
    if (isRead !== null && isRead !== undefined && isRead !== "") {
      where.isRead = isRead === "true";
    }
    if (tag) where.tags = { has: tag };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
      ];
    }
    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.borrowedAt = { gte: start, lte: end };
    }
    if (dueSoon === "true") {
      const now = new Date();
      const in3Days = new Date();
      in3Days.setDate(in3Days.getDate() + 3);
      where.dueDate = { gte: now, lte: in3Days };
      where.returnedAt = null;
    }

    const books = await prisma.book.findMany({
      where,
      include: { images: true },
      orderBy: { borrowedAt: "desc" },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطا در دریافت کتاب‌ها" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = bookSchema.parse(body);

    const date = data.borrowedAt ? new Date(data.borrowedAt) : new Date();
    const { weekNumber, year } = getWeekInfo(date);

    const book = await prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        borrowedAt: date,
        returnedAt: data.returnedAt ? new Date(data.returnedAt) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes,
        isRead: data.isRead,
        rating: data.rating,
        tags: data.tags,
        weekNumber,
        year,
        images: {
          create: data.images.map((img) => ({
            url: img.url,
            publicId: img.publicId || "",
          })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error: any) {
    console.error(error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "خطا در ثبت کتاب" }, { status: 500 });
  }
}
