"use client";

import { useEffect, useState, useRef } from "react";
import {
  Moon, Sun, Download, Upload, Palette, Database, Image as ImageIcon, Clock, Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppSettings, GRADIENTS } from "@/components/AppSettingsProvider";

const GRADIENT_LIST = [
  { id: "default", name: "پیش‌فرض" },
  { id: "sky", name: "آسمانی" },
  { id: "mint", name: "نعنایی" },
  { id: "lavender", name: "اسطوخودوس" },
  { id: "peach", name: "هلویی" },
  { id: "rose", name: "رز" },
];

const SCHEDULE_OPTIONS = [
  { value: "off", label: "خاموش" },
  { value: "daily", label: "هر روز" },
  { value: "weekly", label: "هر هفته" },
  { value: "monthly", label: "هر ماه" },
];

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useAppSettings();
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [schedule, setSchedule] = useState("off");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSchedule(localStorage.getItem("hossein-backup-schedule") || "off");
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifEnabled(Notification.permission === "granted");
    }
  }, []);

  const selectGradient = async (id: string) => {
    await updateSettings({ bgType: "gradient", bgId: id, bgImage: null });
    toast.success("پس‌زمینه ذخیره شد (برای همه دستگاه‌ها)");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم عکس حداکثر ۲ مگابایت (برای ذخیره در سرور)");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await updateSettings({ bgType: "image", bgImage: base64 });
      toast.success("عکس پس‌زمینه ذخیره شد 🎨");
    };
    reader.readAsDataURL(file);
  };

  const clearBackgroundImage = async () => {
    await updateSettings({ bgType: "gradient", bgId: settings.bgId || "default", bgImage: null });
    toast.success("عکس پس‌زمینه حذف شد");
  };

  const setThemeMode = async (mode: "light" | "dark") => {
    await updateSettings({ theme: mode });
    toast.success(mode === "dark" ? "تم تاریک فعال شد" : "تم روشن فعال شد");
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("مرورگر شما از اعلان پشتیبانی نمی‌کند");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
    if (perm === "granted") {
      toast.success("اعلان‌ها فعال شد ✅");
      new Notification("کتابخانه حسین", {
        body: "اعلان‌های موعد تحویل کتاب فعال شد",
        icon: "/icon.svg",
      });
    } else {
      toast.error("اجازه اعلان داده نشد");
    }
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
      toast.success("پشتیبان‌گیری انجام شد! 🎉");
    } catch {
      toast.error("خطا در پشتیبان‌گیری");
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("با بازیابی، کتاب‌ها ممکن است تکراری شوند. ادامه؟")) {
      e.target.value = "";
      return;
    }
    setRestoring(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const books = Array.isArray(data) ? data : data.books;
      if (!Array.isArray(books) || books.length === 0) throw new Error("فایل نامعتبر");
      let success = 0;
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
              dueDate: book.dueDate || null,
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
        } catch { /* skip */ }
      }
      toast.success(`بازیابی: ${success} کتاب`);
      if (success > 0) setTimeout(() => window.location.reload(), 1200);
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
    toast.success(value === "off" ? "یادآوری خاموش شد" : `یادآوری: ${SCHEDULE_OPTIONS.find((o) => o.value === value)?.label}`);
  };

  if (loading) {
    return <div className="text-center py-20"><div className="text-4xl animate-bounce">⚙️</div></div>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-10">
      <h1 className="text-2xl font-extrabold text-foreground">⚙️ تنظیمات</h1>
      <p className="text-sm text-muted-foreground -mt-6">تنظیمات تم و پس‌زمینه برای همه دستگاه‌ها ذخیره می‌شود.</p>

      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-lg"><Sun size={20} /> حالت نمایش</h2>
        <div className="flex gap-3">
          <button onClick={() => setThemeMode("light")} className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${settings.theme === "light" ? "bg-sky-500 text-white shadow-md" : "bg-muted text-foreground"}`}>
            <Sun size={18} /> روشن
          </button>
          <button onClick={() => setThemeMode("dark")} className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${settings.theme === "dark" ? "bg-sky-500 text-white shadow-md" : "bg-muted text-foreground"}`}>
            <Moon size={18} /> تاریک
          </button>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-lg"><Palette size={20} /> پس‌زمینه رنگی</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GRADIENT_LIST.map((b) => (
            <button key={b.id} onClick={() => selectGradient(b.id)} className={`h-20 rounded-2xl border-4 transition relative overflow-hidden ${settings.bgType === "gradient" && settings.bgId === b.id ? "border-sky-500 scale-105 shadow-lg" : "border-transparent hover:scale-105"}`} style={{ background: GRADIENTS[b.id] }}>
              <span className="absolute bottom-0 inset-x-0 text-xs font-bold text-center bg-black/40 text-white py-1">{b.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-lg"><ImageIcon size={20} /> عکس پس‌زمینه</h2>
        {settings.bgImage && settings.bgType === "image" ? (
          <div className="relative h-40 rounded-2xl overflow-hidden border-4 border-sky-500">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${settings.bgImage})` }} />
            <button onClick={clearBackgroundImage} className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-xl shadow"><Trash2 size={16} /></button>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()} className="w-full h-32 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-slate-800 flex flex-col items-center justify-center gap-2 text-sky-600 dark:text-sky-400">
            <ImageIcon size={28} />
            <span className="font-medium">انتخاب عکس پس‌زمینه</span>
            <span className="text-xs opacity-70">حداکثر ۲ مگابایت</span>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-lg">🔔 اعلان موعد تحویل کتاب</h2>
        <p className="text-sm text-muted-foreground">وقتی موعد پس دادن کتاب به کتابخانه برسد، روی این دستگاه اعلان می‌گیری.</p>
        <button onClick={enableNotifications} className={`w-full py-3 rounded-2xl font-bold ${notifEnabled ? "bg-emerald-500 text-white" : "btn-primary"}`}>
          {notifEnabled ? "✅ اعلان‌ها فعال است" : "فعال‌سازی اعلان مرورگر"}
        </button>
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-lg"><Database size={20} /> پشتیبان‌گیری و بازیابی</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={handleBackup} disabled={backingUp} className="btn-primary flex items-center justify-center gap-2">
            <Download size={18} /> {backingUp ? "..." : "دانلود پشتیبان"}
          </button>
          <button onClick={() => restoreInputRef.current?.click()} disabled={restoring} className="btn-secondary flex items-center justify-center gap-2">
            <Upload size={18} /> {restoring ? "..." : "بازیابی از فایل"}
          </button>
        </div>
        <input ref={restoreInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleRestore} />
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2 text-lg"><Clock size={20} /> یادآوری پشتیبان‌گیری</h2>
        <div className="grid grid-cols-2 gap-2">
          {SCHEDULE_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => handleScheduleChange(opt.value)} className={`py-3 rounded-2xl font-bold transition ${schedule === opt.value ? "bg-emerald-500 text-white shadow-md" : "bg-muted text-foreground"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
