"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import {
  Moon,
  Sun,
  Download,
  Upload,
  Palette,
  Database,
  Image as ImageIcon,
  Clock,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const GRADIENTS = [
  { id: "default", name: "پیش‌فرض", value: "linear-gradient(135deg, #fef9f3 0%, #e8f4f8 50%, #fff5f7 100%)" },
  { id: "sky", name: "آسمانی", value: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)" },
  { id: "mint", name: "نعنایی", value: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)" },
  { id: "lavender", name: "اسطوخودوس", value: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)" },
  { id: "peach", name: "هلویی", value: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)" },
  { id: "rose", name: "رز", value: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)" },
];

const SCHEDULE_OPTIONS = [
  { value: "off", label: "خاموش" },
  { value: "daily", label: "هر روز" },
  { value: "weekly", label: "هر هفته" },
  { value: "monthly", label: "هر ماه" },
];

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [bgType, setBgType] = useState<"gradient" | "image">("gradient");
  const [bgId, setBgId] = useState("default");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [schedule, setSchedule] = useState("off");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedType = localStorage.getItem("hossein-bg-type") || "gradient";
    const savedId = localStorage.getItem("hossein-bg") || "default";
    const savedImage = localStorage.getItem("hossein-bg-image");
    const savedSchedule = localStorage.getItem("hossein-backup-schedule") || "off";

    setBgType(savedType as "gradient" | "image");
    setBgId(savedId);
    setSchedule(savedSchedule);

    if (savedType === "image" && savedImage) {
      setBgImage(savedImage);
      applyBackground("image", savedImage);
    } else {
      applyBackground("gradient", savedId);
    }
    checkScheduledBackup(savedSchedule);
  }, []);

  const applyBackground = (type: "gradient" | "image", value: string) => {
    if (type === "image") {
      document.body.style.background = `url(${value}) center/cover no-repeat fixed`;
    } else {
      const selected = GRADIENTS.find((b) => b.id === value) || GRADIENTS[0];
      document.body.style.background = selected.value;
      document.body.style.backgroundImage = "";
    }
  };

  const selectGradient = (id: string) => {
    setBgType("gradient");
    setBgId(id);
    setBgImage(null);
    localStorage.setItem("hossein-bg-type", "gradient");
    localStorage.setItem("hossein-bg", id);
    localStorage.removeItem("hossein-bg-image");
    applyBackground("gradient", id);
    toast.success("پس‌زمینه تغییر کرد");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("حجم عکس نباید بیشتر از ۴ مگابایت باشد");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setBgType("image");
      setBgImage(base64);
      localStorage.setItem("hossein-bg-type", "image");
      localStorage.setItem("hossein-bg-image", base64);
      applyBackground("image", base64);
      toast.success("عکس پس‌زمینه تنظیم شد 🎨");
    };
    reader.readAsDataURL(file);
  };

  const clearBackgroundImage = () => {
    setBgType("gradient");
    setBgImage(null);
    localStorage.setItem("hossein-bg-type", "gradient");
    localStorage.removeItem("hossein-bg-image");
    applyBackground("gradient", bgId || "default");
    toast.success("عکس پس‌زمینه حذف شد");
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const res = await fetch("/api/books");
      const books = await res.json();
      if (!Array.isArray(books)) throw new Error("داده نامعتبر");
      const payload = { version: 1, exportedAt: new Date().toISOString(), count: books.length, books };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hossein-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      localStorage.setItem("hossein-last-backup", new Date().toISOString());
      toast.success("پشتیبان‌گیری با موفقیت انجام شد! 🎉");
    } catch {
      toast.error("خطا در پشتیبان‌گیری");
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("با بازیابی، کتاب‌های فعلی ممکن است تکراری شوند. ادامه می‌دهی؟")) {
      e.target.value = "";
      return;
    }
    setRestoring(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const books = Array.isArray(data) ? data : data.books;
      if (!Array.isArray(books) || books.length === 0) throw new Error("فایل پشتیبان معتبر نیست");
      let success = 0;
      let failed = 0;
      for (const book of books) {
        try {
          const res = await fetch("/api/books", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: book.title,
              author: book.author || null,
              borrowedAt: book.borrowedAt,
              returnedAt: book.returnedAt || null,
              notes: book.notes || null,
              isRead: book.isRead ?? false,
              rating: book.rating || null,
              tags: book.tags || [],
              images: (book.images || []).map((img: any) => ({
                url: typeof img === "string" ? img : img.url,
                publicId: img.publicId || "",
              })),
            }),
          });
          if (res.ok) success++;
          else failed++;
        } catch {
          failed++;
        }
      }
      toast.success(`بازیابی انجام شد: ${success} موفق${failed > 0 ? `، ${failed} ناموفق` : ""}`);
      if (success > 0) setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      toast.error(err.message || "خطا در بازیابی");
    } finally {
      setRestoring(false);
      e.target.value = "";
    }
  };

  const handleScheduleChange = (value: string) => {
    setSchedule(value);
    localStorage.setItem("hossein-backup-schedule", value);
    if (value !== "off") {
      localStorage.setItem("hossein-last-backup", new Date().toISOString());
      toast.success(`یادآوری پشتیبان‌گیری: ${SCHEDULE_OPTIONS.find((o) => o.value === value)?.label}`);
    } else {
      toast.success("یادآوری خاموش شد");
    }
  };

  const checkScheduledBackup = (currentSchedule: string) => {
    if (currentSchedule === "off") return;
    const last = localStorage.getItem("hossein-last-backup");
    if (!last) return;
    const diffDays = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
    let shouldRemind = false;
    if (currentSchedule === "daily" && diffDays >= 1) shouldRemind = true;
    if (currentSchedule === "weekly" && diffDays >= 7) shouldRemind = true;
    if (currentSchedule === "monthly" && diffDays >= 30) shouldRemind = true;
    if (shouldRemind) {
      setTimeout(() => {
        toast(
          (t) => (
            <div className="flex flex-col gap-2">
              <span>وقت پشتیبان‌گیری رسیده! 📦</span>
              <button className="btn-primary text-sm py-1.5" onClick={() => { toast.dismiss(t.id); handleBackup(); }}>
                الان پشتیبان بگیر
              </button>
            </div>
          ),
          { duration: 12000 }
        );
      }, 2000);
    }
  };

  if (!mounted) {
    return <div className="text-center py-20"><div className="text-4xl animate-bounce">⚙️</div></div>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-10">
      <h1 className="text-2xl font-extrabold">⚙️ تنظیمات</h1>

      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-lg"><Sun size={20} /> حالت نمایش</h2>
        <div className="flex gap-3">
          <button onClick={() => setTheme("light")} className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${resolvedTheme === "light" ? "bg-sky-500 text-white shadow-md" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"}`}>
            <Sun size={18} /> روشن
          </button>
          <button onClick={() => setTheme("dark")} className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${resolvedTheme === "dark" ? "bg-sky-500 text-white shadow-md" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"}`}>
            <Moon size={18} /> تاریک
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">تم فعلی: {resolvedTheme === "dark" ? "تاریک" : "روشن"}</p>
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-lg"><Palette size={20} /> پس‌زمینه رنگی</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GRADIENTS.map((b) => (
            <button key={b.id} onClick={() => selectGradient(b.id)} className={`h-20 rounded-2xl border-4 transition relative overflow-hidden ${bgType === "gradient" && bgId === b.id ? "border-sky-500 scale-105 shadow-lg" : "border-transparent hover:scale-105"}`} style={{ background: b.value }}>
              <span className="absolute bottom-0 inset-x-0 text-xs font-bold text-center bg-black/40 text-white py-1">{b.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-lg"><ImageIcon size={20} /> عکس پس‌زمینه</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">یک عکس دلخواه آپلود کن تا به عنوان پس‌زمینه سایت استفاده شود.</p>
        {bgImage && bgType === "image" ? (
          <div className="relative h-40 rounded-2xl overflow-hidden border-4 border-sky-500">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgImage})` }} />
            <button onClick={clearBackgroundImage} className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-xl shadow"><Trash2 size={16} /></button>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()} className="w-full h-32 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-slate-800 flex flex-col items-center justify-center gap-2 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-slate-700 transition">
            <ImageIcon size={28} />
            <span className="font-medium">انتخاب عکس پس‌زمینه</span>
            <span className="text-xs opacity-70">حداکثر ۴ مگابایت</span>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {bgType !== "image" && (
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Upload size={18} /> آپلود عکس جدید
          </button>
        )}
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-lg"><Database size={20} /> پشتیبان‌گیری و بازیابی</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">از تمام کتاب‌ها فایل پشتیبان بگیر یا از فایل قبلی بازیابی کن.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={handleBackup} disabled={backingUp} className="btn-primary flex items-center justify-center gap-2">
            <Download size={18} /> {backingUp ? "در حال آماده‌سازی..." : "دانلود پشتیبان"}
          </button>
          <button onClick={() => restoreInputRef.current?.click()} disabled={restoring} className="btn-secondary flex items-center justify-center gap-2">
            <Upload size={18} /> {restoring ? "در حال بازیابی..." : "بازیابی از فایل"}
          </button>
        </div>
        <input ref={restoreInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleRestore} />
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-lg"><Clock size={20} /> پشتیبان‌گیری زمان‌بندی‌شده</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">یادآوری خودکار برای گرفتن پشتیبان در بازه‌های زمانی مشخص.</p>
        <div className="grid grid-cols-2 gap-2">
          {SCHEDULE_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => handleScheduleChange(opt.value)} className={`py-3 rounded-2xl font-bold transition ${schedule === opt.value ? "bg-emerald-500 text-white shadow-md" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300"}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {schedule !== "off" && <p className="text-xs text-emerald-600 dark:text-emerald-400">✅ یادآوری فعال است. وقتی موعد برسد پیام نمایش داده می‌شود.</p>}
      </section>
    </div>
  );
}
