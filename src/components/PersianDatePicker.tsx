"use client";

import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { cn } from "@/lib/utils";

interface Props {
  value?: string; // ISO yyyy-mm-dd (Gregorian)
  onChange: (isoDate: string) => void;
  placeholder?: string;
  className?: string;
}

/** Convert ISO (Gregorian) string to DateObject in Persian calendar */
function isoToPersian(iso?: string): DateObject | undefined {
  if (!iso) return undefined;
  const d = new Date(iso + "T12:00:00");
  if (isNaN(d.getTime())) return undefined;
  return new DateObject({ date: d, calendar: persian, locale: persian_fa });
}

/** Convert Persian DateObject back to ISO yyyy-mm-dd (Gregorian) */
function persianToIso(obj: DateObject | null): string {
  if (!obj) return "";
  const g = obj.convert(undefined as any, undefined as any); // to gregorian via js Date
  const js = obj.toDate();
  const y = js.getFullYear();
  const m = String(js.getMonth() + 1).padStart(2, "0");
  const day = String(js.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PersianDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className,
}: Props) {
  return (
    <DatePicker
      value={isoToPersian(value)}
      onChange={(date: DateObject | null) => {
        onChange(persianToIso(date));
      }}
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      format="YYYY/MM/DD"
      inputClass={cn(
        "w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-foreground outline-none focus:border-sky-400 transition",
        className
      )}
      containerClassName="w-full"
      placeholder={placeholder}
    />
  );
}
