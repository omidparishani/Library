"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, BarChart3, Image as ImageIcon, PlusCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/books", label: "کتاب‌ها", icon: BookOpen },
  { href: "/stats", label: "آمار", icon: BarChart3 },
  { href: "/gallery", label: "گالری", icon: ImageIcon },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sky-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white text-xl shadow-md group-hover:scale-110 transition-transform">
              📚
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-sky-700 leading-tight">کتابخانه حسین</h1>
              <p className="text-xs text-sky-500 hidden sm:block">ماجراجویی‌های کتابخوانی</p>
            </div>
          </Link>

          <Link
            href="/books/new"
            className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4"
          >
            <PlusCircle size={18} />
            <span className="hidden sm:inline">کتاب جدید</span>
          </Link>
        </div>

        {/* Bottom Nav for mobile + desktop */}
        <nav className="flex items-center justify-around mt-3 pt-2 border-t border-sky-50 gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all text-xs font-medium",
                  active
                    ? "bg-sky-100 text-sky-700 scale-105"
                    : "text-gray-500 hover:bg-sky-50 hover:text-sky-600"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
