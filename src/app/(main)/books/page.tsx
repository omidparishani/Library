"use client";

import { useEffect, useState } from "react";
import BookCard from "@/components/BookCard";
import Link from "next/link";
import { PlusCircle, Search, Filter } from "lucide-react";
import { TAGS } from "@/lib/utils";

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRead, setFilterRead] = useState<string>("");
  const [filterTag, setFilterTag] = useState("");

  const fetchBooks = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterRead) params.set("isRead", filterRead);
    if (filterTag) params.set("tag", filterTag);

    try {
      const res = await fetch(`/api/books?${params}`);
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [filterRead, filterTag]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-gray-800">📚 همه کتاب‌ها</h1>
        <Link href="/books/new" className="btn-primary flex items-center gap-2 self-start">
          <PlusCircle size={18} />
          کتاب جدید
        </Link>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو بر اساس عنوان یا نویسنده..."
              className="w-full pr-10 pl-4 py-3 rounded-2xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition"
            />
          </div>
          <button type="submit" className="btn-primary px-5">
            بگرد
          </button>
        </form>

        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={16} className="text-gray-400" />
          <button
            onClick={() => setFilterRead("")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filterRead === "" ? "bg-sky-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            همه
          </button>
          <button
            onClick={() => setFilterRead("true")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filterRead === "true" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            خوانده‌شده
          </button>
          <button
            onClick={() => setFilterRead("false")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filterRead === "false" ? "bg-amber-400 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            نخوانده
          </button>

          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-1.5 rounded-full text-sm border border-gray-200 bg-white outline-none"
          >
            <option value="">همه برچسب‌ها</option>
            {TAGS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2 animate-bounce">📚</div>
          در حال بارگذاری...
        </div>
      ) : books.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-gray-500">کتابی پیدا نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
