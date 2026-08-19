"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";
import TagSelector from "@/components/TagSelector";
import ImageUpload from "@/components/ImageUpload";
import PersianDatePicker from "@/components/PersianDatePicker";
import toast from "react-hot-toast";
import { ArrowRight, Save } from "lucide-react";
import Link from "next/link";
import { defaultDueDate } from "@/lib/utils";

export default function NewBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    title: "",
    author: "",
    borrowedAt: today,
    returnedAt: "",
    dueDate: defaultDueDate(),
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
          dueDate: form.dueDate || null,
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
        <Link href="/books" className="p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 text-sky-600">
          <ArrowRight size={22} />
        </Link>
        <h1 className="text-2xl font-extrabold text-foreground">ثبت کتاب جدید 📖</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-bold mb-1.5 text-foreground">عنوان کتاب *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="مثلاً: شازده کوچولو"
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-foreground focus:border-sky-400 outline-none transition text-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1.5 text-foreground">نویسنده (اختیاری)</label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            placeholder="مثلاً: آنتوان دو سنت‌اگزوپری"
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-foreground focus:border-sky-400 outline-none transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1.5 text-foreground">تاریخ امانت</label>
            <PersianDatePicker
              value={form.borrowedAt}
              onChange={(v) =>
                setForm({
                  ...form,
                  borrowedAt: v,
                  dueDate: v ? defaultDueDate(new Date(v)) : form.dueDate,
                })
              }
              placeholder="تاریخ امانت"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-foreground">موعد پس‌دادن</label>
            <PersianDatePicker
              value={form.dueDate}
              onChange={(v) => setForm({ ...form, dueDate: v })}
              placeholder="موعد پس‌دادن"
            />
            <p className="text-[10px] text-muted-foreground mt-1">پیش‌فرض: ۷ روز بعد</p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-foreground">تاریخ برگشت واقعی</label>
            <PersianDatePicker
              value={form.returnedAt}
              onChange={(v) => setForm({ ...form, returnedAt: v })}
              placeholder="اختیاری"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, isRead: !form.isRead })}
            className={`flex-1 py-3 rounded-2xl font-bold transition ${
              form.isRead ? "bg-emerald-400 text-white shadow-md" : "bg-muted text-muted-foreground"
            }`}
          >
            {form.isRead ? "✅ خوانده شد" : "📖 هنوز نخونده"}
          </button>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-foreground">امتیاز</label>
          <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-foreground">برچسب‌ها</label>
          <TagSelector value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1.5 text-foreground">یادداشت</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="مثلاً: خیلی دوست داشت..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-foreground outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-foreground">عکس</label>
          <ImageUpload images={form.images} onChange={(images) => setForm({ ...form, images })} />
        </div>

        <button type="submit" disabled={loading} className="btn-success w-full flex items-center justify-center gap-2 text-lg py-4">
          <Save size={20} />
          {loading ? "در حال ذخیره..." : "ذخیره کتاب 🎉"}
        </button>
      </form>
    </div>
  );
}
