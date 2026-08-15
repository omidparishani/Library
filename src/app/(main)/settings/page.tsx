"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Download, Palette, Database } from "lucide-react";
import toast from "react-hot-toast";

const BACKGROUNDS = [
  { id: "default", name: "پیش‌فرض", value: "linear-gradient(135deg, #fef9f3 0%, #e8f4f8 50%, #fff5f7 100%)" },
  { id: "sky", name: "آسمانی", value: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)" },
  { id: "mint", name: "نعنایی", value: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)" },
  { id: "lavender", name: "اسطوخودوس", value: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)" },
  { id: "peach", name: "هلویی", value: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)" },
  { id: "rose", name: "رز", value: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [bg, setBg] = useState("default");
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("hossein-bg") || "default";
    setBg(saved);
    applyBackground(saved);
  }, []);

  const applyBackground = (id: string) => {
    const selected = BACKGROUNDS.find((b) => b.id === id) || BACKGROUNDS[0];
    document.body.style.background = selected.value;
    localStorage.setItem("hossein-bg", id);
    setBg(id);
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const res = await fetch("/api/books");
      const books = await res.json();
      const dataStr = JSON.stringify(books, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hossein-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("پشتیبان‌گیری با موفقیت انجام شد! 🎉");
    } catch {
      toast.error("خطا در پشتیبان‌گیری");
    } finally {
      setBackingUp(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h1 className="text-2xl font-extrabold">⚙️ تنظیمات</h1>

      {/* Theme */}
      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2">
          <Sun size={20} /> حالت نمایش
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${
              theme === "light" ? "bg-sky-500 text-white" : "bg-gray-100 dark:bg-slate-700"
            }`}
          >
            <Sun size={18} /> روشن
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition ${
              theme === "dark" ? "bg-sky-500 text-white" : "bg-gray-100 dark:bg-slate-700"
            }`}
          >
            <Moon size={18} /> تاریک
          </button>
        </div>
      </section>

      {/* Background */}
      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2">
          <Palette size={20} /> پس‌زمینه سایت
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BACKGROUNDS.map((b) => (
            <button
              key={b.id}
              onClick={() => applyBackground(b.id)}
              className={`h-20 rounded-2xl border-4 transition relative overflow-hidden ${
                bg === b.id ? "border-sky-500 scale-105" : "border-transparent"
              }`}
              style={{ background: b.value }}
            >
              <span className="absolute bottom-1 inset-x-0 text-xs font-bold text-center bg-black/30 text-white py-0.5">
                {b.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Backup */}
      <section className="card space-y-4">
        <h2 className="font-bold flex items-center gap-2">
          <Database size={20} /> پشتیبان‌گیری
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          تمام کتاب‌ها و اطلاعات را به صورت فایل JSON دانلود کن تا گم نشه.
        </p>
        <button
          onClick={handleBackup}
          disabled={backingUp}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Download size={18} />
          {backingUp ? "در حال آماده‌سازی..." : "دانلود پشتیبان دستی"}
        </button>
      </section>
    </div>
  );
}
