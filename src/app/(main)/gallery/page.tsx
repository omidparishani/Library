import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

async function getAllImages() {
  try {
    const images = await prisma.image.findMany({
      include: {
        book: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return images;
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const images = await getAllImages();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-800">🖼️ گالری عکس‌ها</h1>

      {images.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">📷</div>
          <p className="text-gray-500">هنوز عکسی آپلود نشده</p>
          <Link href="/books/new" className="btn-primary mt-4 inline-block">
            اولین کتاب رو با عکس ثبت کن
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img) => (
            <Link
              key={img.id}
              href={`/books/${img.book.id}`}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <Image
                src={img.url}
                alt={img.book.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-white text-sm font-medium line-clamp-2">
                  {img.book.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
