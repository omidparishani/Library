"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { formatPersianDate } from "@/lib/utils";

export default function DueDateNotifier() {
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const run = async () => {
      try {
        // Request notification permission once
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "default") {
            await Notification.requestPermission();
          }
        }

        const res = await fetch("/api/books");
        const books = await res.json();
        if (!Array.isArray(books)) return;

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const dueTodayOrOverdue = books.filter((b: any) => {
          if (!b.dueDate || b.returnedAt) return false;
          const due = new Date(b.dueDate);
          due.setHours(0, 0, 0, 0);
          return due.getTime() <= now.getTime();
        });

        const dueSoon = books.filter((b: any) => {
          if (!b.dueDate || b.returnedAt) return false;
          const due = new Date(b.dueDate);
          due.setHours(0, 0, 0, 0);
          const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diff > 0 && diff <= 2;
        });

        if (dueTodayOrOverdue.length > 0) {
          const titles = dueTodayOrOverdue.map((b: any) => b.title).slice(0, 3).join("، ");
          const msg = `موعد تحویل ${dueTodayOrOverdue.length} کتاب رسیده: ${titles}`;
          toast.error(msg, { duration: 8000 });

          if (Notification.permission === "granted") {
            new Notification("کتابخانه حسین 📚", {
              body: msg,
              icon: "/icon.svg",
              tag: "due-books",
            });
          }
        } else if (dueSoon.length > 0) {
          const titles = dueSoon.map((b: any) => `${b.title} (${formatPersianDate(b.dueDate)})`).slice(0, 3).join("، ");
          const msg = `به‌زودی موعد تحویل: ${titles}`;
          toast(msg, { duration: 6000, icon: "⏰" });

          if (Notification.permission === "granted") {
            new Notification("کتابخانه حسین ⏰", {
              body: msg,
              icon: "/icon.svg",
              tag: "due-soon",
            });
          }
        }
      } catch {
        // silent
      }
    };

    // delay a bit after page load
    const t = setTimeout(run, 2500);
    return () => clearTimeout(t);
  }, []);

  return null;
}
