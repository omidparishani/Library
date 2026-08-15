import { prisma } from "@/lib/prisma";
import StatsCards from "@/components/StatsCards";
import { startOfMonth, endOfMonth } from "date-fns";

async function getDetailedStats() {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [totalBooks, readBooks, thisMonth, allBooks, ratings] = await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { isRead: true } }),
      prisma.book.count({
        where: { borrowedAt: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.book.findMany({
        select: {
          year: true,
          weekNumber: true,
          borrowedAt: true,
          rating: true,
          tags: true,
          isRead: true,
        },
        orderBy: { borrowedAt: "desc" },
      }),
      prisma.book.findMany({
        where: { rating: { not: null } },
        select: { rating: true },
      }),
    ]);

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((s, b) => s + (b.rating || 0), 0) / ratings.length
        : 0;

    const byYear: Record<number, number> = {};
    allBooks.forEach((b) => {
      byYear[b.year] = (byYear[b.year] || 0) + 1;
    });

    const tagCounts: Record<string, number> = {};
    allBooks.forEach((b) => {
      b.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    const currentYear = now.getFullYear();
    const monthly: Record<number, number> = {};
    allBooks
      .filter((b) => b.year === currentYear)
      .forEach((b) => {
        const m = new Date(b.borrowedAt).getMonth() + 1;
        monthly[m] = (monthly[m] || 0) + 1;
      });

    return {
      totalBooks,
      readBooks,
      thisMonth,
      avgRating,
      byYear,
      tagCounts,
      monthly,
      currentYear,
    };
  } catch {
    return {
      totalBooks: 0,
      readBooks: 0,
      thisMonth: 0,
      avgRating: 0,
      byYear: {},
      tagCounts: {},
      monthly: {},
      currentYear: new Date().getFullYear(),
    };
  }
}

const monthNames = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export default async function StatsPage() {
  const stats = await getDetailedStats();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-gray-800">📊 آمار و تاریخچه</h1>

      <StatsCards
        totalBooks={stats.totalBooks}
        readBooks={stats.readBooks}
        thisMonth={stats.thisMonth}
        avgRating={stats.avgRating}
      />

      <section className="card">
        <h2 className="text-lg font-bold mb-4">📅 تعداد کتاب در هر سال</h2>
        {Object.keys(stats.byYear).length === 0 ? (
          <p className="text-gray-400 text-center py-6">هنوز داده‌ای نیست</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(stats.byYear)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([year, count]) => (
                <div key={year} className="flex items-center gap-3">
                  <span className="w-16 font-bold text-sky-700">{year}</span>
                  <div className="flex-1 bg-sky-100 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-blue-500 h-full rounded-full flex items-center justify-end px-3 text-white text-sm font-bold"
                      style={{
                        width: `${Math.min(
                          100,
                          (count / Math.max(...Object.values(stats.byYear), 1)) * 100
                        )}%`,
                        minWidth: "40px",
                      }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="text-lg font-bold mb-4">
          📆 کتاب‌های سال {stats.currentYear}
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <div
              key={m}
              className="bg-gradient-to-br from-pink-50 to-sky-50 rounded-2xl p-3 text-center border border-white"
            >
              <p className="text-xs text-gray-500 mb-1">{monthNames[m - 1]}</p>
              <p className="text-xl font-extrabold text-sky-600">
                {stats.monthly[m] || 0}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold mb-4">🏷️ محبوب‌ترین برچسب‌ها</h2>
        {Object.keys(stats.tagCounts).length === 0 ? (
          <p className="text-gray-400 text-center py-6">هنوز برچسبی ثبت نشده</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.tagCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([tag, count]) => (
                <div
                  key={tag}
                  className="bg-white border-2 border-sky-100 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm"
                >
                  <span className="font-medium">{tag}</span>
                  <span className="bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
