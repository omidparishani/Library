import { prisma } from "@/lib/prisma";
import StatsCards from "@/components/StatsCards";
import BookCard from "@/components/BookCard";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";

async function getStats() {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [totalBooks, readBooks, thisMonth, ratings] = await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { isRead: true } }),
      prisma.book.count({
        where: { borrowedAt: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.book.findMany({
        where: { rating: { not: null } },
        select: { rating: true },
      }),
    ]);

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, b) => sum + (b.rating || 0), 0) / ratings.length
        : 0;

    return { totalBooks, readBooks, thisMonth, avgRating };
  } catch {
    return { totalBooks: 0, readBooks: 0, thisMonth: 0, avgRating: 0 };
  }
}

async function getRecentBooks() {
  try {
    return await prisma.book.findMany({
      include: { images: true },
      orderBy: { borrowedAt: "desc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const stats = await getStats();
  const recentBooks = await getRecentBooks();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-6">
        <div className="inline-block animate-float text-6xl mb-3">📚✨</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-sky-700 mb-2">
          سلام به کتابخانه حسین!
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          اینجا تمام ماجراجویی‌های کتابخوانی حسین ثبت می‌شه تا سال‌ها بعد یادش بمونه 🌟
        </p>
      </section>

      {/* Stats */}
      <StatsCards {...stats} />

      {/* Quick Add */}
      <div className="flex justify-center">
        <Link href="/books/new" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
          <PlusCircle size={22} />
          ثبت کتاب‌های این هفته
        </Link>
      </div>

      {/* Recent Books */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">آخرین کتاب‌ها</h2>
          <Link href="/books" className="text-sky-600 text-sm font-medium hover:underline">
            مشاهده همه →
          </Link>
        </div>

        {recentBooks.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-3">📖</div>
            <p className="text-gray-500 mb-4">هنوز کتابی ثبت نشده!</p>
            <Link href="/books/new" className="btn-secondary inline-flex items-center gap-2">
              اولین کتاب رو اضافه کن
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBooks.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
