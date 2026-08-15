"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";
import TagSelector from "@/components/TagSelector";
import ImageUpload from "@/components/ImageUpload";
import toast from "react-hot-toast";
import { ArrowRight, Save } from "lucide-react";
import Link from "next/link";

export default function NewBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    borrowedAt: new Date().toISOString().slice(0, 10),
    returnedAt: "",
    notes: "",
    isRead: false,
    rating: 0,
    tags: [] as string[],
    images: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("عنوان کتاب رو بنویس لطفاً 😊");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rating: form.rating || null,
          images: form.images.map((url) => ({ url, publicId: "" })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "خطا در ثبت");
      }

      toast.success("کتاب با موفقیت ثبت شد! 🎉");
      router.push("/books");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "مشکلی پیش اومد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/books" className="p-2 rounded-xl hover:bg-sky-50 text-sky-600">
          <ArrowRight size={22} />
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-800">ثبت کتاب جدید 📖</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            عنوان کتاب *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="مثلاً: شازده کوچولو"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition text-lg"
            required
          />
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            نویسنده (اختیاری)
          </label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            placeholder="مثلاً: آنتوان دو سنت‌اگزوپری"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              تاریخ امانت
            </label>
            <input
              type="date"
              value={form.borrowedAt}
              onChange={(e) => setForm({ ...form, borrowedAt: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-sky-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              تاریخ برگشت
            </label>
            <input
              type="date"
              value={form.returnedAt}
              onChange={(e) => setForm({ ...form, returnedAt: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-sky-400 outline-none"
            />
          </div>
        </div>

        {/* Is Read */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, isRead: !form.isRead })}
            className={`flex-1 py-3 rounded-2xl font-bold transition ${
              form.isRead
                ? "bg-emerald-400 text-white shadow-md"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {form.isRead ? "✅ خوانده شد" : "📖 هنوز نخونده"}
          </button>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            امتیاز (چقدر دوست داشت؟)
          </label>
          <StarRating
            value={form.rating}
            onChange={(v) => setForm({ ...form, rating: v })}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            برچسب‌ها
          </label>
          <TagSelector
            value={form.tags}
            onChange={(tags) => setForm({ ...form, tags })}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            یادداشت کوتاه
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="مثلاً: خیلی دوست داشت / نیمه‌کاره موند / خنده‌دار بود..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition resize-none"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            عکس جلد یا عکس حسین در حال خواندن
          </label>
          <ImageUpload
            images={form.images}
            onChange={(images) => setForm({ ...form, images })}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-success w-full flex items-center justify-center gap-2 text-lg py-4"
        >
          <Save size={20} />
          {loading ? "در حال ذخیره..." : "ذخیره کتاب 🎉"}
        </button>
      </form>
    </div>
  );
}
