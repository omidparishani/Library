import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getWeek, getYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekInfo(date: Date = new Date()) {
  const weekNumber = getWeek(date, { weekStartsOn: 6 });
  const year = getYear(date);
  return { weekNumber, year };
}

/** نمایش تاریخ شمسی کامل مثل: ۱۲ فروردین ۱۴۰۳ */
export function formatPersianDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  }
}

/** نمایش کوتاه شمسی مثل: ۱۴۰۳/۰۱/۱۲ */
export function formatPersianDateShort(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  }
}

export function toInputDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** موعد پیش‌فرض = امانت + ۷ روز */
export function defaultDueDate(from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export const TAGS = [
  { value: "داستان", color: "bg-pink-200 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200" },
  { value: "علمی", color: "bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200" },
  { value: "شعر", color: "bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200" },
  { value: "تصویری", color: "bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200" },
  { value: "ماجراجویی", color: "bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200" },
  { value: "آموزشی", color: "bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200" },
  { value: "فانتزی", color: "bg-indigo-200 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200" },
  { value: "حیوانات", color: "bg-teal-200 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200" },
] as const;
