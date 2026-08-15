import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getWeek, getYear, startOfWeek } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekInfo(date: Date = new Date()) {
  const weekNumber = getWeek(date, { weekStartsOn: 6 }); // Saturday start for Iranian week feel
  const year = getYear(date);
  return { weekNumber, year };
}

export function formatPersianDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export const TAGS = [
  { value: "داستان", color: "bg-pink-200 text-pink-800" },
  { value: "علمی", color: "bg-blue-200 text-blue-800" },
  { value: "شعر", color: "bg-purple-200 text-purple-800" },
  { value: "تصویری", color: "bg-yellow-200 text-yellow-800" },
  { value: "ماجراجویی", color: "bg-green-200 text-green-800" },
  { value: "آموزشی", color: "bg-orange-200 text-orange-800" },
  { value: "فانتزی", color: "bg-indigo-200 text-indigo-800" },
  { value: "حیوانات", color: "bg-teal-200 text-teal-800" },
] as const;
