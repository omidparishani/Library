"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, BookOpen, BookX } from "lucide-react";
import { motion } from "framer-motion";
import { formatPersianDate, TAGS } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author?: string | null;
    borrowedAt: string | Date;
    isRead: boolean;
    rating?: number | null;
    tags: string[];
    notes?: string | null;
    images?: { url: string }[];
  };
  index?: number;
}

export default function BookCard({ book, index = 0 }: BookCardProps) {
  const cover = book.images?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/books/${book.id}`}>
        <article className="card group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col">
          {/* Cover */}
          <div className="relative h-44 bg-gradient-to-br from-sky-100 to-pink-100 rounded-2xl overflow-hidden mb-3">
            {cover ? (
              <Image
                src={cover}
                alt={book.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, 300px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-40">
                📖
              </div>
            )}
            {/* Status badge */}
            <div
              className={cn(
                "absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow",
                book.isRead
                  ? "bg-emerald-400 text-white"
                  : "bg-amber-300 text-amber-900"
              )}
            >
              {book.isRead ? <BookOpen size={12} /> : <BookX size={12} />}
              {book.isRead ? "خوانده شد" : "نخوانده"}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <h3 className="font-bold text-base leading-snug text-gray-800 line-clamp-2 mb-1 group-hover:text-sky-700 transition-colors">
              {book.title}
            </h3>
            {book.author && (
              <p className="text-sm text-gray-500 mb-2">✍️ {book.author}</p>
            )}

            {/* Rating */}
            {book.rating && book.rating > 0 && (
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < book.rating! ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                  />
                ))}
              </div>
            )}

            {/* Tags */}
            {book.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {book.tags.slice(0, 3).map((tag) => {
                  const tagInfo = TAGS.find((t) => t.value === tag);
                  return (
                    <span
                      key={tag}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        tagInfo?.color || "bg-gray-100 text-gray-600"
                      )}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>{formatPersianDate(book.borrowedAt)}</span>
              {book.notes && <span className="truncate max-w-[100px]">📝 {book.notes}</span>}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
