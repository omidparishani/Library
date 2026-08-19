"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";
import TagSelector from "@/components/TagSelector";
import ImageUpload from "@/components/ImageUpload";
import PersianDatePicker from "@/components/PersianDatePicker";
import toast from "react-hot-toast";
import { ArrowRight, Save } from "lucide-react";
import Link from "next/link";

export default function EditBookPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    borrowedAt: "",
    returnedAt: "",
    dueDate: "",
    notes: "",
    isRead: false,
    rating: 0,
    tags: [] as string[],
    images: [] as string[],
  });

  useEffect(() => {
    fetch(`/api/books/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setForm({
          title: data.title || "",
          author: data.author || "",
          borrowedAt: data.borrowedAt ? data.borrowedAt.slice(0, 10) : "",
          returnedAt: data.returnedAt ? data.returnedAt.slice(0, 10) : "",
          dueDate: data.dueDate ? data.dueDate.slice(0, 10) : "",
          notes: data.notes || "",
          isRead: data.isRead || false,
          rating: data.rating || 0,
          tags: data.tags || [],
          images: (data.images || []).map((img: any) => img.url),
        });
      })
      .catch(() => toast.error("کتاب پیدا نشد"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("عنوان کتاب الزامی است");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rating: form.rating || null,
          dueDate: form.dueDate || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "خطا در ذخیره");
      }
      toast.success("کتاب ویرایش شد! 🎉");
      router.push(`/books/${id}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "مشکلی پیش اومد");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl animate-bounce">📚</div>
        <p className="mt-3 text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/books/${id}`} className="p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 text-sky-600">
          <ArrowRight size={22} />
        </Link>
        <h1 className="text-2xl font-extrabold text-foreground">ویرایش کتاب ✏️</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="block text-sm font-bold mb-1.5 text-foreground">عنوان کتاب *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-foreground outline-none text-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1.5 text-foreground">نویسنده</label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-foreground outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1.5 text-foreground">تاریخ امانت</label>
            <PersianDatePicker value={form.borrowedAt} onChange={(v) => setForm({ ...form, borrowedAt: v })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-foreground">موعد پس‌دادن</label>
            <PersianDatePicker value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1.5 text-foreground">تاریخ برگشت واقعی</label>
            <PersianDatePicker value={form.returnedAt} onChange={(v) => setForm({ ...form, returnedAt: v })} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setForm({ ...form, isRead: !form.isRead })}
          className={`w-full py-3 rounded-2xl font-bold transition ${
            form.isRead ? "bg-emerald-400 text-white shadow-md" : "bg-muted text-muted-foreground"
          }`}
        >
          {form.isRead ? "✅ خوانده شد" : "📖 هنوز نخونده"}
        </button>

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
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-foreground outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-foreground">عکس‌ها</label>
          <ImageUpload images={form.images} onChange={(images) => setForm({ ...form, images })} />
        </div>

        <button type="submit" disabled={saving} className="btn-success w-full flex items-center justify-center gap-2 text-lg py-4">
          <Save size={20} />
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات 🎉"}
        </button>
      </form>
    </div>
  );
}
