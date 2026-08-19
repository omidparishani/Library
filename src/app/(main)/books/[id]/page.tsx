"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import { formatPersianDate, TAGS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ArrowRight, Trash2, BookOpen, BookX, Pencil } from "lucide-react";
import toast from "react-hot-toast";

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/books/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setBook(data);
      })
      .catch(() => toast.error("کتاب پیدا نشد"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleRead = async () => {
    const res = await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: !book.isRead }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBook(updated);
      toast.success(updated.isRead ? "آفرین! کتاب خونده شد 🎉" : "وضعیت به نخوانده تغییر کرد");
    }
  };

  const updateRating = async (rating: number) => {
    const res = await fetch(`/api/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBook(updated);
      toast.success("امتیاز ذخیره شد ⭐");
    }
  };

  const handleDelete = async () => {
    if (!confirm("مطمئنی می‌خوای این کتاب رو پاک کنی؟")) return;
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("کتاب حذف شد");
      router.push("/books");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl animate-bounce">📚</div>
        <p className="mt-3 text-gray-400">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="card text-center py-16">
        <p className="text-gray-500">کتاب پیدا نشد 😢</p>
        <Link href="/books" className="btn-primary mt-4 inline-block">
          برگشت به لیست
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/books" className="flex items-center gap-2 text-sky-600 dark:text-sky-400 hover:underline">
          <ArrowRight size={20} />
          برگشت
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/books/${id}/edit`}
            className="p-2 text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <Pencil size={20} />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Cover */}
      <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-sky-100 to-pink-100 shadow-xl">
        {book.images?.[0] ? (
          <Image
            src={book.images[0].url}
            alt={book.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-30">
            📖
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">{book.title}</h1>
        {book.author && <p className="text-lg text-gray-500">✍️ {book.author}</p>}

        <div className="flex flex-wrap gap-3 text-sm">
          <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full">
            📅 امانت: {formatPersianDate(book.borrowedAt)}
          </span>
          {book.dueDate && (
            <span className={`px-3 py-1 rounded-full ${
              !book.returnedAt && new Date(book.dueDate) <= new Date()
                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
            }`}>
              ⏰ موعد پس‌دادن: {formatPersianDate(book.dueDate)}
            </span>
          )}
          {book.returnedAt && (
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
              🔙 برگشت: {formatPersianDate(book.returnedAt)}
            </span>
          )}
        </div>

        {/* Status toggle */}
        <button
          onClick={toggleRead}
          className={cn(
            "w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition",
            book.isRead
              ? "bg-emerald-400 text-white"
              : "bg-amber-200 text-amber-900"
          )}
        >
          {book.isRead ? <BookOpen size={20} /> : <BookX size={20} />}
          {book.isRead ? "خوانده شد ✅" : "هنوز نخوانده 📖"}
        </button>

        {/* Rating */}
        <div>
          <p className="text-sm font-bold text-gray-600 mb-2">امتیاز حسین:</p>
          <StarRating value={book.rating || 0} onChange={updateRating} />
        </div>

        {/* Tags */}
        {book.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {book.tags.map((tag: string) => {
              const info = TAGS.find((t) => t.value === tag);
              return (
                <span
                  key={tag}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    info?.color || "bg-gray-100"
                  )}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Notes */}
        {book.notes && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
            <p className="text-sm font-bold text-yellow-800 mb-1">📝 یادداشت:</p>
            <p className="text-gray-700">{book.notes}</p>
          </div>
        )}

        {/* Gallery */}
        {book.images?.length > 1 && (
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2">گالری عکس‌ها:</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {book.images.map((img: any) => (
                <div key={img.id} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                  <Image src={img.url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
